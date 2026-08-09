import type { GlobalConfig } from 'payload'

export const Contact: GlobalConfig = {
  slug: 'contact',
  admin: { description: 'The /contact page.' },
  access: { read: () => true },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'intro', type: 'textarea', required: true },
    {
      name: 'infoRows',
      label: 'Info rows (Phone, Email, Property Location)',
      type: 'array',
      minRows: 3,
      maxRows: 3,
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'value', type: 'text', required: true },
        { name: 'href', type: 'text', admin: { description: 'Leave blank if not a link.' } },
        { name: 'note', type: 'text' },
      ],
    },
    { name: 'mapCaption', type: 'text' },
    {
      type: 'group',
      name: 'form',
      label: 'Contact form field labels',
      fields: [
        { name: 'nameLabel', type: 'text', defaultValue: 'Name' },
        { name: 'contactLabel', type: 'text', defaultValue: 'Email or Phone' },
        { name: 'subjectLabel', type: 'text', defaultValue: 'Subject' },
        { name: 'messageLabel', type: 'text', defaultValue: 'Message' },
        { name: 'submitLabel', type: 'text', defaultValue: 'Send Message' },
      ],
    },
  ],
}
