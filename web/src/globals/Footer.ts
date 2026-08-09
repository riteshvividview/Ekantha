import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'footer',
  admin: {
    description:
      'The one shared footer used on every page (standardized from the richer Footer.html component — the 5 different per-page inline footers in the old HTML are retired).',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'group',
      name: 'ctaBanner',
      label: 'CTA banner ("Book Your Escape.")',
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
        { name: 'buttonLabel', type: 'text', required: true, defaultValue: 'Hold a Date' },
        { name: 'buttonHref', type: 'text', required: true, defaultValue: '/hold-a-date' },
      ],
    },
    {
      type: 'group',
      name: 'brand',
      fields: [
        { name: 'logo', type: 'upload', relationTo: 'media' },
        { name: 'tagline', type: 'text', required: true, defaultValue: 'A farmstay for intentional disconnection.' },
        { name: 'note', type: 'text' },
      ],
    },
    {
      name: 'quickLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    {
      name: 'contactInfo',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
        { name: 'isLink', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
        {
          name: 'platform',
          type: 'select',
          options: ['instagram', 'facebook', 'whatsapp', 'newsletter'],
        },
      ],
    },
    {
      name: 'legalLinks',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
    { name: 'copyrightText', type: 'text', required: true },
  ],
}
