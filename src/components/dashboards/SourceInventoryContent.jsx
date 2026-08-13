import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Search, Globe, ChevronDown, X,
  Check, Link2, FileText, Info,
  TrendingUp, Users, ChevronRight, ArrowLeft, Calendar,
} from '../../icons/index.js'
import CountCard from '../CountCard.jsx'
import CompanyLogo from '../CompanyLogo.jsx'
import SectionInfoTip from '../SectionInfoTip.jsx'
import HLTooltip from '../HLTooltip.jsx'
import HLInput from '../HLInput.jsx'
import DateRangePicker, { formatRange } from '../DateRangePicker.jsx'
import AdvancedFilterDrawer from '../AdvancedFilterDrawer.jsx'
import AdvancedFilterTrigger from '../AdvancedFilterTrigger.jsx'
import { BTN_PRIMARY, BTN_SECONDARY } from '../HLButton.jsx'

// Source inventory table type scale — never go below 12px.
const SI_TH_CLASS = 'text-[14px] font-semibold text-gray-900'
const TABLE_TH = `px-5 py-2.5 text-left ${SI_TH_CLASS} whitespace-nowrap bg-gray-50 sticky top-0 z-[1]`

// Table header label + compact info tip (keeps column alignment).
function ThLabel({ children, tip, id, align = 'left' }) {
  const justify = align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'
  return (
    <span className={`inline-flex items-center gap-1 ${justify} w-full`}>
      <span>{children}</span>
      {tip ? (
        <HLTooltip id={id} content={tip} variant="dark" placement="top" wrap triggerClassName="inline-flex items-center">
          <Info size={12} className="text-gray-500 shrink-0 cursor-help" aria-label="More information" />
        </HLTooltip>
      ) : null}
    </span>
  )
}

const SI_COL_TIPS = {
  domain: 'Source domain cited in AI answers. Use this to prioritize outreach and content refresh by host.',
  page: 'Specific page cited in AI answers. Use this to find the exact URLs driving mentions.',
  aiAnswers: 'Number of AI answers that cited this source in the current period. Higher means it appears more often in AI responses.',
  prompts: 'Distinct tracked prompts where this source was cited. More prompts mean broader topical reach.',
  promptCoverage: 'Share of AI answers for those prompts that cited this source. Higher means more consistent use across prompts.',
  mentionRate: 'How often your brand is mentioned when this domain is cited. Higher means stronger brand presence on this source.',
  coverage: 'How often your brand is covered when this page is cited. Higher is better for brand presence on this page.',
  domainTraffic: 'Estimated monthly traffic for the source domain.',
  domainTrust: 'Estimated trust score for the domain. Higher-trust sources usually carry more weight in AI answers.',
  pageTraffic: 'Estimated monthly traffic for this specific page.',
  linksAvailable: 'Whether this page offers a link opportunity back to your website.',
  brand: 'Whether your brand was mentioned when this source was cited in AI answers.',
  backlink: 'Whether this source links back to your website. Mentions with backlinks usually drive more authority and traffic.',
  countBacklinks: 'Estimated number of backlinks from this source to your website.',
  competitorMention: 'Competitor brands mentioned alongside yours when this source is cited.',
  otherBrands: 'Other brands mentioned in the same AI answers that cite this source.',
}

/** Frozen identity + View action cols (left sticky); metrics scroll horizontally.
 *  Matches Site Health crawled-pages URL + View spacing. */
const SI_ID_COL_W = 380
const SI_VIEW_COL_W = 88
const SI_STICKY_VIEW_LEFT = SI_ID_COL_W
const SI_STICKY_SHADOW = '4px 0 8px -4px rgba(16, 24, 40, 0.12)'
const SI_TABLE_CLASS = 'min-w-max w-max border-separate border-spacing-0 text-left [&_th]:border-b [&_th]:border-b-gray-200 [&_th]:border-r [&_th]:border-r-gray-200 [&_td]:border-b [&_td]:border-b-gray-100 [&_td]:border-r [&_td]:border-r-gray-200 [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0'

// ── Advanced filter columns (HLAdvanceFilter columnOptions) ───────────────────

const SI_FILTER_COLS = [
  { label: 'Prompt coverage', value: 'promptCoverage', type: 'number' },
  { label: 'Coverage', value: 'coverage', type: 'number' },
  { label: 'Mention rate', value: 'mentionRate', type: 'number' },
  { label: 'Competitor mention', value: 'competitorMention', type: 'string' },
  { label: 'Other brands mentioned', value: 'otherBrands', type: 'string' },
  { label: 'Domain traffic', value: 'domainTraffic', type: 'string' },
  { label: 'Domain trust', value: 'domainTrust', type: 'number' },
  { label: 'Has backlink to your domain', value: 'hasBacklink', type: 'boolean' },
  { label: 'Brand mentioned', value: 'brandMentioned', type: 'number' },
  { label: 'Count of backlinks', value: 'countBacklinks', type: 'string' },
  { label: 'Page traffic', value: 'pageTraffic', type: 'string' },
  { label: 'Referring domains', value: 'referringDomains', type: 'string' },
]

function applySiFilterRule(row, rule) {
  const col = SI_FILTER_COLS.find(c => c.value === rule.field)
  if (!col) return true
  let rawVal = row[rule.field]
  if (Array.isArray(rawVal)) rawVal = rawVal.join(', ')
  if (rawVal === undefined || rawVal === null || rawVal === '') {
    return ['isEmpty', 'false'].includes(rule.operator)
  }
  if (col.type === 'boolean') {
    const bool = Boolean(rawVal)
    if (rule.operator === 'true') return bool === true
    if (rule.operator === 'false') return bool === false
    return true
  }
  if (col.type === 'number') {
    const n = typeof rawVal === 'number' ? rawVal : Number(String(rawVal).replace(/[^\d.-]/g, ''))
    const rv = Number(rule.value)
    switch (rule.operator) {
      case 'eq': return n === rv
      case 'ne': return n !== rv
      case 'gt': return n > rv
      case 'gte': return n >= rv
      case 'lt': return n < rv
      case 'lte': return n <= rv
      default: return true
    }
  }
  const v = String(rawVal).toLowerCase()
  const rv = (rule.value || '').toLowerCase()
  switch (rule.operator) {
    case 'contains': return v.includes(rv)
    case 'notContains': return !v.includes(rv)
    case 'equals': return v === rv
    case 'notEquals': return v !== rv
    case 'startsWith': return v.startsWith(rv)
    case 'endsWith': return v.endsWith(rv)
    case 'isEmpty': return v === ''
    case 'notEmpty': return v !== ''
    default: return true
  }
}

// ── Mock Data ─────────────────────────────────────────────────────────────────

