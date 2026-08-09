'use client'

import { useEffect, useRef, useState } from 'react'
import type { Faq } from '@/payload-types'
import styles from './faqs.module.css'

/**
 * Sections 01 (intro + search) and 02 (sticky rail + category list) are
 * built as one client component because the search box in section 01
 * filters items rendered in section 02 — same cross-section interaction
 * FAQs.html's own vanilla script has, just re-homed as a single React
 * component instead of two independently-querying `<script>` blocks.
 */
export function FaqPage({ data }: { data: Faq }) {
  const categories = data.categories ?? []
  const rootRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [activeSlug, setActiveSlug] = useState<string | undefined>(categories[0]?.slug)

  // Sticky rail: highlight whichever category is currently in view.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const categoryEls = Array.from(root.querySelectorAll<HTMLElement>('[data-faq-category]'))
    if (!categoryEls.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSlug((entry.target as HTMLElement).dataset.faqCategory)
        })
      },
      { rootMargin: '-20% 0px -70% 0px' },
    )
    categoryEls.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const trimmed = query.trim().toLowerCase()
  const isSearching = trimmed.length > 0

  function itemMatches(item: { question: string; answer: string }) {
    return `${item.question} ${item.answer}`.toLowerCase().includes(trimmed)
  }

  // The <details> "open" state is otherwise fully uncontrolled (so manual
  // clicks aren't fought on re-render) — this effect only ever forces
  // matched items *open* while searching, mirroring the original script's
  // `item.open = true` (it never force-closes on clear).
  useEffect(() => {
    if (!isSearching) return
    const root = rootRef.current
    if (!root) return
    Array.from(root.querySelectorAll<HTMLDetailsElement>('[data-faq-item]')).forEach((el) => {
      if (el.dataset.match === 'true') el.open = true
    })
  }, [trimmed, isSearching])

  const categoriesWithMeta = categories.map((cat) => {
    const items = cat.items ?? []
    const matchedFlags = items.map((item) => itemMatches(item))
    return { cat, items, matchedFlags, catHasMatch: matchedFlags.some(Boolean) }
  })
  const matchCount = isSearching ? categoriesWithMeta.reduce((sum, c) => sum + c.matchedFlags.filter(Boolean).length, 0) : 0

  return (
    <div ref={rootRef}>
      <section className={styles.faqIntro} id="top">
        <div className={styles.faqIntroInner}>
          <span className="eyebrow">{data.eyebrow}</span>
          <h1 className="display-lg">{renderHeading(data.heading)}</h1>
          {data.sub && <p className={styles.faqIntroSub}>{data.sub}</p>}

          <div className={`${styles.searchBox}${query ? ` ${styles.hasValue}` : ''}`}>
            <svg viewBox="0 0 24 24">
              <circle cx="10.5" cy="10.5" r="7" />
              <line x1="21" y1="21" x2="15.8" y2="15.8" />
            </svg>
            <input
              type="text"
              placeholder={data.searchPlaceholder ?? undefined}
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="button" className={styles.searchClear} onClick={() => setQuery('')}>
              clear
            </button>
          </div>
          {isSearching && (
            <p className={styles.searchCount}>
              {matchCount === 0 ? `No questions match "${query.trim()}".` : `${matchCount} question${matchCount === 1 ? '' : 's'} found.`}
            </p>
          )}
        </div>
      </section>

      <section id="faq-body">
        <div className={styles.faqShell}>
          <nav className={styles.faqRail} aria-label="FAQ categories">
            {categories.map((cat) => (
              <a href={`#${cat.slug}`} className={activeSlug === cat.slug ? 'active' : undefined} key={cat.id ?? cat.slug}>
                {cat.title}
              </a>
            ))}
          </nav>

          <div>
            {categoriesWithMeta.map(({ cat, items, matchedFlags, catHasMatch }, ci) => {
              return (
                <div
                  className={`${styles.faqCategory}${isSearching && !catHasMatch ? ` ${styles.hidden}` : ''}`}
                  id={cat.slug}
                  data-faq-category={cat.slug}
                  key={cat.id ?? cat.slug}
                >
                  <div className={styles.faqCategoryHead}>
                    <span className={styles.faqCategoryNum}>{cat.number}</span>
                    <h2 className={styles.categoryTitle}>{cat.title}</h2>
                  </div>

                  {items.map((item, ii) => (
                    <details
                      className={`${styles.faqItem}${isSearching && !matchedFlags[ii] ? ` ${styles.hidden}` : ''}`}
                      data-faq-item
                      data-match={matchedFlags[ii] ? 'true' : 'false'}
                      open={ci === 0 && ii === 0}
                      key={item.id ?? ii}
                    >
                      <summary>
                        {item.question}
                        <span className={styles.faqPlus}>+</span>
                      </summary>
                      <div className={styles.faqAnswer}>{item.answer}</div>
                    </details>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

/** "Answers, before\nyou have to ask." → line break on `\n`, last word of
 *  the last line italicized, matching "Answers, before<br>you have to <em>ask.</em>" */
function renderHeading(heading: string) {
  const lines = heading.split('\n')
  return lines.map((line, i, arr) => (
    <span key={i}>
      {i < arr.length - 1 ? line : renderLastLine(line)}
      {i < arr.length - 1 && <br />}
    </span>
  ))
}

function renderLastLine(line: string) {
  const words = line.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
