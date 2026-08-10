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

// Icons shared by the Highlights section across all three detail pages
// (/mango-house, /stone-house, /full-house) — broad enough to cover each
// stay's distinct highlights without a one-off select per document.
const HIGHLIGHT_ICON_OPTIONS = [
  { label: 'Bed', value: 'bed' },
  { label: 'Orchard / trees', value: 'orchard' },
  { label: 'Verandah / roofline', value: 'verandah' },
  { label: 'Animals', value: 'animals' },
  { label: 'Fireplace', value: 'fireplace' },
  { label: 'Desk / writing', value: 'desk' },
  { label: 'Books / reading', value: 'reading' },
  { label: 'Pond / water', value: 'pond' },
  { label: 'Lawn / grounds', value: 'lawn' },
  { label: 'Kitchen', value: 'kitchen' },
  { label: 'Event / celebration', value: 'event' },
  { label: 'Privacy / estate', value: 'privacy' },
]

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
    { name: 'heroSub', type: 'textarea', admin: { description: 'The one-line pitch shown under the hero title on this stay\'s own page — filled in when that page is built.' } },
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
        { name: 'eyebrow', type: 'text', defaultValue: 'the description' },
        {
          name: 'pullHeadline',
          type: 'text',
          admin: { description: 'The large sticky-column headline, e.g. "Breakfast, some mornings,\\nis just what fell." — last word is italicized automatically. Filled in when this stay\'s own page is built.' },
        },
        { name: 'accentImage', type: 'upload', relationTo: 'media' },
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

    {
      type: 'group',
      name: 'highlightsSection',
      label: 'Accommodation Highlights',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Mango-House-style layout only: the single sticky photo shown alongside the highlight rows.' },
        },
        {
          name: 'items',
          type: 'array',
          admin: {
            description:
              'Each stay detail page renders this list with its own visual treatment. Mango House: icon + colored badge per row, no per-row image. Stone House: image + plain badge per row, with the first row shown as a large featured card.',
          },
          fields: [
            { name: 'icon', type: 'select', options: HIGHLIGHT_ICON_OPTIONS, admin: { description: 'Mango-House-style layout only.' } },
            { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Stone-House-style layout only.' } },
            {
              type: 'row',
              fields: [
                { name: 'badgeLabel', type: 'text', required: true, admin: { width: '60%', description: 'e.g. "2–3 Adults"' } },
                {
                  name: 'badgeColor',
                  type: 'select',
                  defaultValue: 'green',
                  admin: { width: '40%', description: 'Mango-House-style layout only.' },
                  options: [
                    { label: 'Green', value: 'green' },
                    { label: 'Amber', value: 'amber' },
                    { label: 'Purple', value: 'purple' },
                    { label: 'Blue', value: 'blue' },
                  ],
                },
              ],
            },
            { name: 'title', type: 'text', required: true },
            { name: 'body', type: 'textarea', required: true },
          ],
        },
      ],
    },

    {
      type: 'group',
      name: 'amenitiesSection',
      label: 'Amenities & Inclusions',
      fields: [
        { name: 'hint', type: 'text', defaultValue: 'swipe or scroll to see more →' },
        {
          name: 'items',
          type: 'array',
          fields: [
            { name: 'title', type: 'text', required: true },
            { name: 'body', type: 'textarea', required: true },
            { name: 'image', type: 'upload', relationTo: 'media', required: true },
          ],
        },
      ],
    },

    {
      name: 'gallery',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text', required: true },
        {
          name: 'aspectRatio',
          type: 'select',
          defaultValue: '4/3',
          options: [
            { label: 'Portrait (3/4)', value: '3/4' },
            { label: 'Square (1/1)', value: '1/1' },
            { label: 'Tall portrait (4/5)', value: '4/5' },
            { label: 'Landscape (4/3)', value: '4/3' },
          ],
        },
      ],
    },

    repeatingImageBlock('idealFor'),

    { name: 'finalCtaNote', type: 'textarea' },

    {
      type: 'group',
      name: 'overviewBlock',
      label: 'Stay Overview block (the /stay page — one summary block per stay)',
      admin: {
        description:
          'Content for this stay\'s block on the /stay overview page. The quote there reuses description.pullQuote above — everything else (bed/character specs, the two bullet lists, the note) is specific to this shorter summary.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'bed', type: 'text', required: true, admin: { width: '50%', description: 'e.g. "queen bed + daybed"' } },
            { name: 'character', type: 'text', required: true, admin: { width: '50%', description: 'e.g. "lively, orchard-facing mornings"' } },
          ],
        },
        {
          name: 'lists',
          type: 'array',
          minRows: 2,
          maxRows: 2,
          admin: { description: 'Exactly 2 columns, e.g. "what\'s inside" / "what\'s outside".' },
          fields: [
            { name: 'heading', type: 'text', required: true },
            { name: 'items', type: 'array', minRows: 1, fields: [{ name: 'text', type: 'text', required: true }] },
          ],
        },
        { name: 'note', type: 'textarea' },
      ],
    },
  ],
}
