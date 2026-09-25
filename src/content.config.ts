import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** The CMS may save empty optional fields as '' or null. Treat both as "not set". */
const empty = (v: unknown) => (v === '' || v === null ? undefined : v);
const optString = z.preprocess(empty, z.string().optional());
const optNumber = z.preprocess(empty, z.coerce.number().optional());

const cuisines = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/cuisines' }),
  schema: z.object({
    name: z.string(),
    region: optString,
    emoji: z.string(),
    color: z.string().default('#9e3039'),
    description: z.string(),
    order: z.coerce.number().default(100),
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
  }),
});

const recipes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/recipes' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    cuisine: reference('cuisines'),
    category: reference('categories'),
    image: optString,
    emoji: optString,
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

export const collections = { cuisines, categories, svetki, recipes };
