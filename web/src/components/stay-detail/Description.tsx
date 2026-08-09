import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import styles from './stay-detail.module.css'

export function Description({ data }: { data: Stay['description'] }) {
  const accentImage = resolveMedia(data.accentImage)
  const paragraphs = data.paragraphs ?? []

  return (
    <section className={styles.intro} id="description">
      <div className={styles.introInner}>
        <div className={`${styles.introLeft} reveal`}>
          <span className="eyebrow">{data.eyebrow}</span>
          {data.pullHeadline && <p className={styles.introPull}>{renderPull(data.pullHeadline)}</p>}
          {accentImage.url && (
            <div className={styles.introAccentImg}>
              <img src={accentImage.url} alt={accentImage.alt} loading="lazy" />
            </div>
          )}
        </div>

        <div className={styles.introBody}>
          <p className="reveal">{data.intro}</p>

          <blockquote className={`${styles.introQuote} reveal`}>&ldquo;{data.pullQuote}&rdquo;</blockquote>

          {paragraphs.map((p, i) => (
            <p className="reveal" key={p.id ?? i}>
              {p.text}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

/** "Breakfast, some mornings,\nis just what fell." → line break on `\n`,
 *  last word of the last line italicized. */
function renderPull(headline: string) {
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
