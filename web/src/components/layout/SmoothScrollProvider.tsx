'use client'

import { useEffect } from 'react'
import { ReactLenis, useLenis } from 'lenis/react'
import { gsap, ScrollTrigger } from '@/lib/animations/gsap'

/**
 * Wraps the whole site in Lenis smooth scroll, wired to GSAP so
 * ScrollTrigger-driven reveals/parallax stay in sync with the smoothed
 * scroll position instead of the raw (unsmoothed) browser scroll.
 *
 * They don't sync automatically out of the box — two things have to be
 * done explicitly:
 *   1. Lenis's own rAF loop is disabled (`autoRaf: false`) and driven by
 *      GSAP's ticker instead (`gsap.ticker.add(...)`), so both libraries
 *      share one animation frame loop rather than fighting over two.
 *   2. Every Lenis `scroll` event calls `ScrollTrigger.update()`, so
 *      ScrollTrigger recalculates trigger positions against the smoothed
 *      scroll value on every frame, not just on native scroll events.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ autoRaf: false, lerp: 0.1, duration: 1.2 }}>
      <LenisGsapBridge />
      {children}
    </ReactLenis>
  )
}

function LenisGsapBridge() {
  const lenis = useLenis(() => {
    ScrollTrigger.update()
  })

  useEffect(() => {
    if (!lenis) return

    const update = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(update)
    }
  }, [lenis])

  return null
}
