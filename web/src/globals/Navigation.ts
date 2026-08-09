import type { GlobalConfig } from 'payload'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  admin: {
    description: 'The shared nav bar — logo, primary links (Stay has a dropdown), and the "Hold a Date" CTA.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'group',
      name: 'logo',
      fields: [
        { name: 'icon', type: 'upload', relationTo: 'media' },
        { name: 'wordmark', type: 'text', required: true, defaultValue: 'Vana Ekantha' },
      ],
    },
    {
      name: 'primaryLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
        {
          name: 'submenu',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'href', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'cta',
      fields: [
        { name: 'label', type: 'text', required: true, defaultValue: 'Hold a Date' },
        { name: 'href', type: 'text', required: true, defaultValue: '/hold-a-date' },
      ],
    },
  ],
}
