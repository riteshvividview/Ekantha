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
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const tiltGroupRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  // The dark bamboo photo is a plain CSS `position: sticky` layer (see
  // .dineBg below) — it holds in place behind the text for as long as the
  // section is scrolling past, then releases naturally, no JS pinning
  // involved.
  //
  // Everything else — the text rising up from below, the eyebrow+paragraph
  // un-rotating, the paragraph's per-word un-blur/fade-in, and the footer
  // fading in only once that's basically finished — is driven by ONE
  // shared GSAP timeline/ScrollTrigger rather than several independent
  // ones. Per-word triggers computed from each word's own
  // getBoundingClientRect stop being reliable once their ancestor is
  // *also* being transformed by a separate scrub animation (the position
  // ScrollTrigger measures shifts out from under it every frame) — a
  // single timeline sidesteps that entirely by driving every property off
  // the same progress value. It also lets the rotation and the rise
  // resolve on the exact same 0→1 span, so the text is guaranteed to be
  // dead straight by the moment it settles into place. The footer sits
  // lower in the same block, so it's *positioned* by the same rise
  // regardless — but it stays invisible (a separate opacity fade, not
  // tied to position) until the paragraph reveal is nearly done, so it
  // never reads as "already arrived" while the text above it is still
  // visibly rotated/blurred. A long `end` spreads the whole sequence over
  // enough scroll distance to not feel like it's flying past.
  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    const tiltGroup = tiltGroupRef.current
    const body = bodyRef.current
    const footer = footerRef.current
    if (!section || !track || !tiltGroup || !body || !footer) return undefined

    const words = body.querySelectorAll<HTMLElement>('[data-word]')

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(track, { y: 0 })
      gsap.set(tiltGroup, { rotate: 0 })
      gsap.set(words, { opacity: 1, filter: 'blur(0px)' })
      gsap.set(footer, { autoAlpha: 1 })
      return undefined
    }

    const navbar = document.querySelector<HTMLElement>('.ve-navbar')

    const ctx = gsap.context(() => {
      gsap.set(footer, { autoAlpha: 0 })

      // The section is deliberately NOT pinned (the text is meant to
      // scroll normally and exit upward), which means it scrolls out of
      // view at its own natural document height regardless of how long
      // this scroll-trigger's range is. An `end` fixed to a multiple of
      // the viewport height could easily exceed that natural height on
      // shorter copy, in which case the reveal would still be mid-flight
      // by the time the section had already scrolled out of view —
      // running forever "off camera" instead of finishing while visible.
      // Sizing `end` off the section's own height keeps the whole
      // sequence inside the window it's actually on screen for.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: () => `top top+=${navbar?.offsetHeight ?? 0}`,
          end: () => `+=${Math.round(Math.max(section.offsetHeight * 0.25, window.innerHeight * 0.1))}`,
          scrub: 1,
        },
      })

      tl.fromTo(track, { y: '30vh' }, { y: 0, ease: 'none', duration: 1 }, 0)
        .fromTo(tiltGroup, { transformOrigin: '50% 0%', rotate: BASE_ROTATION }, { rotate: 0, ease: 'none', duration: 1 }, 0)
        .fromTo(
          words,
          { opacity: BASE_OPACITY, filter: `blur(${BLUR_STRENGTH}px)` },
          { opacity: 1, filter: 'blur(0px)', ease: 'none', stagger: 0.015, duration: 0.45 },
          0.05,
        )
        .fromTo(footer, { autoAlpha: 0 }, { autoAlpha: 1, ease: 'none', duration: 0.2 }, 0.85)
    }, section)

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
    <section id="dine" className={`${styles.dineSection} bg-black`} ref={sectionRef}>
      <div className={styles.dineBg}>
        {media.url && <img src={media.url} alt={media.alt} loading="lazy" />}
        <div className={styles.dineGlare} />
        <div className={styles.dineBgVeil} />
      </div>

      <div className={styles.dineCentered} ref={trackRef}>
        <div ref={tiltGroupRef}>
          {data.eyebrow && <span className="eyebrow">{data.eyebrow}</span>}

          <div className={styles.dineBody} ref={bodyRef}>
            <p>{splitWords(data.body)}</p>
          </div>
        </div>

        <div className={styles.dineFooter} ref={footerRef}>
          <h2 className={`section-title ${styles.dineHeading}`}>
            {renderTitle(data.heading)} <span aria-hidden="true">🎋</span>
          </h2>
          {data.ctaHref && (
            <a href={data.ctaHref} className="btn btn-on-dark">
              {data.ctaLabel}
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
      {words.join(' ')} <em>{last}</em>
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
