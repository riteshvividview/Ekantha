'use client'

import { Fragment, useEffect, useRef } from 'react'
import type { Event } from '@/payload-types'
import { gsap } from '@/lib/animations/gsap'
import styles from './events.module.css'

/**
 * The invitation moment: the monogram badge drops in first like a wax seal
 * being pressed, the headline rises word-by-word out of a mask (not the
 * page-wide flat `.reveal` fade), then the sub-line, CTAs, and the scrolling
 * marquee of event types settle in after — the whole sequence reading like
 * an invitation being opened rather than a page just loading.
 */
export function Hero({ data }: { data: Event['hero'] }) {
  const marqueeItems = data.marqueeItems ?? []
  // Doubled so the 26s CSS marquee (translateX(-50%)) loops seamlessly.
  const looped = [...marqueeItems, ...marqueeItems]
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    // Every ScrollTrigger-driven tween lives inside this one gsap.context()
    // call, cleaned up via ctx.revert() — see redesign brief point 3.
    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap.from(section.querySelectorAll(`.${styles.evHeroBadge}`), {
        opacity: 0,
        y: -14,
        rotate: -8,
        duration: 0.7,
        ease: 'back.out(2)',
      })

      const words = section.querySelectorAll(`.${styles.evHeroWordInner}`)
      if (words.length) {
        gsap.from(words, {
          yPercent: 120,
          duration: 1,
          ease: 'power4.out',
          stagger: 0.06,
          delay: 0.15,
        })
      }

      gsap.from(section.querySelectorAll(`.${styles.evHeroSub}, .${styles.evHeroCtas}`), {
        opacity: 0,
        y: 18,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.09,
        delay: 0.5,
      })

      gsap.from(section.querySelectorAll(`.${styles.marquee}`), {
        opacity: 0,
        duration: 0.9,
        ease: 'power2.out',
        delay: 0.7,
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.evHero} id="top" ref={sectionRef}>
      <div className={styles.evHeroInner}>
        <div className={styles.evHeroBadge}>
          <span className="dot">{data.badgeMonogram}</span>
          {data.badgeLabel}
        </div>

        <h1 className={`display-xl ${styles.evHeroHeadline}`}>{renderHeadline(data.headline)}</h1>

        <p className={styles.evHeroSub}>{data.sub}</p>

        <div className={styles.evHeroCtas}>
          {data.primaryCtaHref && (
            <a href={data.primaryCtaHref} className={`btn ${styles.btnWhite}`}>
              {data.primaryCtaLabel}
            </a>
          )}
          {data.secondaryCtaHref && (
            <a href={data.secondaryCtaHref} className={`btn ${styles.btnOutline}`}>
              {data.secondaryCtaLabel}
            </a>
          )}
        </div>
      </div>

      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {looped.map((item, i) => (
            <span key={i}>{item.text}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Wraps each word in an overflow-hidden mask span (so it can rise in
 *  word-by-word) and italicizes the last word, matching "Host It <em>Here.</em>" */
function renderHeadline(headline: string) {
  const words = headline.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.map((w, i) => (
        // Each word needs its own trailing space inside the same fragment —
        // a single {' '} placed after the whole .map() only separates the
        // last mapped word from `last`, leaving multiple earlier words (e.g.
        // "Host" + "It") glued together with no space between their masks.
        <Fragment key={`${w}-${i}`}>
          <span className={styles.evHeroWord}>
            <span className={styles.evHeroWordInner}>{w}</span>
          </span>{' '}
        </Fragment>
      ))}
      {last && (
        <span className={styles.evHeroWord}>
          <span className={styles.evHeroWordInner}>
            <em>{last}</em>
          </span>
        </span>
      )}
    </>
  )
}
