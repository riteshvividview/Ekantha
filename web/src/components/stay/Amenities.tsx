import type { StayPage } from '@/payload-types'
import { DragScrollTrack } from '@/components/shared/DragScrollTrack'
import { resolveMediaSize } from '@/lib/media'
import styles from './stay.module.css'

export function Amenities({ data }: { data: StayPage['amenities'] }) {
  const items = data.items ?? []

  return (
    <section className="bg-silver" id="amenities">
      <div className="section-head reveal">
        <h2 className="section-title">{renderHeading(data.heading)}</h2>
        {data.sub && <p>{data.sub}</p>}
      </div>

      <DragScrollTrack>
        {items.map((item, i) => {
          const media = resolveMediaSize(item.image, 'card')
          return (
            <div className={styles.hCard} key={item.id ?? i}>
              <div className={styles.hCardMedia}>{media.url && <img src={media.url} alt={media.alt} loading="lazy" />}</div>
              <div className={styles.hCardContent}>
                <div className={styles.hCardTitle}>{item.title}</div>
                <p className={styles.hCardDesc}>{item.description}</p>
              </div>
            </div>
          )
        })}
      </DragScrollTrack>
    </section>
  )
}

/** Italicizes the last word, matching "included <em>amenities.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
