import type { GlobalConfig } from 'payload'

export const Faqs: GlobalConfig = {
  slug: 'faqs',
  admin: {
    description:
      'The /faqs page — 6 categories (Check-in & Checkout, Booking Policies, Farm Dining Bookings, Event Bookings, Add-Ons, Guest Capacity), each with its own Q&A list.',
  },
  access: { read: () => true },
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'sub', type: 'textarea' },
    {
      name: 'categories',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'number', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        {
          name: 'items',
          type: 'array',
          fields: [
            { name: 'question', type: 'text', required: true },
            { name: 'answer', type: 'textarea', required: true },
          ],
        },
      ],
    },
  ],
}
