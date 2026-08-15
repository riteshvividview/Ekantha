'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { useLenis } from 'lenis/react'
import type { Navigation } from '@/payload-types'
import { NavbarMobileMenu } from './NavbarMobileMenu'
import { resolveMedia, resolveMediaSize } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'

// Scroll distance (px) before the nav leaves its transparent resting state
// and becomes the floating solid pill. Deliberately small — the morph
// should read as an immediate response to scrolling, not a delayed one.
const SCROLL_THRESHOLD = 32

// Matches the rough height of the nav — shrinks the IntersectionObserver's
// effective viewport so "a dark hero is behind the bar" flips to false
// right as the hero's bottom edge passes under the bar, not once it's
// fully scrolled by. Only affects nav *text color* — the transparent
// background itself applies on every page, hero or not.
const HERO_ROOT_MARGIN = '-84px 0px 0px 0px'

// How far the visitor has to scroll back up (px) before the nav
// reappears — a small buffer so tiny scroll jitter (trackpad momentum,
// mouse-wheel micro-ticks) doesn't flicker it in and out.
const DIRECTION_BUFFER = 6

// Below this scroll depth, the nav never hides on scroll-down — it's
// already the solid pill (SCROLL_THRESHOLD) and stays put and readable
// through the first stretch of scrolling. Only past this point does
// scroll-direction start hiding/showing it.
const HIDE_THRESHOLD = 320

export function Navbar({ data }: { data: Navigation }) {
  const logoIcon = resolveMedia(data.logo?.icon)
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [onDarkHero, setOnDarkHero] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastScroll = useRef(0)
  const previewRef = useRef<PreviewHandle>(null)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // A page opts into light (white) nav text over its own hero simply by
  // marking that section `data-nav-hero` — no other wiring needed. Pages
  // without one (About, Contact, FAQs, ...) just keep the default dark
  // text, which reads fine against their own light backgrounds.
  useEffect(() => {
    const hero = document.querySelector('[data-nav-hero]')
    if (!hero) {
      const id = requestAnimationFrame(() => setOnDarkHero(false))
      return () => cancelAnimationFrame(id)
    }
    const observer = new IntersectionObserver(([entry]) => setOnDarkHero(entry.isIntersecting), {
      rootMargin: HERO_ROOT_MARGIN,
      threshold: 0,
    })
    observer.observe(hero)
    return () => observer.disconnect()
  }, [pathname])

  useLenis((lenis) => {
    setScrolled(lenis.scroll > SCROLL_THRESHOLD)

    const delta = lenis.scroll - lastScroll.current
    lastScroll.current = lenis.scroll
    if (lenis.scroll <= HIDE_THRESHOLD) {
      setHidden(false)
    } else if (delta > DIRECTION_BUFFER) {
      setHidden(true)
    } else if (delta < -DIRECTION_BUFFER) {
      setHidden(false)
    }
  })

  const navClass = [
    've-navbar',
    scrolled ? 've-navbar-pill' : 've-navbar-transparent',
    !scrolled && onDarkHero && 've-navbar-on-dark',
    hidden && 've-navbar-hidden',
    mounted && 've-navbar-in',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <header className={navClass}>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- deliberately
          a plain <a>, not <Link>, matching every other nav link on this site: a full
          page reload guarantees the active-page state (and the CMS-driven nav/footer
          data) is always freshly server-rendered, rather than depending on Next's
          client-side router cache staying in sync. */}
      <a href="/" className="ve-navbar-logo">
        {logoIcon.url && <img src={logoIcon.url} alt="" aria-hidden="true" />}
        {renderWordmark(data.logo?.wordmark ?? 'Vana Ekantha')}
      </a>

      <nav className="ve-navbar-links" aria-label="Primary">
        {(data.primaryLinks ?? []).map((link) => {
          const active = isActive(pathname, link.href, link.submenu)
          const preview = resolveMediaSize(link.previewImage, 'card')
          return (
            <span className="ve-navbar-link-wrap" key={link.id ?? link.label}>
              <a
                href={link.href}
                className={`ve-navbar-link${active ? ' ve-navbar-link-active' : ''}`}
                onMouseEnter={preview.url ? (e) => previewRef.current?.show(preview.url, link.label, e.clientX, e.clientY) : undefined}
                onMouseMove={preview.url ? (e) => previewRef.current?.move(e.clientX, e.clientY) : undefined}
                onMouseLeave={preview.url ? () => previewRef.current?.hide() : undefined}
              >
                {link.label}
              </a>
              {link.submenu && link.submenu.length > 0 && (
                <div className="ve-navbar-submenu">
                  {link.submenu.map((sub) => {
                    const subPreview = resolveMediaSize(sub.image, 'card')
                    return (
                      <a
                        href={sub.href}
                        key={sub.id ?? sub.label}
                        className={pathname === sub.href ? 've-navbar-submenu-active' : undefined}
                        onMouseEnter={
                          subPreview.url ? (e) => previewRef.current?.show(subPreview.url, sub.label, e.clientX, e.clientY) : undefined
                        }
                        onMouseMove={subPreview.url ? (e) => previewRef.current?.move(e.clientX, e.clientY) : undefined}
                        onMouseLeave={subPreview.url ? () => previewRef.current?.hide() : undefined}
                      >
                        {sub.label}
                      </a>
                    )
                  })}
                </div>
              )}
            </span>
          )
        })}
        {data.cta?.href && (
          <a href={data.cta.href} className="btn btn-primary">
            {data.cta.label}
          </a>
        )}
      </nav>

      <NavbarMobileMenu links={data.primaryLinks ?? []} cta={data.cta ?? undefined} pathname={pathname} />

      <NavPreviewPanel ref={previewRef} />
    </header>
  )
}

