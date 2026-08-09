import type { About } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import styles from './about.module.css'

export function Overview({ data }: { data: About['overview'] }) {
  const facts = data.facts ?? []
  const image = resolveMedia(data.image)

  return (
    <section className={styles.overview} id="overview">
      <div className={styles.overviewGrid}>
        <div>
          <span className="eyebrow reveal">{data.eyebrow}</span>
          <h2 className="section-title reveal" style={{ color: 'var(--white)', marginTop: '1rem' }}>
            {renderHeading(data.heading)}
          </h2>

          <div className={styles.overviewFacts}>
            {facts.map((fact, i) => (
              <div className={`${styles.overviewFact} reveal`} key={fact.id ?? i}>
                <div className={styles.num}>{fact.number}</div>
                <div className={styles.label}>{fact.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.overviewVisual} reveal`}>{image.url && <img src={image.url} alt={image.alt} loading="lazy" />}</div>
      </div>
    </section>
  )
}

/** "eleven acres,\nin plain numbers." → line break on `\n`, last word of
 *  the last line italicized. */
function renderHeading(heading: string) {
  const lines = heading.split('\n')
  return lines.map((line, i, arr) => (
    <span key={i}>
      {i < arr.length - 1 ? line : renderLastLine(line)}
      {i < arr.length - 1 && <br />}
    </span>
  ))
}

function renderLastLine(line: string) {
  const words = line.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
