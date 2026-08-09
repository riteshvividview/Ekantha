/** The three info-row icons from Contact.html, kept as inline SVG so they
 *  inherit `stroke: var(--ink)` from contact.module.css's `.infoIcon svg`. */
export function InfoIcon({ icon }: { icon: 'phone' | 'email' | 'location' }) {
  if (icon === 'phone') {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M22,16.92v3a2,2 0 0,1-2.18,2 19.79,19.79 0 0,1-8.63-3.07 19.5,19.5 0 0,1-6-6 19.79,19.79 0 0,1-3.07-8.67A2,2 0 0,1 4.11,2h3a2,2 0 0,1 2,1.72c.13.96.36,1.9.7,2.81a2,2 0 0,1-.45,2.11L8.09,9.91a16,16 0 0,0 6,6l1.27-1.27a2,2 0 0,1 2.11-.45c.91.34 1.85.57 2.81.7A2,2 0 0,1 22,16.92z" />
      </svg>
    )
  }
  if (icon === 'email') {
    return (
      <svg viewBox="0 0 24 24">
        <path d="M4,4 H20 A2,2 0 0,1 22,6 V18 A2,2 0 0,1 20,20 H4 A2,2 0 0,1 2,18 V6 A2,2 0 0,1 4,4 Z" />
        <path d="M22,6 L12,13 L2,6" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24">
      <path d="M20.94,11 A8.94,8.94 0 1,1 12,2 A8.94,8.94 0 0,1 20.94,11 z" fill="none" />
      <path d="M21,10c0,7-9,13-9,13s-9-6-9-13a9,9 0 0,1 18,0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
