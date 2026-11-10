import { resolveMedia as baseMedia, resolveMediaSize as baseMediaSize } from '@/lib/media'
import { assetUrl } from '@/lib/assetUrl'
import type { Media } from '@/payload-types'

// Inner pages only (the homepage keeps importing @/lib/media). The CMS still
// points at the seeded stock/Unsplash files, so each one is swapped here for a
// real estate photo, keyed by the stock file's name. Lives in code rather than
// the database so a git revert undoes it. Matched by what the photo shows, not
// its filename: gallery-preview-stone-* is Mango House, -mango-* is Stone House.
const REAL: Record<string, string> = {
  // Stay
  'large-house-with-large-front-porch-terrace-with-palm-trees-scaled': 'testimonials-mango-house-peaceful-tab',
  'relax-area-resort-scaled': 'events-preview-a-setting-for-every-occasion-3',
  'rural-view-catalonia-spain-scaled': 'events-preview-a-setting-for-every-occasion-4',
  'swimming-pool-blue-water-tropical-garden-with-sea-view-background-scaled': 'why-us-hrs-away-img',
  'outdoor-movie-is-hit-with-movie-scaled': 'story-background-image-night',
  'family-all-together-camping-garden-father-child-grill-food-divergence-scaled': 'events-preview-a-setting-for-every-occasion-1',
  'pool-table-with-pool-table-bar-with-two-stools-large-picture-wall-scaled': 'gallery-preview-stone-5',
  'aerial-view-rolling-green-vineyards-countryside-village-italy-scaled': 'why-us-hrs-away-img-two',
  'photo-1581217185422': 'gallery-preview-bamboo-thumb',
  'photo-1693038897766': 'why-us-hrs-away-img',
  'photo-1711048090278': 'testimonials-stories-tab',
  'photo-1564433517015': 'story-card-image-web-portrait',

  // Mango House
  'photo-1732472581875': 'reel-1',
  'double-bed-apartments-cozy-hotel-scaled': 'testimonials-mango-house-peaceful-tab',
  'photo-1523033904333': 'footer-memories-a-toast',
  'photo-1643081262278': 'gallery-preview-mango-thumb',
  'photo-1634746027343': 'why-us-throughtfully-planned-img',
  'photo-1596433904500': 'testimonials-mango-house-room-unhurried-tab',
  'photo-1528183429752': 'events-preview-inside-mango-house',
  'photo-1727706572437': 'gallery-preview-mango-2',
  'photo-1593264787646': 'testimonials-mango-house-room-peaceful-tab',
  'photo-1560819400': 'why-us-untouched-land-img',
  'photo-1720706439286': 'footer-memories-quiet-walks',
  'photo-1643719142162': 'events-preview-a-setting-for-every-occasion-2',
  'photo-1730485192112': 'why-us-just-for-you-img',
  'photo-1508333409359': 'gallery-preview-mango-3',
  'photo-1499281851221': 'testimonials-stories-tab',

  // Stone House
  'photo-1543393470': 'events-preview-a-setting-for-every-occasion-3',
  'photo-1585620089933': 'gallery-preview-stone-3',
  'photo-1535546204504': 'gallery-preview-stone-4',
  'photo-1647842446246': 'gallery-preview-mango-1',
  'photo-1524084848619': 'gallery-preview-bamboo-4',
  'photo-1604004235675': 'gallery-preview-bamboo-6',
  'photo-1768913651135': 'gallery-preview-mango-6',
  'photo-1728034261564': 'testimonials-second-stories-tab',
  'photo-1630579083524': 'gallery-preview-mango-4',
  'photo-1697462247864': 'gallery-preview-stone-3',
  'photo-1570626742839': 'gallery-preview-stone-4',
  'photo-1696814543693': 'story-background-image-night',
  'photo-1723571644513': 'story-background-image-day',
  'photo-1656483461011': 'gallery-preview-mango-5',
  'photo-1764451616600': 'story-card-image-web-portrait',
  'photo-1758274252296': 'footer-memories-together',
  'photo-1521022969448': 'reel-3',
  'photo-1664524169977': 'testimonials-pool-image-unhurried-tab',

  // Full House
  'tract-cherkassy-region-ukraine-scaled': 'events-preview-gatherings',
  'how-is-rich-people-have-supper-prepared-desk-waiting-food-visitors-evening-time-scaled': 'gallery-preview-bamboo-hero',
  'contemporary-house-interior-design-scaled': 'story-background-image-night',
  'high-quality-digital-image-wallpaper-scaled': 'why-us-untouched-land-img',
  'home-architecture-design-ranch-style-with-front-porch-scaled': 'gallery-preview-stone-hero',
  'sunset-scene-countryside-scaled': 'story-background-image-night',
  'park-with-pond-bushes-scaled': 'story-background-image-day',
  'group-young-indian-asian-people-is-having-lunch-breakfast-together-outdoor-settings-scaled': 'events-preview-main-big-image',
  'beautiful-jungle-party-decorations-scaled': 'events-preview-inside-mango-house',
  'jeju-island-korea-october-12-osulloc-tea-museum-is-f-scaled': 'events-preview-feature',
  'photorealistic-wooden-house-interior-with-timber-decor-furnishings-scaled': 'why-us-just-for-you-img',

  // Farm Dining
  a84f0b902109e5eb845eec51cf00c5fc: 'gallery-preview-bamboo-hero',
  'pexels-photo-33777987': 'reel-2',
  '1d0a0417': 'footer-memories-golden-hour',
  'pexels-photo-35383651': 'footer-memories-after-dark',
  'park-view-scaled': 'gallery-preview-bamboo-2',
  '9d8b96700ab5ffd2d2219840c047c523': 'gallery-preview-bamboo-1',
  ululi_ulula: 'story-background-image-night',
  'gravel-path-leading-through-lush-vegetable-garden-with-apricots-and-herbs-photo': 'footer-memories-after-dark',
  '81vpt9xDD5L': 'gallery-preview-bamboo-3',
  'starry-night-in-grassland': 'footer-memories-golden-hour',
  'anniversary-dinner-with-candlelit-ambiance-scaled': 'gallery-preview-bamboo-5',
  'interior-railroad-station': 'events-preview-main-big-image',

  // Events
  'beautiful-jungle-party-decorations-1-scaled': 'events-preview-a-setting-for-every-occasion-1',
  'aerial-view-beautiful-outdoor-wedding-ceremony-scaled': 'events-preview-a-setting-for-every-occasion-4',
  'beautiful-wedding-table-assortment-outside-scaled': 'gallery-preview-bamboo-5',
  'rose-flower-scaled': 'gallery-preview-bamboo-3',
  'full-shot-smiley-women-posing-together-scaled': 'story-card-image-web-portrait',
  'evening-image-5-scaled': 'events-preview-inside-mango-house',
  'evening-image-6-scaled': 'story-background-image-night',
  'evening-image-1-scaled': 'events-preview-main-big-image',
  'evening-image-2-scaled': 'events-preview-a-setting-for-every-occasion-2',
  'evening-image-3-scaled': 'events-preview-a-setting-for-every-occasion-3',
  'evening-image-4-scaled': 'reel-4',

  // About
  'beautiful-shot-few-trees-small-house-valley-cloudy-sky-scaled': 'why-us-hrs-away-img-two',
}

