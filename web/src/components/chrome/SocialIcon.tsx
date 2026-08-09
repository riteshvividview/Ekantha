const ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.6" fill="var(--ink)" stroke="none" />
    </>
  ),
  facebook: <path d="M14,21 L14,13 L17,13 L17.5,9.5 L14,9.5 L14,7.5 Q14,6 15.5,6 L17.5,6 L17.5,3 Q16.5,2.9 15,2.9 Q11.5,2.9 11.5,7 L11.5,9.5 L9,9.5 L9,13 L11.5,13 L11.5,21" />,
  whatsapp: (
    <>
      <path d="M6,18 L7,14.5 A7,7 0 1 1 9.5,17 Z" />
      <path d="M9.3,9.8 Q9.6,9 10.4,9.3 Q11,9.6 11.2,10.3 Q11.4,11 11,11.5 Q11.6,12.6 12.7,13.1 Q13.2,12.7 13.9,12.9 Q14.6,13.1 14.8,13.7 Q15,14.6 14.2,15 Q12.4,15.8 10.6,14.4 Q9,13.1 8.6,11.3 Q8.4,10.3 9.3,9.8 Z" />
    </>
  ),
  newsletter: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M4,7 L12,13 L20,7" />
    </>
  ),
}

export function SocialIcon({ platform }: { platform?: string | null }) {
  const icon = platform ? ICONS[platform] : null
  if (!icon) return null
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icon}
    </svg>
  )
}
