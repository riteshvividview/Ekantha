# Reference: thevividview.in — Design & Content Teardown

Source of truth for the visual language, copy, and animation techniques we
are replicating for the Vivid View homepage rebuild. Extracted directly from
the live site's computed styles and DOM on 2026-08-04 via the Claude in
Chrome extension.

**Scope note:** we are building the **homepage only** for now. The site's
other routes (`/our-work`, `/who-are-we`, `/our-services`, `/lets-talk`)
exist on the live reference and are linked from the nav, but are out of
scope until explicitly requested — for now those nav items can be plain
links/placeholders.

## Tech stack observed on the reference site

| Category | Tool | Notes |
|---|---|---|
| Page builder | Framer | we are NOT using this — replacing with Nuxt |
| Fonts | Google Fonts + custom | Glacial Indifference Bold, Inter Display, Montserrat, Work Sans all loaded |
| CDN | Framer's own hosting | |

## Our build stack (unchanged)

| Category | Tool |
|---|---|
| Framework | Nuxt 3 |
| Smooth scroll | Lenis |
| Scroll-driven animation (reveals/parallax/pin/wipe) | GSAP + ScrollTrigger |
| Choreographed/cinematic sequences | Theatre.js |
| Vector icon micro-interactions | Rive (`@rive-app/canvas`) |
| 3D | Three.js via TresJS (Vue/Nuxt wrapper) |
| CMS | Payload CMS (self-hosted, Postgres) |

## Color palette (exact rgb → hex, captured via computed styles)

```css
--color--bg-dark:      #002408   /* rgb(0, 36, 8) — primary background, nearly the whole page */
--color--lime:         #C9E265   /* rgb(201, 226, 101) — "WE ARE" headline, nav icon accents, input bg tint */
--color--lime-muted:   #9FB866   /* secondary/hover lime variant (per brand reference; not yet observed firing on homepage — confirm on other routes before relying on it) */
--color--gold:         #FFDE59   /* rgb(255, 222, 89) — "VIVID VIEW" wordmark, "HIRE US" label, Subscribe button bg */
--color--maroon:       #B8293D   /* rgb(184, 41, 61) — "HIRE US" circular badge background */
--color--white:        #FFFFFF   /* headline text ("LET'S CREATE TOGETHER"), body copy on dark bg */
```

**Usage pattern**: unlike the old landonorris reference, Vivid View's
homepage does **not** alternate light/dark section backgrounds — it is a
single dark-green (`#002408`) canvas from hero through footer. Color comes
from accent text and shapes on top of that dark field: lime for the "WE ARE"
line, gold for the wordmark and CTAs, maroon for the one circular "HIRE US"
badge. There is no light/cream section on the homepage.

## Typography

```css
font-family: "Glacial Indifference Bold", "Glacial Indifference Bold Placeholder", sans-serif;
/* weight 400 used for "WE ARE" / nav links / "our work" labels (visually bold regardless of weight value — the font itself is a bold-cut face) */
/* weight 700 used for "Vivid view" wordmark */

font-family: "Inter Display", "Inter Display Placeholder", sans-serif;
/* weight 800 — big "Let's Create" statement headline */
/* weight 500 — subscribe strap line body copy */

font-family: Montserrat, "Montserrat Placeholder", sans-serif;
/* weight 700, 24px — "Hire Us" button label */

font-family: "Work Sans", sans-serif;
/* loaded site-wide via Google Fonts, weights 400/500 — reserve for general body/UI text not covered by the above (footer fine print, form placeholders) */
```

Notes:
- "Glacial Indifference Bold" and "Inter Display" are the two Framer
  "placeholder" font names — Framer swaps in a real hosted font behind
  these names at runtime. For our Nuxt build we should self-host the actual
  open-source equivalents:
  - **Glacial Indifference** — free/open display sans, available from
    multiple font distributors; use directly, no licensing blocker.
  - **Inter Display** — part of the open-source Inter family (SIL OFL),
    free to self-host.
  - **Montserrat** and **Work Sans** — both Google Fonts, open source, free
    to self-host.
- No paid/licensed font (no "Brier") is needed for this rebuild — everything
  observed is open source. This removes the licensing blocker that existed
  in the old landonorris-based plan.

