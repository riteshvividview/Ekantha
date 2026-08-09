import type { FarmDining } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import styles from './farm-dining.module.css'

export function Reserve({ data }: { data: FarmDining['reserve'] }) {
  const image = resolveMedia(data.image)

  return (
    <section className={`bg-black ${styles.reserveCta}`} id="reserve">
      <div className={styles.reserveGrid}>
        <div className={styles.reserveFormWrap}>
          <span className="eyebrow reveal">{data.eyebrow}</span>
          <h2 className="section-title reveal" style={{ color: 'var(--white)', marginTop: '1rem' }}>
            {renderHeading(data.heading)}
          </h2>

          <form
            className={`${styles.reserveForm} reveal`}
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <div className={styles.reserveField}>
              <span className="label">{data.dateLabel}</span>
              <input type="text" placeholder={data.datePlaceholder ?? undefined} />
            </div>
            <div className={styles.reserveField}>
              <span className="label">{data.partySizeLabel}</span>
              <input type="text" placeholder={data.partySizePlaceholder ?? undefined} />
            </div>
            <div className={styles.reserveField}>
              <span className="label">{data.dietaryLabel}</span>
              <input type="text" placeholder={data.dietaryPlaceholder ?? undefined} />
            </div>
            <button type="submit" className="btn btn-on-dark" style={{ width: 'fit-content' }}>
              {data.submitLabel}
            </button>
          </form>

          {data.note && <p className={`${styles.reserveNote} reveal`}>{data.note}</p>}
        </div>

        <div className={`${styles.reserveVisual} reveal`}>{image.url && <img src={image.url} alt={image.alt} loading="lazy" />}</div>
      </div>
    </section>
  )
}

/** "tell us how many,\nwe'll set the table." → italicizes "how many" and
 *  breaks on `\n`, matching "tell us <em>how many</em>,<br>we'll set the table." */
function renderHeading(heading: string) {
  const lines = heading.split('\n')
  return lines.map((line, i, arr) => (
    <span key={i}>
      {i === 0 ? renderFirstLine(line) : line}
      {i < arr.length - 1 && <br />}
    </span>
  ))
}

function renderFirstLine(line: string) {
  const commaIndex = line.indexOf(',')
  if (commaIndex === -1) return line
  const before = line.slice(0, commaIndex)
  const after = line.slice(commaIndex)
  const words = before.trim().split(' ')
  const last2 = words.splice(-2, 2)
  return (
    <>
      {words.join(' ')} <em>{last2.join(' ')}</em>
      {after}
    </>
  )
}
