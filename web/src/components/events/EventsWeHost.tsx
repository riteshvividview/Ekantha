'use client'

import { useState } from 'react'
import type { Event } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import styles from './events.module.css'

export function EventsWeHost({ data }: { data: Event['eventsWeHost'] }) {
  const items = data.items ?? []
  const [activeId, setActiveId] = useState<number | null>(null)

  return (
    <section id="events-we-host">
      <div className={`${styles.sectionHead} reveal`}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className="section-title">{renderHeading(data.heading)}</h2>
        {data.sub && <p>{data.sub}</p>}
      </div>

      <div className={`${styles.panels} reveal`}>
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
