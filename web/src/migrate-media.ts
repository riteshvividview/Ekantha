/**
 * One-off migration: re-uploads every existing Media doc's file through
 * whatever storage adapter is currently active (now Supabase Storage,
 * since SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY are set) while keeping the
 * same document ID — so every relationship field pointing at these docs
 * (Stays, Home, About, etc.) stays intact. These docs were originally
 * created before the storage adapter was configured, so they're sitting
 * on local disk (web/media/) instead of in the bucket.
 */
import { readFile } from 'fs/promises'
import path from 'path'
import config from '@payload-config'
import { getPayload } from 'payload'

async function main() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({ collection: 'media', limit: 1000, sort: 'id' })
  console.log(`Migrating ${docs.length} media docs to Supabase Storage...`)

  let migrated = 0
  let skipped = 0

  for (const doc of docs) {
    const filename = doc.filename
    if (!filename) {
      console.log(`  - skip #${doc.id}: no filename`)
      skipped++
      continue
    }

    const localPath = path.join(process.cwd(), 'media', filename)
    let data: Buffer
    try {
      data = await readFile(localPath)
    } catch {
      console.log(`  - skip #${doc.id} (${filename}): not found locally`)
      skipped++
      continue
    }

    await payload.update({
      collection: 'media',
      id: doc.id,
      data: {},
      file: {
        data,
        mimetype: doc.mimeType ?? 'image/jpeg',
        name: filename,
        size: data.length,
      },
    })
    migrated++
    console.log(`  ✓ #${doc.id} ${filename}`)
  }

  console.log(`Done. Migrated ${migrated}, skipped ${skipped}.`)
}

await main().catch((err) => {
  console.error(err)
  process.exit(1)
})
