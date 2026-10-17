'use client'

import { useEffect, useRef, useState } from 'react'
import type { Home, Stay } from '@/payload-types'
import { DragScrollTrack } from '@/components/shared/DragScrollTrack'
import { CountUp } from '@/components/shared/CountUp'
import { assetUrl } from '@/lib/assetUrl'
import { gsap, ScrollTrigger } from '@/lib/animations/gsap'
import styles from './ChooseEscape.module.css'

// Frames are served from R2 (frame-001.webp … frame-273.webp), generated
// from the raw 273-PNG drone-orbit sequence via
// scripts/convert-escape-frames.mjs — see that file's header comment.
const FRAME_COUNT = 273
const framePath = (i: number) => assetUrl(`/choose-your-escape/frame-${String(i + 1).padStart(3, '0')}.webp`)

// Load only an initial window up front — see the identical note in
// Hero.tsx. More loads in as the scrub approaches the edge of what's
// already in memory.
const INITIAL_FRAME_WINDOW = 30
const FRAME_LOOKAHEAD = 15
const FRAME_WINDOW_STEP = 60

// How much scroll distance (px) the stage stays pinned for, spread across
// the whole sequence — not tied to real time, just scroll depth. Floored
// against the viewport height so short sequences on tall screens still get
// a deliberate scroll.
const PX_PER_FRAME = 7
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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const panelRefs = useRef<Array<HTMLDivElement | null>>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const canvas = canvasRef.current
    if (!section || !stage || !canvas) return undefined

    const ctx2d = canvas.getContext('2d')
    if (!ctx2d) return undefined

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

    const frames: Array<HTMLImageElement | null> = new Array(FRAME_COUNT).fill(null)
    let currentFrame = 0
    let cancelled = false

    // -- canvas sizing / drawing (same cover-fit technique as BambooDine) --

    function resizeCanvas() {
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      drawFrame(nearestLoadedFrame(currentFrame))
    }

    function coverRect(imgW: number, imgH: number, dstW: number, dstH: number) {
      const srcRatio = imgW / imgH
      const dstRatio = dstW / dstH
      if (srcRatio > dstRatio) {
        const sw = imgH * dstRatio
        return { sx: (imgW - sw) / 2, sy: 0, sw, sh: imgH }
      }
      const sh = imgW / dstRatio
      return { sx: 0, sy: (imgH - sh) / 2, sw: imgW, sh }
    }

    function drawFrame(index: number) {
      const img = frames[index]
      if (!canvas || !ctx2d || !img || canvas.width === 0) return
      const { sx, sy, sw, sh } = coverRect(img.naturalWidth, img.naturalHeight, canvas.width, canvas.height)
      ctx2d.clearRect(0, 0, canvas.width, canvas.height)
      ctx2d.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
    }

    function nearestLoadedFrame(target: number) {
      if (frames[target]) return target
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (frames[target - d]) return target - d
        if (frames[target + d]) return target + d
      }
      return -1
    }

    function loadFrame(i: number): Promise<void> {
      return new Promise((resolve) => {
        const img = new Image()
        img.decoding = 'async'
        img.onload = () => {
          frames[i] = img
          if (!cancelled && i === nearestLoadedFrame(currentFrame)) drawFrame(i)
          if (i === 0 && !cancelled) setReady(true)
          resolve()
        }
        img.onerror = () => resolve()
        img.src = framePath(i)
      })
    }

    // `frontier` is the exclusive upper bound of what's been requested so
    // far — ensureLoadedThrough(n) only starts new work past it, so calling
    // it repeatedly (e.g. on every scroll tick) is cheap once a range is
    // already in flight or loaded. Set synchronously to the initial window
    // *before* ScrollTrigger.create() below — GSAP fires onUpdate once,
    // synchronously, during creation, so if frontier were still 0 at that
    // point, the lookahead check below would immediately race past the
    // intended initial window before preload() (if it were async) got a
    // chance to set it.
    let frontier = INITIAL_FRAME_WINDOW
    function ensureLoadedThrough(target: number) {
      const end = Math.min(target, FRAME_COUNT)
      if (end <= frontier) return
      const start = frontier
      frontier = end
      const CONCURRENCY = 6
      let next = start
      async function worker() {
        while (next < end && !cancelled) {
          const i = next++
          await loadFrame(i)
        }
      }
      void Promise.all(Array.from({ length: CONCURRENCY }, worker))
    }

    function preload() {
      const CONCURRENCY = 6
      let next = 0
      async function worker() {
        while (next < frontier && !cancelled) {
          const i = next++
          await loadFrame(i)
        }
      }
      void Promise.all(Array.from({ length: CONCURRENCY }, worker))
    }

    // Observes the canvas's *parent* (see the identical note in
    // BambooDine.tsx for why — avoids a resize feedback loop).
    const resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvas.parentElement as Element)
    resizeCanvas()
    preload()

    // -- scroll-driven pin + chapter crossfade --------------------------

    const panels = panelRefs.current.filter((el): el is HTMLDivElement => !!el)

    const scrollDistance = Math.max(FRAME_COUNT * PX_PER_FRAME, window.innerHeight * MIN_SCROLL_VH)

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
        currentFrame = Math.round(p * (FRAME_COUNT - 1))
        const nearest = nearestLoadedFrame(currentFrame)
        if (nearest >= 0) drawFrame(nearest)
        if (currentFrame + FRAME_LOOKAHEAD > frontier) {
          ensureLoadedThrough(currentFrame + FRAME_LOOKAHEAD + FRAME_WINDOW_STEP)
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
      resizeObserver.disconnect()
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
          <canvas ref={canvasRef} className={styles.canvas} style={{ opacity: ready ? 1 : 0 }} aria-hidden="true" />

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
          no scroll-jacking, no 273-frame fetch. */}
      <div className={styles.fallback}>
        <DragScrollTrack>
          {chapters.map((c) => {
            const posterIdx = Math.round((c.start + 0.03) * (FRAME_COUNT - 1))
            return (
              <div className={styles.fallbackCard} key={c.slug}>
                <div className={styles.fallbackMedia}>
                  <img src={framePath(posterIdx)} alt="" loading="lazy" />
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
