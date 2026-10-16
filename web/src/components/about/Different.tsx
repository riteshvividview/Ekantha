'use client'

import { useEffect, useRef } from 'react'
import type { About } from '@/payload-types'
import { gsap } from '@/lib/animations/gsap'
import styles from './about.module.css'

/**
 * A page of declarations rather than a feature grid: each row states
 * what the estate isn't first, lets it sit struck-through for a beat,
 * then the arrow and what it is land a touch later with a small pop —
 * dramatizing the "not this, but this" rhythm the copy is built on,
 * instead of a flat simultaneous fade.
 */
export function Different({ data }: { data: About['different'] }) {
  const rows = data.rows ?? []
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll('.eyebrow, .section-title'), {
        opacity: 0,
        y: 20,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: section, start: 'top 82%', once: true },
      })

      const contrastRows = section.querySelectorAll(`.${styles.contrastRow}`)
      contrastRows.forEach((row) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: row, start: 'top 85%', once: true },
        })
        tl.from(row.querySelector(`.${styles.contrastNot}`), {
          opacity: 0,
          x: -16,
          duration: 0.6,
          ease: 'power2.out',
        })
          .from(
            row.querySelector(`.${styles.contrastArrow}`),
            { opacity: 0, duration: 0.4, ease: 'power1.out' },
            '+=0.1',
          )
          .from(
            row.querySelector(`.${styles.contrastYes}`),
            { opacity: 0, x: 16, scale: 0.92, duration: 0.6, ease: 'back.out(1.6)' },
            '-=0.15',
          )
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section id="different" ref={sectionRef}>
      <span className="eyebrow">{data.eyebrow}</span>
      <h2 className={`section-title ${styles.sectionTitle}`} style={{ margin: '1rem 0 clamp(2rem, 5vw, 3.5rem)' }}>
        {renderHeading(data.heading)}
      </h2>

      <div className={styles.contrastList}>
        {rows.map((row, i) => (
          <div className={styles.contrastRow} key={row.id ?? i}>
            <div className={styles.contrastNot}>{row.notText}</div>
            <div className={styles.contrastArrow}>→</div>
            <div className={styles.contrastYes}>{row.yesText}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/** "not a resort.\nnot quite a retreat, either." → line break on `\n`, last
 *  word of the last line italicized. */
function renderHeading(heading: string) {
  const lines = heading.split('\n')
  return lines.map((line, i, arr) => (
    <span key={i}>
      {i < arr.length - 1 ? line : renderLastLine(line)}
      {i < arr.length - 1 && <br />}
    </span>
  ))
}

function renderLastLine(line: string) {
  const words = line.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
