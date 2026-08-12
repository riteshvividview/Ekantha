/**
 * Seeds the Home page + the three Stays documents with the real content
 * from Home.html (and enough of FullHouse/MangoHouse/StoneHouse.html for
 * the homepage carousel to be accurate — each Stay's full page content
 * gets filled in when that page is actually built).
 *
 * Run once you've filled in a real DATABASE_URI in web/.env:
 *   npx payload run src/seed.ts
 *
 * Safe to re-run — it looks for existing docs by slug/singleton and
 * updates them instead of creating duplicates.
 */
import config from '@payload-config'
import { getPayload } from 'payload'

const HOSTINGER = 'https://bisque-lobster-585068.hostingersite.com/wp-content/uploads/2026/07'

async function main() {
  const payload = await getPayload({ config })
  const mediaCache = new Map<string, number>()

  async function media(filename: string, alt: string): Promise<number> {
    return mediaFromUrl(`${HOSTINGER}/${filename}`, alt)
  }

  /** Same as `media()`, but for source images hosted on a domain other
   *  than the HOSTINGER uploads folder (pinimg, pexels, istockphoto,
   *  etc. — several FarmDining.html source images aren't on HOSTINGER). */
  async function mediaFromUrl(url: string, alt: string): Promise<number> {
    if (mediaCache.has(url)) return mediaCache.get(url)!

    const existing = await payload.find({ collection: 'media', where: { alt: { equals: alt } }, limit: 1 })
    if (existing.docs[0]) {
      mediaCache.set(url, existing.docs[0].id)
      return existing.docs[0].id
    }

    const filename = url.split('/').pop()?.split('?')[0] || 'image.jpg'
    payload.logger.info(`Downloading ${filename}...`)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`)
    const arrayBuffer = await res.arrayBuffer()
    const data = Buffer.from(arrayBuffer)

    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      file: { data, mimetype: res.headers.get('content-type') ?? 'image/jpeg', name: filename, size: data.length },
    })
    mediaCache.set(url, doc.id)
    return doc.id
  }

  payload.logger.info('Seeding Stays (minimal — full page content added when each page is built)...')

  const stayDocs = [
    {
      slug: 'mango-house' as const,
      title: 'Mango House',
      tagline: 'quiet · orchard-facing · a private retreat for two',
      heroBadgeLabel: 'Stay / Mango House',
      heroImageFile: 'large-house-with-large-front-porch-terrace-with-palm-trees-scaled.jpg',
      heroImageAlt: 'Mango House at Vana Ekantha',
      priceFrom: 18400,
      priceNote: 'includes breakfast, chai & farm dinner',
      capacity: '2–3 adults',
      minNights: '2 night minimum',
      intro:
        "Mango House sits at the edge of the orchard, close enough that the fruit dropping at first light is often the first sound of the day.",
      pullQuote:
        "I sit beneath the old mango grove. In season, breakfast might just be what fell that morning. The goats know me well — they pass through twice a day.",
      teaserQuote:
        "I sit beneath the old mango grove. Mornings arrive here slowly — you'll hear fruit drop before you hear anything else.",
      teaserFacts: 'queen bed · private verandah · no tv',
      bed: 'queen bed + daybed',
      character: 'lively, orchard-facing mornings',
      lists: [
        {
          heading: "what's inside",
          items: ['queen bed + narrow daybed', 'large window to the orchard', 'wooden rack for hanging things'],
        },
        {
          heading: "what's outside",
          items: ['mango & guava trees (fruit aug–nov)', 'small dairy yard, 60 paces away', 'the goats — named, will introduce themselves'],
        },
      ],
      overviewNote:
        'The liveliest of the three, in the kindest sense — birds, goats, the occasional rooster. Family-friendly, and never quite silent.',
    },
    {
      slug: 'stone-house' as const,
      title: 'Stone House',
      tagline: 'the original house — thick walls, unhurried light',
      heroBadgeLabel: 'Stay / Stone House',
      heroImageFile: 'relax-area-resort-scaled.jpg',
      heroImageAlt: 'Stone House at Vana Ekantha',
      priceFrom: 19600,
      priceNote: 'includes breakfast, chai & farm dinner',
      capacity: '2–4 adults',
      minNights: '2 night minimum',
      intro:
        'Stone House was the first structure built on this land — before the cottages, before the pond path, before the orchard was planted in rows.',
      pullQuote:
        'I am the original house on this land. My stone walls hold the cold in summer and the warmth in winter. There is a desk by the north window — one chair, on purpose.',
      teaserQuote:
        'I am the original house on this land — thick stone walls that hold the cold in summer, the warmth in winter.',
      teaserFacts: 'two bedrooms · fireplace · reading nook',
      bed: 'two bedrooms',
      character: 'quiet, north-facing, unhurried',
      lists: [
        {
          heading: "what's inside",
          items: ['two bedrooms, one with a writing desk', 'fireplace (november through february)', 'three books, rotated monthly'],
        },
        {
          heading: "what's outside",
          items: ['the old tamarind tree (shade from 11am)', 'a small bench at its root', 'a low stone wall to sit on'],
        },
      ],
      overviewNote: "The writer's house. If you come here to write, we will not ask what you're writing.",
    },
    {
      slug: 'full-house' as const,
      title: 'Full House',
      tagline: 'the entire estate — for families, reunions & celebrations',
      heroBadgeLabel: 'Stay / Full House',
      heroImageFile: 'rural-view-catalonia-spain-scaled.jpg',
      heroImageAlt: 'Full House at Vana Ekantha',
      priceFrom: 78000,
      priceNote: 'all meals included',
      capacity: 'up to 16 adults',
      minNights: '3 night minimum',
      intro:
        "Full House isn't a fourth cottage — it's the whole estate, taken exclusively. Mango House and Stone House, the main house, the pond, the orchard, the kitchen garden, the open lawns, all of it, for the length of your stay.",
      pullQuote:
        'Take all of me. Every cottage, every acre, the pond and the orchard and the kitchen garden besides. For families, reunions, and celebrations that need room to breathe.',
      teaserQuote:
        'Take the whole estate — every cottage, every acre. For families, reunions, and celebrations that need room to breathe.',
      teaserFacts: 'entire property · private events team · full kitchen access',
      bed: 'Mango House + Stone House, all rooms',
      character: 'private, exclusive-use',
      lists: [
        {
          heading: "what's included",
          items: ['full run of Mango House & Stone House', 'main house & kitchen garden access', 'private events team, on request'],
        },
        {
          heading: "what's outside",
          items: ['the pond, the orchard, the open lawns', 'the pergola walkway, the outdoor cinema', 'space for birthdays, retreats, celebrations'],
        },
      ],
      overviewNote: 'Minimum three nights for full-house bookings. Ask us about events & celebrations add-ons.',
    },
  ]

  const stayIds: Record<string, number> = {}

  for (const s of stayDocs) {
    const heroImage = await media(s.heroImageFile, s.heroImageAlt)
    const existing = await payload.find({ collection: 'stays', where: { slug: { equals: s.slug } }, limit: 1 })

    const data = {
      slug: s.slug,
      title: s.title,
      tagline: s.tagline,
      heroBadgeLabel: s.heroBadgeLabel,
      heroImage,
      priceFrom: s.priceFrom,
      priceNote: s.priceNote,
      capacity: s.capacity,
      minNights: s.minNights,
      description: { intro: s.intro, pullQuote: s.pullQuote },
      homeTeaser: { quote: s.teaserQuote, factsLine: s.teaserFacts },
      overviewBlock: {
        bed: s.bed,
        character: s.character,
        lists: s.lists.map((l) => ({ heading: l.heading, items: l.items.map((text) => ({ text })) })),
        note: s.overviewNote,
      },
    }

    if (existing.docs[0]) {
      await payload.update({ collection: 'stays', id: existing.docs[0].id, data })
      stayIds[s.slug] = existing.docs[0].id
    } else {
      const created = await payload.create({ collection: 'stays', data })
      stayIds[s.slug] = created.id
    }
    payload.logger.info(`  ✓ ${s.title}`)
  }

  payload.logger.info('Seeding Mango House detail page content...')
  const mhAccentImg = await mediaFromUrl('https://images.unsplash.com/photo-1732472581875-89ff83f18439?q=80&w=900&auto=format&fit=crop', 'A ripe mango hanging from the tree, dew-covered at first light')
  const mhHighlightsImg = await media('double-bed-apartments-cozy-hotel-scaled.jpg', 'Mango House, wooden cottage exterior tucked into the grove')
  const mhAm1Img = await mediaFromUrl('https://images.unsplash.com/photo-1523033904333-243d0283acae?q=80&w=800&auto=format&fit=crop', 'A rustic wooden tray of fresh fruit')
  const mhAm2Img = await mediaFromUrl('https://images.unsplash.com/photo-1643081262278-807976f7f2f7?q=80&w=800&auto=format&fit=crop', 'An outdoor rain shower in misty morning light')
  const mhAm3Img = await mediaFromUrl('https://images.unsplash.com/photo-1634746027343-985ad425b8b5?q=80&w=800&auto=format&fit=crop', 'A journal, coffee, and camera on a wooden table')
  const mhAm4Img = await mediaFromUrl('https://images.unsplash.com/photo-1596433904500-97b901c5d274?q=80&w=800&auto=format&fit=crop', 'Folded cotton and linen bedding')
  const mhGal1Img = await mediaFromUrl('https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?q=80&w=800&auto=format&fit=crop', 'The mango grove, first light')
  const mhGal2Img = await mediaFromUrl('https://images.unsplash.com/photo-1727706572437-4fcda0cbd66f?q=80&w=800&auto=format&fit=crop', 'The queen bed, cotton and linen, in the wooden cottage')
  const mhGal3Img = await mediaFromUrl('https://images.unsplash.com/photo-1593264787646-f07221d3b7de?q=80&w=800&auto=format&fit=crop', 'View through the cottage window onto the orchard at sunrise')
  const mhGal4Img = await mediaFromUrl('https://images.unsplash.com/photo-1560819400-434c188f63ef?q=80&w=800&auto=format&fit=crop', 'Two goats from the dairy yard')
  const mhGal5Img = await mediaFromUrl('https://images.unsplash.com/photo-1720706439286-a642d2cd0db2?q=80&w=800&auto=format&fit=crop', 'A verandah table set for tea, mid-morning')
  const mhIdeal1Img = await mediaFromUrl('https://images.unsplash.com/photo-1643719142162-4406375cbd02?q=80&w=400&auto=format&fit=crop', 'A couple sharing a quiet morning outdoors')
  const mhIdeal2Img = await mediaFromUrl('https://images.unsplash.com/photo-1730485192112-654ec197f9eb?q=80&w=400&auto=format&fit=crop', 'Children petting a goat in the farm field')
  const mhIdeal3Img = await mediaFromUrl('https://images.unsplash.com/photo-1508333409359-027beab53750?q=80&w=400&auto=format&fit=crop', 'A welcoming wooden cottage porch')
  const mhIdeal4Img = await mediaFromUrl('https://images.unsplash.com/photo-1499281851221-5bce936073b0?q=80&w=400&auto=format&fit=crop', 'A silhouette at sunset among tall grass')

  const mhExisting = await payload.find({ collection: 'stays', where: { slug: { equals: 'mango-house' } }, limit: 1 })
  if (mhExisting.docs[0]) {
    await payload.update({
      collection: 'stays',
      id: mhExisting.docs[0].id,
      data: {
        heroSub:
          'A private cottage for two, tucked beneath the old mango grove — orchard-facing, family-friendly, and never quite silent in the kindest way.',
        description: {
          eyebrow: 'the description',
          pullHeadline: 'Breakfast, some mornings,\nis just what fell.',
          accentImage: mhAccentImg,
          intro:
            'Mango House sits at the edge of the orchard, close enough that the fruit dropping at first light is often the first sound of the day. In season, breakfast might simply be what fell that morning — picked up, washed, and served without ceremony.',
          pullQuote:
            'I sit beneath the old mango grove. In season, breakfast might just be what fell that morning. The goats know me well — they pass through twice a day.',
          paragraphs: [
            {
              text: "This is the liveliest of the three stays, in the kindest sense of that word. A small dairy yard sits sixty paces away, and the goats pass through on their own schedule, twice a day, whether or not you're watching. Birds arrive early. Roosters, occasionally, arrive earlier than that.",
            },
            {
              text: "It's a private cottage — one queen bed and a narrow daybed, a large window that opens straight onto the orchard — built for two, comfortable for a small family. If you want deep, uninterrupted silence, this isn't quite that. If you want to feel like the farm is alive around you, it is exactly that.",
            },
          ],
        },
        highlightsSection: {
          image: mhHighlightsImg,
          items: [
            {
              icon: 'bed',
              badgeLabel: '2–3 Adults',
              badgeColor: 'green',
              title: 'Queen Bed + Daybed',
              body: 'One queen bed for two, plus a narrow daybed along the east wall — enough for a small family or a third guest.',
            },
            {
              icon: 'orchard',
              badgeLabel: 'Orchard-Facing',
              badgeColor: 'amber',
              title: 'A Window To The Orchard',
              body: 'A large window opens straight onto the mango and guava trees — the first thing you see, and hear, each morning.',
            },
            {
              icon: 'verandah',
              badgeLabel: 'Private Verandah',
              badgeColor: 'purple',
              title: 'Verandah & Outdoor Shower',
              body: 'A covered verandah for slow mornings, and a rain-fed outdoor shower for the rest of the day.',
            },
            {
              icon: 'animals',
              badgeLabel: '60 Paces',
              badgeColor: 'blue',
              title: 'Neighbours With Hooves',
              body: 'The dairy yard is sixty paces away. The goats are named, and they will introduce themselves — twice a day, on their own schedule.',
            },
          ],
        },
        amenitiesSection: {
          hint: 'swipe or scroll to see all four →',
          items: [
            {
              image: mhAm1Img,
              title: 'Breakfast & Evening Chai',
              body: 'Delivered to your door or served at the main house — every morning, and again at the bonfire.',
            },
            {
              image: mhAm2Img,
              title: 'Farm Ritual Access',
              body: 'Every ritual, every day — first-light honey on toast, the held hours, bonfire chai, the night reading. Join any, skip all.',
            },
            {
              image: mhAm3Img,
              title: 'A Journal & A Pencil',
              body: 'Yours to keep, whether you fill three pages or none — the farm library is also open during all waking hours.',
            },
            {
              image: mhAm4Img,
              title: 'Cotton + Linen, No TV',
              body: 'Cotton and linen bedding, a wooden rack for hanging things, and — deliberately — no television.',
            },
          ],
        },
        gallery: [
          { image: mhGal1Img, caption: 'the mango grove, first light', aspectRatio: '3/4' },
          { image: mhGal2Img, caption: 'the queen bed, cotton & linen', aspectRatio: '1/1' },
          { image: mhGal3Img, caption: 'the daybed, by the window', aspectRatio: '4/5' },
          { image: mhGal4Img, caption: 'the dairy yard, sixty paces off', aspectRatio: '1/1' },
          { image: mhGal5Img, caption: 'the verandah, mid-morning', aspectRatio: '4/3' },
          { image: mhAm1Img, caption: 'breakfast — whatever fell that morning', aspectRatio: '3/4' },
        ],
        idealFor: [
          {
            image: mhIdeal1Img,
            title: 'Couples Who Want Quiet Mornings',
            body: 'Two people, one verandah, and a window that does most of the entertaining for you.',
          },
          {
            image: mhIdeal2Img,
            title: 'Families With Young Kids',
            body: 'Goats, dairy animals, and fruit that falls off trees — the daybed makes room for a third guest.',
          },
          {
            image: mhIdeal3Img,
            title: 'First-Time Farmstay Guests',
            body: 'Lively enough to feel welcoming, private enough to still feel like a retreat — a gentle introduction to the farm.',
          },
          {
            image: mhIdeal4Img,
            title: 'A 2–3 Night Stay',
            body: 'Long enough for the mango season to reveal itself, short enough to leave wanting one more morning.',
          },
        ],
        finalCtaNote:
          'No countdown timers. No "only 1 left!" No urgency theatre.\nIf Mango House is free on your dates, it\'s yours. If it isn\'t, we\'ll suggest Stone House or call you back.',
      },
    })
    payload.logger.info('✓ Mango House detail page seeded.')
  }

  payload.logger.info('Seeding Stone House detail page content...')
  const shHlHeroImg = await mediaFromUrl('https://images.unsplash.com/photo-1543393470-b2c833b98dce?q=80&w=1400&auto=format&fit=crop', 'A working stone fireplace at Stone House')
  const shHlRow1Img = await mediaFromUrl('https://images.unsplash.com/photo-1585620089933-768743dfc8f1?q=80&w=500&auto=format&fit=crop', 'One of the two bedrooms at Stone House')
  const shHlRow2Img = await mediaFromUrl('https://images.unsplash.com/photo-1535546204504-586398ee6677?q=80&w=500&auto=format&fit=crop', "The writer's desk with a typewriter and lamp")
  const shHlRow3Img = await mediaFromUrl('https://images.unsplash.com/photo-1647842446246-d2be55aa97a8?q=80&w=500&auto=format&fit=crop', 'An old tree beside the low stone wall')
  const shAm1Img = await mediaFromUrl('https://images.unsplash.com/photo-1524084848619-1161d3c8501a?q=80&w=900&auto=format&fit=crop', 'Breakfast coffee served on a wooden tray')
  const shAm2Img = await mediaFromUrl('https://images.unsplash.com/photo-1604004235675-21276186c600?q=80&w=900&auto=format&fit=crop', 'An evening ritual tray with tea and a candle')
  const shAm3Img = await mediaFromUrl('https://images.unsplash.com/photo-1768913651135-273f8bc59d37?q=80&w=900&auto=format&fit=crop', 'Books lined up on a stone shelf')
  const shAm4Img = await mediaFromUrl('https://images.unsplash.com/photo-1728034261564-18930dcb2c8e?q=80&w=900&auto=format&fit=crop', 'Folded cotton and linen towels')
  const shGal1Img = await mediaFromUrl('https://images.unsplash.com/photo-1630579083524-e3ac854edb46?q=80&w=700&auto=format&fit=crop', 'The original stone facade and arched wooden door')
  const shGal2Img = await mediaFromUrl('https://images.unsplash.com/photo-1697462247864-338e7eba8c4c?q=80&w=700&auto=format&fit=crop', 'One of the two bedrooms')
  const shGal3Img = await mediaFromUrl('https://images.unsplash.com/photo-1570626742839-59acd9822944?q=80&w=700&auto=format&fit=crop', 'A typewriter at the writing desk by the north window')
  const shGal4Img = await mediaFromUrl('https://images.unsplash.com/photo-1696814543693-31fcf942ccb7?q=80&w=700&auto=format&fit=crop', 'A stone fireplace lit in the sitting room')
  const shGal5Img = await mediaFromUrl('https://images.unsplash.com/photo-1723571644513-f3c2689a2232?q=80&w=700&auto=format&fit=crop', 'An old tree shading a stone wall')
  const shGal6Img = await mediaFromUrl('https://images.unsplash.com/photo-1656483461011-a20df474deae?q=80&w=700&auto=format&fit=crop', 'A low rustic stone wall with a wooden gate')
  const shIdeal1Img = await mediaFromUrl('https://images.unsplash.com/photo-1764451616600-0e98ea230527?q=80&w=700&auto=format&fit=crop', 'A solitary figure writing at a desk overlooking the water')
  const shIdeal2Img = await mediaFromUrl('https://images.unsplash.com/photo-1758274252296-a63b1d7d4bb8?q=80&w=700&auto=format&fit=crop', 'Two old friends talking at an outdoor table')
  const shIdeal3Img = await mediaFromUrl('https://images.unsplash.com/photo-1521022969448-49639904ed7b?q=80&w=700&auto=format&fit=crop', 'Two guests warming by the fireplace')
  const shIdeal4Img = await mediaFromUrl('https://images.unsplash.com/photo-1664524169977-acc46ea169a0?q=80&w=700&auto=format&fit=crop', 'A wicker porch swing, unhurried')

  const shExisting = await payload.find({ collection: 'stays', where: { slug: { equals: 'stone-house' } }, limit: 1 })
  if (shExisting.docs[0]) {
    await payload.update({
      collection: 'stays',
      id: shExisting.docs[0].id,
      data: {
        heroSub: 'The original house on this land — thick stone walls, a fireplace for winter, and a north window that keeps the same steady light all day.',
        description: {
          eyebrow: 'the description',
          pullHeadline: 'My walls remember\nevery winter.',
          intro:
            'Stone House was the first structure built on this land — before the cottages, before the pond path, before the orchard was planted in rows. Its walls are thick, cut stone, and they do what old walls do well: hold the cold in through summer, hold the warmth in through winter.',
          pullQuote:
            'I am the original house on this land. My stone walls hold the cold in summer and the warmth in winter. There is a desk by the north window — one chair, on purpose.',
          paragraphs: [
            {
              text: "The second bedroom faces north, which means the light stays even and unchanging for most of the day — the reason we've always called it the writer's room. A wide wooden desk sits under that window, scarred with years of use, with one chair. If you come here to write, we will not ask what you're writing.",
            },
            {
              text: 'A fireplace is lit from November through February. Outside, an old tamarind tree throws shade from around 11am, and a low stone wall — the same stone as the house — gives you somewhere to sit and do nothing in particular. This is the quietest of the three stays, built for people who came here to slow down on purpose.',
            },
          ],
        },
        highlightsSection: {
          items: [
            {
              image: shHlHeroImg,
              badgeLabel: 'Nov – Feb',
              title: 'A Working Fireplace',
              body: 'Lit through the winter months in the main sitting room — wood is provided, no request required.',
            },
            {
              image: shHlRow1Img,
              badgeLabel: '2–4 Adults',
              title: 'Two Bedrooms',
              body: 'One faces south, one faces north — enough separation for two couples, or a small family sharing the house.',
            },
            {
              image: shHlRow2Img,
              badgeLabel: 'North-Facing',
              title: "The Writer's Desk",
              body: 'A wide wooden desk beneath the north window, where the light stays steady from morning to evening.',
            },
            {
              image: shHlRow3Img,
              badgeLabel: 'Old & Shaded',
              title: 'The Tamarind & The Stone Wall',
              body: 'An old tamarind tree shades the house from around 11am, with a low stone wall built for sitting.',
            },
          ],
        },
        amenitiesSection: {
          hint: 'swipe or scroll to see more →',
          items: [
            {
              image: shAm1Img,
              title: 'Breakfast & Evening Chai',
              body: 'Delivered to your door or served at the main house — every morning, and again at the bonfire.',
            },
            {
              image: shAm2Img,
              title: 'Farm Ritual Access',
              body: 'Every ritual, every day — first-light honey on toast, the held hours, bonfire chai, the night reading. Join any, skip all.',
            },
            {
              image: shAm3Img,
              title: 'Three Books, Rotated Monthly',
              body: 'A small shelf inside the house, refreshed monthly — plus full access to the farm library in the main house.',
            },
            {
              image: shAm4Img,
              title: 'Cotton + Linen, No TV',
              body: 'Cotton and linen bedding in both rooms, and — deliberately — no television, no wifi in the bedrooms.',
            },
          ],
        },
        gallery: [
          { image: shGal1Img, caption: 'the stone facade, original to the land' },
          { image: shGal2Img, caption: 'the two bedrooms, south & north' },
          { image: shGal3Img, caption: 'the writing desk, north window' },
          { image: shGal4Img, caption: 'the fireplace, lit through winter' },
          { image: shGal5Img, caption: 'the old tamarind, shade from 11am' },
          { image: shGal6Img, caption: 'the low stone wall, built for sitting' },
        ],
        idealFor: [
          {
            image: shIdeal1Img,
            title: 'Writers & Solo Retreats',
            body: "One chair at the desk, on purpose. North light that doesn't change its mind through the day.",
          },
          {
            image: shIdeal2Img,
            title: 'Two Couples, Or Old Friends',
            body: 'Two bedrooms mean two households can share the house without sharing a room.',
          },
          {
            image: shIdeal3Img,
            title: 'Winter Guests Wanting A Fire',
            body: 'November through February, this is the only stay with a working fireplace of its own.',
          },
          {
            image: shIdeal4Img,
            title: 'Guests Wanting Unhurried Days',
            body: 'The quietest of the three stays — built for people slowing down on purpose, not by accident.',
          },
        ],
        finalCtaNote:
          'No countdown timers. No "only 1 left!" No urgency theatre.\nIf Stone House is free on your dates, it\'s yours. If it isn\'t, we\'ll suggest Mango House or call you back.',
      },
    })
    payload.logger.info('✓ Stone House detail page seeded.')
  }

  payload.logger.info('Seeding Full House detail page content...')
  const fhHl1Img = await media('large-house-with-large-front-porch-terrace-with-palm-trees-scaled.jpg', 'Mango House at Vana Ekantha')
  const fhHl2Img = await media('rural-view-catalonia-spain-scaled.jpg', 'The full Vana Ekantha estate')
  const fhHl3Img = await media('tract-cherkassy-region-ukraine-scaled.jpg', 'The kitchen garden at Vana Ekantha')
  const fhHl4Img = await media('how-is-rich-people-have-supper-prepared-desk-waiting-food-visitors-evening-time-scaled.jpg', 'A private dinner set for a Vana Ekantha event')
  const fhAm1Img = await media('family-all-together-camping-garden-father-child-grill-food-divergence-scaled.jpg', 'Guests sharing a meal together at Vana Ekantha')
  const fhAm2Img = await media('swimming-pool-blue-water-tropical-garden-with-sea-view-background-scaled.jpg', 'The pool at Vana Ekantha')
  const fhAm3Img = await media('contemporary-house-interior-design-scaled.jpg', 'A quiet evening ritual at Vana Ekantha')
  const fhAm4Img = await media('aerial-view-rolling-green-vineyards-countryside-village-italy-scaled.jpg', 'The open lawns at Vana Ekantha')
  const fhGalHeroImg = await media('high-quality-digital-image-wallpaper-scaled.jpg', 'The Vana Ekantha estate, both houses, from above')
  const fhGal1Img = await media('home-architecture-design-ranch-style-with-front-porch-scaled.jpg', 'Mango House, from the lawn')
  const fhGal2Img = await media('relax-area-resort-scaled.jpg', 'Stone House, from the wall')
  const fhGal3Img = await media('sunset-scene-countryside-scaled.jpg', 'The pond at Vana Ekantha, at dusk')
  const fhGal4Img = await media('golf-course-zlati-gric-slovenia-with-vineyards-trees-sunny-day-scaled.jpg', 'The open lawns at Vana Ekantha')
  const fhGal5Img = await media('park-with-pond-bushes-scaled.jpg', 'The pergola walkway at Vana Ekantha')
  const fhIdeal1Img = await media('group-young-indian-asian-people-is-having-lunch-breakfast-together-outdoor-settings-scaled.jpg', 'A family reunion at Vana Ekantha')
  const fhIdeal2Img = await media('beautiful-jungle-party-decorations-scaled.jpg', 'A milestone celebration at Vana Ekantha')
  const fhIdeal3Img = await media('jeju-island-korea-october-12-osulloc-tea-museum-is-f-scaled.jpg', 'A corporate retreat at Vana Ekantha')
  const fhIdeal4Img = await media('photorealistic-wooden-house-interior-with-timber-decor-furnishings-scaled.jpg', 'A multi-generational stay at Vana Ekantha')

  const fhExisting = await payload.find({ collection: 'stays', where: { slug: { equals: 'full-house' } }, limit: 1 })
  if (fhExisting.docs[0]) {
    await payload.update({
      collection: 'stays',
      id: fhExisting.docs[0].id,
      data: {
        heroSub: 'Every cottage, every acre — the pond, the orchard, the kitchen garden besides. For families, reunions, and celebrations that need room to breathe.',
        description: {
          eyebrow: 'the description',
          pullHeadline: 'Take all of me.\nEvery acre.',
          intro:
            "Full House isn't a fourth cottage — it's the whole estate, taken exclusively. Mango House and Stone House, the main house, the pond, the orchard, the kitchen garden, the open lawns, all of it, for the length of your stay. No other guests. No sharing the pergola walkway with strangers.",
          pullQuote:
            'Take all of me. Every cottage, every acre, the pond and the orchard and the kitchen garden besides. For families, reunions, and celebrations that need room to breathe.',
          paragraphs: [
            {
              text: "This is the booking for the occasions that don't fit into a single cottage — a family reunion spanning three generations, a milestone birthday, a wedding weekend, a corporate offsite that wants lawns instead of a conference room. Up to sixteen adults can be housed across the two standalone houses, with the main house available for shared meals and gathering.",
            },
            {
              text: 'A private events team is available on request, for anything from a simple bonfire dinner to a full celebration under the outdoor cinema screen. The minimum stay for a full-house booking is three nights — long enough for a gathering to find its own rhythm, and for everyone to get at least one quiet morning to themselves.',
            },
          ],
        },
        highlightsSection: {
          items: [
            {
              image: fhHl1Img,
              icon: 'group',
              badgeLabel: 'Up To 16 Adults',
              badgeColor: 'green',
              title: 'Mango House + Stone House',
              body: 'Both standalone houses, combined — enough beds and bedrooms for up to sixteen adults across the property.',
            },
            {
              image: fhHl2Img,
              icon: 'checkmark',
              badgeLabel: 'Exclusive Use',
              badgeColor: 'amber',
              title: 'The Entire Estate, To Yourselves',
              body: 'No other guests on the property during your stay — every path, every acre, is yours alone.',
            },
            {
              image: fhHl3Img,
              icon: 'house',
              badgeLabel: 'Shared Spaces',
              badgeColor: 'purple',
              title: 'Main House & Kitchen Garden',
              body: 'Full access to the main house for shared meals, and the kitchen garden for picking your own coriander.',
            },
            {
              image: fhHl4Img,
              icon: 'chef',
              badgeLabel: 'On Request',
              badgeColor: 'blue',
              title: 'A Private Events Team',
              body: 'Available for bonfire dinners, celebrations, and everything in between — arranged ahead of your arrival.',
            },
          ],
        },
        amenitiesSection: {
          items: [
            {
              image: fhAm1Img,
              title: 'All Meals Included',
              body: 'Breakfast, evening chai, and farm dinners for every guest, every day of the stay — no per-person add-ons.',
            },
            {
              image: fhAm2Img,
              title: 'The Pool & Outdoor Cinema',
              body: "Full run of the estate's amenities — the pool, the outdoor projector, the barbecue grill, indoor and outdoor games.",
            },
            {
              image: fhAm3Img,
              title: 'Every Farm Ritual, For Everyone',
              body: 'First-light honey on toast, the held hours, bonfire chai, the night reading — open to your whole group.',
            },
            {
              image: fhAm4Img,
              title: 'The Pergola Walkway & Lawns',
              body: 'Wide open lawns and a vine-covered walkway connecting both houses — space enough for any size of gathering.',
            },
          ],
        },
        gallery: [
          { image: fhGalHeroImg, caption: 'the estate, both houses' },
          { image: fhGal1Img, caption: 'mango house, from the lawn' },
          { image: fhGal2Img, caption: 'stone house, from the wall' },
          { image: fhGal3Img, caption: 'the pond, at dusk' },
          { image: fhGal4Img, caption: 'the open lawns' },
          { image: fhGal5Img, caption: 'the pergola walkway' },
        ],
        idealFor: [
          {
            image: fhIdeal1Img,
            title: 'Family Reunions',
            body: 'Three generations under one roof-and-grounds, with enough space that no one has to share a wall.',
          },
          {
            image: fhIdeal2Img,
            title: 'Milestone Celebrations',
            body: 'Birthdays, anniversaries, and pre-wedding gatherings — the private events team can help shape the evening.',
          },
          {
            image: fhIdeal3Img,
            title: 'Corporate Retreats',
            body: 'Offsites that trade the conference room for open lawns — teams tend to think better outdoors.',
          },
          {
            image: fhIdeal4Img,
            title: 'Multi-Generational Groups',
            body: 'Two separate houses mean privacy for couples and room for kids to run, without anyone leaving the property.',
          },
        ],
        finalCtaNote:
          'No countdown timers. No "only 1 left!" No urgency theatre.\nIf the estate is free on your dates, it\'s yours. If it isn\'t, we\'ll keep your name and call you back.',
      },
    })
    payload.logger.info('✓ Full House detail page seeded.')
  }

  payload.logger.info('Seeding Home global...')

  const heroBg = await media('sunset-scene-countryside-scaled.jpg', 'Sunset over the Vana Ekantha estate')
  const poolImg = await media('swimming-pool-blue-water-tropical-garden-with-sea-view-background-scaled.jpg', 'The spring-fed pool at Vana Ekantha')
  const cinemaImg = await media('outdoor-movie-is-hit-with-movie-scaled.jpg', 'Outdoor cinema screening at Vana Ekantha')
  const bbqImg = await media('family-all-together-camping-garden-father-child-grill-food-divergence-scaled.jpg', 'Barbecue evening at Vana Ekantha')
  const gamesImg = await media('pool-table-with-pool-table-bar-with-two-stools-large-picture-wall-scaled.jpg', 'Indoor games room at Vana Ekantha')
  const lawnsImg = await media('golf-course-zlati-gric-slovenia-with-vineyards-trees-sunny-day-scaled.jpg', 'Open lawns at Vana Ekantha')
  const pergolaImg = await media('park-with-pond-bushes-scaled.jpg', 'Pergola walkway at Vana Ekantha')
  const dineImg = await media('how-is-rich-people-have-supper-prepared-desk-waiting-food-visitors-evening-time-scaled.jpg', 'Dinner table set under the bamboo canopy')
  const birthdayImg = await media('beautiful-jungle-party-decorations-scaled.jpg', 'Birthday celebration at Vana Ekantha')
  const reunionImg = await media('group-young-indian-asian-people-is-having-lunch-breakfast-together-outdoor-settings-scaled.jpg', 'Friends reunion at Vana Ekantha')
  const corporateImg = await media('jeju-island-korea-october-12-osulloc-tea-museum-is-f-scaled.jpg', 'Corporate retreat at Vana Ekantha')
  const preweddingImg = await media('man-woman-are-sitting-couch-woman-is-wearing-yellow-dress-scaled.jpg', 'Pre-wedding celebration at Vana Ekantha')
  const galleryCottageImg = await media('home-architecture-design-ranch-style-with-front-porch-scaled.jpg', 'A cottage at Vana Ekantha')
  const galleryAerialImg = await media('aerial-view-rolling-green-vineyards-countryside-village-italy-scaled.jpg', 'Aerial view of the Vana Ekantha estate')
  const galleryInteriorImg = await media('contemporary-house-interior-design-scaled.jpg', 'Interior of a Vana Ekantha stay')
  const galleryTimberImg = await media('photorealistic-wooden-house-interior-with-timber-decor-furnishings-scaled.jpg', 'Timber interior at Vana Ekantha')
  const galleryFarmlandImg = await media('tract-cherkassy-region-ukraine-scaled.jpg', 'Open farmland at Vana Ekantha')
  const gallerySunsetImg = await media('sunset-scene-countryside-scaled.jpg', 'Sunset over the Vana Ekantha estate')
  const mapImg = await media('high-quality-digital-image-wallpaper-scaled.jpg', 'The Vana Ekantha estate from above')

  await payload.updateGlobal({
    slug: 'home',
    data: {
      hero: {
        badgeLabel: 'A Forest Farmstay Near Hyderabad',
        badgeMonogram: 'VE',
        headline: 'A Farmstay For Intentional Disconnection',
        sub: 'Eleven acres of the Deccan, two hours from the city — where you come to disconnect from the world and reconnect with yourself.',
        backgroundImage: heroBg,
        ratingText: 'Loved by returning guests',
        primaryCtaLabel: 'Hold a Date →',
        primaryCtaHref: '/hold-a-date',
        secondaryCtaLabel: 'Chat on WhatsApp',
        secondaryCtaHref: '#',
      },
      ticker: {
        weatherText: '26°C, jasmine on the wind',
        ripeningText: 'the first amrood of the season',
      },
      intro: {
        eyebrow: 'an invocation',
        pullQuote: 'Vana Ekantha is not a destination.\nIt is a return.',
        paragraphBeforeContrasts:
          'In a world that celebrates speed, noise, and constant connection, Vana Ekantha invites you to slow down — deeply, intentionally. Here, you are not entertained. You are undisturbed.',
        contrasts: [
          { text: 'privacy without isolation' },
          { text: 'silence without emptiness' },
          { text: 'rest without guilt' },
        ],
        paragraphAfterContrasts:
          'Cradled within eleven acres of the Deccan, this is where you come to disconnect from the world and reconnect with yourself.',
        closingNote: 'not a resort. not a hotel.\na place that was already here, waiting.',
      },
      whyUs: {
        heading: 'why Vana Ekantha.',
        sub: 'Four reasons guests keep coming back — none of them printed on a brochure.',
        items: [
          {
            badgeLabel: 'Untouched Land',
            title: 'Nature',
            body: 'Living within nature, not just visiting it. The land was here before us — we built around what it already held.',
          },
          {
            badgeLabel: 'Just For You',
            title: 'Privacy',
            body: 'Not crowded tourism. A private experience — you may not hear your neighbours. You may not see them at all.',
          },
          {
            badgeLabel: 'Thoughtfully Planned',
            title: 'Curated Experiences',
            body: 'No itineraries — only invitations. Every ritual, meal and moment is considered long before you arrive.',
          },
          {
            badgeLabel: '2.5 Hrs Away',
            title: 'Close to Hyderabad',
            body: 'Just over two hours from the city — far enough to disconnect, close enough to return to easily.',
          },
        ],
      },
      experience: {
        heading: 'experience the estate.',
        sub: 'Small, deliberate ways to spend a day here — none of them mandatory, all of them yours to use.',
        items: [
          { image: poolImg, title: 'Pool', description: 'A quiet, spring-fed pool framed by the orchard — best at first light or last.' },
          { image: cinemaImg, title: 'Outdoor Cinema', description: 'Films under open sky once the cicadas start — bring a blanket, borrow ours.' },
          { image: bbqImg, title: 'Barbecue Evenings', description: 'Slow fire, farm produce, started when the dusk smells right.' },
          { image: gamesImg, title: 'Indoor Games', description: 'Board games and quiet company for the hours between rituals.' },
          { image: lawnsImg, title: 'Open Lawns', description: 'Wide, unhurried grass — for stretching, reading, or doing nothing well.' },
          { image: pergolaImg, title: 'Pergola Walkway', description: 'A vine-covered path linking the cottages — shaded even at noon.' },
        ],
      },
      staysTeaser: {
        heading: 'choose your escape.',
        sub: 'Three ways to stay — from a private cottage for two, to the entire estate for everyone you love.',
        featuredStays: [stayIds['mango-house'], stayIds['stone-house'], stayIds['full-house']],
      },
      dine: {
        eyebrow: 'bamboo farm dine',
        heading: 'dinner, under bamboo.',
        body: "A long table set between bamboo stalks, lit by lamps, fed by what the farm grew that week. No menus printed in advance — the kitchen decides the morning of, based on what's ready to be picked.",
        ctaLabel: 'Explore Farm Dining →',
        ctaHref: '/farm-dining',
        image: dineImg,
      },
      eventsPreview: {
        heading: 'events & celebrations.',
        sub: 'The estate opens itself to gatherings that deserve more than a banquet hall.',
        items: [
          { image: birthdayImg, badgeLabel: 'Small & Sweet', title: 'Birthdays', description: 'Candles under the gulmohar, cake at dusk, no crowd bigger than it needs to be.' },
          { image: reunionImg, badgeLabel: 'Old Friends', title: 'Reunions', description: 'Old friends, long tables, a weekend with nowhere else to be.' },
          { image: corporateImg, badgeLabel: 'Offsite Ready', title: 'Corporate Retreats', description: 'Offsites that trade conference rooms for open lawns — teams think better outdoors.' },
          { image: preweddingImg, badgeLabel: 'Every Ceremony', title: 'Pre-Wedding Celebrations', description: 'Mehendi, sangeet, or a quiet vow renewal — the land holds every kind of ceremony well.' },
        ],
      },
      testimonials: {
        heading: 'what guests leave behind.',
        sub: 'Notes people have left us after their stay — unedited, in their own words.',
        items: [
          { quote: 'We arrived tired and left recalibrated. The silence between 2 and 4pm changed how I think about rest.', name: 'Ananya R. — Hyderabad', rating: 5 },
          { quote: 'No itinerary, no pressure — just the estate, the food, and a bonfire every evening. Exactly what we needed.', name: 'Karthik & Meera — Bengaluru', rating: 5 },
          { quote: 'We booked the Full House for a reunion. Fourteen of us, one estate, and not a single dull afternoon.', name: 'The Rao Family — Chennai', rating: 5 },
        ],
      },
      galleryPreview: {
        heading: 'a glimpse of the estate.',
        sub: 'A short preview — the full gallery holds every season, cottage, and ritual.',
        images: [
          { image: galleryCottageImg },
          { image: galleryAerialImg },
          { image: galleryInteriorImg },
          { image: galleryTimberImg },
          { image: galleryFarmlandImg },
          { image: gallerySunsetImg },
        ],
        ctaLabel: 'View Full Gallery →',
        ctaHref: '#',
      },
      location: {
        eyebrow: 'location',
        heading: 'easy to reach.\nhard to leave.',
        facts: [
          { label: 'Distance from Hyderabad', value: '~ 2.5 hours by road' },
          { label: 'Region', value: 'The Deccan, Telangana' },
          { label: 'Property size', value: '11 acres' },
          { label: 'Nearest landmark', value: 'shared on booking confirmation' },
        ],
        ctaLabel: 'Get Directions →',
        ctaHref: '#',
        mapImage: mapImg,
      },
      finalCta: {
        eyebrow: 'holding a date',
        heading: "tell us when,\nand we'll hold a stay.",
        whenLabel: 'when',
        whenPlaceholder: '14 may → 17 may',
        whoLabel: 'who',
        whoPlaceholder: '2 adults',
        howLongLabel: 'how long',
        howLongPlaceholder: '3 nights',
        submitLabel: 'hold a date →',
        note: 'No countdown timers. No "only 1 left!" No urgency theatre.\nIf a stay is free, it\'s yours. If it isn\'t, we\'ll keep your name and call you back.',
      },
    },
  })

  payload.logger.info('✓ Home seeded.')

  payload.logger.info('Seeding Navigation...')
  const navIcon = await media('icon.svg', 'Vana Ekantha icon').catch(() => undefined)
  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      logo: { icon: navIcon, wordmark: 'Vana Ekantha' },
      primaryLinks: [
        { label: 'Home', href: '/' },
        {
          label: 'Stay',
          href: '/stay',
          submenu: [
            { label: 'Mango House', href: '/mango-house' },
            { label: 'Stone House', href: '/stone-house' },
            { label: 'Full House', href: '/full-house' },
            { label: 'View All Stays', href: '/stay' },
          ],
        },
        { label: 'Farm Dining', href: '/farm-dining' },
        { label: 'Events', href: '/events' },
        { label: 'About', href: '/about' },
        { label: 'FAQs', href: '/faqs' },
        { label: 'Contact', href: '/contact' },
      ],
      cta: { label: 'Hold a Date', href: '/hold-a-date' },
    },
  })
  payload.logger.info('✓ Navigation seeded.')

  payload.logger.info('Seeding Footer (standardized, richer version — see Footer.html)...')
  await payload.updateGlobal({
    slug: 'footer',
    data: {
      ctaBanner: {
        heading: 'Book Your Escape.',
        body: "Tell us when, and we'll hold a stay for you.",
        buttonLabel: 'Hold a Date',
        buttonHref: '/hold-a-date',
      },
      brand: {
        tagline: 'A farmstay for intentional disconnection.',
        note: 'The Deccan, India · est. 2024',
      },
      quickLinks: [
        { label: 'Home', href: '/' },
        { label: 'Stay', href: '/stay' },
        { label: 'Farm Dining', href: '/farm-dining' },
        { label: 'Events', href: '/events' },
        { label: 'About', href: '/about' },
        { label: 'FAQs', href: '/faqs' },
        { label: 'Contact', href: '/contact' },
      ],
      contactInfo: [
        { label: 'Phone', value: '+91 98480 12345', isLink: false },
        { label: 'Email', value: 'hello@vanaekantha.com', isLink: false },
        { label: 'Location', value: 'The Deccan, Telangana', isLink: false },
      ],
      socialLinks: [
        { label: 'Instagram', href: '#', platform: 'instagram' },
        { label: 'Facebook', href: '#', platform: 'facebook' },
        { label: 'WhatsApp', href: '#', platform: 'whatsapp' },
        { label: 'Newsletter', href: '#', platform: 'newsletter' },
      ],
      legalLinks: [
        { label: 'Terms', href: '#' },
        { label: 'Privacy', href: '#' },
        { label: 'Careers In Stillness', href: '#' },
      ],
      copyrightText: '© 2024–2026 Vana Ekantha. All rights reserved.',
    },
  })
  payload.logger.info('✓ Footer seeded.')

  payload.logger.info('Seeding About global...')
  const overviewImg = await media(
    'beautiful-shot-few-trees-small-house-valley-cloudy-sky-scaled.jpg',
    'The Vana Ekantha estate, eleven acres of the Deccan',
  )
  await payload.updateGlobal({
    slug: 'about',
    data: {
      manifesto: {
        eyebrow: 'what we stand for',
        headline: 'You are not entertained.\nYou are undisturbed.',
        sub: 'Vana Ekantha exists on the belief that rest is not a product to be packaged — it is a condition you arrive at when nothing is asking anything of you. Everything about the estate, from its silence to its lack of a schedule, is built around that one idea.',
        primaryCtaLabel: 'See The Stays →',
        primaryCtaHref: '/stay',
        secondaryCtaLabel: 'Read The Story',
        secondaryCtaHref: '#name',
      },
      story: {
        wordGlosses: [
          { word: 'वन एकांत', translation: 'vana · forest' },
          { word: 'Ekantha', translation: 'solitude, undisturbed' },
        ],
        paragraphs: [
          {
            text: '<strong>Vana</strong> means forest. <strong>Ekantha</strong> means solitude — not loneliness, but a state of being wholly with yourself, undisturbed. Together, the name translates simply to "forest solitude," which is less a description of the land than a description of what we hoped it would do to the people who stayed on it.',
          },
          {
            text: "The name wasn't chosen before the land — it was chosen after. The eleven acres existed first, quiet and mostly untouched, for years before anyone thought to build here. When we finally walked the property with the intention of making it a farmstay, the word that kept surfacing in conversation wasn't \"resort\" or \"retreat.\" It was ekantha — that particular, hard-to-translate quality of being alone without being lonely.",
          },
          {
            text: "We didn't want a name that promised an experience. We wanted one that simply named what the land already was, and let the estate grow to meet it.",
          },
        ],
      },
      philosophy: [
        {
          number: '01 / philosophy',
          word: 'Nature',
          body: 'We did not landscape this property — we cleared just enough to live in it. The pond, the orchard, the old tamarind, the grove of bamboo: all of it was here before us. Every structure was placed where the land already had a clearing, so that <em>living within nature</em> never had to compete with what we built.',
        },
        {
          number: '02 / philosophy',
          word: 'Privacy',
          body: 'None of the cottages face each other. This was deliberate, and it cost us more time to build than it would have to place them in a neat, efficient row. Privacy here isn\'t a locked door — it\'s the simple, structural fact that <em>you may not see or hear another guest</em> for the length of your stay, unless you choose to.',
        },
        {
          number: '03 / philosophy',
          word: 'Stillness',
          body: 'Every afternoon, between 14:00 and 16:00, the farm goes quiet on purpose — no staff, no kitchen, no vehicles. We built this rule into the estate before we built most of the cottages, because we believed <em>stillness has to be protected</em>, or it never actually arrives.',
        },
      ],
      founder: {
        eyebrow: 'why we began',
        quote: '"We didn\'t set out to build a farmstay. We set out to stop being tired all the time — and this was what worked."',
        paragraphs: [
          {
            text: "Vana Ekantha started as a weekend habit before it became a business. A small group of us kept returning to this same eleven acres outside Hyderabad — first to escape a particularly loud year, then because we noticed something: the quality of rest here wasn't like the rest we got anywhere else. It wasn't the absence of work. It was the absence of anything asking for our attention at all.",
          },
          {
            text: "We built the first cottage mostly for ourselves, with no real plan to open it to guests. It was only after friends kept asking to borrow it, and then friends of friends, that the idea of doing this properly — carefully, without turning it into the kind of place we'd built it to escape from — started to take shape.",
          },
          {
            text: 'We created Vana Ekantha because the rest we found here was rare enough to be worth protecting, and generous enough to be worth sharing. Everything since — the rituals, the held hours, the refusal to print an itinerary — has been in service of keeping that first feeling intact.',
          },
        ],
        signatureName: 'The Vana Ekantha Team',
        signatureLocation: 'the deccan, india',
      },
      different: {
        eyebrow: 'what makes us different',
        heading: 'not a resort.\nnot quite a retreat, either.',
        rows: [
          { notText: 'A curated itinerary', yesText: 'A rhythm you find on your own' },
          { notText: 'Activities to keep you busy', yesText: 'Rituals you can join, or skip entirely' },
          { notText: 'A concierge anticipating requests', yesText: 'A caretaker who leaves you alone, well' },
          { notText: 'Dynamic pricing and urgency banners', yesText: 'One honest rate, regardless of demand' },
          { notText: 'A polished, photographed version of nature', yesText: 'The land, mostly left as it already was' },
        ],
      },
      overview: {
        eyebrow: 'the estate overview',
        heading: 'eleven acres,\nin plain numbers.',
        image: overviewImg,
        facts: [
          { number: '11', label: 'acres of the Deccan' },
          { number: '3', label: 'stays — Mango, Stone & Full House' },
          { number: '2024', label: 'the year we opened to guests' },
          { number: '2.5', label: 'hrs from Hyderabad, by road' },
        ],
      },
    },
  })
  payload.logger.info('✓ About seeded.')

  payload.logger.info('Seeding Contact global...')
  await payload.updateGlobal({
    slug: 'contact',
    data: {
      info: {
        eyebrow: 'get in touch',
        heading: 'Talk to a person, not a form.',
        intro:
          "We don't run a call centre or a chatbot. Every enquiry — by phone, email, or the form below — is answered by someone who actually works on the farm.",
        rows: [
          {
            icon: 'phone',
            label: 'Phone',
            value: '+91 98480 12345',
            href: 'tel:+919848012345',
            note: "08:00 – 20:00 IST, every day. Outside those hours, leave a message and we'll call back.",
          },
          {
            icon: 'email',
            label: 'Email',
            value: 'hello@vanaekantha.com',
            href: 'mailto:hello@vanaekantha.com',
            note: "For bookings, events, press, or anything that doesn't fit a form field.",
          },
          {
            icon: 'location',
            label: 'Property Location',
            value: 'The Deccan, Telangana',
            note: "Roughly 2.5 hours by road from Hyderabad. The exact address and coordinates are shared in your booking confirmation — partly for privacy, partly to make sure we've spoken first.",
          },
        ],
        mapCaption:
          'Google Maps directions are sent with every confirmed booking, pinned to the exact gate — this map is intentionally general until then.',
      },
      form: {
        eyebrow: 'send a message',
        heading: 'or, write it down here.',
        intro: "No auto-reply, no ticket number. We'll write back within 24 hours.",
        nameLabel: 'Your Name',
        namePlaceholder: 'first and last name',
        contactLabel: 'Email Or Phone',
        contactPlaceholder: "however you'd like us to reply",
        subjectLabel: "What's This About",
        subjectPlaceholder: 'e.g. a booking question, an event enquiry, press',
        messageLabel: 'Your Message',
        messagePlaceholder: "tell us what you need, and we'll take it from there",
        submitLabel: 'Send Message →',
        submitNote: "We'll write back within 24 hours.",
      },
    },
  })
  payload.logger.info('✓ Contact seeded.')

  payload.logger.info('Seeding Events global...')
  const evBirthdayImg = await media('beautiful-jungle-party-decorations-1-scaled.jpg', 'Birthday celebration at Vana Ekantha')
  const evAnniversaryImg = await media('aerial-view-beautiful-outdoor-wedding-ceremony-scaled.jpg', 'Anniversary celebration at Vana Ekantha')
  const evCorporateImg = await media('beautiful-wedding-table-assortment-outside-scaled.jpg', 'Corporate event setup at Vana Ekantha')
  const evAlumniImg = await media('rose-flower-scaled.jpg', 'Alumni meet at Vana Ekantha')
  const evPreweddingImg = await media('full-shot-smiley-women-posing-together-scaled.jpg', 'Pre-wedding function at Vana Ekantha')
  const evGallery1 = await media('evening-image-5-scaled.jpg', 'A birthday, under the gulmohar')
  const evGallery2 = await media('evening-image-6-scaled.jpg', 'The pavilion, lit for the evening')
  const evGallery3 = await media('evening-image-1-scaled.jpg', 'A reunion, one long table')
  const evGallery4 = await media('evening-image-2-scaled.jpg', 'The dance floor, at dusk')
  const evGallery5 = await media('evening-image-3-scaled.jpg', 'The bonfire circle')
  const evGallery6 = await media('evening-image-4-scaled.jpg', 'The estate, from above')

  await payload.updateGlobal({
    slug: 'events',
    data: {
      hero: {
        badgeLabel: 'Events & Celebrations',
        badgeMonogram: 'VE',
        headline: 'Host It Here.',
        sub: 'The estate opens itself to gatherings that deserve more than a banquet hall — open lawns, a private events team, and eleven acres of the Deccan as the backdrop.',
        primaryCtaLabel: 'Enquire Now →',
        primaryCtaHref: '#enquiry',
        secondaryCtaLabel: 'See Venue Features',
        secondaryCtaHref: '#features',
        marqueeItems: [
          { text: 'Birthdays' },
          { text: 'Anniversaries' },
          { text: 'Corporate Events' },
          { text: 'Alumni Meets' },
          { text: 'Pre-Wedding Functions' },
        ],
      },
      eventsWeHost: {
        eyebrow: 'events we host',
        heading: 'five kinds of gathering.',
        sub: 'Hover a panel — or on smaller screens, just keep scrolling.',
        items: [
          {
            image: evBirthdayImg,
            number: '01',
            title: 'Birthdays',
            description: 'Candles under the gulmohar, cake at dusk — milestone or otherwise, sized to however big you want it.',
          },
          {
            image: evAnniversaryImg,
            number: '02',
            title: 'Anniversaries',
            description: 'A quiet renewal of vows, or a full celebration with everyone who watched it happen the first time.',
          },
          {
            image: evCorporateImg,
            number: '03',
            title: 'Corporate Events',
            description: 'Offsites, team days, and year-end parties that trade the conference room for open lawns.',
          },
          {
            image: evAlumniImg,
            number: '04',
            title: 'Alumni Meets',
            description: 'Reunions for classes, teams, and colleges — long tables, and longer conversations.',
          },
          {
            image: evPreweddingImg,
            number: '05',
            title: 'Pre-Wedding Functions',
            description: 'Mehendi, sangeet, haldi — the land holds every kind of ceremony well.',
          },
        ],
      },
      venueFeatures: {
        eyebrow: 'venue features',
        heading: 'what the estate provides.',
        items: [
          {
            icon: 'lawns',
            title: 'Open Lawns',
            description: 'Wide, unhurried grass for anything from a badminton net to a two-hundred-person reception.',
          },
          {
            icon: 'pavilion',
            title: 'Covered Pavilion',
            description: 'A large open-sided pavilion, weatherproof for both peak sun and monsoon evenings.',
          },
          {
            icon: 'lighting',
            title: 'Sound & Lighting Setup',
            description: 'In-house sound system and warm string lighting across the lawns and pavilion, ready without a rental truck.',
          },
          {
            icon: 'parking',
            title: 'Ample Parking',
            description: 'On-site parking for large groups, with attendants for events over fifty guests.',
          },
          {
            icon: 'catering',
            title: 'In-House Catering',
            description: 'Farm-sourced menus built around your event, from a simple tea service to a full multi-course dinner.',
          },
          {
            icon: 'stay',
            title: 'Overnight Stay Options',
            description: "Mango House, Stone House, or the Full House — for guests who'd rather not drive home after.",
          },
        ],
      },
      gallery: {
        eyebrow: 'event gallery',
        heading: 'a few evenings.',
        items: [
          { image: evGallery1, caption: 'a birthday, under the gulmohar' },
          { image: evGallery2, caption: 'the pavilion, lit for the evening' },
          { image: evGallery3, caption: 'a reunion, one long table' },
          { image: evGallery4, caption: 'the dance floor, at dusk' },
          { image: evGallery5, caption: 'the bonfire circle' },
          { image: evGallery6, caption: 'the estate, from above' },
        ],
      },
      customise: {
        eyebrow: 'customisation options',
        heading: 'shape the evening your way.',
        sub: 'Pick and mix — none of these come as a fixed package.',
        groups: [
          {
            groupNumber: '01',
            groupLabel: 'Decor',
            chips: [
              { label: 'Floral arches' },
              { label: 'Fairy lights' },
              { label: 'Themed table settings' },
              { label: 'Photo backdrops' },
            ],
          },
          {
            groupNumber: '02',
            groupLabel: 'Catering',
            chips: [
              { label: 'Live counters' },
              { label: 'Regional menus' },
              { label: 'Dietary-specific spreads' },
              { label: 'Dessert stations' },
            ],
          },
          {
            groupNumber: '03',
            groupLabel: 'Entertainment',
            chips: [
              { label: 'DJ & sound' },
              { label: 'Live acoustic sets' },
              { label: 'Bonfire & games' },
              { label: 'Outdoor cinema screening' },
            ],
          },
          {
            groupNumber: '04',
            groupLabel: 'Logistics',
            chips: [
              { label: 'Guest transport' },
              { label: 'Overnight stay blocks' },
              { label: 'Extended hours' },
              { label: 'On-ground event coordinator' },
            ],
          },
        ],
      },
      enquiry: {
        eyebrow: 'enquiry form',
        heading: "tell us what you're planning.",
        sub: 'No quote engine, no auto-reply. A real person on the events team will write back within a day.',
        nameLabel: 'Your Name',
        namePlaceholder: 'first and last name',
        eventTypeLabel: 'Event Type',
        eventTypeNote: 'birthday, corporate, alumni, pre-wedding…',
        eventTypePlaceholder: 'e.g. corporate offsite',
        guestCountLabel: 'Guest Count',
        guestCountPlaceholder: 'approximate number',
        preferredDateLabel: 'Preferred Date',
        preferredDatePlaceholder: 'e.g. 14 june, or a flexible weekend',
        reachLabel: 'How To Reach You',
        reachPlaceholder: 'email or phone',
        moreLabel: 'Tell Us More',
        moreNote: 'optional',
        morePlaceholder: 'anything about the occasion that would help us plan',
        submitLabel: 'Send Enquiry →',
        submitNote: "We'll write back within 24 hours.",
      },
    },
  })
  payload.logger.info('✓ Events seeded.')

  payload.logger.info('Seeding FAQs global...')
  await payload.updateGlobal({
    slug: 'faqs',
    data: {
      eyebrow: 'frequently asked',
      heading: 'Answers, before\nyou have to ask.',
      sub: "Everything guests tend to ask before holding a date, reserving a table, or booking an event — grouped so you don't have to read all of it to find your one question.",
      searchPlaceholder: 'Search a question — e.g. cancellation, capacity, menu',
      categories: [
        {
          slug: 'checkin',
          number: '01',
          title: 'Check-in & Check-out',
          items: [
            {
              question: 'What are the check-in and check-out times?',
              answer:
                'Check-in is from 14:00, once the held hours end and the farm receives guests. Check-out is by 11:00, so the cottages can be prepared for the next arrival.',
            },
            {
              question: 'Can I request an early check-in or late check-out?',
              answer: "Yes, subject to availability. If the stay is free the night before or after, we're usually happy to accommodate — just ask when you hold your date.",
            },
            {
              question: 'What happens if I arrive before check-in time?',
              answer: "The main house is open. There's chai, shade, and somewhere to leave your luggage while your cottage is readied.",
            },
            {
              question: 'Is there a minimum length of stay?',
              answer:
                "Two nights, across all three stays. We've found one night is a preview, not a stay — the rhythm of the farm needs at least a second day to begin.",
            },
          ],
        },
        {
          slug: 'booking',
          number: '02',
          title: 'Booking Policies',
          items: [
            {
              question: 'How do I hold a date?',
              answer:
                "Through the Hold a Date form — tell us your dates, who's coming, and which stay you'd like. A real person writes back within 24 hours to confirm.",
            },
            {
              question: 'Is a deposit required to confirm a booking?',
              answer: 'A 50% advance is requested to confirm a hold, with the balance due on arrival. No payment links, no surcharges added at checkout.',
            },
            {
              question: 'What is the cancellation policy?',
              answer: '14 or more days before arrival: full refund. 7–14 days: 50% refund. Under 7 days: held as credit, valid for 18 months, rather than lost entirely.',
            },
            {
              question: 'Do rates change based on demand or season?',
              answer: "No. We don't run dynamic pricing — the rate you see is the rate you pay, regardless of when you book or how busy the weekend is.",
            },
            {
              question: 'Can I change my dates after booking?',
              answer: "Usually, yes — contact us as early as possible and we'll move your hold if the new dates are available.",
            },
          ],
        },
        {
          slug: 'dining',
          number: '03',
          title: 'Farm Dining Bookings',
          items: [
            {
              question: 'Do I need to be a staying guest to book Bamboo Farm Dine?',
              answer: "No — Bamboo Farm Dine is open to day visitors as well as overnight guests. You don't need to be holding a stay to reserve a seat at the table.",
            },
            {
              question: 'How far in advance should I reserve a table?',
              answer:
                "At least 24 hours, since the kitchen shops and cooks for the exact number confirmed. Weekends and celebrations are safer with a few days' notice.",
            },
            {
              question: 'Is there a fixed menu?',
              answer: "No. The kitchen decides the same morning, based on what's ready to be picked from the garden. Dietary restrictions are handled if flagged in advance.",
            },
            {
              question: 'What happens if it rains during dinner?',
              answer: 'The dining hut has a full roof, so light rain changes nothing. In heavy weather, the table moves under the covered section beside the main house.',
            },
          ],
        },
        {
          slug: 'events',
          number: '04',
          title: 'Event Bookings',
          items: [
            {
              question: 'How far in advance should I book an event?',
              answer:
                'For birthdays and small gatherings, a couple of weeks is usually enough. For larger events — weddings, corporate offsites — we recommend 6–8 weeks to arrange catering and customisation.',
            },
            {
              question: "What's included in a venue booking?",
              answer:
                'Open lawns or the covered pavilion, in-house sound and lighting, and on-site parking. Catering, decor, and entertainment are added on top, based on what you choose.',
            },
            {
              question: 'Can I bring my own decorator or caterer?',
              answer:
                "We prefer to run catering in-house, since it's built around the farm's own kitchen, but we're flexible on decor vendors — talk to us about what you have in mind.",
            },
            {
              question: 'Is overnight stay included with an event booking?',
              answer: 'Not by default — venue bookings are day-use unless you also hold Mango House, Stone House, or the Full House for the night.',
            },
          ],
        },
        {
          slug: 'addons',
          number: '05',
          title: 'Add-Ons',
          items: [
            {
              question: 'What add-ons are available?',
              answer:
                'Farm dinners (₹800 per person), laundry, packed breakfast for early departures, and — for events — decor, catering, entertainment, and logistics add-ons like transport or a coordinator.',
            },
            {
              question: 'How do I request an add-on?',
              answer:
                "Mention it in your note when you hold a date, or ask the caretaker once you've arrived — most add-ons don't need advance notice, though farm dinners are easier to arrange with a heads-up.",
            },
            {
              question: 'Are add-ons available to day visitors?',
              answer: 'Some are — farm dining and event customisations, for instance — while others, like laundry, are only offered to overnight guests.',
            },
          ],
        },
        {
          slug: 'capacity',
          number: '06',
          title: 'Guest Capacity',
          items: [
            {
              question: 'How many guests can each stay accommodate?',
              answer:
                'Mango House holds 2–3 adults, Stone House holds 2–4 adults across two bedrooms, and the Full House — the entire estate — holds up to 16 adults.',
            },
            {
              question: 'Can I bring more guests than the listed capacity?',
              answer: 'Only with prior approval, and additional guest charges may apply — ask us before you arrive rather than on the day.',
            },
            {
              question: 'Are children welcome?',
              answer: 'Yes. Mango House and the Full House are especially family-friendly, with open lawns and animals nearby to keep younger guests occupied.',
            },
            {
              question: 'Are pets allowed?',
              answer: "Not currently. The farm keeps its own animals and a quiet rhythm we'd rather not disrupt — we hope to revisit this as the estate grows.",
            },
          ],
        },
      ],
    },
  })
  payload.logger.info('✓ FAQs seeded.')

  payload.logger.info('Seeding Farm Dining global...')
  const fdHeroImg = await mediaFromUrl(
    'https://i.pinimg.com/736x/a8/4f/0b/a84f0b902109e5eb845eec51cf00c5fc.jpg',
    'Dinner table set under bamboo, lit by lamps',
  )
  const fdExp1Img = await mediaFromUrl(
    'https://images.pexels.com/photos/33777987/pexels-photo-33777987.jpeg?cs=srgb&dl=pexels-nc-farm-bureau-mark-33777987.jpg&fm=jpg',
    'The kitchen garden the farm dine draws from',
  )
  const fdExp2Img = await mediaFromUrl(
    'https://images.trvl-media.com/lodging/112000000/111020000/111011900/111011840/1d0a0417.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill',
    'The open-sided bamboo dining hut',
  )
  const fdExp3Img = await mediaFromUrl(
    'https://images.pexels.com/photos/35383651/pexels-photo-35383651.jpeg?cs=srgb&dl=pexels-strannik-sk-35383651.jpg&fm=jpg',
    'Open field under the stars at night',
  )
  const fdGallery1 = await media('park-view-scaled.jpg', 'The bamboo stalks, mid-afternoon')
  const fdGallery2 = await mediaFromUrl('https://i.pinimg.com/736x/9d/8b/96/9d8b96700ab5ffd2d2219840c047c523.jpg', 'The long table, set')
  const fdGallery3 = await mediaFromUrl('https://storybox.karmanitalia.it/hs-fs/hubfs/ululi_ulula.jpg?width=900&height=600&name=ululi_ulula.jpg', 'Lamps, at dusk')
  const fdGallery4 = await mediaFromUrl(
    'https://static.vecteezy.com/system/resources/thumbnails/068/938/970/small_2x/gravel-path-leading-through-lush-vegetable-garden-with-apricots-and-herbs-photo.jpg',
    'The kitchen garden path',
  )
  const fdGallery5 = await mediaFromUrl('https://m.media-amazon.com/images/I/81vpt9xDD5L.jpg', "Plates, as they're served")
  const fdGallery6 = await mediaFromUrl(
    'https://media.istockphoto.com/id/1421236485/photo/starry-night-in-grassland.jpg?s=612x612&w=0&k=20&c=EvrwgoOtYbX3OF65YsVHj1lG_rkdnXKloOGEw6X-hyQ=',
    'The open field, at night',
  )
  const fdSuitableImg = await media('anniversary-dinner-with-candlelit-ambiance-scaled.jpg', 'A date night table, candlelit')
  const fdReserveImg = await media('interior-railroad-station.jpg', 'The table, lit and ready')

  await payload.updateGlobal({
    slug: 'farm-dining',
    data: {
      hero: {
        badgeLabel: 'Bamboo Farm Dine',
        badgeMonogram: 'VE',
        headline: 'Dinner, Under Bamboo.',
        sub: "A long table set between bamboo stalks, lit by lamps, fed by what the farm grew that week. No menus printed in advance — the kitchen decides the morning of, based on what's ready to be picked.",
        image: fdHeroImg,
        facts: [
          { text: '<b>One</b> seating, nightly' },
          { text: '<b>Reservation</b> required, 24 hours ahead' },
          { text: '<b>₹1,400</b> per person, farm dinner' },
        ],
        primaryCtaLabel: 'Reserve Now →',
        primaryCtaHref: '#reserve',
        secondaryCtaLabel: 'See The Experience',
        secondaryCtaHref: '#experience',
      },
      unique: {
        eyebrow: 'what makes it different',
        heading: "a dinner that isn't replicated.",
        sub: 'Farm dining is common enough to have become a formula. This is the version we built before it was one.',
        items: [
          {
            number: '01',
            title: 'No Fixed Menu',
            body: 'The kitchen decides the same morning, based on what\'s ready to be picked — not a laminated card.',
          },
          {
            number: '02',
            title: 'Set Inside The Grove',
            body: 'The table sits between real, growing bamboo stalks — not a themed replica built to look like one.',
          },
          {
            number: '03',
            title: 'One Seating, Nightly',
            body: 'A single seating means no one is rushed for the next table. Dinner ends when the conversation does.',
          },
          {
            number: '04',
            title: 'Lit By Lamp, Not Electricity',
            body: 'Oil lamps strung along the table and the path — no overhead lighting, no generator hum.',
          },
        ],
      },
      experience: {
        eyebrow: 'the experience',
        heading: "three things you'll notice.",
        items: [
          {
            image: fdExp1Img,
            tagNumber: '01',
            tagLabel: 'setting',
            title: 'The Farm Setting',
            body: "The table sits at the edge of the working farm, an arm's length from the kitchen garden it draws from. Produce is walked from field to table, sometimes still warm from the day's sun. You're not dining near a farm — you're dining inside one, mid-shift.",
          },
          {
            image: fdExp2Img,
            tagNumber: '02',
            tagLabel: 'structure',
            title: 'The Dining Hut',
            body: 'A simple bamboo-and-thatch structure, open on all sides — a roof against rain, nothing more. There are no walls to close the field out, which is the entire point of building it this way.',
          },
          {
            image: fdExp3Img,
            tagNumber: '03',
            tagLabel: 'atmosphere',
            title: 'Open-Field Ambience',
            body: 'Crickets instead of a playlist. The smell of a distant bonfire. With almost no artificial light, the stars do most of the decorating — which is why the best tables are the ones furthest from the lamps.',
          },
        ],
      },
      gallery: {
        eyebrow: 'gallery',
        heading: 'a table, in pieces.',
        items: [
          { image: fdGallery1, caption: 'the bamboo stalks, mid-afternoon', sizeVariant: 'wideTall' },
          { image: fdGallery2, caption: 'the long table, set', sizeVariant: 'default' },
          { image: fdGallery3, caption: 'lamps, at dusk', sizeVariant: 'default' },
          { image: fdGallery4, caption: 'the kitchen garden path', sizeVariant: 'tall' },
          { image: fdGallery5, caption: "plates, as they're served", sizeVariant: 'wide' },
          { image: fdGallery6, caption: 'the open field, at night', sizeVariant: 'default' },
        ],
      },
      suitable: {
        eyebrow: 'suitable for',
        heading: 'who comes to the table.',
        items: [
          {
            icon: 'couple',
            title: 'Date Nights',
            body: 'Two chairs, one lamp, and a table long enough that no one else needs to be at it. Our most-requested seating.',
            image: fdSuitableImg,
            featured: true,
          },
          {
            icon: 'family',
            title: 'Family Dinners',
            body: 'Long enough for three generations, open enough that children can get up mid-meal without disturbing anyone.',
            featured: false,
          },
          {
            icon: 'team',
            title: 'Team Gatherings',
            body: 'Offsites that end the day at this table instead of a hotel banquet hall — conversation travels better outdoors.',
            featured: false,
          },
          {
            icon: 'celebration',
            title: 'Celebrations',
            body: "Birthdays and anniversaries that want a table, not a hall — we'll help you shape the evening around it.",
            featured: false,
          },
        ],
      },
      faq: {
        eyebrow: 'frequently asked',
        heading: 'before you reserve.',
        items: [
          {
            question: 'Is there a fixed menu?',
            answer:
              "No. The kitchen decides the same morning, based on what's ready to be picked from the garden that day. If you have allergies or strong dislikes, tell us when you reserve and the menu will work around them.",
          },
          {
            question: 'How many people can it seat?',
            answer:
              "The long table comfortably seats up to 14. Larger groups can be accommodated with advance notice, though the feel of the evening changes past that size — ask us and we'll be honest about whether it still works.",
          },
          {
            question: 'What happens if it rains?',
            answer:
              'The dining hut has a full roof, so light rain changes nothing. In heavy weather, we move the table under the covered section beside the main house — the food and the lamps stay the same.',
          },
          {
            question: 'Do you accommodate dietary restrictions?',
            answer:
              "Yes — vegetarian, vegan, and most common allergies are handled without fuss, as long as we know a day ahead. Since the menu isn't fixed to begin with, this is usually easier here than at a restaurant.",
          },
          {
            question: 'How far in advance should I reserve?',
            answer: "At least 24 hours, since the kitchen shops and cooks for the exact number confirmed. For weekends and celebrations, a few days' notice is safer.",
          },
          {
            question: 'Is this open to guests not staying overnight?',
            answer:
              "Yes. Bamboo Farm Dine is open to day visitors as well as overnight guests — you don't need to be holding a stay to reserve a seat at the table.",
          },
        ],
      },
      reserve: {
        eyebrow: 'reserve now',
        heading: "tell us how many,\nwe'll set the table.",
        image: fdReserveImg,
        dateLabel: 'date',
        datePlaceholder: '17 may',
        partySizeLabel: 'how many',
        partySizePlaceholder: '4 guests',
        dietaryLabel: 'dietary notes',
        dietaryPlaceholder: 'vegetarian, one nut allergy',
        submitLabel: 'reserve now →',
        note: "One seating, nightly. We'll confirm within a few hours and ask nothing further until you arrive.",
      },
    },
  })
  payload.logger.info('✓ Farm Dining seeded.')

  payload.logger.info('Seeding Stay overview page...')
  // Note: the hero's background image is a hardcoded CSS background-image in
  // stay.module.css (matching Stay.html, which hardcodes it the same way
  // rather than templating it), so it isn't downloaded into Payload Media.
  const stayAmenityPoolImg = await media('swimming-pool-blue-water-tropical-garden-with-sea-view-background-scaled.jpg', 'The spring-fed pool at Vana Ekantha')
  const stayAmenityCinemaImg = await media('outdoor-movie-is-hit-with-movie-scaled.jpg', 'Outdoor cinema screening at Vana Ekantha')
  const stayAmenityBbqImg = await media('family-all-together-camping-garden-father-child-grill-food-divergence-scaled.jpg', 'Barbecue evening at Vana Ekantha')
  const stayAmenityGamesImg = await media('pool-table-with-pool-table-bar-with-two-stools-large-picture-wall-scaled.jpg', 'Indoor games room at Vana Ekantha')
  const stayAmenityLawnsImg = await media('golf-course-zlati-gric-slovenia-with-vineyards-trees-sunny-day-scaled.jpg', 'Open lawns for outdoor games at Vana Ekantha')
  const stayWhy1Img = await mediaFromUrl('https://images.unsplash.com/photo-1581217185422-a0f8c198710f?q=80&w=900&auto=format&fit=crop', 'A tray with breakfast and chai, included with every stay')
  const stayWhy2Img = await mediaFromUrl('https://images.unsplash.com/photo-1693038897766-7648cf044bad?q=80&w=900&auto=format&fit=crop', 'A single honest rate, no surge pricing')
  const stayWhy3Img = await mediaFromUrl('https://images.unsplash.com/photo-1711048090278-30fef40e104d?q=80&w=900&auto=format&fit=crop', 'A booking confirmation, flexible cancellation terms')
  const stayWhy4Img = await mediaFromUrl('https://images.unsplash.com/photo-1564433517015-799b3f75e087?q=80&w=900&auto=format&fit=crop', 'A slow clock, two nights minimum stay')

  await payload.updateGlobal({
    slug: 'stay-page',
    data: {
      hero: {
        badgeLabel: 'Five Acres, Three Ways To Stay',
        badgeMonogram: 'VE',
        headline: 'Choose Your Stay\nAt Vana Ekantha',
        sub: 'None of them face each other. Each sits where the land already had a clearing — from a private cottage for two, to the entire estate for everyone you love.',
        ratingText: 'Loved by returning guests',
        primaryCtaLabel: 'View The Stays →',
        primaryCtaHref: '#stays',
        secondaryCtaLabel: 'Hold a Date',
        secondaryCtaHref: '/hold-a-date',
      },
      staysSection: {
        heading: 'three ways to stay.',
        sub: 'From a quiet cottage for two, to the whole estate for a celebration — each stay was placed where the land already had room for it.',
      },
      amenities: {
        heading: 'included amenities.',
        sub: 'Small, deliberate ways to spend a day here — included with every stay, none of them mandatory.',
        items: [
          { image: stayAmenityPoolImg, title: 'Pool', description: 'A quiet, spring-fed pool — best at first light or last.' },
          { image: stayAmenityCinemaImg, title: 'Outdoor Projector', description: 'Films under open sky once the cicadas start — bring a blanket, borrow ours.' },
          { image: stayAmenityBbqImg, title: 'Barbecue Grill', description: 'Slow fire, farm produce, started when the dusk smells right.' },
          { image: stayAmenityGamesImg, title: 'Indoor Games', description: 'Board games and quiet company for the hours between rituals.' },
          { image: stayAmenityLawnsImg, title: 'Outdoor Games', description: 'Badminton, ring toss, and open lawns for whatever else you bring.' },
        ],
      },
      whyStay: {
        heading: 'why stay at Vana Ekantha.',
        sub: 'Four reasons guests keep returning — none of them printed on a brochure.',
        items: [
          {
            image: stayWhy1Img,
            icon: 'check',
            number: '01',
            label: 'Nothing Extra',
            title: 'Everything Essential, Included',
            body: 'Breakfast, evening chai, access to every farm ritual, a journal and a pencil — no add-on menus to read through.',
          },
          {
            image: stayWhy2Img,
            icon: 'pricing',
            number: '02',
            label: 'No Surge Pricing',
            title: 'Honest, Fixed Pricing',
            body: 'The rate you see is the rate you pay — regardless of when you book, or how popular the weekend is.',
          },
          {
            image: stayWhy3Img,
            icon: 'terms',
            number: '03',
            label: 'Fair Terms',
            title: 'Flexible Cancellation',
            body: 'Full refund 14+ days out, 50% within 7–14 days, and credit held (never lost) inside that window.',
          },
          {
            image: stayWhy4Img,
            icon: 'clock',
            number: '04',
            label: 'Two Nights, Minimum',
            title: 'A Slower Minimum Stay',
            body: 'One night is a preview, not a stay. Two is when the rhythm begins — which is why that\'s where we start.',
          },
        ],
      },
      reserve: {
        eyebrow: 'holding a date',
        heading: "tell us when,\nand we'll hold a stay.",
        whenLabel: 'when',
        whenPlaceholder: '14 may → 17 may',
        whoLabel: 'who',
        whoPlaceholder: '2 adults',
        whichStayLabel: 'which stay',
        whichStayPlaceholder: 'mango, stone, or full house',
        submitLabel: 'hold a date →',
        note: 'No countdown timers. No "only 1 left!" No urgency theatre.\nIf a stay is free, it\'s yours. If it isn\'t, we\'ll keep your name and call you back.',
      },
    },
  })
  payload.logger.info('✓ Stay overview page seeded.')

  payload.logger.info('Done. Ctrl+C not needed — process will exit.')
  process.exit(0)
}

await main().catch((err) => {
  console.error(err)
  process.exit(1)
})
