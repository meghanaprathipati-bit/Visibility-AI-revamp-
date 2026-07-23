import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  Search, Globe, ChevronDown, X, Plus, ExternalLink,
  HelpCircle, Check, Zap, Link2, FileText,
  Calendar, TrendingUp, Users, Settings, BarChart3,
  ChevronRight,
} from '../../icons/index.js'

// ── Constants ─────────────────────────────────────────────────────────────────

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

const DETAIL_TABS = ['Overview', 'AI Answers', 'Prompts', 'Competitors', 'Authority', 'Backlinks', 'Timeline']

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
    title: 'Go High Level Pricing & AI Visibility Plans',
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
    title: 'Go High Level vs Traditional AI Rank Tracking Tools',
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
    title: 'How AI Citations Work for Go High Level',
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

const SAMPLE_AI_ANSWERS = [
  { id: 1, date: 'Jul 7, 2026', engine: 'Google AI Overview', prompt: 'What are the best AI visibility platforms for multi-location brands?', cacheUrl: '#' },
  { id: 2, date: 'Jul 6, 2026', engine: 'ChatGPT', prompt: 'What are the best AI visibility platforms for multi-location brands?', cacheUrl: '#' },
  { id: 3, date: 'Jul 5, 2026', engine: 'Google AI Overview', prompt: 'What are the best AI visibility platforms for multi-location brands?', cacheUrl: '#' },
  { id: 4, date: 'Jul 4, 2026', engine: 'ChatGPT', prompt: 'What are the best AI visibility platforms for multi-location brands?', cacheUrl: '#' },
  { id: 5, date: 'Jul 3, 2026', engine: 'Google AI Overview', prompt: 'What are the best AI visibility platforms for multi-location brands?', cacheUrl: '#' },
  { id: 6, date: 'Jul 7, 2026', engine: 'ChatGPT', prompt: 'How do AI search engines rank CRM tools for small agencies?', cacheUrl: '#' },
  { id: 7, date: 'Jul 6, 2026', engine: 'Perplexity', prompt: 'How do AI search engines rank CRM tools for small agencies?', cacheUrl: '#' },
  { id: 8, date: 'Jul 5, 2026', engine: 'ChatGPT', prompt: 'Which marketing automation platforms appear most in AI answers for agencies?', cacheUrl: '#' },
]

const SAMPLE_PROMPTS = [
  { id: 1, prompt: 'What are the best AI visibility platforms for multi-location brands?', engine: 'ChatGPT', date: 'Jul 7, 2026', cacheUrl: '#' },
  { id: 2, prompt: 'What are the best AI visibility platforms for multi-location brands?', engine: 'Google AI Overview', date: 'Jul 6, 2026', cacheUrl: '#' },
  { id: 3, prompt: 'How do AI search engines rank CRM tools for small agencies?', engine: 'ChatGPT', date: 'Jul 7, 2026', cacheUrl: '#' },
  { id: 4, prompt: 'How do AI search engines rank CRM tools for small agencies?', engine: 'Perplexity', date: 'Jul 6, 2026', cacheUrl: '#' },
  { id: 5, prompt: 'Which marketing automation platforms appear most in AI answers for agencies?', engine: 'Google AI Overview', date: 'Jul 5, 2026', cacheUrl: '#' },
  { id: 6, prompt: 'Which marketing automation platforms appear most in AI answers for agencies?', engine: 'ChatGPT', date: 'Jul 4, 2026', cacheUrl: '#' },
]

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

function BacklinkBadge({ hasBacklink }) {
  return hasBacklink ? (
    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-success-600">
      <Check size={11} strokeWidth={2.5} />Yes
    </span>
  ) : (
    <span className="text-[12px] text-gray-400">—</span>
  )
}

