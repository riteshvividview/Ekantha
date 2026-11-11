'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/realMedia'
import { gsap } from '@/lib/animations/gsap'
import styles from './full.module.css'

/** Full House's alternating image/text rows — matches FullHouse.html's
 *  `.am-*` design. Reuses the same `amenitiesSection.items` field Mango
 *  House's snap-scroll cards and Stone House's mosaic grid use. On desktop
 *  the rows are sticky cards that stack as you scroll: each new card slides
 *  up over the last, which recedes behind it, like place settings being
 *  laid down a long table. Phones get a plain list with a soft entrance. */
export function Amenities({ data }: { data: Stay['amenitiesSection'] }) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const mm = gsap.matchMedia(section)
    const rows = gsap.utils.toArray<HTMLElement>(`.${styles.amRow}`, section)
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      rows.forEach((row, i) => {
        gsap.from(row.children, {
          opacity: 0,
          y: 30,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.12,
          delay: i === 0 ? 0 : 0.1,
          scrollTrigger: { trigger: row, start: 'top 85%', once: true },
        })
      })
    })
    // Desktop: rows are sticky cards (CSS); as the next card slides up over
    // one, it recedes, so the list stacks like place settings being laid.
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      rows.slice(0, -1).forEach((row, i) => {
        gsap.to(row, {
          scale: 0.94,
          ease: 'none',
          scrollTrigger: { trigger: rows[i + 1], start: 'top bottom', end: 'top 20%', scrub: true },
        })
      })
    })
    const ctx = { revert: () => mm.revert() }
    return () => ctx.revert()
  }, [])

  const items = data?.items ?? []
  if (!items.length) return null

  return (
    <section id="amenities" ref={sectionRef}>
      <div className="section-head reveal">
        <h2 className={`section-title ${styles.sectionTitle}`}>Amenities &amp; <em>inclusions.</em></h2>
        <p>Everything below comes with a full-house booking. Nothing here needs to be requested twice.</p>
      </div>

      <div className={styles.amList}>
        {items.map((item, i) => {
          const media = resolveMedia(item.image)
          return (
            <div className={styles.amRow} key={item.id ?? i}>
              <div className={styles.amMedia}>{media.url && <Image src={media.url} alt={media.alt} fill sizes="(max-width: 700px) 100vw, 50vw" quality={90} style={{ objectFit: 'cover' }} />}</div>
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
