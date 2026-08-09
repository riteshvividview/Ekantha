import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { safeFetch } from '@/lib/safeFetch'
import { CmsNotConnected } from '@/components/shared/CmsNotConnected'
import { FaqPage as FaqBody } from '@/components/faqs/FaqPage'

export const metadata: Metadata = {
  title: 'FAQs — Vana Ekantha',
  description: 'Answers on check-in & check-out, booking policies, farm dining, events, add-ons, and guest capacity at Vana Ekantha.',
}

export default async function FaqsPage() {
  const { data: faqs, error } = await safeFetch(async () => (await getPayloadClient()).findGlobal({ slug: 'faqs', depth: 1 }))

  if (!faqs) {
    return <CmsNotConnected what={`the FAQs page${error ? ` (${error})` : ''}`} />
  }

  return <FaqBody data={faqs} />
}
