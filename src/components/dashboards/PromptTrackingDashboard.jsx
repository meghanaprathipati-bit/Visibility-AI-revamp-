import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  TrendingUp, Globe, Link2, HelpCircle, ChevronDown,
  Award, ArrowUp, Users, Bot, Clock, MapPin,
  MessageCircle, Check, BarChart3, Search, Plus,
  ArrowLeft, ExternalLink, Calendar,
} from '../../icons/index.js'
import SourceInventoryContent from './SourceInventoryContent'

// ── MultiLineChart ─────────────────────────────────────────────────────────

function MultiLineChart({ lines, xLabels, height = 180, filled = false }) {
  const PAD_L = 36, PAD_R = 12, PAD_T = 12, PAD_B = 28
  const VW = 580, VH = height
  const CW = VW - PAD_L - PAD_R
  const CH = VH - PAD_T - PAD_B
  const Y_TICKS = [0, 25, 50, 75, 100]
  const baseline = PAD_T + CH

  function xP(i) { return PAD_L + (i / (xLabels.length - 1)) * CW }
  function yP(v) { return PAD_T + CH - (v / 100) * CH }

  function buildAreaPath(data) {
    const pts = data.map((v, i) => ({ x: xP(i), y: yP(v) }))
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    return `${line} L${xP(data.length - 1).toFixed(1)},${baseline} L${xP(0).toFixed(1)},${baseline} Z`
  }

  return (
    <svg width="100%" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none">
      {filled && (
        <defs>
          {lines.map(line => {
            const id = `mlc-grad-${line.label.replace(/\s+/g, '')}`
            return (
              <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={line.color} stopOpacity="0.14" />
                <stop offset="100%" stopColor={line.color} stopOpacity="0" />
              </linearGradient>
            )
          })}
        </defs>
      )}
      {Y_TICKS.map(y => (
        <g key={y}>
          <line x1={PAD_L} y1={yP(y)} x2={VW - PAD_R} y2={yP(y)} stroke="#E5E7EB" strokeWidth="1" />
          <text x={PAD_L - 6} y={yP(y) + 4} fontSize="10" fill="var(--gray-400)" textAnchor="end">{y}</text>
        </g>
      ))}
      {xLabels.map((label, i) =>
        i % 2 === 0
          ? <text key={i} x={xP(i)} y={VH - 4} fontSize="10" fill="var(--gray-400)" textAnchor="middle">{label}</text>
          : null
      )}
      {filled && lines.map(line => (
        <path key={`area-${line.label}`} d={buildAreaPath(line.data)}
          fill={`url(#mlc-grad-${line.label.replace(/\s+/g, '')})`} />
      ))}
      {lines.map(line => {
        const points = line.data.map((v, i) => `${xP(i).toFixed(1)},${yP(v).toFixed(1)}`).join(' ')
        return (
          <polyline key={line.label} points={points} fill="none" stroke={line.color}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )
      })}
    </svg>
  )
}

// ── DarkDropdown ───────────────────────────────────────────────────────────

