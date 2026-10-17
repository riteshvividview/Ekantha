'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/animations/gsap'
import { PAGE_DARK, PAGE_LIGHT, THEME_SECONDS } from '@/lib/pageTheme'
import { assetUrl } from '@/lib/assetUrl'
import styles from './Gallery.module.css'

// Static uploads, not CMS fields — served from R2 under
// images/home/09-gallery-preview/. `hero` is the big scene, `thumb` the
// small arch selector, `frames` the six film-strip photos. While null, each
// renders a gradient scene instead.
const G = assetUrl('/images/home/09-gallery-preview')

const SPACES = [
  {
    key: 'mango',
    name: 'Mango House',
    tagline: 'A perfect blend of space, nature and comfort.',
    href: '/mango-house',
    icon: 'fa-house-chimney',
    perks: [
      { icon: 'fa-water-ladder', label: 'Pool view' },
      { icon: 'fa-tree', label: 'Garden lawn' },
      { icon: 'fa-mountain-sun', label: 'Sunset deck' },
    ],
    hero: `${G}/mango-hero.jpg` as string | null,
    thumb: `${G}/mango-thumb.jpg` as string | null,
    frames: [
      `${G}/mango-1.jpg`,
      `${G}/mango-2.jpg`,
      `${G}/mango-3.jpg`,
      `${G}/mango-4.jpg`,
      `${G}/mango-5.jpg`,
      `${G}/mango-6.jpg`,
    ] as Array<string | null>,
  },
  {
    key: 'stone',
    name: 'Stone House',
    tagline: 'Timeless stone, warm light and quiet corners.',
    href: '/stone-house',
    icon: 'fa-mountain',
    perks: [
      { icon: 'fa-fire', label: 'Fireplace' },
      { icon: 'fa-pen-nib', label: 'Writing desk' },
      { icon: 'fa-cubes', label: 'Stone walls' },
    ],
    hero: `${G}/stone-hero.jpg`,
    thumb: `${G}/stone-thumb.jpg`,
    frames: [
      `${G}/stone-1.jpg`,
      `${G}/stone-2.jpg`,
      `${G}/stone-3.jpg`,
      `${G}/stone-4.jpg`,
      `${G}/stone-5.jpg`,
      `${G}/stone-6.jpg`,
    ],
  },
  {
    key: 'bamboo',
    name: 'Bamboo Dine',
    tagline: 'Long tables, open air and food grown right here.',
    href: '/farm-dining',
    icon: 'fa-utensils',
    perks: [
      { icon: 'fa-utensils', label: 'Farm table' },
      { icon: 'fa-lightbulb', label: 'Lantern light' },
      { icon: 'fa-seedling', label: 'Grown here' },
    ],
    hero: `${G}/bamboo-hero.jpg`,
    thumb: `${G}/bamboo-thumb.jpg`,
    frames: [
      `${G}/bamboo-1.jpg`,
      `${G}/bamboo-2.jpg`,
      `${G}/bamboo-3.jpg`,
      `${G}/bamboo-4.jpg`,
      `${G}/bamboo-5.jpg`,
      `${G}/bamboo-6.jpg`,
    ],
  },
]

const FRAME_ICONS = ['fa-couch', 'fa-bed', 'fa-bath', 'fa-water-ladder', 'fa-tree', 'fa-moon']

