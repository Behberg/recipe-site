// Structured data helpers (schema.org JSON-LD) shared by the pages.
import { SITE } from '../site.config';

type Crumb = { name: string; path: string };

export const absolute = (path: string, site: URL | undefined) => new URL(path, site).href;

/** Breadcrumb trail for Google's search result path ("Dzērvene > Zupas > Boršs"). */
export function breadcrumbLd(items: Crumb[], site: URL | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: absolute(c.path, site) })),
  };
}

/** A list page: lets Google show the recipes of a category or cuisine as a carousel. */
export function itemListLd(name: string, paths: string[], site: URL | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: paths.length,
    itemListElement: paths.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: absolute(p, site) })),
  };
}

/** The publisher, referenced from recipes and shown in Google's knowledge panel. */
export function organizationLd(site: URL | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': absolute('/#organization', site),
    name: SITE.name,
    url: absolute('/', site),
    logo: { '@type': 'ImageObject', url: absolute('/icon-512.png', site), width: 512, height: 512 },
  };
}

// schema.org diets matching the Latvian tags used in the recipes.
const DIETS: Record<string, string> = {
  vegāns: 'https://schema.org/VeganDiet',
  veģetārs: 'https://schema.org/VegetarianDiet',
  'bez glutēna': 'https://schema.org/GlutenFreeDiet',
};
export const dietsFor = (tags: string[]) => [...new Set(tags.map((t) => DIETS[t]).filter(Boolean))];
