import type { GlobalConfig } from 'payload'

export const Contact: GlobalConfig = {
  slug: 'contact',
  admin: { description: 'The /contact page.' },
  access: { read: () => true },
  fields: [
    {
      type: 'group',
      name: 'info',
      label: 'Contact Information (hero + info rows + map)',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
        { name: 'intro', type: 'textarea', required: true },
        {
          name: 'rows',
          label: 'Info rows (Phone, Email, Property Location)',
          type: 'array',
          minRows: 3,
          maxRows: 3,
          fields: [
            {
              name: 'icon',
              type: 'select',
              required: true,
              options: [
                { label: 'Phone', value: 'phone' },
                { label: 'Email', value: 'email' },
                { label: 'Location', value: 'location' },
              ],
            },
            { name: 'label', type: 'text', required: true },
            { name: 'value', type: 'text', required: true },
            { name: 'href', type: 'text', admin: { description: 'e.g. tel:+919848012345 or mailto:hello@... — leave blank if not a link.' } },
            { name: 'note', type: 'textarea' },
          ],
        },
        { name: 'mapCaption', type: 'textarea' },
      ],
    },
    {
      type: 'group',
      name: 'form',
      label: 'Contact Form',
      fields: [
        { name: 'eyebrow', type: 'text', required: true },
        { name: 'heading', type: 'text', required: true },
        { name: 'intro', type: 'textarea', required: true },
        {
          type: 'row',
          fields: [
            { name: 'nameLabel', type: 'text', defaultValue: 'Your Name', admin: { width: '50%' } },
            { name: 'namePlaceholder', type: 'text', defaultValue: 'first and last name', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'contactLabel', type: 'text', defaultValue: 'Email Or Phone', admin: { width: '50%' } },
            { name: 'contactPlaceholder', type: 'text', defaultValue: "however you'd like us to reply", admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'subjectLabel', type: 'text', defaultValue: "What's This About", admin: { width: '50%' } },
            { name: 'subjectPlaceholder', type: 'text', defaultValue: 'e.g. a booking question, an event enquiry, press', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'messageLabel', type: 'text', defaultValue: 'Your Message', admin: { width: '50%' } },
            { name: 'messagePlaceholder', type: 'text', defaultValue: "tell us what you need, and we'll take it from there", admin: { width: '50%' } },
          ],
        },
        { name: 'submitLabel', type: 'text', defaultValue: 'Send Message →' },
        { name: 'submitNote', type: 'text', defaultValue: "We'll write back within 24 hours." },
      ],
    },
  ],
}
