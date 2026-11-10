'use client'

import { useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useLenis } from 'lenis/react'
import { gsap } from '@/lib/animations/gsap'
import styles from './stay-detail.module.css'

type Photo = { url: string; caption: string }

/**
 * Fullscreen viewer for the stay gallery. Opens by growing out of the tile
 * that was clicked (its rect is passed as `from`), closes back into it.
 * Arrow keys / buttons / swipe move between photos; Esc or the backdrop
 * closes it.
 */
export function GalleryLightbox({
  photos,
  index,
  from,
  onIndex,
  onClose,
}: {
  photos: Photo[]
  index: number
  from: DOMRect | null
  onIndex: (i: number) => void
  onClose: () => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const closing = useRef(false)
  const lenis = useLenis()
  const photo = photos[index]

  const go = useCallback((step: number) => onIndex((index + step + photos.length) % photos.length), [index, onIndex, photos.length])

  const close = useCallback(() => {
    const root = rootRef.current
    const frame = frameRef.current
    if (!root || !frame || closing.current) return
    closing.current = true
    const tl = gsap.timeline({ onComplete: onClose })
    tl.to(root, { backgroundColor: 'rgba(14, 13, 10, 0)', duration: 0.4 }, 0)
    tl.to(root.querySelectorAll('[data-lb-ui]'), { opacity: 0, duration: 0.2 }, 0)
    if (from) {
      const box = frame.getBoundingClientRect()
      tl.to(frame, {
        x: from.left + from.width / 2 - (box.left + box.width / 2),
        y: from.top + from.height / 2 - (box.top + box.height / 2),
        scale: from.width / box.width,
        duration: 0.5,
        ease: 'power3.inOut',
      }, 0)
    } else {
      tl.to(frame, { opacity: 0, duration: 0.3 }, 0)
    }
  }, [from, onClose])

  // Opening: grow out of the clicked tile.
  useEffect(() => {
    const root = rootRef.current
    const frame = frameRef.current
    if (!root || !frame) return
    // Explicit fromTo (not from), and reset first: a re-run of this effect
    // would otherwise read the half-started values as its end state.
    gsap.set(frame, { x: 0, y: 0, scale: 1 })
    const box = frame.getBoundingClientRect()
    const tl = gsap.timeline()
    tl.fromTo(root, { backgroundColor: 'rgba(14, 13, 10, 0)' }, { backgroundColor: 'rgba(14, 13, 10, 0.92)', duration: 0.45 }, 0)
    if (from) {
      tl.fromTo(
        frame,
        {
          x: from.left + from.width / 2 - (box.left + box.width / 2),
          y: from.top + from.height / 2 - (box.top + box.height / 2),
          scale: Math.min(from.width / box.width, from.height / box.height),
        },
        { x: 0, y: 0, scale: 1, duration: 0.6, ease: 'power3.inOut' },
        0,
      )
    }
    tl.fromTo(root.querySelectorAll('[data-lb-ui]'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05 }, 0.35)
    return () => {
      tl.kill()
    }
    // Runs once, on open; later index changes swap the image in place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Gentle crossfade when moving between photos.
  useEffect(() => {
    const img = frameRef.current?.querySelector('img')
    if (img) gsap.fromTo(img, { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' })
  }, [index])

  useEffect(() => {
    lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      document.documentElement.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [close, go, lenis])

  const touchX = useRef(0)

  return (
    <div
      className={styles.lb}
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption}
      onClick={(e) => e.target === e.currentTarget && close()}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
      }}
    >
      <div className={styles.lbFrame} ref={frameRef}>
        <Image src={photo.url} alt={photo.caption} fill sizes="90vw" style={{ objectFit: 'contain' }} />
      </div>
      <p className={styles.lbCaption} data-lb-ui>
        <span>{String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span>
        {photo.caption}
      </p>
      <button type="button" className={`${styles.lbBtn} ${styles.lbClose}`} onClick={close} aria-label="Close" data-lb-ui>
        ×
      </button>
      <button type="button" className={`${styles.lbBtn} ${styles.lbPrev}`} onClick={() => go(-1)} aria-label="Previous photo" data-lb-ui>
        ←
      </button>
      <button type="button" className={`${styles.lbBtn} ${styles.lbNext}`} onClick={() => go(1)} aria-label="Next photo" data-lb-ui>
        →
      </button>
    </div>
  )
}
