'use client'

import { useEffect, useRef, useState } from 'react'
import type { Home } from '@/payload-types'
import { SectionHead } from '@/components/shared/SectionHead'
import { resolveMediaSize } from '@/lib/media'
import styles from './home.module.css'

const BADGE_CLASSES = [styles.badgeGreen, styles.badgeAmber, styles.badgePurple, styles.badgeBlue]

const ICON_PATHS = [
  // Nature
  <>
    <path d="M24,40 L24,20" />
    <path d="M24,20 Q14,20 12,10 Q22,10 24,20 Z" />
    <path d="M24,24 Q34,24 36,14 Q26,14 24,24 Z" />
  </>,
  // Privacy
  <>
    <rect x="12" y="20" width="24" height="18" rx="2" />
    <path d="M17,20 L17,13 Q17,7 24,7 Q31,7 31,13 L31,20" />
  </>,
  // Curated Experiences
  <>
    <circle cx="24" cy="24" r="16" />
    <path d="M18,24 L22,28 L30,18" />
  </>,
  // Close to Hyderabad
  <>
    <path d="M24,6 C24,6 12,18 12,27 A12,12 0 0 0 36,27 C36,18 24,6 24,6 Z" />
    <circle cx="24" cy="27" r="3" />
  </>,
]

/**
 * "Why Vana Ekantha" — a big sticky mood photo on the left, a stack of cards
 * on the right. Each card is `position: sticky` at the same `top` offset,
 * wrapped in a taller spacer (.whyStackCardWrap) that gives it real scroll
 * distance to hold that position before the next card's wrap arrives and
 * covers it — plain CSS, no scroll-linked JS for the stacking itself. Every
 * card carries its own image at the bottom.
 *
 * The showcase photo is a separate crossfading stack of layers (one per
 * item's `spotlightImage`, distinct from the card's own bottom image) —
 * which layer is visible is driven by a lightweight IntersectionObserver
 * watching each card wrap against the viewport's vertical center: whichever
 * wrap currently straddles that line is "active," matching whichever card
 * is the dominant one on screen at that moment (a standard scrollspy
 * pattern, independent of the exact sticky pixel offset).
 */
export function WhyUs({ data }: { data: Home['whyUs'] }) {
  const items = data.items ?? []
  const [activeIndex, setActiveIndex] = useState(0)
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const wraps = wrapRefs.current.filter((el): el is HTMLDivElement => !!el)
    if (wraps.length < 2) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const index = wraps.indexOf(entry.target as HTMLDivElement)
          if (index !== -1) setActiveIndex(index)
        })
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    )
    wraps.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [items.length])

  const defaultShowcase = resolveMediaSize(data.showcaseImage, 'card')

  return (
    <section id="why">
      <SectionHead title={renderTitle(data.heading)} sub={data.sub} />

      <div className={styles.whyShowcase}>
        <div className={styles.whyShowcaseSticky}>
          <div className={styles.whyShowcaseImage}>
            {items.map((item, i) => {
              const spotlight = resolveMediaSize(item.spotlightImage, 'card')
              const media = spotlight.url ? spotlight : defaultShowcase
              return (
                <div className={`${styles.whyShowcaseLayer}${i === activeIndex ? ` ${styles.whyShowcaseLayerActive}` : ''}`} key={item.id ?? i}>
                  {media.url && <img src={media.url} alt={media.alt} loading={i === 0 ? 'eager' : 'lazy'} />}
                </div>
              )
            })}
          </div>
        </div>

        <div className={styles.whyCardStack}>
          {items.map((item, i) => {
            const media = resolveMediaSize(item.image, 'card')
            return (
              <div
                className={`${styles.whyStackCardWrap} reveal`}
                key={item.id ?? i}
                ref={(el) => {
                  wrapRefs.current[i] = el
                }}
              >
                <div className={styles.whyStackCard}>
                  <div className={styles.whyStackCardContent}>
                    <span className={`${styles.cellBadge} ${BADGE_CLASSES[i % 4]}`}>{item.badgeLabel}</span>
                    <div className={styles.whyFlatIcon}>
                      <svg viewBox="0 0 48 48" stroke="currentColor" fill="none" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        {ICON_PATHS[i % ICON_PATHS.length]}
                      </svg>
                    </div>
                    <div className={styles.cellTitle}>{item.title}</div>
                    <div className={styles.cellBody}>{item.body}</div>
                  </div>
                  <div className={styles.whyStackCardImage}>{media.url && <img src={media.url} alt={media.alt} loading="lazy" />}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function renderTitle(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
