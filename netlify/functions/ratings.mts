// Recipe star ratings, stored in Netlify Blobs.
//
//   GET  /api/ratings            -> { "recipe-id": [count, sum], ... } for every rated recipe
//   GET  /api/ratings?id=x       -> { "x": [count, sum] }
//   POST /api/ratings {id, stars} -> { "x": [count, sum] }
//
// One vote per visitor per recipe: the vote is keyed by a one-way hash of the visitor's IP
// address and the recipe id, so voting again changes the earlier vote instead of adding one.
// The IP address itself is never stored.
import { getStore } from '@netlify/blobs';
import type { Config, Context } from '@netlify/functions';

type Agg = [count: number, sum: number];

const ID = /^[a-z0-9-]{1,100}$/;
const json = (data: unknown, status = 200, cache = 'no-store') =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': cache } });

async function hash(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

export default async (req: Request, context: Context) => {
  const store = getStore({ name: 'ratings', consistency: 'strong' });
  const url = new URL(req.url);

  if (req.method === 'GET') {
    const id = url.searchParams.get('id');
    if (id) {
      if (!ID.test(id)) return json({ error: 'bad id' }, 400);
      const agg = (await store.get(`agg/${id}`, { type: 'json' })) as Agg | null;
      return json(agg ? { [id]: agg } : {}, 200, 'public, max-age=30');
    }
    const { blobs } = await store.list({ prefix: 'agg/' });
    const entries = await Promise.all(
      blobs.map(async (b) => [b.key.slice(4), await store.get(b.key, { type: 'json' })] as const),
    );
    return json(Object.fromEntries(entries.filter(([, v]) => v)), 200, 'public, max-age=300');
  }

  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  let body: { id?: unknown; stars?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad json' }, 400);
  }
  const id = String(body.id ?? '');
  const stars = Number(body.stars);
  if (!ID.test(id) || !Number.isInteger(stars) || stars < 1 || stars > 5) return json({ error: 'bad input' }, 400);

  // Only recipes that exist on the site can be rated.
  const page = await fetch(new URL(`/recepte/${id}/`, url.origin), { method: 'HEAD' }).catch(() => null);
  if (!page?.ok) return json({ error: 'unknown recipe' }, 404);

  const salt = Netlify.env.get('RATING_SALT') ?? 'dzervene-ratings';
  const voteKey = `vote/${id}/${await hash(`${context.ip}|${id}|${salt}`)}`;
  const previous = Number(await store.get(voteKey)) || 0;

  // Update the running total with a compare-and-swap loop, so parallel votes are not lost.
  for (let attempt = 0; attempt < 6; attempt++) {
    const current = await store.getWithMetadata(`agg/${id}`, { type: 'json' });
    const [count, sum] = (current?.data as Agg | undefined) ?? [0, 0];
    const next: Agg = previous ? [count, sum - previous + stars] : [count + 1, sum + stars];
    const write = current
      ? await store.setJSON(`agg/${id}`, next, { onlyIfMatch: current.etag })
      : await store.setJSON(`agg/${id}`, next, { onlyIfNew: true });
    if (write.modified) {
      await store.set(voteKey, String(stars));
      return json({ [id]: next });
    }
    await new Promise((r) => setTimeout(r, 50 * (attempt + 1)));
  }
  return json({ error: 'busy, try again' }, 503);
};

export const config: Config = { path: '/api/ratings' };
