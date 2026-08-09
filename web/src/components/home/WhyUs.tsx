import type { Home } from '@/payload-types'
import { SectionHead } from '@/components/shared/SectionHead'
import styles from './home.module.css'

const BADGE_CLASSES = [styles.badgeGreen, styles.badgeAmber, styles.badgePurple, styles.badgeBlue]

const ICON_PATHS = [
  // Nature
  <>
    <path d="M24,40 L24,20" />
    <path d="M24,20 Q14,20 12,10 Q22,10 24,20 Z" />
    <path d="M24,24 Q34,24 36,14 Q26,14 24,24 Z" />
  </>,
  // Privacy
  <>
    <rect x="12" y="20" width="24" height="18" rx="2" />
    <path d="M17,20 L17,13 Q17,7 24,7 Q31,7 31,13 L31,20" />
  </>,
  // Curated Experiences
  <>
    <circle cx="24" cy="24" r="16" />
    <path d="M18,24 L22,28 L30,18" />
  </>,
  // Close to Hyderabad
  <>
    <path d="M24,6 C24,6 12,18 12,27 A12,12 0 0 0 36,27 C36,18 24,6 24,6 Z" />
    <circle cx="24" cy="27" r="3" />
  </>,
]

export function WhyUs({ data }: { data: Home['whyUs'] }) {
  return (
    <section className="bg-silver" id="why">
      <SectionHead title={renderTitle(data.heading)} sub={data.sub} />

      <div className={styles.cardGrid4}>
        {(data.items ?? []).map((item, i) => (
          <div className={`${styles.cell} reveal`} key={item.id ?? i}>
            <span className={`${styles.cellBadge} ${BADGE_CLASSES[i % 4]}`}>{item.badgeLabel}</span>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--silver)',
                marginBottom: 'clamp(1.1rem, 2.5vw, 1.6rem)',
              }}
            >
              <svg
                viewBox="0 0 48 48"
                width="46%"
                height="46%"
                stroke="var(--ink)"
                fill="none"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {ICON_PATHS[i % ICON_PATHS.length]}
              </svg>
            </div>
            <div className={styles.cellTitle}>{item.title}</div>
            <div className={styles.cellBody}>{item.body}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function renderTitle(heading: string) {
  const words = heading.trim().split(' ')
  const last = words.pop()
  return (
    <>
      {words.join(' ')} <em>{last}</em>
    </>
  )
}
