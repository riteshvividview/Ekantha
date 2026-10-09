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

// The eyebrow/sub/CTA all disappear fast, right as scrolling begins — only
// the title (and its font-cycle, see below) stays on screen for the whole
// pinned entrance.
const INTRO_FADE_START = 0
const INTRO_FADE_END = 0.08

// The title's font, opacity and scale are now all pure functions of scroll
// progress `p` — no timer, no latched "is the cycle running" state. Which
// font shows is literally which of HERO_TITLE_FONTS' equal-width segments
// `p` currently falls in (segment 0 = HERO_TITLE_FONTS[0], the default),
// so scrolling to the very top always lands back on the default by
// construction, and scrolling backward steps back through the fonts in
// reverse — nothing to explicitly "reset".
// FONT_SWAP_DIP_ZONE: the leading fraction of each font's segment where a
// brief flicker-dip plays, purely as a function of position within that
// segment — not a wall-clock transition, so it can't get stuck mid-flicker
// if scrolling stops.
const FONT_SWAP_DIP_ZONE = 0.18
const FONT_SWAP_DIP_OPACITY = 0.08

// Dimmed (not full-strength), default font, no growth at all until the
// intro text has cleared (see INTRO_FADE_END above) — only then does the
// title dim down further and start growing.
const TITLE_REST_OPACITY = 0.7
const TITLE_CYCLE_OPACITY = 0.22
const TITLE_SCALE_REST = 1
const TITLE_SCALE_GROWN = 1.3

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
  const subRef = useRef<HTMLParagraphElement>(null)
  const exploreRef = useRef<HTMLAnchorElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const hero = heroRef.current
    const canvas = canvasRef.current
    const eyebrow = eyebrowRef.current
    const title = titleRef.current
    const sub = subRef.current
    const explore = exploreRef.current
    if (!hero || !canvas || !eyebrow || !title || !sub || !explore) return undefined

    const ctx2d = canvas.getContext('2d')
    if (!ctx2d) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const frames: Array<HTMLImageElement | null> = new Array(FRAME_COUNT).fill(null)
    let currentFrame = 0
    let cancelled = false

    // Title font/opacity/scale as a pure function of scroll progress `p` —
    // called once up front (so there's no flash of unstyled state before
    // the first onUpdate) and again every onUpdate thereafter.
    function applyTitleState(p: number) {
      if (!title) return
      const dimAmount = smoothstep(INTRO_FADE_END, INTRO_FADE_END + 0.015, p)
      const baseOpacity = TITLE_REST_OPACITY + (TITLE_CYCLE_OPACITY - TITLE_REST_OPACITY) * dimAmount
      const growth = smoothstep(INTRO_FADE_END, 1, p)
      const scaleNow = TITLE_SCALE_REST + (TITLE_SCALE_GROWN - TITLE_SCALE_REST) * growth

      const t = clamp((p - INTRO_FADE_END) / (1 - INTRO_FADE_END || 1), 0, 1)
      const raw = t * HERO_TITLE_FONTS.length
      const fontIndex = Math.min(HERO_TITLE_FONTS.length - 1, Math.floor(raw))
      const localT = raw - fontIndex
      const dip =
        dimAmount * (localT < FONT_SWAP_DIP_ZONE ? 1 - smoothstep(0, FONT_SWAP_DIP_ZONE, localT) : 0)

      title.style.fontFamily = HERO_TITLE_FONTS[fontIndex]
      title.style.opacity = String(baseOpacity * (1 - dip) + FONT_SWAP_DIP_OPACITY * dip)
      title.style.transform = `scale(${scaleNow})`
    }
    applyTitleState(0)

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
      }
    }

    const scrollDistance = Math.max(FRAME_COUNT * PX_PER_FRAME, window.innerHeight * MIN_SCROLL_VH)

    const trigger = ScrollTrigger.create({
      trigger: hero,
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

        // Font, opacity and scale: all driven straight off scroll progress
        // (see applyTitleState above) — scrolling back up steps back
        // through them in reverse with no special-case reset needed.
        applyTitleState(p)
      },
    })

    return () => {
      cancelled = true
      resizeObserver.disconnect()
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
          The
          <br />
          Farmhouse
        </h1>

        <p className={`${styles.heroSub} reveal`} ref={subRef}>
          Two Homes. One Unforgettable Escape.
        </p>

        <a href={data.primaryCtaHref || '#'} className={`${styles.heroExplore} reveal`} ref={exploreRef}>
          <span className={styles.heroExploreCircle} aria-hidden="true">
            <i className="fa-solid fa-arrow-right" />
          </span>
          Explore the Experience
        </a>
      </div>
    </section>
  )
}
