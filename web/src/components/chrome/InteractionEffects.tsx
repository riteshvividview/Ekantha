'use client'

import { useEffect } from 'react'
import { gsap } from '@/lib/animations/gsap'

// .ve-hold-pill is deliberately excluded — its own CSS transform (slide
// up/down via the `.visible` class) would fight GSAP's inline transform.
const MAGNETIC_SELECTOR = '.btn'
const TILT_SELECTOR =
  '.gallery-plate, .h-card, .event-card, .testi-card, .cell, .stay, .ideal-card, .am-card, [class*="hlCard"], [class*="idealCard"], [class*="amCell"], [class*="brickItem"], [class*="indexCard"]'

/**
 * Two hover micro-interactions applied site-wide via event delegation
 * (mounted once in the root layout, like CursorDot) rather than wired
 * into every page individually:
 *
 *  - Magnetic pull: buttons and the floating hold-a-date pill nudge
 *    toward the cursor within their own bounds, and spring back on leave.
 *  - 3D tilt: card-like elements (galleries, highlight/ideal/amenity
 *    cards across every stay-detail page style) tilt toward the cursor
 *    position and lift slightly, using GSAP quickTo for smooth easing.
 *
 * Desktop (hover-capable) only — matches the custom cursor's own
 * `@media (hover: none)` cutoff, since both are pointer-precision effects
 * that don't make sense on touch.
 */
export function InteractionEffects() {
  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return

    const cleanups: Array<() => void> = []

    document.querySelectorAll<HTMLElement>(MAGNETIC_SELECTOR).forEach((el) => {
      const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
      const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })

      const onMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect()
        xTo((e.clientX - rect.left - rect.width / 2) * 0.35)
        yTo((e.clientY - rect.top - rect.height / 2) * 0.35)
      }
      const onLeave = () => {
        xTo(0)
        yTo(0)
      }

      el.addEventListener('mousemove', onMove)
      el.addEventListener('mouseleave', onLeave)
      cleanups.push(() => {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseleave', onLeave)
      })
    })

    document.querySelectorAll<HTMLElement>(TILT_SELECTOR).forEach((el) => {
      // GSAP writes transform as an inline style, which always wins over a
      // stylesheet `:hover { transform: translateY(...) }` rule — several
      // of these card classes already had their own hover-lift in CSS, so
      // the lift is folded into this tween too rather than silently lost.
      const rotateXTo = gsap.quickTo(el, 'rotateX', { duration: 0.5, ease: 'power3.out' })
      const rotateYTo = gsap.quickTo(el, 'rotateY', { duration: 0.5, ease: 'power3.out' })
      const scaleTo = gsap.quickTo(el, 'scale', { duration: 0.5, ease: 'power3.out' })
      const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })

      const onMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect()
        const px = (e.clientX - rect.left) / rect.width - 0.5
        const py = (e.clientY - rect.top) / rect.height - 0.5
        rotateXTo(py * -8)
        rotateYTo(px * 8)
        scaleTo(1.02)
        yTo(-6)
      }
      const onLeave = () => {
        rotateXTo(0)
        rotateYTo(0)
        scaleTo(1)
        yTo(0)
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
