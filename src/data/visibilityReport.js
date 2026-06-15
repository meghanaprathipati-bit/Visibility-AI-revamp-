/** Dummy detailed report data — replace with API response in production */

import { getScanTypeLabel } from './scanSummary.js'

/** @typedef {{ label: string, value: string }} ReportMetric */
/** @typedef {{ attribute: string, details: string }} SnapshotRow */
/** @typedef {{ issue: string, impact: string, priority: 'High' | 'Medium' | 'Low', action: string }} ReportActionRow */

const GBP_REPORT_TEMPLATE = {
  title: 'Visibility AI analysis: Optimizing your local SEO',
  tags: ['Google Business Profile', 'Local directories', 'Reviews platforms'],
  sectionTitle: 'Local SEO',
  sourceLabel: 'Google Business Profile',
  profile: {
    businessName: 'Ethnic Premium Salon — ADCS Layout',
    location: 'Bengaluru, Karnataka, India',
    healthScore: 55,
    rating: 4.5,
    reviewCount: 11372,
    sentiment: 'Mixed-positive',
    metrics: [
      { label: 'Profile health', value: '15/22' },
      { label: 'Last updated', value: '2024-08-28' },
      { label: 'Q&A', value: '375 answered' },
      { label: 'Response rate', value: '50%', sub: '2.3 days' },
      { label: 'Images', value: '8' },
      { label: 'Videos', value: '7' },
    ],
    missingTasks: [
      'Appointment URL',
      'Menu/services link',
      'Business description (detailed)',
      'Products',
      'Service area',
      'Opening date',
    ],
  },
  profileSnapshot: [
    { attribute: 'Rating', details: '4.5 / 5.0' },
    { attribute: 'Reviews', details: '11372' },
    { attribute: 'Category', details: 'Salon' },
    { attribute: 'Phone number', details: 'Not specified' },
    { attribute: 'Website', details: 'Not provided' },
  ],
  actionItemsTable: [
    {
      issue: 'Missing appointment URL',
      impact: 'High',
      priority: 'High',
      action: 'Add booking link so customers can schedule directly from your profile.',
    },
    {
      issue: 'Missing menu/services link',
      impact: 'High',
      priority: 'High',
      action: 'Detail services with descriptions and pricing where applicable.',
    },
    {
      issue: 'Missing business description',
      impact: 'Medium',
      priority: 'Medium',
      action: 'Add a detailed business description highlighting specialties and differentiators.',
    },
    {
      issue: 'Missing products',
      impact: 'Medium',
      priority: 'Medium',
      action: 'Add product details with photos to improve discovery in local search.',
    },
    {
      issue: 'Missing service area',
      impact: 'Medium',
      priority: 'Medium',
      action: 'Define service area so Google can match you to nearby searches.',
    },
    {
      issue: 'Missing opening date',
      impact: 'Low',
      priority: 'Low',
      action: 'Add opening date to strengthen trust and profile completeness.',
    },
  ],
  topActions: [
    'Add appointment URL and menu/services link to your Google Business Profile.',
    'Write a detailed business description that highlights your salon specialties.',
    'Upload at least 10 high-quality photos covering interior, exterior, and services.',
  ],
  upsellText:
    'Want more insights? I can also run a website SEO scan and an AI & LLM visibility scan to see how discoverable your brand is across ChatGPT, Perplexity, and Google.',
  promptActions: [
    'Complete missing profile fields: Appointment URL',
    'Run website SEO scan',
    'Run AI & LLM visibility scan',
  ],
}

