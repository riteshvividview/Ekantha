'use client'

import { useEffect, useRef } from 'react'
import type { Event } from '@/payload-types'
import { gsap } from '@/lib/animations/gsap'
import styles from './events.module.css'

/**
 * This section is the "your event, your way" pitch — modular add-ons
 * grouped by category — so each chip pops in individually, like pieces
 * being snapped together one by one, rather than the whole cluster
 * fading in as one flat block.
 */
export function Customise({ data }: { data: Event['customise'] }) {
  const groups = data.groups ?? []
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

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const groupBlocks = section.querySelectorAll(`.${styles.customGroups} > div`)
      groupBlocks.forEach((block) => {
        gsap.from(block.querySelector(`.${styles.customGroupLabel}`), {
          opacity: 0,
          y: 16,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: block, start: 'top 85%', once: true },
        })

        gsap.from(block.querySelectorAll(`.${styles.chip}`), {
          opacity: 0,
          y: 10,
          scale: 0.9,
          duration: 0.45,
          ease: 'back.out(2.2)',
          stagger: 0.04,
          delay: 0.1,
          scrollTrigger: { trigger: block, start: 'top 85%', once: true },
        })
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className="bg-silver" id="customise" ref={sectionRef}>
      <div className={styles.sectionHead}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className={`section-title ${styles.sectionTitle}`}>{renderHeading(data.heading)}</h2>
        {data.sub && <p>{data.sub}</p>}
      </div>

      <div className={styles.customGroups}>
        {groups.map((group, i) => (
          <div key={group.id ?? i}>
            <div className={styles.customGroupLabel}>
              {group.groupLabel} <span>{group.groupNumber}</span>
            </div>
            <div className={styles.chipRow}>
              {(group.chips ?? []).map((chip, j) => (
                <span className={styles.chip} key={chip.id ?? j}>
                  <span className={styles.chipPlus}>+</span>
                  {chip.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "shape the evening <em>your way.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
