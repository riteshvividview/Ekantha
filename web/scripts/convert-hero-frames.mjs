// One-off asset pipeline for the Hero section's scroll-scrubbed "entrance"
// sequence: a single landscape video (hero-bg-frames-replace.mp4, moved out
// to ../hero-bg-frames-replace.mp4 — sibling of web/ — once this has run,
// same convention as the raw frame folders) gets split into 24fps frames
// with ffmpeg, scaled down to 1920x1080, then converted to WebP with sharp
// and numbered 1-based/zero-padded so the player (Hero.tsx) can address
// them as frame-001.webp etc. Same output shape as the frame-sequence
// pipelines (convert-bamboo-frames.mjs / convert-escape-frames.mjs), just
// sourced from a video instead of a pre-exported PNG sequence — ffmpeg
// handles the frame extraction + scaling, sharp handles the WebP encode
// (ffmpeg's own webp muxer writes a single animated file, not a numbered
// sequence, which is why this doesn't just do it all in one ffmpeg call).
//
// Not part of the build — run manually whenever the source video changes:
//   node scripts/convert-hero-frames.mjs
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const dirname = path.dirname(fileURLToPath(import.meta.url))
// Reads from wherever the raw video currently sits — inside public/ on the
// very first run (that's where it was uploaded), or the sibling location
// on any later re-run after this script has already relocated it.
const CANDIDATES = [
  path.resolve(dirname, '../public/hero-bg-frames-replace.mp4'),
  path.resolve(dirname, '../../hero-bg-frames-replace.mp4'),
]
const OUT_DIR = path.resolve(dirname, '../public/hero-entrance')
const FPS = 24
const WIDTH = 1920
const HEIGHT = 1080
const QUALITY = 80

async function findSrcVideo() {
  const { access } = await import('node:fs/promises')
  for (const file of CANDIDATES) {
    try {
      await access(file)
      return file
    } catch {
      // try the next candidate
    }
  }
  throw new Error(`Couldn't find the raw video at any of:\n${CANDIDATES.join('\n')}`)
}

async function main() {
  const srcVideo = await findSrcVideo()
  const pngDir = await mkdtemp(path.join(tmpdir(), 'hero-frames-'))

  console.log(`Extracting ${FPS}fps frames from ${srcVideo} ...`)
  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-i', srcVideo,
      '-vf', `fps=${FPS},scale=${WIDTH}:${HEIGHT}:flags=lanczos`,
      path.join(pngDir, 'frame-%04d.png'),
      '-hide_banner',
      '-loglevel', 'error',
    ],
    { stdio: 'inherit' },
  )

  await rm(OUT_DIR, { recursive: true, force: true })
  await mkdir(OUT_DIR, { recursive: true })
  const files = (await readdir(pngDir)).filter((f) => f.endsWith('.png')).sort()

  let totalBytes = 0
  for (let i = 0; i < files.length; i++) {
    const outName = `frame-${String(i + 1).padStart(3, '0')}.webp`
    const info = await sharp(path.join(pngDir, files[i]))
      .webp({ quality: QUALITY })
      .toFile(path.join(OUT_DIR, outName))
    totalBytes += info.size
    process.stdout.write(`\r${i + 1}/${files.length} converted`)
  }
  await rm(pngDir, { recursive: true, force: true })

  console.log(`\nDone. ${files.length} frames, ${(totalBytes / 1024 / 1024).toFixed(1)}MB total in ${OUT_DIR}`)
  console.log(`Source read from: ${srcVideo}`)
  console.log(`!! Update FRAME_COUNT in Hero.tsx to ${files.length} if it changed. !!`)
}

main()
