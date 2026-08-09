import type { FarmDining } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import styles from './farm-dining.module.css'

export function Hero({ data }: { data: FarmDining['hero'] }) {
  const image = resolveMedia(data.image)
  const facts = data.facts ?? []

  return (
    <section className={styles.fdHero} id="top">
      <div className={styles.fdHeroText}>
        <div className={`${styles.fdHeroBadge} reveal`}>
          <span className="dot">{data.badgeMonogram}</span>
          {data.badgeLabel}
        </div>

        <h1 className={`display-xl ${styles.fdHeroHeadline} reveal`}>{renderHeadline(data.headline)}</h1>

        <p className={`${styles.fdHeroSub} reveal`}>{data.sub}</p>

        <div className={`${styles.fdHeroFacts} reveal`}>
          {facts.map((fact, i) => (
            <span key={fact.id ?? i} dangerouslySetInnerHTML={{ __html: fact.text }} />
          ))}
        </div>

        <div className={`${styles.fdHeroCtas} reveal`}>
          {data.primaryCtaHref && (
            <a href={data.primaryCtaHref} className="btn btn-primary">
              {data.primaryCtaLabel}
            </a>
          )}
          {data.secondaryCtaHref && (
            <a href={data.secondaryCtaHref} className="btn btn-ghost">
              {data.secondaryCtaLabel}
            </a>
          )}
        </div>
      </div>

      <div className={`${styles.fdHeroVisual} reveal`}>{image.url && <img src={image.url} alt={image.alt} loading="lazy" />}</div>
    </section>
  )
}

/** Italicizes everything after the first comma, matching
 *  "Dinner, <em>Under Bamboo.</em>" */
function renderHeadline(headline: string) {
  const commaIndex = headline.indexOf(',')
  if (commaIndex === -1) return headline
  const before = headline.slice(0, commaIndex + 1)
  const after = headline.slice(commaIndex + 1).trim()
  return (
    <>
      {before} <em>{after}</em>
    </>
  )
}
