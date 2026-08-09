'use client'

import { useState } from 'react'
import type { Navigation } from '@/payload-types'

type Props = {
  links: NonNullable<Navigation['primaryLinks']>
  cta?: Navigation['cta']
}

export function NavbarMobileMenu({ links, cta }: Props) {
  const [open, setOpen] = useState(false)

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

      <div className={`ve-navbar-mobile${open ? ' open' : ''}`}>
        {links.map((link) => (
          <div key={link.id ?? link.label}>
            <a href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
            {link.submenu && link.submenu.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', paddingLeft: '1rem' }}>
                {link.submenu.map((sub) => (
                  <a
                    href={sub.href}
                    key={sub.id ?? sub.label}
                    onClick={() => setOpen(false)}
                    style={{ fontSize: '1rem', color: 'var(--ink-soft)' }}
                  >
                    {sub.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
        {cta?.href && (
          <a href={cta.href} className="btn btn-primary" onClick={() => setOpen(false)} style={{ marginTop: '1rem' }}>
            {cta.label}
          </a>
        )}
      </div>
    </>
  )
}
