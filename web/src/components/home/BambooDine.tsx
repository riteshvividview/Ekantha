'use client'

import { useEffect, useRef, useState } from 'react'
import type { Home } from '@/payload-types'
import { resolveMediaSize } from '@/lib/media'
import { assetUrl } from '@/lib/assetUrl'
import { reportProgress } from '@/lib/loadProgress'
import { loadFrameImage } from '@/lib/loadFrameImage'
import { gsap } from '@/lib/animations/gsap'
import styles from './home.module.css'
import dine from './BambooDine.module.css'

// Frames are served from R2 (frame-001.webp … frame-240.webp), generated
// from the raw 240-PNG sequence via scripts/convert-bamboo-frames.mjs — see
// that file's header comment for why (188MB of PNG → ~14MB of WebP, the
// difference between "loads" and "doesn't").
const FRAME_COUNT = 240
const framePath = (i: number) => assetUrl(`/bamboo-dine/frame-${String(i + 1).padStart(3, '0')}.webp`)

// Every frame loads up front, behind the first-load screen — see the
// identical note in Hero.tsx for why (scrubbing mid-load was stuttering).

// How much scroll distance (px) the section stays pinned for, spread
// across the whole sequence — not tied to real time, just scroll depth.
// Higher = slower/more deliberate scrub per frame.
const PX_PER_FRAME = 8

// Text beats as named 0–1 progress windows against the pinned scroll
// range (not real seconds) — reposition these to retime the sequence
// without touching the tween logic below. Each beat fades in over the
// first FADE_SPAN of its window and out over the last FADE_SPAN.
const TEXT_1_START = 0.04
const TEXT_1_END = 0.28
const TEXT_2_START = 0.34
const TEXT_2_END = 0.68
const TEXT_3_START = 0.74
const TEXT_3_END = 0.98
const FADE_SPAN = 0.06

const CHAPTERS = [
  { icon: 'fa-wheat-awn', title: 'Grown Here', text: 'Picked from the rows you can see from your table.' },
  { icon: 'fa-fire', title: 'Cooked Slow', text: 'Over open flame, at the pace of the evening.' },
  { icon: 'fa-moon', title: 'Served at Dusk', text: 'Under lantern light, as the sky turns to gold.' },
]

const AMBIENT_AUDIO_SRC = '/audio/farm-dinner-audio.mp3'
// Ambient background level, not full blast — and never an instant on/off:
// both directions ramp `audio.volume` itself, so playback always fades in
// and (crucially) actually stops only once it's faded to silence, rather
// than cutting out mid-sound the moment the button is clicked.
const AMBIENT_VOLUME = 0.6
const AMBIENT_FADE_SECONDS = 1.1

function fadeInAndPlay(audio: HTMLAudioElement) {
  gsap.killTweensOf(audio)
  audio.volume = 0
  audio.play().catch(() => {}) // blocked by the browser's autoplay policy — the play/pause listeners keep the button in sync either way
  gsap.to(audio, { volume: AMBIENT_VOLUME, duration: AMBIENT_FADE_SECONDS, ease: 'sine.out' })
}

function fadeOutAndPause(audio: HTMLAudioElement) {
  if (audio.paused) return
  gsap.killTweensOf(audio)
  gsap.to(audio, {
    volume: 0,
    duration: AMBIENT_FADE_SECONDS,
    ease: 'sine.in',
    onComplete: () => audio.pause(),
  })
}

/**
 * "Bamboo Farm Dine" — replaces the old sticky-photo Dine.tsx with a
 * cinematic scroll-scrubbed image sequence (canvas + ScrollTrigger pin,
 * the same technique Apple product pages use): the section pins, and
 * scroll position — not time — drives which of the 240 frames is drawn.
 * Three text beats (eyebrow → body → heading/CTA, the same copy the old
 * Dine.tsx used) cross-fade in sync with the same scroll progress via one
 * shared GSAP timeline, so text and frame are always showing the same
 * "moment" regardless of scroll speed or direction.
 *
 * Frames are decoded on a single canvas, never as DOM <img> elements —
 * only the current frame is ever drawn. All 240 are preloaded (the first
 * one blocking so the section never shows a blank canvas, the rest in a
 * capped-concurrency background queue); until a given target frame has
 * actually loaded, the nearest already-loaded neighbour is drawn instead,
 * so loading never stalls the scrub.
 */
