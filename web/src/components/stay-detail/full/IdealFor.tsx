'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/realMedia'
import { gsap } from '@/lib/animations/gsap'
import styles from './full.module.css'

/** Full House's numbered card grid — matches FullHouse.html's `.ideal-*`
 *  design. Reuses the same `idealFor` field Mango House's circular-photo
 *  rows and Stone House's alternating rows use. Cards stand up from the
 *  table in 3D, hinged at their base, and each number badge pops
 *  in with a little overshoot right after — like place cards being set
 *  down and then stamped, fitting a page about groups arriving at once. */
export function IdealFor({ items }: { items: Stay['idealFor'] }) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      const cards = section.querySelectorAll(`.${styles.idealCard}`)
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      // Calm entrance: each card rises and fades in a beat after the last,
      // its photo settling from a slight zoom as it arrives.
      const st = { trigger: section.querySelector(`.${styles.idealGrid}`) ?? section, start: 'top 80%', once: true }
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40, transition: 'none' },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: st,
          onComplete: () => {
            gsap.set(cards, { clearProps: 'transform,transition' })
          },
        },
      )
      gsap.fromTo(
        section.querySelectorAll(`.${styles.idealMedia} img`),
        { scale: 1.12 },
        { scale: 1, duration: 1.6, ease: 'power2.out', stagger: 0.12, scrollTrigger: st },
      )
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
                {image.url && <Image src={image.url} alt={image.alt} fill sizes="(max-width: 500px) 100vw, (max-width: 900px) 50vw, 30vw" quality={90} style={{ objectFit: 'cover' }} />}
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
