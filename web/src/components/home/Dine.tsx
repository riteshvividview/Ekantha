'use client'

import { useEffect, useRef } from 'react'
import type { Home } from '@/payload-types'
import { resolveMediaSize } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'
import styles from './home.module.css'

const BASE_OPACITY = 0.1
const BASE_ROTATION = 6
const BLUR_STRENGTH = 4

export function Dine({ data }: { data: Home['dine'] }) {
  const media = resolveMediaSize(data.image, 'hero')
  const trackRef = useRef<HTMLDivElement>(null)

  // The dark bamboo photo is a plain CSS `position: sticky` layer (see
  // .dineBg / .dineSticky below) — it holds in place behind the text for
  // as long as the section is scrolling past, then releases naturally,
  // no JS pinning involved. The text itself is normal in-flow content on
  // top of it: it scrolls at the ordinary page speed and exits upward out
  // of the section like everything else, while ScrollReveal (ported onto
  // the shared GSAP/ScrollTrigger pipeline already bridged to Lenis) runs
  // its un-rotate + per-word un-blur/fade-in across the whole block —
  // eyebrow, paragraph, title, and CTA together — as it passes through.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined

    const words = track.querySelectorAll<HTMLElement>('[data-word]')

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(track, { rotate: 0 })
      gsap.set(words, { opacity: 1, filter: 'blur(0px)' })
      return undefined
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        track,
        { transformOrigin: '50% 0%', rotate: BASE_ROTATION },
        {
          rotate: 0,
          ease: 'none',
          scrollTrigger: { trigger: track, start: 'top bottom', end: 'top top', scrub: true },
        },
      )

      // Each word gets its own scroll-linked trigger, tied to *its own*
      // position rather than one timeline stretched across the whole
      // (very tall) block — otherwise, on a long paragraph, the whole
      // reveal finishes while most of the text is still off-screen and
      // you never actually see it happen. This way every word visibly
      // un-blurs and fades in right as it crosses into the readable band
      // near the bottom of the viewport, however long the copy is.
      words.forEach((word) => {
        gsap.fromTo(
          word,
          { opacity: BASE_OPACITY, filter: `blur(${BLUR_STRENGTH}px)` },
          {
            opacity: 1,
            filter: 'blur(0px)',
            ease: 'none',
            scrollTrigger: { trigger: word, start: 'top 92%', end: 'top 55%', scrub: true },
          },
        )
      })
    }, track)

    return () => ctx.revert()
  }, [])

  // The sticky background must sit below the sticky navbar, not behind
  // it — measure the navbar's real rendered height and expose it as a CSS
  // var the sticky layer's `top` / `height` read from, kept in sync on
  // resize since the navbar's own height is responsive.
  useEffect(() => {
    const navbar = document.querySelector<HTMLElement>('.ve-navbar')
    if (!navbar) return undefined

    const setVar = () => {
      document.documentElement.style.setProperty('--dine-navbar-h', `${navbar.offsetHeight}px`)
    }
    setVar()

    const resizeObserver = new ResizeObserver(setVar)
    resizeObserver.observe(navbar)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <section id="dine" className={`${styles.dineSection} bg-black`}>
      <div className={styles.dineBg}>
        {media.url && <img src={media.url} alt={media.alt} loading="lazy" />}
        <div className={styles.dineGlare} />
        <div className={styles.dineBgVeil} />
      </div>

      <div className={styles.dineCentered} ref={trackRef}>
        {data.eyebrow && <span className="eyebrow">{splitWords(data.eyebrow)}</span>}

        <div className={styles.dineBody}>
          <p>{splitWords(data.body)}</p>
        </div>

        <div className={styles.dineFooter}>
          <h2 className={`section-title ${styles.dineHeading}`}>{renderTitle(data.heading)}</h2>
          {data.ctaHref && (
            <a href={data.ctaHref} className="btn btn-on-dark">
              {splitWords(data.ctaLabel ?? '')}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

function renderTitle(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {splitWords(words.join(' '))} <em data-word className={styles.dineWord}>{last}</em>
    </>
  )
}

function splitWords(text: string) {
  return text.split(/(\s+)/).map((word, i) =>
    /^\s+$/.test(word) ? (
      word
    ) : (
      <span data-word className={styles.dineWord} key={i}>
        {word}
      </span>
    ),
  )
}
