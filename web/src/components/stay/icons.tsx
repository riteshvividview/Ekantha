export type WhyStayIcon = 'check' | 'pricing' | 'terms' | 'clock'

export function WhyStayIconSvg({ icon }: { icon: WhyStayIcon }) {
  switch (icon) {
    case 'check':
      return (
        <svg viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="16" />
          <path d="M18,24 L22,28 L30,18" />
        </svg>
      )
    case 'pricing':
      return (
        <svg viewBox="0 0 48 48">
          <path d="M24,8 L24,40" />
          <path d="M15,15 Q15,10 24,10 Q33,10 33,17 Q33,23 24,24 Q15,25 15,31 Q15,38 24,38 Q33,38 33,33" />
        </svg>
      )
    case 'terms':
      return (
        <svg viewBox="0 0 48 48">
          <rect x="10" y="12" width="28" height="24" rx="2" />
          <path d="M16,20 L32,20 M16,26 L28,26" />
        </svg>
      )
    case 'clock':
      return (
        <svg viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="16" />
          <path d="M24,16 L24,24 L30,28" />
        </svg>
      )
  }
}
