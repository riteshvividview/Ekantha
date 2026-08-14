'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { Home } from '@/payload-types'
import { SectionHead } from '@/components/shared/SectionHead'
import { resolveMediaSize } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'
import DriftWall, { type DriftWallItem } from './DriftWall'
import styles from './home.module.css'

export function GalleryPreview({ data }: { data: Home['galleryPreview'] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)

  const items: DriftWallItem[] = (data.images ?? [])
    .map((row): DriftWallItem | null => {
      const media = resolveMediaSize(row.image, 'card')
      return media.url ? { image: media.url, title: media.alt } : null
    })
    .filter((item): item is DriftWallItem => item !== null)

  // The heading drifts gently toward the cursor, and the CTA magnetically
  // pulls further toward it within its own hit area — same technique used
  // for the stays-carousel chevron, just lighter on the heading.
  useEffect(() => {
    const section = sectionRef.current
    const head = headRef.current
    const cta = ctaRef.current
    if (!section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const moveHeadX = head ? gsap.quickTo(head, 'x', { duration: 0.7, ease: 'power3.out' }) : null
    const moveHeadY = head ? gsap.quickTo(head, 'y', { duration: 0.7, ease: 'power3.out' }) : null
    const moveCtaX = cta ? gsap.quickTo(cta, 'x', { duration: 0.5, ease: 'power3.out' }) : null
    const moveCtaY = cta ? gsap.quickTo(cta, 'y', { duration: 0.5, ease: 'power3.out' }) : null

    const onSectionMove = (e: PointerEvent) => {
      const rect = section.getBoundingClientRect()
      const relX = (e.clientX - rect.left) / rect.width - 0.5
      const relY = (e.clientY - rect.top) / rect.height - 0.5
      moveHeadX?.(relX * 18)
      moveHeadY?.(relY * 12)
    }
    const onSectionLeave = () => {
      moveHeadX?.(0)
      moveHeadY?.(0)
    }
    const onCtaMove = (e: PointerEvent) => {
      if (!cta) return
      const rect = cta.getBoundingClientRect()
      const relX = e.clientX - (rect.left + rect.width / 2)
      const relY = e.clientY - (rect.top + rect.height / 2)
      moveCtaX?.(relX * 0.4)
      moveCtaY?.(relY * 0.4)
    }
    const onCtaLeave = () => {
      moveCtaX?.(0)
      moveCtaY?.(0)
    }

    section.addEventListener('pointermove', onSectionMove)
    section.addEventListener('pointerleave', onSectionLeave)
    cta?.addEventListener('pointermove', onCtaMove)
    cta?.addEventListener('pointerleave', onCtaLeave)

    return () => {
      section.removeEventListener('pointermove', onSectionMove)
      section.removeEventListener('pointerleave', onSectionLeave)
      cta?.removeEventListener('pointermove', onCtaMove)
      cta?.removeEventListener('pointerleave', onCtaLeave)
    }
  }, [])

  const onCtaPointerDown = useCallback((e: React.PointerEvent<HTMLAnchorElement>) => {
    const btn = e.currentTarget
    const rect = btn.getBoundingClientRect()
    btn.style.setProperty('--ripple-x', `${e.clientX - rect.left}px`)
    btn.style.setProperty('--ripple-y', `${e.clientY - rect.top}px`)
    btn.classList.remove(styles.rippling)
    void btn.offsetWidth // force reflow so the animation restarts on rapid re-clicks
    btn.classList.add(styles.rippling)
    window.setTimeout(() => btn.classList.remove(styles.rippling), 700)
  }, [])

  return (
    <section className={styles.galleryHeroSection} id="gallery" ref={sectionRef}>
      {items.length > 0 && (
        <div className={styles.galleryWallFull}>
          <DriftWall
            items={items}
            columns={5}
            tileWidth={232}
            tileHeight={130}
            gap={18}
            tilt={40}
            turn={-7}
            perspective={2400}
            depth={120}
            speed={42}
            direction="up"
            variance={0.95}
            parallax={2}
            lift={64}
            fade={0}
            dim={0.6}
            overlayColor="#060010"
            radius={7}
            roll={20}
          />
        </div>
      )}

      <div className={styles.galleryOverlay}>
        <div ref={headRef}>
          <SectionHead title={renderTitle(data.heading)} sub={data.sub} dark />
        </div>

        {data.ctaHref && (
          <a
            ref={ctaRef}
            href={data.ctaHref}
            className={`btn btn-on-dark ${styles.galleryCtaFloat}`}
            onPointerDown={onCtaPointerDown}
          >
            {data.ctaLabel}
          </a>
        )}
      </div>
    </section>
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
