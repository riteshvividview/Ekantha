'use client'

import { useEffect, useRef } from 'react'

/**
 * The custom cursor companion used across every page — a small dot that
 * lerps toward the real pointer position, swells over interactive
 * elements, and swaps color over dark sections/buttons. Ported from the
 * `.ve-cursor-dot` + `animateCursor()` pattern that appeared identically
 * (copy-pasted) in every source HTML file's own <script>, now a single
 * shared component instead of N duplicated implementations.
 *
 * Desktop (hover-capable, >=1024px) only — matches the source CSS's
 * `@media (hover: none), (max-width: 1023px) { display: none }`.
 */
export function CursorDot() {
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    if (!dot) return

    let mouseX = 0
    let mouseY = 0
    let currX = 0
    let currY = 0
    let raf = 0

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const animate = () => {
      currX += (mouseX - currX) * 0.18
      currY += (mouseY - currY) * 0.18
      dot.style.transform = `translate(${currX}px, ${currY}px) translate(-50%, -50%)`
      raf = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMouseMove)
    raf = requestAnimationFrame(animate)

    const swellSelector = 'a, button, label, .cell, .event-card, .stay, .h-card, .testi-card, .gallery-plate'
    const onEnter = () => dot.classList.add('swollen')
    const onLeave = () => dot.classList.remove('swollen')
    const swellTargets = Array.from(document.querySelectorAll(swellSelector))
    swellTargets.forEach((el) => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    const onDarkEnter = () => document.body.classList.add('on-dark')
    const onDarkLeave = () => document.body.classList.remove('on-dark')
    const darkTargets = Array.from(document.querySelectorAll('.bg-black, .hero, .btn-primary, .ve-hold-pill'))
    darkTargets.forEach((el) => {
      el.addEventListener('mouseenter', onDarkEnter)
      el.addEventListener('mouseleave', onDarkLeave)
    })

    const onLightEnter = () => document.body.classList.add('on-light')
    const onLightLeave = () => document.body.classList.remove('on-light')
    const lightTargets = Array.from(document.querySelectorAll('.btn-on-dark, .btn-ghost'))
    lightTargets.forEach((el) => {
      el.addEventListener('mouseenter', onLightEnter)
      el.addEventListener('mouseleave', onLightLeave)
    })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMouseMove)
      swellTargets.forEach((el) => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
      darkTargets.forEach((el) => {
        el.removeEventListener('mouseenter', onDarkEnter)
        el.removeEventListener('mouseleave', onDarkLeave)
      })
      lightTargets.forEach((el) => {
        el.removeEventListener('mouseenter', onLightEnter)
        el.removeEventListener('mouseleave', onLightLeave)
      })
    }
  }, [])

  return <div ref={dotRef} className="ve-cursor-dot" aria-hidden="true" />
}
