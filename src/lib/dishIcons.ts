// Illustrated dish icons.
//
// Emoji cover only a fraction of our dishes (there is no emoji for pīrāgi, a jar of jam or a
// bowl of pink cold soup), so recipes can use a recoloured flat illustration instead.
// A recipe sets three front matter fields:
//   icon:        the drawing (jar, soup, glass, layers, cake, tart, bun, loaf, casserole,
//                skillet, plate, roast, sweets, flatbread, wheel, ramekin)
//   iconColors:  one or more colours, e.g. "#c8102e" or "#f5e6c4, #d9a55a"
//   iconExtra:   a detail: garnish word(s) such as "egg dill" or a small emoji badge such as "🍓"
// The output is a self-contained SVG string, used both at build time and in the browser.

export interface IconSpec {
  icon: string;
  colors: string[];
  extra: string[];
}

export const ICON_KINDS = [
  'jar', 'soup', 'glass', 'layers', 'cake', 'tart', 'bun', 'loaf', 'casserole',
  'skillet', 'plate', 'roast', 'sweets', 'flatbread', 'wheel', 'ramekin',
] as const;

export function parseIcon(icon?: string, colors?: string, extra?: string): IconSpec | null {
  if (!icon || !(ICON_KINDS as readonly string[]).includes(icon)) return null;
  return {
    icon,
    colors: (colors ?? '').split(',').map((c) => c.trim()).filter((c) => /^#[0-9a-f]{6}$/i.test(c)),
    extra: (extra ?? '').split(/\s+/).filter(Boolean),
  };
}

/* ---------- colour helpers ---------- */
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c: number[]) => '#' + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const mix = (a: string, b: string, t: number) => {
  const x = hex(a);
  const y = hex(b);
  return toHex(x.map((v, i) => v + (y[i] - v) * t));
};
const dark = (c: string, t = 0.25) => mix(c, '#1d1310', t);
const light = (c: string, t = 0.35) => mix(c, '#ffffff', t);
const isEmoji = (s: string) => /\p{Extended_Pictographic}/u.test(s);

let uid = 0;
const SHADOW = '<ellipse cx="60" cy="108" rx="40" ry="6" fill="#000" opacity=".16"/>';

function badge(emoji?: string, x = 90, y = 90) {
  if (!emoji) return '';
  return `<circle cx="${x}" cy="${y}" r="15" fill="#fff" stroke="#00000014" stroke-width="1.5"/><text x="${x}" y="${y + 6}" font-size="18" text-anchor="middle">${emoji}</text>`;
}

