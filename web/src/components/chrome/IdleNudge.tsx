'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * "take your time." — appears after 90s of no activity, hides itself again
 * after 8s or on the next interaction. A small ambient touch, not page
 * content, so it isn't wired to the CMS.
 */
export function IdleNudge() {
  const [show, setShow] = useState(false)
  const idleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const reset = () => {
      setShow(false)
      clearTimeout(idleTimer.current)
      clearTimeout(hideTimer.current)
      idleTimer.current = setTimeout(() => {
        setShow(true)
        hideTimer.current = setTimeout(() => setShow(false), 8000)
      }, 90000)
    }

    const events: Array<keyof WindowEventMap> = ['mousemove', 'scroll', 'keydown', 'click', 'touchstart']
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }))
    reset()

    return () => {
      clearTimeout(idleTimer.current)
      clearTimeout(hideTimer.current)
      events.forEach((ev) => window.removeEventListener(ev, reset))
    }
  }, [])

  return (
    <div className={`idle-nudge${show ? ' show' : ''}`}>
      take your time.
    </div>
  )
}
