import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  TrendingUp, Globe, Search, Plus, MapPin, Link2,
  ChevronRight, ChevronDown, ExternalLink, MessageCircle, HelpCircle,
  LayoutList, Megaphone, Calendar, Sparkles, BarChart3, Award, ArrowUp,
  Users, ArrowLeft, Check, Bot, Star,
} from '../../icons/index.js'

// ── Sparkline ──────────────────────────────────────────────────────────────

function Sparkline({ data, color = '#6938EF', width = 80, height = 28, filled = false }) {
  const coordW = typeof width === 'number' ? width : 300
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const coords = data.map((v, i) => ({
    x: (i / (data.length - 1)) * coordW,
    y: height - ((v - min) / range) * (height - 6) - 3,
  }))
  const pts = coords.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const gradId = `sg-${color.replace('#', '')}-${coordW}`
  const areaPath = filled
    ? `M${coords[0].x.toFixed(1)},${coords[0].y.toFixed(1)} ` +
      coords.slice(1).map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') +
      ` L${coords[coords.length - 1].x.toFixed(1)},${height} L${coords[0].x.toFixed(1)},${height} Z`
    : null
  const svgProps = typeof width === 'string'
    ? { width: '100%', height, viewBox: `0 0 ${coordW} ${height}`, preserveAspectRatio: 'none' }
    : { width, height, viewBox: `0 0 ${coordW} ${height}` }
  return (
    <svg {...svgProps} className="overflow-visible block">
      {filled && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.20" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {filled && <path d={areaPath} fill={`url(#${gradId})`} />}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {filled && (
        <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r="3" fill={color} />
      )}
    </svg>
  )
}

// ── MultiLineChart ─────────────────────────────────────────────────────────

function MultiLineChart({ lines, xLabels, height = 180 }) {
  const PAD_L = 36, PAD_R = 12, PAD_T = 12, PAD_B = 28
  const VW = 580, VH = height
  const CW = VW - PAD_L - PAD_R
  const CH = VH - PAD_T - PAD_B
  const Y_TICKS = [0, 25, 50, 75, 100]

  function xP(i) { return PAD_L + (i / (xLabels.length - 1)) * CW }
  function yP(v) { return PAD_T + CH - (v / 100) * CH }

  return (
    <svg width="100%" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none">
      {Y_TICKS.map(y => (
        <g key={y}>
          <line x1={PAD_L} y1={yP(y)} x2={VW - PAD_R} y2={yP(y)} stroke="#E5E7EB" strokeWidth="1" />
          <text x={PAD_L - 6} y={yP(y) + 4} fontSize="10" fill="#9CA3AF" textAnchor="end">{y}</text>
        </g>
      ))}
      {xLabels.map((label, i) =>
        i % 2 === 0
          ? <text key={i} x={xP(i)} y={VH - 4} fontSize="10" fill="#9CA3AF" textAnchor="middle">{label}</text>
          : null
      )}
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

// ── Badges ─────────────────────────────────────────────────────────────────

function MentionBadge() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[11px] font-medium border border-purple-200">
      Mention
    </span>
  )
}

function LinkBadge() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-success-50 text-success-600 text-[11px] font-medium border border-success-200">
      Link
    </span>
  )
}

function TypeBadge({ type }) {
  return type === 'Link' ? <LinkBadge /> : <MentionBadge />
}

function EngineBadge({ label }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border border-gray-200 text-gray-600 bg-gray-50 whitespace-nowrap">
      {label}
    </span>
  )
}

function EngineList({ engines }) {
  const [first] = engines
  const overflow = engines.length - 1
  return (
    <div className="flex items-center gap-1 flex-nowrap">
      {first && <EngineBadge label={first.label} />}
      {overflow > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border border-gray-200 text-gray-500 bg-gray-50 whitespace-nowrap">
          +{overflow}
        </span>
      )}
    </div>
  )
}

