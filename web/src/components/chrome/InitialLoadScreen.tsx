'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { onProgress } from '@/lib/loadProgress'
import { fireWarmup } from '@/lib/warmup'
import { INITIAL_LOAD_COOKIE } from '@/lib/initialLoadCookie'

// Real signals only — no fake timer dressed up as progress, and no
// artificial minimum-display floor either: the percentage is exactly the
// weighted sum below, and the reveal fires the moment it's real.
//
// Only the hero sequence (plus fonts/the nav logo) gates the reveal — it's
// the section the visitor actually sees first, so it's the one thing that
// has to be fully loaded and cached before the page appears. BambooDine
// and ChooseEscape sit further down the page and keep preloading in the
// background (see their own components) without holding the homepage
// back. All three report real buffered-video progress now (see each
// component's reportBufferedProgress), not per-frame-image counting —
// they're compressed videos scrubbed via currentTime, a few MB each
// instead of the ~62MB of individual WebP frames this used to be.
const WEIGHTS: Record<string, number> = {
  fonts: 0.1,
  logo: 0.05,
  hero: 0.85,
}

// A slow connection shouldn't be able to trap a visitor behind this
// screen indefinitely — reveal regardless of real progress past this.
const TIMEOUT_MS = 20000

// Atmosphere, not detail — mood lines in the same voice as the rest of the
// site's copy (see Hero's "Mornings Without An Agenda", Events' "Good food
// tastes better in nature."), never pricing or specifics.
const MOOD_LINES = [
  'Two homes. One quiet acre of sky.',
  'Mornings without an agenda.',
  'Where the mango trees keep the time.',
  'Five acres, and nowhere you need to be.',
  'The land remembers how to slow down.',
  'Good food tastes better under bamboo.',
]
const LINE_INTERVAL_MS = 2600

