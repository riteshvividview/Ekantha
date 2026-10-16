// MapLibre GL v6 runs its tile-parsing in a module Web Worker. Next's
// bundler can't emit that worker correctly, so we serve the two worker files
// as plain static assets from /public/maplibre/ and point MapLibre at them
// with setWorkerUrl() (see components/home/Reach.tsx). Re-run automatically
// after every `npm install` so the files always match the installed version.
import { cpSync, mkdirSync, existsSync } from 'node:fs'

const from = 'node_modules/maplibre-gl/dist'
const to = 'public/maplibre'
if (!existsSync(from)) process.exit(0)
mkdirSync(to, { recursive: true })
for (const f of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) cpSync(`${from}/${f}`, `${to}/${f}`)
console.log('maplibre worker files copied to', to)
