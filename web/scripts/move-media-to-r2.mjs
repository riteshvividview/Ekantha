// One-off: moves the media still living in public/ onto R2, sorted into
// folders, and sets a read-only CORS rule so the testimonials frame (which
// draws its photos with crossorigin) can use them.
// Usage (from web/): node --env-file=.env scripts/move-media-to-r2.mjs
import { S3Client, PutObjectCommand, HeadObjectCommand, PutBucketCorsCommand } from '@aws-sdk/client-s3'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const P = (f) => path.resolve('public', f)
// local file in public/ → R2 key
const MAP = [
  ['ekantha-logo-white.webp', 'brand/ekantha-logo-white.webp'],
  ['ekantha-logo-brown.webp', 'brand/ekantha-logo-brown.webp'],
  ['ekantha-logo-orange.png', 'brand/ekantha-logo-orange.png'],
  ['icon-mark.svg', 'brand/icon-mark.svg'],
  ['logo-loader.mp4', 'brand/logo-loader.mp4'],
  ['videos/hero-drone-intra.mp4', 'videos/hero-drone-intra.mp4'],
  ['videos/bamboo-dine-intra.mp4', 'videos/bamboo-dine-intra.mp4'],
  ['audio/farm-dinner-audio.mp3', 'audio/farm-dinner-audio.mp3'],
  ...['birds-flight', 'grass-tuft', 'coconut-palm-tree', 'bamboo-silhouette', 'palm-frond-corner', 'palm-leaf', 'mango-leaf-sprig'].map((n) => [`images/organize/${n}.png`, `images/decor/${n}.png`]),
  ...['card-ecostove', 'card-ethos', 'card-peaceful-1', 'card-peaceful-2', 'card-stories-1', 'card-stories-2', 'card-unhurried-1', 'card-unhurried-2'].map((n) => [`landing-pages/inner-green-assets/${n}.jpg`, `testimonials/${n}.jpg`]),
  ['DRONE CLIP 01.mp4', 'archive/drone-clip-01.mp4'],
  ['stone-house-image.png', 'archive/stone-house-image.png'],
  ['file.svg', 'archive/file.svg'],
  ['globe.svg', 'archive/globe.svg'],
  ['window.svg', 'archive/window.svg'],
]
const TYPES = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg' }

const Bucket = process.env.R2_BUCKET_NAME
const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
})

let total = 0
for (const [local, key] of MAP) {
  const file = P(local)
  const size = (await stat(file)).size
  try {
    const head = await client.send(new HeadObjectCommand({ Bucket, Key: key }))
    if (head.ContentLength === size) { console.log('exists  ', key); continue }
  } catch {}
  await client.send(new PutObjectCommand({
    Bucket, Key: key, Body: await readFile(file),
    ContentType: TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream',
    CacheControl: 'public, max-age=31536000, immutable',
  }))
  total += size
  console.log('uploaded', key, Math.round(size / 1024) + 'KB')
}

await client.send(new PutBucketCorsCommand({
  Bucket,
  CORSConfiguration: { CORSRules: [{ AllowedOrigins: ['*'], AllowedMethods: ['GET', 'HEAD'], AllowedHeaders: ['*'], MaxAgeSeconds: 86400 }] },
}))
console.log('CORS: read-only GET/HEAD from any origin')
console.log('done,', Math.round(total / 1024 / 1024) + 'MB uploaded')
