import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import styles from './stone.module.css'

/**
 * Stone House's own gallery mood: a staggered stone-coursing grid (each
 * plate sits a little higher or lower than its neighbour, like coursed
 * masonry) where every photo rests desaturated — quarried stone-grey —
 * until it's looked at, and only then settles into full colour. Quiet by
 * default, warm on attention, with a small roman numeral (the kind you'd
 * find pencilled in a margin) marking each plate instead of a loud index.
 */
export function Gallery({ items, title }: { items: Stay['gallery']; title: string }) {
  const gallery = items ?? []
  if (!gallery.length) return null

  return (
    <section className="bg-silver" id="gallery">
      <div className="section-head reveal">
        <h2 className={`section-title ${styles.sectionTitle}`}>a glimpse <em>inside.</em></h2>
        <p>{title}, in {gallery.length} small moments.</p>
      </div>

      <div className={styles.brickGrid}>
        {gallery.map((item, i) => {
          const image = resolveMedia(item.image)
          return (
            <div className={`${styles.brickItem} reveal`} key={item.id ?? i}>
              <div className={styles.brickPlate}>
                {image.url && <img src={image.url} alt={item.caption} loading="lazy" />}
                <span className={styles.brickNumeral} aria-hidden="true" />
              </div>
              <p className={styles.brickCaption}>{item.caption}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
