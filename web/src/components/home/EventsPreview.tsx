import type { Home } from '@/payload-types'
import { SectionHead } from '@/components/shared/SectionHead'
import { resolveMediaSize } from '@/lib/media'
import styles from './home.module.css'

const BADGE_CLASSES = [styles.badgeGreen, styles.badgeAmber, styles.badgePurple, styles.badgeBlue]

export function EventsPreview({ data }: { data: Home['eventsPreview'] }) {
  return (
    <section className="bg-silver" id="events">
      <SectionHead title={renderTitle(data.heading)} sub={data.sub} />

      <div className={styles.eventGrid}>
        {(data.items ?? []).map((item, i) => {
          const media = resolveMediaSize(item.image, 'card')
          return (
            <div className={`${styles.eventCard} reveal`} key={item.id ?? i}>
              <div className={styles.eventMedia}>
                {media.url && <img src={media.url} alt={media.alt} loading="lazy" />}
                <span className={`${styles.cellBadge} ${BADGE_CLASSES[i % 4]}`}>{item.badgeLabel}</span>
              </div>
              <div className={styles.eventBody}>
                <div className={styles.eventTitle}>{item.title}</div>
                <div className={styles.eventDesc}>{item.description}</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function renderTitle(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
