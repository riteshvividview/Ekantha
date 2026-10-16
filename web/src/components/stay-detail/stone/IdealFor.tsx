'use client'

import { useEffect, useRef } from 'react'
import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'
import styles from './stone.module.css'

/**
 * Stone House's alternating image/text rows, generously spaced. Each row
 * carries a thin rule down its text side — the kind of line ruled in the
 * margin of a notebook — that draws itself in as the row scrolls into
 * view, rather than sitting there pre-drawn; a small, quiet nod to the
 * "writer's house" with a desk by the window. Photos rest desaturated
 * and warm into colour on hover, same quiet-then-warm language as the
 * rest of the page.
 */
export function IdealFor({ items, title }: { items: Stay['idealFor']; title: string }) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const lines = section.querySelectorAll(`.${styles.indexRule}`)
      lines.forEach((line) => {
        gsap.fromTo(
          line,
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: { trigger: line, start: 'top 85%', once: true },
          },
        )
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
            <div className={`${styles.indexCard} reveal`} key={item.id ?? i}>
              <div className={styles.indexPhoto}>{image.url && <img src={image.url} alt={image.alt} loading="lazy" />}</div>
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
