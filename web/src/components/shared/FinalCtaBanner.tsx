'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { gsap } from '@/lib/animations/gsap'
import './finalCta.css'

/**
 * "Tell us when, and we'll hold a stay." Shared by Home and the stay pages
 * (same props as before, so every caller keeps working), now a small booking
 * console: pick arrival and departure on a scrolling date rail, set the party
 * size with a stepper, and the number of nights works itself out.
 *
 * No booking backend exists yet, so submitting carries the choices to the
 * contact page as query parameters.
 */

const DAYS_AHEAD = 75

const addDays = (d: Date, n: number) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
const fmtDay = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' })
const fmtWeek = new Intl.DateTimeFormat('en-IN', { weekday: 'short' })
const fmtMonth = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' })
const numberIn = (s: string | null | undefined, fallback: number) => {
  const m = s?.match(/\d+/)
  return m ? Number(m[0]) : fallback
}

export function FinalCtaBanner({
  id = 'reserve',
  eyebrow,
  heading,
  whenLabel,
  whenPlaceholder,
  whoLabel,
  whoPlaceholder,
  howLongLabel,
  howLongPlaceholder,
  submitLabel,
  note,
}: {
  id?: string
  eyebrow?: string | null
  heading: React.ReactNode
  whenLabel?: string | null
  whenPlaceholder?: string | null
  whoLabel?: string | null
  whoPlaceholder?: string | null
  howLongLabel?: string | null
  howLongPlaceholder?: string | null
  submitLabel?: string | null
  note?: string | null
}) {
  const sectionRef = useRef<HTMLElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const nightsRef = useRef<HTMLSpanElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const shownNights = useRef(0)

  // Dates are generated after mount so server and client markup agree.
  const [days, setDays] = useState<Date[]>([])
  const [start, setStart] = useState<number | null>(null)
  const [end, setEnd] = useState<number | null>(null)
  const [guests, setGuests] = useState(() => numberIn(whoPlaceholder, 2))
  const [kids, setKids] = useState(0)

  useEffect(() => {
    const base = new Date()
    base.setHours(0, 0, 0, 0)
    const id = requestAnimationFrame(() => setDays(Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(base, i + 1))))
    return () => cancelAnimationFrame(id)
  }, [])

  const nights = start !== null && end !== null ? end - start : 0
  const noteLines = useMemo(() => (note ?? '').split('\n').map((l) => l.trim()).filter(Boolean), [note])

  const pick = (i: number) => {
    if (start === null || end !== null) {
      setStart(i)
      setEnd(null)
    } else if (i <= start) {
      setStart(i)
    } else {
      setEnd(i)
    }
  }

  // Counts the nights up (or down) instead of snapping.
  useEffect(() => {
    const el = nightsRef.current
    if (!el) return
    const target = nights
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = String(target)
      shownNights.current = target
      return
    }
    const proxy = { v: shownNights.current }
    gsap.to(proxy, {
      v: target,
      duration: 0.7,
      ease: 'power3.out',
      onUpdate: () => {
        el.textContent = String(Math.round(proxy.v))
      },
      onComplete: () => {
        shownNights.current = target
      },
    })
  }, [nights])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canHover = window.matchMedia('(hover: hover)').matches
    const cleanups: Array<() => void> = []
    const ctx = gsap.context(() => {
      const q = <T extends Element = HTMLElement>(sel: string) => Array.from(section.querySelectorAll<T>(sel))
      if (reduced) return

      gsap.from(q('[data-fade]'), {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: section, start: 'top 72%', once: true },
      })
      gsap.from(q('[data-line-inner]'), {
        yPercent: 115,
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.14,
        scrollTrigger: { trigger: section, start: 'top 70%', once: true },
      })
      gsap.from(q('[data-console]'), {
        opacity: 0,
        y: 70,
        clipPath: 'inset(8% 6% 8% 6% round 36px)',
        duration: 1.3,
        ease: 'power3.out',
        scrollTrigger: { trigger: q('[data-console]')[0], start: 'top 88%', once: true },
      })

      if (!canHover) return
      // Photos and the brand mark drift opposite the cursor, each at its own
      // depth — a wide, slow parallax field behind the console.
      const photos = q('[data-photo]')
      const mark = q('[data-mark]')[0]
      const movers = [...photos.map((el, i) => ({ el, depth: 14 + i * 5 })), mark && { el: mark, depth: 26 }].filter(
        (m): m is { el: HTMLElement; depth: number } => !!m,
      )
      const tweens = movers.map(({ el, depth }) => ({
        x: gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3' }),
        y: gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3' }),
        depth,
      }))
      const onMove = (e: PointerEvent) => {
        const r = section.getBoundingClientRect()
        const relX = (e.clientX - r.left) / r.width - 0.5
        const relY = (e.clientY - r.top) / r.height - 0.5
        tweens.forEach((t) => {
          t.x(relX * -t.depth)
          t.y(relY * -t.depth)
        })
      }
      section.addEventListener('pointermove', onMove)
      cleanups.push(() => section.removeEventListener('pointermove', onMove))
    }, section)
    return () => {
      cleanups.forEach((fn) => fn())
      ctx.revert()
    }
  }, [])

  // Warm drifting motes, like embers near a lantern — gently pushed aside by
  // the cursor. Pauses off-screen and when the tab is hidden; skipped
  // entirely for reduced motion.
  useEffect(() => {
    const canvas = canvasRef.current
    const section = sectionRef.current
    if (!canvas || !section || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const ctx2d = canvas.getContext('2d')
    if (!ctx2d) return undefined

    type Mote = { x: number; y: number; r: number; vx: number; vy: number; a: number; tw: number }
    let width = 0
    let height = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let motes: Mote[] = []
    let raf = 0
    let visible = true
    const pointer = { x: -9999, y: -9999 }

    const spawn = (): Mote => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.5 + 0.4,
      vx: (Math.random() - 0.5) * 0.08,
      vy: -Math.random() * 0.16 - 0.03,
      a: Math.random() * 0.45 + 0.15,
      tw: Math.random() * Math.PI * 2,
    })

    const resize = () => {
      const r = section.getBoundingClientRect()
      width = r.width
      height = r.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(80, Math.round((width * height) / 16000))
      motes = Array.from({ length: count }, spawn)
    }

    const onMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect()
      pointer.x = e.clientX - r.left
      pointer.y = e.clientY - r.top
    }
    const onLeave = () => {
      pointer.x = -9999
      pointer.y = -9999
    }

    const draw = () => {
      if (!visible) return
      ctx2d.clearRect(0, 0, width, height)
      for (const m of motes) {
        const dx = m.x - pointer.x
        const dy = m.y - pointer.y
        const dist2 = dx * dx + dy * dy
        const radius = 120
        if (dist2 < radius * radius) {
          const dist = Math.sqrt(dist2) || 1
          const force = (1 - dist / radius) * 0.5
          m.vx += (dx / dist) * force * 0.05
          m.vy += (dy / dist) * force * 0.05
        }
        m.x += m.vx
        m.y += m.vy
        m.vx *= 0.98
        m.vy *= 0.98
        m.tw += 0.02
        if (m.y < -10) {
          m.y = height + 10
          m.x = Math.random() * width
        }
        if (m.x < -10) m.x = width + 10
        if (m.x > width + 10) m.x = -10
        const flicker = 0.7 + Math.sin(m.tw) * 0.3
        ctx2d.beginPath()
        ctx2d.fillStyle = `rgba(227, 196, 140, ${m.a * flicker})`
        ctx2d.arc(m.x, m.y, m.r, 0, Math.PI * 2)
        ctx2d.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(section)
    resize()

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && document.visibilityState === 'visible'
        cancelAnimationFrame(raf)
        if (visible) raf = requestAnimationFrame(draw)
      },
      { threshold: 0 },
    )
    io.observe(section)

    const onVisibility = () => {
      visible = document.visibilityState === 'visible'
      cancelAnimationFrame(raf)
      if (visible) raf = requestAnimationFrame(draw)
    }
    document.addEventListener('visibilitychange', onVisibility)
    section.addEventListener('pointermove', onMove)
    section.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      section.removeEventListener('pointermove', onMove)
      section.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  const scrollRail = (dir: 1 | -1) => railRef.current?.scrollBy({ left: dir * railRef.current.clientWidth * 0.7, behavior: 'smooth' })

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (start !== null) params.set('from', days[start].toISOString().slice(0, 10))
    if (end !== null) params.set('to', days[end].toISOString().slice(0, 10))
    if (nights) params.set('nights', String(nights))
    params.set('guests', String(guests))
    if (kids) params.set('children', String(kids))
    window.location.href = `/contact?${params.toString()}#hold`
  }

  const summary =
    start !== null && end !== null
      ? `${fmtDay.format(days[start])} → ${fmtDay.format(days[end])}`
      : start !== null
        ? `${fmtDay.format(days[start])} → pick your departure`
        : (whenPlaceholder ?? 'Pick your dates')

  return (
    <section className="ve-hold" id={id} ref={sectionRef}>
      <canvas className="ve-hold-motes" ref={canvasRef} aria-hidden="true" />
      <div className="ve-hold-lines" aria-hidden="true" />

      <img className="ve-hold-mark" data-mark src="/icon-mark.svg" alt="" aria-hidden="true" />

      <img
        className="ve-hold-photo ve-hold-photo-a"
        data-photo
        src="/images/home/09-gallery-preview/mango-1.jpg"
        alt=""
        aria-hidden="true"
        loading="lazy"
      />
      <img
        className="ve-hold-photo ve-hold-photo-b"
        data-photo
        src="/images/home/09-gallery-preview/stone-2.jpg"
        alt=""
        aria-hidden="true"
        loading="lazy"
      />
      <img
        className="ve-hold-photo ve-hold-photo-c"
        data-photo
        src="/images/home/09-gallery-preview/bamboo-3.jpg"
        alt=""
        aria-hidden="true"
        loading="lazy"
      />
      <img
        className="ve-hold-photo ve-hold-photo-d"
        data-photo
        src="/images/home/09-gallery-preview/mango-5.jpg"
        alt=""
        aria-hidden="true"
        loading="lazy"
      />

      <div className="ve-hold-inner">
        {eyebrow && (
          <p className="ve-hold-eyebrow" data-fade>
            <span />
            {eyebrow}
          </p>
        )}
        <h2 className="ve-hold-title">
          <span className="ve-hold-mask">
            <span data-line-inner>{heading}</span>
          </span>
        </h2>

        <form className="ve-hold-console" data-console onSubmit={onSubmit}>
          {/* When */}
          <div className="ve-hold-block">
            <div className="ve-hold-head">
              <span className="ve-hold-label">
                <i className="fa-regular fa-calendar" aria-hidden="true" />
                {whenLabel ?? 'When'}
              </span>
              <span className={`ve-hold-summary${start !== null ? ' ve-hold-summary-on' : ''}`} aria-live="polite">
                {summary}
              </span>
              <span className="ve-hold-arrows">
                <button type="button" onClick={() => scrollRail(-1)} aria-label="Earlier dates">
                  <i className="fa-solid fa-arrow-left" />
                </button>
                <button type="button" onClick={() => scrollRail(1)} aria-label="Later dates">
                  <i className="fa-solid fa-arrow-right" />
                </button>
              </span>
            </div>

            <div className="ve-hold-rail" ref={railRef} role="group" aria-label="Choose your arrival and departure dates">
              {days.map((d, i) => {
                const newMonth = i > 0 && d.getMonth() !== days[i - 1].getMonth()
                // The opening month's label is skipped when it would collide with the next one.
                const nextMonthAt = days.findIndex((x, k) => k > i && x.getMonth() !== d.getMonth())
                const first = newMonth || (i === 0 && (nextMonthAt === -1 || nextMonthAt - i >= 6))
                const isStart = i === start
                const isEnd = i === end
                const inside = start !== null && end !== null && i > start && i < end
                const weekend = d.getDay() === 0 || d.getDay() === 6
                return (
                  <div className="ve-hold-cell" key={d.getTime()}>
                    {first && <span className="ve-hold-month">{fmtMonth.format(d)}</span>}
                    <button
                      type="button"
                      className={[
                        've-hold-day',
                        isStart && 've-hold-day-start',
                        isEnd && 've-hold-day-end',
                        inside && 've-hold-day-in',
                        weekend && 've-hold-day-weekend',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => pick(i)}
                      aria-pressed={isStart || isEnd}
                      aria-label={d.toDateString()}
                    >
                      <small>{fmtWeek.format(d)}</small>
                      <b>{d.getDate()}</b>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Who / how long / submit */}
          <div className="ve-hold-row">
            <div className="ve-hold-tile">
              <span className="ve-hold-label">
                <i className="fa-solid fa-user-group" aria-hidden="true" />
                {whoLabel ?? 'Who'}
              </span>
              <div className="ve-hold-stepper">
                <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="Fewer adults">
                  <i className="fa-solid fa-minus" />
                </button>
                <span aria-live="polite">
                  <b>{guests}</b> {guests === 1 ? 'adult' : 'adults'}
                </span>
                <button type="button" onClick={() => setGuests((g) => Math.min(30, g + 1))} aria-label="More adults">
                  <i className="fa-solid fa-plus" />
                </button>
              </div>
              <div className="ve-hold-stepper ve-hold-stepper-sub">
                <button type="button" onClick={() => setKids((k) => Math.max(0, k - 1))} aria-label="Fewer children">
                  <i className="fa-solid fa-minus" />
                </button>
                <span aria-live="polite">
                  <b>{kids}</b> {kids === 1 ? 'child' : 'children'}
                </span>
                <button type="button" onClick={() => setKids((k) => Math.min(20, k + 1))} aria-label="More children">
                  <i className="fa-solid fa-plus" />
                </button>
              </div>
            </div>

            <div className="ve-hold-tile">
              <span className="ve-hold-label">
                <i className="fa-regular fa-moon" aria-hidden="true" />
                {howLongLabel ?? 'How long'}
              </span>
              <p className="ve-hold-nights" aria-live="polite">
                {nights > 0 ? (
                  <>
                    <b ref={nightsRef}>0</b> {nights === 1 ? 'night' : 'nights'}
                  </>
                ) : (
                  <span className="ve-hold-muted">{howLongPlaceholder ?? 'Pick your dates'}</span>
                )}
              </p>
            </div>

            <button type="submit" className="ve-hold-submit">
              <span>{(submitLabel ?? 'Hold a date').replace(/\s*→\s*$/, '')}</span>
              <span className="ve-hold-submit-icon" aria-hidden="true">
                <i className="fa-solid fa-arrow-right" />
              </span>
            </button>
          </div>
        </form>

        {noteLines.length > 0 && (
          <ul className="ve-hold-note" data-fade>
            {noteLines.map((line) => (
              <li key={line}>
                <i className="fa-solid fa-check" aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
