// Share images for quiz results: what a friend sees when the result is posted on Facebook,
// WhatsApp or an Instagram story. They must read at thumbnail size, so: one big line, one colour.
import { dishIconSvg, type IconSpec } from './dishIcons';
import { LOGO } from './recipeImage';
import { fit, textBlock, linePath, measure } from './textPath';
import { SITE } from '../site.config';

const INK = '#241612';
const CREAM = '#fffaf3';

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (c: string, base: string, amount: number) => {
  const a = hex(c);
  const b = hex(base);
  return `#${a.map((v, i) => Math.round(v * amount + b[i] * (1 - amount)).toString(16).padStart(2, '0')).join('')}`;
};
const safe = (c: string) => (/^#[0-9a-f]{6}$/i.test(c) ? c : '#9e3039');

/** The dish drawing placed at (x, y), without the emoji badge (emoji fonts are not available at build time). */
function icon(spec: IconSpec | null, x: number, y: number, size: number): string {
  return dishIconSvg(spec)
    .replace(/<circle [^>]*r="15" fill="#fff"[^>]*\/><text [^>]*>[^<]*<\/text>/g, '')
    .replace('<svg class="dish-icon"', `<svg x="${x}" y="${y}" width="${size}" height="${size}"`);
}

function background(w: number, h: number, color: string) {
  const from = mix(color, CREAM, 0.1);
  const to = mix(color, CREAM, 0.24);
  const dot = mix(color, CREAM, 0.4);
  return `<defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient>
    <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="14" cy="14" r="2.2" fill="${dot}"/></pattern>
    <radialGradient id="halo"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".7" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#dots)" opacity=".5"/>`;
}

/** The site's logo mark and name, left-aligned at (x, y) = top-left. */
function brand(x: number, y: number, size: number) {
  const name = linePath(SITE.name, 'display', size * 0.62, x + size * 1.25, y + size * 0.74);
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.3}" fill="#9e3039"/>
  <svg x="${x + size * 0.18}" y="${y + size * 0.18}" width="${size * 0.64}" height="${size * 0.64}" viewBox="12 4 42 50">${LOGO}</svg>
  <path d="${name}" fill="${INK}"/>`;
}

/** A rounded button with centred text. */
function pill(text: string, cx: number, y: number, size: number, color: string, anchor: 'start' | 'middle' = 'middle') {
  const w = measure(text, 'bold', size) + size * 2.2;
  const h = size * 2.3;
  const x = anchor === 'middle' ? cx - w / 2 : cx;
  return {
    svg: `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${color}"/><path d="${linePath(text, 'bold', size, x + w / 2, y + h * 0.66, 'middle')}" fill="#fff"/>`,
    w,
    h,
  };
}

export interface ResultCard {
  question: string;
  line: string;
  tagline: string;
  traits: string[];
  cta: string;
  color: string;
  icon: IconSpec | null;
}

