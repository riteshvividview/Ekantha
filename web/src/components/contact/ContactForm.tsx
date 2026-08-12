'use client'

import type { Contact } from '@/payload-types'
import styles from './contact.module.css'

export function ContactForm({ data }: { data: Contact['form'] }) {
  return (
    <section className="bg-silver" id="form">
      <div className={`${styles.formSectionHead} reveal`}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className="section-title" style={{ marginTop: '1rem' }}>
          {renderHeading(data.heading)}
        </h2>
        <p>{data.intro}</p>
      </div>

      <form
        className={`${styles.contactForm} reveal`}
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <div className={styles.cfGrid}>
          <div className={styles.cfField}>
            <label className={styles.cfLabel} htmlFor="cf-name">
              {data.nameLabel}
            </label>
            <input id="cf-name" type="text" placeholder={data.namePlaceholder ?? undefined} autoComplete="name" />
          </div>
          <div className={styles.cfField}>
            <label className={styles.cfLabel} htmlFor="cf-contact">
              {data.contactLabel}
            </label>
            <input id="cf-contact" type="text" placeholder={data.contactPlaceholder ?? undefined} />
          </div>
        </div>

        <div className={styles.cfField}>
          <label className={styles.cfLabel} htmlFor="cf-subject">
            {data.subjectLabel}
          </label>
          <input id="cf-subject" type="text" placeholder={data.subjectPlaceholder ?? undefined} />
        </div>

        <div className={styles.cfField}>
          <label className={styles.cfLabel} htmlFor="cf-message">
            {data.messageLabel}
          </label>
          <textarea id="cf-message" placeholder={data.messagePlaceholder ?? undefined} />
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
