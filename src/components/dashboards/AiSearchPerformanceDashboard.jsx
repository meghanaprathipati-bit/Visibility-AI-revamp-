import { useState, useRef, useEffect, Fragment } from 'react'
import { createPortal } from 'react-dom'
import {
  TrendingUp, Globe, Search, Plus, Link2, LayoutDashboard,
  ChevronRight, ChevronDown, ExternalLink, MessageCircle, Info,
  Megaphone, Calendar, Sparkles, BarChart3, Award, ArrowUp,
  Users, ArrowLeft, Check, CircleCheck, Bot, Star, X,
} from '../../icons/index.js'
import CountCard from '../CountCard.jsx'
import HLButton, { BTN_PRIMARY, BTN_SECONDARY } from '../HLButton.jsx'
import VisibilityMeter from '../VisibilityMeter.jsx'
import SectionInfoTip from '../SectionInfoTip.jsx'
import CompetitorRankingMiniTable from '../CompetitorRankingMiniTable.jsx'
import EngineLogo from '../EngineLogo.jsx'

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
  // Sanitize id — CSS vars like var(--primary-600) break url(#...) and fall back to black fill
  const gradId = `sg-${String(color).replace(/[^a-zA-Z0-9_-]/g, '')}-${coordW}`
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
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="55%" stopColor={color} stopOpacity="0.10" />
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
  if (leader) insight += ` ${leader.label} leads at ${leader.value}.`
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
  const gradId = 'mlc-asp-grad-last'
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
              {metricLabel === 'Mentions' ? 'Mention score' : metricLabel === 'Citations' ? 'Citation score' : 'Visibility score'}
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
            <p className="text-[12px] font-normal text-gray-500 m-0 leading-snug border-t border-gray-100 pt-2">{hoverInsight}</p>
          </div>
        )}
      </div>

      {/* X axis date labels — evenly spaced, aligned to the plot area, edge-aware */}
      <div className="relative mt-2 h-4 overflow-visible" style={{ paddingLeft: `${padLPct}%`, paddingRight: `${padRPct}%` }}>
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

// ── Badges ─────────────────────────────────────────────────────────────────

function MentionBadge() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[12px] font-medium border border-gray-200">
      Mention
    </span>
  )
}

function LinkBadge() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-success-50 text-success-600 text-[12px] font-medium border border-success-200">
      Link
    </span>
  )
}

function TypeBadge({ type }) {
  return type === 'Link' ? <LinkBadge /> : <MentionBadge />
}

