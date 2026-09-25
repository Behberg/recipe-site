// Translations in the browser. The page embeds its own language's strings in #i18n (see Base.astro).
import { DEFAULT_LANG, fill, href, isLang, pickForm, type Lang } from './core';
import type { UIKey } from './ui';

let dict: Partial<Record<UIKey, string>> | null = null;

export function pageLang(): Lang {
  const l = typeof document !== 'undefined' ? document.documentElement.lang : '';
  return isLang(l) ? l : DEFAULT_LANG;
}

export function ct(key: UIKey, vars?: Record<string, string | number>): string {
  if (!dict) {
    try {
      dict = JSON.parse(document.getElementById('i18n')?.textContent || '{}');
    } catch {
      dict = {};
    }
  }
  return fill(dict![key] ?? key, vars);
}

export const ccount = (n: number, key: UIKey) => `${n} ${pickForm(pageLang(), n, ct(key))}`;

/** A site path in the current page's language. */
export const chref = (path: string) => href(pageLang(), path);
