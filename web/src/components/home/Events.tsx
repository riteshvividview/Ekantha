'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/animations/gsap'
import { THEME_SECONDS } from '@/lib/pageTheme'
import { assetUrl } from '@/lib/assetUrl'
import styles from './Events.module.css'

// Static uploads, not CMS fields — served from R2 under
// images/home/07-events-preview/ (the originals were 20MB+ PNGs straight off
// a drone/phone; these are ffmpeg re-encodes — 3840px on the long edge,
// near-lossless — so next/image still has a genuine 4K source to downsample
// from on a large/retina screen, not an already-softened copy).
const IMAGES = {
  feature: assetUrl('/images/home/07-events-preview/feature.webp'),
  celebrations: assetUrl('/images/home/07-events-preview/detail.webp'),
  gatherings: assetUrl('/images/home/07-events-preview/celebrations.webp'),
  occasions: assetUrl('/images/home/07-events-preview/corporate.webp'),
  corporate: assetUrl('/images/home/07-events-preview/occasions.webp'),
}

// One slide per occasion. The photo is the only thing that lives inside the
// card on the right — title/description/meta all render in the copy column
// on the left instead, swapping to match whichever slide is active (see
// Events.tsx below). Each slide's `accent` is the tint the photo washes
// toward while it's active.
const SLIDES = [
  {
    key: 'overview',
    title: 'A Setting For\nEvery Occasion',
    desc: 'Lantern-lit lawns, open pavilions and long tables under the trees, made over for the day you have in mind.',
    image: IMAGES.feature,
    meta: ['Any occasion', 'Day or night', 'The whole estate'],
    accent: '#caa15a',
  },
  {
    key: 'celebrations',
    title: 'Celebrations',
    desc: 'Birthdays, anniversaries and everything worth a toast.',
    image: IMAGES.celebrations,
    meta: ['Birthdays & milestones', 'Any time of day', 'Mango House'],
    accent: '#d9b57a',
  },
  {
    key: 'gatherings',
    title: 'Get\nTogethers',
    desc: 'Fire-lit evenings for family and friends, unhurried.',
    image: IMAGES.gatherings,
    meta: ['Family & friends', 'Fire-lit evenings', 'Stone House lawn'],
    accent: '#c9793a',
  },
  {
    key: 'occasions',
    title: 'Special\nOccasions',
    desc: 'Intimate weddings and milestones, styled your way.',
    image: IMAGES.occasions,
    meta: ['Intimate weddings', 'Styled your way', 'The great lawn'],
    accent: '#39406f',
  },
  {
    key: 'corporate',
    title: 'Corporate\nOffsites',
    desc: 'Room to think, plan and reconnect, far from the office.',
    image: IMAGES.corporate,
    meta: ['Team offsites', 'Evening sessions', 'Poolside deck'],
    accent: '#2f5d55',
  },
]
const N = SLIDES.length

// Mirrors Why.tsx: the page palette lives in CSS custom properties, so
// tweening them on <body> repaints everything at once. Why.tsx fades the
// page to dark; this fades it back to light for the Events section, so the
// page breathes light → dark → light with no hard block edges.
const DARK = {
  '--white': 'rgb(24, 20, 17)',
  '--silver': 'rgb(34, 28, 23)',
  '--ink': 'rgb(244, 234, 217)',
  '--ink-soft': 'rgba(244, 234, 217, 0.66)',
  '--ink-faint': 'rgba(244, 234, 217, 0.44)',
  '--line': 'rgba(244, 234, 217, 0.14)',
  '--line-strong': 'rgba(244, 234, 217, 0.26)',
}
const LIGHT = {
  '--white': 'rgb(250, 240, 230)',
  '--silver': 'rgb(254, 248, 248)',
  '--ink': 'rgb(29, 29, 27)',
  '--ink-soft': 'rgba(29, 29, 27, 0.62)',
  '--ink-faint': 'rgba(29, 29, 27, 0.42)',
  '--line': 'rgba(29, 29, 27, 0.12)',
  '--line-strong': 'rgba(29, 29, 27, 0.26)',
}

