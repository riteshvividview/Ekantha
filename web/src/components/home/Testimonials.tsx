import type { Home } from '@/payload-types'
import { SectionHead } from '@/components/shared/SectionHead'
import styles from './home.module.css'

export function Testimonials({ data }: { data: Home['testimonials'] }) {
  return (
    <section id="testimonials">
      <SectionHead title={renderTitle(data.heading)} sub={data.sub} />

      <div className={styles.testiGrid}>
        {(data.items ?? []).map((item, i) => (
          <div className={`${styles.testiCard} reveal`} key={item.id ?? i}>
            <div className={styles.testiStars} aria-hidden="true">
              {'★'.repeat(item.rating ?? 5)}
            </div>
            <p className={styles.testiQuote}>&ldquo;{item.quote}&rdquo;</p>
            <div className={styles.testiName}>{item.name}</div>
          </div>
        ))}
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
