/** The six venue-feature icons from Events.html, kept as inline SVG so
 *  they inherit `stroke: var(--ink)` from events.module.css's `.ledgerIcon svg`. */
export type VenueIcon = 'lawns' | 'pavilion' | 'lighting' | 'parking' | 'catering' | 'stay'

export function LedgerIcon({ icon }: { icon: VenueIcon }) {
  switch (icon) {
    case 'lawns':
      return (
        <svg viewBox="0 0 48 48">
          <ellipse cx="24" cy="38" rx="18" ry="5" />
          <path d="M8,38 Q8,26 24,26 Q40,26 40,38" />
        </svg>
      )
    case 'pavilion':
      return (
        <svg viewBox="0 0 48 48">
          <path d="M8,38 L8,20 L24,10 L40,20 L40,38 Z" />
          <line x1="8" y1="38" x2="40" y2="38" />
        </svg>
      )
    case 'lighting':
      return (
        <svg viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="4" fill="currentColor" stroke="none" />
          <path d="M24,12 L24,4 M24,44 L24,36 M12,24 L4,24 M44,24 L36,24 M15,15 L9,9 M33,33 L39,39 M15,33 L9,39 M33,15 L39,9" />
        </svg>
      )
    case 'parking':
      return (
        <svg viewBox="0 0 48 48">
          <rect x="8" y="18" width="32" height="16" rx="2" />
          <circle cx="16" cy="38" r="3" />
          <circle cx="32" cy="38" r="3" />
        </svg>
      )
    case 'catering':
      return (
        <svg viewBox="0 0 48 48">
          <ellipse cx="24" cy="34" rx="16" ry="5" />
          <path d="M10,34 Q9,22 24,22 Q39,22 38,34" />
        </svg>
      )
    case 'stay':
      return (
        <svg viewBox="0 0 48 48">
          <rect x="10" y="18" width="28" height="18" rx="2" transform="translate(0,-2)" />
          <path d="M15,20 L15,13 Q15,7 24,7 Q33,7 33,13 L33,20" />
        </svg>
      )
  }
}
