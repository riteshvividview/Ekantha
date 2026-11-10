'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/realMedia'
import { gsap } from '@/lib/animations/gsap'
import styles from './stone.module.css'

/**
 * Stone House's own visual treatment for the highlights list — a large
 * featured photo card (the first item) beside a stacked list of smaller
 * image+text rows (the rest). The featured photo opens like
 * shutters from its centre, then barely moves: a slow vertical drift, the
 * way a view out a window shifts while you sit still at a desk. Each row's
 * photo wipes open from the left with its text following. The rows read like margin notes: a small roman numeral marks
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
      const hero = section.querySelector(`.${styles.hlHero}`)
      const heroImg = section.querySelector(`.${styles.hlHero} img`)
      // The featured photo opens like shutters from its centre line.
      if (hero) {
        gsap.fromTo(
          hero,
          { clipPath: 'inset(0% 50% 0% 50% round 20px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: hero, start: 'top 80%', once: true } },
        )
        gsap.from(section.querySelectorAll(`.${styles.hlHeroContent} > *`), {
          y: 24, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, delay: 0.7,
          scrollTrigger: { trigger: hero, start: 'top 80%', once: true },
        })
      }
      // Scaled up so the slow vertical drift never uncovers the frame edge.
      if (heroImg) {
        gsap.fromTo(heroImg, { yPercent: -5, scale: 1.12 }, {
          yPercent: 5, scale: 1.12, ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      }
      // Each margin-note row: its photo wipes open from the left, then the
      // text slides in beside it.
      section.querySelectorAll(`.${styles.hlRow}`).forEach((row) => {
        const st = { trigger: row, start: 'top 85%', once: true }
        gsap.fromTo(row.querySelector(`.${styles.hlRowMedia}`), { clipPath: 'inset(0% 100% 0% 0% round 12px)' }, { clipPath: 'inset(0% 0% 0% 0% round 12px)', duration: 1, ease: 'power3.inOut', scrollTrigger: st })
        gsap.from(row.lastElementChild, { x: 30, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.25, scrollTrigger: st })
      })
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

      <div className={styles.hlLayout}>
        <div className={styles.hlHero}>
          {heroImage.url && <Image src={heroImage.url} alt={heroImage.alt} fill sizes="(max-width: 768px) 100vw, 70vw" quality={90} style={{ objectFit: 'cover' }} />}
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
                <div className={styles.hlRowMedia}>{image.url && <Image src={image.url} alt={image.alt} fill sizes="400px" quality={90} style={{ objectFit: 'cover' }} />}</div>
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
