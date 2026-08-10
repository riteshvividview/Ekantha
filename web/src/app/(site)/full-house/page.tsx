import type { Metadata } from 'next'
import { safeFetch } from '@/lib/safeFetch'
import { getStayBySlug } from '@/lib/stays'
import { CmsNotConnected } from '@/components/shared/CmsNotConnected'
import { FullHouseDetailPage } from '@/components/stay-detail/full/FullHouseDetailPage'

export const metadata: Metadata = {
  title: 'Full House — Vana Ekantha',
  description: 'Full House — the entire estate, up to 16 adults, from ₹78,000/night.',
}

export default async function FullHousePage() {
  const { data: stay, error } = await safeFetch(() => getStayBySlug('full-house'))

  if (!stay) {
    return <CmsNotConnected what={`Full House${error ? ` (${error})` : ''}`} />
  }

  return <FullHouseDetailPage stay={stay} />
}
