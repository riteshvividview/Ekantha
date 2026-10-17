'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import Image from 'next/image'
import type { Stay, StayPage } from '@/payload-types'
import { resolveMediaSize } from '@/lib/media'
import { CountUp } from '@/components/shared/CountUp'
import { gsap, ScrollTrigger } from '@/lib/animations/gsap'
import styles from './stay.module.css'

const STAY_SLUG_HREF: Record<string, string> = {
  'mango-house': '/mango-house',
  'stone-house': '/stone-house',
  'full-house': '/full-house',
}

// Each stay gets its own quiet accent instead of one flat neutral treatment
// across all three — a small, deliberate "color difference" per card so
// Mango / Stone / Full House read as distinct choices, not three copies of
// one template. Kept muted so it never fights the page's silver/ink base.
const ACCENTS = ['rgba(196, 130, 64, 0.55)', 'rgba(107, 122, 104, 0.55)', 'rgba(70, 70, 120, 0.5)']

export function StaysSection({ data, stays }: { data: StayPage['staysSection']; stays: Stay[] }) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // gsap.context + ctx.revert() for everything, including the section
    // heading's own tween — anything created outside this scope survives a
    // React Strict Mode dev double-invoke uncleaned, leaving a second,
    // orphaned ScrollTrigger-driven tween racing the first on the same
    // element (this is what was stalling Amenities' card entrance at a
    // few percent opacity; fixed the same way there).
    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll('.section-head'), {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 85%', once: true },
      })

      if (reduced) return

      const blocks = Array.from(section.querySelectorAll<HTMLElement>(`.${styles.stayBlock}`))

      blocks.forEach((block) => {
        // Reading-progress rail: a thin line next to each stay's number
        // fills from 0% to 100% as that block scrolls through — a tactile
        // "you are here" marker unique to this catalog section.
        const rail = block.querySelector(`.${styles.stayRailFill}`)
        if (rail) {
          gsap.fromTo(
            rail,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: 'none',
              scrollTrigger: { trigger: block, start: 'top 70%', end: 'bottom 40%', scrub: true },
            },
          )
        }

        // Plate: clip-path wipe in on first entry, then a slow continuous
        // parallax drift on the image itself while the block is in view.
        const plate = block.querySelector(`.${styles.stayPlate}`)
        const plateImg = plate?.querySelector('img')
        if (plate) {
          gsap.from(plate, {
            clipPath: 'inset(0% 0% 100% 0%)',
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: block, start: 'top 80%', once: true },
          })
        }
        if (plateImg) {
          gsap.fromTo(
            plateImg,
            { scale: 1.16, yPercent: -6 },
            {
              scale: 1.04,
              yPercent: 6,
              ease: 'none',
              scrollTrigger: { trigger: block, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          )
        }

        // Copy column staggers in once.
        const copyBits = block.querySelectorAll(
          `.${styles.stayQuote}, .${styles.staySpecs}, .${styles.stayLists} > *, .${styles.stayNote}, .${styles.stayCtaRow}`,
        )
        gsap.from(copyBits, {
          opacity: 0,
          y: 22,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.06,
          scrollTrigger: { trigger: block, start: 'top 78%', once: true },
        })

        gsap.from(block.querySelector(`.${styles.stayBlockHeader}`), {
          opacity: 0,
          y: 18,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: block, start: 'top 85%', once: true },
        })
      })

      ScrollTrigger.refresh()
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section className={styles.staysSection} id="stays" ref={sectionRef}>
      <div className="section-head">
        <h2 className={`section-title ${styles.sectionTitle}`}>{renderHeading(data.heading)}</h2>
        {data.sub && <p>{data.sub}</p>}
      </div>

      {stays.map((stay, i) => {
        const image = resolveMediaSize(stay.heroImage, 'card')
        const lists = stay.overviewBlock?.lists ?? []
        const accent = ACCENTS[i % ACCENTS.length]
        return (
          <div className={styles.stayBlock} key={stay.id} style={{ '--stay-accent': accent } as CSSProperties}>
            <div className={styles.stayBlockHeader}>
              <div className={styles.stayBlockNum}>
                <span className={styles.stayRailTrack} aria-hidden="true">
                  <span className={styles.stayRailFill} />
                </span>
                stay / no. {String(i + 1).padStart(2, '0')}
              </div>
              <div>
                <h3 className={styles.stayBlockTitle}>{renderTitle(stay.title)}</h3>
                <p className={styles.stayBlockTagline}>{stay.tagline}</p>
              </div>
            </div>

            <div className={styles.stayBlockBody}>
              <div>
                <blockquote className={styles.stayQuote}>&ldquo;{stay.description.pullQuote}&rdquo;</blockquote>

                <div className={styles.staySpecs}>
                  <span className={styles.key}>capacity</span>
                  <span className={styles.val}>{stay.capacity}</span>
                  <span className={styles.key}>bed</span>
                  <span className={styles.val}>{stay.overviewBlock?.bed}</span>
                  <span className={styles.key}>character</span>
                  <span className={styles.val}>{stay.overviewBlock?.character}</span>
                </div>

                <div className={styles.stayLists}>
                  {lists.map((list, li) => (
                    <div key={list.id ?? li}>
                      <p className={styles.slistHead}>{list.heading}</p>
                      <ul className={styles.slist}>
                        {(list.items ?? []).map((item, ii) => (
                          <li key={item.id ?? ii}>{item.text}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {stay.overviewBlock?.note && <div className={styles.stayNote}>{stay.overviewBlock.note}</div>}

                <div className={styles.stayCtaRow}>
                  <div className={styles.stayPrice}>
                    <div className={styles.amount}>
                      from ₹<CountUp value={stay.priceFrom} locale="en-IN" /> / night
                    </div>
                    {stay.priceNote && <div className={styles.incl}>{stay.priceNote}</div>}
                  </div>
                  <a href={STAY_SLUG_HREF[stay.slug] ?? '#'} className={`btn btn-primary ${styles.btnSmall}`}>
                    Hold {stay.title} →
                  </a>
                </div>
              </div>

              <div className={styles.stayPlate}>{image.url && <Image src={image.url} alt={image.alt} fill sizes="(max-width: 768px) 100vw, 45vw" style={{ objectFit: 'cover' }} />}</div>
            </div>
          </div>
        )
      })}
    </section>
  )
}

/** Italicizes the last word, matching "three ways to <em>stay.</em>" */
function renderHeading(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}

/** Italicizes the last word, matching "Mango <em>House</em>" */
function renderTitle(title: string) {
  const words = title.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
