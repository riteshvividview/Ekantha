'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Stay } from '@/payload-types'
import { resolveMediaSize } from '@/lib/realMedia'
import { HighlightIconSvg, badgeColorClass } from './icons'
import { gsap } from '@/lib/animations/gsap'
import { riseTitle } from '@/lib/animations/sectionMotion'
import styles from './stay-detail.module.css'

/**
 * The sticky cottage photo gets a slow inner drift as it pins (the same
 * "quiet depth" cue used on the accent portrait above it), and each fact
 * row settles in with its icon turning gently into place rather than a
 * flat fade — small enough to feel like someone unpacking the room for
 * you one detail at a time, not a catalog list animating in.
 */
export function Highlights({ data }: { data: Stay['highlightsSection'] }) {
  const items = data?.items ?? []
  const image = resolveMediaSize(data?.image, 'card')
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!items.length) return undefined
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      const rows = section.querySelectorAll(`.${styles.hlRow}`)
      gsap.from(rows, {
        opacity: 0,
        y: 28,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: section, start: 'top 78%', once: true },
      })
      gsap.from(section.querySelectorAll(`.${styles.hlIcon}`), {
        opacity: 0,
        rotate: -24,
        scale: 0.7,
        duration: 0.8,
        ease: 'back.out(1.6)',
        stagger: 0.1,
        scrollTrigger: { trigger: section, start: 'top 78%', once: true },
      })

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      riseTitle(section)

      // A vine grows down the list as you read it, a leaf riding its tip.
      const list = section.querySelector(`.${styles.hlList}`)
      const vine = section.querySelector(`.${styles.hlVineLine}`)
      const tip = section.querySelector(`.${styles.hlVineTip}`)
      if (list && vine && tip) {
        const grow = { trigger: list, start: 'top 70%', end: 'bottom 60%', scrub: 0.5 }
        gsap.fromTo(vine, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: grow })
        gsap.fromTo(tip, { top: '0%', rotate: -30 }, { top: '100%', rotate: 30, ease: 'none', scrollTrigger: grow })
      }

      const mediaImg = section.querySelector(`.${styles.hlMedia} img`)
      if (mediaImg) {
        gsap.fromTo(
          mediaImg,
          { scale: 1.1, yPercent: -5 },
          {
            scale: 1.02,
            yPercent: 5,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      }
    }, section)

    return () => ctx.revert()
  }, [items.length])

  if (!items.length) return null

  return (
    <section className="bg-silver" id="highlights" ref={sectionRef}>
      <div className="section-head reveal">
        <h2 className={`section-title ${styles.sectionTitle}`}>accommodation {italic('highlights.')}</h2>
        <p>What the cottage actually holds — no surprises, no fine print.</p>
      </div>

      <div className={styles.hlSplit}>
        <div className={styles.hlMedia}>{image.url && <Image src={image.url} alt={image.alt} fill sizes="(max-width: 860px) 100vw, 80vw" quality={90} style={{ objectFit: 'cover' }} />}</div>
        <div className={styles.hlList}>
          <div className={styles.hlVine} aria-hidden="true">
            <i className={styles.hlVineLine} />
            <svg className={styles.hlVineTip} viewBox="0 0 24 24">
              <path d="M12 2C6 7 5 15 12 22C19 15 18 7 12 2Z" />
              <path d="M12 4V20" />
            </svg>
          </div>
          {items.map((item, i) => (
            <div className={styles.hlRow} key={item.id ?? i}>
              <div className={styles.hlIcon} aria-hidden="true">
                <HighlightIconSvg icon={item.icon ?? 'bed'} />
              </div>
              <div>
                <span className={`${styles.hlBadge} ${badgeColorClass(item.badgeColor ?? 'green', styles)}`}>{item.badgeLabel}</span>
                <div className={styles.hlTitle}>{item.title}</div>
                <div className={styles.hlBody}>{item.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function italic(text: string) {
  return <em>{text}</em>
}
