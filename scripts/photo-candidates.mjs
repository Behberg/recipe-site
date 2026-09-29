// Finds stock photo candidates for recipes that still have no photo and draws contact sheets
// so a person can pick the right one by eye. Nothing in the site changes here; see photo-apply.mjs.
//
//   node scripts/photo-candidates.mjs pexels|pixabay
//
// Needs PEXELS_API_KEY / PIXABAY_API_KEY in .env. Writes .photos/<source>/candidates.json and
// sheet-NN.jpg for the recipes searched in this run.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const source = process.argv[2];
const outDir = path.join(root, '.photos', source ?? '');
const recipesDir = path.join(root, 'src/content/recipes');
const PER_RECIPE = 6;
const ROWS_PER_SHEET = 6;

const env = Object.fromEntries(
  fs.readFileSync(path.join(root, '.env'), 'utf8')
    .split(/\r?\n/).filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const keyOf = (name) => process.env[name] ?? env[name] ?? (() => { throw new Error(`${name} missing from .env`); })();

// Each source returns up to PER_RECIPE photos in one shape, or null when its rate limit is reached.
const sources = {
  // About 200 searches an hour.
  async pexels(query) {
    const res = await fetch(`https://api.pexels.com/v1/search?${new URLSearchParams({ query, per_page: PER_RECIPE, orientation: 'landscape' })}`,
      { headers: { Authorization: keyOf('PEXELS_API_KEY') } });
    if (res.status === 429) return null;
    if (!res.ok) throw new Error(`Pexels ${res.status}`);
    return (await res.json()).photos.map((p) => ({
      id: p.id, url: p.url, photographer: p.photographer, alt: p.alt, thumb: p.src.medium,
      download: `${p.src.original}?auto=compress&cs=tinysrgb&w=1400`,
      license: 'Pexels License', licenseUrl: 'https://www.pexels.com/license/',
    }));
  },
  // About 100 searches a minute. Its image links expire after a day, so apply the picks soon after.
  async pixabay(query) {
    await new Promise((r) => setTimeout(r, 700));
    const res = await fetch(`https://pixabay.com/api/?${new URLSearchParams({
      key: keyOf('PIXABAY_API_KEY'), q: query.slice(0, 100), image_type: 'photo', orientation: 'horizontal', category: 'food', per_page: PER_RECIPE, safesearch: 'true',
    })}`);
    if (res.status === 429) return null;
    if (!res.ok) throw new Error(`Pixabay ${res.status}`);
    return (await res.json()).hits.slice(0, PER_RECIPE).map((p) => ({
      id: p.id, url: p.pageURL, photographer: p.user, alt: p.tags, thumb: p.webformatURL, download: p.largeImageURL,
      license: 'Pixabay Content License', licenseUrl: 'https://pixabay.com/service/license-summary/',
    }));
  },
};
if (!sources[source]) throw new Error(`Usage: node scripts/photo-candidates.mjs ${Object.keys(sources).join('|')}`);

const field = (src, name) => src.match(new RegExp(`^${name}:\\s*"?(.*?)"?\\s*$`, 'm'))?.[1];

// A search term per recipe: the English title unless overridden in queries.json ({ slug: "query" }).
const overridesFile = path.join(outDir, 'queries.json');
const overrides = fs.existsSync(overridesFile) ? JSON.parse(fs.readFileSync(overridesFile, 'utf8')) : {};
const only = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;

const todo = fs.readdirSync(recipesDir)
  .filter((f) => /^[^.]+\.md$/.test(f))
  .map((f) => ({ slug: f.slice(0, -3), src: fs.readFileSync(path.join(recipesDir, f), 'utf8') }))
  .filter(({ slug, src }) => !/^image:/m.test(src) && (!only || only.has(slug)))
  .map(({ slug }) => {
    const en = path.join(recipesDir, `${slug}.en.md`);
    const title = fs.existsSync(en) ? field(fs.readFileSync(en, 'utf8'), 'title') : slug.replace(/-/g, ' ');
    return { slug, title, query: overrides[slug] ?? title };
  });

fs.mkdirSync(path.join(outDir, 'thumbs'), { recursive: true });
const candFile = path.join(outDir, 'candidates.json');
const previous = fs.existsSync(candFile) ? JSON.parse(fs.readFileSync(candFile, 'utf8')) : {};
const results = { ...previous };
const searched = [];

// Recipes already searched with the same query were already reviewed; only new searches get sheets.
for (const r of todo) {
  if (results[r.slug]?.query === r.query && !only) continue;
  const photos = await sources[source](r.query.replace(/\s*\(.*?\)/g, ''));
  if (!photos) { console.log(`\n${source} rate limit reached at ${r.slug}; run again later for the rest.`); break; }
  results[r.slug] = { title: r.title, query: r.query, photos };
  await Promise.all(photos.map(async (p) => {
    const file = path.join(outDir, 'thumbs', `${p.id}.jpg`);
    if (!fs.existsSync(file)) fs.writeFileSync(file, Buffer.from(await (await fetch(p.thumb)).arrayBuffer()));
  }));
  fs.writeFileSync(candFile, JSON.stringify(results, null, 1));
  searched.push(r);
  process.stdout.write('.');
}
console.log(`\n${todo.length} recipes without a photo, ${searched.length} searched on ${source}`);

// Contact sheets: one row per recipe, the title on the left, numbered candidates to the right.
const TW = 260, TH = 175, LABEL = 250, GAP = 6;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const rows = searched;
fs.readdirSync(outDir).filter((f) => f.startsWith('sheet-')).forEach((f) => fs.rmSync(path.join(outDir, f)));
for (let s = 0; s * ROWS_PER_SHEET < rows.length; s++) {
  const chunk = rows.slice(s * ROWS_PER_SHEET, (s + 1) * ROWS_PER_SHEET);
  const W = LABEL + PER_RECIPE * (TW + GAP), H = chunk.length * (TH + GAP);
  const layers = [];
  for (const [i, r] of chunk.entries()) {
    const y = i * (TH + GAP);
    const words = `${r.slug}|${r.title}`.split(/(?<=\|)|\s+/).filter(Boolean);
    const lines = [];
    for (const w of words) {
      if (w.endsWith('|')) { lines.push(w.slice(0, -1), ''); continue; }
      if (!lines.length || (lines.at(-1) + ' ' + w).length > 24) lines.push(w); else lines[lines.length - 1] = `${lines.at(-1)} ${w}`.trim();
    }
    const text = lines.filter((l, k) => l || k === 0).map((l, k) => `<text x="8" y="${24 + k * 22}" font-size="${k ? 18 : 15}" font-family="Arial" fill="${k ? '#111' : '#a33'}">${esc(l)}</text>`).join('');
    layers.push({ input: Buffer.from(`<svg width="${LABEL}" height="${TH}" xmlns="http://www.w3.org/2000/svg">${text}</svg>`), left: 0, top: y });
    for (const [j, p] of results[r.slug].photos.entries()) {
      const img = await sharp(path.join(outDir, 'thumbs', `${p.id}.jpg`)).resize(TW, TH, { fit: 'cover' }).toBuffer()
        .catch(() => sharp({ create: { width: TW, height: TH, channels: 3, background: '#ccc' } }).png().toBuffer());
      layers.push({ input: img, left: LABEL + j * (TW + GAP), top: y });
      layers.push({ input: Buffer.from(`<svg width="34" height="30" xmlns="http://www.w3.org/2000/svg"><rect width="34" height="30" fill="#000" opacity=".75"/><text x="10" y="22" font-size="20" font-family="Arial" font-weight="bold" fill="#ff0">${j + 1}</text></svg>`), left: LABEL + j * (TW + GAP), top: y });
    }
  }
  await sharp({ create: { width: W, height: H, channels: 3, background: '#fff' } })
    .composite(layers).jpeg({ quality: 80 }).toFile(path.join(outDir, `sheet-${String(s + 1).padStart(2, '0')}.jpg`));
}
console.log(`${Math.ceil(rows.length / ROWS_PER_SHEET)} contact sheets in ${outDir}`);