### Approximate type scale (px, from computed styles — not exposed as CSS custom properties on the live site, so these are observed values to treat as a starting scale)

```css
--text--hero-statement: 100px   /* "Let's Create" — Inter Display 800 */
--text--headline:        80px   /* "WE ARE" / "Vivid view" wordmark — Glacial Indifference Bold */
--text--nav:              26px  /* "our work" style nav labels */
--text--btn:               24px /* "Hire Us" button — Montserrat 700 */
--text--body:              16px /* subscribe strap line — Inter Display 500 */
--text--eyebrow:           12px /* small uppercase micro-labels */
```

## Spacing / shape notes

- Buttons/badges use fully rounded pill/circle shapes (`border-radius: 500px`
  observed on the "Hire Us" link wrapper) — not the notch-clip corner style
  from the old reference. Use `border-radius: 9999px` (or a circle) for CTA
  buttons, not `clip-path` notches.
- The "VIVID VIEW" wordmark card in the hero sits in a rounded-corner block
  in the bottom-right of the hero, overlapping the photo collage.
- Small decorative icons sit next to each nav label (clover, sunburst/flower,
  gear, flower) — treat these as a custom icon set (good candidate for Rive
  or simple animated SVGs), not stock icon-font glyphs.

## Homepage section-by-section breakdown

1. **Hero** — dark green (`#002408`) background. Nav bar: `OUR WORK`,
   `WHO ARE WE?`, `OUR SERVICES`, `LET'S TALK`, each with a small decorative
   icon. Large "WE ARE" headline in lime (`#C9E265`) sits over a photo
   collage/grid background (mixed client work stills — product shots, a
   "COMING SOON" marquee tile, a "STAY TUNED" cloud/door tile, social post
   mockups). Centered overlay text "AN ALL IN-ONE CREATIVE AGENCY" mixes
   italic and upright weights across two lines. Bottom-right: a rounded dark
   card containing the "VIVID VIEW" wordmark in gold (`#FFDE59`), overlapping
   the photo grid.
2. **"Let's Create Together" / CTA section** — same dark background. Small
   "VIVID" serif-styled logo mark centered above the headline. Huge white
   two-line headline "LET'S CREATE TOGETHER" (Inter Display 800). A maroon
   (`#B8293D`) circular badge is pinned centered over the headline with the
   label "HIRE US" in gold Montserrat 700, linking to `/lets-talk`. The same
   4-item nav repeats below the headline.
3. **Footer** — still on the same dark background, no section break.
   Left: "Subscribe to Vivid marketers - Making your business more Vivid"
   strap line; right: email input (`your@email.com` placeholder, lime-tinted
   background) + gold "Subscribe" pill button. Below that: "BLOGS" link,
   phone (`+91 90002 19712`), email (`contact@thevividview.in`), and address
   (`1st Floor, Galton Centre, Vittal Rao Nagar, HITEC City, Hyderabad,
   Telangana 500081`, linked to Google Maps). Right side: social icons
   (Instagram, Facebook, LinkedIn) in lime circular badges. Bottom:
   `© 2026 TheVividView.in`.

## Exact homepage copy (use verbatim)

- Nav: `OUR WORK` · `WHO ARE WE ?` · `OUR SERVICES` · `LET'S TALK`
- Hero: `WE ARE` / `AN ALL IN-ONE CREATIVE AGENCY` / `VIVID VIEW`
- CTA section: `VIVID` (small logo mark) / `LET'S CREATE TOGETHER` /
  `HIRE US`
- Footer strap line: `Subscribe to Vivid marketers - Making your business
  more Vivid`
- Footer email input placeholder: `your@email.com`
- Footer button: `Subscribe`
- Footer links: `BLOGS`
- Contact: `+91 90002 19712` · `contact@thevividview.in` ·
  `1st Floor, Galton Centre, Vittal Rao Nagar, HITEC City, Hyderabad,
  Telangana 500081`
- Copyright: `© 2026 TheVividView.in`
- Page `<title>`: `Vivid View - Branding and Digital Marketing Agency`

## Key implementation notes for our build

- Smooth scroll (Lenis) must be initialized before GSAP ScrollTrigger, and
  Lenis's `scroll` event must drive `ScrollTrigger.update()` — they need to
  be wired together explicitly, they don't sync automatically out of the box.
