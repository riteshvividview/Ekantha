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
import { StayOverview } from './src/globals/Stay'

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
  globals: [SiteSettings, Navigation, Footer, Home, About, Contact, Events, Faqs, FarmDining, StayOverview],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  // Cloudflare R2 is S3-compatible — files uploaded through the Media
  // collection land in an R2 bucket instead of local disk, so uploads behave
  // the same in dev and in production. Only activates once the R2_* vars are
  // actually set in .env; until then Payload falls back to local disk
  // storage for Media.
  plugins: [
    ...(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY
      ? [
          s3Storage({
            collections: {
              media: {
                // Without this, Payload builds file URLs against R2's
                // private S3 API endpoint (needs a signed request, not
                // fetchable by a plain <img> tag). The public dev URL
                // (or a custom domain, later) serves the same objects
                // over plain HTTPS instead.
                generateFileURL: ({ filename, prefix }) =>
                  `${process.env.R2_PUBLIC_URL}/${prefix ? `${prefix}/` : ''}${filename}`,
              },
            },
            bucket: process.env.R2_BUCKET_NAME || 'ekantha-media',
            config: {
              endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
              region: 'auto',
              credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
              },
              forcePathStyle: true,
            },
          }),
        ]
      : []),
  ],
})
