import { useState, useRef, useEffect, useLayoutEffect, Fragment } from 'react'
import { createPortal } from 'react-dom'
import {
  TrendingUp, Globe, Link2, ChevronDown, ChevronRight, LayoutDashboard,
  Award, ArrowUp, Users, Bot, Clock, MapPin,
  MessageCircle, Check, BarChart3, Search, Plus,
  ArrowLeft, ExternalLink, Calendar, AlertTriangle,
  X, CircleCheck, Sparkles, RefreshCw02, Trash2, Building2, FileText,
} from '../../icons/index.js'
import SourceInventoryContent from './SourceInventoryContent'
import CountCard from '../CountCard.jsx'
import HLInput from '../HLInput.jsx'
import HLButton from '../HLButton.jsx'
import HLModal, { modalTitle, modalSubtext, MODAL_MANAGE_HEIGHT } from '../HLModal.jsx'
import SectionInfoTip from '../SectionInfoTip.jsx'
import CompetitorRankingMiniTable from '../CompetitorRankingMiniTable.jsx'
import EngineLogo, {
  AiModeLogo,
  AiOverviewLogo,
  ChatGptLogo,
  ClaudeLogo,
  GeminiLogo,
  PerplexityLogo,
} from '../EngineLogo.jsx'
import FullResponseModal from '../FullResponseModal.jsx'
const MODAL_TABLE_TD = 'px-4 py-2.5 text-left text-[12px]'
const MODAL_TABLE_TD_MUTED = `${MODAL_TABLE_TD} text-gray-600 tabular-nums whitespace-nowrap`
const MODAL_TABLE_TD_STRONG = `${MODAL_TABLE_TD} font-medium text-gray-900 tabular-nums whitespace-nowrap`
const MODAL_TABLE_COL_VOLUME = 'w-[92px]'
const MODAL_TABLE_COL_VISIBILITY = 'w-[92px]'
const MODAL_TABLE_COL_SOV = 'w-[132px]'
const MODAL_TABLE_COL_ACTION = 'w-[80px]'

function ModalTableRemoveButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-error-600 hover:text-error-700 hover:bg-error-50 transition-colors"
    >
      <Trash2 size={14} />
    </button>
  )
}

// Shared form field chrome — matches HLForm + HLInput patterns used in VisibilityAI modals.
const FORM_LABEL_CLASS = 'block text-[14px] font-medium text-gray-700 mb-1.5'
const FORM_SELECT_CLASS =
  'w-full h-9 px-2 pr-8 bg-white border border-gray-300 rounded-md text-[14px] text-gray-900 outline-none appearance-none focus:border-primary-600 focus:shadow-focus-primary-sm transition-all cursor-pointer'
const FORM_TEXTAREA_CLASS =
  'w-full border border-gray-300 rounded-md px-3 py-2 text-[14px] text-gray-900 placeholder:text-gray-500 outline-none focus:border-primary-600 resize-y min-h-[72px] transition-colors bg-white'
import VisibilityMeter, { visibilityColor } from '../VisibilityMeter.jsx'
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

/** Widest label used to reserve chip width and prevent layout shift on selection change. */
const CUSTOM_RANGE_WIDTH_LABEL = 'Sep 30 – Oct 30, 2026'

