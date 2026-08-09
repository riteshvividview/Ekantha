import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'bisque-lobster-585068.hostingersite.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
