/**
 * Action items seed data — replace with API response in production.
 */

import {
  getCanonicalScanKind,
  isGbpScanPrompt,
  isSeoScanPrompt,
} from './scanPrompts.js'

/** @type {Array<Object>} */
export const actionItems = [
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
  {
    id: '5',
    title: 'Link orphan pages so they can be crawled',
    priority: 'error',
    source: 'seo',
    autofix: false,
    manualFix: true,
    tags: ['Links'],
    affectedPages: 23,
    detailType: 'table',
    tableColumns: { page: 'Page', current: '', recommendation: 'Recommendation' },
    tableRows: [
      { page: 'ramada.9hf9h.com/spa', currentValue: '', recommendation: 'Add a link from homepage or nav menu' },
      { page: 'ramada.9hf9h.com/events', currentValue: '', recommendation: 'Add a link from homepage or footer' },
    ],
  },
  {
    id: '6',
    title: 'Resolve oversized images',
    priority: 'warning',
    source: 'seo',
    autofix: false,
    manualFix: true,
    tags: ['Images'],
    affectedPages: 2,
    detailType: 'table',
    tableColumns: { page: 'Page', current: 'Current value', recommendation: 'Recommendation' },
    tableRows: [
      { page: 'ramada.9hf9h.com/', currentValue: 'Review required', recommendation: 'Compress hero image. Target <200KB, use WebP.' },
      { page: 'ramada.9hf9h.com/rooms', currentValue: 'Review required', recommendation: 'Resize gallery images, lazy-load below the fold.' },
    ],
  },
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
  {
    id: 'seo-af-2',
    title: 'Include missing H1 tags on key templates',
    priority: 'error',
    source: 'seo',
    autofix: true,
    manualFix: false,
    tags: ['Headings'],
    affectedPages: 12,
    detailType: 'table',
    tableColumns: { page: 'Page', current: 'Current H1', recommendation: 'Recommended H1' },
    tableRows: [
      { page: 'ramada.9hf9h.com/rooms', currentValue: '(missing)', recommendation: 'Hotel rooms and suites | Ramada' },
      { page: 'ramada.9hf9h.com/dining', currentValue: '(missing)', recommendation: 'Dining and restaurant | Ramada' },
    ],
  },
  {
    id: 'seo-af-3',
    title: 'Add alt text to images missing descriptions',
    priority: 'warning',
    source: 'seo',
    autofix: true,
    manualFix: false,
    tags: ['Images'],
    affectedPages: 8,
    detailType: 'table',
    tableColumns: { page: 'Page', current: 'Images missing alt', recommendation: 'Recommendation' },
    tableRows: [
      { page: 'ramada.9hf9h.com/', currentValue: '3 images', recommendation: 'Add descriptive alt text for hero and gallery images' },
    ],
  },
  {
    id: 'seo-af-4',
    title: 'Fix broken internal links',
    priority: 'error',
    source: 'seo',
    autofix: true,
    manualFix: false,
    tags: ['Links'],
    affectedPages: 6,
    detailType: 'table',
    tableColumns: { page: 'Page', current: 'Broken link', recommendation: 'Recommendation' },
    tableRows: [
      { page: 'ramada.9hf9h.com/', currentValue: '/old-promotions', recommendation: 'Update link target to /offers' },
    ],
  },
  {
    id: 'seo-af-5',
    title: 'Optimize meta titles that are too short or too long',
    priority: 'warning',
    source: 'seo',
    autofix: true,
    manualFix: false,
    tags: ['Meta tags'],
    affectedPages: 4,
    detailType: 'table',
    tableColumns: { page: 'Page', current: 'Current title', recommendation: 'Recommended title' },
    tableRows: [
      { page: 'ramada.9hf9h.com/contact', currentValue: 'Contact', recommendation: 'Contact Ramada hotel — book or inquire today' },
    ],
  },
  {
    id: 'gbp-w-1',
    title: 'Business hours may be outdated on Google Business Profile',
    priority: 'warning',
    source: 'gbp',
    autofix: false,
    manualFix: true,
    tags: ['Hours'],
    detailType: 'single',
    fieldName: 'Business hours',
    currentValue: 'Mon–Fri 9am–5pm (last updated 2023)',
    recommendationLabel: 'Recommendation',
    recommendation: 'Verify holiday hours and update weekend availability to match your current schedule.',
  },
  {
    id: 'gbp-w-2',
    title: 'Add more photos to Google Business Profile',
    priority: 'warning',
    source: 'gbp',
    autofix: false,
    manualFix: true,
    tags: ['Photos'],
    detailType: 'single',
    fieldName: 'Photo count',
    currentValue: '4 photos',
    recommendationLabel: 'Recommendation',
    recommendation: 'Listings with 10+ photos get more engagement. Add exterior, interior, team, and product shots.',
  },
  {
    id: 'gbp-n-1',
    title: 'Enable messaging on Google Business Profile',
    priority: 'notice',
    source: 'gbp',
    autofix: true,
    manualFix: false,
    tags: ['Messaging'],
    detailType: 'single',
    fieldName: 'Messaging',
    currentValue: 'Disabled',
    recommendationLabel: 'Recommendation',
    recommendation: 'Turn on Google messaging so customers can reach you directly from search and Maps.',
  },
  {
    id: 'gbp-n-2',
    title: 'Add products or services to Google Business Profile',
    priority: 'notice',
    source: 'gbp',
    autofix: false,
    manualFix: true,
    tags: ['Services'],
    detailType: 'single',
    fieldName: 'Services',
    currentValue: '2 services listed',
    recommendationLabel: 'Recommendation',
    recommendation: 'Add your full service menu with descriptions and pricing where applicable.',
  },
  {
    id: 'seo-n-1',
    title: 'Add structured data for local business',
    priority: 'notice',
    source: 'seo',
    autofix: true,
    manualFix: false,
    tags: ['Schema'],
    affectedPages: 'site-wide',
    detailType: 'single',
    fieldName: 'Structured data',
    currentValue: 'Not detected',
    recommendationLabel: 'Recommendation',
    recommendation: 'Add LocalBusiness JSON-LD schema with name, address, phone, and opening hours.',
  },
  {
    id: 'seo-n-2',
    title: 'Consider enabling browser caching headers',
    priority: 'notice',
    source: 'seo',
    autofix: false,
    manualFix: true,
    tags: ['Performance'],
    affectedPages: 'site-wide',
    detailType: 'single',
    fieldName: 'Cache headers',
    currentValue: 'No cache-control set',
    recommendationLabel: 'Recommendation',
    recommendation: 'Set cache-control headers for static assets to improve repeat visit load times.',
  },
  {
    id: 'listing-e-1',
    title: 'Fix NAP inconsistency on Yelp listing',
    priority: 'error',
    source: 'listing',
    autofix: true,
    manualFix: false,
    tags: ['NAP'],
    detailType: 'single',
    fieldName: 'Name, address, phone',
    currentValue: 'Phone number mismatch',
    recommendationLabel: 'Recommendation',
    recommendation: 'Update Yelp listing phone to match your Google Business Profile and website.',
  },
  {
    id: 'listing-w-1',
    title: 'Update business hours on directory listings',
    priority: 'warning',
    source: 'listing',
    autofix: false,
    manualFix: true,
    tags: ['Hours'],
    detailType: 'single',
    fieldName: 'Business hours',
    currentValue: 'Out of date on 3 directories',
    recommendationLabel: 'Recommendation',
    recommendation: 'Sync hours across Yelp, Bing Places, and Apple Maps to match your current schedule.',
  },
  {
    id: 'listing-n-1',
    title: 'Add missing business description on Foursquare',
    priority: 'notice',
    source: 'listing',
    autofix: true,
    manualFix: false,
    tags: ['Description'],
    detailType: 'single',
    fieldName: 'Business description',
    currentValue: '(missing)',
    recommendationLabel: 'Recommendation',
    recommendation: 'Add a concise business description so directory users understand your services.',
  },
]

