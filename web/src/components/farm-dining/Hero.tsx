'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { FarmDining } from '@/payload-types'
import { resolveMedia } from '@/lib/realMedia'
import { gsap } from '@/lib/animations/gsap'
import { Toast, MangoSprig, Conversation, Icon } from '../illustrations/Line'
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
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.from(section.querySelectorAll(`.${styles.fdHeroText} > *`), { opacity: 0, y: 22, duration: 0.9, ease: 'power3.out', stagger: 0.08 })
      gsap.from(section.querySelectorAll(`.${styles.fdHeroVisual}, .${styles.fdHeroNote}`), { opacity: 0, y: 24, duration: 1, ease: 'power3.out', stagger: 0.15, delay: 0.2 })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.fdHero} id="top" ref={sectionRef}>

      <div className={styles.fdHeroText}>
        <div className={styles.fdHeroBadge}>
          <span className="dot">{data.badgeMonogram}</span>
          {data.badgeLabel}
        </div>

        <h1 className={`display-xl ${styles.fdHeroHeadline}`}>{renderHeadline(data.headline)}<span className={styles.fdHeroEmoji} aria-hidden="true">🎋</span></h1>

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

      <div className={styles.fdHeroArt}>
      <div className={styles.fdHeroVisual}>{image.url && <Image src={image.url} alt={image.alt} fill sizes="(max-width: 900px) 92vw, 45vw" quality={90} style={{ objectFit: 'cover' }} priority />}
      </div>
      <div className={styles.fdHeroNote} aria-hidden="true">
        <Toast className={styles.fdHeroNoteSvg} />
        <span><strong>Seasonal table</strong>The menu follows what the farm grew that week.</span>
      </div>
      </div>
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
