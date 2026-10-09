'use client'

import { useEffect, useRef, useState } from 'react'
import type { Home } from '@/payload-types'
import { gsap, ScrollTrigger } from '@/lib/animations/gsap'
import { HERO_TITLE_FONTS } from '@/lib/fonts'
import styles from './home.module.css'

// Frames live in public/hero-entrance/ (frame-001.webp … frame-440.webp),
// extracted at 24fps from a single landscape video via
// scripts/convert-hero-frames.mjs — see that file's header comment. Same
// technique as BambooDine.tsx: a canvas, not DOM <img>s, scroll-scrubbed.
const FRAME_COUNT = 440
const framePath = (i: number) => `/hero-entrance/frame-${String(i + 1).padStart(3, '0')}.webp`

// Scroll distance (px) the hero stays pinned for, spread across the whole
// sequence — not tied to real time, just scroll depth.
const PX_PER_FRAME = 8
const MIN_SCROLL_VH = 1.4

// Extra scroll distance (in viewport-heights) the hero stays pinned for
// *after* its own effects below have fully finished, before unpinning —
// a brief held beat so Story (the next section, with its own dark bg)
// doesn't appear to snap in right on the heels of the title settling.
// Nothing new happens during this extra stretch; see how `p` is derived
// from `rawProgress` in the trigger's onUpdate below for why the existing
// effects still complete at exactly the same scroll depth as before,
// unstretched, regardless of this addition.
const HOLD_VH = 0.5

// The eyebrow/sub/CTA all disappear fast, right as scrolling begins — only
// the title (and its font-cycle, see below) stays on screen for the whole
// pinned entrance.
const INTRO_FADE_START = 0
const INTRO_FADE_END = 0.08
// How close to the very top counts as "back at the top" for resetting the
// title — not a bit-exact 0, since Lenis's own smoothing means scrolling
// back up tends to settle a hair above it rather than landing on it exactly.
const RESET_THRESHOLD = 0.004

// How often the title swaps to the next font in HERO_TITLE_FONTS, and how
// long each swap's little flicker-out/flicker-in takes — both scaled down
// from the interval so consecutive swaps never overlap. This one is
// deliberately a timer, not scroll-driven — it keeps cycling in place
// while you've stopped to read, same as a projector reel.
const FONT_SWAP_MS = 200
const FONT_SWAP_OUT = 0.05
const FONT_SWAP_IN = 0.08

// Full opacity, default font, no growth at all until the intro text has
// cleared (see INTRO_FADE_END above) — only then does the title dim down,
// start growing, and start cycling fonts. Both the dim-down and the reset
// back to rest are real gsap.to transitions (not an instant jump), and
// scrolling all the way back up to the very top reverses all three: the
// cycle stops, and the title resets to its default font at full size/rest
// opacity — scroll back down past INTRO_FADE_END and it all starts again.
const TITLE_REST_OPACITY = 1
const TITLE_CYCLE_OPACITY = 0.1
const TITLE_SCALE_REST = 1
const TITLE_SCALE_GROWN = 1.3

// The title starts as two stacked lines ("The" / "Farmhouse"), left-
// aligned with the rest of the intro copy — then, over this same scroll
// range, it grows, merges into one line (second word only sliding up
// beside the first, see measureMerge/mergeShiftX/Y below), and the whole
// thing recenters in the hero section (see measureCenter/centerShiftX/Y
// below). All three share this one progress curve so they read as a
// single effect, and it's reversible for free: scrolling back up unwinds
// all of it in lockstep, same as the scale-growth alone used to.
const EFFECT_START = INTRO_FADE_END
const EFFECT_END = 0.55

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1), 0, 1)
  return t * t * (3 - 2 * t)
}

