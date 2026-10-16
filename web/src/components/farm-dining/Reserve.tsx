'use client'

import { useEffect, useRef } from 'react'
import type { FarmDining } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'
import styles from './farm-dining.module.css'

/** The closing beat of the evening: the photo settles into a slow,
 *  near-imperceptible zoom (the fire burning low rather than a hard pan),
 *  a soft ember glow breathes behind the form, and the fields rise in one
 *  unhurried stagger — the same quiet pace as sitting down to the table
 *  itself, not a typical punchy CTA entrance. */
export function Reserve({ data }: { data: FarmDining['reserve'] }) {
  const image = resolveMedia(data.image)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll(`.${styles.reserveFormWrap} > :not(.${styles.reserveEmber})`), {
        opacity: 0,
        y: 22,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: section, start: 'top 75%', once: true },
      })

      gsap.from(section.querySelectorAll(`.${styles.reserveVisual}`), {
        opacity: 0,
        scale: 0.97,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 75%', once: true },
      })

      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const img = section.querySelector(`.${styles.reserveVisual} img`)
        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.04 },
            {
              scale: 1.12,
              ease: 'none',
              scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          )
        }

        const ember = section.querySelector(`.${styles.reserveEmber}`)
        if (ember) {
          gsap.to(ember, {
            opacity: 0.8,
            scale: 1.15,
            duration: 5,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true,
          })
        }
      }
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className={`bg-black ${styles.reserveCta}`} id="reserve" ref={sectionRef}>
      <div className={styles.reserveGrid}>
        <div className={styles.reserveFormWrap}>
          <div className={styles.reserveEmber} aria-hidden="true" />
          <span className="eyebrow">{data.eyebrow}</span>
          <h2 className={`section-title ${styles.sectionTitle}`} style={{ color: 'var(--white)', marginTop: '1rem' }}>
            {renderHeading(data.heading)}
          </h2>

          <form
            className={styles.reserveForm}
            onSubmit={(e) => {
              e.preventDefault()
            }}
          >
            <div className={styles.reserveField}>
              <span className="label">{data.dateLabel}</span>
              <input type="text" placeholder={data.datePlaceholder ?? undefined} />
            </div>
            <div className={styles.reserveField}>
              <span className="label">{data.partySizeLabel}</span>
              <input type="text" placeholder={data.partySizePlaceholder ?? undefined} />
            </div>
            <div className={styles.reserveField}>
              <span className="label">{data.dietaryLabel}</span>
              <input type="text" placeholder={data.dietaryPlaceholder ?? undefined} />
            </div>
            <button type="submit" className="btn btn-on-dark" style={{ width: 'fit-content' }}>
              {data.submitLabel}
            </button>
          </form>

          {data.note && <p className={styles.reserveNote}>{data.note}</p>}
        </div>

        <div className={styles.reserveVisual}>{image.url && <img src={image.url} alt={image.alt} loading="lazy" />}</div>
      </div>
    </section>
  )
}

/** "tell us how many,\nwe'll set the table." → italicizes "how many" and
 *  breaks on `\n`, matching "tell us <em>how many</em>,<br>we'll set the table." */
function renderHeading(heading: string) {
  const lines = heading.split('\n')
  return lines.map((line, i, arr) => (
    <span key={i}>
      {i === 0 ? renderFirstLine(line) : line}
      {i < arr.length - 1 && <br />}
    </span>
  ))
}

function renderFirstLine(line: string) {
  const commaIndex = line.indexOf(',')
  if (commaIndex === -1) return line
  const before = line.slice(0, commaIndex)
  const after = line.slice(commaIndex)
  const words = before.trim().split(' ')
  const last2 = words.splice(-2, 2)
  return (
    <>
      {words.join(' ')} <em>{last2.join(' ')}</em>
      {after}
    </>
  )
}
