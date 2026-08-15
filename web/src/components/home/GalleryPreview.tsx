'use client'

import { useEffect, useRef } from 'react'
import type { Home } from '@/payload-types'
import { SectionHead } from '@/components/shared/SectionHead'
import { resolveMediaSize } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'
import DriftWall, { type DriftWallItem } from './DriftWall'
import styles from './home.module.css'

export function GalleryPreview({ data }: { data: Home['galleryPreview'] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const headRef = useRef<HTMLDivElement>(null)

  const items: DriftWallItem[] = (data.images ?? [])
    .map((row): DriftWallItem | null => {
      const media = resolveMediaSize(row.image, 'card')
      return media.url ? { image: media.url, title: media.alt } : null
    })
    .filter((item): item is DriftWallItem => item !== null)

  // The CTA's own magnetic pull + click ripple come from the site-wide
  // `.btn` behavior in InteractionEffects.tsx — only the heading's gentle
  // cursor-follow drift is bespoke to this section.
  useEffect(() => {
    const section = sectionRef.current
    const head = headRef.current
    if (!section || !head || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const moveHeadX = gsap.quickTo(head, 'x', { duration: 0.7, ease: 'power3.out' })
    const moveHeadY = gsap.quickTo(head, 'y', { duration: 0.7, ease: 'power3.out' })

    const onSectionMove = (e: PointerEvent) => {
      const rect = section.getBoundingClientRect()
      const relX = (e.clientX - rect.left) / rect.width - 0.5
      const relY = (e.clientY - rect.top) / rect.height - 0.5
      moveHeadX(relX * 18)
      moveHeadY(relY * 12)
    }
    const onSectionLeave = () => {
      moveHeadX(0)
      moveHeadY(0)
    }

    section.addEventListener('pointermove', onSectionMove)
    section.addEventListener('pointerleave', onSectionLeave)

    return () => {
      section.removeEventListener('pointermove', onSectionMove)
      section.removeEventListener('pointerleave', onSectionLeave)
    }
  }, [])

  return (
    <section className={styles.galleryHeroSection} id="gallery" ref={sectionRef}>
      {items.length > 0 && (
        <div className={styles.galleryWallFull}>
          <DriftWall
            items={items}
            columns={6}
            tileWidth={272}
            tileHeight={176}
            gap={18}
            tilt={40}
            turn={-7}
            perspective={2400}
            depth={120}
            speed={42}
            direction="up"
            variance={1}
            parallax={1}
            lift={40}
            fade={0.3}
            dim={0.7}
            overlayColor="#faf0e6"
            radius={7}
            roll={-20}
          />
        </div>
      )}

      <div className={styles.galleryOverlay}>
        <div ref={headRef}>
          <SectionHead title={renderTitle(data.heading)} sub={data.sub} />
        </div>

        {data.ctaHref && (
          <a href={data.ctaHref} className="btn btn-primary">
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
