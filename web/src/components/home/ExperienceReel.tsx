'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Home } from '@/payload-types'
import { DragScrollTrack } from '@/components/shared/DragScrollTrack'
import { resolveMediaSize } from '@/lib/media'
import { assetUrl } from '@/lib/assetUrl'
import { gsap, ScrollTrigger } from '@/lib/animations/gsap'
import { PAGE_DARK, PAGE_LIGHT } from '@/lib/pageTheme'
import styles from './home.module.css'

const MOBILE_BREAKPOINT = '(min-width: 861px)'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

// LOCAL EXPERIENCE IMAGE OVERRIDE — BEGIN (set the flag to false to restore CMS images)
const USE_LOCAL_EXPERIENCE_IMAGES = true
const LOCAL_EXPERIENCE_IMAGES = [
  assetUrl('/images/home/04-experience-reel/experience-the-estate-img1.JPG'),
  assetUrl('/images/home/04-experience-reel/experience-the-estate-img2.JPG'),
  assetUrl('/images/home/04-experience-reel/experience-the-estate-img3.JPG'),
  assetUrl('/images/home/04-experience-reel/experience-the-estate-img4.JPG'),
  assetUrl('/images/home/04-experience-reel/experience-the-estate-img5.png'),
  assetUrl('/images/home/04-experience-reel/experience-the-estate-img6.png'),
  assetUrl('/images/home/04-experience-reel/experience-the-estate-img7.png'),
]
// LOCAL EXPERIENCE IMAGE OVERRIDE — END

function localExperienceImage(index: number) {
  if (!USE_LOCAL_EXPERIENCE_IMAGES || LOCAL_EXPERIENCE_IMAGES.length === 0) return null
  return LOCAL_EXPERIENCE_IMAGES[index % LOCAL_EXPERIENCE_IMAGES.length]
}

// LOCAL EXPERIENCE TITLE/DESCRIPTION OVERRIDE — BEGIN
// The CMS copy (title/description) was written for a different set of
// photos than the local images above now show at each index — e.g. index 0
// was captioned "Pool" but the local photo there is the mango-tree atrium,
// index 3 was "Indoor Games" over a poolside photo, and so on. Same
// mechanism as the image override, and tied to the same flag: this only
// takes effect where a local image is actually shown, so CMS copy still
// applies to any index that falls back to a CMS photo.
const LOCAL_EXPERIENCE_CONTENT: Array<{ title: string; description: string }> = [
  { title: 'Mango Courtyard', description: 'A mango tree grows straight through the lobby — shade, birdsong, and a quiet first impression.' },
  { title: 'Long Table Dining', description: "Shared plates under the pergola, the farm's own produce passed down a table built for a crowd." },
  { title: 'Shared Meals', description: 'Bowls passed hand to hand, glasses refilled without asking — dinner stretched long on purpose.' },
  { title: 'Poolside', description: 'A quiet, spring-fed pool at the edge of the lawn — best with nothing else planned.' },
  { title: 'Quiet Mornings', description: 'A room built for slow starts — light through the curtains, nowhere to be.' },
  { title: 'The Lounge', description: 'Deep cushions, stone and marble underfoot — the room everyone drifts back to after dinner.' },
  { title: 'Garden Balcony', description: 'A covered balcony wrapped in greenery — morning coffee, or an evening doing nothing much.' },
]

function localExperienceContent(index: number) {
  if (!USE_LOCAL_EXPERIENCE_IMAGES || LOCAL_EXPERIENCE_CONTENT.length === 0) return null
  return LOCAL_EXPERIENCE_CONTENT[index % LOCAL_EXPERIENCE_CONTENT.length]
}
// LOCAL EXPERIENCE TITLE/DESCRIPTION OVERRIDE — END

