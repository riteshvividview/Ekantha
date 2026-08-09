export type SuitableIcon = 'couple' | 'family' | 'team' | 'celebration'

export function SuitableIconSvg({ icon }: { icon: SuitableIcon }) {
  switch (icon) {
    case 'couple':
      return (
        <svg viewBox="0 0 48 48">
          <circle cx="17" cy="18" r="6" />
          <circle cx="31" cy="18" r="6" />
          <path d="M8,38 Q8,28 17,28 Q26,28 26,38 M22,38 Q22,28 31,28 Q40,28 40,38" />
        </svg>
      )
    case 'family':
      return (
        <svg viewBox="0 0 48 48">
          <circle cx="24" cy="14" r="5" />
          <circle cx="12" cy="20" r="4" />
          <circle cx="36" cy="20" r="4" />
          <path d="M6,38 Q6,26 24,26 Q42,26 42,38" />
        </svg>
      )
    case 'team':
      return (
        <svg viewBox="0 0 48 48">
          <rect x="10" y="18" width="28" height="20" rx="2" />
          <path d="M18,18 L18,12 Q18,8 24,8 Q30,8 30,12 L30,18" />
        </svg>
      )
    case 'celebration':
      return (
        <svg viewBox="0 0 48 48">
          <path d="M24,10 C24,10 12,22 12,30 A12,12 0 0 0 36,30 C36,22 24,10 24,10 Z" />
        </svg>
      )
  }
}
