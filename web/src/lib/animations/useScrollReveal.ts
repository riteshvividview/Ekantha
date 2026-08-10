'use client'

import { useEffect, type RefObject } from 'react'
import { gsap, ScrollTrigger } from './gsap'

/**
 * Replaces the plain IntersectionObserver `.reveal` → `.in` class-toggle
 * pattern every source HTML page used with a real GSAP/ScrollTrigger
 * tween — same one-shot "fade up once, on first entering the viewport"
 * behavior, but with proper easing and stagger instead of a flat CSS
 * transition, and it's driven by the same ScrollTrigger instance
 * everything else on the page uses (so it stays in sync with Lenis).
 *
 * Elements still need the `.reveal` class for their CSS resting state
 * (`opacity:0; transform:translateY(28px)`, see globals.css) — this hook
 * animates *away* from that state; it doesn't need `.in` to do it.
 */
export function useScrollReveal(containerRef?: RefObject<HTMLElement | null>, selector = '.reveal') {
  useEffect(() => {
    const root = containerRef?.current ?? document
    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector))
    if (!targets.length) return

    const triggers = targets.map((el, i) =>
      gsap.fromTo(
        el,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          delay: (i % 4) * 0.06,
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            once: true,
          },
        },
      ),
    )

    return () => {
      triggers.forEach((tween) => tween.scrollTrigger?.kill())
    }
  }, [containerRef, selector])
}

export { gsap, ScrollTrigger }
