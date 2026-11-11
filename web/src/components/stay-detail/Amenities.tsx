'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Stay } from '@/payload-types'
import { resolveMediaSize } from '@/lib/realMedia'
import { gsap } from '@/lib/animations/gsap'
import { riseTitle } from '@/lib/animations/sectionMotion'
import styles from './stay-detail.module.css'

/**
 * On wide screens the section pins and vertical scroll drives the card rail
 * sideways, with a counter and progress line; each card's photo drifts
 * against the rail for depth. Phones keep the native swipe rail.
 */
export function Amenities({ data }: { data: Stay['amenitiesSection'] }) {
  const items = data?.items ?? []
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!items.length) return undefined
    const section = sectionRef.current
    if (!section) return undefined
    const track = section.querySelector<HTMLElement>(`.${styles.amScroll}`)
    const bar = section.querySelector<HTMLElement>(`.${styles.amBarFill}`)
    const count = section.querySelector<HTMLElement>(`.${styles.amCount} b`)
    if (!track) return undefined

    const mm = gsap.matchMedia(section)
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      riseTitle(section)
      gsap.fromTo(
        section.querySelectorAll(`.${styles.amCard}`),
        { opacity: 0, y: 40, rotate: (i: number) => (i % 2 === 0 ? -2.5 : 2.5) },
        {
          opacity: 1,
          y: 0,
          rotate: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: section, start: 'top 75%', once: true },
        },
      )
    })
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      // An overflow-visible track reports no scroll width, so measure from
      // the last card's right edge (plus the trailing page gutter).
      const distance = () => {
        const last = track.lastElementChild as HTMLElement | null
        if (!last) return 0
        const gutter = parseFloat(getComputedStyle(track).paddingRight) || 0
        const shift = Number(gsap.getProperty(track, 'x')) || 0
        return Math.max(0, last.getBoundingClientRect().right - shift - track.getBoundingClientRect().left + gutter - track.clientWidth)
      }
      // Pin only once the whole section (cards' text included) is on
      // screen: if it's taller than the viewport, wait for its bottom.
      const start = () => (section.offsetHeight > window.innerHeight ? 'bottom bottom' : 'top top')
      // One timeline drives both the rail and the photos inside the cards,
      // so the parallax moves with the scroll instead of catching up after.
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start,
          end: () => `+=${distance()}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (bar) bar.style.transform = `scaleX(${self.progress})`
            if (count) count.textContent = String(Math.min(items.length, Math.floor(self.progress * items.length) + 1)).padStart(2, '0')
          },
        },
      })
      tl.to(track, { x: () => -distance(), duration: 1 }, 0)
      tl.fromTo(section.querySelectorAll(`.${styles.amMedia} img`), { xPercent: -8, scale: 1.18 }, { xPercent: 8, scale: 1.18, duration: 1 }, 0)
    })

    return () => mm.revert()
  }, [items.length])

  if (!items.length) return null

  return (
    <section className={styles.amSection} id="amenities" ref={sectionRef}>
      <div className={styles.amHead}>
        <div className="section-head reveal">
          <h2 className={`section-title ${styles.sectionTitle}`}>Amenities &amp; {italic('inclusions.')}</h2>
          <p>Everything below comes with the room. Nothing here needs to be requested twice.</p>
        </div>
        <div className={styles.amMeter} aria-hidden="true">
          <span className={styles.amCount}>
            <b>01</b> / {String(items.length).padStart(2, '0')}
          </span>
          <span className={styles.amBar}>
            <i className={styles.amBarFill} />
          </span>
        </div>
      </div>

      {data?.hint && <p className={`${styles.amHint} reveal`}>{data.hint}</p>}
      <div className={styles.amScroll}>
        {items.map((item, i) => {
          const media = resolveMediaSize(item.image, 'card')
          return (
            <div className={styles.amCard} key={item.id ?? i}>
              <div className={styles.amMedia}>{media.url && <Image src={media.url} alt={media.alt} fill sizes="(max-width: 768px) 80vw, 30vw" style={{ objectFit: 'cover' }} />}</div>
              <div className={styles.amContent}>
                <span className={styles.amIndex}>{String(i + 1).padStart(2, '0')}</span>
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
