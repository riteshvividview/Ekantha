import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'

import { Users } from './src/collections/Users'
import { Media } from './src/collections/Media'
import { Stays } from './src/collections/Stays'

import { SiteSettings } from './src/globals/SiteSettings'
import { Navigation } from './src/globals/Navigation'
import { Footer } from './src/globals/Footer'
import { Home } from './src/globals/Home'
import { About } from './src/globals/About'
import { Contact } from './src/globals/Contact'
import { Events } from './src/globals/Events'
import { Faqs } from './src/globals/Faqs'
import { FarmDining } from './src/globals/FarmDining'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname, 'src'),
    },
  },
  editor: lexicalEditor(),
  collections: [Users, Media, Stays],
  globals: [SiteSettings, Navigation, Footer, Home, About, Contact, Events, Faqs, FarmDining],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  // Supabase Storage is S3-compatible — files uploaded through the Media
  // collection land in a Supabase Storage bucket instead of local disk, so
  // uploads behave the same in dev and in production. Only activates once
  // SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY are actually set in .env; until
  // then Payload falls back to local disk storage for Media.
  plugins: [
    ...(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
      ? [
          s3Storage({
            collections: {
              media: true,
            },
            bucket: process.env.SUPABASE_STORAGE_BUCKET || 'media',
            config: {
              endpoint: `${process.env.SUPABASE_URL}/storage/v1/s3`,
              region: process.env.SUPABASE_STORAGE_REGION || 'ap-south-1',
              credentials: {
                accessKeyId: process.env.SUPABASE_SERVICE_ROLE_KEY,
                secretAccessKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
              },
              forcePathStyle: true,
            },
          }),
        ]
      : []),
  ],
})
