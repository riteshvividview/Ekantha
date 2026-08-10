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

export function FullHouseDetailPage({ stay }: { stay: Stay }) {
  const badgeNumber = String(STAY_ORDER.indexOf(stay.slug) + 1).padStart(2, '0')

  return (
    <>
      <RevealController />
      <Hero stay={stay} badgeNumber={badgeNumber} />
      <Description data={stay.description} />
      <Highlights data={stay.highlightsSection} />
      <Amenities data={stay.amenitiesSection} />
      <Gallery items={stay.gallery} />
      <IdealFor items={stay.idealFor} />
      <FinalCtaBanner
        eyebrow="holding a date"
        heading={renderFinalHeading()}
        whenLabel="when"
        whenPlaceholder="14 may → 18 may"
        whoLabel="who"
        whoPlaceholder="up to 16 adults"
        howLongLabel="how long"
        howLongPlaceholder="3 nights, minimum"
        submitLabel="hold the full house →"
        note={stay.finalCtaNote}
      />
    </>
  )
}

/** Matches "tell us <em>when</em>,<br>and we'll hold the Full House." */
function renderFinalHeading() {
  return (
    <>
      tell us <em>when</em>,<br />
      and we&apos;ll hold the Full House.
    </>
  )
}
