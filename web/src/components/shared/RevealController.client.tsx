'use client'

import { useScrollReveal } from '@/lib/animations/useScrollReveal'

/** Mount once per page — activates the GSAP scroll-reveal for every
 *  `.reveal` element rendered above it in the tree. */
export function RevealController() {
  useScrollReveal()
  return null
}
