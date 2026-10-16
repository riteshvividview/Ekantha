import { NextResponse } from 'next/server'

const UPSTREAM = 'https://tiles.openfreemap.org/styles/positron'

// Proxy the OpenFreeMap positron style through Next.js so the browser
// never has to reach tiles.openfreemap.org directly for the style JSON
// (CORS, ad-blockers, and CDN timeouts were causing the map to fail).
// The tile *data* URLs referenced inside the style still point outward, but
// the style document itself loads reliably from /api/map-style.
export async function GET() {
  try {
    const res = await fetch(UPSTREAM, {
      // 10 s server-side timeout — plenty for a style JSON (~20 KB)
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 3600 }, // revalidate once per hour on the edge
    })
    if (!res.ok) throw new Error(`upstream ${res.status}`)
    const json = await res.json()
    return NextResponse.json(json, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch {
    return new NextResponse('map style unavailable', { status: 503 })
  }
}