/* ---------- garnishes on a surface centred at (cx, cy) ---------- */
function garnish(words: string[], cx: number, cy: number, rx: number, base: string, accent?: string): string {
  const out: string[] = [];
  const pts = [
    [-0.55, -0.1], [0.5, 0.15], [-0.15, 0.35], [0.2, -0.35], [-0.35, -0.45], [0.62, -0.3], [0.05, 0.05], [-0.62, 0.25],
  ];
  const at = (i: number, s = 1) => [cx + pts[i % pts.length][0] * rx * s, cy + pts[i % pts.length][1] * rx * 0.28 * s];
  for (const w of words) {
    switch (w) {
      case 'egg':
        out.push(`<ellipse cx="${cx - rx * 0.3}" cy="${cy - 1}" rx="10" ry="6.5" fill="#fffdf6"/><circle cx="${cx - rx * 0.3}" cy="${cy - 1}" r="4.2" fill="#f6b91c"/>`);
        out.push(`<ellipse cx="${cx + rx * 0.25}" cy="${cy + 3}" rx="9" ry="6" fill="#fffdf6"/><circle cx="${cx + rx * 0.25}" cy="${cy + 3}" r="3.8" fill="#f6b91c"/>`);
        break;
      case 'eggs':
        [-0.35, 0.3].forEach((dx, i) => out.push(`<ellipse cx="${cx + dx * rx}" cy="${cy + (i ? 2 : -2)}" rx="11" ry="7" fill="#fffdf6"/><circle cx="${cx + dx * rx}" cy="${cy + (i ? 2 : -2)}" r="4.5" fill="#f6a71c"/>`));
        break;
      case 'dill':
      case 'herbs':
        for (let i = 0; i < 7; i++) {
          const [x, y] = at(i);
          out.push(`<path d="M${x - 3} ${y} l3 -2 l3 2" stroke="#4f8a2c" stroke-width="1.8" fill="none" stroke-linecap="round"/>`);
        }
        break;
      case 'cream':
        out.push(`<ellipse cx="${cx + rx * 0.15}" cy="${cy}" rx="11" ry="5.5" fill="#fffaf0"/><ellipse cx="${cx + rx * 0.15}" cy="${cy - 2.5}" rx="6" ry="3" fill="#fff"/>`);
        break;
      case 'swirl':
        out.push(`<path d="M${cx - 14} ${cy} q7 -6 14 0 t14 0" stroke="${accent ?? '#c9a227'}" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".9"/>`);
        out.push(`<circle cx="${cx + 4}" cy="${cy + 3}" r="1.6" fill="#c8402a"/><circle cx="${cx - 8}" cy="${cy - 3}" r="1.4" fill="#c8402a"/>`);
        break;
      case 'croutons':
      case 'cubes':
        for (let i = 0; i < 5; i++) {
          const [x, y] = at(i);
          out.push(`<rect x="${x - 3.5}" y="${y - 3}" width="7" height="6" rx="1.5" fill="${w === 'cubes' ? '#fbf7ec' : '#c98a3a'}" stroke="${w === 'cubes' ? '#e4dccb' : '#9b6428'}" stroke-width="1"/>`);
        }
        break;
      case 'balls':
        for (let i = 0; i < 5; i++) {
          const [x, y] = at(i);
          out.push(`<circle cx="${x}" cy="${y}" r="5.5" fill="${accent ?? '#8a5230'}"/><circle cx="${x - 1.8}" cy="${y - 2}" r="1.6" fill="#fff" opacity=".35"/>`);
        }
        break;
      case 'chunks':
        for (let i = 0; i < 8; i++) {
          const [x, y] = at(i);
          const c = [accent ?? dark(base, 0.35), light(base, 0.5), '#6f9a3a'][i % 3];
          out.push(`<rect x="${x - 4}" y="${y - 3}" width="8" height="6" rx="2.5" fill="${c}" transform="rotate(${(i * 37) % 60 - 30} ${x} ${y})"/>`);
        }
        break;
      case 'noodles':
        for (let i = 0; i < 3; i++) out.push(`<path d="M${cx - rx * 0.6} ${cy - 4 + i * 4} q${rx * 0.15} -5 ${rx * 0.3} 0 t${rx * 0.3} 0 t${rx * 0.3} 0 t${rx * 0.3} 0" stroke="#f3d27a" stroke-width="2.6" fill="none" stroke-linecap="round"/>`);
        break;
      case 'dumplings':
        [-0.35, 0.05, 0.4].forEach((dx, i) => out.push(`<path d="M${cx + dx * rx - 8} ${cy + (i % 2) * 3} q8 -10 16 0 z" fill="#f8efd8" stroke="#e1d2ad" stroke-width="1"/>`));
        break;
      case 'shrimp':
        [-0.3, 0.3].forEach((dx) => out.push(`<path d="M${cx + dx * rx - 6} ${cy} a6 6 0 1 1 10 4" stroke="#f08a5a" stroke-width="4" fill="none" stroke-linecap="round"/>`));
        break;
      case 'lemon':
        out.push(`<circle cx="${cx + rx * 0.45}" cy="${cy - 2}" r="7" fill="#f7dc4a" stroke="#e9c21f" stroke-width="1.5"/><path d="M${cx + rx * 0.45 - 5} ${cy - 2} h10 M${cx + rx * 0.45} ${cy - 7} v10" stroke="#fff" stroke-width="1"/>`);
        break;
      case 'olives':
        for (let i = 0; i < 3; i++) {
          const [x, y] = at(i + 2);
          out.push(`<ellipse cx="${x}" cy="${y}" rx="4" ry="3" fill="#5c6b2a"/>`);
        }
        break;
      case 'mushrooms':
        for (let i = 0; i < 4; i++) {
          const [x, y] = at(i);
          out.push(`<path d="M${x - 5} ${y} q5 -8 10 0 z" fill="${accent ?? '#e3a02b'}"/><rect x="${x - 1.5}" y="${y}" width="3" height="3.5" fill="#f1e4c6"/>`);
        }
        break;
      case 'seeds':
        for (let i = 0; i < 7; i++) {
          const [x, y] = at(i);
          out.push(`<ellipse cx="${x}" cy="${y}" rx="2.6" ry="1.4" fill="#6f7d3a" transform="rotate(${i * 40} ${x} ${y})"/>`);
        }
        break;
      case 'bacon':
        for (let i = 0; i < 6; i++) {
          const [x, y] = at(i);
          out.push(`<rect x="${x - 3.5}" y="${y - 2.5}" width="7" height="5" rx="1.5" fill="#c8664a"/><rect x="${x - 3.5}" y="${y - 2.5}" width="7" height="2" rx="1" fill="#f5d7c4"/>`);
        }
        break;
      case 'butter':
        out.push(`<rect x="${cx - 6}" y="${cy - 5}" width="12" height="9" rx="2" fill="#fbe07a" stroke="#eac545" stroke-width="1"/>`);
        break;
      case 'jam':
        out.push(`<ellipse cx="${cx + 4}" cy="${cy}" rx="8" ry="4.5" fill="${accent ?? '#c8102e'}"/>`);
        break;
      case 'berries':
        for (let i = 0; i < 5; i++) {
          const [x, y] = at(i);
          out.push(`<circle cx="${x}" cy="${y}" r="3.6" fill="${accent ?? '#3a3a8c'}"/>`);
        }
        break;
      case 'cinnamon':
        for (let i = 0; i < 8; i++) {
          const [x, y] = at(i);
          out.push(`<circle cx="${x}" cy="${y}" r="1.3" fill="#a0602e"/>`);
        }
        break;
      case 'chili':
        out.push(`<path d="M${cx - 10} ${cy} q10 -8 20 0" stroke="#d62828" stroke-width="4" fill="none" stroke-linecap="round"/>`);
        break;
      case 'nuts':
        for (let i = 0; i < 5; i++) {
          const [x, y] = at(i);
          out.push(`<ellipse cx="${x}" cy="${y}" rx="4" ry="3" fill="#b9854e"/><path d="M${x - 3} ${y} h6" stroke="#8a5a2e" stroke-width="1"/>`);
        }
        break;
      case 'cheese':
        out.push(`<ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.55}" ry="6" fill="#f3cf5a"/><ellipse cx="${cx - 6}" cy="${cy - 1}" rx="${rx * 0.25}" ry="3" fill="#d9a531"/>`);
        break;
    }
  }
  return out.join('');
}

/* ---------- drawings ---------- */
type Draw = (c: string[], e: string[]) => string;

