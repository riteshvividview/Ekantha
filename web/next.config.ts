import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'bisque-lobster-585068.hostingersite.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    // Next 16 only serves qualities explicitly listed here. 75 is the
    // default used across most of the site; 70/90/95 are used by the
    // Events carousel's thumbnails/full-size frames respectively.
    qualities: [60, 70, 75, 90, 95],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
