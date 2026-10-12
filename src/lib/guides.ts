// Kitchen guides: the articles in one language, with their URLs and reading time.
import { getCollection, type CollectionEntry } from 'astro:content';
import { href, type Lang } from '../i18n';

type Entry = CollectionEntry<'guides'>;
type Text = Entry['data']['text']['lv'];

export interface Guide extends Text {
  id: string;
  /** Site path in this language. */
  url: string;
  /** True when the article lives at its own older address instead of /padomi/<id>/. */
  ownPage: boolean;
  date: Date;
  emoji: string;
  color: string;
  image: string;
  imageAuthor?: string;
  imageSource?: string;
  figure?: Entry['data']['figure'];
  related?: Entry['data']['related'];
  /** Reading time in minutes. */
  minutes: number;
}

export const guidesUrl = (lang: Lang) => href(lang, '/padomi/');
export const guideUrl = (id: string, lang: Lang) => href(lang, `/padomi/${id}/`);

function localize(e: Entry, lang: Lang): Guide {
  const d = e.data;
  const text = d.text[lang];
  const words = [text.lead, ...text.sections.flatMap((s) => [s.h, ...s.p, ...s.list, ...s.table.flat(), ...s.after])].join(' ').split(/\s+/).length;
  return {
    ...text,
    id: e.id,
    url: d.path ? href(lang, d.path) : guideUrl(e.id, lang),
    ownPage: Boolean(d.path),
    date: d.date,
    emoji: d.emoji,
    color: d.color,
    image: d.image,
    imageAuthor: d.imageAuthor,
    imageSource: d.imageSource,
    figure: d.figure,
    related: d.related,
    minutes: Math.max(2, Math.round(words / 180)),
  };
}

/** All guides in a language, in their display order. */
export async function getGuides(lang: Lang): Promise<Guide[]> {
  return (await getCollection('guides')).sort((a, b) => a.data.order - b.data.order).map((e) => localize(e, lang));
}
