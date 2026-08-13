'use client'

import { getProject, types } from '@theatre/core'

/**
 * Theatre.js project + sheet scaffold, reserved for hand-authored "idle
 * breathing" moments (e.g. a slow scale/rotate on the Home hero media)
 * per stack.md — GSAP/ScrollTrigger handles everything scroll-driven
 * (reveals, parallax), Theatre.js is only for the handful of moments
 * that benefit from being hand-keyframed on a timeline in the Studio GUI.
 *
 * IMPORTANT — this is inert until someone actually authors keyframes:
 * `@theatre/core` has no code-only way to set them, only the Studio GUI
 * does (see ../../../plugins usage below / TheatreStudioLoader). Until
 * then, `heroObject`'s values just sit at their `defaultValue`s and this
 * sheet does nothing visually — don't mistake the Studio panel showing up
 * in dev for a finished effect.
 *
 * Authoring flow:
 *   1. Run the dev server — the Studio panel appears (dev only).
 *   2. Select the "Hero" sheet → "Media Frame" object, scrub the
 *      timeline, set keyframes on scale/rotate for the breathing loop.
 *   3. Studio → Project menu → export project state as JSON.
 *   4. Save it as `src/lib/animations/theatre/hero-state.json` and pass
 *      it as the `state` option to `getProject()` below so the authored
 *      animation persists outside of Studio (i.e. in production).
 */
export const project = getProject('Vana Ekantha')

export const heroSheet = project.sheet('Hero')

export const heroMediaFrame = heroSheet.object('Media Frame', {
  scale: types.number(1, { range: [0.9, 1.1] }),
  rotate: types.number(0, { range: [-4, 4] }),
})

/**
 * Idle ambient glow behind the "Experience The Estate" pinned reel
 * (ExperienceReel.tsx) — a second hand-authorable accent, same inert-until-
 * keyframed deal as heroMediaFrame above. The reel's actual scroll-driven
 * motion (pin, horizontal track, per-card morph) is GSAP/ScrollTrigger —
 * Theatre.js has no scroll-scrubbing concept, it's strictly for authored,
 * time-based (or here, idle-looping) animation.
 */
export const experienceSheet = project.sheet('Experience Reel')

export const experienceGlow = experienceSheet.object('Ambient Glow', {
  intensity: types.number(0, { range: [0, 1] }),
})
