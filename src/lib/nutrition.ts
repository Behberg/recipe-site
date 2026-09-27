// Approximate nutrition per serving, worked out from a recipe's ingredient list.
// Values per 100 g are rounded averages from standard food tables (USDA FoodData Central and
// similar). They are estimates: the site labels them "approximately" and Google gets them as
// NutritionInformation for recipe rich results.

/** [kcal, protein g, fat g, carbs g] per 100 g, plus the weights needed to convert units. */
interface Food {
  n: [number, number, number, number];
  /** grams per piece ("gab.", "loksne", "galviņa") */
  pc?: number;
  /** grams per ml, for spoons, cups and ml amounts */
  d?: number;
  /** grams per handful */
  h?: number;
  /** grams per slice */
  sl?: number;
  /** grams per can or jar (drained where the liquid is thrown away) */
  can?: number;
  /** share of the listed amount that ends up eaten (frying oil, stock bones, coatings) */
  eaten?: number;
}

const F = (n: Food['n'], o: Omit<Food, 'n'> = {}): Food => ({ n, ...o });
const ZERO = F([0, 0, 0, 0]);
const SPICE = F([300, 10, 8, 50], { d: 0.5, h: 10, pc: 0.3 });
const HERB = F([35, 3, 0.6, 6], { h: 10, pc: 5 });