function BrandMentionBadge({ mentioned }) {
  return mentioned ? (
    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-success-600">
      <Check size={11} strokeWidth={2.5} />Yes
    </span>
  ) : (
    <span className="text-[12px] text-gray-400">No</span>
  )
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

function CoverageBar({ value, max = 100 }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-semibold text-gray-900 w-9 text-right shrink-0">{value}%</span>
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 min-w-[40px]">
        <div className="h-full rounded-full bg-primary-400" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
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
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50 text-[12px] font-semibold text-gray-700 transition-all group"
      >
        {count}
        <ChevronDown size={10} className="text-gray-400 group-hover:text-primary-500" />
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
        className="h-8 w-24 px-3 rounded-lg border border-gray-200 bg-white text-[12px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-primary-400 transition-colors"
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

// ── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, Icon, iconBg, iconColor }) {
  return (
    <div className="flex-1 min-w-0 border border-gray-200 rounded-lg bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[12px] text-gray-500">{label}</span>
            <HelpCircle size={12} className="text-gray-300" />
          </div>
          <p className="text-[24px] font-bold text-gray-900 leading-none">{value}</p>
        </div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon size={15} className={iconColor} />
        </div>
      </div>
    </div>
  )
}

// ── Detail Panel Tabs ─────────────────────────────────────────────────────────

function MetricRow({ label, children }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-b-0">
      <span className="text-[12px] text-gray-500">{label}</span>
      <div className="text-right">{children}</div>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <p className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mb-2 mt-4 first:mt-0">
      {children}
    </p>
  )
}

