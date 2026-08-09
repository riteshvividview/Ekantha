import type { FarmDining } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import styles from './farm-dining.module.css'

export function Experience({ data }: { data: FarmDining['experience'] }) {
  const items = data.items ?? []

  return (
    <section className="bg-silver" id="experience">
      <div className={`${styles.sectionHead} reveal`}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className="section-title">{renderHeading(data.heading)}</h2>
      </div>

      {items.map((item, i) => {
        const image = resolveMedia(item.image)
        return (
          <div className={`${styles.expRow}${i % 2 === 1 ? ` ${styles.reverse}` : ''} reveal`} key={item.id ?? i}>
            <div className={styles.expVisual}>{image.url && <img src={image.url} alt={image.alt} loading="lazy" />}</div>
            <div>
              <div className={styles.expTag}>
                {item.tagNumber} · {item.tagLabel}
              </div>
              <h3 className={styles.expTitle}>{renderTitle(item.title)}</h3>
              <p className={styles.expBody}>{item.body}</p>
            </div>
          </div>
        )
      })}
    </section>
  )
}

/** Italicizes the last word, matching "three things you'll <em>notice.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}

/** Italicizes the last word(s), matching "The <em>Farm Setting</em>" style
 *  row titles — everything after the first word is italic when the title
 *  is two words, matching the source markup per row. */
function renderTitle(title: string) {
  const words = title.trim().split(' ')
  if (words.length < 2) return <em>{title}</em>
  const first = words.shift()
  return (
    <>
      {first} <em>{words.join(' ')}</em>
    </>
  )
}
