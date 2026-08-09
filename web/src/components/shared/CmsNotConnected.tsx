export function CmsNotConnected({ what }: { what: string }) {
  return (
    <div
      style={{
        padding: '3rem var(--pad-x)',
        textAlign: 'center',
        background: 'var(--silver)',
        color: 'var(--ink-soft)',
        fontFamily: 'var(--font-body)',
        fontSize: '0.9rem',
      }}
    >
      Couldn&apos;t load {what} from the CMS — check that <code>DATABASE_URI</code> in{' '}
      <code>web/.env</code> points at a real, seeded database.
    </div>
  )
}
