'use client'

import { forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { useLenis } from 'lenis/react'
import type { Navigation } from '@/payload-types'
import { NavbarMobileMenu } from './NavbarMobileMenu'
import { buildNavModel, isItemActive } from './navModel'
import { gsap } from '@/lib/animations/gsap'
import './navbar.css'

// Scroll distance (px) before the nav swaps from its dark glass resting state
// to the solid pill. Deliberately small so it reads as an immediate response.
const SCROLL_THRESHOLD = 32

// Matches the rough height of the nav: shrinks the IntersectionObserver's
// effective viewport so "a dark hero is behind the bar" flips right as the
// hero's bottom edge passes under the bar. Sections opt in with `data-nav-hero`.
const HERO_ROOT_MARGIN = '-84px 0px 0px 0px'

// Scroll-back buffer (px) so trackpad jitter doesn't flicker the hide/show.
const DIRECTION_BUFFER = 6

// Below this scroll depth the nav never hides on scroll-down.
const HIDE_THRESHOLD = 320

// Hover intent: a short delay before opening (so sweeping across the bar
// doesn't spray menus) and a slightly longer one before closing (so the
// pointer can cross the gap to the panel).
const OPEN_DELAY = 90
const CLOSE_DELAY = 200

interface MegaBox {
  x: number
  w: number
  h: number
  notch: number
}

export function Navbar({ data }: { data: Navigation }) {
  const pathname = usePathname()
  const items = buildNavModel(data.primaryLinks ?? [])
  const dropdowns = items.filter((i) => i.children && i.children.length > 0)

  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [onDarkHero, setOnDarkHero] = useState(false)
  // The solid pill's background is `var(--white)`, which itself follows the
  // page's scroll-driven light/dark theme (see lib/pageTheme.ts) — tracked
  // here so the logo image can follow the same swing: the glass pill is
  // always a dark translucent surface regardless of theme, but the solid
  // pill can land on either a light or a dark backdrop.
  const [darkTheme, setDarkTheme] = useState(false)
  // Owned here (not inside NavbarMobileMenu) so the logo can react to it too
  // — see logoSrc below.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [openKey, setOpenKey] = useState<string | null>(null)
  const [hoverIdx, setHoverIdx] = useState<Record<string, number>>({})
  const [mega, setMega] = useState<MegaBox>({ x: 0, w: 0, h: 0, notch: 0 })
  const [morph, setMorph] = useState(false)

  const lastScroll = useRef(0)
  const previewRef = useRef<PreviewHandle>(null)
  const headerRef = useRef<HTMLElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const triggerRefs = useRef<Record<string, HTMLElement | null>>({})
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const wasOpen = useRef(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // A section opts into the "dark hero behind the bar" treatment simply by
  // carrying `data-nav-hero`.
  useEffect(() => {
    const heroes = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-hero]'))
    if (heroes.length === 0) {
      const id = requestAnimationFrame(() => setOnDarkHero(false))
      return () => cancelAnimationFrame(id)
    }
    const intersecting = new Set<Element>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) intersecting.add(entry.target)
          else intersecting.delete(entry.target)
        })
        setOnDarkHero(intersecting.size > 0)
      },
      { rootMargin: HERO_ROOT_MARGIN, threshold: 0 },
    )
    heroes.forEach((hero) => observer.observe(hero))
    return () => observer.disconnect()
  }, [pathname])

  // The theme crossfade (Why.tsx, Gallery.tsx, Reach.tsx, etc.) tweens
  // `--white` as an inline style on <body> — a MutationObserver on that
  // style attribute catches every swing without polling on every scroll frame.
  useEffect(() => {
    const check = () => {
      const white = getComputedStyle(document.body).getPropertyValue('--white').trim()
      setDarkTheme(white === 'rgb(24, 20, 17)')
    }
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] })
    return () => observer.disconnect()
  }, [])

  useLenis((lenis) => {
    setScrolled(lenis.scroll > SCROLL_THRESHOLD)

    const delta = lenis.scroll - lastScroll.current
    lastScroll.current = lenis.scroll
    if (lenis.scroll <= HIDE_THRESHOLD) {
      setHidden(false)
    } else if (delta > DIRECTION_BUFFER) {
      setHidden(true)
      setOpenKey(null)
    } else if (delta < -DIRECTION_BUFFER) {
      setHidden(false)
    }
  })

  // ── Dropdown open / close ─────────────────────────────────────────────
  const clearTimers = () => {
    clearTimeout(openTimer.current)
    clearTimeout(closeTimer.current)
  }
  const openMenu = useCallback((key: string, delay = OPEN_DELAY) => {
    clearTimeout(closeTimer.current)
    clearTimeout(openTimer.current)
    openTimer.current = setTimeout(() => setOpenKey(key), delay)
  }, [])
  const closeMenu = useCallback((delay = CLOSE_DELAY) => {
    clearTimeout(openTimer.current)
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenKey(null), delay)
  }, [])

  useEffect(() => {
    const id = requestAnimationFrame(() => setOpenKey(null))
    return () => cancelAnimationFrame(id)
  }, [pathname])

  useEffect(() => () => clearTimers(), [])

  // Escape closes (and returns focus); a press outside the header closes on touch.
  useEffect(() => {
    if (!openKey) return undefined
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        triggerRefs.current[openKey]?.focus()
        setOpenKey(null)
      }
    }
    const onDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpenKey(null)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [openKey])

  // Size + place the shared panel under whichever trigger is open. The first
  // open snaps into place; moving between triggers morphs (position + size
  // animate), which is what makes the dropdown feel like one living surface.
  const place = useCallback(() => {
    if (!openKey) return
    const panel = panelRefs.current[openKey]
    const trigger = triggerRefs.current[openKey]
    const header = headerRef.current
    if (!panel || !trigger || !header) return
    const hb = header.getBoundingClientRect()
    const tb = trigger.getBoundingClientRect()
    const w = panel.offsetWidth
    const h = panel.offsetHeight
    const center = tb.left + tb.width / 2 - hb.left
    const margin = 8 - hb.left // keep 8px off the viewport edge
    const maxLeft = window.innerWidth - 8 - hb.left - w
    const x = Math.min(Math.max(center - w / 2, margin), Math.max(maxLeft, margin))
    setMega({ x, w, h, notch: center - x })
  }, [openKey])

  useLayoutEffect(() => {
    setMorph(wasOpen.current && !!openKey)
    wasOpen.current = !!openKey
    place()
  }, [openKey, place])

  useEffect(() => {
    if (!openKey) return undefined
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [openKey, place])

  // Sliding hover pill behind whichever top-level item is under the pointer.
  const moveIndicator = (el: HTMLElement | null) => {
    const ind = indicatorRef.current
    const nav = navRef.current
    if (!ind || !nav) return
    if (!el) {
      ind.style.opacity = '0'
      return
    }
    const nb = nav.getBoundingClientRect()
    const eb = el.getBoundingClientRect()
    ind.style.opacity = '1'
    ind.style.width = `${eb.width}px`
    ind.style.transform = `translateX(${eb.left - nb.left}px)`
  }

  const glass = onDarkHero || !scrolled || !!openKey
  // Glass is always a dark translucent surface regardless of theme; solid
  // follows whichever page theme is currently active.
  const logoSrc = glass || darkTheme || mobileMenuOpen ? '/ekantha-logo-white.webp' : '/ekantha-logo-brown.webp'
  const navClass = [
    've-nav',
    glass ? 've-nav-glass' : 've-nav-solid',
    hidden && !openKey && 've-nav-hidden',
    openKey && 've-nav-open',
    mounted && 've-nav-in',
  ]
    .filter(Boolean)
    .join(' ')

  const activeIdx = dropdowns.findIndex((d) => d.key === openKey)

  return (
    <>
      <header
        className={navClass}
        ref={headerRef}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') closeMenu()
        }}
      >
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- deliberately
            a plain <a>, not <Link>, matching every other nav link on this site: a full
            page reload guarantees the active-page state (and the CMS-driven nav/footer
            data) is always freshly server-rendered. */}
        <a href="/" className="ve-navbar-logo ve-nav-logo">
          <img src={logoSrc} alt="Vana Ekantha" />
        </a>

        <nav
          className="ve-nav-links"
          aria-label="Primary"
          ref={navRef}
          onPointerLeave={() => moveIndicator(null)}
        >
          <span className="ve-nav-indicator" ref={indicatorRef} aria-hidden="true" />
          {items.map((item) => {
            const active = isItemActive(pathname, item)
            const isDrop = !!item.children?.length
            const open = openKey === item.key
            return (
              <div
                className="ve-nav-item"
                key={item.key}
                onPointerEnter={(e) => {
                  moveIndicator(e.currentTarget)
                  if (e.pointerType !== 'mouse') return
                  if (isDrop) openMenu(item.key)
                  else closeMenu(120)
                }}
              >
                {isDrop ? (
                  <button
                    type="button"
                    ref={(el) => {
                      triggerRefs.current[item.key] = el
                    }}
                    className={`ve-nav-trigger${active ? ' ve-nav-active' : ''}${open ? ' ve-nav-trigger-open' : ''}`}
                    aria-expanded={open}
                    aria-haspopup="true"
                    aria-controls={`ve-mega-${item.key}`}
                    onClick={() => {
                      clearTimers()
                      setOpenKey((k) => (k === item.key ? null : item.key))
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        setOpenKey(item.key)
                      }
                    }}
                  >
                    {item.label}
                    <i className="fa-solid fa-chevron-down ve-nav-caret" aria-hidden="true" />
                  </button>
                ) : (
                  <a
                    href={item.href ?? '#'}
                    className={`ve-nav-link${active ? ' ve-nav-active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                    onMouseEnter={
                      item.previewUrl ? (e) => previewRef.current?.show(item.previewUrl as string, item.label, e.clientX, e.clientY) : undefined
                    }
                    onMouseMove={item.previewUrl ? (e) => previewRef.current?.move(e.clientX, e.clientY) : undefined}
                    onMouseLeave={item.previewUrl ? () => previewRef.current?.hide() : undefined}
                  >
                    {item.label}
                  </a>
                )}
              </div>
            )
          })}
        </nav>

        {data.cta?.href ? (
          <a href={data.cta.href} className="ve-nav-cta" onPointerEnter={() => closeMenu(120)}>
            <span>{data.cta.label}</span>
            <span className="ve-nav-cta-icon" aria-hidden="true">
              <i className="fa-solid fa-arrow-right" />
            </span>
          </a>
        ) : (
          <span />
        )}

        <NavbarMobileMenu
          items={items}
          cta={data.cta ?? undefined}
          pathname={pathname}
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
        />

        {/* Shared dropdown surface: one box that slides + resizes between menus. */}
        <div
          className="ve-mega"
          data-open={openKey ? 'true' : 'false'}
          data-morph={morph ? 'true' : 'false'}
          style={
            {
              '--mx': `${mega.x}px`,
              '--mw': `${mega.w}px`,
              '--mh': `${mega.h}px`,
              '--notch': `${mega.notch}px`,
            } as CSSProperties
          }
          onPointerEnter={() => {
            clearTimeout(closeTimer.current)
          }}
        >
          <span className="ve-mega-notch" aria-hidden="true" />
          <div className="ve-mega-body">
            {dropdowns.map((item, di) => {
              const isActive = openKey === item.key
              const hi = hoverIdx[item.key] ?? 0
              const kids = item.children ?? []
              const hovered = kids[Math.min(hi, kids.length - 1)]
              const shift = di < activeIdx ? -34 : di > activeIdx ? 34 : 0
              return (
                <div
                  className="ve-mega-panel"
                  id={`ve-mega-${item.key}`}
                  key={item.key}
                  data-active={isActive ? 'true' : 'false'}
                  ref={(el) => {
                    panelRefs.current[item.key] = el
                  }}
                  style={{ '--shift': `${shift}px` } as CSSProperties}
                >
                  <div className="ve-mega-list" style={{ '--hi': hi } as CSSProperties}>
                    <p className="ve-mega-heading">
                      <span className="ve-mega-heading-dash" aria-hidden="true" />
                      {item.heading}
                    </p>
                    <span className="ve-mega-hilite" aria-hidden="true" />
                    {kids.map((c, i) => (
                      <a
                        href={c.href}
                        key={c.href}
                        className={`ve-mega-link${pathname === c.href ? ' ve-mega-link-current' : ''}`}
                        style={{ '--i': i } as CSSProperties}
                        tabIndex={isActive ? 0 : -1}
                        onPointerEnter={() => setHoverIdx((h) => ({ ...h, [item.key]: i }))}
                        onFocus={() => setHoverIdx((h) => ({ ...h, [item.key]: i }))}
                      >
                        <span className={`ve-mega-thumb ve-tone-${i % 4}`}>
                          {c.image ? <img src={c.image} alt="" /> : <i className={`fa-solid ${c.icon}`} aria-hidden="true" />}
                        </span>
                        <span className="ve-mega-text">
                          <strong>{c.label}</strong>
                          {c.sub && <small>{c.sub}</small>}
                        </span>
                        <i className="fa-solid fa-chevron-right ve-mega-chev" aria-hidden="true" />
                      </a>
                    ))}
                    {item.all && (
                      <a
                        href={item.all.href}
                        className="ve-mega-all"
                        style={{ '--i': kids.length } as CSSProperties}
                        tabIndex={isActive ? 0 : -1}
                      >
                        {item.all.label}
                        <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                      </a>
                    )}
                  </div>

                  {hovered && (
                    <a href={hovered.href} className="ve-mega-feature" tabIndex={isActive ? 0 : -1} aria-label={hovered.label}>
                      {kids.map((c, i) => (
                        <span className={`ve-mega-fimg ve-tone-${i % 4}`} data-on={i === hi ? 'true' : 'false'} key={c.href} aria-hidden="true">
                          {c.image ? <img src={c.image} alt="" /> : <i className={`fa-solid ${c.icon}`} />}
                        </span>
                      ))}
                      <span className="ve-mega-fshade" aria-hidden="true" />
                      <span className="ve-mega-ftext" key={hovered.href}>
                        <strong>{hovered.label}</strong>
                        {hovered.tag && <small>{hovered.tag}</small>}
                      </span>
                      <span className="ve-mega-fgo" aria-hidden="true">
                        <i className="fa-solid fa-arrow-right" />
                      </span>
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <NavPreviewPanel ref={previewRef} />
      </header>

      {/* Dims + softly blurs the page behind an open dropdown. Sibling of the
          header (not a child) so the header's transform can't re-parent it. */}
      <div className="ve-nav-veil" data-open={openKey ? 'true' : 'false'} aria-hidden="true" />
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
