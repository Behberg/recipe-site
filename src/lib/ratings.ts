// Star ratings from visitors (netlify/functions/ratings.mts). Read once per build from the live
// site, so the structured data carries the ratings collected up to that deploy. The page also
// refreshes the numbers in the browser. If the site or function is not reachable (local builds,
// the very first deploy), recipes simply have no rating yet.

export interface Rating {
  count: number;
  value: number;
}

type Agg = [count: number, sum: number];
let all: Promise<Record<string, Agg>> | undefined;

function load(): Promise<Record<string, Agg>> {
  all ??= (async () => {
    const base = process.env.URL; // set by Netlify during builds
    if (!base) return {};
    try {
      const res = await fetch(new URL('/api/ratings', base), { signal: AbortSignal.timeout(15000) });
      return res.ok ? ((await res.json()) as Record<string, Agg>) : {};
    } catch {
      return {};
    }
  })();
  return all;
}

export async function ratingFor(id: string): Promise<Rating | null> {
  const agg = (await load())[id];
  if (!agg || agg[0] < 1) return null;
  return { count: agg[0], value: Math.round((agg[1] / agg[0]) * 10) / 10 };
}
