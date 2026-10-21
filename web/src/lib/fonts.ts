import localFont from 'next/font/local'
import { Fraunces } from 'next/font/google'

// The hero's big display title font — a licensed local file (not a Google/
// Fontshare CDN font like the rest of the type system), so it's loaded via
// next/font/local for subsetting + self-hosting rather than a <link> tag.
export const qalisten = localFont({
  src: '../fonts/Qalisten.otf',
  variable: '--font-qalisten',
  display: 'swap',
})

// Clash Display / General Sans / Montserrat / Fraunces used to load via
// three render-blocking <link rel="stylesheet"> tags in the root layout
// (two third-party origins — Google Fonts, Fontshare — plus a connection
// each needed its own DNS/TLS round trip before first paint could start).
// next/font self-hosts and inlines all of these at build time instead, so
// there's no runtime request to either origin at all, blocking or not.

// Clash Display (Fontshare, free for commercial use) — downloaded once
// (scripts none; see the project's own notes on this being a one-off
// pull from Fontshare's API) rather than next/font/local pointing at a
// third-party URL, since that package only subsets true local files.
export const clashDisplay = localFont({
  src: [
    { path: '../fonts/clash-display/ClashDisplay-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/clash-display/ClashDisplay-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/clash-display/ClashDisplay-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/clash-display/ClashDisplay-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
})

// General Sans (Fontshare, free for commercial use).
export const generalSans = localFont({
  src: [
    { path: '../fonts/general-sans/GeneralSans-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/general-sans/GeneralSans-Medium.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/general-sans/GeneralSans-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/general-sans/GeneralSans-Bold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-body',
  display: 'swap',
})

// Montserrat — the full family already ships as local TTFs under
// src/fonts/ (used elsewhere for brand material), so this points at
// those directly instead of next/font/google re-downloading it; only the
// 4 weights globals.css's --font-mont actually declares (400/500/600/700)
// are registered, not the full 18-file family.
export const montserrat = localFont({
  src: [
    { path: '../fonts/Montserrat-Regular.ttf', weight: '400', style: 'normal' },
    { path: '../fonts/Montserrat-Medium.ttf', weight: '500', style: 'normal' },
    { path: '../fonts/Montserrat-SemiBold.ttf', weight: '600', style: 'normal' },
    { path: '../fonts/Montserrat-Bold.ttf', weight: '700', style: 'normal' },
  ],
  variable: '--font-mont',
  display: 'swap',
})

// Fraunces — a real Google Font, so next/font/google self-hosts it at
// build time directly (no local file to maintain). Every actual usage of
// --font-accent-italic in globals.css pairs it with `font-style: italic;
// font-weight: 400;` and nothing else, so that's the only variant
// registered — not the normal style or the 500/600 weights the original
// Google Fonts <link> requested "just in case".
export const fraunces = Fraunces({
  weight: '400',
  style: 'italic',
  subsets: ['latin'],
  variable: '--font-accent-italic',
  display: 'swap',
})