const DOMAIN_DATA = [
  {
    id: 'gohighlevel',
    domain: 'gohighlevel.com',
    type: 'Owned domain',
    pages: 3,
    aiAnswers: 33,
    prompts: 31,
    promptCoverage: 91,
    coverage: 46,
    brandMentioned: 2,
    mentionRate: 28,
    competitorMention: ['HubSpot'],
    otherBrands: ['Keap', 'Brevo'],
    domainTraffic: '90K',
    domainTrust: 92,
    hasBacklink: true,
    countBacklinks: '16K',
    referringDomains: '12K',
  },
  {
    id: 'g2',
    domain: 'g2.com',
    type: 'External domain',
    pages: 4,
    aiAnswers: 33,
    prompts: 31,
    promptCoverage: 91,
    coverage: 42,
    brandMentioned: 0,
    mentionRate: 9,
    competitorMention: ['HubSpot', 'Salesforce'],
    otherBrands: ['Zoho', 'Keap'],
    domainTraffic: '17K',
    domainTrust: 88,
    hasBacklink: true,
    countBacklinks: '517',
    referringDomains: '331',
  },
  {
    id: 'reddit',
    domain: 'reddit.com',
    type: 'External domain',
    pages: 5,
    aiAnswers: 33,
    prompts: 31,
    promptCoverage: 91,
    coverage: 36,
    brandMentioned: 0,
    mentionRate: 6,
    competitorMention: ['HubSpot', 'Pipedrive'],
    otherBrands: ['Apollo', 'Close'],
    domainTraffic: '2.4M',
    domainTrust: 84,
    hasBacklink: true,
    countBacklinks: '72K',
    referringDomains: '46K',
  },
  {
    id: 'capterra',
    domain: 'capterra.com',
    type: 'External domain',
    pages: 3,
    aiAnswers: 33,
    prompts: 31,
    promptCoverage: 91,
    coverage: 28,
    brandMentioned: 1,
    mentionRate: 12,
    competitorMention: ['Salesforce', 'Zoho'],
    otherBrands: ['Keap', 'Freshsales'],
    domainTraffic: '11K',
    domainTrust: 81,
    hasBacklink: true,
    countBacklinks: '1.3K',
    referringDomains: '808',
  },
  {
    id: 'zapier',
    domain: 'zapier.com',
    type: 'External domain',
    pages: 4,
    aiAnswers: 33,
    prompts: 31,
    promptCoverage: 91,
    coverage: 24,
    brandMentioned: 0,
    mentionRate: 4,
    competitorMention: ['HubSpot'],
    otherBrands: ['Mailchimp', 'Brevo'],
    domainTraffic: '99K',
    domainTrust: 74,
    hasBacklink: true,
    countBacklinks: '3.0K',
    referringDomains: '1.9K',
  },
  {
    id: 'producthunt',
    domain: 'producthunt.com',
    type: 'External domain',
    pages: 2,
    aiAnswers: 33,
    prompts: 31,
    promptCoverage: 91,
    coverage: 18,
    brandMentioned: 1,
    mentionRate: 11,
    competitorMention: ['Notion'],
    otherBrands: ['Lemlist', 'Clay'],
    domainTraffic: '7.4K',
    domainTrust: 68,
    hasBacklink: true,
    countBacklinks: '812',
    referringDomains: '520',
  },
  // HARDCODED: extra domains so Sources table pagination is demonstrable in the prototype.
  {
    id: 'trustpilot',
    domain: 'trustpilot.com',
    type: 'External domain',
    pages: 3,
    aiAnswers: 28,
    prompts: 26,
    promptCoverage: 84,
    coverage: 22,
    brandMentioned: 0,
    mentionRate: 5,
    competitorMention: ['HubSpot', 'Salesforce'],
    otherBrands: ['Zoho'],
    domainTraffic: '42K',
    domainTrust: 86,
    hasBacklink: true,
    countBacklinks: '2.1K',
    referringDomains: '1.4K',
  },
  {
    id: 'clutch',
    domain: 'clutch.co',
    type: 'External domain',
    pages: 2,
    aiAnswers: 24,
    prompts: 22,
    promptCoverage: 79,
    coverage: 16,
    brandMentioned: 1,
    mentionRate: 8,
    competitorMention: ['HubSpot'],
    otherBrands: ['Keap', 'ActiveCampaign'],
    domainTraffic: '18K',
    domainTrust: 77,
    hasBacklink: false,
    countBacklinks: '0',
    referringDomains: '0',
  },
  {
    id: 'forbes',
    domain: 'forbes.com',
    type: 'External domain',
    pages: 1,
    aiAnswers: 19,
    prompts: 18,
    promptCoverage: 72,
    coverage: 14,
    brandMentioned: 0,
    mentionRate: 3,
    competitorMention: ['Salesforce', 'HubSpot'],
    otherBrands: ['Adobe'],
    domainTraffic: '110K',
    domainTrust: 94,
    hasBacklink: false,
    countBacklinks: '0',
    referringDomains: '0',
  },
  {
    id: 'techcrunch',
    domain: 'techcrunch.com',
    type: 'External domain',
    pages: 2,
    aiAnswers: 21,
    prompts: 19,
    promptCoverage: 76,
    coverage: 15,
    brandMentioned: 0,
    mentionRate: 4,
    competitorMention: ['Notion'],
    otherBrands: ['Slack', 'Asana'],
    domainTraffic: '88K',
    domainTrust: 91,
    hasBacklink: true,
    countBacklinks: '640',
    referringDomains: '410',
  },
  {
    id: 'semrush',
    domain: 'semrush.com',
    type: 'External domain',
    pages: 3,
    aiAnswers: 27,
    prompts: 25,
    promptCoverage: 82,
    coverage: 21,
    brandMentioned: 1,
    mentionRate: 10,
    competitorMention: ['Ahrefs', 'Moz'],
    otherBrands: ['Surfer'],
    domainTraffic: '64K',
    domainTrust: 89,
    hasBacklink: true,
    countBacklinks: '1.1K',
    referringDomains: '720',
  },
  {
    id: 'hubspot-blog',
    domain: 'blog.hubspot.com',
    type: 'External domain',
    pages: 4,
    aiAnswers: 30,
    prompts: 28,
    promptCoverage: 86,
    coverage: 26,
    brandMentioned: 0,
    mentionRate: 2,
    competitorMention: ['HubSpot', 'Salesforce'],
    otherBrands: ['Marketo'],
    domainTraffic: '210K',
    domainTrust: 93,
    hasBacklink: false,
    countBacklinks: '0',
    referringDomains: '0',
  },
  {
    id: 'linkedin',
    domain: 'linkedin.com',
    type: 'External domain',
    pages: 3,
    aiAnswers: 22,
    prompts: 20,
    promptCoverage: 74,
    coverage: 13,
    brandMentioned: 1,
    mentionRate: 7,
    competitorMention: ['HubSpot'],
    otherBrands: ['Salesforce', 'Pipedrive'],
    domainTraffic: '1.8M',
    domainTrust: 95,
    hasBacklink: true,
    countBacklinks: '9.2K',
    referringDomains: '6.1K',
  },
  {
    id: 'medium',
    domain: 'medium.com',
    type: 'External domain',
    pages: 2,
    aiAnswers: 17,
    prompts: 16,
    promptCoverage: 68,
    coverage: 11,
    brandMentioned: 0,
    mentionRate: 3,
    competitorMention: ['Notion'],
    otherBrands: ['Clay'],
    domainTraffic: '540K',
    domainTrust: 82,
    hasBacklink: true,
    countBacklinks: '290',
    referringDomains: '180',
  },
  {
    id: 'youtube',
    domain: 'youtube.com',
    type: 'External domain',
    pages: 2,
    aiAnswers: 20,
    prompts: 18,
    promptCoverage: 71,
    coverage: 12,
    brandMentioned: 1,
    mentionRate: 6,
    competitorMention: ['HubSpot'],
    otherBrands: ['ClickFunnels'],
    domainTraffic: '3.1M',
    domainTrust: 96,
    hasBacklink: false,
    countBacklinks: '0',
    referringDomains: '0',
  },
  {
    id: 'quora',
    domain: 'quora.com',
    type: 'External domain',
    pages: 3,
    aiAnswers: 18,
    prompts: 17,
    promptCoverage: 69,
    coverage: 10,
    brandMentioned: 0,
    mentionRate: 2,
    competitorMention: ['Salesforce', 'Zoho'],
    otherBrands: ['Keap'],
    domainTraffic: '320K',
    domainTrust: 80,
    hasBacklink: true,
    countBacklinks: '410',
    referringDomains: '260',
  },
  {
    id: 'wikipedia',
    domain: 'en.wikipedia.org',
    type: 'External domain',
    pages: 1,
    aiAnswers: 14,
    prompts: 13,
    promptCoverage: 62,
    coverage: 9,
    brandMentioned: 0,
    mentionRate: 1,
    competitorMention: ['Salesforce'],
    otherBrands: ['Oracle'],
    domainTraffic: '5.2M',
    domainTrust: 98,
    hasBacklink: false,
    countBacklinks: '0',
    referringDomains: '0',
  },
  {
    id: 'getapp',
    domain: 'getapp.com',
    type: 'External domain',
    pages: 2,
    aiAnswers: 16,
    prompts: 15,
    promptCoverage: 66,
    coverage: 12,
    brandMentioned: 1,
    mentionRate: 9,
    competitorMention: ['HubSpot', 'Pipedrive'],
    otherBrands: ['Freshsales'],
    domainTraffic: '28K',
    domainTrust: 75,
    hasBacklink: true,
    countBacklinks: '380',
    referringDomains: '240',
  },
]

