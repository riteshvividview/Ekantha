import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  admin: {
    description: 'Site-wide defaults used for SEO tags and referenced across multiple pages.',
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: 'siteName', type: 'text', required: true, defaultValue: 'Vana Ekantha' },
    { name: 'defaultSeoTitle', type: 'text', required: true },
    { name: 'defaultSeoDescription', type: 'textarea', required: true },
    { name: 'defaultOgImage', type: 'upload', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', admin: { width: '33%' } },
        { name: 'email', type: 'text', admin: { width: '33%' } },
        { name: 'address', type: 'text', admin: { width: '34%' } },
      ],
    },
  ],
}
