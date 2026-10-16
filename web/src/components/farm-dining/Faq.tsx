'use client'

import { useEffect, useRef } from 'react'
import type { FarmDining } from '@/payload-types'
import { gsap } from '@/lib/animations/gsap'
import styles from './farm-dining.module.css'

export function Faq({ data }: { data: FarmDining['faq'] }) {
  const items = data.items ?? []
  const listRef = useRef<HTMLDivElement>(null)
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

      const rows = section.querySelectorAll(`.${styles.faqItem}`)
      gsap.from(rows, {
        opacity: 0,
        y: 18,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: rows[0] ?? section, start: 'top 88%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  // Accordion behavior: opening one item closes every other open item.
  function handleToggle(e: React.SyntheticEvent<HTMLDetailsElement>) {
    if (!e.currentTarget.open) return
    const list = listRef.current
    if (!list) return
    Array.from(list.querySelectorAll<HTMLDetailsElement>('details')).forEach((other) => {
      if (other !== e.currentTarget) other.open = false
    })
  }

  return (
    <section id="faq" ref={sectionRef}>
      <div className={`${styles.sectionHead}`}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className={`section-title ${styles.sectionTitle}`}>{renderHeading(data.heading)}</h2>
      </div>

      <div className={styles.faqList} ref={listRef}>
        {items.map((item, i) => (
          <details className={`${styles.faqItem}`} onToggle={handleToggle} key={item.id ?? i}>
            <summary>
              {item.question}
              <span className={styles.faqPlus}>+</span>
            </summary>
            <div className={styles.faqAnswer}>{item.answer}</div>
          </details>
        ))}
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "before you <em>reserve.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
