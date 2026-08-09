'use client'

import { useEffect, useState } from 'react'
import type { Home } from '@/payload-types'
import styles from './home.module.css'

export function Ticker({ data }: { data: Home['ticker'] }) {
  const [now, setNow] = useState<{ date: string; time: string } | null>(null)

  useEffect(() => {
    const update = () => {
      const n = new Date()
      const date = n
        .toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        .toLowerCase()
      const time = n.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' ist'
      setNow({ date, time })
    }
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={`${styles.ticker} reveal`}>
      <span className={styles.item}>
        today&apos;s weather <b>{data.weatherText}</b>
      </span>
      <span className={styles.sep}>/</span>
      <span className={styles.item}>
        ripening now <b>{data.ripeningText}</b>
      </span>
      <span className={styles.sep}>/</span>
      <span className={styles.item} suppressHydrationWarning>
        {now ? `${now.date} · ${now.time}` : ' '}
      </span>
    </div>
  )
}
