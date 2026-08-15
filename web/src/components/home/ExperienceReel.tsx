'use client'

import { useEffect, useRef } from 'react'
import type { Home } from '@/payload-types'
import { DragScrollTrack } from '@/components/shared/DragScrollTrack'
import { resolveMediaSize } from '@/lib/media'
import { gsap, ScrollTrigger } from '@/lib/animations/gsap'
import { experienceGlow } from '@/lib/animations/theatre/project'
import styles from './home.module.css'

const MOBILE_BREAKPOINT = '(min-width: 861px)'

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

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return
    return experienceGlow.onValuesChange((values) => {
      glow.style.opacity = String(values.intensity)
    })
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

        <svg className={styles.scatterLines} viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
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
            <ScatterPhoto item={item} slot={SLOTS[i % SLOTS.length]} key={item.id ?? i} />
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
            const media = resolveMediaSize(item.image, 'card')
            return (
              <div className={styles.hCard} key={item.id ?? i}>
                <div className={styles.hCardMedia}>{media.url && <img src={media.url} alt={media.alt} loading="lazy" />}</div>
                <div className={styles.hCardBody}>
                  <div className={styles.hCardTitle}>{item.title}</div>
                  <p className={styles.hCardDesc}>{item.description}</p>
                </div>
              </div>
            )
          })}
        </DragScrollTrack>
      </div>
    </section>
  )
}

function ScatterPhoto({ item, slot }: { item: NonNullable<Home['experience']['items']>[number]; slot: (typeof SLOTS)[number] }) {
  const media = resolveMediaSize(item.image, 'card')
  return (
    <figure className={styles.scatterPhoto} style={{ top: slot.top, left: slot.left, width: slot.width }}>
      <figcaption>{item.title}</figcaption>
      <div className={styles.scatterPhotoMedia}>{media.url && <img src={media.url} alt={media.alt} loading="lazy" />}</div>
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
