'use client'

import { useRef, useState } from 'react'
import type { Home, Stay } from '@/payload-types'
import { SectionHead } from '@/components/shared/SectionHead'
import { CountUp } from '@/components/shared/CountUp'
import { resolveMediaSize } from '@/lib/media'
import styles from './home.module.css'

const STAY_SLUG_HREF: Record<string, string> = {
  'mango-house': '/mango-house',
  'stone-house': '/stone-house',
  'full-house': '/full-house',
}

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
  const trackRef = useRef<HTMLDivElement>(null)
  const dragState = useRef({ dragging: false, startX: 0, deltaX: 0 })

  const count = stays.length
  const goTo = (i: number) => setIndex(((i % count) + count) % count)

  const onPointerDown = (e: React.PointerEvent) => {
    dragState.current = { dragging: true, startX: e.clientX, deltaX: 0 }
    trackRef.current?.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current.dragging || !trackRef.current) return
    dragState.current.deltaX = e.clientX - dragState.current.startX
    trackRef.current.style.transform = `translateX(calc(-${index * 100}% + ${dragState.current.deltaX}px))`
  }
  const onPointerUp = () => {
    if (!dragState.current.dragging || !trackRef.current) return
    dragState.current.dragging = false
    const threshold = trackRef.current.parentElement!.offsetWidth * 0.15
    trackRef.current.style.transform = ''
    if (dragState.current.deltaX > threshold) goTo(index - 1)
    else if (dragState.current.deltaX < -threshold) goTo(index + 1)
    dragState.current.deltaX = 0
  }

  if (!count) return null

  return (
    <section className={`${styles.staysSection} bg-silver`} id="stay">
      <SectionHead title={renderTitle(heading ?? '')} sub={sub} />

      <div className={`${styles.stayCarousel} reveal`}>
        <button className={`${styles.carouselArrow} ${styles.prev}`} aria-label="Previous stay" onClick={() => goTo(index - 1)}>
          <span aria-hidden="true">←</span>
        </button>
        <button className={`${styles.carouselArrow} ${styles.next}`} aria-label="Next stay" onClick={() => goTo(index + 1)}>
          <span aria-hidden="true">→</span>
        </button>

        <div className={styles.stayViewport}>
          <div
            className={styles.stayTrack}
            ref={trackRef}
            style={{ transform: `translateX(-${index * 100}%)`, transition: 'transform 520ms var(--ease-slow)' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {stays.map((stay, i) => {
              const media = resolveMediaSize(stay.heroImage, 'card')
              return (
                <article className={styles.stay} key={stay.id}>
                  <div className={styles.stayNum}>stay / no. {String(i + 1).padStart(2, '0')}</div>
                  <div className={styles.stayPlate}>
                    {media.url && <img src={media.url} alt={media.alt} loading="lazy" />}
                  </div>
                  <div className={styles.stayMeta}>
                    <h3 className={styles.stayName}>{stay.title}</h3>
                    <p className={styles.stayLine}>&ldquo;{stay.homeTeaser?.quote}&rdquo;</p>
                    <p className={styles.stayFacts}>
                      {stay.capacity}
                      <span className={styles.dot}>·</span>
                      {stay.homeTeaser?.factsLine}
                      <br />
                      <span className={styles.price}>
                        from ₹<CountUp value={stay.priceFrom} locale="en-IN" /> / night
                      </span>
                      {stay.priceNote ? ` · ${stay.priceNote}` : ''}
                    </p>
                    <a href={STAY_SLUG_HREF[stay.slug]} className="btn btn-ghost" style={{ marginTop: '1.25rem' }}>
                      View {stay.title} →
                    </a>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <div className={styles.carouselDots} role="tablist" aria-label="Stay selector">
          {stays.map((stay, i) => (
            <button
              key={stay.id}
              type="button"
              role="tab"
              aria-label={`Go to ${stay.title}`}
              className={i === index ? styles.active : undefined}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
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