/** 1200x630 link preview. */
export function resultOgSvg(c: ResultCard): string {
  const [w, h] = [1200, 630];
  const color = safe(c.color);
  const tx = 560;
  const maxW = w - tx - 64;
  const eyebrow = fit(c.question.toUpperCase(), 'bold', maxW, 1, 26, 16);
  const title = fit(c.line, 'display', maxW, 3, 76, 40);
  const tag = fit(c.tagline, 'medium', maxW, 2, 30, 20);
  const eb = textBlock(eyebrow.lines, 'bold', eyebrow.size, tx, 150, color);
  const tt = textBlock(title.lines, 'display', title.size, tx, 150 + eyebrow.size + title.size * 1.05, INK, { lineHeight: 1.08 });
  const tg = textBlock(tag.lines, 'medium', tag.size, tx, tt.bottom + tag.size * 1.9, mix(INK, '#ffffff', 0.72), { lineHeight: 1.3 });
  const btn = pill(c.cta, tx, Math.max(tg.bottom + 44, 470), 24, color, 'start');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${background(w, h, color)}
  <circle cx="280" cy="330" r="250" fill="url(#halo)"/>
  ${icon(c.icon, 60, 110, 440)}
  ${brand(tx, 56, 46)}
  ${eb.svg}${tt.svg}${tg.svg}${btn.svg}
</svg>`;
}

/** 1080x1920 story picture: download it and post it to Instagram or TikTok. */
export function resultStorySvg(c: ResultCard): string {
  const [w, h] = [1080, 1920];
  const color = safe(c.color);
  const cx = w / 2;
  const maxW = w - 160;
  const eyebrow = fit(c.question.toUpperCase(), 'bold', maxW, 2, 40, 26);
  const title = fit(c.line, 'display', maxW, 3, 118, 64);
  const tag = fit(c.tagline, 'medium', maxW, 3, 46, 32);
  const eb = textBlock(eyebrow.lines, 'bold', eyebrow.size, cx, 300, color, { anchor: 'middle', lineHeight: 1.25 });
  const iconSize = 640;
  const iconY = eb.bottom + 50;
  const tt = textBlock(title.lines, 'display', title.size, cx, iconY + iconSize + title.size * 0.95, INK, { anchor: 'middle', lineHeight: 1.06 });
  const tg = textBlock(tag.lines, 'medium', tag.size, cx, tt.bottom + tag.size * 1.9, mix(INK, '#ffffff', 0.72), { anchor: 'middle', lineHeight: 1.3 });
  // Traits as small chips in one centred row.
  const chipSize = 34;
  const chips = c.traits.slice(0, 3).map((t) => ({ t, w: measure(t, 'bold', chipSize) + chipSize * 1.6 }));
  const gap = 18;
  let chipX = cx - (chips.reduce((s, x) => s + x.w, 0) + gap * (chips.length - 1)) / 2;
  const chipY = tg.bottom + 70;
  const chipH = chipSize * 2;
  const chipSvg = chips
    .map(({ t, w: cw }) => {
      const s = `<rect x="${chipX}" y="${chipY}" width="${cw}" height="${chipH}" rx="${chipH / 2}" fill="#fff" stroke="${mix(color, CREAM, 0.35)}" stroke-width="3"/><path d="${linePath(t, 'bold', chipSize, chipX + cw / 2, chipY + chipH * 0.66, 'middle')}" fill="${color}"/>`;
      chipX += cw + gap;
      return s;
    })
    .join('');
  const btn = pill(c.cta, cx, h - 250, 40, color);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${background(w, h, color)}
  ${brand(cx - 150, 120, 72)}
  ${eb.svg}
  <circle cx="${cx}" cy="${iconY + iconSize / 2}" r="${iconSize * 0.56}" fill="url(#halo)"/>
  ${icon(c.icon, cx - iconSize / 2, iconY, iconSize)}
  ${tt.svg}${tg.svg}${chipSvg}${btn.svg}
  <path d="${linePath(new URL('/', import.meta.env.SITE ?? 'https://dzervene.lv').host, 'bold', 32, cx, h - 110, 'middle')}" fill="${mix(INK, '#ffffff', 0.6)}"/>
</svg>`;
}

export interface CoverCard {
  title: string;
  hook: string;
  cta: string;
  color: string;
  icons: (IconSpec | null)[];
}

/** 1200x630 link preview for a quiz page: the question and a spread of possible results. */
export function coverSvg(c: CoverCard): string {
  const [w, h] = [1200, 630];
  const color = safe(c.color);
  const maxW = 560;
  const title = fit(c.title, 'display', maxW, 3, 84, 48);
  const hook = fit(c.hook, 'medium', maxW, 3, 30, 22);
  const tt = textBlock(title.lines, 'display', title.size, 64, 170 + title.size * 0.8, INK, { lineHeight: 1.06 });
  const hk = textBlock(hook.lines, 'medium', hook.size, 64, tt.bottom + hook.size * 1.9, mix(INK, '#ffffff', 0.72), { lineHeight: 1.3 });
  const btn = pill(c.cta, 64, Math.max(hk.bottom + 44, 480), 24, color, 'start');
  // Up to six result drawings in a loose 3x2 grid on the right.
  const spots = [
    [650, 70], [840, 40], [990, 110], [680, 320], [860, 350], [1000, 380],
  ];
  const art = c.icons
    .slice(0, 6)
    .map((spec, i) => icon(spec, spots[i][0], spots[i][1], 190))
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${background(w, h, color)}
  <circle cx="930" cy="320" r="330" fill="url(#halo)"/>
  ${art}
  ${brand(64, 56, 46)}
  ${tt.svg}${hk.svg}${btn.svg}
</svg>`;
}
