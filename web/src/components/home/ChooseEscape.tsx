'use client'

import { useEffect, useRef, useState } from 'react'
import type { Home, Stay } from '@/payload-types'
import { DragScrollTrack } from '@/components/shared/DragScrollTrack'
import { CountUp } from '@/components/shared/CountUp'
import { assetUrl } from '@/lib/assetUrl'
import { reportProgress } from '@/lib/loadProgress'
import { gsap, ScrollTrigger } from '@/lib/animations/gsap'
import styles from './ChooseEscape.module.css'

// A real compressed video (H.264, keyframe every 8 frames so any scroll
// position seeks cheaply), scrubbed via video.currentTime — not a canvas
// redrawing a 273-WebP-frame sequence loaded as separate <img>s (the
// previous approach here, ~6.5MB of images loaded individually). Re-
// encoded from the original raw PNG sequence (not the WebP frames, to
// avoid compounding lossy compression) via ffmpeg -g 8 -keyint_min 8; one
// ~2MB file now, at 24fps.
const VIDEO_SRC = assetUrl('/videos/choose-your-escape.mp4')
// Per-chapter still images for the mobile/tablet fallback card row (see
// .fallback below) — extracted from the same video at the same relative
// timestamps the old per-frame poster lookup used (chapter.start + 0.03),
// since there's no longer a numbered frame file to address directly.
const POSTER_SRC: Record<string, string> = {
  'mango-house': assetUrl('/choose-your-escape/poster-mango-house.jpg'),
  'stone-house': assetUrl('/choose-your-escape/poster-stone-house.jpg'),
  'full-house': assetUrl('/choose-your-escape/poster-full-house.jpg'),
}

// How much scroll distance (px) the stage stays pinned for — not tied to
// real time or frame count, just scroll depth; the video's own duration
// is what currentTime scrubs across regardless of this span. Floored
// against the viewport height so short sequences on tall screens still
// get a deliberate scroll.
const SCROLL_DISTANCE_PX = 1911
const MIN_SCROLL_VH = 1.6

// Desktop-only breakpoint for the pinned scrub — matches ExperienceReel's
// own cutoff. Below it (or under prefers-reduced-motion) the CSS shows a
// plain static card row instead (see .fallback / .stageDesktop below), and
// the JS skips building the canvas player entirely — no point fetching 273
// frames on a phone.
const DESKTOP_BREAKPOINT = '(min-width: 861px)'

// The sequence is one continuous drone orbit — ground-level by the pool,
// rising past the stone façade, then a full aerial pass — so each stay
// "owns" the stretch of footage that actually shows its framing. Boundaries
// were picked by eye against the real frames (see the frame numbers in the
// comments) and expressed as fractions of total scroll progress.
const CHAPTERS = [
  {
    slug: 'mango-house' as const,
    kicker: 'Ground Level',
    tag: 'Mornings by the pool, under the mango trees.',
    start: 0,
    end: 0.475, // source frame ~145
  },
  {
    slug: 'stone-house' as const,
    kicker: 'Rising View',
    tag: 'The stone façade, as the camera lifts.',
    start: 0.478, // source frame ~146
    end: 0.622, // source frame ~185
  },
  {
    slug: 'full-house' as const,
    kicker: 'From Above',
    tag: 'The whole estate, end to end.',
    start: 0.625, // source frame ~186
    end: 1,
  },
]

const STAY_SLUG_HREF: Record<string, string> = {
  'mango-house': '/mango-house',
  'stone-house': '/stone-house',
  'full-house': '/full-house',
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
// Shader-style smoothstep: 0 below edge0, 1 above edge1, eased in between —
// used to crossfade the chapter panels directly off scroll progress instead
// of a parallel timeline, since the progress itself is already smoothed by
// Lenis.
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1), 0, 1)
  return t * t * (3 - 2 * t)
}

