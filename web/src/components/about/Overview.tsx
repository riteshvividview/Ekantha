'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { About } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import { CountUp } from '@/components/shared/CountUp'
import { gsap } from '@/lib/animations/gsap'
import styles from './about.module.css'

/**
 * The page closes by stepping out of the reflective voice into plain
 * facts — so this is the one section that behaves like the rest of the
 * site's dark closing panels: a slow image drift, facts counting up and
 * settling in one after another, grounding everything the page just
 * said in acreage and numbers.
 */
export function Overview({ data }: { data: About['overview'] }) {
  const facts = data.facts ?? []
  const image = resolveMedia(data.image)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll('.eyebrow, .section-title'), {
        opacity: 0,
        y: 20,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: section, start: 'top 80%', once: true },
      })

      gsap.from(section.querySelectorAll(`.${styles.overviewFact}`), {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1,
        delay: 0.15,
        scrollTrigger: { trigger: section, start: 'top 78%', once: true },
      })

      gsap.from(section.querySelectorAll(`.${styles.overviewVisual}`), {
        opacity: 0,
        y: 24,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 78%', once: true },
      })

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const img = section.querySelector(`.${styles.overviewVisual} img`)
      if (img) {
        gsap.fromTo(
          img,
          { scale: 1.1, yPercent: -3 },
          {
            scale: 1.0,
            yPercent: 3,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      }
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.overview} id="overview" ref={sectionRef}>
      <div className={styles.overviewGrid}>
        <div>
          <span className="eyebrow">{data.eyebrow}</span>
          <h2 className={`section-title ${styles.sectionTitle}`} style={{ color: 'var(--white)', marginTop: '1rem' }}>
            {renderHeading(data.heading)}
          </h2>

          <div className={styles.overviewFacts}>
            {facts.map((fact, i) => (
              <div className={styles.overviewFact} key={fact.id ?? i}>
                <div className={styles.num}><CountUp value={fact.number} /></div>
                <div className={styles.label}>{fact.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.overviewVisual}>{image.url && <Image src={image.url} alt={image.alt} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />}</div>
      </div>
    </section>
  )
}

/** "eleven acres,\nin plain numbers." → line break on `\n`, last word of
 *  the last line italicized. */
function renderHeading(heading: string) {
  const lines = heading.split('\n')
  return lines.map((line, i, arr) => (
    <span key={i}>
      {i < arr.length - 1 ? line : renderLastLine(line)}
      {i < arr.length - 1 && <br />}
    </span>
  ))
}

function renderLastLine(line: string) {
  const words = line.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
