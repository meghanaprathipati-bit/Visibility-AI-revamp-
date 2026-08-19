/** Dummy detailed report data — replace with API response in production */

import { GBP_HEALTH_REPORT } from './gbpDetailedReport.js'
import { GBP_SCAN_SUMMARY } from './gbpScanContent.js'
import { getScanTypeLabel } from './scanSummary.js'
import { SEO_HEALTH_REPORT } from './seoDetailedReport.js'
import {
  SEO_SCAN_NEXT_ACTION_PLAN,
  SEO_SCAN_SCORE_OVERVIEW,
  SEO_SCAN_SUMMARY,
  SEO_SCAN_TOP_GAPS,
} from './seoScanContent.js'

/** @typedef {{ label: string, value: string }} ReportMetric */
/** @typedef {{ attribute: string, details: string }} SnapshotRow */
/** @typedef {{ issue: string, impact: string, priority: 'High' | 'Medium' | 'Low', action: string }} ReportActionRow */

const GBP_REPORT_TEMPLATE = {
  title: 'Visibility AI analysis: Optimizing your local SEO',
  tags: ['Google Business Profile', 'Listings', 'Content'],
  sectionTitle: 'Local SEO',
  sourceLabel: 'Google Business Profile',
  summaryTitle: GBP_SCAN_SUMMARY.title,
  channelsAnalyzed: GBP_SCAN_SUMMARY.channelsAnalyzed,
  opportunityScope: GBP_SCAN_SUMMARY.opportunityScope,
  summaryCategories: GBP_SCAN_SUMMARY.categories,
  detailedTitle: 'GBP audit report',
  executiveReport: GBP_HEALTH_REPORT,
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
  summaryTitle: SEO_SCAN_SUMMARY.title,
  channelsAnalyzed: SEO_SCAN_SUMMARY.channelsAnalyzed,
  opportunityScope: SEO_SCAN_SUMMARY.opportunityScope,
  summaryCategories: SEO_SCAN_SUMMARY.categories,
  detailedTitle: 'SEO health report',
  executiveReport: SEO_HEALTH_REPORT,
  scoreOverview: SEO_SCAN_SCORE_OVERVIEW,
  topGaps: SEO_SCAN_TOP_GAPS,
  nextActionPlan: SEO_SCAN_NEXT_ACTION_PLAN,
  profile: {
    businessName: 'ramada.9hf9h.com',
    location: 'Primary domain · 47 pages crawled',
    healthScore: 85,
    rating: null,
    reviewCount: null,
    sentiment: 'Needs attention',
    metrics: [
      { label: 'SEO health', value: '85/100' },
      { label: 'Last crawled', value: '2024-08-28' },
      { label: 'Indexed pages', value: '41/47' },
      { label: 'Page speed', value: '75%', sub: 'Mobile' },
      { label: 'Broken links', value: '4' },
      { label: 'Meta issues', value: '6' },
    ],
    missingTasks: [
      'Structured data validation errors',
      'Oversized images',
      'Missing llms.txt file',
      'Orphan pages',
      'XML sitemap',
      'Mixed content issues',
    ],
  },
  profileSnapshot: [
    { attribute: 'Domain', details: 'ramada.9hf9h.com' },
    { attribute: 'Pages crawled', details: '47' },
    { attribute: 'Mobile score', details: '75 / 100' },
    { attribute: 'Desktop score', details: '88 / 100' },
    { attribute: 'SSL', details: 'Valid' },
  ],
  actionItemsTable: [
    {
      issue: 'Structured data validation errors',
      impact: 'High',
      priority: 'High',
      action: 'Replace invalid JSON-LD on homepage.',
    },
    {
      issue: 'HTTPS encryption failure',
      impact: 'High',
      priority: 'High',
      action: 'Resolve HTTPS encryption failure across listings.',
    },
    {
      issue: 'Zero domain citations',
      impact: 'High',
      priority: 'High',
      action: 'Increase content for AI platforms.',
    },
    {
      issue: 'Mixed content issues',
      impact: 'Medium',
      priority: 'Medium',
      action: 'Resolve mixed content issues on directory listings.',
    },
    {
      issue: 'No backlinks or referring domains',
      impact: 'Medium',
      priority: 'Medium',
      action: 'Develop a backlink strategy.',
    },
    {
      issue: 'Oversized images',
      impact: 'Low',
      priority: 'Low',
      action: 'Compress hero and gallery images; target under 200KB and use WebP where possible.',
    },
  ],
  topActions: [
    'Replace invalid JSON-LD on homepage.',
    'Resolve HTTPS encryption failure across listings.',
    'Increase content for AI platforms.',
  ],
  upsellText:
    'Want more insights? I can also audit your Google Business Profile and run an AI & LLM visibility scan to see how your brand appears in conversational search.',
  promptActions: [
    'Replace invalid JSON-LD on homepage',
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
