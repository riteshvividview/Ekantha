'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Navigation } from '@/payload-types'

type Props = {
  links: NonNullable<Navigation['primaryLinks']>
  cta?: Navigation['cta']
  pathname: string
}

export function NavbarMobileMenu({ links, cta, pathname }: Props) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const panel = (
    <div className={`ve-navbar-mobile${open ? ' open' : ''}`}>
      {links.map((link, i) => {
        const active = pathname === link.href || link.submenu?.some((sub) => sub.href === pathname)
        return (
          <div
            key={link.id ?? link.label}
            className="ve-navbar-mobile-item"
            style={{ transitionDelay: open ? `${80 + i * 45}ms` : '0ms' }}
          >
            <a href={link.href} className={active ? 've-navbar-link-active' : undefined} onClick={() => setOpen(false)}>
              {link.label}
            </a>
            {link.submenu && link.submenu.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', paddingLeft: '1rem' }}>
                {link.submenu.map((sub) => (
                  <a
                    href={sub.href}
                    key={sub.id ?? sub.label}
                    onClick={() => setOpen(false)}
                    className={pathname === sub.href ? 've-navbar-link-active' : undefined}
                    style={{ fontSize: '1rem', color: pathname === sub.href ? undefined : 'var(--ink-soft)' }}
                  >
                    {sub.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        )
      })}
      {cta?.href && (
        <a
          href={cta.href}
          className="btn btn-primary ve-navbar-mobile-item"
          onClick={() => setOpen(false)}
          style={{ marginTop: '1rem', transitionDelay: open ? `${80 + links.length * 45}ms` : '0ms' }}
        >
          {cta.label}
        </a>
      )}
    </div>
  )

  return (
    <>
      <button
        type="button"
        className="ve-navbar-burger"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          {open ? (
            <path
              d="M6,6 L18,18 M18,6 L6,18"
              stroke="var(--ink)"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            <path
              d="M4,7 L20,7 M4,12 L20,12 M4,17 L20,17"
              stroke="var(--ink)"
              strokeWidth="1.6"
              strokeLinecap="round"
              fill="none"
            />
          )}
        </svg>
      </button>

      {/* Portaled straight to <body> rather than rendered inline here —
          this panel is `position: fixed`, and any ancestor with a
          `transform` (even the navbar's own entrance-fade `translateY(0)`)
          would silently change what "fixed" is positioned relative to,
          leaving it stuck near the top of the page instead of off-screen.
          See the git history for how that actually happened once. */}
      {mounted && createPortal(panel, document.body)}
    </>
  )
}
