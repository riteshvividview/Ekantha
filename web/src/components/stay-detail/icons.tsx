export type HighlightIcon =
  | 'bed'
  | 'orchard'
  | 'verandah'
  | 'animals'
  | 'fireplace'
  | 'desk'
  | 'reading'
  | 'pond'
  | 'lawn'
  | 'kitchen'
  | 'event'
  | 'privacy'

export function HighlightIconSvg({ icon }: { icon: HighlightIcon }) {
  switch (icon) {
    case 'bed':
      return (
        <svg viewBox="0 0 48 48">
          <rect x="10" y="20" width="28" height="18" rx="2" />
          <path d="M15,20 L15,13 Q15,7 24,7 Q33,7 33,13 L33,20" />
        </svg>
      )
    case 'orchard':
      return (
        <svg viewBox="0 0 48 48">
          <path d="M24,40 L24,20" />
          <path d="M24,20 Q14,20 12,10 Q22,10 24,20 Z" />
          <path d="M24,24 Q34,24 36,14 Q26,14 24,24 Z" />
        </svg>
      )
    case 'verandah':
      return (
        <svg viewBox="0 0 48 48">
          <rect x="8" y="24" width="32" height="16" />
          <line x1="8" y1="24" x2="24" y2="10" />
          <line x1="40" y1="24" x2="24" y2="10" />
        </svg>
      )
    case 'animals':
      return (
        <svg viewBox="0 0 48 48">
          <circle cx="18" cy="18" r="5" />
          <path d="M18,23 Q18,32 24,34 Q30,32 30,23" />
          <circle cx="30" cy="18" r="5" />
        </svg>
      )
    case 'fireplace':
      return (
        <svg viewBox="0 0 48 48">
          <rect x="10" y="12" width="28" height="26" rx="2" />
          <path d="M24,17 C24,17 18,24 18,29 A6,6 0 0 0 30,29 C30,24 24,17 24,17 Z" />
        </svg>
      )
    case 'desk':
      return (
        <svg viewBox="0 0 48 48">
          <rect x="8" y="14" width="32" height="6" />
          <line x1="12" y1="20" x2="12" y2="38" />
          <line x1="36" y1="20" x2="36" y2="38" />
        </svg>
      )
    case 'reading':
      return (
        <svg viewBox="0 0 48 48">
          <path d="M24,12 Q16,8 8,10 L8,34 Q16,32 24,36 Q32,32 40,34 L40,10 Q32,8 24,12 Z" />
          <line x1="24" y1="12" x2="24" y2="36" />
        </svg>
      )
    case 'pond':
      return (
        <svg viewBox="0 0 48 48">
          <ellipse cx="24" cy="30" rx="16" ry="6" />
          <path d="M12,20 Q24,14 36,20" />
        </svg>
      )
    case 'lawn':
      return (
        <svg viewBox="0 0 48 48">
          <path d="M8,38 Q8,26 24,26 Q40,26 40,38" />
          <line x1="8" y1="38" x2="40" y2="38" />
        </svg>
      )
    case 'kitchen':
      return (
        <svg viewBox="0 0 48 48">
          <rect x="10" y="10" width="28" height="28" rx="2" />
          <line x1="10" y1="22" x2="38" y2="22" />
          <circle cx="18" cy="16" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="26" cy="16" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'event':
      return (
        <svg viewBox="0 0 48 48">
          <path d="M24,10 C24,10 12,22 12,30 A12,12 0 0 0 36,30 C36,22 24,10 24,10 Z" />
        </svg>
      )
    case 'privacy':
      return (
        <svg viewBox="0 0 48 48">
          <rect x="12" y="20" width="24" height="18" rx="2" />
          <path d="M17,20 L17,14 Q17,8 24,8 Q31,8 31,14 L31,20" />
        </svg>
      )
  }
}

export function badgeColorClass(color: 'green' | 'amber' | 'purple' | 'blue', styles: Record<string, string>) {
  return { green: styles.badgeGreen, amber: styles.badgeAmber, purple: styles.badgePurple, blue: styles.badgeBlue }[color]
}
