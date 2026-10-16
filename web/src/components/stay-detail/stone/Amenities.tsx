import type { Stay } from '@/payload-types'
import { resolveMediaSize } from '@/lib/media'
import styles from './stone.module.css'

/**
 * Stone House's edge-to-edge photo mosaic. Each cell sits in quarried
 * stone-grey by default — desaturated, a little dim — and warms into
 * full colour with a faint ember tint on hover, like a fireplace
 * catching in a cold room; the text rises quietly underneath rather
 * than the cell darkening toward it. A small roman numeral, pencilled
 * into the corner, stands in for a louder index.
 */
export function Amenities({ data }: { data: Stay['amenitiesSection'] }) {
  const items = data?.items ?? []
  if (!items.length) return null

  return (
    <section id="amenities">
      <div className="section-head reveal">
        <h2 className={`section-title ${styles.sectionTitle}`}>amenities &amp; <em>inclusions.</em></h2>
        <p>Everything below comes with the house. Nothing here needs to be requested twice.</p>
      </div>

      <div className={styles.amMosaic}>
        {items.map((item, i) => {
          const media = resolveMediaSize(item.image, 'card')
          return (
            <div className={`${styles.amCell} reveal`} key={item.id ?? i}>
              {media.url && <img src={media.url} alt={media.alt} loading="lazy" />}
              <span className={styles.amCellNumeral} aria-hidden="true" />
              <div className={styles.amCellEmber} aria-hidden="true" />
              <div className={styles.amCellScrim} aria-hidden="true" />
              <div className={styles.amCellContent}>
                <div className={styles.amCellTitle}>{item.title}</div>
                <div className={styles.amCellBody}>{item.body}</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
