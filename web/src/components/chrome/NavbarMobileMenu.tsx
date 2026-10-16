'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useLenis } from 'lenis/react'
import type { Navigation } from '@/payload-types'
import { isItemActive } from './navModel'
import type { NavItem } from './navModel'

type Props = {
  items: NavItem[]
  cta?: Navigation['cta']
  pathname: string
  /** Lifted to Navbar.tsx so the header logo can swap to white while the
      panel is open, not just tracked locally. */
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Full-screen menu for tablet/phone widths. Opens as a circle that grows out
 * of the burger, then the links rise in one after another; Stay/Experiences
 * expand as accordions with the same thumbnails as the desktop dropdown.
 */
export function NavbarMobileMenu({ items, cta, pathname, open, onOpenChange: setOpen }: Props) {
  const [mounted, setMounted] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const lenis = useLenis()

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Close when the route changes.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setOpen(false)
      setExpanded(null)
    })
    return () => cancelAnimationFrame(id)
  }, [pathname, setOpen])

  // Lock page scroll while open, Escape to close.
  useEffect(() => {
    if (!open) return undefined
    lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      document.documentElement.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, lenis, setOpen])

  // Leaving the phone/tablet range while open would strand the panel.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1101px)')
    const onChange = () => mq.matches && setOpen(false)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [setOpen])

  const close = () => setOpen(false)
  const step = (i: number) => ({ '--d': `${140 + i * 60}ms` }) as CSSProperties

  const panel = (
    <div className="ve-mnav" data-open={open ? 'true' : 'false'} data-lenis-prevent aria-hidden={!open}>
      <div className="ve-mnav-glow" aria-hidden="true" />
      <nav className="ve-mnav-inner" aria-label="Mobile">
        <ul className="ve-mnav-list">
          {items.map((item, i) => {
            const active = isItemActive(pathname, item)
            const kids = item.children ?? []
            const isOpen = expanded === item.key
            return (
              <li className="ve-mnav-item" style={step(i)} key={item.key}>
                {kids.length > 0 ? (
                  <>
                    <button
                      type="button"
                      className={`ve-mnav-row${active ? ' ve-mnav-active' : ''}`}
                      aria-expanded={isOpen}
                      onClick={() => setExpanded(isOpen ? null : item.key)}
                      tabIndex={open ? 0 : -1}
                    >
                      <span className="ve-mnav-num">{String(i + 1).padStart(2, '0')}</span>
                      <span className="ve-mnav-label">{item.label}</span>
                      <span className="ve-mnav-plus" aria-hidden="true">
                        <i className="fa-solid fa-plus" />
                      </span>
                    </button>
                    <div className="ve-mnav-sub" data-open={isOpen ? 'true' : 'false'}>
                      <div className="ve-mnav-sub-inner">
                        {kids.map((c) => (
                          <a
                            href={c.href}
                            key={c.href}
                            className={`ve-mnav-child${pathname === c.href ? ' ve-mnav-active' : ''}`}
                            onClick={close}
                            tabIndex={open && isOpen ? 0 : -1}
                          >
                            <span className="ve-mnav-thumb">
                              {c.image ? <img src={c.image} alt="" /> : <i className={`fa-solid ${c.icon}`} aria-hidden="true" />}
                            </span>
                            <span>
                              <strong>{c.label}</strong>
                              {c.sub && <small>{c.sub}</small>}
                            </span>
                            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                          </a>
                        ))}
                        {item.all && (
                          <a href={item.all.href} className="ve-mnav-all" onClick={close} tabIndex={open && isOpen ? 0 : -1}>
                            {item.all.label} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <a
                    href={item.href ?? '#'}
                    className={`ve-mnav-row${active ? ' ve-mnav-active' : ''}`}
                    onClick={close}
                    tabIndex={open ? 0 : -1}
                  >
                    <span className="ve-mnav-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="ve-mnav-label">{item.label}</span>
                    <span className="ve-mnav-plus ve-mnav-go" aria-hidden="true">
                      <i className="fa-solid fa-arrow-right" />
                    </span>
                  </a>
                )}
              </li>
            )
          })}
        </ul>

        {cta?.href && (
          <a href={cta.href} className="ve-mnav-cta" style={step(items.length)} onClick={close} tabIndex={open ? 0 : -1}>
            <span>{cta.label}</span>
            <span className="ve-nav-cta-icon" aria-hidden="true">
              <i className="fa-solid fa-arrow-right" />
            </span>
          </a>
        )}
      </nav>
    </div>
  )

  return (
    <>
      <button
        type="button"
        className="ve-nav-burger"
        data-open={open ? 'true' : 'false'}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Portaled straight to <body>: this panel is `position: fixed`, and any
          transformed ancestor (the header's hide-on-scroll transform) would
          silently change what "fixed" is relative to. */}
      {mounted && createPortal(panel, document.body)}
    </>
  )
}
