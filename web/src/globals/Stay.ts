import type { GlobalConfig } from 'payload'

export const StayOverview: GlobalConfig = {
  slug: 'stay-page',
  admin: {
    description:
      'The /stay overview page ("three ways to stay"). Each stay block pulls most of its content from the Stays collection — this only holds the page-level sections (hero, amenities, why-stay, reserve). Named "stay-page" (not "stay") to avoid clashing with the Stays collection\'s own generated TypeScript type.',
  },
  access: { read: () => true },
  fields: [
    {
      type: 'group',
      name: 'hero',
      fields: [
        { name: 'badgeLabel', type: 'text', required: true },
        { name: 'badgeMonogram', type: 'text', required: true, defaultValue: 'VE' },
        { name: 'headline', type: 'text', required: true },
        { name: 'sub', type: 'textarea', required: true },
        { name: 'ratingText', type: 'text', required: true },
        {
          type: 'row',
          fields: [
            { name: 'primaryCtaLabel', type: 'text', admin: { width: '25%' } },
            { name: 'primaryCtaHref', type: 'text', admin: { width: '25%' } },
            { name: 'secondaryCtaLabel', type: 'text', admin: { width: '25%' } },
            { name: 'secondaryCtaHref', type: 'text', admin: { width: '25%' } },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'staysSection',
      label: 'Accommodation Cards (section head only — the 3 stay blocks come from the Stays collection)',
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'sub', type: 'text' },
      ],
    },
    {
      type: 'group',
      name: 'amenities',
      label: 'Included Amenities (drag-scroll track)',
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'sub', type: 'text' },
        {
          name: 'items',
          type: 'array',
          minRows: 1,
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
      name: 'whyStay',
      label: 'Why Stay At Vana Ekantha (accordion panels)',
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'sub', type: 'text' },
        {
          name: 'items',
          type: 'array',
          minRows: 4,
          maxRows: 4,
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media', required: true },
            {
              name: 'icon',
              type: 'select',
              required: true,
              options: [
                { label: 'Nothing Extra (check)', value: 'check' },
                { label: 'No Surge Pricing (tag)', value: 'pricing' },
                { label: 'Fair Terms (document)', value: 'terms' },
                { label: 'Minimum Stay (clock)', value: 'clock' },
              ],
            },
            { name: 'number', type: 'text', required: true },
            { name: 'label', type: 'text', required: true, admin: { description: 'The short always-visible label, e.g. "Nothing Extra"' } },
            { name: 'title', type: 'text', required: true, admin: { description: 'The longer title shown on hover/expand, e.g. "Everything Essential, Included"' } },
            { name: 'body', type: 'textarea', required: true },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'reserve',
      label: 'Booking CTA Banner',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
        { name: 'whenLabel', type: 'text', defaultValue: 'when' },
        { name: 'whenPlaceholder', type: 'text', defaultValue: '14 may → 17 may' },
        { name: 'whoLabel', type: 'text', defaultValue: 'who' },
        { name: 'whoPlaceholder', type: 'text', defaultValue: '2 adults' },
        { name: 'whichStayLabel', type: 'text', defaultValue: 'which stay' },
        { name: 'whichStayPlaceholder', type: 'text', defaultValue: 'mango, stone, or full house' },
        { name: 'submitLabel', type: 'text', defaultValue: 'hold a date →' },
        { name: 'note', type: 'textarea' },
      ],
    },
  ],
}
