import type { Stay } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'
import { safeFetch } from '@/lib/safeFetch'
import { CmsNotConnected } from '@/components/shared/CmsNotConnected'
import { RevealController } from '@/components/shared/RevealController.client'
import { FinalCtaBanner } from '@/components/shared/FinalCtaBanner'

import { Hero } from '@/components/home/Hero'
import { Ticker } from '@/components/home/Ticker'
import { Intro } from '@/components/home/Intro'
import { WhyUs } from '@/components/home/WhyUs'
import { ExperienceReel } from '@/components/home/ExperienceReel'
import { StaysCarousel } from '@/components/home/StaysCarousel'
import { Dine } from '@/components/home/Dine'
import { EventsPreview } from '@/components/home/EventsPreview'
import { Testimonials } from '@/components/home/Testimonials'
import { GalleryPreview } from '@/components/home/GalleryPreview'
import { LocationSection } from '@/components/home/LocationSection'

export default async function HomePage() {
  // depth: 2 so staysTeaser.featuredStays resolves to full Stay documents,
  // and each Stay document's own image relationships resolve too (Stay →
  // heroImage is one level, so Home → Stay → heroImage needs depth 2).
  // getPayloadClient() has to be called *inside* this callback (not once,
  // outside) so a connection failure is caught by safeFetch too.
  const { data: home, error } = await safeFetch(async () => (await getPayloadClient()).findGlobal({ slug: 'home', depth: 2 }))

  if (!home) {
    return <CmsNotConnected what={`the homepage${error ? ` (${error})` : ''}`} />
  }

  const featuredStays = (home.staysTeaser.featuredStays ?? []).filter(
    (s): s is Stay => typeof s === 'object' && s !== null,
  )

  return (
    <>
      <RevealController />
      <Hero data={home.hero} />
      <Ticker data={home.ticker} />
      <Intro data={home.intro} />
      <WhyUs data={home.whyUs} />
      <ExperienceReel data={home.experience} />
      <StaysCarousel heading={home.staysTeaser.heading} sub={home.staysTeaser.sub} stays={featuredStays} />
      <Dine data={home.dine} />
      <EventsPreview data={home.eventsPreview} />
      <Testimonials data={home.testimonials} />
      <GalleryPreview data={home.galleryPreview} />
      <LocationSection data={home.location} />
      <FinalCtaBanner
        eyebrow={home.finalCta.eyebrow}
        heading={renderFinalHeading(home.finalCta.heading)}
        whenLabel={home.finalCta.whenLabel}
        whenPlaceholder={home.finalCta.whenPlaceholder}
        whoLabel={home.finalCta.whoLabel}
        whoPlaceholder={home.finalCta.whoPlaceholder}
        howLongLabel={home.finalCta.howLongLabel}
        howLongPlaceholder={home.finalCta.howLongPlaceholder}
        submitLabel={home.finalCta.submitLabel}
        note={home.finalCta.note}
      />
    </>
  )
}

function renderFinalHeading(heading: string) {
  return heading.split('\n').map((line, i, arr) => (
    <span key={i}>
      {line}
      {i < arr.length - 1 && <br />}
    </span>
  ))
}
