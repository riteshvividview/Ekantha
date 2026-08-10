'use client'

import { useRef } from 'react'
import type { Stay } from '@/payload-types'
import { HighlightIconSvg } from '../icons'
import { useBentoParallax } from '@/lib/animations/useBentoParallax'
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
 *  though all three draw from the same `highlightsSection.items` field. */
export function Highlights({ data }: { data: Stay['highlightsSection'] }) {
  const gridRef = useRef<HTMLDivElement>(null)
  useBentoParallax(gridRef, `.${styles.hlCard}`, `.${styles.hlCardMedia}`)

  const items = data?.items ?? []
  if (!items.length) return null

  return (
    <section className="bg-silver" id="highlights">
      <div className="section-head reveal">
        <h2 className="section-title">accommodation <em>highlights.</em></h2>
        <p>What &ldquo;the whole estate&rdquo; actually means — no surprises, no fine print.</p>
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
