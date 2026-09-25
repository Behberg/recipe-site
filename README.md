# Dzērvene

A mobile-first Latvian recipe site: Latvian classics, sweets, jams and preserves, plus a directory of world cuisines. All site content and UI is in Latvian.

Built with [Astro](https://astro.build) as a fully static site for **Netlify**, with a Git-based admin panel ([Sveltia CMS](https://github.com/sveltia/sveltia-cms)) at `/admin/` for adding recipes without touching code.

## Features

- **Mobile first**: app-style bottom tab bar, horizontal swipe rails, large tap targets, safe-area support, dark mode.
- **Cuisine directory**: 26 cuisines grouped by continent (Latviešu, Itāļu, Franču, Spāņu, Grieķu, Gruzīnu, Japāņu, Ķīniešu, Indiešu, Taizemes, Korejiešu, Meksikāņu and more). Admin can add more.
- **Categories**: breakfasts, soups, mains, salads, breads and cookies, sweets, jams and preserves, drinks (admin can add more).
- **Instant search and filters** (category, cuisine, time, difficulty), diacritic-insensitive, mirrored in the URL.
- **240+ recipes** from 26 cuisines: savoury, sweets, baking, jams, preserves and drinks.
- **Recipe page**: servings scaler (or ½×/1×/2×/3× for jars and batches), and "cik tev ir?": tap any amount, type what you actually have (e.g. 650 g strawberries) and the whole recipe is recalculated, with g/kg and ml/l conversion.
- **Kitchen timers**: auto-detected from steps ("vāra 10 minūtes"), several at once, keep running across pages and reloads, repeating chime and vibration until dismissed, visible inside cooking mode.
- **Cooking mode**: full-screen, one step at a time, swipe between steps, keeps the screen awake.
- **Kas ir ledusskapī?** (`/ledusskapis/`): pick the products you have; recipes are grouped into "ready now", "missing 1" and "missing 2". Matching uses the editable catalogue in `src/data/ledusskapis.json` (logic in `src/lib/fridge.ts`).
- **Recepšu Tinderis** (`/tinderis/`): pick a mood, swipe a deck of 12, liked recipes go head to head until one winner is left.
- **Svētku galds + calendar** (`/svetki/`): occasions with date rules (fixed dates, Easter-relative like Meteņi, "2nd Sunday of May" like Mātes diena). The browser calculates the next dates, sorts the calendar and shows the upcoming occasion's recipes on the home page when it is within its lead time.
- **Favourites** (Izlase) stored on the device, no account needed.
- **SEO**: schema.org `Recipe` data (Google rich results), sitemap, Open Graph, canonical URLs.
- **Images**: photos uploaded in the admin are resized and converted on the fly by the Netlify Image CDN. Recipes without a photo get an illustrated emoji card.
- **Google AdSense ready**, switched off until configured (see below).

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
| Cuisines | `src/content/cuisines/*.json` | JSON |
| Categories | `src/content/categories/*.json` | JSON |
| Occasions (Svētku galds) | `src/content/svetki/*.json` | JSON, with date rule and lead days |
| Fridge products | `src/data/ledusskapis.json` | JSON (admin: Iestatījumi > Ledusskapja produkti) |
| Uploaded photos | `public/images/recipes/` | JPG/PNG/WebP |

When you add a recipe with an unusual ingredient, check that the fridge page recognises it: each product in the fridge catalogue has keywords (word starts without diacritics, e.g. `kartupel`). Ingredients that match nothing are simply ignored by the fridge matcher.

The schema lives in `src/content.config.ts`; the admin form mirrors it in `public/admin/config.yml`. If you add a field, update both.

## Google AdSense

Ads are designed to stay out of the way: clearly labelled "Reklāma", separated from recipe content, space reserved in advance (no layout jumps), loaded only after the page itself has loaded and only when a slot is about to scroll into view. There are no pop-ups, sticky or overlay ads, and nothing inside cooking mode.

Placements:

- `inFeed`: between recipe cards in lists (every 8 cards, hidden while filtering) and once on the home page.
- `recipeTop`: on recipe pages, after the intro and before the ingredients.
- `recipeBottom`: on recipe pages, after the steps and tips.

To switch ads on:

1. Apply for AdSense with the live site and wait for approval.
2. In AdSense, create three **Display** ad units (responsive) and note their slot IDs. Keep **Auto ads off** so Google does not inject extra units.
3. Edit `src/site.config.ts`: set `ADS.client` (e.g. `ca-pub-1234567890123456`) and the three slot IDs.
4. Edit `public/ads.txt`: uncomment the line and put in your publisher ID.
5. Latvia is in the EU, so a Google-certified consent banner is required. In AdSense go to **Privacy & messaging > European regulations** and publish a GDPR message; it is shown automatically by the AdSense script. The privacy policy page is at `/privatums/`.

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
