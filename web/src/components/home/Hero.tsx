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

// The eyebrow/sub disappear fast, right as scrolling begins — the title
// itself (and its font-cycle, see below) stays on screen and keeps running
// for the whole pinned entrance; only the CTA follows the old "hand off to
// Story near the very end" beat.
const INTRO_FADE_START = 0
const INTRO_FADE_END = 0.08
const CTA_FADE_START = 0.72
const CTA_FADE_END = 0.98

// How often the title swaps to the next font in HERO_TITLE_FONTS, and how
// long each swap's little flicker-out/flicker-in takes.
const FONT_SWAP_MS = 650
const FONT_SWAP_OUT = 0.14
const FONT_SWAP_IN = 0.22

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

  // The title's font-cycling effect — runs continuously for as long as the
  // page is open (not tied to scroll progress at all), looping through
  // every face in HERO_TITLE_FONTS with a quick flicker transition between
  // each. Skipped entirely under reduced motion, leaving the title on its
  // default (Qalisten) font.
  useEffect(() => {
    const title = titleRef.current
    if (!title) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    let i = 0
    const swap = () => {
      i = (i + 1) % HERO_TITLE_FONTS.length
      gsap
        .timeline()
        .to(title, { autoAlpha: 0.1, duration: FONT_SWAP_OUT, ease: 'power2.in' })
        .set(title, { fontFamily: HERO_TITLE_FONTS[i] })
        .to(title, { autoAlpha: 1, duration: FONT_SWAP_IN, ease: 'power2.out' })
    }
    gsap.set(title, { fontFamily: HERO_TITLE_FONTS[0] })
    const id = setInterval(swap, FONT_SWAP_MS)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const hero = heroRef.current
    const canvas = canvasRef.current
    const eyebrow = eyebrowRef.current
    const sub = subRef.current
    const explore = exploreRef.current
    if (!hero || !canvas || !eyebrow || !sub || !explore) return undefined

    const ctx2d = canvas.getContext('2d')
    if (!ctx2d) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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

        // Eyebrow + sub: gone almost as soon as scrolling starts.
        const introFade = smoothstep(INTRO_FADE_START, INTRO_FADE_END, p)
        const introStyle = { opacity: String(1 - introFade), transform: `translateY(${-10 * introFade}%)` }
        Object.assign(eyebrow.style, introStyle)
        Object.assign(sub.style, introStyle)

        // CTA: kept through the whole entrance, lifts away right at the end
        // (the title itself is deliberately left out of this — it, and its
        // font-cycle, stay put for the entire pinned scroll).
        const ctaFade = smoothstep(CTA_FADE_START, CTA_FADE_END, p)
        explore.style.opacity = String(1 - ctaFade)
        explore.style.transform = `translateY(${-14 * ctaFade}%)`
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
