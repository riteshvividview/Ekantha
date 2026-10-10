import localFont from 'next/font/local'

// The hero's big display title font — a licensed local file (not a Google/
// Fontshare CDN font like the rest of the type system), so it's loaded via
// next/font/local for subsetting + self-hosting rather than a <link> tag.
export const qalisten = localFont({
  src: '../fonts/Qalisten.otf',
  variable: '--font-qalisten',
  display: 'swap',
})
