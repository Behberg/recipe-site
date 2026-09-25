/**
 * Vietnes galvenie iestatījumi. Šeit maini nosaukumu, aprakstu un reklāmas.
 */
export const SITE = {
  name: 'Garšīgi',
  tagline: 'Latviešu receptes un pasaules virtuves',
  description:
    'Latviešu receptes un gardākie ēdieni no visas pasaules: zupas, pamatēdieni, saldie ēdieni, ievārījumi un konservēšana. Vienkārši, skaisti, ērti telefonā.',
  locale: 'lv_LV',
  lang: 'lv',
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
  client: '', // 'ca-pub-XXXXXXXXXXXXXXXX'
  slots: {
    inFeed: '', // recepšu sarakstos starp kartītēm un sākumlapā
    recipeTop: '', // receptē, pēc ievada, pirms sastāvdaļām
    recipeBottom: '', // receptē, pēc pagatavošanas soļiem
  },
  /** Cik recepšu kartītes starp reklāmām sarakstos. */
  feedEvery: 8,
};

export const adsEnabled = () => ADS.client.trim().length > 0;
