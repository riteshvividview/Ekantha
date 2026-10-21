import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import '../globals.css'
import { qalisten, clashDisplay, generalSans, montserrat, fraunces } from '@/lib/fonts'
import { INITIAL_LOAD_COOKIE } from '@/lib/initialLoadCookie'
import { SmoothScrollProvider } from '@/components/layout/SmoothScrollProvider'
import { TheatreStudioLoader } from '@/components/layout/TheatreStudioLoader'
import { PageTransitionOverlay } from '@/components/chrome/PageTransitionOverlay'
import { InitialLoadScreen } from '@/components/chrome/InitialLoadScreen'
import { InteractionEffects } from '@/components/chrome/InteractionEffects'
import { IdleNudge } from '@/components/chrome/IdleNudge'
import { Navbar } from '@/components/chrome/Navbar'
import { Footer } from '@/components/chrome/Footer'
import { getPayloadClient } from '@/lib/payload'
import { safeFetch } from '@/lib/safeFetch'

// Every page under (site) reads from Payload on each request — that's
// the "edit in the CMS → database updates → page updates" behavior the
// whole point of this rebuild. Without forcing dynamic rendering, Next
// would be free to prerender this layout once at build time and cache
// that snapshot, so CMS edits wouldn't show up until the next deploy.
//
// This layout (and the nav/footer data fetched here) stays mounted across
// client-side navigations within (site) — see PageTransitionOverlay — so
// in practice nav/footer only refetch on a hard reload, not every click.
// Each page.tsx below it is still re-rendered fresh per navigation.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Vana Ekantha — a farmstay for intentional disconnection',
  description: 'Vana Ekantha — a farmstay for intentional disconnection. The Deccan, India.',
}

// This is the public site's own root layout — a sibling to (payload)'s root
// layout, not a child of it. Next.js's "multiple root layouts" pattern:
// each top-level route group owns its full <html>/<body>, and there is no
// shared layout.tsx directly in src/app/ above them (that would render two
// nested <html> tags — one from here, one from Payload's own RootLayout).
//
// Cascadia Code is loaded straight from Google Fonts' CDN via a <link>
// tag rather than next/font/google — matches how every other CDN-hosted
// font in this app is loaded (preconnect + a single stylesheet link), so
// there's one consistent pattern instead of two.
export default async function SiteRootLayout({ children }: { children: React.ReactNode }) {
  // getPayloadClient() itself is what throws when DATABASE_URI isn't a
  // real, reachable database yet — it has to be called *inside* each
  // safeFetch callback (not once, outside, and reused) so that failure is
  // caught too, not just failures from the findGlobal call after it.
  const [nav, footer, cookieStore] = await Promise.all([
    safeFetch(async () => (await getPayloadClient()).findGlobal({ slug: 'navigation', depth: 1 })),
    safeFetch(async () => (await getPayloadClient()).findGlobal({ slug: 'footer', depth: 1 })),
    cookies(),
  ])
  // Read here, server-side, rather than from sessionStorage client-side —
  // a cookie rides along with the request itself, so on a reload the
  // server already knows this browser has seen the loader before and can
  // leave it out of the HTML entirely. sessionStorage can't do that: it's
  // only readable after the page has already painted, which is exactly
  // the gap that let the loader flash back in on every reload.
  const hasLoadedBefore = cookieStore.get(INITIAL_LOAD_COOKIE)?.value === '1'

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        {/* Clash Display, General Sans, Montserrat and Fraunces used to
            load via two render-blocking <link rel="stylesheet"> tags
            (Google Fonts + Fontshare, each its own DNS/TLS round trip)
            plus their preconnects. All four are self-hosted and inlined
            at build time now via next/font (see src/lib/fonts.ts) — no
            runtime request to either origin, blocking or not. Cascadia
            Code, the one font that link also loaded, was dead weight: no
            CSS has referenced it since --font-accent was retired
            site-wide (see the note in globals.css), so it's just gone,
            not migrated to next/font. */}
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.3.0/css/all.min.css" rel="stylesheet" />
        {/* Warms the Reach (location/map) section's two heaviest requests
            during the browser's idle time right after the initial page
            loads — well before that section actually mounts its map,
            let alone before a visitor scrolls anywhere near it. Without
            this, a visitor who reaches that pinned section before its own
            on-mount fetch + WebGL setup has finished would see the map
            "catch up" mid-scroll (a jump as the camera/markers snap to
            wherever the scroll position already is) instead of already
            being ready. The style JSON itself is cached for an hour
            (see the map-style route's Cache-Control), so this prefetch is
            what that cache actually gets warmed by. */}
        <link rel="prefetch" href="/api/map-style" as="fetch" crossOrigin="anonymous" />
        <link rel="prefetch" href="/maplibre/maplibre-gl-worker.mjs" as="script" />
      </head>
      <body
        className={`${qalisten.variable} ${clashDisplay.variable} ${generalSans.variable} ${montserrat.variable} ${fraunces.variable}`}
      >
        <InitialLoadScreen skip={hasLoadedBefore} />
        <PageTransitionOverlay />
        <TheatreStudioLoader />
        <InteractionEffects />
        <IdleNudge />
        <SmoothScrollProvider>
          {nav.data && <Navbar data={nav.data} />}
          {children}
          {footer.data && <Footer data={footer.data} nav={nav.data ?? undefined} />}
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
