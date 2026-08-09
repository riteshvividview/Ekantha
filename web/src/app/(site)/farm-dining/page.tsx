import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { safeFetch } from '@/lib/safeFetch'
import { CmsNotConnected } from '@/components/shared/CmsNotConnected'
import { RevealController } from '@/components/shared/RevealController.client'

import { Hero } from '@/components/farm-dining/Hero'
import { Unique } from '@/components/farm-dining/Unique'
import { Experience } from '@/components/farm-dining/Experience'
import { Gallery } from '@/components/farm-dining/Gallery'
import { Suitable } from '@/components/farm-dining/Suitable'
import { Faq } from '@/components/farm-dining/Faq'
import { Reserve } from '@/components/farm-dining/Reserve'

export const metadata: Metadata = {
  title: 'Bamboo Farm Dine — Vana Ekantha',
  description: 'Bamboo Farm Dine — dinner under bamboo, one long table, one nightly seating, fed by what the farm grew that week.',
}

export default async function FarmDiningPage() {
  const { data: farmDining, error } = await safeFetch(async () => (await getPayloadClient()).findGlobal({ slug: 'farm-dining', depth: 1 }))

  if (!farmDining) {
    return <CmsNotConnected what={`the Farm Dining page${error ? ` (${error})` : ''}`} />
  }

  return (
    <>
      <RevealController />
      <Hero data={farmDining.hero} />
      <Unique data={farmDining.unique} />
      <Experience data={farmDining.experience} />
      <Gallery data={farmDining.gallery} />
      <Suitable data={farmDining.suitable} />
      <Faq data={farmDining.faq} />
      <Reserve data={farmDining.reserve} />
    </>
  )
}