export const actionItemsGbp = actionItems.filter(i => i.source === 'gbp')
export const actionItemsSeo = actionItems.filter(i => i.source === 'seo')

// AI visibility action items — each has fixFlow:'subscription' for the 3-state CTA
export const AI_VISIBILITY_ITEMS = [
  {
    id: 'aiv-1',
    title: 'Add structured data markup to improve AI citations',
    priority: 'error',
    source: 'ai',
    fixFlow: 'subscription',
    tags: ['Schema markup'],
    detailType: 'single',
    fieldName: 'Schema status',
    currentValue: 'No structured data detected',
    recommendationLabel: 'Recommendation',
    recommendation: 'Add Organization, FAQPage, and HowTo JSON-LD schema so AI models can accurately cite your content.',
  },
  {
    id: 'aiv-2',
    title: 'Create AI-optimized FAQ content for ChatGPT discoverability',
    priority: 'error',
    source: 'ai',
    fixFlow: 'subscription',
    tags: ['Content'],
    detailType: 'single',
    fieldName: 'FAQ pages',
    currentValue: '0 FAQ pages found',
    recommendationLabel: 'Recommendation',
    recommendation: 'Publish at least 5 FAQ pages targeting questions your customers ask in ChatGPT and Perplexity.',
  },
  {
    id: 'aiv-3',
    title: 'Build authority backlinks to increase AI training-data inclusion',
    priority: 'warning',
    source: 'ai',
    fixFlow: 'subscription',
    tags: ['Authority'],
    detailType: 'single',
    fieldName: 'Domain authority',
    currentValue: 'DA 23 (low)',
    recommendationLabel: 'Recommendation',
    recommendation: 'Earn links from DA 50+ sources to raise the likelihood of AI models referencing your brand.',
  },
  {
    id: 'aiv-4',
    title: 'Claim and optimize your brand presence on Wikipedia / Wikidata',
    priority: 'warning',
    source: 'ai',
    fixFlow: 'subscription',
    tags: ['Brand'],
    detailType: 'single',
    fieldName: 'Wikipedia presence',
    currentValue: 'No Wikipedia entry found',
    recommendationLabel: 'Recommendation',
    recommendation: 'Create a Wikidata entry for your brand — AI models heavily cite Wikipedia as a source.',
  },
]

