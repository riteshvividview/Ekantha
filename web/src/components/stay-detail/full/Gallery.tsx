'use client'

import { useEffect, useRef } from 'react'
import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'
import { PAGE_DARK, PAGE_LIGHT, THEME_SECONDS } from '@/lib/pageTheme'
import styles from './full.module.css'

/** Full House's hero photo + strip of smaller plates — matches
 *  FullHouse.html's `.gallery-hero` / `.gallery-strip` design. Reuses the
 *  same `gallery` field Mango House's masonry and Stone House's brick grid
 *  use; the first item becomes the hero, the rest fill the strip. This is
 *  also the page's one deliberate light↔dark crossfade (the same body-tween
 *  pattern /stay's WhyStay uses): the whole page dips to a warm near-black
 *  while the estate's gallery plays, the way a courtyard turns celebratory
 *  once the lights go down for an evening gathering — then lifts back to
 *  the bright, daytime palette once the section has passed. The strip
 *  tiles arrive in a loose stagger rather than a tidy grid-fill, like
 *  photos being set out on a table rather than filed into a catalog. */
export function Gallery({ items }: { items: Stay['gallery'] }) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const ctx = gsap.context(() => {
      gsap.fromTo(document.body, PAGE_LIGHT, {
        ...PAGE_DARK,
        duration: THEME_SECONDS,
        ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 70%', end: 'bottom 50%', toggleActions: 'play reverse play reverse' },
      })

      gsap.from(section.querySelectorAll(`.${styles.galleryHero}`), {
        opacity: 0,
        scale: 0.97,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 85%', once: true },
      })

      const tiles = section.querySelectorAll(`.${styles.galleryItem}`)
      gsap.from(tiles, {
        opacity: 0,
        y: (i) => (i % 2 === 0 ? 34 : 50),
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.09,
        scrollTrigger: { trigger: tiles[0] ?? section, start: 'top 90%', once: true },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  const gallery = items ?? []
  if (!gallery.length) return null

  const [hero, ...strip] = gallery
  const heroImage = resolveMedia(hero.image)

  return (
    <section className="bg-silver" id="gallery" ref={sectionRef}>
      <div className="section-head reveal">
        <h2 className={`section-title ${styles.sectionTitle}`}>a glimpse of <em>the estate.</em></h2>
        <p>Full House, in {gallery.length} small moments.</p>
      </div>

      <div className={styles.galleryHero}>
        {heroImage.url && <img src={heroImage.url} alt={hero.caption} loading="lazy" />}
        <div className={styles.galleryHeroScrim} aria-hidden="true" />
        <span className={styles.galleryHeroCap}>{hero.caption}</span>
      </div>

      {strip.length > 0 && (
        <div className={styles.galleryStrip}>
          {strip.map((item, i) => {
            const image = resolveMedia(item.image)
            return (
              <div className={styles.galleryItem} key={item.id ?? i}>
                <div className={styles.galleryPlate}>{image.url && <img src={image.url} alt={item.caption} loading="lazy" />}</div>
                <p className={styles.galleryCaption}>{item.caption}</p>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
