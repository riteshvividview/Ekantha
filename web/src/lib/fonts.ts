import localFont from 'next/font/local'

// The hero's big display title font — a licensed local file (not a Google/
// Fontshare CDN font like the rest of the type system), so it's loaded via
// next/font/local for subsetting + self-hosting rather than a <link> tag.
export const qalisten = localFont({
  src: '../fonts/Qalisten.otf',
  variable: '--font-qalisten',
  display: 'swap',
})

// The hero title's font-cycling effect (Hero.tsx) rotates through these six
// — five rustic/hand-lettered display faces plus Montserrat's heaviest cut
// — alongside Qalisten above. Each needs its own next/font/local
// registration (and its own CSS variable) since they're separate licensed
// files, not variants of one family.
export const chickenFarmhouse = localFont({
  src: '../fonts/CHICKEN FARMHOUSE.otf',
  variable: '--font-chicken-farmhouse',
  display: 'swap',
})
export const christmasFarmhouse = localFont({
  src: '../fonts/Christmas Farmhouse.otf',
  variable: '--font-christmas-farmhouse',
  display: 'swap',
})
export const farmhouseMonogram = localFont({
  src: '../fonts/Farmhouse Monogram.ttf',
  variable: '--font-farmhouse-monogram',
  display: 'swap',
})
export const fieldhouseRegular = localFont({
  src: '../fonts/Fieldhouse Regular.ttf',
  variable: '--font-fieldhouse',
  display: 'swap',
})
export const greenHouse = localFont({
  src: '../fonts/Green House.otf',
  variable: '--font-green-house',
  display: 'swap',
})
// A separate variable from the CDN-loaded Montserrat used for body text
// elsewhere (that one only requests weights 400–700) — this is the actual
// Black (900) cut, self-hosted, specifically for the title cycle.
export const montserratBlack = localFont({
  src: '../fonts/Montserrat-Black.ttf',
  variable: '--font-montserrat-black',
  display: 'swap',
})

// The ordered rotation Hero.tsx cycles the title through — CSS variable
// names, not the font-family strings themselves, so this list and the
// `next/font` registrations above can never drift out of sync.
export const HERO_TITLE_FONTS = [
  // First entry = the default shown before scroll starts the cycle, and
  // what it resets back to if you scroll all the way back to the top.
  'var(--font-qalisten)',
  'var(--font-christmas-farmhouse)',
  'var(--font-chicken-farmhouse)',
  'var(--font-farmhouse-monogram)',
  'var(--font-fieldhouse)',
  'var(--font-green-house)',
  'var(--font-montserrat-black)',
] as const

// Combined so the site root layout can put every variable's class on <body>
// in one spread, the same way it already does for `qalisten.variable`.
export const heroTitleFontVariables = [
  chickenFarmhouse.variable,
  christmasFarmhouse.variable,
  farmhouseMonogram.variable,
  fieldhouseRegular.variable,
  greenHouse.variable,
  montserratBlack.variable,
].join(' ')
