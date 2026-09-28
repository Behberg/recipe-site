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
    // Optional: everyday dishes that belong to no particular country have no cuisine.
    cuisine: z.preprocess(empty, reference('cuisines').optional()),
    category: reference('categories'),
    image: optString,
    // Credit for a photo taken from an open licence source (Wikimedia Commons and similar).
    imageAuthor: optString,
    imageLicense: optString,
    imageLicenseUrl: optString,
    imageSource: optString,
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

/**
 * Personality quizzes ("Kāda maize esi tu?"). One file per quiz: the scoring structure plus the text
 * in every language. Each answer gives points to one or more results; the highest total wins.
 */
const quizText = z.object({
  title: z.string(),
  /** One line under the title that sells the quiz. */
  hook: z.string(),
  /** A short paragraph for search engines and curious readers. */
  intro: z.string(),
  /** How a result is announced and shared, with {name}: "Es esmu {name}". */
  resultLine: z.string(),
  questions: z.array(z.object({ q: z.string(), a: z.array(z.string()) })),
  results: z.record(
    z.string(),
    z.object({ name: z.string(), tagline: z.string(), description: z.string(), traits: z.array(z.string()) }),
  ),
});

const quizzes = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/quizzes' }),
  schema: z
    .object({
      order: z.coerce.number().default(100),
      emoji: z.string(),
      color: z.string(),
      results: z.record(
        z.string(),
        z.object({
          emoji: z.string(),
          color: z.string(),
          /** Another result of this quiz that goes well with this one ("tavs ideālais pāris"). */
          match: z.string(),
          /** Recipe ids shown with the result. The first one lends its illustration unless `icon` is set. */
          recipes: z.array(z.string()).min(1),
          cuisine: optString,
          /** The name starts with a proper noun ("Jāņu siers"), so it keeps its capital inside a sentence. */
          properName: z.boolean().default(false),
          icon: optString,
          iconColors: optString,
          iconExtra: optString,
        }),
      ),
      questions: z.array(
        z.object({
          answers: z.array(z.object({ emoji: z.string(), scores: z.record(z.string(), z.number()) })).min(2),
        }),
      ),
      text: z.object({ lv: quizText, en: quizText, ru: quizText, lt: quizText }),
    })
    .superRefine((q, ctx) => {
      const ids = Object.keys(q.results);
      const issue = (message: string) => ctx.addIssue({ code: 'custom', message });
      for (const [id, r] of Object.entries(q.results)) if (!ids.includes(r.match)) issue(`${id}: unknown match "${r.match}"`);
      q.questions.forEach((qu, i) =>
        qu.answers.forEach((a, j) => {
          for (const id of Object.keys(a.scores)) if (!ids.includes(id)) issue(`question ${i + 1}, answer ${j + 1}: unknown result "${id}"`);
        }),
      );
      for (const [lang, tx] of Object.entries(q.text)) {
        if (tx.questions.length !== q.questions.length) issue(`${lang}: ${tx.questions.length} questions, expected ${q.questions.length}`);
        tx.questions.forEach((qu, i) => {
          const want = q.questions[i]?.answers.length;
          if (qu.a.length !== want) issue(`${lang}: question ${i + 1} has ${qu.a.length} answers, expected ${want}`);
        });
        for (const id of ids) if (!tx.results[id]) issue(`${lang}: missing text for result "${id}"`);
      }
    }),
});

export const collections = { cuisines, categories, svetki, recipes, recipeTranslations, quizzes };
