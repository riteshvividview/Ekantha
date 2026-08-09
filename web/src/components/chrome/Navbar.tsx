import Link from 'next/link'
import type { Navigation } from '@/payload-types'
import { NavbarMobileMenu } from './NavbarMobileMenu'
import { resolveMedia } from '@/lib/media'

export function Navbar({ data }: { data: Navigation }) {
  const logoIcon = resolveMedia(data.logo?.icon)

  return (
    <header className="ve-navbar">
      <Link href="/" className="ve-navbar-logo">
        {logoIcon.url && <img src={logoIcon.url} alt="" aria-hidden="true" />}
        {renderWordmark(data.logo?.wordmark ?? 'Vana Ekantha')}
      </Link>

      <nav className="ve-navbar-links" aria-label="Primary">
        {(data.primaryLinks ?? []).map((link) => (
          <span className="ve-navbar-link-wrap" key={link.id ?? link.label}>
            <a href={link.href} className="ve-navbar-link">
              {link.label}
            </a>
            {link.submenu && link.submenu.length > 0 && (
              <div className="ve-navbar-submenu">
                {link.submenu.map((sub) => (
                  <a href={sub.href} key={sub.id ?? sub.label}>
                    {sub.label}
                  </a>
                ))}
              </div>
            )}
          </span>
        ))}
        {data.cta?.href && (
          <a href={data.cta.href} className="btn btn-primary">
            {data.cta.label}
          </a>
        )}
      </nav>

      <NavbarMobileMenu links={data.primaryLinks ?? []} cta={data.cta ?? undefined} />
    </header>
  )
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
