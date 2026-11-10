'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { Stay } from '@/payload-types'
import { resolveMedia } from '@/lib/realMedia'
import { gsap } from '@/lib/animations/gsap'
import { PAGE_DARK, PAGE_LIGHT, THEME_SECONDS } from '@/lib/pageTheme'
import { GalleryLightbox } from '../GalleryLightbox'
import { assetUrl } from '@/lib/assetUrl'
import styles from './full.module.css'

/** Full House's hero photo + strip of smaller plates — matches
 *  FullHouse.html's `.gallery-hero` / `.gallery-strip` design. Reuses the
 *  same `gallery` field Mango House's masonry and Stone House's brick grid
 *  use; the first item becomes the hero, the rest fill the strip. This is
 *  also the page's one deliberate light↔dark crossfade (the same body-tween
 *  pattern /stay's WhyStay uses): the whole page dips to a warm near-black
 *  while the estate's gallery plays, the way a courtyard turns celebratory
 *  once the lights go down for an evening gathering — then lifts back to
 *  the bright, daytime palette once the section has passed. The big
 *  photo widens to the full row as you scroll; the strip photos come into
 *  focus from a blur. Any photo opens full screen. */
export function Gallery({ items }: { items: Stay['gallery'] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState<{ index: number; from: DOMRect | null } | null>(null)

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

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      // The lead photo shows uncropped; it just fades up once.
      const hero = section.querySelector(`.${styles.galleryHero}`)
      if (hero) {
        gsap.from(hero, { opacity: 0, y: 24, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: hero, start: 'top 88%', once: true } })
      }
      // Strip photos come into focus, like eyes adjusting after the lights
      // go down for the evening.
      const tiles = section.querySelectorAll(`.${styles.galleryItem}`)
      gsap.fromTo(
        tiles,
        { opacity: 0, filter: 'blur(14px)', scale: 1.06 },
        {
          opacity: 1,
          filter: 'blur(0px)',
          scale: 1,
          duration: 1.1,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: { trigger: tiles[0] ?? section, start: 'top 88%', once: true },
          onComplete: () => {
            gsap.set(tiles, { clearProps: 'filter' })
          },
        },
      )
    }, section)

    return () => ctx.revert()
  }, [])

  const gallery = items ?? []
  if (!gallery.length) return null

  const [hero, ...strip] = gallery
  const photos = gallery.map((item) => ({ url: resolveMedia(item.image).url, caption: item.caption }))
  const view = (index: number) => (e: React.MouseEvent<HTMLElement>) => setOpen({ index, from: e.currentTarget.getBoundingClientRect() })
  const heroImage = resolveMedia(hero.image)

  return (
    <section className="bg-silver" id="gallery" ref={sectionRef}>
      <div className="section-head reveal">
        <h2 className={`section-title ${styles.sectionTitle}`}>a glimpse of <em>the estate.</em></h2>
        <p>Full House, in {gallery.length} small moments.</p>
      </div>

      <div className={styles.galleryHero} onClick={view(0)} role="button" tabIndex={0} aria-label={`View photo: ${hero.caption}`}>
        {heroImage.url && <Image src={HERO_SRC} alt={hero.caption} fill sizes="100vw" quality={90} style={{ objectFit: 'cover', objectPosition: '50% 60%' }} />}
        <div className={styles.galleryHeroScrim} aria-hidden="true" />
        <span className={styles.galleryHeroCap}>{hero.caption}</span>
      </div>

      {strip.length > 0 && (
        <div className={styles.galleryStrip}>
          {strip.map((item, i) => {
            const image = resolveMedia(item.image)
            return (
              <div className={styles.galleryItem} key={item.id ?? i}>
                <button type="button" className={styles.galleryPlate} onClick={view(i + 1)} aria-label={`View photo: ${item.caption}`}>
                  {image.url && <Image src={image.url} alt={item.caption} fill sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw" quality={90} style={{ objectFit: 'cover' }} />}
                </button>
                <p className={styles.galleryCaption}>{item.caption}</p>
              </div>
            )
          })}
        </div>
      )}

      {open && (
        <GalleryLightbox photos={photos} index={open.index} from={open.from} onIndex={(index) => setOpen({ ...open, index })} onClose={() => setOpen(null)} />
      )}
    </section>
  )
}

/** Wide aerial of the estate — a true landscape shot, so it shows uncropped at a modest height. */
const HERO_SRC = assetUrl('/images/site/story-background-image-day.jpg')