function OverviewTab({ source, view }) {
  const breakdown = getEngineBreakdown(source.id, source.aiAnswers)
  const isDomain = view === 'domain'

  return (
    <div className="p-4 pb-6">
      {/* AI engine breakdown */}
      <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">AI engine breakdown</p>
          <span className="text-[11px] font-bold text-gray-700">{source.aiAnswers} total</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {Object.entries(breakdown).map(([eng, n]) => (
            <div key={eng} className="flex items-center justify-between">
              <AiEngineTag engine={eng} />
              <span className="text-[12px] font-bold text-gray-700">{n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Visibility */}
      <SectionTitle>Visibility</SectionTitle>
      <div className="rounded-lg border border-gray-100 overflow-hidden mb-0.5">
        <MetricRow label="Prompt coverage">
          <span className="text-[13px] font-semibold text-gray-900">{source.promptCoverage}%</span>
        </MetricRow>
        <MetricRow label="Coverage">
          <span className="text-[13px] font-semibold text-gray-900">{source.coverage}%</span>
        </MetricRow>
        {isDomain && (
          <MetricRow label="Mention rate">
            <span className={`text-[13px] font-semibold ${source.mentionRate >= 20 ? 'text-success-600' : 'text-gray-900'}`}>
              {source.mentionRate}%
            </span>
          </MetricRow>
        )}
        <MetricRow label="AI answers"><span className="text-[13px] font-semibold text-gray-900">{source.aiAnswers}</span></MetricRow>
        <MetricRow label="Prompts tracked"><span className="text-[13px] font-semibold text-gray-900">{source.prompts}</span></MetricRow>
        {isDomain && (
          <MetricRow label="Pages tracked"><span className="text-[13px] font-semibold text-gray-900">{source.pages}</span></MetricRow>
        )}
      </div>

      {/* Authority */}
      <SectionTitle>Authority</SectionTitle>
      <div className="rounded-lg border border-gray-100 overflow-hidden mb-0.5">
        <MetricRow label="Domain trust"><TrustScore score={source.domainTrust} /></MetricRow>
        <MetricRow label="Domain traffic"><span className="text-[13px] font-semibold text-gray-900">{source.domainTraffic}</span></MetricRow>
        {!isDomain && source.pageTraffic && (
          <MetricRow label="Page traffic"><span className="text-[13px] font-semibold text-gray-900">{source.pageTraffic}</span></MetricRow>
        )}
      </div>

      {/* Backlinks / Ownership */}
      <SectionTitle>Backlinks</SectionTitle>
      <div className="rounded-lg border border-gray-100 overflow-hidden mb-0.5">
        <MetricRow label="Has backlink to your domain"><BacklinkBadge hasBacklink={source.hasBacklink} /></MetricRow>
        <MetricRow label="Count of backlinks"><span className="text-[13px] font-semibold text-gray-900">{source.countBacklinks}</span></MetricRow>
        {isDomain && (
          <MetricRow label="Referring domains"><span className="text-[13px] font-semibold text-gray-900">{source.referringDomains}</span></MetricRow>
        )}
        {!isDomain && source.linksAvailable && (
          <MetricRow label="Links available to your website"><LinksAvailableBadge value={source.linksAvailable} /></MetricRow>
        )}
      </div>

      {/* Brand */}
      <SectionTitle>Brand</SectionTitle>
      <div className="rounded-lg border border-gray-100 overflow-hidden mb-0.5">
        {isDomain ? (
          <MetricRow label="Your brand mentioned">
            <span className="text-[13px] font-semibold text-gray-900">{source.brandMentioned} times</span>
          </MetricRow>
        ) : (
          <MetricRow label="Brand mentioned"><BrandMentionBadge mentioned={source.brandMentioned} /></MetricRow>
        )}
      </div>

      {/* Competitors */}
      {((source.competitorMention?.length > 0) || (source.otherBrands?.length > 0)) && (
        <>
          <SectionTitle>Competition</SectionTitle>
          {source.competitorMention?.length > 0 && (
            <div className="mb-3">
              <p className="text-[11px] text-gray-400 mb-1.5">Competitor mentions</p>
              <div className="flex flex-wrap gap-1.5">
                {source.competitorMention.map(b => (
                  <span key={b} className="inline-flex px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[11px] font-medium text-gray-600">{b}</span>
                ))}
              </div>
            </div>
          )}
          {source.otherBrands?.length > 0 && (
            <div>
              <p className="text-[11px] text-gray-400 mb-1.5">Other brands</p>
              <div className="flex flex-wrap gap-1.5">
                {source.otherBrands.map(b => (
                  <span key={b} className="inline-flex px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[11px] font-medium text-gray-600">{b}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function AiAnswersTab({ source }) {
  const breakdown = getEngineBreakdown(source.id, source.aiAnswers)
  const total = source.aiAnswers

  return (
    <div className="p-4 pb-6">
      {/* Summary */}
      <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 mb-4">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">Engine breakdown</p>
          <span className="text-[11px] font-bold text-gray-700">{total} total</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {Object.entries(breakdown).map(([eng, n]) => (
            <div key={eng} className="flex items-center justify-between">
              <AiEngineTag engine={eng} />
              <span className="text-[12px] font-bold text-gray-700">{n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Answers table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 w-[90px]">Date</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500">Engine</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500">Prompt</th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-gray-500 w-[48px]">Cache</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_AI_ANSWERS.map((row, i) => (
              <tr key={row.id} className={`hover:bg-gray-50 transition-colors ${i < SAMPLE_AI_ANSWERS.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <td className="px-3 py-2.5 text-[11px] text-gray-500 whitespace-nowrap align-top">{row.date}</td>
                <td className="px-3 py-2.5 align-top"><AiEngineTag engine={row.engine} /></td>
                <td className="px-3 py-2.5 text-[11px] text-gray-700 align-top">
                  <span className="line-clamp-2 leading-relaxed">{row.prompt}</span>
                </td>
                <td className="px-3 py-2.5 text-right align-top">
                  <a href={row.cacheUrl} className="text-[11px] text-primary-600 hover:underline font-medium">View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PromptsTab({ source }) {
  return (
    <div className="p-4 pb-6">
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500">Prompt</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500">Engine</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-gray-500 w-[80px]">Date</th>
              <th className="px-3 py-2.5 text-right text-[11px] font-semibold text-gray-500 w-[48px]">Cache</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_PROMPTS.map((row, i) => (
              <tr key={row.id} className={`hover:bg-gray-50 transition-colors ${i < SAMPLE_PROMPTS.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <td className="px-3 py-2.5 text-[11px] text-gray-700 align-top">
                  <span className="line-clamp-2 leading-relaxed">{row.prompt}</span>
                </td>
                <td className="px-3 py-2.5 align-top"><AiEngineTag engine={row.engine} /></td>
                <td className="px-3 py-2.5 text-[11px] text-gray-500 whitespace-nowrap align-top">{row.date}</td>
                <td className="px-3 py-2.5 text-right align-top">
                  <a href={row.cacheUrl} className="text-[11px] text-primary-600 hover:underline font-medium">View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CompetitorsTab({ source }) {
  const all = [...(source.competitorMention || []), ...(source.otherBrands || [])]
  if (!all.length) {
    return (
      <div className="p-8 text-center">
        <BarChart3 size={32} className="text-gray-200 mx-auto mb-3" />
        <p className="text-[13px] font-semibold text-gray-700 mb-1">No competitor mentions</p>
        <p className="text-[12px] text-gray-400">No competing brands were found in this source's AI answers.</p>
      </div>
    )
  }
  return (
    <div className="p-4 pb-6">
      {source.competitorMention?.length > 0 && (
        <>
          <SectionTitle>Direct competitors</SectionTitle>
          <div className="flex flex-col gap-1.5 mb-4">
            {source.competitorMention.map(b => (
              <div key={b} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50">
                <span className="text-[12px] font-semibold text-gray-700">{b}</span>
                <span className="text-[11px] text-error-600 font-medium">Mentioned</span>
              </div>
            ))}
          </div>
        </>
      )}
      {source.otherBrands?.length > 0 && (
        <>
          <SectionTitle>Other brands</SectionTitle>
          <div className="flex flex-col gap-1.5">
            {source.otherBrands.map(b => (
              <div key={b} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50">
                <span className="text-[12px] font-semibold text-gray-700">{b}</span>
                <span className="text-[11px] text-gray-400 font-medium">Mentioned</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function AuthorityTab({ source, view }) {
  const isDomain = view === 'domain'
  const trust = source.domainTrust
  const trustColor = trust >= 80 ? 'bg-success-600' : trust >= 60 ? 'bg-warning-600' : 'bg-error-600'

  return (
    <div className="p-4 pb-6">
      {/* Trust score visual */}
      <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 mb-4 text-center">
        <p className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase mb-2">Domain trust score</p>
        <p className={`text-[36px] font-bold leading-none mb-1 ${trust >= 80 ? 'text-success-600' : trust >= 60 ? 'text-warning-600' : 'text-error-600'}`}>
          {trust}
        </p>
        <p className="text-[11px] text-gray-400">out of 100</p>
        <div className="mt-3 h-2 rounded-full bg-gray-200">
          <div className={`h-full rounded-full ${trustColor}`} style={{ width: `${trust}%` }} />
        </div>
      </div>

      <SectionTitle>Traffic</SectionTitle>
      <div className="rounded-lg border border-gray-100 overflow-hidden mb-0.5">
        <MetricRow label="Domain traffic"><span className="text-[13px] font-semibold text-gray-900">{source.domainTraffic}</span></MetricRow>
        {!isDomain && source.pageTraffic && (
          <MetricRow label="Page traffic"><span className="text-[13px] font-semibold text-gray-900">{source.pageTraffic}</span></MetricRow>
        )}
      </div>
    </div>
  )
}

function BacklinksTab({ source, view }) {
  const isDomain = view === 'domain'
  return (
    <div className="p-4 pb-6">
      <SectionTitle>Backlink summary</SectionTitle>
      <div className="rounded-lg border border-gray-100 overflow-hidden mb-4">
        <MetricRow label="Has backlink to your domain"><BacklinkBadge hasBacklink={source.hasBacklink} /></MetricRow>
        <MetricRow label="Count of backlinks"><span className="text-[13px] font-semibold text-gray-900">{source.countBacklinks}</span></MetricRow>
        {isDomain && (
          <MetricRow label="Referring domains"><span className="text-[13px] font-semibold text-gray-900">{source.referringDomains}</span></MetricRow>
        )}
        {!isDomain && source.linksAvailable && (
          <MetricRow label="Links available to your website"><LinksAvailableBadge value={source.linksAvailable} /></MetricRow>
        )}
      </div>
      {!source.hasBacklink && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-warning-100">
          <Zap size={13} className="text-warning-600 shrink-0 mt-0.5" />
          <p className="text-[12px] text-gray-700">No backlink detected. Consider reaching out to this domain to request a mention or link.</p>
        </div>
      )}
    </div>
  )
}

function TimelineTab() {
  return (
    <div className="p-8 text-center">
      <Calendar size={32} className="text-gray-200 mx-auto mb-3" />
      <p className="text-[13px] font-semibold text-gray-700 mb-1">Timeline coming soon</p>
      <p className="text-[12px] text-gray-400">Historical visibility trend data will appear here.</p>
    </div>
  )
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

function DetailPanel({ source, view, initialTab, onClose }) {
  const [activeTab, setActiveTab] = useState(initialTab || 'Overview')

  useEffect(() => {
    setActiveTab(initialTab || 'Overview')
  }, [source?.id, initialTab])

  if (!source) return null
  const isDomain = view === 'domain'
  const title = isDomain ? source.domain : source.title
  const subtitle = isDomain ? source.type : source.domain

  return (
    <div className="w-[380px] shrink-0 flex flex-col border-l border-gray-200 bg-white overflow-hidden" style={{ maxHeight: '100%' }}>
      {/* Panel header */}
      <div className="px-4 pt-4 pb-0 border-b border-gray-200 shrink-0">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              {isDomain
                ? <Globe size={15} className="text-gray-500" />
                : <FileText size={15} className="text-gray-500" />}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 truncate leading-tight">{title}</p>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors shrink-0 mt-0.5"
          >
            <X size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {DETAIL_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-2.5 text-[11px] font-medium whitespace-nowrap border-b-2 -mb-px transition-colors shrink-0 ${
                activeTab === tab ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable tab content */}
      <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'thin' }}>
        {activeTab === 'Overview'    && <OverviewTab source={source} view={view} />}
        {activeTab === 'AI Answers'  && <AiAnswersTab source={source} />}
        {activeTab === 'Prompts'     && <PromptsTab source={source} />}
        {activeTab === 'Competitors' && <CompetitorsTab source={source} />}
        {activeTab === 'Authority'   && <AuthorityTab source={source} view={view} />}
        {activeTab === 'Backlinks'   && <BacklinksTab source={source} view={view} />}
        {activeTab === 'Timeline'    && <TimelineTab />}
      </div>
    </div>
  )
}

// ── Domain Table ──────────────────────────────────────────────────────────────

function DomainTable({ domains, selectedId, onSelect, onDetailOpen }) {
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
      <table className="w-full" style={{ minWidth: 680 }}>
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 bg-gray-50" style={{ minWidth: 200 }}>Domain</th>
            <th className="px-3 py-3 text-center text-[11px] font-semibold text-gray-500 bg-gray-50" style={{ width: 100 }}>AI Answers</th>
            <th className="px-3 py-3 text-center text-[11px] font-semibold text-gray-500 bg-gray-50" style={{ width: 90 }}>Prompts</th>
            <th className="px-3 py-3 text-right text-[11px] font-semibold text-gray-500 bg-gray-50" style={{ width: 130 }}>Prompt Coverage</th>
            <th className="px-3 py-3 text-right text-[11px] font-semibold text-gray-500 bg-gray-50" style={{ width: 100 }}>Mention Rate</th>
            <th className="px-3 py-3 text-right text-[11px] font-semibold text-gray-500 bg-gray-50" style={{ width: 100 }}>Domain Trust</th>
            <th className="px-3 py-3 text-right text-[11px] font-semibold text-gray-500 bg-gray-50 pr-5" style={{ width: 90 }}>Backlink</th>
          </tr>
        </thead>
        <tbody>
          {domains.map(domain => {
            const isSelected = selectedId === domain.id
            return (
              <tr
                key={domain.id}
                onClick={() => onSelect(domain.id)}
                className={`border-b border-gray-100 cursor-pointer transition-colors ${
                  isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Globe size={13} className="text-gray-400" />
                    </div>
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
                  <CountButton count={domain.aiAnswers} type="ai" id={domain.id} onDetailOpen={tab => { onSelect(domain.id); onDetailOpen(tab) }} />
                </td>
                <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}>
                  <CountButton count={domain.prompts} type="prompts" id={domain.id} onDetailOpen={tab => { onSelect(domain.id); onDetailOpen(tab) }} />
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
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Page Table ────────────────────────────────────────────────────────────────

function PageTable({ pages, selectedId, onSelect, onDetailOpen }) {
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
      <table className="w-full" style={{ minWidth: 760 }}>
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 bg-gray-50" style={{ minWidth: 240 }}>Page</th>
            <th className="px-3 py-3 text-center text-[11px] font-semibold text-gray-500 bg-gray-50" style={{ width: 100 }}>AI Answers</th>
            <th className="px-3 py-3 text-center text-[11px] font-semibold text-gray-500 bg-gray-50" style={{ width: 90 }}>Prompts</th>
            <th className="px-3 py-3 text-right text-[11px] font-semibold text-gray-500 bg-gray-50" style={{ width: 130 }}>Prompt Coverage</th>
            <th className="px-3 py-3 text-right text-[11px] font-semibold text-gray-500 bg-gray-50" style={{ width: 90 }}>Coverage</th>
            <th className="px-3 py-3 text-center text-[11px] font-semibold text-gray-500 bg-gray-50" style={{ width: 90 }}>Brand</th>
            <th className="px-3 py-3 text-right text-[11px] font-semibold text-gray-500 bg-gray-50 pr-5" style={{ width: 90 }}>Backlink</th>
          </tr>
        </thead>
        <tbody>
          {pages.map(page => {
            const isSelected = selectedId === page.id
            return (
              <tr
                key={page.id}
                onClick={() => onSelect(page.id)}
                className={`border-b border-gray-100 cursor-pointer transition-colors ${
                  isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'
                }`}
              >
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
                  <CountButton count={page.aiAnswers} type="ai" id={page.id} onDetailOpen={tab => { onSelect(page.id); onDetailOpen(tab) }} />
                </td>
                <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}>
                  <CountButton count={page.prompts} type="prompts" id={page.id} onDetailOpen={tab => { onSelect(page.id); onDetailOpen(tab) }} />
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
  const [selectedRowId, setSelectedRowId] = useState(null)
  const [detailTab, setDetailTab] = useState('Overview')
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  function handleRowSelect(id) {
    if (selectedRowId === id) { setSelectedRowId(null); return }
    setSelectedRowId(id)
    setDetailTab('Overview')
  }

  function handleDetailOpen(tab) {
    setDetailTab(tab)
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
    setSelectedRowId(null)
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

  const selectedData = view === 'domain'
    ? DOMAIN_DATA.find(d => d.id === selectedRowId)
    : PAGE_DATA.find(p => p.id === selectedRowId)

  const sourceFilterOptions = [
    { id: 'all', label: 'All sources' },
    { id: 'mentioned', label: 'Mentioned' },
    { id: 'not-mentioned', label: 'Not mentioned' },
  ]

  return (
    <div className="flex flex-col gap-4">

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard label="Mention opportunities" value="15" Icon={Search} iconBg="bg-primary-50" iconColor="text-primary-600" />
        <KpiCard label="Competitor-only mentions" value="6" Icon={Users} iconBg="bg-error-50" iconColor="text-error-600" />
        <KpiCard label="New opportunities (7d)" value="3" Icon={TrendingUp} iconBg="bg-success-50" iconColor="text-success-600" />
        <KpiCard label="Mentions without backlinks" value="7" Icon={Link2} iconBg="bg-warning-100" iconColor="text-warning-600" />
      </div>

      {/* Insight banner */}
      <div className="flex items-start gap-3 px-4 py-3.5 rounded-lg bg-warning-100 border border-warning-100">
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

            {/* Source filter pills */}
            <div className="flex items-center gap-0.5">
              {sourceFilterOptions.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => { setSourceFilter(id); setPage(1) }}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                    sourceFilter === id
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-3 flex items-center gap-3 border-b border-gray-100 flex-wrap">
          <div className="relative flex-1" style={{ minWidth: 200 }}>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder={view === 'domain' ? 'Search domains, brands, or metrics' : 'Search pages, URLs, brands, or metrics'}
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-[13px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-primary-400 transition-colors"
            />
          </div>

          {filterBuilderVisible ? (
            <FilterBuilderRow onAdd={handleAddFilter} onCancel={() => setFilterBuilderVisible(false)} />
          ) : (
            <button
              onClick={() => setFilterBuilderVisible(true)}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 bg-white text-[12px] font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus size={13} className="text-gray-400" /> Add filter
            </button>
          )}
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

        {/* Table + detail panel */}
        <div className="flex" style={{ minHeight: 360 }}>
          <div className="flex-1 min-w-0 flex flex-col">
            {view === 'domain' ? (
              <DomainTable
                domains={pagedDomains}
                selectedId={selectedRowId}
                onSelect={handleRowSelect}
                onDetailOpen={handleDetailOpen}
              />
            ) : (
              <PageTable
                pages={pagedPages}
                selectedId={selectedRowId}
                onSelect={handleRowSelect}
                onDetailOpen={handleDetailOpen}
              />
            )}
            <div className="flex-1" />
            {totalRows > PER_PAGE && (
              <Pagination total={totalRows} page={page} perPage={PER_PAGE} onPage={setPage} />
            )}
          </div>

          {/* Detail panel */}
          {selectedData && (
            <DetailPanel
              source={selectedData}
              view={view}
              initialTab={detailTab}
              onClose={() => setSelectedRowId(null)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
