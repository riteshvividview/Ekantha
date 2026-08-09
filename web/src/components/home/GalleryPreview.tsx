import type { Home } from '@/payload-types'
import { SectionHead } from '@/components/shared/SectionHead'
import { resolveMediaSize } from '@/lib/media'
import styles from './home.module.css'

export function GalleryPreview({ data }: { data: Home['galleryPreview'] }) {
  return (
    <section className="bg-silver" id="gallery">
      <SectionHead title={renderTitle(data.heading)} sub={data.sub} />

      <div className={styles.galleryGrid}>
        {(data.images ?? []).map((row, i) => {
          const media = resolveMediaSize(row.image, 'card')
          return (
            <div className={`${styles.galleryPlate} reveal`} key={row.id ?? i}>
              {media.url && <img src={media.url} alt={media.alt} loading="lazy" />}
            </div>
          )
        })}
      </div>

      {data.ctaHref && (
        <div className={`${styles.galleryCta} reveal`}>
          <a href={data.ctaHref} className="btn btn-ghost">
            {data.ctaLabel}
          </a>
        </div>
      )}
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
