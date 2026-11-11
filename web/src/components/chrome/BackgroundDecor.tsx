'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import './decor.css'
import { assetUrl } from '@/lib/assetUrl'

/**
 * Background nature graphics (R2: images/decor/*). On inner pages
 * each light section gets one silhouette behind its content (negative
 * z-index inside an isolated section, low opacity, pointer-events off).
 *
 * Placement never overlaps content: each graphic tries a list of candidate
 * spots (corners / edges) and takes the first one whose box doesn't touch a
 * card, image, heading, paragraph, button or field in that section. If no
 * spot is free, the graphic is skipped for that section.
 *
 * The mango sprig is different: it drifts like a leaf on the wind, from the
 * top-left of its section down to the bottom-right, fading out, on a loop.
 *
 * Remove the feature: delete this file + decor.css and the <BackgroundDecor />
 * line in app/(site)/layout.tsx — or reset to git tag `pre-stickers`.
 */
const SRC = (name: string) => assetUrl(`/images/decor/${name}.png`)

/** Pixel sizes of the PNGs in R2 images/decor/. */
const SIZE: Record<string, [number, number]> = {
  'birds-flight': [1774, 887],
  'grass-tuft': [1774, 887],
  'coconut-palm-tree': [1024, 1536],
  'bamboo-silhouette': [1024, 1536],
  'palm-frond-corner': [1536, 1024],
  'palm-leaf': [1536, 1024],
  'mango-leaf-sprig': [1536, 1024],
}

/** Where the drawing actually sits inside each canvas: [left, top, right, bottom] fractions. */
const INK: Record<string, [number, number, number, number]> = {
  'birds-flight': [0.1, 0.25, 0.92, 0.72],
  'grass-tuft': [0.02, 0.08, 0.98, 0.92],
  'coconut-palm-tree': [0.1, 0.03, 0.9, 0.95],
  'bamboo-silhouette': [0.05, 0.02, 0.8, 0.95],
  'palm-frond-corner': [0, 0.05, 0.45, 0.72], // drawn hanging from the top-left
  'palm-leaf': [0.05, 0.18, 0.66, 0.8],
  'mango-leaf-sprig': [0.08, 0.1, 0.62, 0.82],
}

/** Drawn growing from the left; flipped when placed on the right edge. */
const MIRRORABLE = ['palm-frond-corner', 'palm-leaf', 'mango-leaf-sprig']

type Pos = Partial<Record<'top' | 'bottom' | 'left' | 'right', string>>
type Spot = { img: string; cls: string; spots: Pos[] }

const TL: Pos = { top: '0', left: '0' }
const TR: Pos = { top: '0', right: '0' }
const BL: Pos = { bottom: '0', left: '0' }
const BR: Pos = { bottom: '0', right: '0' }
const ML: Pos = { top: '40%', left: '0' }
const MR: Pos = { top: '40%', right: '0' }

/** Extra fallback spots along the top and bottom padding bands. */
const BANDS: Pos[] = [
  { bottom: '0', left: '25%' }, { bottom: '0', left: '50%' }, { bottom: '0', right: '20%' },
  { top: '0', left: '30%' }, { top: '0', right: '30%' },
]

const HERO: Spot = { img: 'birds-flight', cls: 'dc-birds', spots: [{ top: '7rem', left: '40%' }, { top: '7rem', right: '4%' }, { top: '5rem', left: '4%' }] }
/** Per-page hero bird spots (Farm Dining: keep the birds on the right). */
const HERO_SPOTS: Record<string, Pos[]> = {
  '/farm-dining': [{ top: '7.2rem', left: '50%' }],
  '/contact': [{ top: '7.5rem', left: '44%' }],
}
const CYCLE: Spot[] = [
  { img: 'palm-frond-corner', cls: 'dc-frond', spots: [TR, TL] },
  { img: 'grass-tuft', cls: 'dc-grass', spots: [BL, BR, { bottom: '0', left: '35%' }] },
  { img: 'mango-leaf-sprig', cls: 'dc-sprig dc-wind', spots: [TL] },
  { img: 'bamboo-silhouette', cls: 'dc-bamboo', spots: [BR, BL, MR, ML] },
  { img: 'palm-leaf', cls: 'dc-leaf', spots: [TL, TR, ML, MR] },
  { img: 'coconut-palm-tree', cls: 'dc-palm', spots: [BR, BL, MR] },
]

const CONTENT = 'img, video, svg, canvas, iframe, picture, h1, h2, h3, h4, p, li, a, button, input, textarea, select, label, blockquote, figure, form, [class*="Card"], [class*="card"], [class*="Tile"], [class*="Panel"], [class*="Photo"], [class*="Visual"], [class*="Media"], [class*="Item"], [class*="Row"], [class*="Map"]'

function isDark(el: Element) {
  let node: Element | null = el
  while (node && node !== document.body) {
    const bg = getComputedStyle(node).backgroundColor
    const m = bg.match(/\d+(\.\d+)?/g)
    if (m && (m.length < 4 || Number(m[3]) > 0.5)) {
      const [r, g, b] = m.map(Number)
      return 0.299 * r + 0.587 * g + 0.114 * b < 110
    }
    node = node.parentElement
  }
  return false
}

const hit = (a: DOMRect, b: DOMRect, pad = 12) =>
  a.left < b.right + pad && a.right > b.left - pad && a.top < b.bottom + pad && a.bottom > b.top - pad