// Every photo below is only 500-900px (no larger original exists), so each
// is upgraded to a 1600-2400px photo of the same subject. Applied after REAL,
// so no low-resolution image can reach an inner page.
const HIRES: Record<string, string> = {
  'footer-memories-a-toast': 'reel-3',
  'footer-memories-together': 'events-preview-feature',
  'footer-memories-after-dark': 'story-background-image-night',
  'footer-memories-golden-hour': 'gallery-preview-bamboo-hero',
  'footer-memories-quiet-walks': 'reel-7',
  'gallery-preview-bamboo-1': 'reel-2',
  'gallery-preview-bamboo-2': 'gallery-preview-bamboo-hero',
  'gallery-preview-bamboo-3': 'events-preview-main-big-image',
  'gallery-preview-bamboo-4': 'reel-3',
  'gallery-preview-bamboo-5': 'gallery-preview-bamboo-hero',
  'gallery-preview-bamboo-6': 'events-preview-a-setting-for-every-occasion-1',
  'gallery-preview-bamboo-thumb': 'gallery-preview-bamboo-hero',
  'gallery-preview-mango-1': 'events-preview-a-setting-for-every-occasion-3',
  'gallery-preview-mango-2': 'testimonials-mango-house-room-unhurried-tab',
  'gallery-preview-mango-3': 'reel-7',
  'gallery-preview-mango-4': 'events-preview-occasions',
  'gallery-preview-mango-5': 'why-us-hrs-away-img',
  'gallery-preview-mango-6': 'events-preview-a-setting-for-every-occasion-1',
  'gallery-preview-mango-thumb': 'testimonials-pool-image-unhurried-tab',
  'gallery-preview-stone-3': 'reel-5',
  'gallery-preview-stone-4': 'events-preview-celebrations',
  'gallery-preview-stone-5': 'events-preview-detail',
}

function swap(url: string) {
  const name = decodeURIComponent(url.split('?')[0].split('/').pop() ?? '')
  // Media sizes append -WxH, and Unsplash ids carry a trailing hash.
  const key = name.replace(/\.[^.]+$/, '').replace(/-\d+x\d+$/, '')
  const mapped = REAL[key] ?? REAL[key.match(/^photo-\d+/)?.[0] ?? '']
  const real = mapped ? (HIRES[mapped] ?? mapped) : undefined
  return real ? assetUrl(`/images/site/${real}.jpg`) : url
}

export function resolveMedia(value: number | Media | null | undefined) {
  const media = baseMedia(value)
  return { ...media, url: swap(media.url) }
}

export function resolveMediaSize(value: number | Media | null | undefined, size: 'thumbnail' | 'card' | 'hero') {
  const media = baseMediaSize(value, size)
  return { ...media, url: swap(media.url) }
}
