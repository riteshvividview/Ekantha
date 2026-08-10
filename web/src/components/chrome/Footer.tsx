'use client'

import { useRef } from 'react'
import type { Footer as FooterData } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import { SocialIcon } from './SocialIcon'
import { useScrollReveal } from '@/lib/animations/useScrollReveal'

export function Footer({ data }: { data: FooterData }) {
  const brandLogo = resolveMedia(data.brand?.logo)
  const rootRef = useRef<HTMLElement>(null)
  // Scoped to the footer's own subtree (rather than the shared page-level
  // RevealController) so it reveals correctly even on pages that skip
  // RevealController entirely, e.g. the CmsNotConnected fallback.
  useScrollReveal(rootRef, '.footer-reveal')

  return (
    <footer className="ve-footer" id="veFooter" ref={rootRef}>
      {data.ctaBanner && (
        <div className="ve-footer-cta footer-reveal">
          <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>
            book your escape
          </span>
          <h2 className="section-title">{data.ctaBanner.heading}</h2>
          <p>{data.ctaBanner.body}</p>
          <a href={data.ctaBanner.buttonHref} className="btn btn-on-dark">
            {data.ctaBanner.buttonLabel}
          </a>
        </div>
      )}

      <div className="ve-footer-main">
        <div className="footer-reveal">
          <div className="ve-navbar-logo">
            {brandLogo.url && <img src={brandLogo.url} alt="" aria-hidden="true" />}
            Vana <em>Ekantha</em>
          </div>
          <p className="ve-footer-brand-tagline">{data.brand?.tagline}</p>
          {data.brand?.note && <p className="ve-footer-brand-note">{data.brand.note}</p>}
        </div>

        <div className="footer-reveal">
          <div className="ve-footer-col-head">Quick Links</div>
          <ul className="ve-footer-list">
            {(data.quickLinks ?? []).map((link) => (
              <li key={link.id ?? link.label}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-reveal">
          <div className="ve-footer-col-head">Contact</div>
          <ul className="ve-footer-list">
            {(data.contactInfo ?? []).map((row) => (
              <li key={row.id ?? row.label}>
                {row.isLink ? <a href={row.value}>{row.value}</a> : row.value}
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-reveal">
          <div className="ve-footer-col-head">Find Us, Quietly</div>
          <div className="ve-footer-social">
            {(data.socialLinks ?? []).map((link) => (
              <a href={link.href} key={link.id ?? link.label} aria-label={link.label} title={link.label}>
                <SocialIcon platform={link.platform} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="ve-footer-bottom">
        <span>{data.copyrightText}</span>
        <nav>
          {(data.legalLinks ?? []).map((link) => (
            <a href={link.href} key={link.id ?? link.label}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
