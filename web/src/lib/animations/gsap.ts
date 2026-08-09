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
  registered = true
}

ensureGsapRegistered()

export { gsap, ScrollTrigger }
