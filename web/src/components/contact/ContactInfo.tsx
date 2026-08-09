import type { Contact } from '@/payload-types'
import { InfoIcon } from './icons'
import styles from './contact.module.css'

export function ContactInfo({ data }: { data: Contact['info'] }) {
  const rows = data.rows ?? []

  return (
    <section id="top">
      <div className={`${styles.contactHead} reveal`}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h1 className="display-lg">{renderHeading(data.heading)}</h1>
        <p>{data.intro}</p>
      </div>

      <div className={styles.contactGrid}>
        <div className={`${styles.infoList} reveal`}>
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

        <div className={`${styles.mapCard} reveal`}>
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