// Action plan items — locked behind paid plan
export const ACTION_PLAN_ITEMS = [
  {
    id: 'ap-1',
    title: 'Complete all 22 Google Business Profile fields for maximum local pack visibility',
    priority: 'error',
    source: 'gbp',
    locked: true,
    tags: ['Local SEO'],
    detailType: 'single',
    fieldName: 'GBP completeness',
    currentValue: '55% complete',
    recommendationLabel: 'Recommendation',
    recommendation: 'Fill all profile fields and publish 2 GBP posts per week to trigger local pack ranking boosts.',
  },
  {
    id: 'ap-2',
    title: 'Fix 5 critical technical SEO errors blocking Google crawl coverage',
    priority: 'error',
    source: 'seo',
    locked: true,
    tags: ['Technical SEO'],
    detailType: 'single',
    fieldName: 'Crawl errors',
    currentValue: '5 errors found',
    recommendationLabel: 'Priority fix',
    recommendation: 'Resolve redirect chains, fix broken internal links, and regenerate XML sitemap.',
  },
  {
    id: 'ap-3',
    title: 'Add structured data markup for AI Overviews and Generative Engine Optimization',
    priority: 'error',
    source: 'ai',
    locked: true,
    tags: ['GEO', 'Schema'],
    detailType: 'single',
    fieldName: 'GEO readiness',
    currentValue: 'No GEO signals found',
    recommendationLabel: 'Strategy',
    recommendation: 'Deploy FAQ, HowTo, and Speakable schema to be cited in Google AI Overviews and ChatGPT answers.',
  },
  {
    id: 'ap-4',
    title: 'Publish 10 AEO-optimized pages targeting AI search queries',
    priority: 'warning',
    source: 'ai',
    locked: true,
    tags: ['AEO', 'Content'],
    detailType: 'single',
    fieldName: 'AEO content',
    currentValue: '0 AEO-ready pages',
    recommendationLabel: 'Content plan',
    recommendation: 'Create answer-focused content targeting questions asked in Perplexity, ChatGPT, and AI Overviews.',
  },
  {
    id: 'ap-5',
    title: 'Build 15 high-authority backlinks to raise AI citation probability',
    priority: 'warning',
    source: 'ai',
    locked: true,
    tags: ['Link building'],
    detailType: 'single',
    fieldName: 'Backlink profile',
    currentValue: 'DA 23 — 12 referring domains',
    recommendationLabel: 'Strategy',
    recommendation: 'Target DA 50+ publications in your niche via digital PR and expert quote outreach.',
  },
  {
    id: 'ap-6',
    title: 'Set up weekly rank tracking for local, organic, and AI search positions',
    priority: 'notice',
    source: 'seo',
    locked: true,
    tags: ['Tracking'],
    detailType: 'single',
    fieldName: 'Rank monitoring',
    currentValue: 'No tracking configured',
    recommendationLabel: 'Setup guide',
    recommendation: 'Connect Google Search Console and configure AI citation alerts to measure plan progress.',
  },
]