- The homepage is short (~2 viewport heights on the reference) and single-
  background — most of the animation budget should go into the hero photo
  collage entrance, the "WE ARE" reveal, and the "HIRE US" badge motion in
  the CTA section, rather than big per-section background transitions (there
  aren't any on this page).
- Reserve Theatre.js for the hero collage/headline intro sequence if it
  needs hand-keyframing; use GSAP ScrollTrigger for anything scroll-scrubbed
  (e.g. subtle parallax on the collage tiles as the hero pins/settles).
- The nav's decorative icons (clover, sunburst, gear, flower) are good Rive
  candidates for subtle idle/hover motion, but plain animated SVG is a fine
  fallback if no `.riv` assets are commissioned.
- No licensing blocker remains — all observed fonts are open source and can
  be self-hosted directly.

## Implementation status (homepage v1)

The homepage described above is built. Notes for picking this back up:

- **Components**: `app/components/HeroSection.vue` (section 1),
  `app/components/CtaFooterSection.vue` (section 2 + footer),
  `app/components/SiteNav.vue` (shared 4-item nav), icon SVGs under
  `app/components/icons/`. Composed in `app/pages/index.vue`.
- **Hero background video**: the collage in section 1 is actually a single
  looping mp4 on the live site (not separate photos — confirmed via DOM
  inspection, only one `<video>` element), pre-edited as a montage. Drop the
  real file at `public/videos/hero-reel.mp4` (see the README there) — the
  `<video>` element is already wired up with a CSS fallback showing while
  it's missing.
- **Serif accent font**: the "CREATIVE AGENCY" line uses `--font-serif`
  (Playfair Display, self-hosted via `@fontsource/playfair-display`) as the
  closest open-source match — the live site's exact serif family wasn't
  confirmed via computed styles (video didn't render in the automated
  browser session), so treat this as an approximation, not a verified match.
- **Corner-notch cards**: "WE ARE" and "VIVID VIEW" use the classic concave-
  corner technique (a bg-colored circle positioned exactly at the shared
  corner point, half over the card / half over the media frame) rather than
  `clip-path` — see `.notch` in `HeroSection.vue`.
- **Animation stack actually wired up**:
  - **Lenis + GSAP ScrollTrigger**: `app/plugins/smooth-scroll.client.ts`
    (unchanged from initial setup).
  - **GSAP**: does the real work — hero entrance timeline and CTA
    scroll-triggered reveals/idle float live in
    `app/composables/usePageAnimations.ts`.
  - **Three.js / TresJS**: a small rotating wireframe icosahedron
    (`app/components/ThreeOrb.client.vue` + `OrbMesh.vue`, split across two
    components because `useLoop()` must run in a child of `<TresCanvas>`,
    not alongside it) renders inside the "HIRE US" badge for a bit of
    depth. Uses the official `@tresjs/nuxt` module (auto-imports
    `TresCanvas`/`Tres*` elements, configures the Vue compiler).
  - **Theatre.js**: deliberately *not* faking hand-authored keyframes —
    `@theatre/core` has no code-only way to set them, only the Studio GUI
    does. `app/plugins/theatre.client.ts` opens the Studio panel in dev
    only; `app/composables/useHeroTheatre.ts` wires a "Media Frame" object
    (scale/rotate) ready to be keyframed there for an idle "breathing"
    effect. Until authored (Studio → export → save as
    `app/theatre-state.json` → pass as `state` to `getProject()`), it's an
    inert no-op scaffold, not a working effect. Don't mistake the visible
    Studio panel in dev for a finished feature.
- **Known interop gotchas hit during the build** (useful if debugging
  similar issues later): dynamic `import('@theatre/studio')` needs a
  defensive check for `mod.default.initialize` vs `mod.default.default.
  initialize` depending on bundler CJS interop; `@tresjs/core` in this
  version exports `useLoop` (not `useRenderLoop`); components in
  `components/icons/` auto-import as `IconsIconClover` etc. (Nuxt prefixes
  by subdirectory) so they're imported explicitly instead of relied on for
  auto-import; a `<video>`'s static `src` gets treated as a build-time
  asset import by Vite's template transform unless bound with `:src`.
