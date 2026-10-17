// One-off: adds Cache-Control to every object already in the R2 bucket,
// via a same-bucket/same-key CopyObject with MetadataDirective: REPLACE —
// this rewrites metadata server-side without re-uploading any bytes, so it
// works even though the local converted files are gone (deleted once the
// first migration was verified). New uploads get the header automatically
// from upload-to-r2.mjs; this just backfills what went up before that.
// Usage: node --env-file=.env scripts/backfill-r2-cache-headers.mjs

import { S3Client, ListObjectsV2Command, CopyObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

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

const CACHE_CONTROL = 'public, max-age=31536000, immutable'
const bucket = process.env.R2_BUCKET_NAME

async function listAllKeys() {
  const keys = []
  let continuationToken
  do {
    const res = await client.send(new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: continuationToken }))
    for (const obj of res.Contents ?? []) keys.push(obj.Key)
    continuationToken = res.NextContinuationToken
  } while (continuationToken)
  return keys
}

async function alreadyHasHeader(key) {
  const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
  return head.CacheControl === CACHE_CONTROL
}

async function backfillOne(key) {
  if (await alreadyHasHeader(key)) return { key, skipped: true }
  await client.send(
    new CopyObjectCommand({
      Bucket: bucket,
      Key: key,
      CopySource: `${bucket}/${encodeURIComponent(key)}`,
      MetadataDirective: 'REPLACE',
      CacheControl: CACHE_CONTROL,
    }),
  )
  return { key, skipped: false }
}

async function pool(items, limit, worker) {
  let i = 0
  let done = 0
  let updated = 0
  let skipped = 0
  const runners = Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const idx = i++
      const result = await worker(items[idx])
      if (result.skipped) skipped++
      else updated++
      done++
      if (done % 25 === 0 || done === items.length) {
        process.stdout.write(`\r${done}/${items.length} (${updated} updated, ${skipped} already had it)`)
      }
    }
  })
  await Promise.all(runners)
  return { updated, skipped }
}

const keys = await listAllKeys()
console.log(`Found ${keys.length} objects in r2://${bucket}`)
const { updated, skipped } = await pool(keys, 8, backfillOne)
console.log(`\nDone. ${updated} updated, ${skipped} already had the header.`)
