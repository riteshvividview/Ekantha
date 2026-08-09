export function SectionHead({
  title,
  sub,
  eyebrow,
  dark,
}: {
  title: React.ReactNode
  sub?: React.ReactNode
  eyebrow?: string
  dark?: boolean
}) {
  return (
    <div className="section-head reveal">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 className="section-title" style={dark ? { color: 'var(--white)', marginTop: eyebrow ? '1rem' : 0 } : undefined}>
          {title}
        </h2>
      </div>
      {sub && <p>{sub}</p>}
    </div>
  )
}
