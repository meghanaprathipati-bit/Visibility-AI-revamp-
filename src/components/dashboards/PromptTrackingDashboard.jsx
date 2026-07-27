import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  TrendingUp, Globe, Link2, HelpCircle, ChevronDown, ChevronRight,
  Award, ArrowUp, Users, Bot, Clock,
  MessageCircle, Check, BarChart3, Search, Plus,
  ArrowLeft, ExternalLink, Calendar, AlertTriangle,
  X, CircleCheck,
} from '../../icons/index.js'
import SourceInventoryContent from './SourceInventoryContent'
import CountCard from '../CountCard.jsx'
import HLInput, { HL_INPUT_CLASS } from '../HLInput.jsx'
import VisibilityMeter, { visibilityColor } from '../VisibilityMeter.jsx'
import CompanyLogo from '../CompanyLogo.jsx'
import DateRangePicker, { formatRange } from '../DateRangePicker.jsx'

// ── MultiLineChart ─────────────────────────────────────────────────────────
// Only the last series gets an under-line gradient. Hover shows metric insight.

function buildTrendInsight(metricLabel, dateLabel, entries) {
  const sorted = [...entries].sort((a, b) => b.value - a.value)
  const leader = sorted[0]
  const ourBrand = entries.find(e => e.label === 'GoHighLevel')
  const gap = ourBrand && leader && leader.label !== ourBrand.label
    ? leader.value - ourBrand.value
    : 0

  const metricNoun =
    metricLabel === 'Mentions' ? 'mention score'
      : metricLabel === 'Citations' ? 'citation score'
        : 'visibility score'

  let insight = `${dateLabel}: ${metricNoun} for each tracked brand (0–100 scale).`
  if (leader) {
    insight += ` ${leader.label} leads at ${leader.value}.`
  }
  if (ourBrand && leader && leader.label !== ourBrand.label && gap > 0) {
    insight += ` GoHighLevel is ${gap} pts behind.`
  } else if (ourBrand && leader && leader.label === ourBrand.label) {
    insight += ` GoHighLevel is the top brand this day.`
  }
  return insight
}

// Evenly spaced x-axis ticks — uniform integer step so the gaps (and label padding)
// stay consistent; includes first + last without crowding the penultimate tick.
function buildTickIndices(count, target = 7) {
  if (count <= target) return Array.from({ length: count }, (_, i) => i)
  const last = count - 1
  const n = target
  // Spread ticks evenly across the range including both endpoints. Rounding keeps
  // gaps within ±1 day of each other, so the label spacing reads as uniform.
  const idx = []
  for (let k = 0; k < n; k++) idx.push(Math.round((k * last) / (n - 1)))
  return idx.filter((v, i) => i === 0 || v !== idx[i - 1])
}

const CHART_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'
const CHART_TRANSITION = `left 0.18s ${CHART_EASE}, top 0.18s ${CHART_EASE}`

function MultiLineChart({ lines, xLabels, height = 180, metricLabel = 'Visibility', fill = false }) {
  const wrapRef = useRef(null)
  const [hoverIdx, setHoverIdx] = useState(null)

  // ViewBox pads — HTML overlays (labels, dots, crosshair, tooltip) reuse these
  // fractions so they stay pixel-aligned even though the SVG stretches (preserveAspectRatio="none").
  const PAD_L = 30, PAD_R = 14, PAD_T = 14, PAD_B = 6
  const VW = 580, VH = height
  const CW = VW - PAD_L - PAD_R
  const CH = VH - PAD_T - PAD_B
  const Y_TICKS = [0, 25, 50, 75, 100]
  const baseline = PAD_T + CH
  const lastLine = lines[lines.length - 1]
  const gradId = 'mlc-grad-last-line'
  const padLPct = (PAD_L / VW) * 100
  const padRPct = (PAD_R / VW) * 100
  const padTPct = (PAD_T / VH) * 100
  const plotHPct = (CH / VH) * 100

  function xP(i) { return PAD_L + (i / Math.max(1, xLabels.length - 1)) * CW }
  function yP(v) { return PAD_T + CH - (v / 100) * CH }
  function xPct(i) { return (xP(i) / VW) * 100 }
  function yPct(v) { return (yP(v) / VH) * 100 }

  function buildAreaPath(data) {
    const pts = data.map((v, i) => ({ x: xP(i), y: yP(v) }))
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    return `${line} L${xP(data.length - 1).toFixed(1)},${baseline} L${xP(0).toFixed(1)},${baseline} Z`
  }

  function indexFromClientX(clientX) {
    const el = wrapRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const relX = ((clientX - rect.left) / rect.width) * VW
    const t = (relX - PAD_L) / CW
    return Math.max(0, Math.min(xLabels.length - 1, Math.round(t * (xLabels.length - 1))))
  }

  const hoverEntries = hoverIdx == null ? null : lines.map(line => ({
    label: line.label,
    color: line.color,
    value: line.data[hoverIdx],
  }))
  const hoverInsight = hoverEntries
    ? buildTrendInsight(metricLabel, xLabels[hoverIdx], hoverEntries)
    : null

  const hoverXPct = hoverIdx == null ? 0 : xPct(hoverIdx)
  const tipOnLeft = hoverXPct <= 52   // pointer on left half → card to the right, and vice-versa
  const xTicks = buildTickIndices(xLabels.length, 7)

  return (
    <div className={fill ? 'w-full flex flex-col flex-1 min-h-0' : 'w-full'}>
      <div
        ref={wrapRef}
        className={`relative w-full select-none ${fill ? 'flex-1 min-h-0' : ''}`}
        style={fill ? { minHeight: height } : { height }}
        onMouseMove={e => setHoverIdx(indexFromClientX(e.clientX))}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* Y axis labels — HTML so they never exceed 12px or stretch */}
        <div className="absolute inset-y-0 left-0 pointer-events-none" style={{ width: `${padLPct}%` }}>
          {Y_TICKS.map(y => (
            <span
              key={y}
              className="absolute right-1.5 text-[12px] font-normal text-gray-400 tabular-nums leading-none"
              style={{ top: `${padTPct + ((100 - y) / 100) * plotHPct}%`, transform: 'translateY(-50%)' }}
            >
              {y}
            </span>
          ))}
        </div>

        {/* Grid + area + lines (stretched, but strokes stay crisp) */}
        <svg width="100%" height="100%" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" className="block">
          <defs>
            {lastLine && (
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lastLine.color} stopOpacity="0.16" />
                <stop offset="60%" stopColor={lastLine.color} stopOpacity="0.05" />
                <stop offset="100%" stopColor={lastLine.color} stopOpacity="0" />
              </linearGradient>
            )}
          </defs>

          {Y_TICKS.map(y => (
            <line
              key={y}
              x1={PAD_L} y1={yP(y)} x2={VW - PAD_R} y2={yP(y)}
              stroke={y === 0 ? '#E4E7EC' : '#F2F4F7'}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {lastLine && <path d={buildAreaPath(lastLine.data)} fill={`url(#${gradId})`} />}

          {lines.map(line => {
            const points = line.data.map((v, i) => `${xP(i).toFixed(1)},${yP(v).toFixed(1)}`).join(' ')
            return (
              <polyline
                key={line.label}
                points={points}
                fill="none"
                stroke={line.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={{ opacity: hoverIdx != null && line !== lastLine ? 0.9 : 1, transition: 'opacity 0.18s ease' }}
              />
            )
          })}
        </svg>

        {/* Hover crosshair — HTML, animates horizontally */}
        {hoverIdx != null && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${hoverXPct}%`,
              top: `${padTPct}%`,
              height: `${plotHPct}%`,
              width: 1,
              background: '#D0D5DD',
              transform: 'translateX(-0.5px)',
              transition: `left 0.18s ${CHART_EASE}`,
            }}
          />
        )}

        {/* Hover dots — HTML → always perfect circles, slide smoothly between points */}
        {hoverIdx != null && lines.map(line => (
          <div
            key={`dot-${line.label}`}
            className="absolute rounded-full bg-white pointer-events-none"
            style={{
              left: `${hoverXPct}%`,
              top: `${yPct(line.data[hoverIdx])}%`,
              width: 11,
              height: 11,
              border: `2px solid ${line.color}`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 1px 4px rgba(16, 24, 40, 0.18)',
              transition: CHART_TRANSITION,
            }}
          />
        ))}

        {/* Tooltip — sits beside the pointer (never covering the dots) and follows it */}
        {hoverIdx != null && hoverEntries && (
          <div
            className="absolute z-20 pointer-events-none w-[208px] rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-lg"
            style={{
              left: `${hoverXPct}%`,
              top: 6,
              marginLeft: tipOnLeft ? 16 : -16,
              transform: tipOnLeft ? 'none' : 'translateX(-100%)',
              transition: `left 0.18s ${CHART_EASE}`,
            }}
          >
            <p className="text-[12px] font-semibold text-gray-900 m-0 mb-1">{xLabels[hoverIdx]}</p>
            <p className="text-[12px] font-medium text-gray-500 m-0 mb-2 normal-case">
              {metricLabel === 'Mentions' ? 'Mention score'
                : metricLabel === 'Citations' ? 'Citation score'
                  : 'Visibility score'}
            </p>
            <div className="flex flex-col gap-1 mb-2">
              {hoverEntries.map(e => (
                <div key={e.label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: e.color }} />
                    <span className="text-[12px] font-medium text-gray-700 truncate">{e.label}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-gray-900 tabular-nums">{e.value}</span>
                </div>
              ))}
            </div>
            <p className="text-[12px] font-normal text-gray-500 m-0 leading-snug border-t border-gray-100 pt-2">
              {hoverInsight}
            </p>
          </div>
        )}
      </div>

      {/* X axis date labels — evenly spaced, aligned to the plot area, edge-aware */}
      <div
        className="relative mt-2 h-4 overflow-visible"
        style={{ paddingLeft: `${padLPct}%`, paddingRight: `${padRPct}%` }}
      >
        {xTicks.map((i, k) => {
          // Space the chosen ticks evenly across the plot width so the padding
          // between date labels is always uniform, even when the label count
          // doesn't divide evenly into the data range.
          const pct = (k / Math.max(1, xTicks.length - 1)) * 100
          const isFirst = k === 0
          const isLast = k === xTicks.length - 1
          return (
            <span
              key={i}
              className="absolute text-[12px] font-normal text-gray-500 whitespace-nowrap leading-none"
              style={{
                left: `${pct}%`,
                transform: isFirst ? 'none' : isLast ? 'translateX(-100%)' : 'translateX(-50%)',
              }}
            >
              {xLabels[i]}
            </span>
          )
        })}
      </div>
    </div>
  )
}

// ── DarkDropdown ───────────────────────────────────────────────────────────

// `dateRangeOption` — when that option is chosen the popover swaps to a calendar
// range picker instead of closing (mirrors HLDatePicker type="daterange").
function DarkDropdown({ value, onChange, options, icon: Icon, variant = 'default', dateRangeOption }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('list') // 'list' | 'calendar'
  const [range, setRange] = useState({ start: null, end: null })
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setMode('list') }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const presets = options.filter(Boolean)
  // A custom range is active when the current value isn't one of the presets.
  const customActive = dateRangeOption && !presets.includes(value)

  function handleSelect(opt) {
    if (opt === dateRangeOption) { setMode('calendar'); return }
    onChange(opt); setOpen(false); setMode('list')
  }

  return (
    <div ref={ref} className="relative">
      {/* Matches the canonical table filter chip (h-8, rounded-full, border-gray-300). */}
      <button
        onClick={() => { setOpen(o => !o); setMode('list') }}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-gray-300 bg-white text-[13px] font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
      >
        {Icon && <Icon size={14} className="text-gray-400" />}
        <span>{value}</span>
        <ChevronDown size={14} className="text-gray-400" />
      </button>

      {open && mode === 'list' && (
        <div className="absolute top-full left-0 mt-1.5 bg-white border border-gray-200 rounded-xl z-50 p-1" style={{ minWidth: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}>
          {options.map(opt => {
            const isSelected = value === opt || (opt === dateRangeOption && customActive)
            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors text-left ${isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'}`}
              >
                <span className={isSelected ? 'text-primary-700 font-semibold' : 'text-gray-700'}>{opt}</span>
                {isSelected && <Check size={13} className="text-primary-600 shrink-0" />}
              </button>
            )
          })}
        </div>
      )}

      {open && mode === 'calendar' && (
        <div className="absolute top-full left-0 mt-1.5 bg-white border border-gray-200 rounded-xl z-50" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}>
          <DateRangePicker
            value={range}
            onCancel={() => setMode('list')}
            onApply={(r) => {
              setRange(r)
              onChange(formatRange(r.start, r.end))
              setOpen(false); setMode('list')
            }}
          />
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
  { label: 'Google AI overview coverage', value: '62%',      desc: 'How often Google shows an AI Overview for the tracked prompts.' },
  { label: 'Answer density',              value: '6.8 URLs', desc: '2.4 brand mentions per answer.' },
  { label: 'SoV gap to leader',           value: '9 pts',    desc: 'Share-of-voice distance from the leading brand.' },
]