/** Whether this nav item should read as "current page" — either its own
 *  href matches exactly, or (for a parent like "Stay") the visitor is on
 *  one of its submenu pages (e.g. /mango-house under the Stay dropdown). */
function isActive(pathname: string, href?: string | null, submenu?: NonNullable<Navigation['primaryLinks']>[number]['submenu']) {
  if (href && pathname === href) return true
  if (submenu?.some((sub) => sub.href === pathname)) return true
  return false
}

/** Splits "Vana Ekantha" → "Vana <em>Ekantha</em>", matching the source
 *  HTML's convention of italicizing the second word of the wordmark. */
function renderWordmark(wordmark: string) {
  const parts = wordmark.trim().split(' ')
  if (parts.length < 2) return wordmark
  const [first, ...rest] = parts
  return (
    <>
      {first} <em>{rest.join(' ')}</em>
    </>
  )
}

type PreviewHandle = {
  show: (src: string, alt: string, x: number, y: number) => void
  move: (x: number, y: number) => void
  hide: () => void
}

/**
 * The "magazine hover" preview — a small image that trails the cursor with
 * a soft lag (GSAP's quickTo lerp, the same lightweight-tween technique
 * InteractionEffects.tsx already uses for magnetic buttons) while a nav
 * link with a CMS-supplied image is hovered. One shared instance, imperative
 * (show/move/hide) rather than React state, so mousemove never re-renders
 * the whole navbar — portaled to <body> for the same reason
 * NavbarMobileMenu's panel is (fixed positioning breaks under any
 * transformed ancestor, and the pill nav's own state transitions do
 * transform it).
 *
 * Desktop/hover-capable only, and skipped under reduced-motion — this is
 * a pure delight-flourish, never load-bearing for navigation.
 */
const NavPreviewPanel = forwardRef<PreviewHandle>(function NavPreviewPanel(_props, ref) {
  const [mountedToBody, setMountedToBody] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const quickX = useRef<gsap.QuickToFunc | null>(null)
  const quickY = useRef<gsap.QuickToFunc | null>(null)
  const tiltX = useRef<gsap.QuickToFunc | null>(null)
  const tiltY = useRef<gsap.QuickToFunc | null>(null)
  const enabled = useRef(false)

  useEffect(() => {
    enabled.current =
      !window.matchMedia('(hover: none)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const id = requestAnimationFrame(() => setMountedToBody(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const wrap = wrapRef.current
    const img = imgRef.current
    if (!wrap || !img) return
    quickX.current = gsap.quickTo(wrap, 'x', { duration: 0.55, ease: 'power3' })
    quickY.current = gsap.quickTo(wrap, 'y', { duration: 0.55, ease: 'power3' })
    tiltX.current = gsap.quickTo(img, 'rotationY', { duration: 0.6, ease: 'power3' })
    tiltY.current = gsap.quickTo(img, 'rotationX', { duration: 0.6, ease: 'power3' })
    gsap.set(img, { transformPerspective: 600 })
  }, [])

  useImperativeHandle(ref, () => ({
    show(src, alt, x, y) {
      if (!enabled.current || !wrapRef.current || !imgRef.current) return
      imgRef.current.src = src
      imgRef.current.alt = alt
      quickX.current?.(x)
      quickY.current?.(y)
      wrapRef.current.classList.add('visible')
    },
    move(x, y) {
      if (!enabled.current || !wrapRef.current) return
      quickX.current?.(x)
      quickY.current?.(y)
      const rect = wrapRef.current.getBoundingClientRect()
      tiltX.current?.(((x - rect.left) / rect.width - 0.5) * 10)
      tiltY.current?.(((y - rect.top) / rect.height - 0.5) * -10)
    },
    hide() {
      wrapRef.current?.classList.remove('visible')
    },
  }))

  if (!mountedToBody) return null

  return createPortal(
    <div ref={wrapRef} className="ve-nav-preview" aria-hidden="true">
      <div className="ve-nav-preview-inner">
        <img ref={imgRef} alt="" />
      </div>
    </div>,
    document.body,
  )
})
