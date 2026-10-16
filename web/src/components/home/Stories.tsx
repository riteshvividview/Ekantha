'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/animations/gsap'
import styles from './Stories.module.css'

// Static uploads, not CMS fields — drop files into
// web/public/images/home/08-testimonials/ and set the paths here, in the
// same order as STORIES. While null, each story shows a gradient scene.
const IMAGES: Array<string | null> = [null, null, null, null, null]

// One feeling per story. Placeholder guest words — swap for real,
// permissioned reviews. (Single property: no locations anywhere.)
const STORIES = [
  {
    word: 'Peaceful',
    quote: 'A peaceful escape with beautiful spaces and even better people. Highly recommended.',
    name: 'Neha Kapoor',
    icon: 'fa-dove',
  },
  {
    word: 'Unhurried',
    quote: 'We came to celebrate and left having actually rested. Nothing felt rushed, nothing felt staged.',
    name: 'Karthik Rao',
    icon: 'fa-hourglass-half',
  },
  {
    word: 'Fresh',
    quote: 'Truly a refreshing experience. The vibe, the views, the food. Everything was perfect.',
    name: 'Rohan Mehta',
    icon: 'fa-leaf',
  },
  {
    word: 'Warm',
    quote: 'A perfect blend of nature, comfort and warm hospitality. We didn’t want to leave.',
    name: 'Priya & Arjun',
    icon: 'fa-sun',
  },
  {
    word: 'Unforgettable',
    quote: 'We woke to birdsong and slept under more stars than I knew existed. The kids still talk about the farm dinner.',
    name: 'Ananya & Vikram',
    icon: 'fa-star',
  },
]
const N = STORIES.length

export function Stories() {
  const sectionRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [inView, setInView] = useState(false)

  // Stars pop each time a new story comes in.
  useEffect(() => {
    const stars = sectionRef.current?.querySelectorAll(`[data-stars="${active}"] i`)
    if (!stars || stars.length === 0) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo(stars, { scale: 0, rotation: -80 }, { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(2.6)', stagger: 0.05, delay: 0.3 })
  }, [active])

  useEffect(() => {
    const section = sectionRef.current
    const panel = panelRef.current
    if (!section || !panel) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const canHover = window.matchMedia('(hover: hover)').matches
    const q = <T extends Element = HTMLElement>(sel: string) => Array.from(section.querySelectorAll<T>(sel))
    const cleanups: Array<() => void> = []

    // Autoplay only runs while the section is actually on screen.
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.4 })
    observer.observe(section)
    cleanups.push(() => observer.disconnect())

    const ctx = gsap.context(() => {
      if (reduced) return

      gsap.from(q('[data-line-inner]'), {
        yPercent: 115,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.12,
        scrollTrigger: { trigger: q('[data-headline]')[0], start: 'top 88%', once: true },
      })
      gsap.from(q('[data-fade]'), {
        opacity: 0,
        y: 20,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: q('[data-headline]')[0], start: 'top 90%', once: true },
      })
      gsap.from(q('[data-item]'), {
        opacity: 0,
        x: -30,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.09,
        scrollTrigger: { trigger: q('[data-item]')[0], start: 'top 90%', once: true },
      })
      gsap.from(panel, {
        clipPath: 'inset(10% 6% 10% 14% round 48px)',
        opacity: 0,
        duration: 1.4,
        ease: 'power3.out',
        scrollTrigger: { trigger: panel, start: 'top 90%', once: true },
      })
      // The scenes drift slowly against the scroll inside their frame.
      gsap.fromTo(
        q('[data-drift]'),
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: 'none',
          scrollTrigger: { trigger: panel, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )

      if (!canHover) return
      // Gentle 3D tilt toward the cursor.
      gsap.set(panel, { transformPerspective: 1200 })
      const onMove = (e: PointerEvent) => {
        const r = panel.getBoundingClientRect()
        const px = (e.clientX - r.left) / r.width - 0.5
        const py = (e.clientY - r.top) / r.height - 0.5
        gsap.to(panel, { rotationY: px * 4, rotationX: py * -3, duration: 0.7, ease: 'power3.out', overwrite: 'auto' })
      }
      const onLeave = () => gsap.to(panel, { rotationY: 0, rotationX: 0, duration: 0.9, ease: 'power3.out' })
      panel.addEventListener('pointermove', onMove)
      panel.addEventListener('pointerleave', onLeave)
      cleanups.push(() => {
        panel.removeEventListener('pointermove', onMove)
        panel.removeEventListener('pointerleave', onLeave)
      })
    }, section)

    return () => {
      cleanups.forEach((fn) => fn())
      ctx.revert()
    }
  }, [])

  return (
    <section className={styles.stories} id="stories" ref={sectionRef} data-inview={inView}>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow} data-fade>
            <span className={styles.eyebrowDash} />
            Guest Stories
          </p>
          <h2 className={styles.headline} data-headline>
            <span className={styles.line}>
              <span className={styles.lineInner} data-line-inner>
                More Than Just <span className={styles.gold}>a Stay</span>
              </span>
            </span>
          </h2>
        </div>
        <p className={styles.sub} data-fade>
          In their words, one feeling at a time.
        </p>
      </header>

      <div className={styles.grid}>
        <ol className={styles.list}>
          {STORIES.map((s, i) => {
            const on = i === active
            return (
              <li className={styles.item} data-item key={s.word}>
                <button
                  type="button"
                  className={`${styles.trigger}${on ? ` ${styles.triggerOn}` : ''}`}
                  aria-pressed={on}
                  onClick={() => setActive(i)}
                  onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(i)}
                >
                  <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                  <span className={styles.word}>{s.word}</span>
                  <span className={styles.barTrack} aria-hidden="true">
                    <span
                      className={`${styles.bar}${on ? ` ${styles.barOn}` : ''}`}
                      onAnimationEnd={() => on && setActive((a) => (a + 1) % N)}
                    />
                  </span>
                </button>
              </li>
            )
          })}
        </ol>

        <div className={styles.panel} ref={panelRef}>
          {STORIES.map((s, i) => (
            <div className={`${styles.scene} ${styles[`tone${i % 5}`]}${i === active ? ` ${styles.sceneOn}` : ''}`} key={s.word} aria-hidden="true">
              <div className={styles.sceneInner} data-drift>
                {IMAGES[i] ? <img src={IMAGES[i] as string} alt="" /> : <i className={`fa-solid ${s.icon} ${styles.sceneIcon}`} />}
              </div>
            </div>
          ))}
          <div className={styles.shade} aria-hidden="true" />
          <i className={`fa-solid fa-quote-left ${styles.panelQuote}`} aria-hidden="true" />
          <span className={styles.panelCount} aria-hidden="true">
            <b>{String(active + 1).padStart(2, '0')}</b> / {String(N).padStart(2, '0')}
          </span>

          <div className={styles.quotes} aria-live="polite">
            {STORIES.map((s, i) => (
              <figure className={`${styles.story}${i === active ? ` ${styles.storyOn}` : ''}`} aria-hidden={i !== active} key={s.word}>
                <blockquote className={styles.quote}>{s.quote}</blockquote>
                <figcaption className={styles.by}>
                  <strong className={styles.name}>{s.name}</strong>
                  <span className={styles.stars} data-stars={i} aria-label="5 out of 5 stars">
                    {[0, 1, 2, 3, 4].map((k) => (
                      <i className="fa-solid fa-star" key={k} />
                    ))}
                  </span>
                  <span className={styles.byLine} aria-hidden="true" />
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