export function Gallery() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLSpanElement>(null)
  const firstRun = useRef(true)
  const [space, setSpace] = useState(0)

  const current = SPACES[space]

  const frameStep = useCallback(() => {
    const track = trackRef.current
    const first = track?.querySelector<HTMLElement>('[data-frame]')
    if (!track || !first) return 0
    const gap = parseFloat(getComputedStyle(track).columnGap || '0') || 0
    return first.offsetWidth + gap
  }, [])

  const scrollToFrame = useCallback(
    (i: number) => {
      trackRef.current?.scrollTo({ left: i * frameStep(), behavior: 'smooth' })
    },
    [frameStep],
  )

  const nextFrame = () => {
    const track = trackRef.current
    if (!track) return
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8
    if (atEnd) scrollToFrame(0)
    else track.scrollBy({ left: frameStep(), behavior: 'smooth' })
  }

  // Selecting a different space swaps the title, resets and re-deals the strip.
  useEffect(() => {
    const track = trackRef.current
    const name = nameRef.current
    if (!track || !name) return
    track.scrollTo({ left: 0 })
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(name, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: 'power4.out', overwrite: 'auto' })
    gsap.fromTo(
      track.querySelectorAll('[data-frame]'),
      { opacity: 0, x: 70 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07, overwrite: 'auto' },
    )
  }, [space])

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canHover = window.matchMedia('(hover: hover)').matches
    const q = <T extends Element = HTMLElement>(sel: string) => Array.from(section.querySelectorAll<T>(sel))
    const cleanups: Array<() => void> = []

    // Mouse drag to scroll the strip.
    let dragging = false
    let startX = 0
    let startLeft = 0
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      dragging = true
      startX = e.clientX
      startLeft = track.scrollLeft
      track.style.scrollSnapType = 'none'
      track.style.cursor = 'grabbing'
    }
    const onMove = (e: PointerEvent) => {
      if (dragging) track.scrollLeft = startLeft - (e.clientX - startX)
    }
    const onUp = () => {
      if (!dragging) return
      dragging = false
      track.style.scrollSnapType = ''
      track.style.cursor = ''
      track.scrollTo({ left: Math.round(track.scrollLeft / frameStep()) * frameStep(), behavior: 'smooth' })
    }
    track.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    cleanups.push(() => {
      track.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    })

    const ctx = gsap.context(() => {
      // The page turns dark as this section arrives (scrubbed, so the whole page
      // changes together with no seams). It stays dark through the Location map
      // and returns to light after it — see Reach.tsx.
      // immediateRender: false so it never stomps another section's tween.
      gsap.fromTo(document.body, PAGE_LIGHT, {
        ...PAGE_DARK,
        duration: THEME_SECONDS,
        ease: 'power2.out',
        immediateRender: false,
        scrollTrigger: { trigger: section, start: 'top 82%', toggleActions: 'play none none reverse' },
      })

      if (reduced) return

      gsap.from(q('[data-line-inner]'), {
        yPercent: 115,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.12,
        scrollTrigger: { trigger: section, start: 'top 70%', once: true },
      })
      gsap.from(q('[data-fade]'), {
        opacity: 0,
        y: 22,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.09,
        scrollTrigger: { trigger: section, start: 'top 68%', once: true },
      })
      gsap.from(q('[data-thumb]'), {
        opacity: 0,
        x: -40,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: section, start: 'top 60%', once: true },
      })
      gsap.from(q('[data-strip]'), {
        opacity: 0,
        y: 90,
        duration: 1.3,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 55%', once: true },
      })
      gsap.from(q('[data-hero]'), {
        opacity: 0,
        scale: 1.06,
        duration: 1.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 75%', once: true },
      })

      // Scenes drift against the scroll; the strip's frames stagger up/down.
      gsap.fromTo(
        q('[data-drift]'),
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
      q('[data-frame-shell]').forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: i % 2 ? 16 : -16 },
          {
            y: i % 2 ? -16 : 16,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })

      if (!canHover) return
      // Cursor parallax on the hero scene.
      const heroEl = q('[data-hero]')[0]
      const heroMove = q('[data-hero-move]')
      const xTo = gsap.quickTo(heroMove, 'x', { duration: 1, ease: 'power3' })
      const yTo = gsap.quickTo(heroMove, 'y', { duration: 1, ease: 'power3' })
      const onHeroMove = (e: PointerEvent) => {
        const r = heroEl.getBoundingClientRect()
        xTo(((e.clientX - r.left) / r.width - 0.5) * -22)
        yTo(((e.clientY - r.top) / r.height - 0.5) * -14)
      }
      const onHeroLeave = () => {
        xTo(0)
        yTo(0)
      }
      heroEl.addEventListener('pointermove', onHeroMove)
      heroEl.addEventListener('pointerleave', onHeroLeave)
      cleanups.push(() => {
        heroEl.removeEventListener('pointermove', onHeroMove)
        heroEl.removeEventListener('pointerleave', onHeroLeave)
      })
    }, section)

    return () => {
      cleanups.forEach((fn) => fn())
      ctx.revert()
    }
  }, [frameStep])

  return (
    <section className={styles.gallery} id="gallery" ref={sectionRef}>
      <div className={styles.stage}>
        {/* Big scene, crossfading between spaces. */}
        <div className={styles.hero} data-hero>
          <div className={styles.heroMove} data-hero-move>
            <div className={styles.heroDrift} data-drift>
              {SPACES.map((s, i) => (
                <div
                  className={`${styles.heroLayer} ${styles[`tone_${s.key}`]}${i === space ? ` ${styles.heroLayerOn}` : ''}`}
                  key={s.key}
                  aria-hidden="true"
                >
                  {s.hero ? <img src={s.hero} alt="" /> : <i className={`fa-solid ${s.icon} ${styles.heroIcon}`} />}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.heroFade} aria-hidden="true" />

        {/* Left column */}
        <div className={styles.left}>
          <p className={styles.eyebrow} data-fade>
            <span className={styles.eyebrowDash} />
            Gallery
          </p>
          <h2 className={styles.headline}>
            <span className={styles.line}>
              <span className={styles.lineInner} data-line-inner>
                Explore
              </span>
            </span>
            <span className={styles.line}>
              <span className={styles.lineInner} data-line-inner>
                Every <span className={styles.gold}>Detail</span>
              </span>
            </span>
          </h2>
          <p className={styles.sub} data-fade>
            Different spaces.
            <br />
            Unforgettable experiences.
          </p>

          <ul className={styles.thumbs}>
            {SPACES.map((s, i) => {
              const on = i === space
              return (
                <li key={s.key} data-thumb>
                  <button
                    type="button"
                    className={`${styles.thumb}${on ? ` ${styles.thumbOn}` : ''}`}
                    onClick={() => setSpace(i)}
                    onPointerEnter={(e) => e.pointerType === 'mouse' && setSpace(i)}
                    aria-pressed={on}
                  >
                    <span className={`${styles.arch} ${styles[`tone_${s.key}`]}`}>
                      {s.thumb ? <img src={s.thumb} alt="" /> : <i className={`fa-solid ${s.icon}`} />}
                    </span>
                    <span className={styles.thumbArrow} aria-hidden="true">
                      <i className="fa-solid fa-arrow-right" />
                    </span>
                    <span className={styles.thumbName}>{s.name}</span>
                    <span className={styles.thumbUnderline} aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Currently exploring */}
        <div className={styles.info} aria-live="polite">
          <p className={styles.infoEyebrow} data-fade>
            <span className={styles.eyebrowDash} />
            Currently exploring
          </p>
          <h3 className={styles.name}>
            <span className={styles.nameMask}>
              <span className={styles.nameInner} ref={nameRef}>
                {current.name}
              </span>
            </span>
          </h3>
          <span className={styles.nameRule} aria-hidden="true" />
          <p className={styles.tagline}>{current.tagline}</p>
          <ul className={styles.perks}>
            {current.perks.map((p) => (
              <li className={styles.perk} key={`${current.key}-${p.label}`}>
                <i className={`fa-solid ${p.icon}`} aria-hidden="true" />
                {p.label}
              </li>
            ))}
          </ul>
        </div>

        {/* Film strip */}
        <div className={styles.strip} data-strip>
          <div className={styles.tray} aria-hidden="true" />
          <div className={styles.trackWrap}>
            <div className={styles.track} ref={trackRef} role="list">
              {current.frames.map((src, i) => (
                <div className={styles.frameShell} data-frame-shell role="listitem" key={`${current.key}-${i}`}>
                  <div className={`${styles.frame} ${styles[`ftone${i % 6}`]}`} data-frame>
                    {src ? <img src={src} alt="" draggable={false} /> : <i className={`fa-solid ${FRAME_ICONS[i]}`} />}
                    <span className={styles.frameNum}>{String(i + 1).padStart(2, '0')}</span>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" className={styles.next} onClick={nextFrame} aria-label="Next photo">
              <i className="fa-solid fa-arrow-right" />
            </button>
          </div>

          <div className={styles.stripFoot}>
            <a href={current.href} className={styles.viewAll}>
              <span className={styles.viewIcon} aria-hidden="true">
                <i className="fa-regular fa-image" />
              </span>
              View Full Gallery
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
