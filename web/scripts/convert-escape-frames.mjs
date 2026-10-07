// One-off asset pipeline for the "Choose Your Escape" scroll-scrubbed
// sequence: the raw drone-orbit frames (choose-your-escape-frames/, sibling
// to web/) ship as 273 full-size PNGs (ezgif-frame-016.png … -288.png,
// 854x480, ~400-450KB each, ~129MB total). Converts every frame to WebP
// (no alpha channel in the source) and renumbers them 1-based/zero-padded
// so the player (ChooseEscape.tsx) can address them as frame-001.webp etc,
// independent of the source's arbitrary starting index (016).
//
// Not part of the build — run manually whenever the source frames change:
//   node scripts/convert-escape-frames.mjs
import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC_DIR = path.resolve(dirname, '../../choose-your-escape-frames')
const OUT_DIR = path.resolve(dirname, '../public/choose-your-escape')
const QUALITY = 80

async function main() {
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
}

main()
