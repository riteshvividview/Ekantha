'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/realMedia'
import { gsap } from '@/lib/animations/gsap'
import { GalleryLightbox } from '../GalleryLightbox'
import styles from './stone.module.css'

/**
 * Stone House's gallery: a staggered stone-coursing grid (each plate sits a
 * little higher or lower than its neighbour, like coursed masonry). Plates
 * rise up out of their slot as they enter, the photo inside settling from
 * a slight zoom, and a small roman numeral marks each one. Tap a plate to
 * view it full screen.
 */
export function Gallery({ items, title }: { items: Stay['gallery']; title: string }) {
  const gallery = items ?? []
  const sectionRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState<{ index: number; from: DOMRect | null } | null>(null)
  const photos = gallery.map((item) => ({ url: resolveMedia(item.image).url, caption: item.caption }))

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !gallery.length) return undefined
    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      section.querySelectorAll(`.${styles.brickItem}`).forEach((item, i) => {
        const plate = item.querySelector(`.${styles.brickPlate}`)
        const img = item.querySelector('img')
        const st = { trigger: item, start: 'top 90%', once: true }
        gsap.fromTo(plate, { clipPath: 'inset(100% 0% 0% 0% round 14px)' }, { clipPath: 'inset(0% 0% 0% 0% round 14px)', duration: 1.1, ease: 'power4.inOut', delay: (i % 4) * 0.08, scrollTrigger: st })
        if (img) gsap.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 1.6, ease: 'power3.out', delay: (i % 4) * 0.08, scrollTrigger: st })
        gsap.from(item.querySelector(`.${styles.brickCaption}`), { y: 12, opacity: 0, duration: 0.7, delay: 0.5 + (i % 4) * 0.08, scrollTrigger: st })
      })
    }, section)
    return () => ctx.revert()
  }, [gallery.length])

  if (!gallery.length) return null

  return (
    <section className="bg-silver" id="gallery" ref={sectionRef}>
      <div className="section-head reveal">
        <h2 className={`section-title ${styles.sectionTitle}`}>a glimpse <em>inside.</em></h2>
        <p>
          {title}, in {gallery.length} small moments.
        </p>
      </div>

      <div className={styles.brickGrid}>
        {gallery.map((item, i) => {
          const image = resolveMedia(item.image)
          return (
            <div className={styles.brickItem} key={item.id ?? i}>
              <button
                type="button"
                className={styles.brickPlate}
                aria-label={`View photo: ${item.caption}`}
                onClick={(e) => setOpen({ index: i, from: e.currentTarget.getBoundingClientRect() })}
              >
                {image.url && <Image src={image.url} alt={item.caption} fill sizes="(max-width: 768px) 100vw, 40vw" quality={90} style={{ objectFit: 'cover' }} />}
                <span className={styles.brickNumeral} aria-hidden="true" />
              </button>
              <p className={styles.brickCaption}>{item.caption}</p>
            </div>
          )
        })}
      </div>

      {open && (
        <GalleryLightbox photos={photos} index={open.index} from={open.from} onIndex={(index) => setOpen({ ...open, index })} onClose={() => setOpen(null)} />
      )}
    </section>
  )
}
