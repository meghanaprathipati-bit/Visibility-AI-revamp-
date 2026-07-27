import { useState, useRef, useEffect, Fragment } from 'react'
import { createPortal } from 'react-dom'
import {
  Search, Globe, ChevronDown, X, ExternalLink,
  HelpCircle, Check, Zap, Link2, FileText,
  TrendingUp, Users, ChevronRight,
} from '../../icons/index.js'
import CountCard from '../CountCard.jsx'
import CompanyLogo from '../CompanyLogo.jsx'

// ── Constants ─────────────────────────────────────────────────────────────────

// Fixed width for the leading expand-chevron column (matches Site health tables).
const EXPAND_COL = 40

const FILTER_METRICS = [
  'Prompt Coverage', 'Coverage', 'Mention Rate',
  'Competitor Mention', 'Other Brands Mentioned',
  'Domain Traffic', 'Domain Trust',
  'Has Backlink To Your Domain',
  'Links Available To Your Website',
  'Brand Mentioned', 'Count of Backlinks',
  'Page Traffic', 'Referring Domains',
]

const FILTER_OPERATORS = ['At least', 'At most', 'Equals']

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

// Build a descending date label (e.g. "Jul 22, 2026") offset by `i` days.
function detailDate(i) {
  const base = new Date(2026, 6, 22)
  base.setDate(base.getDate() - i)
  return base.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Synthesize `count` rows for the expanded AI answers / prompts table.
function buildDetailRows(count, kind) {
  const engines = kind === 'ai'
    ? ['ChatGPT', 'Google AI Overview']
    : ['ChatGPT', 'Google AI Overview', 'Perplexity']
  return Array.from({ length: Math.max(0, count) }, (_, i) => ({
    id: i,
    prompt: DETAIL_PROMPT_POOL[i % DETAIL_PROMPT_POOL.length],
    engine: engines[i % engines.length],
    date: detailDate(i),
    cacheUrl: '#',
  }))
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium whitespace-nowrap ${cfg}`}>
      {engine}
    </span>
  )
}

function TypeBadge({ type }) {
  const isOwned = type === 'Owned domain' || type === 'Owned page'
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium mt-0.5 ${
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
    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-success-600">
      <Check size={11} strokeWidth={2.5} />Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[12px] font-medium text-gray-400">
      <X size={11} strokeWidth={2.5} />No
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
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-success-50 text-success-700">
        Owned page
      </span>
    )
  }
  if (value === 'yes') {
    return <span className="text-[12px] font-semibold text-success-600">Yes</span>
  }
  return <span className="text-[12px] font-semibold text-error-600">No</span>
}

function TrustScore({ score }) {
  const color = score >= 80 ? 'text-success-600' : score >= 60 ? 'text-warning-600' : 'text-error-600'
  return (
    <span className={`text-[13px] font-semibold ${color}`}>
      {score}<span className="text-gray-400 font-normal text-[11px]">/100</span>
    </span>
  )
}

// Prompt coverage: percentage only (no progress bar), medium weight.
function CoverageBar({ value }) {
  return <span className="block text-right text-[13px] font-medium text-gray-900">{value}%</span>
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
        onClick={e => { e.stopPropagation(); hide(); onDetailOpen(type === 'ai' ? 'AI Answers' : 'Prompts') }}
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
          <p className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mb-1">
            {type === 'ai' ? 'AI Answers' : 'Prompts'}
          </p>
          <p className="text-[22px] font-bold text-gray-900 leading-none mb-0.5">{count}</p>
          <p className="text-[11px] text-gray-400 mb-3">Total in current set · Jul 4–7, 2026</p>
          <div className="flex flex-col gap-1.5 border-t border-gray-100 pt-2.5">
            {Object.entries(breakdown).map(([eng, n]) => (
              <div key={eng} className="flex items-center justify-between gap-2">
                <AiEngineTag engine={eng} />
                <span className="text-[12px] font-bold text-gray-800">{n}</span>
              </div>
            ))}
          </div>
          <button
            onMouseDown={e => { e.preventDefault(); hide(); onDetailOpen(type === 'ai' ? 'AI Answers' : 'Prompts') }}
            className="mt-3 text-[11px] font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-0.5"
          >
            View all <ChevronRight size={10} />
          </button>
        </div>,
        document.body
      )}
    </>
  )
}

// ── Filter Components ─────────────────────────────────────────────────────────

function FilterChip({ filter, onRemove }) {
  const sym = filter.operator === 'At least' ? '≥' : filter.operator === 'At most' ? '≤' : '='
  return (
    <div className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1 rounded-full border border-primary-200 bg-primary-50 text-[12px] font-medium text-primary-700 shrink-0">
      <span>{filter.metric} {sym} {filter.value}</span>
      <button
        onClick={onRemove}
        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-primary-200 transition-colors"
      >
        <X size={10} className="text-primary-500" />
      </button>
    </div>
  )
}

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
        className="inline-flex items-center gap-2 h-8 pl-3 pr-2 rounded-full border border-gray-300 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span>Source</span>
        <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[12px]">{current.badge}</span>
        {value !== 'all' ? (
          <span
            role="button"
            onClick={e => { e.stopPropagation(); onChange('all'); setOpen(false) }}
            className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
          >
            <X size={11} className="text-gray-400" />
          </span>
        ) : (
          <ChevronDown size={13} className="text-gray-400" />
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

function FilterBuilderRow({ onAdd, onCancel }) {
  const [metric, setMetric] = useState('Prompt Coverage')
  const [operator, setOperator] = useState('At least')
  const [value, setValue] = useState('')
  const [metricOpen, setMetricOpen] = useState(false)
  const [opOpen, setOpOpen] = useState(false)
  const metricRef = useRef(null)
  const opRef = useRef(null)

  useEffect(() => {
    function handle(e) {
      if (metricRef.current && !metricRef.current.contains(e.target)) setMetricOpen(false)
      if (opRef.current && !opRef.current.contains(e.target)) setOpOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function apply() {
    if (!value.trim()) return
    onAdd({ metric, operator, value: value.trim() })
    setValue('')
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Metric */}
      <div ref={metricRef} className="relative">
        <button
          onClick={() => setMetricOpen(o => !o)}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 bg-white text-[12px] font-medium text-gray-700 hover:border-gray-300 transition-colors"
        >
          {metric} <ChevronDown size={10} className="text-gray-400 shrink-0" />
        </button>
        {metricOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl z-50 p-1 max-h-[260px] overflow-y-auto" style={{ minWidth: 210, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}>
            {FILTER_METRICS.map(m => (
              <button key={m} onClick={() => { setMetric(m); setMetricOpen(false) }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12px] text-left transition-colors ${metric === m ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
                <span className={metric === m ? 'text-primary-700 font-semibold' : 'text-gray-700'}>{m}</span>
                {metric === m && <Check size={11} className="text-primary-600 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Operator */}
      <div ref={opRef} className="relative">
        <button
          onClick={() => setOpOpen(o => !o)}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 bg-white text-[12px] font-medium text-gray-700 hover:border-gray-300 transition-colors"
        >
          {operator} <ChevronDown size={10} className="text-gray-400 shrink-0" />
        </button>
        {opOpen && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl z-50 p-1" style={{ minWidth: 140, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}>
            {FILTER_OPERATORS.map(op => (
              <button key={op} onClick={() => { setOperator(op); setOpOpen(false) }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12px] transition-colors ${operator === op ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
                <span className={operator === op ? 'text-primary-700 font-semibold' : 'text-gray-700'}>{op}</span>
                {operator === op && <Check size={11} className="text-primary-600 shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Value */}
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && apply()}
        placeholder="Value"
        className="h-8 w-24 px-3 rounded-lg border border-gray-300 bg-white text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary-600 transition-colors"
      />

      <button onClick={apply} className="h-8 px-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[12px] font-semibold transition-colors">
        Apply
      </button>
      <button onClick={onCancel} className="h-8 px-3 rounded-lg border border-gray-200 hover:bg-gray-50 text-[12px] text-gray-600 transition-colors">
        Cancel
      </button>
    </div>
  )
}

// ── Expanded row detail ───────────────────────────────────────────────────────
// Inline expandable detail (matches Site health "Found resources" tables): a
// left-inset white card with a content switcher toggling between the AI answers
// and Prompts tables (prompt · AI engine · date · cached copy).

function NestedDetailTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100">
            {columns.map(col => (
              <th
                key={col.key}
                className={`px-4 py-2.5 text-[12px] font-medium text-gray-900 whitespace-nowrap ${col.className || ''} ${col.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40">
              {columns.map(col => (
                <td key={col.key} className={`px-4 py-2.5 align-top ${col.align === 'right' ? 'text-right' : ''}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Segmented content switcher (mirrors HighRise HLContentSwitcher).
function ContentSwitcher({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden bg-white">
      {options.map((opt, i) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={e => { e.stopPropagation(); onChange(opt.value) }}
            className={`px-4 py-1.5 text-[13px] font-medium transition-colors ${i > 0 ? 'border-l border-gray-200' : ''} ${
              active ? 'bg-primary-50 text-primary-700' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

const DETAIL_ROWS_PER_PAGE = 10

function SourceExpandedDetail({ source, colSpan, tab, onTabChange }) {
  const [page, setPage] = useState(1)

  // Reset to the first page whenever the active content tab changes.
  useEffect(() => { setPage(1) }, [tab])

  const total = tab === 'ai' ? source.aiAnswers : source.prompts
  const rows = buildDetailRows(total, tab)
  const paged = rows.slice((page - 1) * DETAIL_ROWS_PER_PAGE, page * DETAIL_ROWS_PER_PAGE)

  const columns = [
    { key: 'prompt', label: 'Prompt', render: r => <span className="text-[12px] text-gray-700 line-clamp-1 block max-w-[520px]">{r.prompt}</span> },
    { key: 'engine', label: 'AI engine', className: 'w-[150px]', render: r => <AiEngineTag engine={r.engine} /> },
    { key: 'date',   label: 'Date',   className: 'w-[120px]', render: r => <span className="text-[12px] text-gray-500 whitespace-nowrap">{r.date}</span> },
    { key: 'cache',  label: 'Cached copy', className: 'w-[130px]', render: r => <a href={r.cacheUrl} onClick={e => e.stopPropagation()} className="text-[12px] font-medium text-primary-600 hover:underline whitespace-nowrap">View cache copy</a> },
  ]

  return (
    <tr className="border-b border-gray-100 bg-gray-50/40">
      <td colSpan={colSpan} className="p-0">
        <div className="flex pb-3 pr-4">
          <div className="shrink-0" style={{ width: EXPAND_COL, minWidth: EXPAND_COL }} />
          <div className="flex-1 min-w-0 rounded-lg border border-gray-100 bg-white overflow-hidden">
            {/* Content switcher: AI answers ↔ Prompts */}
            <div className="px-4 py-3" onClick={e => e.stopPropagation()}>
              <ContentSwitcher
                options={[{ value: 'ai', label: 'AI answers' }, { value: 'prompts', label: 'Prompts' }]}
                value={tab}
                onChange={onTabChange}
              />
            </div>

            <NestedDetailTable columns={columns} rows={paged} />

            <Pagination total={total} page={page} perPage={DETAIL_ROWS_PER_PAGE} onPage={setPage} />
          </div>
        </div>
      </td>
    </tr>
  )
}

// ── Domain Table ──────────────────────────────────────────────────────────────

function DomainTable({ domains, expandedId, expandedTab, onToggleExpand, onTabChange }) {
  if (!domains.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-8">
        <Search size={32} className="text-gray-200 mb-3" />
        <p className="text-[14px] font-semibold text-gray-700 mb-1">No domains found</p>
        <p className="text-[12px] text-gray-400">Try adjusting your filters or search query.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ minWidth: 720 }}>
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-3 bg-gray-50" style={{ width: EXPAND_COL, minWidth: EXPAND_COL, maxWidth: EXPAND_COL }} />
            <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-900 bg-gray-50" style={{ minWidth: 200 }}>Domain</th>
            <th className="px-3 py-3 text-center text-[12px] font-semibold text-gray-900 bg-gray-50" style={{ width: 100 }}>AI answers</th>
            <th className="px-3 py-3 text-center text-[12px] font-semibold text-gray-900 bg-gray-50" style={{ width: 90 }}>Prompts</th>
            <th className="px-3 py-3 text-right text-[12px] font-semibold text-gray-900 bg-gray-50" style={{ width: 130 }}>Prompt coverage</th>
            <th className="px-3 py-3 text-right text-[12px] font-semibold text-gray-900 bg-gray-50" style={{ width: 100 }}>Mention rate</th>
            <th className="px-3 py-3 text-right text-[12px] font-semibold text-gray-900 bg-gray-50" style={{ width: 100 }}>Domain trust</th>
            <th className="px-3 py-3 text-right text-[12px] font-semibold text-gray-900 bg-gray-50 pr-5" style={{ width: 90 }}>Backlink</th>
          </tr>
        </thead>
        <tbody>
          {domains.map(domain => {
            const isExpanded = expandedId === domain.id
            return (
              <Fragment key={domain.id}>
                <tr
                  onClick={() => onToggleExpand(domain.id)}
                  className={`border-b border-gray-100 cursor-pointer transition-colors ${
                    isExpanded ? 'bg-gray-50/70' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="py-3" style={{ width: EXPAND_COL, minWidth: EXPAND_COL, maxWidth: EXPAND_COL }}>
                    <button
                      onClick={e => { e.stopPropagation(); onToggleExpand(domain.id) }}
                      className="flex items-center justify-center w-6 h-6 mx-auto rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                    >
                      <ChevronDown size={14} className={`transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <CompanyLogo
                        domain={domain.domain}
                        size={28}
                        className="mt-0.5"
                        fallback={
                          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Globe size={13} className="text-gray-400" />
                          </div>
                        }
                      />
                      <div className="min-w-0">
                        <a
                          href={`https://${domain.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-[13px] font-semibold text-primary-600 hover:underline truncate block"
                        >
                          {domain.domain}
                        </a>
                        <TypeBadge type={domain.type} />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}>
                    <CountButton count={domain.aiAnswers} type="ai" id={domain.id} onDetailOpen={() => onToggleExpand(domain.id, 'ai')} />
                  </td>
                  <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}>
                    <CountButton count={domain.prompts} type="prompts" id={domain.id} onDetailOpen={() => onToggleExpand(domain.id, 'prompts')} />
                  </td>
                  <td className="px-3 py-3 pr-4">
                    <CoverageBar value={domain.promptCoverage} />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className={`text-[13px] font-semibold ${domain.mentionRate >= 20 ? 'text-success-600' : domain.mentionRate >= 10 ? 'text-gray-700' : 'text-gray-500'}`}>
                      {domain.mentionRate}%
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <TrustScore score={domain.domainTrust} />
                  </td>
                  <td className="px-3 py-3 pr-5 text-right">
                    <BacklinkBadge hasBacklink={domain.hasBacklink} />
                  </td>
                </tr>
                {isExpanded && <SourceExpandedDetail source={domain} colSpan={8} tab={expandedTab} onTabChange={t => onTabChange(t)} />}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Page Table ────────────────────────────────────────────────────────────────

function PageTable({ pages, expandedId, expandedTab, onToggleExpand, onTabChange }) {
  if (!pages.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-8">
        <Search size={32} className="text-gray-200 mb-3" />
        <p className="text-[14px] font-semibold text-gray-700 mb-1">No pages found</p>
        <p className="text-[12px] text-gray-400">Try adjusting your filters or search query.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ minWidth: 800 }}>
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-3 bg-gray-50" style={{ width: EXPAND_COL, minWidth: EXPAND_COL, maxWidth: EXPAND_COL }} />
            <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-900 bg-gray-50" style={{ minWidth: 240 }}>Page</th>
            <th className="px-3 py-3 text-center text-[12px] font-semibold text-gray-900 bg-gray-50" style={{ width: 100 }}>AI answers</th>
            <th className="px-3 py-3 text-center text-[12px] font-semibold text-gray-900 bg-gray-50" style={{ width: 90 }}>Prompts</th>
            <th className="px-3 py-3 text-right text-[12px] font-semibold text-gray-900 bg-gray-50" style={{ width: 130 }}>Prompt coverage</th>
            <th className="px-3 py-3 text-right text-[12px] font-semibold text-gray-900 bg-gray-50" style={{ width: 90 }}>Coverage</th>
            <th className="px-3 py-3 text-center text-[12px] font-semibold text-gray-900 bg-gray-50" style={{ width: 90 }}>Brand</th>
            <th className="px-3 py-3 text-right text-[12px] font-semibold text-gray-900 bg-gray-50 pr-5" style={{ width: 90 }}>Backlink</th>
          </tr>
        </thead>
        <tbody>
          {pages.map(page => {
            const isExpanded = expandedId === page.id
            return (
              <Fragment key={page.id}>
                <tr
                  onClick={() => onToggleExpand(page.id)}
                  className={`border-b border-gray-100 cursor-pointer transition-colors ${
                    isExpanded ? 'bg-gray-50/70' : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="py-3" style={{ width: EXPAND_COL, minWidth: EXPAND_COL, maxWidth: EXPAND_COL }}>
                    <button
                      onClick={e => { e.stopPropagation(); onToggleExpand(page.id) }}
                      className="flex items-center justify-center w-6 h-6 mx-auto rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                    >
                      <ChevronDown size={14} className={`transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText size={13} className="text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-[13px] font-semibold text-primary-600 hover:underline line-clamp-1 block"
                        >
                          {page.title}
                        </a>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5 flex items-center gap-1">
                          <span className="truncate">{page.url.replace('https://', '')}</span>
                          <ExternalLink size={9} className="text-gray-300 shrink-0" />
                        </p>
                        <TypeBadge type={page.type} />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}>
                    <CountButton count={page.aiAnswers} type="ai" id={page.id} onDetailOpen={() => onToggleExpand(page.id, 'ai')} />
                  </td>
                  <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}>
                    <CountButton count={page.prompts} type="prompts" id={page.id} onDetailOpen={() => onToggleExpand(page.id, 'prompts')} />
                  </td>
                  <td className="px-3 py-3 pr-4">
                    <CoverageBar value={page.promptCoverage} />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <span className="text-[13px] font-semibold text-gray-900">{page.coverage}%</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <BrandMentionBadge mentioned={page.brandMentioned} />
                  </td>
                  <td className="px-3 py-3 pr-5 text-right">
                    <BacklinkBadge hasBacklink={page.hasBacklink} />
                  </td>
                </tr>
                {isExpanded && <SourceExpandedDetail source={page} colSpan={8} tab={expandedTab} onTabChange={t => onTabChange(t)} />}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({ total, page, perPage, onPage }) {
  const pages = Math.ceil(total / perPage)
  const start = (page - 1) * perPage + 1
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
          disabled={page === pages}
          className="flex items-center gap-1 h-7 px-2.5 rounded-lg border border-gray-200 text-[12px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SourceInventoryContent() {
  const [view, setView] = useState('domain')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [appliedFilters, setAppliedFilters] = useState([])
  const [filterBuilderVisible, setFilterBuilderVisible] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [expandedTab, setExpandedTab] = useState('ai')
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  // Toggle inline row expansion. Passing a `tab` ('ai' | 'prompts') — used by the
  // AI answers / Prompts count buttons — opens the row on that tab instead of
  // toggling it closed. A row/chevron click (no tab) toggles and defaults to 'ai'.
  function toggleExpand(id, tab) {
    if (expandedId === id && !tab) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    setExpandedTab(tab || 'ai')
  }

  function handleAddFilter(filter) {
    setAppliedFilters(prev => [...prev, { ...filter, id: Date.now() }])
    setFilterBuilderVisible(false)
  }

  function handleRemoveFilter(id) {
    setAppliedFilters(prev => prev.filter(f => f.id !== id))
  }

  function handleViewChange(v) {
    setView(v)
    setExpandedId(null)
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
    return true
  })

  const rawPages = PAGE_DATA.filter(p => {
    if (sourceFilter === 'mentioned' && !p.brandMentioned) return false
    if (sourceFilter === 'not-mentioned' && p.brandMentioned) return false
    if (search) {
      const q = search.toLowerCase()
      if (!(p.title + p.url + p.domain).toLowerCase().includes(q)) return false
    }
    return true
  })

  const totalRows = view === 'domain' ? rawDomains.length : rawPages.length
  const pagedDomains = rawDomains.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const pagedPages = rawPages.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="flex flex-col gap-4">

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <CountCard label="Mention opportunities" value="15" Icon={Search} iconColor="var(--primary-600)" help />
        <CountCard label="Competitor-only mentions" value="6" Icon={Users} iconColor="var(--error-600)" help />
        <CountCard label="New opportunities (7d)" value="3" Icon={TrendingUp} iconColor="var(--success-600)" help />
        <CountCard label="Mentions without backlinks" value="7" Icon={Link2} iconColor="var(--warning-600)" help />
      </div>

      {/* Insight banner */}
      <div className="flex items-start gap-3 px-4 py-3.5 rounded-lg bg-warning-50 border border-warning-300">
        <Zap size={14} className="text-warning-600 shrink-0 mt-0.5" />
        <p className="text-[13px] text-gray-700 leading-relaxed">
          Prioritize sources where competitors are mentioned repeatedly while your brand is either absent or unlinked. These are the fastest content refresh and outreach opportunities in the current set.
        </p>
      </div>

      {/* Source Inventory card */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">

        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-semibold text-gray-900">Source inventory</span>
              <HelpCircle size={13} className="text-gray-300" />
            </div>
            <p className="text-[12px] text-gray-400 mt-0.5">
              {view === 'domain'
                ? 'Domain-level coverage, mention rate, and trust context'
                : 'Page-level source pages with AI answers, prompts, and cache copies'}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* View switcher */}
            <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-gray-50">
              {['domain', 'page'].map(v => (
                <button
                  key={v}
                  onClick={() => handleViewChange(v)}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
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
        <div className="px-5 py-3 flex items-center gap-2 border-b border-gray-100 flex-wrap">
          {/* Source mention filter chip */}
          <SourceFilterChip value={sourceFilter} onChange={id => { setSourceFilter(id); setPage(1) }} />

          {filterBuilderVisible ? (
            <FilterBuilderRow onAdd={handleAddFilter} onCancel={() => setFilterBuilderVisible(false)} />
          ) : (
            <button
              onClick={() => setFilterBuilderVisible(true)}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border border-gray-300 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap shrink-0"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
              </svg>
              Advanced filter
            </button>
          )}

          {/* Search — right-aligned */}
          <div className="ml-auto relative shrink-0" style={{ width: 280 }}>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder={view === 'domain' ? 'Search domains, brands, or metrics' : 'Search pages, URLs, brands, or metrics'}
              className="w-full h-8 pl-9 pr-3 rounded-lg border border-gray-300 bg-white text-[14px] text-gray-900 placeholder:text-[14px] placeholder:text-gray-400 outline-none focus:border-primary-600 transition-colors"
            />
          </div>
        </div>

        {/* Applied filter chips */}
        {appliedFilters.length > 0 && (
          <div className="px-5 py-2.5 flex items-center gap-2 border-b border-gray-100 flex-wrap">
            <span className="text-[11px] font-medium text-gray-400 mr-1">Filters:</span>
            {appliedFilters.map(f => (
              <FilterChip key={f.id} filter={f} onRemove={() => handleRemoveFilter(f.id)} />
            ))}
            <button
              onClick={() => setAppliedFilters([])}
              className="text-[12px] text-gray-400 hover:text-gray-600 ml-1 font-medium"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Table with inline expandable rows */}
        <div className="min-w-0" style={{ minHeight: 360 }}>
          {view === 'domain' ? (
            <DomainTable
              domains={pagedDomains}
              expandedId={expandedId}
              expandedTab={expandedTab}
              onToggleExpand={toggleExpand}
              onTabChange={setExpandedTab}
            />
          ) : (
            <PageTable
              pages={pagedPages}
              expandedId={expandedId}
              expandedTab={expandedTab}
              onToggleExpand={toggleExpand}
              onTabChange={setExpandedTab}
            />
          )}
          {totalRows > PER_PAGE && (
            <Pagination total={totalRows} page={page} perPage={PER_PAGE} onPage={setPage} />
          )}
        </div>
      </div>
    </div>
  )
}
