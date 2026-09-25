import { getCollection, type CollectionEntry } from 'astro:content';
export { formatMinutes, plural, formatAmount } from './format';

export type Recipe = CollectionEntry<'recipes'>;
export type Cuisine = CollectionEntry<'cuisines'>;
export type Category = CollectionEntry<'categories'>;
export type Occasion = CollectionEntry<'svetki'>;

/** Published recipes, newest first. Drafts are visible only in `npm run dev`. */
export async function getRecipes(): Promise<Recipe[]> {
  const all = await getCollection('recipes', ({ data }) => import.meta.env.DEV || !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getCuisines(): Promise<Cuisine[]> {
  return (await getCollection('cuisines')).sort((a, b) => a.data.order - b.data.order);
}

export async function getCategories(): Promise<Category[]> {
  return (await getCollection('categories')).sort((a, b) => a.data.order - b.data.order);
}

export async function getOccasions(): Promise<Occasion[]> {
  return (await getCollection('svetki')).sort((a, b) => a.data.order - b.data.order);
}

/** Loads everything the recipe cards need in one go. */
export async function getCatalog() {
  const [recipes, cuisines, categories] = await Promise.all([getRecipes(), getCuisines(), getCategories()]);
  const cuisineById = new Map(cuisines.map((c) => [c.id, c]));
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  return { recipes, cuisines, categories, cuisineById, categoryById };
}

export const totalTime = (r: Recipe) => r.data.prepTime + r.data.cookTime;

export const recipeUrl = (id: string) => `/recepte/${id}/`;
export const cuisineUrl = (id: string) => `/virtuves/${id}/`;
export const categoryUrl = (id: string) => `/kategorijas/${id}/`;
export const occasionUrl = (id: string) => `/svetki/${id}/`;

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
