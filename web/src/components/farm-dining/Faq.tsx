'use client'

import { useRef } from 'react'
import type { FarmDining } from '@/payload-types'
import styles from './farm-dining.module.css'

export function Faq({ data }: { data: FarmDining['faq'] }) {
  const items = data.items ?? []
  const listRef = useRef<HTMLDivElement>(null)

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
    <section id="faq">
      <div className={`${styles.sectionHead} reveal`}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className="section-title">{renderHeading(data.heading)}</h2>
      </div>

      <div className={styles.faqList} ref={listRef}>
        {items.map((item, i) => (
          <details className={`${styles.faqItem} reveal`} onToggle={handleToggle} key={item.id ?? i}>
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