function dropdownWidthLabel(options, value, dateRangeOption) {
  const candidates = [...options.filter(Boolean)]
  if (value) candidates.push(value)
  if (dateRangeOption) {
    candidates.push(dateRangeOption, CUSTOM_RANGE_WIDTH_LABEL)
  }
  return candidates.reduce((longest, label) => (label.length > longest.length ? label : longest), '')
}

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
  const widthLabel = dropdownWidthLabel(options, value, dateRangeOption)

  function handleSelect(opt) {
    if (opt === dateRangeOption) { setMode('calendar'); return }
    onChange(opt); setOpen(false); setMode('list')
  }

  return (
    <div ref={ref} className="relative">
      {/* Matches the canonical table filter chip (h-8, rounded-full, border-gray-300). */}
      <button
        onClick={() => { setOpen(o => !o); setMode('list') }}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-gray-300 bg-white text-[13px] font-medium text-gray-700 text-left hover:border-gray-400 hover:bg-gray-50 transition-colors"
      >
        {Icon && <Icon size={14} className="text-gray-400 shrink-0" />}
        <span className="relative inline-block text-left">
          <span className="invisible whitespace-nowrap select-none" aria-hidden="true">{widthLabel}</span>
          <span className="absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap">{value}</span>
        </span>
        <ChevronDown size={14} className="text-gray-400 shrink-0" />
      </button>

      {open && mode === 'list' && (
        <div className="absolute top-full left-0 mt-1.5 bg-white border border-gray-200 rounded-xl z-50 p-1" style={{ minWidth: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}>
          {options.map(opt => {
            const isSelected = value === opt || (opt === dateRangeOption && customActive)
            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors text-left ${isSelected ? 'bg-primary-50' : 'hover:bg-gray-50'}`}
              >
                <span className={`text-left ${isSelected ? 'text-primary-700 font-semibold' : 'text-gray-700'}`}>{opt}</span>
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

// HARDCODED: overview KPI ratings for prototyping (Good / Average / Poor)
const KPI_RATING_CLASS = {
  Good: 'text-success-600',
  Average: 'text-warning-600',
  Poor: 'text-error-600',
}

const OVERVIEW_KPI_CARDS = [
  {
    label: 'Visibility score',
    value: '76/100',
    rating: 'Good',
    Icon: Award,
    color: '#6938EF',
    help: 'Shows your overall AI visibility across all tracked platforms by combining your mentions, citations, rankings, and AI Overview presence into a single score. It’s the quickest way to understand how visible your brand is in AI search overall. Higher is better.',
  },
  {
    label: 'Competitive rank',
    value: '#3 / 7',
    rating: 'Average',
    Icon: Users,
    color: 'var(--primary-600)',
    help: 'Shows where your brand ranks compared to the competitors you’re tracking. It helps you understand your position in the market and whether you’re gaining or losing ground against other brands. A lower rank is better (#1 is best).',
  },
  {
    label: 'Avg position',
    value: '#2.3',
    rating: 'Good',
    Icon: TrendingUp,
    color: '#16A34A',
    help: 'Shows where your brand typically appears within AI-generated answers. Brands mentioned earlier are more noticeable and are more likely to influence users. A lower position is better.',
  },
  {
    label: 'Citation rate',
    value: '58%',
    rating: 'Average',
    Icon: Link2,
    color: '#D97706',
    help: 'Shows how often AI answers include a link back to your website. Linked citations are more valuable than plain mentions because they drive users directly to your content and strengthen your authority. Higher is better.',
  },
]

const OVERVIEW_METRICS = [
  {
    label: 'Presence rate',
    value: '61%',
    help: 'Shows how often your brand is mentioned in AI-generated answers, whether or not a link is included. It measures your overall visibility across AI responses, while Citation Rate focuses only on linked mentions. Higher is better.',
  },
  {
    label: 'Share of voice',
    value: '15%',
    help: 'Shows what percentage of all brand mentions across tracked AI answers belong to your brand. It helps you understand how much of the conversation you’re owning compared to your competitors. Higher means stronger competitive visibility.',
  },
  {
    label: 'Net sentiment',
    value: '+11',
    help: 'Shows whether AI describes your brand in a positive, neutral, or negative way. It helps you understand how your brand is being perceived, not just how often it’s being mentioned. A more positive score is better.',
  },
  {
    label: 'Google AI overview coverage',
    value: '62%',
    help: 'Shows how often Google displays an AI Overview for your tracked prompts. Higher coverage means there are more opportunities for your brand to appear within Google’s AI-generated search results. Higher means more visibility opportunities.',
  },
  {
    label: 'Answer density',
    value: '6.8 URLs',
    help: 'Shows how many brands and citations typically appear within each AI answer. A higher density means more brands are competing for attention, making it harder to stand out. Lower usually means less competition.',
  },
  {
    label: 'SoV gap to leader',
    value: '9 pts',
    help: 'Shows how far your brand is behind the leading competitor in Share of Voice. It helps you understand the size of the gap you need to close to become the most visible brand in your category. A smaller gap is better.',
  },
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

/** Dummy per-brand, per-topic visibility (0–100) derived from the brand's base
 * visibility. Swap for real per-topic data later. */
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

// HARDCODED: organic ↔ AI overlap prompt rows (prototyping)
const ORGANIC_OVERLAP_PROMPTS = [
  { prompt: 'What are the best AI visibility platforms for multi-location brands?', aioPos: '#1.8', overlap: 50, status: 'Watch' },
  { prompt: 'How do AI rank tracking tools compare for SEO agencies?',              aioPos: '#2.4', overlap: 42, status: 'Watch' },
  { prompt: 'Best tools to monitor citations in ChatGPT and Google AI Overview',    aioPos: '#3.7', overlap: 31, status: 'Stable' },
  { prompt: 'How can agencies improve AI citation rate for client brands?',          aioPos: '#6.8', overlap: 16, status: 'Stable' },
  { prompt: 'What makes a brand appear in AI answers more often?',                  aioPos: '#7.4', overlap: 12, status: 'Stable' },
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
  {
    label: 'Tracked prompts',
    value: '5',
    Icon: Search,
    color: 'var(--primary-600)',
    help: 'Shows the total number of prompts included in your current view. This helps you understand how much data your insights are based on and whether you’re looking at a broad dataset or a filtered subset. More prompts provide broader coverage.',
  },
  {
    label: 'Avg visibility',
    value: '52/100',
    Icon: TrendingUp,
    color: '#6938EF',
    help: 'Shows your average visibility score across all tracked prompts. It gives you a reliable view of overall performance instead of letting a few high- or low-performing prompts skew the results. Higher is better.',
  },
  {
    label: 'Avg search volume',
    value: '1.1K',
    Icon: BarChart3,
    color: '#0D9488',
    help: 'Shows the average monthly search demand for your tracked prompts. Higher search volume means greater potential reach, but these prompts are often more competitive. Higher means greater opportunity.',
  },
  {
    label: 'Engine coverage',
    value: '48%',
    Icon: Globe,
    color: '#D97706',
    help: 'Shows how many AI engines mention your brand for the tracked prompts. Higher coverage means your brand is consistently visible across more AI platforms instead of relying on a single engine. Higher means broader AI visibility.',
  },
]

const TOPIC_VIS_DATA = [
  // HARDCODED: topic-level visibility rollups for the Prompts sidebar (prototyping)
  { topic: 'AI Visibility',  sub: '2 prompts · avg #1.9', pct: 82 },
  { topic: 'Comparisons',    sub: '3 prompts · avg #4.2', pct: 71 },
  { topic: 'Sources',        sub: '2 prompts · avg #3.9', pct: 54 },
  { topic: 'Citations',      sub: '3 prompts · avg #6.0', pct: 29 },
  { topic: 'Brand Presence', sub: '2 prompts · avg #6.5', pct: 24 },
]

const TOPIC_TAG_STYLES = {
  'AI Visibility':  { bg: 'var(--primary-50)', text: '#1D4ED8', border: '#BFDBFE' },
  'Comparisons':    { bg: 'var(--primary-50)', text: '#1D4ED8', border: '#BFDBFE' },
  'Sources':        { bg: '#F0FDFA', text: '#0D9488', border: '#99F6E4' },
  'Citations':      { bg: '#F4F3FF', text: '#6938EF', border: '#E9D7FE' },
  'Brand Presence': { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
}

// Unified prompt dataset — KPIs, status tabs, and accordion lists are all derived from this.
// HARDCODED: expand this list when wiring live prompt inventory (prototyping)
const PROMPTS_DATA = [
  { id: 'p1',  prompt: 'What are the best AI visibility platforms for multi-location brands?', topic: 'AI Visibility',  intent: 'Commercial',    volume: '1.9K', volNum: 1900, engFilled: 4, visibility: 82, avgPos: '#1.8', mentions: '4 / 5', status: 'Winning',     trend: '+4'  },
  { id: 'p2',  prompt: 'How do AI rank tracking tools compare for SEO agencies?',              topic: 'Comparisons',    intent: 'Commercial',    volume: '1.3K', volNum: 1300, engFilled: 3, visibility: 71, avgPos: '#2.4', mentions: '3 / 5', status: 'Winning',     trend: '+3'  },
  { id: 'p3',  prompt: 'Best CRM platforms that show up in ChatGPT recommendations',           topic: 'AI Visibility',  intent: 'Commercial',    volume: '2.1K', volNum: 2100, engFilled: 4, visibility: 78, avgPos: '#2.0', mentions: '4 / 5', status: 'Winning',     trend: '+5'  },
  { id: 'p4',  prompt: 'Which marketing automation tools do AI engines recommend most?',       topic: 'Comparisons',    intent: 'Commercial',    volume: '1.6K', volNum: 1600, engFilled: 4, visibility: 74, avgPos: '#2.2', mentions: '4 / 5', status: 'Winning',     trend: '+2'  },
  { id: 'p5',  prompt: 'Best tools to monitor citations in ChatGPT and Google AI Overview',    topic: 'Sources',        intent: 'Informational', volume: '880',  volNum: 880,  engFilled: 3, visibility: 54, avgPos: '#3.7', mentions: '3 / 5', status: 'Neutral',     trend: '+3'  },
  { id: 'p6',  prompt: 'How to track brand mentions across Perplexity and Gemini',             topic: 'Sources',        intent: 'Informational', volume: '640',  volNum: 640,  engFilled: 2, visibility: 48, avgPos: '#4.1', mentions: '2 / 5', status: 'Neutral',     trend: '+1'  },
  { id: 'p13', prompt: 'Do AI assistants recommend all-in-one agency platforms over point tools?', topic: 'Comparisons', intent: 'Commercial', volume: '590', volNum: 590, engFilled: 2, visibility: 51, avgPos: '#4.0', mentions: '2 / 5', status: 'Neutral', trend: '+2' },
  { id: 'p14', prompt: 'How accurate are AI-generated CRM comparisons for agencies?',         topic: 'Comparisons',    intent: 'Informational', volume: '520',  volNum: 520,  engFilled: 2, visibility: 46, avgPos: '#4.5', mentions: '2 / 5', status: 'Neutral',     trend: '0'  },
  { id: 'p7',  prompt: 'What content formats get cited most often in AI answers?',             topic: 'Citations',      intent: 'Informational', volume: '910',  volNum: 910,  engFilled: 2, visibility: 41, avgPos: '#5.2', mentions: '2 / 5', status: 'Opportunity', trend: '+6'  },
  { id: 'p8',  prompt: 'How can local businesses improve visibility in AI Overviews?',         topic: 'Brand Presence', intent: 'Informational', volume: '1.1K', volNum: 1100, engFilled: 2, visibility: 38, avgPos: '#5.6', mentions: '2 / 5', status: 'Opportunity', trend: '+4'  },
  { id: 'p9',  prompt: 'Best practices for structuring FAQ pages for AI citation',             topic: 'Citations',      intent: 'Informational', volume: '760',  volNum: 760,  engFilled: 2, visibility: 35, avgPos: '#5.9', mentions: '2 / 5', status: 'Opportunity', trend: '+2'  },
  { id: 'p15', prompt: 'How do review sites influence AI recommendations for CRM tools?',      topic: 'Sources',        intent: 'Informational', volume: '680',  volNum: 680,  engFilled: 2, visibility: 33, avgPos: '#6.1', mentions: '2 / 5', status: 'Opportunity', trend: '+3'  },
  { id: 'p16', prompt: 'What schema markup helps brands get cited in AI answers?',             topic: 'Citations',      intent: 'Informational', volume: '610',  volNum: 610,  engFilled: 1, visibility: 31, avgPos: '#6.4', mentions: '1 / 5', status: 'Opportunity', trend: '+1'  },
  { id: 'p10', prompt: 'How can agencies improve AI citation rate for client brands?',          topic: 'Citations',      intent: 'Informational', volume: '720',  volNum: 720,  engFilled: 1, visibility: 29, avgPos: '#6.8', mentions: '1 / 5', status: 'Losing',      trend: '-9'  },
  { id: 'p11', prompt: 'What makes a brand appear in AI answers more often?',                  topic: 'Brand Presence', intent: 'Informational', volume: '540',  volNum: 540,  engFilled: 1, visibility: 24, avgPos: '#7.4', mentions: '1 / 5', status: 'Losing',      trend: '-11' },
  { id: 'p12', prompt: 'Why do competitors outrank us in ChatGPT product comparisons?',        topic: 'Comparisons',    intent: 'Commercial',    volume: '480',  volNum: 480,  engFilled: 1, visibility: 18, avgPos: '#8.1', mentions: '1 / 5', status: 'Losing',      trend: '-7'  },
  { id: 'p17', prompt: 'Which agencies are losing mentions in Perplexity CRM roundups?',       topic: 'Brand Presence', intent: 'Commercial',    volume: '410',  volNum: 410,  engFilled: 1, visibility: 16, avgPos: '#8.4', mentions: '1 / 5', status: 'Losing',      trend: '-5'  },
  { id: 'p18', prompt: 'Why is our brand missing from Gemini marketing automation lists?',     topic: 'AI Visibility',  intent: 'Informational', volume: '390',  volNum: 390,  engFilled: 0, visibility: 12, avgPos: '#9.0', mentions: '0 / 5', status: 'Losing',      trend: '-8'  },
]

// Status colour + copy meta, shared by tabs / accordion headers / badges.
const STATUS_META = {
  Winning:     { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', desc: 'High visibility and majority-engine presence.' },
  Opportunity: { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', desc: 'High-value prompts with low current visibility.' },
  Neutral:     { color: '#155EEF', bg: '#EFF6FF', border: '#BFDBFE', desc: 'Stable prompts with moderate engine coverage.' },
  Losing:      { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', desc: 'Prompts showing the sharpest negative trend.' },
}
// Tab order (nav). Accordion priority order surfaces actionable statuses first.
const ROLLUP_ORDER = ['Winning', 'Opportunity', 'Neutral', 'Losing']
const PRIORITY_ORDER = ['Opportunity', 'Losing', 'Neutral', 'Winning']

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

const SEGMENTS = ['All', ...ROLLUP_ORDER]

const STATUS_COUNTS = ROLLUP_ORDER.map(s => ({
  status: s,
  count: PROMPTS_DATA.filter(p => p.status === s).length,
  color: STATUS_META[s].color,
}))

// Resolve a lighter Overview card payload to the richest matching prompt record.
function resolvePromptForDetail(item) {
  const fromDataset = PROMPTS_DATA.find(p => p.prompt === item.prompt)
  if (fromDataset) return fromDataset
  return {
    id: item.id || `overview-${item.rank || item.prompt}`,
    prompt: item.prompt,
    topic: item.topic || item.tag || 'AI Visibility',
    visibility: item.visibility,
    volume: String(item.volume || '').replace(' monthly volume', '') || item.volume,
    avgPos: item.avgPos || item.aioPos,
    status: item.status && STATUS_META[item.status] ? item.status : 'Winning',
    trend: item.trend || item.trendScore || '+0',
  }
}

function scrollContentToTop(ref) {
  const el = ref?.current
  if (!el) return
  el.scrollTop = 0
  requestAnimationFrame(() => {
    el.scrollTop = 0
    requestAnimationFrame(() => { el.scrollTop = 0 })
  })
}

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

const ENGINE_PERF_GRID = 'minmax(0, 1fr) 60px 76px 44px'

const DETAIL_SOURCES = [
  { url: 'https://www.capterra.com/p/209198/GoHighLevel/', domain: 'capterra.com',    avgPos: '#1.5', coverage: '19%', seenInChats: 112, brandMentioned: true,  otherBrands: true,  lastSeen: 'Apr 28, 2026' },
  { url: 'https://gohighlevel.com/pricing',               domain: 'gohighlevel.com', avgPos: '#1.0', coverage: '25%', seenInChats: 56,  brandMentioned: true,  otherBrands: false, lastSeen: 'Jun 19, 2026' },
]

// ── Prompts tab helpers ────────────────────────────────────────────────────

// Real engine logos showing which engines mention the brand (full colour) vs not
// (muted, greyscaled). Uses the shared EngineLogo so no letter-monogram placeholders.
// `overlap` stacks icons with a slight negative margin (pitch-page avatar stack).
function EngineLetterDots({ filled, overlap = false }) {
  return (
    <div className={`flex items-center ${overlap ? '' : 'gap-1'}`}>
      {ENGINE_PALETTE.map((e, i) => {
        const mentioned = i < filled
        return (
          <span
            key={i}
            title={e.name}
            className={`relative inline-flex items-center justify-center w-[20px] h-[20px] rounded-full bg-white border border-gray-200 shrink-0 transition-opacity ${
              overlap ? `ring-2 ring-white ${i === 0 ? '' : '-ml-1.5'}` : ''
            } ${mentioned ? '' : 'opacity-35 grayscale'}`}
            style={overlap ? { zIndex: ENGINE_PALETTE.length - i } : undefined}
          >
            <EngineLogo name={e.name} size={12} chip={false} />
          </span>
        )
      })}
    </div>
  )
}

function sortPromptsForStatus(prompts, status) {
  const sorted = [...prompts]
  if (status === 'Winning') {
    sorted.sort((a, b) => b.visibility - a.visibility)
  } else {
    // Opportunity / Losing / Neutral — lower visibility = higher urgency
    sorted.sort((a, b) => a.visibility - b.visibility)
  }
  return sorted
}

// Ranked topic visibility — compact horizontal score rails (replaces bulky ring grid).
function TopicVisibilityPanel({ topics, className = '' }) {
  const ranked = [...topics].sort((a, b) => b.pct - a.pct)
  const avg = Math.round(ranked.reduce((sum, t) => sum + t.pct, 0) / (ranked.length || 1))

  return (
    <div className={`border border-gray-200 rounded-2xl bg-white shadow-xs p-4 flex flex-col min-h-0 ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <h3 className="text-[15px] font-semibold text-gray-900 m-0">Topic visibility</h3>
          <SectionInfoTip
            id="pt-topic-visibility-info"
            content="Shows how your visibility compares across different topics. It helps you identify which topics your brand already owns and where you have the biggest opportunity to improve. Higher visibility means stronger topic authority."
          />
        </div>
        <div className="text-right shrink-0">
          <p className="text-[18px] font-bold text-gray-900 tabular-nums leading-none m-0">{avg}%</p>
          <p className="text-[11px] text-gray-400 m-0 mt-0.5">Avg</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1" style={{ scrollbarGutter: 'stable' }}>
        {ranked.map((t, i) => {
          const color = visibilityColor(t.pct)
          const isLead = i === 0
          return (
            <div
              key={t.topic}
              className={`rounded-lg px-2.5 py-2 transition-colors ${isLead ? 'bg-primary-50/70' : 'hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-2.5">
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[11px] font-semibold tabular-nums shrink-0 ${
                  isLead ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-[13px] font-medium truncate m-0 ${isLead ? 'text-primary-700' : 'text-gray-800'}`}>{t.topic}</p>
                  <p className="text-[11px] text-gray-400 truncate m-0">{t.sub}</p>
                </div>
                <span className="text-[13px] font-semibold tabular-nums shrink-0" style={{ color }}>{t.pct}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Nested compact row — lighter than status cards (list tile, not a nav card).
function PromptDenseRow({ prompt, onClick }) {
  const color = visibilityColor(prompt.visibility)
  const topicColor = TOPIC_TAG_STYLES[prompt.topic]?.text
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full flex items-center gap-2.5 text-left min-h-[56px] px-3 py-2.5 rounded-lg bg-white border border-gray-200 hover:bg-primary-50 hover:border-primary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-200 transition-colors"
    >
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-semibold text-gray-900 leading-snug m-0 line-clamp-1">{prompt.prompt}</p>
        <p className="text-[13px] text-gray-400 m-0 mt-1 truncate leading-snug">
          <span className="font-medium" style={topicColor ? { color: topicColor } : undefined}>{prompt.topic}</span>
          <span className="text-gray-300"> · </span>
          <span className="tabular-nums">{prompt.volume}</span>
          <span className="text-gray-300"> · </span>
          <span>{prompt.intent}</span>
          <span className="text-gray-300"> · </span>
          <span className="tabular-nums">{prompt.avgPos}</span>
        </p>
      </div>
      <EngineLetterDots filled={prompt.engFilled} overlap />
      <span className="text-[13px] font-semibold tabular-nums shrink-0 w-7 text-right leading-none" style={{ color }}>
        {prompt.visibility}
      </span>
      <ChevronRight size={12} className="text-gray-300 group-hover:text-primary-500 transition-colors shrink-0" />
    </button>
  )
}

function PromptStatusTabs({ segment, onChange }) {
  return (
    <div
      className="relative z-10 flex items-stretch gap-0 px-2 border-b border-gray-200 bg-white overflow-x-auto shrink-0 shadow-[0_1px_0_0_rgba(16,24,40,0.06)]"
      role="tablist"
      aria-label="Prompt status"
    >
      {SEGMENTS.map(seg => {
        const isActive = segment === seg
        const count = seg === 'All'
          ? PROMPTS_DATA.length
          : (STATUS_COUNTS.find(s => s.status === seg)?.count ?? 0)
        return (
          <button
            key={seg}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(seg)}
            className={`relative px-3 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors ${
              isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              {seg}
              <span className={`tabular-nums text-[11px] font-semibold ${
                isActive ? 'text-primary-500' : 'text-gray-400'
              }`}>
                {count}
              </span>
            </span>
            {isActive && (
              <span className="absolute left-2 right-2 bottom-0 h-0.5 rounded-full bg-primary-600" aria-hidden="true" />
            )}
          </button>
        )
      })}
    </div>
  )
}

// Non-interactive section label for All-view priority groups (static — sticky
// caused prompt rows to clip under the tabs while the next label sat below).
function PromptStatusLabel({ status, count }) {
  return (
    <div className="flex items-center gap-1.5 px-0.5 pt-1 pb-0.5">
      <span className="text-[12px] font-semibold text-gray-900">{status}</span>
      <span className="text-[11px] font-medium text-gray-400 tabular-nums">{count}</span>
    </div>
  )
}

// Overlap row status chip — same chrome as former StatusBadge (px-2, bordered pill).
const OVERLAP_STATUS_META = {
  Watch:  { color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
  Stable: { color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
}

function OverlapStatusChip({ status }) {
  const s = OVERLAP_STATUS_META[status] || OVERLAP_STATUS_META.Stable
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium whitespace-nowrap"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {status}
    </span>
  )
}

// Brand/competitor name cell — text only (no brand logos / initials).
function CompetitorBrandCell({ c, showDomain = false }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 min-w-0">
        <p className={`text-[13px] font-semibold truncate m-0 ${c.isMe ? 'text-primary-700' : 'text-gray-900'}`}>{c.name}</p>
      </div>
      {showDomain && <p className="text-[12px] text-gray-400 truncate m-0">{c.domain}</p>}
    </div>
  )
}

// ── Prompts tab content ────────────────────────────────────────────────────

function PromptsTabContent({ injectedPrompt = null, onInjectedBack, contentScrollRef }) {
  const [segment, setSegment] = useState('All')
  const [selectedPrompt, setSelectedPrompt] = useState(null)

  useLayoutEffect(() => {
    if (injectedPrompt || selectedPrompt) {
      scrollContentToTop(contentScrollRef)
    }
  }, [injectedPrompt, selectedPrompt, contentScrollRef])

  const groups = (segment === 'All' ? PRIORITY_ORDER : [segment]).map(status => ({
    status,
    prompts: sortPromptsForStatus(
      PROMPTS_DATA.filter(p => p.status === status),
      status,
    ),
  }))
  const totalVisible = groups.reduce((sum, g) => sum + g.prompts.length, 0)
  const showSectionLabels = segment === 'All'

  // Clicking any prompt opens the dedicated detail page. A prompt injected from
  // Overview keeps its "Back to overview" affordance.
  const detailPrompt = injectedPrompt || selectedPrompt
  if (detailPrompt) {
    return (
      <div className="h-full min-h-0 overflow-y-auto px-5 py-5" style={{ scrollbarGutter: 'stable' }}>
        <PromptDetailView
          prompt={detailPrompt}
          backLabel={injectedPrompt ? 'Back to overview' : 'Back to prompts'}
          onBack={injectedPrompt ? onInjectedBack : () => setSelectedPrompt(null)}
        />
      </div>
    )
  }

  return (
    <div className="h-full min-h-0 flex flex-col">
      {/* KPI strip — fixed; main cards fill remaining viewport */}
      <div className="shrink-0 px-5 pt-5 pb-4">
        <div className="grid grid-cols-4 gap-3">
          {PROMPTS_KPIS.map((kpi, i) => {
            const value = i === 0 ? PROMPTS_DATA.length : kpi.value
            return (
              <CountCard key={kpi.label} label={kpi.label} value={value} Icon={kpi.Icon} iconColor={kpi.color} helpContent={kpi.help} />
            )
          })}
        </div>
      </div>

      <div className="flex-1 min-h-0 px-5 pb-5">
        <div className="h-full min-h-0 grid gap-4" style={{ gridTemplateColumns: 'minmax(0, 64fr) minmax(0, 36fr)' }}>

          {/* Tracked prompts — fills left column */}
          <div className="min-w-0 min-h-0 h-full border border-gray-200 rounded-2xl bg-white shadow-xs flex flex-col overflow-hidden">
            <div className="shrink-0 px-4 pt-4 pb-3">
              <div className="flex items-center gap-1.5">
                <h3 className="text-[15px] font-semibold text-gray-900 m-0">Tracked prompts</h3>
                <SectionInfoTip
                  id="pt-prompt-rollups-info"
                  content="Filter by status with the tabs, then scroll the list. Under All, prompts are ordered Opportunity → Losing → Neutral → Winning so actionable items stay on top."
                />
              </div>
            </div>

            <div className="shrink-0">
              <PromptStatusTabs segment={segment} onChange={setSegment} />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 pt-3 pb-3 bg-white" style={{ scrollbarGutter: 'stable' }}>
              {totalVisible === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center bg-gray-50">
                  <p className="text-[12px] text-gray-400 m-0">No prompts match this filter in the current range.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {groups.map(({ status, prompts }) => {
                    if (prompts.length === 0) return null
                    return (
                      <div key={status} className="flex flex-col gap-1.5">
                        {showSectionLabels && (
                          <PromptStatusLabel status={status} count={prompts.length} />
                        )}
                        {prompts.map(p => (
                          <PromptDenseRow key={p.id} prompt={p} onClick={() => setSelectedPrompt(p)} />
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right — Topic visibility grows; AI engine coverage hugs content */}
          <div className="min-w-0 min-h-0 h-full flex flex-col gap-4">
            <TopicVisibilityPanel topics={TOPIC_VIS_DATA} className="flex-1 min-h-0" />

            <div className="shrink-0 border border-gray-200 rounded-2xl bg-white p-4 shadow-xs">
              <h3 className="text-[15px] font-semibold text-gray-900 m-0 mb-3">AI engine coverage</h3>
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
    { label: 'Visibility',        value: prompt.visibility != null ? `${prompt.visibility}/100` : '82/100', desc: 'Current prompt-level visibility across tracked engines.', Icon: Award,      color: '#6938EF' },
    { label: 'Average position',  value: prompt.avgPos || prompt.aioPos || '#1.8', desc: 'Average cited position when the brand appears.',          Icon: TrendingUp,  color: '#16A34A' },
    { label: 'AI responses',      value: '112',    desc: 'Latest prompt responses available for drill-down.',        Icon: Bot,         color: 'var(--primary-600)' },
    { label: 'Search volume',     value: prompt.volume || '1.9K',   desc: 'Demand proxy carried through from the tracked prompt.',   Icon: BarChart3,   color: '#D97706' },
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

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-4 gap-3">
            {DETAIL_KPI.map(kpi => (
              <CountCard key={kpi.label} label={kpi.label} value={kpi.value} help helpContent={kpi.desc} Icon={kpi.Icon} iconColor={kpi.color} />
            ))}
          </div>
        </div>
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

        <div className="border border-gray-200 rounded-lg bg-white p-4 min-w-0 h-full flex flex-col">
          <div className="flex items-center gap-1.5 mb-4">
            <h3 className="text-[15px] font-semibold text-gray-900 m-0">Engine performance</h3>
            <SectionInfoTip id="pt-engine-performance-info" content="Prompt metrics by engine" />
          </div>
          <div className="grid text-[12px] font-semibold text-gray-900 normal-case bg-gray-50 border border-gray-200 rounded-t-lg px-2.5 py-2" style={{ gridTemplateColumns: ENGINE_PERF_GRID }}>
            <span>Engine</span>
            <span className="text-right">Mention</span>
            <span className="text-right whitespace-nowrap">Citation</span>
            <span className="text-right">Trend</span>
          </div>
          <div className="flex flex-col border-x border-b border-gray-200 rounded-b-lg overflow-hidden">
            {ENGINE_PERF_DATA.map((eng, i) => (
              <div
                key={i}
                className="grid items-center py-2.5 px-2.5 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                style={{ gridTemplateColumns: ENGINE_PERF_GRID }}
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
          <div className="flex items-center gap-1.5 mb-3">
            <h3 className="text-[15px] font-semibold text-gray-900">AI Responses</h3>
            <SectionInfoTip
              id="pt-ai-responses-info"
              content="Latest prompt responses from tracked engines with drill-in answer analysis"
            />
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[130px]">AI</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200">Chat</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[180px]">Brands</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[72px]">Sources</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap w-[110px]">Created</th>
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
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-r border-gray-100 align-top">
                      <p className="text-[13px] text-gray-700 leading-relaxed mb-1">{row.text}</p>
                      <button
                        type="button"
                        onClick={() => setFullResponse(row)}
                        className="text-[12px] text-primary-600 hover:underline"
                      >
                        Open full response
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
            <div className="flex items-center gap-1.5">
              <h3 className="text-[15px] font-semibold text-gray-900">Prompt sources</h3>
              <SectionInfoTip
                id="pt-prompt-sources-info"
                content="All detected sources for this prompt with a compact matrix of position, coverage, and mention signals"
              />
            </div>
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
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 min-w-[200px]">{sourcesView === 'URL' ? 'URL' : 'Domain'}</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[100px]">Avg position</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[88px]">Coverage</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[100px]">Seen in chats</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[120px]">Brand mentioned</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[160px]">Other brands mentioned</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap w-[110px]">Last seen</th>
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

const OVERVIEW_PROMPT_VIEWS = [
  { id: 'seo-ai', label: 'SEO → AI support' },
  { id: 'top-performing', label: 'Top performing' },
]

function OverviewContent({ contentScrollRef }) {
  const [trendMetric, setTrendMetric] = useState('Visibility')
  const [trendPeriod, setTrendPeriod] = useState('28D')
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [promptView, setPromptView] = useState('seo-ai')
  const trendLines = TREND_LINES_MAP[trendMetric] || TREND_LINES_MAP.Visibility

  useLayoutEffect(() => {
    if (selectedPrompt) scrollContentToTop(contentScrollRef)
  }, [selectedPrompt, contentScrollRef])

  if (selectedPrompt) {
    return (
      <PromptDetailView
        prompt={selectedPrompt}
        backLabel="Back to overview"
        onBack={() => setSelectedPrompt(null)}
      />
    )
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
            description={
              <span className={`font-medium ${KPI_RATING_CLASS[kpi.rating] || 'text-gray-500'}`}>
                {kpi.rating}
              </span>
            }
            Icon={kpi.Icon}
            iconColor={kpi.color}
            helpContent={kpi.help}
          />
        ))}
      </div>

      {/* Row 2: 6-metric combined card — sentence-case labels, ≤20px insights */}
      <div className="border border-gray-200 rounded-lg bg-white">
        <div className="grid grid-cols-3">
          {OVERVIEW_METRICS.map((m, i) => (
            <div key={m.label} className={`px-4 py-3 ${i < 3 ? 'border-b border-gray-100' : ''} ${i % 3 !== 2 ? 'border-r border-gray-100' : ''}`}>
              <div className="flex items-center gap-1 mb-1.5">
                <p className="text-[12px] font-medium text-gray-500 m-0 normal-case">{m.label}</p>
                <SectionInfoTip id={`pt-overview-metric-${i}`} content={m.help} />
              </div>
              <p className="text-[18px] font-semibold text-gray-900 leading-none m-0">{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Visibility trend + Competitor ranking */}
      <div className="grid gap-4 items-stretch" style={{ gridTemplateColumns: 'minmax(0, 63fr) minmax(0, 37fr)' }}>
        {/* Visibility trend */}
        <div className="border border-gray-200 rounded-lg bg-white p-4 min-w-0 overflow-hidden flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[15px] font-semibold text-gray-900 m-0">Visibility trend</h3>
              <SectionInfoTip
                id="pt-visibility-trend-info"
                content="Track how your brand's visibility, mentions, or citations change over time and compare performance against competitors."
              />
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

        <CompetitorRankingMiniTable
          infoId="pt-competitor-ranking-info"
          infoContent="Compare your brand's visibility, average position, sentiment, and share of voice against tracked competitors."
          rows={COMPETITOR_RANKING_DATA}
        />
      </div>

      {/* Row 4: Engine coverage */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[15px] font-semibold text-gray-900 m-0">Engine coverage</h3>
            <SectionInfoTip
              id="pt-engine-coverage-info"
              content="See how your brand performs across different AI search engines."
            />
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[216px] normal-case">Engine</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[160px] normal-case">Visibility</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[88px] normal-case">Presence</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[140px] normal-case">Avg position</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[100px] normal-case">Citation rate</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap normal-case">Insight</th>
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
        <div className="flex items-center gap-1.5 mb-3">
          <h3 className="text-[15px] font-semibold text-gray-900 m-0">How AI is describing GoHighLevel</h3>
          <SectionInfoTip
            id="pt-ai-describing-info"
            content="See how AI platforms describe your brand across detected mentions, from strong recommendations to negative or dismissive responses."
          />
        </div>
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
              <p className="text-[18px] font-semibold text-gray-900 leading-none m-0">{s.value}%</p>
            </div>
          ))}
        </div>
        <p className="text-[13px] font-normal text-gray-500 m-0">AI answers show mixed momentum. Stronger source coverage and clearer category proof can improve how GoHighLevel is framed.</p>
      </div>

      {/* Row 6: Prompt insights — both views stacked in one grid cell so height never snaps */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[15px] font-semibold text-gray-900 m-0">Prompt insights</h3>
              <SectionInfoTip
                id="pt-prompt-insights-info"
                content={
                  promptView === 'seo-ai'
                    ? 'See how much of your Google AI Overview visibility comes from pages that already rank in organic search.'
                    : 'See the prompts where your brand achieved the highest AI visibility during the selected date range.'
                }
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-1 bg-gray-100 rounded-lg p-1 shrink-0" role="tablist" aria-label="Prompt insights view">
            {OVERVIEW_PROMPT_VIEWS.map(v => (
              <button
                key={v.id}
                type="button"
                role="tab"
                aria-selected={promptView === v.id}
                onClick={() => setPromptView(v.id)}
                className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                  promptView === v.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body: both panels in one grid cell → container height = max(seo, top) */}
        <div className="grid px-5 pb-5">
          <div
            className={`col-start-1 row-start-1 ${promptView === 'seo-ai' ? '' : 'invisible pointer-events-none'}`}
            aria-hidden={promptView !== 'seo-ai'}
          >
            <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3.5 py-3 bg-gray-50 min-h-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 shrink-0">
                  <TrendingUp size={14} className="text-gray-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-[20px] font-semibold text-gray-900 leading-none tabular-nums">34%</span>
                    <span className="text-[13px] font-medium text-gray-700 leading-snug">of AI citations come from your organic pages</span>
                  </div>
                  <p className="text-[12px] font-normal text-gray-500 leading-snug m-0 mt-1">
                    These are pages that rank in Google and are also cited in AI answers.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3.5 py-3 bg-gray-50 min-h-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 shrink-0">
                  <AlertTriangle size={14} className="text-gray-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-[20px] font-semibold text-gray-900 leading-none tabular-nums">2</span>
                    <span className="text-[13px] font-medium text-gray-700 leading-snug">prompts need attention</span>
                  </div>
                  <p className="text-[12px] font-normal text-gray-500 leading-snug m-0 mt-1">
                    AI visibility is dropping because fewer ranking pages are being cited.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-2.5">
              <h4 className="text-[14px] font-semibold text-gray-900 m-0">Top prompts where AI visibility is measured</h4>
              <p className="text-[12px] font-normal text-gray-500 m-0 mt-0.5">Based on your tracked AI prompts</p>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-2 text-[12px] font-semibold text-gray-900">Prompt</th>
                    <th className="px-4 py-2 text-[12px] font-semibold text-gray-900 whitespace-nowrap">AI rank</th>
                    <th className="px-4 py-2 text-[12px] font-semibold text-gray-900 whitespace-nowrap">SEO → AI support</th>
                    <th className="px-4 py-2 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Status</th>
                    <th className="px-4 py-2 w-8"><span className="sr-only">Open</span></th>
                  </tr>
                </thead>
                <tbody>
                  {ORGANIC_OVERLAP_PROMPTS.map((item, i) => {
                    const isWatch = item.status === 'Watch'
                    return (
                      <tr
                        key={i}
                        role="button"
                        tabIndex={promptView === 'seo-ai' ? 0 : -1}
                        onClick={() => setSelectedPrompt(resolvePromptForDetail(item))}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelectedPrompt(resolvePromptForDetail(item))
                          }
                        }}
                        className="group border-b border-gray-100 last:border-b-0 hover:bg-gray-50/80 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-2.5 align-middle">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <span
                              className={`mt-0.5 flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${
                                isWatch ? 'bg-primary-50 text-primary-600' : 'bg-success-50 text-success-600'
                              }`}
                              aria-hidden="true"
                            >
                              {isWatch ? <Search size={12} /> : <Check size={12} strokeWidth={2.5} />}
                            </span>
                            <div className="min-w-0">
                              <p className="text-[13px] font-medium text-gray-900 leading-snug m-0 line-clamp-2">{item.prompt}</p>
                              <p className="text-[11px] font-normal text-gray-400 m-0 mt-0.5">Tracked prompt</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 align-middle text-[13px] font-medium text-gray-900 tabular-nums whitespace-nowrap">
                          {item.aioPos}
                        </td>
                        <td className="px-4 py-2.5 align-middle">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[12px] font-medium text-gray-700 tabular-nums shrink-0">{item.overlap}%</span>
                            <div className="w-14 h-1.5 rounded-full bg-gray-100 overflow-hidden shrink-0">
                              <div
                                className={`h-full rounded-full ${isWatch ? 'bg-warning-400' : 'bg-success-500'}`}
                                style={{ width: `${item.overlap}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 align-middle">
                          <OverlapStatusChip status={item.status} />
                        </td>
                        <td className="px-4 py-2.5 align-middle text-right">
                          <ChevronRight size={16} className="inline-block text-gray-300 group-hover:text-primary-500 transition-colors" />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div
            className={`col-start-1 row-start-1 flex flex-col gap-2 ${promptView === 'top-performing' ? '' : 'invisible pointer-events-none'}`}
            aria-hidden={promptView !== 'top-performing'}
          >
            {TOP_PROMPTS_DATA.map(item => (
              <button
                key={item.rank}
                type="button"
                tabIndex={promptView === 'top-performing' ? 0 : -1}
                onClick={() => setSelectedPrompt(resolvePromptForDetail(item))}
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
    </div>
  )
}

// ── Add prompt modal ───────────────────────────────────────────────────────

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

// Compact engine chip — logo + name + checkbox (no per-card info tip).
function EngineCheckboxCard({ engine, checked, onToggle }) {
  const { name, Logo } = engine
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={`relative flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all ${
        checked
          ? 'border-primary-600 bg-primary-50/60'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <span className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center shrink-0">
        <Logo size={14} />
      </span>
      <span className="min-w-0 flex-1 text-[12px] font-medium text-gray-900 truncate">{name}</span>
      <span
        className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
          checked ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'
        }`}
      >
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
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

const MAX_TRACKED_PROMPTS = 10

// Shared enter/exit motion for Manage prompts & Manage competitors selection rows.
function useSelectionRowMotion() {
  const [flashIds, setFlashIds] = useState(() => new Set())
  const [removingIds, setRemovingIds] = useState(() => new Set())
  const listRef = useRef(null)
  const timersRef = useRef(new Map())
  const removingLockRef = useRef(new Set())

  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current.clear()
    removingLockRef.current.clear()
  }, [])

  function clearTimer(key) {
    const timer = timersRef.current.get(key)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(key)
    }
  }

  function markAdded(id) {
    setFlashIds(prev => new Set(prev).add(id))
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    })
    clearTimer(`flash-${id}`)
    const timer = window.setTimeout(() => {
      setFlashIds(prev => {
        if (!prev.has(id)) return prev
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      timersRef.current.delete(`flash-${id}`)
    }, 1400)
    timersRef.current.set(`flash-${id}`, timer)
  }

  function animateRemove(id, onDone) {
    if (removingLockRef.current.has(id)) return
    removingLockRef.current.add(id)
    setRemovingIds(prev => new Set(prev).add(id))
    setFlashIds(prev => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    clearTimer(`flash-${id}`)
    clearTimer(`remove-${id}`)
    const timer = window.setTimeout(() => {
      onDone()
      removingLockRef.current.delete(id)
      setRemovingIds(prev => {
        if (!prev.has(id)) return prev
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      timersRef.current.delete(`remove-${id}`)
    }, 280)
    timersRef.current.set(`remove-${id}`, timer)
  }

  function rowMotionClass(id) {
    if (removingIds.has(id)) return 'pt-selection-removing border-gray-200 bg-white'
    if (flashIds.has(id)) return 'pt-selection-added-flash'
    return 'border-gray-200 bg-white hover:border-gray-300 transition-colors'
  }

  return { listRef, markAdded, animateRemove, rowMotionClass }
}

// HARDCODED: extra AI-suggested prompts for the manage modal (prototyping)
const MANAGE_EXTRA_SUGGESTIONS = [
  { prompt: 'Best CRM for small businesses that need automation and texting', topic: 'CRM', volume: '3.2K' },
  { prompt: 'What tool is best for landing pages, funnels, and automated lead capture?', topic: 'Funnels', volume: '1.8K' },
]

function ManagePromptsModal({ onClose, onSave }) {
  // HARDCODED: seed under the track limit so add / suggestions stay usable (prototyping)
  const [trackedPrompts, setTrackedPrompts] = useState(() =>
    PROMPTS_DATA.slice(0, 6).map(p => ({ ...p })),
  )
  const [pendingAdds, setPendingAdds] = useState([])
  const [selectedEngines, setSelectedEngines] = useState(
    () => new Set(ADD_PROMPT_ENGINES.map(e => e.id)),
  )
  const [customPrompt, setCustomPrompt] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const { listRef: selectionListRef, markAdded, animateRemove, rowMotionClass } = useSelectionRowMotion()

  const totalSelected = trackedPrompts.length + pendingAdds.length
  const atCapacity = totalSelected >= MAX_TRACKED_PROMPTS
  const overCapacity = totalSelected > MAX_TRACKED_PROMPTS

  function toggleEngine(id) {
    setSelectedEngines(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function deleteTracked(id) {
    animateRemove(id, () => {
      setTrackedPrompts(prev => prev.filter(p => p.id !== id))
    })
  }

  function stagePrompt(item) {
    if (atCapacity) return
    if (trackedPrompts.some(p => p.prompt === item.prompt)) return
    if (pendingAdds.some(p => p.prompt === item.prompt)) return
    const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    // Newest first — appears at top of Your selection
    setPendingAdds(prev => [{ ...item, id }, ...prev])
    markAdded(id)
  }

  function removePending(id) {
    animateRemove(id, () => {
      setPendingAdds(prev => prev.filter(p => p.id !== id))
    })
  }

  function addCustomPrompt() {
    const text = customPrompt.trim()
    if (!text || atCapacity) return
    stagePrompt({ prompt: text, topic: 'Custom tracking', volume: '—', source: 'Custom' })
    setCustomPrompt('')
    setShowAddForm(false)
  }

  function handleSave() {
    if (selectedEngines.size === 0 || overCapacity) return
    onSave({ tracked: trackedPrompts, pending: pendingAdds, engines: selectedEngines })
  }

  const excludedPromptTexts = new Set([
    ...trackedPrompts.map(p => p.prompt),
    ...pendingAdds.map(p => p.prompt),
  ])

  const selectableSuggestions = [
    ...MANAGE_EXTRA_SUGGESTIONS
      .filter(s => !excludedPromptTexts.has(s.prompt)),
    ...ADD_PROMPT_SUGGESTIONS
      .filter(s => !excludedPromptTexts.has(s.prompt))
      .map(s => ({ prompt: s.prompt, topic: s.topic, volume: s.volume.replace(' volume', '') })),
  ]

  const canAddCustom = Boolean(customPrompt.trim()) && !atCapacity
  const canSave = selectedEngines.size > 0 && !overCapacity

  const selectionRows = [
    ...pendingAdds.map(p => ({ ...p, _kind: 'pending' })),
    ...trackedPrompts.map(p => ({ ...p, _kind: 'tracked' })),
  ]

  return (
    <HLModal
      id="manage-prompts"
      width={880}
      height={MODAL_MANAGE_HEIGHT}
      headerDivider
      onClose={onClose}
      contentClassName="px-6 py-4 overflow-hidden flex flex-col"
      footerClassName="px-6 py-3.5"
      header={(
        <div className="px-6 pt-5 pb-3.5">
          <div className="flex items-center gap-2">
            <h2 id="manage-prompts-title" className={`${modalTitle} m-0`}>Manage prompts</h2>
            <SectionInfoTip content="Track up to ten prompts. Your selection is the source of truth — suggestions and custom adds fill open slots." />
          </div>
          <p className={`${modalSubtext} m-0 mt-1`}>
            Review what you’re tracking, add prompts you care about, and optionally use suggestions to fill open slots.
          </p>
        </div>
      )}
      footer={(
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[12px] text-gray-400 m-0">
            {overCapacity
              ? `Remove ${totalSelected - MAX_TRACKED_PROMPTS} prompt${totalSelected - MAX_TRACKED_PROMPTS === 1 ? '' : 's'} to stay within the ${MAX_TRACKED_PROMPTS}-prompt limit.`
              : pendingAdds.length > 0
                ? `${pendingAdds.length} new prompt${pendingAdds.length === 1 ? '' : 's'} will start tracking on save.`
                : 'Changes will be applied to the next scan when you save.'}
          </p>
          <div className="flex items-center gap-2">
            <HLButton variant="secondary" color="gray" size="sm" onClick={onClose}>
              Cancel
            </HLButton>
            <HLButton
              variant="primary"
              color="blue"
              size="sm"
              disabled={!canSave}
              onClick={handleSave}
            >
              Save and refresh results
            </HLButton>
          </div>
        </div>
      )}
    >
      <div className="flex-1 min-h-0 flex flex-col gap-3">
        {/* AI engines — prompts-only control; same modal chrome as competitors */}
        <section className="shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[14px] font-semibold text-gray-900 m-0">AI engines</p>
            <SectionInfoTip content="Engine selection applies globally to every tracked prompt." />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {ADD_PROMPT_ENGINES.map(engine => (
              <EngineCheckboxCard
                key={engine.id}
                engine={engine}
                checked={selectedEngines.has(engine.id)}
                onToggle={() => toggleEngine(engine.id)}
              />
            ))}
          </div>
        </section>

        {/* Primary: compact selection roster — capped so suggestions keep usable height */}
        <section className="shrink-0 rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-gray-100">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[14px] font-semibold text-gray-900 m-0">Your selection</p>
              <span className="shrink-0 text-[13px] font-semibold text-gray-700 tabular-nums">
                {totalSelected}
                <span className="text-gray-300 font-medium">/{MAX_TRACKED_PROMPTS}</span>
              </span>
            </div>
          </div>

          <div className="p-3 flex flex-col gap-1.5">
            {selectionRows.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 px-3 py-5 text-center">
                <p className="text-[13px] font-medium text-gray-700 m-0">No prompts yet</p>
                <p className="text-[12px] text-gray-500 m-0 mt-1">Add a prompt you already know — or grab one from suggestions below.</p>
              </div>
            ) : (
              <div
                ref={selectionListRef}
                className="max-h-[220px] overflow-y-auto flex flex-col gap-1.5 pr-0.5"
                style={{ scrollbarWidth: 'thin' }}
              >
                {selectionRows.map((p) => {
                  const isPending = p._kind === 'pending'
                  return (
                    <div
                      key={p.id}
                      className={`group flex items-center gap-2.5 rounded-lg border px-3 py-2 ${rowMotionClass(p.id)}`}
                    >
                      <p className="min-w-0 flex-1 text-[13px] font-medium text-gray-900 m-0 truncate">{p.prompt}</p>
                      <ModalTableRemoveButton
                        label={isPending ? 'Remove prompt' : 'Delete prompt'}
                        onClick={() => (isPending ? removePending(p.id) : deleteTracked(p.id))}
                      />
                    </div>
                  )
                })}
              </div>
            )}

            {!showAddForm ? (
              <button
                type="button"
                disabled={atCapacity}
                onClick={() => setShowAddForm(true)}
                className={`w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                  atCapacity
                    ? 'bg-white text-gray-300 border border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-800 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <Plus size={14} strokeWidth={2.25} />
                Add a prompt
              </button>
            ) : (
              <div className="rounded-lg border border-primary-300 bg-white p-3 flex flex-col gap-2.5">
                <div>
                  <p className="text-[13px] font-semibold text-gray-900 m-0">Add a prompt</p>
                  <p className="text-[12px] text-gray-500 m-0 mt-0.5">Type a buyer-intent prompt to track.</p>
                </div>
                <textarea
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault()
                      addCustomPrompt()
                    }
                  }}
                  placeholder="e.g. Best CRM for small businesses with AI search visibility"
                  rows={2}
                  disabled={atCapacity}
                  autoFocus
                  className={`${FORM_TEXTAREA_CLASS} min-h-[56px] disabled:bg-gray-50 disabled:text-gray-400`}
                />
                <div className="flex items-center justify-end gap-2">
                  <HLButton
                    variant="secondary"
                    color="gray"
                    size="sm"
                    onClick={() => { setShowAddForm(false); setCustomPrompt('') }}
                  >
                    Cancel
                  </HLButton>
                  <HLButton
                    variant="primary"
                    color="blue"
                    size="sm"
                    disabled={!canAddCustom}
                    onClick={addCustomPrompt}
                  >
                    Add
                  </HLButton>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Secondary: suggestions get the remaining modal height */}
        <section className="flex-1 min-h-[200px] flex flex-col">
          <div className="flex items-baseline gap-2 mb-2 shrink-0">
            <p className="text-[14px] font-semibold text-gray-900 m-0">Suggested prompts</p>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {selectableSuggestions.length === 0 ? (
              <p className="text-[12px] text-gray-400 m-0 py-2">No more suggestions.</p>
            ) : (
              <div className="flex flex-col gap-1.5 content-start">
                {selectableSuggestions.map(item => (
                  <button
                    key={item.prompt}
                    type="button"
                    disabled={atCapacity}
                    onClick={() => stagePrompt(item)}
                    className={`flex items-center gap-2.5 text-left rounded-lg border border-dashed px-3 py-2.5 transition-all outline-none focus:outline-none ${
                      atCapacity
                        ? 'border-gray-100 bg-white text-gray-300 cursor-not-allowed'
                        : 'border-gray-200 bg-white hover:border-primary-300'
                    }`}
                  >
                    <p className={`min-w-0 flex-1 text-[13px] font-medium m-0 line-clamp-2 ${atCapacity ? 'text-gray-300' : 'text-gray-900'}`}>
                      {item.prompt}
                    </p>
                    <span className={`text-[12px] font-semibold shrink-0 ${atCapacity ? 'text-gray-300' : 'text-primary-600'}`}>
                      Add
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </HLModal>
  )
}

// ── Competitors tab ─────────────────────────────────────────────────────────

function CompetitorsTabContent() {
  const [view, setView] = useState('Leaderboard')

  const me = COMPETITOR_LEADERBOARD.find(c => c.isMe)
  const leader = COMPETITOR_LEADERBOARD[0]

  const KPIS = [
    {
      label: 'Tracked brands',
      value: String(COMPETITOR_LEADERBOARD.length),
      Icon: Users,
      color: 'var(--primary-600)',
      help: 'Shows the total number of brands included in your competitive analysis. This is the group used to calculate rankings, Share of Voice, and other comparison metrics, so it defines who you’re measuring yourself against. More tracked brands provide broader competitive insights.',
    },
    {
      label: 'Your rank',
      value: `#${me.rank}`,
      Icon: Award,
      color: '#6938EF',
      help: 'Shows where your brand currently ranks among all tracked competitors based on overall AI visibility. It gives you a quick snapshot of your competitive position and how you’re performing relative to the rest of the market. A lower rank is better (#1 is best).',
    },
    {
      label: 'Leader visibility',
      value: String(leader.visibility),
      Icon: TrendingUp,
      color: '#16A34A',
      help: 'Shows the visibility score of the highest-ranking brand in your tracked competitor set. It serves as the benchmark for your category and helps you understand the level of visibility needed to become or remain the market leader. A higher score means a stronger competitive benchmark.',
    },
    {
      label: 'SoV gap',
      value: `${leader.sov - me.sov} pts`,
      Icon: BarChart3,
      color: '#D97706',
      help: 'Shows the difference in Share of Voice between your brand and the market leader. It helps you understand how much competitive visibility you need to gain before you match or overtake the leading brand. A smaller gap is better.',
    },
  ]

  return (
    <div className="px-5 pt-5 pb-5 flex flex-col gap-4">
      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-3">
        {KPIS.map(kpi => (
          <CountCard key={kpi.label} label={kpi.label} value={kpi.value} Icon={kpi.Icon} iconColor={kpi.color} helpContent={kpi.help} />
        ))}
      </div>

      {/* Competitor views */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="p-5 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-[15px] font-semibold text-gray-900 m-0">Competitor views</h3>
              <SectionInfoTip
                id="pt-competitor-views-info"
                content="This leaderboard shows how each brand performs across AI-generated answers. Compare visibility, share of voice, average position, and sentiment to identify who leads the conversation."
              />
            </div>
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
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="border-y border-gray-200 bg-gray-50">
                <th className="px-5 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap w-[70px]">Rank</th>
                <th className="px-5 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap">Brand</th>
                <th className="px-5 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap w-[180px]">Visibility</th>
                <th className="px-5 py-2.5 text-[12px] font-semibold text-gray-900 whitespace-nowrap w-[140px] text-center">Share of voice</th>
                <th className="px-5 py-2.5 text-[12px] font-semibold text-gray-900 whitespace-nowrap w-[124px] text-center">Avg position</th>
                <th className="px-5 py-2.5 text-[12px] font-semibold text-gray-900 whitespace-nowrap w-[108px] text-center">Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {COMPETITOR_LEADERBOARD.map(c => {
                const tone = competitorSentimentTone(c.sentiment)
                return (
                  <tr key={c.rank} className={`border-b border-gray-100 last:border-b-0 transition-colors ${c.isMe ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-5 py-3.5 text-[13px] font-medium text-gray-500">#{c.rank}</td>
                    <td className="px-5 py-3.5">
                      <CompetitorBrandCell c={c} showDomain />
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
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="border-y border-gray-200 bg-gray-50">
                <th className="px-5 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap w-[42%]">Brand</th>
                <th className="px-5 py-2.5 text-[12px] font-semibold text-gray-900 whitespace-nowrap w-[18%] text-right">AI mentions</th>
                <th className="px-5 py-2.5 text-[12px] font-semibold text-gray-900 whitespace-nowrap w-[20%] text-right">Source citations</th>
                <th className="px-5 py-2.5 text-[12px] font-semibold text-gray-900 whitespace-nowrap w-[20%] text-center">Citation rate</th>
              </tr>
            </thead>
            <tbody>
              {COMPETITOR_LEADERBOARD.map(c => {
                const rate = Math.round((c.citations / c.mentions) * 100)
                const rateColor = visibilityColor(rate)
                return (
                  <tr key={c.rank} className={`border-b border-gray-100 last:border-b-0 transition-colors ${c.isMe ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-5 py-3.5">
                      <CompetitorBrandCell c={c} />
                    </td>
                    <td className="px-5 py-3.5 text-right text-[15px] font-medium text-gray-900 tabular-nums">{c.mentions}</td>
                    <td className="px-5 py-3.5 text-right text-[15px] font-medium text-gray-900 tabular-nums">{c.citations}</td>
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
            <table className="w-full border-collapse table-fixed" style={{ minWidth: 720 }}>
              <thead>
                <tr className="border-y border-gray-200 bg-gray-50">
                  <th className="px-5 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap w-[220px]">Brand</th>
                  {COMPETITOR_TOPICS.map(t => (
                    <th key={t} className="px-5 py-2.5 text-center text-[12px] font-semibold text-gray-900 whitespace-nowrap">{t}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPETITOR_LEADERBOARD.map(c => (
                  <tr key={c.rank} className={`border-b border-gray-100 last:border-b-0 ${c.isMe ? 'bg-primary-50' : ''}`}>
                    <td className="px-5 py-3.5">
                      <CompetitorBrandCell c={c} />
                    </td>
                    {COMPETITOR_TOPICS.map((t, ti) => {
                      const score = competitorTopicScore(c.visibility, ti)
                      return (
                        <td key={t} className="px-5 py-3.5 text-center text-[13px] font-medium text-gray-900 tabular-nums">
                          {score}
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

const MAX_TRACKED_COMPETITORS = 5

// HARDCODED: AI-suggested competitors for the manage modal (prototyping)
const ADD_COMPETITOR_SUGGESTIONS = [
  { name: 'Keap', domain: 'keap.com', description: 'CRM and marketing automation frequently compared in AI answers.', visibility: 35, sov: 9 },
  { name: 'Monday CRM', domain: 'monday.com', description: 'Work management platform cited in small-business software roundups.', visibility: 28, sov: 6 },
  { name: 'Zoho CRM', domain: 'zoho.com', description: 'Often cited alongside mid-market CRM platforms in AI roundups.', visibility: 24, sov: 7 },
  { name: 'Pipedrive', domain: 'pipedrive.com', description: 'Sales CRM frequently compared for pipeline and deal tracking.', visibility: 41, sov: 11 },
]

function ManageCompetitorsModal({ onClose, onSave }) {
  const [trackedCompetitors, setTrackedCompetitors] = useState(() =>
    COMPETITOR_LEADERBOARD.slice(0, 3).map(c => ({ ...c })),
  )
  const [pendingCompetitors, setPendingCompetitors] = useState([])
  const [customBrand, setCustomBrand] = useState('')
  const [customWebsite, setCustomWebsite] = useState('')
  const [customCountry, setCustomCountry] = useState('United States')
  const [showAddForm, setShowAddForm] = useState(false)
  const { listRef: selectionListRef, markAdded, animateRemove, rowMotionClass } = useSelectionRowMotion()

  const totalSelected = trackedCompetitors.length + pendingCompetitors.length
  const atCapacity = totalSelected >= MAX_TRACKED_COMPETITORS

  function deleteTracked(domain) {
    animateRemove(domain, () => {
      setTrackedCompetitors(prev => prev.filter(c => c.domain !== domain))
    })
  }

  function stageCompetitor(item) {
    if (atCapacity) return
    if (trackedCompetitors.some(c => c.domain === item.domain)) return
    if (pendingCompetitors.some(c => c.domain === item.domain)) return
    const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    // Newest first — appears at top of Your selection
    setPendingCompetitors(prev => [{ ...item, id }, ...prev])
    markAdded(id)
  }

  function removePending(id) {
    animateRemove(id, () => {
      setPendingCompetitors(prev => prev.filter(c => c.id !== id))
    })
  }

  function addCustomCompetitor() {
    const name = customBrand.trim()
    const website = customWebsite.trim().replace(/^https?:\/\//i, '')
    if (!name || !website || atCapacity) return
    stageCompetitor({
      name,
      domain: website.split('/')[0],
      description: 'Custom competitor added for tracking.',
      visibility: 0,
      sov: 0,
      country: customCountry,
    })
    setCustomBrand('')
    setCustomWebsite('')
    setShowAddForm(false)
  }

  function handleSave() {
    onSave({ tracked: trackedCompetitors, pending: pendingCompetitors })
  }

  const stagedDomains = new Set([
    ...trackedCompetitors.map(c => c.domain),
    ...pendingCompetitors.map(c => c.domain),
  ])
  const availableSuggestions = ADD_COMPETITOR_SUGGESTIONS.filter(item => !stagedDomains.has(item.domain))
  const canAddCustom = Boolean(customBrand.trim() && customWebsite.trim()) && !atCapacity

  const selectionRows = [
    ...pendingCompetitors.map(c => ({ ...c, _kind: 'pending' })),
    ...trackedCompetitors.map(c => ({ ...c, _kind: 'tracked' })),
  ]

  return (
    <HLModal
      id="manage-competitors"
      width={880}
      height={MODAL_MANAGE_HEIGHT}
      headerDivider
      onClose={onClose}
      contentClassName="px-6 py-4 overflow-hidden flex flex-col"
      footerClassName="px-6 py-3.5"
      header={(
        <div className="px-6 pt-5 pb-3.5">
          <div className="flex items-center gap-2">
            <h2 id="manage-competitors-title" className={`${modalTitle} m-0`}>Manage competitors</h2>
            <SectionInfoTip content="Track up to five brands. Your selection is the source of truth — suggestions and custom adds fill open slots." />
          </div>
          <p className={`${modalSubtext} m-0 mt-1`}>
            Review what you’re tracking, add brands you care about, and optionally use suggestions to fill open slots.
          </p>
        </div>
      )}
      footer={(
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[12px] text-gray-400 m-0">
            {pendingCompetitors.length > 0
              ? `${pendingCompetitors.length} new competitor${pendingCompetitors.length === 1 ? '' : 's'} will start tracking on save.`
              : 'Changes will be applied to the next scan when you save.'}
          </p>
          <div className="flex items-center gap-2">
            <HLButton variant="secondary" color="gray" size="sm" onClick={onClose}>
              Cancel
            </HLButton>
            <HLButton variant="primary" color="blue" size="sm" onClick={handleSave}>
              Save and refresh results
            </HLButton>
          </div>
        </div>
      )}
    >
      <div className="flex-1 min-h-0 flex flex-col gap-4">
        {/* Primary: selection roster + add */}
        <section className="shrink-0 rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-3.5 border-b border-gray-100">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-gray-900 m-0">Your selection</p>
                <p className="text-[12px] text-gray-500 m-0 mt-1">
                  Brands in your competitive set for AI answers
                </p>
              </div>
              <span className="shrink-0 text-[13px] font-semibold text-gray-700 tabular-nums">
                {totalSelected}
                <span className="text-gray-300 font-medium">/{MAX_TRACKED_COMPETITORS}</span>
              </span>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-2">
            {selectionRows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">
                <p className="text-[13px] font-medium text-gray-700 m-0">No competitors yet</p>
                <p className="text-[12px] text-gray-500 m-0 mt-1">Add a brand you already know — or grab one from suggestions below.</p>
              </div>
            ) : (
              <div
                ref={selectionListRef}
                className="max-h-[220px] overflow-y-auto flex flex-col gap-2 pr-0.5"
                style={{ scrollbarWidth: 'thin' }}
              >
                {selectionRows.map((c) => {
                  const isPending = c._kind === 'pending'
                  const rowId = isPending ? c.id : c.domain
                  return (
                    <div
                      key={rowId}
                      className={`group flex items-center gap-3 rounded-xl border px-3.5 py-3 ${rowMotionClass(rowId)}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-[14px] font-semibold text-gray-900 m-0 truncate">{c.name}</p>
                          {c.isMe && (
                            <span className="shrink-0 text-[10px] font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded-md px-1.5 py-0.5">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-gray-500 m-0 mt-0.5 truncate">
                          {c.domain}
                          {c.visibility != null && c.visibility > 0 ? (
                            <span className="text-gray-400"> · Mentioned in {c.visibility}% of AI answers</span>
                          ) : null}
                        </p>
                      </div>
                      {(isPending || !c.isMe) && (
                        <ModalTableRemoveButton
                          label={isPending ? 'Remove competitor' : 'Delete competitor'}
                          onClick={() => (isPending ? removePending(c.id) : deleteTracked(c.domain))}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {!showAddForm ? (
              <button
                type="button"
                disabled={atCapacity}
                onClick={() => setShowAddForm(true)}
                className={`mt-1 w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl text-[13px] font-semibold transition-all ${
                  atCapacity
                    ? 'bg-white text-gray-300 border border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-800 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <Plus size={15} strokeWidth={2.25} />
                Add a competitor
              </button>
            ) : (
              <div className="mt-1 rounded-xl border border-primary-300 bg-white p-4 flex flex-col gap-3">
                <div>
                  <p className="text-[14px] font-semibold text-gray-900 m-0">Add a competitor</p>
                  <p className="text-[12px] text-gray-500 m-0 mt-0.5">Brand name, website, and country.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="manage-competitor-brand" className="block text-[12px] font-medium text-gray-500 mb-1.5">Brand name</label>
                    <HLInput
                      id="manage-competitor-brand"
                      size="sm"
                      value={customBrand}
                      onChange={e => setCustomBrand(e.target.value)}
                      placeholder="e.g. HubSpot"
                      disabled={atCapacity}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label htmlFor="manage-competitor-website" className="block text-[12px] font-medium text-gray-500 mb-1.5">Website</label>
                    <HLInput
                      id="manage-competitor-website"
                      size="sm"
                      prefixIcon={Globe}
                      value={customWebsite}
                      onChange={e => setCustomWebsite(e.target.value)}
                      placeholder="e.g. hubspot.com"
                      disabled={atCapacity}
                    />
                  </div>
                  <div>
                    <label htmlFor="manage-competitor-country" className="block text-[12px] font-medium text-gray-500 mb-1.5">Country</label>
                    <div className="relative">
                      <select
                        id="manage-competitor-country"
                        value={customCountry}
                        onChange={e => setCustomCountry(e.target.value)}
                        disabled={atCapacity}
                        className="w-full h-8 px-3 pr-8 bg-white border border-gray-300 rounded-lg text-[14px] text-gray-900 outline-none appearance-none focus:border-primary-600 transition-colors cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
                      >
                        {ADD_COMPETITOR_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={14} className="text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <HLButton
                    variant="secondary"
                    color="gray"
                    size="sm"
                    onClick={() => { setShowAddForm(false); setCustomBrand(''); setCustomWebsite('') }}
                  >
                    Cancel
                  </HLButton>
                  <HLButton
                    variant="primary"
                    color="blue"
                    size="sm"
                    disabled={!canAddCustom}
                    onClick={addCustomCompetitor}
                  >
                    Add
                  </HLButton>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Secondary: optional suggestions — fuller layout */}
        <section className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-baseline gap-2 mb-3 shrink-0">
            <p className="text-[14px] font-semibold text-gray-900 m-0">Suggested competitors</p>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {availableSuggestions.length === 0 ? (
              <p className="text-[12px] text-gray-400 m-0 py-2">No more suggestions.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 content-start">
                {availableSuggestions.map(item => (
                  <button
                    key={item.domain}
                    type="button"
                    disabled={atCapacity}
                    onClick={() => stageCompetitor(item)}
                    className={`flex items-center gap-3 text-left rounded-xl border border-dashed px-3.5 py-3 transition-all outline-none focus:outline-none ${
                      atCapacity
                        ? 'border-gray-200 bg-white text-gray-300 cursor-not-allowed'
                        : 'border-gray-300 bg-white hover:border-primary-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`text-[13px] font-semibold m-0 truncate ${atCapacity ? 'text-gray-300' : 'text-gray-900'}`}>
                        {item.name}
                      </p>
                      <p className={`text-[11px] m-0 mt-0.5 truncate ${atCapacity ? 'text-gray-300' : 'text-gray-500'}`}>
                        {item.domain}
                        {item.visibility > 0 ? ` · Mentioned in ${item.visibility}% of AI answers` : ''}
                      </p>
                    </div>
                    <span className={`text-[12px] font-semibold shrink-0 ${atCapacity ? 'text-gray-300' : 'text-primary-600'}`}>
                      Add
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </HLModal>
  )
}

// ── First-run lifecycle (setup → tracking → error → ready) ─────────────────

const MAX_SETUP_COMPETITORS = 5
const MAX_SETUP_PROMPTS = 10

const TRACKING_STAGES = [
  { at: 0,  msg: 'Pulling fresh prompt answers from tracked AI engines' },
  { at: 28, msg: 'Comparing answer visibility and citation coverage' },
  { at: 55, msg: 'Scoring competitor share of voice by prompt' },
  { at: 78, msg: 'Ranking engine-level performance signals' },
]

const TRACKING_ENGINES = [
  { name: 'Perplexity', color: '#20808D' },
  { name: 'Claude', color: '#D97706' },
  { name: 'Gemini', color: '#6938EF' },
]

// HARDCODED: AI-suggested competitors for first-run setup (prototyping)
const SETUP_COMPETITOR_SUGGESTIONS = [
  { name: 'Semrush', domain: 'semrush.com', category: 'SEO platform' },
  { name: 'Ahrefs', domain: 'ahrefs.com', category: 'SEO platform' },
  { name: 'Yext', domain: 'yext.com', category: 'Local listings' },
]

const SETUP_STEPS = [
  { id: 1, short: 'Brand', hint: 'Verify your brand' },
  { id: 2, short: 'Competitors', hint: 'Add competitors' },
  { id: 3, short: 'Prompts', hint: 'Add or select prompts' },
]

const SETUP_SELECT_CLASS =
  'w-full h-8 pl-9 pr-8 appearance-none rounded-lg border border-gray-300 bg-white text-[14px] text-gray-900 outline-none focus:border-primary-600 transition-colors cursor-pointer'

const PITCH_ENGINES = [
  { name: 'ChatGPT', Logo: ChatGptLogo },
  { name: 'Claude', Logo: ClaudeLogo },
  { name: 'Gemini', Logo: GeminiLogo },
  { name: 'Perplexity', Logo: PerplexityLogo },
]

const PITCH_DISCOVER_ITEMS = [
  {
    title: 'Where AI recommends you',
    body: 'See which AI assistants mention your business and where you\'re missing from the conversation.',
    Icon: Search,
    iconWrap: 'bg-purple-50 text-purple-600',
  },
  {
    title: 'Who\'s getting recommended instead',
    body: 'Compare your visibility with competitors across the same customer questions.',
    Icon: Award,
    iconWrap: 'bg-primary-50 text-primary-600',
  },
  {
    title: 'How to improve your visibility',
    body: 'Get prioritized recommendations that help AI recommend your business more often.',
    Icon: Sparkles,
    iconWrap: 'bg-success-50 text-success-600',
  },
]

const PITCH_WORKFLOW_STEPS = [
  { title: 'Review your report', Icon: FileText },
  { title: 'Compare with competitors', Icon: Users },
  { title: 'Improve your visibility', Icon: Sparkles },
  { title: 'Track your progress', Icon: TrendingUp },
]

const PITCH_REPORT_INCLUDES = [
  'AI recommendation visibility',
  'Competitor comparison',
  'Trusted sources influencing AI',
  'Content opportunities',
  'Citation opportunities',
  'Recommended improvements',
]

function competitorInitials(name) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'
}

function SetupProgressHeader({ activeStep, completed, onStepSelect }) {
  return (
    <div
      className="w-full shrink-0 px-5 sm:px-6 py-5 border-b border-gray-100 pt-setup-fade-up"
      style={{ animationDelay: '60ms' }}
      role="list"
      aria-label="Setup progress"
    >
      <div className="flex items-center w-full">
        {SETUP_STEPS.map((step, index) => {
          const isComplete = Boolean(completed[step.id]) && activeStep !== step.id
          const isCurrent = activeStep === step.id
          const canSelect = Boolean(onStepSelect) && (
            isCurrent
            || isComplete
            || (step.id === 1)
            || (step.id === 2 && completed[1])
            || (step.id === 3 && completed[2])
          )

          const stepInner = (
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-[13px] font-semibold tabular-nums shrink-0 transition-all duration-300 ${
                  isComplete
                    ? 'bg-success-600 text-white'
                    : isCurrent
                      ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                      : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}
              >
                {isComplete ? <Check size={14} strokeWidth={2.5} /> : step.id}
              </span>
              <div className="min-w-0 text-left">
                <p
                  className={`text-[13px] font-semibold m-0 leading-tight truncate ${
                    isCurrent || isComplete ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.short}
                </p>
                <p
                  className={`text-[12px] m-0 mt-0.5 leading-snug truncate ${
                    isCurrent
                      ? 'text-primary-600'
                      : isComplete
                        ? 'text-gray-500'
                        : 'text-gray-400'
                  }`}
                >
                  {step.hint}
                </p>
              </div>
            </div>
          )

          return (
            <div
              key={step.id}
              className={`flex items-center min-w-0 ${index < SETUP_STEPS.length - 1 ? 'flex-1' : 'shrink-0'}`}
              role="listitem"
              aria-current={isCurrent ? 'step' : undefined}
            >
              {canSelect ? (
                <button
                  type="button"
                  onClick={() => onStepSelect(step.id)}
                  className="min-w-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary-200 text-left"
                >
                  {stepInner}
                </button>
              ) : (
                <div className="min-w-0">
                  {stepInner}
                </div>
              )}
              {index < SETUP_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 sm:mx-4 rounded-full transition-colors duration-300 min-w-[1.25rem] ${
                    completed[step.id] ? 'bg-success-500' : 'bg-gray-200'
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PromptTrackingPitchPage({ onGetStarted }) {
  return (
    <div className="flex-1 min-h-0 overflow-hidden bg-gray-50 p-4 sm:p-5 xl:p-6 flex flex-col">
      <div className="w-full max-w-[1040px] mx-auto flex-1 min-h-0 flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative pt-setup-fade-up">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 55% 40% at 0% 0%, rgba(105,56,239,0.07), transparent 55%), radial-gradient(ellipse 40% 30% at 100% 0%, rgba(21,94,239,0.05), transparent 50%)',
          }}
          aria-hidden="true"
        />

        <div
          className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-8 sm:px-10 sm:py-10 flex flex-col gap-10 sm:gap-12"
          style={{ scrollbarGutter: 'stable' }}
        >
          {/* Hero */}
          <section>
            <div
              className="flex items-center mb-4"
              role="list"
              aria-label="Monitored AI engines"
            >
              {PITCH_ENGINES.map(({ name, Logo }, i) => (
                <span
                  key={name}
                  role="listitem"
                  title={name}
                  className={`relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-white border border-gray-200 shadow-xs ring-2 ring-white ${
                    i === 0 ? '' : '-ml-2.5'
                  }`}
                  style={{ zIndex: PITCH_ENGINES.length - i }}
                >
                  <Logo size={18} />
                  <span className="sr-only">{name}</span>
                </span>
              ))}
            </div>
            <div className="max-w-[720px]">
              <h1 className="text-[28px] sm:text-[34px] font-bold text-gray-900 m-0 leading-[1.25] tracking-tight">
                <span className="block whitespace-nowrap">
                  See when AI recommends <span className="text-primary-600">your business</span>
                </span>
                <span className="block mt-1 sm:mt-1.5">and when it recommends someone else.</span>
              </h1>
              <p className="text-[15px] text-gray-500 m-0 mt-3 leading-relaxed">
                <span className="block">Track the questions your customers ask AI, compare your visibility with competitors,</span>
                <span className="block">and discover exactly what to improve to appear in more AI answers.</span>
              </p>
            </div>
            <div className="mt-6">
              <HLButton variant="primary" color="blue" size="md" onClick={onGetStarted}>
                Get started
              </HLButton>
            </div>
          </section>

          {/* What you'll discover */}
          <section>
            <h2 className="text-[18px] font-semibold text-gray-900 m-0 mb-4">What you&apos;ll discover</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {PITCH_DISCOVER_ITEMS.map(({ title, body, Icon, iconWrap }, i) => (
                <div
                  key={title}
                  className="group flex flex-col h-full rounded-2xl border border-gray-200 bg-gradient-to-b from-purple-50/50 to-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                  style={{ animationDelay: `${60 + i * 40}ms` }}
                >
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${iconWrap}`}>
                    <Icon size={18} />
                  </span>
                  <p className="text-[15px] font-semibold text-gray-900 m-0 mt-4 leading-snug">{title}</p>
                  <p className="text-[13px] text-gray-500 m-0 mt-2 leading-relaxed flex-1">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How it works — process rail */}
          <section>
            <h2 className="text-[18px] font-semibold text-gray-900 m-0 mb-5">How it works</h2>
            <ol className="relative m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
              {/* Connector line (desktop) */}
              <div
                className="hidden lg:block absolute top-5 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-purple-200 via-primary-200 to-purple-200"
                aria-hidden="true"
              />
              {PITCH_WORKFLOW_STEPS.map(({ title, Icon }) => (
                <li key={title} className="relative flex flex-col items-center text-center gap-3">
                  <span className="relative z-[1] inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-purple-200 text-purple-600 shadow-sm">
                    <Icon size={18} />
                  </span>
                  <p className="text-[14px] font-semibold text-gray-900 m-0 leading-snug px-1">
                    {title}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {/* Your first report includes */}
          <section className="flex flex-col gap-4">
            <h2 className="text-[18px] font-semibold text-gray-900 m-0">Your first report includes</h2>
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50/90 to-white px-5 py-5 sm:px-6 sm:py-6">
              <ul className="m-0 p-0 list-none grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3.5">
                {PITCH_REPORT_INCLUDES.map(label => (
                  <li key={label} className="flex items-center gap-3 min-w-0">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-success-50 text-success-600 shrink-0">
                      <Check size={12} strokeWidth={2.5} />
                    </span>
                    <span className="text-[14px] font-medium text-gray-800 leading-snug">{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-1">
              <HLButton variant="primary" color="blue" size="md" onClick={onGetStarted}>
                Get started
              </HLButton>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function PromptTrackingInitialState({ onStart }) {
  const [setupStarted, setSetupStarted] = useState(false)
  const [brandName, setBrandName] = useState('Go High Level')
  const [brandWebsite, setBrandWebsite] = useState('https://gohighlevel.com')
  const [region, setRegion] = useState('United States')
  const [competitors, setCompetitors] = useState([])
  const [compName, setCompName] = useState('')
  const [compDomain, setCompDomain] = useState('')
  const [showCustomCompetitor, setShowCustomCompetitor] = useState(false)
  const [prompts, setPrompts] = useState([])
  const [customPrompt, setCustomPrompt] = useState('')
  const [showCustomPrompt, setShowCustomPrompt] = useState(false)
  // Prefill is ready on mount — land on competitors with brand collapsed as complete.
  const [activeStep, setActiveStep] = useState(2)
  const [step1Confirmed, setStep1Confirmed] = useState(true)
  const [step2Confirmed, setStep2Confirmed] = useState(false)
  const selectedPromptsListRef = useRef(null)

  const brandReady = brandName.trim().length > 0 && brandWebsite.trim().length > 0
  const canTrack = brandReady && prompts.length > 0
  const atCompLimit = competitors.length >= MAX_SETUP_COMPETITORS
  const atPromptLimit = prompts.length >= MAX_SETUP_PROMPTS

  const availablePrompts = ADD_PROMPT_SUGGESTIONS.filter(
    s => !prompts.some(p => p.prompt === s.prompt),
  ).slice(0, 8)

  useEffect(() => {
    if (prompts.length === 0 || !selectedPromptsListRef.current) return
    const el = selectedPromptsListRef.current
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [prompts.length])

  function focusStep(id) {
    if (id === 1) {
      setActiveStep(1)
      return
    }
    if (id === 2 && step1Confirmed && brandReady) {
      setActiveStep(2)
      return
    }
    if (id === 3 && step2Confirmed) {
      setActiveStep(3)
    }
  }

  function confirmBrand() {
    if (!brandReady) return
    setStep1Confirmed(true)
    setActiveStep(2)
  }

  function confirmCompetitors() {
    setStep2Confirmed(true)
    setActiveStep(3)
  }

  function toggleCompetitor(item) {
    if (competitors.some(c => c.domain === item.domain)) {
      setCompetitors(prev => prev.filter(c => c.domain !== item.domain))
      return
    }
    if (atCompLimit) return
    setCompetitors(prev => [...prev, item])
  }

  function addCustomCompetitor() {
    const name = compName.trim()
    const domain = compDomain.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '')
    if (!name || !domain || atCompLimit) return
    if (competitors.some(c => c.domain === domain)) return
    setCompetitors(prev => [...prev, {
      name,
      domain,
      category: 'Custom',
    }])
    setCompName('')
    setCompDomain('')
    setShowCustomCompetitor(false)
  }

  function addPrompt(item) {
    if (atPromptLimit) return
    if (prompts.some(p => p.prompt === item.prompt)) return
    setPrompts(prev => [...prev, item])
  }

  function addCustomPrompt() {
    const text = customPrompt.trim()
    if (!text || atPromptLimit) return
    addPrompt({ prompt: text, topic: 'Custom', volume: '—' })
    setCustomPrompt('')
    setShowCustomPrompt(false)
  }

  function closeCustomPrompt() {
    setShowCustomPrompt(false)
    setCustomPrompt('')
  }

  function removePrompt(text) {
    setPrompts(prev => prev.filter(p => p.prompt !== text))
  }

  function handleTrack() {
    if (!canTrack) return
    onStart({
      brandName: brandName.trim(),
      brandWebsite: brandWebsite.trim(),
      region,
      competitors,
      prompts,
      engines: TRACKING_ENGINES.map(e => e.name),
    })
  }

  const completed = {
    1: step1Confirmed && brandReady,
    2: step2Confirmed,
    3: false,
  }

  const brandStep = (
    <div className="flex flex-col min-h-0 flex-1 pt-setup-scale-in" key="step-1">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <h2 className="text-[16px] font-semibold text-gray-900 m-0">Confirm brand and region</h2>
        <p className="text-[13px] text-gray-500 m-0 mt-1.5 leading-relaxed">
          We match AI answers to your brand name and market — so visibility scores reflect where you actually sell.
        </p>
        <div className="flex flex-col gap-3.5 mt-5">
          <div>
            <label htmlFor="pt-setup-brand" className="block text-[12px] font-medium text-gray-500 mb-2">Brand name</label>
            <HLInput
              id="pt-setup-brand"
              size="sm"
              prefixIcon={Sparkles}
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
              placeholder="e.g. Go High Level"
            />
          </div>
          <div>
            <label htmlFor="pt-setup-website" className="block text-[12px] font-medium text-gray-500 mb-2">Brand website</label>
            <HLInput
              id="pt-setup-website"
              size="sm"
              prefixIcon={Globe}
              value={brandWebsite}
              onChange={e => setBrandWebsite(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label htmlFor="pt-setup-region" className="block text-[12px] font-medium text-gray-500 mb-2">Region</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
              <select
                id="pt-setup-region"
                value={region}
                onChange={e => setRegion(e.target.value)}
                className={SETUP_SELECT_CLASS}
              >
                {ADD_PROMPT_REGIONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
      <div className="shrink-0 pt-4 mt-4 border-t border-gray-100 flex items-center justify-end gap-3">
        <button
          type="button"
          disabled={!brandReady}
          onClick={confirmBrand}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-[13px] font-semibold transition-colors"
        >
          Continue
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )

  const competitorsStep = (
    <div className="flex flex-col min-h-0 flex-1 pt-setup-scale-in" key="step-2">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[16px] font-semibold text-gray-900 m-0">Who do you compete with?</h2>
          <p className="text-[13px] text-gray-400 m-0 tabular-nums shrink-0" aria-live="polite">
            {competitors.length}/{MAX_SETUP_COMPETITORS} selected
          </p>
        </div>

        <div className="flex items-center gap-2 mt-5 mb-2.5">
          <Sparkles size={13} className="text-purple-500/80 shrink-0" />
          <p className="text-[12px] font-medium text-gray-500 m-0">Recommended for you</p>
        </div>

        <div className="flex flex-col gap-2">
          {SETUP_COMPETITOR_SUGGESTIONS.map((s, i) => {
            const selected = competitors.some(c => c.domain === s.domain)
            return (
              <button
                key={s.domain}
                type="button"
                disabled={!selected && atCompLimit}
                onClick={() => toggleCompetitor(s)}
                aria-pressed={selected}
                className={`w-full flex items-center gap-3 text-left rounded-xl border px-3.5 py-3 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed outline-none focus:outline-none focus-visible:outline-none pt-setup-fade-up ${
                  selected
                    ? 'border-primary-600 bg-primary-50/40 focus-visible:border-primary-600'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60 focus-visible:border-primary-300'
                }`}
                style={{ animationDelay: `${60 + i * 40}ms` }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-gray-900 m-0 truncate">{s.name}</p>
                  <p className="text-[12px] text-gray-500 m-0 mt-0.5 truncate">{s.category}</p>
                </div>
                <span
                  className={`w-5 h-5 rounded-full inline-flex items-center justify-center shrink-0 border transition-all duration-200 ${
                    selected
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {selected && <Check size={11} strokeWidth={2.5} />}
                </span>
              </button>
            )
          })}
        </div>

        {competitors.filter(c => !SETUP_COMPETITOR_SUGGESTIONS.some(s => s.domain === c.domain)).length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            {competitors
              .filter(c => !SETUP_COMPETITOR_SUGGESTIONS.some(s => s.domain === c.domain))
              .map(c => (
                <div
                  key={c.domain}
                  className="flex items-center gap-3 rounded-xl border border-primary-600 bg-primary-50/40 px-3.5 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-gray-900 m-0 truncate">{c.name}</p>
                    <p className="text-[12px] text-gray-500 m-0 mt-0.5 truncate">{c.domain}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCompetitor(c)}
                    aria-label={`Remove ${c.name}`}
                    className="w-7 h-7 rounded-md text-gray-400 hover:text-error-600 hover:bg-error-50 inline-flex items-center justify-center transition-colors shrink-0"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
          </div>
        )}

        <div className="mt-3">
          {!showCustomCompetitor ? (
            <button
              type="button"
              onClick={() => setShowCustomCompetitor(true)}
              disabled={atCompLimit}
              className="w-full flex items-center gap-3 rounded-xl border border-primary-200 px-4 py-3.5 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed outline-none focus:outline-none group"
              style={{
                backgroundImage: 'linear-gradient(135deg, #EEF4FF 0%, #F4F3FF 55%, #F9F5FF 100%)',
              }}
            >
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/90 text-primary-600 border border-primary-100 shrink-0 shadow-xs">
                <Plus size={16} strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 m-0">Add another company</p>
                <p className="text-[12px] text-gray-500 m-0 mt-0.5">Enter a name and domain to track</p>
              </div>
            </button>
          ) : (
            <div className="rounded-xl border border-primary-300 bg-white p-3.5 flex flex-col gap-2.5 pt-setup-fade-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <HLInput
                  size="sm"
                  value={compName}
                  onChange={e => setCompName(e.target.value)}
                  placeholder="Competitor name"
                  autoFocus
                />
                <HLInput
                  size="sm"
                  value={compDomain}
                  onChange={e => setCompDomain(e.target.value)}
                  placeholder="Competitor URL"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <HLButton variant="secondary" color="gray" size="xs" onClick={() => { setShowCustomCompetitor(false); setCompName(''); setCompDomain('') }}>
                  Cancel
                </HLButton>
                <HLButton
                  variant="primary"
                  color="blue"
                  size="xs"
                  disabled={!compName.trim() || !compDomain.trim() || atCompLimit}
                  onClick={addCustomCompetitor}
                >
                  Add
                </HLButton>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <HLButton variant="secondary" color="gray" size="sm" onClick={() => setActiveStep(1)}>
          Back
        </HLButton>
        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={confirmCompetitors}
            className="text-[13px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={confirmCompetitors}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold transition-colors"
          >
            Continue
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )

  const promptsStep = (
    <div className="flex flex-col min-h-0 flex-1 pt-setup-scale-in" key="step-3">
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="shrink-0 flex items-center justify-between gap-4">
          <h2 className="text-[16px] font-semibold text-gray-900 m-0">Add prompts</h2>
          <div className="shrink-0 text-right" aria-live="polite">
            <p className="text-[18px] font-semibold text-gray-900 m-0 tabular-nums leading-none tracking-tight">
              {prompts.length}
              <span className="text-gray-300 font-medium">/{MAX_SETUP_PROMPTS}</span>
            </p>
            <p className="text-[11px] text-gray-400 m-0 mt-1">prompts</p>
          </div>
        </div>

        {prompts.length > 0 && (
          <div className="shrink-0 mt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[12px] font-semibold text-gray-900 m-0">
                Your selection
                <span className="ml-1.5 font-medium text-gray-400 tabular-nums">
                  {prompts.length} selected
                </span>
              </p>
              {prompts.length > 4 && (
                <p className="text-[11px] text-gray-400 m-0">Scroll to see all</p>
              )}
            </div>
            <div
              ref={selectedPromptsListRef}
              className="relative rounded-xl border border-primary-100 bg-primary-50/20 p-2 max-h-[200px] overflow-y-auto overscroll-contain flex flex-col gap-1.5"
              style={{ scrollbarWidth: 'thin' }}
              aria-label="Selected prompts"
            >
              {prompts.map((p, i) => (
                <div
                  key={p.prompt}
                  className="flex items-start gap-2 rounded-lg border border-primary-100 bg-white px-3 py-2 pt-setup-scale-in"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <span className="text-[11px] font-semibold text-primary-600 tabular-nums shrink-0 mt-0.5 w-4">
                    {i + 1}
                  </span>
                  <p className="text-[12px] text-gray-800 leading-snug m-0 flex-1 min-w-0 line-clamp-2">{p.prompt}</p>
                  <button
                    type="button"
                    onClick={() => removePrompt(p.prompt)}
                    className="w-6 h-6 rounded-md text-gray-400 hover:text-error-600 hover:bg-error-50 transition-colors inline-flex items-center justify-center shrink-0"
                    aria-label="Remove prompt"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 flex flex-col mt-4">
          <div className="shrink-0 flex items-center justify-between gap-3 mb-2">
            <p className="text-[12px] font-semibold text-gray-900 m-0">AI suggested prompts</p>
            {!showCustomPrompt && (
              <button
                type="button"
                disabled={atPromptLimit}
                onClick={() => setShowCustomPrompt(true)}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary-600 hover:text-primary-700 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={14} strokeWidth={2.25} />
                Add a prompt yourself
              </button>
            )}
          </div>

          {showCustomPrompt && (
            <div className="shrink-0 mb-3 rounded-xl border border-primary-200 bg-white px-3.5 py-3 pt-setup-fade-up">
              <p className="text-[12px] font-semibold text-gray-900 m-0 mb-2">Add a prompt yourself</p>
              <HLInput
                size="sm"
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomPrompt()
                  }
                }}
                placeholder="Type a buyer-intent question…"
                disabled={atPromptLimit}
                autoFocus
              />
              <div className="flex items-center justify-end gap-3 mt-2.5">
                <button
                  type="button"
                  onClick={closeCustomPrompt}
                  className="text-[12px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <HLButton
                  variant="primary"
                  color="blue"
                  size="sm"
                  disabled={!customPrompt.trim() || atPromptLimit}
                  onClick={addCustomPrompt}
                >
                  Add
                </HLButton>
              </div>
            </div>
          )}

          <div className="flex-1 min-h-0 rounded-xl border border-gray-200 overflow-y-auto divide-y divide-gray-100 bg-white">
            {availablePrompts.length === 0 ? (
              <p className="text-[12px] text-gray-400 m-0 px-3.5 py-4 text-center">All suggestions are in your selection.</p>
            ) : (
              availablePrompts.map((s, i) => (
                <div
                  key={s.prompt}
                  className="flex items-start gap-3 px-3.5 py-2.5 bg-white hover:bg-primary-50/40 transition-colors duration-200"
                  style={{ animationDelay: `${80 + i * 40}ms` }}
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] text-gray-400 tabular-nums">{s.volume}</span>
                    <p className="text-[12px] text-gray-800 leading-snug m-0 mt-0.5 line-clamp-2">{s.prompt}</p>
                  </div>
                  <button
                    type="button"
                    disabled={atPromptLimit}
                    onClick={() => addPrompt(s)}
                    className={`shrink-0 text-[12px] font-semibold transition-all duration-200 mt-0.5 ${
                      atPromptLimit ? 'text-gray-300 cursor-not-allowed' : 'text-primary-600 hover:text-primary-700'
                    }`}
                  >
                    Track
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {prompts.length === 0 && (
          <p className="shrink-0 text-[12px] text-gray-400 m-0 mt-3 text-center">Add at least one prompt to start tracking.</p>
        )}
      </div>

      <div className="shrink-0 pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <HLButton variant="secondary" color="gray" size="sm" onClick={() => setActiveStep(2)}>
          Back
        </HLButton>
        <button
          type="button"
          disabled={!canTrack}
          onClick={handleTrack}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-[13px] font-semibold transition-colors"
        >
          Track and show results
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )

  if (!setupStarted) {
    return <PromptTrackingPitchPage onGetStarted={() => setSetupStarted(true)} />
  }

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden relative bg-gray-50 p-4 sm:p-5 xl:p-6">
      <div className="min-h-0 min-w-0 flex-1 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs max-w-[880px] w-full mx-auto">
        <div className="shrink-0 px-5 sm:px-6 pt-4 pb-0">
          <button
            type="button"
            onClick={() => setSetupStarted(false)}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to overview
          </button>
        </div>
        <SetupProgressHeader
          activeStep={activeStep}
          completed={completed}
          onStepSelect={focusStep}
        />
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden p-4 sm:p-5">
          {activeStep === 1 && brandStep}
          {activeStep === 2 && competitorsStep}
          {activeStep === 3 && promptsStep}
        </div>
      </div>
    </div>
  )
}

// Shared shell for tracking progress + error so the error card replaces the
// loading card in the same spot — same padding, alignment, and column width.
const TRACKING_STATUS_SHELL =
  'flex-1 min-h-0 overflow-y-auto bg-gray-50 flex justify-center p-6'
const TRACKING_STATUS_COLUMN = 'w-full max-w-[760px] flex flex-col gap-4'

function PromptTrackingProgressView({ progress, setup }) {
  const brand = setup?.brandName || 'your brand'
  const promptCount = setup?.prompts?.length ?? PROMPTS_DATA.length
  const competitorCount = setup?.competitors?.length ?? 0
  const engineCount = setup?.engines?.length ?? TRACKING_ENGINES.length

  const activeStage = [...TRACKING_STAGES].reverse().find(s => progress >= s.at) || TRACKING_STAGES[0]
  const secondsLeft = Math.max(0, Math.round((100 - progress) / 100 * 22))
  const etaText = secondsLeft === 0 ? 'Almost done' : `About ${secondsLeft}s remaining`

  return (
    <div className={TRACKING_STATUS_SHELL} style={{ scrollbarGutter: 'stable' }}>
      <div className={TRACKING_STATUS_COLUMN}>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0 flex-1">
                <h1 className="text-[22px] font-bold text-gray-900 leading-snug m-0">
                  Refreshing AI rank tracking for {brand}
                </h1>
                <p className="text-[14px] text-gray-500 leading-relaxed m-0 mt-2 max-w-[480px]">
                  We are pulling fresh prompt answers, competitor visibility, citation coverage, and engine-level ranking data before reopening the dashboard.
                </p>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3.5 shrink-0 min-w-[180px]">
                <p className="text-[11px] font-semibold text-gray-400 m-0 mb-2.5">Refresh setup</p>
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: 'Prompts', value: promptCount },
                    { label: 'Competitors', value: competitorCount },
                    { label: 'AI engines', value: engineCount },
                    { label: 'Change type', value: 'First setup', strong: true },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between gap-4">
                      <span className="text-[12px] text-gray-500">{row.label}</span>
                      <span className={`text-[12px] tabular-nums ${row.strong ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-[13px] font-medium text-gray-700 m-0 leading-snug max-w-[420px]">
                  {activeStage.msg}
                </p>
                <span className="text-[18px] font-bold text-gray-900 tabular-nums shrink-0">{Math.round(progress)}%</span>
              </div>

              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, var(--purple-600) 0%, var(--primary-600) 100%)',
                  }}
                />
              </div>
              <p className="text-[12px] text-gray-400 m-0 mb-4">{etaText}</p>

              <div className="flex items-center gap-2 flex-wrap">
                {TRACKING_ENGINES.map(eng => (
                  <span
                    key={eng.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50"
                  >
                    <EngineLogo name={eng.name} size={12} chip={false} />
                    <span className="text-[12px] font-medium text-gray-700">{eng.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PromptTrackingErrorContent({ onRetry }) {
  // Same shell + column as PromptTrackingProgressView so the error replaces
  // the loading card with no layout shift (top-aligned in the same column).
  return (
    <div className={TRACKING_STATUS_SHELL} style={{ scrollbarGutter: 'stable' }}>
      <div className={TRACKING_STATUS_COLUMN}>
        <div className="bg-white border border-gray-200 rounded-xl px-8 py-9 flex flex-col items-center text-center w-full shadow-sm">
          <div className="w-14 h-14 rounded-full bg-error-50 flex items-center justify-center mb-5">
            <AlertTriangle size={26} className="text-error-600" />
          </div>
          <p className="text-[16px] font-semibold text-gray-900 mb-1.5">Tracking could not be completed</p>
          <p className="text-[14px] font-normal text-gray-500 leading-relaxed mb-6 max-w-[320px]">
            Prompt tracking ran into an error and couldn&apos;t finish. No visibility data was captured for this run.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="h-9 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold transition-colors"
          >
            Retry scan
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────

const PAGE_TABS = [
  { id: 'Overview',    label: 'Overview',    Icon: LayoutDashboard },
  { id: 'Prompts',     label: 'Prompts',     Icon: MessageCircle },
  { id: 'Sources',     label: 'Sources',     Icon: Globe         },
  { id: 'Competitors', label: 'Competitors', Icon: BarChart3     },
]

export default function PromptTrackingDashboard() {
  const [phase, setPhase] = useState(() => sessionStorage.getItem('pt_hasTracking') === '1' ? 'ready' : 'setup')
  const [activeTab, setActiveTab]       = useState('Overview')
  const [engineFilter, setEngineFilter] = useState('All AI engines')
  const [periodFilter, setPeriodFilter] = useState('Last 30 days')
  const [showManagePrompts, setShowManagePrompts] = useState(false)
  const [showManageCompetitors, setShowManageCompetitors] = useState(false)
  const [successToast, setSuccessToast] = useState(null)
  const [promptFromOverview, setPromptFromOverview] = useState(null)
  const [isTracking, setIsTracking] = useState(false)
  const [trackingProgress, setTrackingProgress] = useState(0)
  const [setupDraft, setSetupDraft] = useState(null)
  const toastTimer = useRef(null)
  const contentScrollRef = useRef(null)
  const trackingIntervalRef = useRef(null)
  // DEMO: first completed tracking run of the session fails; retry lands on ready.
  const trackingHasFailedRef = useRef(false)

  function openPromptInPromptsTab(prompt) {
    setPromptFromOverview(resolvePromptForDetail(prompt))
    setActiveTab('Prompts')
    requestAnimationFrame(() => scrollContentToTop(contentScrollRef))
  }

  function backToOverviewFromPrompt() {
    setPromptFromOverview(null)
    setActiveTab('Overview')
  }

  function handleStartTracking(draft) {
    setSetupDraft(draft || null)
    sessionStorage.setItem('pt_hasTracking', '1')
    setPhase('tracking')
    setIsTracking(true)
    setTrackingProgress(0)
  }

  function handleRetryTracking() {
    trackingHasFailedRef.current = true
    setPhase('ready')
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  useEffect(() => {
    if (!isTracking) return
    trackingIntervalRef.current = setInterval(() => {
      setTrackingProgress(p => {
        const step = p < 50 ? 1.8 : p < 80 ? 1.0 : 0.45
        return Math.min(100, p + step)
      })
    }, 80)
    return () => clearInterval(trackingIntervalRef.current)
  }, [isTracking])

  useEffect(() => {
    if (!isTracking || trackingProgress < 100) return
    clearInterval(trackingIntervalRef.current)
    const t = setTimeout(() => {
      setIsTracking(false)
      setTrackingProgress(0)
      if (!trackingHasFailedRef.current) {
        trackingHasFailedRef.current = true
        setPhase('error')
      } else {
        setPhase('ready')
      }
    }, 800)
    return () => clearTimeout(t)
  }, [trackingProgress, isTracking])

  function fireToast(message) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setSuccessToast(message)
    toastTimer.current = setTimeout(() => setSuccessToast(null), 5000)
  }

  function handleSavePrompt() {
    setShowManagePrompts(false)
    fireToast('Changes have been saved and will be applied to the next scan.')
  }

  function handleSaveCompetitor() {
    setShowManageCompetitors(false)
    fireToast('Changes have been saved and will be applied to the next scan.')
  }

  if (phase === 'setup') {
    return (
      <div className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">
        <PromptTrackingInitialState onStart={handleStartTracking} />
      </div>
    )
  }

  const trackingPct = Math.min(100, Math.round(trackingProgress))

  // Tracking + error: full canvas only — no page header (matches setup).
  // Both views share TRACKING_STATUS_SHELL so error replaces loading in-place.
  if (phase === 'tracking') {
    return (
      <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-gray-50">
        <PromptTrackingProgressView progress={trackingPct} setup={setupDraft} />
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-gray-50">
        <PromptTrackingErrorContent onRetry={handleRetryTracking} />
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-gray-50">

      <div className="bg-white border-b border-gray-200 shrink-0">
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
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('pt_hasTracking')
                trackingHasFailedRef.current = false
                setSetupDraft(null)
                setIsTracking(false)
                setTrackingProgress(0)
                setPromptFromOverview(null)
                setActiveTab('Overview')
                setPhase('setup')
              }}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 bg-white text-[12px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
            >
              Preview initial state
            </button>
          </div>
        </div>

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

        <div className="px-6 py-2 border-t border-gray-100 bg-white flex items-center justify-between gap-3 min-h-12">
          <div className="flex items-center gap-2">
            {activeTab !== 'Overview' && (
              <DarkDropdown value={engineFilter} onChange={setEngineFilter} options={ENGINE_OPTIONS} icon={Bot} variant="default" />
            )}
            <DarkDropdown value={periodFilter} onChange={setPeriodFilter} options={PERIOD_OPTIONS} icon={Clock} variant="active" dateRangeOption="Custom date range" />
          </div>
          {activeTab === 'Prompts' && (
            <button
              type="button"
              onClick={() => setShowManagePrompts(true)}
              className="inline-flex items-center justify-center h-8 px-3.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold transition-colors shadow-sm"
            >
              Manage prompts
            </button>
          )}
          {activeTab === 'Competitors' && (
            <button
              type="button"
              onClick={() => setShowManageCompetitors(true)}
              className="inline-flex items-center justify-center h-8 px-3.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold transition-colors shadow-sm"
            >
              Manage competitors
            </button>
          )}
        </div>
      </div>

      <div
        ref={contentScrollRef}
        className={`flex-1 min-h-0 ${activeTab === 'Prompts' || activeTab === 'Sources' ? 'overflow-hidden' : 'overflow-y-auto'}`}
        style={{ scrollbarGutter: 'stable' }}
      >
        {activeTab === 'Overview'    && <div className="px-5 pt-5 pb-5"><OverviewContent contentScrollRef={contentScrollRef} /></div>}
        {activeTab === 'Prompts'     && (
          <PromptsTabContent
            injectedPrompt={promptFromOverview}
            onInjectedBack={backToOverviewFromPrompt}
            contentScrollRef={contentScrollRef}
          />
        )}
        {activeTab === 'Sources'     && (
          <div className="h-full min-h-0 px-5 pt-5 pb-5">
            <SourceInventoryContent />
          </div>
        )}
        {activeTab === 'Competitors' && <CompetitorsTabContent />}
      </div>

      {showManagePrompts && (
        <ManagePromptsModal
          onClose={() => setShowManagePrompts(false)}
          onSave={handleSavePrompt}
        />
      )}

      {showManageCompetitors && (
        <ManageCompetitorsModal
          onClose={() => setShowManageCompetitors(false)}
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
