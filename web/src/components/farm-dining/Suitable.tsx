'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { FarmDining } from '@/payload-types'
import { resolveMedia } from '@/lib/realMedia'
import { SuitableIconSvg } from './icons'
import { gsap } from '@/lib/animations/gsap'
import styles from './farm-dining.module.css'

/** Cards rise in together like guests taking their seats, and the
 *  featured (dark) card gets a slow, looping ember-glow breathing behind
 *  its photo — a small ambient life to the one card that's lit at night,
 *  distinct from the quieter daylight cards around it. */
export function Suitable({ data }: { data: FarmDining['suitable'] }) {
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
      gsap.from(section.querySelectorAll(`.${styles.suitCard}`), {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: section, start: 'top 82%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className="bg-silver" id="suitable" ref={sectionRef}>
      <div className={`${styles.sectionHead}`}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className={`section-title ${styles.sectionTitle}`}>{renderHeading(data.heading)}</h2>
      </div>

      <div className={styles.suitGrid}>
        {items.map((item, i) => {
          const image = resolveMedia(item.image)
          return (
            <div className={`${styles.suitCard}${item.featured ? ` ${styles.featured}` : ''}`} key={item.id ?? i}>
              {item.featured && image.url && <Image className={styles.suitMedia} src={image.url} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" quality={90} style={{ objectFit: 'cover' }} />}
              <div className={styles.suitIcon} aria-hidden="true">
                <SuitableIconSvg icon={item.icon} />
              </div>
              <div className={styles.suitTitle}>{item.title}</div>
              <div className={styles.suitBody}>{item.body}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "who comes to the <em>table.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