export function InitialLoadScreen({ skip }: { skip: boolean }) {
  const pathname = usePathname()
  // Computed synchronously (not in an effect) and matches what the server
  // renders for this route, so on a hard load of '/' the loader is part of
  // the very first HTML the browser paints — no gap where the real
  // homepage is visible underneath before this mounts. `skip` comes from
  // the server reading a cookie (see the (site) layout) set the first time
  // this ever finished in this browser — so a reload after that first
  // visit never renders the loader at all, instead of rendering it and
  // then hiding it client-side a beat later. Only ever set back to false
  // once, by finish() below, to unmount after the reveal.
  const [shouldRender, setShouldRender] = useState(() => pathname === '/' && !skip)
  const [contentHidden, setContentHidden] = useState(false)
  const [curtainOpen, setCurtainOpen] = useState(false)
  const [pct, setPct] = useState(0)
  const [lineIndex, setLineIndex] = useState(0)
  const progressRef = useRef<Record<string, number>>({ fonts: 0, hero: 0, logo: 0 })
  const doneRef = useRef(false)

  // Rotating mood line, independent of load progress — it's atmosphere,
  // not a status readout.
  useEffect(() => {
    if (!shouldRender) return
    const id = window.setInterval(() => {
      setLineIndex((i) => (i + 1) % MOOD_LINES.length)
    }, LINE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [shouldRender])

  useEffect(() => {
    if (!shouldRender) return

    const finish = () => {
      if (doneRef.current) return
      doneRef.current = true
      setPct(100)
      // No expiry: a session cookie, cleared when the browser itself
      // closes — so the loader skips on reloads/back-nav within a visit
      // but plays again in a fresh session, same as the old sessionStorage
      // flag's intent, just readable by the server this time.
      try {
        document.cookie = `${INITIAL_LOAD_COOKIE}=1; path=/; SameSite=Lax`
      } catch {
        // document.cookie can throw under strict privacy settings — fine,
        // it just means the loader shows again next time.
      }
      // Content fades first, then the curtain splits — two readable beats
      // instead of everything moving at once. The 950ms before unmounting
      // matches .ve-load-curtain's own transition duration in globals.css
      // (so the slide-out finishes before the DOM is removed), not padding.
      setContentHidden(true)
      window.setTimeout(() => {
        setCurtainOpen(true)
        window.setTimeout(() => {
          setShouldRender(false)
          fireWarmup() // homepage is showing: start background preloads
        }, 950)
      }, 320)
    }

    const recompute = () => {
      const p = progressRef.current
      const weighted = Object.entries(WEIGHTS).reduce((sum, [key, weight]) => sum + (p[key] ?? 0) * weight, 0)
      setPct(Math.round(weighted * 100))
      if (weighted >= 0.999) finish()
    }

    progressRef.current.logo = 1 // priority-loaded, effectively instant
    document.fonts.ready.then(() => {
      progressRef.current.fonts = 1
      recompute()
    })
    const unsubscribe = onProgress((key, value) => {
      if (!(key in progressRef.current)) return
      progressRef.current[key] = value
      recompute()
    })
    recompute()

    const timeout = window.setTimeout(finish, TIMEOUT_MS)
    return () => {
      unsubscribe()
      window.clearTimeout(timeout)
    }
  }, [shouldRender])

  if (!shouldRender) return null

  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div className="ve-load-screen ve-load-light" aria-hidden={contentHidden}>
      {/* Line-art landscape that draws itself in along the bottom. */}
      <svg className="ve-load-land" viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice" fill="none" aria-hidden="true" data-hidden={contentHidden}>
        <g className="ve-load-sun">
          <circle cx="1120" cy="120" r="46" />
          <circle cx="1120" cy="120" r="68" strokeDasharray="2 9" />
        </g>
        <path d="M0 250 C 180 190, 320 205, 470 238 S 760 190, 960 222 S 1260 196, 1440 214" />
        <path d="M0 290 C 220 262, 420 270, 610 288 S 980 262, 1180 280 S 1360 276, 1440 282" />
        <path d="M660 236 V 198 L 696 172 L 732 198 V 236 M 650 204 L 696 166 L 742 204 M 688 236 V 216 H 704 V 236" />
        <path d="M300 236 V 168 M 300 168 C 270 150, 250 156, 236 172 M 300 168 C 330 150, 350 156, 364 172 M 300 168 C 286 142, 278 134, 262 132 M 300 168 C 314 142, 322 134, 338 132" />
        <path d="M1300 226 V 150 M 1300 150 C 1274 136, 1256 142, 1244 156 M 1300 150 C 1326 136, 1344 142, 1356 156 M 1300 150 C 1288 128, 1280 122, 1266 120" />
        <path d="M180 120 q 9 -9 18 0 q 9 -9 18 0 M 236 96 q 7 -7 14 0 q 7 -7 14 0" />
      </svg>

      {/* Leaf sprigs tucked into two corners. */}
      <svg className="ve-load-sprig ve-load-sprig-tl" viewBox="0 0 160 160" fill="none" aria-hidden="true">
        <path d="M8 150 C 40 110, 80 64, 150 10" />
        <path d="M46 108 C 22 104, 10 84, 14 66 C 34 68, 50 86, 46 108 Z" />
        <path d="M76 76 C 92 56, 114 52, 128 58 C 116 76, 96 82, 76 76 Z" />
        <path d="M102 48 C 96 30, 100 14, 110 6 C 120 22, 116 38, 102 48 Z" />
      </svg>
      <svg className="ve-load-sprig ve-load-sprig-br" viewBox="0 0 160 160" fill="none" aria-hidden="true">
        <path d="M8 150 C 40 110, 80 64, 150 10" />
        <path d="M46 108 C 22 104, 10 84, 14 66 C 34 68, 50 86, 46 108 Z" />
        <path d="M76 76 C 92 56, 114 52, 128 58 C 116 76, 96 82, 76 76 Z" />
      </svg>

      <div className="ve-load-content" data-hidden={contentHidden}>
        <div className="ve-load-screen-mark">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption -- silent decorative loop, nothing to caption */}
          <video src="/logo-loader.mp4" autoPlay={!reduced} loop muted playsInline />
        </div>

        {/* Outlined wordmark; a filled copy is revealed left to right with the real progress. */}
        <div className="ve-load-word" aria-hidden="true">
          <span className="ve-load-word-stroke">Vana Ekantha</span>
          <span className="ve-load-word-fill" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
            Vana Ekantha
          </span>
        </div>

        <h1 className="ve-load-headline">Loading your experience</h1>

        <div className="ve-load-lines" aria-live="polite">
          {MOOD_LINES.map((line, i) => (
            <p key={line} className="ve-load-line" data-on={i === lineIndex}>
              {line}
            </p>
          ))}
        </div>

        <div className="ve-load-progress">
          <div className="ve-load-screen-bar">
            <div className="ve-load-screen-bar-fill" style={{ transform: `scaleX(${pct / 100})` }} />
          </div>
          <p className="ve-load-screen-pct">{pct}%</p>
        </div>
      </div>

      <div className="ve-load-curtain ve-load-curtain-left" data-open={curtainOpen} />
      <div className="ve-load-curtain ve-load-curtain-right" data-open={curtainOpen} />
    </div>
  )
}
