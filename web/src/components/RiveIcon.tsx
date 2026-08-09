'use client'

import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas'

type RiveIconProps = {
  /** Path to a .riv file under /public, e.g. "/rive/clover.riv" */
  src?: string
  stateMachine?: string
  className?: string
  /** Rendered when `src` is omitted — no .riv assets exist yet, so every
   *  call site should pass a fallback (an animated SVG/CSS icon) until
   *  real .riv files are commissioned, per stack.md's documented approach. */
  fallback?: React.ReactNode
}

/**
 * Thin wrapper around @rive-app/react-canvas, ready to receive real .riv
 * files for nav/icon micro-interactions. Until then, pass `fallback` (an
 * animated SVG) — this component renders that instead of attempting to
 * load a nonexistent file.
 */
export function RiveIcon({ src, stateMachine, className, fallback }: RiveIconProps) {
  const { RiveComponent } = useRive(
    src
      ? {
          src,
          stateMachines: stateMachine,
          autoplay: true,
          layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
        }
      : { src: '', autoplay: false },
  )

  if (!src) return <>{fallback}</>

  return <RiveComponent className={className} />
}
