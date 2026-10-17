'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { onProgress } from '@/lib/loadProgress'

// Real signals only — no fake timer dressed up as progress. Each key's
// weight reflects how much it actually matters to what's on screen at
// reveal: the hero frame window is most of it (it's most of the viewport),
// fonts matter because text visibly reflows/swaps without them, the logo
// is tiny but instantly visible.
const WEIGHTS: Record<string, number> = { fonts: 0.25, hero: 0.65, logo: 0.1 }

// A slow connection shouldn't be able to trap a visitor behind this
// screen indefinitely — reveal regardless of real progress past this.
const TIMEOUT_MS = 3500

// On a fast connection, every asset can resolve in well under what it
// takes to register as a deliberate moment rather than a flash — this is
// a floor, not padding: real progress still drives the percentage, this
// only holds the reveal back from firing before the mark has had a beat
// to actually be seen.
const MIN_DISPLAY_MS = 900

const SESSION_KEY = 've-initial-load-shown'

export function InitialLoadScreen() {
  const pathname = usePathname()
  const [shouldRender, setShouldRender] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [pct, setPct] = useState(0)
  const progressRef = useRef<Record<string, number>>({ fonts: 0, hero: 0, logo: 0 })
  const doneRef = useRef(false)

  useEffect(() => {
    if (pathname !== '/') return
    if (typeof window === 'undefined') return
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return
    } catch {
      // sessionStorage unavailable (private mode etc.) — show it anyway,
      // just won't persist the "already shown" flag across reloads.
    }
    setShouldRender(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only runs on mount for '/'
  }, [])

  useEffect(() => {
    if (!shouldRender) return
    const mountedAt = Date.now()

    const finish = () => {
      if (doneRef.current) return
      doneRef.current = true
      setPct(100)
      try {
        sessionStorage.setItem(SESSION_KEY, '1')
      } catch {
        // ignore — see above
      }
      const remaining = Math.max(0, MIN_DISPLAY_MS - (Date.now() - mountedAt))
      window.setTimeout(() => {
        setExiting(true)
        window.setTimeout(() => setShouldRender(false), 700)
      }, 180 + remaining)
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
    <div className="ve-load-screen" data-exiting={exiting} aria-hidden={exiting}>
      <div className="ve-load-screen-mark">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption -- silent decorative loop, nothing to caption */}
        <video src="/logo-loader.mp4" autoPlay={!reduced} loop muted playsInline />
      </div>
      <p className="ve-load-screen-pct">{pct}%</p>
      <div className="ve-load-screen-bar">
        <div className="ve-load-screen-bar-fill" style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
    </div>
  )
}
