'use client'

import { useEffect, useRef, useState } from 'react'
import type { Home } from '@/payload-types'
import { resolveMediaSize } from '@/lib/media'
import { assetUrl } from '@/lib/assetUrl'
import { reportProgress } from '@/lib/loadProgress'
import { gsap } from '@/lib/animations/gsap'
import styles from './home.module.css'
import dine from './BambooDine.module.css'

// A real compressed video (H.264, keyframe every 8 frames so any scroll
// position seeks cheaply), scrubbed via video.currentTime — not a canvas
// redrawing a 240-WebP-frame sequence loaded as separate <img>s (the
// previous approach here, ~14MB of images loaded individually). Re-encoded
// from the original raw PNG sequence (not the WebP frames, to avoid
// compounding lossy compression) via ffmpeg -g 8 -keyint_min 8; one ~4MB
// file now.
const VIDEO_SRC = assetUrl('/videos/bamboo-dine.mp4')

// How much scroll distance (px) the section stays pinned for — not tied
// to real time or frame count, just scroll depth; the video's own
// duration is what currentTime scrubs across regardless of this span.
const SCROLL_DISTANCE_PX = 1920

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
 * cinematic scroll-scrubbed video (ScrollTrigger pin + video.currentTime,
 * the same technique Apple product pages use): the section pins, and
 * scroll position — not time — drives which point of the video is shown.
 * Three text beats (eyebrow → body → heading/CTA, the same copy the old
 * Dine.tsx used) cross-fade in sync with the same scroll progress via one
 * shared GSAP timeline, so text and frame are always showing the same
 * "moment" regardless of scroll speed or direction.
 */
export function BambooDine({ data }: { data: Home['dine'] }) {
  const poster = resolveMediaSize(data.image, 'hero')
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
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
    const video = videoRef.current
    const text1 = text1Ref.current
    const text2 = text2Ref.current
    const text3 = text3Ref.current
    const railFill = railFillRef.current
    if (!section || !video || !text1 || !text2 || !text3 || !railFill) return undefined

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
      reportProgress('bambooDine', frac)
      if (frac >= 0.999) setReady(true)
    }
    video.addEventListener('progress', reportBufferedProgress)
    video.addEventListener('loadedmetadata', reportBufferedProgress)
    video.addEventListener('canplaythrough', reportBufferedProgress)
    video.preload = 'auto'
    // Below the hero, not visible on arrival — never contends with
    // Hero's own video (fetchpriority "high") for bandwidth. Not in JSX:
    // @types/react doesn't type fetchPriority for <video> yet.
    video.setAttribute('fetchpriority', 'low')
    video.load()

    // -- scroll-driven pin + text timeline ------------------------------

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      gsap.set([text1, text2, text3], { autoAlpha: 1, y: 0 })
      return () => {
        cancelled = true
        video.removeEventListener('progress', reportBufferedProgress)
        video.removeEventListener('loadedmetadata', reportBufferedProgress)
        video.removeEventListener('canplaythrough', reportBufferedProgress)
      }
    }

    const scrollDistance = SCROLL_DISTANCE_PX

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        // No navbar-height offset here (unlike the old Dine.tsx this
        // replaced) — the nav is fixed and transparent by default, so
        // this section should pin at the true viewport top and fill it
        // edge to edge; offsetting the start left a gap showing whatever
        // sits behind the nav instead of the video.
        start: 'top top',
        end: () => `+=${scrollDistance}`,
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (Number.isFinite(video.duration) && video.duration > 0) {
            video.currentTime = self.progress * video.duration
          }
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
      video.removeEventListener('progress', reportBufferedProgress)
      video.removeEventListener('loadedmetadata', reportBufferedProgress)
      video.removeEventListener('canplaythrough', reportBufferedProgress)
      // .kill(true) (not the no-arg form) explicitly reverts the pin-spacer
      // wrapper ScrollTrigger inserts into the DOM before React's own
      // cleanup runs — see the identical note in ExperienceReel.tsx for
      // why skipping the revert crashes React's reconciliation.
      tl.scrollTrigger?.kill(true)
      tl.kill()
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
        {/* eslint-disable-next-line jsx-a11y/media-has-caption -- silent decorative scroll-scrubbed background, nothing to caption */}
        <video
          ref={videoRef}
          className={styles.bambooDineCanvas}
          style={{ opacity: ready ? 1 : 0 }}
          src={VIDEO_SRC}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />

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
