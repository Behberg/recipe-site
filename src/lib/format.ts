// Formatting helpers shared by server components and browser scripts (no astro:content imports here).
import { pickForm, type Lang } from '../i18n/core';

const TIME: Record<Lang, { h: string; m: string }> = {
  lv: { h: 'h', m: 'min' },
  en: { h: 'h', m: 'min' },
  ru: { h: 'ч', m: 'мин' },
  lt: { h: 'val.', m: 'min.' },
};

export function formatMinutes(min: number, lang: Lang = 'lv'): string {
  const u = TIME[lang];
  if (!min) return `0 ${u.m}`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} ${u.m}`;
  return m ? `${h} ${u.h} ${m} ${u.m}` : `${h} ${u.h}`;
}

const FRACTIONS: [number, string][] = [
  [0.25, '¼'],
  [0.333, '⅓'],
  [0.5, '½'],
  [0.667, '⅔'],
  [0.75, '¾'],
];

/** 0.5 becomes ½, 1.25 becomes 1¼, 2.3 becomes 2,3 (decimal comma everywhere except English). */
export function formatAmount(n: number, lang: Lang = 'lv'): string {
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n >= 10) return String(Math.round(n));
  const whole = Math.floor(n);
  const frac = n - whole;
  if (frac < 0.05) return String(whole);
  if (frac > 0.95) return String(whole + 1);
  for (const [v, s] of FRACTIONS) if (Math.abs(frac - v) < 0.04) return (whole ? String(whole) : '') + s;
  return decimal(Math.round(n * 10) / 10, lang);
}

export const decimal = (n: number, lang: Lang = 'lv') => {
  const s = String(Math.round(n * 100) / 100);
  return lang === 'en' ? s : s.replace('.', ',');
};

// Units are stored in Latvian in the recipes. Each one maps to its forms per language, "one|few|many".
// Written-out units agree with the number (1 saujiņa, 2 saujiņas; 2 горсти, 5 горстей).
type UnitForms = Record<Lang, string>;
const UNITS: Record<string, UnitForms> = {
  g: { lv: 'g', en: 'g', ru: 'г', lt: 'g' },
  kg: { lv: 'kg', en: 'kg', ru: 'кг', lt: 'kg' },
  ml: { lv: 'ml', en: 'ml', ru: 'мл', lt: 'ml' },
  l: { lv: 'l', en: 'l', ru: 'л', lt: 'l' },
  'ēd. k.': { lv: 'ēd. k.', en: 'tbsp', ru: 'ст. л.', lt: 'v. š.' },
  'tējk.': { lv: 'tējk.', en: 'tsp', ru: 'ч. л.', lt: 'a. š.' },
  'gab.': { lv: 'gab.', en: '', ru: 'шт.', lt: 'vnt.' },
  'daiv.': { lv: 'daiv.', en: 'clove|cloves', ru: 'зубчик|зубчика|зубчиков', lt: 'skiltelė|skiltelės|skiltelių' },
  saujiņa: { lv: 'saujiņa|saujiņas', en: 'handful|handfuls', ru: 'горсть|горсти|горстей', lt: 'sauja|saujos|saujų' },
  šķēle: { lv: 'šķēle|šķēles', en: 'slice|slices', ru: 'ломтик|ломтика|ломтиков', lt: 'riekė|riekės|riekių' },
  kāts: { lv: 'kāts|kāti', en: 'stalk|stalks', ru: 'стебель|стебля|стеблей', lt: 'stiebas|stiebai|stiebų' },
  zariņš: { lv: 'zariņš|zariņi', en: 'sprig|sprigs', ru: 'веточка|веточки|веточек', lt: 'šakelė|šakelės|šakelių' },
  loksne: { lv: 'loksne|loksnes', en: 'sheet|sheets', ru: 'лист|листа|листов', lt: 'lakštas|lakštai|lakštų' },
  lapiņa: { lv: 'lapiņa|lapiņas', en: 'leaf|leaves', ru: 'листик|листика|листиков', lt: 'lapelis|lapeliai|lapelių' },
  lapa: { lv: 'lapa|lapas', en: 'leaf|leaves', ru: 'лист|листа|листов', lt: 'lapas|lapai|lapų' },
  tase: { lv: 'tase|tases', en: 'cup|cups', ru: 'чашка|чашки|чашек', lt: 'puodelis|puodeliai|puodelių' },
  bumbiņa: { lv: 'bumbiņa|bumbiņas', en: 'ball|balls', ru: 'шарик|шарика|шариков', lt: 'rutuliukas|rutuliukai|rutuliukų' },
  bundža: { lv: 'bundža|bundžas', en: 'can|cans', ru: 'банка|банки|банок', lt: 'skardinė|skardinės|skardinių' },
  šķipsna: { lv: 'šķipsna|šķipsnas', en: 'pinch|pinches', ru: 'щепотка|щепотки|щепоток', lt: 'žiupsnelis|žiupsneliai|žiupsnelių' },
  galviņa: { lv: 'galviņa|galviņas', en: 'head|heads', ru: 'головка|головки|головок', lt: 'galvutė|galvutės|galvučių' },
};
// Plural spellings used in the recipe files point to the same unit.
const ALIASES: Record<string, string> = {
  saujiņas: 'saujiņa',
  šķēles: 'šķēle',
  kāti: 'kāts',
  zariņi: 'zariņš',
  loksnes: 'loksne',
  lapiņas: 'lapiņa',
  lapas: 'lapa',
  tases: 'tase',
  bumbiņas: 'bumbiņa',
  bundžas: 'bundža',
  šķipsnas: 'šķipsna',
  galviņas: 'galviņa',
};

/** The unit in the page language, agreeing with the amount. Unknown units are shown as written. */
export function unitFor(unit: string, amount: number, lang: Lang = 'lv'): string {
  const forms = UNITS[ALIASES[unit] ?? unit]?.[lang];
  if (forms == null) return unit;
  // ½ cup, but 1½ cups; the whole part decides in English.
  const n = Math.round(amount * 100) / 100;
  const whole = Number.isInteger(n) ? n : lang === 'en' && n < 1 ? 1 : n;
  return pickForm(lang, whole, forms);
}
