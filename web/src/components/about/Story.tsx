import type { About } from '@/payload-types'
import styles from './about.module.css'

export function Story({ data }: { data: About['story'] }) {
  const glosses = data?.wordGlosses ?? []
  const paragraphs = data?.paragraphs ?? []

  return (
    <section className={styles.story} id="name">
      <div className={styles.storyInner}>
        <div className={`${styles.storyLeft} reveal`}>
          <span className="eyebrow">the name</span>
          {glosses.map((g, i) => (
            <div className={styles.storyWord} style={i > 0 ? { marginTop: '1.5rem' } : undefined} key={g.id ?? g.word}>
              {g.word}
              <span>{g.translation}</span>
            </div>
          ))}
        </div>

        <div className={styles.storyBody}>
          {paragraphs.map((p, i) => (
            <p className="reveal" key={p.id ?? i} dangerouslySetInnerHTML={{ __html: p.text }} />
          ))}
        </div>
      </div>
    </section>
  )
}
