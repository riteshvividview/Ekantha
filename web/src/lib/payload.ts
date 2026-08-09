import config from '@payload-config'
import { getPayload } from 'payload'

/**
 * Payload's Local API — used by every page to read collections/globals
 * directly in-process (no HTTP round trip to /api). This is the "edit in
 * the CMS → database updates → page updates" wiring: pages call these on
 * every request (Next.js Server Components), so a save in /admin is live
 * on next page load with no extra cache-invalidation step.
 */
export async function getPayloadClient() {
  return getPayload({ config })
}
