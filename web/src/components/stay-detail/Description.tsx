'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'
import styles from './stay-detail.module.css'

/**
 * Mango House's description reads like a slow walk through the grove: the
 * accent portrait drifts gently inside its frame as you scroll past it
 * (instead of sitting still), and the pull-quote grows a thin ink line
 * down its side rather than wearing a flat static border — a quieter,
 * more hand-drawn echo of the same "line draws in" motif Highlights and
 * IdealFor use elsewhere on this page.
 */
export function Description({ data }: { data: Stay['description'] }) {
  const accentImage = resolveMedia(data.accentImage)
  const paragraphs = data.paragraphs ?? []
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      const quoteLine = section.querySelector(`.${styles.introQuoteLine}`)
      if (quoteLine) {
        gsap.fromTo(
          quoteLine,
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: { trigger: quoteLine, start: 'top 85%', once: true },
          },
        )
      }

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const frameImg = section.querySelector(`.${styles.introAccentImg} img`)
      if (frameImg) {
        gsap.fromTo(
          frameImg,
          { scale: 1.12, yPercent: -5 },
          {
            scale: 1.02,
            yPercent: 5,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      }
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.intro} id="description" ref={sectionRef}>
      <div className={styles.introInner}>
        <div className={`${styles.introLeft} reveal`}>
          <span className="eyebrow">{data.eyebrow}</span>
          {data.pullHeadline && <p className={styles.introPull}>{renderPull(data.pullHeadline)}</p>}
          {accentImage.url && (
            <div className={styles.introAccentImg}>
              <Image src={accentImage.url} alt={accentImage.alt} fill sizes="(max-width: 768px) 100vw, 40vw" style={{ objectFit: 'cover' }} />
            </div>
          )}
        </div>

        <div className={styles.introBody}>
          <p className="reveal">{data.intro}</p>

          <blockquote className={`${styles.introQuote} reveal`}>
            <span className={styles.introQuoteLine} aria-hidden="true" />
            &ldquo;{data.pullQuote}&rdquo;
          </blockquote>

          {paragraphs.map((p, i) => (
            <p className="reveal" key={p.id ?? i}>
              {p.text}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

/** "Breakfast, some mornings,\nis just what fell." → line break on `\n`,
 *  last word of the last line italicized. */
function renderPull(headline: string) {
  const lines = headline.split('\n')
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
