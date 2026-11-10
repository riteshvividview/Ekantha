'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Stay } from '@/payload-types'
import { resolveMediaSize } from '@/lib/realMedia'
import { CountUp } from '@/components/shared/CountUp'
import { gsap, ScrollTrigger } from '@/lib/animations/gsap'
import styles from './stay-detail.module.css'

/**
 * Stay detail hero, shared by Mango, Stone and Full House: a full-bleed
 * photo, an editorial title anchored bottom-left, a tilted postcard of a
 * second photo, and a hand-drawn branch that sketches itself in. Each house
 * leaves the hero differently on scroll so the pages don't repeat:
 *  - mango: the hero pins and the next section slides up over it.
 *  - stone: the photo shrinks into a rounded frame as you scroll away.
 *  - full:  the photo drifts slower than the page (parallax) while a
 *           curtain wipes the content up.
 */
export type HeroExit = 'mango' | 'stone' | 'full'

export function Hero({ stay, badgeNumber, exit = 'mango' }: { stay: Stay; badgeNumber: string; showBg?: boolean; exit?: HeroExit }) {
  const bg = resolveMediaSize(stay.heroImage, 'hero')
  const card = resolveMediaSize(stay.gallery?.[1]?.image ?? stay.gallery?.[0]?.image, 'card')
  const cardCaption = stay.gallery?.[1]?.caption ?? stay.gallery?.[0]?.caption
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined
    const q = (sel: string) => section.querySelectorAll<HTMLElement>(sel)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let covered: HTMLElement | null = null
    let coveredStyle = ''
    const ctx = gsap.context(() => {
      if (reduced) return

      const intro = gsap.timeline({ defaults: { ease: 'power4.out' } })
      intro
        .from(q(`.${styles.heroWordInner}`), { yPercent: 115, duration: 1.2, stagger: 0.08 }, 0.15)
        .from(q('[data-hero-fade]'), { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, 0.45)
        .from(q(`.${styles.heroCard}`), { y: 80, rotate: 14, opacity: 0, duration: 1.4 }, 0.35)

      q(`.${styles.heroBranch} path`).forEach((path, i) => {
        const length = (path as unknown as SVGPathElement).getTotalLength()
        gsap.fromTo(
          path,
          { strokeDasharray: length, strokeDashoffset: length },
          { strokeDashoffset: 0, duration: 1.8, delay: 0.5 + i * 0.12, ease: 'power2.inOut' },
        )
      })

      const scrub = { trigger: section, start: 'top top', end: 'bottom top', scrub: true }
      const media = q(`.${styles.heroMedia}`)
      gsap.to(q(`.${styles.heroCue}`), { opacity: 0, ease: 'none', scrollTrigger: { ...scrub, end: '15% top' } })

      if (exit === 'mango') {
        // Pin and cover: the hero holds still while the next section rises
        // over it, its own layers drifting apart for depth.
        ScrollTrigger.create({ trigger: section, start: 'top top', end: 'bottom top', pin: true, pinSpacing: false })
        gsap.to(q(`.${styles.heroContent}`), { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: scrub })
        gsap.to(q(`.${styles.heroCard}`), { yPercent: -40, rotate: -2, ease: 'none', scrollTrigger: scrub })
        gsap.to(q(`.${styles.heroBranch}`), { yPercent: -60, ease: 'none', scrollTrigger: scrub })
        gsap.to(media, { scale: 1.08, filter: 'brightness(0.55)', ease: 'none', scrollTrigger: scrub })

        // Pinning wraps the hero in GSAP's .pin-spacer, so look past it.
        const wrapper = section.parentElement?.classList.contains('pin-spacer') ? section.parentElement : section
        covered = wrapper.nextElementSibling as HTMLElement | null
        if (covered) {
          coveredStyle = covered.getAttribute('style') ?? ''
          covered.style.position = 'relative'
          covered.style.zIndex = '2'
          covered.style.borderRadius = 'clamp(22px, 4vw, 40px) clamp(22px, 4vw, 40px) 0 0'
          covered.style.boxShadow = '0 -30px 60px rgba(29, 29, 27, 0.18)'
          if (getComputedStyle(covered).backgroundColor === 'rgba(0, 0, 0, 0)') covered.style.background = 'var(--white)'
        }
      } else if (exit === 'stone') {
        // The photo pulls back into a framed print, like stepping away from
        // a window; the copy settles out with it.
        gsap.fromTo(
          media,
          { clipPath: 'inset(0% 0% 0% 0% round 0px)' },
          { clipPath: 'inset(8% 6% 10% 6% round 28px)', scale: 0.96, ease: 'none', scrollTrigger: scrub },
        )
        gsap.to(q(`.${styles.heroContent}`), { y: 60, opacity: 0, ease: 'none', scrollTrigger: { ...scrub, end: '70% top' } })
        // Explicit start state: the intro has the card at opacity 0 when
        // this is created, and a plain .to() would record that as its start.
        gsap.fromTo(
          q(`.${styles.heroCard}`),
          { x: 0, opacity: 1 },
          { x: 120, opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { ...scrub, start: '20% top' } },
        )
        gsap.to(q(`.${styles.heroBranch}`), { opacity: 0, ease: 'none', scrollTrigger: scrub })
      } else {
        // Full House: the photo scrolls at half speed underneath the page
        // while the copy lifts away faster than the scroll.
        gsap.to(media, { yPercent: 30, ease: 'none', scrollTrigger: scrub })
        gsap.to(q(`.${styles.heroContent}`), { yPercent: -35, opacity: 0, ease: 'none', scrollTrigger: scrub })
        gsap.to(q(`.${styles.heroCard}`), { yPercent: -70, rotate: 2, ease: 'none', scrollTrigger: scrub })
        gsap.to(q(`.${styles.heroBranch}`), { yPercent: 40, ease: 'none', scrollTrigger: scrub })
      }

      // The postcard leans gently toward the cursor.
      const cardEl = q(`.${styles.heroCard}`)[0]
      if (cardEl && window.matchMedia('(hover: hover)').matches) {
        const rx = gsap.quickTo(cardEl, 'rotationY', { duration: 0.8, ease: 'power3' })
        const ry = gsap.quickTo(cardEl, 'rotationX', { duration: 0.8, ease: 'power3' })
        section.addEventListener('pointermove', (e) => {
          const r = section.getBoundingClientRect()
          rx(((e.clientX - r.left) / r.width - 0.5) * 16)
          ry(((e.clientY - r.top) / r.height - 0.5) * -12)
        })
      }
    }, section)

    return () => {
      ctx.revert()
      if (covered) covered.setAttribute('style', coveredStyle)
    }
  }, [exit])

  return (
    <section className={styles.hero} id="top" ref={sectionRef}>
      <div className={styles.heroMedia} aria-hidden="true">
        {bg.url && <Image src={bg.url} alt="" fill sizes="100vw" style={{ objectFit: 'cover' }} priority />}
        <div className={styles.heroScrim} />
      </div>

      <svg className={styles.heroBranch} viewBox="0 0 240 240" fill="none" aria-hidden="true">
        <path d="M228 14 C 176 54, 128 96, 34 222" />
        {LEAVES.map((d) => (
          <path key={d} d={d} />
        ))}
        <path d="M131 94 L 136 118" />
        <path d="M136 118 C 154 116, 162 140, 152 158 C 142 174, 122 168, 120 150 C 118 134, 124 120, 136 118 Z" />
      </svg>

      <p className={styles.heroCoords} aria-hidden="true">
        17°14′ N &nbsp;·&nbsp; 79°01′ E &nbsp;·&nbsp; Pittampally
      </p>

      {card.url && (
        <figure className={styles.heroCard} aria-hidden="true">
          <div className={styles.heroCardImg}>
            <Image src={card.url} alt="" fill sizes="(max-width: 900px) 0px, 300px" style={{ objectFit: 'cover' }} />
          </div>
          {cardCaption && <figcaption>{cardCaption}</figcaption>}
        </figure>
      )}

      <div className={styles.heroContent}>
        <div className={styles.heroBadge} data-hero-fade>
          <span className={styles.dot}>{badgeNumber}</span>
          {stay.heroBadgeLabel}
        </div>

        <h1 className={styles.heroHeadline}>{renderTitle(stay.title)}</h1>

        {stay.heroSub && (
          <p className={styles.heroSub} data-hero-fade>
            {stay.heroSub}
          </p>
        )}

        <div className={styles.heroFacts} data-hero-fade>
          <span>
            <strong>
              ₹<CountUp value={stay.priceFrom} locale="en-IN" />
            </strong>{' '}
            / night
          </span>
          <span>{stay.capacity}</span>
          <span>{stay.minNights}</span>
        </div>

        <div className={styles.heroCtas} data-hero-fade>
          <a href="/hold-a-date" className="btn btn-primary">
            Hold {stay.title} →
          </a>
          <a href="/stay" className={styles.heroGhost}>
            Compare Other Stays
          </a>
        </div>
      </div>

      <div className={styles.heroCue} aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
    </section>
  )
}

