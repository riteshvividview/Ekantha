// One-off asset pipeline: the raw bamboo-dinner image sequence
// (bamboo-dinner-frames/, sibling to web/) ships as ~240 full-size PNGs —
// 1280x720, ~800KB-900KB each, ~188MB total. Loading that in a browser
// for a scroll-scrubbed sequence isn't viable. This converts every frame
// to WebP (no alpha channel in the source, so no quality tradeoff lost
// converting away from PNG) at a quality that's indistinguishable for a
// dim, moody dinner scene but roughly 10-15x smaller per frame.
//
// Not part of the build — run manually whenever the source frames change:
//   node scripts/convert-bamboo-frames.mjs
import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC_DIR = path.resolve(dirname, '../../bamboo-dinner-frames')
const OUT_DIR = path.resolve(dirname, '../public/bamboo-dine')
const QUALITY = 78

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
