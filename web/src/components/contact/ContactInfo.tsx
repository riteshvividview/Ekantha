'use client'

import { useEffect, useRef } from 'react'
import type { Contact } from '@/payload-types'
import Image from 'next/image'
import { InfoIcon } from './icons'
import { assetUrl } from '@/lib/assetUrl'
import { Envelope } from '../illustrations/Line'
import { gsap } from '@/lib/animations/gsap'
import styles from './contact.module.css'

/**
 * This is the page's quiet arrival, not a hero — the eyebrow, heading and
 * intro simply settle in on load (no scroll narrative needed above the
 * fold), then the info rows and map card ease up a beat later as they
 * come into view, like someone laying out a few calm facts rather than
 * staging a reveal.
 */
export function ContactInfo({ data }: { data: Contact['info'] }) {
  const rows = data.rows ?? []
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll(`.${styles.contactHead} > *`), {
        opacity: 0,
        y: 16,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.08,
      })

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap.from(section.querySelectorAll(`.${styles.infoRow}`), {
        opacity: 0,
        y: 14,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.08,
        scrollTrigger: { trigger: `.${styles.infoList}`, start: 'top 85%', once: true },
      })

      gsap.from(section.querySelectorAll(`.${styles.ciVisual}`), { opacity: 0, y: 24, duration: 1, ease: 'power3.out', delay: 0.2 })
      gsap.from(section.querySelectorAll(`.${styles.mapCard}`), {
        opacity: 0,
        y: 14,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: `.${styles.mapCard}`, start: 'top 85%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section id="top" ref={sectionRef}>
      <div className={styles.ciHero}>
        <div className={styles.contactHead}>
          <span className="eyebrow">{data.eyebrow}</span>
          <h1 className={`display-lg ${styles.sectionTitle}`}>{renderHeading(data.heading)}</h1>
          <p>{data.intro}</p>
        </div>
        <div className={styles.ciVisual} aria-hidden="true">
          <div className={styles.ciPhoto}>
            <Image src={assetUrl('/images/site/why-us-hrs-away-img-two.jpg')} alt="" fill sizes="(max-width: 860px) 92vw, 44vw" quality={90} style={{ objectFit: 'cover' }} priority />
          </div>
          <div className={styles.ciLetter}>
            <Envelope className={styles.ciEnvelope} />
            <span>A real person replies, usually within a day.</span>
          </div>
        </div>
      </div>

      <div className={styles.contactGrid}>
        <div className={styles.infoList}>
          {rows.map((row, i) => (
            <div className={styles.infoRow} key={row.id ?? i}>
              <div className={styles.infoIcon}>
                <InfoIcon icon={row.icon} />
              </div>
              <div>
                <div className={styles.infoLabel}>{row.label}</div>
                <div className={styles.infoValue}>{row.href ? <a href={row.href}>{row.value}</a> : row.value}</div>
                {row.note && <div className={styles.infoNote}>{row.note}</div>}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.mapCard}>
          <div className={styles.mapVisual}>
            <svg viewBox="0 0 320 200" aria-hidden="true">
              <path d="M10 170 C 60 150, 70 110, 120 112 S 190 60, 250 70" strokeDasharray="5 6" className={styles.route} />
              <circle cx="38" cy="160" r="6" />
              <text x="38" y="186" textAnchor="middle">HYDERABAD</text>
              <path d="M150 30 l10 -16 l10 16 z M 200 40 l8 -13 l8 13 z M 60 60 l8 -13 l8 13 z" />
              <path d="M20 40 q 6 -6 12 0 q 6 -6 12 0 M 260 140 q 6 -6 12 0 q 6 -6 12 0" />
              <path d="M110 150 C 130 140, 150 160, 170 150 S 210 160, 230 150" />
              <text x="250" y="102" textAnchor="middle">VANA EKANTHA</text>
            </svg>
            <div className={styles.mapPin} />
          </div>
          {data.mapCaption && <p className={styles.mapCaption}>{data.mapCaption}</p>}
        </div>
      </div>
    </section>
  )
}

/** "Talk to a person, not a form." → italicizes the word right before the
 *  first comma, matching "Talk to a <em>person,</em><br>not a form." */
function renderHeading(heading: string) {
  const commaIndex = heading.indexOf(',')
  if (commaIndex === -1) return heading

  const before = heading.slice(0, commaIndex)
  const after = heading.slice(commaIndex + 1).trim()
  const words = before.trim().split(' ')
  const last = words.pop()

  return (
    <>
      {words.join(' ')} <em>{last},</em>
      <br />
      {after}
    </>
  )
}