function BrandPill({ name, highlight }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-medium ${
      highlight
        ? 'bg-purple-50 text-purple-600 border-purple-200'
        : 'bg-gray-50 text-gray-600 border-gray-200'
    }`}>
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
      <a
        ref={ref}
        href={href || '#'}
        onClick={e => e.preventDefault()}
        onMouseEnter={show}
        onMouseLeave={hide}
        className="flex items-center gap-1 text-[13px] text-primary-600 hover:underline min-w-0 w-full"
      >
        <span className="truncate block">{children}</span>
        <ExternalLink size={11} className="shrink-0" />
      </a>
      {pos && createPortal(
        <div
          onMouseEnter={() => setPos(pos)}
          onMouseLeave={hide}
          style={{ position: 'fixed', top: pos.top - 8, left: pos.left, transform: 'translateY(-100%)', zIndex: 9999, maxWidth: '480px' }}
          className="px-2.5 py-1.5 bg-gray-900 text-white text-[12px] rounded-md shadow-lg break-all leading-relaxed"
        >
          {children}
        </div>,
        document.body
      )}
    </>
  )
}

function TruncatedCell({ children, className = '' }) {
  const ref = useRef(null)
  const [pos, setPos] = useState(null)
  function show() {
    const el = ref.current
    if (el && el.scrollWidth > el.clientWidth) {
      const r = el.getBoundingClientRect()
      setPos({ top: r.top, left: r.left })
    }
  }
  function hide() { setPos(null) }
  return (
    <>
      <span ref={ref} onMouseEnter={show} onMouseLeave={hide} className={`truncate block cursor-default ${className}`}>
        {children}
      </span>
      {pos && createPortal(
        <div
          onMouseEnter={() => setPos(pos)}
          onMouseLeave={hide}
          style={{ position: 'fixed', top: pos.top - 8, left: pos.left, transform: 'translateY(-100%)', zIndex: 9999, maxWidth: '480px' }}
          className="px-2.5 py-1.5 bg-gray-900 text-white text-[12px] rounded-md shadow-lg break-words leading-relaxed"
        >
          {children}
        </div>,
        document.body
      )}
    </>
  )
}

// ── Column resizing ────────────────────────────────────────────────────────

function useColumnResize(initialWidths) {
  const [widths, setWidths] = useState(initialWidths)

  function onResizeStart(e, index) {
    e.preventDefault()
    const startX = e.clientX
    const startW = widths[index]

    function onMove(ev) {
      const next = [...widths]
      next[index] = Math.max(40, startW + (ev.clientX - startX))
      setWidths(next)
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return { widths, onResizeStart }
}

function ResizeHandle({ onMouseDown }) {
  return (
    <div
      onMouseDown={onMouseDown}
      style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '5px', cursor: 'col-resize', zIndex: 1 }}
      className="group/handle flex items-stretch"
      onClick={e => e.stopPropagation()}
    >
      <div className="w-0.5 mx-auto opacity-0 group-hover/handle:opacity-100 bg-primary-400 transition-opacity rounded-full" />
    </div>
  )
}

function BrandsCell({ brands, extraBrands = 0 }) {
  const chipRef = useRef(null)
  const [pos, setPos] = useState(null)

  const visible = brands.slice(0, 2)
  const hidden = brands.slice(2)
  const overflowCount = hidden.length + extraBrands

  function showTooltip() {
    const r = chipRef.current?.getBoundingClientRect()
    if (r) setPos({ top: r.top, left: r.left })
  }
  function hideTooltip() { setPos(null) }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visible.map(b => <BrandPill key={b} name={b} highlight={b === 'Gohighlevel'} />)}
      {overflowCount > 0 && (
        <>
          <span
            ref={chipRef}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            className="inline-flex items-center px-2 py-0.5 rounded border border-gray-300 text-[11px] font-medium text-gray-600 bg-gray-50 cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors select-none"
          >
            +{overflowCount}
          </span>
          {pos && createPortal(
            <div
              onMouseEnter={() => setPos(pos)}
              onMouseLeave={hideTooltip}
              style={{ position: 'fixed', top: pos.top - 8, left: pos.left, transform: 'translateY(-100%)', zIndex: 9999 }}
              className="flex flex-col gap-1.5 bg-white border border-gray-200 rounded-lg shadow-lg p-2.5 min-w-[148px]"
            >
              {hidden.map(b => (
                <span key={b} className="inline-flex items-center px-2 py-0.5 rounded border border-gray-200 text-[11px] font-medium text-gray-600 bg-gray-50">
                  {b}
                </span>
              ))}
              {extraBrands > 0 && (
                <span className="text-[11px] text-gray-400 px-1">+{extraBrands} more</span>
              )}
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  )
}

// ── Data ───────────────────────────────────────────────────────────────────

const COMPETITOR_COLORS = ['#6938EF', '#16A34A', '#2563EB', '#D97706', '#DC2626', '#4F46E5']

const KPI_CARDS = [
  { label: 'Brand presence',         value: '418',   change: '8.2%',  up: true,  data: [260, 290, 330, 365, 395, 418],             color: '#6938EF', Icon: Award    },
  { label: 'AI opportunity traffic', value: '12.4K', change: '12.8%', up: true,  data: [8200, 9100, 9800, 10600, 11400, 12400],    color: '#2563EB', Icon: BarChart3 },
  { label: 'Link presence',          value: '137',   change: '5.7%',  up: true,  data: [105, 112, 118, 124, 130, 137],             color: '#16A34A', Icon: Link2     },
  { label: 'Average position',       value: '5.3',   change: '0.8',   up: false, data: [6.1, 6.0, 5.8, 5.6, 5.4, 5.3],           color: '#D97706', Icon: TrendingUp },
  { label: 'Organic traffic',        value: '90.4K', change: '3.4%',  up: true,  data: [82000, 84000, 86000, 87500, 89200, 90400], color: '#E11D48', Icon: Globe     },
]

const COMPETITORS = [
  { name: 'Gohighlevel',    domain: 'gohighlevel.com',    pct: 14.20, color: '#6938EF' },
  { name: 'HubSpot',        domain: 'hubspot.com',        pct: 22.80, color: '#16A34A' },
  { name: 'ActiveCampaign', domain: 'activecampaign.com', pct: 18.60, color: '#2563EB' },
  { name: 'ClickFunnels',   domain: 'clickfunnels.com',   pct: 15.90, color: '#D97706' },
  { name: 'Klaviyo',        domain: 'klaviyo.com',        pct: 12.70, color: '#DC2626' },
  { name: 'Keap',           domain: 'keap.com',           pct: 11.40, color: '#4F46E5' },
]

const AI_ENGINES = [
  { name: 'AI overview', subtitle: 'AI overview', pct: 49, color: '#6938EF' },
  { name: 'AI mode',     subtitle: 'AI mode',     pct: 22, color: '#16A34A' },
  { name: 'Gemini',      subtitle: 'Gemini',      pct: 28, color: '#2563EB' },
  { name: 'ChatGPT',     subtitle: 'ChatGPT',     pct: 18, color: '#D97706' },
  { name: 'Perplexity',  subtitle: 'Perplexity',  pct: 20, color: '#DC2626' },
]

const TOPIC_PRESENCE = [
  { topic: 'Marketing automation for agencies',        scores: [48.60, 63.20, 57.40, 51.10, 44.50, 39.80] },
  { topic: 'CRM and pipeline automation',              scores: [52.40, 66.90, 61.70, 47.30, 38.20, 42.90] },
  { topic: 'Lead capture and funnel builder',          scores: [46.10, 39.80, 31.50, 58.70, 24.40, 27.80] },
  { topic: 'Appointment scheduling and calendar sync', scores: [41.80, 34.60, 29.40, 18.70, 22.90, 37.10] },
  { topic: 'SMS and omnichannel follow-up',            scores: [38.70, 27.60, 31.20, 16.40, 49.10, 24.80] },
]

const OVERVIEW_KPI_CARDS = [
  { label: 'Visibility score',  value: '70/100', change: '+6 vs prior period', up: true,  sub: null,                  Icon: Award,      color: '#6938EF' },
  { label: 'Competitive rank',  value: '#3 / 7', change: null,                 up: null,  sub: '— Latest period rank', Icon: Users,      color: '#2563EB' },
  { label: 'Avg position',      value: '#2.9',   change: '0.6 pts better',     up: true,  sub: null,                  Icon: TrendingUp,  color: '#16A34A' },
  { label: 'Citation rate',     value: '49%',    change: '+5.7 pp',            up: true,  sub: null,                  Icon: Link2,       color: '#D97706' },
]

const OVERVIEW_METRICS = [
  { label: 'Presence rate',                value: '61%',      desc: 'Brand appears within answered prompt blocks.' },
  { label: 'Share of voice',               value: '15%',      desc: 'Share of detected brand mentions across answers.' },
  { label: 'Net sentiment',                value: '+11',      desc: 'Positive vs negative brand framing.' },
  { label: 'Google AI overview coverage',  value: '62%',      desc: 'How often Google shows an AI Overview for the tracked prompts.' },
  { label: 'Answer density',               value: '6.8 URLs', desc: '2.4 brand mentions per answer.' },
  { label: 'SOV gap to leader',            value: '9 pts',    desc: 'Share-of-voice distance from the leading brand.' },
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
  { name: 'Perplexity',  abbr: 'P',  color: '#1E40AF', bg: '#EFF6FF', sub: 'US · English · 12 prompts', vis: 76, presence: '69.0%', avgPos: '#2.3', urlsAnswer: '6.4 URLs / answer', citRate: '58.0%', insight: 'Best current engine for mention depth and citation pickup.' },
  { name: 'Claude',      abbr: 'C',  color: '#7C3AED', bg: '#F5F3FF', sub: 'US · English · 12 prompts', vis: 71, presence: '63.0%', avgPos: '#2.9', urlsAnswer: '5.1 URLs / answer', citRate: '47.0%', insight: 'Visibility is present, but citations still lag the strongest engines.' },
  { name: 'Gemini',      abbr: 'G',  color: '#1D4ED8', bg: '#EFF6FF', sub: 'US · English · 12 prompts', vis: 64, presence: '56.0%', avgPos: '#3.7', urlsAnswer: '4.8 URLs / answer', citRate: '41.0%', insight: 'Brand named often enough, but answer prominence is still uneven.' },
  { name: 'AI Mode',     abbr: 'AM', color: '#0D9488', bg: '#F0FDFA', sub: 'US · English · 12 prompts', vis: 68, presence: '61.0%', avgPos: '#3.1', urlsAnswer: '5.3 URLs / answer', citRate: '46.0%', insight: 'Strong middle-of-answer pickup with room to improve citation consistency.' },
  { name: 'AI Overview', abbr: 'AO', color: '#16A34A', bg: '#F0FDF4', sub: 'US · English · 12 prompts', vis: 73, presence: '65.0%', avgPos: '#2.6', urlsAnswer: '5.0 URLs / answer', citRate: '52.0%', insight: 'Strongly tied to your organic rankings — keep traditional SEO healthy.' },
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
    { label: 'Go High Level', color: '#2563EB', data: [82,83,82,84,83,85,84,86,85,87,86,88,87,90] },
    { label: 'HubSpot',       color: '#EF4444', data: [97,97,98,98,99,98,99,99,100,99,100,100,99,100] },
    { label: 'Calendly',      color: '#06B6D4', data: [78,79,79,80,79,81,80,82,81,82,83,82,83,84] },
    { label: 'Pipedrive',     color: '#6B7280', data: [70,71,70,72,71,73,72,74,73,75,74,75,76,78] },
  ],
  Mentions: [
    { label: 'Go High Level', color: '#2563EB', data: [54,58,55,61,57,63,59,65,58,62,60,67,63,69] },
    { label: 'HubSpot',       color: '#EF4444', data: [82,80,84,83,87,85,88,86,90,89,88,91,90,92] },
    { label: 'Calendly',      color: '#06B6D4', data: [71,73,70,75,72,74,76,73,78,75,77,79,76,80] },
    { label: 'Pipedrive',     color: '#6B7280', data: [38,36,40,37,35,39,33,37,34,32,36,31,33,30] },
  ],
  Citations: [
    { label: 'Go High Level', color: '#2563EB', data: [31,29,33,35,32,38,36,40,37,43,41,46,44,49] },
    { label: 'HubSpot',       color: '#EF4444', data: [76,74,78,76,79,77,81,79,82,80,83,81,84,82] },
    { label: 'Calendly',      color: '#06B6D4', data: [58,60,57,62,59,64,61,66,63,65,67,64,68,66] },
    { label: 'Pipedrive',     color: '#6B7280', data: [18,20,17,22,19,16,21,18,15,19,17,14,16,13] },
  ],
}

const DETAIL_X_LABELS = ['May 22','May 24','May 26','May 28','May 30','Jun 1','Jun 3','Jun 5','Jun 7','Jun 9','Jun 11','Jun 13','Jun 15','Jun 17','Jun 18']

const DETAIL_TREND_LINES = [
  { label: 'Perplexity', color: '#1E40AF', data: [76,78,80,81,82,83,84,86,87,88,90,91,93,95,97] },
  { label: 'Claude',     color: '#7C3AED', data: [72,74,75,76,77,78,79,80,80,81,82,82,83,83,83] },
  { label: 'Gemini',     color: '#2563EB', data: [65,67,68,69,70,71,72,73,74,74,75,76,76,77,77] },
  { label: 'AI Mode',    color: '#059669', data: [65,66,68,68,69,70,71,72,73,73,74,75,75,76,77] },
]

const AI_RESPONSES_DATA = [
  { engine: 'AI Mode', abbr: 'AM', color: '#0D9488', status: 'Succeeded', text: 'Direct answer: Go High Level is visible for this prompt, but the response quality depends on whether the engine can find clear proof, strong source pages, and structured comparisons.', brands: ['Gohighlevel', 'Calendly', 'HubSpot'], sources: 1, created: 'Jun 18, 2026' },
  { engine: 'Claude',  abbr: 'C',  color: '#7C3AED', status: 'Succeeded', text: 'Direct answer: Go High Level is visible for this prompt, but the response quality depends on whether the engine can find clear proof, strong source pages, and structured comparisons.', brands: ['Gohighlevel', 'HubSpot', 'Calendly'], sources: 1, created: 'Jun 18, 2026' },
  { engine: 'Gemini',  abbr: 'G',  color: '#1D4ED8', status: 'Succeeded', text: 'Direct answer: Go High Level is visible for this prompt, but the response quality depends on whether the engine can find clear proof, strong source pages, and structured comparisons.', brands: ['HubSpot', 'Gohighlevel', 'Calendly'], sources: 1, created: 'Jun 18, 2026' },
]

const PROMPT_SOURCES_DATA = [
  { url: 'https://www.capterra.com/p/209198/GoHighLevel/', avgPos: '#1.5', coverage: '19%', seenInChats: 112, brandMentioned: true,  otherBrands: true,  lastSeen: 'Apr 28, 2026' },
  { url: 'https://gohighlevel.com/pricing',               avgPos: '#1.0', coverage: '25%', seenInChats: 56,  brandMentioned: true,  otherBrands: false, lastSeen: 'Jun 19, 2026' },
]

const PROMPT_TOPICS = [
  {
    id: 1,
    topic: 'Marketing automation for agencies',
    size: '15.9K', prompts: 142,
    types: ['Mention', 'Link'],
    presence: '96 (68.00%)', brands: 12,
    engines: [
      { abbr: 'AO', label: 'AI overview', color: '#0891B2' },
      { abbr: 'G',  label: 'Gemini',      color: '#1D4ED8' },
      { abbr: 'CG', label: 'ChatGPT',     color: '#16A34A' },
    ],
    children: [
      {
        id: 11,
        prompt: 'Best CRM for agencies that need pipeline automation and client communication',
        type: 'Link',
        brands: ['HubSpot', 'Gohighlevel', 'ActiveCampaign', 'ClickFunnels', 'Klaviyo', 'Keap', 'Salesforce', 'Pipedrive'],
        extraBrands: 0,
        engine: { abbr: 'AO', label: 'AI overview', color: '#0891B2' },
      },
      {
        id: 12,
        prompt: 'What platform combines CRM, funnels, and automations for agencies?',
        type: 'Mention',
        brands: ['Gohighlevel', 'ClickFunnels', 'HubSpot', 'ActiveCampaign', 'Marketo', 'Infusionsoft', 'Salesforce'],
        extraBrands: 0,
        engine: { abbr: 'CG', label: 'ChatGPT', color: '#16A34A' },
      },
    ],
  },
  {
    id: 2,
    topic: 'CRM and pipeline automation',
    size: '12.4K', prompts: 128,
    types: ['Mention', 'Link'],
    presence: '82 (64.00%)', brands: 10,
    engines: [
      { abbr: 'G',  label: 'Gemini',     color: '#1D4ED8' },
      { abbr: 'CG', label: 'ChatGPT',    color: '#16A34A' },
      { abbr: 'PX', label: 'Perplexity', color: '#D97706' },
    ],
    children: [
      {
        id: 21,
        prompt: 'Best CRM for small businesses that need automation and texting',
        type: 'Link',
        brands: ['HubSpot', 'Gohighlevel', 'Klaviyo', 'ActiveCampaign', 'Pipedrive', 'Salesforce'],
        extraBrands: 3,
        engine: { abbr: 'G', label: 'Gemini', color: '#1D4ED8' },
      },
      {
        id: 22,
        prompt: 'How to automate lead follow-up inside a CRM?',
        type: 'Mention',
        brands: ['Gohighlevel', 'HubSpot', 'Salesforce', 'ActiveCampaign', 'Pipedrive'],
        extraBrands: 4,
        engine: { abbr: 'PX', label: 'Perplexity', color: '#D97706' },
      },
    ],
  },
  {
    id: 3,
    topic: 'Lead capture and funnel builder',
    size: '10.8K', prompts: 118,
    types: ['Mention', 'Link'],
    presence: '71 (60.00%)', brands: 9,
    engines: [
      { abbr: 'AM', label: 'AI mode',  color: '#0D9488' },
      { abbr: 'CG', label: 'ChatGPT', color: '#16A34A' },
      { abbr: 'G',  label: 'Gemini',  color: '#1D4ED8' },
    ],
    children: [
      {
        id: 31,
        prompt: 'What tool is best for landing pages, funnels, and automated lead capture?',
        type: 'Link',
        brands: ['ClickFunnels', 'Gohighlevel', 'HubSpot', 'Mailchimp', 'Unbounce', 'Leadpages'],
        extraBrands: 2,
        engine: { abbr: 'AM', label: 'AI mode', color: '#0D9488' },
      },
      {
        id: 32,
        prompt: 'Best software to build sales funnels for local businesses',
        type: 'Mention',
        brands: ['Gohighlevel', 'ClickFunnels', 'Kartra', 'HubSpot'],
        extraBrands: 2,
        engine: { abbr: 'CG', label: 'ChatGPT', color: '#16A34A' },
      },
    ],
  },
  {
    id: 4,
    topic: 'Appointment scheduling and calendar sync',
    size: '8.1K', prompts: 91,
    types: ['Mention', 'Link'],
    presence: '52 (57.00%)', brands: 8,
    engines: [
      { abbr: 'CG', label: 'ChatGPT',    color: '#16A34A' },
      { abbr: 'PX', label: 'Perplexity', color: '#D97706' },
    ],
    children: [
      {
        id: 41,
        prompt: 'Best appointment scheduling tools for small business owners',
        type: 'Link',
        brands: ['Calendly', 'Gohighlevel', 'Acuity', 'HubSpot', 'Setmore'],
        extraBrands: 2,
        engine: { abbr: 'CG', label: 'ChatGPT', color: '#16A34A' },
      },
      {
        id: 42,
        prompt: 'How to sync appointments across Google Calendar and a CRM?',
        type: 'Mention',
        brands: ['Gohighlevel', 'Calendly', 'HubSpot', 'Pipedrive'],
        extraBrands: 3,
        engine: { abbr: 'PX', label: 'Perplexity', color: '#D97706' },
      },
    ],
  },
  {
    id: 5,
    topic: 'SMS and omnichannel follow-up',
    size: '14.7K', prompts: 77,
    types: ['Mention', 'Link'],
    presence: '41 (53.00%)', brands: 7,
    engines: [
      { abbr: 'CG', label: 'ChatGPT',    color: '#16A34A' },
      { abbr: 'G',  label: 'Gemini',     color: '#1D4ED8' },
      { abbr: 'AO', label: 'AI overview', color: '#0891B2' },
    ],
    children: [
      {
        id: 51,
        prompt: 'Best tools for SMS marketing and automated follow-up sequences',
        type: 'Mention',
        brands: ['Gohighlevel', 'Klaviyo', 'ActiveCampaign', 'Twilio'],
        extraBrands: 3,
        engine: { abbr: 'CG', label: 'ChatGPT', color: '#16A34A' },
      },
      {
        id: 52,
        prompt: 'How do agencies manage multi-channel outreach for clients?',
        type: 'Link',
        brands: ['Gohighlevel', 'HubSpot', 'ActiveCampaign', 'Mailchimp'],
        extraBrands: 2,
        engine: { abbr: 'G', label: 'Gemini', color: '#1D4ED8' },
      },
    ],
  },
]

const CITING_DOMAINS_DATA = [
  {
    id: 1, domain: 'help.gohighlevel.com', pages: 453, citations: '1.1K',
    types: ['Mention', 'Link'], coMention: '1.07K (97.3%)', dt: 92,
    orgTraffic: '4.4K', topics: 'CRM and pipeline automation +4',
    children: [
      { page: 'https://www.gohighlevel.com/small-business-crm',  pageCitations: 27, type: 'Link', coMention: '22 (81.5%)', pt: 32, orgTraffic: '2400', topic: 'CRM and pipeline automation' },
      { page: 'https://www.gohighlevel.com/funnels-and-websites', pageCitations: 21, type: 'Link', coMention: '18 (85.7%)', pt: 29, orgTraffic: '1700', topic: 'Lead capture and funnel builder' },
    ],
  },
  {
    id: 2, domain: 'www.gohighlevel.com', pages: 134, citations: '484',
    types: ['Mention', 'Link'], coMention: '463 (95.7%)', dt: 92,
    orgTraffic: '90.4K', topics: 'Lead capture and funnel builder +4',
    children: [
      { page: 'https://www.gohighlevel.com/features/crm',           pageCitations: 38, type: 'Link',    coMention: '36 (94.7%)', pt: 88, orgTraffic: '12.4K', topic: 'CRM and pipeline automation' },
      { page: 'https://www.gohighlevel.com/features/funnels',        pageCitations: 29, type: 'Link',    coMention: '27 (93.1%)', pt: 74, orgTraffic: '9.8K',  topic: 'Lead capture and funnel builder' },
      { page: 'https://www.gohighlevel.com/features/email-marketing', pageCitations: 22, type: 'Mention', coMention: '21 (95.5%)', pt: 61, orgTraffic: '7.2K',  topic: 'Marketing automation for agencies' },
    ],
  },
  {
    id: 3, domain: 'zapier.com', pages: 94, citations: '168.6K',
    types: ['Mention', 'Link'], coMention: '291 (17.0%)', dt: 96,
    orgTraffic: '1.4M', topics: 'Marketing automation for agencies +4',
    children: [
      { page: 'https://zapier.com/blog/agency-automation-guide/',  pageCitations: 19, type: 'Mention', coMention: '7 (36.8%)', pt: 41, orgTraffic: '6400', topic: 'Marketing automation for agencies' },
      { page: 'https://zapier.com/apps/gohighlevel/integrations',  pageCitations: 14, type: 'Link',    coMention: '5 (35.7%)', pt: 38, orgTraffic: '4200', topic: 'CRM and pipeline automation' },
    ],
  },
  {
    id: 4, domain: 'www.g2.com', pages: 312, citations: '2.1M',
    types: ['Mention', 'Link'], coMention: '384 (18.3%)', dt: 94,
    orgTraffic: '3.2M', topics: 'CRM and pipeline automation +4',
    children: [
      { page: 'https://www.g2.com/categories/crm',                pageCitations: 61, type: 'Mention', coMention: '22 (36.1%)', pt: 96, orgTraffic: '148K', topic: 'CRM and pipeline automation' },
      { page: 'https://www.g2.com/products/gohighlevel/reviews',   pageCitations: 44, type: 'Link',    coMention: '18 (40.9%)', pt: 91, orgTraffic: '82K',  topic: 'Marketing automation for agencies' },
      { page: 'https://www.g2.com/compare/gohighlevel-vs-hubspot', pageCitations: 31, type: 'Mention', coMention: '12 (38.7%)', pt: 87, orgTraffic: '56K',  topic: 'CRM and pipeline automation' },
    ],
  },
  {
    id: 5, domain: 'www.youtube.com', pages: 4500, citations: '56.2M',
    types: ['Mention', 'Link'], coMention: '2.69K (4.8%)', dt: 100,
    orgTraffic: '1.3B', topics: 'Marketing automation for agencies +4',
    children: [
      { page: 'https://www.youtube.com/watch?v=crm-roundup-2026',        pageCitations: 14, type: 'Link',    coMention: '4 (28.6%)', pt: 30, orgTraffic: '75', topic: 'CRM and pipeline automation' },
      { page: 'https://www.youtube.com/watch?v=agency-automation-stack', pageCitations: 11, type: 'Mention', coMention: '3 (27.3%)', pt: 26, orgTraffic: '42', topic: 'Marketing automation for agencies' },
    ],
  },
  {
    id: 6, domain: 'www.capterra.com', pages: 188, citations: '1.6M',
    types: ['Mention', 'Link'], coMention: '244 (15.3%)', dt: 91,
    orgTraffic: '2.6M', topics: 'Lead capture and funnel builder +4',
    children: [
      { page: 'https://www.capterra.com/crm-software/',                   pageCitations: 52, type: 'Mention', coMention: '18 (34.6%)', pt: 88, orgTraffic: '94K', topic: 'CRM and pipeline automation' },
      { page: 'https://www.capterra.com/marketing-automation-software/',   pageCitations: 38, type: 'Mention', coMention: '14 (36.8%)', pt: 84, orgTraffic: '71K', topic: 'Marketing automation for agencies' },
      { page: 'https://www.capterra.com/p/207345/GoHighLevel/',            pageCitations: 27, type: 'Link',    coMention: '11 (40.7%)', pt: 79, orgTraffic: '48K', topic: 'Lead capture and funnel builder' },
    ],
  },
]

// ── Prompt Detail View ─────────────────────────────────────────────────────

function PromptDetailContent({ prompt, onBack }) {
  const [trendMetric, setTrendMetric] = useState('Visibility')
  const [trendPeriod, setTrendPeriod]   = useState('28D')
  const [sourcesView, setSourcesView]   = useState('URL')

  const DETAIL_KPI = [
    { label: 'Visibility score', value: '82/100', desc: 'Current prompt-level visibility across tracked engines.' },
    { label: 'Avg position',     value: '#1.8',   desc: 'Average cited position when the brand appears.' },
    { label: 'AI responses',     value: '112',    desc: 'Latest prompt responses available for drill-down.' },
    { label: 'Search volume',    value: '1.9K',   desc: 'Demand proxy carried through from the tracked prompt feed.' },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Bot size={13} className="text-gray-400" />
            All AI Engines
            <ChevronDown size={12} className="text-gray-400" />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary-200 bg-primary-50 text-[13px] font-medium text-primary-600 hover:bg-primary-100 transition-colors">
            <Calendar size={13} />
            Last 30 days
            <ChevronDown size={12} />
          </button>
        </div>
        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold transition-colors">
          <Plus size={14} />
          Add prompt
        </button>
      </div>

      {/* Back link */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-700 transition-colors w-fit">
        <ArrowLeft size={14} />
        Back to Prompts
      </button>

      {/* Hero: prompt headline + snapshot card */}
      <div className="border border-gray-200 rounded-lg bg-white p-5 flex gap-6">
        {/* Left: tags + headline + desc */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-[12px] font-medium border border-purple-200">AI Visibility</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-success-50 text-success-600 text-[12px] font-medium border border-success-200">Winning</span>
            <span className="text-[12px] text-gray-400">Last 30 days</span>
            <span className="text-[12px] text-gray-400">US</span>
          </div>
          <h2 className="text-[22px] font-bold text-gray-900 leading-snug mb-3">{prompt}</h2>
          <p className="text-[13px] text-gray-500 leading-relaxed">This view separates trend analysis, AI response conversations, engine diagnostics, and prompt-level sources so each widget answers a different analysis question.</p>
        </div>

        {/* Right: snapshot card */}
        <div className="w-[220px] shrink-0 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <p className="text-[10px] font-bold uppercase tracking-wide text-primary-600 mb-3">Prompt snapshot</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Brand',          value: 'Go High Level' },
              { label: 'Top Engine',     value: 'Perplexity'    },
              { label: 'AI Responses',   value: '112'           },
              { label: 'Prompt Sources', value: '2'             },
            ].map(item => (
              <div key={item.label} className="border border-gray-200 rounded-md bg-white p-2.5">
                <p className="text-[10px] text-gray-400 font-medium mb-1">{item.label}</p>
                <p className="text-[13px] font-semibold text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-3">Topic: AI Visibility · 2 source domains · US</p>
        </div>
      </div>

      {/* 4 KPI mini-cards */}
      <div className="grid grid-cols-4 gap-3">
        {DETAIL_KPI.map(kpi => (
          <div key={kpi.label} className="border border-gray-200 rounded-lg bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">{kpi.label}</p>
            <p className="text-[26px] font-bold text-gray-900 leading-none mb-1">{kpi.value}</p>
            <p className="text-[11px] text-gray-400 leading-snug">{kpi.desc}</p>
          </div>
        ))}
      </div>

      {/* Prompt Visibility Trend chart */}
      <div className="border border-gray-200 rounded-lg bg-white p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">Prompt Visibility Trend</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">Prompt-level visibility by AI engine across the selected window</p>
          </div>
          <div className="flex items-center gap-2">
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
        {/* Legend */}
        <div className="flex items-center gap-4 mb-3">
          {DETAIL_TREND_LINES.map(line => (
            <div key={line.label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ background: line.color }} />
              <span className="text-[12px] text-gray-500">{line.label}</span>
            </div>
          ))}
        </div>
        <MultiLineChart lines={DETAIL_TREND_LINES} xLabels={DETAIL_X_LABELS} height={200} />
      </div>

      {/* AI Responses */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="p-5">
          <h3 className="text-[15px] font-semibold text-gray-900">AI Responses</h3>
          <p className="text-[13px] text-gray-500 mt-0.5">Latest prompt responses from tracked engines with drill-in answer analysis</p>
        </div>
        <div className="px-5 pb-5">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 w-[120px] border-r border-gray-200">AI</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200">Chat</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 w-[180px] border-r border-gray-200">Brands</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 w-[72px] border-r border-gray-200">Sources</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 w-[110px]">Created</th>
                </tr>
              </thead>
              <tbody>
                {AI_RESPONSES_DATA.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 border-r border-gray-100 align-top">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[11px] font-bold shrink-0" style={{ background: row.color }}>
                          {row.abbr}
                        </span>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900">{row.engine}</p>
                          <p className="text-[11px] text-success-600 font-medium">{row.status}</p>
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
                        {row.brands.map(b => <BrandPill key={b} name={b} highlight={b === 'Gohighlevel'} />)}
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
            <h3 className="text-[15px] font-semibold text-gray-900">Prompt Sources</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">All detected sources for this prompt with a compact matrix of position, coverage, and mention signals</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
              {['Domain', 'URL'].map(v => (
                <button key={v} onClick={() => setSourcesView(v)}
                  className={`px-3 py-1.5 text-[13px] font-medium transition-colors ${sourcesView === v ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                  {v}
                </button>
              ))}
            </div>
            <span className="text-[13px] text-gray-400">{PROMPT_SOURCES_DATA.length} rows</span>
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 min-w-[280px]">URL</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[72px]">Open</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[100px]">Avg position</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[88px]">Coverage</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[100px]">Seen in chats</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[120px]">Brand mentioned</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 border-r border-gray-200 w-[150px]">Other brands mentioned</th>
                  <th className="px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 w-[110px]">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {PROMPT_SOURCES_DATA.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 border-r border-gray-100 max-w-[280px] overflow-hidden">
                      <TruncatedLink href={row.url}>{row.url}</TruncatedLink>
                    </td>
                    <td className="px-3 py-3 border-r border-gray-100">
                      <button className="flex items-center gap-1 text-[13px] text-primary-600 hover:underline whitespace-nowrap">
                        Open <ExternalLink size={11} />
                      </button>
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

// ── Prompt Tracking Tab ────────────────────────────────────────────────────

function PromptTrackingContent() {
  const [trendMetric, setTrendMetric] = useState('Visibility')
  const [trendPeriod, setTrendPeriod] = useState('28D')

  const trendLines = TREND_LINES_MAP[trendMetric] || TREND_LINES_MAP.Visibility

  return (
    <div className="flex flex-col gap-4">

      {/* Row 1: 4 KPI cards */}
      <div className="grid grid-cols-4 gap-3">
        {OVERVIEW_KPI_CARDS.map(kpi => (
          <div key={kpi.label} className="border border-gray-200 rounded-lg bg-white p-4">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{kpi.label}</p>
              <kpi.Icon size={16} style={{ color: kpi.color }} className="shrink-0" />
            </div>
            <p className="text-[28px] font-bold text-gray-900 leading-none mb-2">{kpi.value}</p>
            {kpi.change && (
              <div className="flex items-center gap-1">
                <ArrowUp size={12} className={`shrink-0 ${kpi.up ? 'text-success-600' : 'text-error-600 rotate-180'}`} />
                <span className={`text-[12px] font-semibold ${kpi.up ? 'text-success-600' : 'text-error-600'}`}>{kpi.change}</span>
              </div>
            )}
            {kpi.sub && <p className="text-[12px] text-gray-400">{kpi.sub}</p>}
          </div>
        ))}
      </div>

      {/* Row 2: Combined 6-metric card */}
      <div className="border border-gray-200 rounded-lg bg-white">
        <div className="grid grid-cols-3">
          {OVERVIEW_METRICS.map((m, i) => (
            <div
              key={m.label}
              className={`p-5 ${i < 3 ? 'border-b border-gray-100' : ''} ${i % 3 !== 2 ? 'border-r border-gray-100' : ''}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">{m.label}</p>
              <p className="text-[28px] font-bold text-gray-900 leading-none mb-2">{m.value}</p>
              <p className="text-[12px] text-gray-500 leading-snug">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Visibility Trend + Competitor Ranking */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 340px' }}>

        {/* Visibility Trend card */}
        <div className="border border-gray-200 rounded-lg bg-white p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">Visibility Trend</h3>
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
          {/* Legend */}
          <div className="flex items-center gap-4 mb-3">
            {trendLines.map(line => (
              <div key={line.label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ background: line.color }} />
                <span className="text-[12px] text-gray-500">{line.label}</span>
              </div>
            ))}
          </div>
          <MultiLineChart lines={trendLines} xLabels={TREND_X_LABELS} height={200} />
        </div>

        {/* Competitor Ranking card */}
        <div className="border border-gray-200 rounded-lg bg-white p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-[15px] font-semibold text-gray-900">Competitor ranking</h3>
              <p className="text-[13px] text-gray-500 mt-0.5">Visibility score analysis across your tracked brands</p>
            </div>
          </div>
          {/* Header row */}
          <div className="grid text-[11px] font-semibold text-gray-400 uppercase tracking-wide pb-2 border-b border-gray-100 mb-2" style={{ gridTemplateColumns: '24px 1fr 36px 52px 40px 36px' }}>
            <span>Rank</span>
            <span className="pl-8">Brand</span>
            <span className="text-right">Pos.</span>
            <span className="text-right">Visibility</span>
            <span className="text-right">Sent.</span>
            <span className="text-right">SoV</span>
          </div>
          <div className="flex flex-col gap-0.5">
            {COMPETITOR_RANKING_DATA.map(c => (
              <div key={c.rank} className={`grid items-center py-2.5 rounded-md px-1 ${c.isMe ? 'bg-purple-50' : 'hover:bg-gray-50'} transition-colors`}
                style={{ gridTemplateColumns: '24px 1fr 36px 52px 40px 36px' }}>
                <span className="text-[12px] font-semibold text-gray-500">#{c.rank}</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-[10px] font-bold shrink-0" style={{ background: c.color }}>
                    {c.initials}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-[12px] font-semibold truncate ${c.isMe ? 'text-purple-700' : 'text-gray-900'}`}>{c.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{c.domain}</p>
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

      {/* Row 4: Engine Coverage */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="p-5">
          <h3 className="text-[15px] font-semibold text-gray-900">Engine coverage</h3>
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
                {ENGINE_COVERAGE_DATA.map((eng, i) => (
                  <tr key={eng.name} className={`border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors`}>
                    <td className="px-3 py-3 border-r border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-[11px] font-bold shrink-0" style={{ background: eng.color }}>
                          {eng.abbr}
                        </span>
                        <div>
                          <p className="text-[13px] font-semibold text-gray-900">{eng.name}</p>
                          <p className="text-[11px] text-gray-400">{eng.sub}</p>
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
                      <p className="text-[11px] text-gray-400">{eng.urlsAnswer}</p>
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

      {/* Row 5: How AI is Describing Go High Level */}
      <div className="border border-gray-200 rounded-lg bg-white p-5">
        <div className="flex items-start gap-1.5 mb-1">
          <h3 className="text-[15px] font-semibold text-gray-900">How AI is describing Go High Level</h3>
          <HelpCircle size={14} className="text-gray-300 mt-0.5 shrink-0" />
        </div>
        <p className="text-[13px] text-gray-500 mb-4">Recommendation strength, neutral framing, and negative dismissal across detected mentions</p>

        {/* Segmented bar */}
        <div className="flex rounded-full overflow-hidden h-4 mb-4">
          {SENTIMENT_DATA.map(s => (
            <div key={s.label} style={{ width: `${s.value}%`, background: s.color }} />
          ))}
        </div>

        {/* Metric cells */}
        <div className="grid grid-cols-5 border border-gray-100 rounded-lg overflow-hidden mb-4">
          {SENTIMENT_DATA.map((s, i) => (
            <div key={s.label} className={`p-4 ${i < SENTIMENT_DATA.length - 1 ? 'border-r border-gray-100' : ''}`}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">{s.label}</p>
              <p className="text-[24px] font-bold text-gray-900 leading-none">{s.value}%</p>
            </div>
          ))}
        </div>

        <p className="text-[13px] text-gray-500">AI answers show mixed momentum. Stronger source coverage and clearer category proof can improve how Go High Level is framed.</p>
      </div>

      {/* Row 6: Organic-AI Overlap */}
      <div className="border border-gray-200 rounded-lg bg-white p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-1.5">
            <h3 className="text-[15px] font-semibold text-gray-900">Organic-AI Overlap</h3>
            <HelpCircle size={14} className="text-gray-300 mt-0.5 shrink-0" />
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 text-[12px] font-medium border border-primary-200 whitespace-nowrap">
            5 shared URLs
          </span>
        </div>
        <p className="text-[13px] text-gray-500 mb-4">Where Google AI Overview is borrowing from your organic footprint</p>

        <div className="grid gap-4" style={{ gridTemplateColumns: '180px 200px 1fr' }}>
          {/* Overlap % */}
          <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">Overlap %</p>
            <p className="text-[36px] font-bold text-gray-900 leading-none mb-2">34%</p>
            <p className="text-[12px] text-gray-500 leading-snug">High overlap means traditional SEO is feeding your AIO visibility.</p>
          </div>

          {/* Drift Watch */}
          <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">Drift Watch</p>
            <p className="text-[22px] font-bold text-gray-900 leading-snug mb-2">2 prompts flagged</p>
            <p className="text-[12px] text-gray-500 leading-snug">Watch prompts where overlap is slipping while AIO position is weakening.</p>
          </div>

          {/* Prompt list */}
          <div className="flex flex-col">
            {ORGANIC_OVERLAP_PROMPTS.map((item, i) => (
              <div key={i} className={`flex items-center gap-3 py-3 ${i < ORGANIC_OVERLAP_PROMPTS.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <p className="flex-1 text-[13px] text-gray-800 leading-snug min-w-0">{item.prompt}</p>
                <div className="flex items-center gap-2 shrink-0 text-right">
                  <div className="text-right">
                    <p className="text-[12px] font-bold text-gray-900">{item.overlap}</p>
                    <p className="text-[11px] text-gray-400">AIO position {item.aioPos}</p>
                  </div>
                  <span className={`text-[12px] font-semibold whitespace-nowrap w-[80px] text-right ${item.status === 'Watch drift' ? 'text-warning-600' : 'text-success-600'}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 7: Top Performing Prompts */}
      <div className="border border-gray-200 rounded-lg bg-white p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">Top performing prompts</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">Highest-visibility prompts in the current date range</p>
          </div>
          <span className="text-[13px] font-semibold text-success-600">Top 5</span>
        </div>

        {/* Column headers */}
        <div className="flex items-center gap-4 pb-2 border-b border-gray-100 mb-1">
          <div className="flex-1" />
          <div className="flex items-center gap-6 shrink-0 pr-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 w-[80px] text-right">Visibility</p>
            <div className="flex items-center gap-1 w-[100px] justify-end">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Trend score Δ</p>
              <HelpCircle size={11} className="text-gray-300" />
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          {TOP_PROMPTS_DATA.map((item, i) => (
            <div key={item.rank} className={`flex items-center gap-4 py-3.5 ${i < TOP_PROMPTS_DATA.length - 1 ? 'border-b border-gray-100' : ''}`}>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-[13px] font-bold text-gray-600 shrink-0">{item.rank}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-gray-900 mb-1">{item.prompt}</p>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[11px] font-medium border border-purple-200">{item.tag}</span>
                  <span className="text-[12px] text-gray-400">{item.volume}</span>
                  <span className="text-[12px] text-gray-400">{item.engines}</span>
                </div>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <p className="text-[22px] font-bold text-gray-900 w-[80px] text-right">{item.visibility}</p>
                <p className={`text-[16px] font-bold w-[100px] text-right ${item.up ? 'text-success-600' : 'text-error-600'}`}>{item.trendScore}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Overview Tab ───────────────────────────────────────────────────────────

function OverviewContent() {
  const [comparisonView, setComparisonView] = useState('competitors')
  const isEngines = comparisonView === 'engines'
  const barItems = isEngines ? AI_ENGINES : COMPETITORS
  const maxPct = isEngines ? Math.max(...AI_ENGINES.map(e => e.pct)) : 25

  return (
    <div className="flex flex-col gap-4">

      {/* Hero: AI Presence score card */}
      <div className="border border-gray-200 rounded-lg bg-white flex overflow-hidden" style={{ height: '180px' }}>
        <div className="px-6 py-5 flex flex-col justify-between shrink-0 w-[340px]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-[12px] font-medium border border-purple-200 whitespace-nowrap">
              <Sparkles size={11} />
              AI Presence
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 text-[12px] font-medium border border-primary-200 whitespace-nowrap">
              <BarChart3 size={11} />
              4 of 6
            </span>
          </div>
          <div>
            <p className="text-[12px] text-gray-400 font-medium mb-1">Share of voice</p>
            <p className="text-[38px] font-bold text-gray-900 leading-none tracking-tight">14.20%</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-50 text-success-600 text-[12px] font-semibold border border-success-200">
                <ArrowUp size={10} />
                +6.8%
              </span>
              <span className="text-[12px] text-gray-400">vs previous period</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-success-600 shrink-0" />
            <p className="text-[12px] text-gray-400">Data as of <span className="font-semibold text-success-600">Apr 2026</span></p>
          </div>
        </div>

        <div className="w-px bg-gray-200 shrink-0 self-stretch" />

        <div className="flex-1 flex flex-col" style={{ height: '180px' }}>
          <div className="px-6 pt-5 pb-2 flex items-center justify-between shrink-0">
            <p className="text-[12px] font-medium text-gray-400">12-month trend</p>
            <span className="text-[11px] text-gray-300">Apr 2025 – Apr 2026</span>
          </div>
          <div className="flex-1 min-h-0 w-full flex items-end px-6 pb-5">
            <Sparkline data={[6, 7, 8, 9, 8, 10, 11, 10, 12, 13, 12, 14, 13, 15, 14, 16]} color="#6938EF" width="100%" height={110} filled />
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-5 gap-3">
        {KPI_CARDS.map(kpi => (
          <div key={kpi.label} className="border border-gray-200 rounded-lg bg-white flex flex-col min-w-0 pt-5 px-5 pb-0 overflow-hidden">
            <div className="flex items-start gap-2 mb-4">
              <kpi.Icon size={15} style={{ color: kpi.color }} className="shrink-0 mt-0.5" />
              <p className="text-[13px] font-medium text-gray-700 leading-snug">{kpi.label}</p>
            </div>
            <p className="text-[30px] font-bold text-gray-900 leading-none mb-2">{kpi.value}</p>
            <div className="flex items-center gap-1 mb-0.5">
              <ArrowUp size={12} className={`shrink-0 ${kpi.up ? 'text-success-600' : 'text-error-600 rotate-180'}`} />
              <span className={`text-[13px] font-semibold ${kpi.up ? 'text-success-600' : 'text-error-600'}`}>{kpi.change}</span>
            </div>
            <p className="text-[11px] text-gray-400 mb-4">vs previous period</p>
            <div className="mt-auto w-full">
              <Sparkline data={kpi.data} color={kpi.color} width="100%" height={56} filled />
            </div>
          </div>
        ))}
      </div>

      {/* AI Presence Comparison */}
      <div className="border border-gray-200 rounded-lg bg-white p-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">AI Presence Comparison</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">Switch between competitor and engine views using the global presence mode selected above.</p>
          </div>
          <div className="flex items-center gap-0.5 border border-gray-200 rounded p-0.5 bg-gray-50 shrink-0">
            {['competitors', 'engines'].map(v => (
              <button
                key={v}
                onClick={() => setComparisonView(v)}
                className={`px-3 py-1.5 rounded text-[13px] font-medium transition-all ${
                  comparisonView === v ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {v === 'competitors' ? 'Competitors' : 'AI Engines'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-3">
            {barItems.map(c => (
              <div key={c.name} className="flex items-center gap-4">
                <div className="w-[148px] shrink-0">
                  <p className="text-[13px] font-semibold text-gray-900">{c.name}</p>
                  <p className="text-[11px] text-gray-400">{isEngines ? c.subtitle : c.domain}</p>
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-5 relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                    style={{ width: `${(c.pct / maxPct) * 100}%`, background: c.color, minWidth: 64 }}
                  >
                    <span className="text-white text-[12px] font-semibold whitespace-nowrap">
                      {isEngines ? c.pct : c.pct.toFixed(2) + '%'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="w-[196px] shrink-0 border border-gray-100 rounded-lg p-3 bg-gray-50">
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-3">Metric logic</p>
            <div className="flex flex-col gap-2.5 text-[12px] text-gray-600 leading-relaxed">
              <p><strong className="text-gray-800 font-semibold">Overall presence</strong> uses share of voice across mentions and links.</p>
              <p><strong className="text-gray-800 font-semibold">Brand presence</strong> counts brand-name appearances in AI answers.</p>
              <p><strong className="text-gray-800 font-semibold">Domain presence</strong> counts linked citations back to the domain.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Topic Presence */}
      <div className="border border-gray-200 rounded-lg bg-white p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">Topic Presence</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">Top topic clusters comparing the primary brand against tracked competitors across the analyzed answer set.</p>
          </div>
          <button className="px-3 py-1.5 rounded border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors shrink-0">
            View more
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-[12px] font-medium text-gray-500 pb-3 pr-4 w-[260px]">Topic</th>
                {COMPETITORS.map((c, i) => (
                  <th key={c.name} className="text-[12px] font-medium text-gray-500 pb-3 px-2 text-center min-w-[90px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: COMPETITOR_COLORS[i] }} />
                      <span className="whitespace-nowrap">{c.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOPIC_PRESENCE.map(row => (
                <tr key={row.topic} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 text-[13px] font-medium text-gray-800">{row.topic}</td>
                  {row.scores.map((score, i) => (
                    <td key={i} className="py-3 px-2 text-[13px] text-gray-700 text-center">{score.toFixed(2)}%</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Prompts Tab ────────────────────────────────────────────────────────────

function PromptsContent() {
  const [expanded, setExpanded] = useState(new Set([1]))
  const [searchQuery, setSearchQuery] = useState('')
  const [detailPrompt, setDetailPrompt] = useState(null)

  function toggleRow(id) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = PROMPT_TOPICS.filter(t =>
    !searchQuery || t.topic.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const thClass = "relative px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 bg-gray-50 border-b border-r border-gray-200 whitespace-nowrap overflow-hidden"
  const tdClass = "px-3 py-3 text-[13px] text-gray-700 border-b border-r border-gray-200 align-middle"
  const { widths: colW, onResizeStart } = useColumnResize([28, 260, 72, 96, 106, 168, 120])

  if (detailPrompt !== null) {
    return <PromptDetailContent prompt={detailPrompt} onBack={() => setDetailPrompt(null)} />
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">Prompt Universe</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">Topic-grouped prompts with drill-downs for answer visibility, citations, and competing brands.</p>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white text-[13px] font-semibold transition-colors shrink-0">
            <TrendingUp size={14} />
            Track prompts
          </button>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 bg-white text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors whitespace-nowrap">
              <Plus size={13} className="text-gray-500" />
              Add filter
            </button>
            <button className="flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-full border border-gray-300 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <span className="text-gray-400 text-[12px] font-normal mr-0.5">Grouping:</span>
              Topic
              <ChevronDown size={12} className="text-gray-400 ml-0.5" />
            </button>
            <button className="flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-full border border-gray-300 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              Topic
              <ChevronDown size={12} className="text-gray-400 ml-0.5" />
            </button>
            <button className="flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-full border border-gray-300 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              Brands
              <ChevronDown size={12} className="text-gray-400 ml-0.5" />
            </button>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg bg-white" style={{ width: '220px' }}>
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search topic"
              className="flex-1 text-[13px] text-gray-900 placeholder:text-gray-400 bg-transparent outline-none min-w-0"
            />
          </div>
        </div>
      </div>

      {/* Data table */}
      <div className="px-5 pb-5">
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full border-collapse table-fixed" style={{ minWidth: colW.reduce((a, b) => a + b, 0) }}>
            <colgroup>
              {colW.map((w, i) => <col key={i} style={{ width: w }} />)}
            </colgroup>
            <thead>
              <tr>
                <th className={`${thClass} text-center`} style={{ width: colW[0] }} />
                <th className={thClass} style={{ width: colW[1] }}><span className="flex items-center gap-1">Topic <HelpCircle size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => onResizeStart(e, 1)} /></th>
                <th className={thClass} style={{ width: colW[2] }}><span className="flex items-center gap-1">Topic size <HelpCircle size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => onResizeStart(e, 2)} /></th>
                <th className={thClass} style={{ width: colW[3] }}><span className="flex items-center gap-1">Type <HelpCircle size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => onResizeStart(e, 3)} /></th>
                <th className={thClass} style={{ width: colW[4] }}><span className="flex items-center gap-1">Presence <HelpCircle size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => onResizeStart(e, 4)} /></th>
                <th className={thClass} style={{ width: colW[5] }}><span className="flex items-center gap-1">Brands <HelpCircle size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => onResizeStart(e, 5)} /></th>
                <th className={`${thClass} border-r-0`} style={{ width: colW[6] }}>AI engines</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <>
                  <tr key={row.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => toggleRow(row.id)}>
                    <td className={`${tdClass} text-center`}>
                      <button className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 transition-colors">
                        {expanded.has(row.id)
                          ? <ChevronDown size={13} className="text-gray-500" />
                          : <ChevronRight size={13} className="text-gray-500" />
                        }
                      </button>
                    </td>
                    <td className={tdClass}>
                      <p className="text-[13px] font-semibold text-gray-900 break-words">{row.topic}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{row.prompts} prompts</p>
                    </td>
                    <td className={tdClass}>{row.size}</td>
                    <td className={tdClass}><div className="flex items-center gap-1 flex-wrap">{row.types.map(t => <TypeBadge key={t} type={t} />)}</div></td>
                    <td className={tdClass}>{row.presence}</td>
                    <td className={tdClass}>{row.brands}</td>
                    <td className={`${tdClass} border-r-0`}><EngineList engines={row.engines} /></td>
                  </tr>

                  {expanded.has(row.id) && row.children.map(child => (
                    <tr key={child.id} className="bg-gray-50 hover:bg-white transition-colors">
                      <td className="border-b border-r border-gray-200" />
                      <td className="px-3 py-3 border-b border-r border-gray-200 align-top">
                        <p className="text-[13px] text-gray-800 leading-relaxed break-words">{child.prompt}</p>
                        <button
                          onClick={() => setDetailPrompt(child.prompt)}
                          className="text-[12px] text-primary-600 mt-0.5 hover:underline text-left"
                        >
                          Open prompt detail
                        </button>
                      </td>
                      <td className="border-b border-r border-gray-200" />
                      <td className="px-3 py-3 border-b border-r border-gray-200 align-top"><TypeBadge type={child.type} /></td>
                      <td className="border-b border-r border-gray-200" />
                      <td className="px-3 py-3 border-b border-r border-gray-200 align-top">
                        <BrandsCell brands={child.brands} extraBrands={child.extraBrands} />
                      </td>
                      <td className="px-3 py-3 border-b border-gray-200 align-top"><EngineBadge label={child.engine.label} /></td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Citations Tab ──────────────────────────────────────────────────────────

function CitationsContent() {
  const [expanded, setExpanded] = useState(new Set([1]))
  const [searchQuery, setSearchQuery] = useState('')
  const { widths: citW, onResizeStart: citResize } = useColumnResize([28, 280, 80, 108, 88, 44, 68, 140])
  const citTh = "relative px-3 py-2.5 text-left text-[12px] font-semibold text-gray-700 bg-gray-50 border-b border-r border-gray-200 whitespace-nowrap overflow-hidden"

  function toggleRow(id) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = CITING_DOMAINS_DATA.filter(d =>
    !searchQuery || d.domain.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-[15px] font-semibold text-gray-900">Citing Domains</h3>
          <p className="text-[13px] text-gray-500 mt-0.5">Domain-level citation visibility plus expandable page detail for in-scope prompt coverage.</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 bg-white text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors whitespace-nowrap">
              <Plus size={13} className="text-gray-500" />
              Add filter
            </button>
            <button className="flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-full border border-gray-300 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <span className="text-gray-400 text-[12px] font-normal mr-0.5">Grouping:</span>
              Domain
              <ChevronDown size={12} className="text-gray-400 ml-0.5" />
            </button>
            <button className="flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-full border border-gray-300 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              Topics
              <ChevronDown size={12} className="text-gray-400 ml-0.5" />
            </button>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg bg-white" style={{ width: '220px' }}>
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search domain"
              className="flex-1 text-[13px] text-gray-900 placeholder:text-gray-400 bg-transparent outline-none min-w-0"
            />
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full border-collapse table-fixed" style={{ minWidth: citW.reduce((a, b) => a + b, 0) }}>
            <colgroup>
              {citW.map((w, i) => <col key={i} style={{ width: w }} />)}
            </colgroup>
            <thead>
              <tr>
                <th className="relative px-2 py-2.5 bg-gray-50 border-b border-r border-gray-200" style={{ width: citW[0] }} />
                <th className={citTh} style={{ width: citW[1] }}><span className="flex items-center gap-1">Domain <HelpCircle size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => citResize(e, 1)} /></th>
                <th className={citTh} style={{ width: citW[2] }}><span className="flex items-center gap-1">Citations <HelpCircle size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => citResize(e, 2)} /></th>
                <th className={citTh} style={{ width: citW[3] }}><span className="flex items-center gap-1">Type <HelpCircle size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => citResize(e, 3)} /></th>
                <th className={citTh} style={{ width: citW[4] }}><span className="flex items-center gap-1">Co-mention <HelpCircle size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => citResize(e, 4)} /></th>
                <th className={citTh} style={{ width: citW[5] }}><span className="flex items-center gap-1">DT <HelpCircle size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => citResize(e, 5)} /></th>
                <th className={citTh} style={{ width: citW[6] }}><span className="flex items-center gap-1">Org. traffic <HelpCircle size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => citResize(e, 6)} /></th>
                <th className={`${citTh} border-r-0`} style={{ width: citW[7] }}><span className="flex items-center gap-1">Topics <HelpCircle size={11} className="text-gray-400" /></span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <>
                  <tr key={row.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => toggleRow(row.id)}>
                    <td className="px-2 py-3 border-b border-r border-gray-200 text-center align-middle">
                      <button className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 transition-colors">
                        {expanded.has(row.id)
                          ? <ChevronDown size={13} className="text-gray-500" />
                          : <ChevronRight size={13} className="text-gray-500" />
                        }
                      </button>
                    </td>
                    <td className="px-3 py-3 border-b border-r border-gray-200 align-middle overflow-hidden">
                      <TruncatedCell className="text-[13px] font-semibold text-gray-900">{row.domain}</TruncatedCell>
                      <p className="text-[11px] text-gray-400 mt-0.5">{row.pages.toLocaleString()} pages</p>
                    </td>
                    <td className="px-3 py-3 text-[13px] text-gray-700 border-b border-r border-gray-200 align-middle">{row.citations}</td>
                    <td className="px-3 py-3 border-b border-r border-gray-200 align-middle"><div className="flex items-center gap-1 flex-wrap">{row.types.map(t => <TypeBadge key={t} type={t} />)}</div></td>
                    <td className="px-3 py-3 text-[13px] text-gray-700 border-b border-r border-gray-200 align-middle">{row.coMention}</td>
                    <td className="px-3 py-3 text-[13px] text-gray-700 border-b border-r border-gray-200 align-middle">{row.dt}</td>
                    <td className="px-3 py-3 text-[13px] text-gray-700 border-b border-r border-gray-200 align-middle">{row.orgTraffic}</td>
                    <td className="px-3 py-3 text-[13px] text-gray-500 border-b border-gray-200 align-middle overflow-hidden">
                      <TruncatedCell>{row.topics}</TruncatedCell>
                    </td>
                  </tr>

                  {expanded.has(row.id) && row.children.map((child, i) => (
                    <tr key={i} className="bg-gray-50 hover:bg-white transition-colors">
                      <td className="border-b border-r border-gray-200" />
                      <td className="px-3 py-3 border-b border-r border-gray-200 align-middle overflow-hidden">
                        <TruncatedLink href={child.page}>{child.page}</TruncatedLink>
                      </td>
                      <td className="px-3 py-3 text-[13px] text-gray-700 border-b border-r border-gray-200 align-middle">{child.pageCitations}</td>
                      <td className="px-3 py-3 border-b border-r border-gray-200 align-middle"><TypeBadge type={child.type} /></td>
                      <td className="px-3 py-3 text-[13px] text-gray-700 border-b border-r border-gray-200 align-middle">{child.coMention}</td>
                      <td className="px-3 py-3 text-[13px] text-gray-700 border-b border-r border-gray-200 align-middle">{child.pt}</td>
                      <td className="px-3 py-3 text-[13px] text-gray-700 border-b border-r border-gray-200 align-middle">{child.orgTraffic}</td>
                      <td className="px-3 py-3 text-[13px] text-gray-500 border-b border-gray-200 align-middle overflow-hidden">
                        <TruncatedCell>{child.topic}</TruncatedCell>
                      </td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────

const SUB_TABS = [
  { id: 'overview',  label: 'Overview',  icon: TrendingUp    },
  { id: 'prompts',   label: 'Prompts',   icon: MessageCircle },
  { id: 'citations', label: 'Citations', icon: Globe         },
]

const FILTER_CHIPS = [
  { Icon: Globe,      label: 'gohighlevel.com' },
  { Icon: Link2,      label: 'Base domain'     },
  { Icon: MapPin,     label: 'United States'   },
  { label: '#Gohighlevel' },
  { Icon: LayoutList, label: 'Selected: 5'     },
]

export default function AiSearchPerformanceDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-gray-50">

      {/* Sticky page header — never scrolls */}
      <div className="bg-white border-b border-gray-200 px-6 pt-5 pb-0 shrink-0">
        <div className="flex items-start justify-between gap-4 pb-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-[18px] font-bold text-gray-900">AI Search Performance</p>
              <p className="text-[13px] text-gray-500 mt-0.5">Passive brand presence in ChatGPT, Perplexity, Gemini, and other AI channels.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold transition-colors">
              <Plus size={14} />
              Add competitors
            </button>
          </div>
        </div>

        {/* Filter chips row */}
        <div className="flex items-center gap-2 flex-wrap pb-3">
          {FILTER_CHIPS.map(({ Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 bg-white text-[12px] font-medium text-gray-600 whitespace-nowrap select-none"
            >
              {Icon && <Icon size={11} className="text-gray-400 shrink-0" />}
              {label}
            </span>
          ))}
        </div>

        {/* Tab nav with icons */}
        <div className="flex items-center gap-1 -mx-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {SUB_TABS.map(({ id, label, icon: Icon }) => {
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
      <div className="flex-1 overflow-y-auto min-h-0 p-5 flex flex-col gap-4" style={{ scrollbarGutter: 'stable' }}>
        {activeTab === 'overview'  && <OverviewContent />}
        {activeTab === 'prompts'   && <PromptsContent />}
        {activeTab === 'citations' && <CitationsContent />}
      </div>
    </div>
  )
}
