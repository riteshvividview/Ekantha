'use client'

import { useEffect, useRef, useState } from 'react'
import type { Home } from '@/payload-types'
import { SectionHead } from '@/components/shared/SectionHead'
import { FloatingIcon, type IconShape } from '@/components/three/FloatingIcon'
import { gsap } from '@/lib/animations/gsap'
import styles from './home.module.css'

const BADGE_CLASSES = [styles.badgeGreen, styles.badgeAmber, styles.badgePurple, styles.badgeBlue]
const ICON_SHAPES: IconShape[] = ['icosahedron', 'torus', 'octahedron', 'cone']
const ICON_COLORS = ['#4ade80', '#fbbf24', '#c084fc', '#60a5fa']

type WhyItem = NonNullable<Home['whyUs']['items']>[number]

/**
 * "Why Vana Ekantha" — hover-driven, not scroll-driven (deliberately
 * distinct from ExperienceReel's pinned scroll pan). Each card tilts in 3D
 * toward the cursor (GSAP quickTo on rotationX/rotationY, like
 * InteractionEffects' site-wide tilt, but more pronounced since this
 * section is the focal point of the effect) and its icon — a real React
 * Three Fiber mesh, not a static SVG — spins up and grows slightly while
 * hovered. The background is plain white with a very faint decorative
 * line texture instead of the flat `--silver` fill the section used to
 * have.
 */
export function WhyUs({ data }: { data: Home['whyUs'] }) {
  return (
    <section className={styles.whySection} id="why">
      <svg className={styles.whyLines} viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-50,80 C150,20 300,140 500,80 C700,20 850,120 1050,80" />
        <path d="M-50,260 C150,200 300,320 500,260 C700,200 850,300 1050,260" />
        <path d="M-50,430 C150,370 300,480 500,430 C700,370 850,470 1050,430" />
      </svg>

      <SectionHead title={renderTitle(data.heading)} sub={data.sub} />

      <div className={styles.whyGrid}>
        {(data.items ?? []).map((item, i) => (
          <WhyCard item={item} index={i} key={item.id ?? i} />
        ))}
      </div>
    </section>
  )
}

function WhyCard({ item, index }: { item: WhyItem; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const card = cardRef.current
    if (!card || window.matchMedia('(hover: none)').matches) return

    // `rotationX`/`rotationY` — GSAP's actual property names, not the
    // CSS-native `rotateX`/`rotateY`, which its CSSPlugin doesn't parse.
    const rotateXTo = gsap.quickTo(card, 'rotationX', { duration: 0.5, ease: 'power3.out' })
    const rotateYTo = gsap.quickTo(card, 'rotationY', { duration: 0.5, ease: 'power3.out' })
    const yTo = gsap.quickTo(card, 'y', { duration: 0.5, ease: 'power3.out' })

    gsap.set(card, { transformPerspective: 900 })

    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      rotateXTo(py * -12)
      rotateYTo(px * 12)
      yTo(-6)
    }
    const onLeave = () => {
      rotateXTo(0)
      rotateYTo(0)
      yTo(0)
    }

    card.addEventListener('mousemove', onMove)
    card.addEventListener('mouseleave', onLeave)
    return () => {
      card.removeEventListener('mousemove', onMove)
      card.removeEventListener('mouseleave', onLeave)
      gsap.set(card, { clearProps: 'rotationX,rotationY,y' })
    }
  }, [])

  return (
    <div
      className={`${styles.whyCard} reveal`}
      ref={cardRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className={`${styles.cellBadge} ${BADGE_CLASSES[index % 4]}`}>{item.badgeLabel}</span>

      <div className={styles.whyCardIcon}>
        <FloatingIcon shape={ICON_SHAPES[index % 4]} color={ICON_COLORS[index % 4]} hovered={hovered} />
      </div>

      <div className={styles.cellTitle}>{item.title}</div>
      <div className={styles.cellBody}>{item.body}</div>
    </div>
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
