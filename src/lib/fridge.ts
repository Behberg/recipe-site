// "Kas ir ledusskapī?" ingredient matching.
//
// Every recipe ingredient line is turned into requirements. A requirement is a set of pantry
// item ids where any one of them is enough ("sviests vai eļļa"). Lines without an amount
// ("sāls pēc garšas") and garnishes ("... pasniegšanai") are optional and never required.
// Matching runs at build time; the browser only compares sets of ids.

export interface PantryItem {
  id: string;
  name: string;
  emoji: string;
  group: string;
  staple?: boolean;
  match: string[];
}

export interface PantryGroup {
  id: string;
  name: string;
  emoji: string;
}

export interface Pantry {
  groups: PantryGroup[];
  items: PantryItem[];
}

interface IngredientLine {
  name: string;
  amount?: number;
}

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

const tokens = (s: string) => normalize(s).split(/[^a-z0-9]+/).filter(Boolean);

interface Pattern {
  item: string;
  words: { text: string; exact: boolean }[];
  weight: number;
}

function compile(pantry: Pantry): Pattern[] {
  return pantry.items.flatMap((item) =>
    item.match.map((m) => {
      const words = normalize(m)
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => ({ text: w.replace(/\$$/, ''), exact: w.endsWith('$') }));
      return { item: item.id, words, weight: words.reduce((n, w) => n + w.text.length, 0) + words.length - 1 };
    }),
  );
}

/** The pantry item that best describes a piece of text (longest matching pattern wins). */
function bestMatch(text: string, patterns: Pattern[]): string | null {
  const t = tokens(text);
  let best: Pattern | null = null;
  for (const p of patterns) {
    if (best && p.weight <= best.weight) continue;
    for (let i = 0; i + p.words.length <= t.length; i++) {
      const ok = p.words.every((w, j) => (w.exact ? t[i + j] === w.text : t[i + j].startsWith(w.text)));
      if (ok) {
        best = p;
        break;
      }
    }
  }
  return best?.item ?? null;
}

const OPTIONAL = /pasniegšanai|rotāšanai|pēc garšas/i;

export interface MatchResult {
  /** Each entry: any one of these pantry ids satisfies it. */
  requirements: string[][];
  /** Text we could not map to the pantry (ignored when matching, reported in dev). */
  unknown: string[];
}

export function createMatcher(pantry: Pantry) {
  const patterns = compile(pantry);

  return function matchIngredients(lines: IngredientLine[]): MatchResult {
    const requirements: string[][] = [];
    const unknown: string[] = [];
    const seen = new Set<string>();

    for (const line of lines) {
      if (line.amount == null || OPTIONAL.test(line.name)) continue;

      // "(upenes, jāņogas, ķirši)" lists alternatives, other brackets are just notes.
      const extraAlternatives: string[] = [];
      const base = line.name.replace(/\(([^)]*)\)/g, (_, inner: string) => {
        if (inner.includes(',')) extraAlternatives.push(...inner.split(/,| vai /));
        return ' ';
      });

      const parts = base.split(/,| un /).map((s) => s.trim()).filter(Boolean);
      parts.forEach((part, index) => {
        const alternatives = part.split(/ vai /);
        if (index === 0) alternatives.push(...extraAlternatives);
        const ids = [...new Set(alternatives.map((a) => bestMatch(a, patterns)).filter((x): x is string => !!x))];
        if (!ids.length) {
          unknown.push(part);
          return;
        }
        const key = [...ids].sort().join('|');
        if (!seen.has(key)) {
          seen.add(key);
          requirements.push(ids);
        }
      });
    }
    return { requirements, unknown };
  };
}
