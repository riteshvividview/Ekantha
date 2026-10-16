'use client'

import { useEffect, useRef } from 'react'
import type { Stay } from '@/payload-types'
import { resolveMediaSize } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'
import styles from './full.module.css'

/** Full House's alternating image/text rows — matches FullHouse.html's
 *  `.am-*` design. Reuses the same `amenitiesSection.items` field Mango
 *  House's snap-scroll cards and Stone House's mosaic grid use. Each row
 *  arrives from the side its own photo sits on — left-photo rows slide in
 *  from the left, right-photo rows from the right — so the list reads like
 *  places being laid at a long table from both ends at once, rather than a
 *  single uniform queue. */
export function Amenities({ data }: { data: Stay['amenitiesSection'] }) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      const rows = section.querySelectorAll(`.${styles.amRow}`)
      rows.forEach((row, i) => {
        gsap.from(row, {
          opacity: 0,
          x: i % 2 === 0 ? -36 : 36,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 85%', once: true },
        })
      })
    }, section)

    return () => ctx.revert()
  }, [])

  const items = data?.items ?? []
  if (!items.length) return null

  return (
    <section id="amenities" ref={sectionRef}>
      <div className="section-head reveal">
        <h2 className={`section-title ${styles.sectionTitle}`}>amenities &amp; <em>inclusions.</em></h2>
        <p>Everything below comes with a full-house booking. Nothing here needs to be requested twice.</p>
      </div>

      <div className={styles.amList}>
        {items.map((item, i) => {
          const media = resolveMediaSize(item.image, 'card')
          return (
            <div className={styles.amRow} key={item.id ?? i}>
              <div className={styles.amMedia}>{media.url && <img src={media.url} alt={media.alt} loading="lazy" />}</div>
              <div>
                <span className={styles.amIndex}>{String(i + 1).padStart(2, '0')}</span>
                <div className={styles.amTitle}>{item.title}</div>
                <div className={styles.amBody}>{item.body}</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
