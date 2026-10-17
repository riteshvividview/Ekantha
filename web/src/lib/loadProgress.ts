// Tiny cross-component progress bus — InitialLoadScreen (in the root
// layout) and Hero (deep in the page tree) aren't parent/child, so this is
// the simplest way for Hero to report its own frame-loading progress
// without reaching for a state library the rest of the app doesn't use.
const target = new EventTarget()

export function reportProgress(key: string, pct: number) {
  target.dispatchEvent(new CustomEvent('progress', { detail: { key, pct: Math.min(1, Math.max(0, pct)) } }))
}

export function onProgress(cb: (key: string, pct: number) => void) {
  const handler = (e: Event) => {
    const { key, pct } = (e as CustomEvent<{ key: string; pct: number }>).detail
    cb(key, pct)
  }
  target.addEventListener('progress', handler)
  return () => target.removeEventListener('progress', handler)
}
