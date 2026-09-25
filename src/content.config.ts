import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** The CMS may save empty optional fields as '' or null. Treat both as "not set". */
const empty = (v: unknown) => (v === '' || v === null ? undefined : v);
const optString = z.preprocess(empty, z.string().optional());
const optNumber = z.preprocess(empty, z.coerce.number().optional());

/** Name and description in English, Russian and Lithuanian. Missing ones fall back to Latvian. */
const nameTranslations = z.preprocess(
  empty,
  z
    .object({
      en: z.object({ name: optString, description: optString, region: optString }).optional(),
      ru: z.object({ name: optString, description: optString, region: optString }).optional(),
      lt: z.object({ name: optString, description: optString, region: optString }).optional(),
    })
    .optional(),
);

const cuisines = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/cuisines' }),
  schema: z.object({
    name: z.string(),
    continent: z.enum(['Eiropa', 'Āzija', 'Tuvie Austrumi un Āfrika', 'Amerika']).default('Eiropa'),
    region: optString,
    emoji: z.string(),
    color: z.string().default('#9e3039'),
    description: z.string(),
    order: z.coerce.number().default(100),
    translations: nameTranslations,
  }),
});

const categories = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/categories' }),
  schema: z.object({
    name: z.string(),
    emoji: z.string(),
    color: z.string().default('#c8773a'),
    description: z.string(),
    order: z.coerce.number().default(100),
    translations: nameTranslations,
  }),
});

/** Special occasions ("Svētku galds") with a rule for when they happen each year. */
const svetki = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/svetki' }),
  schema: z.object({
    name: z.string(),
    emoji: z.string(),
    color: z.string().default('#9e3039'),
    description: z.string(),
    /** fiksets = same date every year, lieldienas = days relative to Easter, nedelas-diena = e.g. 2nd Sunday of May, nav = any day. */
    dateType: z.enum(['fiksets', 'lieldienas', 'nedelas-diena', 'nav']).default('fiksets'),
    month: optNumber,
    day: optNumber,
    easterOffset: optNumber,
    weekday: optNumber,
    nth: optNumber,
    /** How many days before the occasion the site starts suggesting its recipes. */
    leadDays: z.coerce.number().default(14),
    order: z.coerce.number().default(100),
    translations: nameTranslations,
  }),
});

const recipes = defineCollection({
  // Translations live next to the recipe as name.en.md, name.ru.md, name.lt.md.
  loader: glob({ pattern: ['**/*.md', '!**/*.*.md'], base: './src/content/recipes' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    cuisine: reference('cuisines'),
    category: reference('categories'),
    image: optString,
    emoji: optString,
    icon: optString,
    iconColors: optString,
    iconExtra: optString,
    prepTime: z.coerce.number().default(0),
    cookTime: z.coerce.number().default(0),
    servings: z.coerce.number().default(4),
    yield: optString,
    difficulty: z.enum(['viegli', 'vidēji', 'sarežģīti']).default('viegli'),
    ingredients: z
      .array(
        z.object({
          group: optString,
          amount: optNumber,
          unit: optString,
          name: z.string(),
        }),
      )
      .default([]),
    steps: z.array(z.string()).default([]),
    tips: z.preprocess(empty, z.array(z.string()).default([])),
    tags: z.preprocess(empty, z.array(z.string()).default([])),
    occasions: z.preprocess(empty, z.array(reference('svetki')).default([])),
    featured: z.boolean().default(false),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

/**
 * Recipe translations (recipe-id.en.md and so on). Only the text is translated: amounts, times and
 * everything else come from the Latvian recipe. Ingredient names missing here fall back to the
 * shared dictionary in src/i18n/data, then to Latvian.
 */
const recipeTranslations = defineCollection({
  loader: glob({
    pattern: '**/*.{en,ru,lt}.md',
    base: './src/content/recipes',
    generateId: ({ entry }) => entry.replace(/.md$/, ''),
  }),
  schema: z.object({
    title: optString,
    description: optString,
    yield: optString,
    ingredients: z.preprocess(empty, z.array(z.looseObject({ name: optString, group: optString })).default([])),
    steps: z.preprocess(empty, z.array(z.string()).default([])),
    tips: z.preprocess(empty, z.array(z.string()).default([])),
  }),
});

export const collections = { cuisines, categories, svetki, recipes, recipeTranslations };
