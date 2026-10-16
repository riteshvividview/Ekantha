'use client'

import { useEffect, useRef } from 'react'
import type { About } from '@/payload-types'
import { gsap } from '@/lib/animations/gsap'
import { PAGE_DARK, PAGE_LIGHT, THEME_SECONDS } from '@/lib/pageTheme'
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
      gsap.fromTo(document.body, PAGE_LIGHT, {
        ...PAGE_DARK,
        duration: THEME_SECONDS,
        ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 70%', end: 'bottom 55%', toggleActions: 'play reverse play reverse' },
      })

      gsap.from(section.querySelectorAll(`.${styles.founderInner} > .eyebrow`), {
        opacity: 0,
        y: 12,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 78%', once: true },
      })

      gsap.from(section.querySelectorAll(`.${styles.founderQuote}`), {
        opacity: 0,
        y: 20,
        duration: 1.1,
        ease: 'power3.out',
        delay: 0.1,
        scrollTrigger: { trigger: section, start: 'top 78%', once: true },
      })

      gsap.from(section.querySelectorAll(`.${styles.founderBody} p`), {
        opacity: 0,
        y: 18,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.2,
        scrollTrigger: { trigger: section, start: 'top 72%', once: true },
      })

      gsap.from(section.querySelectorAll(`.${styles.founderSig}`), {
        opacity: 0,
        y: 14,
        duration: 0.8,
        ease: 'power2.out',
        delay: 0.35,
        scrollTrigger: { trigger: section, start: 'top 65%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.founder} id="why-we-began" ref={sectionRef}>
      <div className={styles.founderInner}>
        <span className="eyebrow">{data.eyebrow}</span>

        <blockquote className={styles.founderQuote}>{data.quote}</blockquote>

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
    </section>
  )
}
