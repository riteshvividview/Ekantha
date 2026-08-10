import type { Stay } from '@/payload-types'
import { resolveMediaSize } from '@/lib/media'
import styles from './stone.module.css'

/** Stone House's edge-to-edge photo mosaic, text revealing on hover —
 *  matches StoneHouse.html's `.sh-am-*` design. Reuses the same
 *  `amenitiesSection.items` field Mango House's snap-scroll cards use. */
export function Amenities({ data }: { data: Stay['amenitiesSection'] }) {
  const items = data?.items ?? []
  if (!items.length) return null

  return (
    <section id="amenities">
      <div className="section-head reveal">
        <h2 className="section-title">amenities &amp; <em>inclusions.</em></h2>
        <p>Everything below comes with the house. Nothing here needs to be requested twice.</p>
      </div>

      <div className={styles.amMosaic}>
        {items.map((item, i) => {
          const media = resolveMediaSize(item.image, 'card')
          return (
            <div className={`${styles.amCell} reveal`} key={item.id ?? i}>
              {media.url && <img src={media.url} alt={media.alt} loading="lazy" />}
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
