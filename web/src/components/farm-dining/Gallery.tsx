'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { FarmDining } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'
import styles from './farm-dining.module.css'

/** The bento tiles don't fill in on a tidy grid clock — they land with a
 *  loose, slightly-rotated stagger, the way photos or plates get set down
 *  on a long table one at a time rather than snapped into a template. */
export function Gallery({ data }: { data: FarmDining['gallery'] }) {
  const items = data.items ?? []
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll(`.${styles.sectionHead}`), {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
      })

      const tiles = section.querySelectorAll(`.${styles.bentoItem}`)
      gsap.from(tiles, {
        opacity: 0,
        y: 30,
        scale: 0.94,
        rotate: (i) => (i % 2 === 0 ? -1.4 : 1.4),
        duration: 0.8,
        ease: 'power3.out',
        stagger: { each: 0.08, from: 'start' },
        scrollTrigger: { trigger: tiles[0] ?? section, start: 'top 90%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section id="gallery" ref={sectionRef}>
      <div className={`${styles.sectionHead}`}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className={`section-title ${styles.sectionTitle}`}>{renderHeading(data.heading)}</h2>
      </div>

      <div className={styles.bentoGrid}>
        {items.map((item, i) => {
          const image = resolveMedia(item.image)
          const variant = item.sizeVariant ?? 'default'
          const variantClass = [variant === 'wide' || variant === 'wideTall' ? styles.wide : '', variant === 'tall' || variant === 'wideTall' ? styles.tall : '']
            .filter(Boolean)
            .join(' ')
          return (
            <div className={`${styles.bentoItem} ${variantClass}`} key={item.id ?? i}>
              {image.url && <Image src={image.url} alt={item.caption ?? ''} fill sizes="(max-width: 768px) 50vw, 25vw" style={{ objectFit: 'cover' }} />}
              {item.caption && <div className={styles.bentoCap}>{item.caption}</div>}
            </div>
          )
        })}
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "a table, in <em>pieces.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
