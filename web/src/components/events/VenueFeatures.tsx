import type { Event } from '@/payload-types'
import { LedgerIcon } from './icons'
import styles from './events.module.css'

export function VenueFeatures({ data }: { data: Event['venueFeatures'] }) {
  const items = data.items ?? []

  return (
    <section className="bg-silver" id="features">
      <div className={`${styles.sectionHead} reveal`}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className="section-title">{renderHeading(data.heading)}</h2>
      </div>

      <div className={styles.ledger}>
        {items.map((item, i) => (
          <div className={`${styles.ledgerRow} reveal`} key={item.id ?? i}>
            <div className={styles.ledgerIcon}>
              <LedgerIcon icon={item.icon} />
            </div>
            <div className={styles.ledgerTitle}>{item.title}</div>
            <div className={styles.ledgerDesc}>{item.description}</div>
          </div>
        ))}
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
