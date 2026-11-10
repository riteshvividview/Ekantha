'use client'

import { useEffect, useRef } from 'react'
import type { Event } from '@/payload-types'
import { LedgerIcon } from './icons'
import { gsap } from '@/lib/animations/gsap'
import { Landscape, MangoSprig, Toast, Envelope, EstateMap, Icon } from '../illustrations/Line'
import styles from './events.module.css'

/**
 * This section is the planning/logistics half of the page — capacity,
 * setup, parking — so its rows enter like a checklist being ticked off:
 * each row slides in from the left a beat after the last, and its icon
 * settles out of a small rotation, rather than a single flat block fade.
 */
export function VenueFeatures({ data }: { data: Event['venueFeatures'] }) {
  const items = data.items ?? []
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll(`.${styles.sectionHead}`), {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
      })
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.from(section.querySelectorAll(`.${styles.ledgerRow}`), {
        opacity: 0,
        y: 18,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.07,
        scrollTrigger: { trigger: section.querySelector(`.${styles.ledger}`), start: 'top 82%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className="bg-silver" id="features" ref={sectionRef}>
      <div className={styles.sectionHead}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className={`section-title ${styles.sectionTitle}`}>{renderHeading(data.heading)}</h2>
      </div>

      <div className={styles.featLayout}>
      <div className={styles.featMap}>
        <EstateMap className={styles.featMapSvg} />
        <p>A sketch of the estate: lawns, the house, shaded parking and the garden path.</p>
      </div>
      <div className={styles.ledger}>
        {items.map((item, i) => (
          <div className={styles.ledgerRow} key={item.id ?? i}>
            <div className={styles.ledgerIcon}>
              <LedgerIcon icon={item.icon} />
            </div>
            <div className={styles.ledgerTitle}>{item.title}</div>
            <div className={styles.ledgerDesc}>{item.description}</div>
          </div>
        ))}
      </div>
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "what the estate <em>provides.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
