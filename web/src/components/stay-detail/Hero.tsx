import type { Stay } from '@/payload-types'
import { resolveMediaSize } from '@/lib/media'
import styles from './stay-detail.module.css'

export function Hero({ stay, badgeNumber }: { stay: Stay; badgeNumber: string }) {
  const bg = resolveMediaSize(stay.heroImage, 'hero')

  return (
    <section className={styles.hero} id="top">
      <div className={styles.heroBg} aria-hidden="true">
        {bg.url && <img src={bg.url} alt="" />}
        <div className={styles.heroBgWash} />
      </div>

      <div className={`${styles.heroBadge} reveal`}>
        <span className={styles.dot}>{badgeNumber}</span>
        {stay.heroBadgeLabel}
      </div>

      <h1 className={`display-xl ${styles.heroHeadline} reveal`}>{renderTitle(stay.title)}</h1>

      {stay.heroSub && <p className={`${styles.heroSub} reveal`}>{stay.heroSub}</p>}

      <div className={`${styles.heroFacts} reveal`}>
        <span>
          <span className={styles.amount}>₹{stay.priceFrom.toLocaleString('en-IN')}</span> / night
        </span>
        <span>·</span>
        <span>{stay.capacity}</span>
        <span>·</span>
        <span>{stay.minNights}</span>
      </div>

      <div className={`${styles.heroCtas} reveal`}>
        <a href="/hold-a-date" className="btn btn-primary">
          Hold {stay.title} →
        </a>
        <a href="/stay" className="btn btn-ghost">
          Compare Other Stays
        </a>
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "Mango <em>House</em>" */
function renderTitle(title: string) {
  const words = title.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
