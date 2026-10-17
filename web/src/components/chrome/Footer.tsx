'use client'

import { useEffect, useRef } from 'react'
import { useLenis } from 'lenis/react'
import type { Footer as FooterData, Navigation } from '@/payload-types'
import { gsap } from '@/lib/animations/gsap'
import PolaroidLineCarousel, { type Slide } from '@/components/ui/polaroid-line-carousel'
import { assetUrl } from '@/lib/assetUrl'
import { buildNavModel } from './navModel'
import './footer.css'

// Its own unique set (served from R2 under images/footer-memories/) rather
// than reusing the Events section's photos — six candid moments standing in
// for the sign-off's own "memories from the estate" mood.
const MEMORY_SLIDES: Slide[] = [
  { image: assetUrl('/images/footer-memories/long-table.jpg'), title: 'Long Table', caption: 'Meals shared under open skies.' },
  { image: assetUrl('/images/footer-memories/a-toast.jpg'), title: 'A Toast', caption: 'Small moments, made to last.' },
  { image: assetUrl('/images/footer-memories/together.jpg'), title: 'Together', caption: 'Friends, family, no rush at all.' },
  { image: assetUrl('/images/footer-memories/golden-hour.jpg'), title: 'Golden Hour', caption: 'The estate at dusk, lit for the night.' },
  { image: assetUrl('/images/footer-memories/after-dark.jpg'), title: 'After Dark', caption: 'Stories under string lights.' },
  { image: assetUrl('/images/footer-memories/quiet-walks.jpg'), title: 'Quiet Walks', caption: 'Just the two of you, and the view.' },
]

const MAPS_LINK = 'https://maps.app.goo.gl/1PJsYW8sDpm6sf6HA'
const ADDRESS = '62MM+82, Pittampally, Hyderabad, Telangana 508114'

const SOCIAL_ICONS: Record<string, string> = {
  instagram: 'fa-brands fa-instagram',
  facebook: 'fa-brands fa-facebook-f',
  whatsapp: 'fa-brands fa-whatsapp',
  newsletter: 'fa-regular fa-envelope',
}

const CONTACT_ICONS: Record<string, string> = {
  phone: 'fa-solid fa-phone',
  email: 'fa-regular fa-envelope',
  location: 'fa-solid fa-location-dot',
}

const HELP_LINKS = [
  { label: 'FAQs', href: '/faqs' },
  { label: 'Contact Us', href: '/contact' },
]

