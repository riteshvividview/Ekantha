import type { GlobalConfig } from 'payload'

export const Home: GlobalConfig = {
  slug: 'home',
  admin: {
    description:
      'The / homepage. Schema finalized against a full read of Home.html — 11 sections in order: hero, ticker, intro, why-us, estate experience track, stays carousel, farm dine, events preview, testimonials, gallery preview, location, final CTA.',
  },
  access: { read: () => true },
  fields: [
    {
      type: 'group',
      name: 'hero',
      fields: [
        { name: 'badgeLabel', type: 'text', required: true, admin: { description: 'e.g. "A Forest Farmstay Near Hyderabad"' } },
        { name: 'badgeMonogram', type: 'text', defaultValue: 'VE' },
        { name: 'headline', type: 'text', required: true },
        { name: 'sub', type: 'textarea', required: true },
        { name: 'backgroundImage', type: 'upload', relationTo: 'media', required: true },
        { name: 'ratingText', type: 'text', defaultValue: 'Loved by returning guests' },
        {
          type: 'row',
          fields: [
            { name: 'primaryCtaLabel', type: 'text', admin: { width: '25%' }, defaultValue: 'Hold a Date →' },
            { name: 'primaryCtaHref', type: 'text', admin: { width: '25%' }, defaultValue: '/hold-a-date' },
            { name: 'secondaryCtaLabel', type: 'text', admin: { width: '25%' }, defaultValue: 'Chat on WhatsApp' },
            { name: 'secondaryCtaHref', type: 'text', admin: { width: '25%' } },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'ticker',
      label: 'Farm ticker (the strip just under the hero)',
      admin: { description: 'The live date/time in the third slot is computed client-side, not stored here.' },
      fields: [
        { name: 'weatherText', type: 'text', required: true, admin: { description: 'e.g. "26°C, jasmine on the wind"' } },
        { name: 'ripeningText', type: 'text', required: true, admin: { description: 'e.g. "the first amrood of the season"' } },
      ],
    },
    {
      type: 'group',
      name: 'intro',
      label: 'Introduction ("an invocation")',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'an invocation' },
        { name: 'pullQuote', type: 'text', required: true },
        { name: 'paragraphBeforeContrasts', type: 'textarea', required: true },
        {
          name: 'contrasts',
          type: 'array',
          minRows: 3,
          maxRows: 3,
          fields: [{ name: 'text', type: 'text', required: true }],
          admin: { description: 'e.g. "privacy without isolation"' },
        },
        { name: 'paragraphAfterContrasts', type: 'textarea', required: true },
        { name: 'closingNote', type: 'textarea', required: true },
      ],
    },
    {
      type: 'group',
      name: 'whyUs',
      label: 'Why Vana Ekantha (4 cards)',
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'sub', type: 'textarea' },
        {
          name: 'showcaseImage',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'The big sticky photo beside the card stack, shown by default before any card is active. Fallback for any item missing its own spotlightImage.' },
        },
        {
          name: 'items',
          type: 'array',
          minRows: 4,
          maxRows: 4,
          fields: [
            { name: 'badgeLabel', type: 'text', required: true },
            { name: 'title', type: 'text', required: true },
            { name: 'body', type: 'textarea', required: true },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Shown at the bottom of this card, inside the card itself.' },
            },
            {
              name: 'spotlightImage',
              type: 'upload',
              relationTo: 'media',
              admin: { description: 'Replaces the big left showcase photo while this card is the active/pinned one — must be a different photo than this card\'s own image above.' },
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'experience',
      label: 'Experience The Estate (horizontal drag-scroll track)',
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'sub', type: 'textarea' },
        {
          name: 'items',
          type: 'array',
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media', required: true },
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea', required: true },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'staysTeaser',
      label: 'Choose Your Escape (carousel)',
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'sub', type: 'textarea' },
        {
          name: 'featuredStays',
          type: 'relationship',
          relationTo: 'stays',
          hasMany: true,
          required: true,
          admin: {
            description:
              'Which Stays documents to show, and in what order. Name/image/price/capacity/homeTeaser quote+facts all come from the Stays document itself.',
          },
        },
      ],
    },
    {
      type: 'group',
      name: 'dine',
      label: 'Bamboo Farm Dine',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'bamboo farm dine' },
        { name: 'heading', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
        { name: 'ctaLabel', type: 'text', defaultValue: 'Explore Farm Dining →' },
        { name: 'ctaHref', type: 'text', defaultValue: '/farm-dining' },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    {
      type: 'group',
      name: 'eventsPreview',
      label: 'Events & Celebrations (preview — separate short copy from the full /events page)',
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'sub', type: 'textarea' },
        {
          name: 'items',
          type: 'array',
          minRows: 4,
          maxRows: 4,
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media', required: true },
            { name: 'badgeLabel', type: 'text', required: true },
            { name: 'title', type: 'text', required: true },
            { name: 'description', type: 'textarea', required: true },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'testimonials',
      label: 'What Guests Leave Behind',
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'sub', type: 'textarea' },
        {
          name: 'items',
          type: 'array',
          minRows: 3,
          maxRows: 3,
          fields: [
            { name: 'quote', type: 'textarea', required: true },
            { name: 'name', type: 'text', required: true },
            { name: 'rating', type: 'number', defaultValue: 5, min: 1, max: 5 },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'galleryPreview',
      label: 'A Glimpse Of The Estate (preview)',
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'sub', type: 'textarea' },
        {
          name: 'images',
          type: 'array',
          minRows: 6,
          maxRows: 6,
          fields: [{ name: 'image', type: 'upload', relationTo: 'media', required: true }],
        },
        { name: 'ctaLabel', type: 'text', defaultValue: 'View Full Gallery →' },
        { name: 'ctaHref', type: 'text' },
      ],
    },
    {
      type: 'group',
      name: 'location',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'location' },
        { name: 'heading', type: 'text', required: true },
        {
          name: 'facts',
          type: 'array',
          minRows: 4,
          maxRows: 4,
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'value', type: 'text', required: true },
          ],
        },
        { name: 'ctaLabel', type: 'text', defaultValue: 'Get Directions →' },
        { name: 'ctaHref', type: 'text' },
        { name: 'mapImage', type: 'upload', relationTo: 'media', required: true },
      ],
    },
    {
      type: 'group',
      name: 'finalCta',
      fields: [
        { name: 'eyebrow', type: 'text', defaultValue: 'holding a date' },
        { name: 'heading', type: 'text', required: true },
        { name: 'whenLabel', type: 'text', defaultValue: 'when' },
        { name: 'whenPlaceholder', type: 'text', defaultValue: '14 may → 17 may' },
        { name: 'whoLabel', type: 'text', defaultValue: 'who' },
        { name: 'whoPlaceholder', type: 'text', defaultValue: '2 adults' },
        { name: 'howLongLabel', type: 'text', defaultValue: 'how long' },
        { name: 'howLongPlaceholder', type: 'text', defaultValue: '3 nights' },
        { name: 'submitLabel', type: 'text', defaultValue: 'hold a date →' },
        { name: 'note', type: 'textarea' },
      ],
    },
  ],
}
