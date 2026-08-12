'use client'

import { useEffect } from 'react'
import { gsap } from '@/lib/animations/gsap'

const TILT_SELECTOR =
  '.gallery-plate, .h-card, .event-card, .testi-card, .cell, .stay, .ideal-card, .am-card, [class*="hlCard"], [class*="idealCard"], [class*="amCell"], [class*="brickItem"], [class*="indexCard"]'

/**
 * A subtle 3D tilt on card-like elements (galleries, highlight/ideal/
 * amenity cards across every stay-detail page style), applied site-wide
 * via event delegation (mounted once in the root layout, like CursorDot)
 * rather than wired into every page individually.
 *
 * A magnetic-pull effect on buttons was tried here too and pulled — it
 * visibly shifted clickable elements away from the cursor with an eased
 * lag, which made clicks land wrong during normal fast pointer movement.
 * The tilt below is kept deliberately mild (small angle, no added lift)
 * so it doesn't distort card hit-boxes enough to cause the same problem.
 *
 * Desktop (hover-capable) only — matches the custom cursor's own
 * `@media (hover: none)` cutoff, since this is a pointer-precision effect
 * that doesn't make sense on touch.
 */
export function InteractionEffects() {
  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return

    const cleanups: Array<() => void> = []

    document.querySelectorAll<HTMLElement>(TILT_SELECTOR).forEach((el) => {
      const rotateXTo = gsap.quickTo(el, 'rotateX', { duration: 0.4, ease: 'power3.out' })
      const rotateYTo = gsap.quickTo(el, 'rotateY', { duration: 0.4, ease: 'power3.out' })

      const onMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect()
        const px = (e.clientX - rect.left) / rect.width - 0.5
        const py = (e.clientY - rect.top) / rect.height - 0.5
        rotateXTo(py * -3)
        rotateYTo(px * 3)
      }
      const onLeave = () => {
        rotateXTo(0)
        rotateYTo(0)
      }

      gsap.set(el, { transformPerspective: 800 })
      el.addEventListener('mousemove', onMove)
      el.addEventListener('mouseleave', onLeave)
      cleanups.push(() => {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseleave', onLeave)
      })
    })

    return () => cleanups.forEach((fn) => fn())
  }, [])

  return null
}
