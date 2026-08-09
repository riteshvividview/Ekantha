/**
 * The dark "tell us when, and we'll hold a date" banner + form that
 * appears, near-identically, at the bottom of every page (Home, FullHouse,
 * MangoHouse, StoneHouse, Stay, Events, FarmDining all have their own copy
 * of this exact pattern in the source HTML). Built once, shared, and
 * parameterized by the handful of fields that actually differ per page.
 */
export function FinalCtaBanner({
  id = 'reserve',
  eyebrow,
  heading,
  whenLabel,
  whenPlaceholder,
  whoLabel,
  whoPlaceholder,
  howLongLabel,
  howLongPlaceholder,
  submitLabel,
  note,
}: {
  id?: string
  eyebrow?: string | null
  heading: React.ReactNode
  whenLabel?: string | null
  whenPlaceholder?: string | null
  whoLabel?: string | null
  whoPlaceholder?: string | null
  howLongLabel?: string | null
  howLongPlaceholder?: string | null
  submitLabel?: string | null
  note?: string | null
}) {
  return (
    <section className="bg-black final-cta" id={id}>
      {eyebrow && <span className="eyebrow reveal">{eyebrow}</span>}
      <h2 className="section-title reveal" style={{ color: 'var(--white)', marginTop: '1rem' }}>
        {heading}
      </h2>

      <form
        className="final-row reveal"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <div className="final-field">
          <span className="label">{whenLabel}</span>
          <input type="text" placeholder={whenPlaceholder ?? undefined} />
        </div>
        <div className="final-field">
          <span className="label">{whoLabel}</span>
          <input type="text" placeholder={whoPlaceholder ?? undefined} />
        </div>
        <div className="final-field">
          <span className="label">{howLongLabel}</span>
          <input type="text" placeholder={howLongPlaceholder ?? undefined} />
        </div>
        <button type="submit" className="btn btn-on-dark final-cta-btn">
          {submitLabel}
        </button>
      </form>

      {note && (
        <p className="final-note reveal" style={{ whiteSpace: 'pre-line' }}>
          {note}
        </p>
      )}
    </section>
  )
}