// Scattered positions within the oversized, pannable field canvas
// (percentages of the field's own box, not the viewport) — ordered so
// earlier items sit toward the top-left, closer to where the field starts,
// and later ones toward the bottom-right, only drawn into view once the
// field has panned. `depth` is a per-photo drift multiplier layered on
// top of the shared pan (1 = moves with the pan exactly, >1 drifts
// further/faster, <1 lags behind) — the actual source of the parallax
// depth, not just a flat plane sliding as one piece.
// Tuned live against the actual page (Chrome, via claude-in-chrome) — every
// value here was checked with a real screenshot after each change, not
// guessed blind. Widths are `vh`-based (not `vw`) on purpose: this whole
// canvas lives inside a viewport-height-locked pinned section, so sizing
// photos off the viewport's HEIGHT is what keeps every photo's computed
// height (aspect-ratio 4/5) safely within that fixed height — sizing off
// width let a photo's real pixel height exceed the field's own box on a
// shorter screen, which is what caused the last photo to visibly clip.
const SLOTS = [
  { top: '18%', left: '5%', width: 'clamp(260px, 26vh, 600px)', depth: 0.8 },
  { top: '13%', left: '37%', width: 'clamp(240px, 22vh, 660px)', depth: 1.15 },
  { top: '30%', left: '61%', width: 'clamp(300px, 30vh, 640px)', depth: 0.9 },
  { top: '46%', left: '19%', width: 'clamp(260px, 26vh, 600px)', depth: 1.1 },
  { top: '55%', left: '45%', width: 'clamp(240px, 22vh, 660px)', depth: 1.0 },
  { top: '62%', left: '69%', width: 'clamp(270px, 28vh, 620px)', depth: 0.85 },
]

/**
 * "Experience The Estate" — a pinned, oversized photo canvas that pans
 * diagonally from its bottom-right toward its top-left as the section
 * scrolls, revealing photos rather than sliding a row of cards. Every
 * photo stays fully sharp/opaque throughout (no fade/blur-by-distance) —
 * the depth comes from each one drifting at its own rate on top of the
 * shared pan, plus a background tint that fades in and a very faint
 * line-art texture behind everything. A skip button (bottom-left, pinned
 * in place throughout) jumps straight past the whole section for anyone
 * who doesn't want to scroll it.
 *
 * Below 861px there's no room to pin (and scroll-jacking feels broken on
 * touch), so it falls back to the plain drag-scroll card row used
 * elsewhere on the site (DragScrollTrack + .hCard).
 *
 * The soft ambient glow is Theatre.js-driven (experienceGlow, see
 * lib/animations/theatre/project.ts) — real wiring, but inert until
 * someone hand-keyframes it in the Studio panel (dev only); Theatre.js
 * has no code-only way to author keyframes. Until then it sits at 0.
 */
