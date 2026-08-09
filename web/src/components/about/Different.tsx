import type { About } from '@/payload-types'
import styles from './about.module.css'

export function Different({ data }: { data: About['different'] }) {
  const rows = data.rows ?? []

  return (
    <section id="different">
      <span className="eyebrow reveal">{data.eyebrow}</span>
      <h2 className="section-title reveal" style={{ margin: '1rem 0 clamp(2rem, 5vw, 3.5rem)' }}>
        {renderHeading(data.heading)}
      </h2>

      <div className={styles.contrastList}>
        {rows.map((row, i) => (
          <div className={`${styles.contrastRow} reveal`} key={row.id ?? i}>
            <div className={styles.contrastNot}>{row.notText}</div>
            <div className={styles.contrastArrow}>→</div>
            <div className={styles.contrastYes}>{row.yesText}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/** "not a resort.\nnot quite a retreat, either." → line break on `\n`, last
 *  word of the last line italicized. */
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
