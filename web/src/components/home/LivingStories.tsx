'use client'

import { SylvaHero } from '@designcodeio/threeui'
import '@designcodeio/threeui/style.css'
import styles from './LivingStories.module.css'

export function LivingStories() {
  return (
    <section className={styles.section} id="living-stories" aria-label="Guest Stories & Testimonials">
      <div className={styles.shaderFrame}>
        <SylvaHero
          sourceUrl="/landing-pages/inner-green-testimonials.html?v=stories-cards-4"
          variant="living-green"
          headingFont="lexend"
          bodyFont="lexend"
          headingWeight="300"
          bodyWeight="300"
          primaryColor="#211f1c"
          headingSize={63}
          bodySize={16.5}
          headingLetterSpacing={-0.006}
        />
      </div>
    </section>
  )
}
