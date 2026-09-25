// Formatting helpers shared by server components and browser scripts (no astro:content imports here).

export function formatMinutes(min: number): string {
  if (!min) return '0 min';
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Latvian plural helper: 1 recepte, 2 receptes, 21 recepte, 11 receptes. */
export function plural(n: number, one: string, many: string): string {
  return n % 10 === 1 && n % 100 !== 11 ? one : many;
}

const FRACTIONS: [number, string][] = [
  [0.25, '¼'],
  [0.333, '⅓'],
  [0.5, '½'],
  [0.667, '⅔'],
  [0.75, '¾'],
];

/** 0.5 becomes ½, 1.25 becomes 1¼, 2.3 becomes 2,3 (Latvian decimal comma). */
export function formatAmount(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n >= 10) return String(Math.round(n));
  const whole = Math.floor(n);
  const frac = n - whole;
  if (frac < 0.05) return String(whole);
  if (frac > 0.95) return String(whole + 1);
  for (const [v, s] of FRACTIONS) if (Math.abs(frac - v) < 0.04) return (whole ? String(whole) : '') + s;
  return String(Math.round(n * 10) / 10).replace('.', ',');
}
