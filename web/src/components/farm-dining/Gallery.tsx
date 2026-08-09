import type { FarmDining } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import styles from './farm-dining.module.css'

export function Gallery({ data }: { data: FarmDining['gallery'] }) {
  const items = data.items ?? []

  return (
    <section id="gallery">
      <div className={`${styles.sectionHead} reveal`}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className="section-title">{renderHeading(data.heading)}</h2>
      </div>

      <div className={styles.bentoGrid}>
        {items.map((item, i) => {
          const image = resolveMedia(item.image)
          const variant = item.sizeVariant ?? 'default'
          const variantClass = [variant === 'wide' || variant === 'wideTall' ? styles.wide : '', variant === 'tall' || variant === 'wideTall' ? styles.tall : '']
            .filter(Boolean)
            .join(' ')
          return (
            <div className={`${styles.bentoItem} ${variantClass} reveal`} key={item.id ?? i}>
              {image.url && <img src={image.url} alt={item.caption ?? ''} loading="lazy" />}
              {item.caption && <div className={styles.bentoCap}>{item.caption}</div>}
            </div>
          )
        })}
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "a table, in <em>pieces.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
