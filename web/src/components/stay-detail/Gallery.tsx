import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import styles from './stay-detail.module.css'

export function Gallery({ items, title }: { items: Stay['gallery']; title: string }) {
  const gallery = items ?? []
  if (!gallery.length) return null

  return (
    <section className="bg-silver" id="gallery">
      <div className="section-head reveal">
        <h2 className="section-title">a glimpse {italic('inside.')}</h2>
        <p>{title}, in {gallery.length} small moments.</p>
      </div>

      <div className={styles.galleryMasonry}>
        {gallery.map((item, i) => {
          const image = resolveMedia(item.image)
          return (
            <div className={`${styles.galleryItem} reveal`} style={{ aspectRatio: item.aspectRatio ?? '4/3' }} key={item.id ?? i}>
              {image.url && <img src={image.url} alt={item.caption} loading="lazy" />}
              <div className={styles.galleryScrim} aria-hidden="true" />
              <p className={styles.galleryCaption}>{item.caption}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function italic(text: string) {
  return <em>{text}</em>
}
