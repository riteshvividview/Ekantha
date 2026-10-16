import type { Navigation } from '@/payload-types'
import { resolveMediaSize } from '@/lib/media'

export interface NavChild {
  label: string
  href: string
  sub: string
  tag: string
  icon: string
  image: string | null
}

export interface NavItem {
  key: string
  label: string
  href: string | null
  /** Present for dropdowns. */
  children?: NavChild[]
  /** Small caps heading above a dropdown's list. */
  heading?: string
  /** Optional "see everything" link shown under a dropdown's list. */
  all?: { label: string; href: string }
  /** Cursor-follow preview for plain links (CMS previewImage). */
  previewUrl?: string | null
}

// Presentational extras keyed by href — the CMS only stores label/href/image,
// so the short subtitle, tagline and icon that make the dropdown feel
// designed live here. Anything unknown falls back to sensible defaults.
const META: Record<string, { sub: string; tag: string; icon: string }> = {
  '/mango-house': { sub: 'Pool · Garden', tag: 'Spacious. Tranquil. Yours.', icon: 'fa-house-chimney' },
  '/stone-house': { sub: 'Private deck', tag: 'Warm stone. Quiet evenings.', icon: 'fa-mountain' },
  '/full-house': { sub: 'Best for large groups', tag: 'The whole estate, held for you.', icon: 'fa-people-roof' },
  '/farm-dining': { sub: 'Grown here, served at dusk', tag: 'Good food tastes better in nature.', icon: 'fa-utensils' },
  '/events': { sub: 'Weddings, gatherings, offsites', tag: 'A setting for every occasion.', icon: 'fa-champagne-glasses' },
}

// LOCAL NAV IMAGES — real estate photos for the mega-dropdown's thumbnails
// and feature panel, standing in until the CMS's own previewImage fields are
// filled in (same pattern as the other LOCAL_*_IMAGES overrides across the
// home page components). Falls back to the CMS image, then to the icon.
const LOCAL_IMAGES: Record<string, string> = {
  '/mango-house': '/images/home/09-gallery-preview/mango-1.jpg',
  '/stone-house': '/images/home/09-gallery-preview/stone-1.jpg',
  '/full-house': '/images/home/03-why-us/Hrs-away-img-two.png',
  '/farm-dining': '/images/home/09-gallery-preview/bamboo-hero.jpg',
  '/events': '/images/home/07-events-preview/a-setting-for-Every-Occasion-1.png',
}

// Standalone CMS links that read as "things to do" are grouped into one
// Experiences dropdown (when at least two of them are present), placed where
// the first of them sat.
const EXPERIENCE_HREFS = ['/farm-dining', '/events']

type Link = NonNullable<Navigation['primaryLinks']>[number]

const toChild = (label: string, href: string, imageSource: Link['previewImage']): NavChild => {
  const meta = META[href] ?? { sub: '', tag: '', icon: 'fa-leaf' }
  const image = LOCAL_IMAGES[href] ?? resolveMediaSize(imageSource, 'card').url ?? null
  return { label, href, ...meta, image }
}

export function buildNavModel(links: Link[]): NavItem[] {
  const experienceLinks = links.filter((l) => EXPERIENCE_HREFS.includes(l.href))
  const groupExperiences = experienceLinks.length >= 2
  const items: NavItem[] = []
  let experiencesPlaced = false

  links.forEach((link) => {
    const key = link.id ?? link.href

    if (groupExperiences && EXPERIENCE_HREFS.includes(link.href)) {
      if (!experiencesPlaced) {
        experiencesPlaced = true
        items.push({
          key: 'experiences',
          label: 'Experiences',
          href: null,
          heading: 'Experiences',
          children: experienceLinks.map((l) => toChild(l.label, l.href, l.previewImage)),
        })
      }
      return
    }

    if (link.submenu && link.submenu.length > 0) {
      const all = link.submenu.find((s) => s.href === link.href)
      items.push({
        key,
        label: link.label,
        href: link.href,
        heading: `Our ${link.label === 'Stay' ? 'Stays' : link.label}`,
        all: all ? { label: all.label, href: all.href } : undefined,
        children: link.submenu.filter((s) => s.href !== link.href).map((s) => toChild(s.label, s.href, s.image)),
      })
      return
    }

    items.push({
      key,
      label: link.label,
      href: link.href,
      previewUrl: resolveMediaSize(link.previewImage, 'card').url || null,
    })
  })

  return items
}

export function isItemActive(pathname: string, item: NavItem) {
  if (item.href && pathname === item.href) return true
  return item.children?.some((c) => c.href === pathname) ?? false
}
