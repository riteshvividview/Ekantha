'use client'

import { useEffect, useRef } from 'react'
import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'
import styles from './stone.module.css'

/**
 * Stone House's own visual treatment for the highlights list — a large
 * featured photo card (the first item) beside a stacked list of smaller
 * image+text rows (the rest). Where Mango House's hero drifts into a
 * zoom, Stone House's barely moves at all: a slow, few-pixel vertical
 * drift as you scroll past it, the way a view out a window shifts while
 * you sit still at a desk — stillness as the mood, not a withheld
 * effect. The rows read like margin notes: a small roman numeral marks
 * each one instead of a loud index number.
 */
export function Highlights({ data }: { data: Stay['highlightsSection'] }) {
  const items = data?.items ?? []
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      // Scaled up slightly so the few-pixel vertical drift below never
      // uncovers the edge of the frame.
      const heroImg = section.querySelector(`.${styles.hlHero} img`)
      if (heroImg) {
        gsap.fromTo(
          heroImg,
          { yPercent: -4, scale: 1.08 },
          {
            yPercent: 4,
            scale: 1.08,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      }
    }, section)

    return () => ctx.revert()
  }, [])

  if (!items.length) return null
  const [hero, ...rows] = items
  const heroImage = resolveMedia(hero.image)

  return (
    <section className="bg-silver" id="highlights" ref={sectionRef}>
      <div className="section-head reveal">
        <h2 className={`section-title ${styles.sectionTitle}`}>accommodation <em>highlights.</em></h2>
        <p>What the house actually holds — no surprises, no fine print.</p>
      </div>

      <div className={`${styles.hlLayout} reveal`}>
        <div className={styles.hlHero}>
          {heroImage.url && <img src={heroImage.url} alt={heroImage.alt} loading="lazy" />}
          <div className={styles.hlHeroScrim} aria-hidden="true" />
          <div className={styles.hlHeroContent}>
            <span className={styles.hlHeroBadge}>{hero.badgeLabel}</span>
            <div className={styles.hlHeroTitle}>{hero.title}</div>
            <div className={styles.hlHeroBody}>{hero.body}</div>
          </div>
        </div>

        <div className={styles.hlList}>
          {rows.map((row, i) => {
            const image = resolveMedia(row.image)
            return (
              <div className={styles.hlRow} key={row.id ?? i}>
                <div className={styles.hlRowMedia}>{image.url && <img src={image.url} alt={image.alt} loading="lazy" />}</div>
                <div>
                  <span className={styles.hlRowNumeral} aria-hidden="true" />
                  <span className={styles.hlRowBadge}>{row.badgeLabel}</span>
                  <div className={styles.hlRowTitle}>{row.title}</div>
                  <div className={styles.hlRowBody}>{row.body}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
