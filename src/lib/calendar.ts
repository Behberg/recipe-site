// Occasion date rules. Pure functions, used both at build time and in the browser
// (the browser always knows today's date, the static build does not).

export interface OccasionRule {
  id: string;
  dateType: 'fiksets' | 'lieldienas' | 'nedelas-diena' | 'nav';
  month?: number;
  day?: number;
  easterOffset?: number;
  weekday?: number; // 0 = Sunday
  nth?: number; // 1..5, or -1 for "last"
  leadDays: number;
}

/** Western (Gregorian) Easter Sunday, the date Latvia celebrates Lieldienas. */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function nthWeekday(year: number, month: number, weekday: number, nth: number): Date {
  if (nth < 0) {
    const last = new Date(year, month, 0);
    const diff = (last.getDay() - weekday + 7) % 7;
    return new Date(year, month - 1, last.getDate() - diff);
  }
  const first = new Date(year, month - 1, 1);
  const diff = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month - 1, 1 + diff + (nth - 1) * 7);
}

/** The occasion's date in a given year, or null for "any day" occasions. */
export function occasionDate(rule: OccasionRule, year: number): Date | null {
  switch (rule.dateType) {
    case 'fiksets':
      return rule.month && rule.day ? new Date(year, rule.month - 1, rule.day) : null;
    case 'lieldienas': {
      const d = easterSunday(year);
      d.setDate(d.getDate() + (rule.easterOffset ?? 0));
      return d;
    }
    case 'nedelas-diena':
      return rule.month != null && rule.weekday != null ? nthWeekday(year, rule.month, rule.weekday, rule.nth ?? 1) : null;
    default:
      return null;
  }
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Next occurrence on or after today, and how many days away it is. */
export function nextOccurrence(rule: OccasionRule, today = new Date()): { date: Date; days: number } | null {
  const t = startOfDay(today);
  for (const year of [t.getFullYear(), t.getFullYear() + 1]) {
    const d = occasionDate(rule, year);
    if (d && d >= t) return { date: d, days: Math.round((d.getTime() - t.getTime()) / 86400000) };
  }
  return null;
}

const MONTHS = ['janvārī', 'februārī', 'martā', 'aprīlī', 'maijā', 'jūnijā', 'jūlijā', 'augustā', 'septembrī', 'oktobrī', 'novembrī', 'decembrī'];
const MONTHS_SHORT = ['janv.', 'febr.', 'marts', 'apr.', 'maijs', 'jūn.', 'jūl.', 'aug.', 'sept.', 'okt.', 'nov.', 'dec.'];

export const formatDateLong = (d: Date) => `${d.getDate()}. ${MONTHS[d.getMonth()]}`;
export const monthShort = (d: Date) => MONTHS_SHORT[d.getMonth()];

/** "šodien", "rīt", "pēc 5 dienām", "pēc 21 dienas". */
export function countdown(days: number): string {
  if (days === 0) return 'šodien';
  if (days === 1) return 'rīt';
  return `pēc ${days} ${days % 10 === 1 && days % 100 !== 11 ? 'dienas' : 'dienām'}`;
}
