import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import styles from './stay-detail.module.css'

export function IdealFor({ items, title }: { items: Stay['idealFor']; title: string }) {
  const idealFor = items ?? []
  if (!idealFor.length) return null

  return (
    <section id="ideal-for">
      <div className="section-head reveal">
        <h2 className="section-title">ideal {italic('for.')}</h2>
        <p>{title} suits a particular kind of guest — here&apos;s how to tell if that&apos;s you.</p>
      </div>

      <div className={styles.idealList}>
        {idealFor.map((item, i) => {
          const image = resolveMedia(item.image)
          return (
            <div className={`${styles.idealRow} reveal`} key={item.id ?? i}>
              <span className={styles.idealNum} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className={styles.idealPhoto}>{image.url && <img src={image.url} alt={image.alt} loading="lazy" />}</div>
              <div className={styles.idealContent}>
                <div className={styles.idealTitle}>{item.title}</div>
                <div className={styles.idealBody}>{item.body}</div>
              </div>
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
