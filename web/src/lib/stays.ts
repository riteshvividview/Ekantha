import type { Stay } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'

export async function getStayBySlug(slug: Stay['slug']): Promise<Stay | undefined> {
  const payload = await getPayloadClient()
  const result = await payload.find({ collection: 'stays', where: { slug: { equals: slug } }, depth: 1, limit: 1 })
  return result.docs[0]
}
