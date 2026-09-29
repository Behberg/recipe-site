// Downloads the Pexels photos picked from the contact sheets and adds them to the recipes with credit.
//
//   node scripts/pexels-apply.mjs [outDir]
//
// Reads <outDir>/candidates.json (from pexels-candidates.mjs) and <outDir>/picks.json ({ slug: 1-6 }).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.resolve(process.argv[2] ?? path.join(root, '.pexels'));
const recipesDir = path.join(root, 'src/content/recipes');
const imagesDir = path.join(root, 'public/images/recipes');
const candidates = JSON.parse(fs.readFileSync(path.join(outDir, 'candidates.json'), 'utf8'));
const picks = JSON.parse(fs.readFileSync(path.join(outDir, 'picks.json'), 'utf8'));
const q = (s) => JSON.stringify(s);

let done = 0;
for (const [slug, n] of Object.entries(picks)) {
  const file = path.join(recipesDir, `${slug}.md`);
  const src = fs.readFileSync(file, 'utf8');
  if (/^image:/m.test(src)) continue;
  const photo = candidates[slug].photos[n - 1];

  // Same size and encoding as the other recipe photos: at most 1400 px wide, progressive JPEG.
  const res = await fetch(`${photo.original}?auto=compress&cs=tinysrgb&w=1400`);
  if (!res.ok) throw new Error(`${slug}: download ${res.status}`);
  await sharp(Buffer.from(await res.arrayBuffer()))
    .resize({ width: 1400, withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true, mozjpeg: true })
    .toFile(path.join(imagesDir, `${slug}.jpg`));

  const fields = [
    `image: ${q(`/images/recipes/${slug}.jpg`)}`,
    `imageAuthor: ${q(photo.photographer)}`,
    `imageLicense: "Pexels License"`,
    `imageLicenseUrl: "https://www.pexels.com/license/"`,
    `imageSource: ${q(photo.url)}`,
  ].join('\n');
  // Keep the field order of the existing recipes: right after category (or description).
  const anchor = /^category:.*$/m.test(src) ? /^category:.*$/m : /^description:.*$/m;
  fs.writeFileSync(file, src.replace(anchor, (line) => `${line}\n${fields}`));
  done++;
  process.stdout.write('.');
}
console.log(`\n${done} recipes got a photo`);
