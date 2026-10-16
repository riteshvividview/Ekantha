'use client'

import { useEffect, useRef } from 'react'
import type { Stay } from '@/payload-types'
import { HighlightIconSvg } from '../icons'
import { useBentoParallax } from '@/lib/animations/useBentoParallax'
import { CountUp } from '@/components/shared/CountUp'
import { gsap } from '@/lib/animations/gsap'
import styles from './full.module.css'

const DOT_COLOR: Record<string, string> = {
  green: '#4ADE80',
  amber: '#FBBF24',
  purple: '#C084FC',
  blue: '#60A5FA',
}

/** Full House's own visual treatment for the highlights list — a 4-card
 *  photo-backed bento grid, each card carrying an icon, a colored badge,
 *  and a title+body over the photo. Distinct from Mango House's sticky-photo
 *  + icon-row treatment and Stone House's featured-card + row treatment,
 *  though all three draw from the same `highlightsSection.items` field.
 *  Below the header sits Full House's own signature beat: a three-number
 *  "estate at a glance" strip (guests / houses / nights) that states this
 *  stay's scale as a fact — the grand, communal, numbers-driven opposite of
 *  a single intimate cottage or a solitary writer's retreat. Cards settle
 *  in with a loose, arriving-all-at-once stagger (not a tidy single-file
 *  queue) to read as a crowd gathering rather than a checklist unpacking. */
export function Highlights({ data }: { data: Stay['highlightsSection'] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  useBentoParallax(gridRef, `.${styles.hlCard}`, `.${styles.hlCardMedia}`)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll(`.${styles.hlStat}`), {
        opacity: 0,
        y: 16,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: section, start: 'top 85%', once: true },
      })

      const cards = section.querySelectorAll(`.${styles.hlCard}`)
      gsap.from(cards, {
        opacity: 0,
        y: 46,
        scale: 0.96,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: section, start: 'top 75%', once: true },
      })
      gsap.from(section.querySelectorAll(`.${styles.hlBadge}`), {
        opacity: 0,
        scale: 0.6,
        duration: 0.7,
        ease: 'back.out(1.8)',
        stagger: 0.12,
        scrollTrigger: { trigger: cards[0] ?? section, start: 'top 72%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  const items = data?.items ?? []
  if (!items.length) return null

  return (
    <section className="bg-silver" id="highlights" ref={sectionRef}>
      <div className="section-head reveal">
        <h2 className={`section-title ${styles.sectionTitle}`}>accommodation <em>highlights.</em></h2>
        <p>What &ldquo;the whole estate&rdquo; actually means — no surprises, no fine print.</p>
      </div>

      <div className={styles.hlStats}>
        <div className={styles.hlStat}>
          <span className={styles.hlStatNum}><CountUp value={16} />+</span>
          <span className={styles.hlStatLabel}>guests, under one roof</span>
        </div>
        <div className={styles.hlStat}>
          <span className={styles.hlStatNum}><CountUp value={2} /></span>
          <span className={styles.hlStatLabel}>houses, held as one estate</span>
        </div>
        <div className={styles.hlStat}>
          <span className={styles.hlStatNum}><CountUp value={3} /></span>
          <span className={styles.hlStatLabel}>nights, minimum stay</span>
        </div>
      </div>

      <div className={styles.hlGrid} ref={gridRef}>
        {items.map((item, i) => {
          const bgUrl = typeof item.image === 'object' && item.image ? item.image.url : undefined
          return (
            <div className={`${styles.hlCard} reveal`} key={item.id ?? i}>
              <div className={styles.hlCardMediaWrap}>
                {bgUrl && <div className={styles.hlCardMedia} style={{ backgroundImage: `url('${bgUrl}')` }} role="img" aria-label={item.title} />}
              </div>
              <div className={styles.hlCardScrim} aria-hidden="true" />
              <span className={styles.hlBadge}>
                <span className={styles.hlBadgeDot} style={{ background: DOT_COLOR[item.badgeColor ?? 'green'] }} />
                {item.badgeLabel}
              </span>
              <div className={styles.hlCardBottom}>
                <div className={styles.hlIcon} aria-hidden="true">
                  <HighlightIconSvg icon={item.icon ?? 'bed'} />
                </div>
                <div className={styles.hlTitle}>{item.title}</div>
                <div className={styles.hlBody}>{item.body}</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
