import type { Stay } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'
import { safeFetch } from '@/lib/safeFetch'
import { CmsNotConnected } from '@/components/shared/CmsNotConnected'
import { RevealController } from '@/components/shared/RevealController.client'
import { FinalCtaBanner } from '@/components/shared/FinalCtaBanner'

import { Hero } from '@/components/home/Hero'
import { Story } from '@/components/home/Story'
import { Why } from '@/components/home/Why'
import { ExperienceReel } from '@/components/home/ExperienceReel'
import { ChooseEscape } from '@/components/home/ChooseEscape'
import { BambooDine } from '@/components/home/BambooDine'
import { Events } from '@/components/home/Events'
import { Stories } from '@/components/home/Stories'
import { Gallery } from '@/components/home/Gallery'
import { Reach } from '@/components/home/Reach'

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
      <Story />
      <Why />
      <ExperienceReel data={home.experience} />
      <ChooseEscape heading={home.staysTeaser.heading} sub={home.staysTeaser.sub} stays={featuredStays} />
      <BambooDine data={home.dine} />
      <Events />
      <Stories />
      <Gallery />
      <Reach />
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
