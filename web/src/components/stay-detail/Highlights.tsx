import type { Stay } from '@/payload-types'
import { resolveMediaSize } from '@/lib/media'
import { HighlightIconSvg, badgeColorClass } from './icons'
import styles from './stay-detail.module.css'

export function Highlights({ data }: { data: Stay['highlightsSection'] }) {
  const items = data?.items ?? []
  if (!items.length) return null
  const image = resolveMediaSize(data?.image, 'card')

  return (
    <section className="bg-silver" id="highlights">
      <div className="section-head reveal">
        <h2 className="section-title">accommodation {italic('highlights.')}</h2>
        <p>What the cottage actually holds — no surprises, no fine print.</p>
      </div>

      <div className={styles.hlSplit}>
        <div className={`${styles.hlMedia} reveal`}>{image.url && <img src={image.url} alt={image.alt} loading="lazy" />}</div>
        <div className={styles.hlList}>
          {items.map((item, i) => (
            <div className={`${styles.hlRow} reveal`} key={item.id ?? i}>
              <div className={styles.hlIcon} aria-hidden="true">
                <HighlightIconSvg icon={item.icon ?? 'bed'} />
              </div>
              <div>
                <span className={`${styles.hlBadge} ${badgeColorClass(item.badgeColor ?? 'green', styles)}`}>{item.badgeLabel}</span>
                <div className={styles.hlTitle}>{item.title}</div>
                <div className={styles.hlBody}>{item.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function italic(text: string) {
  return <em>{text}</em>
}
