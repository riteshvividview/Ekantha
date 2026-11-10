'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { FarmDining } from '@/payload-types'
import { resolveMedia } from '@/lib/realMedia'
import { gsap } from '@/lib/animations/gsap'
import { Toast, MangoSprig, Conversation, Icon } from '../illustrations/Line'
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
        y: 20,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0,
        scrollTrigger: { trigger: section, start: 'top 82%', once: true },
      })
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.from(section.querySelectorAll(`.${styles.bentoItem}`), {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.06,
        scrollTrigger: { trigger: section, start: 'top 82%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section id="gallery" ref={sectionRef}>
      <div className={styles.splitHead}>
        <div className={`${styles.sectionHead}`}>
          <span className="eyebrow">{data.eyebrow}</span>
          <h2 className={`section-title ${styles.sectionTitle}`}>{renderHeading(data.heading)}</h2>
        </div>
        <MangoSprig className={styles.headIllo} />
      </div>

      <div className={styles.bentoGrid}>
        {items.map((item, i) => {
          const image = resolveMedia(item.image)
          const variant = item.sizeVariant ?? 'default'
          const variantClass = [variant === 'wide' || variant === 'wideTall' ? styles.wide : '', variant === 'tall' || variant === 'wideTall' ? styles.tall : '']
            .filter(Boolean)
            .join(' ')
          return (
            <div className={styles.bentoItem} data-variant={variantClass ? 'x' : undefined} key={item.id ?? i}>
              <div className={styles.bentoPhoto}>{image.url && <Image src={image.url} alt={item.caption ?? ''} fill sizes="(max-width: 560px) 92vw, (max-width: 900px) 46vw, 31vw" quality={90} style={{ objectFit: 'cover' }} />}</div>
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