const COMPETITOR_RANKING_DATA = [
  { rank: 1, name: 'HubSpot',        domain: 'hubspot.com',        initials: 'H',  color: '#FF7A59', pos: 2.1, visibility: '78%', sent: '+62', sov: '24%', sentUp: true },
  { rank: 2, name: 'Calendly',       domain: 'calendly.com',       initials: 'C',  color: '#0069FF', pos: 2.8, visibility: '62%', sent: '+71', sov: '18%', sentUp: true },
  { rank: 3, name: 'GoHighLevel',  domain: 'gohighlevel.com',    initials: 'GH', color: '#6938EF', pos: 4.4, visibility: '58%', sent: '+11', sov: '15%', sentUp: true, isMe: true },
  { rank: 4, name: 'Pipedrive',      domain: 'pipedrive.com',      initials: 'P',  color: '#2B2D42', pos: 4.2, visibility: '41%', sent: '+58', sov: '11%', sentUp: true },
  { rank: 5, name: 'Salesforce',     domain: 'salesforce.com',     initials: 'S',  color: '#00A1E0', pos: 4.6, visibility: '37%', sent: '+44', sov: '10%', sentUp: true },
  { rank: 6, name: 'ActiveCampaign', domain: 'activecampaign.com', initials: 'A',  color: '#356AE6', pos: 5.1, visibility: '32%', sent: '+52', sov: '8%',  sentUp: true },
]

// ── Competitors tab data ───────────────────────────────────────────────────
// Prototype data for the Competitors tab. `sentiment`/`visibility`/`sov` are numeric
// so the leaderboard, KPIs, and heatmap can all derive from one source. Replace with
// the real competitor API response when wired.
const COMPETITOR_LEADERBOARD = [
  { rank: 1, name: 'HubSpot',        domain: 'hubspot.com',        initials: 'H',  color: '#FF7A59', visibility: 78, sov: 24, avgPos: 2.1, sentiment: 62, mentions: 312, citations: 198 },
  { rank: 2, name: 'Calendly',       domain: 'calendly.com',       initials: 'C',  color: '#0069FF', visibility: 62, sov: 18, avgPos: 2.8, sentiment: 71, mentions: 264, citations: 176 },
  { rank: 3, name: 'GoHighLevel',  domain: 'gohighlevel.com',    initials: 'GH', color: '#6938EF', visibility: 58, sov: 15, avgPos: 4.4, sentiment: 11, mentions: 241, citations: 152, isMe: true },
  { rank: 4, name: 'Pipedrive',      domain: 'pipedrive.com',      initials: 'P',  color: '#2B2D42', visibility: 41, sov: 11, avgPos: 4.2, sentiment: 58, mentions: 188, citations: 121 },
  { rank: 5, name: 'Salesforce',     domain: 'salesforce.com',     initials: 'S',  color: '#00A1E0', visibility: 37, sov: 10, avgPos: 4.6, sentiment: 44, mentions: 173, citations: 140 },
  { rank: 6, name: 'ActiveCampaign', domain: 'activecampaign.com', initials: 'A',  color: '#356AE6', visibility: 32, sov: 8,  avgPos: 5.1, sentiment: 52, mentions: 151, citations: 96  },
  { rank: 7, name: 'Zoho CRM',       domain: 'zoho.com',           initials: 'ZC', color: '#E42527', visibility: 24, sov: 7,  avgPos: 5.8, sentiment: 38, mentions: 122, citations: 78  },
]

const COMPETITOR_VIEWS = ['Leaderboard', 'Mentions vs sources', 'By topic']

const COMPETITOR_TOPICS = ['AI visibility', 'Rank tracking', 'Citations', 'Local SEO', 'Integrations']

// Dummy per-brand, per-topic visibility (0–100) derived from the brand's base
// visibility so the heatmap reads realistically. Swap for real per-topic data later.
function competitorTopicScore(base, ti) {
  const spread = [6, -8, 3, -5, 10][ti] ?? 0
  return Math.max(4, Math.min(99, base + spread))
}

// Sentiment tone thresholds — high ≥60 green, mid 50–59 amber, low <50 red.
function competitorSentimentTone(v) {
  if (v >= 60) return { text: 'text-success-700', bg: 'bg-success-50' }
  if (v >= 50) return { text: 'text-warning-600', bg: 'bg-warning-50' }
  return { text: 'text-error-600', bg: 'bg-error-50' }
}

const ADD_COMPETITOR_COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'India',
  'Germany', 'France', 'Netherlands', 'Singapore', 'Brazil',
]

const ENGINE_COVERAGE_DATA = [
  { name: 'Perplexity',  abbr: 'P',  color: 'var(--primary-800)', sub: 'US · English · 12 prompts', vis: 76, presence: '69.0%', avgPos: '#2.3', urlsAnswer: '6.4 URLs / answer', citRate: '58.0%', insight: 'Best current engine for mention depth and citation pickup.' },
  { name: 'Claude',      abbr: 'C',  color: 'var(--purple-600)', sub: 'US · English · 12 prompts', vis: 71, presence: '63.0%', avgPos: '#2.9', urlsAnswer: '5.1 URLs / answer', citRate: '47.0%', insight: 'Visibility is present, but citations still lag the strongest engines.' },
  { name: 'Gemini',      abbr: 'G',  color: '#1D4ED8', sub: 'US · English · 12 prompts', vis: 64, presence: '56.0%', avgPos: '#3.7', urlsAnswer: '4.8 URLs / answer', citRate: '41.0%', insight: 'Brand named often enough, but answer prominence is still uneven.' },
  { name: 'AI Mode',     abbr: 'AM', color: '#0D9488', sub: 'US · English · 12 prompts', vis: 68, presence: '61.0%', avgPos: '#3.1', urlsAnswer: '5.3 URLs / answer', citRate: '46.0%', insight: 'Strong middle-of-answer pickup with room to improve citation consistency.' },
  { name: 'AI Overview', abbr: 'AO', color: '#16A34A', sub: 'US · English · 12 prompts', vis: 73, presence: '65.0%', avgPos: '#2.6', urlsAnswer: '5.0 URLs / answer', citRate: '52.0%', insight: 'Strongly tied to your organic rankings — keep traditional SEO healthy.' },
]

const SENTIMENT_DATA = [
  { label: 'Recommended', value: 14, color: '#34D399' },
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
    { label: 'GoHighLevel', color: 'var(--primary-600)', data: [82,83,82,84,83,85,84,86,85,87,86,88,87,90] },
    { label: 'HubSpot',       color: '#EF4444', data: [97,97,98,98,99,98,99,99,100,99,100,100,99,100] },
    { label: 'Calendly',      color: '#06B6D4', data: [78,79,79,80,79,81,80,82,81,82,83,82,83,84] },
    { label: 'Pipedrive',     color: '#6B7280', data: [70,71,70,72,71,73,72,74,73,75,74,75,76,78] },
  ],
  Mentions: [
    { label: 'GoHighLevel', color: 'var(--primary-600)', data: [71,72,73,74,73,75,74,76,75,77,76,78,77,79] },
    { label: 'HubSpot',       color: '#EF4444', data: [88,89,88,90,89,91,90,92,91,92,93,92,93,94] },
    { label: 'Calendly',      color: '#06B6D4', data: [65,66,65,67,66,68,67,68,67,69,68,70,69,71] },
    { label: 'Pipedrive',     color: '#6B7280', data: [58,59,58,60,59,61,60,62,61,62,63,62,63,64] },
  ],
  Citations: [
    { label: 'GoHighLevel', color: 'var(--primary-600)', data: [42,43,44,43,45,44,46,45,47,46,48,47,48,49] },
    { label: 'HubSpot',       color: '#EF4444', data: [68,69,68,70,69,71,70,72,71,72,73,72,73,74] },
    { label: 'Calendly',      color: '#06B6D4', data: [35,36,35,37,36,38,37,38,37,39,38,40,39,41] },
    { label: 'Pipedrive',     color: '#6B7280', data: [28,29,28,30,29,31,30,31,30,32,31,32,31,33] },
  ],
}

// ── Prompts tab data ───────────────────────────────────────────────────────

