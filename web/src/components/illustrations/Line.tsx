/**
 * Hand-drawn style line illustrations shared by the Events and About pages.
 * All strokes use currentColor so each section tints them through CSS; the
 * `--illo-accent` custom property colours the highlight strokes/fills.
 */
type P = { className?: string }

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}
const accent = { stroke: 'var(--illo-accent, #c9a46a)' }

/** Rolling hills, a rising sun, trees and a small farmhouse. */
export function Landscape({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 480 360" {...base}>
      <circle cx="330" cy="120" r="54" {...accent} />
      <circle cx="330" cy="120" r="74" {...accent} strokeDasharray="2 8" />
      <path d="M20 250 C 110 190, 180 200, 250 238 S 400 200, 460 226" />
      <path d="M20 290 C 120 250, 230 262, 300 286 S 420 270, 460 280" />
      <path d="M20 330 H 460" />
      {/* farmhouse */}
      <path d="M180 286 V 246 L 214 222 L 248 246 V 286" />
      <path d="M172 252 L 214 216 L 256 252" />
      <path d="M206 286 V 264 H 222 V 286" />
      <rect x="188" y="250" width="12" height="10" />
      <rect x="228" y="250" width="12" height="10" />
      {/* trees */}
      <path d="M90 300 V 250" />
      <path d="M90 214 C 62 222, 62 256, 90 258 C 118 256, 118 222, 90 214 Z" />
      <path d="M120 296 V 262" />
      <path d="M120 236 C 102 242, 102 266, 120 266 C 138 266, 138 242, 120 236 Z" />
      <path d="M380 290 V 236" />
      <path d="M380 190 L 352 244 H 408 Z" />
      <path d="M380 210 L 360 250 H 400 Z" />
      {/* birds */}
      <path d="M120 120 q 8 -8 16 0 q 8 -8 16 0" />
      <path d="M170 92 q 6 -6 12 0 q 6 -6 12 0" />
    </svg>
  )
}

/** A mango leaf sprig with a single fruit. */
export function MangoSprig({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 160 160" {...base}>
      <path d="M20 146 C 50 110, 80 70, 140 20" />
      <path d="M52 108 C 30 104, 18 86, 22 70 C 40 72, 54 88, 52 108 Z" />
      <path d="M78 76 C 92 58, 112 54, 124 60 C 114 76, 96 82, 78 76 Z" />
      <path d="M100 52 C 94 34, 98 18, 108 10 C 116 24, 112 40, 100 52 Z" />
      <path d="M66 92 C 74 112, 92 128, 108 124 C 118 110, 104 88, 84 86" {...accent} />
    </svg>
  )
}

/** Two clinking glasses with sparkles. */
export function Toast({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 160 160" {...base}>
      <path d="M44 40 L 66 44 L 62 84 C 60 96, 44 98, 38 88 Z" />
      <path d="M50 92 L 44 128 M 32 128 H 56" />
      <path d="M116 40 L 94 44 L 98 84 C 100 96, 116 98, 122 88 Z" />
      <path d="M110 92 L 116 128 M 104 128 H 128" />
      <path d="M44 60 L 64 63 M 116 60 L 96 63" {...accent} />
      <path d="M80 14 V 28 M 73 21 H 87" {...accent} />
      <path d="M58 18 L 62 26 M 102 18 L 98 26" {...accent} />
    </svg>
  )
}

/** A sealed envelope with a leaf-stamped wax seal. */
export function Envelope({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 200 150" {...base}>
      <rect x="16" y="28" width="168" height="106" rx="6" />
      <path d="M16 34 L 100 92 L 184 34" />
      <path d="M16 128 L 78 78 M 184 128 L 122 78" />
      <circle cx="100" cy="92" r="16" {...accent} />
      <path d="M92 98 C 96 88, 102 84, 108 84 C 106 92, 100 98, 92 98 Z" {...accent} />
      <path d="M150 14 q 8 -8 16 0 M 30 12 q 6 -6 12 0" />
    </svg>
  )
}

/** A small estate site plan: lawn, house, trees, parking, path. */
export function EstateMap({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 360 360" {...base}>
      <rect x="14" y="14" width="332" height="332" rx="18" strokeDasharray="3 6" />
      <path d="M40 300 C 90 260, 140 250, 180 190 S 260 110, 320 70" strokeDasharray="6 6" {...accent} />
      <ellipse cx="120" cy="120" rx="72" ry="52" />
      <text x="120" y="124" textAnchor="middle" fontSize="11" fill="currentColor" stroke="none" letterSpacing="2">LAWN</text>
      <rect x="210" y="180" width="90" height="62" rx="4" />
      <path d="M210 180 L 255 154 L 300 180" />
      <text x="255" y="216" textAnchor="middle" fontSize="11" fill="currentColor" stroke="none" letterSpacing="2">HOUSE</text>
      <rect x="40" y="226" width="92" height="56" rx="4" />
      <path d="M62 226 V 282 M 86 226 V 282 M 110 226 V 282" />
      <text x="86" y="300" textAnchor="middle" fontSize="10" fill="currentColor" stroke="none" letterSpacing="2">PARKING</text>
      {[ [240, 60], [280, 100], [60, 50], [310, 290], [190, 300] ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="14" />
          <circle cx={x} cy={y} r="5" />
        </g>
      ))}
      {/* compass */}
      <g transform="translate(310 320)">
        <path d="M0 -14 L 5 0 L 0 14 L -5 0 Z" {...accent} />
        <text x="0" y="-18" textAnchor="middle" fontSize="9" fill="currentColor" stroke="none">N</text>
      </g>
    </svg>
  )
}

