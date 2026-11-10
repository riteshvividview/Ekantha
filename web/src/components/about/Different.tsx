'use client'

import { useEffect, useRef } from 'react'
import type { About } from '@/payload-types'
import { gsap } from '@/lib/animations/gsap'
import { Landscape, MangoSprig, Toast, Envelope, EstateMap, Icon } from '../illustrations/Line'
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
      gsap.from(section.querySelectorAll(`.${styles.contrastRow}`), {
        opacity: 0,
        y: 16,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: section.querySelector(`.${styles.contrastList}`), start: 'top 82%', once: true },
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
            <div className={styles.contrastNot}><Icon name="cross" className={styles.contrastIcon} />{row.notText}</div>
            <div className={styles.contrastYes}><Icon name="check" className={styles.contrastIcon} />{row.yesText}</div>
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
