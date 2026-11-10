'use client'

import { Fragment, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Event } from '@/payload-types'
import { assetUrl } from '@/lib/assetUrl'
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

      gsap.from(section.querySelectorAll(`.${styles.evArch}`), { opacity: 0, y: 30, duration: 1.1, ease: 'power3.out', delay: 0.25 })
      gsap.from(section.querySelectorAll(`.${styles.evNote}`), { opacity: 0, y: 16, duration: 0.8, ease: 'power3.out', stagger: 0.12, delay: 0.8 })
      gsap.from(section.querySelectorAll(`.${styles.evDecor}`), { opacity: 0, duration: 1.2, ease: 'power2.out', delay: 0.6 })
      // String-light bulbs glow gently, each on its own beat.
      section.querySelectorAll(`.${styles.evBulb}`).forEach((bulb, i) => {
        gsap.to(bulb, { opacity: 0.45, duration: 1.6 + (i % 3) * 0.4, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: i * 0.15 })
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
      <div className={styles.evHeroGrid}>
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

      <div className={styles.evHeroVisual} aria-hidden="true">
        {/* Festoon string lights draped across the top of the scene. */}
        <svg className={`${styles.evDecor} ${styles.evLights}`} viewBox="0 0 520 90" fill="none">
          <path d="M4 10 Q 130 78 260 40 T 516 18" className={styles.evWire} />
          {BULBS.map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <line x1="0" y1="0" x2="0" y2="9" className={styles.evWire} />
              <circle cx="0" cy="15" r="9" className={styles.evBulbHalo} />
              <circle cx="0" cy="15" r="5" className={styles.evBulb} />
            </g>
          ))}
        </svg>

        <div className={styles.evArch}>
          <Image src={assetUrl('/images/site/events-preview-a-setting-for-every-occasion-4.jpg')} alt="" fill sizes="(max-width: 900px) 90vw, 42vw" quality={90} style={{ objectFit: 'cover' }} priority />
        </div>

        {/* Dotted ring behind the arch and a sprig of leaves at its foot. */}
        <svg className={`${styles.evDecor} ${styles.evRing}`} viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="96" />
        </svg>
        <svg className={`${styles.evDecor} ${styles.evSprig}`} viewBox="0 0 120 120" fill="none">
          <path d="M14 110 C 40 80, 62 54, 104 12" />
          <path d="M40 80 C 26 72, 22 58, 30 48 C 42 54, 46 68, 40 80 Z" />
          <path d="M58 58 C 70 46, 84 44, 92 50 C 84 62, 70 64, 58 58 Z" />
          <path d="M74 38 C 64 26, 64 14, 70 6 C 80 14, 82 28, 74 38 Z" />
        </svg>

        <div className={`${styles.evNote} ${styles.evNoteA}`}>
          <strong>Up to 200</strong>
          <span>guests on the lawns</span>
        </div>
        <div className={`${styles.evNote} ${styles.evNoteB}`}>
          <strong>One event</strong>
          <span>per day, the estate is yours</span>
        </div>
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

/** Bulb positions along the festoon wire (viewBox 520 x 90). */
const BULBS: [number, number][] = [
  [52, 30],
  [104, 46],
  [156, 54],
  [208, 50],
  [260, 40],
  [312, 30],
  [364, 25],
  [416, 22],
  [468, 20],
]
