import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import styles from './stone.module.css'

/**
 * Stone House's own visual treatment for the highlights list — a large
 * featured photo card (the first item) beside a stacked list of smaller
 * image+text rows (the rest), matching StoneHouse.html's `.sh-hl-*` design.
 * Distinct from Mango House's sticky-photo + icon-row treatment, though
 * both draw from the same `highlightsSection.items` field.
 */
export function Highlights({ data }: { data: Stay['highlightsSection'] }) {
  const items = data?.items ?? []
  if (!items.length) return null
  const [hero, ...rows] = items
  const heroImage = resolveMedia(hero.image)

  return (
    <section className="bg-silver" id="highlights">
      <div className="section-head reveal">
        <h2 className="section-title">accommodation <em>highlights.</em></h2>
        <p>What the house actually holds — no surprises, no fine print.</p>
      </div>

      <div className={`${styles.hlLayout} reveal`}>
        <div className={styles.hlHero}>
          {heroImage.url && <img src={heroImage.url} alt={heroImage.alt} loading="lazy" />}
          <div className={styles.hlHeroScrim} aria-hidden="true" />
          <div className={styles.hlHeroContent}>
            <span className={styles.hlHeroBadge}>{hero.badgeLabel}</span>
            <div className={styles.hlHeroTitle}>{hero.title}</div>
            <div className={styles.hlHeroBody}>{hero.body}</div>
          </div>
        </div>

        <div className={styles.hlList}>
          {rows.map((row, i) => {
            const image = resolveMedia(row.image)
            return (
              <div className={styles.hlRow} key={row.id ?? i}>
                <div className={styles.hlRowMedia}>{image.url && <img src={image.url} alt={image.alt} loading="lazy" />}</div>
                <div>
                  <span className={styles.hlRowBadge}>{row.badgeLabel}</span>
                  <div className={styles.hlRowTitle}>{row.title}</div>
                  <div className={styles.hlRowBody}>{row.body}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
