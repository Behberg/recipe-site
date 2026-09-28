// Text for build-time images, drawn as SVG paths from the site's own fonts.
// The image renderer (sharp) only sees whatever fonts the build machine has installed, so we
// never hand it <text>: every glyph is converted to a path here, which looks the same everywhere.
import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';

export type FontFamily = 'display' | 'bold' | 'medium';

const FILES: Record<FontFamily, [string, string]> = {
  display: ['playfair-display', '800'],
  bold: ['inter', '700'],
  medium: ['inter', '500'],
};
// Fontsource ships each language range as its own file; together they cover Latvian, Lithuanian and Russian.
const SUBSETS = ['latin', 'latin-ext', 'cyrillic'];

const loaded = new Map<FontFamily, opentype.Font[]>();
function fonts(family: FontFamily): opentype.Font[] {
  if (!loaded.has(family)) {
    const [name, weight] = FILES[family];
    loaded.set(
      family,
      SUBSETS.map((s) => {
        const buf = fs.readFileSync(path.join('node_modules', '@fontsource', name, 'files', `${name}-${s}-${weight}-normal.woff`));
        return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer);
      }),
    );
  }
  return loaded.get(family)!;
}

/** Splits text into runs that share a font file. Characters no font has (emoji) are dropped. */
function runs(text: string, family: FontFamily): { font: opentype.Font; text: string }[] {
  const out: { font: opentype.Font; text: string }[] = [];
  for (const ch of text) {
    const font = fonts(family).find((f) => f.charToGlyphIndex(ch) > 0) ?? (ch === ' ' ? fonts(family)[0] : null);
    if (!font) continue;
    const last = out[out.length - 1];
    if (last && last.font === font) last.text += ch;
    else out.push({ font, text: ch });
  }
  return out;
}

export function measure(text: string, family: FontFamily, size: number): number {
  return runs(text, family).reduce((w, r) => w + r.font.getAdvanceWidth(r.text, size, { kerning: true }), 0);
}

/** SVG path data for one line. `anchor` works like SVG text-anchor. */
export function linePath(text: string, family: FontFamily, size: number, x: number, y: number, anchor: 'start' | 'middle' = 'start'): string {
  let cx = anchor === 'middle' ? x - measure(text, family, size) / 2 : x;
  let d = '';
  for (const r of runs(text, family)) {
    d += r.font.getPath(r.text, cx, y, size, { kerning: true }).toPathData(1);
    cx += r.font.getAdvanceWidth(r.text, size, { kerning: true });
  }
  return d;
}

/** Greedy word wrap. */
export function wrap(text: string, family: FontFamily, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next, family, size) > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** The largest size (down to `min`) at which the text fits in `maxLines` lines. */
export function fit(text: string, family: FontFamily, maxWidth: number, maxLines: number, start: number, min: number) {
  let size = start;
  let lines = wrap(text, family, size, maxWidth);
  while (size > min && (lines.length > maxLines || lines.some((l) => measure(l, family, size) > maxWidth))) {
    size -= 2;
    lines = wrap(text, family, size, maxWidth);
  }
  return { size, lines };
}

/** A block of wrapped lines as one <path>. Returns the markup and the y below the last line. */
export function textBlock(
  lines: string[],
  family: FontFamily,
  size: number,
  x: number,
  y: number,
  fill: string,
  opts: { anchor?: 'start' | 'middle'; lineHeight?: number } = {},
): { svg: string; bottom: number } {
  const lh = size * (opts.lineHeight ?? 1.15);
  const d = lines.map((l, i) => linePath(l, family, size, x, y + i * lh, opts.anchor)).join('');
  return { svg: `<path d="${d}" fill="${fill}"/>`, bottom: y + (lines.length - 1) * lh };
}
