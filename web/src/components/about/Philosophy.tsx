'use client'

import { useEffect, useRef } from 'react'
import type { About } from '@/payload-types'
import { gsap } from '@/lib/animations/gsap'
import { Landscape, MangoSprig, Toast, Envelope, EstateMap, Icon } from '../illustrations/Line'
import styles from './about.module.css'

/**
 * Four stacked slabs, one value at a time — each big word scales up out
 * of a slightly smaller, fainter state as it crosses into view, like a
 * principle settling into focus rather than sliding onto a card. Kept
 * deliberately slow and one-directional (no pin, no scrub) so the page
 * reads like turning a page of a manifesto, not a feature list.
 */
export function Philosophy({ data }: { data: About['philosophy'] }) {
  const slabs = data ?? []
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      section.querySelectorAll(`.${styles.philoSlab}`).forEach((item) => {
        gsap.from(item.querySelectorAll(`.${styles.philoNum}, .${styles.philoWord}, .${styles.philoBody}`), {
          opacity: 0,
          y: 18,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: item, start: 'top 78%', once: true },
        })
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section id="philosophy" ref={sectionRef}>
      <div className={styles.philoGrid}>
      {slabs.map((slab, i) => (
        <div className={styles.philoSlab} key={slab.id ?? i}>
          <Icon name={(['leaf', 'moon', 'path', 'house'] as const)[i % 4]} className={styles.philoIcon} />
          <div>
            <div className={styles.philoNum}>{slab.number}</div>
            <div className={styles.philoWord}>{slab.word}</div>
          </div>
          <p className={styles.philoBody} dangerouslySetInnerHTML={{ __html: slab.body }} />
        </div>
      ))}
      </div>
    </section>
  )
}
