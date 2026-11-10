'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { StayPage } from '@/payload-types'
import { resolveMedia } from '@/lib/realMedia'
import { gsap } from '@/lib/animations/gsap'
import styles from './stay.module.css'

/**
 * Included amenities as a bento grid: the first amenity is a large feature
 * tile, the rest are photo tiles with their copy laid over a soft scrim.
 * Tiles fade up in a short stagger; on hover the photo settles in closer.
 */
export function Amenities({ data }: { data: StayPage['amenities'] }) {
  const items = data.items ?? []
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll('.section-head'), {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 85%', once: true },
      })
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.from(section.querySelectorAll(`.${styles.amTile}`), {
        opacity: 0,
        y: 36,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: section.querySelector(`.${styles.amBento}`), start: 'top 82%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className="bg-silver" id="amenities" ref={sectionRef}>
      <div className="section-head">
        <h2 className={`section-title ${styles.sectionTitle}`}>{renderHeading(data.heading)}</h2>
        {data.sub && <p>{data.sub}</p>}
      </div>

      <div className={styles.amBento}>
        {items.map((item, i) => {
          const media = resolveMedia(item.image)
          return (
            <article className={styles.amTile} key={item.id ?? i}>
              {media.url && (
                <Image className={styles.amTileImg} src={media.url} alt={media.alt} fill sizes={i === 0 ? '(max-width: 900px) 100vw, 50vw' : '(max-width: 560px) 100vw, (max-width: 900px) 50vw, 25vw'} quality={90} style={{ objectFit: 'cover' }} />
              )}
              <span className={styles.amTileNum}>{String(i + 1).padStart(2, '0')}</span>
              <div className={styles.amTileText}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </article>
          )
        })}
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
