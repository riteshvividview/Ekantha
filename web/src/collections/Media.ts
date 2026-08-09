import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Describe the image — used for accessibility and shown if the image fails to load.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: {
        description: 'Optional caption, used by gallery-style sections that display a caption under the image.',
      },
    },
  ],
  upload: {
    // Supabase Storage (via the s3Storage plugin in payload.config.ts) takes
    // over from local disk once SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY are
    // set — imageSizes below are generated and stored there too.
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 900, height: 675, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
    mimeTypes: ['image/*'],
  },
}
