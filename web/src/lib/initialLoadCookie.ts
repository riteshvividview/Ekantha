// Shared between the (site) root layout (a server component, reads it via
// next/headers' cookies() to decide what to render into the initial HTML)
// and InitialLoadScreen (a client component, writes it once loading
// actually finishes) — a single source for the name so the two can't drift.
export const INITIAL_LOAD_COOKIE = 've-loaded'
