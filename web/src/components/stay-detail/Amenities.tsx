import type { Stay } from '@/payload-types'
import { resolveMediaSize } from '@/lib/media'
import styles from './stay-detail.module.css'

export function Amenities({ data }: { data: Stay['amenitiesSection'] }) {
  const items = data?.items ?? []
  if (!items.length) return null

  return (
    <section id="amenities">
      <div className="section-head reveal">
        <h2 className="section-title">amenities &amp; {italic('inclusions.')}</h2>
        <p>Everything below comes with the room. Nothing here needs to be requested twice.</p>
      </div>

      {data?.hint && <p className={`${styles.amHint} reveal`}>{data.hint}</p>}
      <div className={styles.amScroll}>
        {items.map((item, i) => {
          const media = resolveMediaSize(item.image, 'card')
          return (
            <div className={`${styles.amCard} reveal`} key={item.id ?? i}>
              <div className={styles.amMedia}>{media.url && <img src={media.url} alt={media.alt} loading="lazy" />}</div>
              <div className={styles.amContent}>
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

function italic(text: string) {
  return <em>{text}</em>
}