const PAGE_DATA = [
  {
    id: 'ghl-pricing',
    title: 'GoHighLevel Pricing & AI Visibility Plans',
    url: 'https://gohighlevel.com/pricing',
    domain: 'gohighlevel.com',
    type: 'Owned page',
    aiAnswers: 35,
    prompts: 33,
    promptCoverage: 88,
    coverage: 25,
    domainTraffic: '90K',
    domainTrust: 92,
    pageTraffic: '2.5K',
    linksAvailable: 'owned',
    hasBacklink: true,
    countBacklinks: '2.0K',
    brandMentioned: true,
    competitorMention: [],
    otherBrands: [],
  },
  {
    id: 'ghl-compare',
    title: 'GoHighLevel vs Traditional AI Rank Tracking Tools',
    url: 'https://gohighlevel.com/compare/ai-rank-tracking',
    domain: 'gohighlevel.com',
    type: 'Owned page',
    aiAnswers: 35,
    prompts: 33,
    promptCoverage: 88,
    coverage: 20,
    domainTraffic: '90K',
    domainTrust: 92,
    pageTraffic: '2.3K',
    linksAvailable: 'owned',
    hasBacklink: true,
    countBacklinks: '1.8K',
    brandMentioned: true,
    competitorMention: ['HubSpot', 'Salesforce'],
    otherBrands: [],
  },
  {
    id: 'ghl-citations',
    title: 'How AI Citations Work for GoHighLevel',
    url: 'https://gohighlevel.com/blog/how-ai-citations-work',
    domain: 'gohighlevel.com',
    type: 'Owned page',
    aiAnswers: 35,
    prompts: 33,
    promptCoverage: 88,
    coverage: 17,
    domainTraffic: '90K',
    domainTrust: 92,
    pageTraffic: '2.0K',
    linksAvailable: 'owned',
    hasBacklink: true,
    countBacklinks: '1.6K',
    brandMentioned: true,
    competitorMention: [],
    otherBrands: [],
  },
  {
    id: 'g2-crm',
    title: 'Best CRM & Marketing Automation Platforms for Agencies',
    url: 'https://www.g2.com/categories/marketing-automation',
    domain: 'g2.com',
    type: 'Third-party source',
    aiAnswers: 35,
    prompts: 33,
    promptCoverage: 88,
    coverage: 31,
    domainTraffic: '3.2M',
    domainTrust: 88,
    pageTraffic: '669',
    linksAvailable: 'no',
    hasBacklink: true,
    countBacklinks: '54',
    brandMentioned: false,
    competitorMention: ['HubSpot', 'Salesforce'],
    otherBrands: ['Zoho', 'Keap'],
  },
  {
    id: 'reddit-crm',
    title: 'What CRM stack are agencies actually using in 2026?',
    url: 'https://www.reddit.com/r/marketingautomation/comments/agency_crm_stack/',
    domain: 'reddit.com',
    type: 'Third-party source',
    aiAnswers: 35,
    prompts: 33,
    promptCoverage: 88,
    coverage: 24,
    domainTraffic: '21M',
    domainTrust: 84,
    pageTraffic: '580',
    linksAvailable: 'no',
    hasBacklink: true,
    countBacklinks: '46',
    brandMentioned: false,
    competitorMention: ['HubSpot', 'Pipedrive'],
    otherBrands: ['Apollo', 'Close'],
  },
  {
    id: 'capterra-ghl',
    title: 'GoHighLevel Reviews & Product Details',
    url: 'https://www.capterra.com/p/209198/GoHighLevel/',
    domain: 'capterra.com',
    type: 'Third-party source',
    aiAnswers: 35,
    prompts: 33,
    promptCoverage: 88,
    coverage: 19,
    domainTraffic: '2.6M',
    domainTrust: 81,
    pageTraffic: '527',
    linksAvailable: 'yes',
    hasBacklink: true,
    countBacklinks: '184',
    brandMentioned: true,
    competitorMention: ['HubSpot'],
    otherBrands: ['Keap', 'Freshsales'],
  },
  {
    id: 'zapier-ma',
    title: 'The Best Marketing Automation Platforms for Growing Agencies',
    url: 'https://zapier.com/blog/best-marketing-automation-platforms/',
    domain: 'zapier.com',
    type: 'Third-party source',
    aiAnswers: 35,
    prompts: 33,
    promptCoverage: 88,
    coverage: 17,
    domainTraffic: '1.4M',
    domainTrust: 74,
    pageTraffic: '528',
    linksAvailable: 'no',
    hasBacklink: true,
    countBacklinks: '42',
    brandMentioned: false,
    competitorMention: ['HubSpot', 'ActiveCampaign'],
    otherBrands: ['Mailchimp', 'Brevo'],
  },
  {
    id: 'ph-ghl',
    title: 'GoHighLevel on Product Hunt',
    url: 'https://www.producthunt.com/products/gohighlevel',
    domain: 'producthunt.com',
    type: 'Third-party source',
    aiAnswers: 35,
    prompts: 33,
    promptCoverage: 88,
    coverage: 12,
    domainTraffic: '390K',
    domainTrust: 68,
    pageTraffic: '475',
    linksAvailable: 'yes',
    hasBacklink: true,
    countBacklinks: '166',
    brandMentioned: true,
    competitorMention: [],
    otherBrands: ['Lemlist'],
  },
  // HARDCODED: extra pages so Sources page-view pagination is demonstrable.
  {
    id: 'trustpilot-ghl',
    title: 'GoHighLevel Reviews on Trustpilot',
    url: 'https://www.trustpilot.com/review/gohighlevel.com',
    domain: 'trustpilot.com',
    type: 'Third-party source',
    aiAnswers: 28,
    prompts: 26,
    promptCoverage: 84,
    coverage: 18,
    domainTraffic: '42K',
    domainTrust: 86,
    pageTraffic: '820',
    linksAvailable: 'yes',
    hasBacklink: true,
    countBacklinks: '92',
    brandMentioned: false,
    competitorMention: ['HubSpot'],
    otherBrands: ['Zoho'],
  },
  {
    id: 'clutch-agencies',
    title: 'Top Marketing Automation Agencies',
    url: 'https://clutch.co/agencies/marketing-automation',
    domain: 'clutch.co',
    type: 'Third-party source',
    aiAnswers: 24,
    prompts: 22,
    promptCoverage: 79,
    coverage: 15,
    domainTraffic: '18K',
    domainTrust: 77,
    pageTraffic: '610',
    linksAvailable: 'no',
    hasBacklink: false,
    countBacklinks: '0',
    brandMentioned: true,
    competitorMention: ['HubSpot'],
    otherBrands: ['Keap'],
  },
  {
    id: 'forbes-ai-crm',
    title: 'How AI Is Changing CRM for Agencies',
    url: 'https://www.forbes.com/sites/ai-crm-agencies/',
    domain: 'forbes.com',
    type: 'Third-party source',
    aiAnswers: 19,
    prompts: 18,
    promptCoverage: 72,
    coverage: 11,
    domainTraffic: '110K',
    domainTrust: 94,
    pageTraffic: '1.2K',
    linksAvailable: 'no',
    hasBacklink: false,
    countBacklinks: '0',
    brandMentioned: false,
    competitorMention: ['Salesforce', 'HubSpot'],
    otherBrands: ['Adobe'],
  },
  {
    id: 'tc-visibility',
    title: 'AI Search Visibility Tools Startups Are Watching',
    url: 'https://techcrunch.com/2026/03/ai-search-visibility-tools/',
    domain: 'techcrunch.com',
    type: 'Third-party source',
    aiAnswers: 21,
    prompts: 19,
    promptCoverage: 76,
    coverage: 13,
    domainTraffic: '88K',
    domainTrust: 91,
    pageTraffic: '940',
    linksAvailable: 'yes',
    hasBacklink: true,
    countBacklinks: '38',
    brandMentioned: false,
    competitorMention: ['Notion'],
    otherBrands: ['Slack'],
  },
  {
    id: 'semrush-aio',
    title: 'AI Overviews SEO Guide for Brands',
    url: 'https://www.semrush.com/blog/ai-overviews-seo/',
    domain: 'semrush.com',
    type: 'Third-party source',
    aiAnswers: 27,
    prompts: 25,
    promptCoverage: 82,
    coverage: 20,
    domainTraffic: '64K',
    domainTrust: 89,
    pageTraffic: '1.1K',
    linksAvailable: 'yes',
    hasBacklink: true,
    countBacklinks: '74',
    brandMentioned: true,
    competitorMention: ['Ahrefs'],
    otherBrands: ['Surfer'],
  },
  {
    id: 'hubspot-ai-search',
    title: 'What Is AI Search Optimization?',
    url: 'https://blog.hubspot.com/marketing/ai-search-optimization',
    domain: 'blog.hubspot.com',
    type: 'Third-party source',
    aiAnswers: 30,
    prompts: 28,
    promptCoverage: 86,
    coverage: 22,
    domainTraffic: '210K',
    domainTrust: 93,
    pageTraffic: '2.8K',
    linksAvailable: 'no',
    hasBacklink: false,
    countBacklinks: '0',
    brandMentioned: false,
    competitorMention: ['HubSpot', 'Salesforce'],
    otherBrands: ['Marketo'],
  },
  {
    id: 'linkedin-aio',
    title: 'How brands win mentions in AI answers',
    url: 'https://www.linkedin.com/pulse/how-brands-win-mentions-ai-answers/',
    domain: 'linkedin.com',
    type: 'Third-party source',
    aiAnswers: 22,
    prompts: 20,
    promptCoverage: 74,
    coverage: 12,
    domainTraffic: '1.8M',
    domainTrust: 95,
    pageTraffic: '720',
    linksAvailable: 'yes',
    hasBacklink: true,
    countBacklinks: '51',
    brandMentioned: true,
    competitorMention: ['HubSpot'],
    otherBrands: ['Pipedrive'],
  },
  {
    id: 'medium-citations',
    title: 'Building Citation-Ready Content for AI Engines',
    url: 'https://medium.com/@growth/citation-ready-content-ai',
    domain: 'medium.com',
    type: 'Third-party source',
    aiAnswers: 17,
    prompts: 16,
    promptCoverage: 68,
    coverage: 9,
    domainTraffic: '540K',
    domainTrust: 82,
    pageTraffic: '390',
    linksAvailable: 'yes',
    hasBacklink: true,
    countBacklinks: '22',
    brandMentioned: false,
    competitorMention: ['Notion'],
    otherBrands: ['Clay'],
  },
  {
    id: 'yt-ghl-review',
    title: 'GoHighLevel AI Visibility Walkthrough',
    url: 'https://www.youtube.com/watch?v=ghl-ai-visibility',
    domain: 'youtube.com',
    type: 'Third-party source',
    aiAnswers: 20,
    prompts: 18,
    promptCoverage: 71,
    coverage: 10,
    domainTraffic: '3.1M',
    domainTrust: 96,
    pageTraffic: '4.2K',
    linksAvailable: 'no',
    hasBacklink: false,
    countBacklinks: '0',
    brandMentioned: true,
    competitorMention: ['HubSpot'],
    otherBrands: ['ClickFunnels'],
  },
  {
    id: 'quora-crm',
    title: 'Best CRM for agencies that care about AI search?',
    url: 'https://www.quora.com/Best-CRM-for-agencies-AI-search',
    domain: 'quora.com',
    type: 'Third-party source',
    aiAnswers: 18,
    prompts: 17,
    promptCoverage: 69,
    coverage: 8,
    domainTraffic: '320K',
    domainTrust: 80,
    pageTraffic: '280',
    linksAvailable: 'yes',
    hasBacklink: true,
    countBacklinks: '14',
    brandMentioned: false,
    competitorMention: ['Salesforce', 'Zoho'],
    otherBrands: ['Keap'],
  },
  {
    id: 'wiki-crm',
    title: 'Customer relationship management',
    url: 'https://en.wikipedia.org/wiki/Customer_relationship_management',
    domain: 'en.wikipedia.org',
    type: 'Third-party source',
    aiAnswers: 14,
    prompts: 13,
    promptCoverage: 62,
    coverage: 7,
    domainTraffic: '5.2M',
    domainTrust: 98,
    pageTraffic: '18K',
    linksAvailable: 'no',
    hasBacklink: false,
    countBacklinks: '0',
    brandMentioned: false,
    competitorMention: ['Salesforce'],
    otherBrands: ['Oracle'],
  },
  {
    id: 'getapp-ma',
    title: 'Best Marketing Automation Software',
    url: 'https://www.getapp.com/marketing-software/marketing-automation/',
    domain: 'getapp.com',
    type: 'Third-party source',
    aiAnswers: 16,
    prompts: 15,
    promptCoverage: 66,
    coverage: 11,
    domainTraffic: '28K',
    domainTrust: 75,
    pageTraffic: '510',
    linksAvailable: 'yes',
    hasBacklink: true,
    countBacklinks: '67',
    brandMentioned: true,
    competitorMention: ['HubSpot', 'Pipedrive'],
    otherBrands: ['Freshsales'],
  },
]

