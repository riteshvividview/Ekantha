'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/animations/gsap'
import { assetUrl } from '@/lib/assetUrl'
import styles from './Why.module.css'

// WHY LOCAL IMAGES — BEGIN (set entries to null to restore gradient placeholders)
const IMAGES: Record<string, string | null> = {
  land: assetUrl('/images/home/03-why-us/Untouched-Land-img.png'),
  private: assetUrl('/images/home/03-why-us/Just-For-You-img.png'),
  planned: assetUrl('/images/home/03-why-us/Throughtfully-planned-img.png'),
  away: assetUrl('/images/home/03-why-us/Hrs-away-img-two.webp'),
}
// WHY LOCAL IMAGES — END

const REASONS = [
  {
    key: 'land',
    num: '01',
    icon: 'fa-seedling',
    title: 'Untouched Land',
    text: 'Open fields and old trees, exactly as they were.',
    span: 'wide',
  },
  {
    key: 'private',
    num: '02',
    icon: 'fa-lock',
    title: 'Just For You',
    text: 'The whole estate, held for your group alone.',
    span: 'narrow',
  },
  {
    key: 'planned',
    num: '03',
    icon: 'fa-compass',
    title: 'Thoughtfully Planned',
    text: 'Every detail settled before you arrive.',
    span: 'narrow',
  },
  {
    key: 'away',
    num: '04',
    icon: 'fa-road',
    title: '2.5 Hrs Away',
    text: 'Far enough to forget, near enough to reach.',
    span: 'wide',
  },
] as const

const MARQUEE = ['Untouched', 'Private', 'Unhurried', 'Yours']

export function Why() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const q = <T extends Element = HTMLElement>(sel: string) => Array.from(section.querySelectorAll<T>(sel))

    const ctx = gsap.context(() => {
      if (reduced) return

      gsap.fromTo(
        q('[data-marquee]'),
        { xPercent: 4 },
        {
          xPercent: -30,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )

      gsap.from(q('[data-line-inner]'), {
        yPercent: 115,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.14,
        scrollTrigger: { trigger: q('[data-headline]')[0], start: 'top 82%', once: true },
      })
      gsap.from(q('[data-fade]'), {
        opacity: 0,
        y: 20,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: q('[data-headline]')[0], start: 'top 86%', once: true },
      })

      // Mobile cards stack full-width in a single column (see the
      // max-width: 860px rules in Why.module.css), so two adjacent cards
      // drifting ±26px toward each other can close the gap between them
      // and visibly overlap — desktop's wide/narrow grid has the room for
      // the full swing, a single stacked column doesn't. Same effect,
      // just turned down rather than off.
      const isMobile = window.matchMedia('(max-width: 860px)').matches
      q('[data-card]').forEach((card) => {
        const speed = Number(card.dataset.speed ?? 0) * (isMobile ? 0.3 : 1)
        gsap.fromTo(
          card,
          { y: speed },
          {
            y: -speed,
            ease: 'none',
            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
        gsap.from(card, {
          clipPath: 'inset(14% 10% 14% 10% round 24px)',
          opacity: 0,
          duration: 1.3,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
        })
        const inner = card.querySelector('[data-inner]')
        if (inner) {
          gsap.fromTo(
            inner,
            { yPercent: -7 },
            {
              yPercent: 7,
              ease: 'none',
              scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          )
        }
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.why} id="why" ref={sectionRef}>
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack} data-marquee>
          {[...MARQUEE, ...MARQUEE, ...MARQUEE].map((w, i) => (
            <span className={styles.marqueeItem} key={i}>
              {w}
              <i className={`fa-solid fa-leaf ${styles.marqueeIcon}`} />
            </span>
          ))}
        </div>
      </div>

      <header className={styles.head}>
        <p className={styles.eyebrow} data-fade>
          <span className={styles.eyebrowDash} />
          Why Vana Ekantha
        </p>
        <h2 className={styles.headline} data-headline>
          {['Why guests', 'come back.'].map((line) => (
            <span className={styles.line} key={line}>
              <span className={styles.lineInner} data-line-inner>
                {line}
              </span>
            </span>
          ))}
        </h2>
        <p className={styles.sub} data-fade>
          Four reasons, none of them printed on a brochure.
        </p>
      </header>

      <ul className={styles.grid}>
        {REASONS.map((r, i) => {
          const src = IMAGES[r.key]
          return (
            <li
              className={`${styles.card} ${styles[r.span]} ${styles[`tone_${r.key}`]}`}
              data-card
              data-speed={i % 2 === 0 ? 26 : -26}
              key={r.key}
            >
              <div className={styles.media}>
                {/* data-inner (GSAP's continuous scroll-scrub target) and
                    the hover-zoom (.mediaZoom, a plain CSS transition) are
                    deliberately two separate elements — see the note on
                    .mediaZoom in Why.module.css for why combining them
                    broke the scroll parallax. */}
                <div className={styles.mediaInner} data-inner>
                  <div className={styles.mediaZoom}>
                    {src ? (
                      <Image src={src} alt="" fill sizes="(max-width: 860px) 100vw, 58vw" />
                    ) : (
                      <i className={`fa-solid ${r.icon} ${styles.watermark}`} aria-hidden="true" />
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.shade} aria-hidden="true" />

              <span className={styles.num}>{r.num}</span>
              <span className={styles.icon} aria-hidden="true">
                <i className={`fa-solid ${r.icon}`} />
              </span>

              <div className={styles.info}>
                <h3 className={styles.title}>{r.title}</h3>
                <p className={styles.text}>{r.text}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
