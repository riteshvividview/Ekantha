import type { Stay } from '@/payload-types'
import { resolveMediaSize } from '@/lib/media'
import styles from './full.module.css'

/** Full House's alternating image/text rows — matches FullHouse.html's
 *  `.am-*` design. Reuses the same `amenitiesSection.items` field Mango
 *  House's snap-scroll cards and Stone House's mosaic grid use. */
export function Amenities({ data }: { data: Stay['amenitiesSection'] }) {
  const items = data?.items ?? []
  if (!items.length) return null

  return (
    <section id="amenities">
      <div className="section-head reveal">
        <h2 className="section-title">amenities &amp; <em>inclusions.</em></h2>
        <p>Everything below comes with a full-house booking. Nothing here needs to be requested twice.</p>
      </div>

      <div className={styles.amList}>
        {items.map((item, i) => {
          const media = resolveMediaSize(item.image, 'card')
          return (
            <div className={`${styles.amRow} reveal`} key={item.id ?? i}>
              <div className={styles.amMedia}>{media.url && <img src={media.url} alt={media.alt} loading="lazy" />}</div>
              <div>
                <span className={styles.amIndex}>{String(i + 1).padStart(2, '0')}</span>
                <div className={styles.amTitle}>{item.title}</div>
                <div className={styles.amBody}>{item.body}</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