/** Simple icon set for cards (48px box). */
export function Icon({ name, className }: P & { name: 'leaf' | 'moon' | 'path' | 'house' | 'music' | 'plate' | 'flower' | 'check' | 'cross' | 'quote' | 'star' }) {
  const d: Record<string, React.ReactNode> = {
    leaf: <><path d="M10 38 C 10 18, 22 8, 40 8 C 40 28, 30 40, 10 38 Z" /><path d="M10 38 L 30 18" {...accent} /></>,
    moon: <><path d="M32 8 A 16 16 0 1 0 40 36 A 13 13 0 0 1 32 8 Z" /><path d="M12 10 v4 M10 12 h4" {...accent} /></>,
    path: <><path d="M8 40 C 20 32, 14 24, 24 18 S 34 10, 40 8" strokeDasharray="3 4" /><circle cx="40" cy="8" r="3" {...accent} /></>,
    house: <><path d="M8 22 L 24 8 L 40 22" /><path d="M12 20 V 40 H 36 V 20" /><path d="M21 40 V 30 H 27 V 40" {...accent} /></>,
    music: <><path d="M18 34 V 10 L 38 6 V 30" /><circle cx="14" cy="34" r="4" {...accent} /><circle cx="34" cy="30" r="4" {...accent} /></>,
    plate: <><circle cx="24" cy="24" r="14" /><circle cx="24" cy="24" r="8" {...accent} /><path d="M4 10 V 38 M 44 10 V 38" /></>,
    flower: <><circle cx="24" cy="20" r="4" {...accent} /><path d="M24 16 C 20 6, 28 6, 24 16 M 28 20 C 38 16, 38 24, 28 20 M 24 24 C 28 34, 20 34, 24 24 M 20 20 C 10 24, 10 16, 20 20" /><path d="M24 26 V 42" /></>,
    check: <path d="M10 25 L 20 34 L 38 14" {...accent} />,
    cross: <path d="M14 14 L 34 34 M 34 14 L 14 34" />,
    quote: <path d="M8 30 C 8 18, 14 12, 22 10 M 26 30 C 26 18, 32 12, 40 10 M 8 30 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0 M 26 30 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0" {...accent} />,
    star: <path d="M24 6 L 28 20 L 42 24 L 28 28 L 24 42 L 20 28 L 6 24 L 20 20 Z" {...accent} />,
  }
  return (
    <svg className={className} viewBox="0 0 48 48" {...base}>
      {d[name]}
    </svg>
  )
}

/** Two speech bubbles (a question and an answer) beside a hanging lantern. */
export function Conversation({ className }: P) {
  return (
    <svg className={className} viewBox="0 0 420 320" {...base}>
      <path d="M40 60 H 230 a 18 18 0 0 1 18 18 V 150 a 18 18 0 0 1 -18 18 H 110 L 78 196 V 168 H 40 a 18 18 0 0 1 -18 -18 V 78 a 18 18 0 0 1 18 -18 Z" />
      <path d="M118 96 c 0 -14 26 -14 26 0 c 0 10 -13 10 -13 22" {...accent} />
      <circle cx="131" cy="134" r="1.8" {...accent} />
      <path d="M190 180 H 360 a 18 18 0 0 1 18 18 V 256 a 18 18 0 0 1 -18 18 H 330 V 300 L 300 274 H 190 a 18 18 0 0 1 -18 -18 V 198 a 18 18 0 0 1 18 -18 Z" />
      <path d="M206 212 H 340 M 206 232 H 320 M 206 252 H 290" />
      <path d="M350 0 V 40" />
      <path d="M336 40 H 364 L 370 52 V 96 L 364 108 H 336 L 330 96 V 52 Z" />
      <path d="M342 62 C 342 76, 358 76, 358 62 C 358 54, 350 50, 350 46 C 350 50, 342 54, 342 62 Z" {...accent} />
      <path d="M38 250 C 60 228, 76 214, 104 190" />
      <path d="M58 232 C 44 228, 38 216, 42 206 C 54 210, 60 220, 58 232 Z" />
      <path d="M80 212 C 86 200, 98 196, 106 198 C 102 210, 90 214, 80 212 Z" />
    </svg>
  )
}