// HARDCODED: prompt pool used to synthesize the expanded-row AI answers /
// prompts tables for the prototype (row counts mirror each source's totals).
const DETAIL_PROMPT_POOL = [
  'What are the best AI visibility platforms for multi-location brands?',
  'How do AI search engines rank CRM tools for small agencies?',
  'Which marketing automation platforms appear most in AI answers for agencies?',
  'How do AI rank tracking tools compare for SEO agencies?',
  'Best tools to monitor citations in ChatGPT and Google AI Overview',
]

// Build a descending date (e.g. Jul 22, 2026) offset by `i` days — keep Date for filtering.
function detailDateValue(i) {
  const base = new Date(2026, 6, 22)
  base.setDate(base.getDate() - i)
  return base
}

function formatDetailDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// HARDCODED: synthesize AI-answer / prompt rows for a source (prototyping).
// Sized to the larger of aiAnswers / prompts counts.
function buildDetailRows(source) {
  const count = Math.max(source.aiAnswers || 0, source.prompts || 0)
  const engines = ['ChatGPT', 'Google AI Overview', 'Perplexity']
  const sourceKey = source.id || 'source'
  return Array.from({ length: count }, (_, i) => {
    const dateValue = detailDateValue(i)
    // HARDCODED: cache id for prototype route /ai-answer-cache/:id
    const cacheId = `${sourceKey}-${i}`
    return {
      id: cacheId,
      prompt: DETAIL_PROMPT_POOL[i % DETAIL_PROMPT_POOL.length],
      engine: engines[i % engines.length],
      dateValue,
      date: formatDetailDate(dateValue),
      cacheUrl: `/ai-answer-cache/${cacheId}`,
      sourceDomain: source.domain || '',
      sourceTitle: source.title || source.domain || '',
      sourceUrl: source.url || (source.domain ? `https://${source.domain}` : ''),
    }
  })
}

const ENGINE_BREAKDOWN_MAP = {
  gohighlevel: { 'Perplexity': 18, 'ChatGPT': 15 },
  'ghl-pricing': { 'Perplexity': 18, 'ChatGPT': 17 },
}

function getEngineBreakdown(id, total) {
  if (ENGINE_BREAKDOWN_MAP[id]) return ENGINE_BREAKDOWN_MAP[id]
  const a = Math.round(total * 0.54)
  return { 'Google AI Overview': a, 'ChatGPT': total - a }
}

// ── Helper Components ─────────────────────────────────────────────────────────

function AiEngineTag({ engine }) {
  const cfg = {
    'ChatGPT':            'bg-teal-50 text-teal-600 border-teal-200',
    'Google AI Overview': 'bg-primary-50 text-primary-600 border-primary-200',
    'Perplexity':         'bg-warning-100 text-warning-600 border-warning-100',
    'Claude':             'bg-gray-100 text-gray-600 border-gray-200',
  }[engine] || 'bg-gray-100 text-gray-600 border-gray-200'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[12px] font-medium whitespace-nowrap ${cfg}`}>
      {engine}
    </span>
  )
}

function TypeBadge({ type }) {
  const isOwned = type === 'Owned domain' || type === 'Owned page'
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[12px] font-medium mt-0.5 ${
      isOwned ? 'bg-success-50 text-success-700' : 'bg-gray-100 text-gray-500'
    }`}>
      {type}
    </span>
  )
}

// Canonical yes/no cell — green tick + "Yes" or grey cross + "No". Used for the
// Brand and Backlink columns so both read identically.
function YesNoBadge({ value }) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-success-600">
      <Check size={12} strokeWidth={2.5} />Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[14px] font-medium text-gray-500">
      <X size={12} strokeWidth={2.5} />No
    </span>
  )
}

function BacklinkBadge({ hasBacklink }) {
  return <YesNoBadge value={hasBacklink} />
}

function BrandMentionBadge({ mentioned }) {
  return <YesNoBadge value={mentioned} />
}

function LinksAvailableBadge({ value }) {
  if (value === 'owned') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-semibold bg-success-50 text-success-700">
        Owned page
      </span>
    )
  }
  if (value === 'yes') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-semibold bg-success-50 text-success-700">
        Yes
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-semibold bg-error-50 text-error-600">
      No
    </span>
  )
}

function BrandsCell({ brands }) {
  if (!brands?.length) return <span className="text-[14px] text-gray-500">—</span>
  return <span className="text-[14px] text-gray-700 whitespace-nowrap">{brands.join(', ')}</span>
}

function TrustScore({ score }) {
  const color = score >= 80 ? 'text-success-600' : score >= 60 ? 'text-warning-600' : 'text-error-600'
  return (
    <span className={`text-[14px] font-semibold ${color}`}>
      {score}<span className="text-gray-500 font-normal text-[12px]">/100</span>
    </span>
  )
}

// Prompt coverage: percentage only (no progress bar), medium weight.
function CoverageBar({ value }) {
  return <span className="text-[14px] font-medium text-gray-900 tabular-nums">{value}%</span>
}

// ── Count Button with Portal Tooltip ─────────────────────────────────────────

