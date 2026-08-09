import type { Home } from '@/payload-types'
import styles from './home.module.css'

export function Intro({ data }: { data: Home['intro'] }) {
  return (
    <section className={styles.intro} id="about">
      <div className={styles.introInner}>
        <div className={`${styles.introLeft} reveal`}>
          <span className="eyebrow">{data.eyebrow}</span>
          <p className={styles.introPull}>{renderPullQuote(data.pullQuote)}</p>
        </div>

        <div className={styles.introBody}>
          <p className="reveal">{data.paragraphBeforeContrasts}</p>

          <ul className={`${styles.introContrasts} reveal`}>
            {(data.contrasts ?? []).map((c, i) => (
              <li key={c.id ?? i}>
                <span className={styles.accent}>—</span>
                {c.text}
              </li>
            ))}
          </ul>

          <p className="reveal">{data.paragraphAfterContrasts}</p>

          <p className={`${styles.introClose} reveal`}>{data.closingNote}</p>
        </div>
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "It is a <em>return.</em>" */
function renderPullQuote(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const words = line.trim().split(' ')
    const last = words.pop()
    return (
      <span key={i}>
        {words.join(' ')} <em>{last}</em>
        {i < lines.length - 1 && <br />}
      </span>
    )
  })
}
