import type { Stay } from '@/payload-types'
import { RevealController } from '@/components/shared/RevealController.client'
import { FinalCtaBanner } from '@/components/shared/FinalCtaBanner'

import { Hero } from '../Hero'
import { Description } from '../Description'
import { Highlights } from './Highlights'
import { Amenities } from './Amenities'
import { Gallery } from './Gallery'
import { IdealFor } from './IdealFor'

const STAY_ORDER = ['mango-house', 'stone-house', 'full-house']

export function StoneHouseDetailPage({ stay }: { stay: Stay }) {
  const badgeNumber = String(STAY_ORDER.indexOf(stay.slug) + 1).padStart(2, '0')

  return (
    <>
      <RevealController />
      <Hero stay={stay} badgeNumber={badgeNumber} />
      <Description data={stay.description} />
      <Highlights data={stay.highlightsSection} />
      <Amenities data={stay.amenitiesSection} />
      <Gallery items={stay.gallery} title={stay.title} />
      <IdealFor items={stay.idealFor} title={stay.title} />
      <FinalCtaBanner
        eyebrow="holding a date"
        heading={renderFinalHeading(stay.title)}
        whenLabel="when"
        whenPlaceholder="14 may → 17 may"
        whoLabel="who"
        whoPlaceholder="2 adults"
        howLongLabel="how long"
        howLongPlaceholder="3 nights"
        submitLabel={`hold ${stay.title.toLowerCase()} →`}
        note={stay.finalCtaNote}
      />
    </>
  )
}

/** Matches "tell us <em>when</em>,<br>and we'll hold Stone House." */
function renderFinalHeading(title: string) {
  return (
    <>
      tell us <em>when</em>,<br />
      and we&apos;ll hold {title}.
    </>
  )
}
