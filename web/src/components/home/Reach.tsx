'use client'

import { useEffect, useRef, useState } from 'react'
import type { Map as MapLibreMap, Marker, GeoJSONSource } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { gsap } from '@/lib/animations/gsap'
import { darkenStyle } from '@/lib/darkMapStyle'
import styles from './Reach.module.css'

// Free, key-less stack: MapLibre GL (BSD) + OpenFreeMap vector tiles +
// OSRM public routing + Nominatim place names.
const STYLE_PROXY = '/api/map-style'
const STYLE_CDN = 'https://tiles.openfreemap.org/styles/positron'
const STYLE_FALLBACK = '/maplibre/fallback-style.json'

// The farmhouse: Plus Code 62MM+82, Pittampally, Hyderabad, Telangana 508114.
// Decoded from the Plus Code (reference area Pittampally, 508114), so it is
// the exact point of that code, not an estimate.
const FARM = { lat: 17.23331, lng: 79.03256 }
const MAPS_LINK = 'https://maps.app.goo.gl/1PJsYW8sDpm6sf6HA'
const HYDERABAD = { lat: 17.385, lng: 78.4867, label: 'Hyderabad' }

type LngLat = [number, number]
interface Origin {
  lat: number
  lng: number
  label: string
}
interface RouteState {
  coords: LngLat[]
  cum: number[]
  total: number
  duration: number
  approximate: boolean
}
interface Engine {
  map: MapLibreMap
  maplibre: typeof import('maplibre-gl')
  route: RouteState | null
  head: Marker | null
  chips: Array<{ marker: Marker; at: number; shown: boolean }>
  markers: Marker[]
  fit: { center: LngLat; zoom: number } | null
  followZoom: number
  bearing: number
  token: number
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const ease = (t: number) => t * t * (3 - 2 * t)
const delta = (a: number, b: number) => ((b - a + 540) % 360) - 180 // shortest signed angle

function haversine(a: LngLat, b: LngLat) {
  const R = 6371000
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b[1] - a[1])
  const dLng = rad(b[0] - a[0])
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}
function bearingBetween(a: LngLat, b: LngLat) {
  const rad = (d: number) => (d * Math.PI) / 180
  const y = Math.sin(rad(b[0] - a[0])) * Math.cos(rad(b[1]))
  const x = Math.cos(rad(a[1])) * Math.sin(rad(b[1])) - Math.sin(rad(a[1])) * Math.cos(rad(b[1])) * Math.cos(rad(b[0] - a[0]))
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}
function decimate(coords: LngLat[], max: number) {
  if (coords.length <= max) return coords
  const step = (coords.length - 1) / (max - 1)
  return Array.from({ length: max }, (_, i) => coords[Math.round(i * step)])
}
function buildRoute(coords: LngLat[], duration: number, approximate: boolean): RouteState {
  const cum = [0]
  for (let i = 1; i < coords.length; i++) cum.push(cum[i - 1] + haversine(coords[i - 1], coords[i]))
  return { coords, cum, total: cum[cum.length - 1], duration, approximate }
}
function fallbackRoute(o: Origin): RouteState {
  const a: LngLat = [o.lng, o.lat]
  const b: LngLat = [FARM.lng, FARM.lat]
  const mid: LngLat = [(a[0] + b[0]) / 2 - (b[1] - a[1]) * 0.12, (a[1] + b[1]) / 2 + (b[0] - a[0]) * 0.12]
  const pts: LngLat[] = Array.from({ length: 81 }, (_, i) => {
    const t = i / 80
    return [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * mid[0] + t ** 2 * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * mid[1] + t ** 2 * b[1]]
  })
  const r = buildRoute(pts, 0, true)
  r.duration = (r.total / 1000 / 55) * 3600
  return r
}
async function fetchRoute(o: Origin): Promise<RouteState | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${o.lng},${o.lat};${FARM.lng},${FARM.lat}?overview=full&geometries=geojson`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error('route')
    const r = (await res.json()).routes?.[0]
    if (!r) throw new Error('no route')
    return buildRoute(decimate(r.geometry.coordinates as LngLat[], 260), r.duration, false)
  } catch {
    return null
  }
}
const fmtDuration = (sec: number) => {
  const m = Math.round(sec / 60)
  if (m < 60) return `${m} mins`
  const h = Math.floor(m / 60)
  return m % 60 ? `${h} hr ${m % 60} min` : `${h} hr`
}
const fmtKm = (m: number) => `${Math.round(m / 1000)} km`

const BEATS = [
  {
    icon: 'fa-road',
    kicker: 'The road begins',
    line: 'Leave the noise of the city behind.',
  },
  {
    icon: 'fa-tree',
    kicker: 'Open country',
    line: 'Highways give way to fields and old trees.',
  },
  {
    icon: 'fa-mountain-sun',
    kicker: 'Almost there',
    line: 'The horizon widens. The pace slows.',
  },
]

export function Reach() {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const mapElRef = useRef<HTMLDivElement>(null)
  const hudDistRef = useRef<HTMLSpanElement>(null)
  const hudTimeRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const engineRef = useRef<Engine | null>(null)
  const loadRouteRef = useRef<(o: Origin) => Promise<void>>(async () => {})
  const progressRef = useRef(0)
  const currentOrigin = useRef<Origin>(HYDERABAD)
  const locationRequested = useRef(false)

  const [origin, setOrigin] = useState<Origin>(HYDERABAD)
  const [summary, setSummary] = useState<{
    duration: string
    distance: string
    approximate: boolean
  } | null>(null)

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const mapEl = mapElRef.current
    if (!section || !stage || !mapEl) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const q = <T extends Element = HTMLElement>(sel: string) => Array.from(section.querySelectorAll<T>(sel))
    const cleanups: Array<() => void> = []
    let disposed = false

    const cameraPadding = () => {
      const w = mapEl.clientWidth
      const h = mapEl.clientHeight
      return w > 900
        ? { top: 0, bottom: 0, left: Math.round(w * 0.3), right: 0 }
        : { top: 0, bottom: Math.round(h * 0.34), left: 0, right: 0 }
    }

    let renderFrame = 0
    let pendingProgress = 0
    const renderFrameNow = (p: number) => {
      const e = engineRef.current
      if (!e || !e.route) return
      const { route, map } = e
      const r = clamp(p / 0.9, 0, 1)
      const at = (m: number): LngLat => {
        const target = clamp(m, 0, route.total)
        let lo = 0
        let hi = route.cum.length - 1
        while (lo < hi - 1) {
          const mid = (lo + hi) >> 1
          if (route.cum[mid] <= target) lo = mid
          else hi = mid
        }
        const f = clamp((target - route.cum[lo]) / (route.cum[hi] - route.cum[lo] || 1), 0, 1)
        const a = route.coords[lo]
        const b = route.coords[hi]
        return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)]
      }
      const target = r * route.total
      const pt = at(target)

      // Progressive line: every vertex behind the head, then the head itself.
      let idx = 0
      let hi = route.cum.length - 1
      while (idx < hi - 1) {
        const mid = (idx + hi) >> 1
        if (route.cum[mid] <= target) idx = mid
        else hi = mid
      }
      const drawn = route.coords.slice(0, idx + 1)
      drawn.push(pt)
      const src = map.getSource('route-prog') as GeoJSONSource | undefined
      src?.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: drawn },
      })
      e.head?.setLngLat(pt)
      // The car parks itself as it reaches the farmhouse pin.
      if (e.head) e.head.getElement().style.opacity = r > 0.985 ? '0' : '1'

      // Camera: chase the head looking down the road, then rise to frame the trip.
      const ahead = at(target + route.total * 0.05)
      const heading = bearingBetween(pt, ahead)
      e.bearing += delta(e.bearing, heading) * 0.16
      const t = ease(clamp((p - 0.9) / 0.1, 0, 1))
      const pad = cameraPadding()
      const fit = e.fit
      const center: LngLat = fit ? [lerp(pt[0], fit.center[0], t), lerp(pt[1], fit.center[1], t)] : pt
      map.jumpTo({
        center,
        zoom: fit ? lerp(e.followZoom, fit.zoom, t) : e.followZoom,
        bearing: e.bearing * (1 - t),
        pitch: 52 * (1 - t) + 12 * t,
        padding: {
          top: 0,
          right: 0,
          left: Math.round(pad.left * (1 - t * 0.4)),
          bottom: Math.round(pad.bottom * (1 - t * 0.4)),
        },
      } as Parameters<MapLibreMap['jumpTo']>[0])

      e.chips.forEach((chip) => {
        const passed = r >= chip.at
        if (passed && !chip.shown) {
          chip.marker.addTo(map)
          chip.shown = true
        } else if (!passed && chip.shown) {
          chip.marker.remove()
          chip.shown = false
        }
      })

      if (hudDistRef.current) hudDistRef.current.textContent = fmtKm(target)
      if (hudTimeRef.current) hudTimeRef.current.textContent = fmtDuration(route.duration * r)
      if (barRef.current) barRef.current.style.transform = `scaleX(${r})`
    }
    const render = (p: number) => {
      pendingProgress = p
      if (renderFrame) return
      renderFrame = window.requestAnimationFrame(() => {
        renderFrame = 0
        renderFrameNow(pendingProgress)
      })
    }

    // Framing for the final overview (and how far to zoom while chasing).
    const computeFit = (e: Engine) => {
      if (!e.route) return
      const b = new e.maplibre.LngLatBounds(e.route.coords[0], e.route.coords[0])
      e.route.coords.forEach((c) => b.extend(c))
      const pad = cameraPadding()
      const cam = e.map.cameraForBounds(b, {
        padding: {
          top: 110,
          bottom: 120 + pad.bottom,
          left: 60 + pad.left,
          right: 60,
        },
        bearing: 0,
        pitch: 0,
      })
      const fitZoom = cam?.zoom ?? 8
      const c = cam?.center as { lng: number; lat: number } | undefined
      e.fit = c ? { center: [c.lng, c.lat], zoom: fitZoom } : null
      e.followZoom = clamp(fitZoom + 2.6, 9, 12.4)
    }

    const loadRoute = async (o: Origin) => {
      const e = engineRef.current
      if (!e) return
      const token = ++e.token
      const { map, maplibre } = e
      const el = (cls: string, html: string) => {
        const d = document.createElement('div')
        d.className = cls
        d.innerHTML = html
        return d
      }
      const applyRoute = (route: RouteState) => {
        if (disposed || token !== e.token) return
        e.markers.forEach((m) => m.remove())
        e.chips.forEach((c) => c.marker.remove())
        e.markers = []
        e.chips = []
        e.route = route
        e.bearing = bearingBetween(route.coords[0], route.coords[Math.min(6, route.coords.length - 1)])

        const line = {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: route.coords },
        } as const
        ;(map.getSource('route-base') as GeoJSONSource).setData(line)
        ;(map.getSource('route-prog') as GeoJSONSource).setData({
          ...line,
          geometry: { type: 'LineString', coordinates: [route.coords[0], route.coords[0]] },
        })

        const start = route.coords[0]
        const end = route.coords[route.coords.length - 1]
        e.markers.push(
          new maplibre.Marker({
            element: el('vk-start', `<span class="vk-dot"></span><span class="vk-label">${o.label === 'Your location' ? 'You' : o.label}</span>`),
          }).setLngLat(start).addTo(map),
          new maplibre.Marker({
            element: el('vk-end', '<span class="vk-house"><i class="fa-solid fa-house-chimney"></i></span><span class="vk-label">Our Farmhouse</span>'),
            anchor: 'bottom',
          }).setLngLat(end).addTo(map),
        )
        e.head = new maplibre.Marker({
          element: el('vk-head', '<span class="vk-pulse"></span><span class="vk-car"><i class="fa-solid fa-car-side"></i></span>'),
        }).setLngLat(start).addTo(map)
        e.markers.push(e.head)

        computeFit(e)
        setSummary({ duration: fmtDuration(route.duration), distance: fmtKm(route.total), approximate: route.approximate })
        render(progressRef.current)
      }

      // Draw a route immediately so scrolling never waits for OSRM. Replace
      // it with the road geometry when the network route is ready.
      applyRoute(fallbackRoute(o))
      const route = await fetchRoute(o)
      if (disposed || token !== e.token) return
      if (route) applyRoute(route)

      // Name a few places along the way (best effort, rate-limited).
      if (route && !route.approximate) {
        for (const at of [0.22, 0.42, 0.62, 0.8]) {
          if (disposed || token !== e.token) return
          const [lng, lat] = route.coords[Math.round(at * (route.coords.length - 1))]
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&accept-language=en&lat=${lat}&lon=${lng}`,
            )
            if (res.ok) {
              const a = (await res.json()).address ?? {}
              const name: string | undefined = a.city || a.town || a.village || a.suburb || a.county || a.state_district
              if (name && !disposed && token === e.token) {
                const marker = new maplibre.Marker({
                  element: el('vk-place', `<span class="vk-chip"><i class="fa-solid fa-location-dot"></i>${name}</span>`),
                  anchor: 'left',
                  offset: [12, -18],
                }).setLngLat([lng, lat])
                e.chips.push({ marker, at, shown: false })
                render(progressRef.current)
              }
            }
          } catch {
            /* labels are optional */
          }
          await new Promise((r) => setTimeout(r, 1100))
        }
      }
    }
    loadRouteRef.current = loadRoute

    // Builds the map once; returns true on success, false on a failure
    // worth retrying (anything short of "WebGL genuinely unavailable").
    // Wrapped in a retry loop below — on localhost this sometimes fails on
    // the first attempt for transient reasons (most often several heavy
    // WebGL sections — this map, BambooDine's and the testimonials
    // section's own three.js scenes — all mounting/remounting close
    // together under Fast Refresh and briefly exceeding the browser's
    // concurrent-WebGL-context limit), and it reliably succeeds a moment
    // later once an earlier context's been GC'd.
    const attemptSetup = async (): Promise<boolean> => {
      let maplibre: typeof import('maplibre-gl')
      try {
        maplibre = await import('maplibre-gl')
        maplibre.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs')
      } catch {
        return false
      }
      if (disposed) return true // unmounted mid-setup — not a failure to retry

      // Try three style sources in order, stopping at the first success.
      let style: string | import('maplibre-gl').StyleSpecification = STYLE_FALLBACK
      for (const url of [STYLE_PROXY, STYLE_CDN]) {
        try {
          const res = await fetch(url, { signal: AbortSignal.timeout(6_000) })
          if (res.ok) {
            style = darkenStyle((await res.json()) as import('maplibre-gl').StyleSpecification)
            break
          }
        } catch {
          // try next URL
        }
      }
      if (disposed) return true

      let map: import('maplibre-gl').Map
      try {
        map = new maplibre.Map({
          container: mapEl,
          style,
          center: [(HYDERABAD.lng + FARM.lng) / 2, (HYDERABAD.lat + FARM.lat) / 2],
          zoom: 8,
          interactive: false,
          attributionControl: false,
          fadeDuration: 0,
        })
      } catch {
        // Most often a transient "couldn't create WebGL context" — retried
        // by the caller rather than given up on immediately.
        return false
      }

      // Suppress MapLibre's own error events (tile 404s, style fetch errors)
      // so they don't appear in the console as unhandled errors.
      map.on('error', () => {
        /* silenced — partial tile failures are non-fatal */
      })

      map.addControl(new maplibre.AttributionControl({ compact: true }), 'bottom-right')
      engineRef.current = {
        map,
        maplibre,
        route: null,
        head: null,
        chips: [],
        markers: [],
        fit: null,
        followZoom: 11,
        bearing: 0,
        token: 0,
      }

      // Race the 'load' event against a 12-second timeout so a dead tile
      // server never hangs the whole section indefinitely.
      const loaded = await Promise.race([
        new Promise<boolean>((res) => map.once('load', () => res(true))),
        new Promise<boolean>((res) => setTimeout(() => res(false), 12_000)),
      ])
      if (disposed) return true
      if (!loaded) {
        // Tear down the stuck instance before the caller retries — leaving
        // it in place would both leak its WebGL context and leave two maps
        // fighting over `engineRef`.
        map.remove()
        engineRef.current = null
        return false
      }

      try {
        const empty: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: [],
        }
        map.addSource('route-base', { type: 'geojson', data: empty })
        map.addSource('route-prog', { type: 'geojson', data: empty })
        map.addLayer({
          id: 'route-base',
          type: 'line',
          source: 'route-base',
          paint: {
            'line-color': 'rgba(246,236,220,0.35)',
            'line-width': 2.5,
            'line-dasharray': [1, 2.4],
          },
          layout: { 'line-cap': 'round' },
        })
        map.addLayer({
          id: 'route-glow',
          type: 'line',
          source: 'route-prog',
          paint: {
            'line-color': '#d3a566',
            'line-width': 16,
            'line-blur': 12,
            'line-opacity': 0.5,
          },
          layout: { 'line-cap': 'round', 'line-join': 'round' },
        })
        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route-prog',
          paint: { 'line-color': '#f0d49a', 'line-width': 4.5 },
          layout: { 'line-cap': 'round', 'line-join': 'round' },
        })
      } catch {
        // The canvas is already showing and correctly loaded at this point
        // — a layer-definition error isn't worth tearing the map down for.
        return true
      }

      const ro = new ResizeObserver(() => {
        map.resize()
        const e = engineRef.current
        if (e?.route) {
          computeFit(e)
          render(progressRef.current)
        }
      })
      ro.observe(mapEl)
      cleanups.push(() => ro.disconnect())

      try {
        await loadRoute(currentOrigin.current)
      } catch {
        /* route fetch is best-effort */
      }
      if (reduced) {
        progressRef.current = 1
        render(1)
      }
      return true
    }

    // Ask once on initial page load. A denied or unavailable location keeps
    // the default Hyderabad origin without interrupting the page.
    if (!locationRequested.current) {
      locationRequested.current = true
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const o: Origin = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'Your location' }
            currentOrigin.current = o
            setOrigin(o)
            void loadRouteRef.current(o)
          },
          () => {
            currentOrigin.current = HYDERABAD
          },
          { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 },
        )
      }
    }

    // MapLibre's WebGL work can compete with the rest of the homepage.
    // Start it shortly before the location section enters view.
    let mapStarted = false
    const startMap = () => {
      if (mapStarted || disposed) return
      mapStarted = true
      void (async () => {
        const MAX_ATTEMPTS = 5
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          if (disposed) return
          const ok = await attemptSetup()
          if (ok || disposed) return
          await new Promise((r) => setTimeout(r, 1500 * attempt))
        }
      })()
    }
    const mapObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          mapObserver.disconnect()
          startMap()
        }
      },
      { rootMargin: '700px 0px' },
    )
    mapObserver.observe(section)
    cleanups.push(() => mapObserver.disconnect())

    // Pin the map only while its route story plays, then release directly
    // into the next homepage section.
    const proxy = { p: 0 }
    let tl: gsap.core.Timeline | null = null
    const ctx = gsap.context(() => {
      if (reduced) return

      tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${Math.round(window.innerHeight * 1.5)}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
      tl.to(
        proxy,
        {
          p: 1,
          duration: 1,
          ease: 'none',
          onUpdate: () => {
            progressRef.current = proxy.p
            render(proxy.p)
          },
        },
        0,
      )

      const beat = (sel: string, from: number, to: number, fade = 0.05) => {
        const el = q(sel)
        tl!.fromTo(el, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: fade, ease: 'none' }, from)
        tl!.to(el, { autoAlpha: 0, y: -40, duration: fade, ease: 'none' }, to - fade)
      }
      // Hero title is on screen from the start, then lifts away.
      tl.to(q('[data-hero]'), { autoAlpha: 0, y: -50, duration: 0.06, ease: 'none' }, 0.1)
      beat('[data-beat="0"]', 0.17, 0.36)
      beat('[data-beat="1"]', 0.4, 0.6)
      beat('[data-beat="2"]', 0.64, 0.82)
      tl.fromTo(q('[data-arrival]'), { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.08, ease: 'none' }, 0.88)
      tl.to({}, { duration: 0.0001 }, 1)

      gsap.from(q('[data-in]'), {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: section, start: 'top 60%', once: true },
      })
    }, section)

    return () => {
      disposed = true
      cleanups.forEach((fn) => fn())
      if (renderFrame) window.cancelAnimationFrame(renderFrame)
      tl?.scrollTrigger?.kill(true)
      tl?.kill()
      ctx.revert()
      const e = engineRef.current
      e?.markers.forEach((m) => m.remove())
      e?.chips.forEach((c) => c.marker.remove())
      e?.map.remove()
      engineRef.current = null
    }
  }, [])

  const fromLabel = origin.label === 'Your location' ? 'You' : origin.label
  // Both buttons open the farmhouse's own Google Maps listing.
  const directions = MAPS_LINK
  const viewOnMaps = MAPS_LINK

  return (
    <section className={styles.reach} id="location" ref={sectionRef}>
      <div className={styles.stage} ref={stageRef}>
        <div className={styles.mapBox}>
          <div className={styles.map} ref={mapElRef} />
          <div className={styles.vignette} aria-hidden="true" />
        </div>

        <div className={styles.textStage}>
          {/* Top bar */}
          <div className={styles.top}>
            <p className={styles.eyebrow} data-in>
              <span className={styles.eyebrowDash} />
              Location
            </p>
          </div>

          <div className={styles.narrative}>
            {/* Opening title */}
            <div className={styles.hero} data-hero>
              <h2 className={styles.headline}>
                Easy to Reach,
                <br />
                Hard to <span className={styles.gold}>Leave.</span>
              </h2>
              <p className={styles.tag}>A peaceful escape, just a scenic drive away.</p>
              <span className={styles.cue}>
                <i className="fa-solid fa-arrow-down" aria-hidden="true" /> Scroll to follow the road
              </span>
            </div>

            {/* Captions that appear on the map as the car moves */}
            {BEATS.map((b, i) => (
              <div className={styles.beat} data-beat={i} key={b.kicker}>
                <span className={styles.kicker}>
                  <i className={`fa-solid ${b.icon}`} aria-hidden="true" />
                  {b.kicker}
                </span>
                <p className={styles.line}>{b.line}</p>
              </div>
            ))}

            {/* Arrival */}
            <div className={styles.arrival} data-arrival>
              <span className={styles.kicker}>
                <i className="fa-solid fa-house-chimney" aria-hidden="true" />
                You&apos;ve arrived
              </span>
              <p className={styles.arrivalTitle}>
                Welcome to <span className={styles.gold}>Vana Ekantha.</span>
              </p>
              <ul className={styles.stats}>
                <li>
                  <i className="fa-solid fa-car-side" aria-hidden="true" />
                  <span>
                    <strong>{summary ? summary.duration : '...'}</strong>
                    <small>
                      From {fromLabel}
                      {summary?.approximate ? ' (approx.)' : ''}
                    </small>
                  </span>
                </li>
                <li>
                  <i className="fa-solid fa-route" aria-hidden="true" />
                  <span>
                    <strong>{summary ? summary.distance : '...'}</strong>
                    <small>By road</small>
                  </span>
                </li>
                <li>
                  <i className="fa-solid fa-plane" aria-hidden="true" />
                  <span>
                    <strong>1.5 Hrs</strong>
                    <small>From airport</small>
                  </span>
                </li>
              </ul>
              <div className={styles.actions}>
                <a className={styles.directions} href={directions} target="_blank" rel="noopener noreferrer">
                  Get Directions
                  <span className={styles.directionsIcon} aria-hidden="true">
                    <i className="fa-solid fa-arrow-right" />
                  </span>
                </a>
                <a className={styles.maps} href={viewOnMaps} target="_blank" rel="noopener noreferrer">
                  <i className="fa-solid fa-location-dot" aria-hidden="true" />
                  View on Google Maps
                  <i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" />
                </a>
              </div>
              <p className={styles.privacy}>Pittampally, Hyderabad, Telangana 508114 &middot; 62MM+82</p>
            </div>
          </div>

          {/* Live trip progress */}
          <div className={styles.hud} data-in>
            <div className={styles.hudTop}>
              <span className={styles.hudPlace}>{fromLabel}</span>
              <span className={styles.hudLive}>
                <i className="fa-solid fa-route" aria-hidden="true" />
                <span ref={hudDistRef}>0 km</span>
                <i className="fa-regular fa-clock" aria-hidden="true" />
                <span ref={hudTimeRef}>0 mins</span>
              </span>
              <span className={styles.hudPlace}>Vana Ekantha</span>
            </div>
            <span className={styles.bar} aria-hidden="true">
              <span className={styles.barFill} ref={barRef} />
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
