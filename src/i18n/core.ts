// Languages, URLs and plural rules. No dictionaries here, so browser scripts can import it cheaply.

export const LANGS = ['lv', 'en', 'ru', 'lt'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'lv';
/** Languages that live under a URL prefix (/en/, /ru/, /lt/). Latvian is at the root. */
export const PREFIXED_LANGS = LANGS.filter((l) => l !== DEFAULT_LANG) as Exclude<Lang, 'lv'>[];

export const LANG_META: Record<Lang, { label: string; name: string; ogLocale: string }> = {
  lv: { label: 'LV', name: 'Latviešu', ogLocale: 'lv_LV' },
  en: { label: 'EN', name: 'English', ogLocale: 'en_GB' },
  ru: { label: 'RU', name: 'Русский', ogLocale: 'ru_RU' },
  lt: { label: 'LT', name: 'Lietuvių', ogLocale: 'lt_LT' },
};

export const isLang = (x: unknown): x is Lang => typeof x === 'string' && (LANGS as readonly string[]).includes(x);

/** The language of a path: "/en/receptes/" is "en", "/receptes/" is "lv". */
export function langFromPath(pathname: string): Lang {
  const first = pathname.split('/')[1];
  return isLang(first) && first !== DEFAULT_LANG ? first : DEFAULT_LANG;
}

/** Path without its language prefix: "/ru/recepte/x/" becomes "/recepte/x/". */
export function stripLang(pathname: string): string {
  const lang = langFromPath(pathname);
  return lang === DEFAULT_LANG ? pathname : pathname.slice(lang.length + 1) || '/';
}

/** Prefix a site path for a language: ("/receptes/", "en") becomes "/en/receptes/". */
export function href(lang: Lang, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return lang === DEFAULT_LANG ? clean : `/${lang}${clean}`;
}

/** getStaticPaths entries for every language: Latvian has no prefix, the rest do. */
export const langParam = (lang: Lang) => (lang === DEFAULT_LANG ? undefined : lang);

/**
 * Plural category for a count.
 * lv: 1, 21, 31 are "one"; everything else "many" (0 receptes, 2 receptes, 11 receptes)
 * en: 1 is "one"; else "many"
 * ru: 1, 21 "one"; 2 to 4, 22 to 24 "few"; else "many"
 * lt: 1, 21 "one"; 2 to 9, 22 to 29 "few"; 0, 10 to 20, 30 "many"
 * Fractions: ru and lt use the genitive singular ("few"), lv and en the plural.
 */
export function pluralCategory(lang: Lang, n: number): 'one' | 'few' | 'many' {
  if (!Number.isInteger(n)) return lang === 'lt' || lang === 'ru' ? 'few' : 'many';
  const i = Math.abs(n);
  const m10 = i % 10;
  const m100 = i % 100;
  switch (lang) {
    case 'en':
      return i === 1 ? 'one' : 'many';
    case 'ru':
      if (m10 === 1 && m100 !== 11) return 'one';
      if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return 'few';
      return 'many';
    case 'lt':
      if (m100 >= 11 && m100 <= 19) return 'many';
      if (m10 === 1) return 'one';
      if (m10 >= 2) return 'few';
      return 'many';
    default:
      return m10 === 1 && m100 !== 11 ? 'one' : 'many';
  }
}

/** Pick a form from "one|few|many" (two forms mean "one|many"). */
export function pickForm(lang: Lang, n: number, forms: string): string {
  const parts = forms.split('|');
  if (parts.length === 1) return parts[0];
  const [one, few, many] = parts.length === 2 ? [parts[0], parts[1], parts[1]] : parts;
  const c = pluralCategory(lang, n);
  return c === 'one' ? one : c === 'few' ? few : many;
}

/** Fill `{name}` placeholders. */
export function fill(s: string, vars?: Record<string, string | number>): string {
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

/** getStaticPaths for pages that exist once per language. */
export const langPaths = () => LANGS.map((lang) => ({ params: { lang: langParam(lang) } }));
