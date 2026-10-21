'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { onProgress } from '@/lib/loadProgress'
import { INITIAL_LOAD_COOKIE } from '@/lib/initialLoadCookie'

// Real signals only — no fake timer dressed up as progress, and no
// artificial minimum-display floor either: the percentage is exactly the
// weighted sum below, and the reveal fires the moment it's real.
//
// Only the hero sequence (plus fonts/the nav logo) gates the reveal — it's
// the section the visitor actually sees first, so it's the one thing that
// has to be fully loaded and cached before the page appears. BambooDine
// and ChooseEscape sit further down the page and keep preloading in the
// background (see their own components) without holding the homepage
// back. All three report real buffered-video progress now (see each
// component's reportBufferedProgress), not per-frame-image counting —
// they're compressed videos scrubbed via currentTime, a few MB each
// instead of the ~62MB of individual WebP frames this used to be.
const WEIGHTS: Record<string, number> = {
  fonts: 0.1,
  logo: 0.05,
  hero: 0.85,
}

// A slow connection shouldn't be able to trap a visitor behind this
// screen indefinitely — reveal regardless of real progress past this.
const TIMEOUT_MS = 20000

// Atmosphere, not detail — mood lines in the same voice as the rest of the
// site's copy (see Hero's "Mornings Without An Agenda", Events' "Good food
// tastes better in nature."), never pricing or specifics.
const MOOD_LINES = [
  'Two homes. One quiet acre of sky.',
  'Mornings without an agenda.',
  'Where the mango trees keep the time.',
  'Five acres, and nowhere you need to be.',
  'The land remembers how to slow down.',
  'Good food tastes better under bamboo.',
]
const LINE_INTERVAL_MS = 2600

export function InitialLoadScreen({ skip }: { skip: boolean }) {
  const pathname = usePathname()
  // Computed synchronously (not in an effect) and matches what the server
  // renders for this route, so on a hard load of '/' the loader is part of
  // the very first HTML the browser paints — no gap where the real
  // homepage is visible underneath before this mounts. `skip` comes from
  // the server reading a cookie (see the (site) layout) set the first time
  // this ever finished in this browser — so a reload after that first
  // visit never renders the loader at all, instead of rendering it and
  // then hiding it client-side a beat later. Only ever set back to false
  // once, by finish() below, to unmount after the reveal.
  const [shouldRender, setShouldRender] = useState(() => pathname === '/' && !skip)
  const [contentHidden, setContentHidden] = useState(false)
  const [curtainOpen, setCurtainOpen] = useState(false)
  const [pct, setPct] = useState(0)
  const [lineIndex, setLineIndex] = useState(0)
  const progressRef = useRef<Record<string, number>>({ fonts: 0, hero: 0, logo: 0 })
  const doneRef = useRef(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Rotating mood line, independent of load progress — it's atmosphere,
  // not a status readout.
  useEffect(() => {
    if (!shouldRender) return
    const id = window.setInterval(() => {
      setLineIndex((i) => (i + 1) % MOOD_LINES.length)
    }, LINE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [shouldRender])

  useEffect(() => {
    if (!shouldRender) return

    const finish = () => {
      if (doneRef.current) return
      doneRef.current = true
      setPct(100)
      // No expiry: a session cookie, cleared when the browser itself
      // closes — so the loader skips on reloads/back-nav within a visit
      // but plays again in a fresh session, same as the old sessionStorage
      // flag's intent, just readable by the server this time.
      try {
        document.cookie = `${INITIAL_LOAD_COOKIE}=1; path=/; SameSite=Lax`
      } catch {
        // document.cookie can throw under strict privacy settings — fine,
        // it just means the loader shows again next time.
      }
      // Content fades first, then the curtain splits — two readable beats
      // instead of everything moving at once. The 950ms before unmounting
      // matches .ve-load-curtain's own transition duration in globals.css
      // (so the slide-out finishes before the DOM is removed), not padding.
      setContentHidden(true)
      window.setTimeout(() => {
        setCurtainOpen(true)
        window.setTimeout(() => setShouldRender(false), 950)
      }, 320)
    }

    const recompute = () => {
      const p = progressRef.current
      const weighted = Object.entries(WEIGHTS).reduce((sum, [key, weight]) => sum + (p[key] ?? 0) * weight, 0)
      setPct(Math.round(weighted * 100))
      if (weighted >= 0.999) finish()
    }

    progressRef.current.logo = 1 // priority-loaded, effectively instant
    document.fonts.ready.then(() => {
      progressRef.current.fonts = 1
      recompute()
    })
    const unsubscribe = onProgress((key, value) => {
      if (!(key in progressRef.current)) return
      progressRef.current[key] = value
      recompute()
    })
    recompute()

    const timeout = window.setTimeout(finish, TIMEOUT_MS)
    return () => {
      unsubscribe()
      window.clearTimeout(timeout)
    }
  }, [shouldRender])

  // Ambient drifting embers — the same warm-mote technique as the "Hold a
  // date" console (FinalCtaBanner), without the cursor interaction: here
  // it's atmosphere behind a loading screen, not a hover surface.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!shouldRender || !canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const ctx2d = canvas.getContext('2d')
    if (!ctx2d) return undefined

    type Mote = { x: number; y: number; r: number; vx: number; vy: number; a: number; tw: number }
    let width = 0
    let height = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let motes: Mote[] = []
    let raf = 0

    const spawn = (): Mote => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.06,
      vy: -Math.random() * 0.14 - 0.03,
      a: Math.random() * 0.4 + 0.12,
      tw: Math.random() * Math.PI * 2,
    })

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(60, Math.round((width * height) / 22000))
      motes = Array.from({ length: count }, spawn)
    }

    const draw = () => {
      ctx2d.clearRect(0, 0, width, height)
      for (const m of motes) {
        m.x += m.vx
        m.y += m.vy
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

    window.addEventListener('resize', resize)
    resize()
    draw()
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [shouldRender])

  if (!shouldRender) return null

  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div className="ve-load-screen" aria-hidden={contentHidden}>
      <canvas className="ve-load-embers" ref={canvasRef} data-hidden={contentHidden} aria-hidden="true" />

      <div className="ve-load-content" data-hidden={contentHidden}>
        <div className="ve-load-screen-mark">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption -- silent decorative loop, nothing to caption */}
          <video src="/logo-loader.mp4" autoPlay={!reduced} loop muted playsInline />
        </div>

        <h1 className="ve-load-headline">Loading your Experience</h1>

        <div className="ve-load-lines" aria-live="polite">
          {MOOD_LINES.map((line, i) => (
            <p key={line} className="ve-load-line" data-on={i === lineIndex}>
              {line}
            </p>
          ))}
        </div>

        <div className="ve-load-progress">
          <span className="ve-load-dash" aria-hidden="true" />
          <p className="ve-load-screen-pct">{pct}%</p>
          <div className="ve-load-screen-bar">
            <div className="ve-load-screen-bar-fill" style={{ transform: `scaleX(${pct / 100})` }} />
          </div>
        </div>
      </div>

      <div className="ve-load-curtain ve-load-curtain-left" data-open={curtainOpen} />
      <div className="ve-load-curtain ve-load-curtain-right" data-open={curtainOpen} />
    </div>
  )
}
