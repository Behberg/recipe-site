// Shared dictionaries for recipe data: ingredient names, ingredient groups, tags and fridge products.
// Each entry is [English, Russian, Lithuanian]. Missing entries fall back to Latvian.
import ingredients from './data/ingredients.json';
import terms from './data/terms.json';
import pantry from './data/pantry.json';
import type { Lang } from './core';

type Dict = Record<string, string[]>;
const COL: Record<Exclude<Lang, 'lv'>, number> = { en: 0, ru: 1, lt: 2 };

const lookup = (dict: Dict, lang: Lang, lv: string) => (lang === 'lv' ? lv : dict[lv]?.[COL[lang]] || lv);

export const trIngredient = (lang: Lang, lv: string) => lookup(ingredients as Dict, lang, lv);
export const trGroup = (lang: Lang, lv: string) => lookup(terms.groups as Dict, lang, lv);
export const trTag = (lang: Lang, lv: string) => lookup(terms.tags as Dict, lang, lv);
export const trPantryGroup = (lang: Lang, id: string, lv: string) => (lang === 'lv' ? lv : (pantry.groups as Dict)[id]?.[COL[lang]] || lv);
export const trPantryItem = (lang: Lang, id: string, lv: string) => (lang === 'lv' ? lv : (pantry.items as Dict)[id]?.[COL[lang]] || lv);
