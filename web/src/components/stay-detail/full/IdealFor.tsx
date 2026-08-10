import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import styles from './full.module.css'

/** Full House's numbered card grid — matches FullHouse.html's `.ideal-*`
 *  design. Reuses the same `idealFor` field Mango House's circular-photo
 *  rows and Stone House's alternating rows use. */
export function IdealFor({ items }: { items: Stay['idealFor'] }) {
  const idealFor = items ?? []
  if (!idealFor.length) return null

  return (
    <section id="ideal-for">
      <div className="section-head reveal">
        <h2 className="section-title">ideal <em>for.</em></h2>
        <p>Full House suits gatherings that need room to breathe — here&apos;s how to tell if that&apos;s you.</p>
      </div>

      <div className={styles.idealGrid}>
        {idealFor.map((item, i) => {
          const image = resolveMedia(item.image)
          return (
            <div className={`${styles.idealCard} reveal`} key={item.id ?? i}>
              <div className={styles.idealMedia}>
                {image.url && <img src={image.url} alt={image.alt} loading="lazy" />}
                <span className={styles.idealNum} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className={styles.idealTitle}>{item.title}</div>
              <div className={styles.idealBody}>{item.body}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
