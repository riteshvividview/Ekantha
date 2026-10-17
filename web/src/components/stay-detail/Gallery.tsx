'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'
import styles from './stay-detail.module.css'

/**
 * Mango House's gallery opens like dappled light through the grove: each
 * photo irises in through a soft clip-path instead of a flat fade, and
 * alternating tiles drift up or down at slightly different speeds while
 * you scroll past — a gentle, uneven rhythm (not the uniform masonry
 * entrance a denser "stay" catalog would use) that matches a page about a
 * small, quiet cottage rather than a full estate.
 */
export function Gallery({ items, title }: { items: Stay['gallery']; title: string }) {
  const gallery = items ?? []
  const sectionRef = useRef<HTMLElement>(null)

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

      tiles.forEach((tile, i) => {
        const speed = i % 2 === 0 ? 14 : -14
        gsap.fromTo(
          tile,
          { yPercent: -speed },
          {
            yPercent: speed,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
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
            <div className={styles.galleryItem} style={{ aspectRatio: item.aspectRatio ?? '4/3' }} key={item.id ?? i}>
              {image.url && <Image src={image.url} alt={item.caption} fill sizes="(max-width: 768px) 50vw, 33vw" style={{ objectFit: 'cover' }} />}
              <div className={styles.galleryScrim} aria-hidden="true" />
              <p className={styles.galleryCaption}>{item.caption}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function italic(text: string) {
  return <em>{text}</em>
}
