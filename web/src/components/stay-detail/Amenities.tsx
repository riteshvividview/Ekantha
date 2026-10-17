'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Stay } from '@/payload-types'
import { resolveMediaSize } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'
import styles from './stay-detail.module.css'

/**
 * Cards settle into the rail with a soft, alternating tilt rather than a
 * uniform rise — a small handmade touch that fits a cottage of this size
 * (a handful of things, each noticed on its own) rather than the dense,
 * drag-progress-bar catalog feel of the Stay overview's amenities rail.
 */
export function Amenities({ data }: { data: Stay['amenitiesSection'] }) {
  const items = data?.items ?? []
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!items.length) return undefined
    const section = sectionRef.current
    if (!section) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const ctx = gsap.context(() => {
      const cards = section.querySelectorAll(`.${styles.amCard}`)
      gsap.from(cards, {
        opacity: 0,
        y: 32,
        rotate: (i) => (i % 2 === 0 ? -2.5 : 2.5),
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.09,
        scrollTrigger: { trigger: section, start: 'top 82%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [items.length])

  if (!items.length) return null

  return (
    <section id="amenities" ref={sectionRef}>
      <div className="section-head reveal">
        <h2 className={`section-title ${styles.sectionTitle}`}>amenities &amp; {italic('inclusions.')}</h2>
        <p>Everything below comes with the room. Nothing here needs to be requested twice.</p>
      </div>

      {data?.hint && <p className={`${styles.amHint} reveal`}>{data.hint}</p>}
      <div className={styles.amScroll}>
        {items.map((item, i) => {
          const media = resolveMediaSize(item.image, 'card')
          return (
            <div className={styles.amCard} key={item.id ?? i}>
              <div className={styles.amMedia}>{media.url && <Image src={media.url} alt={media.alt} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} />}</div>
              <div className={styles.amContent}>
                <div className={styles.amTitle}>{item.title}</div>
                <div className={styles.amBody}>{item.body}</div>
              </div>
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
