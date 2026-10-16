'use client'

import { useEffect, useRef } from 'react'
import type { About } from '@/payload-types'
import { gsap } from '@/lib/animations/gsap'
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
      const items = section.querySelectorAll(`.${styles.philoSlab}`)
      items.forEach((item) => {
        gsap.from(item.querySelectorAll(`.${styles.philoNum}, .${styles.philoWord}`), {
          opacity: 0,
          y: 18,
          scale: 0.94,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: item, start: 'top 78%', once: true },
        })
        gsap.from(item.querySelectorAll(`.${styles.philoBody}`), {
          opacity: 0,
          y: 18,
          duration: 0.9,
          ease: 'power3.out',
          delay: 0.1,
          scrollTrigger: { trigger: item, start: 'top 78%', once: true },
        })
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section style={{ padding: 0 }} id="philosophy" ref={sectionRef}>
      {slabs.map((slab, i) => (
        <div className={`${styles.philoSlab} ${i % 2 === 0 ? 'bg-white' : 'bg-silver'}`} key={slab.id ?? i}>
          <div>
            <div className={styles.philoNum}>{slab.number}</div>
            <div className={styles.philoWord}>{slab.word}</div>
          </div>
          <p className={styles.philoBody} dangerouslySetInnerHTML={{ __html: slab.body }} />
        </div>
      ))}
    </section>
  )
}
