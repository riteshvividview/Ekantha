import type { About } from '@/payload-types'
import styles from './about.module.css'

export function Manifesto({ data }: { data: About['manifesto'] }) {
  return (
    <section className={styles.manifesto} id="top">
      <span className={`eyebrow ${styles.manifestoEyebrow} reveal`}>{data.eyebrow}</span>

      <h1 className={`${styles.manifestoStatement} reveal`}>{renderStatement(data.headline)}</h1>

      <p className={`${styles.manifestoSub} reveal`}>{data.sub}</p>

      <div className={`${styles.manifestoCtas} reveal`}>
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

/** "You are not entertained.\nYou are undisturbed." → each `\n` becomes a
 *  line break, and the last word of the last line is italicized — matching
 *  "You are not entertained.<br>You are <em>undisturbed.</em>" */
function renderStatement(headline: string) {
  const lines = headline.split('\n')
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
