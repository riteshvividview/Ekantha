// One-off asset pipeline for the Hero section's scroll-scrubbed "entrance"
// sequence: the raw frames (public/Hero-page-entrance-frames/, moved out to
// ../Hero-page-entrance-frames/ — sibling of web/ — once this has run, same
// as the other two frame sequences) ship as 240 full-size PNGs
// (ezgif-frame-001.png … -240.png, 1920x1080, ~1.5MB each, ~360MB total).
// Converts every frame to WebP (no alpha channel in the source) and
// renumbers 1-based/zero-padded so the player (Hero.tsx) can address them as
// frame-001.webp etc — same pattern as convert-bamboo-frames.mjs /
// convert-escape-frames.mjs.
//
// Not part of the build — run manually whenever the source frames change:
//   node scripts/convert-hero-frames.mjs
import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const dirname = path.dirname(fileURLToPath(import.meta.url))
// Reads from wherever the raw frames currently sit — inside public/ on the
// very first run (that's where they were uploaded), or the sibling location
// on any later re-run after this script has already relocated them.
const CANDIDATES = [
  path.resolve(dirname, '../public/Hero-page-entrance-frames'),
  path.resolve(dirname, '../../Hero-page-entrance-frames'),
]
const OUT_DIR = path.resolve(dirname, '../public/hero-entrance')
const QUALITY = 80

async function findSrcDir() {
  for (const dir of CANDIDATES) {
    try {
      await readdir(dir)
      return dir
    } catch {
      // try the next candidate
    }
  }
  throw new Error(`Couldn't find the raw frames in any of:\n${CANDIDATES.join('\n')}`)
}

async function main() {
  const SRC_DIR = await findSrcDir()
  await mkdir(OUT_DIR, { recursive: true })
  const files = (await readdir(SRC_DIR)).filter((f) => f.endsWith('.png')).sort()

  let totalBytes = 0
  for (let i = 0; i < files.length; i++) {
    const outName = `frame-${String(i + 1).padStart(3, '0')}.webp`
    const info = await sharp(path.join(SRC_DIR, files[i]))
      .webp({ quality: QUALITY })
      .toFile(path.join(OUT_DIR, outName))
    totalBytes += info.size
    process.stdout.write(`\r${i + 1}/${files.length} converted`)
  }
  console.log(`\nDone. ${files.length} frames, ${(totalBytes / 1024 / 1024).toFixed(1)}MB total in ${OUT_DIR}`)
  console.log(`Source read from: ${SRC_DIR}`)
}

main()
