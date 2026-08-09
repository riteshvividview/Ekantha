import type { About } from '@/payload-types'
import styles from './about.module.css'

export function Founder({ data }: { data: About['founder'] }) {
  const paragraphs = data.paragraphs ?? []

  return (
    <section className={styles.founder} id="why-we-began">
      <div className={styles.founderInner}>
        <span className="eyebrow reveal">{data.eyebrow}</span>

        <blockquote className={`${styles.founderQuote} reveal`}>{data.quote}</blockquote>

        <div className={styles.founderBody}>
          {paragraphs.map((p, i) => (
            <p className="reveal" key={p.id ?? i}>
              {p.text}
            </p>
          ))}
        </div>

        <div className={`${styles.founderSig} reveal`}>
          {data.signatureName}
          {data.signatureLocation && <span>{data.signatureLocation}</span>}
        </div>
      </div>
    </section>
  )
}
