'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { StayPage } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import { WhyStayIconSvg } from './icons'
import { gsap } from '@/lib/animations/gsap'
import { PAGE_DARK, PAGE_LIGHT, THEME_SECONDS } from '@/lib/pageTheme'
import styles from './stay.module.css'

/**
 * WhyStay's own motion concept — and the page's one deliberate "color
 * difference" moment the client asked for: the whole page crossfades to a
 * near-black palette for this section (same body-tween pattern the
 * homepage's Why section uses) and back to the light base after it, so
 * the reasons-to-book panels read as a distinct, immersive beat rather
 * than another silver block. Panels also rise in with a stagger, and each
 * reveal its own icon with a little rotate-in instead of a flat fade.
 */
export function WhyStay({ data }: { data: StayPage['whyStay'] }) {
  const items = data.items ?? []
  const [activeId, setActiveId] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      gsap.fromTo(document.body, PAGE_LIGHT, {
        ...PAGE_DARK,
        duration: THEME_SECONDS,
        ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 75%', end: 'bottom 60%', toggleActions: 'play reverse play reverse' },
      })

      gsap.from(section.querySelectorAll('.section-head'), {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 85%', once: true },
      })

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const panels = section.querySelectorAll(`.${styles.accPanel}`)
      gsap.from(panels, {
        opacity: 0,
        y: 48,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.14,
        scrollTrigger: { trigger: panels[0], start: 'top 88%', once: true },
      })
      gsap.from(section.querySelectorAll(`.${styles.accIcon}`), {
        opacity: 0,
        rotate: -40,
        scale: 0.6,
        duration: 0.9,
        ease: 'back.out(1.7)',
        stagger: 0.14,
        scrollTrigger: { trigger: panels[0], start: 'top 82%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section id="why-stay" ref={sectionRef}>
      <div className="section-head">
        <h2 className={`section-title ${styles.sectionTitle}`}>{renderHeading(data.heading)}</h2>
        {data.sub && <p>{data.sub}</p>}
      </div>

      <div className={styles.accRow}>
        {items.map((item, i) => {
          const image = resolveMedia(item.image)
          return (
          <div
            className={`${styles.accPanel}${activeId === i ? ` ${styles.active}` : ''}`}
            tabIndex={0}
            key={item.id ?? i}
            onClick={() => setActiveId((cur) => (cur === i ? null : i))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setActiveId((cur) => (cur === i ? null : i))
              }
            }}
          >
            <div className={styles.accMedia} aria-hidden="true">{image.url && <Image src={image.url} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />}</div>
            <div className={styles.accScrim} aria-hidden="true" />
            <div className={styles.accPanelTop}>
              <div className={styles.accIcon} aria-hidden="true">
                <WhyStayIconSvg icon={item.icon} />
              </div>
              <span className={styles.accNum} aria-hidden="true">
                {item.number}
              </span>
            </div>
            <span className={styles.accLabel}>{item.label}</span>
            <div className={styles.accContent}>
              <div className={styles.accTitle}>{item.title}</div>
              <div className={styles.accBody}>{item.body}</div>
            </div>
          </div>
          )
        })}
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "why stay at <em>Vana Ekantha.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
