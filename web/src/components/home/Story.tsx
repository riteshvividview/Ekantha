'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/animations/gsap'
import styles from './Story.module.css'

// Static uploads, not CMS fields — dropped into web/public/images/home/
// 02-story/. Both source clips were huge HEVC phone/camera captures (94MB
// and 171MB respectively, 65-90Mbps — not web-safe: HEVC isn't reliably
// supported in <video> outside Safari, and those bitrates are absurd for a
// background loop); card2-footage-web.mp4 is an ffmpeg re-encode (H.264,
// 1280×720, ~2.3MB) of Second-section-card2-footage.MP4, the clip actually
// used in the front card. The still image is served through next/image
// instead, which handles down-sampling the 8000×5300 source on its own.
const BIG_FRAME_VIDEO = '/images/home/02-story/card-footage-web.mp4'
const SMALL_FRAME_IMAGE = '/images/home/02-story/card-image-web.JPG'
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
      const headlineLines = q<HTMLElement>('[data-line]')
      headlineLines.forEach((line, index) => {
        gsap.to(line, {
          y: (index - 1) * -26,
          x: (index - 1) * 18,
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
          <StoryCopy />
        </div>

        <div className={styles.frames} aria-hidden="true">
          {/* .frameMedia is a nested child of the GSAP-owned .frameInner
              (which already carries the scroll-scrubbed scale/yPercent
              parallax — see the effect above), not the same element, so the
              hover zoom/desaturation below is a plain CSS transition that
              never fights that inline-styled transform. */}
          {/* .frameSide sits in front of (overlaps) .frameMain — see
              Story.module.css — so the video goes there per the "video at
              the front, image behind" brief; .frameMain carries the still. */}
          <div className={`${styles.frame} ${styles.frameMain}`} data-frame="7">
            <div className={styles.frameInner} data-frame-inner>
              <div className={styles.frameMedia}>
                <video
                  className={styles.frameVideo}
                  src={BIG_FRAME_VIDEO}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                />
              </div>
            </div>
            <div className={styles.frameOverlay} />
          </div>
          <div className={`${styles.frame} ${styles.frameSide}`} data-frame="-12">
            <div className={styles.frameInner} data-frame-inner>
              <div className={styles.frameMedia}>
                <Image
                  src={SMALL_FRAME_IMAGE}
                  alt="Vana Ekantha"
                  fill
                  sizes="(max-width: 900px) 46vw, 24vw"
                />
              </div>
            </div>
            <div className={styles.frameOverlay} />
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

function StoryCopy() {
  return (
    <div className={styles.copyContent}>
      <p className={styles.eyebrow} data-eyebrow>
        <span className={styles.eyebrowDash} />
        The Story
      </p>

      <h2 className={styles.headline} data-headline>
        {HEADLINE.map((line, i) => (
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
  )
}
