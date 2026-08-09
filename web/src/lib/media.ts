import type { Media } from '@/payload-types'

/**
 * Upload relationship fields come back as either a plain numeric ID (not
 * populated) or a full Media object (populated, which is what we always
 * want for rendering) depending on query depth. This narrows to the usable
 * shape and falls back to something render-safe if a field is somehow
 * still unpopulated, rather than throwing mid-render.
 */
export function resolveMedia(value: number | Media | null | undefined): { url: string; alt: string } {
  if (value && typeof value === 'object') {
    return { url: value.url ?? '', alt: value.alt ?? '' }
  }
  return { url: '', alt: '' }
}

export function resolveMediaSize(
  value: number | Media | null | undefined,
  size: 'thumbnail' | 'card' | 'hero',
): { url: string; alt: string } {
  if (value && typeof value === 'object') {
    const sized = value.sizes?.[size]?.url
    return { url: sized ?? value.url ?? '', alt: value.alt ?? '' }
  }
  return { url: '', alt: '' }
}
