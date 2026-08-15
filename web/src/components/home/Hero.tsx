'use client'

import { useEffect, useRef } from 'react'
import type { Home } from '@/payload-types'
import { resolveMediaSize } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'
import styles from './home.module.css'

export function Hero({ data }: { data: Home['hero'] }) {
  const heroRef = useRef<HTMLElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const bg = resolveMediaSize(data.backgroundImage, 'hero')

  // Hero parallax — the background image drifts slower than scroll, the
  // content fades/lifts away as you leave the hero. Same effect as the
  // source HTML's hand-rolled rAF scroll listener, reimplemented as a
  // scrubbed GSAP/ScrollTrigger tween so it shares one animation driver
  // with everything else on the page (and stays in sync with Lenis).
  useEffect(() => {
    if (!heroRef.current || !imgRef.current || !contentRef.current) return

    const ctx = gsap.context(() => {
      gsap.to(imgRef.current, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to(contentRef.current, {
        yPercent: -14,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    }, heroRef)

    // ctx.revert() alone tears down every tween/ScrollTrigger created
    // inside gsap.context above — no need to also hunt for and kill them
    // manually (and doing so would mean reading heroRef.current inside
    // the cleanup, which lint correctly flags as unsafe).
    return () => ctx.revert()
  }, [])

  return (
    // data-nav-hero: toggles the transparent-over-hero nav treatment — see Navbar.tsx
    <section className={styles.hero} id="top" ref={heroRef} data-nav-hero>
      <div className={styles.heroMedia} aria-hidden="true">
        {bg.url && <img ref={imgRef} src={bg.url} alt="" />}
      </div>
      <div className={styles.heroOverlay} aria-hidden="true" />

      <div className={styles.heroContent} ref={contentRef}>
        <div className={`${styles.heroBadge} reveal`}>
          <span className={styles.dot}>{data.badgeMonogram}</span>
          {data.badgeLabel}
        </div>

        <h1 className="display-xl reveal">{renderHeadline(data.headline)}</h1>

        <p className={`${styles.heroSub} reveal`}>{data.sub}</p>

        <div className={`${styles.heroRating} reveal`}>
          <span className={styles.stars} aria-hidden="true">
            ★★★★★
          </span>
          <span className={styles.ratingText}>{data.ratingText}</span>
        </div>

        <div className={`${styles.heroCtas} reveal`}>
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
    </section>
  )
}

/** The last word of the headline is italicized, matching the source
 *  HTML's "A Farmstay For Intentional <em>Disconnection</em>" pattern. */
function renderHeadline(headline: string) {
  const words = headline.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