function contentRects(section: HTMLElement) {
  const sArea = section.offsetWidth * section.offsetHeight
  return Array.from(section.querySelectorAll<HTMLElement>(CONTENT))
    .filter((el) => !el.closest('.dc'))
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.width > 4 && r.height > 4 && r.width * r.height < sArea * 0.7)
}

/** Finds a spot (and size) where the graphic's drawing touches no content. */
function fitSpot(wrap: HTMLElement, section: HTMLElement, spot: Spot, base: number) {
  const rects = contentRects(section)
  const ink = INK[spot.img] ?? [0.1, 0.1, 0.9, 0.9]
  // Leaves, fronds and trees only ever sit against the far left/right screen
  // edge; only the grass and birds may use the mid-band fallback spots.
  const edgeOnly = !/dc-grass|dc-birds/.test(spot.cls)
  const candidates = edgeOnly ? spot.spots.filter((p) => p.left === '0' || p.right === '0') : [...spot.spots, ...BANDS]
  for (const scale of [1, 0.75, 0.55]) {
    wrap.style.width = `${Math.round(base * scale)}px`
    for (const pos of candidates) {
      wrap.style.top = wrap.style.bottom = wrap.style.left = wrap.style.right = ''
      Object.assign(wrap.style, pos)
      // Corner fronds/leaves hang in from whichever edge they're on.
      const onRight = pos.right === '0'
      wrap.classList.toggle('dc-mirror', onRight && MIRRORABLE.includes(spot.img))
      const mirrored = wrap.classList.contains('dc-mirror')
      const [il, it, ir, ib] = mirrored ? [1 - ink[2], ink[1], 1 - ink[0], ink[3]] : ink
      const r = wrap.getBoundingClientRect()
      const box = new DOMRect(r.left + r.width * il, r.top + r.height * it, r.width * (ir - il), r.height * (ib - it))
      if (!rects.some((c) => hit(box, c))) return true
    }
  }
  return false
}

export function BackgroundDecor() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === '/' || document.getElementById('living-stories')) return undefined
    const added: HTMLElement[] = []
    const patched: HTMLElement[] = []

    const place = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>('section')).filter(
        (s) => !s.closest('header, footer, .ve-foot') && !s.parentElement?.closest('section') && s.offsetHeight > 260,
      )
      let n = 0
      sections.forEach((section, i) => {
        if (isDark(section)) return
        const spot = i === 0 ? { ...HERO, spots: HERO_SPOTS[pathname] ?? HERO.spots } : CYCLE[n++ % CYCLE.length]

        if (getComputedStyle(section).position === 'static') {
          section.style.position = 'relative'
          patched.push(section)
        }
        section.classList.add('dc-host')

        const wrap = document.createElement('div')
        wrap.className = `dc ${spot.cls}`
        wrap.setAttribute('aria-hidden', 'true')
        const img = document.createElement('img')
        img.src = SRC(spot.img)
        img.alt = ''
        img.decoding = 'async'
        // Intrinsic size up front so the box measures correctly before load.
        const [w, h] = SIZE[spot.img] ?? [1, 1]
        img.width = w
        img.height = h
        wrap.style.aspectRatio = `${w} / ${h}`
        wrap.appendChild(img)
        section.appendChild(wrap)

        // The wind leaf moves through the section, so it skips the overlap test.
        // Hand-picked hero spot for this page: placed as-is (checked by eye).
        if (i === 0 && HERO_SPOTS[pathname]) {
          Object.assign(wrap.style, HERO_SPOTS[pathname][0])
          wrap.style.width = 'clamp(130px, 12vw, 190px)'
          added.push(wrap)
          return
        }
        if (spot.cls.includes('dc-wind')) {
          wrap.style.setProperty('--dx', `${Math.round(section.offsetWidth * 0.55)}px`)
          wrap.style.setProperty('--dy', `${Math.round(section.offsetHeight * 0.75)}px`)
          added.push(wrap)
          return
        }

        const base = wrap.getBoundingClientRect().width
        const fit = () => fitSpot(wrap, section, spot, base)
        if (fit()) {
          added.push(wrap)
          fits.set(wrap, fit)
          io.observe(wrap.parentElement as HTMLElement)
        } else wrap.remove()
      })
    }

    // Content inside a section can move after load (scroll reveals, stacked
    // cards), so each graphic is re-checked when its section scrolls into
    // view; if it would now overlap, it moves to a free spot or hides.
    const fits = new Map<HTMLElement, () => boolean>()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.querySelectorAll<HTMLElement>(':scope > .dc').forEach((d) => {
            const f = fits.get(d)
            if (f) d.style.visibility = f() ? '' : 'hidden'
          })
        })
      },
      { threshold: 0 },
    )
    // Tall/pinned sections keep moving content while in view: re-check the
    // graphics in on-screen sections a few times a second while scrolling.
    let last = 0
    const onScroll = () => {
      const now = performance.now()
      if (now - last < 300) return
      last = now
      fits.forEach((f, d) => {
        const r = d.parentElement?.getBoundingClientRect()
        if (r && r.bottom > 0 && r.top < window.innerHeight) d.style.visibility = f() ? '' : 'hidden'
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    // Wait for images/fonts so content boxes are at their final size.
    const t = window.setTimeout(place, 1400)

    return () => {
      window.clearTimeout(t)
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      added.forEach((el) => {
        el.parentElement?.classList.remove('dc-host')
        el.remove()
      })
      patched.forEach((el) => (el.style.position = ''))
    }
  }, [pathname])

  return null
}
