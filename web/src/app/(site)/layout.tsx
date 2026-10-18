import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import '../globals.css'
import { qalisten } from '@/lib/fonts'
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- this
            rule is a Pages Router-era check for per-page <Head> usage; this
            is the App Router *root* layout, so these tags are already
            site-wide, which is exactly what the rule is asking for. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cascadia+Code:ital,wght@0,200..700;1,200..700&family=Fraunces:ital,wght@0,400;1,400..600&family=Montserrat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Clash Display (headlines) + General Sans (body) from Fontshare —
            free-license stand-ins for noomoagency.com's Neue Machina / Neue
            Haas Grotesk Display pairing, which are paid commercial fonts we
            don't hold a license for. Loaded the same way as Cascadia Code
            above: a single hosted stylesheet, not next/font/local, since
            there's no font file in this repo to subset. */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=general-sans@400,500,600,700&display=swap"
          rel="stylesheet"
        />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.3.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body className={qalisten.variable}>
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
