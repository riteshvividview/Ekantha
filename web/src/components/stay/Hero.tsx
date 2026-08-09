import type { StayPage } from '@/payload-types'
import styles from './stay.module.css'

export function Hero({ data }: { data: StayPage['hero'] }) {
  return (
    <section className={styles.hero} id="top">
      <div className={`${styles.heroBadge} reveal`}>
        <span className={styles.dot}>{data.badgeMonogram}</span>
        {data.badgeLabel}
      </div>

      <h1 className={`display-xl ${styles.heroHeadline} reveal`}>{renderHeadline(data.headline)}</h1>

      <p className={`${styles.heroSub} reveal`}>{data.sub}</p>

      <div className={`${styles.heroRating} reveal`}>
        <span className={styles.stars} aria-hidden="true">
          ★★★★★
        </span>
        <span className={styles.ratingText}>{data.ratingText}</span>
      </div>

      <div className={`${styles.heroCtas} reveal`}>
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
    </section>
  )
}

/** "Choose Your Stay\nAt Vana Ekantha" → line break on `\n`, italicizes
 *  "Stay" only, matching "Choose Your <em>Stay</em><br>At Vana Ekantha" */
function renderHeadline(headline: string) {
  const lines = headline.split('\n')
  return lines.map((line, i, arr) => (
    <span key={i}>
      {i === 0 ? renderFirstLine(line) : line}
      {i < arr.length - 1 && <br />}
    </span>
  ))
}

function renderFirstLine(line: string) {
  const words = line.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
