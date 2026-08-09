import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { safeFetch } from '@/lib/safeFetch'
import { CmsNotConnected } from '@/components/shared/CmsNotConnected'
import { RevealController } from '@/components/shared/RevealController.client'

import { Hero } from '@/components/events/Hero'
import { EventsWeHost } from '@/components/events/EventsWeHost'
import { VenueFeatures } from '@/components/events/VenueFeatures'
import { Gallery } from '@/components/events/Gallery'
import { Customise } from '@/components/events/Customise'
import { Enquiry } from '@/components/events/Enquiry'

export const metadata: Metadata = {
  title: 'Events & Celebrations — Vana Ekantha',
  description: 'Birthdays, anniversaries, corporate events, alumni meets, and pre-wedding functions — hosted across the Vana Ekantha estate.',
}

export default async function EventsPage() {
  const { data: events, error } = await safeFetch(async () => (await getPayloadClient()).findGlobal({ slug: 'events', depth: 1 }))

  if (!events) {
    return <CmsNotConnected what={`the Events page${error ? ` (${error})` : ''}`} />
  }

  return (
    <>
      <RevealController />
      <Hero data={events.hero} />
      <EventsWeHost data={events.eventsWeHost} />
      <VenueFeatures data={events.venueFeatures} />
      <Gallery data={events.gallery} />
      <Customise data={events.customise} />
      <Enquiry data={events.enquiry} />
    </>
  )
}
