'use client'

import { useEffect, useRef } from 'react'
import type { About } from '@/payload-types'
import { gsap } from '@/lib/animations/gsap'
import styles from './about.module.css'

/**
 * About opens with no chrome, no card, no CTA grid up front — just the
 * estate's own voice. Each line of the statement rises in on its own,
 * a beat apart, the way a person reads a manifesto aloud one line at a
 * time rather than all at once; the sub-line and CTAs settle in after,
 * quieter and later than on any transactional page's hero.
 */
export function Manifesto({ data }: { data: About['manifesto'] }) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      const lines = section.querySelectorAll(`.${styles.manifestoStatement} > span`)
      gsap.from(lines, {
        opacity: 0,
        y: 28,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.16,
      })

      gsap.from(section.querySelectorAll(`.${styles.manifestoEyebrow}`), {
        opacity: 0,
        y: 10,
        duration: 0.7,
        ease: 'power2.out',
      })

      gsap.from(section.querySelectorAll(`.${styles.manifestoSub}, .${styles.manifestoCtas}`), {
        opacity: 0,
        y: 16,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        delay: 0.55,
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.manifesto} id="top" ref={sectionRef}>
      <span className={`eyebrow ${styles.manifestoEyebrow}`}>{data.eyebrow}</span>

      <h1 className={styles.manifestoStatement}>{renderStatement(data.headline)}</h1>

      <p className={styles.manifestoSub}>{data.sub}</p>

      <div className={styles.manifestoCtas}>
        {data.primaryCtaHref && (
          <a href={data.primaryCtaHref} className="btn btn-primary">
            {data.primaryCtaLabel}
          </a>
        )}
        {data.secondaryCtaHref && (
          <a href={data.secondaryCtaHref} className="btn btn-ghost">
            {data.secondaryCtaLabel}
          </a>
        )}
      </div>
    </section>
  )
}

/** "You are not entertained.\nYou are undisturbed." → each `\n` becomes a
 *  line break, and the last word of the last line is italicized — matching
 *  "You are not entertained.<br>You are <em>undisturbed.</em>" Each line is
 *  its own <span> so the entrance animation can rise them in one at a time. */
function renderStatement(headline: string) {
  const lines = headline.split('\n')
  return lines.map((line, i, arr) => (
    <span key={i}>
      {i < arr.length - 1 ? line : renderLastLine(line)}
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
