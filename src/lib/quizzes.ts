// Personality quizzes: data for one language, URLs and the scoring rule shared with the browser.
import { getCollection, type CollectionEntry } from 'astro:content';
import { href, type Lang } from '../i18n';
import { getRecipes } from './recipes';
import { parseIcon, type IconSpec } from './dishIcons';

type Entry = CollectionEntry<'quizzes'>;

export interface QuizResult {
  id: string;
  emoji: string;
  color: string;
  match: string;
  recipes: string[];
  cuisine?: string;
  properName: boolean;
  /** The illustration used on the result card and in share images. */
  icon: IconSpec | null;
  name: string;
  tagline: string;
  description: string;
  traits: string[];
}

export interface QuizAnswer {
  text: string;
  emoji: string;
  scores: Record<string, number>;
}

export interface Quiz {
  id: string;
  order: number;
  emoji: string;
  color: string;
  title: string;
  hook: string;
  intro: string;
  resultLine: string;
  questions: { q: string; answers: QuizAnswer[] }[];
  results: QuizResult[];
}

/** All quizzes in a language, in their display order. */
export async function getQuizzes(lang: Lang): Promise<Quiz[]> {
  const [entries, recipes] = await Promise.all([getCollection('quizzes'), getRecipes('lv')]);
  const recipeById = new Map(recipes.map((r) => [r.id, r]));
  return entries.map((e) => localize(e, lang, recipeById)).sort((a, b) => a.order - b.order);
}

function localize(e: Entry, lang: Lang, recipeById: Map<string, Awaited<ReturnType<typeof getRecipes>>[number]>): Quiz {
  const d = e.data;
  const tx = d.text[lang];
  const results = Object.entries(d.results).map(([id, r]) => {
    for (const rid of r.recipes) if (!recipeById.has(rid)) throw new Error(`Quiz ${e.id}, result ${id}: unknown recipe "${rid}"`);
    // The result's own drawing, or the first linked recipe that has one.
    const lent = r.recipes.map((rid) => recipeById.get(rid)!.data).find((x) => parseIcon(x.icon));
    const icon = r.icon ? parseIcon(r.icon, r.iconColors, r.iconExtra) : lent ? parseIcon(lent.icon, lent.iconColors, lent.iconExtra) : null;
    return { id, emoji: r.emoji, color: r.color, match: r.match, recipes: r.recipes, cuisine: r.cuisine, properName: r.properName, icon, ...tx.results[id] };
  });
  return {
    id: e.id,
    order: d.order,
    emoji: d.emoji,
    color: d.color,
    title: tx.title,
    hook: tx.hook,
    intro: tx.intro,
    resultLine: tx.resultLine,
    questions: tx.questions.map((q, i) => ({
      q: q.q,
      answers: q.a.map((text, j) => ({ text, emoji: d.questions[i].answers[j].emoji, scores: d.questions[i].answers[j].scores })),
    })),
    results,
  };
}

export const quizzesUrl = (lang: Lang) => href(lang, '/kvizi/');
export const quizUrl = (id: string, lang: Lang) => href(lang, `/kvizi/${id}/`);
export const quizResultUrl = (id: string, result: string, lang: Lang) => href(lang, `/kvizi/${id}/${result}/`);

export type QuizImageKind = 'og' | 'story';
/** Share images: a 1200x630 link preview and a 1080x1920 picture for Instagram and TikTok stories. */
export const QUIZ_IMAGE_SIZES: Record<QuizImageKind | 'cover', [number, number]> = {
  og: [1200, 630],
  story: [1080, 1920],
  cover: [1200, 630],
};
export const quizResultImage = (id: string, result: string, lang: Lang, kind: QuizImageKind) => `/img/kvizi/${id}/${result}-${lang}-${kind}.jpg`;
export const quizCoverImage = (id: string, lang: Lang) => `/img/kvizi/${id}/cover-${lang}.jpg`;

/**
 * "Es esmu bagete" with the result filled in. Names are written as titles ("Bagete"); inside a
 * Latvian, Russian or Lithuanian sentence a common noun is lowercase. English keeps the title
 * ("I got Baguette"), and so do names that start with a proper noun ("Jāņu siers").
 */
export function announceResult(quiz: Quiz, result: QuizResult, lang: Lang): string {
  const name = lang === 'en' || result.properName ? result.name : result.name.charAt(0).toLocaleLowerCase(lang) + result.name.slice(1);
  return quiz.resultLine.replace('{name}', name);
}
