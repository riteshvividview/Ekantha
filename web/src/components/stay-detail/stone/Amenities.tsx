'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/realMedia'
import { gsap } from '@/lib/animations/gsap'
import { assetUrl } from '@/lib/assetUrl'
import styles from './stone.module.css'

/**
 * Stone House's edge-to-edge photo mosaic, laid like a dry-stone wall: as
 * the section scrolls in, each cell settles into place from a slight tilt,
 * course by course, tied to the scroll so it builds as you read. A faint
 * ember tint warms a cell on hover, and a small roman numeral, pencilled
 * into the corner, stands in for a louder index.
 */
export function Amenities({ data }: { data: Stay['amenitiesSection'] }) {
  const items = data?.items ?? []
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !items.length) return undefined
    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const cells = gsap.utils.toArray<HTMLElement>(`.${styles.amCell}`)
      gsap.fromTo(
        cells,
        { y: 70, rotate: (i: number) => [-3, 2, -1.5, 3, -2, 1.5][i % 6], opacity: 0 },
        {
          y: 0,
          rotate: 0,
          opacity: 1,
          ease: 'power2.out',
          stagger: 0.12,
          scrollTrigger: { trigger: section.querySelector(`.${styles.amMosaic}`), start: 'top 90%', end: 'top 35%', scrub: 0.4 },
        },
      )
      cells.forEach((cell) => {
        const img = cell.querySelector('img')
        if (!img) return
        gsap.fromTo(img, { scale: 1.25 }, {
          scale: 1.05,
          ease: 'none',
          scrollTrigger: { trigger: cell, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
    }, section)
    return () => ctx.revert()
  }, [items.length])

  if (!items.length) return null

  return (
    <section id="amenities" ref={sectionRef}>
      <div className="section-head reveal">
        <h2 className={`section-title ${styles.sectionTitle}`}>amenities &amp; <em>inclusions.</em></h2>
        <p>Everything below comes with the house. Nothing here needs to be requested twice.</p>
      </div>

      <div className={styles.amMosaic}>
        {items.map((item, i) => {
          const media = uniqueMedia(resolveMedia(item.image), i)
          return (
            <div className={styles.amCell} key={item.id ?? i}>
              {media.url && <Image src={media.url} alt={media.alt} fill sizes="(max-width: 768px) 100vw, 50vw" quality={90} style={{ objectFit: 'cover' }} />}
              <span className={styles.amCellNumeral} aria-hidden="true" />
              <div className={styles.amCellEmber} aria-hidden="true" />
              <div className={styles.amCellScrim} aria-hidden="true" />
              <div className={styles.amCellContent}>
                <div className={styles.amCellTitle}>{item.title}</div>
                <div className={styles.amCellBody}>{item.body}</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/** High-res estate photos used when an amenity's photo repeats an earlier one. */
const FALLBACKS = ['/images/site/story-background-image-day.jpg', '/images/site/gallery-preview-bamboo-hero.jpg']
const seen = new Map<number, string>()
function uniqueMedia<T extends { url?: string | null }>(media: T, i: number): T {
  if (i === 0) seen.clear()
  const used = new Set(seen.values())
  let url = media.url ?? ''
  if (url && used.has(url)) {
    const next = FALLBACKS.map((f) => assetUrl(f)).find((f) => !used.has(f))
    if (next) url = next
  }
  seen.set(i, url)
  return { ...media, url }
}
