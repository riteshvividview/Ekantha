'use client'

import { useEffect } from 'react'
import { gsap } from '@/lib/animations/gsap'

// The [class*="X"] substring matches also caught each card's OWN nested
// children whose CSS-module-hashed class name happens to contain the same
// substring (e.g. "hlCard" matches "hlCardMediaWrap"/"hlCardMedia"/
// "hlCardScrim"/"hlCardBottom" too) — every one of those got its own
// independent tilt listener, and since transforms compound on nested
// elements, the visible tilt was multiplied rather than applied once.
// The :not() exclusions below are the known child suffixes for each
// prefix; see stay-detail/full/full.module.css and stone/stone.module.css.
const TILT_SELECTOR =
  '.gallery-plate, .h-card, .event-card, .testi-card, .cell, .stay, .ideal-card, .am-card, ' +
  '[class*="hlCard"]:not([class*="hlCardMediaWrap"]):not([class*="hlCardMedia"]):not([class*="hlCardScrim"]):not([class*="hlCardBottom"]), ' +
  '[class*="idealCard"], ' +
  '[class*="amCell"]:not([class*="amCellScrim"]):not([class*="amCellContent"]):not([class*="amCellTitle"]):not([class*="amCellBody"]), ' +
  '[class*="brickItem"], [class*="indexCard"]'

// Every `.btn` site-wide (nav CTA, hero, section CTAs, footer, etc.) —
// deliberately excludes any element with its own bespoke magnetic/ripple
// wiring already built for it (e.g. the stays-carousel chevron, which
// isn't a `.btn`), so nothing gets two competing GSAP quickTo instances
// fighting over the same transform.
const BUTTON_SELECTOR = '.btn'
const BUTTON_MAGNET_FACTOR = 0.22
const BUTTON_HOVER_LIFT = 2

/**
 * A subtle 3D tilt on card-like elements (galleries, highlight/ideal/
 * amenity cards across every stay-detail page style), applied site-wide
 * via event delegation (mounted once in the root layout, like CursorDot)
 * rather than wired into every page individually.
 *
 * An earlier magnetic-pull attempt on buttons here was pulled — a full-
 * strength pull visibly shifted clickable elements away from the cursor
 * with an eased lag, which made clicks land wrong during normal fast
 * pointer movement. The tilt above stays deliberately mild (small angle,
 * no added lift) so it doesn't distort card hit-boxes the same way.
 *
 * Buttons now get a *much* lighter version of that same idea (see
 * BUTTON_MAGNET_FACTOR below — roughly a third of what was tried before)
 * plus a click ripple, requested explicitly and applied to every `.btn`
 * site-wide via delegation rather than wired into each CTA individually.
 * The lighter factor keeps the drift small enough that it doesn't
 * meaningfully relocate the hit target under a fast approach.
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
      // GSAP's own property names are `rotationX`/`rotationY` — not the
      // CSS-native `rotateX`/`rotateY`, which its CSSPlugin doesn't parse
      // and silently no-ops on. This tilt never actually applied any
      // rotation until this was caught (via a live browser check while
      // building WhyUs.tsx's card tilt, which had the identical mistake).
      const rotateXTo = gsap.quickTo(el, 'rotationX', { duration: 0.4, ease: 'power3.out' })
      const rotateYTo = gsap.quickTo(el, 'rotationY', { duration: 0.4, ease: 'power3.out' })

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

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return

    const cleanups: Array<() => void> = []

    document.querySelectorAll<HTMLElement>(BUTTON_SELECTOR).forEach((btn) => {
      const moveX = gsap.quickTo(btn, 'x', { duration: 0.45, ease: 'power3.out' })
      const moveY = gsap.quickTo(btn, 'y', { duration: 0.45, ease: 'power3.out' })
      let rippleTimeout: number | undefined

      const onMove = (e: PointerEvent) => {
        const rect = btn.getBoundingClientRect()
        const relX = e.clientX - (rect.left + rect.width / 2)
        const relY = e.clientY - (rect.top + rect.height / 2)
        moveX(relX * BUTTON_MAGNET_FACTOR)
        // The magnetic y-transform is inline, so it overrides (rather than
        // combines with) the CSS `:hover { transform: translateY(-2px) }`
        // lift each `.btn` variant already has — folding that same lift in
        // here keeps it, instead of silently losing it once JS takes over.
        moveY(relY * BUTTON_MAGNET_FACTOR - BUTTON_HOVER_LIFT)
      }
      const onLeave = () => {
        moveX(0)
        moveY(0)
      }
      const onDown = (e: PointerEvent) => {
        const rect = btn.getBoundingClientRect()
        btn.style.setProperty('--btn-ripple-x', `${e.clientX - rect.left}px`)
        btn.style.setProperty('--btn-ripple-y', `${e.clientY - rect.top}px`)
        btn.classList.remove('btn-rippling')
        void btn.offsetWidth // force reflow so the animation restarts on rapid re-clicks
        btn.classList.add('btn-rippling')
        window.clearTimeout(rippleTimeout)
        rippleTimeout = window.setTimeout(() => btn.classList.remove('btn-rippling'), 700)
      }

      btn.addEventListener('pointermove', onMove)
      btn.addEventListener('pointerleave', onLeave)
      btn.addEventListener('pointerdown', onDown)
      cleanups.push(() => {
        btn.removeEventListener('pointermove', onMove)
        btn.removeEventListener('pointerleave', onLeave)
        btn.removeEventListener('pointerdown', onDown)
        window.clearTimeout(rippleTimeout)
      })
    })

    return () => cleanups.forEach((fn) => fn())
  }, [])

  return null
}
