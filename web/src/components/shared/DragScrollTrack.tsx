'use client'

import { useEffect, useRef } from 'react'

/**
 * Horizontal drag-to-scroll track with deterministic snap-to-nearest-card
 * on release — the "Experience The Estate" pattern from Home.html, and the
 * same pattern several other pages use for their amenity/highlight
 * carousels. Built as a shared component so it's written (and its
 * offsetLeft/scrollLeft coordinate-space bug fixed) exactly once instead
 * of copy-pasted per page.
 */
export function DragScrollTrack({ children }: { children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let dragging = false
    let startX = 0
    let startScroll = 0
    let lastX = 0
    let lastTime = 0
    let velocity = 0
    let restoreSnapId: ReturnType<typeof setTimeout> | null = null

    const cards = () => Array.from(track.querySelectorAll<HTMLElement>(':scope > *:not([aria-hidden])'))

    const onPointerDown = (e: PointerEvent) => {
      if (restoreSnapId) {
        clearTimeout(restoreSnapId)
        restoreSnapId = null
      }
      dragging = true
      startX = e.clientX
      lastX = e.clientX
      startScroll = track.scrollLeft
      velocity = 0
      lastTime = performance.now()
      track.style.scrollSnapType = 'none'
      track.classList.add('dragging')
      track.setPointerCapture(e.pointerId)
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return
      const now = performance.now()
      const dt = now - lastTime || 1
      velocity = (lastX - e.clientX) / dt
      lastX = e.clientX
      lastTime = now
      track.scrollLeft = startScroll + (startX - e.clientX)
    }

    const snapToNearest = () => {
      const target = track.scrollLeft + velocity * 120
      const items = cards()
      let nearest = items[0]
      let nearestDist = Infinity
      items.forEach((card) => {
        const dist = Math.abs(card.offsetLeft - target)
        if (dist < nearestDist) {
          nearestDist = dist
          nearest = card
        }
      })
      if (nearest) track.scrollTo({ left: nearest.offsetLeft, behavior: 'smooth' })
      restoreSnapId = setTimeout(() => {
        track.style.scrollSnapType = ''
      }, 450)
    }

    const endDrag = () => {
      if (!dragging) return
      dragging = false
      track.classList.remove('dragging')
      snapToNearest()
    }

    track.addEventListener('pointerdown', onPointerDown, { passive: true })
    track.addEventListener('pointermove', onPointerMove, { passive: true })
    track.addEventListener('pointerup', endDrag)
    track.addEventListener('pointercancel', endDrag)
    const preventDrag = (e: DragEvent) => e.preventDefault()
    track.addEventListener('dragstart', preventDrag)

    return () => {
      if (restoreSnapId) clearTimeout(restoreSnapId)
      track.removeEventListener('pointerdown', onPointerDown)
      track.removeEventListener('pointermove', onPointerMove)
      track.removeEventListener('pointerup', endDrag)
      track.removeEventListener('pointercancel', endDrag)
      track.removeEventListener('dragstart', preventDrag)
    }
  }, [])

  return (
    <div className="track-wrap">
      {/* position:relative here (not just on globals.css's .track-wrap) is
          what makes .h-track the offsetParent for its own children, so
          card.offsetLeft and track.scrollLeft share one coordinate space —
          see the fix note in Stay.html's history for what goes wrong
          without it. */}
      <div className="h-track reveal" ref={trackRef} style={{ position: 'relative' }}>
        <div className="h-track-spacer" aria-hidden="true" />
        {children}
        <div className="h-track-spacer" aria-hidden="true" />
      </div>
    </div>
  )
}