function EngineBadge({ label }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium border border-gray-200 text-gray-600 bg-gray-50 whitespace-nowrap">
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
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium border border-gray-200 text-gray-500 bg-gray-50 whitespace-nowrap">
          +{overflow}
        </span>
      )}
    </div>
  )
}

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
      {visible.map(b => <BrandPill key={b} name={b} />)}
      {overflowCount > 0 && (
        <>
          <span
            ref={chipRef}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            className="inline-flex items-center px-2 py-0.5 rounded border border-gray-300 text-[12px] font-medium text-gray-600 bg-gray-50 cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors select-none"
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
                <span key={b} className="inline-flex items-center px-2 py-0.5 rounded border border-gray-200 text-[12px] font-medium text-gray-600 bg-gray-50">
                  {b}
                </span>
              ))}
              {extraBrands > 0 && (
                <span className="text-[12px] text-gray-400 px-1">+{extraBrands} more</span>
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

const KPI_CARDS = [
  { label: 'Brand presence',         value: '418',   change: '8.2%',  up: true,  data: [260, 290, 330, 365, 395, 418],             color: '#6938EF', Icon: Award    },
  { label: 'AI opportunity traffic', value: '12.4K', change: '12.8%', up: true,  data: [8200, 9100, 9800, 10600, 11400, 12400],    color: '#155EEF', Icon: BarChart3 },
  { label: 'Link presence',          value: '137',   change: '5.7%',  up: true,  data: [105, 112, 118, 124, 130, 137],             color: '#16A34A', Icon: Link2     },
  { label: 'Average position',       value: '5.3',   change: '0.8',   up: false, data: [6.1, 6.0, 5.8, 5.6, 5.4, 5.3],           color: '#D97706', Icon: TrendingUp },
  { label: 'Organic traffic',        value: '90.4K', change: '3.4%',  up: true,  data: [82000, 84000, 86000, 87500, 89200, 90400], color: '#E11D48', Icon: Globe     },
]

const COMPETITORS = [
  { name: 'GoHighLevel',    domain: 'gohighlevel.com',    pct: 14.20 },
  { name: 'HubSpot',        domain: 'hubspot.com',        pct: 22.80 },
  { name: 'ActiveCampaign', domain: 'activecampaign.com', pct: 18.60 },
  { name: 'ClickFunnels',   domain: 'clickfunnels.com',   pct: 15.90 },
  { name: 'Klaviyo',        domain: 'klaviyo.com',        pct: 12.70 },
  { name: 'Keap',           domain: 'keap.com',           pct: 11.40 },
]

const AI_ENGINES = [
  { name: 'AI overview', subtitle: 'AI overview', pct: 49 },
  { name: 'AI mode',     subtitle: 'AI mode',     pct: 22 },
  { name: 'Gemini',      subtitle: 'Gemini',      pct: 28 },
  { name: 'ChatGPT',     subtitle: 'ChatGPT',     pct: 18 },
  { name: 'Perplexity',  subtitle: 'Perplexity',  pct: 20 },
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
  { label: 'Competitive rank',  value: '#3 / 7', change: null,                 up: null,  sub: '— Latest period rank', Icon: Users,      color: 'var(--primary-600)' },
  { label: 'Avg position',      value: '#2.9',   change: '0.6 pts better',     up: true,  sub: null,                  Icon: TrendingUp,  color: '#16A34A' },
  { label: 'Citation rate',     value: '49%',    change: '+5.7 pp',            up: true,  sub: null,                  Icon: Link2,       color: '#D97706' },
]

const OVERVIEW_METRICS = [
  { label: 'Presence rate',                value: '61%',      desc: 'Brand appears within answered prompt blocks.' },
  { label: 'Share of voice',               value: '15%',      desc: 'Share of detected brand mentions across answers.' },
  { label: 'Net sentiment',                value: '+11',      desc: 'Positive vs negative brand framing.' },
  { label: 'Google AI overview coverage',  value: '62%',      desc: 'How often Google shows an AI Overview for the tracked prompts.' },
  { label: 'Answer density',               value: '6.8 URLs', desc: '2.4 brand mentions per answer.' },
  { label: 'SoV gap to leader',            value: '9 pts',    desc: 'Share-of-voice distance from the leading brand.' },
]

const COMPETITOR_RANKING_DATA = [
  { rank: 1, name: 'HubSpot',        domain: 'hubspot.com',        initials: 'H',  color: '#FF7A59', pos: 2.1, visibility: '78%', sent: '+62', sov: '24%', sentUp: true },
  { rank: 2, name: 'Calendly',       domain: 'calendly.com',       initials: 'C',  color: '#0069FF', pos: 2.8, visibility: '62%', sent: '+71', sov: '18%', sentUp: true },
  { rank: 3, name: 'GoHighLevel',  domain: 'gohighlevel.com',    initials: 'GH', color: '#6938EF', pos: 4.4, visibility: '58%', sent: '+11', sov: '15%', sentUp: true, isMe: true },
  { rank: 4, name: 'Pipedrive',      domain: 'pipedrive.com',      initials: 'P',  color: '#2B2D42', pos: 4.2, visibility: '41%', sent: '+58', sov: '11%', sentUp: true },
  { rank: 5, name: 'Salesforce',     domain: 'salesforce.com',     initials: 'S',  color: '#00A1E0', pos: 4.6, visibility: '37%', sent: '+44', sov: '10%', sentUp: true },
  { rank: 6, name: 'ActiveCampaign', domain: 'activecampaign.com', initials: 'A',  color: '#356AE6', pos: 5.1, visibility: '32%', sent: '+52', sov: '8%',  sentUp: true },
]

const ENGINE_COVERAGE_DATA = [
  { name: 'Perplexity',  abbr: 'P',  color: 'var(--primary-800)', bg: 'var(--primary-50)', sub: 'US · English · 12 prompts', vis: 76, presence: '69.0%', avgPos: '#2.3', urlsAnswer: '6.4 URLs / answer', citRate: '58.0%', insight: 'Best current engine for mention depth and citation pickup.' },
  { name: 'Claude',      abbr: 'C',  color: 'var(--purple-600)', bg: 'var(--purple-50)', sub: 'US · English · 12 prompts', vis: 71, presence: '63.0%', avgPos: '#2.9', urlsAnswer: '5.1 URLs / answer', citRate: '47.0%', insight: 'Visibility is present, but citations still lag the strongest engines.' },
  { name: 'Gemini',      abbr: 'G',  color: '#1D4ED8', bg: 'var(--primary-50)', sub: 'US · English · 12 prompts', vis: 64, presence: '56.0%', avgPos: '#3.7', urlsAnswer: '4.8 URLs / answer', citRate: '41.0%', insight: 'Brand named often enough, but answer prominence is still uneven.' },
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
    { label: 'GoHighLevel', color: 'var(--primary-600)', data: [82,83,82,84,83,85,84,86,85,87,86,88,87,90] },
    { label: 'HubSpot',       color: '#EF4444', data: [97,97,98,98,99,98,99,99,100,99,100,100,99,100] },
    { label: 'Calendly',      color: '#06B6D4', data: [78,79,79,80,79,81,80,82,81,82,83,82,83,84] },
    { label: 'Pipedrive',     color: '#6B7280', data: [70,71,70,72,71,73,72,74,73,75,74,75,76,78] },
  ],
  Mentions: [
    { label: 'GoHighLevel', color: 'var(--primary-600)', data: [54,58,55,61,57,63,59,65,58,62,60,67,63,69] },
    { label: 'HubSpot',       color: '#EF4444', data: [82,80,84,83,87,85,88,86,90,89,88,91,90,92] },
    { label: 'Calendly',      color: '#06B6D4', data: [71,73,70,75,72,74,76,73,78,75,77,79,76,80] },
    { label: 'Pipedrive',     color: '#6B7280', data: [38,36,40,37,35,39,33,37,34,32,36,31,33,30] },
  ],
  Citations: [
    { label: 'GoHighLevel', color: 'var(--primary-600)', data: [31,29,33,35,32,38,36,40,37,43,41,46,44,49] },
    { label: 'HubSpot',       color: '#EF4444', data: [76,74,78,76,79,77,81,79,82,80,83,81,84,82] },
    { label: 'Calendly',      color: '#06B6D4', data: [58,60,57,62,59,64,61,66,63,65,67,64,68,66] },
    { label: 'Pipedrive',     color: '#6B7280', data: [18,20,17,22,19,16,21,18,15,19,17,14,16,13] },
  ],
}

const DETAIL_X_LABELS = ['May 22','May 24','May 26','May 28','May 30','Jun 1','Jun 3','Jun 5','Jun 7','Jun 9','Jun 11','Jun 13','Jun 15','Jun 17','Jun 18']

const DETAIL_TREND_LINES = [
  { label: 'Perplexity', color: 'var(--primary-800)', data: [76,78,80,81,82,83,84,86,87,88,90,91,93,95,97] },
  { label: 'Claude',     color: 'var(--purple-600)', data: [72,74,75,76,77,78,79,80,80,81,82,82,83,83,83] },
  { label: 'Gemini',     color: 'var(--primary-600)', data: [65,67,68,69,70,71,72,73,74,74,75,76,76,77,77] },
  { label: 'AI Mode',    color: '#059669', data: [65,66,68,68,69,70,71,72,73,73,74,75,75,76,77] },
]

const AI_RESPONSES_DATA = [
  { engine: 'AI Mode', abbr: 'AM', color: '#0D9488', status: 'Succeeded', text: 'Direct answer: GoHighLevel is visible for this prompt, but the response quality depends on whether the engine can find clear proof, strong source pages, and structured comparisons.', brands: ['GoHighLevel', 'Calendly', 'HubSpot'], sources: 1, created: 'Jun 18, 2026' },
  { engine: 'Claude',  abbr: 'C',  color: 'var(--purple-600)', status: 'Succeeded', text: 'Direct answer: GoHighLevel is visible for this prompt, but the response quality depends on whether the engine can find clear proof, strong source pages, and structured comparisons.', brands: ['GoHighLevel', 'HubSpot', 'Calendly'], sources: 1, created: 'Jun 18, 2026' },
  { engine: 'Gemini',  abbr: 'G',  color: '#1D4ED8', status: 'Succeeded', text: 'Direct answer: GoHighLevel is visible for this prompt, but the response quality depends on whether the engine can find clear proof, strong source pages, and structured comparisons.', brands: ['HubSpot', 'GoHighLevel', 'Calendly'], sources: 1, created: 'Jun 18, 2026' },
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
        brands: ['HubSpot', 'GoHighLevel', 'ActiveCampaign', 'ClickFunnels', 'Klaviyo', 'Keap', 'Salesforce', 'Pipedrive'],
        extraBrands: 0,
        engine: { abbr: 'AO', label: 'AI overview', color: '#0891B2' },
      },
      {
        id: 12,
        prompt: 'What platform combines CRM, funnels, and automations for agencies?',
        type: 'Mention',
        brands: ['GoHighLevel', 'ClickFunnels', 'HubSpot', 'ActiveCampaign', 'Marketo', 'Infusionsoft', 'Salesforce'],
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
        brands: ['HubSpot', 'GoHighLevel', 'Klaviyo', 'ActiveCampaign', 'Pipedrive', 'Salesforce'],
        extraBrands: 3,
        engine: { abbr: 'G', label: 'Gemini', color: '#1D4ED8' },
      },
      {
        id: 22,
        prompt: 'How to automate lead follow-up inside a CRM?',
        type: 'Mention',
        brands: ['GoHighLevel', 'HubSpot', 'Salesforce', 'ActiveCampaign', 'Pipedrive'],
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
        brands: ['ClickFunnels', 'GoHighLevel', 'HubSpot', 'Mailchimp', 'Unbounce', 'Leadpages'],
        extraBrands: 2,
        engine: { abbr: 'AM', label: 'AI mode', color: '#0D9488' },
      },
      {
        id: 32,
        prompt: 'Best software to build sales funnels for local businesses',
        type: 'Mention',
        brands: ['GoHighLevel', 'ClickFunnels', 'Kartra', 'HubSpot'],
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
        brands: ['Calendly', 'GoHighLevel', 'Acuity', 'HubSpot', 'Setmore'],
        extraBrands: 2,
        engine: { abbr: 'CG', label: 'ChatGPT', color: '#16A34A' },
      },
      {
        id: 42,
        prompt: 'How to sync appointments across Google Calendar and a CRM?',
        type: 'Mention',
        brands: ['GoHighLevel', 'Calendly', 'HubSpot', 'Pipedrive'],
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
        brands: ['GoHighLevel', 'Klaviyo', 'ActiveCampaign', 'Twilio'],
        extraBrands: 3,
        engine: { abbr: 'CG', label: 'ChatGPT', color: '#16A34A' },
      },
      {
        id: 52,
        prompt: 'How do agencies manage multi-channel outreach for clients?',
        type: 'Link',
        brands: ['GoHighLevel', 'HubSpot', 'ActiveCampaign', 'Mailchimp'],
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
    { label: 'Visibility score', value: '82/100', desc: 'Current prompt-level visibility across tracked engines.', Icon: Award, color: '#6938EF' },
    { label: 'Average position', value: '#1.8', desc: 'Average cited position when the brand appears.', Icon: TrendingUp, color: '#16A34A' },
    { label: 'AI responses', value: '112', desc: 'Latest prompt responses available for drill-down.', Icon: Bot, color: 'var(--primary-600)' },
    { label: 'Search volume', value: '1.9K', desc: 'Demand proxy carried through from the tracked prompt feed.', Icon: BarChart3, color: '#D97706' },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-gray-300 bg-white text-[14px] font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors">
            <Bot size={14} className="text-gray-400" />
            All AI engines
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-gray-300 bg-white text-[14px] font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors">
            <Calendar size={14} className="text-gray-400" />
            Last 30 days
            <ChevronDown size={14} className="text-gray-400" />
          </button>
        </div>
        <HLButton variant="primary" color="blue" size="sm">
          Add prompt
        </HLButton>
      </div>

      {/* Back link */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-700 transition-colors w-fit">
        <ArrowLeft size={14} />
        Back to Prompts
      </button>

      {/* Hero: prompt headline + KPI cards */}
      <div className="border border-gray-200 rounded-lg bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-[14px] font-medium border border-purple-200">AI Visibility</span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-success-50 text-success-600 text-[14px] font-medium border border-success-200">Winning</span>
          <span className="text-[12px] text-gray-400">Last 30 days</span>
          <span className="text-[12px] text-gray-400">US</span>
        </div>
        <h2 className="text-[20px] font-semibold text-gray-900 leading-snug mb-2">{prompt}</h2>
        <p className="text-[13px] text-gray-500 leading-relaxed max-w-3xl">This view separates trend analysis, AI response conversations, engine diagnostics, and prompt-level sources so each widget answers a different analysis question.</p>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-4 gap-3">
            {DETAIL_KPI.map(kpi => (
              <CountCard key={kpi.label} label={kpi.label} value={kpi.value} help helpContent={kpi.desc} Icon={kpi.Icon} iconColor={kpi.color} />
            ))}
          </div>
        </div>
      </div>

      {/* Prompt Visibility Trend chart */}
      <div className="border border-gray-200 rounded-lg bg-white p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-semibold text-gray-900">Prompt visibility trend</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">Prompt-level visibility by AI engine across the selected window</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
              {['Visibility', 'Mentions', 'Citations'].map(m => (
                <button key={m} onClick={() => setTrendMetric(m)}
                  className={`px-3 py-1.5 text-[14px] font-medium transition-colors ${trendMetric === m ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                  {m}
                </button>
              ))}
            </div>
            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
              {['7D', '28D', '3M'].map(p => (
                <button key={p} onClick={() => setTrendPeriod(p)}
                  className={`px-3 py-1.5 text-[14px] font-medium transition-colors ${trendPeriod === p ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}>
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
          <h3 className="text-[14px] font-semibold text-gray-900">AI Responses</h3>
          <p className="text-[13px] text-gray-500 mt-0.5">Latest prompt responses from tracked engines with drill-in answer analysis</p>
        </div>
        <div className="px-5 pb-5">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap w-[120px] border-r border-gray-200">AI</th>
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200">Chat</th>
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap w-[180px] border-r border-gray-200">Brands</th>
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap w-[72px] border-r border-gray-200">Sources</th>
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap w-[110px]">Created</th>
                </tr>
              </thead>
              <tbody>
                {AI_RESPONSES_DATA.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 border-r border-gray-100 align-top">
                      <div className="flex items-center gap-2">
                        <EngineLogo name={row.engine} size={16} className="w-7 h-7" />
                        <p className="text-[14px] font-semibold text-gray-900 m-0">{row.engine}</p>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-r border-gray-100 align-top">
                      <p className="text-[14px] text-gray-700 leading-relaxed mb-1">{row.text}</p>
                      <button type="button" className="text-[14px] text-primary-600 hover:underline">
                        Open full response
                      </button>
                    </td>
                    <td className="px-3 py-3 border-r border-gray-100 align-top">
                      <div className="flex flex-wrap gap-1">
                        {row.brands.map(b => <BrandPill key={b} name={b} highlight={b === 'GoHighLevel'} />)}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[14px] text-gray-700 border-r border-gray-100 align-top">{row.sources}</td>
                    <td className="px-3 py-3 text-[14px] text-gray-500 align-top">{row.created}</td>
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
            <h3 className="text-[14px] font-semibold text-gray-900">Prompt Sources</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">All detected sources for this prompt with a compact matrix of position, coverage, and mention signals</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
              {['Domain', 'URL'].map(v => (
                <button key={v} onClick={() => setSourcesView(v)}
                  className={`px-3 py-1.5 text-[14px] font-medium transition-colors ${sourcesView === v ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}>
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
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 min-w-[280px]">URL</th>
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[72px]">Open</th>
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[100px]">Avg position</th>
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[88px]">Coverage</th>
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[100px]">Seen in chats</th>
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[120px]">Brand mentioned</th>
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[150px]">Other brands mentioned</th>
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap w-[110px]">Last seen</th>
                </tr>
              </thead>
              <tbody>
                {PROMPT_SOURCES_DATA.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 border-r border-gray-100 max-w-[280px] overflow-hidden">
                      <TruncatedLink href={row.url}>{row.url}</TruncatedLink>
                    </td>
                    <td className="px-3 py-3 border-r border-gray-100">
                      <button className="flex items-center gap-1 text-[14px] text-primary-600 hover:underline whitespace-nowrap">
                        Open <ExternalLink size={11} />
                      </button>
                    </td>
                    <td className="px-3 py-3 text-[14px] text-gray-700 border-r border-gray-100">{row.avgPos}</td>
                    <td className="px-3 py-3 text-[14px] text-gray-700 border-r border-gray-100">{row.coverage}</td>
                    <td className="px-3 py-3 text-[14px] text-gray-700 border-r border-gray-100">{row.seenInChats}</td>
                    <td className="px-3 py-3 border-r border-gray-100">
                      {row.brandMentioned ? (
                        <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-success-600">
                          <Check size={12} strokeWidth={2.5} />Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[14px] font-medium text-gray-400">
                          <X size={12} strokeWidth={2.5} />No
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 border-r border-gray-100">
                      <span className={`text-[14px] font-medium ${row.otherBrands ? 'text-warning-600' : 'text-gray-400'}`}>
                        {row.otherBrands ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[14px] text-gray-500">{row.lastSeen}</td>
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

      {/* Row 2: Combined 6-metric card — sentence-case labels, ≤20px insights */}
      <div className="border border-gray-200 rounded-lg bg-white">
        <div className="grid grid-cols-3">
          {OVERVIEW_METRICS.map((m, i) => (
            <div
              key={m.label}
              className={`px-4 py-3 ${i < 3 ? 'border-b border-gray-100' : ''} ${i % 3 !== 2 ? 'border-r border-gray-100' : ''}`}
            >
              <p className="text-[12px] font-medium text-gray-500 mb-1.5 m-0 normal-case">{m.label}</p>
              <p className="text-[20px] font-semibold text-gray-900 leading-none mb-1.5 m-0">{m.value}</p>
              <p className="text-[12px] font-normal text-gray-500 leading-snug m-0">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Visibility Trend + Competitor Ranking */}
      <div className="grid gap-4 items-stretch" style={{ gridTemplateColumns: 'minmax(0, 59fr) minmax(0, 41fr)' }}>

        {/* Visibility Trend card */}
        <div className="border border-gray-200 rounded-lg bg-white p-4 min-w-0 overflow-hidden flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[14px] font-semibold text-gray-900 m-0">Visibility trend</h3>
              <SectionInfoTip
                id="asp-visibility-trend-info"
                content="Track how your brand's visibility, mentions, or citations change over time and compare performance against competitors."
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                {['Visibility', 'Mentions', 'Citations'].map(m => (
                  <button key={m} onClick={() => setTrendMetric(m)}
                    className={`px-2.5 py-1.5 text-[14px] font-medium transition-colors ${trendMetric === m ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                    {m}
                  </button>
                ))}
              </div>
              <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                {['7D', '28D', '3M'].map(p => (
                  <button key={p} onClick={() => setTrendPeriod(p)}
                    className={`px-2.5 py-1.5 text-[14px] font-medium transition-colors ${trendPeriod === p ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}>
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
          <MultiLineChart lines={trendLines} xLabels={TREND_X_LABELS} height={200} metricLabel={trendMetric} fill />
        </div>

        <CompetitorRankingMiniTable
          infoId="asp-competitor-ranking-info"
          infoContent="Compare your brand's visibility, average position, sentiment, and share of voice against tracked competitors."
          rows={COMPETITOR_RANKING_DATA}
        />
      </div>

      {/* Row 4: Engine Coverage */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="p-5">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[14px] font-semibold text-gray-900 m-0">Engine coverage</h3>
            <SectionInfoTip
              id="asp-engine-coverage-info"
              content="See how your brand performs across different AI search engines."
            />
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[216px]">Engine</th>
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[160px]">Visibility</th>
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[88px]">Presence</th>
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[140px]">Avg position</th>
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-[100px]">Citation rate</th>
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap">Insight</th>
                </tr>
              </thead>
              <tbody>
                {ENGINE_COVERAGE_DATA.map((eng, i) => (
                  <tr key={eng.name} className={`border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors`}>
                    <td className="px-3 py-3 border-r border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white text-[12px] font-bold shrink-0" style={{ background: eng.color }}>
                          {eng.abbr}
                        </span>
                        <div>
                          <p className="text-[14px] font-semibold text-gray-900">{eng.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-r border-gray-100">
                      <VisibilityMeter value={eng.vis} barWidth="120px" />
                    </td>
                    <td className="px-3 py-3 text-[14px] text-gray-700 border-r border-gray-100">{eng.presence}</td>
                    <td className="px-3 py-3 border-r border-gray-100">
                      <p className="text-[14px] font-semibold text-gray-900">{eng.avgPos}</p>
                      <p className="text-[12px] text-gray-400">{eng.urlsAnswer}</p>
                    </td>
                    <td className="px-3 py-3 text-[14px] text-gray-700 border-r border-gray-100">{eng.citRate}</td>
                    <td className="px-3 py-3 text-[14px] text-gray-500">{eng.insight}</td>
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
          <h3 className="text-[14px] font-semibold text-gray-900 m-0">How AI is describing GoHighLevel</h3>
          <SectionInfoTip
            id="asp-ai-describing-info"
            content="See how AI platforms describe your brand across detected mentions, from strong recommendations to negative or dismissive responses."
          />
        </div>

        {/* Segmented bar */}
        <div className="flex rounded-full overflow-hidden h-3 mb-3">
          {SENTIMENT_DATA.map(s => (
            <div key={s.label} style={{ width: `${s.value}%`, background: s.color }} />
          ))}
        </div>

        {/* Metric cells — color swatch maps each label to the bar segment above */}
        <div className="grid grid-cols-5 border border-gray-200 rounded-lg overflow-hidden mb-3">
          {SENTIMENT_DATA.map((s, i) => (
            <div key={s.label} className={i < SENTIMENT_DATA.length - 1 ? 'border-r border-gray-200' : ''}>
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} aria-hidden="true" />
                  <p className="text-[12px] font-medium text-gray-500 m-0 normal-case">{s.label}</p>
                </div>
              </div>
              <div className="px-3 py-2.5">
                <p className="text-[20px] font-semibold text-gray-900 leading-none m-0">{s.value}%</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[13px] font-normal text-gray-500 m-0">AI answers show mixed momentum. Stronger source coverage and clearer category proof can improve how GoHighLevel is framed.</p>
      </div>

      {/* Row 6: Organic-AI Overlap */}
      <div className="border border-gray-200 rounded-lg bg-white p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[14px] font-semibold text-gray-900 m-0">Organic-AI overlap</h3>
            <SectionInfoTip
              id="asp-organic-ai-overlap-info"
              content="See how much of your Google AI Overview visibility comes from pages that already rank in organic search."
            />
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-50 text-primary-600 text-[14px] font-medium border border-primary-200 whitespace-nowrap">
            5 shared URLs
          </span>
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns: '180px 200px 1fr' }}>
          {/* Overlap % */}
          <div className="border border-gray-200 rounded-lg px-3 py-3 bg-gray-50">
            <p className="text-[12px] font-medium text-gray-500 mb-1.5 m-0 normal-case">Overlap %</p>
            <p className="text-[14px] font-semibold text-gray-900 leading-none mb-1.5 m-0 tabular-nums">34%</p>
            <p className="text-[12px] font-normal text-gray-500 leading-snug m-0">High overlap means traditional SEO is feeding your AIO visibility.</p>
          </div>

          {/* Drift watch */}
          <div className="border border-gray-200 rounded-lg px-3 py-3 bg-gray-50">
            <p className="text-[12px] font-medium text-gray-500 mb-1.5 m-0 normal-case">Drift watch</p>
            <p className="text-[14px] font-semibold text-gray-900 leading-snug mb-1.5 m-0">2 prompts flagged</p>
            <p className="text-[12px] font-normal text-gray-500 leading-snug m-0">Watch prompts where overlap is slipping while AIO position is weakening.</p>
          </div>

          {/* Prompt list */}
          <div className="flex flex-col">
            {ORGANIC_OVERLAP_PROMPTS.map((item, i) => (
              <div key={i} className={`flex items-center gap-3 py-2 ${i < ORGANIC_OVERLAP_PROMPTS.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <p className="flex-1 text-[13px] font-normal text-gray-800 leading-snug min-w-0 m-0">{item.prompt}</p>
                <div className="flex items-center gap-2 shrink-0 text-right">
                  <div className="text-right">
                    <p className="text-[12px] font-medium text-gray-900 m-0">{item.overlap}</p>
                    <p className="text-[12px] font-normal text-gray-400 m-0">AIO position {item.aioPos}</p>
                  </div>
                  <span className={`text-[12px] font-medium whitespace-nowrap w-[80px] text-right ${item.status === 'Watch drift' ? 'text-warning-600' : 'text-success-600'}`}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 7: Top performing prompts — HighRise-style data table */}
      <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
        <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[14px] font-semibold text-gray-900 m-0">Top performing prompts</h3>
            <SectionInfoTip
              id="asp-top-prompts-info"
              content="See the prompts where your brand achieved the highest AI visibility during the selected date range."
            />
          </div>
          <span className="text-[13px] font-medium text-success-600 shrink-0">Top 5</span>
        </div>
        <div className="px-4 pb-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 w-12 normal-case">#</th>
                  <th className="px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap border-r border-gray-200 normal-case">Prompt</th>
                  <th className="px-3 py-2.5 text-right text-[14px] font-semibold text-gray-900 border-r border-gray-200 w-[110px] normal-case">Visibility</th>
                  <th className="px-3 py-2.5 text-right text-[14px] font-semibold text-gray-900 w-[130px] normal-case">
                    <span className="inline-flex items-center gap-1">
                      Trend score
                      <SectionInfoTip id="asp-trend-score-info" content="Change in visibility score over the selected period." />
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {TOP_PROMPTS_DATA.map(item => (
                  <tr key={item.rank} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 border-r border-gray-100 align-middle">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-[14px] font-semibold text-gray-600">
                        {item.rank}
                      </span>
                    </td>
                    <td className="px-3 py-3 border-r border-gray-100 align-middle">
                      <p className="text-[14px] font-medium text-gray-900 m-0 mb-1">{item.prompt}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[12px] font-medium border border-purple-200">
                          {item.tag}
                        </span>
                        <span className="text-[12px] text-gray-400">{item.volume}</span>
                        <span className="text-[12px] text-gray-400">{item.engines}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 border-r border-gray-100 align-middle text-right">
                      <span className="text-[16px] font-semibold text-gray-900 tabular-nums">{item.visibility}</span>
                    </td>
                    <td className="px-3 py-3 align-middle text-right">
                      <span className={`text-[14px] font-medium tabular-nums ${item.up ? 'text-success-600' : 'text-error-600'}`}>
                        {item.trendScore}
                      </span>
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

// ── Overview Tab ───────────────────────────────────────────────────────────

function OverviewContent() {
  const [comparisonView, setComparisonView] = useState('competitors')
  const isEngines = comparisonView === 'engines'
  const barItems = isEngines ? AI_ENGINES : COMPETITORS
  const maxPct = isEngines ? Math.max(...AI_ENGINES.map(e => e.pct)) : 25

  return (
    <div className="flex flex-col gap-4">

      {/* Hero: AI Presence score card */}
      <div className="border border-gray-200 rounded-xl bg-white flex overflow-hidden" style={{ height: '208px' }}>
        {/* Left — headline metric */}
        <div className="px-7 py-6 flex flex-col justify-between shrink-0 w-[320px]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-[14px] font-medium border border-purple-200 whitespace-nowrap self-start">
            <Sparkles size={11} />
            AI Presence
          </span>
          <div>
            <p className="text-[13px] text-gray-500 font-medium mb-2">Share of voice</p>
            <div className="flex items-end gap-2.5">
              <span className="text-[44px] font-bold text-gray-900 leading-[0.9] tracking-tight">14.20%</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 mb-1.5 rounded-full bg-success-50 text-success-600 text-[12px] font-semibold border border-success-200 whitespace-nowrap">
                <ArrowUp size={10} />
                6.8%
              </span>
            </div>
            <p className="text-[12px] text-gray-400 mt-2">vs previous period</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-gray-400 shrink-0" />
            <p className="text-[12px] text-gray-400">Data as of <span className="font-semibold text-gray-600">Apr 2026</span></p>
          </div>
        </div>

        {/* Right — 12-month trend, chart bleeds to the card edge */}
        <div className="flex-1 min-w-0 flex flex-col border-l border-gray-100 bg-gradient-to-b from-purple-50/40 to-transparent">
          <div className="px-7 pt-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
              <p className="text-[13px] font-medium text-gray-700">12-month trend</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 text-gray-500 text-[14px] font-medium border border-gray-200 whitespace-nowrap">
              <BarChart3 size={11} className="text-gray-400" />
              4 of 6 engines
            </span>
          </div>
          <div className="flex-1 min-h-0 w-full flex items-end">
            <Sparkline data={[6, 7, 8, 9, 8, 10, 11, 10, 12, 13, 12, 14, 13, 15, 14, 16]} color="#6938EF" width="100%" height={150} filled />
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-5 gap-3">
        {KPI_CARDS.map(kpi => (
          <CountCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            delta={kpi.change}
            deltaUp={kpi.up}
            description="vs previous period"
            Icon={kpi.Icon}
            iconColor={kpi.color}
            footer={<Sparkline data={kpi.data} color={kpi.color} width="100%" height={56} filled />}
          />
        ))}
      </div>

      {/* AI Presence Comparison */}
      <div className="border border-gray-200 rounded-lg bg-white p-5">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-[14px] font-semibold text-gray-900">AI Presence Comparison</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">Switch between competitor and engine views using the global presence mode selected above.</p>
          </div>
          <div className="flex items-center gap-0.5 border border-gray-200 rounded p-0.5 bg-gray-50 shrink-0">
            {['competitors', 'engines'].map(v => (
              <button
                key={v}
                onClick={() => setComparisonView(v)}
                className={`px-3 py-1.5 rounded text-[14px] font-medium transition-all ${
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
                  <p className="text-[12px] text-gray-400">{isEngines ? c.subtitle : c.domain}</p>
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-2 relative overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-primary-600 transition-all duration-500"
                    style={{ width: `${(c.pct / maxPct) * 100}%` }}
                  />
                </div>
                <span className="w-[56px] shrink-0 text-right text-[13px] font-semibold text-gray-900 tabular-nums">
                  {isEngines ? c.pct : c.pct.toFixed(2) + '%'}
                </span>
              </div>
            ))}
          </div>

          <div className="w-[196px] shrink-0 border border-gray-100 rounded-lg p-3 bg-gray-50">
            <p className="text-[12px] font-medium text-gray-500 mb-3">Metric logic</p>
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
            <h3 className="text-[14px] font-semibold text-gray-900">Topic Presence</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">Top topic clusters comparing the primary brand against tracked competitors across the analyzed answer set.</p>
          </div>
          <button className="px-3 py-1.5 rounded border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors shrink-0">
            View more
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed" style={{ minWidth: 760 }}>
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap w-[260px]">Topic</th>
                  {COMPETITORS.map(c => (
                    <th key={c.name} className="px-3 py-2.5 text-right text-[14px] font-semibold text-gray-900 whitespace-nowrap min-w-[96px]">
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOPIC_PRESENCE.map(row => (
                  <tr key={row.topic} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-[14px] font-medium text-gray-800">{row.topic}</td>
                    {row.scores.map((score, i) => (
                      <td key={i} className="px-3 py-3 text-[14px] text-gray-700 text-right tabular-nums">{score.toFixed(2)}%</td>
                    ))}
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

// ── Shared filter chip (multi-select) ─────────────────────────────────────

function FilterChipDropdown({ label, options, selected, onToggle, onSelectAll, dropdownRef, open, onOpen, onClose }) {
  const [search, setSearch] = useState('')
  const orderedSelected = options.filter(o => selected.has(o.id))
  const chipLabel = selected.size >= options.length
    ? 'All'
    : orderedSelected.length === 1
      ? orderedSelected[0].label
      : `${orderedSelected[0]?.label} +${orderedSelected.length - 1}`

  // Collapse when clicking anywhere outside the chip + menu
  useEffect(() => {
    if (!open) return
    function handleOutside(e) {
      if (dropdownRef?.current && !dropdownRef.current.contains(e.target)) {
        onClose()
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open, onClose, dropdownRef])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex items-center h-8 gap-1 pl-3 pr-1.5 rounded-full border border-gray-300 bg-white text-[14px] font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all select-none"
      >
        {label}
        <span className="mx-0.5 inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-[14px] font-medium text-gray-600 max-w-[120px] truncate">
          {chipLabel}
        </span>
        <span
          onClick={e => { e.stopPropagation(); onSelectAll(); onClose() }}
          className="w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <X size={11} />
        </span>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 bg-white border border-gray-200 rounded-xl z-30 p-1" style={{ minWidth: 200, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}>
          {options.length > 10 && (
            <div className="mb-1 pb-1 border-b border-gray-100">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-primary-600 bg-white">
                <Search size={12} className="text-gray-400 shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" className="flex-1 text-[14px] text-gray-700 placeholder:text-gray-400 outline-none bg-transparent" autoFocus />
              </div>
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <button onClick={onSelectAll} className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] text-gray-700 hover:bg-gray-50 transition-colors">
              All
            </button>
            {options
              .filter(o => options.length <= 10 || o.label.toLowerCase().includes(search.toLowerCase()))
              .map(opt => {
                const checked = selected.has(opt.id)
                return (
                  <button key={opt.id} onClick={() => onToggle(opt.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[14px] transition-colors ${checked ? 'bg-primary-50' : 'hover:bg-gray-50'}`}
                  >
                    <span className={checked ? 'text-primary-700 font-semibold' : 'text-gray-700'}>{opt.label}</span>
                    {checked && <Check size={13} className="text-primary-600 shrink-0" />}
                  </button>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Filter constants ────────────────────────────────────────────────────────

const TYPE_FILTER_OPTIONS = [
  { id: 'Mention', label: 'Mention' },
  { id: 'Link',    label: 'Link'    },
]

const ALL_PROMPT_BRANDS = [...new Set(
  PROMPT_TOPICS.flatMap(t => t.children.flatMap(c => c.brands))
)].sort()

const CITING_TOPIC_OPTIONS = [...new Set(
  CITING_DOMAINS_DATA.flatMap(d => d.children.map(c => c.topic))
)].sort().map(t => ({ id: t, label: t }))

// HARDCODED: suggested prompts for Track prompt modal (prototyping)
const SUGGESTED_PROMPTS = [
  {
    prompt: 'What is the best all-in-one marketing platform for agencies?',
    topic: 'Marketing automation for agencies',
    volume: '11.8K volume',
  },
  {
    prompt: 'Best CRM for agencies that need pipeline automation and client communication',
    topic: 'CRM and pipeline automation',
    volume: '8.9K volume',
  },
  {
    prompt: 'What tool is best for landing pages, funnels, and automated lead capture?',
    topic: 'Lead capture and funnel builder',
    volume: '7.4K volume',
  },
  {
    prompt: 'Best appointment scheduling tools for small business owners',
    topic: 'Appointment scheduling and calendar sync',
    volume: '5.2K volume',
  },
]

function inferTopicFromPrompt(text) {
  const t = text.trim().toLowerCase()
  if (!t) return null
  const hit = SUGGESTED_PROMPTS.find(s => s.prompt.toLowerCase() === t)
  if (hit) return hit.topic
  if (t.includes('crm') || t.includes('pipeline')) return 'CRM and pipeline automation'
  if (t.includes('funnel') || t.includes('landing') || t.includes('lead capture')) return 'Lead capture and funnel builder'
  if (t.includes('appointment') || t.includes('calendar') || t.includes('schedul')) return 'Appointment scheduling and calendar sync'
  if (t.includes('sms') || t.includes('omnichannel') || t.includes('follow-up')) return 'SMS and omnichannel follow-up'
  if (t.includes('agency') || t.includes('marketing platform') || t.includes('all-in-one')) return 'Marketing automation for agencies'
  return 'Custom tracking'
}

// ── Track prompt modal ─────────────────────────────────────────────────────

function TrackPromptModal({ onClose, onSave }) {
  const [promptText, setPromptText] = useState('')
  const [selectedSuggestion, setSelectedSuggestion] = useState(null)
  const topic = inferTopicFromPrompt(promptText)
  const canSave = promptText.trim().length > 0

  function selectSuggestion(item) {
    setSelectedSuggestion(item.prompt)
    setPromptText(item.prompt)
  }

  function handlePromptChange(value) {
    setPromptText(value)
    const match = SUGGESTED_PROMPTS.find(s => s.prompt === value)
    setSelectedSuggestion(match ? match.prompt : null)
  }

  function handleSave() {
    if (!canSave) return
    onSave({
      prompt: promptText.trim(),
      topic: topic || 'Custom tracking',
    })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-gray-900/40" aria-hidden="true" />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[920px] max-h-[calc(100vh-48px)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-[16px] font-semibold text-gray-900 m-0">Track prompt</h2>
                <SectionInfoTip content="Track a customer-style question across AI answer engines and group it under a topic." />
              </div>
              <p className="text-[14px] font-normal text-gray-500 m-0 mt-1">
                Add a new question to the prompt workspace and preview how it will be categorized.
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
                  onChange={e => handlePromptChange(e.target.value)}
                  placeholder="Ask a customer-style question you want to track across AI answer engines."
                  rows={6}
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-3 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary-600 resize-y min-h-[140px]"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <p className="text-[12px] font-medium text-gray-500 m-0">Auto-tagged topic</p>
                  <SectionInfoTip content="Topics are inferred from the prompt language and aligned to the closest prompt cluster in this screen." />
                </div>
                <div className="border border-gray-200 rounded-lg px-3.5 py-3 min-h-[48px] flex items-center">
                  {topic ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-[14px] font-medium border border-primary-200">
                      {topic}
                    </span>
                  ) : (
                    <p className="text-[13px] font-normal text-gray-400 m-0">
                      Start typing or choose a suggestion to assign a topic automatically.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: suggestions */}
            <div className="min-w-0 flex flex-col">
              <div className="flex items-center gap-1.5 mb-2">
                <p className="text-[12px] font-medium text-gray-500 m-0">Suggested prompts</p>
                <SectionInfoTip content="These suggestions are ready-to-track prompt ideas mapped to the same topic taxonomy used by the prompt table." />
              </div>
              <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[360px] pr-0.5">
                {SUGGESTED_PROMPTS.map(item => {
                  const active = selectedSuggestion === item.prompt
                  return (
                    <button
                      key={item.prompt}
                      type="button"
                      onClick={() => selectSuggestion(item)}
                      className={`w-full text-left rounded-lg border bg-white px-3.5 py-3 transition-colors ${
                        active
                          ? 'border-primary-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-medium border border-purple-200">
                          {item.topic}
                        </span>
                        <span className="text-[12px] font-normal text-gray-400">{item.volume}</span>
                      </div>
                      <p className="text-[13px] font-medium text-gray-900 m-0 leading-snug">{item.prompt}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className={BTN_SECONDARY}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave}
            onClick={handleSave}
            className={BTN_PRIMARY}
          >
            Save prompt
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ── Prompts Tab ────────────────────────────────────────────────────────────

function PromptsContent() {
  const [topics, setTopics] = useState(() => PROMPT_TOPICS.map(t => ({
    ...t,
    children: t.children.map(c => ({ ...c })),
  })))
  const [expanded, setExpanded] = useState(new Set([1]))
  const [searchQuery, setSearchQuery] = useState('')
  const [detailPrompt, setDetailPrompt] = useState(null)
  const [showTrackModal, setShowTrackModal] = useState(false)
  const [successAlert, setSuccessAlert] = useState(null)
  const alertTimer = useRef(null)

  const [typeFilter, setTypeFilter]   = useState(new Set(['Mention', 'Link']))
  const brandIds = [...new Set(topics.flatMap(t => t.children.flatMap(c => c.brands)))].sort()
  const [brandFilter, setBrandFilter] = useState(() => new Set(ALL_PROMPT_BRANDS))
  const [typeDropOpen, setTypeDropOpen]   = useState(false)
  const [brandDropOpen, setBrandDropOpen] = useState(false)
  const typeDropRef  = useRef(null)
  const brandDropRef = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (typeDropOpen  && typeDropRef.current  && !typeDropRef.current.contains(e.target))  setTypeDropOpen(false)
      if (brandDropOpen && brandDropRef.current && !brandDropRef.current.contains(e.target)) setBrandDropOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [typeDropOpen, brandDropOpen])

  function toggleTypeFilter(id) {
    setTypeFilter(prev => { const n = new Set(prev); if (n.has(id)) { if (n.size === 1) return prev; n.delete(id) } else n.add(id); return n })
  }
  function toggleBrandFilter(id) {
    setBrandFilter(prev => { const n = new Set(prev); if (n.has(id)) { if (n.size === 1) return prev; n.delete(id) } else n.add(id); return n })
  }

  function toggleRow(id) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function showToast(message) {
    if (alertTimer.current) clearTimeout(alertTimer.current)
    setSuccessAlert(message)
    alertTimer.current = setTimeout(() => setSuccessAlert(null), 5000)
  }

  function handleSaveTrackedPrompt({ prompt, topic }) {
    const childId = Date.now()
    // HARDCODED: seed values for newly tracked prompts in the prototype
    const newChild = {
      id: childId,
      prompt,
      type: 'Mention',
      brands: ['GoHighLevel', 'HubSpot', 'Salesforce', 'Klaviyo'],
      extraBrands: 2,
      engine: { abbr: 'AO', label: 'AI overview', color: '#0891B2' },
    }

    const existing = topics.find(t => t.topic.toLowerCase() === topic.toLowerCase())
    const expandId = existing
      ? existing.id
      : Math.max(0, ...topics.map(t => t.id)) + 1

    setTopics(prev => {
      const idx = prev.findIndex(t => t.topic.toLowerCase() === topic.toLowerCase())
      if (idx >= 0) {
        return prev.map((t, i) => {
          if (i !== idx) return t
          return {
            ...t,
            prompts: t.prompts + 1,
            children: [newChild, ...t.children],
          }
        })
      }

      return [{
        id: expandId,
        topic,
        size: '1.2K',
        prompts: 1,
        types: ['Mention'],
        presence: '1 (12.00%)',
        brands: 4,
        engines: [{ abbr: 'AO', label: 'AI overview', color: '#0891B2' }],
        children: [newChild],
      }, ...prev]
    })

    setExpanded(e => new Set([...e, expandId]))
    setShowTrackModal(false)
    showToast('The prompt was successfully saved.')
  }

  const brandFilterOptions = brandIds.map(b => ({ id: b, label: b }))

  const filtered = topics.filter(t => {
    const matchSearch = !searchQuery || t.topic.toLowerCase().includes(searchQuery.toLowerCase())
    const matchType   = typeFilter.size >= 2 || t.types.some(ty => typeFilter.has(ty))
    const matchBrand  = brandFilter.size === 0 || brandFilter.size >= brandIds.length ||
      t.children.some(c => c.brands.some(b => brandFilter.has(b)))
    return matchSearch && matchType && matchBrand
  })

  const thClass = "relative px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap bg-gray-50 border-b border-r border-gray-200 whitespace-nowrap overflow-hidden"
  const tdClass = "px-3 py-3 text-[14px] text-gray-700 border-b border-r border-gray-200 align-middle"
  const { widths: colW, onResizeStart } = useColumnResize([28, 260, 72, 96, 106, 168, 120])

  if (detailPrompt !== null) {
    return <PromptDetailContent prompt={detailPrompt} onBack={() => setDetailPrompt(null)} />
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden relative">
      {successAlert && createPortal(
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 px-4 py-3 bg-success-50 rounded-lg shadow-lg min-w-[340px] max-w-[560px]"
          style={{ border: '1px solid #16A34A' }}
        >
          <CircleCheck size={15} className="text-success-600 shrink-0" />
          <p className="text-[13px] font-medium text-success-700 flex-1">{successAlert}</p>
          <button
            type="button"
            onClick={() => { setSuccessAlert(null); clearTimeout(alertTimer.current) }}
            className="shrink-0 text-success-600 hover:text-success-700 transition-colors p-0.5"
          >
            <X size={13} />
          </button>
        </div>,
        document.body,
      )}

      {showTrackModal && (
        <TrackPromptModal
          onClose={() => setShowTrackModal(false)}
          onSave={handleSaveTrackedPrompt}
        />
      )}

      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-semibold text-gray-900">Prompt universe</h3>
            <p className="text-[13px] text-gray-500 mt-0.5">Topic-grouped prompts with drill-downs for answer visibility, citations, and competing brands.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowTrackModal(true)}
            className={`${BTN_PRIMARY} shrink-0`}
          >
            <TrendingUp size={14} />
            Track prompts
          </button>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-1.5 px-3 h-8 rounded-full border border-gray-300 bg-white text-[14px] font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors whitespace-nowrap">
              <Plus size={13} className="text-gray-500" />
              Add filter
            </button>
            <button className="inline-flex items-center h-8 gap-1 pl-3 pr-2.5 rounded-full border border-gray-300 bg-white text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <span className="text-gray-400 text-[12px] font-normal mr-0.5">Grouping:</span>
              Topic
              <ChevronDown size={12} className="text-gray-400 ml-0.5" />
            </button>
            <FilterChipDropdown
              label="Type"
              options={TYPE_FILTER_OPTIONS}
              selected={typeFilter}
              onToggle={toggleTypeFilter}
              onSelectAll={() => setTypeFilter(new Set(['Mention', 'Link']))}
              dropdownRef={typeDropRef}
              open={typeDropOpen}
              onOpen={() => setTypeDropOpen(true)}
              onClose={() => setTypeDropOpen(false)}
            />
            <FilterChipDropdown
              label="Brands"
              options={brandFilterOptions}
              selected={brandFilter}
              onToggle={toggleBrandFilter}
              onSelectAll={() => setBrandFilter(new Set(brandIds))}
              dropdownRef={brandDropRef}
              open={brandDropOpen}
              onOpen={() => setBrandDropOpen(true)}
              onClose={() => setBrandDropOpen(false)}
            />
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
                <th className={thClass} style={{ width: colW[0] }} />
                <th className={thClass} style={{ width: colW[1] }}><span className="flex items-center gap-1">Topic <Info size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => onResizeStart(e, 1)} /></th>
                <th className={thClass} style={{ width: colW[2] }}><span className="flex items-center gap-1">Topic size <Info size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => onResizeStart(e, 2)} /></th>
                <th className={thClass} style={{ width: colW[3] }}><span className="flex items-center gap-1">Type <Info size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => onResizeStart(e, 3)} /></th>
                <th className={thClass} style={{ width: colW[4] }}><span className="flex items-center gap-1">Presence <Info size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => onResizeStart(e, 4)} /></th>
                <th className={thClass} style={{ width: colW[5] }}><span className="flex items-center gap-1">Brands <Info size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => onResizeStart(e, 5)} /></th>
                <th className={`${thClass} border-r-0`} style={{ width: colW[6] }}>AI engines</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(row => (
                <Fragment key={row.id}>
                  <tr className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => toggleRow(row.id)}>
                    <td className={`${tdClass} text-center`}>
                      <button type="button" className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 transition-colors">
                        {expanded.has(row.id)
                          ? <ChevronDown size={13} className="text-gray-500" />
                          : <ChevronRight size={13} className="text-gray-500" />
                        }
                      </button>
                    </td>
                    <td className={tdClass}>
                      <p className="text-[14px] font-semibold text-gray-900 break-words">{row.topic}</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">{row.prompts} prompts</p>
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
                        <p className="text-[14px] text-gray-800 leading-relaxed break-words">{child.prompt}</p>
                        <button
                          type="button"
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
                </Fragment>
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
  const citTh = "relative px-3 py-2.5 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap bg-gray-50 border-b border-r border-gray-200 whitespace-nowrap overflow-hidden"

  const [citTypeFilter,  setCitTypeFilter]  = useState(new Set(['Mention', 'Link']))
  const [citTopicFilter, setCitTopicFilter] = useState(new Set(CITING_TOPIC_OPTIONS.map(o => o.id)))
  const [citTypeDropOpen,  setCitTypeDropOpen]  = useState(false)
  const [citTopicDropOpen, setCitTopicDropOpen] = useState(false)
  const citTypeDropRef  = useRef(null)
  const citTopicDropRef = useRef(null)

  useEffect(() => {
    function onDoc(e) {
      if (citTypeDropOpen  && citTypeDropRef.current  && !citTypeDropRef.current.contains(e.target))  setCitTypeDropOpen(false)
      if (citTopicDropOpen && citTopicDropRef.current && !citTopicDropRef.current.contains(e.target)) setCitTopicDropOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [citTypeDropOpen, citTopicDropOpen])

  function toggleCitTypeFilter(id) {
    setCitTypeFilter(prev => { const n = new Set(prev); if (n.has(id)) { if (n.size === 1) return prev; n.delete(id) } else n.add(id); return n })
  }
  function toggleCitTopicFilter(id) {
    setCitTopicFilter(prev => { const n = new Set(prev); if (n.has(id)) { if (n.size === 1) return prev; n.delete(id) } else n.add(id); return n })
  }

  function toggleRow(id) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = CITING_DOMAINS_DATA.filter(d => {
    const matchSearch = !searchQuery || d.domain.toLowerCase().includes(searchQuery.toLowerCase())
    const matchType   = citTypeFilter.size >= 2 || d.types.some(t => citTypeFilter.has(t))
    const matchTopic  = citTopicFilter.size >= CITING_TOPIC_OPTIONS.length ||
      d.children.some(c => citTopicFilter.has(c.topic))
    return matchSearch && matchType && matchTopic
  })

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-[14px] font-semibold text-gray-900">Citing domains</h3>
          <p className="text-[13px] text-gray-500 mt-0.5">Domain-level citation visibility plus expandable page detail for in-scope prompt coverage.</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-1.5 px-3 h-8 rounded-full border border-gray-300 bg-white text-[14px] font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors whitespace-nowrap">
              <Plus size={13} className="text-gray-500" />
              Add filter
            </button>
            <button className="inline-flex items-center h-8 gap-1 pl-3 pr-2.5 rounded-full border border-gray-300 bg-white text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap">
              <span className="text-gray-400 text-[12px] font-normal mr-0.5">Grouping:</span>
              Domain
              <ChevronDown size={12} className="text-gray-400 ml-0.5" />
            </button>
            <FilterChipDropdown
              label="Type"
              options={TYPE_FILTER_OPTIONS}
              selected={citTypeFilter}
              onToggle={toggleCitTypeFilter}
              onSelectAll={() => setCitTypeFilter(new Set(['Mention', 'Link']))}
              dropdownRef={citTypeDropRef}
              open={citTypeDropOpen}
              onOpen={() => setCitTypeDropOpen(true)}
              onClose={() => setCitTypeDropOpen(false)}
            />
            <FilterChipDropdown
              label="Topics"
              options={CITING_TOPIC_OPTIONS}
              selected={citTopicFilter}
              onToggle={toggleCitTopicFilter}
              onSelectAll={() => setCitTopicFilter(new Set(CITING_TOPIC_OPTIONS.map(o => o.id)))}
              dropdownRef={citTopicDropRef}
              open={citTopicDropOpen}
              onOpen={() => setCitTopicDropOpen(true)}
              onClose={() => setCitTopicDropOpen(false)}
            />
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
                <th className={citTh} style={{ width: citW[1] }}><span className="flex items-center gap-1">Domain <Info size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => citResize(e, 1)} /></th>
                <th className={citTh} style={{ width: citW[2] }}><span className="flex items-center gap-1">Citations <Info size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => citResize(e, 2)} /></th>
                <th className={citTh} style={{ width: citW[3] }}><span className="flex items-center gap-1">Type <Info size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => citResize(e, 3)} /></th>
                <th className={citTh} style={{ width: citW[4] }}><span className="flex items-center gap-1">Co-mention <Info size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => citResize(e, 4)} /></th>
                <th className={citTh} style={{ width: citW[5] }}><span className="flex items-center gap-1">DT <Info size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => citResize(e, 5)} /></th>
                <th className={citTh} style={{ width: citW[6] }}><span className="flex items-center gap-1">Org. traffic <Info size={11} className="text-gray-400" /></span><ResizeHandle onMouseDown={e => citResize(e, 6)} /></th>
                <th className={`${citTh} border-r-0`} style={{ width: citW[7] }}><span className="flex items-center gap-1">Topics <Info size={11} className="text-gray-400" /></span></th>
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
                      <TruncatedCell className="text-[14px] font-semibold text-gray-900">{row.domain}</TruncatedCell>
                      <p className="text-[12px] text-gray-400 mt-0.5">{row.pages.toLocaleString()} pages</p>
                    </td>
                    <td className="px-3 py-3 text-[14px] text-gray-700 border-b border-r border-gray-200 align-middle">{row.citations}</td>
                    <td className="px-3 py-3 border-b border-r border-gray-200 align-middle"><div className="flex items-center gap-1 flex-wrap">{row.types.map(t => <TypeBadge key={t} type={t} />)}</div></td>
                    <td className="px-3 py-3 text-[14px] text-gray-700 border-b border-r border-gray-200 align-middle">{row.coMention}</td>
                    <td className="px-3 py-3 text-[14px] text-gray-700 border-b border-r border-gray-200 align-middle">{row.dt}</td>
                    <td className="px-3 py-3 text-[14px] text-gray-700 border-b border-r border-gray-200 align-middle">{row.orgTraffic}</td>
                    <td className="px-3 py-3 text-[14px] text-gray-500 border-b border-gray-200 align-middle overflow-hidden">
                      <TruncatedCell>{row.topics}</TruncatedCell>
                    </td>
                  </tr>

                  {expanded.has(row.id) && row.children.map((child, i) => (
                    <tr key={i} className="bg-gray-50 hover:bg-white transition-colors">
                      <td className="border-b border-r border-gray-200" />
                      <td className="px-3 py-3 border-b border-r border-gray-200 align-middle overflow-hidden">
                        <TruncatedLink href={child.page}>{child.page}</TruncatedLink>
                      </td>
                      <td className="px-3 py-3 text-[14px] text-gray-700 border-b border-r border-gray-200 align-middle">{child.pageCitations}</td>
                      <td className="px-3 py-3 border-b border-r border-gray-200 align-middle"><TypeBadge type={child.type} /></td>
                      <td className="px-3 py-3 text-[14px] text-gray-700 border-b border-r border-gray-200 align-middle">{child.coMention}</td>
                      <td className="px-3 py-3 text-[14px] text-gray-700 border-b border-r border-gray-200 align-middle">{child.pt}</td>
                      <td className="px-3 py-3 text-[14px] text-gray-700 border-b border-r border-gray-200 align-middle">{child.orgTraffic}</td>
                      <td className="px-3 py-3 text-[14px] text-gray-500 border-b border-gray-200 align-middle overflow-hidden">
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
  { id: 'overview',  label: 'Overview',  icon: LayoutDashboard },
  { id: 'prompts',   label: 'Prompts',   icon: MessageCircle },
  { id: 'citations', label: 'Citations', icon: Globe         },
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
            <button className={BTN_PRIMARY}>
              <Plus size={14} />
              Add competitors
            </button>
          </div>
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
                <span className={`flex items-center gap-1.5 px-3 py-2.5 rounded-md text-[14px] font-medium transition-colors ${
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
