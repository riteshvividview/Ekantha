import type { Metadata } from 'next'
import { safeFetch } from '@/lib/safeFetch'
import { getStayBySlug } from '@/lib/stays'
import { CmsNotConnected } from '@/components/shared/CmsNotConnected'
import { StayDetailPage } from '@/components/stay-detail/StayDetailPage'

export const metadata: Metadata = {
  title: 'Mango House — Vana Ekantha',
  description: 'Mango House — a private cottage for 2–3 under the old mango grove, from ₹18,400/night.',
}

export default async function MangoHousePage() {
  const { data: stay, error } = await safeFetch(() => getStayBySlug('mango-house'))

  if (!stay) {
    return <CmsNotConnected what={`Mango House${error ? ` (${error})` : ''}`} />
  }

  return <StayDetailPage stay={stay} />
}
