'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/animations/gsap'
import styles from './Story.module.css'

// Static uploads, not CMS fields — drop files into
// web/public/images/home/02-story/ and set the paths here. While null, the
// frames render as soft placeholder panels.
const IMAGES: { main: string | null; side: string | null } = {
  main: null, // e.g. '/images/home/02-story/main.jpg'
  side: null, // e.g. '/images/home/02-story/side.jpg'
}

const HEADLINE = ['A quiet corner', 'of the countryside,', 'made for you.']

const BODY =
  'Tucked away amid open fields and old trees, The Farmhouse is two homes and one promise: that time slows down here. Wake to birdsong, share long meals grown steps from your table, and let the evenings glow beside the pool. It is not an escape from life. It is a return to it.'

const HIGHLIGHTS = [
  {
    icon: 'fa-house',
    title: 'Two Homes',
    text: 'Two handcrafted stone homes, open to a family, a circle of friends, or the whole estate at once.',
  },
  {
    icon: 'fa-leaf',
    title: 'Farm to Table',
    text: 'Meals grown, picked and cooked within sight of where you sit, served at the pace of the day.',
  },
  {
    icon: 'fa-moon',
    title: 'Slow Evenings',
    text: 'Lantern-lit terraces and a still pool for the hour when the whole sky turns to gold.',
  },
]

export function Story() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const q = <T extends Element>(sel: string) => Array.from(section.querySelectorAll<T>(sel))

    const ctx = gsap.context(() => {
      // Giant backdrop word drifts sideways against the scroll.
      gsap.fromTo(
        q('[data-bgword]'),
        { xPercent: 12 },
        {
          xPercent: -22,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )

      // Headline: each line slides up out of its own mask on entry…
      gsap.from(q('[data-line-inner]'), {
        yPercent: 115,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.14,
        scrollTrigger: { trigger: q('[data-headline]')[0], start: 'top 82%', once: true },
      })
      // …and the lines themselves drift at different speeds while scrolling.
      q('[data-line]').forEach((line, i) => {
        gsap.to(line, {
          y: (i - 1) * -26,
          x: (i - 1) * 18,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })

      gsap.from(q('[data-eyebrow]'), {
        opacity: 0,
        y: 18,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: q('[data-eyebrow]')[0], start: 'top 88%', once: true },
      })

      // Body copy: words light up one by one as you scroll through it.
      gsap.fromTo(
        q('[data-word]'),
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.12,
          scrollTrigger: { trigger: q('[data-body]')[0], start: 'top 82%', end: 'bottom 52%', scrub: true },
        },
      )

      // Image frames: opposing parallax, with a slow inner counter-drift.
      const frames = q<HTMLElement>('[data-frame]')
      frames.forEach((frame) => {
        const speed = Number(frame.dataset.frame)
        gsap.fromTo(
          frame,
          { yPercent: speed * -1 },
          {
            yPercent: speed,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
        const inner = frame.querySelector('[data-frame-inner]')
        if (inner) {
          gsap.fromTo(
            inner,
            { scale: 1.18, yPercent: -6 },
            {
              scale: 1.04,
              yPercent: 6,
              ease: 'none',
              scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          )
        }
      })
      gsap.from(frames, {
        clipPath: 'inset(12% 12% 12% 12%)',
        opacity: 0,
        duration: 1.3,
        ease: 'power3.out',
        stagger: 0.18,
        scrollTrigger: { trigger: frames[0], start: 'top 85%', once: true },
      })

      // Highlights rise in one after another.
      gsap.from(q('[data-highlight]'), {
        opacity: 0,
        y: 46,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.16,
        scrollTrigger: { trigger: q('[data-highlights]')[0], start: 'top 86%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.story} id="story" ref={sectionRef}>
      <div className={styles.glowWarm} aria-hidden="true" />
      <div className={styles.glowCool} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <div className={styles.bgWord} aria-hidden="true" data-bgword>
        Nature
      </div>

      <div className={styles.grid}>
        <div className={styles.copy}>
          <p className={styles.eyebrow} data-eyebrow>
            <span className={styles.eyebrowDash} />
            The Story
          </p>

          <h2 className={styles.headline} data-headline>
            {HEADLINE.map((line) => (
              <span className={styles.line} data-line key={line}>
                <span className={styles.lineInner} data-line-inner>
                  {line}
                </span>
              </span>
            ))}
          </h2>

          <p className={styles.body} data-body>
            {BODY.split(' ').map((word, i) => (
              <span className={styles.word} data-word key={i}>
                {word}{' '}
              </span>
            ))}
          </p>

          <a href="/stay" className={styles.link}>
            <span className={styles.linkCircle} aria-hidden="true">
              <i className="fa-solid fa-arrow-right" />
            </span>
            Discover the Stay
          </a>
        </div>

        <div className={styles.frames} aria-hidden="true">
          <div className={`${styles.frame} ${styles.frameMain}`} data-frame="7">
            <div className={styles.frameInner} data-frame-inner>
              {IMAGES.main ? <img src={IMAGES.main} alt="" /> : <span className={styles.placeholder}>Image</span>}
            </div>
          </div>
          <div className={`${styles.frame} ${styles.frameSide}`} data-frame="-12">
            <div className={styles.frameInner} data-frame-inner>
              {IMAGES.side ? <img src={IMAGES.side} alt="" /> : <span className={styles.placeholder}>Image</span>}
            </div>
          </div>
        </div>
      </div>

      <ul className={styles.highlights} data-highlights>
        {HIGHLIGHTS.map((h) => (
          <li className={styles.highlight} data-highlight key={h.title}>
            <span className={styles.highlightIcon} aria-hidden="true">
              <i className={`fa-solid ${h.icon}`} />
            </span>
            <h3 className={styles.highlightTitle}>{h.title}</h3>
            <p className={styles.highlightText}>{h.text}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
