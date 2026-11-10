'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { FarmDining } from '@/payload-types'
import { resolveMedia } from '@/lib/realMedia'
import { gsap } from '@/lib/animations/gsap'
import styles from './farm-dining.module.css'

/** Each row's photo gets its own slow, scroll-tied drift (the way firelight
 *  and shadow move across a scene over the course of an evening, not a
 *  mechanical pan), while the row's copy rises in from the text side —
 *  left for right-facing rows, right for reversed ones — so the whole
 *  section feels like moving down the table rather than down a list. */
export function Experience({ data }: { data: FarmDining['experience'] }) {
  const items = data.items ?? []
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll(`.${styles.sectionHead}`), {
        opacity: 0,
        y: 20,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0,
        scrollTrigger: { trigger: section, start: 'top 82%', once: true },
      })
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      section.querySelectorAll(`.${styles.expRow}`).forEach((row) => {
        gsap.from(row, { opacity: 0, y: 28, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 85%', once: true } })
      })
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section className="bg-silver" id="experience" ref={sectionRef}>
      <div className={`${styles.sectionHead}`}>
        <span className="eyebrow">{data.eyebrow}</span>
        <h2 className={`section-title ${styles.sectionTitle}`}>{renderHeading(data.heading)}</h2>
      </div>

      <div className={styles.expGrid}>
      {items.map((item, i) => {
        const image = resolveMedia(item.image)
        return (
          <div className={`${styles.expRow}${i % 2 === 1 ? ` ${styles.reverse}` : ''}`} key={item.id ?? i}>
            <div className={styles.expVisual}>{image.url && <Image src={image.url} alt={image.alt} fill sizes="(max-width: 768px) 100vw, 60vw" quality={90} style={{ objectFit: 'cover' }} />}</div>
            <div>
              <div className={styles.expTag}>
                {item.tagNumber} · {item.tagLabel}
              </div>
              <h3 className={styles.expTitle}>{renderTitle(item.title)}</h3>
              <p className={styles.expBody}>{item.body}</p>
            </div>
          </div>
        )
      })}
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "three things you'll <em>notice.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}

/** Italicizes the last word(s), matching "The <em>Farm Setting</em>" style
 *  row titles — everything after the first word is italic when the title
 *  is two words, matching the source markup per row. */
function renderTitle(title: string) {
  const words = title.trim().split(' ')
  if (words.length < 2) return <em>{title}</em>
  const first = words.shift()
  return (
    <>
      {first} <em>{words.join(' ')}</em>
    </>
  )
}