const PROMPTS_KPIS = [
  { label: 'Tracked prompts',   value: '5',      Icon: Search,     color: 'var(--primary-600)' },
  { label: 'Avg visibility',    value: '52/100', Icon: TrendingUp, color: '#6938EF' },
  { label: 'Avg search volume', value: '1.1K',   Icon: BarChart3,  color: '#0D9488' },
  { label: 'Engine coverage',   value: '48%',    Icon: Globe,      color: '#D97706' },
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

// Unified prompt dataset — rollups, inventory, KPIs and segments are all derived from this.
const PROMPTS_DATA = [
  { id: 'p1', prompt: 'What are the best AI visibility platforms for multi-location brands?', topic: 'AI Visibility',  intent: 'Commercial',    volume: '1.9K', volNum: 1900, engFilled: 4, visibility: 82, avgPos: '#1.8', mentions: '4 / 5', status: 'Winning', trend: '+4'  },
  { id: 'p2', prompt: 'How do AI rank tracking tools compare for SEO agencies?',              topic: 'Comparisons',    intent: 'Commercial',    volume: '1.3K', volNum: 1300, engFilled: 3, visibility: 71, avgPos: '#2.4', mentions: '3 / 5', status: 'Winning', trend: '+3'  },
  { id: 'p3', prompt: 'Best tools to monitor citations in ChatGPT and Google AI Overview',    topic: 'Sources',        intent: 'Informational', volume: '880',  volNum: 880,  engFilled: 3, visibility: 54, avgPos: '#3.7', mentions: '3 / 5', status: 'Neutral', trend: '+3'  },
  { id: 'p4', prompt: 'How can agencies improve AI citation rate for client brands?',          topic: 'Citations',      intent: 'Informational', volume: '720',  volNum: 720,  engFilled: 1, visibility: 29, avgPos: '#6.8', mentions: '1 / 5', status: 'Losing',  trend: '-9'  },
  { id: 'p5', prompt: 'What makes a brand appear in AI answers more often?',                  topic: 'Brand Presence', intent: 'Informational', volume: '540',  volNum: 540,  engFilled: 1, visibility: 24, avgPos: '#7.4', mentions: '1 / 5', status: 'Losing',  trend: '-11' },
]

// Status colour + copy meta, shared by rollups / badges / visibility bars.
const STATUS_META = {
  Winning:     { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', desc: 'High visibility and majority-engine presence.' },
  Opportunity: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', desc: 'High-value prompts with low current visibility.' },
  Neutral:     { color: '#155EEF', bg: '#EFF6FF', border: '#BFDBFE', desc: 'Stable prompts with moderate engine coverage.' },
  Losing:      { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', desc: 'Prompts showing the sharpest negative trend.' },
}
const ROLLUP_ORDER = ['Winning', 'Opportunity', 'Neutral', 'Losing']

// Engine identity for the per-prompt coverage dots (first N mentioned, rest muted).
// `name` keys into ENGINE_LOGO_MAP so the dots render the real brand logos.
const ENGINE_PALETTE = [
  { name: 'Perplexity',  letter: 'P', color: '#155EEF' },
  { name: 'Claude',      letter: 'C', color: '#D97706' },
  { name: 'Gemini',      letter: 'G', color: '#6938EF' },
  { name: 'AI Mode',     letter: 'A', color: '#0D9488' },
  { name: 'AI Overview', letter: 'O', color: '#16A34A' },
]

// Sidebar — engines where the brand is mentioned. (dummy data)
const ENGINE_COVERAGE_BARS = [
  { name: 'ChatGPT',    letter: 'G', color: '#10A37F', count: 4, total: 5 },
  { name: 'Perplexity', letter: 'P', color: '#155EEF', count: 4, total: 5 },
  { name: 'Claude',     letter: 'C', color: '#D97706', count: 3, total: 5 },
  { name: 'Gemini',     letter: 'G', color: '#6938EF', count: 1, total: 5 },
]

// Avg search-volume KPI — top topics by volume. (dummy data)
const VOLUME_BARS = [
  { label: 'AI Visibility', value: '1.9K', pct: 100, color: 'var(--primary-600)' },
  { label: 'Comparisons',   value: '1.3K', pct: 68,  color: 'var(--primary-800)' },
  { label: 'Sources',       value: '880',  pct: 46,  color: '#0D9488' },
]

// Avg visibility 5-week trend sparkline. (dummy data)
const VIS_TREND_SPARK = [46, 48, 47, 50, 49, 52]

const SEGMENTS = ROLLUP_ORDER.map(s => `${s} (${PROMPTS_DATA.filter(p => p.status === s).length})`)
SEGMENTS.unshift(`All (${PROMPTS_DATA.length})`)

const STATUS_COUNTS = ROLLUP_ORDER.map(s => ({
  status: s,
  count: PROMPTS_DATA.filter(p => p.status === s).length,
  color: STATUS_META[s].color,
}))

// ── Prompt detail data ─────────────────────────────────────────────────────

const DETAIL_X_LABELS = ['May 22','May 24','May 26','May 28','May 30','Jun 1','Jun 3','Jun 5','Jun 7','Jun 9','Jun 11','Jun 13','Jun 15','Jun 17','Jun 18']

const DETAIL_TREND_LINES = [
  { label: 'Perplexity', color: 'var(--primary-800)', data: [76,78,80,81,82,83,84,86,87,88,90,91,93,95,97] },
  { label: 'Claude',     color: 'var(--purple-600)', data: [72,74,75,76,77,78,79,80,80,81,82,82,83,83,83] },
  { label: 'Gemini',     color: 'var(--primary-600)', data: [65,67,68,69,70,71,72,73,74,74,75,76,76,77,77] },
  { label: 'AI Mode',    color: '#059669', data: [65,66,68,68,69,70,71,72,73,73,74,75,75,76,77] },
]

const DETAIL_AI_RESPONSES = [
  { engine: 'AI Mode',    abbr: 'AM', color: '#0D9488', status: 'Succeeded', text: 'Direct answer: GoHighLevel is visible for this prompt, but the response quality depends on whether the engine can find clear proof, strong source pages, and structured comparisons.', brands: ['HubSpot', 'GoHighLevel', 'Calendly'], sources: 2, created: 'Jun 1, 2026' },
  { engine: 'Claude',     abbr: 'C',  color: 'var(--purple-600)', status: 'Succeeded', text: 'Direct answer: GoHighLevel is visible for this prompt, but the response quality depends on whether the engine can find clear proof, strong source pages, and structured comparisons.', brands: ['Calendly', 'GoHighLevel', 'HubSpot'], sources: 2, created: 'Jun 1, 2026' },
  { engine: 'Gemini',     abbr: 'G',  color: '#1D4ED8', status: 'Succeeded', text: 'Direct answer: GoHighLevel is visible for this prompt, but the response quality depends on whether the engine can find clear proof, strong source pages, and structured comparisons.', brands: ['GoHighLevel', 'HubSpot', 'Calendly'], sources: 2, created: 'Jun 1, 2026' },
  { engine: 'Perplexity', abbr: 'P',  color: 'var(--primary-800)', status: 'Succeeded', text: 'Direct answer: GoHighLevel is visible for this prompt, but the response quality depends on whether the engine can find clear proof, strong source pages, and structured comparisons.', brands: ['GoHighLevel', 'Calendly', 'HubSpot'], sources: 2, created: 'Jun 1, 2026' },
  { engine: 'AI Mode',    abbr: 'AM', color: '#0D9488', status: 'Succeeded', text: 'Direct answer: GoHighLevel is visible for this prompt, but the response quality depends on whether the engine can find clear proof.', brands: ['GoHighLevel'], sources: 1, created: 'May 31, 2026' },
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

// Real engine logos showing which engines mention the brand (full colour) vs not
// (muted, greyscaled). Uses the shared EngineLogo so no letter-monogram placeholders.
function EngineLetterDots({ filled }) {
  return (
    <div className="flex items-center gap-1">
      {ENGINE_PALETTE.map((e, i) => {
        const mentioned = i < filled
        return (
          <span
            key={i}
            title={e.name}
            className={`inline-flex items-center justify-center w-[20px] h-[20px] rounded-full bg-white border border-gray-200 shrink-0 transition-opacity ${
              mentioned ? '' : 'opacity-35 grayscale'
            }`}
          >
            <EngineLogo name={e.name} size={12} chip={false} />
          </span>
        )
      })}
    </div>
  )
}

// Compact circular % gauge (SVG donut) for the Topic visibility grid.
function RingGauge({ pct, color, label, size = 64, stroke = 6 }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.max(0, Math.min(100, pct)) / 100)
  return (
    <div className="flex flex-col items-center gap-1.5 min-w-0">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="var(--gray-100)" strokeWidth={stroke}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 500ms ease' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[14px] font-bold text-gray-900">{pct}%</span>
      </div>
      <span className="text-[12px] text-gray-500 text-center leading-tight truncate max-w-full">{label}</span>
    </div>
  )
}

// Lightweight filled sparkline for KPI tiles.
function MiniSparkline({ data, color = '#6938EF', height = 40 }) {
  const W = 200
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: height - ((v - min) / range) * (height - 6) - 3,
  }))
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `${line} L${W},${height} L0,${height} Z`
  const gradId = `mspk-${String(color).replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" className="block overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <polyline points={pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StatusBadge({ status }) {
  const s = STATUS_META[status] || STATUS_META.Neutral
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium whitespace-nowrap"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {status}
    </span>
  )
}

// Brand/competitor avatar — real company logo (by domain) with a graceful
// fallback to the brand's colored initials.
function CompetitorAvatar({ c, size = 32 }) {
  const cls = size <= 24 ? 'w-6 h-6' : size <= 28 ? 'w-7 h-7' : 'w-8 h-8'
  return (
    <CompanyLogo
      domain={c.domain}
      size={size}
      rounded="rounded-full"
      fallback={
        <span className={`inline-flex items-center justify-center ${cls} rounded-full text-white text-[11px] font-semibold shrink-0`} style={{ background: c.color }}>
          {c.initials}
        </span>
      }
    />
  )
}

// ── Prompts tab content ────────────────────────────────────────────────────

function PromptsTabContent({ injectedPrompt = null, onInjectedBack }) {
  const [segment, setSegment] = useState(SEGMENTS[0])
  const [selectedPrompt, setSelectedPrompt] = useState(null)

  const activeStatus = segment.split(' (')[0]
  const visiblePrompts = activeStatus === 'All' ? PROMPTS_DATA : PROMPTS_DATA.filter(p => p.status === activeStatus)
  const groupsToShow = ROLLUP_ORDER.filter(s => activeStatus === 'All' || s === activeStatus)

  // Clicking any prompt (rollup card or inventory row) opens the dedicated detail
  // page. A prompt injected from the Overview overlap cards takes precedence and
  // keeps its "Back to overview" affordance.
  const detailPrompt = injectedPrompt || selectedPrompt
  if (detailPrompt) {
    return (
      <div className="px-5 py-5">
        <PromptDetailView
          prompt={detailPrompt}
          backLabel={injectedPrompt ? 'Back to overview' : 'Back to prompts'}
          onBack={injectedPrompt ? onInjectedBack : () => setSelectedPrompt(null)}
        />
      </div>
    )
  }

  return (
    <div>

      {/* ── KPI cards (scroll away) ─────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4">
        <div className="grid grid-cols-4 gap-3">
          {PROMPTS_KPIS.map((kpi, i) => {
            // Tracked prompts stays dynamic; other values are hardcoded for the prototype.
            const value = i === 0 ? PROMPTS_DATA.length : kpi.value
            return (
              <CountCard key={kpi.label} label={kpi.label} value={value} Icon={kpi.Icon} iconColor={kpi.color} help />
            )
          })}
        </div>
      </div>

      {/* ── Sticky segment bar (pins under the header toolbar) ──────── */}
      <div className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-sm border-y border-gray-200 px-5 py-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {SEGMENTS.map(seg => {
              const isActive = segment === seg
              return (
                <button
                  key={seg}
                  onClick={() => setSegment(seg)}
                  className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors border ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 border-primary-200'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {seg}
                </button>
              )
            })}
          </div>
          <span className="text-[13px] font-medium text-primary-600 whitespace-nowrap">{visiblePrompts.length} prompts in view</span>
        </div>
      </div>

      {/* ── Main content (scrolls under the sticky bar) ─────────────── */}
      <div className="px-5 pt-5 pb-6">
        <div className="grid gap-4 items-start" style={{ gridTemplateColumns: 'minmax(0, 64fr) minmax(0, 36fr)' }}>

          {/* Left — prompt rollups grouped by status */}
          <div className="flex flex-col gap-5 min-w-0">
            {groupsToShow.map(status => {
              const meta = STATUS_META[status]
              const groupPrompts = visiblePrompts.filter(p => p.status === status)
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: meta.color }} />
                      <span className="text-[14px] font-semibold text-gray-900">{status}</span>
                      <span className="text-[13px] text-gray-400 truncate">— {meta.desc}</span>
                    </div>
                    <span className="text-[14px] font-semibold shrink-0" style={{ color: meta.color }}>{groupPrompts.length}</span>
                  </div>

                  {groupPrompts.length === 0 ? (
                    <div className="border border-dashed border-gray-300 rounded-xl px-6 py-8 text-center bg-white">
                      <p className="text-[13px] text-gray-400">No prompts match this bucket in the current range.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {groupPrompts.map(p => {
                        const up = p.trend.startsWith('+')
                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPrompt(p)}
                            className="border border-gray-200 rounded-xl bg-white p-4 hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-[14px] font-semibold text-gray-900 leading-snug m-0">{p.prompt}</p>
                              <span className={`flex items-center gap-0.5 text-[13px] font-medium shrink-0 ${up ? 'text-success-600' : 'text-error-600'}`}>
                                <TrendingUp size={13} style={up ? undefined : { transform: 'rotate(180deg)' }} />
                                {p.trend}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <TopicTag topic={p.topic} />
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium bg-gray-50 text-gray-500 border border-gray-200">{p.volume} vol</span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium bg-gray-50 text-gray-500 border border-gray-200">{p.intent}</span>
                            </div>
                            <div className="mt-3">
                              <span className="text-[12px] text-gray-500">Visibility</span>
                              <VisibilityMeter value={p.visibility} barWidth="100%" className="mt-1" />
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <EngineLetterDots filled={p.engFilled} />
                              <span className="text-[12px] text-gray-400">{p.avgPos} avg · {p.mentions} engines</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right — topic visibility + engine coverage sidebar */}
          <div className="flex flex-col gap-4 min-w-0">

            {/* Topic Visibility */}
            <div className="border border-gray-200 rounded-xl bg-white p-4">
              <div className="flex items-start justify-between mb-0.5">
                <h3 className="text-[15px] font-semibold text-gray-900 m-0">Topic visibility</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 text-[12px] font-medium border border-primary-200">{TOPIC_VIS_DATA.length} topics</span>
              </div>
              <p className="text-[12px] text-gray-500 m-0 mb-3">Sorted by avg visibility · supported by prompt count</p>
              <div className="grid grid-cols-2 gap-3">
                {TOPIC_VIS_DATA.map(t => (
                  <RingGauge key={t.topic} pct={t.pct} color={t.color} label={t.topic} />
                ))}
              </div>
            </div>

            {/* AI Engine Coverage */}
            <div className="border border-gray-200 rounded-xl bg-white p-4">
              <h3 className="text-[15px] font-semibold text-gray-900 m-0">AI engine coverage</h3>
              <p className="text-[12px] text-gray-500 m-0 mb-3">Engines where brand is mentioned</p>
              <div className="flex flex-col gap-3">
                {ENGINE_COVERAGE_BARS.map(e => (
                  <div key={e.name} className="flex items-center gap-2.5">
                    <EngineLogo name={e.name} size={13} className="w-6 h-6" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-medium text-gray-700 truncate">{e.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: e.total }).map((_, i) => (
                              <span
                                key={i}
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{
                                  background: i < e.count ? e.color : 'transparent',
                                  border: i < e.count ? 'none' : '1px solid var(--gray-300)',
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-[12px] font-semibold text-gray-500 tabular-nums">{e.count}/{e.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Prompt inventory table — full width */}
        <div className="border border-gray-200 rounded-xl bg-white mt-4 overflow-hidden">
          <div className="p-5 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[15px] font-semibold text-gray-900 m-0">Prompt inventory</h3>
                <HelpCircle size={14} className="text-gray-300" />
              </div>
              <p className="text-[13px] text-gray-500 mt-0.5 m-0">Prompt-level detail by range, intent, topic, and engine coverage</p>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 text-[12px] font-medium border border-primary-200 shrink-0">{visiblePrompts.length} rows</span>
          </div>
          <div className="px-5 pb-5">
            <div className="border border-gray-200 rounded-lg overflow-x-auto w-full">
              <table className="w-full border-collapse min-w-[860px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200 normal-case">Prompt</th>
                    <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200 normal-case">Topic</th>
                    <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200 normal-case">Intent</th>
                    <th className="px-3 py-2.5 text-right text-[12px] font-semibold text-gray-900 border-r border-gray-200 normal-case">Volume</th>
                    <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200 normal-case">Engines</th>
                    <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200 normal-case">Visibility</th>
                    <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200 normal-case">Avg pos</th>
                    <th className="px-3 py-2.5 text-right text-[12px] font-semibold text-gray-900 border-r border-gray-200 normal-case">Mentions</th>
                    <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 normal-case">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visiblePrompts.map((row, i) => {
                    const up = row.trend.startsWith('+')
                    return (
                      <tr
                        key={i}
                        onClick={() => setSelectedPrompt(row)}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-3 py-3 border-r border-gray-100 align-top max-w-[320px]">
                          <p className="text-[13px] font-medium text-gray-900 leading-snug m-0">{row.prompt}</p>
                          <p className="text-[12px] text-gray-400 mt-1 m-0">
                            Trend <span className={up ? 'text-success-600' : 'text-error-600'}>{row.trend}</span>
                            {' · '}{row.engFilled} / 5 engines mentioning
                          </p>
                        </td>
                        <td className="px-3 py-3 border-r border-gray-100 align-middle">
                          <TopicTag topic={row.topic} />
                        </td>
                        <td className="px-3 py-3 border-r border-gray-100 align-middle">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-[12px] font-semibold text-gray-600">
                            {row.intent[0]}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-[13px] text-gray-700 border-r border-gray-100 align-middle text-right tabular-nums">{row.volume}</td>
                        <td className="px-3 py-3 border-r border-gray-100 align-middle">
                          <EngineLetterDots filled={row.engFilled} />
                        </td>
                        <td className="px-3 py-3 border-r border-gray-100 align-middle">
                          <VisibilityMeter value={row.visibility} />
                        </td>
                        <td className="px-3 py-3 text-[13px] font-medium text-gray-700 border-r border-gray-100 align-middle">{row.avgPos}</td>
                        <td className="px-3 py-3 text-[13px] text-gray-700 border-r border-gray-100 align-middle text-right tabular-nums">{row.mentions}</td>
                        <td className="px-3 py-3 align-middle">
                          <StatusBadge status={row.status} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
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

function PromptDetailView({ prompt, onBack, backLabel = 'Back to overview' }) {
  const [trendMetric, setTrendMetric] = useState('Visibility')
  const [trendPeriod, setTrendPeriod] = useState('28D')
  const [sourcesView, setSourcesView] = useState('URL')
  const [fullResponse, setFullResponse] = useState(null)

  // Hero badges + KPIs derive from the clicked prompt when the data is present,
  // and fall back to representative values for entry points (e.g. Overview) that
  // pass a lighter prompt object.
  const heroTopic = prompt.topic || 'AI Visibility'
  const heroStatus = STATUS_META[prompt.status] ? prompt.status : 'Winning'
  const heroStatusMeta = STATUS_META[heroStatus]

  const DETAIL_KPI = [
    { label: 'Visibility score', value: prompt.visibility != null ? `${prompt.visibility}/100` : '82/100', desc: 'Current prompt-level visibility across tracked engines.', Icon: Award,      color: '#6938EF' },
    { label: 'Avg position',     value: prompt.avgPos || prompt.aioPos || '#1.8', desc: 'Average cited position when the brand appears.',          Icon: TrendingUp,  color: '#16A34A' },
    { label: 'AI responses',     value: '112',    desc: 'Latest prompt responses available for drill-down.',        Icon: Bot,         color: 'var(--primary-600)' },
    { label: 'Search volume',    value: prompt.volume || '1.9K',   desc: 'Demand proxy carried through from the tracked prompt.',   Icon: BarChart3,   color: '#D97706' },
  ]

  return (
    <div className="flex flex-col gap-4">

      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-700 transition-colors w-fit">
        <ArrowLeft size={14} />
        {backLabel}
      </button>

      {/* Hero card — snapshot stats sit below the title + subtext */}
      <div className="border border-gray-200 rounded-lg bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-[12px] font-medium border border-purple-200">{heroTopic}</span>
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-medium border"
            style={{
              color: heroStatusMeta.color,
              background: `color-mix(in srgb, ${heroStatusMeta.color} 10%, transparent)`,
              borderColor: `color-mix(in srgb, ${heroStatusMeta.color} 28%, transparent)`,
            }}
          >
            {heroStatus}
          </span>
          <span className="text-[12px] text-gray-400">Last 30 days</span>
          <span className="text-[12px] text-gray-400">US</span>
        </div>
        <h2 className="text-[20px] font-semibold text-gray-900 leading-snug mb-2">{prompt.prompt}</h2>
        <p className="text-[13px] text-gray-500 leading-relaxed max-w-3xl">This view separates trend analysis, AI response conversations, engine diagnostics, and prompt-level sources so each widget answers a different analysis question.</p>

        {/* Prompt snapshot */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-[12px] font-medium text-primary-600 mb-2.5">Prompt snapshot</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { label: 'Brand',          value: 'GoHighLevel' },
              { label: 'Top engine',     value: 'Perplexity'    },
              { label: 'AI responses',   value: '112'           },
              { label: 'Prompt sources', value: '2'             },
            ].map(item => (
              <div key={item.label} className="border border-gray-200 rounded-lg bg-gray-50 px-3 py-2.5">
                <p className="text-[12px] text-gray-400 font-medium mb-1 normal-case">{item.label}</p>
                <p className="text-[13px] font-semibold text-gray-900 m-0">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-gray-400 mt-2.5 m-0">Topic: AI Visibility · 2 source domains · US</p>
        </div>
      </div>

      {/* 4 KPI mini-cards */}
      <div className="grid grid-cols-4 gap-3">
        {DETAIL_KPI.map(kpi => (
          <CountCard key={kpi.label} label={kpi.label} value={kpi.value} description={kpi.desc} Icon={kpi.Icon} iconColor={kpi.color} />
        ))}
      </div>

      {/* Prompt Visibility Trend + Engine performance */}
      <div className="grid gap-4 items-stretch" style={{ gridTemplateColumns: 'minmax(0, 63fr) minmax(0, 37fr)' }}>
        <div className="border border-gray-200 rounded-lg bg-white p-5 min-w-0 overflow-hidden flex flex-col">
          <div className="flex items-start justify-between mb-4 gap-3">
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-gray-900">Prompt Visibility Trend</h3>
              <p className="text-[13px] text-gray-500 mt-0.5">Prompt-level visibility by AI engine across the selected window</p>
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
          <div className="flex items-center gap-4 mb-3 flex-wrap">
            {DETAIL_TREND_LINES.map(line => (
              <div key={line.label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ background: line.color }} />
                <span className="text-[12px] text-gray-500">{line.label}</span>
              </div>
            ))}
          </div>
          <MultiLineChart lines={DETAIL_TREND_LINES} xLabels={DETAIL_X_LABELS} height={200} metricLabel={trendMetric} fill />
        </div>

        <div className="border border-gray-200 rounded-lg bg-white p-4 min-w-0">
          <div className="flex items-start gap-1.5 mb-0.5">
            <h3 className="text-[15px] font-semibold text-gray-900 m-0">Engine performance</h3>
            <HelpCircle size={14} className="text-gray-300 mt-0.5" />
          </div>
          <p className="text-[12px] font-normal text-gray-500 m-0 mb-3">Prompt metrics by engine</p>
          <div className="grid text-[12px] font-medium text-gray-500 normal-case bg-gray-50 border border-gray-200 rounded-t-lg px-2.5 py-2" style={{ gridTemplateColumns: '1fr 52px 48px 40px' }}>
            <span>Engine</span>
            <span className="text-right">Mention</span>
            <span className="text-right">Cit.</span>
            <span className="text-right">Trend</span>
          </div>
          <div className="flex flex-col border-x border-b border-gray-200 rounded-b-lg overflow-hidden">
            {ENGINE_PERF_DATA.map((eng, i) => (
              <div
                key={i}
                className="grid items-center py-2.5 px-2.5 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                style={{ gridTemplateColumns: '1fr 52px 48px 40px' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <EngineLogo name={eng.engine} size={14} className="w-6 h-6" />
                  <p className="text-[12px] font-medium text-gray-900 truncate m-0">{eng.engine}</p>
                </div>
                <span className="text-[12px] font-medium text-gray-700 text-right tabular-nums">{eng.mentionPct}</span>
                <span className="text-[12px] font-medium text-gray-700 text-right tabular-nums">{eng.citRate}</span>
                <span className={`text-[12px] font-semibold text-right tabular-nums ${eng.trendUp ? 'text-success-600' : 'text-error-600'}`}>{eng.trend}</span>
              </div>
            ))}
          </div>
        </div>
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
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200 w-[130px]">AI</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200">Chat</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200 w-[180px]">Brands</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200 w-[72px]">Sources</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 w-[110px]">Created</th>
                </tr>
              </thead>
              <tbody>
                {DETAIL_AI_RESPONSES.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 border-r border-gray-100 align-top">
                      <div className="flex items-center gap-2">
                        <EngineLogo name={row.engine} size={16} className="w-7 h-7" />
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900">{row.engine}</p>
                          <p className="text-[12px] text-success-600 font-medium">{row.status}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-r border-gray-100 align-top">
                      <p className="text-[13px] text-gray-700 leading-relaxed mb-1">{row.text}</p>
                      <button
                        onClick={() => setFullResponse(row)}
                        className="text-[12px] text-primary-600 hover:underline flex items-center gap-1"
                      >
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
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200 min-w-[200px]">{sourcesView === 'URL' ? 'URL' : 'Domain'}</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200 w-[100px]">Avg position</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200 w-[88px]">Coverage</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200 w-[100px]">Seen in chats</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200 w-[120px]">Brand mentioned</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200 w-[160px]">Other brands mentioned</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 w-[110px]">Last seen</th>
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
                      {row.brandMentioned ? (
                        <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-success-600">
                          <Check size={12} strokeWidth={2.5} />Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[13px] font-medium text-gray-400">
                          <X size={12} strokeWidth={2.5} />No
                        </span>
                      )}
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

      {fullResponse && (
        <FullResponseModal
          response={fullResponse}
          promptText={prompt.prompt}
          onClose={() => setFullResponse(null)}
        />
      )}
    </div>
  )
}

// ── Overview tab content ───────────────────────────────────────────────────

function OverviewContent({ onOpenInPromptsTab }) {
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
          <CountCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            changeText={kpi.change}
            changeUp={kpi.up}
            description={kpi.sub}
            Icon={kpi.Icon}
            iconColor={kpi.color}
          />
        ))}
      </div>

      {/* Row 2: 6-metric combined card — sentence-case labels, ≤20px insights */}
      <div className="border border-gray-200 rounded-lg bg-white">
        <div className="grid grid-cols-3">
          {OVERVIEW_METRICS.map((m, i) => (
            <div key={m.label} className={`px-4 py-3 ${i < 3 ? 'border-b border-gray-100' : ''} ${i % 3 !== 2 ? 'border-r border-gray-100' : ''}`}>
              <p className="text-[12px] font-medium text-gray-500 mb-1.5 m-0 normal-case">{m.label}</p>
              <p className="text-[20px] font-semibold text-gray-900 leading-none mb-1.5 m-0">{m.value}</p>
              <p className="text-[12px] font-normal text-gray-500 leading-snug m-0">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Visibility trend + Competitor ranking */}
      <div className="grid gap-4 items-stretch" style={{ gridTemplateColumns: 'minmax(0, 63fr) minmax(0, 37fr)' }}>
        {/* Visibility trend */}
        <div className="border border-gray-200 rounded-lg bg-white p-4 min-w-0 overflow-hidden flex flex-col">
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
          <MultiLineChart lines={trendLines} xLabels={TREND_X_LABELS} height={200} metricLabel={trendMetric} fill />
        </div>

        {/* Competitor ranking */}
        <div className="border border-gray-200 rounded-lg bg-white p-4 min-w-0">
          <div className="flex items-start gap-1.5 mb-1">
            <h3 className="text-[15px] font-semibold text-gray-900 m-0">Competitor ranking</h3>
            <HelpCircle size={14} className="text-gray-300 mt-0.5" />
          </div>
          <p className="text-[12px] font-normal text-gray-500 m-0 mb-3">Visibility score analysis across your tracked brands</p>
          <div className="grid text-[12px] font-medium text-gray-500 normal-case bg-gray-50 border border-gray-200 rounded-t-lg px-2 py-2" style={{ gridTemplateColumns: '24px 1fr 36px 52px 40px 36px' }}>
            <span>Rank</span>
            <span className="pl-8">Brand</span>
            <span className="text-right">Pos.</span>
            <span className="text-right">Visibility</span>
            <span className="text-right">Sent.</span>
            <span className="text-right">SoV</span>
          </div>
          <div className="flex flex-col border-x border-b border-gray-200 rounded-b-lg overflow-hidden">
            {COMPETITOR_RANKING_DATA.map(c => (
              <div key={c.rank}
                className={`grid items-center py-2 px-2 ${c.isMe ? 'bg-purple-50' : 'bg-white hover:bg-gray-50'} transition-colors`}
                style={{ gridTemplateColumns: '24px 1fr 36px 52px 40px 36px' }}
              >
                <span className="text-[12px] font-medium text-gray-500">#{c.rank}</span>
                <div className="flex items-center gap-2 min-w-0">
                  <CompetitorAvatar c={c} size={24} />
                  <div className="min-w-0">
                    <p className={`text-[12px] font-medium truncate m-0 ${c.isMe ? 'text-purple-700' : 'text-gray-900'}`}>{c.name}</p>
                    <p className="text-[11px] text-gray-400 truncate m-0">{c.domain}</p>
                  </div>
                </div>
                <span className="text-[12px] font-medium text-gray-600 text-right">{c.pos}</span>
                <span className="text-[12px] font-medium text-gray-900 text-right">{c.visibility}</span>
                <span className={`text-[12px] font-medium text-right ${c.sentUp ? 'text-success-600' : 'text-error-600'}`}>{c.sent}</span>
                <span className="text-[12px] font-medium text-gray-600 text-right">{c.sov}</span>
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
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200 w-[180px] normal-case">Engine</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200 w-[160px] normal-case">Visibility</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200 w-[88px] normal-case">Presence</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200 w-[140px] normal-case">Avg position</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-r border-gray-200 w-[100px] normal-case">Citation rate</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 normal-case">Insight</th>
                </tr>
              </thead>
              <tbody>
                {ENGINE_COVERAGE_DATA.map(eng => (
                  <tr key={eng.name} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 border-r border-gray-100">
                      <div className="flex items-center gap-2">
                        <EngineLogo name={eng.name} size={16} className="w-8 h-8" />
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900">{eng.name}</p>
                          <p className="text-[12px] text-gray-400">{eng.sub}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-r border-gray-100">
                      <VisibilityMeter value={eng.vis} barWidth="120px" />
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

      {/* Row 5: How AI is describing GoHighLevel */}
      <div className="border border-gray-200 rounded-lg bg-white p-4">
        <div className="flex items-start gap-1.5 mb-1">
          <h3 className="text-[15px] font-semibold text-gray-900 m-0">How AI is describing GoHighLevel</h3>
          <HelpCircle size={14} className="text-gray-300 mt-0.5 shrink-0" />
        </div>
        <p className="text-[13px] font-normal text-gray-500 m-0 mb-3">Recommendation strength, neutral framing, and negative dismissal across detected mentions</p>
        <div className="flex rounded-full overflow-hidden h-3 mb-3">
          {SENTIMENT_DATA.map(s => (
            <div key={s.label} title={s.label} style={{ width: `${s.value}%`, background: s.color }} />
          ))}
        </div>
        <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
          {SENTIMENT_DATA.map(s => (
            <div
              key={s.label}
              className="border border-gray-200 rounded-lg px-3.5 py-3 bg-white"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} aria-hidden="true" />
                <p className="text-[12px] font-medium text-gray-500 m-0 normal-case">{s.label}</p>
              </div>
              <p className="text-[22px] font-semibold text-gray-900 leading-none m-0">{s.value}%</p>
            </div>
          ))}
        </div>
        <p className="text-[13px] font-normal text-gray-500 m-0">AI answers show mixed momentum. Stronger source coverage and clearer category proof can improve how GoHighLevel is framed.</p>
      </div>

      {/* Row 6: Organic-AI overlap */}
      <div className="border border-gray-200 rounded-lg bg-white p-5">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-start gap-1.5">
            <h3 className="text-[15px] font-semibold text-gray-900 m-0">Organic-AI overlap</h3>
            <HelpCircle size={14} className="text-gray-300 mt-0.5 shrink-0" />
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 text-[12px] font-medium border border-primary-200 whitespace-nowrap">
            5 shared URLs
          </span>
        </div>
        <p className="text-[13px] font-normal text-gray-500 m-0 mb-4">Where Google AI Overview is borrowing from your organic footprint</p>

        {/* Summary strip — overlap % + drift watch side by side on one line */}
        <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          <div className="flex items-start gap-3 border border-gray-200 rounded-xl px-4 py-3.5 bg-gray-50">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-gray-200 shrink-0">
              <Link2 size={16} className="text-primary-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[24px] font-semibold text-gray-900 leading-none">34%</span>
                <span className="text-[12px] font-medium text-gray-500">Overlap</span>
              </div>
              <p className="text-[12px] font-normal text-gray-500 leading-snug m-0 mt-1.5">High overlap means traditional SEO is feeding your AIO visibility.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 border border-gray-200 rounded-xl px-4 py-3.5 bg-gray-50">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-gray-200 shrink-0">
              <AlertTriangle size={16} className="text-warning-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-[24px] font-semibold text-gray-900 leading-none">2</span>
                <span className="text-[12px] font-medium text-gray-500">Prompts flagged · drift watch</span>
              </div>
              <p className="text-[12px] font-normal text-gray-500 leading-snug m-0 mt-1.5">Watch prompts where overlap is slipping while AIO position is weakening.</p>
            </div>
          </div>
        </div>

        {/* Prompt list — each prompt on its own full-width row */}
        <div className="flex flex-col gap-2">
          {ORGANIC_OVERLAP_PROMPTS.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onOpenInPromptsTab(item)}
              className="group w-full flex items-center justify-between gap-4 text-left border border-gray-200 rounded-xl px-4 py-3 hover:border-primary-300 hover:bg-primary-50/40 transition-all"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-gray-900 leading-snug m-0">{item.prompt}</p>
                <p className="text-[12px] font-normal text-gray-400 m-0 mt-1">AIO position {item.aioPos}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium whitespace-nowrap ${item.status === 'Watch drift' ? 'bg-warning-100 text-warning-600' : 'bg-success-50 text-success-600'}`}>
                  {item.status}
                </span>
                <span className="text-[18px] font-semibold text-gray-900 leading-none w-[46px] text-right tabular-nums">{item.overlap}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Row 7: Top performing prompts — HighRise-style data table */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900 m-0">Top performing prompts</h3>
            <p className="text-[13px] font-normal text-gray-500 m-0 mt-0.5">Highest-visibility prompts in the current date range</p>
          </div>
          <span className="text-[13px] font-medium text-success-600 shrink-0">Top 5</span>
        </div>
        <div className="px-4 pb-4 flex flex-col gap-2">
          {TOP_PROMPTS_DATA.map(item => (
            <button
              key={item.rank}
              type="button"
              onClick={() => setSelectedPrompt(item)}
              className="group w-full flex items-center gap-4 text-left border border-gray-200 rounded-xl px-4 py-3 hover:border-primary-300 hover:bg-primary-50/40 transition-all"
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-[13px] font-semibold text-gray-600 shrink-0">
                {item.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-gray-900 leading-snug m-0 mb-1">{item.prompt}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[12px] font-medium border border-purple-200">
                    {item.tag}
                  </span>
                  <span className="text-[12px] text-gray-400">{item.volume}</span>
                  <span className="text-[12px] text-gray-400">{item.engines}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-[16px] font-semibold text-gray-900 tabular-nums m-0 leading-none">{item.visibility}</p>
                  <p className="text-[12px] text-gray-400 m-0 mt-1">Visibility</p>
                </div>
                <span className={`text-[14px] font-medium tabular-nums w-[42px] text-right ${item.up ? 'text-success-600' : 'text-error-600'}`}>
                  {item.trendScore}
                </span>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Add prompt modal ───────────────────────────────────────────────────────

function InfoTip({ text }) {
  return (
    <span className="relative group/tip inline-flex items-center">
      <HelpCircle size={12} className="text-gray-400 cursor-help" />
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 z-50 hidden group-hover/tip:block pointer-events-none w-56">
        <span className="block bg-gray-900 text-white text-[12px] font-normal rounded-lg px-2.5 py-1.5 shadow-md leading-snug">
          {text}
        </span>
      </span>
    </span>
  )
}

// Lightweight brand marks for the Add prompt engine picker. Approximated in
// brand colours; swap for official asset SVGs when wiring live data.

function ChatGptLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#10A37F"
        d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7476-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
      />
    </svg>
  )
}

function PerplexityLogo({ size = 18 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="#20808D" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4v16" />
      <path d="M12 8.2C10.3 5.9 7.9 5 6 5.8 4 6.6 3.1 8.9 3.8 11.1c.5 1.9 2.3 3.1 4.3 3.1H12" />
      <path d="M12 8.2C13.7 5.9 16.1 5 18 5.8c2 .8 2.9 3.1 2.2 5.3-.5 1.9-2.3 3.1-4.3 3.1H12" />
      <path d="M7 14.2V18l5-3M17 14.2V18l-5-3" />
    </svg>
  )
}

function ClaudeLogo({ size = 18 }) {
  const rays = Array.from({ length: 12 }, (_, i) => (i * 360) / 12)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <g transform="translate(12 12)">
        {rays.map(a => (
          <rect key={a} x="-0.85" y="-10.5" width="1.7" height="7.2" rx="0.85" fill="#D97706" transform={`rotate(${a})`} />
        ))}
      </g>
    </svg>
  )
}

function GeminiLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="gemini-grad" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4285F4" />
          <stop offset="0.5" stopColor="#9B72CB" />
          <stop offset="1" stopColor="#D96570" />
        </linearGradient>
      </defs>
      <path fill="url(#gemini-grad)" d="M12 2c.4 5-2.9 8.9-10 10 7.1 1.1 10.4 5 10 10 .4-5 2.9-8.9 10-10-7.1-1.1-10.4-5-10-10Z" />
    </svg>
  )
}

function AiModeLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="aimode-grad" x1="2" y1="4" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4285F4" />
          <stop offset="0.55" stopColor="#9B72CB" />
          <stop offset="1" stopColor="#D96570" />
        </linearGradient>
      </defs>
      <path fill="url(#aimode-grad)" d="M9.6 3c.3 3.9 2.4 6.7 6.4 8-4 1.3-6.1 4.1-6.4 8-.3-3.9-2.4-6.7-6.4-8 4-1.3 6.1-4.1 6.4-8Z" />
      <path fill="url(#aimode-grad)" d="M18 3.4c.13 1.5 1 2.6 2.6 3.1-1.6.5-2.47 1.6-2.6 3.1-.13-1.5-1-2.6-2.6-3.1 1.6-.5 2.47-1.6 2.6-3.1Z" />
    </svg>
  )
}

function AiOverviewLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.04 12.26c0-.82-.07-1.6-.21-2.36H12v4.46h6.19c-.27 1.44-1.08 2.66-2.3 3.48v2.89h3.72c2.18-2.01 3.43-4.97 3.43-8.47Z" />
      <path fill="#34A853" d="M12 24c3.11 0 5.72-1.03 7.62-2.79l-3.72-2.89c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.54-2.03-6.45-4.75H1.71v2.98C3.6 21.42 7.51 24 12 24Z" />
      <path fill="#FBBC05" d="M5.55 14.67c-.23-.69-.36-1.42-.36-2.17s.13-1.48.36-2.17V7.35H1.71C.62 9.5.16 11.18.16 12.5s.46 3 1.55 5.15l3.84-2.98Z" />
      <path fill="#EA4335" d="M12 4.78c1.69 0 3.21.58 4.4 1.72l3.3-3.3C17.72 1.19 15.11 0 12 0 7.51 0 3.6 2.58 1.71 6.35l3.84 2.98C6.46 6.81 9 4.78 12 4.78Z" />
    </svg>
  )
}

