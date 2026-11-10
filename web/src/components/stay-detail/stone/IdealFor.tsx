'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/realMedia'
import { gsap } from '@/lib/animations/gsap'
import styles from './stone.module.css'

/**
 * Stone House's alternating image/text rows, generously spaced. Each row
 * carries a thin rule down its text side — the kind of line ruled in the
 * margin of a notebook — that draws itself in as the row scrolls into
 * view, rather than sitting there pre-drawn; a small, quiet nod to the
 * "writer's house" with a desk by the window. Each photo wipes open from
 * alternating sides and drifts gently inside its frame.
 */
export function IdealFor({ items, title }: { items: Stay['idealFor']; title: string }) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      section.querySelectorAll(`.${styles.indexCard}`).forEach((card, i) => {
        const st = { trigger: card, start: 'top 82%', once: true }
        const fromLeft = i % 2 === 0
        // The photo wipes open from alternating sides, like a page turning.
        gsap.fromTo(
          card.querySelector(`.${styles.indexPhoto}`),
          { clipPath: fromLeft ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'power4.inOut', scrollTrigger: st },
        )
        gsap.fromTo(card.querySelector(`.${styles.indexRule}`), { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: 'power2.out', delay: 0.4, scrollTrigger: st })
        gsap.from(card.querySelectorAll(`.${styles.indexTitle}, .${styles.indexBody}`), { y: 20, opacity: 0, duration: 0.8, stagger: 0.1, delay: 0.5, ease: 'power3.out', scrollTrigger: st })
        const img = card.querySelector('img')
        if (img) {
          gsap.fromTo(img, { yPercent: -6, scale: 1.15 }, {
            yPercent: 6, scale: 1.15, ease: 'none',
            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
          })
        }
      })
    }, section)

    return () => {
      ctx.revert()
    }
  }, [])

  const idealFor = items ?? []
  if (!idealFor.length) return null

  return (
    <section id="ideal-for" ref={sectionRef}>
      <div className="section-head reveal">
        <h2 className={`section-title ${styles.sectionTitle}`}>ideal <em>for.</em></h2>
        <p>{title} suits a particular kind of guest — here&apos;s how to tell if that&apos;s you.</p>
      </div>

      <div className={styles.indexGrid}>
        {idealFor.map((item, i) => {
          const image = resolveMedia(item.image)
          return (
            <div className={styles.indexCard} key={item.id ?? i}>
              <div className={styles.indexPhoto}>{image.url && <Image src={image.url} alt={image.alt} fill sizes="(max-width: 560px) 100vw, 60vw" quality={90} style={{ objectFit: 'cover' }} />}</div>
              <div className={styles.indexContent}>
                <span className={styles.indexRule} aria-hidden="true" />
                <div className={styles.indexTitle}>{item.title}</div>
                <div className={styles.indexBody}>{item.body}</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
