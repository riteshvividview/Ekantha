'use client'

import { useEffect, useRef } from 'react'
import type { Contact } from '@/payload-types'
import { gsap } from '@/lib/animations/gsap'
import styles from './contact.module.css'

/**
 * The form itself carries this section's personality instead of a scroll
 * effect: each field's underline grows in from the left the moment you
 * focus it, the label above lifts a shade darker, and the whole block
 * just eases up a little as it enters — small, direct feedback rather
 * than a performance.
 */
export function ContactForm({ data }: { data: Contact['form'] }) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll(`.${styles.formSectionHead} > *`), {
        opacity: 0,
        y: 16,
        duration: 0.8,
        ease: 'power2.out',
        stagger: 0.08,
        scrollTrigger: { trigger: section, start: 'top 85%', once: true },
      })

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap.from(section.querySelectorAll(`.${styles.cfField}`), {
        opacity: 0,
        y: 14,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.06,
        scrollTrigger: { trigger: `.${styles.contactForm}`, start: 'top 85%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className="bg-silver" id="form" ref={sectionRef}>
      <div className={styles.formSectionHead}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className={`section-title ${styles.sectionTitle}`} style={{ marginTop: '1rem' }}>
          {renderHeading(data.heading)}
        </h2>
        <p>{data.intro}</p>
      </div>

      <form
        className={styles.contactForm}
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <div className={styles.cfGrid}>
          <div className={styles.cfField}>
            <label className={styles.cfLabel} htmlFor="cf-name">
              {data.nameLabel}
            </label>
            <div className={styles.cfInputWrap}>
              <input id="cf-name" type="text" placeholder={data.namePlaceholder ?? undefined} autoComplete="name" />
            </div>
          </div>
          <div className={styles.cfField}>
            <label className={styles.cfLabel} htmlFor="cf-contact">
              {data.contactLabel}
            </label>
            <div className={styles.cfInputWrap}>
              <input id="cf-contact" type="text" placeholder={data.contactPlaceholder ?? undefined} />
            </div>
          </div>
        </div>

        <div className={styles.cfField}>
          <label className={styles.cfLabel} htmlFor="cf-subject">
            {data.subjectLabel}
          </label>
          <div className={styles.cfInputWrap}>
            <input id="cf-subject" type="text" placeholder={data.subjectPlaceholder ?? undefined} />
          </div>
        </div>

        <div className={styles.cfField}>
          <label className={styles.cfLabel} htmlFor="cf-message">
            {data.messageLabel}
          </label>
          <div className={styles.cfInputWrap}>
            <textarea id="cf-message" placeholder={data.messagePlaceholder ?? undefined} />
          </div>
        </div>

        <div className={styles.cfSubmitRow}>
          <button type="submit" className="btn btn-primary">
            {data.submitLabel}
          </button>
          {data.submitNote && <p className={styles.cfSubmitNote}>{data.submitNote}</p>}
        </div>
      </form>
    </section>
  )
}

/** "or, write it down here." → italicizes the last two words, matching
 *  "or, write it <em>down here.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last2 = words.splice(-2, 2)
  return (
    <>
      {words.join(' ')} <em>{last2.join(' ')}</em>
    </>
  )
}
