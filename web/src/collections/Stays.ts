import type { CollectionConfig } from 'payload'

const repeatingImageBlock = (name: string) => ({
  name,
  type: 'array' as const,
  fields: [
    { name: 'title', type: 'text' as const, required: true },
    { name: 'body', type: 'textarea' as const, required: true },
    { name: 'image', type: 'upload' as const, relationTo: 'media' as const, required: true },
  ],
})

export const Stays: CollectionConfig = {
  slug: 'stays',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'priceFrom'],
    description:
      'The three properties: Mango House, Stone House, Full House. Each is one document here and gets its own page (/mango-house, /stone-house, /full-house) plus a card on the /stay overview page. Which visual layout each section uses (bento grid, alternating rows, mosaic, etc.) is chosen in code per page — this is just the content.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slug',
      type: 'select',
      required: true,
      unique: true,
      options: [
        { label: 'Mango House', value: 'mango-house' },
        { label: 'Stone House', value: 'stone-house' },
        { label: 'Full House', value: 'full-house' },
      ],
      admin: {
        description: 'Determines the route: /mango-house, /stone-house, or /full-house.',
      },
    },
    { name: 'title', type: 'text', required: true },
    { name: 'tagline', type: 'text', required: true },
    {
      name: 'heroBadgeLabel',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "Stay / Mango House"' },
    },
    { name: 'heroImage', type: 'upload', relationTo: 'media', required: true },
    {
      type: 'row',
      fields: [
        { name: 'priceFrom', type: 'number', required: true, admin: { width: '33%' } },
        {
          name: 'priceNote',
          type: 'text',
          admin: { width: '34%', description: 'e.g. "includes breakfast, chai & farm dinner"' },
        },
        { name: 'capacity', type: 'text', required: true, admin: { width: '33%', description: 'e.g. "2–3 adults"' } },
      ],
    },
    { name: 'minNights', type: 'text', required: true, admin: { description: 'e.g. "2 night minimum"' } },

    {
      type: 'group',
      name: 'description',
      fields: [
        { name: 'intro', type: 'textarea', required: true },
        { name: 'pullQuote', type: 'textarea', required: true },
        { name: 'paragraphs', type: 'array', fields: [{ name: 'text', type: 'textarea', required: true }] },
      ],
    },

    {
      type: 'group',
      name: 'homeTeaser',
      label: 'Homepage teaser (Choose Your Escape carousel)',
      admin: {
        description:
          'The homepage carousel uses its own short quote and facts line, distinct from the full page above — e.g. Mango House\'s full-page quote is about breakfast/goats, but the homepage teaser quote is about mornings/fruit sounds.',
      },
      fields: [
        { name: 'quote', type: 'textarea', required: true },
        {
          name: 'factsLine',
          type: 'text',
          required: true,
          admin: { description: 'e.g. "queen bed · private verandah · no tv" (capacity is prepended automatically)' },
        },
      ],
    },

    repeatingImageBlock('highlights'),
    repeatingImageBlock('amenities'),

    {
      name: 'gallery',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text', required: true },
      ],
    },

    repeatingImageBlock('idealFor'),

    { name: 'finalCtaNote', type: 'textarea' },
  ],
}