// Single source of truth mapping an engine name to its real brand logo, so tables,
// checkboxes and the response viewer never fall back to letter-monogram placeholders.
const ENGINE_LOGO_MAP = {
  'ChatGPT':     ChatGptLogo,
  'Perplexity':  PerplexityLogo,
  'Claude':      ClaudeLogo,
  'Gemini':      GeminiLogo,
  'AI Mode':     AiModeLogo,
  'AI Overview': AiOverviewLogo,
}

// Renders the real engine logo inside a consistent white chip. Falls back to a
// neutral bot glyph if an unknown engine name is passed.
function EngineLogo({ name, size = 18, chip = true, className = '' }) {
  const Logo = ENGINE_LOGO_MAP[name]
  const glyph = Logo ? <Logo size={size} /> : <Bot size={size} className="text-gray-400" />
  if (!chip) return glyph
  return (
    <span className={`inline-flex items-center justify-center rounded-lg bg-white border border-gray-200 shrink-0 ${className}`}>
      {glyph}
    </span>
  )
}

// HARDCODED: AI engine options for the Add prompt multi-select (prototyping)
const ADD_PROMPT_ENGINES = [
  { id: 'chatgpt',     name: 'ChatGPT',     desc: 'OpenAI',        Logo: ChatGptLogo    },
  { id: 'perplexity',  name: 'Perplexity',  desc: 'Answer engine', Logo: PerplexityLogo },
  { id: 'claude',      name: 'Claude',      desc: 'Anthropic',     Logo: ClaudeLogo     },
  { id: 'gemini',      name: 'Gemini',      desc: 'Google',        Logo: GeminiLogo     },
  { id: 'ai-mode',     name: 'AI Mode',     desc: 'Google Search', Logo: AiModeLogo     },
  { id: 'ai-overview', name: 'AI Overview', desc: 'Google Search', Logo: AiOverviewLogo },
]