export function Hero({ data }: { data: Home['hero'] }) {
  const heroRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // GSAP's scroll/cursor tweens move this wrapper, not the canvas itself —
  // the canvas is centered/oversized via plain CSS (top/left 50% +
  // translate(-50%,-50%)), same arrangement the old <img> used, so the
  // cursor-parallax drift still has a symmetric overscan to pan into
  // without ever exposing an edge.
  const trackRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLParagraphElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const wordOneRef = useRef<HTMLSpanElement>(null)
  const wordTwoRef = useRef<HTMLSpanElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const exploreRef = useRef<HTMLAnchorElement>(null)
  const leavesRef = useRef<HTMLSpanElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const hero = heroRef.current
    const canvas = canvasRef.current
    const eyebrow = eyebrowRef.current
    const title = titleRef.current
    const wordOne = wordOneRef.current
    const wordTwo = wordTwoRef.current
    const sub = subRef.current
    const explore = exploreRef.current
    if (!hero || !canvas || !eyebrow || !title || !wordOne || !wordTwo || !sub || !explore) return undefined

    const ctx2d = canvas.getContext('2d')
    if (!ctx2d) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const frames: Array<HTMLImageElement | null> = new Array(FRAME_COUNT).fill(null)
    let currentFrame = 0
    let cancelled = false
    let cycleRunning = false
    let cycleIndex = 0
    let cycleIntervalId: ReturnType<typeof setInterval> | undefined

    // Default, static appearance: full opacity, full size, default font
    // (Christmas Farmhouse — HERO_TITLE_FONTS[0]), no cycling — this is
    // what's on screen until scroll triggers the effect below (or forever,
    // under reduced motion), and what it resets back to at the very top.
    const resetTitle = () => {
      gsap.killTweensOf(title)
      // Font snaps back instantly (nothing meaningful to interpolate
      // between two typefaces), but opacity eases back to full strength
      // rather than jumping — same real transition the dim-down gets.
      gsap.set(title, { fontFamily: HERO_TITLE_FONTS[0] })
      gsap.to(title, { opacity: TITLE_REST_OPACITY, duration: 0.3, ease: 'power2.out' })
      cycleIndex = 0
      measureEffect()
    }

    // The one-line merge shift (second word only) — measured against the
    // *untransformed* layout (both words at rest) so the onUpdate handler
    // can apply a fixed target offset scaled by progress, rather than
    // re-deriving it from a rect that's already been moved by a previous
    // frame's transform. Re-measured on every font swap (not just once at
    // mount) since each of the HERO_TITLE_FONTS has very different glyph
    // widths/ascent, and centers (not tops) are what's aligned, since
    // baselines don't line up consistently across such different faces.
    // The gap is generous (not just a hair of breathing room) because
    // several of these fonts are decorative/hand-lettered with swashes
    // that overshoot their own logical glyph box — too tight a gap and
    // those overshoots visually collide even though the boxes don't.
    let mergeShiftX = 0
    let mergeShiftY = 0
    function measureMerge() {
      if (!title || !wordOne || !wordTwo) return
      // Font swaps fire on their own timer, independent of scroll — title
      // can have any in-progress scale() applied at that instant. Since
      // CSS transforms compose through the tree, that scale would get
      // baked into these measured rects as a screen-pixel value, then
      // re-scaled a second time when it's applied as wordTwo's own (local)
      // transform — so both transforms are reset to get a clean,
      // scale-1 measurement, consistent regardless of when it fires.
      const prevTitleTransform = title.style.transform
      const prevWordTwoTransform = wordTwo.style.transform
      title.style.transform = 'none'
      wordTwo.style.transform = 'none'
      const r1 = wordOne.getBoundingClientRect()
      const r2 = wordTwo.getBoundingClientRect()
      const fontSize = parseFloat(getComputedStyle(wordOne).fontSize) || r1.height
      const gap = fontSize * 0.4
      mergeShiftX = r1.width + gap
      mergeShiftY = r1.top + r1.height / 2 - (r2.top + r2.height / 2)
      title.style.transform = prevTitleTransform
      wordTwo.style.transform = prevWordTwoTransform
    }

    // The outer recenter shift (the whole title) — how far the *final*
    // grown, merged, one-line title needs to move for its own center to
    // land on the hero section's center. Measured by briefly posing the
    // title in that final state (full scale + full merge, no recenter
    // yet), reading its rect, then restoring whatever was actually on
    // screen — same "simulate the end state once, scale the result by
    // progress every frame" trick as measureMerge, so the real per-frame
    // work stays a single multiply-and-set.
    let centerShiftX = 0
    let centerShiftY = 0
    function measureCenter() {
      if (!hero || !title || !wordOne || !wordTwo) return
      const prevTitleTransform = title.style.transform
      const prevWordTwoTransform = wordTwo.style.transform
      title.style.transform = `scale(${TITLE_SCALE_GROWN})`
      wordTwo.style.transform = `translate(${mergeShiftX}px, ${mergeShiftY}px)`
      const heroRect = hero.getBoundingClientRect()
      // The h1's own box doesn't expand to follow a transformed child
      // sticking out of it — transforms affect paint position, not layout
      // size — so the title's *visual* extent once merged is the union of
      // both words' actual (transformed) rects, not title.getBoundingClientRect().
      const r1 = wordOne.getBoundingClientRect()
      const r2 = wordTwo.getBoundingClientRect()
      const left = Math.min(r1.left, r2.left)
      const right = Math.max(r1.right, r2.right)
      const top = Math.min(r1.top, r2.top)
      const bottom = Math.max(r1.bottom, r2.bottom)
      centerShiftX = heroRect.left + heroRect.width / 2 - (left + right) / 2
      centerShiftY = heroRect.top + heroRect.height / 2 - (top + bottom) / 2
      title.style.transform = prevTitleTransform
      wordTwo.style.transform = prevWordTwoTransform
    }

    function measureEffect() {
      measureMerge()
      measureCenter()
    }

    resetTitle()
    // Each of HERO_TITLE_FONTS is a separate font file next/font/local
    // registers with `display: swap` — the browser only actually fetches
    // one the first time it's *used*, rendering with fallback metrics
    // until it arrives. Without this, the first time the timer-cycle
    // reaches a font it hasn't shown yet, measureEffect() (called right
    // after that swap) would measure the wrong, fallback-sized rect.
    // Kicking off every font's load here, well before the cycle ever
    // starts, means they're almost always already cached by then — and
    // 'loadingdone' (not just the one-shot `fonts.ready`) catches it and
    // remeasures even on the rare cold-cache swap that still races ahead.
    for (const fontVar of HERO_TITLE_FONTS) {
      document.fonts.load(`16px ${fontVar}`).catch(() => {})
    }
    document.fonts.addEventListener('loadingdone', measureEffect)
    const wordResizeObserver = new ResizeObserver(measureEffect)
    wordResizeObserver.observe(title)

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
          resolve()
        }
        img.onerror = () => resolve()
        img.src = framePath(i)
      })
    }

    async function preload() {
      await loadFrame(0)
      if (cancelled) return
      setReady(true)
      drawFrame(0)

      const CONCURRENCY = 6
      let next = 1
      async function worker() {
        while (next < FRAME_COUNT && !cancelled) {
          const i = next++
          await loadFrame(i)
        }
      }
      await Promise.all(Array.from({ length: CONCURRENCY }, worker))
    }

    // Observes the canvas's *parent* (see the identical note in
    // BambooDine.tsx for why — avoids a resize feedback loop).
    const resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvas.parentElement as Element)
    resizeCanvas()
    preload()

    if (reduced) {
      gsap.set([eyebrow, sub, explore], { autoAlpha: 1, y: 0 })
      return () => {
        cancelled = true
        resizeObserver.disconnect()
        wordResizeObserver.disconnect()
        document.fonts.removeEventListener('loadingdone', measureEffect)
      }
    }

    const scrollDistance = Math.max(FRAME_COUNT * PX_PER_FRAME, window.innerHeight * MIN_SCROLL_VH)
    const holdDistance = window.innerHeight * HOLD_VH
    const totalDistance = scrollDistance + holdDistance
    // What fraction of the *extended* pin is the original effect — used to
    // rescale rawProgress back down to the same 0..1 "p" the effects below
    // have always used, so adding the hold distance doesn't stretch/slow
    // them down. p clamps at 1 once rawProgress moves past that fraction,
    // i.e. for the entire hold phase.
    const heroFrac = scrollDistance / totalDistance

    const trigger = ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: () => `+=${totalDistance}`,
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = Math.min(1, self.progress / heroFrac)
        currentFrame = Math.round(p * (FRAME_COUNT - 1))
        const nearest = nearestLoadedFrame(currentFrame)
        if (nearest >= 0) drawFrame(nearest)

        // Eyebrow + sub + CTA: all gone almost as soon as scrolling starts.
        // The title is deliberately left out of this — it, and its
        // font-cycle, stay put for the entire pinned scroll.
        const introFade = smoothstep(INTRO_FADE_START, INTRO_FADE_END, p)
        const introStyle = { opacity: String(1 - introFade), transform: `translateY(${-10 * introFade}%)` }
        Object.assign(eyebrow.style, introStyle)
        Object.assign(sub.style, introStyle)
        // explore (the CTA) gets opacity only, no transform — its transform
        // is already owned by the cursor-parallax quickTo(x/y) below, and a
        // second, independent writer of the same CSS property would fight it.
        explore.style.opacity = String(1 - introFade)

        // Grow + merge + recenter: one shared progress curve driving all
        // three (not a one-shot tween), so it needs no special-case reset
        // logic — it naturally unwinds back to TITLE_SCALE_REST/two stacked
        // lines/original left-aligned position as p returns to 0.
        const effect = smoothstep(EFFECT_START, EFFECT_END, p)
        const scaleNow = TITLE_SCALE_REST + (TITLE_SCALE_GROWN - TITLE_SCALE_REST) * effect
        // translate before scale: centerShiftX/Y are literal pixel deltas
        // measured against the already-grown, already-merged state (see
        // measureCenter), so they must apply in that same post-scale space
        // — translate() listed first in the transform does exactly that.
        title.style.transform = `translate(${centerShiftX * effect}px, ${centerShiftY * effect}px) scale(${scaleNow})`
        // "The" never moves — "Farmhouse" slides up and right to sit
        // beside it as you scroll, and slides back apart on the way back up.
        wordTwo.style.transform = `translate(${mergeShiftX * effect}px, ${mergeShiftY * effect}px)`

        // The font-cycle, unlike the growth/merge above, is stateful (which
        // font is showing is a matter of which interval tick last fired,
        // not a pure function of p) — so it needs explicit start/stop. Once
        // the intro text has cleared, it dims the title (via a real
        // transition, not an instant jump) and starts cycling; scrolling
        // all the way back up to the very top stops the cycle and resets
        // the title to its default font/size/opacity. Scrolling back down
        // past INTRO_FADE_END re-starts it from there.
        if (!cycleRunning && p >= INTRO_FADE_END) {
          cycleRunning = true
          gsap.to(title, { opacity: TITLE_CYCLE_OPACITY, duration: 0.3, ease: 'power2.out' })
          cycleIntervalId = setInterval(() => {
            cycleIndex = (cycleIndex + 1) % HERO_TITLE_FONTS.length
            gsap
              .timeline()
              .to(title, { opacity: 0.04, duration: FONT_SWAP_OUT, ease: 'power2.in' })
              .set(title, { fontFamily: HERO_TITLE_FONTS[cycleIndex] })
              .call(measureEffect)
              .to(title, { opacity: TITLE_CYCLE_OPACITY, duration: FONT_SWAP_IN, ease: 'power2.out' })
          }, FONT_SWAP_MS)
        } else if (cycleRunning && p <= RESET_THRESHOLD) {
          // <= a small epsilon, not a bit-exact 0 — Lenis's own smoothing
          // means scrolling back "to the top" settles a hair above 0.
          cycleRunning = false
          clearInterval(cycleIntervalId)
          resetTitle()
        }
      },
    })

    return () => {
      cancelled = true
      resizeObserver.disconnect()
      wordResizeObserver.disconnect()
      document.fonts.removeEventListener('loadingdone', measureEffect)
      clearInterval(cycleIntervalId)
      // .kill(true) reverts the pin-spacer before React's own cleanup —
      // see the identical note in BambooDine.tsx for why that matters.
      trigger.kill(true)
    }
  }, [])

  // Cursor-follow drift — the background pans slightly opposite the
  // pointer (a mild parallax-toward-camera read) and the explore link
  // drifts a touch with it, both riding on top of the scroll-scrub above
  // (GSAP composites x/y into one transform, so these don't fight).
  // Desktop/hover-capable only — there's no pointer to track on touch.
  useEffect(() => {
    const hero = heroRef.current
    const track = trackRef.current
    const explore = exploreRef.current
    if (!hero || !track || !explore) return undefined
    if (window.matchMedia('(hover: none)').matches) return undefined

    const moveImgX = gsap.quickTo(track, 'x', { duration: 0.9, ease: 'power3' })
    const moveImgY = gsap.quickTo(track, 'y', { duration: 0.9, ease: 'power3' })
    const moveExploreX = gsap.quickTo(explore, 'x', { duration: 0.45, ease: 'power3' })
    const moveExploreY = gsap.quickTo(explore, 'y', { duration: 0.45, ease: 'power3' })

    const onMove = (e: PointerEvent) => {
      const rect = hero.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      moveImgX(px * -18)
      moveImgY(py * -18)
      moveExploreX(px * 36)
      moveExploreY(py * 36)
    }
    const onLeave = () => {
      moveImgX(0)
      moveImgY(0)
      moveExploreX(0)
      moveExploreY(0)
    }

    hero.addEventListener('pointermove', onMove)
    hero.addEventListener('pointerleave', onLeave)
    return () => {
      hero.removeEventListener('pointermove', onMove)
      hero.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  // A little puff of leaves that scatters off the circle each time the CTA
  // is hovered — a one-shot burst-and-fade (not a held hover state), which
  // reads more like a small, deliberate flourish than a sticky UI state.
  // Separate from the cursor-parallax effect above since it animates its
  // own child elements, not exploreRef's own x/y (already owned by that
  // effect's quickTo).
  useEffect(() => {
    const explore = exploreRef.current
    const leaves = leavesRef.current
    if (!explore || !leaves) return undefined
    if (window.matchMedia('(hover: none)').matches) return undefined

    const leafEls = Array.from(leaves.querySelectorAll<HTMLElement>('i'))
    const burstX = [-15, 2, 17]
    const burstY = [-19, -27, -17]
    const burstRotate = [-28, 6, 32]

    const onEnter = () => {
      gsap.killTweensOf(leafEls)
      gsap.set(leafEls, { opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.3 })
      gsap
        .timeline()
        .to(leafEls, {
          opacity: 0.9,
          scale: 1,
          x: (i) => burstX[i],
          y: (i) => burstY[i],
          rotate: (i) => burstRotate[i],
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.05,
        })
        .to(
          leafEls,
          { opacity: 0, y: '+=14', duration: 0.45, ease: 'power1.in', stagger: 0.05 },
          '+=0.05',
        )
    }

    explore.addEventListener('pointerenter', onEnter)
    return () => {
      explore.removeEventListener('pointerenter', onEnter)
      gsap.killTweensOf(leafEls)
    }
  }, [])

  return (
    // data-nav-hero: toggles the transparent-over-hero nav treatment — see Navbar.tsx
    <section className={styles.hero} id="top" ref={heroRef} data-nav-hero>
      <div className={styles.heroMedia} aria-hidden="true">
        <div className={styles.heroMediaTrack} ref={trackRef}>
          <canvas ref={canvasRef} className={styles.heroCanvas} style={{ opacity: ready ? 1 : 0 }} />
        </div>
      </div>
      <div className={styles.heroLeftFade} aria-hidden="true" />

      <div className={styles.heroContent}>
        <p className={`${styles.heroEyebrow} reveal`} ref={eyebrowRef}>
          A Stay Amidst Nature
        </p>

        <h1 className={`${styles.heroTitle} reveal`} ref={titleRef}>
          <span className={styles.heroTitleWord} ref={wordOneRef}>
            The
          </span>
          <span className={styles.heroTitleWord} ref={wordTwoRef}>
            Farmhouse
          </span>
        </h1>

        <p className={`${styles.heroSub} reveal`} ref={subRef}>
          Two Homes. One Unforgettable Escape.
        </p>

        <a href={data.primaryCtaHref || '#'} className={`${styles.heroExplore} reveal`} ref={exploreRef}>
          <span className={styles.heroExploreCircle} aria-hidden="true">
            <i className="fa-solid fa-arrow-right" />
            <span className={styles.heroExploreLeaves} ref={leavesRef} aria-hidden="true">
              <i className="fa-solid fa-leaf" />
              <i className="fa-solid fa-leaf" />
              <i className="fa-solid fa-leaf" />
            </span>
          </span>
          Explore the Experience
        </a>
      </div>
    </section>
  )
}
