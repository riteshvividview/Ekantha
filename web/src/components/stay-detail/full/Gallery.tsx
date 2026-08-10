import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import styles from './full.module.css'

/** Full House's hero photo + strip of smaller plates — matches
 *  FullHouse.html's `.gallery-hero` / `.gallery-strip` design. Reuses the
 *  same `gallery` field Mango House's masonry and Stone House's brick grid
 *  use; the first item becomes the hero, the rest fill the strip. */
export function Gallery({ items }: { items: Stay['gallery'] }) {
  const gallery = items ?? []
  if (!gallery.length) return null

  const [hero, ...strip] = gallery
  const heroImage = resolveMedia(hero.image)

  return (
    <section className="bg-silver" id="gallery">
      <div className="section-head reveal">
        <h2 className="section-title">a glimpse of <em>the estate.</em></h2>
        <p>Full House, in {gallery.length} small moments.</p>
      </div>

      <div className={`${styles.galleryHero} reveal`}>
        {heroImage.url && <img src={heroImage.url} alt={hero.caption} loading="lazy" />}
        <div className={styles.galleryHeroScrim} aria-hidden="true" />
        <span className={styles.galleryHeroCap}>{hero.caption}</span>
      </div>

      {strip.length > 0 && (
        <div className={styles.galleryStrip}>
          {strip.map((item, i) => {
            const image = resolveMedia(item.image)
            return (
              <div className={`${styles.galleryItem} reveal`} key={item.id ?? i}>
                <div className={styles.galleryPlate}>{image.url && <img src={image.url} alt={item.caption} loading="lazy" />}</div>
                <p className={styles.galleryCaption}>{item.caption}</p>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
