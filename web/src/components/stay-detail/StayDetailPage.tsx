import type { Stay } from '@/payload-types'
import { RevealController } from '@/components/shared/RevealController.client'
import { FinalCtaBanner } from '@/components/shared/FinalCtaBanner'

import { Hero } from './Hero'
import { Description } from './Description'
import { Highlights } from './Highlights'
import { Amenities } from './Amenities'
import { Gallery } from './Gallery'
import { IdealFor } from './IdealFor'

const STAY_ORDER = ['mango-house', 'stone-house', 'full-house']

/**
 * Shared layout for all three stay detail pages (/mango-house, /stone-house,
 * /full-house) — MangoHouse.html/StoneHouse.html/FullHouse.html are the same
 * page structure with different content, so this is built once and each
 * route is a thin wrapper that fetches its own Stay document by slug.
 */
export function StayDetailPage({ stay }: { stay: Stay }) {
  const badgeNumber = String(STAY_ORDER.indexOf(stay.slug) + 1).padStart(2, '0')

  return (
    <>
      <RevealController />
      <Hero stay={stay} badgeNumber={badgeNumber} showBg />
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

/** Matches "tell us <em>when</em>,<br>and we'll hold Mango House." */
function renderFinalHeading(title: string) {
  return (
    <>
      tell us <em>when</em>,<br />
      and we&apos;ll hold {title}.
    </>
  )
}