export function Footer({ data, nav }: { data: FooterData; nav?: Navigation }) {
  const rootRef = useRef<HTMLElement>(null)
  const lenis = useLenis()

  const stays = buildNavModel(nav?.primaryLinks ?? []).find((i) => i.label === 'Stay')?.children ?? []
  const helpLinks = [...HELP_LINKS, ...(data.legalLinks ?? []).map((l) => ({ label: l.label, href: l.href }))]

  useEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      const q = <T extends Element = HTMLElement>(sel: string) => Array.from(root.querySelectorAll<T>(sel))
      if (reduced) return

      gsap.from(q('[data-col]'), {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: q('[data-cols]')[0], start: 'top 88%', once: true },
      })

      // Sign-off: lines rise out of masks, the rest fades up.
      const outro = q('[data-bottom]')[0]
      gsap.from(q('[data-line-inner]'), {
        yPercent: 115,
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.14,
        scrollTrigger: { trigger: outro, start: 'top 70%', once: true },
      })
      gsap.from(q('[data-fade]'), {
        opacity: 0,
        y: 26,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: outro, start: 'top 65%', once: true },
      })

      const scrub = { trigger: outro, start: 'top bottom', end: 'bottom top', scrub: true }
      gsap.fromTo(q('[data-ghost]'), { xPercent: 6 }, { xPercent: -6, ease: 'none', scrollTrigger: scrub })
    }, root)
    return () => ctx.revert()
  }, [])

  const toTop = () => (lenis ? lenis.scrollTo(0, { duration: 1.8 }) : window.scrollTo({ top: 0, behavior: 'smooth' }))

  const contactHref = (label: string, value: string) => {
    const l = label.toLowerCase()
    if (l === 'phone') return `tel:${value.replace(/[^\d+]/g, '')}`
    if (l === 'email') return `mailto:${value}`
    return null
  }

  return (
    <footer className="ve-foot" id="veFooter" ref={rootRef}>
      {/* ── Cream body ─────────────────────────────────────────────────── */}
      <div className="ve-foot-body">
        <div className="ve-foot-cols" data-cols>
          <div className="ve-foot-col ve-foot-brand" data-col>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- plain <a> on purpose, like every other link on this site (fresh server render per page). */}
            <a href="/" className="ve-foot-logo" aria-label="Vana Ekantha, home">
              {/* The footer body is always the light/cream resting state by
                  the time a page scrolls this far (every dark section tweens
                  the page back to light before its own end — see Reach.tsx),
                  so this is the one spot that never needs to swap logos. */}
              <img src="/ekantha-logo-brown.webp" alt="Vana Ekantha" />
            </a>
            <p className="ve-foot-tagline">{data.brand?.tagline}</p>
            {data.brand?.note && <p className="ve-foot-note">{data.brand.note}</p>}
            <div className="ve-foot-social">
              {(data.socialLinks ?? []).map((link) => (
                <a href={link.href} key={link.id ?? link.label} aria-label={link.label} title={link.label}>
                  <i className={SOCIAL_ICONS[link.platform ?? ''] ?? 'fa-solid fa-link'} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <nav className="ve-foot-col" data-col aria-label="Explore">
            <h3 className="ve-foot-head">Explore</h3>
            <ul className="ve-foot-list">
              {(data.quickLinks ?? []).map((link) => (
                <li key={link.id ?? link.label}>
                  <a href={link.href}>
                    {link.label}
                    <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="ve-foot-col" data-col aria-label="Our stays">
            <h3 className="ve-foot-head">Our Stays</h3>
            <ul className="ve-foot-stays">
              {stays.map((s, i) => (
                <li key={s.href}>
                  <a href={s.href}>
                    <span className={`ve-foot-thumb ve-foot-tone-${i % 3}`}>
                      {s.image ? <img src={s.image} alt="" /> : <i className={`fa-solid ${s.icon}`} aria-hidden="true" />}
                    </span>
                    <span>
                      <strong>{s.label}</strong>
                      {s.sub && <small>{s.sub}</small>}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="ve-foot-col" data-col aria-label="Help and info">
            <h3 className="ve-foot-head">Help &amp; Info</h3>
            <ul className="ve-foot-list">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>
                    {link.label}
                    <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ve-foot-col" data-col>
            <h3 className="ve-foot-head">Contact</h3>
            <ul className="ve-foot-contact">
              {(data.contactInfo ?? []).map((row) => {
                const key = row.label.toLowerCase()
                const value = key === 'location' ? ADDRESS : row.value
                const href = contactHref(row.label, value)
                return (
                  <li key={row.id ?? row.label}>
                    <i className={CONTACT_ICONS[key] ?? 'fa-solid fa-circle'} aria-hidden="true" />
                    {href ? <a href={href}>{value}</a> : <span>{value}</span>}
                  </li>
                )
              })}
              <li>
                <i className="fa-regular fa-paper-plane" aria-hidden="true" />
                <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer">
                  Get Directions
                </a>
              </li>
            </ul>
          </div>
        </div>

        <svg className="ve-foot-wave" viewBox="0 0 2880 140" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,50 C240,100 480,10 720,52 C960,100 1200,10 1440,50 C1680,100 1920,10 2160,52 C2400,100 2640,10 2880,50 L2880,0 L0,0 Z" />
        </svg>
      </div>

      {/* ── Sign-off band ─────────────────────────────────────────────── */}
      <div className="ve-foot-bottom" data-bottom>
        <div className="ve-foot-glow" aria-hidden="true" />
        <span className="ve-foot-ghost" data-ghost aria-hidden="true">
          Ekantha
        </span>

        <div className="ve-foot-outro">
          <p className="ve-foot-eyebrow" data-fade>
            <span />
            {(data.ctaBanner?.heading ?? 'Until we meet').replace(/\.$/, '')}
          </p>
          <h2 className="ve-foot-see">
            <span className="ve-foot-line">
              <span data-line-inner>See you at</span>
            </span>
            <span className="ve-foot-line">
              <span data-line-inner>
                <em>Vana Ekantha.</em>
              </span>
            </span>
          </h2>
          {data.ctaBanner && (
            <div className="ve-foot-cta" data-fade>
              <p>{data.ctaBanner.body}</p>
              <a href={data.ctaBanner.buttonHref} className="ve-foot-cta-btn">
                {data.ctaBanner.buttonLabel}
                <span aria-hidden="true">
                  <i className="fa-solid fa-arrow-right" />
                </span>
              </a>
            </div>
          )}
        </div>

        {/* Polaroid memory line — replaces the old three static photo
            frames (still backed up as Footer.tsx.bak-frames /
            footer.css.bak-frames if this ever needs reverting). */}
        <div className="ve-foot-frames">
          <PolaroidLineCarousel
            slides={MEMORY_SLIDES}
            height="100%"
            cardWidth={230}
            autoplay={4200}
            string="#e3c48c"
            background="transparent"
            ink="#f6ecdc"
            ariaLabel="Moments from Vana Ekantha"
          />
        </div>
      </div>

      {/* ── Bar ────────────────────────────────────────────────────────── */}
      <div className="ve-foot-bar">
        <span>{data.copyrightText}</span>
        <span className="ve-foot-bar-right">
          <span className="ve-foot-bar-tag">Designed for a slower, better tomorrow.</span>
          <button type="button" className="ve-foot-top-btn" onClick={toTop}>
            Back to Top
            <span aria-hidden="true">
              <i className="fa-solid fa-arrow-up" />
            </span>
          </button>
        </span>
      </div>
    </footer>
  )
}
