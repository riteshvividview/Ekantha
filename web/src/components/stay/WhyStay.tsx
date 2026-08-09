'use client'

import { useState } from 'react'
import type { StayPage } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import { WhyStayIconSvg } from './icons'
import styles from './stay.module.css'

export function WhyStay({ data }: { data: StayPage['whyStay'] }) {
  const items = data.items ?? []
  const [activeId, setActiveId] = useState<number | null>(null)

  return (
    <section id="why-stay">
      <div className="section-head reveal">
        <h2 className="section-title">{renderHeading(data.heading)}</h2>
        {data.sub && <p>{data.sub}</p>}
      </div>

      <div className={`${styles.accRow} reveal`}>
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
            <div className={styles.accMedia} aria-hidden="true">{image.url && <img src={image.url} alt="" />}</div>
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
