'use client'

import { useEffect } from 'react'

/**
 * Phones only (≤760px): photo cards whose description is hidden until
 * tapped. Tapping a card toggles `tap-open` on it; globals.css slides the
 * description in/out. Desktop keeps its own hover behaviour untouched.
 *
 * Each entry is the card's CSS-module class suffix (the part after `__`).
 */
const CARDS = [
  'hlHero', // Stone: accommodation highlights, featured card
  'hlRow', // Stone: accommodation highlights, list cards
  'amCell', // Stone: amenities & inclusions
  'hlCard', // Full House: accommodation highlights
  'expRow', // Farm Dining: the experience
  'suitCard', // Farm Dining: suitable for
]

function cardFor(el: Element | null): HTMLElement | null {
  while (el && el !== document.body) {
    for (const token of Array.from(el.classList)) {
      const suffix = token.split('__').pop()
      if (suffix && CARDS.includes(suffix)) return el as HTMLElement
    }
    el = el.parentElement
  }
  return null
}

export function TapReveal() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!window.matchMedia('(max-width: 760px)').matches) return
      if ((e.target as Element).closest('a, button')) return
      const card = cardFor(e.target as Element)
      if (card) card.classList.toggle('tap-open')
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
  return null
}