function CountButton({ count, type, id, onDetailOpen }) {
  const [tooltipPos, setTooltipPos] = useState(null)
  const btnRef = useRef(null)
  const breakdown = getEngineBreakdown(id, count)

  function show() {
    if (!btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    setTooltipPos({ top: r.bottom + 6, left: r.left })
  }
  function hide() { setTooltipPos(null) }

  return (
    <>
      <button
        ref={btnRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={e => { e.stopPropagation(); hide(); onDetailOpen(type === 'ai' ? 'AI answers' : 'Prompts') }}
        className="inline-flex items-center justify-center min-w-[40px] px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 text-[12px] font-semibold text-gray-700 transition-all group"
      >
        {count}
      </button>

      {tooltipPos && createPortal(
        <div
              style={{ position: 'fixed', top: tooltipPos.top, left: tooltipPos.left, zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
          onMouseEnter={show}
          onMouseLeave={hide}
          className="bg-white border border-gray-200 rounded-xl p-3.5 w-[230px]"
        >
          <p className="text-[12px] font-semibold text-gray-500 mb-1">
            {type === 'ai' ? 'AI answers' : 'Prompts'}
          </p>
          <p className="text-[22px] font-bold text-gray-900 leading-none mb-0.5">{count}</p>
          <p className="text-[12px] text-gray-500 mb-3">Total in current set · Jul 4–7, 2026</p>
          <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-2.5">
            {Object.entries(breakdown).map(([eng, n]) => (
              <div key={eng} className="flex items-center justify-between gap-2">
                <AiEngineTag engine={eng} />
                <span className="text-[12px] font-bold text-gray-800">{n}</span>
              </div>
            ))}
          </div>
          <button
            onMouseDown={e => { e.preventDefault(); hide(); onDetailOpen(type === 'ai' ? 'AI answers' : 'Prompts') }}
            className="mt-3 text-[12px] font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-0.5"
          >
            View all <ChevronRight size={12} />
          </button>
        </div>,
        document.body
      )}
    </>
  )
}

// ── Filter Components ─────────────────────────────────────────────────────────

// Source mention filter — presented as a filter chip + dropdown (HighRise table
// filter pattern), single-select: All sources / Mentioned / Not mentioned.
const SOURCE_FILTER_OPTIONS = [
  { id: 'all',           label: 'All sources',   badge: 'All' },
  { id: 'mentioned',     label: 'Mentioned',     badge: 'Mentioned' },
  { id: 'not-mentioned', label: 'Not mentioned', badge: 'Not mentioned' },
]

function SourceFilterChip({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDown(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const current = SOURCE_FILTER_OPTIONS.find(o => o.id === value) || SOURCE_FILTER_OPTIONS[0]

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 h-8 pl-3 pr-2 rounded-full border border-gray-300 bg-white text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span>Source</span>
        <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[14px]">{current.badge}</span>
        {value !== 'all' ? (
          <span
            role="button"
            onClick={e => { e.stopPropagation(); onChange('all'); setOpen(false) }}
            className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
          >
            <X size={11} className="text-gray-500" />
          </span>
        ) : (
          <ChevronDown size={13} className="text-gray-500" />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-gray-200 rounded-xl p-1 shadow-lg" style={{ minWidth: 200 }}>
          {SOURCE_FILTER_OPTIONS.map(o => {
            const active = o.id === value
            return (
              <button
                key={o.id}
                onClick={() => { onChange(o.id); setOpen(false) }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors ${
                  active ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{o.label}</span>
                {active && <Check size={15} className="text-primary-600" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Source answers detail view (dedicated space + filters) ───────────────────

const DETAIL_ROWS_PER_PAGE = 10

const DETAIL_ENGINE_OPTIONS = [
  { id: 'all', label: 'All engines', badge: 'All' },
  { id: 'ChatGPT', label: 'ChatGPT', badge: 'ChatGPT' },
  { id: 'Google AI Overview', label: 'Google AI Overview', badge: 'AI Overview' },
  { id: 'Perplexity', label: 'Perplexity', badge: 'Perplexity' },
]

const DETAIL_PERIOD_PRESETS = ['Last 7 days', 'Last 15 days', 'Last 30 days', 'Custom date range']

function stripDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function rangeForPeriod(period, customRange) {
  if (period === 'Custom date range' && customRange?.start && customRange?.end) {
    return { start: stripDay(customRange.start), end: stripDay(customRange.end) }
  }
  const days = period === 'Last 7 days' ? 7 : period === 'Last 15 days' ? 15 : 30
  const end = stripDay(new Date(2026, 6, 22))
  const start = new Date(end)
  start.setDate(start.getDate() - (days - 1))
  return { start, end }
}

function EngineFilterChip({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDown(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const current = DETAIL_ENGINE_OPTIONS.find(o => o.id === value) || DETAIL_ENGINE_OPTIONS[0]

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 h-8 pl-3 pr-2 rounded-full border border-gray-300 bg-white text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span>AI engine</span>
        <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[14px]">{current.badge}</span>
        {value !== 'all' ? (
          <span
            role="button"
            onClick={e => { e.stopPropagation(); onChange('all'); setOpen(false) }}
            className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
          >
            <X size={11} className="text-gray-500" />
          </span>
        ) : (
          <ChevronDown size={13} className="text-gray-500" />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-gray-200 rounded-xl p-1 shadow-lg" style={{ minWidth: 220 }}>
          {DETAIL_ENGINE_OPTIONS.map(o => {
            const active = o.id === value
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => { onChange(o.id); setOpen(false) }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-colors ${
                  active ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{o.label}</span>
                {active && <Check size={15} className="text-primary-600" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DetailDateFilterChip({ value, customRange, onChange, onCustomRange }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('list')
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onDown(e) { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setMode('list') } }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const customActive = value === 'Custom date range' || (customRange?.start && !DETAIL_PERIOD_PRESETS.slice(0, 3).includes(value))
  const label = customActive && customRange?.start && customRange?.end
    ? formatRange(customRange.start, customRange.end)
    : value

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setMode('list') }}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-gray-300 bg-white text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Calendar size={14} className="text-gray-500 shrink-0" />
        <span className="whitespace-nowrap">{label}</span>
        <ChevronDown size={13} className="text-gray-500" />
      </button>

      {open && mode === 'list' && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-gray-200 rounded-xl p-1 shadow-lg" style={{ minWidth: 200 }}>
          {DETAIL_PERIOD_PRESETS.map(opt => {
            const isSelected = value === opt || (opt === 'Custom date range' && customActive && value === 'Custom date range')
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  if (opt === 'Custom date range') { setMode('calendar'); return }
                  onChange(opt)
                  setOpen(false)
                }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-[14px] transition-colors text-left ${
                  isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'
                }`}
              >
                <span className={isSelected ? 'text-primary-700 font-semibold' : 'text-gray-700'}>{opt}</span>
                {isSelected && <Check size={13} className="text-primary-600 shrink-0" />}
              </button>
            )
          })}
        </div>
      )}

      {open && mode === 'calendar' && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-gray-200 rounded-xl shadow-lg">
          <DateRangePicker
            value={customRange}
            onCancel={() => setMode('list')}
            onApply={(r) => {
              onCustomRange(r)
              onChange('Custom date range')
              setOpen(false)
              setMode('list')
            }}
          />
        </div>
      )}
    </div>
  )
}

function SourceAnswersDetailView({ source, onBack }) {
  const [period, setPeriod] = useState('Last 30 days')
  const [customRange, setCustomRange] = useState({})
  const [engine, setEngine] = useState('all')
  const [promptQuery, setPromptQuery] = useState('')
  const [page, setPage] = useState(1)

  const isPage = Boolean(source.title)
  const title = isPage ? source.title : source.domain
  const subtitle = isPage ? source.url?.replace(/^https?:\/\//, '') : null

  const allRows = buildDetailRows(source)
  const { start, end } = rangeForPeriod(period, customRange)

  const filtered = allRows.filter(row => {
    const d = stripDay(row.dateValue)
    if (d < start || d > end) return false
    if (engine !== 'all' && row.engine !== engine) return false
    if (promptQuery.trim()) {
      const q = promptQuery.trim().toLowerCase()
      if (!row.prompt.toLowerCase().includes(q)) return false
    }
    return true
  })

  const total = filtered.length
  const paged = filtered.slice((page - 1) * DETAIL_ROWS_PER_PAGE, page * DETAIL_ROWS_PER_PAGE)
  const filtersActive = period !== 'Last 30 days' || engine !== 'all' || Boolean(promptQuery.trim()) || Boolean(customRange?.start)

  function resetPage(fn) {
    return (...args) => { fn(...args); setPage(1) }
  }

  function clearFilters() {
    setPeriod('Last 30 days')
    setCustomRange({})
    setEngine('all')
    setPromptQuery('')
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-[14px] font-medium text-gray-500 hover:text-gray-700 transition-colors w-fit"
      >
        <ArrowLeft size={14} />
        Back to source inventory
      </button>

      {/* Hero */}
      <div className="border border-gray-200 rounded-lg bg-white p-5">
        <div className="flex items-start gap-3 min-w-0">
          {isPage ? (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <FileText size={18} className="text-gray-500" />
            </div>
          ) : (
            <CompanyLogo
              domain={source.domain}
              size={40}
              fallback={
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Globe size={18} className="text-gray-500" />
                </div>
              }
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-[16px] font-semibold text-gray-900 m-0 truncate">{title}</h2>
              <TypeBadge type={source.type} />
            </div>
            {subtitle && (
              <p className="text-[13px] text-gray-500 m-0 mt-1 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
          <CountCard
            label="AI answers"
            value={source.aiAnswers}
            Icon={FileText}
            iconColor="var(--primary-600)"
            helpContent="Number of AI answers that cited this source in the current period. Higher means the source appears more often in AI responses."
          />
          <CountCard
            label="Prompts"
            value={source.prompts}
            Icon={Search}
            iconColor="var(--purple-600)"
            helpContent="Distinct tracked prompts where this source was cited. More prompts mean broader topical reach across your tracking set."
          />
          <CountCard
            label="Prompt coverage"
            value={`${source.promptCoverage}%`}
            Icon={TrendingUp}
            iconColor="var(--success-600)"
            helpContent="Share of AI answers for those prompts that cited this source. Higher coverage means the source is more consistently used when those prompts are answered."
          />
          <CountCard
            label={isPage ? 'Coverage' : 'Mention rate'}
            value={isPage ? `${source.coverage}%` : `${source.mentionRate}%`}
            Icon={Globe}
            iconColor="var(--warning-600)"
            helpContent={
              isPage
                ? 'How often your brand is covered when this page is cited in AI answers. Higher is better for brand presence on this page.'
                : 'How often your brand is mentioned when this domain is cited in AI answers. Higher means stronger brand presence on this source.'
            }
          />
        </div>
      </div>

      {/* Answers table card */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[14px] font-semibold text-gray-900 m-0">AI answers & prompts</h3>
            <SectionInfoTip
              id="source-answers-detail-info"
              content="Every AI answer that cited this source, with the prompt and engine. Filter by date, engine, or prompt text."
            />
          </div>
        </div>

        {/* Toolbar — filters left, search right */}
        <div className="px-5 py-3 flex items-center gap-2 border-b border-gray-100 flex-wrap">
          <DetailDateFilterChip
            value={period}
            customRange={customRange}
            onChange={resetPage(setPeriod)}
            onCustomRange={resetPage(setCustomRange)}
          />
          <EngineFilterChip value={engine} onChange={resetPage(setEngine)} />
          <div className="ml-auto shrink-0" style={{ width: 280 }}>
            <HLInput
              size="sm"
              prefixIcon={Search}
              value={promptQuery}
              onChange={e => { setPromptQuery(e.target.value); setPage(1) }}
              placeholder="Search prompts"
            />
          </div>
        </div>

        {total === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-8">
            <Search size={32} className="text-gray-200 mb-3" />
            <p className="text-[14px] font-semibold text-gray-700 mb-1">No answers match</p>
            <p className="text-[12px] text-gray-500 m-0 mb-4">Try adjusting the date range, engine, or prompt search.</p>
            {filtersActive && (
              <button
                type="button"
                onClick={clearFilters}
                className={BTN_PRIMARY}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className={`${TABLE_TH} w-[130px]`}>Date</th>
                    <th className={`${TABLE_TH} w-[160px]`}>AI engine</th>
                    <th className={TABLE_TH}>Prompt</th>
                    <th className={`${TABLE_TH} w-[88px]`} />
                  </tr>
                </thead>
                <tbody>
                  {paged.map(row => (
                    <tr key={row.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/40">
                      <td className="px-5 py-2.5 text-[14px] text-gray-500 whitespace-nowrap">{row.date}</td>
                      <td className="px-5 py-2.5"><AiEngineTag engine={row.engine} /></td>
                      <td className="px-5 py-2.5 text-[14px] text-gray-700">
                        <span className="line-clamp-2">{row.prompt}</span>
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            window.open(row.cacheUrl, '_blank', 'noopener,noreferrer')
                          }}
                          className="text-[14px] font-medium text-primary-600 hover:underline whitespace-nowrap"
                        >
                          View cached copy
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {total > DETAIL_ROWS_PER_PAGE && (
              <Pagination total={total} page={page} perPage={DETAIL_ROWS_PER_PAGE} onPage={setPage} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Domain Table ──────────────────────────────────────────────────────────────

function DomainTable({ domains, onOpenDetail }) {
  if (!domains.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-8">
        <Search size={32} className="text-gray-200 mb-3" />
        <p className="text-[14px] font-semibold text-gray-700 mb-1">No domains found</p>
        <p className="text-[12px] text-gray-500">Try adjusting your filters or search query.</p>
      </div>
    )
  }

  const stickyIdTh = `sticky left-0 top-0 z-30 bg-gray-50 px-4 py-2.5 text-left whitespace-nowrap ${SI_TH_CLASS}`
  const stickyViewTh = `sticky top-0 z-30 bg-gray-50 px-4 py-2.5 whitespace-nowrap ${SI_TH_CLASS}`
  const stickyIdTd = 'sticky left-0 z-20 bg-white group-hover:bg-gray-50 px-4 py-3 align-top'
  const stickyViewTd = 'sticky z-20 bg-white group-hover:bg-gray-50 px-4 py-3 whitespace-nowrap align-middle'
  const metricTh = `sticky top-0 z-10 bg-gray-50 px-3 py-2.5 whitespace-nowrap ${SI_TH_CLASS}`
  const metricTd = 'px-3 py-3 align-middle whitespace-nowrap'

  return (
    <table className={SI_TABLE_CLASS}>
      <colgroup>
        <col style={{ width: SI_ID_COL_W }} />
        <col style={{ width: SI_VIEW_COL_W }} />
        <col /><col /><col /><col /><col /><col /><col /><col /><col /><col /><col />
      </colgroup>
      <thead>
        <tr>
          <th
            className={stickyIdTh}
            style={{ left: 0, width: SI_ID_COL_W, minWidth: SI_ID_COL_W, maxWidth: SI_ID_COL_W }}
          >
            <ThLabel id="si-th-domain" tip={SI_COL_TIPS.domain}>Domain</ThLabel>
          </th>
          {/* Action column — no header label; padding matches Site Health Issues/View col */}
          <th
            className={stickyViewTh}
            style={{
              left: SI_STICKY_VIEW_LEFT,
              width: SI_VIEW_COL_W,
              minWidth: SI_VIEW_COL_W,
              maxWidth: SI_VIEW_COL_W,
              boxShadow: SI_STICKY_SHADOW,
            }}
            aria-label="Actions"
          />
          <th className={`${metricTh} text-center`}>
            <ThLabel id="si-th-domain-ai" tip={SI_COL_TIPS.aiAnswers} align="center">AI answers</ThLabel>
          </th>
          <th className={`${metricTh} text-center`}>
            <ThLabel id="si-th-domain-prompts" tip={SI_COL_TIPS.prompts} align="center">Prompts</ThLabel>
          </th>
          <th className={`${metricTh} text-right`}>
            <ThLabel id="si-th-domain-pc" tip={SI_COL_TIPS.promptCoverage} align="right">Prompt coverage</ThLabel>
          </th>
          <th className={`${metricTh} text-right`}>
            <ThLabel id="si-th-domain-mr" tip={SI_COL_TIPS.mentionRate} align="right">Mention rate</ThLabel>
          </th>
          <th className={`${metricTh} text-right`}>
            <ThLabel id="si-th-domain-traffic" tip={SI_COL_TIPS.domainTraffic} align="right">Domain traffic</ThLabel>
          </th>
          <th className={`${metricTh} text-right`}>
            <ThLabel id="si-th-domain-trust" tip={SI_COL_TIPS.domainTrust} align="right">Domain trust</ThLabel>
          </th>
          <th className={`${metricTh} text-right`}>
            <ThLabel id="si-th-domain-backlink" tip={SI_COL_TIPS.backlink} align="right">Has backlink to your domain</ThLabel>
          </th>
          <th className={`${metricTh} text-right`}>
            <ThLabel id="si-th-domain-bl-count" tip={SI_COL_TIPS.countBacklinks} align="right">Count of backlinks</ThLabel>
          </th>
          <th className={`${metricTh} text-center`}>
            <ThLabel id="si-th-domain-brand" tip={SI_COL_TIPS.brand} align="center">Brand mentioned</ThLabel>
          </th>
          <th className={`${metricTh} text-left`}>
            <ThLabel id="si-th-domain-comp" tip={SI_COL_TIPS.competitorMention}>Competitor mention</ThLabel>
          </th>
          <th className={`${metricTh} text-left px-5`}>
            <ThLabel id="si-th-domain-other" tip={SI_COL_TIPS.otherBrands}>Other brands mentioned</ThLabel>
          </th>
        </tr>
      </thead>
      <tbody>
        {domains.map(domain => (
          <tr key={domain.id} className="group hover:bg-gray-50 transition-colors">
            <td
              className={stickyIdTd}
              style={{ left: 0, width: SI_ID_COL_W, minWidth: SI_ID_COL_W, maxWidth: SI_ID_COL_W }}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <CompanyLogo
                  domain={domain.domain}
                  size={28}
                  className="mt-0.5"
                  fallback={
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Globe size={13} className="text-gray-500" />
                    </div>
                  }
                />
                <div className="min-w-0">
                  <a
                    href={`https://${domain.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] font-semibold text-primary-600 hover:underline truncate block"
                  >
                    {domain.domain}
                  </a>
                  <TypeBadge type={domain.type} />
                </div>
              </div>
            </td>
            <td
              className={stickyViewTd}
              style={{
                left: SI_STICKY_VIEW_LEFT,
                width: SI_VIEW_COL_W,
                minWidth: SI_VIEW_COL_W,
                maxWidth: SI_VIEW_COL_W,
                boxShadow: SI_STICKY_SHADOW,
              }}
            >
              <button
                type="button"
                onClick={() => onOpenDetail(domain)}
                className="text-[14px] font-medium text-primary-600 hover:underline bg-transparent border-0 p-0 cursor-pointer"
              >
                View
              </button>
            </td>
            <td className={`${metricTd} text-center`}>
              <CountButton count={domain.aiAnswers} type="ai" id={domain.id} onDetailOpen={() => onOpenDetail(domain)} />
            </td>
            <td className={`${metricTd} text-center`}>
              <CountButton count={domain.prompts} type="prompts" id={domain.id} onDetailOpen={() => onOpenDetail(domain)} />
            </td>
            <td className={`${metricTd} text-right`}>
              <CoverageBar value={domain.promptCoverage} />
            </td>
            <td className={`${metricTd} text-right`}>
              <span className={`text-[14px] font-semibold ${domain.mentionRate >= 20 ? 'text-success-600' : domain.mentionRate >= 10 ? 'text-gray-700' : 'text-gray-500'}`}>
                {domain.mentionRate}%
              </span>
            </td>
            <td className={`${metricTd} text-right`}>
              <span className="text-[14px] font-medium text-gray-900 tabular-nums">{domain.domainTraffic}</span>
            </td>
            <td className={`${metricTd} text-right`}>
              <TrustScore score={domain.domainTrust} />
            </td>
            <td className={`${metricTd} text-right`}>
              <BacklinkBadge hasBacklink={domain.hasBacklink} />
            </td>
            <td className={`${metricTd} text-right`}>
              <span className="text-[14px] font-medium text-gray-900 tabular-nums">{domain.countBacklinks ?? '—'}</span>
            </td>
            <td className={`${metricTd} text-center`}>
              <BrandMentionBadge mentioned={Boolean(domain.brandMentioned)} />
            </td>
            <td className={metricTd}>
              <BrandsCell brands={domain.competitorMention} />
            </td>
            <td className={`${metricTd} px-5`}>
              <BrandsCell brands={domain.otherBrands} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── Page Table ────────────────────────────────────────────────────────────────

function PageTable({ pages, onOpenDetail }) {
  if (!pages.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-8">
        <Search size={32} className="text-gray-200 mb-3" />
        <p className="text-[14px] font-semibold text-gray-700 mb-1">No pages found</p>
        <p className="text-[12px] text-gray-500">Try adjusting your filters or search query.</p>
      </div>
    )
  }

  const stickyIdTh = `sticky left-0 top-0 z-30 bg-gray-50 px-4 py-2.5 text-left whitespace-nowrap ${SI_TH_CLASS}`
  const stickyViewTh = `sticky top-0 z-30 bg-gray-50 px-4 py-2.5 whitespace-nowrap ${SI_TH_CLASS}`
  const stickyIdTd = 'sticky left-0 z-20 bg-white group-hover:bg-gray-50 px-4 py-3 align-top'
  const stickyViewTd = 'sticky z-20 bg-white group-hover:bg-gray-50 px-4 py-3 whitespace-nowrap align-middle'
  const metricTh = `sticky top-0 z-10 bg-gray-50 px-3 py-2.5 whitespace-nowrap ${SI_TH_CLASS}`
  const metricTd = 'px-3 py-3 align-middle whitespace-nowrap'

  return (
    <table className={SI_TABLE_CLASS}>
      <colgroup>
        <col style={{ width: SI_ID_COL_W }} />
        <col style={{ width: SI_VIEW_COL_W }} />
        <col /><col /><col /><col /><col /><col /><col /><col /><col /><col /><col /><col /><col />
      </colgroup>
      <thead>
        <tr>
          <th
            className={stickyIdTh}
            style={{ left: 0, width: SI_ID_COL_W, minWidth: SI_ID_COL_W, maxWidth: SI_ID_COL_W }}
          >
            <ThLabel id="si-th-page" tip={SI_COL_TIPS.page}>Page</ThLabel>
          </th>
          {/* Action column — no header label; padding matches Site Health Issues/View col */}
          <th
            className={stickyViewTh}
            style={{
              left: SI_STICKY_VIEW_LEFT,
              width: SI_VIEW_COL_W,
              minWidth: SI_VIEW_COL_W,
              maxWidth: SI_VIEW_COL_W,
              boxShadow: SI_STICKY_SHADOW,
            }}
            aria-label="Actions"
          />
          <th className={`${metricTh} text-center`}>
            <ThLabel id="si-th-page-ai" tip={SI_COL_TIPS.aiAnswers} align="center">AI answers</ThLabel>
          </th>
          <th className={`${metricTh} text-center`}>
            <ThLabel id="si-th-page-prompts" tip={SI_COL_TIPS.prompts} align="center">Prompts</ThLabel>
          </th>
          <th className={`${metricTh} text-right`}>
            <ThLabel id="si-th-page-pc" tip={SI_COL_TIPS.promptCoverage} align="right">Prompt coverage</ThLabel>
          </th>
          <th className={`${metricTh} text-right`}>
            <ThLabel id="si-th-page-coverage" tip={SI_COL_TIPS.coverage} align="right">Coverage</ThLabel>
          </th>
          <th className={`${metricTh} text-right`}>
            <ThLabel id="si-th-page-dtraffic" tip={SI_COL_TIPS.domainTraffic} align="right">Domain traffic</ThLabel>
          </th>
          <th className={`${metricTh} text-right`}>
            <ThLabel id="si-th-page-trust" tip={SI_COL_TIPS.domainTrust} align="right">Domain trust</ThLabel>
          </th>
          <th className={`${metricTh} text-right`}>
            <ThLabel id="si-th-page-ptraffic" tip={SI_COL_TIPS.pageTraffic} align="right">Page traffic</ThLabel>
          </th>
          <th className={`${metricTh} text-left`}>
            <ThLabel id="si-th-page-links" tip={SI_COL_TIPS.linksAvailable}>Links available to your website</ThLabel>
          </th>
          <th className={`${metricTh} text-right`}>
            <ThLabel id="si-th-page-backlink" tip={SI_COL_TIPS.backlink} align="right">Has backlink to your domain</ThLabel>
          </th>
          <th className={`${metricTh} text-right`}>
            <ThLabel id="si-th-page-bl-count" tip={SI_COL_TIPS.countBacklinks} align="right">Count of backlinks</ThLabel>
          </th>
          <th className={`${metricTh} text-center`}>
            <ThLabel id="si-th-page-brand" tip={SI_COL_TIPS.brand} align="center">Brand mentioned</ThLabel>
          </th>
          <th className={`${metricTh} text-left`}>
            <ThLabel id="si-th-page-comp" tip={SI_COL_TIPS.competitorMention}>Competitor mention</ThLabel>
          </th>
          <th className={`${metricTh} text-left px-5`}>
            <ThLabel id="si-th-page-other" tip={SI_COL_TIPS.otherBrands}>Other brands mentioned</ThLabel>
          </th>
        </tr>
      </thead>
      <tbody>
        {pages.map(page => (
          <tr key={page.id} className="group hover:bg-gray-50 transition-colors">
            <td
              className={stickyIdTd}
              style={{ left: 0, width: SI_ID_COL_W, minWidth: SI_ID_COL_W, maxWidth: SI_ID_COL_W }}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText size={13} className="text-gray-500" />
                </div>
                <div className="min-w-0 flex-1 overflow-hidden">
                  <HLTooltip
                    content={page.title}
                    variant="dark"
                    placement="top"
                    wrap
                    triggerClassName="block w-full max-w-full min-w-0"
                  >
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[14px] font-semibold text-primary-600 hover:underline truncate block w-full"
                    >
                      {page.title}
                    </a>
                  </HLTooltip>
                  <TypeBadge type={page.type} />
                </div>
              </div>
            </td>
            <td
              className={stickyViewTd}
              style={{
                left: SI_STICKY_VIEW_LEFT,
                width: SI_VIEW_COL_W,
                minWidth: SI_VIEW_COL_W,
                maxWidth: SI_VIEW_COL_W,
                boxShadow: SI_STICKY_SHADOW,
              }}
            >
              <button
                type="button"
                onClick={() => onOpenDetail(page)}
                className="text-[14px] font-medium text-primary-600 hover:underline bg-transparent border-0 p-0 cursor-pointer"
              >
                View
              </button>
            </td>
            <td className={`${metricTd} text-center`}>
              <CountButton count={page.aiAnswers} type="ai" id={page.id} onDetailOpen={() => onOpenDetail(page)} />
            </td>
            <td className={`${metricTd} text-center`}>
              <CountButton count={page.prompts} type="prompts" id={page.id} onDetailOpen={() => onOpenDetail(page)} />
            </td>
            <td className={`${metricTd} text-right`}>
              <CoverageBar value={page.promptCoverage} />
            </td>
            <td className={`${metricTd} text-right`}>
              <span className="text-[14px] font-semibold text-gray-900">{page.coverage}%</span>
            </td>
            <td className={`${metricTd} text-right`}>
              <span className="text-[14px] font-medium text-gray-900 tabular-nums">{page.domainTraffic}</span>
            </td>
            <td className={`${metricTd} text-right`}>
              <TrustScore score={page.domainTrust} />
            </td>
            <td className={`${metricTd} text-right`}>
              <span className="text-[14px] font-medium text-gray-900 tabular-nums">{page.pageTraffic}</span>
            </td>
            <td className={metricTd}>
              <LinksAvailableBadge value={page.linksAvailable} />
            </td>
            <td className={`${metricTd} text-right`}>
              <BacklinkBadge hasBacklink={page.hasBacklink} />
            </td>
            <td className={`${metricTd} text-right`}>
              <span className="text-[14px] font-medium text-gray-900 tabular-nums">{page.countBacklinks ?? '—'}</span>
            </td>
            <td className={`${metricTd} text-center`}>
              <BrandMentionBadge mentioned={page.brandMentioned} />
            </td>
            <td className={metricTd}>
              <BrandsCell brands={page.competitorMention} />
            </td>
            <td className={`${metricTd} px-5`}>
              <BrandsCell brands={page.otherBrands} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ total, page, perPage, onPage }) {
  const pages = Math.max(1, Math.ceil(total / perPage))
  const start = total === 0 ? 0 : (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
      <p className="text-[12px] text-gray-500">
        Showing <span className="font-semibold text-gray-700">{start}–{end}</span> of <span className="font-semibold text-gray-700">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-1 h-7 px-2.5 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={12} className="rotate-180" />
          Prev
        </button>
        {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => onPage(n)}
            className={`w-7 h-7 rounded-lg text-[12px] font-medium transition-colors ${
              n === page ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === pages || total === 0}
          className="flex items-center gap-1 h-7 px-2.5 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  )
}

// Matches Site Health crawled-pages footer — rows per page + page controls.
function HLPagination({ page, perPage, total, onPage, onPerPage }) {
  const PER_PAGE_OPTIONS = [10, 20, 50, 100]
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  function getPageNumbers() {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages = [1]
    if (page > 3) pages.push('…')
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) pages.push(p)
    if (page < totalPages - 2) pages.push('…')
    if (totalPages > 1) pages.push(totalPages)
    return pages
  }

  const start = total === 0 ? 0 : Math.min((page - 1) * perPage + 1, total)
  const end = Math.min(page * perPage, total)

  return (
    <div className="shrink-0 flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200 bg-white flex-wrap">
      <span className="text-[13px] text-gray-600 shrink-0">Rows per page</span>
      <div className="relative shrink-0">
        <select
          value={perPage}
          onChange={e => { onPerPage(Number(e.target.value)); onPage(1) }}
          className="appearance-none h-8 pl-3 pr-7 text-[13px] font-medium text-gray-700 border border-gray-200 rounded-lg bg-white outline-none cursor-pointer hover:border-gray-300 focus:border-primary-600 transition-colors"
        >
          {PER_PAGE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" />
      </div>

      <span className="text-[13px] text-gray-500 shrink-0 min-w-[90px]">{start} – {end} of {total}</span>

      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="h-8 px-3 text-[13px] font-medium rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
      >
        Previous
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-[13px] text-gray-500">...</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              className={`w-8 h-8 flex items-center justify-center text-[13px] font-medium rounded-lg border transition-colors ${
                page === p
                  ? 'border-primary-600 text-primary-700 font-semibold'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages || total === 0}
        className="h-8 px-3 text-[13px] font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
      >
        Next
      </button>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SourceInventoryContent() {
  const [view, setView] = useState('domain')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [activeRules, setActiveRules] = useState([])
  const [showFilterDrawer, setShowFilterDrawer] = useState(false)
  const [selectedSource, setSelectedSource] = useState(null)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  function handleViewChange(v) {
    setView(v)
    setSelectedSource(null)
    setSearch('')
    setPage(1)
  }

  // Filter logic
  const rawDomains = DOMAIN_DATA.filter(d => {
    if (sourceFilter === 'mentioned' && d.brandMentioned === 0) return false
    if (sourceFilter === 'not-mentioned' && d.brandMentioned > 0) return false
    if (search) {
      const q = search.toLowerCase()
      if (!d.domain.toLowerCase().includes(q)) return false
    }
    if (activeRules.length && !activeRules.every(rule => applySiFilterRule(d, rule))) return false
    return true
  })

  const rawPages = PAGE_DATA.filter(p => {
    if (sourceFilter === 'mentioned' && !p.brandMentioned) return false
    if (sourceFilter === 'not-mentioned' && p.brandMentioned) return false
    if (search) {
      const q = search.toLowerCase()
      if (!(p.title + p.url + p.domain).toLowerCase().includes(q)) return false
    }
    if (activeRules.length && !activeRules.every(rule => applySiFilterRule(p, rule))) return false
    return true
  })

  const totalRows = view === 'domain' ? rawDomains.length : rawPages.length
  const maxPage = Math.max(1, Math.ceil(totalRows / perPage) || 1)
  const safePage = Math.min(page, maxPage)
  const pagedDomains = rawDomains.slice((safePage - 1) * perPage, safePage * perPage)
  const pagedPages = rawPages.slice((safePage - 1) * perPage, safePage * perPage)

  if (selectedSource) {
    return (
      <div className="h-full min-h-0 overflow-y-auto" style={{ scrollbarGutter: 'stable' }}>
        <SourceAnswersDetailView
          source={selectedSource}
          onBack={() => setSelectedSource(null)}
        />
      </div>
    )
  }

  return (
    <div className="h-full min-h-0 flex flex-col gap-4">

      {/* KPI cards */}
      <div className="shrink-0 grid grid-cols-4 gap-4">
        <CountCard
          label="Mention opportunities"
          value="15"
          Icon={Search}
          iconColor="var(--primary-600)"
          helpContent="Shows the number of sources where your brand could gain visibility. These are places where competitors are already being mentioned but your brand is missing or has limited presence. More opportunities mean more growth potential."
        />
        <CountCard
          label="Competitor-only mentions"
          value="6"
          Icon={Users}
          iconColor="var(--error-600)"
          helpContent="Shows how many sources mention your competitors but not your brand. These are high-priority gaps because AI is already recommending competitors for topics where you could also appear. Lower is better."
        />
        <CountCard
          label="New opportunities (7d)"
          value="3"
          Icon={TrendingUp}
          iconColor="var(--success-600)"
          helpContent="Shows new mention opportunities discovered in the last 7 days. It helps you spot fresh content gaps and act on emerging opportunities before they become more competitive. More new opportunities mean more areas to expand your visibility."
        />
        <CountCard
          label="Mentions without backlinks"
          value="7"
          Icon={Link2}
          iconColor="var(--warning-600)"
          helpContent="Shows how often AI mentions your brand without linking to your website. These mentions indicate brand recognition, but adding citations can improve authority and drive more traffic. Lower is better."
        />
      </div>

      {/* Source Inventory card — fills remaining height; table scrolls, pagination stays pinned */}
      <div className="flex-1 min-h-0 border border-gray-200 rounded-lg bg-white overflow-hidden flex flex-col">

        {/* Card header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-semibold text-gray-900">Source inventory</span>
            <SectionInfoTip
              id="source-inventory-info"
              content={
                view === 'domain'
                  ? 'Prioritize sources where competitors are mentioned repeatedly while your brand is either absent or unlinked. These are the fastest content refresh and outreach opportunities in the current set. Domain-level coverage, mention rate, and trust context.'
                  : 'Prioritize sources where competitors are mentioned repeatedly while your brand is either absent or unlinked. These are the fastest content refresh and outreach opportunities in the current set. Page-level source pages with AI answers, prompts, and cache copies.'
              }
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* View switcher */}
            <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-gray-50">
              {['domain', 'page'].map(v => (
                <button
                  key={v}
                  onClick={() => handleViewChange(v)}
                  className={`px-3 py-1.5 rounded-md text-[14px] font-medium transition-all ${
                    view === v
                      ? 'bg-white shadow-sm border border-gray-200 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {v === 'domain' ? 'Domain view' : 'Page view'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Toolbar — filters on the left, search on the right (HighRise table pattern) */}
        <div className="shrink-0 px-5 py-3 flex items-center gap-2 border-b border-gray-100 flex-wrap">
          {/* Source mention filter chip */}
          <SourceFilterChip value={sourceFilter} onChange={id => { setSourceFilter(id); setPage(1) }} />

          <AdvancedFilterTrigger
            activeCount={activeRules.length}
            onClick={() => setShowFilterDrawer(true)}
            onClear={() => { setActiveRules([]); setPage(1) }}
          />

          {/* Search — right-aligned */}
          <div className="ml-auto relative shrink-0" style={{ width: 280 }}>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder={view === 'domain' ? 'Search domains, brands, or metrics' : 'Search pages, URLs, brands, or metrics'}
              className="w-full h-8 pl-9 pr-3 rounded-lg border border-gray-300 bg-white text-[14px] text-gray-900 placeholder:text-[14px] placeholder:text-gray-400 outline-none focus:border-primary-600 transition-colors"
            />
          </div>
        </div>

        {/* Scrollable table body */}
        <div className="flex-1 min-h-0 min-w-0 overflow-auto" style={{ scrollbarGutter: 'stable' }}>
          {view === 'domain' ? (
            <DomainTable
              domains={pagedDomains}
              onOpenDetail={setSelectedSource}
            />
          ) : (
            <PageTable
              pages={pagedPages}
              onOpenDetail={setSelectedSource}
            />
          )}
        </div>

        {/* Pagination pinned below the scroll area */}
        {totalRows > 0 && (
          <HLPagination
            total={totalRows}
            page={safePage}
            perPage={perPage}
            onPage={setPage}
            onPerPage={p => { setPerPage(p); setPage(1) }}
          />
        )}
      </div>

      <AdvancedFilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        columnOptions={SI_FILTER_COLS}
        onApply={rules => { setActiveRules(rules); setPage(1) }}
      />
    </div>
  )
}
