'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Home, Stay } from '@/payload-types'
import { SectionHead } from '@/components/shared/SectionHead'
import { CountUp } from '@/components/shared/CountUp'
import { resolveMediaSize } from '@/lib/media'
import { gsap } from '@/lib/animations/gsap'
import MorphSlider, { type MorphSliderHandle } from './MorphSlider'
import styles from './home.module.css'

const STAY_SLUG_HREF: Record<string, string> = {
  'mango-house': '/mango-house',
  'stone-house': '/stone-house',
  'full-house': '/full-house',
}

const AUTOPLAY_SECONDS = 5

export function StaysCarousel({
  heading,
  sub,
  stays,
}: {
  heading: Home['staysTeaser']['heading']
  sub: Home['staysTeaser']['sub']
  stays: Stay[]
}) {
  const [index, setIndex] = useState(0)
  const sliderRef = useRef<MorphSliderHandle>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const imageColumnRef = useRef<HTMLDivElement>(null)
  const nextChevronRef = useRef<HTMLButtonElement>(null)
  const nextChevronIconRef = useRef<HTMLElement>(null)
  const progressFillRef = useRef<HTMLSpanElement>(null)
  const autoplayTweenRef = useRef<gsap.core.Tween | null>(null)
  const dirRef = useRef(1)
  const lastIndexRef = useRef(0)
  const firstRun = useRef(true)
  const [hovering, setHovering] = useState(false)

  const count = stays.length
  const active = stays[index]
  const nextStay = stays[(index + 1) % Math.max(count, 1)]

  const items = useMemo(
    () =>
      stays.map((stay) => {
        const media = resolveMediaSize(stay.heroImage, 'hero')
        return { image: media.url, caption: stay.title }
      }),
    [stays],
  )

  // Every index change — arrow, autoplay, next-thumbnail, or drag — flows
  // through the slider's onIndexChange, so direction is inferred once here
  // (shortest wrap-aware path).
  const handleIndexChange = useCallback(
    (i: number) => {
      const prev = lastIndexRef.current
      const forwardDist = (i - prev + count) % count
      dirRef.current = forwardDist === 1 ? 1 : -1
      lastIndexRef.current = i
      setIndex(i)
    },
    [count],
  )

  const goTo = useCallback(
    (i: number) => {
      if (!count) return
      const next = ((i % count) + count) % count
      sliderRef.current?.goTo(next)
    },
    [count],
  )

  // Slide the right-hand content in from the direction of travel — a
  // slow, deliberate entrance rather than a quick snap.
  useEffect(() => {
    const content = contentRef.current
    if (!content) return

    if (firstRun.current) {
      firstRun.current = false
      return
    }

    const dir = dirRef.current
    gsap.fromTo(
      content,
      { autoAlpha: 0, x: dir * 56 },
      { autoAlpha: 1, x: 0, duration: 1.3, ease: 'power2.out' },
    )
  }, [index])

  // Autoplay progress bar — fills over AUTOPLAY_SECONDS and advances the
  // slide on completion. Restarts fresh on every index change (manual nav
  // resets the countdown), pauses on hover without losing its fill.
  useEffect(() => {
    const fill = progressFillRef.current
    if (!fill || count < 2) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    gsap.set(fill, { scaleX: 0 })
    const tween = gsap.to(fill, {
      scaleX: 1,
      duration: AUTOPLAY_SECONDS,
      ease: 'none',
      onComplete: () => goTo(index + 1),
    })
    if (hovering) tween.pause()
    autoplayTweenRef.current = tween

    return () => {
      tween.kill()
      autoplayTweenRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, count])

  useEffect(() => {
    const tween = autoplayTweenRef.current
    if (!tween) return
    if (hovering) tween.pause()
    else tween.resume()
  }, [hovering])

  // A scroll-scrub parallax drift on the image, synced through the same
  // GSAP ticker Lenis drives — the photo floats gently against the fixed
  // text column as the section passes through the viewport.
  useEffect(() => {
    const section = carouselRef.current
    const image = imageColumnRef.current
    if (!section || !image) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const ctx = gsap.context(() => {
      gsap.fromTo(
        image,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    }, section)

    return () => ctx.revert()
  }, [])

  // Magnetic hover — the chevron drifts toward the cursor within its
  // hit area, then eases back to center on leave.
  useEffect(() => {
    const btn = nextChevronRef.current
    const icon = nextChevronIconRef.current
    if (!btn || !icon) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const moveX = gsap.quickTo(icon, 'x', { duration: 0.5, ease: 'power3.out' })
    const moveY = gsap.quickTo(icon, 'y', { duration: 0.5, ease: 'power3.out' })

    const onMove = (e: PointerEvent) => {
      const rect = btn.getBoundingClientRect()
      const relX = e.clientX - (rect.left + rect.width / 2)
      const relY = e.clientY - (rect.top + rect.height / 2)
      moveX(relX * 0.4)
      moveY(relY * 0.4)
    }
    const onLeave = () => {
      moveX(0)
      moveY(0)
    }

    btn.addEventListener('pointermove', onMove)
    btn.addEventListener('pointerleave', onLeave)
    return () => {
      btn.removeEventListener('pointermove', onMove)
      btn.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  if (!count || !active || !nextStay) return null

  const nextMedia = resolveMediaSize(nextStay.heroImage, 'thumbnail')

  return (
    <section className={`${styles.staysSection} bg-white`} id="stay" ref={carouselRef}>
      <SectionHead title={renderTitle(heading ?? '')} sub={sub} />

      <div className={`${styles.stayCarousel} reveal`}>
        <div className={styles.stayImageColumn}>
          <div className={styles.stayImageScaler} ref={imageColumnRef}>
            <MorphSlider
              ref={sliderRef}
              items={items}
              startIndex={index}
              transition="melt"
              intensity={0.55}
              aberration={0.32}
              drift={0.35}
              duration={1.1}
              radius={0}
              overlayColor="#f3f4f6"
              onIndexChange={handleIndexChange}
            />
          </div>
        </div>

        <div className={styles.stayContentColumn}>
          <span className={styles.stayNum}>stay / no. {String(index + 1).padStart(2, '0')}</span>

          <div className={styles.stayMeta} ref={contentRef}>
            <h3 className={styles.stayName}>{active.title}</h3>
            <p className={styles.stayLine}>&ldquo;{active.homeTeaser?.quote}&rdquo;</p>
            <p className={styles.stayFacts}>
              {active.capacity}
              <span className={styles.dot}>·</span>
              {active.homeTeaser?.factsLine}
              <br />
              <span className={styles.price}>
                from ₹<CountUp value={active.priceFrom} locale="en-IN" /> / night
              </span>
              {active.priceNote ? ` · ${active.priceNote}` : ''}
            </p>
            <a href={STAY_SLUG_HREF[active.slug]} className="btn btn-ghost" style={{ marginTop: '1.25rem' }}>
              View {active.title} →
            </a>
          </div>

          {count > 1 && (
            <button
              type="button"
              className={styles.stayAutoplay}
              onClick={() => goTo(index + 1)}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              aria-label={`Skip to ${nextStay.title}`}
            >
              <span className={styles.stayAutoplayThumb}>
                {nextMedia.url && <img src={nextMedia.url} alt="" loading="lazy" />}
              </span>
              <span className={styles.stayAutoplayMeta}>
                <span className={styles.stayAutoplayLabel}>next — {nextStay.title}</span>
                <span className={styles.stayAutoplayTrack}>
                  <span ref={progressFillRef} className={styles.stayAutoplayFill} />
                </span>
              </span>
            </button>
          )}
        </div>

        {count > 1 && (
          <button
            ref={nextChevronRef}
            type="button"
            className={styles.stayBigNext}
            onClick={() => goTo(index + 1)}
            aria-label="Next stay"
          >
            <i ref={nextChevronIconRef} className="fa-solid fa-chevron-right" aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  )
}

function renderTitle(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
