/**
 * Canonical scan prompts — fixed prototype responses for known chip / chat prompts.
 * Replace with API routing in production.
 */

/** Marker appended to project-summary chat prompts — used for scan routing */
export const PROJECT_SUMMARY_PROMPT_MARKER = 'Help me decide what to tackle first based on this summary.'

export function isProjectSummaryPrompt(text) {
  return (text || '').includes(PROJECT_SUMMARY_PROMPT_MARKER)
}

/** Second quick-action chip — always shows the website SEO report */
export const SEO_SCAN_PROMPT =
  'Run website SEO — check health score, technical issues, page speed, and mobile readiness for my website'

/** First quick-action chip — always shows the GBP / listings report */
export const GBP_SCAN_PROMPT =
  'Run GBP, listings, and reviews scans for my business'

export function normalizeScanPrompt(text) {
  return (text || '').trim().replace(/\s+/g, ' ').toLowerCase()
}

export function isSeoScanPrompt(text) {
  const normalized = normalizeScanPrompt(text)
  if (normalized === normalizeScanPrompt(SEO_SCAN_PROMPT)) return true
  return (
    /\brun website seo\b/.test(normalized) ||
    (/\bwebsite\b/.test(normalized) && /\bseo\b/.test(normalized) && /\bcrawl|health score|page speed|mobile\b/.test(normalized))
  )
}

export function isGbpScanPrompt(text) {
  const normalized = normalizeScanPrompt(text)
  if (normalized === normalizeScanPrompt(GBP_SCAN_PROMPT)) return true
  return /\bgbp\b|\blistings\b|\breviews scans\b/.test(normalized)
}

/** Prompts that should auto-run a scan when a quick-action chip is clicked */
export function isAutoScanPrompt(text) {
  // AI visibility prompt is intentionally excluded — it runs scan then shows questions after
  return isSeoScanPrompt(text) || isGbpScanPrompt(text) || isGenericVisibilityScanPrompt(text)
}

function isGenericVisibilityScanPrompt(text) {
  const normalized = normalizeScanPrompt(text)
  return (
    /\baction plan\b|\bcompetitive analysis\b|\btrack performance\b|\bkeyword rankings\b/.test(normalized)
  )
}

/** Matches the "Check AI visibility" chip prompt */
export function isAiVisibilityPrompt(text) {
  const normalized = normalizeScanPrompt(text)
  return (
    /\bai search visibility\b|\bai visibility\b|\bchatgpt\b|\bperplexity\b|\bgemini\b|\bai overviews\b/.test(normalized)
  )
}

export function getCanonicalScanKind(text) {
  if (isSeoScanPrompt(text)) return 'seo'
  if (isGbpScanPrompt(text)) return 'gbp'
  return 'generic'
}

/** Returns the demo scenario kind for routing scans to their specific behavior */
export function getScanKindFromPrompt(text) {
  if (isProjectSummaryPrompt(text)) return 'project-summary'
  if (isGbpScanPrompt(text)) return 'gbp'
  if (isSeoScanPrompt(text)) return 'seo'
  const lower = normalizeScanPrompt(text)
  if (/\bai visibility\b|\bchatgpt\b|\bperplexity\b|\bgemini\b|\bai overviews?\b/.test(lower)) return 'ai-visibility'
  if (/\baction plan\b|\baeo\b|\bgeo strategy\b/.test(lower)) return 'ai-action-plan'
  return 'generic'
}
