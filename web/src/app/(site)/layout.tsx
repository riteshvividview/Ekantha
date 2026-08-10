import type { Metadata } from 'next'
import '../globals.css'
import { SmoothScrollProvider } from '@/components/layout/SmoothScrollProvider'
import { TheatreStudioLoader } from '@/components/layout/TheatreStudioLoader'
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
// Fonts are loaded exactly as the source HTML pages load them — straight
// from Google Fonts' CDN via <link> tags — rather than via next/font, so
// the typography is guaranteed pixel-identical rather than approximated
// through a different loading mechanism. "Google Sans Flex" in particular
// isn't in next/font/google's bundled metadata (it's a newer variable
// font), so this also sidesteps having to special-case it.
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
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- this
            rule is a Pages Router-era check for per-page <Head> usage; this
            is the App Router *root* layout, so these tags are already
            site-wide, which is exactly what the rule is asking for. */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- see above */}
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
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
