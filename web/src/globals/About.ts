import type { GlobalConfig } from 'payload'

export const About: GlobalConfig = {
  slug: 'about',
  admin: { description: 'The /about page.' },
  access: { read: () => true },
  fields: [
    {
      type: 'group',
      name: 'manifesto',
      label: 'Manifesto (hero)',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'headline', type: 'text', required: true },
        { name: 'sub', type: 'textarea', required: true },
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
      name: 'story',
      label: 'The Story Behind The Name',
      fields: [
        {
          name: 'wordGlosses',
          type: 'array',
          minRows: 2,
          maxRows: 2,
          fields: [
            { name: 'word', type: 'text', required: true },
            { name: 'translation', type: 'text', required: true },
          ],
        },
        { name: 'paragraphs', type: 'array', fields: [{ name: 'text', type: 'textarea', required: true }] },
      ],
    },
    {
      name: 'philosophy',
      label: 'Our Philosophy (3 slabs)',
      type: 'array',
      minRows: 3,
      maxRows: 3,
      fields: [
        { name: 'number', type: 'text', required: true },
        { name: 'word', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
      ],
    },
    {
      type: 'group',
      name: 'founder',
      label: "Founder's Note",
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'quote', type: 'textarea', required: true },
        { name: 'paragraphs', type: 'array', fields: [{ name: 'text', type: 'textarea', required: true }] },
        { name: 'signatureName', type: 'text', required: true },
        { name: 'signatureLocation', type: 'text' },
      ],
    },
    {
      type: 'group',
      name: 'different',
      label: 'What Makes Us Different',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
        {
          name: 'rows',
          label: 'Contrast rows',
          type: 'array',
          minRows: 5,
          maxRows: 5,
          fields: [
            { name: 'notText', type: 'text', required: true },
            { name: 'yesText', type: 'text', required: true },
          ],
        },
      ],
    },
    {
      type: 'group',
      name: 'overview',
      label: 'Estate Overview',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        {
          name: 'facts',
          type: 'array',
          minRows: 4,
          maxRows: 4,
          fields: [
            { name: 'number', type: 'text', required: true },
            { name: 'label', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
}
