import type { Event } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import styles from './events.module.css'

export function Gallery({ data }: { data: Event['gallery'] }) {
  const items = data.items ?? []

  return (
    <section id="gallery">
      <div className={`${styles.sectionHead} reveal`}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className="section-title">{renderHeading(data.heading)}</h2>
      </div>

      <div className={styles.collage}>
        {items.map((item, i) => {
          const image = resolveMedia(item.image)
          return (
            <div className={`${styles.collageItem} reveal`} key={item.id ?? i}>
              <div className={styles.collagePlate}>{image.url && <img src={image.url} alt={item.caption ?? ''} loading="lazy" />}</div>
              {item.caption && <p className={styles.collageCaption}>{item.caption}</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "a few <em>evenings.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
