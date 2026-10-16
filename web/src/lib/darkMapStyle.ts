import type { StyleSpecification } from 'maplibre-gl'

/**
 * Recolours OpenFreeMap's free "positron" style into a warm dark map at
 * runtime (no API key, no paid tiles): background/land/roads/labels are
 * remapped by luminance; water and green areas get their own tints.
 * Browser-only: it uses a canvas to normalise any CSS colour string.
 */

type Kind = 'fill' | 'line' | 'text' | 'halo'

const PAINT_KINDS: Record<string, Kind> = {
  'background-color': 'fill',
  'fill-color': 'fill',
  'fill-outline-color': 'line',
  'line-color': 'line',
  'text-color': 'text',
  'text-halo-color': 'halo',
}

let ctx: CanvasRenderingContext2D | null | undefined
function parse(color: string): [number, number, number, number] | null {
  if (ctx === undefined) ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#010203'
  ctx.fillStyle = color
  const v = ctx.fillStyle
  if (v === '#010203') return null
  if (v.startsWith('#')) {
    return [parseInt(v.slice(1, 3), 16), parseInt(v.slice(3, 5), 16), parseInt(v.slice(5, 7), 16), 1]
  }
  const m = v.match(/rgba?\(([^)]+)\)/)
  if (!m) return null
  const [r, g, b, a] = m[1].split(',').map((n) => parseFloat(n))
  return [r, g, b, a ?? 1]
}

const tone = (t: number, tint: [number, number, number], a: number) => {
  const c = (k: number) => Math.round(Math.min(255, Math.max(0, t * 255 * k)))
  return `rgba(${c(tint[0])},${c(tint[1])},${c(tint[2])},${a})`
}
const WARM: [number, number, number] = [1.07, 1, 0.9]

function recolor(color: string, kind: Kind, layerId: string): string {
  const p = parse(color)
  if (!p) return color
  const [r, g, b, a] = p
  const y = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

  if (kind === 'fill') {
    if (/water/.test(layerId)) return tone(0.062, [0.72, 0.95, 1.2], a)
    if (/park|wood|grass|landcover/.test(layerId)) return tone(0.088, [0.86, 1.06, 0.82], a)
    return tone(0.05 + (1 - y) * 0.2, WARM, a)
  }
  if (kind === 'line') {
    if (/waterway/.test(layerId)) return tone(0.1, [0.72, 0.95, 1.2], a)
    return tone(0.06 + y * y * 0.2, WARM, a)
  }
  if (kind === 'text') return tone(0.62 + (1 - y) * 0.26, [1.05, 1, 0.9], a)
  return tone(0.05, WARM, Math.min(a, 0.85)) // halo
}

const looksLikeColor = (s: string) => /^(#|rgb|hsl)/i.test(s)

function convert(value: unknown, kind: Kind, layerId: string): unknown {
  if (typeof value === 'string') return looksLikeColor(value) ? recolor(value, kind, layerId) : value
  if (Array.isArray(value)) return value.map((v) => convert(v, kind, layerId))
  if (value && typeof value === 'object' && 'stops' in value) {
    const v = value as { stops: Array<[number, unknown]> }
    return { ...v, stops: v.stops.map(([z, c]) => [z, convert(c, kind, layerId)]) }
  }
  return value
}

export function darkenStyle(style: StyleSpecification): StyleSpecification {
  return {
    ...style,
    layers: style.layers.map((layer) => {
      const paint = (layer as { paint?: Record<string, unknown> }).paint
      if (!paint) return layer
      const next: Record<string, unknown> = { ...paint }
      for (const key of Object.keys(paint)) {
        const kind = PAINT_KINDS[key]
        if (kind) next[key] = convert(paint[key], kind, layer.id)
      }
      return { ...layer, paint: next } as typeof layer
    }),
  }
}
