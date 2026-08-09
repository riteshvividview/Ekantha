'use client'

import { useEffect, useState } from 'react'

/**
 * The floating "hold a date" pill that appears once the hero has scrolled
 * past, and smooth-scrolls to the #reserve section on click. Shared across
 * every page (each source HTML file had its own copy of this exact
 * behavior, keyed off the hero element's height).
 */
export function HoldPill() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('top')
    if (!hero) return

    const update = () => {
      setVisible(window.scrollY > hero.offsetHeight * 0.6)
    }
    update()

    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  const handleClick = () => {
    document.getElementById('reserve')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      className={`ve-hold-pill${visible ? ' visible' : ''}`}
      onClick={handleClick}
    >
      hold a date
    </button>
  )
}
