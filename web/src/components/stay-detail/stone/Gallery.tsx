import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import styles from './stone.module.css'

/** Stone House's staggered stone-coursing grid — matches
 *  StoneHouse.html's `.sh-brick-*` design. Reuses the same `gallery`
 *  field Mango House's masonry grid uses (aspectRatio is unused here). */
export function Gallery({ items, title }: { items: Stay['gallery']; title: string }) {
  const gallery = items ?? []
  if (!gallery.length) return null

  return (
    <section className="bg-silver" id="gallery">
      <div className="section-head reveal">
        <h2 className="section-title">a glimpse <em>inside.</em></h2>
        <p>{title}, in {gallery.length} small moments.</p>
      </div>

      <div className={styles.brickGrid}>
        {gallery.map((item, i) => {
          const image = resolveMedia(item.image)
          return (
            <div className={`${styles.brickItem} reveal`} key={item.id ?? i}>
              <div className={styles.brickPlate}>{image.url && <img src={image.url} alt={item.caption} loading="lazy" />}</div>
              <p className={styles.brickCaption}>{item.caption}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
