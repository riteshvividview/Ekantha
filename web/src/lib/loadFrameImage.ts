// Shared by the three scroll-scrubbed canvas sequences (Hero, BambooDine,
// ChooseEscape). Loads via a plain <img> (same as before — no CORS headers
// needed just to display/draw an image, and the R2 bucket these frames are
// served from doesn't send any), then runs it through createImageBitmap()
// once it's downloaded.
//
// A <img>'s pixel data is otherwise decoded lazily, the first time it's
// actually painted — with hundreds of frames, that decode could still be
// happening on the main thread during scroll, which is what was causing
// the canvas draw to stall and visibly stutter even though every frame
// had already finished downloading. createImageBitmap() forces that
// decode to happen now, off the main thread, so by reveal every frame is
// a ready bitmap and drawImage() at scroll time is just a cheap blit.
// (Fetching the bytes ourselves via fetch()+blob() would get the same
// off-thread decode, but needs CORS to read the response cross-origin,
// which this bucket doesn't have configured — createImageBitmap(img)
// has no such requirement since it's not reading pixel data back out.)
//
// A frame that 404s or drops mid-fetch used to resolve immediately and
// still count toward load progress — which let the loader hit 100% and
// reveal the page while real frames were silently missing. Retrying here
// means progress only reports a frame as done once it has actually
// loaded or has genuinely exhausted its attempts.
const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 500

function loadImageElement(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

export async function loadFrameImage(src: string): Promise<ImageBitmap | null> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const img = await loadImageElement(src)
    if (img) {
      try {
        return await createImageBitmap(img)
      } catch (err) {
        console.warn(`[loadFrameImage] createImageBitmap failed: ${src}`, err)
      }
    }
    if (attempt < MAX_ATTEMPTS) {
      await new Promise((resolve) => window.setTimeout(resolve, RETRY_DELAY_MS * attempt))
    }
  }
  console.warn(`[loadFrameImage] gave up after ${MAX_ATTEMPTS} attempts: ${src}`)
  return null
}
