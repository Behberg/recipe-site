# Dzērvene

A mobile-first Latvian recipe site: Latvian classics, sweets, jams and preserves, plus a directory of world cuisines. All site content and UI is in Latvian.

Built with [Astro](https://astro.build) as a fully static site for **Netlify**, with a Git-based admin panel ([Sveltia CMS](https://github.com/sveltia/sveltia-cms)) at `/admin/` for adding recipes without touching code.

## Features

- **Mobile first**: app-style bottom tab bar, horizontal swipe rails, large tap targets, safe-area support, dark mode.
- **Cuisine directory**: 26 cuisines grouped by continent (Latviešu, Itāļu, Franču, Spāņu, Grieķu, Gruzīnu, Japāņu, Ķīniešu, Indiešu, Taizemes, Korejiešu, Meksikāņu and more). Admin can add more.
- **Categories**: breakfasts, soups, mains, salads, breads and cookies, sweets, jams and preserves, drinks (admin can add more).
- **Vegan section** (`/veganas-receptes/`): every recipe tagged `vegāns`, with its own page, home page rail and header link. Tag a recipe `vegāns` and it appears there.
- **Kitchen guides** (`/padomi/`): longer articles with photos (cookware, knives, measuring, substitutions, sterilising jars). One JSON file per article in `src/content/guides/` with the text in all four languages; photos go in `public/images/guides/`. The jar guide keeps its old address `/burku-sterilizesana/` through the `path` field.
- **Personality quizzes** (`/kvizi/`): one JSON file per quiz in `src/content/quizzes/`.
- **Instant search and filters** (category, cuisine, time, difficulty), diacritic-insensitive, mirrored in the URL.
- **670+ recipes** in Latvian, English, Russian and Lithuanian: Latvian classics, everyday home cooking, sweets, baking, jams, preserves and drinks, plus dishes from 26 cuisines. Everyday dishes that belong to no particular country simply have no cuisine.
- **Recipe page**: servings scaler (or ½×/1×/2×/3× for jars and batches), and "cik tev ir?": tap any amount, type what you actually have (e.g. 650 g strawberries) and the whole recipe is recalculated, with g/kg and ml/l conversion.
- **Kitchen timers**: auto-detected from steps ("vāra 10 minūtes"), several at once, keep running across pages and reloads, repeating chime and vibration until dismissed, visible inside cooking mode.
- **Cooking mode**: full-screen, one step at a time, swipe between steps, keeps the screen awake.
- **Kas ir ledusskapī?** (`/ledusskapis/`): pick the products you have; recipes are grouped into "ready now", "missing 1" and "missing 2". Matching uses the editable catalogue in `src/data/ledusskapis.json` (logic in `src/lib/fridge.ts`).
- **Recepšu Tinderis** (`/tinderis/`): pick a mood, swipe a deck of 12, liked recipes go head to head until one winner is left.
- **Svētku galds + calendar** (`/svetki/`): occasions with date rules (fixed dates, Easter-relative like Meteņi, "2nd Sunday of May" like Mātes diena). The browser calculates the next dates, sorts the calendar and shows the upcoming occasion's recipes on the home page when it is within its lead time.
- **Favourites** (Izlase) stored on the device, no account needed.
- **SEO**: schema.org `Recipe` data (Google rich results), sitemap, Open Graph, canonical URLs.
- **Images**: photos uploaded in the admin are resized and converted on the fly by the Netlify Image CDN. Until a recipe has a photo it shows an illustrated dish icon (jar, soup bowl, cake slice, pīrāgi and more, recoloured per dish; see `src/lib/dishIcons.ts`) or a matching emoji. The admin sets these with the Ilustrācija fields.
- **Stock photos**: `node scripts/photo-candidates.mjs pexels` (or `pixabay`) searches for recipes without a photo and writes contact sheets to `.photos/<source>/`; list the chosen number per recipe in `.photos/<source>/picks.json` and run `node scripts/photo-apply.mjs <source>` to download them with photographer credit. Keys go in `.env` as `PEXELS_API_KEY` and `PIXABAY_API_KEY`.
- **Google AdSense**: the script and Auto ads run site wide; the hand placed units switch on with one ID (see below).

## Development

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # outputs to dist/
npx astro check   # type check
```

In dev mode, dashed boxes show where ads will appear. They are not rendered in production until AdSense is configured.

## Deploying to Netlify

1. In Netlify: **Add new project > Import an existing project > GitHub** and pick `Behberg/recipe-site`.
2. Build settings are read from `netlify.toml` (`npm run build`, publish `dist`, Node 22). Nothing to change.
3. Deploy. Every push to `main` (including admin panel edits) triggers a new deploy automatically.
4. When you attach a custom domain, it is picked up automatically for the sitemap and canonical URLs (Netlify provides it as the `URL` build variable).

## Admin panel (`/admin/`)

The admin edits Markdown and JSON files in this GitHub repo; Netlify rebuilds the site in about a minute. The admin needs a GitHub account with write access to the repo (add them under **GitHub > Settings > Collaborators**).

Pick one way to sign in:

### Option A: "Sign in with GitHub" (recommended)

1. On GitHub: **Settings > Developer settings > OAuth Apps > New OAuth App**
   - Homepage URL: your site URL, e.g. `https://dzervene.netlify.app`
   - Authorization callback URL: `https://api.netlify.com/auth/done`
2. Copy the Client ID and generate a Client Secret.
3. In Netlify: **Project configuration > Access & security > OAuth > Install provider > GitHub**, paste both values.
4. Open `https://your-site/admin/` and click **Sign in with GitHub**.

### Option B: personal access token

1. On GitHub: **Settings > Developer settings > Fine-grained tokens > Generate new token**, restricted to this repository with **Contents: Read and write**.
2. On `/admin/`, choose **Sign in with Token** and paste it.

### Content structure

| What | Where | Format |
| --- | --- | --- |
| Recipes | `src/content/recipes/*.md` | YAML front matter + Markdown intro |
| Cuisines | `src/content/cuisines/*.json` | JSON (a recipe's cuisine is optional) |
| Categories | `src/content/categories/*.json` | JSON |
| Guides (Virtuves padomi) | `src/content/guides/*.json` | JSON, text in all four languages (edited in the repo, not in the admin) |
| Quizzes | `src/content/quizzes/*.json` | JSON, text in all four languages |
| Occasions (Svētku galds) | `src/content/svetki/*.json` | JSON, with date rule and lead days |
| Fridge products | `src/data/ledusskapis.json` | JSON (admin: Iestatījumi > Ledusskapja produkti) |
| Uploaded photos | `public/images/recipes/` | JPG/PNG/WebP |

When you add a recipe with an unusual ingredient, check that the fridge page recognises it: each product in the fridge catalogue has keywords (word starts without diacritics, e.g. `kartupel`). Ingredients that match nothing are simply ignored by the fridge matcher.

The schema lives in `src/content.config.ts`; the admin form mirrors it in `public/admin/config.yml`. If you add a field, update both.

## Google AdSense

The AdSense script loads on every page (`ADS.client` in `src/site.config.ts`, publisher line in `public/ads.txt`), so **Auto ads** work as soon as they are enabled in AdSense. The hand placed units below are extra, and they are the ones with reserved space and the best viewability on phones. They render only once a slot ID is set.

To switch the placed units on:

1. In AdSense go to **Ads > By ad unit > Display ads**, create one responsive unit and copy its `data-ad-slot` number.
2. Put it in `ADS.fallbackSlot` in `src/site.config.ts`. Every placement uses it.
3. Optional: create a unit per placement and fill `ADS.slots` to see in AdSense reports which place earns what.

Placements (`ADS.slots`):

| Slot | Where |
| --- | --- |
| `inFeed` | Between recipe cards in lists (every `ADS.feedEvery` cards, hidden while filtering), three times on the home page, in the guides list |
| `listBottom` | End of recipe lists, cuisines, occasions and the quiz list |
| `recipeTop` | Recipe page, after the intro and before the ingredients |
| `recipeMid` | Recipe page on phones only, between the ingredients and the method |
| `recipeBottom` | Recipe page, after the steps and tips |
| `recipeEnd` | Recipe page, after the related recipes |
| `quiz`, `quizResult` | Quiz page above the other quizzes, result page after the recipes |
| `article` | Guides: between sections and at the end |

How the units behave (`AdSlot.astro`, `AdsLoader.astro`): labelled "Reklāma", 280 px reserved so the page does not jump, full width on phones, requested only when about one screen away, hidden again if Google has nothing to show. Nothing is placed inside cooking mode, dialogs or next to buttons.

Recommended Auto ads settings for phones (AdSense > Ads > By site > edit): **Anchor ads on**, **Vignette ads on**, in page formats on, ad load in the middle of the slider to start with. The site moves its bottom tab bar and sticky header next to an anchor ad instead of under it (`--anchor-ad-bottom` / `--anchor-ad-top`, set in `AdsLoader.astro`).

Latvia is in the EU, so a Google certified consent banner is required: **Privacy & messaging > European regulations** in AdSense. It is shown by the AdSense script, and the footer has a "cookie settings" button to reopen it. The privacy policy page is at `/privatums/`.

---

## Administratora ceļvedis (latviski)

**Kā pievienot jaunu recepti**

1. Atver `https://tava-vietne/admin/` un pieslēdzies.
2. Kreisajā pusē izvēlies **Receptes** un spied **New**.
3. Aizpildi laukus: nosaukums, apraksts, virtuve, kategorija, laiki, porcijas.
4. **Sastāvdaļas**: katrai sastāvdaļai ieraksti nosaukumu, daudzumu (tikai skaitli, piem. `0.5`) un mērvienību. Lauks "Grupa" ļauj sadalīt, piemēram, "Mīklai" un "Pildījumam".
5. **Soļi**: viens solis, viena darbība. Ja solī ir minēts laiks ("vāra 10 minūtes"), lapā automātiski parādās taimera poga.
6. Pievieno foto (nav obligāti). Ja foto nav, tiek rādīta emocijzīme.
7. Spied **Save**. Pēc aptuveni minūtes recepte ir redzama vietnē.

Ievārījumiem, cepumiem un citiem ēdieniem, ko gatavo partijās, aizpildi lauku **Daudzums** (piem. "4 burkām pa 0,5 l"). Tad porciju vietā lapā tiek rādītas pogas ½×, 1×, 2×, 3×.

Lai recepti vēl nerādītu, atzīmē **Melnraksts**. Lai to izceltu sākumlapā, atzīmē **Izcelt sākumlapā**.

**Svētku galds**

Katrai receptei laukā **Svētki** var atzīmēt, kuriem svētkiem tā der. Kad svētki tuvojas (cik dienas iepriekš, nosaka lauks „Cik dienas iepriekš rādīt sākumlapā”), sākumlapā automātiski parādās šo svētku receptes. Jaunus svētkus pievieno sadaļā **Svētku galds**.
