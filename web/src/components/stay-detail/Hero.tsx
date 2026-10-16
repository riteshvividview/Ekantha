'use client'

import { useEffect, useRef } from 'react'
import type { Stay } from '@/payload-types'
import { resolveMediaSize } from '@/lib/media'
import { CountUp } from '@/components/shared/CountUp'
import { gsap } from '@/lib/animations/gsap'
import styles from './stay-detail.module.css'

/**
 * Mango House's own hero mood — warmer and quieter than the Stay overview's
 * hero: two soft amber/leaf glows breathe behind the frame, the backdrop
 * photo drifts into a slow zoom as you scroll (instead of sitting static),
 * and the headline rises out of a mask word-by-word rather than using the
 * page-wide flat `.reveal` fade — a small, deliberate "this cottage feels
 * different from the others" cue right at the threshold.
 */
export function Hero({ stay, badgeNumber, showBg = false }: { stay: Stay; badgeNumber: string; showBg?: boolean }) {
  const bg = resolveMediaSize(stay.heroImage, 'hero')
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    // Every ScrollTrigger-driven tween for this component lives inside this
    // one gsap.context() call, cleaned up via ctx.revert() — a tween left
    // outside it would survive React Strict Mode's dev double-invoke as a
    // second, orphaned instance racing the first on the same elements.
    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const words = section.querySelectorAll(`.${styles.heroWordInner}`)
      if (words.length) {
        gsap.from(words, {
          yPercent: 120,
          duration: 1.1,
          ease: 'power4.out',
          stagger: 0.07,
        })
      }

      gsap.from(section.querySelectorAll(`.${styles.heroBadge}, .${styles.heroSub}, .${styles.heroFacts}, .${styles.heroCtas}`), {
        opacity: 0,
        y: 20,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.09,
        delay: 0.2,
      })

      const bgImg = section.querySelector(`.${styles.heroBg} img`)
      if (bgImg) {
        gsap.fromTo(
          bgImg,
          { scale: 1.08, yPercent: -4 },
          {
            scale: 1.22,
            yPercent: 4,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
          },
        )
      }

      gsap.to(section.querySelectorAll(`.${styles.heroGlowA}`), {
        x: 40,
        y: -24,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
      })
      gsap.to(section.querySelectorAll(`.${styles.heroGlowB}`), {
        x: -32,
        y: 30,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.hero} id="top" ref={sectionRef}>
      <div className={styles.heroGlowA} aria-hidden="true" />
      <div className={styles.heroGlowB} aria-hidden="true" />

      {showBg && (
        <div className={styles.heroBg} aria-hidden="true">
          {bg.url && <img src={bg.url} alt="" />}
          <div className={styles.heroBgWash} />
        </div>
      )}

      <div className={styles.heroBadge}>
        <span className={styles.dot}>{badgeNumber}</span>
        {stay.heroBadgeLabel}
      </div>

      <h1 className={`display-xl ${styles.heroHeadline}`}>{renderTitle(stay.title)}</h1>

      {stay.heroSub && <p className={styles.heroSub}>{stay.heroSub}</p>}

      <div className={styles.heroFacts}>
        <span>
          <span className={styles.amount}>
            ₹<CountUp value={stay.priceFrom} locale="en-IN" />
          </span>{' '}
          / night
        </span>
        <span>·</span>
        <span>{stay.capacity}</span>
        <span>·</span>
        <span>{stay.minNights}</span>
      </div>

      <div className={styles.heroCtas}>
        <a href="/hold-a-date" className="btn btn-primary">
          Hold {stay.title} →
        </a>
        <a href="/stay" className="btn btn-ghost">
          Compare Other Stays
        </a>
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "Mango <em>House</em>", and wraps
 *  each word in a mask span so the headline can rise in word-by-word. */
function renderTitle(title: string) {
  const words = title.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.map((w, i) => (
        <span className={styles.heroWord} key={`${w}-${i}`}>
          <span className={styles.heroWordInner}>{w}</span>
        </span>
      ))}{' '}
      <span className={styles.heroWord}>
        <span className={styles.heroWordInner}>
          <em>{last}</em>
        </span>
      </span>
    </>
  )
}
