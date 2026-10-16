'use client'

import { useEffect, useRef } from 'react'
import type { Event } from '@/payload-types'
import { gsap } from '@/lib/animations/gsap'
import styles from './events.module.css'

/**
 * Closing section: the planning conversation starts here, so the form
 * rows cascade in one at a time — like a planning checklist being filled
 * out line by line — instead of the whole form fading in as one block.
 */
export function Enquiry({ data }: { data: Event['enquiry'] }) {
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

      gsap.from(section.querySelectorAll(`.${styles.eqRow}`), {
        opacity: 0,
        y: 18,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: `.${styles.enquiryForm}`, start: 'top 85%', once: true },
      })

      gsap.from(section.querySelectorAll(`.${styles.enquirySubmitRow}`), {
        opacity: 0,
        y: 16,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.3,
        scrollTrigger: { trigger: `.${styles.enquiryForm}`, start: 'top 85%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section id="enquiry" ref={sectionRef}>
      <div className={styles.enquiryInner}>
        <div className={styles.sectionHead} style={{ marginBottom: 0 }}>
          <span className="eyebrow">{data.eyebrow}</span>
          <h2 className={`section-title ${styles.sectionTitle}`}>{renderHeading(data.heading)}</h2>
          {data.sub && <p>{data.sub}</p>}
        </div>

        <form
          className={styles.enquiryForm}
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <div className={styles.eqRow}>
            <label className={styles.eqLabel} htmlFor="eq-name">
              {data.nameLabel}
            </label>
            <div className={styles.eqInput}>
              <input id="eq-name" type="text" placeholder={data.namePlaceholder ?? undefined} autoComplete="name" />
            </div>
          </div>

          <div className={styles.eqRow}>
            <label className={styles.eqLabel} htmlFor="eq-type">
              {data.eventTypeLabel}
              {data.eventTypeNote && <span>{data.eventTypeNote}</span>}
            </label>
            <div className={styles.eqInput}>
              <input id="eq-type" type="text" placeholder={data.eventTypePlaceholder ?? undefined} />
            </div>
          </div>

          <div className={styles.eqRow}>
            <label className={styles.eqLabel} htmlFor="eq-guests">
              {data.guestCountLabel}
            </label>
            <div className={styles.eqInput}>
              <input id="eq-guests" type="text" placeholder={data.guestCountPlaceholder ?? undefined} />
            </div>
          </div>

          <div className={styles.eqRow}>
            <label className={styles.eqLabel} htmlFor="eq-date">
              {data.preferredDateLabel}
            </label>
            <div className={styles.eqInput}>
              <input id="eq-date" type="text" placeholder={data.preferredDatePlaceholder ?? undefined} />
            </div>
          </div>

          <div className={styles.eqRow}>
            <label className={styles.eqLabel} htmlFor="eq-contact">
              {data.reachLabel}
            </label>
            <div className={styles.eqInput}>
              <input id="eq-contact" type="text" placeholder={data.reachPlaceholder ?? undefined} autoComplete="email" />
            </div>
          </div>

          <div className={styles.eqRow}>
            <label className={styles.eqLabel} htmlFor="eq-message">
              {data.moreLabel}
              {data.moreNote && <span>{data.moreNote}</span>}
            </label>
            <div className={styles.eqInput}>
              <textarea id="eq-message" placeholder={data.morePlaceholder ?? undefined} />
            </div>
          </div>

          <div className={styles.enquirySubmitRow}>
            <button type="submit" className="btn btn-primary">
              {data.submitLabel}
            </button>
            {data.submitNote && <p className={styles.enquirySubmitNote}>{data.submitNote}</p>}
          </div>
        </form>
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "tell us what you're <em>planning.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
