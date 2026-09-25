// Raster recipe images for Google (Recipe rich results need an image) and link previews.
// Built from the same dish illustration the site shows, so they always match the page.
import { dishIconSvg, parseIcon } from './dishIcons';

export const IMAGE_RATIOS = {
  '1x1': [1200, 1200],
  '4x3': [1200, 900],
  '16x9': [1200, 675],
} as const;
export type ImageRatio = keyof typeof IMAGE_RATIOS;

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
/** Mix `c` into `base` by `amount` (0..1), like CSS color-mix. */
function mix(c: string, base: string, amount: number) {
  const a = hex(c);
  const b = hex(base);
  return `#${a.map((v, i) => Math.round(v * amount + b[i] * (1 - amount)).toString(16).padStart(2, '0')).join('')}`;
}

// The logo mark from LogoMark.astro, used as a small brand stamp.
const LOGO = `<path d="M33 17c-3 2-5 5-6 9M33 17c3 2 6 4 8 7" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M33 17c3-7 10-10 18-9-2 7-9 11-18 9z" fill="#fff"/><path d="M33 17c-3-6-9-8-15-7 2 6 8 9 15 7z" fill="#fff" opacity=".85"/><ellipse cx="42" cy="34" rx="9.5" ry="10.5" fill="#fff" opacity=".9"/><ellipse cx="26" cy="39" rx="12" ry="13" fill="#fff" stroke="#9e3039" stroke-width="2.5"/>`;

interface Input {
  icon?: string;
  iconColors?: string;
  iconExtra?: string;
  color: string;
}

/** SVG source for a recipe image of the given size. Emoji badges are left out: fonts are not guaranteed at build time. */
export function recipeImageSvg(r: Input, ratio: ImageRatio): string {
  const [w, h] = IMAGE_RATIOS[ratio];
  const color = /^#[0-9a-f]{6}$/i.test(r.color) ? r.color : '#9e3039';
  const from = mix(color, '#fffaf3', 0.14);
  const to = mix(color, '#fffaf3', 0.3);
  const dot = mix(color, '#fffaf3', 0.45);
  const icon = dishIconSvg(parseIcon(r.icon, r.iconColors, r.iconExtra))
    .replace(/<circle [^>]*r="15" fill="#fff"[^>]*\/><text [^>]*>[^<]*<\/text>/g, '');
  const size = Math.round(Math.min(w, h) * 0.78);
  const x = Math.round((w - size) / 2);
  const y = Math.round((h - size) / 2 + h * 0.02);
  const art = icon
    ? icon.replace('<svg class="dish-icon"', `<svg x="${x}" y="${y}" width="${size}" height="${size}"`)
    : '';
  const stamp = Math.round(Math.min(w, h) * 0.085);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient>
    <radialGradient id="glow" cx="0.25" cy="0.15" r="0.55"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="13" cy="13" r="2" fill="${dot}"/></pattern>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="1"><stop offset=".15" stop-color="#fff"/><stop offset=".7" stop-color="#000"/></linearGradient>
    <mask id="m"><rect width="${w}" height="${h}" fill="url(#fade)"/></mask>
    <radialGradient id="shadow"><stop offset="0" stop-color="#3c1e0a" stop-opacity=".16"/><stop offset="1" stop-color="#3c1e0a" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <rect width="${w}" height="${h}" fill="url(#dots)" opacity=".55" mask="url(#m)"/>
  <ellipse cx="${w / 2}" cy="${y + size * 0.9}" rx="${size * 0.42}" ry="${size * 0.07}" fill="url(#shadow)"/>
  ${art}
  <g transform="translate(${w - stamp - stamp * 0.45} ${h - stamp - stamp * 0.45})">
    <rect width="${stamp}" height="${stamp}" rx="${stamp * 0.32}" fill="#9e3039"/>
    <svg x="${stamp * 0.2}" y="${stamp * 0.2}" width="${stamp * 0.6}" height="${stamp * 0.6}" viewBox="12 4 42 50">${LOGO}</svg>
  </g>
</svg>`;
}

/** Public path of a generated recipe image. */
export const recipeImagePath = (id: string, ratio: ImageRatio) => `/img/recepte/${id}/${ratio}.jpg`;
