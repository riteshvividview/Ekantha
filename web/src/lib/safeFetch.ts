/**
 * Wraps a Payload Local API call so that, until a real DATABASE_URI is
 * configured (see web/.env.example), pages degrade to a visible "CMS not
 * connected" placeholder instead of crashing the whole app. Once a real
 * Supabase connection is in .env and the content is seeded, every one of
 * these calls succeeds and this wrapper is invisible — it's purely a
 * development-time safety net, not a permanent fallback-content system
 * (no hardcoded duplicate copy lives here).
 */
export async function safeFetch<T>(fn: () => Promise<T>): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await fn()
    return { data, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[safeFetch] Payload call failed — is DATABASE_URI set in .env yet?', message)
    }
    return { data: null, error: message }
  }
}
