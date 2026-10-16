// The site's palette lives in CSS custom properties on :root (globals.css).
// Tweening these same properties on <body>, scrubbed to scroll, repaints
// every section at once: one continuous light <-> dark change with no hard
// block edges. Values mirror the :root tokens.
export const PAGE_LIGHT = {
  '--white': 'rgb(250, 240, 230)',
  '--silver': 'rgb(254, 248, 248)',
  '--ink': 'rgb(29, 29, 27)',
  '--ink-soft': 'rgba(29, 29, 27, 0.62)',
  '--ink-faint': 'rgba(29, 29, 27, 0.42)',
  '--line': 'rgba(29, 29, 27, 0.12)',
  '--line-strong': 'rgba(29, 29, 27, 0.22)',
}

export const PAGE_DARK = {
  '--white': 'rgb(24, 20, 17)',
  '--silver': 'rgb(34, 28, 23)',
  '--ink': 'rgb(244, 234, 217)',
  '--ink-soft': 'rgba(244, 234, 217, 0.66)',
  '--ink-faint': 'rgba(244, 234, 217, 0.44)',
  '--line': 'rgba(244, 234, 217, 0.14)',
  '--line-strong': 'rgba(244, 234, 217, 0.26)',
}

// How long the page takes to swap between light and dark once a section
// reaches its trigger line. Short on purpose: the change should feel instant.
export const THEME_SECONDS = 0.35
