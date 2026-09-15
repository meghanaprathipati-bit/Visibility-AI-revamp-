/**
 * Experience preview registry — add a screen + variations here, then provide
 * the matching fixture on that screen. The panel itself stays generic.
 *
 * Fixtures:
 *   ready                 — populated / happy path
 *   data-loading-failed   — fetch failed after setup
 *   setup-failed          — Actions empty / needs attention, no items yet
 */
const STORAGE_KEY = 'visibility-experience-preview-fixture'

export const LIVE_VARIATION = 'Live product flow'

const SCREEN_ALIASES = {
  'AI search': 'AI search overview',
  'SEO audit': 'SEO audit overview',
}

export const SCREEN_VARIATIONS = {
  'AI search overview': [
    LIVE_VARIATION,
    'Data Loading Failed',
    'Action Need Attention No Data',
  ],
  'SEO audit overview': [
    LIVE_VARIATION,
    'Data Loading Failed',
    'Action Need Attention No Data',
  ],
}

export const SCREEN_DASHBOARD_IDS = {
  'AI search overview': 'ai-search-overview',
  'SEO audit overview': 'seo-audit-overview',
}

export const VARIATION_FIXTURES = {
  [LIVE_VARIATION]: 'ready',
  'Live product': 'ready',
  'Data Loading Failed': 'data-loading-failed',
  'Action Need Attention No Data': 'setup-failed',
}

export function canonicalScreen(screen) {
  return SCREEN_ALIASES[screen] ?? screen
}

let currentFixture = 'ready'
let hydrated = false
const listeners = new Set()

function hydrateFixture() {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY)
    if (stored) currentFixture = stored
  } catch {
    /* ignore */
  }
}

export function getPreviewFixture() {
  hydrateFixture()
  return currentFixture
}

export function setPreviewFixture(next) {
  hydrateFixture()
  currentFixture = next || 'ready'
  try {
    window.sessionStorage.setItem(STORAGE_KEY, currentFixture)
  } catch {
    /* ignore */
  }
  listeners.forEach(fn => fn(currentFixture))
}

export function resetPreviewToLive() {
  setPreviewFixture('ready')
}

export function subscribePreviewFixture(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function screensInRegistry() {
  return Object.keys(SCREEN_VARIATIONS)
}

export function variationsForScreen(screen) {
  return SCREEN_VARIATIONS[canonicalScreen(screen)] ?? [LIVE_VARIATION]
}

export function fixtureForVariation(variation) {
  return VARIATION_FIXTURES[variation] ?? 'ready'
}

export function dashboardIdForScreen(screen) {
  return SCREEN_DASHBOARD_IDS[canonicalScreen(screen)]
}

export function applyExperiencePreview({ screen, variation, onNavigate }) {
  const fixture = fixtureForVariation(variation)
  const dashboardId = dashboardIdForScreen(screen)
  if (dashboardId) onNavigate?.(dashboardId)
  setPreviewFixture(fixture)
  if (typeof queueMicrotask === 'function') {
    queueMicrotask(() => setPreviewFixture(fixture))
  }
}

/** Internal/dev only — localhost, Vite dev, or ?preview=1 */
export function isExperiencePreviewEnabled() {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return Boolean(import.meta.env.DEV) || params.get('preview') === '1'
}
