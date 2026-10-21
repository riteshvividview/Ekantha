'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Home, Stay } from '@/payload-types'
import { CountUp } from '@/components/shared/CountUp'
import { assetUrl } from '@/lib/assetUrl'
import { gsap } from '@/lib/animations/gsap'
import styles from './ChooseEscape.module.css'

// Three stills (one per stay), not the scroll-scrubbed drone video this
// section used to pin the page for — see the commit that replaced it for
// why: a manager testing the live site found that kind of forced-scroll
// hijacking heavy-handed for what's fundamentally a "pick a stay" card
// row, not a cinematic moment. Same source frames as before, now the
// only images this section uses rather than a mobile-only fallback.
const POSTER_SRC: Record<string, string> = {
  'mango-house': assetUrl('/choose-your-escape/Mangohouseimg.png'),
  'stone-house': assetUrl('/choose-your-escape/Stonehouseimg.png'),
  'full-house': assetUrl('/choose-your-escape/Fullhouseimg.png'),
}

// Flavor copy per stay, kept from the old drone sequence's chapter
// breakdown (each stretch of that footage "belonged" to one stay) —
// repurposed here as a one-line mood caption under each card's kicker.
const CARDS = [
  { slug: 'mango-house' as const, kicker: 'Ground Level', tag: 'Mornings by the pool, under the mango trees.' },
  { slug: 'stone-house' as const, kicker: 'Rising View', tag: 'The stone façade, warm light in every room.' },
  { slug: 'full-house' as const, kicker: 'The Whole Estate', tag: 'Both homes, end to end, for the whole party.' },
]

const STAY_SLUG_HREF: Record<string, string> = {
  'mango-house': '/mango-house',
  'stone-house': '/stone-house',
  'full-house': '/full-house',
}

export function ChooseEscape({
  heading,
  sub,
  stays,
}: {
  heading: Home['staysTeaser']['heading']
  sub: Home['staysTeaser']['sub']
  stays: Stay[]
}) {
  const bySlug = Object.fromEntries(stays.map((s) => [s.slug, s])) as Partial<Record<string, Stay>>
  const cards = CARDS.map((c) => ({ ...c, stay: bySlug[c.slug] })).filter(
    (c): c is (typeof CARDS)[number] & { stay: Stay } => !!c.stay,
  )

  const sectionRef = useRef<HTMLElement>(null)
  const cardRefs = useRef<Array<HTMLAnchorElement | null>>([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const q = <T extends Element = HTMLElement>(sel: string) => Array.from(section.querySelectorAll<T>(sel))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canHover = window.matchMedia('(hover: hover)').matches
    const cleanups: Array<() => void> = []

    const ctx = gsap.context(() => {
      if (reduced) return
      gsap.from(q('[data-line-inner]'), {
        yPercent: 115,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.14,
        scrollTrigger: { trigger: q('[data-headline]')[0], start: 'top 85%', once: true },
      })
      gsap.from(q('[data-fade]'), {
        opacity: 0,
        y: 22,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: q('[data-headline]')[0], start: 'top 88%', once: true },
      })
      gsap.from(q('[data-card]'), {
        opacity: 0,
        y: 48,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.14,
        scrollTrigger: { trigger: q('[data-card]')[0], start: 'top 90%', once: true },
      })
    }, section)

    // A gentle 3D tilt toward the cursor on each card — the same
    // premium-interactive touch as the testimonials panel elsewhere on
    // the homepage. Desktop/hover-capable only; there's no pointer to
    // track on touch.
    if (canHover) {
      const cardEls = cardRefs.current.filter((el): el is HTMLAnchorElement => !!el)
      cardEls.forEach((card) => {
        gsap.set(card, { transformPerspective: 1000 })
        // y (the lift) rides along with the tilt rather than a CSS :hover
        // transform — GSAP sets this element's transform inline on every
        // move, which would just clobber a competing CSS transform.
        const onMove = (e: PointerEvent) => {
          const r = card.getBoundingClientRect()
          const px = (e.clientX - r.left) / r.width - 0.5
          const py = (e.clientY - r.top) / r.height - 0.5
          gsap.to(card, { rotationY: px * 6, rotationX: py * -5, y: -6, duration: 0.6, ease: 'power3.out', overwrite: 'auto' })
        }
        const onLeave = () => gsap.to(card, { rotationY: 0, rotationX: 0, y: 0, duration: 0.8, ease: 'power3.out' })
        card.addEventListener('pointermove', onMove)
        card.addEventListener('pointerleave', onLeave)
        cleanups.push(() => {
          card.removeEventListener('pointermove', onMove)
          card.removeEventListener('pointerleave', onLeave)
        })
      })
    }

    return () => {
      cleanups.forEach((fn) => fn())
      ctx.revert()
    }
  }, [cards.length])

  if (!cards.length) return null

  return (
    <section className={`${styles.escape} bg-white`} id="stay" ref={sectionRef}>
      <header className={styles.head}>
        <p className={styles.eyebrow} data-fade>
          <span className={styles.eyebrowDash} />
          Our Stays
        </p>
        <h2 className={styles.headline} data-headline>
          <span className={styles.line}>
            <span className={styles.lineInner} data-line-inner>
              Choose Your
            </span>
          </span>
          <span className={styles.line}>
            <span className={`${styles.lineInner} ${styles.gold}`} data-line-inner>
              {renderLastWord(heading)}
            </span>
          </span>
        </h2>
        {sub && (
          <p className={styles.sub} data-fade>
            {sub}
          </p>
        )}
      </header>

      <div className={styles.grid}>
        {cards.map((c, i) => (
          <a
            className={styles.card}
            href={STAY_SLUG_HREF[c.slug]}
            key={c.slug}
            data-card
            ref={(el) => {
              cardRefs.current[i] = el
            }}
          >
            <span className={styles.cardNum}>{String(i + 1).padStart(2, '0')}</span>
            <div className={styles.cardMedia}>
              <Image
                src={POSTER_SRC[c.slug]}
                alt={c.stay.title}
                fill
                sizes="(max-width: 860px) 82vw, 32vw"
                style={{ objectFit: 'cover' }}
                className={styles.cardImg}
              />
              <span className={styles.cardShade} aria-hidden="true" />
            </div>
            <div className={styles.cardBody}>
              <p className={styles.cardKicker}>{c.kicker}</p>
              <h3 className={styles.cardTitle}>{c.stay.title}</h3>
              <p className={styles.cardTag}>{c.tag}</p>
              <p className={styles.cardQuote}>&ldquo;{c.stay.homeTeaser?.quote}&rdquo;</p>
              <p className={styles.cardFacts}>
                {c.stay.capacity}
                <span className={styles.dot}>·</span>
                {c.stay.homeTeaser?.factsLine}
              </p>
              <p className={styles.cardPrice}>
                from ₹<CountUp value={c.stay.priceFrom} locale="en-IN" /> / night
                {c.stay.priceNote ? ` · ${c.stay.priceNote}` : ''}
              </p>
              <span className={styles.cardCta}>
                View {c.stay.title}
                <span className={styles.cardCtaIcon} aria-hidden="true">
                  <i className="fa-solid fa-arrow-right" />
                </span>
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

function renderLastWord(heading: string) {
  const words = heading.trim().split(' ')
  return words[words.length - 1] ?? heading
}