export function ExperienceReel({ data }: { data: Home['experience'] }) {
  const items = data.items ?? []
  const sectionRef = useRef<HTMLElement>(null)
  const pinWrapRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLDivElement>(null)
  const bgTintRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const linesRef = useRef<SVGSVGElement>(null)

  // Play a fixed-duration palette transition when the section reaches its
  // trigger, then reverse that same transition when scrolling back above it.
  // Keeping this time-based avoids tying the visible fade to scroll speed.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined
    const ctx = gsap.context(() => {
      gsap.fromTo(document.body, PAGE_DARK, {
        ...PAGE_LIGHT,
        duration: 0.8,
        ease: 'power2.inOut',
        immediateRender: false,
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
          invalidateOnRefresh: true,
        },
      })
    }, section)
    return () => ctx.revert()
  }, [])

  // Dynamically imported, and only in development: @theatre/core (~900KB)
  // has no reason to ship in the production bundle for a glow that's
  // inert in production anyway — see the doc comment above for why. This
  // keeps the dev-only Studio authoring workflow intact without visitors
  // ever downloading the library.
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return undefined
    const glow = glowRef.current
    if (!glow) return undefined
    let unsubscribe: (() => void) | undefined
    let cancelled = false
    import('@/lib/animations/theatre/project').then(({ experienceGlow }) => {
      if (cancelled) return
      unsubscribe = experienceGlow.onValuesChange((values) => {
        glow.style.opacity = String(values.intensity)
      })
    })
    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const pinWrap = pinWrapRef.current
    const field = fieldRef.current
    const bgTint = bgTintRef.current
    if (!section || !pinWrap || !field) return

    const mm = gsap.matchMedia()

    mm.add(MOBILE_BREAKPOINT, () => {
      const photos = Array.from(field.querySelectorAll<HTMLElement>(`.${styles.scatterPhoto}`))
      const photoTweens = photos.map((el, i) => ({
        depth: SLOTS[i % SLOTS.length].depth,
        xTo: gsap.quickTo(el, 'x', { duration: 0.3, ease: 'power2.out' }),
        yTo: gsap.quickTo(el, 'y', { duration: 0.3, ease: 'power2.out' }),
      }))

      // The three background line-art paths draw themselves in as the
      // section scrolls, instead of just sitting there faintly visible the
      // whole time. Each gets its own finish point (not drawn in lockstep)
      // so it reads as three hand-drawn strokes rather than one mechanical
      // sweep, and `getTotalLength()` means this works regardless of each
      // path's actual curve length. DRAW_DIR alternates which END of the
      // path (both defined left-to-right in the `d` data below) each one
      // visibly draws from — 1 keeps the natural start→end (left→right)
      // direction, -1 reverses it (the offset runs -length→0 instead of
      // length→0, which reveals the path from its END backward) — so they
      // don't all sweep the same way.
      const lines = linesRef.current ? Array.from(linesRef.current.querySelectorAll('path')) : []
      const DRAW_FINISH = [0.55, 0.8, 1]
      const DRAW_DIR = [1, -1, 1]
      const lineLengths = lines.map((path, i) => {
        const length = path.getTotalLength()
        const dir = DRAW_DIR[i % DRAW_DIR.length]
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: dir * length })
        return length
      })

      const maxPan = () => ({
        x: field.offsetWidth - pinWrap.clientWidth,
        y: field.offsetHeight - pinWrap.clientHeight,
      })

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${Math.max(maxPan().y, window.innerHeight * 0.8)}`,
        scrub: true,
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const { x, y } = maxPan()
          const p = self.progress
          gsap.set(field, { x: -x * p, y: -y * p })
          photoTweens.forEach(({ xTo, yTo, depth }) => {
            const extra = (depth - 1) * 70
            xTo(-extra * p)
            yTo(-extra * p)
          })
          // Sine in/out rather than a flat ramp: the tint peaks mid-scroll
          // (still a real, felt "background changes as you scroll" moment)
          // but eases back toward 0 by the time the section un-pins — a
          // linear ramp instead peaked exactly at the section's own end,
          // handing off a fully-tinted surface straight into a flat-color
          // section below with no blend, which read as a hard block seam.
          if (bgTint) bgTint.style.opacity = String(Math.sin(p * Math.PI))
          lines.forEach((path, i) => {
            const drawn = clamp(p / DRAW_FINISH[i % DRAW_FINISH.length], 0, 1)
            const dir = DRAW_DIR[i % DRAW_DIR.length]
            path.style.strokeDashoffset = String(dir * lineLengths[i] * (1 - drawn))
          })
          if (counterRef.current && items.length) {
            const idx = Math.min(items.length, Math.max(1, Math.round(p * items.length)))
            counterRef.current.textContent = `${String(idx).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`
          }
        },
      })

      return () => {
        // `kill(true)` — not the no-arg form — explicitly reverts the
        // pin-spacer wrapper ScrollTrigger inserted into the DOM before
        // React's own cleanup runs. Skipping the revert leaves that
        // GSAP-owned DOM restructuring in place, which React then trips
        // over on its next reconciliation (a real "removeChild" crash,
        // not just a dev-only warning).
        trigger.kill(true)
        // Only clear the transform props GSAP itself wrote (x/y, via
        // quickTo above) — NOT `clearProps: 'all'`. That blanket form
        // wipes the element's entire inline `style` attribute, including
        // React's own top/left/width on each photo (set via the `style`
        // prop, not GSAP) — on React Strict Mode's dev-only double-invoke
        // (mount → cleanup → mount), that stripped every photo's width
        // before the page was ever seen, collapsing them to their native
        // image size.
        gsap.set([field, ...photos], { clearProps: 'x,y' })
      }
    })

    return () => mm.revert()
  }, [items.length])

  const skipToNext = () => {
    document.getElementById('stay')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="estate" className={styles.experienceSection} ref={sectionRef}>
      <div className={styles.scatterPinWrap} ref={pinWrapRef}>
        <div className={styles.scatterBgTint} ref={bgTintRef} aria-hidden="true" />

        <svg className={styles.scatterLines} viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true" ref={linesRef}>
          <path d="M-50,150 C150,60 300,260 500,160 C700,60 850,240 1050,150" />
          <path d="M-50,480 C120,390 320,590 520,480 C720,370 880,550 1050,480" />
          <path d="M-50,800 C180,710 340,910 540,800 C740,690 900,870 1050,800" />
        </svg>

        <div className={styles.experienceGlow} ref={glowRef} aria-hidden="true" />

        <div className={styles.scatterField} ref={fieldRef}>
          <div className={styles.scatterHeading}>
            <span className="eyebrow">the estate</span>
            <h2 className={styles.scatterHeadingTitle}>{renderTitle(data.heading)}</h2>
          </div>

          {data.sub && (
            <div className={styles.scatterQuote}>
              <p>{data.sub}</p>
            </div>
          )}

          {items.map((item, i) => (
            <ScatterPhoto item={item} index={i} slot={SLOTS[i % SLOTS.length]} key={item.id ?? i} />
          ))}
        </div>

        <div className={styles.scatterFooter}>
          <span className={styles.scatterCounter} ref={counterRef}>
            01 / {String(items.length).padStart(2, '0')}
          </span>
          <button type="button" className={styles.reelSkip} onClick={skipToNext} aria-label="Skip to the next section">
            <span>skip ahead</span>
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M6,9 L12,15 L18,9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.experienceMobile}>
        <DragScrollTrack>
          {items.map((item, i) => {
            const localImage = localExperienceImage(i)
            const media = localImage ? null : resolveMediaSize(item.image, 'card')
            const content = localImage ? localExperienceContent(i) : null
            const title = content?.title ?? item.title
            const description = content?.description ?? item.description
            return (
              <div className={styles.hCard} key={item.id ?? i}>
                <div className={styles.hCardMedia}>
                  {localImage ? (
                    <Image src={localImage} alt={title} fill sizes="85vw" />
                  ) : (
                    media?.url && <Image src={media.url} alt={media.alt} fill sizes="85vw" style={{ objectFit: 'cover' }} />
                  )}
                  <span className={styles.hCardIndex}>{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className={styles.hCardBody}>
                  <div className={styles.hCardTitle}>{title}</div>
                  <span className={styles.hCardRule} aria-hidden="true" />
                  <p className={styles.hCardDesc}>{description}</p>
                </div>
              </div>
            )
          })}
        </DragScrollTrack>
      </div>
    </section>
  )
}

function ScatterPhoto({
  item,
  index,
  slot,
}: {
  item: NonNullable<Home['experience']['items']>[number]
  index: number
  slot: (typeof SLOTS)[number]
}) {
  const localImage = localExperienceImage(index)
  const media = localImage ? null : resolveMediaSize(item.image, 'card')
  const content = localImage ? localExperienceContent(index) : null
  const title = content?.title ?? item.title
  return (
    <figure className={styles.scatterPhoto} style={{ top: slot.top, left: slot.left, width: slot.width }}>
      <figcaption>{title}</figcaption>
      <div className={styles.scatterPhotoMedia}>
        {localImage ? (
          <Image src={localImage} alt={title} fill sizes="(max-width: 860px) 85vw, 30vw" />
        ) : (
          media?.url && <Image src={media.url} alt={media.alt} fill sizes="(max-width: 860px) 85vw, 30vw" style={{ objectFit: 'cover' }} />
        )}
      </div>
    </figure>
  )
}

function renderTitle(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
