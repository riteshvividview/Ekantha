import type { About } from '@/payload-types'
import styles from './about.module.css'

export function Philosophy({ data }: { data: About['philosophy'] }) {
  const slabs = data ?? []

  return (
    <section style={{ padding: 0 }} id="philosophy">
      {slabs.map((slab, i) => (
        <div className={`${styles.philoSlab} ${i % 2 === 0 ? 'bg-white' : 'bg-silver'}`} key={slab.id ?? i}>
          <div className="reveal">
            <div className={styles.philoNum}>{slab.number}</div>
            <div className={styles.philoWord}>{slab.word}</div>
          </div>
          <p className={`${styles.philoBody} reveal`} dangerouslySetInnerHTML={{ __html: slab.body }} />
        </div>
      ))}
    </section>
  )
}
