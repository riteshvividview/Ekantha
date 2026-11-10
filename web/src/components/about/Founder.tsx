'use client'

import { useEffect, useRef } from 'react'
import type { About } from '@/payload-types'
import { gsap } from '@/lib/animations/gsap'
import { Landscape, MangoSprig, Toast, Envelope, EstateMap, Icon } from '../illustrations/Line'
import styles from './about.module.css'

/**
 * This is the one section written in a single voice — the founder's own
 * note — so it gets the page's one deliberate light/dark crossfade
 * moment (same body-tween mechanic WhyStay uses on /stay): the whole
 * page dims to a warmer, near-dark palette while you're reading it, like
 * the room going quiet to listen, then lifts back to the editorial white
 * once you've moved on. The quote and paragraphs settle in slowly rather
 * than sliding, and the signature's underline draws in last.
 */
export function Founder({ data }: { data: About['founder'] }) {
  const paragraphs = data.paragraphs ?? []
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll(`.${styles.founderInner} > *`), {
        opacity: 0,
        y: 18,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: section, start: 'top 82%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.founder} id="why-we-began" ref={sectionRef}>
      <div className={styles.founderInner}>
        <span className="eyebrow">{data.eyebrow}</span>

        <div className={styles.founderSide}>
          <Icon name="quote" className={styles.founderMarkIcon} />
          <blockquote className={styles.founderQuote}>{data.quote}</blockquote>
          <MangoSprig className={styles.founderIllo} />
        </div>
        <div>

        <div className={styles.founderBody}>
          {paragraphs.map((p, i) => (
            <p key={p.id ?? i}>{p.text}</p>
          ))}
        </div>

        <div className={styles.founderSig}>
          {data.signatureName}
          {data.signatureLocation && <span>{data.signatureLocation}</span>}
        </div>
        </div>
      </div>
    </section>
  )
}
