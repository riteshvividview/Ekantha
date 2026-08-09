import type { GlobalConfig } from 'payload'

export const FarmDining: GlobalConfig = {
  slug: 'farm-dining',
  admin: { description: 'The /farm-dining page.' },
  access: { read: () => true },
  fields: [
    {
      type: 'group',
      name: 'hero',
      label: 'Hero ("Dinner, Under Bamboo")',
      fields: [
        { name: 'badge', type: 'text' },
        { name: 'headline', type: 'text', required: true },
        { name: 'sub', type: 'textarea', required: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        {
          name: 'facts',
          type: 'array',
          minRows: 3,
          maxRows: 3,
          fields: [{ name: 'text', type: 'text', required: true }],
          admin: { description: 'e.g. "One seating nightly", "₹1,400 per person"' },
        },
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
      name: 'uniquePoints',
      label: 'What Makes It Unique',
      type: 'array',
      minRows: 4,
      maxRows: 4,
      fields: [
        { name: 'number', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
      ],
    },
    {
      name: 'experienceRows',
      label: 'The Experience (alternating rows)',
      type: 'array',
      minRows: 3,
      maxRows: 3,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'tagNumber', type: 'text', required: true },
        { name: 'tagLabel', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
      ],
    },
    {
      name: 'gallery',
      label: 'Gallery (bento grid)',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
        {
          name: 'sizeVariant',
          type: 'select',
          defaultValue: 'default',
          options: ['default', 'wide', 'tall'],
        },
      ],
    },
    {
      name: 'suitableFor',
      type: 'array',
      minRows: 4,
      maxRows: 4,
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
        { name: 'image', type: 'upload', relationTo: 'media' },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Featured card shows the image as a background; others show just an icon.' },
        },
      ],
    },
    {
      name: 'faqItems',
      label: 'FAQ (this page has its own short list, separate from the main /faqs page)',
      type: 'array',
      minRows: 6,
      maxRows: 6,
      fields: [
        { name: 'question', type: 'text', required: true },
        { name: 'answer', type: 'textarea', required: true },
      ],
    },
    {
      type: 'group',
      name: 'reserve',
      label: 'Reserve section',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'dateLabel', type: 'text', defaultValue: 'Date' },
        { name: 'partySizeLabel', type: 'text', defaultValue: 'How Many' },
        { name: 'dietaryLabel', type: 'text', defaultValue: 'Dietary Notes' },
        { name: 'submitLabel', type: 'text', defaultValue: 'Reserve Now' },
      ],
    },
  ],
}
