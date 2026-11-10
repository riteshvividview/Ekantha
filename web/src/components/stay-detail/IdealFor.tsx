'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/realMedia'
import { gsap } from '@/lib/animations/gsap'
import { riseTitle } from '@/lib/animations/sectionMotion'
import styles from './stay-detail.module.css'

/**
 * Each row's circular portrait opens with a soft iris (matching the
 * gallery's clip-path motif above), and the giant italic numeral behind
 * the text drifts a little slower than the row itself as you scroll —
 * a quiet bit of depth rather than a flat watermark, fitting a page built
 * around one small, particular room rather than a full property.
 */
export function IdealFor({ items, title }: { items: Stay['idealFor']; title: string }) {
  const idealFor = items ?? []
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!idealFor.length) return undefined
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      const rows = section.querySelectorAll(`.${styles.idealRow}`)
      gsap.from(rows, {
        opacity: 0,
        y: 30,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: section, start: 'top 82%', once: true },
      })

      const photos = section.querySelectorAll(`.${styles.idealPhoto}`)
      gsap.fromTo(
        photos,
        { clipPath: 'inset(0% 0% 100% 0% round 50%)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 50%)',
          duration: 0.9,
          ease: 'power2.out',
          stagger: 0.12,
          scrollTrigger: { trigger: section, start: 'top 80%', once: true },
        },
      )

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      riseTitle(section)

      section.querySelectorAll(`.${styles.idealNum}`).forEach((num) => {
        gsap.fromTo(
          num,
          { yPercent: -16 },
          {
            yPercent: 16,
            ease: 'none',
            scrollTrigger: { trigger: num, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })
    }, section)

    // Desktop: a large photo follows the cursor over the list, crossfading
    // to whichever row is under it.
    const list = section.querySelector<HTMLElement>(`.${styles.idealList}`)
    const float = section.querySelector<HTMLElement>(`.${styles.idealFloat}`)
    let cleanupFloat = () => {}
    if (list && float && window.matchMedia('(hover: hover) and (min-width: 900px)').matches) {
      const x = gsap.quickTo(float, 'x', { duration: 0.6, ease: 'power3' })
      const y = gsap.quickTo(float, 'y', { duration: 0.6, ease: 'power3' })
      const r = gsap.quickTo(float, 'rotate', { duration: 0.8, ease: 'power3' })
      let lastX = 0
      const onMove = (e: PointerEvent) => {
        const box = list.getBoundingClientRect()
        // The card follows the cursor but never covers the round row photos
        // on the left; it may pass over the row text and the big numbers.
        const cardW = float.offsetWidth
        const offsetX = 110 // matches the CSS margin-left: -110px
        const photoRight = Math.max(
          0,
          ...Array.from(list.querySelectorAll<HTMLElement>(`.${styles.idealPhoto}`)).map((c) => c.getBoundingClientRect().right - box.left),
        )
        const minX = photoRight + 24 + offsetX
        const maxX = Math.max(minX, box.width - cardW + offsetX)
        x(gsap.utils.clamp(minX, maxX, e.clientX - box.left))
        y(e.clientY - box.top)
        r(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.6))
        lastX = e.clientX
        const row = (e.target as Element).closest<HTMLElement>('[data-ideal]')
        if (row) float.dataset.active = row.dataset.ideal
      }
      const onEnter = () => gsap.to(float, { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' })
      const onLeave = () => gsap.to(float, { opacity: 0, scale: 0.85, duration: 0.35, ease: 'power3.in' })
      list.addEventListener('pointermove', onMove)
      list.addEventListener('pointerenter', onEnter)
      list.addEventListener('pointerleave', onLeave)
      cleanupFloat = () => {
        list.removeEventListener('pointermove', onMove)
        list.removeEventListener('pointerenter', onEnter)
        list.removeEventListener('pointerleave', onLeave)
      }
    }

    return () => {
      cleanupFloat()
      ctx.revert()
    }
  }, [idealFor.length])

  if (!idealFor.length) return null

  return (
    <section id="ideal-for" ref={sectionRef}>
      <div className="section-head reveal">
        <h2 className={`section-title ${styles.sectionTitle}`}>ideal {italic('for.')}</h2>
        <p>{title} suits a particular kind of guest — here&apos;s how to tell if that&apos;s you.</p>
      </div>

      <div className={styles.idealList}>
        {idealFor.map((item, i) => {
          const image = resolveMedia(item.image)
          return (
            <div className={styles.idealRow} key={item.id ?? i} data-ideal={i}>
              <span className={styles.idealNum} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className={styles.idealPhoto}>{image.url && <Image src={image.url} alt={image.alt} fill sizes="136px" style={{ objectFit: 'cover' }} />}</div>
              <div className={styles.idealContent}>
                <div className={styles.idealTitle}>{item.title}</div>
                <div className={styles.idealBody}>{item.body}</div>
              </div>
            </div>
          )
        })}
        <div className={styles.idealFloat} data-active="0" aria-hidden="true">
          {idealFor.map((item, i) => {
            const image = resolveMedia(item.image)
            return image.url ? (
              <div className={styles.idealFloatImg} data-i={i} key={item.id ?? i}>
                <Image src={image.url} alt="" fill sizes="320px" style={{ objectFit: 'cover' }} />
              </div>
            ) : null
          })}
        </div>
      </div>
    </section>
  )
}

function italic(text: string) {
  return <em>{text}</em>
}
