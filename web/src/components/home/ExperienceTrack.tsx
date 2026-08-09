import type { Home } from '@/payload-types'
import { SectionHead } from '@/components/shared/SectionHead'
import { DragScrollTrack } from '@/components/shared/DragScrollTrack'
import { resolveMediaSize } from '@/lib/media'
import styles from './home.module.css'

export function ExperienceTrack({ data }: { data: Home['experience'] }) {
  return (
    <section id="estate">
      <SectionHead title={renderTitle(data.heading)} sub={data.sub} />

      <DragScrollTrack>
        {(data.items ?? []).map((item, i) => {
          const media = resolveMediaSize(item.image, 'card')
          return (
            <div className={styles.hCard} key={item.id ?? i}>
              <div className={styles.hCardMedia}>
                {media.url && <img src={media.url} alt={media.alt} loading="lazy" />}
              </div>
              <div className={styles.hCardBody}>
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

function renderTitle(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