export function BambooDine({ data }: { data: Home['dine'] }) {
  const poster = resolveMediaSize(data.image, 'hero')
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const text1Ref = useRef<HTMLDivElement>(null)
  const text2Ref = useRef<HTMLDivElement>(null)
  const text3Ref = useRef<HTMLUListElement>(null)
  const railFillRef = useRef<HTMLSpanElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const cursorAreaRef = useRef<HTMLAnchorElement>(null)
  const cursorLabelRef = useRef<HTMLSpanElement>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)

  // `playing` is driven entirely by the <audio> element's own play/pause
  // events, not set directly at each call site (the click handler below,
  // and the visibility observer further down both just call
  // audio.play()/audio.pause()) — a single source of truth, so the two
  // can never race and leave the button's displayed state out of sync
  // with whether sound is actually coming out.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return undefined
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    return () => {
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [])

  // Ambient audio auto-pauses once the section scrolls out of view — it's
  // a "while you're here" touch, not something that should keep playing
  // over Events/Testimonials/etc further down the page. It never
  // auto-resumes on its own; only the visitor's own click starts it.
  useEffect(() => {
    const section = sectionRef.current
    const audio = audioRef.current
    if (!section || !audio) return undefined
    const observer = new IntersectionObserver(([entry]) => !entry.isIntersecting && fadeOutAndPause(audio), {
      threshold: 0,
    })
    observer.observe(section)
    return () => {
      observer.disconnect()
      gsap.killTweensOf(audio)
      audio.pause() // teardown, not a user-facing transition — no fade needed
    }
  }, [])

  function toggleAmbientAudio() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      fadeInAndPlay(audio)
    } else {
      fadeOutAndPause(audio)
    }
  }

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    const text1 = text1Ref.current
    const text2 = text2Ref.current
    const text3 = text3Ref.current
    const railFill = railFillRef.current
    if (!section || !canvas || !text1 || !text2 || !text3 || !railFill) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const frames: Array<ImageBitmap | null> = new Array(FRAME_COUNT).fill(null)
    let currentFrame = 0
    let cancelled = false

    // -- canvas sizing / drawing -------------------------------------

    function resizeCanvas() {
      if (!canvas) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      drawFrame(nearestLoadedFrame(currentFrame))
    }

    // object-fit: cover — crop the source frame to the canvas's aspect
    // ratio rather than stretching it.
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
      if (!canvas || !ctx || !img || canvas.width === 0) return
      const { sx, sy, sw, sh } = coverRect(img.width, img.height, canvas.width, canvas.height)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)
    }

    // Graceful degradation: if the exact target frame hasn't loaded yet,
    // show the nearest one that has, searching outward in both
    // directions, rather than freezing on a stale frame or drawing
    // nothing.
    function nearestLoadedFrame(target: number) {
      if (frames[target]) return target
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (frames[target - d]) return target - d
        if (frames[target + d]) return target + d
      }
      return -1
    }

    // -- preloading ----------------------------------------------------

    let loadedCount = 0
    async function loadFrame(i: number): Promise<void> {
      const img = await loadFrameImage(framePath(i))
      if (cancelled) return
      if (img) {
        frames[i] = img
        if (i === nearestLoadedFrame(currentFrame)) drawFrame(i)
        if (i === 0) setReady(true)
      }
      loadedCount++
      reportProgress('bambooDine', loadedCount / FRAME_COUNT)
    }

    function preload() {
      const CONCURRENCY = 6
      let next = 0
      async function worker() {
        while (next < FRAME_COUNT && !cancelled) {
          const i = next++
          await loadFrame(i)
        }
      }
      void Promise.all(Array.from({ length: CONCURRENCY }, worker))
    }

    // Observes the canvas's *parent*, not the canvas itself — resizeCanvas
    // mutates canvas.width/height (the drawing-buffer attributes), and a
    // canvas's own ResizeObserver entry includes its bitmap size, so
    // observing the canvas directly retriggers this same callback on every
    // resize it causes, converging the element down to the wrong size.
    const resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvas.parentElement as Element)
    // ResizeObserver's own initial notification is async and, in
    // practice, not reliably delivered for an element observed this early
    // in the mount/hydration sequence — an explicit synchronous call here
    // guarantees the canvas has a correct backing-store size before the
    // first frame draws, regardless of that timing.
    resizeCanvas()
    preload()

    // -- scroll-driven pin + text timeline ------------------------------

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      gsap.set([text1, text2, text3], { autoAlpha: 1, y: 0 })
      return () => {
        cancelled = true
        resizeObserver.disconnect()
        frames.forEach((f) => f?.close())
      }
    }

    const scrollDistance = FRAME_COUNT * PX_PER_FRAME

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        // No navbar-height offset here (unlike the old Dine.tsx this
        // replaced) — the nav is fixed and transparent by default, so
        // this section should pin at the true viewport top and fill it
        // edge to edge; offsetting the start left a gap showing whatever
        // sits behind the nav instead of the canvas.
        start: 'top top',
        end: () => `+=${scrollDistance}`,
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          currentFrame = Math.round(self.progress * (FRAME_COUNT - 1))
          const nearest = nearestLoadedFrame(currentFrame)
          if (nearest >= 0) drawFrame(nearest)
        },
      },
    })

    const fadeIn = (el: HTMLElement, at: number) => tl.fromTo(el, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: FADE_SPAN, ease: 'none' }, at)
    const fadeOut = (el: HTMLElement, at: number) => tl.to(el, { autoAlpha: 0, y: -22, duration: FADE_SPAN, ease: 'none' }, at)

    fadeIn(text1, TEXT_1_START)
    fadeOut(text1, TEXT_1_END - FADE_SPAN)
    fadeIn(text2, TEXT_2_START)
    fadeOut(text2, TEXT_2_END - FADE_SPAN)
    fadeIn(text3, TEXT_3_START)
    fadeOut(text3, TEXT_3_END - FADE_SPAN)

    // Each beat's own lines rise in one after another inside the beat's
    // fade window, and the progress rail fills across the whole sequence.
    const stagger = (root: HTMLElement, at: number) =>
      tl.fromTo(
        root.querySelectorAll('[data-beat]'),
        { autoAlpha: 0, y: 34 },
        { autoAlpha: 1, y: 0, duration: 0.05, ease: 'none', stagger: 0.022 },
        at,
      )
    stagger(text1, TEXT_1_START)
    stagger(text3, TEXT_3_START)
    tl.fromTo(railFill, { scaleY: 0 }, { scaleY: 1, duration: 1, ease: 'none' }, 0)
    // Pads the timeline's total duration out to exactly 1 (the last real
    // tween ends at TEXT_2_END) so scroll progress 0→1 maps 1:1 onto
    // these position values instead of a duration shorter than 1.
    tl.to({}, { duration: 0.0001 }, 1)

    return () => {
      cancelled = true
      resizeObserver.disconnect()
      // .kill(true) (not the no-arg form) explicitly reverts the pin-spacer
      // wrapper ScrollTrigger inserts into the DOM before React's own
      // cleanup runs — see the identical note in ExperienceReel.tsx for
      // why skipping the revert crashes React's reconciliation.
      tl.scrollTrigger?.kill(true)
      tl.kill()
      frames.forEach((f) => f?.close())
    }
  }, [])

  // The section's own cursor: a pill that lerps toward the pointer,
  // standing in for the normal OS cursor (hidden via `cursor: none` on
  // this area) while hovering here. It only reads as the "Explore Farm
  // House" pill while
  // actually in motion; the moment the pointer holds still it shrinks
  // back down to a plain small dot (the `idle` class), the same resting
  // read as the normal cursor, and re-expands the instant it moves again.
  const IDLE_DELAY_MS = 220
  useEffect(() => {
    const area = cursorAreaRef.current
    const label = cursorLabelRef.current
    if (!area || !label) return undefined

    let mouseX = 0
    let mouseY = 0
    let currX = 0
    let currY = 0
    let raf = 0
    let idleTimer: ReturnType<typeof setTimeout> | undefined

    const animate = () => {
      currX += (mouseX - currX) * 0.2
      currY += (mouseY - currY) * 0.2
      label.style.transform = `translate(${currX}px, ${currY}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)

    const wake = () => {
      label.classList.remove(styles.bambooDineCursorLabelIdle)
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => label.classList.add(styles.bambooDineCursorLabelIdle), IDLE_DELAY_MS)
    }

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      wake()
    }
    const onEnter = (e: MouseEvent) => {
      currX = e.clientX
      currY = e.clientY
      mouseX = e.clientX
      mouseY = e.clientY
      document.body.classList.add('farm-dine-cursor')
      label.style.opacity = '1'
      wake()
    }
    const onLeave = () => {
      clearTimeout(idleTimer)
      document.body.classList.remove('farm-dine-cursor')
      label.style.opacity = '0'
      label.classList.remove(styles.bambooDineCursorLabelIdle)
    }

    area.addEventListener('mousemove', onMove)
    area.addEventListener('mouseenter', onEnter)
    area.addEventListener('mouseleave', onLeave)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(idleTimer)
      area.removeEventListener('mousemove', onMove)
      area.removeEventListener('mouseenter', onEnter)
      area.removeEventListener('mouseleave', onLeave)
      document.body.classList.remove('farm-dine-cursor')
    }
  }, [])

  return (
    // data-nav-hero: goes back to the transparent, light-text nav treatment
    // while this section is pinned — see Navbar.tsx — instead of the solid
    // scrolled pill sitting on top of the full-bleed canvas.
    <section id="dine" className={`${styles.bambooDineSection} bg-black ${dine.root}`} ref={sectionRef} data-nav-hero>
      <div className={styles.bambooDineStage}>
        {!ready && poster.url && <img className={styles.bambooDinePoster} src={poster.url} alt="" aria-hidden="true" />}
        <canvas ref={canvasRef} className={styles.bambooDineCanvas} style={{ opacity: ready ? 1 : 0 }} aria-hidden="true" />

        <div className={dine.vignetteLeft} aria-hidden="true" />
        <div className={dine.vignetteBottom} aria-hidden="true" />

        <audio ref={audioRef} src={AMBIENT_AUDIO_SRC} loop preload="none" />
        <button
          type="button"
          className={`${styles.bambooDineAudio}${playing ? ` ${styles.bambooDineAudioActive}` : ''}`}
          onClick={toggleAmbientAudio}
          aria-pressed={playing}
          aria-label={playing ? 'Pause the sounds of the farm' : 'Play the sounds of the farm'}
        >
          <span className={styles.bambooDineAudioIcon} aria-hidden="true">
            <span className={styles.bambooDineAudioPulse} />
            <span className={styles.bambooDineAudioPulse} />
            <i />
            <i />
            <i />
          </span>
          <span className={styles.bambooDineAudioTooltip}>
            {playing ? 'Just feel it' : 'Wonna feel Nature?'}
          </span>
        </button>

        <div className={`${styles.bambooDineText} ${dine.left}`} ref={text1Ref}>
          <p className={dine.eyebrow} data-beat>
            <span className={dine.eyebrowDash} />
            Bamboo Dine
          </p>
          <h2 className={dine.headline} data-beat>
            Farm Fresh
            <br />
            <span className={dine.gold}>Dining</span>
          </h2>
          <p className={dine.sub} data-beat>
            Good food tastes better in nature.
          </p>
          <span className={dine.flourish} data-beat aria-hidden="true">
            <i className="fa-solid fa-wheat-awn" />
          </span>
        </div>

        <div className={`${styles.bambooDineText} ${styles.bambooDineTextCorner}`} ref={text2Ref}>
          <p className={dine.quote}>{data.body}</p>
        </div>

        <ul className={dine.chapters} ref={text3Ref}>
          {CHAPTERS.map((c) => (
            <li className={dine.chapter} data-beat key={c.title}>
              <span className={dine.chapterIcon} aria-hidden="true">
                <i className={`fa-solid ${c.icon}`} />
              </span>
              <h3 className={dine.chapterTitle}>{c.title}</h3>
              <p className={dine.chapterText}>{c.text}</p>
            </li>
          ))}
        </ul>

        <div className={dine.rail} aria-hidden="true">
          <span className={dine.railFill} ref={railFillRef} />
        </div>

        {/* Replaces the old heading + pill-button beat: the whole frame is
            the invitation now, not a beat of text sitting on top of it. A
            full-bleed link (under the audio button in z-order, so that
            button's own click still resolves to itself, not this) with a
            custom pointer-following label standing in for both the removed
            copy and the cursor itself while hovering here. */}
        {data.ctaHref && (
          <a
            ref={cursorAreaRef}
            href={data.ctaHref}
            className={styles.bambooDineCursorArea}
            aria-label="Explore Farm House"
          >
            <span ref={cursorLabelRef} className={styles.bambooDineCursorLabel} aria-hidden="true">
              <span className={styles.bambooDineCursorLabelText}>
                Explore
                <br />
                Farm House
              </span>
            </span>
          </a>
        )}
      </div>
    </section>
  )
}
