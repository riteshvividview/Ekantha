'use client'

import { useEffect, useRef } from 'react'
import type { StayPage } from '@/payload-types'
import { DragScrollTrack } from '@/components/shared/DragScrollTrack'
import { resolveMediaSize } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'
import styles from './stay.module.css'

/**
 * Amenities' own motion concept, distinct from the orbs in the hero and
 * the progress rails in the stays catalog: cards fan in on a slight tilt
 * as the rail enters view, each card tilts live in 3D toward the pointer
 * on hover, and a thin progress bar under the rail tracks how far you've
 * dragged — reinforcing that the rail is draggable, not just decorative.
 */
export function Amenities({ data }: { data: StayPage['amenities'] }) {
  const items = data.items ?? []
  const sectionRef = useRef<HTMLElement>(null)
  const trackWrapRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // gsap.context + ctx.revert() (not just ad-hoc tweens) so React Strict
    // Mode's dev-only double-invoke of this effect can't leave a second,
    // orphaned set of ScrollTrigger-driven tweens racing the first set on
    // the same cards — that's what was causing the entrance to stall at a
    // few percent opacity instead of completing to fully visible.
    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll('.section-head'), {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 85%', once: true },
      })

      const cards = Array.from(section.querySelectorAll<HTMLElement>(`.${styles.hCard}`))
      if (reduced) return undefined

      gsap.from(cards, {
        opacity: 0,
        y: 36,
        rotate: (i) => (i % 2 === 0 ? -3 : 3),
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
      })

      // Live pointer-tilt per card.
      gsap.set(cards, { transformPerspective: 800, transformStyle: 'preserve-3d' })
      const cleanups = cards.map((card) => {
        const quickX = gsap.quickTo(card, 'rotateY', { duration: 0.4, ease: 'power3.out' })
        const quickY = gsap.quickTo(card, 'rotateX', { duration: 0.4, ease: 'power3.out' })
        const onMove = (e: PointerEvent) => {
          const rect = card.getBoundingClientRect()
          const px = (e.clientX - rect.left) / rect.width - 0.5
          const py = (e.clientY - rect.top) / rect.height - 0.5
          quickX(px * 10)
          quickY(py * -10)
        }
        const onLeave = () => {
          quickX(0)
          quickY(0)
        }
        card.addEventListener('pointermove', onMove)
        card.addEventListener('pointerleave', onLeave)
        return () => {
          card.removeEventListener('pointermove', onMove)
          card.removeEventListener('pointerleave', onLeave)
        }
      })
      return () => cleanups.forEach((fn) => fn())
    }, section)

    return () => ctx.revert()
  }, [])

  // Drag progress bar — mirrors the track's own scroll position, independent
  // of the reduced-motion check above since it's a plain scroll listener,
  // not a decorative animation.
  useEffect(() => {
    const wrap = trackWrapRef.current
    const fill = fillRef.current
    if (!wrap || !fill) return undefined
    const track = wrap.querySelector<HTMLElement>('.h-track')
    if (!track) return undefined

    const update = () => {
      const max = track.scrollWidth - track.clientWidth
      const pct = max > 0 ? track.scrollLeft / max : 0
      fill.style.transform = `scaleX(${Math.min(1, Math.max(0, pct))})`
    }
    update()
    track.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(track)
    return () => {
      track.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [])

  return (
    <section className="bg-silver" id="amenities" ref={sectionRef}>
      <div className="section-head">
        <h2 className={`section-title ${styles.sectionTitle}`}>{renderHeading(data.heading)}</h2>
        {data.sub && <p>{data.sub}</p>}
      </div>

      <div ref={trackWrapRef}>
        <DragScrollTrack>
          {items.map((item, i) => {
            const media = resolveMediaSize(item.image, 'card')
            return (
              <div className={styles.hCard} key={item.id ?? i}>
                <div className={styles.hCardMedia}>{media.url && <img src={media.url} alt={media.alt} loading="lazy" />}</div>
                <div className={styles.hCardContent}>
                  <div className={styles.hCardTitle}>{item.title}</div>
                  <p className={styles.hCardDesc}>{item.description}</p>
                </div>
              </div>
            )
          })}
        </DragScrollTrack>
      </div>

      <div className={styles.dragProgress} aria-hidden="true">
        <div className={styles.dragProgressFill} ref={fillRef} />
      </div>
    </section>
  )
}

/** Italicizes the last word, matching "included <em>amenities.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
