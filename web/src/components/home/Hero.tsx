'use client'

import { useEffect, useRef, useState } from 'react'
import type { Home } from '@/payload-types'
import { assetUrl } from '@/lib/assetUrl'
import { reportProgress } from '@/lib/loadProgress'
import { loadFrameImage } from '@/lib/loadFrameImage'
import { gsap, ScrollTrigger } from '@/lib/animations/gsap'
import styles from './home.module.css'

// Frames are served from R2 (frame-001.webp … frame-440.webp), extracted at
// 24fps from a single landscape video via scripts/convert-hero-frames.mjs —
// see that file's header comment. Same technique as BambooDine.tsx: a
// canvas, not DOM <img>s, scroll-scrubbed.
const FRAME_COUNT = 440
const framePath = (i: number) => assetUrl(`/hero-entrance/frame-${String(i + 1).padStart(3, '0')}.webp`)

// Every frame loads up front, behind the first-load screen (see
// InitialLoadScreen.tsx) — scrubbing mid-load was showing the nearest
// already-loaded neighbour as a stand-in and snapping to the real frame
// once it arrived, a visible stutter. Loading everything before the page
// is ever shown trades a longer initial wait (behind a real loading
// screen, not a blank one) for zero stutter once it's scrubbable.

// Scroll distance (px) the hero stays pinned for, spread across the whole
// sequence — not tied to real time, just scroll depth.
const PX_PER_FRAME = 8
const MIN_SCROLL_VH = 1.4

// The background frame-sequence still scrubs continuously with scroll —
// this is the one thing that stays scroll-position-tied, since it's a
// literal video being scrubbed through, not a UI transition. It gets a
// slow, continuous zoom across the same span, the "something's always
// quietly moving" touch — layered on the canvas itself (not
// .heroMediaTrack, which the cursor-parallax quickTo already owns), so the
// two transforms never fight over the same element.
const CANVAS_ZOOM_END = 1.14

