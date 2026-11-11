'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ScrollTrigger } from '@/lib/animations/gsap'

/**
 * Instant client-side navigation for every same-site link (the old logo-wipe
 * transition was removed at the client's request). Intercepts plain link
 * clicks and routes them through router.push(), and prefetches a page as
 * soon as intent is likely (hover / touch / focus) so it opens immediately.
 *
 * Lives in the (site) root layout, which stays mounted across navigations.
 * Renders nothing.
 */
export function PageTransitionOverlay() {
  const prefetched = useRef(new Set<string>())
  const router = useRouter()

  useEffect(() => {
    function qualifyingHref(target: EventTarget | null): string | null {
      const anchor = (target as Element | null)?.closest('a[href]') as HTMLAnchorElement | null
      if (!anchor) return null
      if (anchor.target && anchor.target !== '_self') return null
      if (anchor.hasAttribute('download')) return null

      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin) return null
      if (url.hash && url.pathname === window.location.pathname) return null // in-page anchor
      if (url.pathname === window.location.pathname && url.search === window.location.search) return null

      return anchor.href
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const href = qualifyingHref(event.target)
      if (!href) return
      event.preventDefault()
      // Outgoing ScrollTriggers (pinned sections especially) must be reverted
      // before React unmounts the page, or GSAP's pin-spacer DOM changes crash
      // its reconciliation with "Failed to execute 'removeChild'".
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill(true))
      router.push(href)
    }

    // Warms the full page as soon as intent is likely.
    function onIntent(event: Event) {
      const href = qualifyingHref(event.target)
      if (!href || prefetched.current.has(href)) return
      prefetched.current.add(href)
      router.prefetch(href, { kind: 'full' as never })
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

  return null
}
