'use client'

import { useEffect, useRef } from 'react'
import type { Contact } from '@/payload-types'
import { InfoIcon } from './icons'
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
      <div className={styles.contactHead}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h1 className={`display-lg ${styles.sectionTitle}`}>{renderHeading(data.heading)}</h1>
        <p>{data.intro}</p>
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
            <svg viewBox="0 0 200 160" aria-hidden="true">
              <path d="M15,20 Q90,5 185,25 Q195,80 175,140 Q100,155 25,140 Q5,80 15,20 Z" strokeDasharray="3,4" />
              <path d="M20,120 Q80,60 180,30" strokeDasharray="2,4" />
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
