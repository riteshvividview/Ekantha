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
    const url = `${HOSTINGER}/${filename}`
    if (mediaCache.has(url)) return mediaCache.get(url)!

    const existing = await payload.find({ collection: 'media', where: { alt: { equals: alt } }, limit: 1 })
    if (existing.docs[0]) {
      mediaCache.set(url, existing.docs[0].id)
      return existing.docs[0].id
    }

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

  payload.logger.info('Done. Ctrl+C not needed — process will exit.')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
