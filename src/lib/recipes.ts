import { getCollection, type CollectionEntry } from 'astro:content';
import { href, type Lang } from '../i18n/core';
import { trGroup, trIngredient, trTag } from '../i18n/data';
export { formatMinutes, formatAmount } from './format';

type RecipeEntry = CollectionEntry<'recipes'>;
type Translation = CollectionEntry<'recipeTranslations'>;

/**
 * A recipe with its text in one language. `data` holds the translated text (falling back to Latvian
 * field by field), `lv` keeps the original for logic that depends on Latvian values.
 */
export type Recipe = RecipeEntry & {
  lang: Lang;
  lv: RecipeEntry['data'];
  /** The entry whose Markdown body is shown as the story (the translation, or the Latvian recipe). */
  story: RecipeEntry | Translation;
  /** False when a non-Latvian page has to show (some) Latvian text. */
  translated: boolean;
};
export type Cuisine = CollectionEntry<'cuisines'>;
export type Category = CollectionEntry<'categories'>;
export type Occasion = CollectionEntry<'svetki'>;

// The build renders over a thousand pages and each needs the catalogue: load it once per language.
// In dev the cache is skipped so edits show up immediately.
const cache = new Map<string, Promise<unknown>>();
function memo<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!import.meta.env.PROD) return load();
  if (!cache.has(key)) cache.set(key, load());
  return cache.get(key) as Promise<T>;
}

async function getTranslations(): Promise<Map<string, Translation>> {
  return memo('translations', async () => new Map((await getCollection('recipeTranslations')).map((t) => [t.id, t])));
}

function localizeRecipe(r: RecipeEntry, lang: Lang, tr: Translation | undefined): Recipe {
  const d = r.data;
  if (lang === 'lv') return { ...r, lang, lv: d, story: r, translated: true };
  const t = tr?.data;
  const steps = t && t.steps.length === d.steps.length ? t.steps : d.steps;
  const tips = t && t.tips.length ? t.tips : d.tips;
  return {
    ...r,
    lang,
    lv: d,
    story: tr ?? r,
    translated: Boolean(t?.title && steps !== d.steps),
    data: {
      ...d,
      title: t?.title || d.title,
      description: t?.description || d.description,
      yield: d.yield ? t?.yield || d.yield : undefined,
      steps,
      tips,
      tags: d.tags.map((x) => trTag(lang, x)),
      ingredients: d.ingredients.map((ing, i) => ({
        ...ing,
        name: t?.ingredients[i]?.name || trIngredient(lang, ing.name),
        group: ing.group ? t?.ingredients[i]?.group || trGroup(lang, ing.group) : undefined,
      })),
    },
  };
}

/** Published recipes in a language, newest first. Drafts are visible only in `npm run dev`. */
export async function getRecipes(lang: Lang = 'lv'): Promise<Recipe[]> {
  return memo(`recipes:${lang}`, async () => {
    const [all, translations] = await Promise.all([
      getCollection('recipes', ({ data }) => import.meta.env.DEV || !data.draft),
      getTranslations(),
    ]);
    return all
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map((r) => localizeRecipe(r, lang, translations.get(`${r.id}.${lang}`)));
  });
}

type Named = { data: { name: string; description: string; region?: string; translations?: Partial<Record<string, { name?: string; description?: string; region?: string }>> } };
function localizeNamed<T extends Named>(e: T, lang: Lang): T {
  const tr = lang === 'lv' ? undefined : e.data.translations?.[lang];
  if (!tr) return e;
  return {
    ...e,
    data: { ...e.data, name: tr.name || e.data.name, description: tr.description || e.data.description, region: tr.region || e.data.region },
  };
}

export async function getCuisines(lang: Lang = 'lv'): Promise<Cuisine[]> {
  return memo(`cuisines:${lang}`, async () =>
    (await getCollection('cuisines')).sort((a, b) => a.data.order - b.data.order).map((c) => localizeNamed(c, lang)),
  );
}

export async function getCategories(lang: Lang = 'lv'): Promise<Category[]> {
  return memo(`categories:${lang}`, async () =>
    (await getCollection('categories')).sort((a, b) => a.data.order - b.data.order).map((c) => localizeNamed(c, lang)),
  );
}

export async function getOccasions(lang: Lang = 'lv'): Promise<Occasion[]> {
  return memo(`occasions:${lang}`, async () =>
    (await getCollection('svetki')).sort((a, b) => a.data.order - b.data.order).map((c) => localizeNamed(c, lang)),
  );
}

/** Loads everything the recipe cards need in one go. */
export async function getCatalog(lang: Lang = 'lv') {
  const [recipes, cuisines, categories] = await Promise.all([getRecipes(lang), getCuisines(lang), getCategories(lang)]);
  const cuisineById = new Map(cuisines.map((c) => [c.id, c]));
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  return { recipes, cuisines, categories, cuisineById, categoryById };
}

export const totalTime = (r: Recipe) => r.data.prepTime + r.data.cookTime;

export const recipeUrl = (id: string, lang: Lang = 'lv') => href(lang, `/recepte/${id}/`);
export const cuisineUrl = (id: string, lang: Lang = 'lv') => href(lang, `/virtuves/${id}/`);
export const categoryUrl = (id: string, lang: Lang = 'lv') => href(lang, `/kategorijas/${id}/`);
export const occasionUrl = (id: string, lang: Lang = 'lv') => href(lang, `/svetki/${id}/`);

/**
 * Image URL for photos uploaded through the admin panel. In production they are resized
 * and converted to modern formats on the fly by the Netlify Image CDN.
 */
export function imageUrl(src: string, width: number): string {
  if (!import.meta.env.PROD || /^https?:/.test(src)) return src;
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${width}&q=75`;
}

export function imageSrcset(src: string, widths = [400, 700, 1000, 1400]): string {
  if (!import.meta.env.PROD || /^https?:/.test(src)) return '';
  return widths.map((w) => `${imageUrl(src, w)} ${w}w`).join(', ');
}