export function Events() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const copyTextWrapRef = useRef<HTMLDivElement>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const [active, setActive] = useState(0)

  const go = (i: number) => setActive(((i % N) + N) % N)
  const titleLines = SLIDES[active].title.split('\n')

  // Page-theme crossfade + scroll-in reveal + scroll-driven parallax on the
  // copy block. Slide switches are handled separately, by a plain CSS
  // "enter" animation keyed to `active` — see .copyAnim in
  // Events.module.css — since they don't need to track scroll at all.
  useEffect(() => {
    const section = sectionRef.current
    const card = cardRef.current
    const copyTextWrap = copyTextWrapRef.current
    if (!section || !card || !copyTextWrap) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const q = <T extends Element = HTMLElement>(sel: string) => Array.from(section.querySelectorAll<T>(sel))

    const ctx = gsap.context(() => {
      // Dark → light, scrubbed across the gap above this section.
      // immediateRender: false so it never stomps Why.tsx's own tween on
      // first paint; the two ranges don't overlap.
      gsap.fromTo(document.body, DARK, {
        ...LIGHT,
        duration: THEME_SECONDS,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: { trigger: section, start: 'top 82%', toggleActions: 'play none none reverse' },
      })

      if (reduced) return

      gsap.from(q('[data-fade]'), {
        opacity: 0,
        y: 22,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: section, start: 'top 84%', once: true },
      })

      gsap.from(card, {
        clipPath: 'inset(8% 6% 8% 6% round 32px)',
        opacity: 0,
        duration: 1.1,
        clearProps: 'clipPath',
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 85%', once: true },
      })

      // The "parallax text" ask — the whole copy block drifts up against
      // the scroll while the section passes through, independent of the
      // slide-switch animation inside it (a separate element, so the two
      // never fight).
      gsap.fromTo(
        copyTextWrap,
        { yPercent: 8 },
        {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    }, section)

    return () => ctx.revert()
  }, [])

  // "Plan Your Event" nudges toward the cursor while hovered — a small
  // magnetic pull, not a full drag-along, reset with an elastic ease on
  // leave. Desktop/hover-capable only; there's no pointer to track on touch.
  useEffect(() => {
    const link = linkRef.current
    if (!link) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    if (window.matchMedia('(hover: none)').matches) return undefined

    const moveX = gsap.quickTo(link, 'x', { duration: 0.5, ease: 'power3' })
    const moveY = gsap.quickTo(link, 'y', { duration: 0.5, ease: 'power3' })
    const onMove = (e: PointerEvent) => {
      const r = link.getBoundingClientRect()
      moveX((e.clientX - (r.left + r.width / 2)) * 0.25)
      moveY((e.clientY - (r.top + r.height / 2)) * 0.25)
    }
    const onLeave = () => {
      gsap.to(link, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    }
    link.addEventListener('pointermove', onMove)
    link.addEventListener('pointerleave', onLeave)
    return () => {
      link.removeEventListener('pointermove', onMove)
      link.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <section className={styles.events} id="events" ref={sectionRef}>
      <div className={styles.top}>
        <div className={styles.copy}>
          <p className={styles.eyebrow} data-fade>
            <span className={styles.eyebrowDash} />
            Events &amp; Celebrations
          </p>

          <div className={styles.copyTextWrap} ref={copyTextWrapRef}>
            <div key={active} className={styles.copyAnim}>
              <h2 className={styles.headline}>
                {titleLines.map((line, i) => (
                  <span className={`${styles.line}${i === titleLines.length - 1 ? ` ${styles.gold}` : ''}`} key={line}>
                    {line}
                  </span>
                ))}
              </h2>
              <p className={styles.sub}>{SLIDES[active].desc}</p>
              <ul className={styles.meta}>
                {SLIDES[active].meta.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          <a href="/events" className={styles.link} data-fade ref={linkRef}>
            <span className={styles.linkCircle} aria-hidden="true">
              <i className="fa-solid fa-arrow-right" />
            </span>
            Plan Your Event
          </a>
        </div>

        {/* The image column — nothing but the photo. Title/description/meta
            live in .copy on the left instead (see above); the filmstrip and
            progress sit below the frame, not over it. */}
        <div className={styles.cardCol}>
          <div className={styles.card} ref={cardRef}>
            <div className={styles.bgStack} aria-hidden="true">
              {SLIDES.map((s, i) => (
                <div key={s.key} className={styles.bgSlide} style={{ opacity: i === active ? 1 : 0 }}>
                  <Image src={s.image} alt="" fill sizes="(max-width: 900px) 100vw, 1400px" quality={95} priority={i === 0} />
                  <div className={styles.bgTint} style={{ background: s.accent, opacity: i === active ? 0.16 : 0 }} />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.filmstripRow}>
            <div className={styles.filmstrip}>
              {SLIDES.map((s, i) => (
                <button
                  type="button"
                  key={s.key}
                  className={`${styles.thumb}${i === active ? ` ${styles.thumbOn}` : ''}`}
                  onClick={() => go(i)}
                  aria-label={s.title.replace('\n', ' ')}
                  aria-pressed={i === active}
                >
                  <Image src={s.image} alt="" fill sizes="80px" quality={70} />
                </button>
              ))}
            </div>

            <div className={styles.progress} aria-hidden="true">
              <span>{String(active + 1).padStart(2, '0')}</span>
              <span className={styles.progressTrack}>
                <span className={styles.progressFill} style={{ width: `${((active + 1) / N) * 100}%` }} />
              </span>
              <span>{String(N).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
