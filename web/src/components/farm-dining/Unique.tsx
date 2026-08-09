import type { FarmDining } from '@/payload-types'
import styles from './farm-dining.module.css'

export function Unique({ data }: { data: FarmDining['unique'] }) {
  const items = data.items ?? []

  return (
    <section id="unique">
      <div className={`${styles.sectionHead} reveal`}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className="section-title">{renderHeading(data.heading)}</h2>
        {data.sub && <p>{data.sub}</p>}
      </div>

      <div className={styles.uniqueRow}>
        {items.map((item, i) => (
          <div className={`${styles.uniqueItem} reveal`} key={item.id ?? i}>
            <div className={styles.uniqueNum}>{item.number}</div>
            <div className={styles.uniqueTitle}>{item.title}</div>
            <div className={styles.uniqueBody}>{item.body}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "a dinner that isn't <em>replicated.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
