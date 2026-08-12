'use client'

import type { Event } from '@/payload-types'
import styles from './events.module.css'

export function Enquiry({ data }: { data: Event['enquiry'] }) {
  return (
    <section id="enquiry">
      <div className={styles.enquiryInner}>
        <div className={`${styles.sectionHead} reveal`} style={{ marginBottom: 0 }}>
          <span className="eyebrow">{data.eyebrow}</span>
          <h2 className="section-title">{renderHeading(data.heading)}</h2>
          {data.sub && <p>{data.sub}</p>}
        </div>

        <form
          className={`${styles.enquiryForm} reveal`}
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
