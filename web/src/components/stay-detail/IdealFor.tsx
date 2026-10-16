'use client'

import { useEffect, useRef } from 'react'
import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'
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

    return () => ctx.revert()
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
            <div className={styles.idealRow} key={item.id ?? i}>
              <span className={styles.idealNum} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className={styles.idealPhoto}>{image.url && <img src={image.url} alt={image.alt} loading="lazy" />}</div>
              <div className={styles.idealContent}>
                <div className={styles.idealTitle}>{item.title}</div>
                <div className={styles.idealBody}>{item.body}</div>
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
