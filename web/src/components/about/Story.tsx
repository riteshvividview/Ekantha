'use client'

import { useEffect, useRef } from 'react'
import type { About } from '@/payload-types'
import { gsap } from '@/lib/animations/gsap'
import styles from './about.module.css'

/**
 * The name itself is the content here, so the motion treats it like a
 * dictionary entry being underlined as you read it: each gloss word gets
 * a hairline underline that draws in, tied to scroll rather than firing
 * once — a small, literal "tracing the word" gesture that wouldn't make
 * sense on any of the booking pages. The paragraphs on the right settle
 * in one at a time, slower than a standard stagger, to keep the reading
 * pace deliberate rather than snappy.
 */
export function Story({ data }: { data: About['story'] }) {
  const glosses = data?.wordGlosses ?? []
  const paragraphs = data?.paragraphs ?? []
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll(`.${styles.storyLeft}`), {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 82%', once: true },
      })

      const paras = section.querySelectorAll(`.${styles.storyBody} p`)
      paras.forEach((p) => {
        gsap.from(p, {
          opacity: 0,
          y: 22,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: p, start: 'top 88%', once: true },
        })
      })

      const underlines = section.querySelectorAll(`.${styles.storyUnderline}`)

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(underlines, { scaleX: 1 })
        return
      }

      underlines.forEach((line) => {
        gsap.fromTo(
          line,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'power2.out',
            scrollTrigger: { trigger: line, start: 'top 80%', end: 'top 50%', scrub: true },
          },
        )
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.story} id="name" ref={sectionRef}>
      <div className={styles.storyInner}>
        <div className={styles.storyLeft}>
          <span className="eyebrow">the name</span>
          {glosses.map((g, i) => (
            <div className={styles.storyWord} style={i > 0 ? { marginTop: '1.5rem' } : undefined} key={g.id ?? g.word}>
              {g.word}
              <span className={styles.storyUnderline} aria-hidden="true" />
              <span>{g.translation}</span>
            </div>
          ))}
        </div>

        <div className={styles.storyBody}>
          {paragraphs.map((p, i) => (
            <p key={p.id ?? i} dangerouslySetInnerHTML={{ __html: p.text }} />
          ))}
        </div>
      </div>
    </section>
  )
}