const DRAW: Record<string, Draw> = {
  jar([c = '#c8102e', lid = '#c9a227'], e) {
    const emoji = e.find(isEmoji);
    return `${SHADOW}
      <rect x="27" y="34" width="66" height="72" rx="15" fill="#ffffff" opacity=".55"/>
      <rect x="31" y="46" width="58" height="56" rx="11" fill="${c}"/>
      <rect x="31" y="46" width="58" height="10" rx="5" fill="${light(c, 0.25)}"/>
      <rect x="37" y="54" width="6" height="36" rx="3" fill="#fff" opacity=".35"/>
      <rect x="29" y="22" width="62" height="16" rx="5" fill="${lid}"/>
      <rect x="29" y="31" width="62" height="7" rx="3" fill="${dark(lid, 0.2)}"/>
      <rect x="44" y="64" width="32" height="22" rx="4" fill="#fffaf0" opacity=".92"/>
      <path d="M49 72 h22 M52 78 h16" stroke="${dark(c, 0.1)}" stroke-width="2" stroke-linecap="round" opacity=".6"/>
      ${badge(emoji, 88, 94)}`;
  },

  soup([c = '#e8c36a', bowl = '#f7f2ea', a2], e) {
    const words = e.filter((w) => !isEmoji(w));
    return `${SHADOW}
      <path d="M14 58 h92 c0 28 -20 46 -46 46 s-46 -18 -46 -46 z" fill="${bowl}"/>
      <path d="M14 58 h92 c0 6 -1 11 -3 16 c-12 8 -74 8 -86 0 c-2 -5 -3 -10 -3 -16 z" fill="${dark(bowl, 0.06)}" opacity=".5"/>
      <path d="M22 78 c14 8 62 8 76 0" stroke="${dark(bowl, 0.18)}" stroke-width="2" fill="none" opacity=".45"/>
      <ellipse cx="60" cy="58" rx="46" ry="12" fill="${dark(bowl, 0.12)}"/>
      <ellipse cx="60" cy="58.5" rx="41" ry="9.5" fill="${c}"/>
      <ellipse cx="50" cy="56" rx="16" ry="3" fill="#fff" opacity=".18"/>
      ${garnish(words, 60, 58, 40, c, a2)}
      ${badge(e.find(isEmoji), 94, 92)}`;
  },

  glass([c = '#b3122e', a2], e) {
    const words = e.filter((w) => !isEmoji(w));
    const foam = words.includes('foam') ? `<rect x="36" y="30" width="48" height="12" rx="6" fill="#fbf4e3"/>` : '';
    const bubbles = words.includes('bubbles') ? [48, 58, 70, 64, 52].map((x, i) => `<circle cx="${x}" cy="${60 + i * 8}" r="${1.5 + (i % 2)}" fill="#fff" opacity=".6"/>`).join('') : '';
    const ice = words.includes('ice') ? `<rect x="45" y="46" width="12" height="11" rx="3" fill="#fff" opacity=".55" transform="rotate(-12 51 51)"/><rect x="62" y="54" width="11" height="10" rx="3" fill="#fff" opacity=".5" transform="rotate(10 67 59)"/>` : '';
    const orange = words.includes('orange') ? `<circle cx="84" cy="32" r="12" fill="#f39a1e"/><circle cx="84" cy="32" r="9" fill="#f9c15a"/><path d="M84 23 v18 M75 32 h18 M78 26 l12 12 M90 26 l-12 12" stroke="#fff" stroke-width="1" opacity=".8"/>` : '';
    const mint = words.includes('mint') ? `<path d="M42 30 q-8 -10 2 -14 q6 8 -2 14 z" fill="#4f9a3a"/><path d="M48 30 q2 -12 12 -10 q-2 10 -12 10 z" fill="#63b04a"/>` : '';
    const mug = words.includes('mug');
    if (mug)
      return `${SHADOW}<path d="M30 36 h54 v54 c0 9 -7 16 -16 16 h-22 c-9 0 -16 -7 -16 -16 z" fill="${a2 ?? '#f5efe6'}"/><path d="M84 50 h8 c8 0 12 6 12 14 s-4 14 -12 14 h-8" stroke="${a2 ?? '#f5efe6'}" stroke-width="7" fill="none"/><ellipse cx="57" cy="38" rx="25" ry="6" fill="${c}"/>${words.includes('cream') ? '<ellipse cx="57" cy="34" rx="18" ry="7" fill="#fffaf0"/>' : ''}${orange}${badge(e.find(isEmoji), 90, 94)}`;
    return `${SHADOW}
      <path d="M34 26 h52 l-6 76 c-.4 4 -3.6 6 -7.6 6 h-24.8 c-4 0 -7.2 -2 -7.6 -6 z" fill="#ffffff" opacity=".55"/>
      <path d="M37.5 40 h45 l-5 60 c-.3 3 -2.6 5 -5.6 5 h-23.8 c-3 0 -5.3 -2 -5.6 -5 z" fill="${c}"/>
      <path d="M41 44 l3 52" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".3"/>
      ${foam}${bubbles}${ice}${orange}${mint}${badge(e.find(isEmoji), 90, 94)}`;
  },

  layers(cols, e) {
    const layers = cols.length ? cols : ['#f5ecd7'];
    const top = 44;
    const bottom = 100;
    const h = (bottom - top) / layers.length;
    const bands = layers
      .map((c, i) => {
        const y = bottom - (i + 1) * h;
        return `<rect x="33" y="${y}" width="54" height="${h + 1}" fill="${c}"/>${i < layers.length - 1 ? `<path d="M33 ${y} q7 -3 13.5 0 t13.5 0 t13.5 0 t13.5 0" fill="${layers[i + 1]}"/>` : ''}`;
      })
      .join('');
    const words = e.filter((w) => !isEmoji(w));
    const topG = words.includes('cream')
      ? `<ellipse cx="60" cy="42" rx="22" ry="8" fill="#fffaf0"/><ellipse cx="60" cy="37" rx="12" ry="6" fill="#fff"/>`
      : words.includes('crumbs')
        ? [44, 52, 60, 68, 76, 56, 64].map((x, i) => `<circle cx="${x}" cy="${43 - (i % 3) * 2}" r="2.2" fill="#4a2c1a"/>`).join('')
        : '';
    return `${SHADOW}
      <path d="M28 30 h64 v64 c0 8 -6 14 -14 14 h-36 c-8 0 -14 -6 -14 -14 z" fill="#ffffff" opacity=".55"/>
      <clipPath id="lg${++uid}"><path d="M33 40 h54 v54 c0 6 -4 10 -10 10 h-34 c-6 0 -10 -4 -10 -10 z"/></clipPath>
      <g clip-path="url(#lg${uid})">${bands}</g>
      <path d="M37 46 v46" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".35"/>
      ${topG}${badge(e.find(isEmoji), 88, 30)}`;
  },

  cake(cols, e) {
    const layers = cols.length ? cols : ['#e8c36a', '#f5ecd7'];
    const topCol = layers[layers.length - 1];
    const y0 = 50;
    const H = 42;
    const h = H / layers.length;
    const side = layers
      .map((c, i) => `<path d="M26 ${y0 + H - (i + 1) * h} L84 ${y0 + H - (i + 1) * h + 8} L84 ${y0 + H - i * h + 8} L26 ${y0 + H - i * h} z" fill="${c}"/>`)
      .join('');
    const back = layers
      .map((c, i) => `<path d="M84 ${y0 + H - (i + 1) * h + 8} L100 ${y0 + H - (i + 1) * h - 6} L100 ${y0 + H - i * h - 6} L84 ${y0 + H - i * h + 8} z" fill="${dark(c, 0.14)}"/>`)
      .join('');
    const words = e.filter((w) => !isEmoji(w));
    const deco = words.includes('dots')
      ? [40, 55, 70, 62, 48].map((x, i) => `<circle cx="${x}" cy="${y0 - 2 + (i % 2) * 5}" r="1.6" fill="${dark(topCol, 0.45)}"/>`).join('')
      : words.includes('drizzle')
        ? `<path d="M34 ${y0 - 1} q8 5 16 0 t16 0 t16 0" stroke="${dark(topCol, 0.3)}" stroke-width="2.4" fill="none"/>`
        : '';
    return `${SHADOW}
      <path d="M26 ${y0} L84 ${y0 + 8} L100 ${y0 - 6} L42 ${y0 - 14} z" fill="${light(topCol, 0.12)}"/>
      ${side}${back}
      <path d="M26 ${y0} L84 ${y0 + 8} L100 ${y0 - 6}" stroke="#fff" stroke-width="1.5" fill="none" opacity=".4"/>
      ${deco}${badge(e.find(isEmoji), 62, 34)}`;
  },

  tart([fill = '#e8801e', crust = '#d9a14e'], e) {
    const words = e.filter((w) => !isEmoji(w));
    const crumble = words.includes('crumble')
      ? [42, 52, 62, 72, 80, 47, 57, 67, 77, 60].map((x, i) => `<circle cx="${x}" cy="${58 + ((i * 7) % 16) - 6}" r="${3 + (i % 3)}" fill="${light(crust, 0.2)}"/>`).join('')
      : '';
    const lattice = words.includes('lattice')
      ? `<g stroke="${crust}" stroke-width="5" stroke-linecap="round" opacity=".95"><path d="M40 50 L80 70 M48 44 L90 64 M34 58 L70 76 M80 46 L42 72 M90 54 L54 76 M70 44 L34 64"/></g>`
      : '';
    const swirl = words.includes('cinnamon') ? garnish(['cinnamon'], 60, 60, 30, fill) : '';
    const slices = words.includes('apples')
      ? [[-18, -4], [0, -8], [18, -4], [-10, 6], [10, 6]].map(([dx, dy]) => `<path d="M${60 + dx - 7} ${60 + dy} q7 -7 14 0" stroke="${dark(fill, 0.25)}" stroke-width="2" fill="none"/>`).join('')
      : '';
    return `${SHADOW}
      <ellipse cx="60" cy="68" rx="46" ry="26" fill="${dark(crust, 0.12)}"/>
      <ellipse cx="60" cy="62" rx="46" ry="24" fill="${crust}"/>
      <ellipse cx="60" cy="61" rx="37" ry="18" fill="${fill}"/>
      <ellipse cx="50" cy="56" rx="14" ry="4" fill="#fff" opacity=".2"/>
      ${Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return `<circle cx="${60 + Math.cos(a) * 42}" cy="${62 + Math.sin(a) * 21}" r="3" fill="${light(crust, 0.15)}"/>`;
      }).join('')}
      ${crumble}${lattice}${swirl}${slices}${badge(e.find(isEmoji), 94, 88)}`;
  },

  bun([c = '#d9913a'], e) {
    const words = e.filter((w) => !isEmoji(w));
    const glaze = light(c, 0.35);
    if (words.includes('round') || words.includes('cluster')) {
      const buns = words.includes('cluster') ? [[40, 66], [80, 66], [60, 54]] : [[60, 62]];
      const r = words.includes('cluster') ? 20 : 30;
      const sugar = words.includes('sugar') ? Array.from({ length: 10 }, (_, i) => `<circle cx="${60 + ((i * 13) % 34) - 17}" cy="${50 + ((i * 7) % 16)}" r="1.4" fill="#fff"/>`).join('') : '';
      const herbs = words.includes('herbs') ? garnish(['dill'], 60, 56, 30, c) : '';
      return `${SHADOW}${buns
        .map(([x, y]) => `<ellipse cx="${x}" cy="${y + 6}" rx="${r}" ry="${r * 0.7}" fill="${dark(c, 0.15)}"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.72}" fill="${c}"/><ellipse cx="${x - r * 0.3}" cy="${y - r * 0.3}" rx="${r * 0.4}" ry="${r * 0.2}" fill="${glaze}" opacity=".7"/>`)
        .join('')}${sugar}${herbs}${badge(e.find(isEmoji), 94, 90)}`;
    }
    if (words.includes('swirl')) {
      return `${SHADOW}<ellipse cx="60" cy="70" rx="36" ry="24" fill="${dark(c, 0.15)}"/><ellipse cx="60" cy="62" rx="36" ry="26" fill="${c}"/>
        <path d="M60 62 m-4 0 a4 3 0 1 1 8 0 a9 7 0 1 1 -18 0 a15 11 0 1 1 30 0 a21 16 0 1 1 -42 0" stroke="${dark(c, 0.35)}" stroke-width="4" fill="none" stroke-linecap="round"/>
        ${words.includes('sugar') ? [44, 58, 72, 52, 66].map((x, i) => `<rect x="${x}" y="${48 + (i % 2) * 8}" width="4" height="4" rx="1" fill="#fff"/>`).join('') : ''}${badge(e.find(isEmoji), 94, 90)}`;
    }
    // half-moon (pīrāgi, kibinai, empanadas)
    const two = words.includes('two');
    const moon = (x: number, y: number, s: number) => `
      <path d="M${x - 32 * s} ${y + 10 * s} c4 -22 ${60 * s} -22 ${64 * s} 0 c-14 ${7 * s} -50 ${7 * s} -${64 * s} 0 z" fill="${dark(c, 0.12)}" transform="translate(0 ${4 * s})"/>
      <path d="M${x - 32 * s} ${y + 10 * s} c4 -22 ${60 * s} -22 ${64 * s} 0 c-14 ${7 * s} -50 ${7 * s} -${64 * s} 0 z" fill="${c}"/>
      <path d="M${x - 16 * s} ${y - 4 * s} q${10 * s} -${8 * s} ${24 * s} -${4 * s}" stroke="${glaze}" stroke-width="${4 * s}" stroke-linecap="round" fill="none" opacity=".75"/>
      ${words.includes('pleat') ? `<path d="M${x - 26 * s} ${y + 8 * s} q${26 * s} -${26 * s} ${52 * s} 0" stroke="${dark(c, 0.3)}" stroke-width="2" stroke-dasharray="3 4" fill="none"/>` : ''}`;
    return `${SHADOW}${two ? moon(42, 72, 0.95) + moon(78, 56, 0.95) : moon(60, 62, 1.25)}${badge(e.find(isEmoji), 94, 90)}`;
  },

  loaf([c = '#8a5a2e', a2], e) {
    const words = e.filter((w) => !isEmoji(w));
    const scoring = words.includes('marble')
      ? `<path d="M34 70 q10 -14 22 -2 t24 -4" stroke="${a2 ?? '#5a3420'}" stroke-width="6" fill="none" stroke-linecap="round"/>`
      : `<path d="M40 50 l10 -8 M56 46 l10 -8 M72 46 l10 -8" stroke="${light(c, 0.3)}" stroke-width="4" stroke-linecap="round"/>`;
    const seeds = words.includes('seeds') ? Array.from({ length: 12 }, (_, i) => `<ellipse cx="${34 + ((i * 17) % 54)}" cy="${48 + ((i * 11) % 18)}" rx="2" ry="1" fill="${light(c, 0.5)}"/>`).join('') : '';
    const chunks = words.includes('chunks') ? Array.from({ length: 7 }, (_, i) => `<rect x="${36 + ((i * 13) % 48)}" y="${56 + ((i * 7) % 20)}" width="7" height="5" rx="1.5" fill="${a2 ?? '#f5e6c4'}"/>`).join('') : '';
    const sugar = words.includes('sugar') ? Array.from({ length: 14 }, (_, i) => `<circle cx="${32 + ((i * 17) % 58)}" cy="${46 + ((i * 5) % 12)}" r="1.5" fill="#fff"/>`).join('') : '';
    return `${SHADOW}
      <path d="M20 86 c0 -30 14 -46 40 -46 s40 16 40 46 c0 10 -6 16 -16 16 h-48 c-10 0 -16 -6 -16 -16 z" fill="${dark(c, 0.12)}"/>
      <path d="M20 82 c0 -30 14 -44 40 -44 s40 14 40 44 c0 8 -6 14 -16 14 h-48 c-10 0 -16 -6 -16 -14 z" fill="${c}"/>
      <ellipse cx="46" cy="52" rx="14" ry="5" fill="#fff" opacity=".14"/>
      ${scoring}${seeds}${chunks}${sugar}${badge(e.find(isEmoji), 94, 92)}`;
  },

  casserole([c = '#e8b84a', dish = '#5f86bd'], e) {
    const words = e.filter((w) => !isEmoji(w));
    const spots = Array.from({ length: 8 }, (_, i) => `<ellipse cx="${30 + ((i * 19) % 60)}" cy="${50 + ((i * 7) % 14)}" rx="${4 + (i % 3)}" ry="2.5" fill="${dark(c, 0.32)}" opacity=".55"/>`).join('');
    const peaks = words.includes('peaks') ? Array.from({ length: 7 }, (_, i) => `<path d="M${28 + i * 9.5} ${58 - (i % 2) * 4} q4.5 -8 9 0" stroke="${dark(c, 0.22)}" stroke-width="2" fill="none"/>`).join('') : '';
    const layers = words.includes('layered') ? `<path d="M20 72 h80" stroke="${dark(c, 0.3)}" stroke-width="3"/>` : '';
    return `${SHADOW}
      <rect x="6" y="62" width="14" height="9" rx="4" fill="${dark(dish, 0.2)}"/><rect x="100" y="62" width="14" height="9" rx="4" fill="${dark(dish, 0.2)}"/>
      <path d="M14 58 h92 l-6 38 c-1 6 -5 10 -11 10 h-58 c-6 0 -10 -4 -11 -10 z" fill="${dish}"/>
      <path d="M20 84 h80" stroke="#fff" stroke-width="2" opacity=".25"/>
      <ellipse cx="60" cy="58" rx="47" ry="17" fill="${dark(dish, 0.18)}"/>
      <ellipse cx="60" cy="57" rx="43" ry="14" fill="${c}"/>
      <ellipse cx="46" cy="53" rx="14" ry="3.5" fill="#fff" opacity=".2"/>
      ${spots}${peaks}${layers}${badge(e.find(isEmoji), 96, 92)}`;
  },

  skillet([sauce = '#c8402a', item = '#8a5230'], e) {
    const words = e.filter((w) => !isEmoji(w));
    return `${SHADOW}
      <rect x="92" y="60" width="28" height="9" rx="4.5" fill="#3a3330" transform="rotate(-8 92 64)"/>
      <ellipse cx="54" cy="70" rx="46" ry="26" fill="#2f2926"/>
      <ellipse cx="54" cy="66" rx="46" ry="25" fill="#48403b"/>
      <ellipse cx="54" cy="66" rx="39" ry="19" fill="${sauce}"/>
      <ellipse cx="44" cy="60" rx="14" ry="4" fill="#fff" opacity=".14"/>
      ${garnish(words.length ? words : ['balls'], 54, 66, 34, sauce, item)}${badge(e.find(isEmoji), 94, 92)}`;
  },

  plate([a = '#c98a3a', b = '#f0cf6a', sauce], e) {
    const words = e.filter((w) => !isEmoji(w));
    const items: string[] = [];
    const shape = (w: string, color: string, x: number, y: number) => {
      switch (w) {
        case 'patty':
          return `<ellipse cx="${x}" cy="${y + 3}" rx="17" ry="10" fill="${dark(color, 0.2)}"/><ellipse cx="${x}" cy="${y}" rx="17" ry="10" fill="${color}"/><ellipse cx="${x - 5}" cy="${y - 3}" rx="6" ry="2.5" fill="#fff" opacity=".2"/>`;
        case 'cutlet':
          return `<path d="M${x - 22} ${y} c0 -12 40 -16 44 -2 c2 10 -40 16 -44 2 z" fill="${dark(color, 0.18)}" transform="translate(0 3)"/><path d="M${x - 22} ${y} c0 -12 40 -16 44 -2 c2 10 -40 16 -44 2 z" fill="${color}"/>`;
        case 'potatoes':
          return [[-8, 0], [6, -4], [4, 7]].map(([dx, dy]) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="8" ry="6" fill="${color}"/><ellipse cx="${x + dx - 2}" cy="${y + dy - 2}" rx="3" ry="1.5" fill="#fff" opacity=".3"/>`).join('') + `<path d="M${x - 10} ${y - 6} l3 -2 M${x + 6} ${y - 8} l3 -2" stroke="#4f8a2c" stroke-width="1.8"/>`;
        case 'dumplings':
          return [[-11, 0], [11, 2]].map(([dx, dy]) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="13" ry="9" fill="${color}" stroke="${dark(color, 0.25)}" stroke-width="1.5"/><ellipse cx="${x + dx - 3}" cy="${y + dy - 3}" rx="4" ry="2" fill="#fff" opacity=".35"/>`).join('');
        case 'sticks':
          return [0, 1, 2, 3].map((i) => `<rect x="${x - 18 + i * 9}" y="${y - 12 + (i % 2) * 4}" width="7" height="24" rx="3" fill="${color}" stroke="${dark(color, 0.2)}" stroke-width="1" transform="rotate(${-12 + i * 8} ${x} ${y})"/>`).join('');
        case 'rolls':
          return [-1, 0, 1].map((i) => `<rect x="${x - 20}" y="${y - 6 + i * 10}" width="40" height="11" rx="5.5" fill="${color}" stroke="${dark(color, 0.18)}" stroke-width="1"/>`).join('');
        case 'rounds':
          return [[-10, -3], [9, -4], [0, 7]].map(([dx, dy]) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="11" ry="7" fill="${color}"/><ellipse cx="${x + dx}" cy="${y + dy}" rx="7" ry="4" fill="${dark(color, 0.12)}" opacity=".6"/>`).join('');
        case 'nuggets':
          return [[-12, -2], [2, -6], [12, 4], [-2, 7]].map(([dx, dy]) => `<rect x="${x + dx - 7}" y="${y + dy - 5}" width="14" height="10" rx="5" fill="${color}"/>`).join('');
        case 'slices':
          return [-14, 0, 14].map((dx, i) => `<ellipse cx="${x + dx}" cy="${y + (i % 2) * 3}" rx="9" ry="6" fill="${i % 2 ? '#fbf8ef' : color}" stroke="${i % 2 ? '#e3dcc8' : dark(color, 0.2)}" stroke-width="1"/>`).join('');
        case 'fish':
          return `<path d="M${x - 20} ${y} q20 -14 36 0 l8 -7 v14 l-8 -7 q-16 14 -36 0 z" fill="${color}"/><circle cx="${x - 12}" cy="${y - 2}" r="1.6" fill="#333"/>`;
        case 'omelette':
          return `<path d="M${x - 24} ${y + 4} c0 -20 48 -20 48 0 z" fill="${color}"/><path d="M${x - 24} ${y + 4} h48" stroke="${dark(color, 0.2)}" stroke-width="2"/>`;
        case 'wedges':
          return [[-12, 0, -8], [10, -2, 12]].map(([dx, dy, r]) => `<path d="M${x + dx - 12} ${y + dy + 8} l12 -18 l12 18 z" fill="${color}" stroke="${dark(color, 0.2)}" stroke-width="1.2" transform="rotate(${r} ${x + dx} ${y + dy})"/>`).join('');
        case 'cubes':
          return [[-12, -3], [0, -6], [12, -2], [-6, 6], [7, 6]].map(([dx, dy]) => `<rect x="${x + dx - 5}" y="${y + dy - 5}" width="10" height="10" rx="2.5" fill="${color}"/>`).join('');
        case 'salmon':
          return [0, 1, 2].map((i) => `<path d="M${x - 20 + i * 6} ${y - 8 + i * 6} q14 -6 28 0 q-14 6 -28 0 z" fill="${color}" stroke="${light(color, 0.4)}" stroke-width="1.2"/>`).join('');
        default:
          return '';
      }
    };
    const kinds = words.filter((w) => !['sauce', 'dip', 'lemon', 'herbs'].includes(w));
    if (kinds[0]) items.push(shape(kinds[0], a, kinds[1] ? 46 : 60, 64));
    if (kinds[1]) items.push(shape(kinds[1], b, 76, 66));
    const sauceBlob = sauce ? `<ellipse cx="${kinds[1] ? 62 : 74}" cy="${kinds[1] ? 76 : 74}" rx="12" ry="6" fill="${sauce}"/>` : '';
    const dip = words.includes('dip') ? `<ellipse cx="86" cy="54" rx="11" ry="5" fill="#e9e3d8"/><ellipse cx="86" cy="53" rx="8" ry="3.5" fill="${sauce ?? '#c8402a'}"/>` : '';
    const lemon = words.includes('lemon') ? `<path d="M80 74 a9 9 0 0 1 16 0 z" fill="#f7dc4a" stroke="#e9c21f" stroke-width="1.5"/>` : '';
    const herbs = words.includes('herbs') ? garnish(['dill'], 60, 60, 30, a) : '';
    return `${SHADOW}
      <ellipse cx="60" cy="70" rx="52" ry="28" fill="#e7e1d8"/>
      <ellipse cx="60" cy="67" rx="52" ry="28" fill="#fbf9f5"/>
      <ellipse cx="60" cy="67" rx="38" ry="19" fill="#f2eee7"/><ellipse cx="60" cy="67" rx="47" ry="24.5" fill="none" stroke="#b9c9dd" stroke-width="2" opacity=".8"/>
      ${sauceBlob}${items.join('')}${dip}${lemon}${herbs}${badge(e.find(isEmoji), 96, 92)}`;
  },

  roast([c = '#b8662e'], e) {
    return `${SHADOW}
      <ellipse cx="60" cy="74" rx="52" ry="24" fill="#e7e1d8"/>
      <ellipse cx="60" cy="71" rx="52" ry="24" fill="#fbf9f5"/>
      <path d="M30 70 c0 -24 60 -30 64 -6 c2 14 -16 20 -34 20 s-30 -2 -30 -14 z" fill="${dark(c, 0.18)}"/>
      <path d="M30 66 c0 -24 60 -30 64 -6 c2 14 -16 18 -34 18 s-30 -2 -30 -12 z" fill="${c}"/>
      <path d="M40 54 c8 -8 26 -10 36 -4" stroke="${light(c, 0.35)}" stroke-width="5" stroke-linecap="round" fill="none" opacity=".7"/>
      <path d="M44 62 l6 -6 M56 60 l6 -6 M68 60 l6 -6" stroke="${dark(c, 0.3)}" stroke-width="2.5" stroke-linecap="round"/>
      ${e.includes('apples') ? '<circle cx="24" cy="76" r="8" fill="#d8452f"/><circle cx="96" cy="78" r="8" fill="#e9b33a"/><circle cx="86" cy="86" r="7" fill="#d8452f"/>' : ''}
      ${e.includes('herbs') ? garnish(['dill'], 60, 80, 40, c) : ''}${badge(e.find(isEmoji), 96, 92)}`;
  },

  sweets([c = '#5a3020', a2], e) {
    const words = e.filter((w) => !isEmoji(w));
    const pos = [[40, 70], [80, 70], [60, 56]];
    const one = (x: number, y: number) => {
      if (words.includes('egg')) return `<ellipse cx="${x}" cy="${y}" rx="13" ry="17" fill="${c}"/><ellipse cx="${x - 4}" cy="${y - 6}" rx="4" ry="6" fill="#fff" opacity=".25"/><path d="M${x - 8} ${y + 2} q4 -6 8 0 t8 0" stroke="${light(c, 0.4)}" stroke-width="1.6" fill="none"/>`;
      if (words.includes('star')) return `<path d="M${x} ${y - 16} l4.7 9.6 10.5 1.5 -7.6 7.4 1.8 10.5 -9.4 -5 -9.4 5 1.8 -10.5 -7.6 -7.4 10.5 -1.5 z" fill="${c}"/><path d="M${x} ${y - 10} l3 6 6.5 1 -4.7 4.6 1.1 6.5 -5.9 -3.1" stroke="#fff" stroke-width="1.6" fill="none"/>`;
      if (words.includes('walnut')) return `<ellipse cx="${x}" cy="${y}" rx="14" ry="12" fill="${c}"/><path d="M${x} ${y - 12} v24" stroke="${dark(c, 0.3)}" stroke-width="2"/><path d="M${x - 9} ${y - 5} q4 3 0 6 M${x + 9} ${y - 5} q-4 3 0 6" stroke="${dark(c, 0.3)}" stroke-width="1.5" fill="none"/>`;
      if (words.includes('oval')) return `<ellipse cx="${x}" cy="${y}" rx="16" ry="11" fill="${c}"/>${Array.from({ length: 5 }, (_, i) => `<circle cx="${x - 9 + i * 4.5}" cy="${y - 3 + (i % 2) * 5}" r="1.2" fill="${dark(c, 0.35)}"/>`).join('')}<ellipse cx="${x - 4}" cy="${y - 5}" rx="5" ry="2" fill="#fff" opacity=".2"/>`;
      return `<circle cx="${x}" cy="${y}" r="13" fill="${c}"/>${Array.from({ length: 7 }, (_, i) => `<rect x="${x - 9 + ((i * 7) % 18)}" y="${y - 9 + ((i * 5) % 16)}" width="3.5" height="1.6" rx=".8" fill="${['#f6c445', '#e35d6a', '#6fc3df', '#fff'][i % 4]}" transform="rotate(${i * 30} ${x} ${y})"/>`).join('')}`;
    };
    return `${SHADOW}
      <ellipse cx="60" cy="74" rx="50" ry="24" fill="#e7e1d8"/>
      <ellipse cx="60" cy="71" rx="50" ry="24" fill="${a2 ?? '#fbf9f5'}"/>
      ${pos.map(([x, y]) => one(x, y)).join('')}${badge(e.find(isEmoji), 96, 92)}`;
  },

  flatbread([base = '#e3a857', top = '#c8402a', a3], e) {
    const words = e.filter((w) => !isEmoji(w));
    if (words.includes('toast')) {
      return `${SHADOW}
        <path d="M24 54 q0 -22 22 -22 h28 q22 0 22 22 v44 h-72 z" fill="${dark(base, 0.12)}" transform="translate(0 4)"/>
        <path d="M24 54 q0 -22 22 -22 h28 q22 0 22 22 v44 h-72 z" fill="${base}"/>
        <path d="M30 56 q0 -16 18 -16 h24 q18 0 18 16 v36 h-60 z" fill="${light(base, 0.35)}"/>
        <path d="M32 58 q0 -14 16 -14 h24 q16 0 16 14 v32 h-56 z" fill="${top}" opacity=".95"/>
        ${a3 ? `<path d="M36 70 q12 -8 24 0 t24 0" stroke="${a3}" stroke-width="6" fill="none" stroke-linecap="round"/>` : ''}
        ${words.includes('egg') ? '<ellipse cx="60" cy="66" rx="14" ry="10" fill="#fffdf6"/><circle cx="60" cy="66" r="5.5" fill="#f6a71c"/>' : ''}
        ${words.includes('herbs') ? garnish(['dill'], 60, 70, 24, top) : ''}${badge(e.find(isEmoji), 94, 94)}`;
    }
    const boat = words.includes('boat');
    const outline = boat ? `M12 64 C30 34 90 34 108 64 C90 94 30 94 12 64 Z` : `M16 64 c0 -18 20 -28 44 -28 s44 10 44 28 s-20 28 -44 28 s-44 -10 -44 -28 z`;
    const inner = boat ? `M30 64 C42 48 78 48 90 64 C78 80 42 80 30 64 Z` : `M26 64 c0 -12 16 -20 34 -20 s34 8 34 20 s-16 20 -34 20 s-34 -8 -34 -20 z`;
    return `${SHADOW}
      <path d="${outline}" fill="${dark(base, 0.15)}" transform="translate(0 4)"/>
      <path d="${outline}" fill="${base}"/>
      <path d="${inner}" fill="${top}"/>
      ${a3 ? `<path d="${inner}" fill="${a3}" transform="translate(60 64) scale(.6) translate(-60 -64)"/>` : ''}
      ${words.includes('yolk') ? '<circle cx="60" cy="64" r="8" fill="#f6a71c"/><circle cx="57" cy="61" r="2.5" fill="#fff" opacity=".4"/><rect x="66" y="68" width="8" height="6" rx="1.5" fill="#fbe07a"/>' : ''}
      ${words.includes('dimples') ? Array.from({ length: 10 }, (_, i) => `<circle cx="${32 + ((i * 17) % 56)}" cy="${54 + ((i * 7) % 20)}" r="2.4" fill="${dark(base, 0.25)}"/>`).join('') : ''}
      ${words.includes('herbs') ? garnish(['dill'], 60, 64, 30, top) : ''}
      ${words.includes('lines') ? '<path d="M34 58 q12 8 26 0 t26 0 M34 68 q12 8 26 0 t26 0" stroke="#fffaf0" stroke-width="2" fill="none"/>' : ''}
      ${badge(e.find(isEmoji), 96, 92)}`;
  },

  wheel([c = '#f2c230'], e) {
    return `${SHADOW}
      <path d="M18 56 v28 c0 10 19 18 42 18 s42 -8 42 -18 v-28 z" fill="${dark(c, 0.15)}"/>
      <ellipse cx="60" cy="56" rx="42" ry="18" fill="${c}"/>
      <path d="M60 56 L96 46 A42 18 0 0 1 102 56 Z" fill="${light(c, 0.2)}"/>
      ${Array.from({ length: 14 }, (_, i) => `<ellipse cx="${30 + ((i * 17) % 60)}" cy="${48 + ((i * 7) % 16)}" rx="2.2" ry="1" fill="${dark(c, 0.55)}" transform="rotate(${i * 25} ${30 + ((i * 17) % 60)} ${48 + ((i * 7) % 16)})"/>`).join('')}
      ${badge(e.find(isEmoji), 96, 92)}`;
  },

  ramekin([top = '#c8842a', body = '#f6efe2'], e) {
    return `${SHADOW}
      <path d="M22 56 h76 v30 c0 10 -17 18 -38 18 s-38 -8 -38 -18 z" fill="#ffffff"/>
      ${Array.from({ length: 9 }, (_, i) => `<path d="M${26 + i * 8.5} 58 v36" stroke="#e8e2d8" stroke-width="3"/>`).join('')}
      <ellipse cx="60" cy="56" rx="38" ry="12" fill="#efe9df"/>
      <ellipse cx="60" cy="56" rx="33" ry="9.5" fill="${body}"/>
      <ellipse cx="60" cy="55.5" rx="31" ry="8.5" fill="${top}"/>
      <path d="M40 54 l8 3 l6 -4 l10 3 l8 -3" stroke="${light(top, 0.4)}" stroke-width="2" fill="none" opacity=".7"/>
      ${badge(e.find(isEmoji), 94, 88)}`;
  },
};

/** Complete <svg> markup for a recipe icon, or '' if the spec is invalid. */
export function dishIconSvg(spec: IconSpec | null, label = ''): string {
  if (!spec) return '';
  const body = DRAW[spec.icon]?.(spec.colors, spec.extra);
  if (!body) return '';
  const title = label.replace(/[<>&"]/g, '');
  return `<svg class="dish-icon" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">${body}</svg>`;
}