// HARDCODED: region options for the Add prompt modal (prototyping)
const ADD_PROMPT_REGIONS = ['United States', 'United Kingdom', 'Canada', 'Australia', 'India', 'Germany']

// Compact HighRise-style checkbox card — logo + label + selectable state.
function EngineCheckboxCard({ engine, checked, onToggle }) {
  const { name, desc, Logo } = engine
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={`relative flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-all ${
        checked
          ? 'border-primary-600 bg-primary-50/60 ring-1 ring-primary-600'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <span className="w-8 h-8 rounded-md bg-white border border-gray-200 flex items-center justify-center shrink-0">
        <Logo size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-gray-900 truncate">{name}</span>
        <span className="block text-[11px] text-gray-500 truncate">{desc}</span>
      </span>
      <span
        className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center shrink-0 transition-colors ${
          checked ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'
        }`}
      >
        {checked && <Check size={12} className="text-white" strokeWidth={3} />}
      </span>
    </button>
  )
}

// AI-suggested prompts for the Add prompt modal — derived from the prompt dataset.
const ADD_PROMPT_SUGGESTIONS = PROMPTS_DATA.map(p => ({
  prompt: p.prompt,
  topic: p.topic,
  volume: `${p.volume} volume`,
}))

// ── Full response viewer ───────────────────────────────────────────────────
// Engine-themed reading view. Every engine reuses one scannable layout but takes
// on that product's chrome (accent, surface, avatar, wordmark) so the answer
// reads like it came from ChatGPT / Perplexity / Claude / Gemini / AI Mode.

// HARDCODED: per-engine visual theme for the response viewer (prototyping).
const ENGINE_THEME = {
  'ChatGPT':     { accent: '#10A37F', surface: '#FFFFFF', bubble: '#F4F4F5', vendor: 'OpenAI',        wordmark: 'ChatGPT' },
  'Perplexity':  { accent: '#20808D', surface: '#FCFCFB', bubble: '#ECF3F3', vendor: 'Perplexity',    wordmark: 'Perplexity' },
  'Claude':      { accent: '#C96442', surface: '#F6F2EC', bubble: '#EEE6D9', vendor: 'Anthropic',     wordmark: 'Claude' },
  'Gemini':      { accent: '#4285F4', surface: '#FFFFFF', bubble: '#E8F0FE', vendor: 'Google',        wordmark: 'Gemini' },
  'AI Mode':     { accent: '#9168C0', surface: '#FFFFFF', bubble: '#F1E9F9', vendor: 'Google Search', wordmark: 'AI Mode' },
  'AI Overview': { accent: '#4285F4', surface: '#FFFFFF', bubble: '#E8F0FE', vendor: 'Google Search', wordmark: 'AI Overview' },
}

// Builds a structured, scannable answer from the response's detected brands so
// the viewer reads like a real drill-down rather than a single blob of text.
function buildAnswerSections(response) {
  const [primary = 'GoHighLevel', second = 'HubSpot', third = 'Calendly'] = response.brands
  return [
    { h: 'Direct answer', body: `${primary} is competitive for this prompt, but the answer frames the category through comparison rather than naming a single winner.` },
    { h: 'What stands out', bullets: [
      `${primary} is described with stronger workflow depth and broader execution coverage.`,
      `${second} is positioned as the option that is easier to adopt quickly.`,
      `${third} appears when the answer emphasises price or simplicity.`,
    ] },
    { h: 'How to improve this prompt', bullets: [
      'Strengthen proof pages that compare implementation depth, AI visibility reporting, and citation quality.',
      'Publish clearer comparison content so answer engines cite owned pages instead of third-party summaries.',
    ] },
  ]
}

// HARDCODED: brand sentiment cadence for the viewer's Brands panel (prototyping).
const BRAND_SENTIMENT = ['Positive', 'Neutral', 'Positive', 'Neutral']

// Explicit brand→domain overrides; anything else falls back to the compacted
// name (e.g. "GoHighLevel" → gohighlevel.com) so CompanyLogo can fetch a favicon.
const BRAND_DOMAIN_MAP = {
  'GoHighLevel':   'gohighlevel.com',
  'HubSpot':       'hubspot.com',
  'Calendly':      'calendly.com',
  'Pipedrive':     'pipedrive.com',
  'Salesforce':    'salesforce.com',
  'ActiveCampaign': 'activecampaign.com',
  'ClickFunnels':  'clickfunnels.com',
  'Klaviyo':       'klaviyo.com',
  'Keap':          'keap.com',
}
function brandDomain(name) {
  return BRAND_DOMAIN_MAP[name] || `${name.replace(/[\s.]+/g, '').toLowerCase()}.com`
}

