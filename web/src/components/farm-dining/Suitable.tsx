import type { FarmDining } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import { SuitableIconSvg } from './icons'
import styles from './farm-dining.module.css'

export function Suitable({ data }: { data: FarmDining['suitable'] }) {
  const items = data.items ?? []

  return (
    <section className="bg-silver" id="suitable">
      <div className={`${styles.sectionHead} reveal`}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className="section-title">{renderHeading(data.heading)}</h2>
      </div>

      <div className={styles.suitGrid}>
        {items.map((item, i) => {
          const image = resolveMedia(item.image)
          return (
            <div className={`${styles.suitCard}${item.featured ? ` ${styles.featured}` : ''} reveal`} key={item.id ?? i}>
              {item.featured && image.url && <img className={styles.suitMedia} src={image.url} alt="" loading="lazy" />}
              <div className={styles.suitIcon} aria-hidden="true">
                <SuitableIconSvg icon={item.icon} />
              </div>
              <div className={styles.suitTitle}>{item.title}</div>
              <div className={styles.suitBody}>{item.body}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "who comes to the <em>table.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
