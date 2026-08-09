import type { Metadata } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { safeFetch } from '@/lib/safeFetch'
import { CmsNotConnected } from '@/components/shared/CmsNotConnected'
import { RevealController } from '@/components/shared/RevealController.client'
import { FinalCtaBanner } from '@/components/shared/FinalCtaBanner'

import { Hero } from '@/components/stay/Hero'
import { StaysSection } from '@/components/stay/StaysSection'
import { Amenities } from '@/components/stay/Amenities'
import { WhyStay } from '@/components/stay/WhyStay'

const STAY_ORDER = ['mango-house', 'stone-house', 'full-house']

export const metadata: Metadata = {
  title: 'Stay — Vana Ekantha',
  description: 'Three ways to stay at Vana Ekantha — Mango House, Stone House, or the Full House.',
}

export default async function StayPage() {
  const { data, error } = await safeFetch(async () => {
    const payload = await getPayloadClient()
    const [page, staysResult] = await Promise.all([
      payload.findGlobal({ slug: 'stay-page', depth: 1 }),
      payload.find({ collection: 'stays', depth: 1, limit: 10 }),
    ])
    const stays = [...staysResult.docs].sort((a, b) => STAY_ORDER.indexOf(a.slug) - STAY_ORDER.indexOf(b.slug))
    return { page, stays }
  })

  if (!data) {
    return <CmsNotConnected what={`the Stay page${error ? ` (${error})` : ''}`} />
  }

  const { page, stays } = data

  return (
    <>
      <RevealController />
      <Hero data={page.hero} />
      <StaysSection data={page.staysSection} stays={stays} />
      <Amenities data={page.amenities} />
      <WhyStay data={page.whyStay} />
      <FinalCtaBanner
        eyebrow={page.reserve.eyebrow}
        heading={renderFinalHeading(page.reserve.heading)}
        whenLabel={page.reserve.whenLabel}
        whenPlaceholder={page.reserve.whenPlaceholder}
        whoLabel={page.reserve.whoLabel}
        whoPlaceholder={page.reserve.whoPlaceholder}
        howLongLabel={page.reserve.whichStayLabel}
        howLongPlaceholder={page.reserve.whichStayPlaceholder}
        submitLabel={page.reserve.submitLabel}
        note={page.reserve.note}
      />
    </>
  )
}

/** "tell us when,\nand we'll hold a stay." → line break on `\n`, italicizes
 *  "when" only, matching "tell us <em>when</em>,<br>and we'll hold a stay." */
function renderFinalHeading(heading: string) {
  const lines = heading.split('\n')
  return lines.map((line, i, arr) => (
    <span key={i}>
      {i === 0 ? renderFirstLine(line) : line}
      {i < arr.length - 1 && <br />}
    </span>
  ))
}

function renderFirstLine(line: string) {
  const commaIndex = line.indexOf(',')
  if (commaIndex === -1) return line
  const before = line.slice(0, commaIndex)
  const after = line.slice(commaIndex)
  const words = before.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
      {after}
    </>
  )
}
