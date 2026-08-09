'use client'

import { useEffect } from 'react'

/**
 * Opens the Theatre.js Studio panel in development only, so hero/idle
 * animations can be hand-keyframed against the sheet/object scaffold in
 * lib/animations/theatre/project.ts. No-op in production builds.
 *
 * The dynamic import needs a defensive check for the studio module's
 * default export shape — depending on the bundler's CJS/ESM interop it
 * can come through as `mod.default.initialize` or
 * `mod.default.default.initialize`.
 */
export function TheatreStudioLoader() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    let cancelled = false

    import('@theatre/studio').then((mod) => {
      if (cancelled) return
      const studio = (mod.default as { default?: typeof mod.default }).default ?? mod.default
      studio.initialize()
    })

    return () => {
      cancelled = true
    }
  }, [])

  return null
}
