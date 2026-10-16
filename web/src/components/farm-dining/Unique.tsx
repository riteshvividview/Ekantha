'use client'

import { useEffect, useRef } from 'react'
import type { FarmDining } from '@/payload-types'
import { gsap } from '@/lib/animations/gsap'
import styles from './farm-dining.module.css'

/** Each numbered column rises and settles in turn, like plates being set
 *  down one by one along the long table — a slight uneven stagger rather
 *  than a tidy simultaneous grid-fill, so it reads handmade, not assembled. */
export function Unique({ data }: { data: FarmDining['unique'] }) {
  const items = data.items ?? []
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap.from(section.querySelectorAll(`.${styles.sectionHead}`), {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
      })

      const cols = section.querySelectorAll(`.${styles.uniqueItem}`)
      gsap.from(cols, {
        opacity: 0,
        y: 36,
        rotate: (i) => (i % 2 === 0 ? -1.2 : 1.2),
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.14,
        scrollTrigger: { trigger: cols[0] ?? section, start: 'top 85%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section id="unique" ref={sectionRef}>
      <div className={`${styles.sectionHead}`}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className={`section-title ${styles.sectionTitle}`}>{renderHeading(data.heading)}</h2>
        {data.sub && <p>{data.sub}</p>}
      </div>

      <div className={styles.uniqueRow}>
        {items.map((item, i) => (
          <div className={`${styles.uniqueItem}`} key={item.id ?? i}>
            <div className={styles.uniqueNum}>{item.number}</div>
            <div className={styles.uniqueTitle}>{item.title}</div>
            <div className={styles.uniqueBody}>{item.body}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "a dinner that isn't <em>replicated.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
