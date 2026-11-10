'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/realMedia'
import { gsap } from '@/lib/animations/gsap'
import { riseTitle } from '@/lib/animations/sectionMotion'
import { GalleryLightbox } from './GalleryLightbox'
import styles from './stay-detail.module.css'

/**
 * Mango House's gallery opens like dappled light through the grove: each
 * photo irises in through a soft clip-path instead of a flat fade, and
 * each photo drifts inside its own frame while
 * you scroll past — a gentle, uneven rhythm (not the uniform masonry
 * entrance a denser "stay" catalog would use) that matches a page about a
 * small, quiet cottage rather than a full estate.
 */
export function Gallery({ items, title }: { items: Stay['gallery']; title: string }) {
  const gallery = items ?? []
  const sectionRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState<{ index: number; from: DOMRect | null } | null>(null)
  const photos = gallery.map((item) => ({ url: resolveMedia(item.image).url, caption: item.caption }))

  useEffect(() => {
    if (!gallery.length) return undefined
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      const tiles = section.querySelectorAll(`.${styles.galleryItem}`)
      gsap.from(tiles, {
        opacity: 0,
        clipPath: 'inset(14% 14% 14% 14%)',
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: section, start: 'top 85%', once: true },
      })

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      riseTitle(section)

      // Parallax lives inside each frame (the photo drifts, the tile
      // stays put), so tiles never slide into one another.
      tiles.forEach((tile, i) => {
        const img = tile.querySelector('img')
        if (!img) return
        const speed = i % 2 === 0 ? 7 : -7
        gsap.fromTo(
          img,
          { yPercent: -speed, scale: 1.18 },
          {
            yPercent: speed,
            scale: 1.18,
            ease: 'none',
            scrollTrigger: { trigger: tile, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
    }, section)

    return () => ctx.revert()
  }, [gallery.length])

  if (!gallery.length) return null

  return (
    <section className="bg-silver" id="gallery" ref={sectionRef}>
      <div className="section-head reveal">
        <h2 className={`section-title ${styles.sectionTitle}`}>a glimpse {italic('inside.')}</h2>
        <p>
          {title}, in {gallery.length} small moments.
        </p>
      </div>

      <div className={styles.galleryMasonry}>
        {gallery.map((item, i) => {
          const image = resolveMedia(item.image)
          return (
            <button
              type="button"
              className={styles.galleryItem}
              style={{ aspectRatio: item.aspectRatio ?? '4/3' }}
              key={item.id ?? i}
              onClick={(e) => setOpen({ index: i, from: e.currentTarget.getBoundingClientRect() })}
              aria-label={`View photo: ${item.caption}`}
            >
              {image.url && <Image src={image.url} alt={item.caption} fill sizes="(max-width: 768px) 50vw, 33vw" style={{ objectFit: 'cover' }} />}
              <div className={styles.galleryScrim} aria-hidden="true" />
              <p className={styles.galleryCaption}>{item.caption}</p>
              <span className={styles.galleryView} aria-hidden="true">View</span>
            </button>
          )
        })}
      </div>
      {open && (
        <GalleryLightbox
          photos={photos}
          index={open.index}
          from={open.from}
          onIndex={(index) => setOpen({ index, from: null })}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  )
}

function italic(text: string) {
  return <em>{text}</em>
}
