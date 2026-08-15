'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { gsap, ScrollTrigger } from '@/lib/animations/gsap'
import {
  MAIN_LOGO_PATH,
  TRIANGLE_PATH,
  VIEWBOX,
  RECENTER,
  SCALE_TINY,
  apertureTransform,
  currentScaleHuge,
} from '@/lib/animations/pageTransitionGeometry'

const ZOOM_OUT_DURATION = 1.05
const ZOOM_IN_DURATION = 1.3
const EASE = 'power3.inOut'

/**
 * Site-wide "aperture" page-switch transition, ported from logo/index.html.
 * The site's own logo mark is used as the mask hole: on the way out it
 * shrinks from covering the whole viewport down to a pinpoint (a solid
 * cover, revealing nothing), a real Next.js client-side navigation happens
 * while fully covered, and on arrival it grows back out to reveal the new
 * page — all without a browser document reload.
 *
 * This overlay lives in the (site) root layout, which stays mounted across
 * navigations within the (site) route group (Next only re-renders the page
 * segment below it), so it can drive the whole thing itself: intercept a
 * click, play the exit tween, call router.push(), then watch usePathname()
 * for the moment the new route has actually committed and play the entry
 * tween. Nav/footer data (from Payload) is fetched once per session this
 * way rather than on every navigation — the trade-off a true SPA feel
 * requires; a hard refresh still picks up any CMS edits.
 */
export function PageTransitionOverlay() {
  const svgRef = useRef<SVGSVGElement>(null)
  const groupRef = useRef<SVGGElement>(null)
  const isAnimating = useRef(false)
  const awaitingRouteChange = useRef(false)
  const prefetched = useRef(new Set<string>())
  const router = useRouter()
  const pathname = usePathname()

  // Fires once the destination segment has actually rendered — reveal.
  useEffect(() => {
    const svg = svgRef.current
    const group = groupRef.current
    if (!svg || !group || !awaitingRouteChange.current) return
    awaitingRouteChange.current = false

    const setScale = (s: number) => group.setAttribute('transform', apertureTransform(s))
    const proxy = { s: SCALE_TINY }
    gsap.to(proxy, {
      s: currentScaleHuge(),
      duration: ZOOM_IN_DURATION,
      ease: EASE,
      onUpdate: () => setScale(proxy.s),
      onComplete: () => {
        svg.setAttribute('data-visible', 'false')
        isAnimating.current = false
      },
    })
  }, [pathname])

  useEffect(() => {
    const svg = svgRef.current
    const group = groupRef.current
    if (!svg || !group) return

    const setScale = (s: number) => group.setAttribute('transform', apertureTransform(s))

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

    function runExit(href: string) {
      if (!svg || !group || isAnimating.current) return
      isAnimating.current = true
      const huge = currentScaleHuge()
      setScale(huge)
      svg.setAttribute('data-visible', 'true')

      const proxy = { s: huge }
      gsap.to(proxy, {
        s: SCALE_TINY,
        duration: ZOOM_OUT_DURATION,
        ease: EASE,
        onUpdate: () => setScale(proxy.s),
        onComplete: () => {
          // The screen is fully covered at this point, so this is invisible
          // to the user. It matters because the outgoing page's own
          // ScrollTriggers (pinned sections in particular, e.g.
          // ExperienceReel) can otherwise survive into React's unmount of
          // that page — which happens right after router.push resolves —
          // and crash with "Failed to execute 'removeChild'" when GSAP's
          // pin-spacer DOM restructuring and React's reconciliation fight
          // over the same nodes. Killing every trigger with revert:true
          // here guarantees a clean DOM before that unmount runs; the
          // arriving page creates its own triggers fresh on mount.
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true))
          awaitingRouteChange.current = true
          router.push(href)
        },
      })
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const match = qualifyingHref(event.target)
      if (!match) return

      event.preventDefault()
      runExit(match.href)
    }

    // Warms the RSC payload as soon as intent is likely, so the covered
    // window during runExit's navigation is as short as possible.
    function onIntent(event: Event) {
      const match = qualifyingHref(event.target)
      if (!match || prefetched.current.has(match.href)) return
      prefetched.current.add(match.href)
      router.prefetch(match.href)
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

  return (
    <svg
      ref={svgRef}
      className="ve-page-transition-svg"
      data-visible="false"
      viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <mask id="ve-aperture-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={VIEWBOX.width} height={VIEWBOX.height}>
          <rect x="0" y="0" width={VIEWBOX.width} height={VIEWBOX.height} fill="white" />
          <g ref={groupRef} transform={apertureTransform(SCALE_TINY)}>
            <g transform={`translate(${RECENTER.dx},${RECENTER.dy})`}>
              <path fill="black" d={MAIN_LOGO_PATH} />
              <path fill="black" d={TRIANGLE_PATH} />
            </g>
          </g>
        </mask>
      </defs>
      <rect
        x="0"
        y="0"
        width={VIEWBOX.width}
        height={VIEWBOX.height}
        fill="var(--ink)"
        mask="url(#ve-aperture-mask)"
      />
    </svg>
  )
}
