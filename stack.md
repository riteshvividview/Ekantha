# Vana Ekantha — Next.js + Payload CMS rebuild

Source of truth for the tech stack, architecture, and page-by-page build
status of the Vana Ekantha rebuild. The site started as 12 static HTML files
in this folder (Home, About, Contact, Events, FAQs, FarmDining, FullHouse,
MangoHouse, Stay, StoneHouse, plus shared Navbar/Footer) — those stay in
place as the visual/copy reference until every page below is rebuilt and
you choose to remove them yourself; nothing here deletes them.

> **Note:** this file previously described a *different, unrelated* project
> (the Vivid View agency's own dark-green/lime/gold marketing site, which
> lives separately at `../VividView`). That content has been replaced —
> everything below is specific to Vana Ekantha.

## Tech stack

| Category | Tool | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router, TypeScript) | Chosen over Nuxt specifically because Payload CMS's admin panel + API only run inside a Next.js host — see "Architecture" below. |
| CMS | **Payload CMS 3** (embedded in the same Next.js app) | Admin panel at `/admin`, REST/GraphQL API under `/api`. Content is read via Payload's **Local API** (no separate HTTP hop) from the pages themselves. |
| Database | **Postgres via Supabase** (`@payloadcms/db-postgres`) | Payload connects with a direct Postgres connection string (`DATABASE_URI`), not the Supabase JS client. |
| File storage | **Supabase Storage** (`@payloadcms/storage-s3`, S3-compatible) | Media collection uploads land in a Supabase Storage bucket instead of local disk. |
| Smooth scroll | **Lenis** (`lenis/react`) | Wraps the whole public site; its raf loop is driven by GSAP's ticker rather than running its own, so it and ScrollTrigger stay in sync — see `src/components/layout/SmoothScrollProvider.tsx`. |
| Scroll-driven animation | **GSAP + ScrollTrigger** | Does the bulk of the real animation work — section reveals, parallax, the various per-page effects already designed in the HTML (bento reveals, mosaic hovers, staggered galleries, etc.), reimplemented as GSAP timelines. |
| Choreographed sequences | **Theatre.js** | Reserved for 1–2 hand-authored "idle breathing" moments (e.g. the Home hero). Keyframes can only be authored via the Studio GUI (dev-only, opens automatically) — there's no code-only path — so this stays an inert, ready-to-author scaffold until someone actually opens Studio and keyframes something. Scaffold: `src/lib/animations/theatre/project.ts`. |
| Vector icon micro-interactions | **Rive** (`@rive-app/react-canvas`) | No `.riv` assets exist yet — `src/components/RiveIcon.tsx` is a ready wrapper that falls back to an animated SVG/CSS icon (passed via the `fallback` prop) until real `.riv` files are commissioned. |
| 3D | **React Three Fiber** (`@react-three/fiber` + `@react-three/drei`) | React equivalent of the Vue-only TresJS used in the sibling VividView project. One tasteful accent (a small wireframe orb, `src/components/three/WireframeOrb.tsx`), not forced onto every page. |

## Architecture

**One app**, `web/` (this repo already has git initialized at the `Ekantha`
root — `web/` is a subfolder of it, not a separate repo). Payload is
installed directly into the Next.js app rather than run as a separate
service:

```
web/
  payload.config.ts          # Payload config: collections, globals, db, storage
  next.config.ts              # wrapped with withPayload()
  .env.example                 # committed; copy to .env (gitignored) and fill in
  src/
    app/
      (site)/                  # public site — owns its own root layout (html/body)
        layout.tsx              # fonts, SmoothScrollProvider, TheatreStudioLoader
        page.tsx                # Home (currently a placeholder — see status below)
      (payload)/                # Payload admin + API — owns its own root layout
        admin/[[...segments]]/   # admin UI
        api/                     # REST, GraphQL, GraphQL playground
      globals.css                # ported design tokens (see below)
    collections/                # Payload "schema", part 1 — repeating documents
      Users.ts Media.ts Stays.ts
    globals/                    # Payload "schema", part 2 — singleton pages
      SiteSettings.ts Navigation.ts Footer.ts Home.ts About.ts
      Contact.ts Events.ts Faqs.ts FarmDining.ts
    components/
      layout/                   # SmoothScrollProvider, TheatreStudioLoader
      three/                    # WireframeOrb
      RiveIcon.tsx
    lib/animations/             # gsap.ts (ScrollTrigger registration), theatre/
```

`(site)` and `(payload)` are **sibling root layouts** (Next.js's "multiple
root layouts" pattern) — there's deliberately no shared `layout.tsx` above
them, since Payload's own `RootLayout` renders a complete `<html>/<body>`
for the admin panel, separate from the public site's.

**Why `collections/` + `globals/` instead of one flat "schema" folder:**
Payload has two content shapes — `collections` (many similar documents,
each with its own URL) and `globals` (exactly one document, e.g. "the Home
page"). Only **Stays** is a true collection (Mango House / Stone House /
Full House — 3 documents, each gets its own route). Every other page is a
**global**, even though most have internal repeating sub-lists (FAQ
categories, gallery items, etc.) — those are array/group *fields* on that
one page's document, not separate collections.

## Design tokens — ported, not reinvented

`src/app/globals.css` is a verbatim port of the shared `:root` block and
typography primitives (`.display-xl`, `.section-title`, `.eyebrow`, `.btn`,
`.section-head`, `.reveal`) that appear identically across every source
HTML page — same hex values (`--white #fff`, `--silver #f3f4f6`,
`--ink #121214`, etc.), same class names.

**Fonts**: loaded via the same Google Fonts CDN `<link>` tags the HTML
pages already use (`Google Sans Flex` for display, `Instrument Serif` for
italic accents, `DM Sans` for body) — not via `next/font`, and not via the
`.otf` files sitting in `../fonts/` (NeueMontreal, Ivy Ora Display). Those
files turned out to be **unused** by any current page's CSS despite an
earlier memory note suggesting otherwise — every page's `:root` block was
checked directly and all of them declare the Google Sans Flex/Instrument
Serif/DM Sans system, including Home.html. Loading via `<link>` (rather
than self-hosting through `next/font/google`) also sidesteps "Google Sans
Flex" not being in `next/font`'s bundled metadata list (it's a newer
variable font).

## Environment

See `web/.env.example` for the full list with comments on where each value
comes from in the Supabase dashboard. Short version: `DATABASE_URI` is the
real database connection (Payload ↔ Postgres); `SUPABASE_URL` +
`SUPABASE_SERVICE_ROLE_KEY` are only used by the Media collection's storage
adapter (file uploads), not the database connection itself.

## Implementation status

- ✅ **Setup** — Next.js + Payload scaffolded, all collections/globals
  written, Lenis+GSAP sync verified, Theatre.js/Rive/R3F scaffolded and
  smoke-tested, TypeScript checks clean, `/admin` correctly reaches
  Payload's Postgres connection attempt (fails only because `.env` still
  has placeholder values — expected until real Supabase credentials are
  filled in).
- ⏳ **Pages** — none rebuilt yet. Build order: Home, About, Contact,
  Events, FAQs, Farm Dining, Stay (overview), Mango House, Stone House,
  Full House, Navbar, Footer. `Home`'s global schema is a first draft
  (flagged in `src/globals/Home.ts`) and will be finalized when that page
  is actually built.
- 🔲 **Not scoped yet**: `/hold-a-date` — multiple CTAs across the HTML
  link to it, but no such page exists anywhere in the source site.
