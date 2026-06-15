import { SEO_SCAN_PROMPT, normalizeScanPrompt } from './scanPrompts.js'

/** Prompt chips — short label on chip; full prompt pasted on click; Send starts the scan (do not auto-submit on chip click) */
export const QUICK_ACTIONS = [
  {
    label: 'Audit GBP',
    prompt: 'Run GBP, listings, and reviews scans for your business name or Google Maps / GBP link',
  },
  {
    label: 'Crawl for SEO',
    prompt: SEO_SCAN_PROMPT,
  },
  {
    label: 'Check AI visibility',
    prompt: 'Check AI visibility for your brand or website URL — how it appears in ChatGPT, Perplexity, Gemini, and Google AI Overviews',
  },
  {
    label: 'AI action plan',
    prompt: 'Create a full SEO action plan covering local SEO, website SEO, AEO, and GEO strategy for my business',
  },
  {
    label: 'Analyze competitors',
    prompt: 'Run a competitive analysis for my website — compare rankings, backlinks, and content strategy against competitors',
  },
  {
    label: 'Track performance',
    prompt: 'Set up performance monitoring — track keyword rankings, traffic trends, local pack positions, and AI citations',
  },
]

export function getQuickActionLabelForPrompt(promptText) {
  const normalized = normalizeScanPrompt(promptText)
  return QUICK_ACTIONS.find(action => normalizeScanPrompt(action.prompt) === normalized)?.label ?? null
}