// Everything else plays out as TWO one-shot SCENE TRANSITIONS, chained
// one after another — neither tied to how far you've scrolled, just to
// *whether* you've scrolled past each one's own trigger point:
//   scene  (stage 0 → 1): intro copy out, title docks at the bottom
//           (same big→small-and-moved read as the title itself always had —
//           no entry animation, it's just big by default), "The Land" copy
//           (including its own big-by-default heading) fades in above it.
//   scene2 (stage 1 → 2): "The Land" copy's supporting content fades out,
//           its own big heading docks where the title just was — shrinking
//           down exactly the way the title did a moment ago (the now-
//           redundant docked title fades out to make room) — and "The
//           Experience" copy (with its own big-by-default heading) fades in.
// Both play/reverse off the pin trigger's own progress (see
// SCENE1_OPEN_P/SCENE2_OPEN_P below) rather than scrub, so each always
// plays out over its own fixed duration regardless of scroll speed.
const TITLE_DOCK_PADDING = 48
const TITLE_SCALE_DOCKED = 0.62
const SCENE1_OPEN_P = 0.02
const SCENE2_OPEN_P = 0.42
// "Five Acres…" is big by default (see .heroExpandedHeading's font-size) —
// same as the hero title — and only shrinks down to this scale once scene2
// docks it at the bottom in the title's old spot.
const HEADING_SCALE_DOCKED = 0.6

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
  const leavesRef = useRef<HTMLSpanElement>(null)
  const expandedRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const expanded2Ref = useRef<HTMLDivElement>(null)
  const heading2Ref = useRef<HTMLHeadingElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const hero = heroRef.current
    const canvas = canvasRef.current
    const eyebrow = eyebrowRef.current
    const title = titleRef.current
    const sub = subRef.current
    const explore = exploreRef.current
    const expanded = expandedRef.current
    const heading = headingRef.current
    const expanded2 = expanded2Ref.current
    const heading2 = heading2Ref.current
    if (
      !hero ||
      !canvas ||
      !eyebrow ||
      !title ||
      !sub ||
      !explore ||
      !expanded ||
      !heading ||
      !expanded2 ||
      !heading2
    ) {
      return undefined
    }

    const ctx2d = canvas.getContext('2d')
    if (!ctx2d) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const frames: Array<HTMLImageElement | null> = new Array(FRAME_COUNT).fill(null)
    let currentFrame = 0
    let cancelled = false

    // How far the title needs to travel to dock at the bottom of the hero
    // (with TITLE_DOCK_PADDING below it) — measured against its natural,
    // untransformed rest position so this stays correct across resizes,
    // not baked in once at an arbitrary viewport size. Re-measured and
    // pushed into the scene timeline's title tween on every resize (see
    // onResize below), even mid-transition, so a window resize never
    // leaves it docked at a stale, wrong distance.
    // Shared by both dock transitions — stage 1 docks the title, stage 2
    // docks the "Five Acres…" heading in that same spot once the title has
    // faded out of it. Same technique either time: measure against the
    // element's natural, untransformed rest position (not a value baked in
    // once at an arbitrary viewport size) so it stays correct across
    // resizes, including mid-transition — see resyncDockMoves below.
    function measureDockDistance(el: HTMLElement) {
      if (!hero) return 0
      const prevTransform = el.style.transform
      el.style.transform = 'none'
      const heroRect = hero.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      const distance = heroRect.bottom - TITLE_DOCK_PADDING - elRect.bottom
      el.style.transform = prevTransform
      return distance
    }
    let titleMoveDistance = measureDockDistance(title)
    let headingMoveDistance = measureDockDistance(heading)

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
      reportProgress('hero', loadedCount / FRAME_COUNT)
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

    // Observes the canvas's *parent* (see the identical note in
    // BambooDine.tsx for why — avoids a resize feedback loop).
    const resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(canvas.parentElement as Element)
    resizeCanvas()
    preload()

    if (reduced) {
      // The expanded copy is deliberately left out here — it's a product
      // of the scene transition (which doesn't run under reduced motion),
      // not a thing that should just appear statically alongside the
      // full-size title; the original intro content stays as the resting
      // state instead.
      gsap.set([eyebrow, sub, explore], { autoAlpha: 1, y: 0 })
      return () => {
        cancelled = true
        resizeObserver.disconnect()
      }
    }

    // Stage 0 → 1: intro copy out, title down-and-small, "The Land" copy in.
    // `heading` fades in at its own (big, by CSS font-size) resting size,
    // right alongside the rest of this group — no shrink-to-reveal here,
    // same as the title itself never had one on page load.
    const expandedBits = expanded.querySelectorAll<HTMLElement>('[data-expand]')
    const scene = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } })
    scene.to([eyebrow, sub, explore], { opacity: 0, y: -14, duration: 0.38 }, 0)
    // NOT created with `paused: true` — a paused tween keeps respecting its
    // own pause state even once nested into a timeline via .add(), so the
    // parent's own play()/progress() calls silently skip rendering it (only
    // a direct .progress()/.seek() call on the tween itself bypasses that).
    // Safe to leave unpaused here: .add() reparents it off the root timeline
    // synchronously, before the next tick, so it never gets a chance to
    // autoplay on its own. Same reasoning applies to headingTween below.
    const titleTween = gsap.to(title, { y: titleMoveDistance, scale: TITLE_SCALE_DOCKED, duration: 0.72 })
    scene.add(titleTween, 0.08)
    scene.fromTo(expandedBits, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 }, 0.5)

    // Stage 1 → 2: "The Land" copy's supporting content (everything except
    // its heading) fades out, the heading itself docks in the exact spot
    // the title just vacated AND shrinks down to HEADING_SCALE_DOCKED while
    // doing it — the same big→small-and-moved transition the title itself
    // just played a moment ago — the now-redundant docked title fades out
    // to clear that spot, and "The Experience" copy (heading2 big by
    // default, same as heading/title) fades in.
    const expandedFadeBits = expanded.querySelectorAll<HTMLElement>('[data-expand-fade]')
    const expanded2Bits = expanded2.querySelectorAll<HTMLElement>('[data-expand2]')
    const scene2 = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } })
    scene2.to(expandedFadeBits, { opacity: 0, y: -14, duration: 0.3, stagger: 0.04 }, 0)
    scene2.to(title, { opacity: 0, duration: 0.28 }, 0)
    const headingTween = gsap.to(heading, { y: headingMoveDistance, scale: HEADING_SCALE_DOCKED, duration: 0.6 })
    scene2.add(headingTween, 0.06)
    scene2.fromTo(expanded2Bits, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.42, stagger: 0.06 }, 0.42)

    const resyncDockMoves = () => {
      titleMoveDistance = measureDockDistance(title)
      titleTween.vars.y = titleMoveDistance
      titleTween.invalidate()
      scene.progress(scene.progress())

      headingMoveDistance = measureDockDistance(heading)
      headingTween.vars.y = headingMoveDistance
      headingTween.invalidate()
      scene2.progress(scene2.progress())
    }
    window.addEventListener('resize', resyncDockMoves)
    // The very first measurement (above, at mount) can land before the
    // Qalisten webfont has swapped in — the fallback serif has different
    // metrics, so the measured rects (and therefore both move distances)
    // are briefly wrong. Re-measure once the real font is actually active.
    document.fonts.ready.then(() => {
      if (!cancelled) resyncDockMoves()
    })

    const scrollDistance = Math.max(FRAME_COUNT * PX_PER_FRAME, window.innerHeight * MIN_SCROLL_VH)

    // Drives both one-shot scenes' play/reverse off the SAME pin trigger's
    // own progress, rather than separate ScrollTriggers on `hero` — a
    // standalone trigger sharing a pinned element's geometry computes its
    // `start` against the pinned (frozen-in-place) position, not hero's
    // natural document-flow position, so it fires far too late (near the
    // END of the pin, not where it's meant to). Progress thresholds
    // sidestep that entirely: each scene still plays out over its own fixed
    // duration, independent of scroll speed — only the trigger POINT comes
    // from scroll.
    let sceneOpen = false
    let scene2Open = false

    const pinTrigger = ScrollTrigger.create({
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

        // Background: a slow continuous zoom across the whole pin — layered
        // on the canvas itself (not .heroMediaTrack, which the cursor-
        // parallax quickTo already owns), composed with the centering
        // translate .heroCanvas sets in CSS so it isn't clobbered.
        const zoom = 1 + (CANVAS_ZOOM_END - 1) * p
        canvas.style.transform = `translate(-50%, -50%) scale(${zoom})`

        if (!sceneOpen && p > SCENE1_OPEN_P) {
          sceneOpen = true
          scene.play()
        } else if (sceneOpen && p <= SCENE1_OPEN_P) {
          sceneOpen = false
          scene.reverse()
        }

        if (!scene2Open && p > SCENE2_OPEN_P) {
          scene2Open = true
          scene2.play()
        } else if (scene2Open && p <= SCENE2_OPEN_P) {
          scene2Open = false
          scene2.reverse()
        }
      },
    })

    return () => {
      cancelled = true
      resizeObserver.disconnect()
      window.removeEventListener('resize', resyncDockMoves)
      scene.kill()
      scene2.kill()
      // .kill(true) reverts the pin-spacer before React's own cleanup —
      // see the identical note in BambooDine.tsx for why that matters.
      pinTrigger.kill(true)
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

  // A little puff of leaves that scatters off the top-right corner of
  // "Explore the Experience" each time the CTA is hovered — a one-shot
  // burst-and-fade (not a held hover state), which reads more like a
  // small, deliberate flourish than a sticky UI state. Separate from the
  // cursor-parallax effect above since it animates its own child
  // elements, not exploreRef's own x/y (already owned by that effect's
  // quickTo).
  useEffect(() => {
    const explore = exploreRef.current
    const leaves = leavesRef.current
    if (!explore || !leaves) return undefined
    if (window.matchMedia('(hover: none)').matches) return undefined

    const leafEls = Array.from(leaves.querySelectorAll<HTMLElement>('i'))
    // Fanning up and to the right, away from the text — the anchor point
    // itself already sits at the corner (see .heroExploreLeaves), so
    // these only need to carry the leaves further outward from there.
    const burstX = [6, 16, 26]
    const burstY = [-18, -28, -14]
    const burstRotate = [-12, 12, 30]

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
          <span className={styles.heroExploreText}>
            Explore the Experience
            <span className={styles.heroExploreLeaves} ref={leavesRef} aria-hidden="true">
              <i className="fa-solid fa-leaf" />
              <i className="fa-solid fa-leaf" />
              <i className="fa-solid fa-leaf" />
            </span>
          </span>
        </a>
      </div>

      {/* Stage 1 — fades in once the title has docked at the bottom (see
          the `scene` timeline), filling the space the big title vacates.
          The heading alone carries through to stage 2 (see headingRef/
          `scene2`); everything else here is tagged data-expand-fade so it
          can fade out on its own when that happens. */}
      <div className={styles.heroExpanded} ref={expandedRef}>
        <p className={styles.heroExpandedEyebrow} data-expand data-expand-fade>
          The Land
        </p>
        <h2 className={styles.heroExpandedHeading} data-expand ref={headingRef}>
          Five Acres. Two Houses.
          <br />
          No Interruptions.
        </h2>
        <ul className={styles.heroExpandedPointers}>
          <li data-expand data-expand-fade>
            <i className="fa-solid fa-seedling" aria-hidden="true" />
            Two independent homes across five acres of working farmland
          </li>
          <li data-expand data-expand-fade>
            <i className="fa-solid fa-house" aria-hidden="true" />
            Mango House &amp; Stone House never share a wall, a view, or a moment
          </li>
          <li data-expand data-expand-fade>
            <i className="fa-solid fa-leaf" aria-hidden="true" />
            Close enough that it still feels like one quiet estate
          </li>
        </ul>
      </div>

      {/* Stage 2 — fades in once the "Five Acres…" heading has docked at
          the bottom in the title's old spot (see `scene2`). Title only,
          no body copy, by design — the estate's already made its case by
          this point; this is a mood, not another paragraph to read. */}
      <div className={styles.heroExpanded2} ref={expanded2Ref}>
        <div className={styles.heroExpanded2Tag} data-expand2>
          <span className={styles.heroExpanded2Ring} aria-hidden="true" />
          <p className={styles.heroExpandedEyebrow}>The Experience</p>
        </div>
        <h2 className={styles.heroExpanded2Heading} data-expand2 ref={heading2Ref}>
          Mornings Without An Agenda.
        </h2>
        <div className={styles.heroExperienceIcons} data-expand2>
          <span className={styles.heroExperienceIcon}>
            <i className="fa-solid fa-fire" aria-hidden="true" />
            Bonfire Nights
          </span>
          <span className={styles.heroExperienceIcon}>
            <i className="fa-solid fa-star" aria-hidden="true" />
            Stargazing
          </span>
          <span className={styles.heroExperienceIcon}>
            <i className="fa-solid fa-seedling" aria-hidden="true" />
            Farm To Table
          </span>
        </div>
      </div>
    </section>
  )
}
