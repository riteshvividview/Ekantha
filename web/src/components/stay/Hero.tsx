'use client'

import { useEffect, useRef } from 'react'
import type { StayPage } from '@/payload-types'
import { gsap, ScrollTrigger } from '@/lib/animations/gsap'
import styles from './stay.module.css'

/**
 * Hero's own bespoke motion concept: three soft drifting orbs (the three
 * stays, abstracted — not illustrated) floating at different depths behind
 * the copy, each line of the headline rising out of its own mask, and the
 * background photograph scrubbing a slow parallax + settle-zoom instead of
 * sitting static. This drifting-orb language is intentionally unique to
 * the hero — no other section on this page reuses it — matching the
 * client's "every section should feel distinct" brief.
 */
export function Hero({ data }: { data: StayPage['hero'] }) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const q = <T extends Element = HTMLElement>(sel: string) => Array.from(section.querySelectorAll<T>(sel))

    const ctx = gsap.context(() => {
      // Background photograph: slow settle-zoom on load, then a gentle
      // continuous parallax drift for as long as the hero is on screen.
      gsap.fromTo(
        q('[data-bgimg]'),
        { scale: 1.12, yPercent: -4 },
        { scale: 1, yPercent: 0, duration: 1.8, ease: 'power3.out' },
      )
      gsap.to(q('[data-bgimg]'), {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
      })

      // Three drifting orbs, each at its own depth/speed, with a slow
      // idle float layered on top of the scroll-scrub so they never feel
      // perfectly static even before the user scrolls.
      q<HTMLElement>('[data-orb]').forEach((orb) => {
        const depth = Number(orb.dataset.orb) || 1
        gsap.to(orb, {
          yPercent: -18 * depth,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
        })
        gsap.to(orb, {
          x: 14 * depth,
          duration: 5 + depth,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        })
      })

      // Badge breathes in first…
      gsap.from(q('[data-badge]'), { opacity: 0, y: 14, duration: 0.8, ease: 'power3.out' })

      // …then each headline line rises up out of its own overflow-hidden
      // mask, staggered.
      gsap.from(q('[data-line-inner]'), {
        yPercent: 115,
        duration: 1.15,
        ease: 'power4.out',
        stagger: 0.12,
        delay: 0.15,
      })

      // Sub copy, rating and CTAs settle in after the headline.
      gsap.from(q('[data-fade]'), {
        opacity: 0,
        y: 20,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        delay: 0.55,
      })

      ScrollTrigger.refresh()
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.hero} id="top" ref={sectionRef}>
      <div className={styles.heroBg} data-bgimg aria-hidden="true" />
      <div className={styles.heroOrb} data-orb="1.4" aria-hidden="true" />
      <div className={`${styles.heroOrb} ${styles.heroOrbB}`} data-orb="2.1" aria-hidden="true" />
      <div className={`${styles.heroOrb} ${styles.heroOrbC}`} data-orb="0.9" aria-hidden="true" />

      <div className={styles.heroBadge} data-badge>
        <span className={styles.dot}>{data.badgeMonogram}</span>
        {data.badgeLabel}
      </div>

      <h1 className={`display-xl ${styles.heroHeadline}`}>{renderHeadline(data.headline)}</h1>

      <p className={`${styles.heroSub} ${styles.fade}`} data-fade>
        {data.sub}
      </p>

      <div className={`${styles.heroRating} ${styles.fade}`} data-fade>
        <span className={styles.stars} aria-hidden="true">
          ★★★★★
        </span>
        <span className={styles.ratingText}>{data.ratingText}</span>
      </div>

      <div className={`${styles.heroCtas} ${styles.fade}`} data-fade>
        {data.primaryCtaHref && (
          <a href={data.primaryCtaHref} className="btn btn-primary">
            {data.primaryCtaLabel}
          </a>
        )}
        {data.secondaryCtaHref && (
          <a href={data.secondaryCtaHref} className="btn btn-ghost">
            {data.secondaryCtaLabel}
          </a>
        )}
      </div>
    </section>
  )
}

/** "Choose Your Stay\nAt Vana Ekantha" → line break on `\n`, each line
 *  wrapped in an overflow-hidden mask for the rise-up reveal, italicizes
 *  "Stay" only, matching "Choose Your <em>Stay</em><br>At Vana Ekantha" */
function renderHeadline(headline: string) {
  const lines = headline.split('\n')
  return lines.map((line, i) => (
    <span className={styles.heroLine} key={i}>
      <span className={styles.heroLineInner} data-line-inner>
        {i === 0 ? renderFirstLine(line) : line}
      </span>
    </span>
  ))
}

function renderFirstLine(line: string) {
  const words = line.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
