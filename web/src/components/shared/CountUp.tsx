'use client'

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/animations/gsap'

type Props =
  | { value: string; className?: string; format?: never }
  | { value: number; className?: string; format?: (n: number) => string }

/**
 * Animates a number counting up from 0 once it scrolls into view. Given a
 * plain string ("11", "2024", "2.5"), any non-numeric text (a stat that's
 * a raw label like "24/7") renders as plain static text instead of
 * attempting to animate it, and decimal precision is preserved from the
 * source string. Given a `number` with an optional `format` (e.g. Indian
 * currency grouping), the formatted string is re-derived on every tick.
 */
export function CountUp({ value, className, format }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const isNumeric = typeof value === 'number'
  const match = isNumeric ? null : value.trim().match(/^(\d+(?:\.\d+)?)$/)
  const target = isNumeric ? value : match ? parseFloat(match[1]) : null
  const decimals = isNumeric ? 0 : match?.[1].includes('.') ? match[1].split('.')[1].length : 0

  useEffect(() => {
    const el = ref.current
    if (!el || target === null) return

    const counter = { val: 0 }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        observer.disconnect()
        gsap.to(counter, {
          val: target,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => {
            const rounded = decimals ? counter.val : Math.round(counter.val)
            el.textContent = format ? format(rounded) : rounded.toFixed(decimals)
          },
        })
      },
      { threshold: 0.4 },
    )
    observer.observe(el)

    return () => observer.disconnect()
  }, [target, decimals, format])

  if (target === null) return <span className={className}>{value}</span>

  return (
    <span ref={ref} className={className}>
      {format ? format(0) : (0).toFixed(decimals)}
    </span>
  )
}
