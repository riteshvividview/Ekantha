'use client'

import { useEffect, useRef } from 'react'
import type { Event } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'
import styles from './events.module.css'

/**
 * The scattered photo-stack collage enters like snapshots being set down
 * one at a time — scale and lift in with a short stagger, leaving the CSS
 * per-item rotation untouched so each plate still lands at its own skewed
 * angle rather than snapping in dead straight.
 */
export function Gallery({ data }: { data: Event['gallery'] }) {
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

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap.from(section.querySelectorAll(`.${styles.collageItem}`), {
        opacity: 0,
        y: 32,
        scale: 0.85,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: `.${styles.collage}`, start: 'top 85%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section id="gallery" ref={sectionRef}>
      <div className={styles.sectionHead}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className={`section-title ${styles.sectionTitle}`}>{renderHeading(data.heading)}</h2>
      </div>

      <div className={styles.collage}>
        {items.map((item, i) => {
          const image = resolveMedia(item.image)
          return (
            <div className={styles.collageItem} key={item.id ?? i}>
              <div className={styles.collagePlate}>{image.url && <img src={image.url} alt={item.caption ?? ''} loading="lazy" />}</div>
              {item.caption && <p className={styles.collageCaption}>{item.caption}</p>}
            </div>
          )
        })}
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "a few <em>evenings.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