const SEO_REPORT_TEMPLATE = {
  title: 'Visibility AI analysis: Optimizing your website SEO',
  tags: ['Website SEO', 'Technical audit', 'Page performance'],
  sectionTitle: 'Website SEO',
  sourceLabel: 'Website crawl',
  profile: {
    businessName: 'newmodernhotel.com',
    location: 'Primary domain · 47 pages crawled',
    healthScore: 62,
    rating: null,
    reviewCount: null,
    sentiment: 'Needs attention',
    metrics: [
      { label: 'SEO health', value: '62/100' },
      { label: 'Last crawled', value: '2024-08-28' },
      { label: 'Indexed pages', value: '41/47' },
      { label: 'Page speed', value: '58%', sub: 'Mobile' },
      { label: 'Broken links', value: '3' },
      { label: 'Meta issues', value: '6' },
    ],
    missingTasks: [
      'Duplicate title tags',
      'Missing meta descriptions',
      'Orphan pages',
      'Oversized images',
      'XML sitemap',
      'Structured data',
    ],
  },
  profileSnapshot: [
    { attribute: 'Domain', details: 'newmodernhotel.com' },
    { attribute: 'Pages crawled', details: '47' },
    { attribute: 'Mobile score', details: '58 / 100' },
    { attribute: 'Desktop score', details: '74 / 100' },
    { attribute: 'SSL', details: 'Valid' },
  ],
  actionItemsTable: [
    {
      issue: 'Duplicate title tags',
      impact: 'High',
      priority: 'High',
      action: 'Give each page a unique title that reflects its content and target keyword.',
    },
    {
      issue: 'Missing meta descriptions',
      impact: 'High',
      priority: 'High',
      action: 'Add compelling meta descriptions to improve click-through from search results.',
    },
    {
      issue: 'Link orphan pages',
      impact: 'Medium',
      priority: 'Medium',
      action: 'Add internal links from navigation or related content so crawlers can reach them.',
    },
    {
      issue: 'Resolve oversized images',
      impact: 'Medium',
      priority: 'Medium',
      action: 'Compress hero and gallery images; target under 200KB and use WebP where possible.',
    },
    {
      issue: 'XML sitemap not found',
      impact: 'Medium',
      priority: 'Medium',
      action: 'Generate a complete XML sitemap and submit it in Google Search Console.',
    },
    {
      issue: 'Add structured data for local business',
      impact: 'Low',
      priority: 'Low',
      action: 'Add LocalBusiness JSON-LD with name, address, phone, and opening hours.',
    },
  ],
  topActions: [
    'Fix duplicate title tags and missing meta descriptions on high-traffic pages first.',
    'Resolve orphan pages by adding internal links from the homepage or main navigation.',
    'Compress oversized images to improve mobile page speed and Core Web Vitals.',
  ],
  upsellText:
    'Want more insights? I can also audit your Google Business Profile and run an AI & LLM visibility scan to see how your brand appears in conversational search.',
  promptActions: [
    'Fix duplicate title tags on top pages',
    'Audit Google Business Profile',
    'Run AI & LLM visibility scan',
  ],
}

const GENERIC_REPORT_TEMPLATE = {
  ...GBP_REPORT_TEMPLATE,
  title: 'Visibility AI analysis: Full visibility scan',
  tags: ['Google Business Profile', 'Website SEO', 'AI visibility'],
  sectionTitle: 'Visibility overview',
  sourceLabel: 'Combined scan',
}

function getReportTemplate(promptText) {
  const lower = (promptText || '').toLowerCase()
  if (/\bgbp\b|\blisting|\breview/.test(lower)) return GBP_REPORT_TEMPLATE
  if (/\bwebsite\b|\bseo\b|\bcrawl|\btechnical|\bpage speed|\bmobile/.test(lower)) return SEO_REPORT_TEMPLATE
  return GENERIC_REPORT_TEMPLATE
}

/** Build a full detailed report from scan prompt — prototype; replace with API in production */
export function buildVisibilityReport(promptText) {
  const template = structuredClone(getReportTemplate(promptText))
  template.scanLabel = getScanTypeLabel(promptText)
  return template
}

/** Default export for side-panel fallback — GBP prototype data */
export const VISIBILITY_REPORT = buildVisibilityReport('audit gbp listing')
