'use client'

import { useEffect, type RefObject } from 'react'
import { gsap, ScrollTrigger } from './gsap'

const SPEEDS = [0.5, -0.7, 0.6, -0.5]

/**
 * Passive depth parallax for a photo-backed bento grid — each card's
 * background photo drifts at its own speed as the section scrolls past,
 * alternating direction per card. This is the signature scroll moment
 * FullHouse.html's own vanilla-JS `updateHlParallax()` gave the
 * accommodation-highlights grid (a plain rAF + scroll-listener loop,
 * never scroll-jacking, min-width 561px only) — reimplemented here as a
 * real GSAP/ScrollTrigger scrub so it shares one animation driver with
 * every other scroll effect on the page and stays in sync with Lenis.
 */
export function useBentoParallax(containerRef: RefObject<HTMLElement | null>, cardSelector: string, mediaSelector: string) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    if (!window.matchMedia('(min-width: 561px)').matches) return

    const cards = Array.from(container.querySelectorAll<HTMLElement>(cardSelector))
    if (!cards.length) return

    const ctx = gsap.context(() => {
      cards.forEach((card, i) => {
        const media = card.querySelector<HTMLElement>(mediaSelector)
        if (!media) return
        gsap.to(media, {
          yPercent: 14 * SPEEDS[i % SPEEDS.length],
          ease: 'none',
          scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
    }, container)

    return () => ctx.revert()
  }, [containerRef, cardSelector, mediaSelector])
}

export { ScrollTrigger }
