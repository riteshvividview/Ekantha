import type { GlobalConfig } from 'payload'

export const Events: GlobalConfig = {
  slug: 'events',
  admin: { description: 'The /events page.' },
  access: { read: () => true },
  fields: [
    {
      type: 'group',
      name: 'hero',
      fields: [
        { name: 'badge', type: 'text' },
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
        {
          name: 'marqueeItems',
          type: 'array',
          fields: [{ name: 'text', type: 'text', required: true }],
          admin: { description: 'Scrolling marquee labels, e.g. "Birthdays", "Corporate Events".' },
        },
      ],
    },
    {
      name: 'eventTypes',
      label: 'Events We Host',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'number', type: 'text', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    {
      name: 'venueFeatures',
      label: 'Venue Features',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'textarea', required: true },
      ],
    },
    {
      name: 'gallery',
      label: 'Event Gallery',
      type: 'array',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    {
      name: 'customisationGroups',
      label: 'Customisation Options',
      type: 'array',
      fields: [
        { name: 'groupNumber', type: 'text', required: true },
        { name: 'groupLabel', type: 'text', required: true },
        {
          name: 'chips',
          type: 'array',
          fields: [{ name: 'label', type: 'text', required: true }],
        },
      ],
    },
    {
      type: 'group',
      name: 'enquiryForm',
      label: 'Enquiry form field labels',
      fields: [
        { name: 'nameLabel', type: 'text', defaultValue: 'Your Name' },
        { name: 'eventTypeLabel', type: 'text', defaultValue: 'Event Type' },
        { name: 'guestCountLabel', type: 'text', defaultValue: 'Guest Count' },
        { name: 'preferredDateLabel', type: 'text', defaultValue: 'Preferred Date' },
        { name: 'reachLabel', type: 'text', defaultValue: 'How To Reach You' },
        { name: 'moreLabel', type: 'text', defaultValue: 'Tell Us More' },
        { name: 'submitLabel', type: 'text', defaultValue: 'Send Enquiry' },
      ],
    },
  ],
}
