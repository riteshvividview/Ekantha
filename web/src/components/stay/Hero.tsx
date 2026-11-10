'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { StayPage } from '@/payload-types'
import { gsap } from '@/lib/animations/gsap'
import { assetUrl } from '@/lib/assetUrl'
import styles from './stay.module.css'

/** Mango House (gallery-preview-stone-*), Stone House (-mango-*), the estate. */
const HOUSES = [
  { name: 'Mango House', note: 'for two', src: '/images/site/gallery-preview-stone-hero.jpg' },
  { name: 'Stone House', note: 'for a few', src: '/images/site/gallery-preview-mango-hero.jpg' },
  { name: 'Full House', note: 'for everyone', src: '/images/site/why-us-hrs-away-img-two.jpg' },
]

/**
 * "Three ways to stay": three arched windows, one per house, joined by a
 * hand-drawn estate path. On load the copy and windows rise in; on scroll
 * the path draws itself between the houses, the pins drop in turn, and the
 * windows drift at their own gentle speeds over a line-art landscape.
 */
export function Hero({ data }: { data: StayPage['hero'] }) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const q = (sel: string) => section.querySelectorAll<HTMLElement>(sel)

    const ctx = gsap.context(() => {
      gsap.from(q('[data-fade]'), { opacity: 0, y: 22, duration: 0.9, ease: 'power3.out', stagger: 0.08 })
      gsap.from(q('[data-arch]'), { opacity: 0, y: 60, duration: 1.2, ease: 'power3.out', stagger: 0.14, delay: 0.15 })
      // The line-art landscape draws itself in on load, stroke by stroke.
      section.querySelectorAll<SVGGeometryElement>('[data-scenery] path, [data-scenery] circle').forEach((el, i) => {
        const len = el.getTotalLength()
        gsap.fromTo(el, { strokeDasharray: len, strokeDashoffset: len }, {
          strokeDashoffset: 0,
          duration: 1.6,
          ease: 'power2.inOut',
          delay: 0.35 + i * 0.12,
          onComplete: () => { gsap.set(el, { clearProps: 'strokeDasharray,strokeDashoffset' }) },
        })
      })

      const scrub = { trigger: section, start: 'top top', end: 'bottom 30%', scrub: 0.6 }

      // The estate path draws itself in on load, from Mango House up to the sun.
      const path = section.querySelector<SVGPathElement>('[data-path]')
      if (path) {
        const len = path.getTotalLength()
        gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, {
          strokeDashoffset: 0,
          duration: 2.4,
          ease: 'power2.inOut',
          delay: 0.6,
          onComplete: () => { gsap.set(path, { clearProps: 'strokeDasharray,strokeDashoffset' }) },
        })
      }
      q('[data-pin]').forEach((pin, i) => {
        gsap.fromTo(pin, { scale: 0, transformOrigin: '50% 100%' }, {
          scale: 1,
          ease: 'back.out(2)',
          scrollTrigger: { trigger: section, start: `top+=${i * 90} top`, end: `top+=${i * 90 + 120} top`, scrub: 0.6 },
        })
      })

      // Windows drift at different speeds; the sun sinks slightly.
      q('[data-arch]').forEach((arch, i) => {
        gsap.to(arch, { y: [-40, -90, -20][i] ?? -40, ease: 'none', scrollTrigger: scrub })
      })
      gsap.to(q('[data-sun]'), { y: 50, ease: 'none', scrollTrigger: scrub })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.sHero} id="top" ref={sectionRef}>
      <div className={styles.sHeroCopy}>
        <div className={styles.heroBadge} data-fade>
          <span className={styles.dot}>{data.badgeMonogram}</span>
          {data.badgeLabel}
        </div>

        <h1 className={`display-xl ${styles.heroHeadline}`} data-fade>
          {renderHeadline(data.headline)}
        </h1>

        <p className={styles.heroSub} data-fade>
          {data.sub}
        </p>

        <div className={styles.heroRating} data-fade>
          <span className={styles.stars} aria-hidden="true">
            ★★★★★
          </span>
          <span className={styles.ratingText}>{data.ratingText}</span>
        </div>

        <div className={styles.heroCtas} data-fade>
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
      </div>

      <div className={styles.sHeroScene} aria-hidden="true">
        {/* Line-art landscape behind the windows. */}
        <svg className={styles.sScenery} viewBox="0 0 600 520" fill="none" data-scenery>
          <g data-sun>
            <circle cx="470" cy="110" r="46" className={styles.sAccent} />
            <circle cx="470" cy="110" r="66" className={styles.sAccent} strokeDasharray="2 8" />
          </g>
          <path d="M0 400 C 90 350, 170 360, 250 392 S 430 350, 600 380" />
          <path d="M0 450 C 120 420, 260 430, 340 452 S 500 432, 600 444" />
          <path d="M80 90 q 8 -8 16 0 q 8 -8 16 0 M 130 60 q 6 -6 12 0 q 6 -6 12 0" />
          <path d="M40 470 V 420 M 40 384 C 22 392, 22 418, 40 420 C 58 418, 58 392, 40 384 Z" />
          <path d="M560 470 V 410 M 560 360 L 538 410 H 582 Z" />
        </svg>

        {/* Estate path linking the three houses, drawn on scroll. */}
        <svg className={styles.sPath} viewBox="0 0 600 520" fill="none" preserveAspectRatio="none">
          <path data-path d="M70 480 C 120 420, 90 340, 150 300 S 260 330, 300 260 S 380 150, 460 190 S 560 240, 540 140" />
        </svg>

        {HOUSES.map((h, i) => (
          <figure className={`${styles.sArch} ${styles[`sArch${i}`]}`} data-arch key={h.name}>
            <div className={styles.sArchPhoto}>
              <Image src={assetUrl(h.src)} alt="" fill sizes="(max-width: 900px) 34vw, 18vw" quality={90} style={{ objectFit: 'cover' }} priority={i === 0} />
            </div>
            <figcaption>
              <svg className={styles.sPin} viewBox="0 0 24 30" data-pin>
                <path d="M12 29 C 12 29, 22 18, 22 11 A 10 10 0 1 0 2 11 C 2 18, 12 29, 12 29 Z" />
                <circle cx="12" cy="11" r="3.5" />
              </svg>
              <strong>{h.name}</strong>
              <span>{h.note}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

/** "Choose Your Stay\nAt Vana Ekantha" → line break on `\n`, "Stay" italic. */
function renderHeadline(headline: string) {
  const lines = headline.split('\n')
  return lines.map((line, i) => (
    <span className={styles.heroLine} key={i}>
      {i === 0 ? renderFirstLine(line) : line}
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
