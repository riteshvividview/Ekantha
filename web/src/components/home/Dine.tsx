import type { Home } from '@/payload-types'
import { resolveMediaSize } from '@/lib/media'
import styles from './home.module.css'

export function Dine({ data }: { data: Home['dine'] }) {
  const media = resolveMediaSize(data.image, 'card')

  return (
    <section id="dine">
      <div className={styles.dine}>
        <div className={`${styles.dineText} reveal`}>
          <span className="eyebrow">{data.eyebrow}</span>
          <h2 className="section-title">{renderTitle(data.heading)}</h2>
          <p>{data.body}</p>
          {data.ctaHref && (
            <a href={data.ctaHref} className="btn btn-primary">
              {data.ctaLabel}
            </a>
          )}
        </div>
        <div className={`${styles.dineVisual} reveal`}>
          {media.url && <img src={media.url} alt={media.alt} loading="lazy" />}
        </div>
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
