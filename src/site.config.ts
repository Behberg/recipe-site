/**
 * Vietnes galvenie iestatījumi. Šeit maini nosaukumu, aprakstu un reklāmas.
 */
export const SITE = {
  name: 'Dzērvene',
  tagline: 'Latviešu receptes un pasaules virtuves',
  description:
    'Latviešu receptes un gardākie ēdieni no visas pasaules: zupas, pamatēdieni, saldie ēdieni, ievārījumi un konservēšana. Vienkārši, skaisti, ērti telefonā.',
  locale: 'lv_LV',
  lang: 'lv',
  email: 'motivateyoubusiness@gmail.com',
};

/**
 * Google AdSense.
 *
 * Kamēr `client` ir tukšs, reklāmas netiek rādītas un skripts netiek ielādēts.
 * Kad AdSense konts ir apstiprināts:
 *   1. ieraksti `client` (piem. 'ca-pub-1234567890123456'),
 *   2. AdSense izveido reklāmas vienības un ieraksti to ID zemāk,
 *   3. atjauno public/ads.txt ar savu publisher ID.
 */
export const ADS = {
  client: 'ca-pub-9361542084013013',
  /**
   * Vienas "Display" (responsive) reklāmas vienības ID no AdSense. Ar to pietiek, lai darbotos
   * visas vietas zemāk: vieta, kurai nav sava ID, izmanto šo. Kamēr gan šis, gan vietas ID ir
   * tukši, šajā vietā nekas netiek rādīts (paliek tikai Google Auto ads, ja tās ir ieslēgtas).
   */
  fallbackSlot: '4396376666',
  /** Atsevišķi ID katrai vietai nav obligāti, bet AdSense pārskatos ļauj redzēt, kura vieta pelna. */
  slots: {
    inFeed: '', // recepšu sarakstos starp kartītēm, sākumlapā un padomu sarakstā
    listBottom: '', // saraksta beigās (receptes, virtuves, svētki, testi, ledusskapis)
    recipeTop: '', // receptē, pēc ievada, pirms sastāvdaļām
    recipeMid: '', // receptē telefonā, starp sastāvdaļām un pagatavošanu
    recipeBottom: '', // receptē, pēc pagatavošanas soļiem
    recipeEnd: '', // receptē, pēc līdzīgajām receptēm
    quiz: '', // testa lapā zem jautājumiem
    quizResult: '', // testa rezultāta lapā, pēc receptēm
    article: '', // padomu rakstos starp nodaļām un raksta beigās
  },
  /** Cik recepšu kartītes starp reklāmām sarakstos. */
  feedEvery: 6,
};

export const adsEnabled = () => ADS.client.trim().length > 0;
/** The AdSense unit for a placement: its own ID, or the shared one. Empty when neither is set. */
export const adSlotId = (slot: keyof typeof ADS.slots) => ADS.slots[slot].trim() || ADS.fallbackSlot.trim();

/**
 * Meklētājprogrammu pārbaudes kodi.
 * Google Search Console: pievieno vietni kā "URL prefix", izvēlies "HTML tag" un ieraksti
 * content="..." vērtību šeit. Tas pats ar Bing Webmaster Tools.
 */
export const SEARCH_VERIFICATION = {
  google: '',
  bing: '',
};
