import Link from 'next/link'
import { WireframeOrb } from '@/components/three/WireframeOrb'
import { RiveIcon } from '@/components/RiveIcon'

// Placeholder — the real Home page (built from Home.html + the `home`
// Payload global) is the first page in the page-by-page build queue.
// This just confirms the app boots and the full stack (Payload/Postgres,
// Lenis+GSAP, Theatre.js, Rive, React Three Fiber) is wired without errors.
export default function HomePlaceholder() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        textAlign: 'center',
        padding: 'var(--pad-y) var(--pad-x)',
      }}
    >
      <span className="eyebrow">setup in progress</span>
      <h1 className="display-xl">
        Vana <em>Ekantha</em>
      </h1>
      <p style={{ color: 'var(--ink-soft)', maxWidth: '46ch' }}>
        Next.js + Payload CMS scaffold is live. Pages are being rebuilt one at a time from the
        source HTML — this placeholder is replaced when the Home page is built.
      </p>
      <div style={{ width: 120, height: 120 }}>
        <WireframeOrb />
      </div>
      <RiveIcon
        fallback={
          <svg width="28" height="28" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="16" stroke="var(--ink)" strokeWidth="1.3" fill="none" />
          </svg>
        }
      />
      <Link href="/admin" className="btn btn-primary" style={{ marginTop: '1rem' }}>
        Open CMS admin →
      </Link>
    </main>
  )
}