const FOODS = {
  zero: ZERO,
  spice: SPICE,
  herb: HERB,
  // grains, flours, starches
  flour: F([364, 10, 1, 76], { d: 0.53 }),
  ryeFlour: F([325, 9, 1.5, 69], { d: 0.5 }),
  buckFlour: F([335, 13, 3, 70], { d: 0.5 }),
  cornFlour: F([365, 9, 4, 76], { d: 0.55 }),
  almondFlour: F([580, 21, 50, 20], { d: 0.45 }),
  semolina: F([360, 12, 1, 73], { d: 0.65 }),
  starch: F([350, 0.2, 0.1, 87], { d: 0.6 }),
  cornflakes: F([357, 7, 0.4, 84], { d: 0.12 }),
  oats: F([380, 13, 7, 66], { d: 0.4 }),
  granola: F([450, 10, 15, 64], { d: 0.4 }),
  rice: F([360, 7, 0.6, 79], { d: 0.85 }),
  riceCooked: F([130, 2.7, 0.3, 28], { d: 0.8 }),
  buckwheat: F([343, 13, 3.4, 72], { d: 0.8 }),
  buckCooked: F([92, 3.4, 0.6, 20]),
  barley: F([352, 10, 1.2, 78], { d: 0.8 }),
  couscous: F([376, 13, 0.6, 77], { d: 0.75 }),
  quinoa: F([368, 14, 6, 64], { d: 0.8 }),
  pasta: F([371, 13, 1.5, 75], { pc: 20 }),
  noodles: F([360, 9, 1, 80]),
  riceCakes: F([230, 4, 0.5, 50]),
  lentils: F([352, 24, 1, 63], { d: 0.8 }),
  peas: F([340, 24, 1, 60], { d: 0.8 }),
  chickpeasDry: F([364, 19, 6, 61]),
  beansCan: F([115, 7, 0.8, 20], { can: 240 }),
  bakedBeans: F([94, 5, 0.5, 17], { can: 415 }),
  bread: F([265, 9, 3.2, 49], { sl: 30, pc: 250 }),
  ryeBread: F([250, 8, 1.5, 48], { sl: 35 }),
  bun: F([280, 9, 4.5, 50], { pc: 60 }),
  pita: F([275, 9, 1.2, 56], { pc: 60 }),
  tortilla: F([310, 8, 7.5, 52], { pc: 45 }),
  tortillaLarge: F([310, 8, 7.5, 52], { pc: 65 }),
  cornTortilla: F([218, 5.7, 2.9, 45], { pc: 25 }),
  lavash: F([275, 9, 1.2, 56], { pc: 100 }),
  breadcrumbs: F([395, 13, 5, 72], { d: 0.45 }),
  croutons: F([410, 11, 10, 68]),
  puffPastry: F([550, 7, 38, 45]),
  filo: F([300, 7, 6, 53], { pc: 20 }),
  wrapper: F([290, 9, 1.5, 58], { pc: 8 }),
  ricePaper: F([330, 1, 0.3, 82], { pc: 9 }),
  biscuits: F([440, 7, 14, 72]),
  savoiardi: F([390, 8, 4, 78], { pc: 10 }),
  meringue: F([390, 4, 0, 94]),
  chips: F([490, 7, 23, 64]),
  popcorn: F([375, 11, 4, 74]),
  dumplings: F([275, 11, 12, 30]),
  mash: F([110, 2, 4, 16]),
  // sugars and sweets
  sugar: F([400, 0, 0, 100], { d: 0.85 }),
  icing: F([400, 0, 0, 100], { d: 0.5 }),
  honey: F([304, 0.3, 0, 82], { d: 1.42 }),
  syrup: F([270, 0, 0, 68], { d: 1.32 }),
  condensed: F([321, 8, 8.7, 54], { d: 1.3 }),
  caramel: F([330, 7, 9, 56], { d: 1.3 }),
  jam: F([250, 0.4, 0.1, 62], { d: 1.3 }),
  jelly: F([380, 7, 0, 90], { pc: 90 }),
  darkChoc: F([550, 7, 35, 50], { d: 0.6 }),
  whiteChoc: F([540, 6, 32, 59], { d: 0.6 }),
  sprinkles: F([400, 0, 5, 90], { d: 0.7 }),
  cocoa: F([230, 20, 14, 58], { d: 0.45 }),
  candied: F([320, 0.3, 0.1, 80]),
  raisins: F([300, 3, 0.5, 79], { h: 30, d: 0.6 }),
  prunes: F([240, 2, 0.4, 64]),
  dates: F([280, 2.5, 0.4, 75]),
  driedFruit: F([280, 2.5, 0.5, 70]),
  // dairy and eggs
  milk: F([64, 3.3, 3.5, 4.8], { d: 1.03 }),
  kefir: F([55, 3, 2.5, 4], { d: 1.03 }),
  yogurt: F([65, 4, 3, 5], { d: 1.05 }),
  greekYog: F([100, 9, 5, 4], { d: 1.05 }),
  sourCream: F([205, 2.7, 20, 3.2], { d: 1.0 }),
  cream: F([320, 2, 33, 3], { d: 1.0 }),
  butter: F([740, 0.7, 82, 0.6], { d: 0.96 }),
  curd: F([160, 17, 9, 2]),
  creamCheese: F([340, 6, 34, 4]),
  mascarpone: F([430, 5, 44, 4]),
  hardCheese: F([380, 26, 30, 1], { sl: 20 }),
  parmesan: F([420, 36, 29, 0], { d: 0.4 }),
  mozzarella: F([280, 20, 21, 2], { pc: 125 }),
  feta: F([265, 14, 21, 4]),
  halloumi: F([320, 21, 25, 2]),
  blueCheese: F([350, 21, 29, 2]),
  meltCheese: F([280, 14, 23, 5]),
  iceCream: F([210, 3.5, 11, 24]),
  egg: F([143, 12.6, 9.5, 0.7], { pc: 50 }),
  yolk: F([320, 16, 27, 3.6], { pc: 17 }),
  white: F([52, 11, 0, 0.7], { pc: 33 }),
  // fats
  oil: F([884, 0, 100, 0], { d: 0.92 }),
  fryOil: F([884, 0, 100, 0], { d: 0.92, eaten: 0.1 }),
  lard: F([700, 5, 75, 0]),
  smokedLard: F([600, 10, 62, 0]),
  bacon: F([420, 13, 40, 1.4], { sl: 15 }),
  mayo: F([680, 1, 75, 0.6], { d: 0.95 }),
  peanutButter: F([590, 25, 50, 20], { d: 1.1 }),
  tahini: F([595, 17, 54, 21], { d: 1.0 }),
  // meat
  porkShoulder: F([230, 17, 18, 0]),
  porkLean: F([150, 21, 7, 0], { pc: 150 }),
  porkNeck: F([250, 16, 21, 0]),
  porkRibs: F([280, 16, 24, 0], { eaten: 0.7 }),
  porkLeg: F([260, 17, 21, 0], { pc: 1000, eaten: 0.75 }),
  porkFeet: F([230, 20, 16, 0], { pc: 400, eaten: 0.5 }),
  mince: F([240, 17, 19, 0]),
  beef: F([180, 20, 11, 0]),
  steak: F([190, 21, 12, 0], { pc: 250 }),
  beefSlice: F([150, 22, 6, 0], { pc: 150 }),
  liver: F([135, 20, 4, 4]),
  venison: F([120, 23, 2.4, 0]),
  lamb: F([250, 17, 20, 0]),
  rabbit: F([170, 20, 10, 0], { eaten: 0.7 }),
  chickenBreast: F([110, 23, 1.5, 0], { pc: 180 }),
  chickenThighFillet: F([180, 18, 11, 0]),
  chickenBoneIn: F([170, 15, 12, 0]),
  chickenWings: F([190, 17, 13, 0]),
  chickenCooked: F([190, 27, 8, 0]),
  chickenBones: F([170, 15, 12, 0], { eaten: 0.2 }),
  chickenLiver: F([120, 17, 5, 1]),
  chickenMince: F([145, 17, 8, 0]),
  turkey: F([110, 24, 1.5, 0]),
  duck: F([250, 16, 20, 0], { eaten: 0.65 }),
  duckBreast: F([200, 19, 13, 0], { pc: 300 }),
  schnitzel: F([150, 21, 7, 0], { pc: 150 }),
  blood: F([80, 17, 0.1, 0], { d: 1.05 }),
  smokedSausage: F([350, 15, 31, 2]),
  sausage: F([280, 12, 25, 2], { pc: 70 }),
  wiener: F([260, 11, 23, 2], { pc: 50 }),
  smokedHam: F([200, 20, 12, 1], { sl: 20 }),
  ham: F([145, 18, 7, 1.5], { sl: 20 }),
  pancetta: F([650, 9, 69, 0]),
  smokedMeat: F([300, 17, 26, 0]),
  // fish and seafood
  whiteFish: F([80, 18, 0.7, 0], { pc: 400 }),
  salmon: F([208, 20, 13, 0]),
  smokedSalmon: F([117, 18, 4.3, 0]),
  herringSalted: F([220, 17, 17, 0]),
  herringMarinated: F([260, 14, 18, 10]),
  herring: F([150, 18, 8, 0]),
  sprats: F([360, 17, 32, 0], { can: 160 }),
  tuna: F([116, 26, 1, 0], { can: 140 }),
  anchovy: F([210, 29, 10, 0], { pc: 4 }),
  shrimp: F([85, 20, 0.5, 0]),
  mussels: F([30, 4, 0.7, 1.2]),
  crabSticks: F([95, 7, 0.5, 15], { pc: 17 }),
  // vegetables
  potato: F([77, 2, 0.1, 17], { pc: 150 }),
  sweetPotato: F([86, 1.6, 0.1, 20], { pc: 250 }),
  onion: F([40, 1.1, 0.1, 9], { pc: 100 }),
  bigOnion: F([40, 1.1, 0.1, 9], { pc: 180 }),
  shallot: F([72, 2.5, 0.1, 17], { pc: 30 }),
  garlic: F([149, 6, 0.5, 33], { pc: 50 }),
  leek: F([61, 1.5, 0.3, 14], { pc: 200 }),
  springOnion: F([32, 1.8, 0.2, 7], { pc: 15, h: 20 }),
  carrot: F([41, 0.9, 0.2, 10], { pc: 80 }),
  beet: F([43, 1.6, 0.2, 10], { pc: 150 }),
  cabbage: F([25, 1.3, 0.1, 6], { pc: 1500 }),
  redCabbage: F([31, 1.4, 0.2, 7]),
  chineseCabbage: F([13, 1.2, 0.2, 2.2]),
  sauerkraut: F([19, 0.9, 0.1, 4.3]),
  cauliflower: F([25, 2, 0.3, 5], { pc: 800 }),
  broccoli: F([34, 2.8, 0.4, 7]),
  zucchini: F([17, 1.2, 0.3, 3], { pc: 300 }),
  eggplant: F([25, 1, 0.2, 6], { pc: 300 }),
  bigEggplant: F([25, 1, 0.2, 6], { pc: 400 }),
  pepper: F([30, 1, 0.3, 6], { pc: 150 }),
  chili: F([40, 1.9, 0.4, 9], { pc: 10 }),
  tomato: F([18, 0.9, 0.2, 3.9], { pc: 120 }),
  bigTomato: F([18, 0.9, 0.2, 3.9], { pc: 200 }),
  cherryTomato: F([18, 0.9, 0.2, 3.9], { pc: 15 }),
  cannedTomato: F([20, 1, 0.1, 4], { can: 400, d: 1.03 }),
  passata: F([30, 1.3, 0.2, 6], { d: 1.03 }),
  tomatoPaste: F([82, 4.3, 0.5, 19], { d: 1.1 }),
  ketchup: F([110, 1.2, 0.1, 26], { d: 1.15 }),
  cucumber: F([15, 0.7, 0.1, 3.6], { pc: 200 }),
  smallCucumber: F([15, 0.7, 0.1, 3.6], { pc: 80 }),
  pickle: F([12, 0.5, 0.2, 2], { pc: 60 }),
  mushrooms: F([22, 3, 0.3, 3], { pc: 25 }),
  bigMushrooms: F([22, 3, 0.3, 3], { pc: 70 }),
  wildMushrooms: F([30, 3, 0.5, 3]),
  chanterelles: F([38, 1.5, 0.5, 7]),
  leafy: F([23, 2.9, 0.4, 3.6], { h: 30, pc: 300 }),
  salad: F([15, 1.4, 0.2, 3], { h: 30, pc: 300 }),
  celery: F([16, 0.7, 0.2, 3], { pc: 40 }),
  radish: F([16, 0.7, 0.1, 3.4], { pc: 15 }),
  horseradish: F([48, 1.2, 0.7, 11], { pc: 100, d: 1 }),
  pumpkin: F([26, 1, 0.1, 6.5]),
  pumpkinPuree: F([34, 1.1, 0.3, 8]),
  corn: F([80, 2.5, 1, 15], { can: 285, d: 0.8 }),
  cornCob: F([52, 2, 0.8, 11], { pc: 250 }),
  greenPeas: F([81, 5.4, 0.4, 14]),
  greenBeans: F([31, 1.8, 0.2, 7]),
  edamame: F([120, 12, 5, 9]),
  sprouts: F([30, 3, 0.2, 6]),
  pakChoi: F([13, 1.5, 0.2, 2.2], { pc: 150 }),
  avocado: F([160, 2, 15, 9], { pc: 150 }),
  olives: F([145, 1, 15, 4]),
  capers: F([23, 2.4, 0.9, 5], { d: 0.6 }),
  kimchi: F([15, 1.1, 0.5, 2.4]),
  tofu: F([76, 8, 4.8, 1.9]),
  nettles: F([42, 2.7, 0.1, 7.5]),
  // fruit
  apple: F([52, 0.3, 0.2, 14], { pc: 180 }),
  bigApple: F([52, 0.3, 0.2, 14], { pc: 250 }),
  pear: F([57, 0.4, 0.1, 15], { pc: 180 }),
  banana: F([89, 1.1, 0.3, 23], { pc: 120 }),
  mango: F([60, 0.8, 0.4, 15], { pc: 300 }),
  orange: F([47, 0.9, 0.1, 12], { pc: 200 }),
  zest: F([47, 0.9, 0.1, 12], { pc: 5 }),
  lemon: F([29, 1.1, 0.3, 9], { pc: 100 }),
  lemonJuice: F([22, 0.4, 0.2, 7], { d: 1.03 }),
  juiceOfLemon: F([22, 0.4, 0.2, 7], { pc: 35 }),
  lime: F([30, 0.7, 0.2, 11], { pc: 60 }),
  kiwi: F([61, 1.1, 0.5, 15], { pc: 75 }),
  peach: F([39, 0.9, 0.3, 10], { pc: 150 }),
  pineapple: F([60, 0.4, 0.1, 15], { can: 560, sl: 40 }),
  watermelon: F([30, 0.6, 0.2, 8]),
  berries: F([45, 0.8, 0.4, 10], { h: 60 }),
  seaBuckthorn: F([82, 1.2, 5.4, 7]),
  cherries: F([50, 1, 0.3, 12]),
  jarCherries: F([80, 0.7, 0.1, 20]),
  plums: F([46, 0.7, 0.3, 11.4]),
  rhubarb: F([21, 0.9, 0.2, 4.5]),
  grapes: F([69, 0.7, 0.2, 18]),
  fruit: F([50, 0.7, 0.3, 12]),
  quince: F([57, 0.4, 0.1, 15]),
  // drinks
  juice: F([48, 0.3, 0.1, 11.5], { d: 1.04 }),
  birchSap: F([5, 0, 0, 1.2], { d: 1 }),
  kvass: F([27, 0.2, 0, 5.2], { d: 1 }),
  wine: F([83, 0.1, 0, 2.6], { d: 1 }),
  beer: F([43, 0.5, 0, 3.6], { d: 1 }),
  spirit: F([231, 0, 0, 0], { d: 0.95 }),
  liqueur: F([320, 0, 0, 33], { d: 1.05 }),
  aperitif: F([150, 0, 0, 16], { d: 1.02 }),
  // nuts and seeds
  walnuts: F([654, 15, 65, 14], { d: 0.5, h: 30 }),
  almonds: F([579, 21, 50, 22], { d: 0.4 }),
  pistachio: F([560, 20, 45, 28]),
  pineNuts: F([673, 14, 68, 13]),
  peanuts: F([585, 24, 50, 21]),
  seeds: F([570, 20, 48, 20], { d: 0.6 }),
  chia: F([486, 17, 31, 42], { d: 0.7 }),
  psyllium: F([200, 2, 0.5, 85], { d: 0.5 }),
  coconut: F([660, 7, 65, 24], { d: 0.35 }),
  coconutMilk: F([197, 2, 21, 3], { d: 1.0 }),
  // sauces, pastes, condiments
  soy: F([53, 8, 0.6, 5], { d: 1.15 }),
  fishSauce: F([35, 5, 0, 4], { d: 1.2 }),
  oyster: F([51, 1.4, 0.3, 11], { d: 1.2 }),
  mirin: F([240, 0.2, 0, 43], { d: 1.1 }),
  miso: F([200, 12, 6, 26], { d: 1.2 }),
  gochujang: F([200, 5, 1, 43], { d: 1.2 }),
  paste: F([120, 2, 7, 12], { d: 1.1 }),
  tamarind: F([240, 2.8, 0.6, 62], { d: 1.2 }),
  hotSauce: F([20, 1, 0.5, 4], { d: 1.05 }),
  sweetSauce: F([170, 1, 0.5, 40], { d: 1.2 }),
  worcester: F([78, 0, 0, 19], { d: 1.1 }),
  mustard: F([66, 4, 4, 6], { d: 1.05 }),
  vinegar: F([18, 0, 0, 0.5], { d: 1 }),
  balsamic: F([88, 0.5, 0, 17], { d: 1.05 }),
  // baking helpers and the rest
  yeastDry: F([325, 40, 7, 41], { d: 0.6 }),
  yeastFresh: F([105, 8.4, 1.9, 18]),
  gelatin: F([335, 86, 0, 0], { d: 0.7, pc: 2 }),
  malt: F([360, 10, 2, 75]),
  leaven: F([180, 5, 0.8, 38], { d: 1 }),
  stock: F([5, 0.5, 0.2, 0.5], { d: 1 }),
  meatStock: F([15, 2, 0.5, 0.5], { d: 1 }),
  flowers: F([40, 2.7, 0.7, 9]),
} satisfies Record<string, Food>;

