import type { GlobalConfig } from 'payload'

export const Home: GlobalConfig = {
  slug: 'home',
  admin: {
    description:
      'The / homepage. DRAFT SCHEMA — Home.html is the largest source file and this was written from partial context rather than a full section-by-section read. Treat these fields as a reasonable starting point; expect to adjust when the Home page is actually built.',
  },
  access: { read: () => true },
  fields: [
    {
      type: 'group',
      name: 'hero',
      fields: [
        { name: 'badge', type: 'text' },
        { name: 'headline', type: 'text', required: true },
        { name: 'sub', type: 'textarea' },
        { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
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
      name: 'staysTeaser',
      label: 'Stays teaser section',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'sub', type: 'textarea' },
        {
          name: 'featuredStays',
          type: 'relationship',
          relationTo: 'stays',
          hasMany: true,
          admin: { description: 'Which Stays documents to feature here, and in what order.' },
        },
      ],
    },
    {
      type: 'group',
      name: 'experience',
      label: 'Amenities / "Experience The Estate" section',
      fields: [
        { name: 'heading', type: 'text' },
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
      name: 'gallery',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    {
      type: 'group',
      name: 'finalCta',
      fields: [
        { name: 'heading', type: 'text' },
        { name: 'body', type: 'textarea' },
        { name: 'buttonLabel', type: 'text' },
        { name: 'buttonHref', type: 'text' },
      ],
    },
  ],
}
