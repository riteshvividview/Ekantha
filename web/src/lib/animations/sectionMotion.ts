import { gsap } from './gsap'

/** Section title rises out of a mask as it scrolls into view. Call inside a
 *  gsap.context / matchMedia so it's reverted with the section. */
export function riseTitle(section: HTMLElement) {
  const title = section.querySelector<HTMLElement>('.section-title')
  if (!title) return
  gsap.fromTo(
    title,
    { clipPath: 'inset(0% 0% 100% 0%)', yPercent: 40 },
    {
      clipPath: 'inset(0% 0% -20% 0%)',
      yPercent: 0,
      duration: 1.1,
      ease: 'power4.out',
      scrollTrigger: { trigger: title, start: 'top 88%', once: true },
    },
  )
}
