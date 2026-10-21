import Image from 'next/image'
import { assetUrl } from '@/lib/assetUrl'
import styles from './StoryGalleryStrap.module.css'

export function StoryGalleryStrap() {
  return (
    <aside className={styles.strap} aria-label="Every stay leaves a story">
      <div className={styles.inner}>
        <span className={styles.rule} aria-hidden="true" />
        <p className={styles.copy}>
          <span className={styles.brand}>
            <Image className={styles.logo} src={assetUrl('/icon-mark.svg')} alt="" aria-hidden="true" width={18} height={18} unoptimized />
            <span className={styles.eyebrow}>Vana Ekantha</span>
          </span>
          <span className={styles.heading}>Every stay leaves a story.</span>
        </p>
        <span className={styles.rule} aria-hidden="true" />
      </div>
    </aside>
  )
}
