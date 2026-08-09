import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { safeFetch } from '@/lib/safeFetch'
import { CmsNotConnected } from '@/components/shared/CmsNotConnected'
import { RevealController } from '@/components/shared/RevealController.client'

import { Manifesto } from '@/components/about/Manifesto'
import { Story } from '@/components/about/Story'
import { Philosophy } from '@/components/about/Philosophy'
import { Founder } from '@/components/about/Founder'
import { Different } from '@/components/about/Different'
import { Overview } from '@/components/about/Overview'

export const metadata: Metadata = {
  title: 'About — Vana Ekantha',
  description: 'What Vana Ekantha stands for, the story behind the name, and the philosophy that shapes the estate.',
}

export default async function AboutPage() {
  const { data: about, error } = await safeFetch(async () => (await getPayloadClient()).findGlobal({ slug: 'about', depth: 1 }))

  if (!about) {
    return <CmsNotConnected what={`the About page${error ? ` (${error})` : ''}`} />
  }

  return (
    <>
      <RevealController />
      <Manifesto data={about.manifesto} />
      <Story data={about.story} />
      <Philosophy data={about.philosophy} />
      <Founder data={about.founder} />
      <Different data={about.different} />
      <Overview data={about.overview} />
    </>
  )
}
