import type { Metadata } from 'next'
import localFont from 'next/font/local'
import '../globals.css'
import { SmoothScrollProvider } from '@/components/layout/SmoothScrollProvider'
import { TheatreStudioLoader } from '@/components/layout/TheatreStudioLoader'
import { PageTransitionOverlay } from '@/components/chrome/PageTransitionOverlay'
import { CursorDot } from '@/components/chrome/CursorDot'
import { InteractionEffects } from '@/components/chrome/InteractionEffects'
import { HoldPill } from '@/components/chrome/HoldPill'
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

// Telegraf is the brand's own font file (not on Google Fonts), so it's
// self-hosted via next/font/local rather than a <link> tag — that gets it
// inlined as a preloaded, subsetted @font-face with font-display: swap
// automatically, no extra round-trip to a CDN and no render-blocking
// request, which is strictly faster than the <link>-tag approach used
// below for Cascadia Code (kept as a plain Google Fonts <link>, matching
// this app's established convention for CDN-hosted fonts — see the
// comment on <html> below).
const telegraf = localFont({
  src: [
    { path: '../../fonts/Telegraf-UltraLight.woff', weight: '200', style: 'normal' },
    { path: '../../fonts/Telegraf-Regular.woff', weight: '400', style: 'normal' },
    { path: '../../fonts/Telegraf-UltraBold.woff', weight: '800', style: 'normal' },
  ],
  variable: '--font-telegraf',
  display: 'swap',
})

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
  const [nav, footer] = await Promise.all([
    safeFetch(async () => (await getPayloadClient()).findGlobal({ slug: 'navigation', depth: 1 })),
    safeFetch(async () => (await getPayloadClient()).findGlobal({ slug: 'footer', depth: 1 })),
  ])

  return (
    <html lang="en" data-scroll-behavior="smooth" className={telegraf.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- this
            rule is a Pages Router-era check for per-page <Head> usage; this
            is the App Router *root* layout, so these tags are already
            site-wide, which is exactly what the rule is asking for. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cascadia+Code:ital,wght@0,200..700;1,200..700&display=swap"
          rel="stylesheet"
        />
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.3.0/css/all.min.css" rel="stylesheet" />
      </head>
      <body>
        <PageTransitionOverlay />
        <TheatreStudioLoader />
        <CursorDot />
        <InteractionEffects />
        <HoldPill />
        <IdleNudge />
        <SmoothScrollProvider>
          {nav.data && <Navbar data={nav.data} />}
          {children}
          {footer.data && <Footer data={footer.data} />}
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
