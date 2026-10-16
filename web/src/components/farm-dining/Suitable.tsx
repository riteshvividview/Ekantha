'use client'

import { useEffect, useRef } from 'react'
import type { FarmDining } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
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
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
      })

      const cards = section.querySelectorAll(`.${styles.suitCard}`)
      gsap.from(cards, {
        opacity: 0,
        y: 36,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: cards[0] ?? section, start: 'top 85%', once: true },
      })

      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const ember = section.querySelector(`.${styles.suitEmber}`)
        if (ember) {
          gsap.to(ember, {
            opacity: 0.85,
            scale: 1.12,
            duration: 4.5,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          })
        }
      }
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
              {item.featured && image.url && <img className={styles.suitMedia} src={image.url} alt="" loading="lazy" />}
              {item.featured && <div className={styles.suitEmber} aria-hidden="true" />}
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
