'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { Navigation } from '@/payload-types'
import { NavbarMobileMenu } from './NavbarMobileMenu'
import { resolveMedia } from '@/lib/media'

export function Navbar({ data }: { data: Navigation }) {
  const logoIcon = resolveMedia(data.logo?.icon)
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <header className={`ve-navbar${mounted ? ' ve-navbar-in' : ''}`}>
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
          return (
            <span className="ve-navbar-link-wrap" key={link.id ?? link.label}>
              <a href={link.href} className={`ve-navbar-link${active ? ' ve-navbar-link-active' : ''}`}>
                {link.label}
              </a>
              {link.submenu && link.submenu.length > 0 && (
                <div className="ve-navbar-submenu">
                  {link.submenu.map((sub) => (
                    <a
                      href={sub.href}
                      key={sub.id ?? sub.label}
                      className={pathname === sub.href ? 've-navbar-submenu-active' : undefined}
                    >
                      {sub.label}
                    </a>
                  ))}
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