function DarkDropdown({ value, onChange, options, icon: Icon, variant = 'default' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const isActive = variant === 'active'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[13px] font-medium transition-colors ${
          isActive
            ? 'border-primary-200 bg-primary-50 text-primary-600 hover:bg-primary-100'
            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        {Icon && <Icon size={13} className={isActive ? 'text-primary-500' : 'text-gray-400'} />}
        <span>{value}</span>
        <ChevronDown size={12} className={isActive ? 'text-primary-400' : 'text-gray-400'} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-white border border-gray-200 rounded-xl z-50 p-1" style={{ minWidth: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}>
          {options.map(opt => {
            const isSelected = value === opt
            return (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false) }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors text-left ${isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'}`}
              >
                <span className={isSelected ? 'text-primary-700 font-semibold' : 'text-gray-700'}>{opt}</span>
                {isSelected && <Check size={13} className="text-primary-600 shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Overview tab data ──────────────────────────────────────────────────────

const ENGINE_OPTIONS  = ['All AI engines', 'Perplexity', 'Claude', 'Gemini', 'AI Mode', 'AI Overview']
const PERIOD_OPTIONS  = ['Last 3 days', 'Last 7 days', 'Last 15 days', 'Last 30 days', 'Custom date range']

const OVERVIEW_KPI_CARDS = [
  { label: 'Visibility score',  value: '76/100', change: '+6 vs prior period', up: true,  sub: null,                   Icon: Award,      color: '#6938EF' },
  { label: 'Competitive rank',  value: '#3 / 7', change: null,                 up: null,  sub: '— Latest period rank', Icon: Users,      color: 'var(--primary-600)' },
  { label: 'Avg position',      value: '#2.3',   change: '0.6 pts better',     up: true,  sub: null,                   Icon: TrendingUp, color: '#16A34A' },
  { label: 'Citation rate',     value: '58%',    change: '+5.7 pp',            up: true,  sub: null,                   Icon: Link2,      color: '#D97706' },
]

const OVERVIEW_METRICS = [
  { label: 'Presence rate',               value: '61%',      desc: 'Brand appears within answered prompt blocks.' },
  { label: 'Share of voice',              value: '15%',      desc: 'Share of detected brand mentions across answers.' },
  { label: 'Net sentiment',               value: '+11',      desc: 'Positive vs negative brand framing.' },
  { label: 'Google AI Overview coverage', value: '62%',      desc: 'How often Google shows an AI Overview for the tracked prompts.' },
  { label: 'Answer density',              value: '6.8 URLs', desc: '2.4 brand mentions per answer.' },
  { label: 'SOV gap to leader',           value: '9 pts',    desc: 'Share-of-voice distance from the leading brand.' },
]

const COMPETITOR_RANKING_DATA = [
  { rank: 1, name: 'HubSpot',        domain: 'hubspot.com',        initials: 'H',  color: '#FF7A59', pos: 2.1, visibility: '78%', sent: '+62', sov: '24%', sentUp: true },
  { rank: 2, name: 'Calendly',       domain: 'calendly.com',       initials: 'C',  color: '#0069FF', pos: 2.8, visibility: '62%', sent: '+71', sov: '18%', sentUp: true },
  { rank: 3, name: 'Go High Level',  domain: 'gohighlevel.com',    initials: 'GH', color: '#6938EF', pos: 4.4, visibility: '58%', sent: '+11', sov: '15%', sentUp: true, isMe: true },
  { rank: 4, name: 'Pipedrive',      domain: 'pipedrive.com',      initials: 'P',  color: '#2B2D42', pos: 4.2, visibility: '41%', sent: '+58', sov: '11%', sentUp: true },
  { rank: 5, name: 'Salesforce',     domain: 'salesforce.com',     initials: 'S',  color: '#00A1E0', pos: 4.6, visibility: '37%', sent: '+44', sov: '10%', sentUp: true },
  { rank: 6, name: 'ActiveCampaign', domain: 'activecampaign.com', initials: 'A',  color: '#356AE6', pos: 5.1, visibility: '32%', sent: '+52', sov: '8%',  sentUp: true },
]

const ENGINE_COVERAGE_DATA = [
  { name: 'Perplexity',  abbr: 'P',  color: 'var(--primary-800)', sub: 'US · English · 12 prompts', vis: 76, presence: '69.0%', avgPos: '#2.3', urlsAnswer: '6.4 URLs / answer', citRate: '58.0%', insight: 'Best current engine for mention depth and citation pickup.' },
  { name: 'Claude',      abbr: 'C',  color: 'var(--purple-600)', sub: 'US · English · 12 prompts', vis: 71, presence: '63.0%', avgPos: '#2.9', urlsAnswer: '5.1 URLs / answer', citRate: '47.0%', insight: 'Visibility is present, but citations still lag the strongest engines.' },
  { name: 'Gemini',      abbr: 'G',  color: '#1D4ED8', sub: 'US · English · 12 prompts', vis: 64, presence: '56.0%', avgPos: '#3.7', urlsAnswer: '4.8 URLs / answer', citRate: '41.0%', insight: 'Brand named often enough, but answer prominence is still uneven.' },
  { name: 'AI Mode',     abbr: 'AM', color: '#0D9488', sub: 'US · English · 12 prompts', vis: 68, presence: '61.0%', avgPos: '#3.1', urlsAnswer: '5.3 URLs / answer', citRate: '46.0%', insight: 'Strong middle-of-answer pickup with room to improve citation consistency.' },
  { name: 'AI Overview', abbr: 'AO', color: '#16A34A', sub: 'US · English · 12 prompts', vis: 73, presence: '65.0%', avgPos: '#2.6', urlsAnswer: '5.0 URLs / answer', citRate: '52.0%', insight: 'Strongly tied to your organic rankings — keep traditional SEO healthy.' },
]

const SENTIMENT_DATA = [
  { label: 'Recommended', value: 14, color: '#1E3A5F' },
  { label: 'Favorable',   value: 18, color: '#3B82F6' },
  { label: 'Neutral',     value: 46, color: '#CBD5E1' },
  { label: 'Unfavorable', value: 14, color: '#FCD34D' },
  { label: 'Dismissed',   value: 8,  color: '#FDA4AF' },
]

const ORGANIC_OVERLAP_PROMPTS = [
  { prompt: 'What are the best AI visibility platforms for multi-location brands?', aioPos: '#1.8', overlap: '50%', status: 'Watch drift' },
  { prompt: 'How do AI rank tracking tools compare for SEO agencies?',              aioPos: '#2.4', overlap: '42%', status: 'Watch drift' },
  { prompt: 'Best tools to monitor citations in ChatGPT and Google AI Overview',    aioPos: '#3.7', overlap: '31%', status: 'Stable'      },
  { prompt: 'How can agencies improve AI citation rate for client brands?',          aioPos: '#6.8', overlap: '16%', status: 'Stable'      },
  { prompt: 'What makes a brand appear in AI answers more often?',                  aioPos: '#7.4', overlap: '12%', status: 'Stable'      },
]

const TOP_PROMPTS_DATA = [
  { rank: 1, prompt: 'What are the best AI visibility platforms for multi-location brands?', tag: 'AI Visibility', volume: '1.9K monthly volume', engines: '4 / 5 engines mentioning', visibility: 82, trendScore: '+7', up: true },
  { rank: 2, prompt: 'How do AI rank tracking tools compare for SEO agencies?',              tag: 'AI Visibility', volume: '1.4K monthly volume', engines: '3 / 5 engines mentioning', visibility: 74, trendScore: '+4', up: true },
  { rank: 3, prompt: 'Best tools to monitor citations in ChatGPT and Google AI Overview',    tag: 'AI Visibility', volume: '2.1K monthly volume', engines: '4 / 5 engines mentioning', visibility: 71, trendScore: '+2', up: true },
  { rank: 4, prompt: 'Best CRM for small businesses that need automation and texting',        tag: 'CRM',           volume: '3.2K monthly volume', engines: '5 / 5 engines mentioning', visibility: 68, trendScore: '+5', up: true },
  { rank: 5, prompt: 'What tool is best for landing pages, funnels, and automated lead capture?', tag: 'Funnels',  volume: '1.8K monthly volume', engines: '3 / 5 engines mentioning', visibility: 61, trendScore: '+1', up: true },
]

const TREND_X_LABELS = ['May 24','May 26','May 28','May 30','Jun 1','Jun 3','Jun 5','Jun 7','Jun 9','Jun 11','Jun 13','Jun 15','Jun 17','Jun 19']

const TREND_LINES_MAP = {
  Visibility: [
    { label: 'Go High Level', color: 'var(--primary-600)', data: [82,83,82,84,83,85,84,86,85,87,86,88,87,90] },
    { label: 'HubSpot',       color: '#EF4444', data: [97,97,98,98,99,98,99,99,100,99,100,100,99,100] },
    { label: 'Calendly',      color: '#06B6D4', data: [78,79,79,80,79,81,80,82,81,82,83,82,83,84] },
    { label: 'Pipedrive',     color: '#6B7280', data: [70,71,70,72,71,73,72,74,73,75,74,75,76,78] },
  ],
  Mentions: [
    { label: 'Go High Level', color: 'var(--primary-600)', data: [71,72,73,74,73,75,74,76,75,77,76,78,77,79] },
    { label: 'HubSpot',       color: '#EF4444', data: [88,89,88,90,89,91,90,92,91,92,93,92,93,94] },
    { label: 'Calendly',      color: '#06B6D4', data: [65,66,65,67,66,68,67,68,67,69,68,70,69,71] },
    { label: 'Pipedrive',     color: '#6B7280', data: [58,59,58,60,59,61,60,62,61,62,63,62,63,64] },
  ],
  Citations: [
    { label: 'Go High Level', color: 'var(--primary-600)', data: [42,43,44,43,45,44,46,45,47,46,48,47,48,49] },
    { label: 'HubSpot',       color: '#EF4444', data: [68,69,68,70,69,71,70,72,71,72,73,72,73,74] },
    { label: 'Calendly',      color: '#06B6D4', data: [35,36,35,37,36,38,37,38,37,39,38,40,39,41] },
    { label: 'Pipedrive',     color: '#6B7280', data: [28,29,28,30,29,31,30,31,30,32,31,32,31,33] },
  ],
}

// ── Prompts tab data ───────────────────────────────────────────────────────

const PROMPTS_KPIS = [
  { label: 'Tracked prompts', value: '5',      Icon: Search,     color: 'var(--primary-600)' },
  { label: 'Avg visibility',  value: '52/100', Icon: TrendingUp, color: '#6938EF' },
  { label: 'Avg search vol.', value: '1.1K',   Icon: BarChart3,  color: '#0D9488' },
  { label: 'Engine coverage', value: '48%',    Icon: Bot,        color: '#D97706' },
]

const TOPIC_VIS_DATA = [
  { topic: 'AI Visibility',  sub: '1 prompt · avg position 1.8', pct: 82, color: 'var(--primary-800)' },
  { topic: 'Comparisons',    sub: '1 prompt · avg position 2.4', pct: 71, color: '#1D4ED8' },
  { topic: 'Sources',        sub: '1 prompt · avg position 3.7', pct: 54, color: 'var(--primary-600)' },
  { topic: 'Citations',      sub: '1 prompt · avg position 6.8', pct: 29, color: '#3B82F6' },
  { topic: 'Brand Presence', sub: '1 prompt · avg position 7.4', pct: 24, color: '#60A5FA' },
]

const TOPIC_TAG_STYLES = {
  'AI Visibility':  { bg: 'var(--primary-50)', text: '#1D4ED8', border: '#BFDBFE' },
  'Comparisons':    { bg: 'var(--primary-50)', text: '#1D4ED8', border: '#BFDBFE' },
  'Sources':        { bg: '#F0FDFA', text: '#0D9488', border: '#99F6E4' },
  'Citations':      { bg: '#F4F3FF', text: '#6938EF', border: '#E9D7FE' },
  'Brand Presence': { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
}

const PROMPT_ROLLUP_GROUPS = [
  {
    label: 'Winning', desc: 'High visibility and majority-engine presence.', countColor: '#16A34A', countBg: '#F0FDF4',
    prompts: [
      { id: 'w1', prompt: 'What are the best AI visibility platforms for multi-location brands?', topic: 'AI Visibility', volume: '1.9K', visibility: 82 },
      { id: 'w2', prompt: 'How do AI rank tracking tools compare for SEO agencies?',              topic: 'Comparisons',  volume: '1.3K', visibility: 71 },
    ],
  },
  {
    label: 'Opportunity', desc: 'High-value prompts with low current visibility.', countColor: '#D97706', countBg: '#FEF3C7',
    prompts: [],
  },
  {
    label: 'Losing', desc: 'Prompts showing the sharpest negative trend.', countColor: '#DC2626', countBg: '#FEF2F2',
    prompts: [
      { id: 'l1', prompt: 'What makes a brand appear in AI answers more often?',          topic: 'Brand Presence', volume: '540', visibility: 24 },
      { id: 'l2', prompt: 'How can agencies improve AI citation rate for client brands?', topic: 'Citations',      volume: '720', visibility: 29 },
    ],
  },
]

const PROMPT_INVENTORY_DATA = [
  { prompt: 'What are the best AI visibility platforms for multi-location brands?', topic: 'AI Visibility',  intent: 'C', volume: '1.9K', engFilled: 4, visibility: 82, avgPos: '#1.8', mentions: '4 / 5', status: 'Winning', trend: '+7'  },
  { prompt: 'How do AI rank tracking tools compare for SEO agencies?',              topic: 'Comparisons',    intent: 'C', volume: '1.3K', engFilled: 3, visibility: 71, avgPos: '#2.4', mentions: '3 / 5', status: 'Winning', trend: '+4'  },
  { prompt: 'Best tools to monitor citations in ChatGPT and Google AI Overview',    topic: 'Sources',        intent: 'I', volume: '880',  engFilled: 3, visibility: 54, avgPos: '#3.7', mentions: '3 / 5', status: 'Neutral', trend: '+1'  },
  { prompt: 'How can agencies improve AI citation rate for client brands?',          topic: 'Citations',      intent: 'I', volume: '720',  engFilled: 1, visibility: 29, avgPos: '#6.8', mentions: '1 / 5', status: 'Losing',  trend: '-8'  },
  { prompt: 'What makes a brand appear in AI answers more often?',                  topic: 'Brand Presence', intent: 'I', volume: '540',  engFilled: 1, visibility: 24, avgPos: '#7.4', mentions: '1 / 5', status: 'Losing',  trend: '-11' },
]

const SEGMENTS = ['All (5)', 'Winning (2)', 'Opportunity (0)', 'Losing (2)']

// ── Prompt detail data ─────────────────────────────────────────────────────

const DETAIL_X_LABELS = ['May 22','May 24','May 26','May 28','May 30','Jun 1','Jun 3','Jun 5','Jun 7','Jun 9','Jun 11','Jun 13','Jun 15','Jun 17','Jun 18']

const DETAIL_TREND_LINES = [
  { label: 'Perplexity', color: 'var(--primary-800)', data: [76,78,80,81,82,83,84,86,87,88,90,91,93,95,97] },
  { label: 'Claude',     color: 'var(--purple-600)', data: [72,74,75,76,77,78,79,80,80,81,82,82,83,83,83] },
  { label: 'Gemini',     color: 'var(--primary-600)', data: [65,67,68,69,70,71,72,73,74,74,75,76,76,77,77] },
  { label: 'AI Mode',    color: '#059669', data: [65,66,68,68,69,70,71,72,73,73,74,75,75,76,77] },
]

const DETAIL_AI_RESPONSES = [
  { engine: 'AI Mode',    abbr: 'AM', color: '#0D9488', status: 'Succeeded', text: 'Direct answer: Go High Level is visible for this prompt, but the response quality depends on whether the engine can find clear proof, strong source pages, and structured comparisons.', brands: ['HubSpot', 'Go High Level', 'Calendly'], sources: 2, created: 'Jun 1, 2026' },
  { engine: 'Claude',     abbr: 'C',  color: 'var(--purple-600)', status: 'Succeeded', text: 'Direct answer: Go High Level is visible for this prompt, but the response quality depends on whether the engine can find clear proof, strong source pages, and structured comparisons.', brands: ['Calendly', 'Go High Level', 'HubSpot'], sources: 2, created: 'Jun 1, 2026' },
  { engine: 'Gemini',     abbr: 'G',  color: '#1D4ED8', status: 'Succeeded', text: 'Direct answer: Go High Level is visible for this prompt, but the response quality depends on whether the engine can find clear proof, strong source pages, and structured comparisons.', brands: ['Go High Level', 'HubSpot', 'Calendly'], sources: 2, created: 'Jun 1, 2026' },
  { engine: 'Perplexity', abbr: 'P',  color: 'var(--primary-800)', status: 'Succeeded', text: 'Direct answer: Go High Level is visible for this prompt, but the response quality depends on whether the engine can find clear proof, strong source pages, and structured comparisons.', brands: ['Go High Level', 'Calendly', 'HubSpot'], sources: 2, created: 'Jun 1, 2026' },
  { engine: 'AI Mode',    abbr: 'AM', color: '#0D9488', status: 'Succeeded', text: 'Direct answer: Go High Level is visible for this prompt, but the response quality depends on whether the engine can find clear proof.', brands: ['Go High Level'], sources: 1, created: 'May 31, 2026' },
]

const ENGINE_PERF_DATA = [
  { engine: 'Perplexity', abbr: 'P',  color: 'var(--primary-800)', mentionPct: '96%', citRate: '66%', urlsAnswer: '6.4', trend: '+10', trendUp: true },
  { engine: 'Claude',     abbr: 'C',  color: 'var(--purple-600)', mentionPct: '83%', citRate: '58%', urlsAnswer: '5.1', trend: '+9',  trendUp: true },
  { engine: 'Gemini',     abbr: 'G',  color: '#1D4ED8', mentionPct: '74%', citRate: '52%', urlsAnswer: '4.8', trend: '+8',  trendUp: true },
  { engine: 'AI Mode',    abbr: 'AM', color: '#059669', mentionPct: '65%', citRate: '46%', urlsAnswer: '5.3', trend: '+7',  trendUp: true },
]

const DETAIL_SOURCES = [
  { url: 'https://www.capterra.com/p/209198/GoHighLevel/', domain: 'capterra.com',    avgPos: '#1.5', coverage: '19%', seenInChats: 112, brandMentioned: true,  otherBrands: true,  lastSeen: 'Apr 28, 2026' },
  { url: 'https://gohighlevel.com/pricing',               domain: 'gohighlevel.com', avgPos: '#1.0', coverage: '25%', seenInChats: 56,  brandMentioned: true,  otherBrands: false, lastSeen: 'Jun 19, 2026' },
]

// ── Prompts tab helpers ────────────────────────────────────────────────────

function TopicTag({ topic }) {
  const s = TOPIC_TAG_STYLES[topic] || { bg: '#F9FAFB', text: '#344054', border: '#EAECF0' }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium whitespace-nowrap"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {topic}
    </span>
  )
}

function EngineDots({ filled }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`inline-block w-2.5 h-2.5 rounded-full ${i < filled ? 'bg-primary-600' : 'bg-gray-200'}`} />
      ))}
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    Winning: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
    Neutral:  { bg: '#F2F4F7', text: '#344054', border: '#EAECF0' },
    Losing:   { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  }
  const s = styles[status] || styles.Neutral
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[12px] font-semibold whitespace-nowrap"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {status}
    </span>
  )
}

// ── Prompts tab content ────────────────────────────────────────────────────

function PromptsTabContent() {
  const [segment, setSegment] = useState('All (5)')

  return (
    <div className="flex flex-col gap-4">

      {/* 4 KPI mini-cards */}
      <div className="grid grid-cols-4 gap-3">
        {PROMPTS_KPIS.map(kpi => (
          <div key={kpi.label} className="border border-gray-200 rounded-lg bg-white p-4 flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-[12px] font-medium text-gray-500">{kpi.label}</p>
              <p className="text-[24px] font-bold text-gray-900 leading-none">{kpi.value}</p>
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: kpi.color + '18' }}>
              <kpi.Icon size={16} style={{ color: kpi.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Segment tabs */}
      <div className="border border-gray-200 rounded-lg bg-white px-4 py-2.5 flex items-center gap-2">
        {SEGMENTS.map(seg => {
          const isActive = segment === seg
          return (
            <button
              key={seg}
              onClick={() => setSegment(seg)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors border ${
                isActive
                  ? 'bg-primary-50 text-primary-600 border-primary-200'
                  : 'text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {seg}
            </button>
          )
        })}
      </div>

      {/* Prompt rollups */}
      <div className="border border-gray-200 rounded-lg bg-white p-5">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[15px] font-semibold text-gray-900">Prompt rollups</h3>
            <HelpCircle size={14} className="text-gray-300" />
          </div>
          <span className="text-[13px] font-semibold text-purple-600">5 prompts in view</span>
        </div>
        <p className="text-[13px] text-gray-500 mb-4">Winning, opportunity, and losing prompts surfaced from the current prompt scoring logic</p>

        <div className="flex flex-col gap-3">
          {PROMPT_ROLLUP_GROUPS.map(group => (
            <div key={group.label} className="border border-gray-100 rounded-lg bg-gray-50 p-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-[14px] font-bold text-gray-900">{group.label}</p>
                  <p className="text-[13px] text-gray-500 mt-0.5">{group.desc}</p>
                </div>
                <span
                  className="text-[16px] font-bold w-7 h-7 rounded-full flex items-center justify-center text-[13px]"
                  style={{ color: group.countColor, background: group.countBg }}
                >
                  {group.prompts.length}
                </span>
              </div>

              {group.prompts.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-lg px-6 py-8 text-center mt-3">
                  <p className="text-[13px] text-gray-400">No prompts match this bucket in the current range.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-3">
                  {group.prompts.map(p => (
                    <div key={p.id} className="border border-gray-200 rounded-lg bg-white p-4 hover:border-gray-300 transition-colors">
                      <p className="text-[14px] font-semibold text-gray-900 mb-2">{p.prompt}</p>
                      <div className="flex items-center gap-3">
                        <TopicTag topic={p.topic} />
                        <span className="text-[12px] text-gray-400">{p.volume} volume</span>
                        <span className="text-[12px] text-gray-400">{p.visibility}/100 visibility</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Topic visibility — bar style matching AI Presence Comparison */}
      <div className="border border-gray-200 rounded-lg bg-white p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-[15px] font-semibold text-gray-900">Topic visibility</h3>
              <HelpCircle size={14} className="text-gray-300" />
            </div>
            <p className="text-[13px] text-gray-500 mt-0.5">Topics sorted by average visibility and supported by prompt count</p>
          </div>
          <span className="text-[13px] font-semibold text-purple-600">5 topics</span>
        </div>

        <div className="flex flex-col gap-3">
          {TOPIC_VIS_DATA.map(item => (
            <div key={item.topic} className="flex items-center gap-4">
              <div className="w-[200px] shrink-0">
                <p className="text-[13px] font-semibold text-gray-900">{item.topic}</p>
                <p className="text-[12px] text-gray-400 mt-0.5">{item.sub}</p>
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-5 relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                  style={{ width: `${item.pct}%`, background: item.color, minWidth: 48 }}
                >
                  <span className="text-white text-[12px] font-semibold">{item.pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt inventory table */}
      <div className="border border-gray-200 rounded-lg bg-white">
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[15px] font-semibold text-gray-900">Prompt inventory</h3>
                <HelpCircle size={14} className="text-gray-300" />
              </div>
              <p className="text-[13px] text-gray-500 mt-0.5">Prompt-level visibility, intent, topic, and engine coverage across the selected range</p>
            </div>
            <span className="text-[13px] font-semibold text-purple-600">5 rows</span>
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="border border-gray-200 rounded-lg overflow-x-auto">
            <table className="border-collapse table-fixed" style={{ width: '960px' }}>
              <colgroup>
                <col style={{ width: '260px' }} />
                <col style={{ width: '112px' }} />
                <col style={{ width: '60px' }} />
                <col style={{ width: '72px' }} />
                <col style={{ width: '84px' }} />
                <col style={{ width: '112px' }} />
                <col style={{ width: '92px' }} />
                <col style={{ width: '68px' }} />
                <col style={{ width: '100px' }} />
              </colgroup>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200">Prompt</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200">Topic</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200">Intent</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200">Volume</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200">Engines</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200">Visibility</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200">Avg position</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200">Mentions</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {PROMPT_INVENTORY_DATA.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 border-r border-gray-100">
                      <p className="text-[13px] font-semibold text-gray-900 leading-snug">{row.prompt}</p>
                      <p className="text-[12px] text-gray-400 mt-1">
                        Trend <span className={row.trend.startsWith('+') ? 'text-success-600' : 'text-error-600'}>{row.trend}</span>
                        {' · '}{row.engFilled} / 5 engines mentioning
                        {' · '}<button className="text-primary-600 hover:underline">View details</button>
                      </p>
                    </td>
                    <td className="px-3 py-3 border-r border-gray-100">
                      <TopicTag topic={row.topic} />
                    </td>
                    <td className="px-3 py-3 border-r border-gray-100">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-[12px] font-semibold text-gray-600">
                        {row.intent}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[13px] text-gray-700 border-r border-gray-100">{row.volume}</td>
                    <td className="px-3 py-3 border-r border-gray-100">
                      <EngineDots filled={row.engFilled} />
                    </td>
                    <td className="px-3 py-3 border-r border-gray-100">
                      <p className="text-[20px] font-bold text-gray-900 leading-none mb-1">{row.visibility}</p>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-primary-600" style={{ width: `${row.visibility}%` }} />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[13px] font-medium text-gray-700 border-r border-gray-100">{row.avgPos}</td>
                    <td className="px-3 py-3 text-[13px] text-gray-700 border-r border-gray-100">{row.mentions}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Prompt detail helpers ─────────────────────────────────────────────────

function BrandPill({ name }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded border text-[12px] font-medium bg-gray-50 text-gray-600 border-gray-200">
      {name}
    </span>
  )
}

function TruncatedLink({ href, children }) {
  const ref = useRef(null)
  const [pos, setPos] = useState(null)
  function show() {
    const r = ref.current?.getBoundingClientRect()
    if (r) setPos({ top: r.top, left: r.left })
  }
  function hide() { setPos(null) }
  return (
    <>
      <a ref={ref} href={href || '#'} onClick={e => e.preventDefault()}
        onMouseEnter={show} onMouseLeave={hide}
        className="flex items-center gap-1 text-[13px] text-primary-600 hover:underline min-w-0 w-full">
        <span className="truncate block">{children}</span>
        <ExternalLink size={11} className="shrink-0" />
      </a>
      {pos && createPortal(
        <div onMouseEnter={() => setPos(pos)} onMouseLeave={hide}
          style={{ position: 'fixed', top: pos.top - 8, left: pos.left, transform: 'translateY(-100%)', zIndex: 9999, maxWidth: '480px' }}
          className="px-2.5 py-1.5 bg-gray-900 text-white text-[12px] rounded-md shadow-lg break-all leading-relaxed">
          {children}
        </div>,
        document.body
      )}
    </>
  )
}

// ── Prompt detail view ────────────────────────────────────────────────────

function PromptDetailView({ prompt, onBack }) {
  const [trendMetric, setTrendMetric] = useState('Visibility')
  const [trendPeriod, setTrendPeriod] = useState('28D')
  const [sourcesView, setSourcesView] = useState('URL')

  const DETAIL_KPI = [
    { label: 'Visibility score', value: '82/100', desc: 'Current prompt-level visibility across tracked engines.', Icon: Award,      color: '#6938EF' },
    { label: 'Avg position',     value: '#1.8',   desc: 'Average cited position when the brand appears.',          Icon: TrendingUp,  color: '#16A34A' },
    { label: 'AI responses',     value: '112',    desc: 'Latest prompt responses available for drill-down.',        Icon: Bot,         color: 'var(--primary-600)' },
    { label: 'Search volume',    value: '1.9K',   desc: 'Demand proxy carried through from the tracked prompt.',   Icon: BarChart3,   color: '#D97706' },
  ]

  return (
    <div className="flex flex-col gap-4">

      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-700 transition-colors w-fit">
        <ArrowLeft size={14} />
        Back to overview
      </button>

      {/* Hero card */}
      <div className="border border-gray-200 rounded-lg bg-white p-5 flex gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-[12px] font-medium border border-purple-200">AI Visibility</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-success-50 text-success-600 text-[12px] font-medium border border-success-200">Winning</span>
            <span className="text-[12px] text-gray-400">Last 30 days</span>
            <span className="text-[12px] text-gray-400">US</span>
          </div>
          <h2 className="text-[24px] font-bold text-gray-900 leading-snug mb-3">{prompt.prompt}</h2>
          <p className="text-[13px] text-gray-500 leading-relaxed">This view separates trend analysis, AI response conversations, engine diagnostics, and prompt-level sources so each widget answers a different analysis question.</p>
        </div>
        <div className="w-[220px] shrink-0 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-[12px] font-bold uppercase tracking-wide text-primary-600 mb-3">Prompt snapshot</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Brand',          value: 'Go High Level' },
              { label: 'Top engine',     value: 'Perplexity'    },
              { label: 'AI responses',   value: '112'           },
              { label: 'Prompt sources', value: '2'             },
            ].map(item => (
              <div key={item.label} className="border border-gray-200 rounded-md bg-white p-2.5">
                <p className="text-[12px] text-gray-400 font-medium mb-1">{item.label}</p>
                <p className="text-[13px] font-semibold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-gray-400 mt-3">Topic: AI Visibility · 2 source domains · US</p>
        </div>
      </div>

      {/* 4 KPI mini-cards */}
      <div className="grid grid-cols-4 gap-3">
        {DETAIL_KPI.map(kpi => (
          <div key={kpi.label} className="border border-gray-200 rounded-lg bg-white p-4 flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-[12px] font-medium text-gray-500">{kpi.label}</p>
              <p className="text-[24px] font-bold text-gray-900 leading-none">{kpi.value}</p>
              <p className="text-[12px] text-gray-400 leading-snug">{kpi.desc}</p>
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: kpi.color + '18' }}>
              <kpi.Icon size={16} style={{ color: kpi.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Prompt Visibility Trend */}
      <div className="border border-gray-200 rounded-lg bg-white p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">Prompt Visibility Trend</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">Prompt-level visibility by AI engine across the selected window</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
              {['Visibility', 'Mentions', 'Citations'].map(m => (
                <button key={m} onClick={() => setTrendMetric(m)}
                  className={`px-3 py-1.5 text-[13px] font-medium transition-colors ${trendMetric === m ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                  {m}
                </button>
              ))}
            </div>
            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
              {['7D', '28D', '3M'].map(p => (
                <button key={p} onClick={() => setTrendPeriod(p)}
                  className={`px-3 py-1.5 text-[13px] font-medium transition-colors ${trendPeriod === p ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-3">
          {DETAIL_TREND_LINES.map(line => (
            <div key={line.label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ background: line.color }} />
              <span className="text-[12px] text-gray-500">{line.label}</span>
            </div>
          ))}
        </div>
        <MultiLineChart lines={DETAIL_TREND_LINES} xLabels={DETAIL_X_LABELS} height={200} filled />
      </div>

      {/* AI Responses */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="text-[15px] font-semibold text-gray-900">AI Responses</h3>
            <HelpCircle size={14} className="text-gray-300" />
          </div>
          <p className="text-[13px] text-gray-500">Latest prompt responses from tracked engines with drill-in answer analysis</p>
        </div>
        <div className="px-5 pb-5">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[130px]">AI</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200">Chat</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[180px]">Brands</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[72px]">Sources</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 w-[110px]">Created</th>
                </tr>
              </thead>
              <tbody>
                {DETAIL_AI_RESPONSES.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 border-r border-gray-100 align-top">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[12px] font-bold shrink-0" style={{ background: row.color }}>
                          {row.abbr}
                        </span>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900">{row.engine}</p>
                          <p className="text-[12px] text-success-600 font-medium">{row.status}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-r border-gray-100 align-top">
                      <p className="text-[13px] text-gray-700 leading-relaxed mb-1">{row.text}</p>
                      <button className="text-[12px] text-primary-600 hover:underline flex items-center gap-1">
                        Open full response <ExternalLink size={11} />
                      </button>
                    </td>
                    <td className="px-3 py-3 border-r border-gray-100 align-top">
                      <div className="flex flex-wrap gap-1">
                        {row.brands.map(b => <BrandPill key={b} name={b} />)}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[13px] text-gray-700 border-r border-gray-100 align-top">{row.sources}</td>
                    <td className="px-3 py-3 text-[13px] text-gray-500 align-top">{row.created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Engine Performance */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="text-[15px] font-semibold text-gray-900">Engine performance</h3>
            <HelpCircle size={14} className="text-gray-300" />
          </div>
          <p className="text-[13px] text-gray-500">Prompt metrics by engine using the same tracked fields already shown across AI Rank</p>
        </div>
        <div className="px-5 pb-5">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200">Engine</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[160px]">Mention presence</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[120px]">Citation rate</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[120px]">URLs / answer</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 w-[100px]">Trend Δ</th>
                </tr>
              </thead>
              <tbody>
                {ENGINE_PERF_DATA.map((eng, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 border-r border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[12px] font-bold shrink-0" style={{ background: eng.color }}>
                          {eng.abbr}
                        </span>
                        <p className="text-[13px] font-semibold text-gray-900">{eng.engine}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[13px] text-gray-700 border-r border-gray-100">{eng.mentionPct}</td>
                    <td className="px-3 py-3 text-[13px] text-gray-700 border-r border-gray-100">{eng.citRate}</td>
                    <td className="px-3 py-3 text-[13px] text-gray-700 border-r border-gray-100">{eng.urlsAnswer}</td>
                    <td className="px-3 py-3">
                      <span className={`text-[13px] font-semibold ${eng.trendUp ? 'text-success-600' : 'text-error-600'}`}>{eng.trend}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Prompt Sources */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="text-[15px] font-semibold text-gray-900">Prompt sources</h3>
              <HelpCircle size={14} className="text-gray-300" />
            </div>
            <p className="text-[13px] text-gray-500">All detected sources for this prompt with a compact matrix of position, coverage, and mention signals</p>
          </div>
          <div className="flex items-center border border-gray-200 rounded-md overflow-hidden shrink-0">
            {['Domain', 'URL'].map(v => (
              <button key={v} onClick={() => setSourcesView(v)}
                className={`px-3 py-1.5 text-[13px] font-medium transition-colors ${sourcesView === v ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 min-w-[200px]">{sourcesView === 'URL' ? 'URL' : 'Domain'}</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[100px]">Avg position</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[88px]">Coverage</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[100px]">Seen in chats</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[120px]">Brand mentioned</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[160px]">Other brands mentioned</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 w-[110px]">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {DETAIL_SOURCES.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 border-r border-gray-100 max-w-[280px] overflow-hidden">
                      {sourcesView === 'URL'
                        ? <TruncatedLink href={row.url}>{row.url}</TruncatedLink>
                        : <span className="text-[13px] font-semibold text-gray-900">{row.domain}</span>
                      }
                    </td>
                    <td className="px-3 py-3 text-[13px] text-gray-700 border-r border-gray-100">{row.avgPos}</td>
                    <td className="px-3 py-3 text-[13px] text-gray-700 border-r border-gray-100">{row.coverage}</td>
                    <td className="px-3 py-3 text-[13px] text-gray-700 border-r border-gray-100">{row.seenInChats}</td>
                    <td className="px-3 py-3 border-r border-gray-100">
                      <span className={`text-[13px] font-medium ${row.brandMentioned ? 'text-success-600' : 'text-gray-400'}`}>
                        {row.brandMentioned ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-3 py-3 border-r border-gray-100">
                      <span className={`text-[13px] font-medium ${row.otherBrands ? 'text-warning-600' : 'text-gray-400'}`}>
                        {row.otherBrands ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[13px] text-gray-500">{row.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Overview tab content ───────────────────────────────────────────────────

function OverviewContent() {
  const [trendMetric, setTrendMetric] = useState('Visibility')
  const [trendPeriod, setTrendPeriod] = useState('28D')
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const trendLines = TREND_LINES_MAP[trendMetric] || TREND_LINES_MAP.Visibility

  if (selectedPrompt) {
    return <PromptDetailView prompt={selectedPrompt} onBack={() => setSelectedPrompt(null)} />
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Row 1: 4 KPI cards */}
      <div className="grid grid-cols-4 gap-3">
        {OVERVIEW_KPI_CARDS.map(kpi => (
          <div key={kpi.label} className="border border-gray-200 rounded-lg bg-white p-4 flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-[12px] font-medium text-gray-500">{kpi.label}</p>
              <p className="text-[24px] font-bold text-gray-900 leading-none">{kpi.value}</p>
              {kpi.change && (
                <div className="flex items-center gap-1 mt-0.5">
                  <ArrowUp size={12} className={`shrink-0 ${kpi.up ? 'text-success-600' : 'text-error-600'}`} style={kpi.up ? {} : { transform: 'rotate(180deg)' }} />
                  <span className={`text-[12px] font-semibold ${kpi.up ? 'text-success-600' : 'text-error-600'}`}>{kpi.change}</span>
                </div>
              )}
              {kpi.sub && <p className="text-[12px] text-gray-400">{kpi.sub}</p>}
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: kpi.color + '18' }}>
              <kpi.Icon size={16} style={{ color: kpi.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: 6-metric combined card */}
      <div className="border border-gray-200 rounded-lg bg-white">
        <div className="grid grid-cols-3">
          {OVERVIEW_METRICS.map((m, i) => (
            <div key={m.label} className={`p-5 ${i < 3 ? 'border-b border-gray-100' : ''} ${i % 3 !== 2 ? 'border-r border-gray-100' : ''}`}>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400 mb-2">{m.label}</p>
              <p className="text-[30px] font-bold text-gray-900 leading-none mb-2">{m.value}</p>
              <p className="text-[12px] text-gray-500 leading-snug">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Visibility trend + Competitor ranking */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 340px' }}>
        {/* Visibility trend */}
        <div className="border border-gray-200 rounded-lg bg-white p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[15px] font-semibold text-gray-900">Visibility trend</h3>
                <HelpCircle size={14} className="text-gray-300" />
              </div>
              <p className="text-[13px] text-gray-500 mt-0.5">Visibility score movement across the current reporting window</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                {['Visibility', 'Mentions', 'Citations'].map(m => (
                  <button key={m} onClick={() => setTrendMetric(m)}
                    className={`px-2.5 py-1.5 text-[12px] font-medium transition-colors ${trendMetric === m ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                    {m}
                  </button>
                ))}
              </div>
              <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                {['7D', '28D', '3M'].map(p => (
                  <button key={p} onClick={() => setTrendPeriod(p)}
                    className={`px-2.5 py-1.5 text-[12px] font-medium transition-colors ${trendPeriod === p ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mb-3">
            {trendLines.map(line => (
              <div key={line.label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ background: line.color }} />
                <span className="text-[12px] text-gray-500">{line.label}</span>
              </div>
            ))}
          </div>
          <MultiLineChart lines={trendLines} xLabels={TREND_X_LABELS} height={200} filled />
        </div>

        {/* Competitor ranking */}
        <div className="border border-gray-200 rounded-lg bg-white p-5">
          <div className="flex items-start gap-1.5 mb-4">
            <h3 className="text-[15px] font-semibold text-gray-900">Competitor ranking</h3>
            <HelpCircle size={14} className="text-gray-300 mt-0.5" />
          </div>
          <p className="text-[12px] text-gray-400 mb-3 -mt-2">Visibility score analysis across your tracked brands</p>
          <div className="grid text-[12px] font-semibold text-gray-400 uppercase tracking-wide pb-2 border-b border-gray-100 mb-2" style={{ gridTemplateColumns: '24px 1fr 36px 52px 40px 36px' }}>
            <span>Rank</span>
            <span className="pl-8">Brand</span>
            <span className="text-right">Pos.</span>
            <span className="text-right">Visibility</span>
            <span className="text-right">Sent.</span>
            <span className="text-right">SoV</span>
          </div>
          <div className="flex flex-col gap-0.5">
            {COMPETITOR_RANKING_DATA.map(c => (
              <div key={c.rank}
                className={`grid items-center py-2.5 rounded-md px-1 ${c.isMe ? 'bg-purple-50' : 'hover:bg-gray-50'} transition-colors`}
                style={{ gridTemplateColumns: '24px 1fr 36px 52px 40px 36px' }}
              >
                <span className="text-[12px] font-semibold text-gray-500">#{c.rank}</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[12px] font-bold shrink-0" style={{ background: c.color }}>
                    {c.initials}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-[12px] font-semibold truncate ${c.isMe ? 'text-purple-700' : 'text-gray-900'}`}>{c.name}</p>
                    <p className="text-[12px] text-gray-400 truncate">{c.domain}</p>
                  </div>
                </div>
                <span className="text-[12px] text-gray-600 text-right">{c.pos}</span>
                <span className="text-[12px] font-bold text-gray-900 text-right">{c.visibility}</span>
                <span className={`text-[12px] font-semibold text-right ${c.sentUp ? 'text-success-600' : 'text-error-600'}`}>{c.sent}</span>
                <span className="text-[12px] text-gray-600 text-right">{c.sov}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Engine coverage */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[15px] font-semibold text-gray-900">Engine coverage</h3>
            <HelpCircle size={14} className="text-gray-300" />
          </div>
          <p className="text-[13px] text-gray-500 mt-0.5">Per-engine visibility, presence, citation rate, and positioning context</p>
        </div>
        <div className="px-5 pb-5">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[180px]">Engine</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[160px]">Visibility</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[88px]">Presence</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[140px]">Avg position</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[100px]">Citation rate</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700">Insight</th>
                </tr>
              </thead>
              <tbody>
                {ENGINE_COVERAGE_DATA.map(eng => (
                  <tr key={eng.name} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 border-r border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-[12px] font-bold shrink-0" style={{ background: eng.color }}>
                          {eng.abbr}
                        </span>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900">{eng.name}</p>
                          <p className="text-[12px] text-gray-400">{eng.sub}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-r border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-gray-900 w-8 shrink-0">{eng.vis}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="h-2 rounded-full bg-primary-600" style={{ width: `${eng.vis}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[13px] text-gray-700 border-r border-gray-100">{eng.presence}</td>
                    <td className="px-3 py-3 border-r border-gray-100">
                      <p className="text-[13px] font-semibold text-gray-900">{eng.avgPos}</p>
                      <p className="text-[12px] text-gray-400">{eng.urlsAnswer}</p>
                    </td>
                    <td className="px-3 py-3 text-[13px] text-gray-700 border-r border-gray-100">{eng.citRate}</td>
                    <td className="px-3 py-3 text-[13px] text-gray-500">{eng.insight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 5: How AI is describing Go High Level */}
      <div className="border border-gray-200 rounded-lg bg-white p-5">
        <div className="flex items-start gap-1.5 mb-1">
          <h3 className="text-[15px] font-semibold text-gray-900">How AI is describing Go High Level</h3>
          <HelpCircle size={14} className="text-gray-300 mt-0.5 shrink-0" />
        </div>
        <p className="text-[13px] text-gray-500 mb-4">Recommendation strength, neutral framing, and negative dismissal across detected mentions</p>
        <div className="flex rounded-full overflow-hidden h-4 mb-4">
          {SENTIMENT_DATA.map(s => (
            <div key={s.label} style={{ width: `${s.value}%`, background: s.color }} />
          ))}
        </div>
        <div className="grid grid-cols-5 border border-gray-100 rounded-lg overflow-hidden mb-4">
          {SENTIMENT_DATA.map((s, i) => (
            <div key={s.label} className={`p-4 ${i < SENTIMENT_DATA.length - 1 ? 'border-r border-gray-100' : ''}`}>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400 mb-2">{s.label}</p>
              <p className="text-[24px] font-bold text-gray-900 leading-none">{s.value}%</p>
            </div>
          ))}
        </div>
        <p className="text-[13px] text-gray-500">AI answers show mixed momentum. Stronger source coverage and clearer category proof can improve how Go High Level is framed.</p>
      </div>

      {/* Row 6: Organic-AI overlap */}
      <div className="border border-gray-200 rounded-lg bg-white p-5">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-start gap-1.5">
            <h3 className="text-[15px] font-semibold text-gray-900">Organic-AI overlap</h3>
            <HelpCircle size={14} className="text-gray-300 mt-0.5 shrink-0" />
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 text-[12px] font-medium border border-primary-200 whitespace-nowrap">
            5 shared URLs
          </span>
        </div>
        <p className="text-[13px] text-gray-500 mb-4">Where Google AI Overview is borrowing from your organic footprint</p>
        <div className="grid gap-4" style={{ gridTemplateColumns: '300px 1fr' }}>
          <div className="flex flex-col gap-3">
            <div className="border border-gray-100 rounded-lg p-5 bg-gray-50">
              <p className="text-[12px] font-semibold tracking-wide text-gray-400 mb-2">Overlap %</p>
              <p className="text-[36px] font-bold text-gray-900 leading-none mb-2">34%</p>
              <p className="text-[12px] text-gray-500 leading-snug">High overlap means traditional SEO is feeding your AIO visibility.</p>
            </div>
            <div className="border border-gray-100 rounded-lg p-5 bg-gray-50">
              <p className="text-[12px] font-semibold tracking-wide text-gray-400 mb-2">Drift watch</p>
              <p className="text-[24px] font-bold text-gray-900 leading-snug mb-2">2 prompts flagged</p>
              <p className="text-[12px] text-gray-500 leading-snug">Watch prompts where overlap is slipping while AIO position is weakening.</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {ORGANIC_OVERLAP_PROMPTS.map((item, i) => (
              <button
                key={i}
                onClick={() => setSelectedPrompt(item)}
                className="w-full text-left border border-gray-200 rounded-xl p-4 hover:border-primary-300 hover:bg-blue-50/40 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-[14px] font-semibold text-gray-900 leading-snug flex-1">{item.prompt}</p>
                  <div className="text-right shrink-0">
                    <p className="text-[24px] font-bold text-gray-900 leading-none">{item.overlap}</p>
                    <p className={`text-[13px] font-semibold mt-0.5 ${item.status === 'Watch drift' ? 'text-warning-600' : 'text-success-600'}`}>{item.status}</p>
                  </div>
                </div>
                <p className="text-[12px] text-gray-400 mt-2">AIO position {item.aioPos}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Row 7: Top performing prompts */}
      <div className="border border-gray-200 rounded-lg bg-white p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">Top performing prompts</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">Highest-visibility prompts in the current date range</p>
          </div>
          <span className="text-[13px] font-semibold text-success-600">Top 5</span>
        </div>
        <div className="flex items-center pb-2 border-b border-gray-100 mb-1">
          <div className="flex-1" />
          <div className="flex items-center gap-8 shrink-0">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400 w-[110px] text-right">Visibility</p>
            <div className="flex items-center gap-1 w-[140px] justify-end">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-gray-400">Trend score Δ</p>
              <HelpCircle size={11} className="text-gray-300" />
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          {TOP_PROMPTS_DATA.map((item, i) => (
            <div key={item.rank} className={`flex items-center gap-4 py-4 ${i < TOP_PROMPTS_DATA.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-[13px] font-bold text-gray-600 shrink-0">{item.rank}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-gray-900 mb-1">{item.prompt}</p>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[12px] font-medium border border-purple-200">{item.tag}</span>
                  <span className="text-[12px] text-gray-400">{item.volume}</span>
                  <span className="text-[12px] text-gray-400">{item.engines}</span>
                </div>
              </div>
              <div className="flex items-center gap-8 shrink-0">
                <p className="text-[14px] font-semibold text-gray-900 w-[110px] text-right">{item.visibility}</p>
                <p className={`text-[14px] font-medium w-[140px] text-right ${item.up ? 'text-success-600' : 'text-error-600'}`}>{item.trendScore}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────

const PAGE_TABS = [
  { id: 'Overview',    label: 'Overview',    Icon: TrendingUp    },
  { id: 'Prompts',     label: 'Prompts',     Icon: MessageCircle },
  { id: 'Sources',     label: 'Sources',     Icon: Globe         },
  { id: 'Competitors', label: 'Competitors', Icon: BarChart3     },
]

export default function PromptTrackingDashboard() {
  const [activeTab, setActiveTab]       = useState('Overview')
  const [engineFilter, setEngineFilter] = useState('All AI engines')
  const [periodFilter, setPeriodFilter] = useState('Last 30 days')

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-gray-50">

      {/* Sticky page header — never scrolls */}
      <div className="bg-white border-b border-gray-200 px-6 pt-5 pb-0 shrink-0">
        <div className="flex items-start justify-between gap-4 pb-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
              <MessageCircle size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="text-[18px] font-bold text-gray-900">Prompt tracking</p>
              <p className="text-[13px] text-gray-500 mt-0.5">User-defined prompt tracking across LLMs.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <DarkDropdown value={engineFilter} onChange={setEngineFilter} options={ENGINE_OPTIONS} icon={Bot} variant="default" />
            <DarkDropdown value={periodFilter} onChange={setPeriodFilter} options={PERIOD_OPTIONS} icon={Clock} variant="active" />
            {activeTab === 'Prompts' && (
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold transition-colors">
                <Plus size={14} />
                Add prompt
              </button>
            )}
          </div>
        </div>

        {/* Brand row */}
        <div className="flex items-center gap-3 mb-4 p-2.5 border border-gray-200 rounded-lg bg-gray-50 w-fit">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-[12px] font-bold shrink-0" style={{ background: '#6938EF' }}>
            GH
          </span>
          <div>
            <p className="text-[13px] font-semibold text-gray-900">Go High Level</p>
            <div className="flex items-center gap-1 text-[12px] text-gray-400">
              <span>gohighlevel.com</span>
              <span>•</span>
              <span>Updated Jun 19, 2026</span>
              <span>•</span>
              <MapPin size={10} />
              <span>United States</span>
            </div>
          </div>
        </div>

        {/* Tab nav with icons */}
        <div className="flex items-center gap-1 -mx-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {PAGE_TABS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-1 border-b-2 -mb-px transition-colors ${isActive ? 'border-primary-600' : 'border-transparent'}`}
              >
                <span className={`flex items-center gap-1.5 px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors ${
                  isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}>
                  <Icon size={14} />
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Scrollable tab content */}
      <div className="flex-1 overflow-y-auto min-h-0 px-5 pt-5 pb-5" style={{ scrollbarGutter: 'stable' }}>
        {activeTab === 'Overview'    && <OverviewContent />}
        {activeTab === 'Prompts'     && <PromptsTabContent />}
        {activeTab === 'Sources'     && <SourceInventoryContent />}
        {activeTab === 'Competitors' && (
          <div className="border border-gray-200 rounded-lg bg-white p-12 flex flex-col items-center justify-center text-center">
            <p className="text-[15px] font-semibold text-gray-900 mb-1">Competitors</p>
            <p className="text-[13px] text-gray-400">This section is coming soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}
