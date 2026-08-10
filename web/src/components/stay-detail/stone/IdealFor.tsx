import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import styles from './stone.module.css'

/** Stone House's alternating image/text rows, generously spaced — matches
 *  StoneHouse.html's `.sh-index-*` design. Reuses the same `idealFor`
 *  field Mango House's circular-photo-watermark rows use. */
export function IdealFor({ items, title }: { items: Stay['idealFor']; title: string }) {
  const idealFor = items ?? []
  if (!idealFor.length) return null

  return (
    <section id="ideal-for">
      <div className="section-head reveal">
        <h2 className="section-title">ideal <em>for.</em></h2>
        <p>{title} suits a particular kind of guest — here&apos;s how to tell if that&apos;s you.</p>
      </div>

      <div className={styles.indexGrid}>
        {idealFor.map((item, i) => {
          const image = resolveMedia(item.image)
          return (
            <div className={`${styles.indexCard} reveal`} key={item.id ?? i}>
              <div className={styles.indexPhoto}>{image.url && <img src={image.url} alt={image.alt} loading="lazy" />}</div>
              <div className={styles.indexContent}>
                <div className={styles.indexTitle}>{item.title}</div>
                <div className={styles.indexBody}>{item.body}</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
