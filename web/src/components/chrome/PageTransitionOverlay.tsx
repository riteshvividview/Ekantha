'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { gsap, ScrollTrigger } from '@/lib/animations/gsap'
import { createApertureRenderer, type ApertureState } from '@/lib/animations/apertureRenderer'
import { SCALE_TINY, currentScaleHuge } from '@/lib/animations/pageTransitionGeometry'

const CLOSE_DURATION = 0.5
const OPEN_DURATION = 0.55
const WHITE_DURATION = 0.2
const FADE_DURATION = 0.35

/**
 * Site-wide logo page-switch transition, drawn by a GLSL shader (see
 * apertureRenderer.ts). On the way out, an ink cover closes in around the
 * logo-shaped hole; a real client-side navigation happens while covered. On
 * arrival the hole shows only white as it grows to fill the screen, then the
 * white fades away to uncover the new page.
 *
 * This overlay lives in the (site) root layout, which stays mounted across
 * navigations, so it can intercept a click, play the exit, call router.push(),
 * then watch usePathname() for the moment the new route has committed.
 */
export function PageTransitionOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rendererRef = useRef<ReturnType<typeof createApertureRenderer>>(null)
  const isAnimating = useRef(false)
  const awaitingRouteChange = useRef(false)
  const prefetched = useRef(new Set<string>())
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const canvas = canvasRef.current
    const renderer = rendererRef.current
    if (!canvas || !renderer || !awaitingRouteChange.current) return
    awaitingRouteChange.current = false

    const huge = currentScaleHuge()
    const state: ApertureState = { scale: SCALE_TINY, holeWhite: 1, solidWhite: 0, opacity: 1 }
    const draw = () => renderer.draw(state)
    gsap
      .timeline({
        onUpdate: draw,
        onComplete: () => {
          canvas.setAttribute('data-visible', 'false')
          isAnimating.current = false
        },
      })
      .to(state, { scale: huge, duration: OPEN_DURATION, ease: 'expo.in' })
      // The logo has gaps that ink would show through even at full scale.
      .to(state, { solidWhite: 1, duration: WHITE_DURATION, ease: 'none' }, OPEN_DURATION - WHITE_DURATION)
      .to(state, { opacity: 0, duration: FADE_DURATION, ease: 'power1.out' }, OPEN_DURATION)
  }, [pathname])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    rendererRef.current = createApertureRenderer(canvas)

    function qualifyingHref(target: EventTarget | null): { anchor: HTMLAnchorElement; href: string } | null {
      const anchor = (target as Element | null)?.closest('a[href]') as HTMLAnchorElement | null
      if (!anchor) return null
      if (anchor.target && anchor.target !== '_self') return null
      if (anchor.hasAttribute('download')) return null

      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return null
      if (url.hash && url.pathname === window.location.pathname) return null // in-page anchor
      if (url.pathname === window.location.pathname && url.search === window.location.search) return null

      return { anchor, href: anchor.href }
    }

    function navigate(href: string) {
      // Outgoing ScrollTriggers (pinned sections especially) must be reverted
      // before React unmounts the page, or GSAP's pin-spacer DOM changes crash
      // its reconciliation with "Failed to execute 'removeChild'".
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true))
      router.push(href)
    }

    // The logo-wipe transition was removed at the client's request: pages
    // now swap directly, keeping only the client-side navigation + prefetch.
    function runExit(href: string) {
      navigate(href)
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const match = qualifyingHref(event.target)
      if (!match) return

      event.preventDefault()
      runExit(match.href)
    }

    // Warms the full page as soon as intent is likely, so the covered window
    // while the route loads is as short as possible.
    function onIntent(event: Event) {
      const match = qualifyingHref(event.target)
      if (!match || prefetched.current.has(match.href)) return
      prefetched.current.add(match.href)
      router.prefetch(match.href, { kind: 'full' as never })
    }

    document.addEventListener('click', onClick, true)
    document.addEventListener('mouseover', onIntent, true)
    document.addEventListener('touchstart', onIntent, { capture: true, passive: true })
    document.addEventListener('focusin', onIntent, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('mouseover', onIntent, true)
      document.removeEventListener('touchstart', onIntent, true)
      document.removeEventListener('focusin', onIntent, true)
    }
  }, [router])

  return <canvas ref={canvasRef} className="ve-page-transition" data-visible="false" aria-hidden="true" />
}
