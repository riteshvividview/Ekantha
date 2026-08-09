import type { GlobalConfig } from 'payload'

export const Faqs: GlobalConfig = {
  slug: 'faqs',
  admin: {
    description:
      'The /faqs page — 6 categories (Check-in & Checkout, Booking Policies, Farm Dining Bookings, Event Bookings, Add-Ons, Guest Capacity), each with its own Q&A list.',
  },
  access: { read: () => true },
  fields: [
    { name: 'eyebrow', type: 'text', required: true },
    { name: 'heading', type: 'text', required: true },
    { name: 'sub', type: 'textarea' },
    { name: 'searchPlaceholder', type: 'text', defaultValue: 'Search a question — e.g. cancellation, capacity, menu' },
    {
      name: 'categories',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'slug',
          type: 'text',
          required: true,
          admin: { description: 'Anchor id for the rail link, e.g. "checkin" — no # or spaces.' },
        },
        { name: 'number', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
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
  ],
}