type FoodKey = keyof typeof FOODS;

/**
 * Ingredient name → food. Tried in order against the name with anything after " vai "
 * ("or") removed first, then against the full name. The first match wins, so the more
 * specific patterns come first ("kokosriekstu piens" before "piens").
 */
const RULES: [RegExp, FoodKey][] = [
  // nothing to eat
  [/^(ūdens|auksts ūdens|karsts ūdens|silts ūdens|remdens ūdens|verdošs ūdens|ledus|ledusauksts ūdens|gāzēts|ledusauksts gāzēts)/, 'zero'],
  [/citronzāle/, 'herb'],
  [/kvass/, 'kvass'],
  [/mizas|zarnas|lauru lap|upeņu vai ķiršu lapas|kadiķogas|lapiņas vai ziedi|stipra kafija|tēja|tējas|dzeramā soda|cepamais pulveris|^sāls|rupjā (jūras )?sāls|etiķis \(9%\)|maizes kubiņi un dārzeņi|citrons un salāti|feta, koriandrs/, 'zero'],
  // stocks and broths
  [/mugurkauli/, 'chickenBones'],
  [/gaļas buljons|liellopu buljons|vistas buljons/, 'meatStock'],
  [/buljons/, 'stock'],
  // oils and fats
  [/eļļa cepšanai|sviests vai eļļa cepšanai/, 'fryOil'],
  [/(eļļa|olīveļļa)( |$)|^eļļa|olīveļļa|sezama eļļa|čili eļļa|kokosriekstu eļļa|saulespuķu eļļa/, 'oil'],
  [/zemesriekstu sviests/, 'peanutButter'],
  [/sviests/, 'butter'],
  [/kūpināts speķis/, 'smokedLard'],
  [/speķis/, 'lard'],
  [/bekons/, 'bacon'],
  [/majonēze/, 'mayo'],
  [/tahini/, 'tahini'],
  // dairy
  [/kokosriekstu piens/, 'coconutMilk'],
  [/kondensētais piens \(karamele\)|vārīts kondensētais/, 'caramel'],
  [/kondensētais piens/, 'condensed'],
  [/piens/, 'milk'],
  [/kefīrs|paniņas|rūgušpiens/, 'kefir'],
  [/grieķu jogurts/, 'greekYog'],
  [/jogurts/, 'yogurt'],
  [/skābais krējums/, 'sourCream'],
  [/saldais krējums/, 'cream'],
  [/biezpiens/, 'curd'],
  [/krēmsiers/, 'creamCheese'],
  [/maskarpone/, 'mascarpone'],
  [/parmezāns|pekorino/, 'parmesan'],
  [/mocarell/, 'mozzarella'],
  [/feta/, 'feta'],
  [/halumi|halloumi|paneer/, 'halloumi'],
  [/zilais siers/, 'blueCheese'],
  [/kausētais siers/, 'meltCheese'],
  [/siers|čedar|gruyère/i, 'hardCheese'],
  [/saldējums/, 'iceCream'],
  [/dzīvais jogurts/, 'yogurt'],
  // eggs
  [/dzeltenum/, 'yolk'],
  [/baltumi/, 'white'],
  [/^(ola|olas|vesela ola|vārītas olas)/, 'egg'],
  // meat
  [/malta vista/, 'chickenMince'],
  [/malta (gaļa|cūkgaļa|liellopu|jēra)|malta gaļa/, 'mince'],
  [/vārīta vista/, 'chickenCooked'],
  [/vistas aknas/, 'chickenLiver'],
  [/aknas/, 'liver'],
  [/vistas fileja|vistas filejas/, 'chickenBreast'],
  [/vistas šķiņķu fileja/, 'chickenThighFillet'],
  [/vistas spārniņi/, 'chickenWings'],
  [/vista|vistas/, 'chickenBoneIn'],
  [/tītar/, 'turkey'],
  [/pīles krūtiņas/, 'duckBreast'],
  [/pīle/, 'duck'],
  [/šniceles/, 'schnitzel'],
  [/steiki/, 'steak'],
  [/liellopa šķēles/, 'beefSlice'],
  [/liellop|jēra vai liellopu/, 'beef'],
  [/jēra/, 'lamb'],
  [/brieža/, 'venison'],
  [/trusis/, 'rabbit'],
  [/kūpināta gaļa|kūpinātas cūkas ribiņas/, 'smokedMeat'],
  [/ribiņas/, 'porkRibs'],
  [/cūkas kājas/, 'porkFeet'],
  [/cūkas stilbs|cūkas šķiņķis/, 'porkLeg'],
  [/asinis/, 'blood'],
  [/kakla/, 'porkNeck'],
  [/cūkgaļas karbonāde|cūkgaļas fileja/, 'porkLean'],
  [/cūkgaļ/, 'porkShoulder'],
  [/kūpināts šķiņķis/, 'smokedHam'],
  [/šķiņķis/, 'ham'],
  [/guančale|pančeta/, 'pancetta'],
  [/kūpināta desa|kūpinājumi/, 'smokedSausage'],
  [/vārīta desa|cīsiņi|vārīta gaļa vai desa/, 'wiener'],
  [/desiņas/, 'sausage'],
  [/pelmeņi/, 'dumplings'],
  // fish and seafood
  [/kūpināts lasis|ļoti svaigs vai kūpināts lasis/, 'smokedSalmon'],
  [/lasis|laša/, 'salmon'],
  [/sālītas siļķes/, 'herringSalted'],
  [/marinēta siļķe/, 'herringMarinated'],
  [/reņģes/, 'herring'],
  [/šprotes/, 'sprats'],
  [/tuncis/, 'tuna'],
  [/anšovi/, 'anchovy'],
  [/garneles/, 'shrimp'],
  [/mīdijas/, 'mussels'],
  [/krabju/, 'crabSticks'],
  [/zivs|zivju fileja|mencas|butes|baltā zivs/, 'whiteFish'],
  [/zivju mērce/, 'fishSauce'],
  // grains, bread, pastry
  [/rudzu ieraugs/, 'leaven'],
  [/rupjie rudzu milti|rudzu milti/, 'ryeFlour'],
  [/griķu milti/, 'buckFlour'],
  [/kukurūzas milti/, 'cornFlour'],
  [/mandeļu milti/, 'almondFlour'],
  [/milti/, 'flour'],
  [/ciete/, 'starch'],
  [/mannas/, 'semolina'],
  [/kukurūzas pārslas/, 'cornflakes'],
  [/granola/, 'granola'],
  [/auzu pārslas/, 'oats'],
  [/vārīti rīsi|rīsi \(vārīti/, 'riceCooked'],
  [/rīsu kūkas/, 'riceCakes'],
  [/rīsu papīr/, 'ricePaper'],
  [/rīsu etiķis/, 'vinegar'],
  [/nūdeles/, 'noodles'],
  [/rīsi/, 'rice'],
  [/vārīti griķi/, 'buckCooked'],
  [/griķi/, 'buckwheat'],
  [/grūbas|miežu putraimi/, 'barley'],
  [/kuskuss|bulgurs/, 'couscous'],
  [/kvinoja/, 'quinoa'],
  [/lazanjas loksnes|spageti|makaroni|pastas/, 'pasta'],
  [/lēcas/, 'lentils'],
  [/pelēkie zirņi|šķeltie/, 'peas'],
  [/sausi aunazirņi/, 'chickpeasDry'],
  [/ceptas pupiņas/, 'bakedBeans'],
  [/aunazirņi|pupiņas \(konservētas\)|melnās pupiņas|baltās pupiņas|sarkanās pupiņas/, 'beansCan'],
  [/rupjmaize/, 'ryeBread'],
  [/maizītes/, 'bun'],
  [/pitas/, 'pita'],
  [/lielas kviešu tortiljas/, 'tortillaLarge'],
  [/kukurūzas tortiljas|kukurūzas vai kviešu tortiljas/, 'cornTortilla'],
  [/tortiljas/, 'tortilla'],
  [/lavašs/, 'lavash'],
  [/rīvmaize/, 'breadcrumbs'],
  [/grauzdiņi/, 'croutons'],
  [/maize|bagete|baltmaize|bulciņas/, 'bread'],
  [/kārtainā mīkla/, 'puffPastry'],
  [/filo/, 'filo'],
  [/mīklas apļi|mīklas kvadrāti|rullīšu loksnes/, 'wrapper'],
  [/savojardi/, 'savoiardi'],
  [/cepumi/, 'biscuits'],
  [/bezē/, 'meringue'],
  [/čipsi/, 'chips'],
  [/popkorn/, 'popcorn'],
  [/kartupeļu biezenis/, 'mash'],
  // sugar and sweets
  [/pūdercukurs/, 'icing'],
  [/cukurs/, 'sugar'],
  [/medus/, 'honey'],
  [/sīrups/, 'syrup'],
  [/ievārījums/, 'jam'],
  [/želeja/, 'jelly'],
  [/baltā šokolāde/, 'whiteChoc'],
  [/krāsainās skaidiņas/, 'sprinkles'],
  [/šokolād/, 'darkChoc'],
  [/kakao/, 'cocoa'],
  [/sukādes/, 'candied'],
  [/rozīnes/, 'raisins'],
  [/žāvētas plūmes/, 'prunes'],
  [/dateles/, 'dates'],
  [/žāvēti augļi|mežrozīšu/, 'driedFruit'],
  // vegetables
  [/batāte|saldais kartupelis/, 'sweetPotato'],
  [/kartupe/, 'potato'],
  [/liels sīpols/, 'bigOnion'],
  [/šalotes|mazi sīpoli/, 'shallot'],
  [/ķiploku pulveris/, 'spice'],
  [/ķiplok/, 'garlic'],
  [/sīpol/, 'onion'],
  [/puravs/, 'leek'],
  [/^loki/, 'springOnion'],
  [/burkān/, 'carrot'],
  [/biete/, 'beet'],
  [/skābēti kāposti/, 'sauerkraut'],
  [/sarkanie kāposti/, 'redCabbage'],
  [/pekinas kāposti/i, 'chineseCabbage'],
  [/ziedkāpost/, 'cauliflower'],
  [/kāpost/, 'cabbage'],
  [/brokoļi/, 'broccoli'],
  [/kabac|kabač|cukini/, 'zucchini'],
  [/lieli baklažāni/, 'bigEggplant'],
  [/baklažān/, 'eggplant'],
  [/kūpināta paprika|paprikas pulveris|sumaks/, 'spice'],
  [/paprika/, 'pepper'],
  [/čili pipar|halapeņo/, 'chili'],
  [/ķiršu tomāti|mazi tomāti/, 'cherryTomato'],
  [/lieli tomāti/, 'bigTomato'],
  [/tomāti savā sulā/, 'cannedTomato'],
  [/passata|tomātu mērce(?! pasniegšanai)/, 'passata'],
  [/tomātu pasta|tomātu biezenis/, 'tomatoPaste'],
  [/tomāt/, 'tomato'],
  [/kečups/, 'ketchup'],
  [/marinēt\S* gurķ|gurķu marināde/, 'pickle'],
  [/mazi gurķi/, 'smallCucumber'],
  [/gurķ/, 'cucumber'],
  [/lieli šampinjoni/, 'bigMushrooms'],
  [/šampinjoni/, 'mushrooms'],
  [/gailenes/, 'chanterelles'],
  [/sēnes|baravikas/, 'wildMushrooms'],
  [/spināti|rukola|skābenes/, 'leafy'],
  [/pak choi/, 'pakChoi'],
  [/salāti/, 'salad'],
  [/selerija/, 'celery'],
  [/redīsi/, 'radish'],
  [/mārrutk/, 'horseradish'],
  [/ķirbju biezenis/, 'pumpkinPuree'],
  [/ķirbju sēklas|saulespuķu sēklas|linsēklas|kaņepju|magoņu|sezama sēklas/, 'seeds'],
  [/ķirbis/, 'pumpkin'],
  [/kukurūzas vālītes/, 'cornCob'],
  [/kukurūza/, 'corn'],
  [/zaļie zirnīši/, 'greenPeas'],
  [/zaļās pupiņas/, 'greenBeans'],
  [/edamame/, 'edamame'],
  [/asni/, 'sprouts'],
  [/avokado/, 'avocado'],
  [/olīvas/, 'olives'],
  [/kaperi/, 'capers'],
  [/kimči/, 'kimchi'],
  [/tofu/, 'tofu'],
  [/nātres/, 'nettles'],
  [/aļģes/, 'zero'],
  // fruit
  [/lieli āboli/, 'bigApple'],
  [/āboli|ābols|skābeni āboli|stingri āboli/, 'apple'],
  [/ābolu sula|ananāsu sula|vīnogu vai upeņu sula|upeņu sula|ķiršu sula/, 'juice'],
  [/bumbier/, 'pear'],
  [/banān/, 'banana'],
  [/mango/, 'mango'],
  [/\(miziņai\)/, 'zest'],
  [/citrona sula|laimas sula|citrons \(sulai\)/, 'lemonJuice'],
  [/apelsīn/, 'orange'],
  [/citron/, 'lemon'],
  [/laim/, 'lime'],
  [/kivi/, 'kiwi'],
  [/persiki/, 'peach'],
  [/ananāss/, 'pineapple'],
  [/arbūzs/, 'watermelon'],
  [/smiltsērkšķi/, 'seaBuckthorn'],
  [/ķirši \(no burkas\)|ķirši \(svaigi vai no burkas\)/, 'jarCherries'],
  [/ķirši/, 'cherries'],
  [/plūmes/, 'plums'],
  [/rabarber/, 'rhubarb'],
  [/vīnogas/, 'grapes'],
  [/cidonijas/, 'quince'],
  [/augļi/, 'fruit'],
  [/ogas|avenes|zemenes|mellenes|dzērvenes|brūklenes|jāņogas|upenes|ērkšķogas|aronijas|pīlādž/, 'berries'],
  // drinks
  [/bērzu sula/, 'birchSap'],
  [/kvass/, 'kvass'],
  [/vīns|prosecco/, 'wine'],
  [/alus/, 'beer'],
  [/rums|brendijs|balzams/, 'spirit'],
  [/liķieris/, 'liqueur'],
  [/aperol/i, 'aperitif'],
  // nuts and seeds
  [/valrieksti/, 'walnuts'],
  [/mandeles|mandeļu šķēlītes/, 'almonds'],
  [/pistācijas/, 'pistachio'],
  [/priežu rieksti/, 'pineNuts'],
  [/zemesrieksti/, 'peanuts'],
  [/čia/, 'chia'],
  [/psilija/, 'psyllium'],
  [/kokosriekstu skaidiņas/, 'coconut'],
  // sauces and condiments
  [/sojas mērce/, 'soy'],
  [/austeru mērce/, 'oyster'],
  [/mirin/, 'mirin'],
  [/miso/, 'miso'],
  [/gočudžanas|gochugaru/, 'gochujang'],
  [/karija pasta|doubanjiang|čili pupiņu pasta/, 'paste'],
  [/tamarind/, 'tamarind'],
  [/asā čili mērce|saldā čili mērce/, 'hotSauce'],
  [/bbq mērce/i, 'sweetSauce'],
  [/vusteršīras/i, 'worcester'],
  [/sinepes|sinepju/, 'mustard'],
  [/balzamiko/, 'balsamic'],
  [/etiķis/, 'vinegar'],
  // baking helpers
  [/sausais raugs/, 'yeastDry'],
  [/svaigs raugs/, 'yeastFresh'],
  [/želatīns/, 'gelatin'],
  [/iesals/, 'malt'],
  [/pieneņu ziedi/, 'flowers'],
  [/vaniļas pāksts/, 'zero'],
  [/vaniļas ekstrakts/, 'spice'],
  // herbs and spices (tiny amounts)
  [/dilles|pētersīļi|koriandrs|baziliks|piparmētras|rozmarīns|timiāns|salvija|citronzāle/, 'herb'],
  [/pipari|kanēl|kanēļ|muskat|ķimenes|kurkuma|ingvers|kardamon|krustnagliņas|anīss|majorāns|oregano|garam|karija pulveris|čili pārslas|čili pulveris|safrāns|piecu garšvielu|garšvielas|koriandrs/, 'spice'],
];

function findFood(name: string): FoodKey | null {
  const lower = name.toLowerCase();
  const first = lower.split(' vai ')[0];
  for (const text of first === lower ? [lower] : [first, lower]) {
    for (const [re, key] of RULES) if (re.test(text)) return key;
  }
  return null;
}

/** Grams for an amount in one of the site's units (see src/lib/format.ts). */
function grams(amount: number, unit: string, f: Food): number | null {
  const ml = (x: number) => x * (f.d ?? 1);
  switch (unit) {
    case 'g': return amount;
    case 'kg': return amount * 1000;
    case 'ml': return ml(amount);
    case 'l': return ml(amount * 1000);
    case 'ēd. k.': return ml(amount * 15);
    case 'tējk.': return ml(amount * 5);
    case 'tase': case 'tases': return ml(amount * 240);
    case 'gab.': case 'loksne': case 'loksnes': case 'galviņa': case 'galviņas': return amount * (f.pc ?? 100);
    case 'daiv.': return amount * 5;
    case 'saujiņa': case 'saujiņas': return amount * (f.h ?? 25);
    case 'šķēle': case 'šķēles': return amount * (f.sl ?? 25);
    case 'kāts': case 'kāti': return amount * 40;
    case 'zariņš': case 'zariņi': case 'lapiņa': case 'lapiņas': return amount;
    case 'lapa': case 'lapas': return amount * 10;
    case 'bumbiņa': case 'bumbiņas': return amount * 60;
    case 'bundža': case 'bundžas': return amount * (f.can ?? 400);
    case 'šķipsna': case 'šķipsnas': return amount * 0.5;
    default: return null;
  }
}

export interface Nutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface Ingredient {
  name: string;
  amount?: number;
  unit?: string;
}

/**
 * Nutrition for one serving, or null when the estimate would not be trustworthy:
 * an ingredient with an amount that we cannot weigh, or a total that makes no sense.
 */
export function nutritionPerServing(ingredients: Ingredient[], servings: number): Nutrition | null {
  const sum = [0, 0, 0, 0];
  for (const i of ingredients) {
    if (!i.amount) continue; // "salt and pepper to taste"
    const key = findFood(i.name);
    if (!key) return null;
    const f: Food = FOODS[key];
    const g = i.unit ? grams(i.amount, i.unit, f) : i.amount * (f.pc ?? 100);
    if (g == null) return null;
    const eaten = g * (f.eaten ?? 1);
    f.n.forEach((v, k) => (sum[k] += (v * eaten) / 100));
  }
  const s = Math.max(1, servings);
  const [calories, protein, fat, carbs] = sum.map((v) => v / s);
  if (calories < 5 || calories > 2500) return null;
  const r1 = (v: number) => Math.round(v * 10) / 10;
  return { calories: Math.round(calories), protein: r1(protein), fat: r1(fat), carbs: r1(carbs) };
}

/** For the build check: ingredient names with an amount that no rule recognises. */
export function unknownIngredients(ingredients: Ingredient[]): string[] {
  return ingredients.filter((i) => i.amount && !findFood(i.name)).map((i) => i.name);
}
