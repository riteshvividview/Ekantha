// "Page has settled" signal for background preloading.
//
// The first-load screen only waits for the hero. Everything heavier further
// down the homepage (BambooDine's scroll video, the Reach map, the threeui
// testimonials frame) waits for this instead: it fires once the hero is in
// and the browser is idle, so those downloads/set-ups never compete with the
// first screen, yet are ready long before anyone scrolls to them.
//
// fireWarmup() is called by InitialLoadScreen when it finishes. If the loader
// doesn't render (repeat visit, or not the homepage), the first onWarmup()
// caller arms a fallback: window load + idle.

let fired = false
const target = new EventTarget()

const idle = (cb: () => void, timeout = 2000) => {
  const w = window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number }
  if (w.requestIdleCallback) w.requestIdleCallback(cb, { timeout })
  else setTimeout(cb, 600)
}

export function fireWarmup() {
  if (fired || typeof window === 'undefined') return
  idle(() => {
    if (fired) return
    fired = true
    target.dispatchEvent(new Event('warmup'))
  })
}

let fallbackArmed = false
function armFallback() {
  if (fallbackArmed) return
  fallbackArmed = true
  const go = () => window.setTimeout(fireWarmup, 1200)
  if (document.readyState === 'complete') go()
  else window.addEventListener('load', go, { once: true })
  // Never wait forever on a stalled asset.
  window.setTimeout(fireWarmup, 8000)
}

/** Runs cb once the page has settled (immediately if it already has). */
export function onWarmup(cb: () => void) {
  if (typeof window === 'undefined') return () => {}
  if (fired) {
    cb()
    return () => {}
  }
  // The loader calls fireWarmup itself; only arm the fallback when it isn't on screen.
  if (!document.querySelector('.ve-load-screen')) armFallback()
  const handler = () => cb()
  target.addEventListener('warmup', handler, { once: true })
  return () => target.removeEventListener('warmup', handler)
}
