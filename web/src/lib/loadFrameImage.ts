// Shared by the three scroll-scrubbed canvas sequences (Hero, BambooDine,
// ChooseEscape). A frame that 404s or drops mid-fetch used to resolve
// immediately and still count toward load progress — which let the loader
// hit 100% and reveal the page while real frames were silently missing,
// showing up later as stutter/neighbour-frame substitution during scroll.
// Retrying here means progress only reports a frame as done once it has
// actually loaded or has genuinely exhausted its attempts.
const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 500

export function loadFrameImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    let attempt = 0
    const tryLoad = () => {
      attempt++
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => resolve(img)
      img.onerror = () => {
        if (attempt < MAX_ATTEMPTS) {
          window.setTimeout(tryLoad, RETRY_DELAY_MS * attempt)
        } else {
          console.warn(`[loadFrameImage] gave up after ${MAX_ATTEMPTS} attempts: ${src}`)
          resolve(null)
        }
      }
      img.src = src
    }
    tryLoad()
  })
}
