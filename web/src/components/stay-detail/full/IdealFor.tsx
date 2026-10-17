'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'
import styles from './full.module.css'

/** Full House's numbered card grid — matches FullHouse.html's `.ideal-*`
 *  design. Reuses the same `idealFor` field Mango House's circular-photo
 *  rows and Stone House's alternating rows use. Cards scale up into place
 *  together rather than queuing one at a time, and each number badge pops
 *  in with a little overshoot right after — like place cards being set
 *  down and then stamped, fitting a page about groups arriving at once. */
export function IdealFor({ items }: { items: Stay['idealFor'] }) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      const cards = section.querySelectorAll(`.${styles.idealCard}`)
      gsap.from(cards, {
        opacity: 0,
        scale: 0.92,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: section, start: 'top 82%', once: true },
      })
      gsap.from(section.querySelectorAll(`.${styles.idealNum}`), {
        opacity: 0,
        scale: 0.5,
        duration: 0.6,
        ease: 'back.out(1.9)',
        stagger: 0.1,
        delay: 0.25,
        scrollTrigger: { trigger: cards[0] ?? section, start: 'top 82%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  const idealFor = items ?? []
  if (!idealFor.length) return null

  return (
    <section id="ideal-for" ref={sectionRef}>
      <div className="section-head reveal">
        <h2 className={`section-title ${styles.sectionTitle}`}>ideal <em>for.</em></h2>
        <p>Full House suits gatherings that need room to breathe — here&apos;s how to tell if that&apos;s you.</p>
      </div>

      <div className={styles.idealGrid}>
        {idealFor.map((item, i) => {
          const image = resolveMedia(item.image)
          return (
            <div className={styles.idealCard} key={item.id ?? i}>
              <div className={styles.idealMedia}>
                {image.url && <Image src={image.url} alt={image.alt} fill sizes="(max-width: 768px) 50vw, 25vw" style={{ objectFit: 'cover' }} />}
                <span className={styles.idealNum} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className={styles.idealTitle}>{item.title}</div>
              <div className={styles.idealBody}>{item.body}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
