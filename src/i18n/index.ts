// Server-side translation helpers. Browser scripts use ./client instead (it only ships one language).
import { UI, type UIKey } from './ui';
import { fill, pickForm, type Lang } from './core';

export * from './core';

/** Translate an interface string. `{name}` placeholders are filled from `vars`. */
export function t(lang: Lang, key: UIKey, vars?: Record<string, string | number>): string {
  return fill(UI[lang][key] ?? UI.lv[key] ?? key, vars);
}

/** "5 receptes", "21 рецепт", "3 receptai": the number with a correctly declined word. */
export function count(lang: Lang, n: number, key: UIKey): string {
  return `${n} ${pickForm(lang, n, t(lang, key))}`;
}

/** Dictionary subset for browser scripts: only the key groups they use. */
const CLIENT_PREFIXES = ['timer.', 'fav.', 'cal.', 'amount.', 'share.', 'cook.', 'fridge.', 'tinder.', 'count.', 'diff.', 'common.'];
export function clientDict(lang: Lang): Partial<Record<UIKey, string>> {
  const out: Partial<Record<UIKey, string>> = {};
  for (const key of Object.keys(UI.lv) as UIKey[]) {
    if (CLIENT_PREFIXES.some((p) => key.startsWith(p))) out[key] = UI[lang][key] ?? UI.lv[key];
  }
  return out;
}

export { UI };
export type { UIKey };
