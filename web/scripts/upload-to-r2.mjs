// One-off migration helper: uploads a local directory to the R2 bucket,
// preserving its relative path structure as the object key prefix.
// Usage: node --env-file=.env scripts/upload-to-r2.mjs <localDir> <r2KeyPrefix>
// Example: node --env-file=.env scripts/upload-to-r2.mjs public/bamboo-dine bamboo-dine

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const [, , localDirArg, keyPrefixArg] = process.argv
if (!localDirArg || !keyPrefixArg) {
  console.error('Usage: node --env-file=.env scripts/upload-to-r2.mjs <localDir> <r2KeyPrefix>')
  process.exit(1)
}

const localDir = path.resolve(localDirArg)
const keyPrefix = keyPrefixArg.replace(/^\/+|\/+$/g, '')

const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME']
for (const name of required) {
  if (!process.env[name]) {
    console.error(`Missing env var ${name} — run with --env-file=.env from the web/ directory.`)
    process.exit(1)
  }
}

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})

const CONTENT_TYPES = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.JPG': 'image/jpeg',
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await walk(full)))
    } else {
      files.push(full)
    }
  }
  return files
}

async function alreadyUploaded(key, size) {
  try {
    const head = await client.send(new HeadObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }))
    return head.ContentLength === size
  } catch {
    return false
  }
}

async function uploadOne(filePath) {
  const rel = path.relative(localDir, filePath).split(path.sep).join('/')
  const key = `${keyPrefix}/${rel}`
  const { size } = await stat(filePath)

  if (await alreadyUploaded(key, size)) {
    return { key, skipped: true }
  }

  const body = await readFile(filePath)
  const ext = path.extname(filePath)
  await client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: CONTENT_TYPES[ext] || 'application/octet-stream',
    }),
  )
  return { key, skipped: false }
}

// Small concurrency pool — same idea as the frame-sequence loaders already
// in the app (6 concurrent requests), just for uploads instead of fetches.
async function pool(items, limit, worker) {
  let i = 0
  let uploaded = 0
  let skipped = 0
  const runners = Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const idx = i++
      const result = await worker(items[idx])
      if (result.skipped) skipped++
      else uploaded++
      const done = uploaded + skipped
      if (done % 25 === 0 || done === items.length) {
        process.stdout.write(`\r${done}/${items.length} (${uploaded} uploaded, ${skipped} already present)`)
      }
    }
  })
  await Promise.all(runners)
  return { uploaded, skipped }
}

const files = await walk(localDir)
console.log(`Found ${files.length} files under ${localDir}`)
console.log(`Uploading to r2://${process.env.R2_BUCKET_NAME}/${keyPrefix}/...`)

const { uploaded, skipped } = await pool(files, 8, uploadOne)
console.log(`\nDone. ${uploaded} uploaded, ${skipped} already present.`)
