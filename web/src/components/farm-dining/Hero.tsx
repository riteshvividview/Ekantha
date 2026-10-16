'use client'

import { useEffect, useRef } from 'react'
import type { FarmDining } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'
import styles from './farm-dining.module.css'

/**
 * Farm Dining's own hero mood: dusk at the long table. Two slow, breathing
 * amber glows sit behind the copy like firelight catching at the edge of
 * vision, the backdrop photo creeps into a very slow zoom as you scroll
 * (embers settling, not a hard pan), and the badge/headline/sub/facts/ctas
 * rise in one unhurried stagger — nothing snappy, this is a page about
 * slowing down for a shared meal.
 */
export function Hero({ data }: { data: FarmDining['hero'] }) {
  const image = resolveMedia(data.image)
  const facts = data.facts ?? []
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    // Every ScrollTrigger-driven tween for this component lives inside this
    // one gsap.context() call, cleaned up via ctx.revert() — a tween left
    // outside it would survive React Strict Mode's dev double-invoke as a
    // second, orphaned instance racing the first on the same elements.
    const ctx = gsap.context(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (!reduced) {
        gsap.from(section.querySelectorAll(`.${styles.fdHeroBadge}, .${styles.fdHeroHeadline}, .${styles.fdHeroSub}, .${styles.fdHeroFacts}, .${styles.fdHeroCtas}`), {
          opacity: 0,
          y: 22,
          duration: 1,
          ease: 'power3.out',
          stagger: 0.1,
        })

        gsap.from(section.querySelectorAll(`.${styles.fdHeroVisual}`), {
          opacity: 0,
          scale: 0.97,
          duration: 1.1,
          ease: 'power3.out',
          delay: 0.1,
        })

        const img = section.querySelector(`.${styles.fdHeroVisual} img`)
        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.06 },
            {
              scale: 1.16,
              ease: 'none',
              scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
            },
          )
        }

        gsap.to(section.querySelectorAll(`.${styles.fdHeroEmberA}`), {
          x: 24,
          y: -18,
          scale: 1.08,
          duration: 7,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
        })
        gsap.to(section.querySelectorAll(`.${styles.fdHeroEmberB}`), {
          x: -20,
          y: 16,
          scale: 1.12,
          duration: 9,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: 0.4,
        })
      }
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.fdHero} id="top" ref={sectionRef}>
      <div className={styles.fdHeroEmberA} aria-hidden="true" />
      <div className={styles.fdHeroEmberB} aria-hidden="true" />

      <div className={styles.fdHeroText}>
        <div className={styles.fdHeroBadge}>
          <span className="dot">{data.badgeMonogram}</span>
          {data.badgeLabel}
        </div>

        <h1 className={`display-xl ${styles.fdHeroHeadline}`}>{renderHeadline(data.headline)}</h1>

        <p className={styles.fdHeroSub}>{data.sub}</p>

        <div className={styles.fdHeroFacts}>
          {facts.map((fact, i) => (
            <span key={fact.id ?? i} dangerouslySetInnerHTML={{ __html: fact.text }} />
          ))}
        </div>

        <div className={styles.fdHeroCtas}>
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

      <div className={styles.fdHeroVisual}>{image.url && <img src={image.url} alt={image.alt} loading="lazy" />}</div>
    </section>
  )
}

/** Italicizes everything after the first comma, matching
 *  "Dinner, <em>Under Bamboo.</em>" */
function renderHeadline(headline: string) {
  const commaIndex = headline.indexOf(',')
  if (commaIndex === -1) return headline
  const before = headline.slice(0, commaIndex + 1)
  const after = headline.slice(commaIndex + 1).trim()
  return (
    <>
      {before} <em>{after}</em>
    </>
  )
}
