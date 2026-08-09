import type { Event } from '@/payload-types'
import styles from './events.module.css'

export function Customise({ data }: { data: Event['customise'] }) {
  const groups = data.groups ?? []

  return (
    <section className="bg-silver" id="customise">
      <div className={`${styles.sectionHead} reveal`}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className="section-title">{renderHeading(data.heading)}</h2>
        {data.sub && <p>{data.sub}</p>}
      </div>

      <div className={styles.customGroups}>
        {groups.map((group, i) => (
          <div className="reveal" key={group.id ?? i}>
            <div className={styles.customGroupLabel}>
              {group.groupLabel} <span>{group.groupNumber}</span>
            </div>
            <div className={styles.chipRow}>
              {(group.chips ?? []).map((chip, j) => (
                <span className={styles.chip} key={chip.id ?? j}>
                  <span className={styles.chipPlus}>+</span>
                  {chip.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "shape the evening <em>your way.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
