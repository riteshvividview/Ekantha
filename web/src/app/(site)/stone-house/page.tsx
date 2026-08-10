import type { Metadata } from 'next'
import { safeFetch } from '@/lib/safeFetch'
import { getStayBySlug } from '@/lib/stays'
import { CmsNotConnected } from '@/components/shared/CmsNotConnected'
import { StoneHouseDetailPage } from '@/components/stay-detail/stone/StoneHouseDetailPage'

export const metadata: Metadata = {
  title: 'Stone House — Vana Ekantha',
  description: 'Stone House — the original stone-walled house, 2–4 adults, two bedrooms + fireplace, from ₹19,600/night.',
}

export default async function StoneHousePage() {
  const { data: stay, error } = await safeFetch(() => getStayBySlug('stone-house'))

  if (!stay) {
    return <CmsNotConnected what={`Stone House${error ? ` (${error})` : ''}`} />
  }

  return <StoneHouseDetailPage stay={stay} />
}
