'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

/**
 * Registers ScrollTrigger exactly once, client-side only. Import this
 * (for its side effect) before using ScrollTrigger anywhere, or just
 * import { gsap, ScrollTrigger } from this file instead of 'gsap' directly.
 */
export function ensureGsapRegistered() {
  if (registered || typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger)
  // Phones: the address bar showing/hiding resizes the viewport; don't let
  // that re-measure pins mid-scroll (it left gaps under pinned sections).
  ScrollTrigger.config({ ignoreMobileResize: true })
  registered = true
}

ensureGsapRegistered()

export { gsap, ScrollTrigger }
