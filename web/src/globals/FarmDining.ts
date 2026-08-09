import type { GlobalConfig } from 'payload'

export const FarmDining: GlobalConfig = {
  slug: 'farm-dining',
  admin: { description: 'The /farm-dining page.' },
  access: { read: () => true },
  fields: [
    {
      type: 'group',
      name: 'hero',
      label: 'Banner ("Dinner, Under Bamboo")',
      fields: [
        { name: 'badgeLabel', type: 'text', required: true },
        { name: 'badgeMonogram', type: 'text', required: true, defaultValue: 'VE' },
        { name: 'headline', type: 'text', required: true },
        { name: 'sub', type: 'textarea', required: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        {
          name: 'facts',
          type: 'array',
          minRows: 3,
          maxRows: 3,
          fields: [{ name: 'text', type: 'text', required: true }],
          admin: { description: 'e.g. "One seating, nightly", "₹1,400 per person, farm dinner"' },
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
      type: 'group',
      name: 'unique',
      label: 'What Makes It Unique',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
        { name: 'sub', type: 'text' },
        {
          name: 'items',
          type: 'array',
          minRows: 4,
          maxRows: 4,
          fields: [
            { name: 'number', type: 'text', required: true },
            { name: 'title', type: 'text', required: true },
            { name: 'body', type: 'textarea', required: true },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'experience',
      label: 'The Experience (alternating rows)',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
        {
          name: 'items',
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
      ],
    },
    {
      type: 'group',
      name: 'gallery',
      label: 'Gallery (bento grid)',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
        {
          name: 'items',
          type: 'array',
          minRows: 1,
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media', required: true },
            { name: 'caption', type: 'text' },
            {
              name: 'sizeVariant',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'Default', value: 'default' },
                { label: 'Wide', value: 'wide' },
                { label: 'Tall', value: 'tall' },
                { label: 'Wide + Tall', value: 'wideTall' },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'suitable',
      label: 'Suitable For (asymmetric bento)',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
        {
          name: 'items',
          type: 'array',
          minRows: 4,
          maxRows: 4,
          fields: [
            {
              name: 'icon',
              type: 'select',
              required: true,
              options: [
                { label: 'Date Nights', value: 'couple' },
                { label: 'Family Dinners', value: 'family' },
                { label: 'Team Gatherings', value: 'team' },
                { label: 'Celebrations', value: 'celebration' },
              ],
            },
            { name: 'title', type: 'text', required: true },
            { name: 'body', type: 'textarea', required: true },
            { name: 'image', type: 'upload', relationTo: 'media', admin: { description: 'Only shown on the featured card.' } },
            {
              name: 'featured',
              type: 'checkbox',
              defaultValue: false,
              admin: { description: 'The featured card is the large dark one, showing the image as a background.' },
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'faq',
      label: 'FAQ (this page has its own short list, separate from the main /faqs page)',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
        {
          name: 'items',
          type: 'array',
          minRows: 1,
          fields: [
            { name: 'question', type: 'text', required: true },
            { name: 'answer', type: 'textarea', required: true },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'reserve',
      label: 'Reserve Now CTA',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'dateLabel', type: 'text', defaultValue: 'date' },
        { name: 'datePlaceholder', type: 'text', defaultValue: '17 may' },
        { name: 'partySizeLabel', type: 'text', defaultValue: 'how many' },
        { name: 'partySizePlaceholder', type: 'text', defaultValue: '4 guests' },
        { name: 'dietaryLabel', type: 'text', defaultValue: 'dietary notes' },
        { name: 'dietaryPlaceholder', type: 'text', defaultValue: 'vegetarian, one nut allergy' },
        { name: 'submitLabel', type: 'text', defaultValue: 'reserve now →' },
        { name: 'note', type: 'textarea' },
      ],
    },
  ],
}