/** Fixed action item sets for canonical prompts — same every run */
const CANONICAL_SEO_ACTION_ITEM_IDS = [
  // Website — 2 errors, 2 warnings, 1 notice
  '4',
  'seo-af-2',
  '6',
  '8',
  'seo-n-1',
  // GBP — 2 errors, 1 warning, 2 notices
  '1',
  'gbp-af-1',
  'gbp-w-1',
  'gbp-n-1',
  'gbp-n-2',
  // Listing — 1 error, 1 warning, 1 notice
  'listing-e-1',
  'listing-w-1',
  'listing-n-1',
]
const CANONICAL_GBP_ACTION_ITEM_IDS = ['1', '2', 'gbp-w-1', 'gbp-w-2', 'gbp-n-1', 'gbp-n-2']
const CANONICAL_GENERIC_ACTION_ITEM_IDS = ['1', '4', '6', 'gbp-w-1', '8', 'seo-n-1']

function cloneItem(item) {
  return {
    ...item,
    recommendation: item.recommendation ?? '',
    tableRows: item.tableRows?.map(r => ({ ...r })),
  }
}

function itemsByIds(ids) {
  return ids.map(id => actionItems.find(i => i.id === id)).filter(Boolean).map(cloneItem)
}

function shuffle(items) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Pick 1–2 items from a pool — prototype sampling; replace with API in production */
function pickOneOrTwo(pool) {
  if (pool.length === 0) return []
  const shuffled = shuffle(pool)
  const take = shuffled.length === 1 ? 1 : Math.random() < 0.5 ? 1 : 2
  return shuffled.slice(0, take)
}

function getPreferredSource(text) {
  const lower = (text || '').toLowerCase()
  if (/\bgbp\b|\blisting|\breview/.test(lower)) return 'gbp'
  if (/\bwebsite\b|\bseo\b|\bcrawl|\btechnical|\bpage speed|\bmobile/.test(lower)) return 'seo'
  return null
}

function poolForPriority(priority, preferredSource) {
  const byPriority = actionItems.filter(i => i.priority === priority)
  if (!preferredSource) return byPriority
  const preferred = byPriority.filter(i => i.source === preferredSource)
  return preferred.length > 0 ? preferred : byPriority
}

/** Canonical prompts return the same items every time; others sample 1–2 per category */
export function getActionItemsForPrompt(text, scanKind) {
  if (scanKind === 'ai-visibility') return AI_VISIBILITY_ITEMS.map(cloneItem)
  if (scanKind === 'ai-action-plan') return ACTION_PLAN_ITEMS.map(cloneItem)
  if (isSeoScanPrompt(text)) return itemsByIds(CANONICAL_SEO_ACTION_ITEM_IDS)
  if (isGbpScanPrompt(text)) return itemsByIds(CANONICAL_GBP_ACTION_ITEM_IDS)
  if (getCanonicalScanKind(text) === 'generic') return itemsByIds(CANONICAL_GENERIC_ACTION_ITEM_IDS)

  const preferredSource = getPreferredSource(text)
  return [
    ...pickOneOrTwo(poolForPriority('error', preferredSource)),
    ...pickOneOrTwo(poolForPriority('warning', preferredSource)),
    ...pickOneOrTwo(poolForPriority('notice', preferredSource)),
  ]
}