export function ChooseEscape({
  heading,
  sub,
  stays,
}: {
  heading: Home['staysTeaser']['heading']
  sub: Home['staysTeaser']['sub']
  stays: Stay[]
}) {
  const bySlug = Object.fromEntries(stays.map((s) => [s.slug, s])) as Partial<Record<string, Stay>>
  const chapters = CHAPTERS.map((c) => ({ ...c, stay: bySlug[c.slug] })).filter(
    (c): c is (typeof CHAPTERS)[number] & { stay: Stay } => !!c.stay,
  )

  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const panelRefs = useRef<Array<HTMLDivElement | null>>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const video = videoRef.current
    if (!section || !stage || !video) return undefined

    const q = <T extends Element = HTMLElement>(sel: string) => Array.from(section.querySelectorAll<T>(sel))

    // Entrance reveals (header + stage unveil) run regardless of the
    // desktop/reduced-motion gate below, so the fallback card row still
    // gets a proper arrival.
    const revealCtx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.from(q('[data-line-inner]'), {
        yPercent: 115,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.14,
        scrollTrigger: { trigger: q('[data-headline]')[0], start: 'top 85%', once: true },
      })
      gsap.from(q('[data-fade]'), {
        opacity: 0,
        y: 22,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: q('[data-headline]')[0], start: 'top 88%', once: true },
      })
      gsap.from(q('[data-reveal]'), {
        clipPath: 'inset(8% 6% 8% 6% round 40px)',
        opacity: 0,
        duration: 1.2,
        clearProps: 'clipPath',
        ease: 'power3.out',
        scrollTrigger: { trigger: q('[data-reveal]')[0], start: 'top 88%', once: true },
      })
    }, section)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const desktop = window.matchMedia(DESKTOP_BREAKPOINT).matches
    if (reduced || !desktop) {
      return () => revealCtx.revert()
    }

    let cancelled = false

    // -- video load progress --------------------------------------------
    // Reports real buffered-vs-duration progress (not a fake timer) so the
    // first-load screen's percentage stays accurate — same technique as
    // Hero.tsx.
    function reportBufferedProgress() {
      if (cancelled || !video || !Number.isFinite(video.duration) || video.duration <= 0) return
      if (video.buffered.length === 0) return
      const bufferedEnd = video.buffered.end(video.buffered.length - 1)
      const frac = Math.min(1, bufferedEnd / video.duration)
      reportProgress('chooseEscape', frac)
      if (frac >= 0.999) setReady(true)
    }
    video.addEventListener('progress', reportBufferedProgress)
    video.addEventListener('loadedmetadata', reportBufferedProgress)
    video.addEventListener('canplaythrough', reportBufferedProgress)
    video.preload = 'auto'
    video.load()

    // -- scroll-driven pin + chapter crossfade --------------------------

    const panels = panelRefs.current.filter((el): el is HTMLDivElement => !!el)

    const scrollDistance = Math.max(SCROLL_DISTANCE_PX, window.innerHeight * MIN_SCROLL_VH)

    const trigger = ScrollTrigger.create({
      trigger: stage,
      // No navbar-offset start: the nav is fixed/transparent over this
      // section (same reasoning as BambooDine), so it should pin flush
      // with the real viewport top.
      start: 'top top',
      end: () => `+=${scrollDistance}`,
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress
        if (Number.isFinite(video.duration) && video.duration > 0) {
          video.currentTime = p * video.duration
        }

        chapters.forEach((c, i) => {
          const panel = panels[i]
          if (!panel) return
          const span = c.end - c.start
          const fade = Math.min(0.05, span * 0.22)
          const edge = span * 0.08
          const isFirst = i === 0
          const isLast = i === chapters.length - 1
          // Mango House (the first chapter) is already on screen in the
          // section's very first frame, so it shows at full strength from
          // p=0 instead of fading in — only the later chapters, which arrive
          // mid-scroll, get the fade-in.
          const fadeIn = isFirst ? 1 : smoothstep(c.start + edge, c.start + edge + fade, p)
          const outEnd = isLast ? 1 : c.end - edge
          const outStart = isLast ? 1 : outEnd - fade
          const visibility = fadeIn * (isLast ? 1 : 1 - smoothstep(outStart, outEnd, p))
          panel.style.opacity = String(visibility)
          panel.style.transform = `translateY(${(1 - visibility) * 26}px)`
          panel.style.visibility = visibility > 0.01 ? 'visible' : 'hidden'
        })
      },
    })

    return () => {
      cancelled = true
      video.removeEventListener('progress', reportBufferedProgress)
      video.removeEventListener('loadedmetadata', reportBufferedProgress)
      video.removeEventListener('canplaythrough', reportBufferedProgress)
      revealCtx.revert()
      // .kill(true) reverts the pin-spacer before React's own cleanup —
      // see the identical note in BambooDine.tsx for why that matters.
      trigger.kill(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters.length])

  if (!chapters.length) return null

  return (
    <section className={`${styles.escape} bg-white`} id="stay" ref={sectionRef}>
      <header className={styles.head}>
        <p className={styles.eyebrow} data-fade>
          <span className={styles.eyebrowDash} />
          Our Stays
        </p>
        <h2 className={styles.headline} data-headline>
          <span className={styles.line}>
            <span className={styles.lineInner} data-line-inner>
              Choose Your
            </span>
          </span>
          <span className={styles.line}>
            <span className={`${styles.lineInner} ${styles.gold}`} data-line-inner>
              {renderLastWord(heading)}
            </span>
          </span>
        </h2>
        {sub && (
          <p className={styles.sub} data-fade>
            {sub}
          </p>
        )}
      </header>

      {/* Desktop: the scroll-scrubbed drone sequence. */}
      <div className={styles.stageDesktop}>
        <div className={styles.stage} ref={stageRef} data-reveal>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption -- silent decorative scroll-scrubbed background, nothing to caption */}
          <video
            ref={videoRef}
            className={styles.canvas}
            style={{ opacity: ready ? 1 : 0 }}
            src={VIDEO_SRC}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />

          {chapters.map((c, i) => (
            <div
              className={`${styles.panel}${i === 0 ? ` ${styles.panelRight}` : ''}`}
              key={c.slug}
              ref={(el) => {
                panelRefs.current[i] = el
              }}
            >
              <span className={styles.panelNum}>stay / no. {String(i + 1).padStart(2, '0')}</span>
              <p className={styles.panelKicker}>{c.kicker}</p>
              <h3 className={styles.panelTitle}>{c.stay.title}</h3>
              <p className={styles.panelQuote}>&ldquo;{c.stay.homeTeaser?.quote}&rdquo;</p>
              <p className={styles.panelFacts}>
                {c.stay.capacity}
                <span className={styles.dot}>·</span>
                {c.stay.homeTeaser?.factsLine}
                <br />
                <span className={styles.price}>
                  from ₹<CountUp value={c.stay.priceFrom} locale="en-IN" /> / night
                </span>
                {c.stay.priceNote ? ` · ${c.stay.priceNote}` : ''}
              </p>
              <a href={STAY_SLUG_HREF[c.slug]} className={styles.panelCta}>
                View {c.stay.title}
                <span className={styles.panelCtaIcon} aria-hidden="true">
                  <i className="fa-solid fa-arrow-right" />
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile / tablet / reduced-motion: a plain drag-scroll card row —
          no scroll-jacking, no video fetch. */}
      <div className={styles.fallback}>
        <DragScrollTrack>
          {chapters.map((c) => {
            return (
              <div className={styles.fallbackCard} key={c.slug}>
                <div className={styles.fallbackMedia}>
                  <img src={POSTER_SRC[c.slug]} alt="" loading="lazy" />
                </div>
                <p className={styles.fallbackKicker}>{c.kicker}</p>
                <h3 className={styles.fallbackTitle}>{c.stay.title}</h3>
                <p className={styles.fallbackQuote}>&ldquo;{c.stay.homeTeaser?.quote}&rdquo;</p>
                <p className={styles.fallbackFacts}>
                  {c.stay.capacity}
                  <span className={styles.dot}>·</span>
                  {c.stay.homeTeaser?.factsLine}
                  <br />
                  <span className={styles.price}>from ₹{c.stay.priceFrom.toLocaleString('en-IN')} / night</span>
                </p>
                <a href={STAY_SLUG_HREF[c.slug]} className="btn btn-ghost">
                  View {c.stay.title} →
                </a>
              </div>
            )
          })}
        </DragScrollTrack>
      </div>
    </section>
  )
}

function renderLastWord(heading: string) {
  const words = heading.trim().split(' ')
  return words[words.length - 1] ?? heading
}