/** A leaf as two quadratic curves plus a midrib, growing from (x, y). */
function leaf(x: number, y: number, angle: number, length: number, width: number) {
  const a = (angle * Math.PI) / 180
  const dx = Math.cos(a)
  const dy = Math.sin(a)
  const tip = [x + dx * length, y + dy * length]
  const mid = [x + dx * length * 0.5, y + dy * length * 0.5]
  const n = [-dy * width, dx * width]
  const f = (v: number) => v.toFixed(1)
  return `M${f(x)} ${f(y)} Q${f(mid[0] + n[0])} ${f(mid[1] + n[1])} ${f(tip[0])} ${f(tip[1])} Q${f(mid[0] - n[0])} ${f(mid[1] - n[1])} ${f(x)} ${f(y)} M${f(x)} ${f(y)} L${f(x + dx * length * 0.85)} ${f(y + dy * length * 0.85)}`
}

const LEAVES = [
  leaf(196, 40, -30, 44, 11),
  leaf(178, 52, 70, 40, 10),
  leaf(150, 76, -55, 46, 12),
  leaf(112, 116, 110, 42, 11),
  leaf(92, 140, -10, 48, 12),
  leaf(68, 168, 135, 40, 10),
]

/** Italicizes the last word ("Mango <em>House</em>") and masks each word
 *  so the headline can rise in word by word. */
function renderTitle(title: string) {
  const words = title.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.map((w, i) => (
        <span key={`${w}-${i}`}>
          <span className={styles.heroWord}>
            <span className={styles.heroWordInner}>{w}</span>
          </span>{' '}
        </span>
      ))}
      <span className={styles.heroWord}>
        <span className={styles.heroWordInner}>
          <em>{last}</em>
        </span>
      </span>
    </>
  )
}
