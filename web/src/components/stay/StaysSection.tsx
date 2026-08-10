import type { Stay, StayPage } from '@/payload-types'
import { resolveMediaSize } from '@/lib/media'
import { CountUp } from '@/components/shared/CountUp'
import styles from './stay.module.css'

const STAY_SLUG_HREF: Record<string, string> = {
  'mango-house': '/mango-house',
  'stone-house': '/stone-house',
  'full-house': '/full-house',
}

export function StaysSection({ data, stays }: { data: StayPage['staysSection']; stays: Stay[] }) {
  return (
    <section className={styles.staysSection} id="stays">
      <div className="section-head reveal">
        <h2 className="section-title">{renderHeading(data.heading)}</h2>
        {data.sub && <p>{data.sub}</p>}
      </div>

      {stays.map((stay, i) => {
        const image = resolveMediaSize(stay.heroImage, 'card')
        const lists = stay.overviewBlock?.lists ?? []
        return (
          <div className={styles.stayBlock} key={stay.id}>
            <div className={`${styles.stayBlockHeader} reveal`}>
              <div className={styles.stayBlockNum}>stay / no. {String(i + 1).padStart(2, '0')}</div>
              <div>
                <h3 className={styles.stayBlockTitle}>{renderTitle(stay.title)}</h3>
                <p className={styles.stayBlockTagline}>{stay.tagline}</p>
              </div>
            </div>

            <div className={styles.stayBlockBody}>
              <div>
                <blockquote className={`${styles.stayQuote} reveal`}>&ldquo;{stay.description.pullQuote}&rdquo;</blockquote>

                <div className={`${styles.staySpecs} reveal`}>
                  <span className={styles.key}>capacity</span>
                  <span className={styles.val}>{stay.capacity}</span>
                  <span className={styles.key}>bed</span>
                  <span className={styles.val}>{stay.overviewBlock?.bed}</span>
                  <span className={styles.key}>character</span>
                  <span className={styles.val}>{stay.overviewBlock?.character}</span>
                </div>

                <div className={`${styles.stayLists} reveal`}>
                  {lists.map((list, li) => (
                    <div key={list.id ?? li}>
                      <p className={styles.slistHead}>{list.heading}</p>
                      <ul className={styles.slist}>
                        {(list.items ?? []).map((item, ii) => (
                          <li key={item.id ?? ii}>{item.text}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {stay.overviewBlock?.note && <div className={`${styles.stayNote} reveal`}>{stay.overviewBlock.note}</div>}

                <div className={`${styles.stayCtaRow} reveal`}>
                  <div className={styles.stayPrice}>
                    <div className={styles.amount}>
                      from ₹<CountUp value={stay.priceFrom} format={(n) => n.toLocaleString('en-IN')} /> / night
                    </div>
                    {stay.priceNote && <div className={styles.incl}>{stay.priceNote}</div>}
                  </div>
                  <a href={STAY_SLUG_HREF[stay.slug] ?? '#'} className={`btn btn-primary ${styles.btnSmall}`}>
                    Hold {stay.title} →
                  </a>
                </div>
              </div>

              <div className={`${styles.stayPlate} reveal`}>{image.url && <img src={image.url} alt={image.alt} loading="lazy" />}</div>
            </div>
          </div>
        )
      })}
    </section>
  )
}

/** Italicizes the last word, matching "three ways to <em>stay.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}

/** Italicizes the last word, matching "Mango <em>House</em>" */
function renderTitle(title: string) {
  const words = title.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
