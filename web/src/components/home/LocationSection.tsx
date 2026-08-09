import type { Home } from '@/payload-types'
import { resolveMediaSize } from '@/lib/media'
import styles from './home.module.css'

export function LocationSection({ data }: { data: Home['location'] }) {
  const media = resolveMediaSize(data.mapImage, 'card')

  return (
    <section id="location">
      <div className={styles.locationGrid}>
        <div className="reveal">
          <span className="eyebrow">{data.eyebrow}</span>
          <h2 className="section-title" style={{ marginTop: '1rem' }}>
            {renderTitle(data.heading)}
          </h2>

          <ul className={styles.locationList}>
            {(data.facts ?? []).map((fact, i) => (
              <li key={fact.id ?? i}>
                <span className={styles.k}>{fact.label}</span>
                <span className={styles.v}>{fact.value}</span>
              </li>
            ))}
          </ul>

          {data.ctaHref && (
            <a href={data.ctaHref} className="btn btn-primary">
              {data.ctaLabel}
            </a>
          )}
        </div>

        <div className={`${styles.locationMap} reveal`}>
          {media.url && <img src={media.url} alt={media.alt} loading="lazy" />}
          <div className={styles.locationPin} />
        </div>
      </div>
    </section>
  )
}

function renderTitle(heading: string) {
  return heading.split('\n').map((line, i, arr) => (
    <span key={i}>
      {i === arr.length - 1 ? renderLastLine(line) : line}
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
