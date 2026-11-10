'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { StayPage } from '@/payload-types'
import { resolveMedia } from '@/lib/realMedia'
import { WhyStayIconSvg } from './icons'
import { gsap } from '@/lib/animations/gsap'
import styles from './stay.module.css'

/**
 * WhyStay's own motion concept: the reasons-to-book panels unfold like a
 * folding screen as the row scrolls in (alternate leaves hinging from
 * opposite sides, tied to the scroll), and each panel's icon turns in.
 * Phones get a simple rise-in.
 */
export function WhyStay({ data }: { data: StayPage['whyStay'] }) {
  const items = data.items ?? []
  const [activeId, setActiveId] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {

      gsap.from(section.querySelectorAll('.section-head'), {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 85%', once: true },
      })

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const panels = section.querySelectorAll(`.${styles.accPanel}`)
      // The panels unfold like a folding screen as the row scrolls in:
      // alternate leaves hinge from opposite angles and flatten together.
      const row = section.querySelector(`.${styles.accRow}`)
      if (row && window.matchMedia('(min-width: 701px)').matches) {
        gsap.fromTo(
          panels,
          { rotationY: (i: number) => (i % 2 === 0 ? 62 : -62), opacity: 0.2, transformPerspective: 1400, transformOrigin: (i: number) => (i % 2 === 0 ? '0% 50%' : '100% 50%') },
          { rotationY: 0, opacity: 1, ease: 'none', stagger: 0.06, scrollTrigger: { trigger: row, start: 'top 95%', end: 'top 40%', scrub: 0.6 } },
        )
      } else {
        gsap.from(panels, { opacity: 0, y: 40, duration: 0.9, ease: 'power3.out', stagger: 0.12, scrollTrigger: { trigger: panels[0], start: 'top 88%', once: true } })
      }
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
            <div className={styles.accMedia} aria-hidden="true">{image.url && <Image src={image.url} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" quality={90} style={{ objectFit: 'cover' }} />}</div>
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