function FullResponseModal({ response, promptText, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const theme = ENGINE_THEME[response.engine] || ENGINE_THEME['ChatGPT']
  const sections = buildAnswerSections(response)
  const sources = DETAIL_SOURCES.slice(0, Math.max(1, response.sources))
  const isPerplexity = response.engine === 'Perplexity'
  const isClaude = response.engine === 'Claude'
  const isGoogle = ['Gemini', 'AI Mode', 'AI Overview'].includes(response.engine)
  // Gemini renders its answer on its signature dark canvas.
  const dark = response.engine === 'Gemini'
  const headingCls = dark ? 'text-[#E8EAED]' : 'text-gray-900'
  const bodyCls    = dark ? 'text-[#C4C7C5]' : 'text-gray-700'
  const mutedCls   = dark ? 'text-[#9AA0A6]' : 'text-gray-400'

  const kpis = [
    { label: 'Avg position',   value: '#4.2',           desc: 'Brand URL position in the answer.' },
    { label: 'URLs in answer', value: String(sources.length + 3), desc: 'Total cited source URLs in this response.' },
    { label: 'Brand mentions', value: String(response.brands.length), desc: 'Detected brands in this response.' },
    { label: 'Answer length',  value: '696 chars',      desc: 'Character count from the answer text.' },
  ]

  // Shared assistant answer body — sections render identically across engines,
  // only the text palette flips for Gemini's dark canvas.
  const AnswerBody = (
    <div className="flex flex-col gap-4">
      {sections.map(sec => (
        <div key={sec.h}>
          <p className={`text-[13px] font-semibold m-0 mb-1.5 ${headingCls}`}>{sec.h}</p>
          {sec.body && <p className={`text-[14px] leading-relaxed m-0 ${bodyCls}`}>{sec.body}</p>}
          {sec.bullets && (
            <ul className="m-0 mt-0.5 pl-0 flex flex-col gap-1.5 list-none">
              {sec.bullets.map((b, i) => (
                <li key={i} className={`flex items-start gap-2 text-[14px] leading-relaxed ${bodyCls}`}>
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: theme.accent }} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-[95vw] max-w-[1040px] max-h-[92vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ background: theme.surface }}
        onClick={e => e.stopPropagation()}
      >
        {/* Engine chrome bar */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3 bg-white/70 backdrop-blur border-b" style={{ borderColor: `color-mix(in srgb, ${theme.accent} 18%, #EAECF0)` }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <EngineLogo name={response.engine} size={18} className="w-8 h-8" />
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-gray-900 m-0 leading-tight">{theme.wordmark}</p>
              <p className="text-[12px] text-gray-400 m-0 leading-tight">{theme.vendor}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Prompt heading + badges */}
        <div className="shrink-0 px-6 pt-4 pb-3 bg-white/40 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-medium" style={{ color: theme.accent, background: `color-mix(in srgb, ${theme.accent} 12%, transparent)` }}>
              <EngineLogo name={response.engine} size={11} chip={false} />
              {response.engine}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-medium bg-success-50 text-success-600">
              <CircleCheck size={11} /> {response.status}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium bg-gray-100 text-gray-600">Positive sentiment · 73%</span>
            <span className="text-[12px] text-gray-400">{response.created}</span>
          </div>
          <h2 className="text-[18px] font-semibold text-gray-900 leading-snug m-0">{promptText}</h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid gap-5 p-6" style={{ gridTemplateColumns: 'minmax(0, 1fr) 300px' }}>

            {/* Chat column — wrapped in a bordered container (dark canvas for Gemini) */}
            <div
              className="min-w-0 flex flex-col gap-4 rounded-2xl border p-5"
              style={{ background: dark ? '#1E1F20' : '#FFFFFF', borderColor: '#E5E7EB' }}
            >
              {/* User message — right aligned like a real chat */}
              <div className="flex justify-end">
                <div
                  className={`max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-[14px] leading-relaxed ${dark ? 'text-[#E3E3E3]' : 'text-gray-800'}`}
                  style={{ background: dark ? '#333537' : theme.bubble }}
                >
                  {promptText}
                </div>
              </div>

              {/* Assistant message */}
              <div className="flex gap-3">
                <EngineLogo name={response.engine} size={16} className="w-8 h-8 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className={`text-[13px] font-semibold m-0 mb-2 ${headingCls}`}>{theme.wordmark}</p>

                  {/* Perplexity leads with cited source cards */}
                  {isPerplexity && (
                    <div className="mb-3">
                      <p className="text-[12px] font-medium text-gray-500 m-0 mb-1.5 flex items-center gap-1.5">
                        <Link2 size={12} /> Sources
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {sources.map((s, i) => (
                          <a key={i} href={s.url} onClick={e => e.preventDefault()} className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 hover:border-gray-300 transition-colors">
                            <p className="text-[12px] font-medium text-gray-900 truncate m-0">{s.domain}</p>
                            <p className="text-[11px] text-gray-400 truncate m-0 mt-0.5">{i + 1} · {s.coverage} coverage</p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Google engines show the product label chip above the answer */}
                  {isGoogle && (
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2.5"
                      style={{ background: dark ? 'color-mix(in srgb, #8AB4F8 20%, #1E1F20)' : `color-mix(in srgb, ${theme.accent} 10%, transparent)` }}
                    >
                      <EngineLogo name={response.engine} size={12} chip={false} />
                      <span className="text-[12px] font-medium" style={{ color: dark ? '#8AB4F8' : theme.accent }}>{response.engine} response</span>
                    </div>
                  )}

                  {/* Claude renders the answer inside a warm reading card */}
                  {isClaude ? (
                    <div className="rounded-xl border p-4" style={{ background: '#FBF9F4', borderColor: '#E7DECF' }}>
                      {AnswerBody}
                    </div>
                  ) : AnswerBody}

                  <p className={`text-[12px] mt-3 m-0 ${mutedCls}`}>Signals in this response lean on {sources[0]?.domain || 'cited sources'}.</p>
                </div>
              </div>
            </div>

            {/* Side panel — brands + sources */}
            <div className="flex flex-col gap-4 min-w-0">
              <div className="rounded-xl border border-gray-200 bg-white p-3.5">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[13px] font-semibold text-gray-900 m-0">Brands</p>
                  <span className="text-[12px] font-medium text-primary-600">{response.brands.length}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {response.brands.map((b, i) => {
                    const you = b === 'GoHighLevel'
                    const sentiment = BRAND_SENTIMENT[i % BRAND_SENTIMENT.length]
                    return (
                      <div key={b} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors">
                        <CompanyLogo
                          domain={brandDomain(b)}
                          size={28}
                          rounded="rounded-full"
                          fallback={
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600 shrink-0">
                              {b.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-gray-900 truncate m-0">{b}</p>
                          <p className="text-[12px] text-gray-400 m-0">#{i + 1}.0 · {sentiment}</p>
                        </div>
                        {you && <span className="text-[11px] font-medium text-primary-600 bg-primary-50 rounded-full px-2 py-0.5 shrink-0">You</span>}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-3.5">
                <p className="text-[13px] font-semibold text-gray-900 m-0 mb-0.5">Sources</p>
                <p className="text-[12px] text-gray-400 m-0 mb-2.5">Prompt-scoped cited URLs from this answer.</p>
                <div className="flex flex-col gap-2">
                  {sources.map((s, i) => (
                    <div key={i} className="rounded-lg border border-gray-200 p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] font-medium text-gray-900 leading-snug m-0">{s.domain}</p>
                        <span className="text-[12px] font-medium text-primary-600 shrink-0">#{i + 1}</span>
                      </div>
                      <p className="text-[12px] text-gray-400 truncate m-0 mt-0.5">{s.url.replace(/^https?:\/\//, '')}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className={`text-[11px] font-medium rounded-full px-2 py-0.5 ${s.brandMentioned ? 'bg-success-50 text-success-600' : 'bg-gray-100 text-gray-500'}`}>
                          {s.brandMentioned ? 'Brand mentioned' : 'Brand not mentioned'}
                        </span>
                        {s.otherBrands && <span className="text-[11px] font-medium rounded-full px-2 py-0.5 bg-warning-100 text-warning-600">Competitor present</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Answer diagnostics */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {kpis.map(k => (
                <div key={k.label} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5">
                  <p className="text-[12px] font-medium text-gray-500 m-0">{k.label}</p>
                  <p className="text-[18px] font-bold text-gray-900 m-0 mt-0.5">{k.value}</p>
                  <p className="text-[12px] text-gray-400 m-0 mt-0.5 leading-snug">{k.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function AddPromptModal({ onClose, onSave }) {
  const [promptText, setPromptText] = useState('')
  const [selectedEngines, setSelectedEngines] = useState(
    () => new Set(['chatgpt', 'perplexity', 'claude', 'gemini']),
  )
  const [region, setRegion] = useState('United States')
  const [activeSuggestion, setActiveSuggestion] = useState(null)

  const canSave = promptText.trim().length > 0 && selectedEngines.size > 0

  function toggleEngine(id) {
    setSelectedEngines(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectSuggestion(item) {
    setActiveSuggestion(item.prompt)
    setPromptText(item.prompt)
  }

  function handleSave() {
    if (!canSave) return
    const match = ADD_PROMPT_SUGGESTIONS.find(s => s.prompt === promptText.trim())
    onSave({
      prompt: promptText.trim(),
      topic: match ? match.topic : 'Custom tracking',
      engines: ADD_PROMPT_ENGINES.filter(e => selectedEngines.has(e.id)).map(e => e.name),
      region,
    })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-gray-900/40" aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[940px] max-h-[calc(100vh-48px)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-semibold text-gray-900 m-0">Add prompt</h2>
                <InfoTip text="Track a customer-style question across AI answer engines and group it under a topic." />
              </div>
              <p className="text-[14px] font-normal text-gray-500 m-0 mt-1">
                Use your own prompt or start from an AI-suggested prompt grouped by topic.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: compose */}
            <div className="flex flex-col gap-5 min-w-0">
              <div>
                <p className="text-[12px] font-medium text-gray-500 m-0 mb-2">Prompt</p>
                <textarea
                  autoFocus
                  value={promptText}
                  onChange={e => setPromptText(e.target.value)}
                  placeholder="Ask a question you want AI engines to answer about your brand, category, or comparison set."
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary-600 resize-y min-h-[110px]"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <p className="text-[12px] font-medium text-gray-500 m-0">Select AI engines</p>
                  <InfoTip text="Choose which engines should start tracking this prompt first. Dummy options are interactive until live create/save is wired." />
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {ADD_PROMPT_ENGINES.map(engine => (
                    <EngineCheckboxCard
                      key={engine.id}
                      engine={engine}
                      checked={selectedEngines.has(engine.id)}
                      onToggle={() => toggleEngine(engine.id)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[12px] font-medium text-gray-500 m-0 mb-2">Region</p>
                <div className="relative">
                  <select
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                    className="w-full appearance-none border border-gray-200 rounded-lg pl-3.5 pr-10 py-2.5 text-[14px] text-gray-900 bg-white outline-none focus:border-primary-600 cursor-pointer"
                  >
                    {ADD_PROMPT_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <ChevronDown size={16} className="text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Right: suggestions */}
            <div className="min-w-0 flex flex-col">
              <div className="flex items-center gap-1.5 mb-2">
                <p className="text-[12px] font-medium text-gray-500 m-0">AI-suggested prompts</p>
                <InfoTip text="Suggested prompts are grouped to a topic immediately so categorization starts at prompt creation time." />
              </div>
              <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[420px] pr-0.5">
                {ADD_PROMPT_SUGGESTIONS.map(item => {
                  const active = activeSuggestion === item.prompt
                  return (
                    <button
                      key={item.prompt}
                      type="button"
                      onClick={() => selectSuggestion(item)}
                      className={`w-full text-left rounded-lg border bg-white px-3.5 py-3 transition-colors ${
                        active ? 'border-primary-600' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[11px] font-medium border border-primary-200">
                          {item.topic}
                        </span>
                        <span className="text-[12px] font-normal text-gray-400">{item.volume}</span>
                      </div>
                      <p className="text-[14px] font-medium text-gray-900 m-0 leading-snug">{item.prompt}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <p className="text-[13px] text-gray-400 m-0">Saving will queue this prompt for the next sync cycle.</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg border border-gray-300 bg-white text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSave}
              onClick={handleSave}
              className={`h-9 px-4 rounded-lg text-[13px] font-semibold transition-colors ${
                canSave
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Save prompt
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ── Competitors tab ─────────────────────────────────────────────────────────

function CompetitorsTabContent() {
  const [view, setView] = useState('Leaderboard')

  const me = COMPETITOR_LEADERBOARD.find(c => c.isMe)
  const leader = COMPETITOR_LEADERBOARD[0]

  const KPIS = [
    { label: 'Tracked brands',    value: String(COMPETITOR_LEADERBOARD.length), Icon: Users,      color: 'var(--primary-600)' },
    { label: 'Your rank',         value: `#${me.rank}`,                          Icon: Award,      color: '#6938EF' },
    { label: 'Leader visibility', value: String(leader.visibility),             Icon: TrendingUp, color: '#16A34A' },
    { label: 'SoV gap',           value: `${leader.sov - me.sov} pts`,           Icon: BarChart3,  color: '#D97706' },
  ]

  return (
    <div className="px-5 pt-5 pb-5 flex flex-col gap-4">
      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-3">
        {KPIS.map(kpi => (
          <CountCard key={kpi.label} label={kpi.label} value={kpi.value} Icon={kpi.Icon} iconColor={kpi.color} help />
        ))}
      </div>

      {/* Competitor views */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="p-5 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="text-[15px] font-semibold text-gray-900 m-0">Competitor views</h3>
              <HelpCircle size={14} className="text-gray-300" />
            </div>
            <p className="text-[13px] text-gray-500 m-0">Leaderboard, mentions vs sources, and by-topic heatmap for the same tracked set</p>
          </div>
          <div className="inline-flex items-center gap-1 bg-gray-100 rounded-lg p-1 shrink-0">
            {COMPETITOR_VIEWS.map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                  view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {view === 'Leaderboard' && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-y border-gray-200 bg-gray-50">
                <th className="px-5 py-2.5 text-left text-[12px] font-semibold text-gray-900 w-[70px]">Rank</th>
                <th className="px-5 py-2.5 text-left text-[12px] font-semibold text-gray-900">Brand</th>
                <th className="px-5 py-2.5 text-center text-[12px] font-semibold text-gray-900 w-[180px]">Visibility</th>
                <th className="px-5 py-2.5 text-center text-[12px] font-semibold text-gray-900 w-[130px]">Share of voice</th>
                <th className="px-5 py-2.5 text-center text-[12px] font-semibold text-gray-900 w-[120px]">Avg position</th>
                <th className="px-5 py-2.5 text-center text-[12px] font-semibold text-gray-900 w-[120px]">Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {COMPETITOR_LEADERBOARD.map(c => {
                const tone = competitorSentimentTone(c.sentiment)
                return (
                  <tr key={c.rank} className={`border-b border-gray-100 last:border-b-0 transition-colors ${c.isMe ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-5 py-3.5 text-[13px] font-medium text-gray-500">#{c.rank}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <CompetitorAvatar c={c} size={32} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-[13px] font-semibold truncate m-0 ${c.isMe ? 'text-primary-700' : 'text-gray-900'}`}>{c.name}</p>
                            {c.isMe && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-700 text-[11px] font-medium shrink-0">You</span>}
                          </div>
                          <p className="text-[12px] text-gray-400 truncate m-0">{c.domain}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <VisibilityMeter value={c.visibility} barWidth="110px" />
                    </td>
                    <td className="px-5 py-3.5 text-center text-[13px] text-gray-700 tabular-nums">{c.sov}%</td>
                    <td className="px-5 py-3.5 text-center text-[13px] text-gray-700 tabular-nums">{c.avgPos}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[12px] font-medium ${tone.bg} ${tone.text}`}>
                        +{c.sentiment}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {view === 'Mentions vs sources' && (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-y border-gray-200 bg-gray-50">
                <th className="px-5 py-2.5 text-left text-[12px] font-semibold text-gray-900">Brand</th>
                <th className="px-5 py-2.5 text-right text-[12px] font-semibold text-gray-900 w-[160px]">AI mentions</th>
                <th className="px-5 py-2.5 text-right text-[12px] font-semibold text-gray-900 w-[160px]">Source citations</th>
                <th className="px-5 py-2.5 text-center text-[12px] font-semibold text-gray-900 w-[140px]">Citation rate</th>
              </tr>
            </thead>
            <tbody>
              {COMPETITOR_LEADERBOARD.map(c => {
                const rate = Math.round((c.citations / c.mentions) * 100)
                const rateColor = visibilityColor(rate)
                return (
                  <tr key={c.rank} className={`border-b border-gray-100 last:border-b-0 transition-colors ${c.isMe ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <CompetitorAvatar c={c} size={32} />
                        <div className="flex items-center gap-2 min-w-0">
                          <p className={`text-[13px] font-semibold truncate m-0 ${c.isMe ? 'text-primary-700' : 'text-gray-900'}`}>{c.name}</p>
                          {c.isMe && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-700 text-[11px] font-medium shrink-0">You</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right text-[15px] font-semibold text-gray-900 tabular-nums">{c.mentions}</td>
                    <td className="px-5 py-3.5 text-right text-[15px] font-semibold text-gray-900 tabular-nums">{c.citations}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[12px] font-semibold tabular-nums"
                        style={{ color: rateColor, background: `color-mix(in srgb, ${rateColor} 12%, transparent)` }}
                      >
                        {rate}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {view === 'By topic' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-y border-gray-200 bg-gray-50">
                  <th className="px-5 py-2.5 text-left text-[12px] font-semibold text-gray-900 min-w-[200px]">Brand</th>
                  {COMPETITOR_TOPICS.map(t => (
                    <th key={t} className="px-4 py-2.5 text-center text-[12px] font-semibold text-gray-900 min-w-[110px]">{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPETITOR_LEADERBOARD.map(c => (
                  <tr key={c.rank} className={`border-b border-gray-100 last:border-b-0 ${c.isMe ? 'bg-primary-50' : ''}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <CompetitorAvatar c={c} size={28} />
                        <div className="flex items-center gap-2 min-w-0">
                          <p className={`text-[13px] font-semibold truncate m-0 ${c.isMe ? 'text-primary-700' : 'text-gray-900'}`}>{c.name}</p>
                          {c.isMe && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-700 text-[11px] font-medium shrink-0">You</span>}
                        </div>
                      </div>
                    </td>
                    {COMPETITOR_TOPICS.map((t, ti) => {
                      const score = competitorTopicScore(c.visibility, ti)
                      return (
                        <td key={t} className="px-4 py-3 text-center">
                          <span
                            className="inline-flex items-center justify-center w-12 h-8 rounded-md text-[12px] font-semibold tabular-nums"
                            style={{
                              background: `color-mix(in srgb, var(--primary-600) ${Math.round(score * 0.85)}%, transparent)`,
                              color: score >= 55 ? '#fff' : 'var(--gray-700)',
                            }}
                          >
                            {score}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function AddCompetitorModal({ onClose, onSave }) {
  const [company, setCompany] = useState('')
  const [website, setWebsite] = useState('')
  const [address, setAddress] = useState('')
  const [country, setCountry] = useState('United States')

  const canSave = company.trim().length > 0 && website.trim().length > 0

  function handleSave() {
    if (!canSave) return
    onSave({ company: company.trim(), website: website.trim(), address: address.trim(), country })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-gray-900/40" aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[520px] max-h-[calc(100vh-48px)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 shrink-0 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-[16px] font-semibold text-gray-900 m-0">Add competitor</h2>
            <p className="text-[14px] font-normal text-gray-500 m-0 mt-1">Add a brand to track alongside yours across AI answer engines.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          <div>
            <p className="text-[12px] font-medium text-gray-500 m-0 mb-2">Company name</p>
            <HLInput
              autoFocus
              value={company}
              onChange={e => setCompany(e.target.value)}
              placeholder="e.g. HubSpot"
            />
          </div>

          <div>
            <p className="text-[12px] font-medium text-gray-500 m-0 mb-2">Website</p>
            <HLInput
              icon={Globe}
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="e.g. hubspot.com"
            />
          </div>

          <div>
            <p className="text-[12px] font-medium text-gray-500 m-0 mb-2">Address</p>
            <HLInput
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Street, city, state"
            />
          </div>

          <div>
            <p className="text-[12px] font-medium text-gray-500 m-0 mb-2">Country</p>
            <div className="relative">
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                className={`${HL_INPUT_CLASS} appearance-none pr-10 cursor-pointer`}
              >
                {ADD_COMPETITOR_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={16} className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-gray-300 bg-white text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className={`h-9 px-4 rounded-lg text-[13px] font-semibold transition-colors ${
              canSave ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Add competitor
          </button>
        </div>
      </div>
    </div>,
    document.body,
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
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddCompetitor, setShowAddCompetitor] = useState(false)
  const [successToast, setSuccessToast] = useState(null)
  // A prompt opened from the Overview "Organic-AI overlap" cards is shown inside
  // the Prompts tab detail page, but keeps a "Back to overview" affordance.
  const [promptFromOverview, setPromptFromOverview] = useState(null)
  const toastTimer = useRef(null)

  function openPromptInPromptsTab(prompt) {
    setPromptFromOverview(prompt)
    setActiveTab('Prompts')
  }

  function backToOverviewFromPrompt() {
    setPromptFromOverview(null)
    setActiveTab('Overview')
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  function fireToast(message) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setSuccessToast(message)
    toastTimer.current = setTimeout(() => setSuccessToast(null), 5000)
  }

  function handleSavePrompt() {
    // Prototype: newly saved prompts are queued rather than inserted live.
    setShowAddModal(false)
    fireToast('The prompt was successfully saved.')
  }

  function handleSaveCompetitor() {
    // Prototype: newly added competitors are queued rather than inserted live.
    setShowAddCompetitor(false)
    fireToast('The competitor was successfully added.')
  }

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-gray-50">

      {/* Fixed page header — title, brand, tabs and toolbar never scroll */}
      <div className="bg-white border-b border-gray-200 shrink-0">
        {/* Title */}
        <div className="px-6 pt-5 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
              <MessageCircle size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="text-[18px] font-bold text-gray-900">Prompt tracking</p>
              <p className="text-[13px] text-gray-500 mt-0.5">User-defined prompt tracking across LLMs.</p>
            </div>
          </div>
        </div>

        {/* Tab nav with icons */}
        <div className="px-6 mt-4 flex items-center gap-1 -mx-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {PAGE_TABS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setPromptFromOverview(null) }}
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

        {/* Toolbar — filters + contextual CTA, sits directly under the tabs */}
        <div className="px-6 py-3 border-t border-gray-100 bg-white flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <DarkDropdown value={engineFilter} onChange={setEngineFilter} options={ENGINE_OPTIONS} icon={Bot} variant="default" />
            <DarkDropdown value={periodFilter} onChange={setPeriodFilter} options={PERIOD_OPTIONS} icon={Clock} variant="active" dateRangeOption="Custom date range" />
          </div>
          {activeTab === 'Prompts' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold transition-colors shadow-sm"
            >
              <Plus size={14} />
              Add prompt
            </button>
          )}
          {activeTab === 'Competitors' && (
            <button
              onClick={() => setShowAddCompetitor(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold transition-colors shadow-sm"
            >
              <Plus size={14} />
              Add competitor
            </button>
          )}
        </div>
      </div>

      {/* Scrollable tab content */}
      <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarGutter: 'stable' }}>
        {activeTab === 'Overview'    && <div className="px-5 pt-5 pb-5"><OverviewContent onOpenInPromptsTab={openPromptInPromptsTab} /></div>}
        {activeTab === 'Prompts'     && <PromptsTabContent injectedPrompt={promptFromOverview} onInjectedBack={backToOverviewFromPrompt} />}
        {activeTab === 'Sources'     && <div className="px-5 pt-5 pb-5"><SourceInventoryContent /></div>}
        {activeTab === 'Competitors' && <CompetitorsTabContent />}
      </div>

      {showAddModal && (
        <AddPromptModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSavePrompt}
        />
      )}

      {showAddCompetitor && (
        <AddCompetitorModal
          onClose={() => setShowAddCompetitor(false)}
          onSave={handleSaveCompetitor}
        />
      )}

      {successToast && createPortal(
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 px-4 py-3 bg-success-50 rounded-lg shadow-lg min-w-[340px] max-w-[560px]"
          style={{ border: '1px solid #16A34A' }}
        >
          <CircleCheck size={15} className="text-success-600 shrink-0" />
          <p className="text-[13px] font-medium text-success-700 flex-1">{successToast}</p>
          <button
            type="button"
            onClick={() => { setSuccessToast(null); if (toastTimer.current) clearTimeout(toastTimer.current) }}
            className="shrink-0 text-success-600 hover:text-success-700 transition-colors p-0.5"
          >
            <X size={13} />
          </button>
        </div>,
        document.body,
      )}
    </div>
  )
}
