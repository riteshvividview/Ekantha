import type { Event } from '@/payload-types'
import styles from './events.module.css'

export function Hero({ data }: { data: Event['hero'] }) {
  const marqueeItems = data.marqueeItems ?? []
  // Doubled so the 26s CSS marquee (translateX(-50%)) loops seamlessly.
  const looped = [...marqueeItems, ...marqueeItems]

  return (
    <section className={styles.evHero} id="top">
      <div className={styles.evHeroInner}>
        <div className={`${styles.evHeroBadge} reveal`}>
          <span className="dot">{data.badgeMonogram}</span>
          {data.badgeLabel}
        </div>

        <h1 className={`display-xl ${styles.evHeroHeadline} reveal`}>{renderHeadline(data.headline)}</h1>

        <p className={`${styles.evHeroSub} reveal`}>{data.sub}</p>

        <div className={`${styles.evHeroCtas} reveal`}>
          {data.primaryCtaHref && (
            <a href={data.primaryCtaHref} className={`btn ${styles.btnWhite}`}>
              {data.primaryCtaLabel}
            </a>
          )}
          {data.secondaryCtaHref && (
            <a href={data.secondaryCtaHref} className={`btn ${styles.btnOutline}`}>
              {data.secondaryCtaLabel}
            </a>
          )}
        </div>
      </div>

      <div className={`${styles.marquee} reveal`} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {looped.map((item, i) => (
            <span key={i}>{item.text}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "Host It <em>Here.</em>" */
function renderHeadline(headline: string) {
  const words = headline.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
