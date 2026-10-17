// Phase 2 (R2 migration): wraps a local /public path so it resolves against
// the R2 bucket instead, once that asset group has actually been uploaded
// and NEXT_PUBLIC_ASSET_BASE_URL is set. Falls back to the local path
// untouched if the env var isn't set, so this is safe to call everywhere.
const BASE = process.env.NEXT_PUBLIC_ASSET_BASE_URL

export function assetUrl(path: string): string {
  if (!BASE) return path
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`
}
