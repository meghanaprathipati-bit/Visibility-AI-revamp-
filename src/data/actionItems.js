/**
 * Action items seed data — replace with API response in production.
 * Each run includes ≥1 error per source (GBP, Website SEO) and a mix of
 * manual fix, meta tags, and auto-fix so implement flow is always testable.
 */

/** @typedef {'error' | 'warning' | 'notice'} Priority */
/** @typedef {'gbp' | 'seo'} Source */
/** @typedef {'table' | 'single'} DetailType */

/**
 * @typedef {Object} TableRow
 * @property {string} page
 * @property {string} currentValue
 * @property {string} recommendation
 */

/**
 * @typedef {Object} ActionItem
 * @property {string} id
 * @property {string} title
 * @property {Priority} priority
 * @property {Source} source
 * @property {boolean} autofix
 * @property {boolean} manualFix
 * @property {number | 'site-wide'} [affectedPages]
 * @property {string[]} tags
 * @property {DetailType} detailType
 * @property {TableRow[]} [tableRows]
 * @property {{ page: string, current: string, recommendation: string }} [tableColumns]
 * @property {string} [fieldName]
 * @property {string} [currentValue]
 * @property {string} [recommendationLabel]
 * @property {string} [recommendation]
 */

/** @type {ActionItem[]} — full audit: both sources, manual + meta tags + auto-fix */
export const actionItems = [
  // GBP — manual fix errors
  {
    id: '1',
    title: 'Add appointment URL to Google Business Profile',
    priority: 'error',
    source: 'gbp',
    autofix: false,
    manualFix: true,
    tags: [],
    detailType: 'single',
    fieldName: 'Appointment URL',
    currentValue: '(missing)',
    recommendationLabel: 'Recommendation',
    recommendation:
      'Add a direct booking link so customers can schedule from your Google profile. Example: https://yourbusiness.com/book',
  },
  {
    id: '2',
    title: 'Add business description to Google Business Profile',
    priority: 'error',
    source: 'gbp',
    autofix: false,
    manualFix: true,
    tags: [],
    detailType: 'single',
    fieldName: 'Business description',
    currentValue: '(missing)',
    recommendationLabel: 'AI-suggested description',
    recommendation:
      'Explore Ramada: Your Premier Destination for Comfort and Convenience. Experience world-class hospitality with modern amenities, spacious rooms, and exceptional service.',
  },
  // GBP — auto-fix error
  {
    id: 'gbp-af-1',
    title: 'Update primary business category on Google Business Profile',
    priority: 'error',
    source: 'gbp',
    autofix: true,
    manualFix: false,
    tags: ['Categories'],
    detailType: 'single',
    fieldName: 'Primary category',
    currentValue: 'Hotel (generic)',
    recommendationLabel: 'Recommendation',
    recommendation: 'Set primary category to "Hotel" with secondary "Conference center" for better local discovery.',
  },
  // Website SEO — auto-fix + meta tags error
  {
    id: '4',
    title: 'Fix duplicate title tags',
    priority: 'error',
    source: 'seo',
    autofix: true,
    manualFix: false,
    tags: ['Meta tags'],
    affectedPages: 5,
    detailType: 'table',
    tableColumns: { page: 'Page', current: 'Current title', recommendation: 'Recommended title' },
    tableRows: [
      { page: 'ramada.9hf9h.com/', currentValue: 'Ramada Hotel', recommendation: 'Ramada Hotel — Comfort & Convenience' },
      { page: 'ramada.9hf9h.com/rooms', currentValue: 'Ramada Hotel', recommendation: 'Hotel Rooms & Suites | Ramada' },
      { page: 'ramada.9hf9h.com/dining', currentValue: 'Ramada Hotel', recommendation: 'Dining & Restaurant | Ramada' },
    ],
  },
  // Website SEO — manual + links (no auto-fix)
  {
    id: '5',
    title: 'Link orphan pages so they can be crawled',
    priority: 'error',
    source: 'seo',
    autofix: false,
    manualFix: false,
    tags: ['Links'],
    affectedPages: 23,
    detailType: 'table',
    tableColumns: { page: 'Page', current: '', recommendation: 'Recommendation' },
    tableRows: [
      { page: 'ramada.9hf9h.com/spa', currentValue: '', recommendation: 'Add a link from homepage or nav menu' },
      { page: 'ramada.9hf9h.com/events', currentValue: '', recommendation: 'Add a link from homepage or footer' },
    ],
  },
  // Website SEO — warning + images
  {
    id: '6',
    title: 'Resolve oversized images',
    priority: 'warning',
    source: 'seo',
    autofix: false,
    manualFix: false,
    tags: ['Images'],
    affectedPages: 2,
    detailType: 'table',
    tableColumns: { page: 'Page', current: 'Current value', recommendation: 'Recommendation' },
    tableRows: [
      { page: 'ramada.9hf9h.com/', currentValue: 'Review required', recommendation: 'Compress hero image. Target <200KB, use WebP.' },
      { page: 'ramada.9hf9h.com/rooms', currentValue: 'Review required', recommendation: 'Resize gallery images, lazy-load below the fold.' },
    ],
  },
  // Website SEO — auto-fix warning
  {
    id: '7',
    title: 'XML sitemap not found',
    priority: 'warning',
    source: 'seo',
    autofix: true,
    manualFix: false,
    tags: ['Sitemaps'],
    affectedPages: 'site-wide',
    detailType: 'single',
    fieldName: 'Issue',
    currentValue: 'No sitemap at /sitemap.xml',
    recommendationLabel: 'Recommendation',
    recommendation: 'Generate a complete XML sitemap and submit it to Google Search Console.',
  },
  // Website SEO — auto-fix + meta tags warning
  {
    id: '8',
    title: 'Missing meta description',
    priority: 'warning',
    source: 'seo',
    autofix: true,
    manualFix: false,
    tags: ['Meta tags'],
    affectedPages: 1,
    detailType: 'table',
    tableColumns: { page: 'Page', current: 'Current value', recommendation: 'Recommended description' },
    tableRows: [
      {
        page: 'ramada.9hf9h.com/',
        currentValue: '(missing)',
        recommendation: "Discover Ramada's exceptional services and book your stay today!",
      },
    ],
  },
]

/**
 * GBP audit — ≥1 GBP error (manual + auto-fix).
 * Replace with API keyed by scan type in production.
 */
export const actionItemsGbp = [
  actionItems.find(i => i.id === '1'),
  actionItems.find(i => i.id === '2'),
  actionItems.find(i => i.id === 'gbp-af-1'),
]

/**
 * Website SEO audit — ≥1 SEO error with meta tags + auto-fix + manual mix.
 * Replace with API keyed by scan type in production.
 */
export const actionItemsSeo = [
  actionItems.find(i => i.id === '4'),
  actionItems.find(i => i.id === '5'),
  actionItems.find(i => i.id === '8'),
  actionItems.find(i => i.id === '7'),
]

/** Pick action items by scan intent — always includes manual, meta tags, and auto-fix where applicable */
export function getActionItemsForPrompt(text) {
  const lower = (text || '').toLowerCase()
  if (/\bgbp\b|\blisting|\breview/.test(lower)) return actionItemsGbp
  if (/\bwebsite\b|\bseo\b|\bcrawl|\btechnical|\bpage speed|\bmobile/.test(lower)) return actionItemsSeo
  return actionItems
}
