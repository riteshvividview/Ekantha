'use client'

import { useEffect, useRef, useState } from 'react'
import type { Event } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'
import styles from './events.module.css'

/**
 * The five occasion panels enter like cards being laid out side by side on
 * a table — each rises and settles a beat after the one before it, so the
 * row reads as options being presented rather than a static grid appearing.
 */
export function EventsWeHost({ data }: { data: Event['eventsWeHost'] }) {
  const items = data.items ?? []
  const [activeId, setActiveId] = useState<number | null>(null)
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

      gsap.from(section.querySelectorAll(`.${styles.panel}`), {
        opacity: 0,
        y: 36,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.09,
        scrollTrigger: { trigger: `.${styles.panels}`, start: 'top 85%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section id="events-we-host" ref={sectionRef}>
      <div className={styles.sectionHead}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className={`section-title ${styles.sectionTitle}`}>{renderHeading(data.heading)}</h2>
        {data.sub && <p>{data.sub}</p>}
      </div>

      <div className={styles.panels}>
        {items.map((item, i) => {
          const image = resolveMedia(item.image)
          return (
            <div
              className={`${styles.panel}${activeId === i ? ` ${styles.active}` : ''}`}
              tabIndex={0}
              key={item.id ?? i}
              onClick={() => setActiveId((cur) => (cur === i ? null : i))}
            >
              {image.url && <img className={styles.panelMedia} src={image.url} alt="" loading="lazy" />}
              <div className={styles.panelNum}>{item.number}</div>
              <div className={styles.panelContent}>
                <div className={styles.panelTitle}>{item.title}</div>
                <div className={styles.panelDesc}>{item.description}</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "five kinds of <em>gathering.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
