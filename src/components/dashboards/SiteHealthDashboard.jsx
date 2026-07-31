import { useState, useRef, useEffect } from 'react'
import {
  Globe, RefreshCw, RefreshCw02, Download, AlertTriangle, ChevronRight, ChevronDown,
  Link2, Code2, BarChart3, ArrowUp, CircleCheck, CircleX, Info, X, FileText, Clock,
  ImageIcon, TrendingUp, Award, Check, Star, Calendar, ExternalLink,
  Plus, Minus, Search, Zap, LayoutDashboard, Package, Sparkles, Settings, Pencil, Trash2, Copy,
} from '../../icons/index.js'
import CountCard from '../CountCard.jsx'
import AdvancedFilterDrawer from '../AdvancedFilterDrawer.jsx'
import ConnectFixesModal from '../implement/ConnectFixesModal.jsx'
import HLModal from '../HLModal.jsx'

// HighRise-style expandable table: expand + checkbox columns stay one vertical line
// across parent rows and expanded nested content (HLDataTable expanded-row pattern).
const TABLE_EXPAND_COL = 40
const TABLE_CHECK_COL = 40
const TABLE_CHECKBOX_PX = 15
const tableCheckboxStyle = {
  accentColor: '#155EEF',
  width: TABLE_CHECKBOX_PX,
  height: TABLE_CHECKBOX_PX,
  cursor: 'pointer',
  flexShrink: 0,
}

// Native checkboxes only render the "dash" via the DOM indeterminate property,
// so drive it through a ref (used by the Crawled pages select-all header).
function TableCheckbox({ checked, indeterminate = false, onChange }) {
  const ref = useRef(null)
  useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate }, [indeterminate])
  return <input ref={ref} type="checkbox" checked={checked} onChange={onChange} style={tableCheckboxStyle} />
}

// ─── Data ───────────────────────────────────────────────────────────────────

const SCAN_OPTIONS = [
  { label: 'May 14, 2026', score: 74, delta: +4, errors: 14, warnings: 22, notices: 48, pages: 1000, findings: 84 },
  { label: 'May 10, 2026', score: 70, delta: +5, errors: 17, warnings: 18, notices: 48, pages: 1000, findings: 88 },
  { label: 'Apr 28, 2026', score: 65, delta: -2, errors: 21, warnings: 24, notices: 51, pages:  985, findings: 97 },
  { label: 'Apr 14, 2026', score: 61, delta: +3, errors: 28, warnings: 31, notices: 53, pages:  971, findings: 112 },
  { label: 'Mar 31, 2026', score: 57, delta: -1, errors: 34, warnings: 38, notices: 56, pages:  960, findings: 128 },
]

const CURRENT_SCAN  = SCAN_OPTIONS[0].label
const PREVIOUS_SCAN = SCAN_OPTIONS[1].label

const HEALTH = { score: 74, prev: 70, delta: 4 }

const RESULTS_BY_TYPE = [
  { label: 'Errors',   count: 14, prev: 17, color: '#DC2626' },
  { label: 'Warnings', count: 22, prev: 18, color: '#D97706' },
  { label: 'Notices',  count: 48, prev: 48, color: 'var(--primary-600)' },
]

const TOTAL_PAGES   = 1000
const HEALTHY_PAGES = 977
const ISSUE_PAGES   = 23

const FIX_COVERAGE = [
  { label: 'Auto fix',     value: 39, effort: 'Low effort',           color: '#16A34A',            accent: '#F0FDF4',             effortColor: 'text-success-600'  },
  { label: 'Assisted fix', value: 11, effort: 'Medium effort',        color: 'var(--primary-600)', accent: 'var(--primary-50)',   effortColor: 'text-warning-600'  },
  { label: 'Manual fix',   value: 8,  effort: 'Manual work required', color: '#D97706',            accent: 'var(--warning-100)',  effortColor: 'text-error-600'    },
  { label: 'Advisory',     value: 13, effort: 'Optional',             color: 'var(--purple-600)',  accent: 'var(--purple-50)',    effortColor: 'text-purple-600'   },
]
const RESOLUTION_PROGRESS = 28

const INDEXABLE     = 977
const NOT_INDEXABLE = 23
const REDIRECTING   = 2
const CANONICALIZED = 1

const CRAWL_KPIS = [
  { label: 'Pages crawled',     value: '1,000', delta: 1.6,  deltaPositive: true,  spark: [960,971,985,1000,1000]    },
  { label: 'Found links',       value: '2,847', delta: 2.4,  deltaPositive: true,  spark: [2400,2512,2650,2780,2847] },
  { label: 'Resources scanned', value: '156',   delta: 0.6,  deltaPositive: true,  spark: [142,148,151,155,156]      },
  { label: 'Avg response time', value: '1.2 s', delta: 7.7,  deltaPositive: true,  spark: [1.8,1.6,1.5,1.3,1.2]     },
  { label: 'Redirecting pages', value: '2',     delta: 33.3, deltaPositive: true,  spark: [5,4,3,3,2]                },
]

const TOP_FINDINGS = [
  { title: 'Missing meta descriptions',   severity: 'high',     pages: 124, impact: 'High impact',   effort: 'Easy fix',   catId: 'metatags',     findingId: 'm2'  },
  { title: 'Missing LocalBusiness schema',severity: 'critical', pages: 31,  impact: 'High impact',   effort: 'Medium fix', catId: 'content',      findingId: 'cs2' },
  { title: 'Broken internal links',       severity: 'medium',   pages: 34,  impact: 'Medium impact', effort: 'Easy fix',   catId: 'redirects',    findingId: 'r1'  },
  { title: 'LCP above 4 s threshold',    severity: 'high',     pages: 12,  impact: 'High impact',   effort: 'Hard fix',   catId: 'speed',        findingId: 'sp1' },
  { title: 'Pages blocked by robots.txt', severity: 'high',     pages: 6,   impact: 'High impact',   effort: 'Easy fix',   catId: 'crawlability', findingId: 'c9'  },
]

const HTTP_CODES = [
  { code: '1XX', count: 0,   color: 'var(--gray-400)' },
  { code: '2XX', count: 977, color: '#16A34A' },
  { code: '3XX', count: 2,   color: '#D97706' },
  { code: '4XX', count: 14,  color: '#DC2626' },
  { code: '5XX', count: 7,   color: 'var(--purple-600)' },
]

const DOMAIN_METRICS = [
  { label: 'Domain trust',      value: '42'           },
  { label: 'Backlinks',         value: '1,284'        },
  { label: 'Referring domains', value: '89'           },
  { label: 'Pages in Google',   value: '142'          },
  { label: 'Domain expiry',     value: 'Dec 15, 2026' },
]

const LINK_ATTRIBUTES = [
  { label: 'Internal dofollow',  count: 1847, color: 'var(--primary-600)' },
  { label: 'Internal nofollow',  count: 23,   color: '#D97706' },
  { label: 'External dofollow',  count: 412,  color: 'var(--primary-600)' },
  { label: 'External nofollow',  count: 156,  color: '#D97706' },
]

const ROBOTS_META = [
  { label: 'Index & follow',    count: 977, color: '#16A34A' },
  { label: 'Noindex & follow',  count: 3,   color: '#D97706' },
  { label: 'Index & nofollow',  count: 0,   color: 'var(--primary-600)' },
  { label: 'Noindex & nofollow',count: 14,  color: '#DC2626' },
  { label: 'No robots tag',     count: 6,   color: 'var(--gray-400)' },
]

const REDIRECT_PROFILE = [
  { label: '0 redirects', count: 998, color: 'var(--primary-600)' },
  { label: '1 redirect',  count: 2,   color: 'var(--purple-600)' },
  { label: '2+ redirects',count: 0,   color: '#D97706' },
]

const CORE_WEB_VITALS = [
  { label: 'LCP', value: '4.2 s',  pass: false, threshold: '< 2.5 s' },
  { label: 'CLS', value: '0.08',   pass: true,  threshold: '< 0.1'   },
  { label: 'INP', value: '210 ms', pass: false, threshold: '< 200 ms'},
]

const CWV_RANGES     = { LCP: 6, CLS: 0.25, INP: 500 }
const CWV_THRESHOLDS = { LCP: 2.5, CLS: 0.1, INP: 200 }

const SEVERITY_STYLE = {
  critical: { bar: '#DC2626', bg: 'bg-error-50',    text: 'text-error-600',   border: 'border-error-200',   label: 'Critical' },
  high:     { bar: '#D97706', bg: 'bg-warning-100', text: 'text-warning-600', border: 'border-warning-200', label: 'High'     },
  medium:   { bar: 'var(--primary-600)', bg: 'bg-primary-50',  text: 'text-primary-600', border: 'border-blue-200',    label: 'Medium'   },
  low:      { bar: 'var(--gray-400)', bg: 'bg-gray-100',    text: 'text-gray-500',    border: 'border-gray-200',    label: 'Low'      },
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

function Badge({ label, color = 'gray' }) {
  const map = {
    green:  'bg-success-50 text-success-700 border-success-200',
    red:    'bg-error-50 text-error-600 border-error-200',
    yellow: 'bg-warning-100 text-warning-600 border-warning-200',
    blue:   'bg-primary-50 text-primary-600 border-blue-200',
    gray:   'bg-gray-100 text-gray-500 border-gray-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[12px] font-medium ${map[color] || map.gray}`}>
      {label}
    </span>
  )
}

function Delta({ value, positive }) {
  const up = positive !== undefined ? positive : value > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[12px] font-semibold ${up ? 'text-success-600' : 'text-error-600'}`}>
      <ArrowUp size={11} style={up ? {} : { transform: 'rotate(180deg)' }} />
      {Math.abs(value)}
    </span>
  )
}

function SectionCard({ children, className = '' }) {
  return (
    <div className={`border border-gray-200 rounded-lg bg-white min-w-0 ${className}`}>
      {children}
    </div>
  )
}

// Reusable in-card error state for a widget that failed to load its data.
// Any widget can render this in place of its content: status === 'error' ? <WidgetErrorState onRetry={...} /> : <content>
function WidgetErrorState({ onRetry, retryLabel = 'Re-scan', title = "We couldn't load this widget", message = 'Something went wrong while loading the data. Please try again.' }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-10 px-4 min-h-[180px]">
      <div className="w-11 h-11 rounded-full bg-error-50 flex items-center justify-center">
        <AlertTriangle size={20} className="text-error-600" />
      </div>
      <div className="max-w-[260px]">
        <p className="text-[14px] font-semibold text-gray-900 mb-1">{title}</p>
        <p className="text-[13px] text-gray-400 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <RefreshCw size={13} /> {retryLabel}
        </button>
      )}
    </div>
  )
}

// ─── Chart primitives ────────────────────────────────────────────────────────

function RadialGauge({ score, delta }) {
  const size = 160, sw = 14, r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const pct = Math.min(score / 100, 1)
  const color = score >= 80 ? '#16A34A' : score >= 60 ? '#D97706' : '#DC2626'
  const bandLabel = score >= 80 ? 'Good' : score >= 60 ? 'Fair' : 'Poor'
  const bandColor = score >= 80 ? '#15803D' : score >= 60 ? 'var(--warning-700)' : 'var(--error-800)'
  const bandBg   = score >= 80 ? '#F0FDF4' : score >= 60 ? 'var(--warning-100)' : '#FEF2F2'
  // Target marker at 90/100
  const targetAngle = (-Math.PI / 2) + (0.9 * 2 * Math.PI)
  const tXo = (size/2) + (r + sw/2 + 3) * Math.cos(targetAngle)
  const tYo = (size/2) + (r + sw/2 + 3) * Math.sin(targetAngle)
  const tXi = (size/2) + (r - sw/2 - 3) * Math.cos(targetAngle)
  const tYi = (size/2) + (r - sw/2 - 3) * Math.sin(targetAngle)
  // Endpoint dot on score arc
  const endAngle = -Math.PI / 2 + pct * 2 * Math.PI
  const ex = parseFloat(((size/2) + r * Math.cos(endAngle)).toFixed(2))
  const ey = parseFloat(((size/2) + r * Math.sin(endAngle)).toFixed(2))
  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
          {/* Track */}
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F2F4F7" strokeWidth={sw} />
          {/* Score arc */}
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
            strokeDasharray={`${pct * circ} ${circ}`} strokeDashoffset={circ / 4} strokeLinecap="round" />
          {/* Endpoint dot */}
          <circle cx={ex} cy={ey} r={sw / 2} fill={color} />
          <circle cx={ex} cy={ey} r={3} fill="white" />
          {/* Target marker */}
          <line x1={tXi} y1={tYi} x2={tXo} y2={tYo} stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[36px] font-extrabold text-gray-900 leading-none">{score}</span>
          <span className="text-[12px] text-gray-400 mt-1">/ 100</span>
        </div>
      </div>
      <span style={{ display:'inline-flex', padding:'2px 10px', borderRadius:999, background:bandBg, fontSize:12, fontWeight:600, color:bandColor }}>{bandLabel}</span>
      {delta != null && delta !== 0 && (
        <div className="flex items-center gap-1">
          <Delta value={delta} />
          <span className="text-[12px] text-gray-400">from last scan</span>
        </div>
      )}
    </div>
  )
}

function SemiGauge({ score, delta }) {
  const W = 300, r = 88, sw = 15, cx = 150, cy = 102
  const H = cy + 14
  const circ = 2 * Math.PI * r
  const semiCirc = Math.PI * r
  const pct = Math.min(score / 100, 1)
  const bandLabel = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 30 ? 'Fair' : 'Poor'
  const bandColor = score >= 80 ? '#15803D' : score >= 60 ? '#16A34A' : score >= 30 ? 'var(--warning-700)' : 'var(--error-800)'
  const bandBg   = score >= 80 ? 'var(--success-100)' : score >= 60 ? '#F0FDF4' : score >= 30 ? 'var(--warning-100)' : '#FEF2F2'
  const recAngle = Math.PI * 0.1
  const cos18 = Math.cos(recAngle), sin18 = Math.sin(recAngle)
  const rmIx = (cx + (r - sw / 2 - 4) * cos18).toFixed(1)
  const rmIy = (cy - (r - sw / 2 - 4) * sin18).toFixed(1)
  const rmOx = (cx + (r + sw / 2 + 4) * cos18).toFixed(1)
  const rmOy = (cy - (r + sw / 2 + 4) * sin18).toFixed(1)
  return (
    <div className="flex flex-col items-center w-full gap-1.5">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="sg-track" x1={cx - r} y1="0" x2={cx + r} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#DC2626" stopOpacity="0.12" />
            <stop offset="30%"  stopColor="var(--warning-400)" stopOpacity="0.12" />
            <stop offset="60%"  stopColor="var(--success-500)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#15803D" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="sg-value" x1={cx - r} y1="0" x2={cx + r} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#DC2626" />
            <stop offset="30%"  stopColor="var(--warning-400)" />
            <stop offset="60%"  stopColor="var(--success-500)" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
        </defs>
        {/* Subtle zone track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#sg-track)" strokeWidth={sw}
          strokeDasharray={`${semiCirc.toFixed(1)} ${circ.toFixed(1)}`}
          strokeDashoffset={semiCirc.toFixed(1)} />
        {/* Gradient value arc */}
        {pct > 0 && (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="url(#sg-value)" strokeWidth={sw}
            strokeDasharray={`${(pct * semiCirc).toFixed(1)} ${circ.toFixed(1)}`}
            strokeDashoffset={semiCirc.toFixed(1)}
            strokeLinecap="round" />
        )}
        {/* Recommended marker at 90 */}
        <line x1={rmIx} y1={rmIy} x2={rmOx} y2={rmOy} stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round" />
        {/* Score */}
        <text x={cx} y={cy - 26} textAnchor="middle" fontSize="36" fontWeight="800" fill="#101828">{score}</text>
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="10" fill="var(--gray-400)">/ 100</text>
        {/* End labels */}
        <text x={cx - r + 8} y={H - 1} textAnchor="middle" fontSize="9" fill="var(--gray-400)">0</text>
        <text x={cx + r - 8} y={H - 1} textAnchor="middle" fontSize="9" fill="var(--gray-400)">100</text>
      </svg>
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <span style={{ display:'inline-flex', padding:'2px 10px', borderRadius:999, background:bandBg, fontSize:12, fontWeight:600, color:bandColor }}>{bandLabel}</span>
        <span className="text-[12px] text-gray-400">Recommended: 90</span>
        {delta != null && delta !== 0 && (
          <div className="flex items-center gap-0.5">
            <Delta value={delta} />
          </div>
        )}
      </div>
    </div>
  )
}

function WaffleChart({ healthy, total }) {
  const cells = 100
  const healthyCells = Math.round((healthy / total) * cells)
  const sz = 88, cellSize = sz / 10, gap = 1.5, inner = cellSize - gap
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} className="shrink-0">
      {Array.from({ length: cells }, (_, i) => (
        <rect key={i}
          x={(i % 10) * cellSize + gap / 2} y={Math.floor(i / 10) * cellSize + gap / 2}
          width={inner} height={inner} rx="1.5"
          fill={i < healthyCells ? '#16A34A' : '#DC2626'}
          opacity={i < healthyCells ? 0.8 : 0.95}
        />
      ))}
    </svg>
  )
}

function RoseChart({ size = 96 }) {
  const data = [
    { label: 'Errors',   count: 14, color: '#DC2626' },
    { label: 'Warnings', count: 22, color: '#D97706' },
    { label: 'Notices',  count: 48, color: 'var(--primary-600)' },
  ]
  const cx = size / 2, cy = size / 2
  const maxR = size / 2 - 2
  const sqrtMax = Math.sqrt(Math.max(...data.map(d => d.count)))
  const n = data.length
  const angleStep = (2 * Math.PI) / n
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      {data.map((seg, i) => {
        const r = Math.max((Math.sqrt(seg.count) / sqrtMax) * maxR, 10)
        const startAngle = i * angleStep - Math.PI / 2
        const endAngle = (i + 1) * angleStep - Math.PI / 2
        const x1 = (cx + r * Math.cos(startAngle)).toFixed(2)
        const y1 = (cy + r * Math.sin(startAngle)).toFixed(2)
        const x2 = (cx + r * Math.cos(endAngle)).toFixed(2)
        const y2 = (cy + r * Math.sin(endAngle)).toFixed(2)
        return (
          <path key={seg.label}
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r.toFixed(2)} ${r.toFixed(2)} 0 0 1 ${x2} ${y2} Z`}
            fill={seg.color}
            fillOpacity="0.82"
            stroke="white"
            strokeWidth="2"
          />
        )
      })}
    </svg>
  )
}

function PieChart({ data, size = 176 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 4
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  let cumAngle = -Math.PI / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((seg, i) => {
        const angle = (seg.value / total) * 2 * Math.PI
        if (angle < 0.001) return null
        const startAngle = cumAngle
        const endAngle = cumAngle + angle
        cumAngle = endAngle
        if (angle >= 2 * Math.PI - 0.001) {
          return <circle key={i} cx={cx} cy={cy} r={r} fill={seg.color} />
        }
        const x1 = (cx + r * Math.cos(startAngle)).toFixed(2)
        const y1 = (cy + r * Math.sin(startAngle)).toFixed(2)
        const x2 = (cx + r * Math.cos(endAngle)).toFixed(2)
        const y2 = (cy + r * Math.sin(endAngle)).toFixed(2)
        const largeArc = angle > Math.PI ? 1 : 0
        return (
          <path key={i}
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
            fill={seg.color}
            stroke="white"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        )
      })}
    </svg>
  )
}

function StackedDistributionBar({ segments, height = 14 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  return (
    <div className="w-full flex rounded-md overflow-hidden" style={{ height }}>
      {segments.map((seg, i) => (
        <div key={i} style={{ width:`${(seg.value / total) * 100}%`, background:seg.color, minWidth:seg.value > 0 ? 3 : 0 }} />
      ))}
    </div>
  )
}

// Rose/polar-area chart — equal angle slices, radius scales with sqrt(value)
function PolarRoseChart({ segments, size = 110 }) {
  const cx = size / 2, cy = size / 2, maxR = size / 2 - 4
  const n = segments.length
  const maxVal = Math.max(...segments.map(s => s.value))
  const angleSlice = (2 * Math.PI) / n
  const GAP = 0.1  // radian gap between segments

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Gray track at full radius */}
      {segments.map((_, i) => {
        const startA = i * angleSlice - Math.PI / 2
        const endA = startA + angleSlice - GAP
        const x1 = (cx + maxR * Math.cos(startA)).toFixed(2)
        const y1 = (cy + maxR * Math.sin(startA)).toFixed(2)
        const x2 = (cx + maxR * Math.cos(endA)).toFixed(2)
        const y2 = (cy + maxR * Math.sin(endA)).toFixed(2)
        return (
          <path key={`tr-${i}`}
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${maxR} ${maxR} 0 0 1 ${x2} ${y2} Z`}
            fill="#EAECF0"
          />
        )
      })}
      {/* Colored value segments */}
      {segments.map((s, i) => {
        const r = Math.max(Math.sqrt(s.value / maxVal) * maxR, 4)
        const startA = i * angleSlice - Math.PI / 2
        const endA = startA + angleSlice - GAP
        const x1 = (cx + r * Math.cos(startA)).toFixed(2)
        const y1 = (cy + r * Math.sin(startA)).toFixed(2)
        const x2 = (cx + r * Math.cos(endA)).toFixed(2)
        const y2 = (cy + r * Math.sin(endA)).toFixed(2)
        return (
          <path key={i}
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
            fill={s.color} fillOpacity="0.88"
            stroke="white" strokeWidth="2.5" strokeLinejoin="round"
          />
        )
      })}
    </svg>
  )
}

// Semicircle arc gauge — for a single large % metric
function IndexArcGauge({ pct, value, label, color, size = 150 }) {
  const cx = size / 2
  const cy = Math.round(size * 0.58)
  const r  = Math.round(size * 0.36)
  const sw = 11
  // Endpoint: arc goes CW from left (cx-r, cy) via top to position at pct
  // angle from positive x-axis = π(1-pct); ey negated for SVG y-down
  const a = Math.PI * (1 - pct)
  const ex = (cx + r * Math.cos(a)).toFixed(2)
  const ey = (cy - r * Math.sin(a)).toFixed(2)
  const h = Math.round(size * 0.62)

  return (
    <svg width={size} height={h} viewBox={`0 0 ${size} ${h}`}>
      {/* Track */}
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#EAECF0" strokeWidth={sw} strokeLinecap="round" />
      {/* Value arc */}
      {pct > 0.005 && (
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${ex} ${ey}`}
          fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      )}
      <text x={cx} y={cy - 4} textAnchor="middle"
        fontSize="20" fontWeight="800" fill="#101828" fontFamily="Inter,system-ui,sans-serif">
        {value}
      </text>
      <text x={cx} y={cy + 13} textAnchor="middle"
        fontSize="9" fill="var(--gray-400)" fontFamily="Inter,system-ui,sans-serif">
        {label}
      </text>
    </svg>
  )
}

function ResultsBarList() {
  const maxCount = Math.max(...RESULTS_BY_TYPE.map(r => r.count))
  const total    = RESULTS_BY_TYPE.reduce((s, r) => s + r.count, 0)
  const MAX_BAR_H = 72

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-end gap-2" style={{ height: MAX_BAR_H + 30 }}>
        {RESULTS_BY_TYPE.map(r => {
          const barH = Math.max(6, Math.round((r.count / maxCount) * MAX_BAR_H))
          const pct  = Math.round((r.count / total) * 100)
          return (
            <div key={r.label} className="flex-1 flex flex-col items-start" style={{ height: barH + 30 }}>
              <span className="text-[17px] font-bold text-gray-800 tabular-nums leading-none" style={{ marginBottom: 8 }}>{pct}%</span>
              <div className="w-full flex-1 rounded-t-lg" style={{ background: r.color }} />
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-4">
        {RESULTS_BY_TYPE.map(r => (
          <div key={r.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: r.color }} />
            <span className="text-[12px] text-gray-500">{r.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Sparkline({ data, color = '#94A3B8', height = 26 }) {
  const w = 80, h = height, pad = 3
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const ptArr = data.map((v, i) => ({
    x: parseFloat(((i / (data.length - 1)) * w).toFixed(1)),
    y: parseFloat((h - pad - ((v - min) / range) * (h - pad * 2)).toFixed(1)),
  }))
  const pts = ptArr.map(p => `${p.x},${p.y}`).join(' ')
  const last = ptArr[ptArr.length - 1]
  const gradId = `spk-${color.replace('#', '')}`
  const areaPoints = [
    ...ptArr,
    { x: w, y: h - pad },
    { x: 0, y: h - pad },
  ].map(p => `${p.x},${p.y}`).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradId})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="2.5" fill={color} />
    </svg>
  )
}

function DonutChart({ segments, totalLabel, totalSub, size = 112, sw = 13 }) {
  const r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  let cumLen = 0
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F2F4F7" strokeWidth={sw} />
        {segments.map((seg, i) => {
          const len = (seg.value / total) * circ
          const offset = circ / 4 - cumLen
          cumLen += len
          return <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={seg.color} strokeWidth={sw}
            strokeDasharray={`${len} ${circ}`} strokeDashoffset={offset} strokeLinecap="butt" />
        })}
      </svg>
      <div className="flex flex-col items-center justify-center z-10 pointer-events-none">
        <span className="text-[17px] font-bold text-gray-900 leading-none">{totalLabel}</span>
        {totalSub && <span className="text-[10px] text-gray-400 mt-0.5">{totalSub}</span>}
      </div>
    </div>
  )
}

function NestedDonutChart({ outerSegments, innerSegments, size = 108 }) {
  const cx = size / 2, cy = size / 2
  const outerR = 40, outerSw = 12, innerR = 23, innerSw = 10
  const oCirc = 2 * Math.PI * outerR, iCirc = 2 * Math.PI * innerR
  const oTotal = outerSegments.reduce((s, seg) => s + seg.value, 0) || 1
  const iTotal = innerSegments.reduce((s, seg) => s + seg.value, 0) || 1
  let oCum = 0, iCum = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#F2F4F7" strokeWidth={outerSw} />
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#F2F4F7" strokeWidth={innerSw} />
      {outerSegments.map((seg, i) => {
        const len = (seg.value / oTotal) * oCirc
        const off = oCirc / 4 - oCum; oCum += len
        return <circle key={`o${i}`} cx={cx} cy={cy} r={outerR} fill="none" stroke={seg.color} strokeWidth={outerSw}
          strokeDasharray={`${len} ${oCirc}`} strokeDashoffset={off} strokeLinecap="butt" />
      })}
      {innerSegments.map((seg, i) => {
        const len = (seg.value / iTotal) * iCirc
        const off = iCirc / 4 - iCum; iCum += len
        return <circle key={`i${i}`} cx={cx} cy={cy} r={innerR} fill="none" stroke={seg.color} strokeWidth={innerSw}
          strokeDasharray={`${len} ${iCirc}`} strokeDashoffset={off} strokeLinecap="butt" />
      })}
    </svg>
  )
}

function ColumnChart({ data }) {
  const MAX_H = 110
  const logMax = Math.log10(Math.max(...data.map(d => d.count), 1) + 1)
  const barH = d => d.count === 0 ? 0 : Math.max(Math.round((Math.log10(d.count + 1) / logMax) * MAX_H), 5)

  return (
    <div className="flex items-end gap-3 w-full">
      {data.map(d => {
        const h = barH(d)
        return (
          <div key={d.code} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            <span className="text-[12px] font-bold text-gray-700 leading-none">{d.count}</span>
            <div className="w-full rounded-t-md" style={{ height: h, background: d.color }} />
            <span className="text-[10px] font-medium text-gray-400 truncate w-full text-center">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function ConcentricArcRings({ rings }) {
  const size = 88, cx = 44, cy = 44
  const radii = [16, 27, 38]
  const sw = 7
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      {rings.map((ring, i) => {
        const r = radii[i]
        const circ = 2 * Math.PI * r
        const arcLen = ring.pct * circ
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F2F4F7" strokeWidth={sw} />
            {ring.pct > 0 && (
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={ring.color} strokeWidth={sw}
                strokeDasharray={`${arcLen} ${circ}`} strokeDashoffset={circ / 4}
                strokeLinecap="round" />
            )}
          </g>
        )
      })}
    </svg>
  )
}

const CWV_COLORS = { green: '#039855', yellow: '#F79009', red: '#D92D20' }

function CWVSlider({ metrics }) {
  return (
    <div className="flex flex-col gap-5">
      {metrics.map(m => {
        const rawVal = parseFloat(m.value)
        const maxVal = CWV_RANGES[m.label]
        const goodLimit = CWV_THRESHOLDS[m.label]
        const goodPct  = (goodLimit / maxVal) * 100
        const needsPct = Math.min((goodLimit * 1.33 / maxVal) * 100, 100)
        const valuePct = Math.min((rawVal / maxVal) * 100, 100)
        // Dot color = whichever zone the dot sits in
        const dotColor = valuePct <= goodPct ? CWV_COLORS.green
          : valuePct <= needsPct ? CWV_COLORS.yellow
          : CWV_COLORS.red
        const dotLeft = Math.min(valuePct, 97)
        return (
          <div key={m.label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-gray-800">{m.label}</span>
              <span className="text-[13px] font-bold leading-none" style={{ color: dotColor }}>{m.value}</span>
            </div>
            {/* Track with zone bands */}
            <div className="relative" style={{ paddingTop: 11, paddingBottom: 11 }}>
              <div className="h-1 w-full rounded-full overflow-hidden flex">
                <div style={{ width: `${goodPct}%`,           background: CWV_COLORS.green  }} />
                <div style={{ width: `${needsPct - goodPct}%`, background: CWV_COLORS.yellow }} />
                <div style={{ flex: 1,                         background: CWV_COLORS.red    }} />
              </div>
              {/* Threshold tick */}
              <div className="absolute top-0 bottom-0 flex items-center" style={{ left: `${goodPct}%` }}>
                <div className="w-px h-5 bg-gray-500" />
              </div>
              {/* Value dot — color matches current zone */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white"
                style={{ left: `${dotLeft}%`, background: dotColor, boxShadow: '0 1px 6px rgba(0,0,0,0.32)' }} />
            </div>
            {/* Scale labels */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400">0</span>
              <span className="text-[10px] text-gray-400">{m.threshold} <span className="text-gray-300">good</span></span>
              <span className="text-[10px] text-gray-400">{maxVal}{m.label === 'INP' ? ' ms' : m.label === 'LCP' ? ' s' : ''}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CWVRing({ metric }) {
  const size = 60, sw = 6, r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const rawVal = parseFloat(metric.value)
  const pct = Math.min(rawVal / CWV_RANGES[metric.label], 1)
  const color = metric.pass ? '#16A34A' : '#DC2626'
  const arcLen = pct * circ
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F2F4F7" strokeWidth={sw} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
            strokeDasharray={`${arcLen} ${circ}`} strokeDashoffset={circ / 4} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[14px] font-bold" style={{ color }}>{metric.pass ? '✓' : '!'}</span>
        </div>
      </div>
      <span className="text-[12px] font-bold text-gray-900 leading-none">{metric.value}</span>
      <span className="text-[12px] font-semibold text-gray-500">{metric.label}</span>
      <span className="text-[9px] text-gray-400">{metric.threshold}</span>
    </div>
  )
}

function TrendBarChart() {
  const [hovered, setHovered] = useState(null)
  const scanData = [...SCAN_OPTIONS].reverse()
  const series = [
    { key: 'errors',   label: 'Errors',   color: '#DC2626' },
    { key: 'warnings', label: 'Warnings', color: '#D97706' },
    { key: 'notices',  label: 'Notices',  color: 'var(--primary-600)' },
  ]
  const maxTotal = Math.max(...scanData.map(s => s.errors + s.warnings + s.notices))
  const W = 220, H = 84
  const n = scanData.length
  const barW = 28
  const barGap = (W - n * barW) / (n + 1)

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const svgX = ((e.clientX - rect.left) / rect.width) * W
    let closest = 0, minDist = Infinity
    scanData.forEach((_, si) => {
      const cx = barGap + si * (barW + barGap) + barW / 2
      const d = Math.abs(svgX - cx)
      if (d < minDist) { minDist = d; closest = si }
    })
    setHovered(minDist < barW * 1.5 ? { idx: closest, px: e.clientX - rect.left } : null)
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="relative" onMouseLeave={() => setHovered(null)}>
        <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none" style={{ display: 'block' }}
          onMouseMove={handleMove}>
          {/* Horizontal grid */}
          {[0.33, 0.66, 1].map(f => (
            <line key={f} x1="0" y1={(H - H * f).toFixed(1)} x2={W} y2={(H - H * f).toFixed(1)}
              stroke="#F2F4F7" strokeWidth="1" />
          ))}
          {/* Stacked bars */}
          {scanData.map((scan, si) => {
            const x = barGap + si * (barW + barGap)
            const total = scan.errors + scan.warnings + scan.notices
            const isHov = hovered?.idx === si
            let yBottom = H
            return [
              ...series.map((s, bi) => {
                const val = scan[s.key]
                const segH = Math.max((val / maxTotal) * H, 1)
                const y = yBottom - segH
                yBottom = y
                const isTop = bi === series.length - 1
                return (
                  <rect key={`${si}-${s.key}`}
                    x={x.toFixed(1)} y={y.toFixed(1)}
                    width={barW} height={segH.toFixed(1)}
                    rx={isTop ? 3 : 0} ry={isTop ? 3 : 0}
                    fill={s.color} fillOpacity={isHov ? 1 : 0.82}
                  />
                )
              }),
              // Total label above bar
              <text key={`lbl-${si}`}
                x={(x + barW / 2).toFixed(1)}
                y={(H - (total / maxTotal) * H - 4).toFixed(1)}
                textAnchor="middle" fontSize="8" fill={isHov ? '#374151' : 'var(--gray-400)'} fontWeight="600">
                {total}
              </text>,
            ]
          })}
        </svg>
        {/* Hover tooltip */}
        {hovered && (
          <div className="absolute z-10 pointer-events-none"
            style={{ left: hovered.px > 140 ? hovered.px - 130 : hovered.px + 8, top: 4 }}>
            <div className="bg-gray-900 rounded-lg px-2.5 py-2" style={{ minWidth: 130 }}>
              <p className="text-[10px] font-semibold text-gray-300 mb-1.5">{scanData[hovered.idx].label}</p>
              {[...series].reverse().map(s => (
                <div key={s.key} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-[10px] text-gray-300">{s.label}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-white">{scanData[hovered.idx][s.key]}</span>
                </div>
              ))}
              <div className="border-t border-gray-700 mt-1.5 pt-1.5 flex justify-between">
                <span className="text-[10px] text-gray-400">Total</span>
                <span className="text-[10px] font-bold text-white">
                  {scanData[hovered.idx].errors + scanData[hovered.idx].warnings + scanData[hovered.idx].notices}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* X-axis date labels — HTML so they use card typography, not SVG scaling */}
      <div className="flex justify-between">
        <span className="text-[10px] text-gray-400">{scanData[0].label.replace(', 2026', '')}</span>
        <span className="text-[10px] text-gray-400">{scanData[scanData.length - 1].label.replace(', 2026', '')}</span>
      </div>
    </div>
  )
}

// ─── Health Score Card (enterprise redesign) ─────────────────────────────────

function HealthScoreCard({ compare }) {
  const score  = HEALTH.score  // 74
  const delta  = HEALTH.delta  // +4
  const target = 90
  const gap    = target - score  // 16

  const zone = score >= 80
    ? { label: 'Excellent', color: '#15803D' }
    : score >= 60
    ? { label: 'Good',      color: '#16A34A' }
    : score >= 30
    ? { label: 'Fair',      color: '#D97706' }
    :   { label: 'Poor',    color: '#DC2626' }

  const W = 220, cy = 108, r = 70, sw = 13
  const cx = W / 2

  const arcPt = v => {
    const a = Math.PI * (1 - v / 100)
    return { x: +(cx + r * Math.cos(a)).toFixed(2), y: +(cy - r * Math.sin(a)).toFixed(2) }
  }

  const scorePt  = arcPt(score)
  const targetA  = Math.PI * (1 - target / 100)
  const tickIn   = { x: +(cx + (r - sw / 2 - 1) * Math.cos(targetA)).toFixed(2), y: +(cy - (r - sw / 2 - 1) * Math.sin(targetA)).toFixed(2) }
  const tickOut  = { x: +(cx + (r + sw / 2 + 2) * Math.cos(targetA)).toFixed(2), y: +(cy - (r + sw / 2 + 2) * Math.sin(targetA)).toFixed(2) }

  const sparkData = [...SCAN_OPTIONS].reverse().map(s => s.score)

  return (
    <SectionCard className="p-4 flex flex-col gap-4 min-w-0">

      {/* Header with delta badge */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-gray-700">Health score</p>
        {delta !== 0 && (
          <span className={`inline-flex items-center gap-1 text-[12px] font-semibold px-2 py-0.5 rounded-full ${delta > 0 ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'}`}>
            {delta > 0 ? `↑${delta}` : `↓${Math.abs(delta)}`} pts
          </span>
        )}
      </div>

      {/* Gauge */}
      <div className="flex justify-center" style={{ marginTop: -4, marginBottom: -4 }}>
        <svg width={W} height="142" viewBox={`0 0 ${W} 142`}>
          <defs>
            <linearGradient id="hs-grad" x1={cx - r} y1="0" x2={cx + r} y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%"     stopColor="#EF4444" />
              <stop offset="20.6%"  stopColor="var(--warning-400)" />
              <stop offset="34.5%"  stopColor="var(--success-500)" />
              <stop offset="65.5%"  stopColor="#16A34A" />
              <stop offset="100%"   stopColor="#15803D" />
            </linearGradient>
          </defs>
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none" stroke="#EAECF0" strokeWidth={sw} strokeLinecap="round" />
          <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none" stroke="url(#hs-grad)" strokeWidth={sw} strokeLinecap="round" />
          <line x1={tickIn.x} y1={tickIn.y} x2={tickOut.x} y2={tickOut.y}
            stroke="white" strokeWidth="2.5" />
          <circle cx={scorePt.x} cy={scorePt.y} r={sw / 2 - 1}
            fill="white" stroke={zone.color} strokeWidth="2.5"
            style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.18))' }} />
          <text x={cx} y={cy - 4} textAnchor="middle"
            fontSize="36" fontWeight="800" fill="#101828" fontFamily="Inter,system-ui,sans-serif">
            {score}
          </text>
          <text x={cx} y={cy + 18} textAnchor="middle"
            fontSize="12" fontWeight="600" fill={zone.color} fontFamily="Inter,system-ui,sans-serif">
            {zone.label}
          </text>
        </svg>
      </div>

      {/* Trend + gap-to-target */}
      <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-400">Score trend</span>
          <span className="text-[12px] text-gray-400">{gap} pts to Excellent</span>
        </div>
        <Sparkline data={sparkData} color={zone.color} height={36} />
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-400">Mar — May</span>
          <span className="text-[12px] text-gray-500">Target: <span className="font-bold text-gray-700">{target}</span></span>
        </div>
      </div>

    </SectionCard>
  )
}

// ─── Section 1: Health Summary ───────────────────────────────────────────────

function HealthSummarySection({ compare, onTabSwitch }) {
  const resultsTotal = RESULTS_BY_TYPE.reduce((s, r) => s + r.count, 0)
  const healthPct = Math.round((HEALTHY_PAGES / TOTAL_PAGES) * 100)
  const dominantType = RESULTS_BY_TYPE.reduce((a, b) => a.count > b.count ? a : b)
  const gap = 90 - HEALTH.score

  return (
    <div className="grid grid-cols-3 gap-4 min-w-0">

      {/* Card 1: Health Score */}
      <HealthScoreCard compare={compare} />

      {/* Card 2: Findings */}
      <SectionCard className="p-4 flex flex-col gap-5 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-gray-700">Results by type</p>
          <button onClick={() => onTabSwitch?.('scan')} className="text-[12px] font-medium text-primary-600 hover:underline shrink-0">View →</button>
        </div>
        <div className="flex items-end justify-between gap-2">
          <div>
            <span className="text-[40px] font-extrabold text-gray-900 leading-none tabular-nums">{resultsTotal}</span>
            <p className="text-[12px] text-gray-400 mt-1.5">total findings</p>
          </div>
          <div className="flex flex-col items-end gap-0.5 pb-0.5">
            <span className="text-[12px] font-semibold text-success-700">↓{SCAN_OPTIONS[1].findings - resultsTotal}</span>
            <span className="text-[12px] text-gray-400">since last scan</span>
          </div>
        </div>
        <ResultsBarList />
      </SectionCard>

      {/* Card 3: Page health ratio */}
      <SectionCard className="p-4 flex flex-col gap-4 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-gray-700">Page health ratio</p>
          <button onClick={() => onTabSwitch?.('scan')} className="text-[12px] font-medium text-primary-600 hover:underline shrink-0">View results by pages →</button>
        </div>
        <PageHealthCard onTabSwitch={onTabSwitch} />
      </SectionCard>

    </div>
  )
}

// ─── Section 2: Recovery & Indexing ─────────────────────────────────────────

function FixAndIndexSection({ onTabSwitch }) {
  const total = FIX_COVERAGE.reduce((s, f) => s + f.value, 0) || 1
  const autoPct = Math.round((FIX_COVERAGE[0].value / total) * 100)
  const not = NOT_INDEXABLE - REDIRECTING - CANONICALIZED
  const indexStats = [
    { label: 'Indexable',     count: INDEXABLE,                  color: '#16A34A' },
    { label: 'Not indexable', count: not,                         color: '#DC2626' },
    { label: 'Other',         count: REDIRECTING + CANONICALIZED, color: 'var(--gray-400)' },
  ]
  const indexPct = Math.round((INDEXABLE / TOTAL_PAGES) * 100)
  const notPct = Math.round((not / TOTAL_PAGES) * 100)

  return (
    <div className="grid grid-cols-2 gap-4 min-w-0">

      {/* Fix Coverage — Rose/polar-area chart */}
      <SectionCard className="p-5 flex flex-col gap-6 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[13px] font-semibold text-gray-700">Fix coverage</p>
          </div>
          <button onClick={() => onTabSwitch?.('scan')} className="text-[12px] font-medium text-primary-600 hover:underline shrink-0">Review →</button>
        </div>
        <div className="flex items-center gap-4 flex-1">
          <div className="shrink-0">
            <PolarRoseChart segments={FIX_COVERAGE.map(f => ({ value: f.value, color: f.color }))} size={112} />
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-[24px] font-extrabold text-gray-900 leading-none">{total}</span>
              <span className="text-[12px] text-gray-400">issues by fix type</span>
            </div>
            {FIX_COVERAGE.map(f => {
              const pct = Math.round((f.value / total) * 100)
              return (
                <div key={f.label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: f.color }} />
                    <span className="text-[12px] text-gray-600 truncate">{f.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[13px] font-bold text-gray-900">{f.value}</span>
                    <span className="text-[12px] text-gray-400">{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <p className="text-[13px] text-gray-400 border-t border-gray-100 pt-3">{autoPct}% of issues can be auto-fixed.</p>
      </SectionCard>

      {/* Indexability Snapshot */}
      <SectionCard className="p-5 flex flex-col gap-4 min-w-0">

        {/* Header */}
        <p className="text-[13px] font-semibold text-gray-700">Indexability snapshot</p>

        {/* Three KPI tiles */}
        <div className="grid grid-cols-3 gap-2">
          {indexStats.map(s => (
            <div key={s.label} className="border border-gray-200 rounded-lg px-3 py-2.5 flex flex-col gap-1">
              <span className="text-[20px] font-extrabold leading-none tabular-nums" style={{ color: s.color }}>
                {s.count.toLocaleString()}
              </span>
              <span className="text-[12px] text-gray-500 leading-tight">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Overall indexability + inline bar */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[12px] text-gray-400 font-medium">Overall indexability</p>
          <div className="flex items-center gap-3">
            <span className="text-[24px] font-extrabold leading-none shrink-0" style={{ color: '#16A34A' }}>
              {indexPct}%
            </span>
            <div className="flex h-2.5 rounded-full overflow-hidden flex-1">
              {indexStats.map(s => (
                <div key={s.label}
                  style={{ width: `${(s.count / TOTAL_PAGES) * 100}%`, background: s.color, minWidth: s.count > 0 ? 4 : 0 }} />
              ))}
            </div>
          </div>
        </div>

        {/* Insight */}
        <p className="text-[13px] text-gray-400 border-t border-gray-100 pt-3">
          <span className="text-success-700 font-semibold">+12</span> indexable pages since last crawl
        </p>

      </SectionCard>
    </div>
  )
}

// ─── Section 3: Crawl Overview KPI strip ────────────────────────────────────

function CrawlSnapshotStrip() {
  return (
    <div className="grid grid-cols-5 gap-3">
      {CRAWL_KPIS.map(({ label, value, delta, deltaPositive }) => (
        <CountCard key={label} label={label} value={value} delta={delta} deltaUp={deltaPositive} />
      ))}
    </div>
  )
}

// ─── Section 4: Priority Issues ──────────────────────────────────────────────

const SEV_CHIP = {
  critical: { label: 'Critical', color: 'var(--error-800)', bg: '#FEF2F2', border: '#DC2626' },
  high:     { label: 'High',     color: 'var(--warning-700)', bg: 'var(--warning-100)', border: '#D97706' },
  medium:   { label: 'Medium',   color: 'var(--primary-800)', bg: 'var(--primary-50)', border: 'var(--primary-600)' },
  low:      { label: 'Low',      color: '#374151', bg: '#F9FAFB', border: 'var(--gray-400)' },
}

function PriorityIssuesSection({ onFindingClick, onTabSwitch }) {
  return (
    <SectionCard className="p-5 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-semibold text-gray-700">Top findings</p>
        </div>
        <button onClick={() => onTabSwitch?.('scan')} className="text-[12px] font-medium text-primary-600 hover:underline shrink-0">Open findings →</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {TOP_FINDINGS.map((f, i) => {
          const sc = SEV_CHIP[f.severity] || SEV_CHIP.low
          return (
            <button key={i} onClick={() => onFindingClick(f.catId, f.findingId)}
              className="flex flex-col gap-2.5 border border-gray-200 rounded-lg p-4 hover:bg-gray-50/40 transition-all cursor-pointer text-left min-w-0 overflow-hidden"
              style={{ borderLeftColor: sc.border, borderLeftWidth: 3 }}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] font-semibold text-gray-800 leading-snug min-w-0">{f.title}</p>
                <span className="shrink-0 text-[12px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
                  style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[24px] font-extrabold leading-none" style={{ color: sc.border }}>{f.pages}</span>
                <span className="text-[12px] text-gray-400">pages affected</span>
              </div>
            </button>
          )
        })}
      </div>
    </SectionCard>
  )
}

// ─── Section 5: Technical Diagnostics ────────────────────────────────────────

function HealthBadge({ status }) {
  const map = {
    healthy:  { label: 'Healthy',  bg: '#F0FDF4', color: '#15803D' },
    warning:  { label: 'Warning',  bg: 'var(--warning-100)', color: 'var(--warning-700)' },
    critical: { label: 'Critical', bg: '#FEF2F2', color: 'var(--error-800)' },
  }
  const s = map[status] || map.healthy
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 9px', borderRadius:999, background:s.bg, fontSize:12, fontWeight:600, color:s.color }}>
      {s.label}
    </span>
  )
}

function DiagRow({ children }) {
  return <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">{children}</div>
}

function HttpStatusCard() {
  const total        = HTTP_CODES.reduce((s, c) => s + c.count, 0) || 1
  const successCode  = HTTP_CODES.find(c => c.code === '2XX')
  const successCount = successCode?.count ?? 0
  const errorTotal   = HTTP_CODES.filter(c => c.code !== '2XX' && c.code !== '1XX').reduce((s, c) => s + c.count, 0)
  const successPct   = ((successCount / total) * 100).toFixed(1)
  const health       = errorTotal === 0 ? 'healthy' : errorTotal <= 5 ? 'warning' : 'critical'

  // 2-segment donut: success (green) + combined errors (red)
  // Minimum visible arc for errors so they're always readable even at <1%
  const SIZE = 120, SW = 10, R = (SIZE - SW) / 2
  const CX = SIZE / 2, CY = SIZE / 2
  const CIRC = 2 * Math.PI * R
  const GAP_ARC = SW + 2  // gap wider than stroke so round caps don't hide it
  const MIN_ERROR_ARC = SW * 3  // always at least 3 stroke-widths of error arc
  const gapDeg = (GAP_ARC / CIRC) * 360

  let successArc = CIRC, errorArc = 0, successRot = -90, errorRot = 0
  if (errorTotal > 0) {
    errorArc   = Math.max(MIN_ERROR_ARC, (errorTotal / total) * CIRC - GAP_ARC)
    successArc = Math.max(0, CIRC - errorArc - GAP_ARC * 2)
    successRot = -90 + gapDeg / 2
    errorRot   = successRot + ((successArc + GAP_ARC) / CIRC) * 360
  }

  const codeInfo = {
    '3XX': { bg: 'var(--warning-100)', color: 'var(--warning-700)', label: 'Redirect'     },
    '4XX': { bg: 'var(--error-50)',    color: 'var(--error-600)',    label: 'Client error' },
    '5XX': { bg: 'var(--purple-50)',   color: 'var(--purple-600)',   label: 'Server error' },
  }
  const errorRows = HTTP_CODES.filter(c => c.code !== '2XX' && c.code !== '1XX' && c.count > 0)
  const nonSuccess = total - successCount

  // Insight describing what the status means for this metric
  const insight = health === 'healthy'
    ? `${successPct}% of crawled pages return a healthy 2XX response — crawlers can reach your content without errors.`
    : `${successPct}% of pages respond with 2XX, but ${nonSuccess} return redirects or errors. Resolve these to recover crawl budget and preserve link equity.`

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div><HealthBadge status={health} /></div>
        <p className="text-[12px] text-gray-500 leading-snug">{insight}</p>
      </div>

      <div className="flex justify-center">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE}>
            {successArc > 0 && (
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="#16A34A" strokeWidth={SW}
                strokeDasharray={`${successArc} ${CIRC}`} strokeLinecap="round"
                transform={`rotate(${successRot} ${CX} ${CY})`} />
            )}
            {errorArc > 0 && (
              <circle cx={CX} cy={CY} r={R} fill="none" stroke="#DC2626" strokeWidth={SW}
                strokeDasharray={`${errorArc} ${CIRC}`} strokeLinecap="round"
                transform={`rotate(${errorRot} ${CX} ${CY})`} />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[24px] font-extrabold leading-none tabular-nums text-success-600">{successPct}%</span>
            <span className="text-[12px] text-gray-400 mt-1">success rate</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {errorRows.length > 0 ? (
        <div className="flex flex-col gap-0.5">
          {errorRows.map(c => {
            const info = codeInfo[c.code] || {}
            const pct = ((c.count / total) * 100).toFixed(1)
            return (
              <div key={c.code} className="flex items-center justify-between px-2 py-2 rounded-md">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[12px] font-bold px-2 py-0.5 rounded-md shrink-0"
                    style={{ background: info.bg, color: info.color }}>{c.code}</span>
                  <span className="text-[13px] text-gray-500">{info.label}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[12px] text-gray-400">{pct}%</span>
                  <span className="text-[13px] font-semibold tabular-nums text-gray-900">{c.count}</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-[13px] text-success-600 font-medium">All pages returning 2XX — no crawl errors.</p>
      )}
    </div>
  )
}

function DomainMetricsCard() {
  const trust = 42
  const health = trust < 30 ? 'critical' : trust < 50 ? 'warning' : 'healthy'
  const gaugeColor = trust < 30 ? '#DC2626' : trust < 50 ? '#D97706' : '#16A34A'

  // 270° arc gauge geometry
  const SIZE = 120, SW = 10, R = (SIZE - SW) / 2
  const CX = SIZE / 2, CY = SIZE / 2
  const C = 2 * Math.PI * R
  const TRACK = 0.75 * C
  const GAP   = C - TRACK
  const fillLen = (trust / 100) * TRACK

  const stats = [
    { label: 'Backlinks',         value: '1,284'        },
    { label: 'Referring domains', value: '89'           },
    { label: 'Indexed pages',     value: '142'          },
    { label: 'Domain expiry',     value: 'Dec 15, 2026' },
  ]

  // Insight describing what the status means for this metric
  const insight = health === 'healthy'
    ? `Domain trust of ${trust}/100 is in a healthy range, supporting stronger rankings and citations.`
    : `Domain trust is ${trust}/100, below the best-practice threshold. Earn authoritative backlinks and referring domains to lift ranking potential.`

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div><HealthBadge status={health} /></div>
        <p className="text-[12px] text-gray-500 leading-snug">{insight}</p>
      </div>

      {/* 270° arc gauge — centered */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative" style={{ width: SIZE, height: SIZE }}>
          <svg width={SIZE} height={SIZE}>
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F2F4F7" strokeWidth={SW}
              strokeDasharray={`${TRACK} ${GAP}`} strokeLinecap="round"
              transform={`rotate(135 ${CX} ${CY})`} />
            {fillLen > 0 && (
              <circle cx={CX} cy={CY} r={R} fill="none" stroke={gaugeColor} strokeWidth={SW}
                strokeDasharray={`${fillLen} ${C - fillLen}`} strokeLinecap="round"
                transform={`rotate(135 ${CX} ${CY})`} />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[28px] font-extrabold leading-none tabular-nums" style={{ color: gaugeColor }}>{trust}</span>
            <span className="text-[12px] text-gray-400 mt-1">/ 100</span>
          </div>
        </div>
        <p className="text-[13px] text-gray-500">
          Needs <span className="font-semibold text-gray-700">+{100 - trust} points</span> to reach best practice
        </p>
      </div>

      <div className="border-t border-gray-100" />

      {/* Stat rows */}
      <div className="flex flex-col gap-0.5">
        {stats.map(s => (
          <div key={s.label} className="flex items-center justify-between px-2 py-2 rounded-md">
            <span className="text-[13px] text-gray-500">{s.label}</span>
            <span className="text-[13px] font-semibold tabular-nums text-gray-900">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function LinkRing({ dofollow, nofollow, total, pct, size = 96 }) {
  const SIZE = size, SW = 10, R = (SIZE - SW) / 2
  const CX = SIZE / 2, CY = SIZE / 2
  const CIRC = 2 * Math.PI * R
  const hasBoth = dofollow > 0 && nofollow > 0
  // SW+4 gives a clean small notch; round caps (5px each end) leave ~4px visual gap
  const GAP_ARC = hasBoth ? SW + 4 : 0
  const gapDeg  = (GAP_ARC / CIRC) * 360

  // Two segments = two gaps; allocate arc budget from the remainder
  const budget   = hasBoth ? CIRC - 2 * GAP_ARC : CIRC
  const MIN_ARC  = SW * 2
  const rawNfArc = nofollow > 0 ? (nofollow / total) * budget : 0
  const nfArc    = nofollow > 0 ? Math.max(MIN_ARC, rawNfArc) : 0
  const dfArc    = Math.max(0, budget - nfArc)
  // Center gap 1 at top; gap 2 falls naturally after nfArc
  const dfRot    = -90 + gapDeg / 2
  const nfRot    = dfRot + ((dfArc + GAP_ARC) / CIRC) * 360

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE}>
        {dfArc > 0 && (
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--primary-600)" strokeWidth={SW}
            strokeDasharray={`${dfArc} ${CIRC}`} strokeLinecap="round"
            transform={`rotate(${dfRot} ${CX} ${CY})`} />
        )}
        {nfArc > 0 && (
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#D97706" strokeWidth={SW}
            strokeDasharray={`${nfArc} ${CIRC}`} strokeLinecap="round"
            transform={`rotate(${nfRot} ${CX} ${CY})`} />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[16px] font-extrabold leading-none tabular-nums text-primary-600">{pct}%</span>
        <span className="text-[12px] text-gray-400 mt-0.5">dofollow</span>
      </div>
    </div>
  )
}

function LinkAttributesCard() {
  const internalLinks = LINK_ATTRIBUTES.filter(l => l.label.startsWith('Internal'))
  const externalLinks = LINK_ATTRIBUTES.filter(l => l.label.startsWith('External'))
  const iTotal    = internalLinks.reduce((s, l) => s + l.count, 0)
  const eTotal    = externalLinks.reduce((s, l) => s + l.count, 0)
  const iDofollow = internalLinks.find(l => l.label.includes('dofollow'))?.count ?? 0
  const eDofollow = externalLinks.find(l => l.label.includes('dofollow'))?.count ?? 0
  const iNofollow = internalLinks.find(l => l.label.includes('nofollow'))?.count ?? 0
  const eNofollow = externalLinks.find(l => l.label.includes('nofollow'))?.count ?? 0
  const iPct = Math.round((iDofollow / iTotal) * 100)
  const ePct = Math.round((eDofollow / eTotal) * 100)

  const groups = [
    { label: 'Internal', total: iTotal, dofollow: iDofollow, nofollow: iNofollow, pct: iPct, health: iPct >= 90 ? 'good' : 'warn' },
    { label: 'External', total: eTotal, dofollow: eDofollow, nofollow: eNofollow, pct: ePct, health: ePct >= 70 ? 'good' : 'warn' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 h-full">
      {groups.map(g => (
        <div key={g.label} className="flex flex-col gap-4 rounded-lg border border-gray-100 bg-gray-50/60 p-4">
          {/* Header */}
          <div className="flex items-start gap-1">
            <div>
              <p className="text-[13px] font-semibold text-gray-800">{g.label}</p>
              <p className="text-[12px] text-gray-400 mt-0.5">{g.total.toLocaleString()} links</p>
            </div>
          </div>

          {/* Ring centered */}
          <div className="flex justify-center py-1">
            <LinkRing dofollow={g.dofollow} nofollow={g.nofollow} total={g.total} pct={g.pct} />
          </div>

          {/* Stat rows */}
          <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0 bg-primary-600" />
                <span className="text-[12px] text-gray-500">Dofollow</span>
              </div>
              <span className="text-[13px] font-bold text-gray-800 tabular-nums">{g.dofollow.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#D97706' }} />
                <span className="text-[12px] text-gray-500">Nofollow</span>
              </div>
              <span className="text-[13px] font-bold text-gray-800 tabular-nums">{g.nofollow.toLocaleString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function RobotsMetaCard() {
  const total      = ROBOTS_META.reduce((s, r) => s + r.count, 0) || 1
  const blocked    = ROBOTS_META.filter(r => r.label.toLowerCase().includes('noindex')).reduce((s, r) => s + r.count, 0)
  const blockedPct = (blocked / total) * 100
  const health     = blockedPct >= 10 ? 'critical' : blockedPct >= 2 ? 'warning' : blocked > 0 ? 'warning' : 'healthy'
  const indexed    = ROBOTS_META.find(r => r.label === 'Index & follow')?.count ?? 0
  const indexedPct = ((indexed / total) * 100).toFixed(1)

  // All 5 categories shown — including zero-count and dominant 977
  const maxCount  = Math.max(...ROBOTS_META.map(r => r.count), 1)
  const MAX_BAR_H = 80

  // Insight describing what the status means for this metric
  const insight = health === 'healthy'
    ? `${indexedPct}% of pages are index & follow — your important content is open to search and AI crawlers.`
    : `${indexedPct}% of pages are index & follow, but ${blocked} are set to noindex. Confirm that's intentional, or they'll drop out of search and AI answers.`

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div><HealthBadge status={health} /></div>
        <p className="text-[12px] text-gray-500 leading-snug">{insight}</p>
      </div>

      {/* Bar chart — all 5 categories */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2" style={{ height: MAX_BAR_H + 28 }}>
          {ROBOTS_META.map(r => {
            const barH = r.count > 0 ? Math.max(5, Math.round((r.count / maxCount) * MAX_BAR_H)) : 0
            return (
              <div key={r.label} className="flex-1 h-full flex flex-col items-center justify-end relative group">
                {/* Hover tooltip */}
                <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-50 px-2.5 py-1.5 rounded-md bg-gray-900 text-white text-[12px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                  {r.label}
                </div>
                <span className="text-[12px] font-bold text-gray-700 tabular-nums leading-none" style={{ marginBottom: 6 }}>{r.count}</span>
                {r.count > 0
                  ? <div className="w-full rounded-t-md" style={{ height: barH, background: r.color }} />
                  : <div className="w-full rounded-full" style={{ height: 3, background: r.color, opacity: 0.35 }} />
                }
              </div>
            )
          })}
        </div>
        <div className="flex gap-2">
          {ROBOTS_META.map(r => {
            const [line1, line2] = r.label === 'No robots tag'
              ? ['No robots', 'tag']
              : r.label.split(' & ').map((p, i) => i === 0 ? p : '& ' + p)
            return (
              <div key={r.label} className="flex-1 text-center">
                <span className="text-[12px] text-gray-400 leading-tight block">{line1}</span>
                <span className="text-[12px] text-gray-400 leading-tight block">{line2}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Legend rows */}
      <div className="flex flex-col gap-0.5">
        {ROBOTS_META.filter(r => r.count > 0).map(r => {
          const pct = ((r.count / total) * 100).toFixed(1)
          return (
            <div key={r.label} className="flex items-center justify-between px-2 py-2 rounded-md">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: r.color }} />
                <span className="text-[13px] text-gray-500 truncate">{r.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[12px] text-gray-400">{pct}%</span>
                <span className="text-[13px] font-semibold tabular-nums text-gray-900">{r.count}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RedirectProfileCard() {
  const direct   = REDIRECT_PROFILE.find(r => r.label === '0 redirects')
  const single   = REDIRECT_PROFILE.find(r => r.label === '1 redirect')
  const chain    = REDIRECT_PROFILE.find(r => r.label === '2+ redirects')
  const total    = REDIRECT_PROFILE.reduce((s, r) => s + r.count, 0)
  const multiHop = chain?.count ?? 0
  const oneHop   = single?.count ?? 0
  const health   = multiHop > 0 ? 'warning' : oneHop > 5 ? 'warning' : 'healthy'
  const directPct = +((( direct?.count ?? 0) / total) * 100).toFixed(1)

  const exceptionRows = [
    { label: '1 redirect',  hops: '↗',  count: oneHop,   color: 'var(--purple-600)', bg: 'var(--purple-50)', border: 'var(--purple-200)' },
    { label: '2+ redirects', hops: '↗↗', count: multiHop, color: '#D97706',           bg: 'var(--warning-100)', border: '#FDE68A'          },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Hero + badge inline */}
      <div>
        <div className="flex items-center gap-3">
          <span className="text-[40px] font-extrabold text-gray-900 leading-none tabular-nums">{directPct}%</span>
          <HealthBadge status={health} />
        </div>
        <p className="text-[13px] text-gray-400 mt-1">pages load direct — no redirect</p>
      </div>

      {/* Exception rows in a contained block */}
      <div className="border border-gray-100 rounded-lg overflow-hidden">
        {exceptionRows.map((r, i) => (
          <div key={r.label} className={`flex items-center justify-between px-3 py-2.5 gap-3 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-bold shrink-0" style={{ color: r.color }}>{r.hops}</span>
              <span className="text-[13px] text-gray-600">{r.label}</span>
            </div>
            <span
              className="text-[13px] font-semibold tabular-nums px-2 py-0.5 rounded-md shrink-0"
              style={{ color: r.count > 0 ? r.color : 'var(--gray-400)', background: r.count > 0 ? r.bg : 'var(--gray-50)' }}
            >
              {r.count}
            </span>
          </div>
        ))}
      </div>

      {/* Insight */}
      <p className="text-[13px] text-gray-400 leading-snug">
        {oneHop > 0 ? `${oneHop} page${oneHop > 1 ? 's' : ''} could skip a redirect hop.` : 'No redirect chains detected — all pages load direct.'}
      </p>
    </div>
  )
}

function CoreWebVitalsCard() {
  const failCount = CORE_WEB_VITALS.filter(m => !m.pass).length
  const overallStatus = failCount === 0 ? 'healthy' : failCount >= 2 ? 'critical' : 'warning'
  const insight = failCount === 0
    ? 'All core metrics pass. Page experience is in good shape.'
    : failCount === 1
      ? `1 metric needs attention — LCP is above the 2.5 s threshold.`
      : `${failCount} metrics need attention. Prioritize LCP and INP for the biggest ranking impact.`
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <HealthBadge status={overallStatus} />
      </div>
      <p className="text-[14px] text-gray-500 leading-[20px]">{insight}</p>
      <CWVSlider metrics={CORE_WEB_VITALS} />
    </div>
  )
}

const DIAG_PANELS = [
  { id: 'http',     label: 'HTTP status codes', Component: HttpStatusCard    },
  { id: 'robots',   label: 'Robots meta tags',   Component: RobotsMetaCard    },
  { id: 'domain',   label: 'Domain metrics',     Component: DomainMetricsCard  },
]

function TechnicalDiagnostics() {
  return (
    <SectionCard className="p-5 flex flex-col gap-6">
      <div>
        <p className="text-[13px] font-semibold text-gray-700">Technical diagnostics</p>
        <p className="text-[13px] text-gray-400 mt-0.5">Crawl, links, and performance signals</p>
      </div>
      <div className="grid grid-cols-3 gap-3 min-w-0">
        {DIAG_PANELS.map(({ id, label, Component }) => (
          <div key={id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-[13px] font-semibold text-gray-800">{label}</p>
            </div>
            <div className="px-4 py-4">
              <Component />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

// ─── Section label divider ───────────────────────────────────────────────────

function SectionLabel({ title }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <span className="text-[12px] font-semibold tracking-widest text-gray-400 uppercase whitespace-nowrap">{title}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

// ─── Extracted: Indexability card (used in EXECUTIVE row) ────────────────────

function IndexabilityCard({ onTabSwitch }) {
  const not = NOT_INDEXABLE - REDIRECTING - CANONICALIZED
  const indexPct = Math.round((INDEXABLE / TOTAL_PAGES) * 100)
  const notPct   = Math.round((not        / TOTAL_PAGES) * 100)
  const otherPct = 100 - indexPct - notPct
  const subItems = [
    { label: 'Redirecting pages',   count: REDIRECTING,   color: '#D97706' },
    { label: 'Canonicalized pages', count: CANONICALIZED, color: 'var(--purple-600)' },
  ]
  return (
    <SectionCard className="p-4 flex flex-col gap-4 min-w-0">
      <p className="text-[13px] font-semibold text-gray-700">Indexability</p>

      {/* Two stats side-by-side — clean number hierarchy, no tinted boxes */}
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <span className="text-[40px] font-extrabold leading-none tabular-nums text-gray-900">{INDEXABLE.toLocaleString()}</span>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="w-2 h-2 rounded-full bg-success-600 shrink-0" />
            <span className="text-[12px] text-gray-500">Indexed</span>
            <span className="text-[12px] font-semibold text-success-700">{indexPct}%</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <span className="text-[28px] font-extrabold leading-none tabular-nums text-gray-900">{NOT_INDEXABLE}</span>
          <div className="flex items-center gap-1.5 mt-1.5 justify-end">
            <span className="w-2 h-2 rounded-full bg-error-600 shrink-0" />
            <span className="text-[12px] text-gray-500">Blocked</span>
            <span className="text-[12px] font-semibold text-error-600">{Math.round((NOT_INDEXABLE / TOTAL_PAGES) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Sub-breakdown */}
      <div className="flex flex-col gap-2">
        {subItems.map(s => (
          <div key={s.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-[12px] text-gray-600">{s.label}</span>
            </div>
            <span className="text-[13px] font-semibold tabular-nums text-gray-700">{s.count}</span>
          </div>
        ))}
      </div>

      <p className="text-[12px] text-gray-400 border-t border-gray-100 pt-3 mt-auto">
        <span className="text-success-700 font-semibold">+12</span> indexable pages since last crawl
      </p>
    </SectionCard>
  )
}

// ─── Extracted: Page Health card (used in SEO Health > Content tab) ──────────

function PageHealthCard({ onTabSwitch }) {
  const healthy   = 916
  const affected  = 84
  const total     = healthy + affected
  const healthPct = Math.round((healthy / total) * 100)
  const affectedPct = 100 - healthPct

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Hero */}
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-[40px] font-extrabold leading-none tabular-nums text-success-600">{healthPct}%</span>
          <span className="text-[13px] text-gray-400">of pages healthy</span>
        </div>
        <p className="text-[12px] text-gray-400 mt-1">{total.toLocaleString()} pages scanned</p>
      </div>

      {/* Proportion bar */}
      <div className="flex h-[6px] rounded-full overflow-hidden gap-0.5">
        <div className="rounded-full" style={{ flex: healthy, background: 'var(--success-500)' }} />
        <div className="rounded-full" style={{ flex: affected, background: 'var(--warning-400)' }} />
      </div>

      {/* Two stats */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2.5 flex-1">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: 'var(--success-500)' }} />
          <div>
            <span className="text-[20px] font-extrabold text-gray-900 leading-none tabular-nums">{healthy.toLocaleString()}</span>
            <p className="text-[12px] text-gray-400 mt-0.5">Healthy</p>
          </div>
        </div>
        <div className="w-px h-8 bg-gray-100 shrink-0" />
        <div className="flex items-center gap-2.5 flex-1">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: 'var(--warning-400)' }} />
          <div>
            <span className="text-[20px] font-extrabold text-gray-900 leading-none tabular-nums">{affected}</span>
            <p className="text-[12px] text-gray-400 mt-0.5">Need attention</p>
          </div>
        </div>
      </div>

    </div>
  )
}

// ─── Action Center ────────────────────────────────────────────────────────────

// DEMO: flip to true to preview the widget error state on the Top findings widget.
const SIMULATE_TOP_FINDINGS_ERROR = true

// Top findings widget — demonstrates the reusable WidgetErrorState.
// Renders an error state when its data can't load, with an interactive Retry
// (error -> brief loading -> data) so the failure/recovery flow can be shown.
function TopFindingsWidget({ onFindingClick, onTabSwitch, onRescan }) {
  const [status, setStatus] = useState(SIMULATE_TOP_FINDINGS_ERROR ? 'error' : 'ready')

  // The widget failed to load its scan data — recovering means re-running the
  // whole site audit, so the CTA kicks off a fresh scan.
  function handleRescan() {
    if (onRescan) { onRescan(); return }
    setStatus('loading')
    setTimeout(() => setStatus('ready'), 600)
  }

  const isReady = status === 'ready'

  return (
    <SectionCard className="p-5 flex flex-col gap-0">
      {/* Header — always visible above the state */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-semibold text-gray-800">Top findings</p>
            {isReady && (
              <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full bg-gray-100 text-[12px] font-semibold text-gray-500">{TOP_FINDINGS.length}</span>
            )}
          </div>
        </div>
        <button onClick={() => onTabSwitch?.('scan')} className="text-[12px] font-medium text-primary-600 hover:underline shrink-0">View all →</button>
      </div>

      {status === 'error' ? (
        <WidgetErrorState onRetry={handleRescan} retryLabel="Re-scan" />
      ) : status === 'loading' ? (
        <div className="flex flex-col items-center justify-center gap-3 py-10 min-h-[180px]">
          <RefreshCw size={20} className="text-gray-400 animate-spin" />
          <p className="text-[13px] text-gray-400">Loading findings…</p>
        </div>
      ) : (
        /* Finding rows — each is a clearly clickable card row */
        <div className="flex flex-col gap-1.5">
          {TOP_FINDINGS.map((f, i) => {
            const sc = SEV_CHIP[f.severity] || SEV_CHIP.low
            return (
              <button
                key={i}
                onClick={() => onFindingClick(f.catId, f.findingId)}
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all text-left group cursor-pointer"
              >
                {/* Severity bar accent */}
                <div className="w-[3px] h-[18px] rounded-full shrink-0" style={{ background: sc.border }} />
                {/* Title */}
                <p className="text-[13px] font-medium text-gray-700 flex-1 truncate group-hover:text-gray-900 leading-snug transition-colors">{f.title}</p>
                {/* Chip + chevron */}
                <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap border shrink-0"
                  style={{ color: sc.color, background: sc.bg, borderColor: sc.border + '40' }}>{sc.label}</span>
                <ChevronRight size={13} className="text-gray-400 shrink-0" />
              </button>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}

function ActionCenterSection({ onFindingClick, onTabSwitch, onRescan }) {
  const total          = FIX_COVERAGE.reduce((s, f) => s + f.value, 0) || 1
  const autoPct        = Math.round((FIX_COVERAGE[0].value / total) * 100)
  const fixedBaseline  = 25
  const fixedSinceScan = 4
  const maxV           = Math.max(...FIX_COVERAGE.map(f => f.value))

  return (
    <div className="grid grid-cols-2 gap-4 min-w-0">

      {/* ── Top Findings ── */}
      <TopFindingsWidget onFindingClick={onFindingClick} onTabSwitch={onTabSwitch} onRescan={onRescan} />

      {/* ── Fix Coverage ── */}
      <SectionCard className="p-5 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[13px] font-semibold text-gray-800">Fix coverage</p>
          </div>
          <button onClick={() => onTabSwitch?.('scan')} className="flex items-center gap-1 text-[12px] font-medium text-primary-600 hover:underline shrink-0">
            Review in scan results <ExternalLink size={11} />
          </button>
        </div>

        {/* KPI */}
        <div className="mt-4">
          <span className="text-[36px] font-extrabold text-gray-900 leading-none tabular-nums">{total}</span>
          <p className="text-[12px] text-gray-500 mt-1">Issues by fix type</p>
        </div>

        {/* Bar chart with Y-axis */}
        {(() => {
          const chartH = 120
          const maxY = 80
          const yTicks = [0, 20, 40, 60, 80]
          const xLabels = ['Auto fix', 'Assisted fix', 'Manual fix', 'Advisory']
          return (
            <div className="flex mt-4">
              {/* Y-axis labels — absolutely positioned to match gridlines exactly */}
              <div className="relative shrink-0 pr-2" style={{ width: 28, height: chartH }}>
                {yTicks.map(t => (
                  <span key={t} className="absolute right-2 text-[12px] text-gray-400 tabular-nums leading-none"
                    style={{ bottom: `${(t / maxY) * 100}%`, transform: 'translateY(50%)' }}>
                    {t}
                  </span>
                ))}
              </div>
              {/* Chart body */}
              <div className="flex-1 flex flex-col">
                {/* Bars + gridlines */}
                <div className="relative" style={{ height: chartH }}>
                  {yTicks.map(t => (
                    <div key={t} className="absolute left-0 right-0 border-t border-gray-100"
                      style={{ bottom: `${(t / maxY) * 100}%` }} />
                  ))}
                  <div className="absolute inset-0 flex items-end">
                    {FIX_COVERAGE.map(f => (
                      <div key={f.label} className="flex-1 flex justify-center items-end h-full">
                        <div style={{ width: 28, height: `${(f.value / maxY) * 100}%`, background: f.color, borderRadius: '3px 3px 0 0' }} />
                      </div>
                    ))}
                  </div>
                </div>
                {/* X-axis baseline */}
                <div className="h-px bg-gray-200" />
                {/* X-axis labels */}
                <div className="flex mt-2">
                  {xLabels.map(lbl => (
                    <div key={lbl} className="flex-1 text-center">
                      <span className="text-[12px] text-gray-500 leading-tight">{lbl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })()}

        {/* Divider */}
        <div className="h-px bg-gray-100 mt-4" />

        {/* Bottom stats */}
        <div className="flex mt-4">
          <div className="flex-1">
            <p className="text-[12px] text-gray-500 mb-1">Fixed from baseline</p>
            <span className="text-[22px] font-extrabold text-gray-900 leading-none tabular-nums block">{fixedBaseline}</span>
            <p className="text-[12px] text-gray-400 mt-1">Recurred since initial audit</p>
          </div>
          <div className="w-px bg-gray-100 shrink-0 mx-4" />
          <div className="flex-1">
            <p className="text-[12px] text-gray-500 mb-1">Fixed since last scan</p>
            <span className="text-[22px] font-extrabold leading-none tabular-nums block" style={{ color: 'var(--success-700)' }}>{fixedSinceScan}</span>
            <p className="text-[12px] text-gray-400 mt-1">New fixes after previous scan</p>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

// ─── SEO Health (tabbed) ──────────────────────────────────────────────────────

const SEO_HEALTH_TABS = [
  { id: 'performance', label: 'Performance' },
  { id: 'content',     label: 'Content'     },
  { id: 'schema',      label: 'Schema'      },
  { id: 'links',       label: 'Links'       },
  { id: 'indexability',label: 'Indexability'},
]

function SchemaPlaceholderCard() {
  const schemas = [
    { type: 'Organization',    count: 1,  status: 'valid'   },
    { type: 'BreadcrumbList',  count: 48, status: 'valid'   },
    { type: 'FAQPage',         count: 12, status: 'warning' },
  ]
  return (
    <div className="flex flex-col gap-3">
      <HealthBadge status="healthy" />
      <p className="text-[14px] text-gray-500 leading-[20px]">3 schema types detected. No critical errors found.</p>
      <div className="flex flex-col gap-2">
        {schemas.map(s => (
          <div key={s.type} className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-100 bg-gray-50/60">
            <span className="flex-1 text-[12px] font-medium text-gray-700">{s.type}</span>
            <span className="text-[12px] tabular-nums text-gray-500">{s.count} pages</span>
            <span className={`text-[12px] font-medium px-1.5 py-0.5 rounded-full ${s.status === 'warning' ? 'bg-warning-100 text-warning-600' : 'bg-success-50 text-success-600'}`}>
              {s.status === 'warning' ? 'Warning' : 'Valid'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SeoHealthSection({ onTabSwitch }) {
  return (
    <div className="flex flex-col gap-4 min-w-0">
      {/* Row 1: Performance + Indexability — similar content density, same height */}
      <div className="grid grid-cols-2 gap-4 items-stretch">
        <SectionCard className="p-5 flex flex-col gap-6">
          <p className="text-[13px] font-semibold text-gray-700">Core web vitals</p>
          <CoreWebVitalsCard />
        </SectionCard>

        <SectionCard className="p-5 flex flex-col gap-6">
          <p className="text-[13px] font-semibold text-gray-700">Link attributes</p>
          <LinkAttributesCard />
        </SectionCard>
      </div>

      {/* Row 2: Indexability + Redirect Profile */}
      <div className="grid grid-cols-2 gap-4 items-stretch">
        <IndexabilityCard onTabSwitch={onTabSwitch} />

        <SectionCard className="p-5 flex flex-col gap-6">
          <p className="text-[13px] font-semibold text-gray-700">Redirect profile</p>
          <RedirectProfileCard />
        </SectionCard>
      </div>
    </div>
  )
}

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab({ onFindingClick, onTabSwitch, onRescan }) {
  const [compare, setCompare] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [compareIdx, setCompareIdx] = useState(1)
  const currentScan = SCAN_OPTIONS[currentIdx]

  return (
    <div className="flex flex-col gap-4 min-w-0 pb-8">

      {/* Section 1: Scan comparison controls */}
      <div className="flex items-center gap-3 flex-wrap min-w-0">
        {/* Current report dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-gray-500 shrink-0">Current report</span>
          <div className="relative">
            <select
              value={currentIdx}
              onChange={e => setCurrentIdx(Number(e.target.value))}
              className="appearance-none h-8 text-[13px] font-medium text-gray-800 border border-gray-200 rounded-lg pl-3 pr-7 bg-white outline-none cursor-pointer hover:border-gray-300 focus:border-purple-600 transition-colors"
            >
              {SCAN_OPTIONS.map((s, i) => (
                <option key={s.label} value={i}>{s.label}</option>
              ))}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {compare && (
          <>
            <span className="text-[12px] text-gray-300 font-medium shrink-0">vs.</span>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-gray-500 shrink-0">Compared to</span>
              <div className="relative">
                <select
                  value={compareIdx}
                  onChange={e => setCompareIdx(Number(e.target.value))}
                  className="appearance-none h-8 text-[13px] font-medium text-gray-800 border border-gray-200 rounded-lg pl-3 pr-7 bg-white outline-none cursor-pointer hover:border-gray-300 focus:border-purple-600 transition-colors"
                >
                  {SCAN_OPTIONS.map((s, i) => (
                    <option key={s.label} value={i} disabled={i === currentIdx}>{s.label}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </>
        )}

        <button
          onClick={() => setCompare(c => !c)}
          className="shrink-0 inline-flex items-center gap-1.5 h-8 px-3 text-[13px] font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={13} />
          {compare ? 'Hide compare' : 'Compare scan'}
        </button>

      </div>

      <HealthSummarySection compare={compare} onTabSwitch={onTabSwitch} />
      <ActionCenterSection onFindingClick={onFindingClick} onTabSwitch={onTabSwitch} onRescan={onRescan} />
      <SeoHealthSection onTabSwitch={onTabSwitch} />
      <CrawlSnapshotStrip />
      <TechnicalDiagnostics />
    </div>
  )
}

// ─── Scan Results Tab ────────────────────────────────────────────────────────

const SEV_META = {
  error:   { label: 'Error',   Icon: CircleX,      barColor: '#DC2626', bg: 'bg-error-50',    text: 'text-error-600',   border: 'border-error-200'   },
  warning: { label: 'Warning', Icon: AlertTriangle, barColor: '#D97706', bg: 'bg-warning-100', text: 'text-warning-600', border: 'border-warning-200' },
  notice:  { label: 'Notice',  Icon: Info,          barColor: 'var(--primary-600)', bg: 'bg-primary-50',  text: 'text-primary-600', border: 'border-primary-200' },
}

const FIX_META = {
  auto:     { label: 'Auto fix',     Icon: Zap,   bg: 'bg-success-50',  text: 'text-success-700', border: 'border-success-200' },
  assisted: { label: 'Assisted fix', Icon: null,  bg: 'bg-primary-50',  text: 'text-primary-700', border: 'border-primary-200' },
  manual:   { label: 'Manual fix',   Icon: null,  bg: 'bg-warning-100', text: 'text-warning-700', border: 'border-warning-200' },
  advisory: { label: 'Advisory',     Icon: null,  bg: 'bg-purple-50',   text: 'text-purple-700',  border: 'border-purple-200'  },
}

const IMPACT_META = {
  critical: { label: 'Critical impact', bg: 'bg-error-50',    text: 'text-error-700',    border: 'border-error-200'   },
  high:     { label: 'High impact',     bg: 'bg-warning-100', text: 'text-warning-700',  border: 'border-warning-200' },
  medium:   { label: 'Medium impact',   bg: 'bg-primary-50',  text: 'text-primary-700',  border: 'border-primary-200' },
  low:      { label: 'Low impact',      bg: 'bg-gray-100',    text: 'text-gray-600',     border: 'border-gray-200'    },
}

const SCAN_DATA = [
  {
    id: 'crawlability', label: 'Crawlability & Indexing',
    findings: [
      { id: 'c1',  severity: 'error',   fixType: 'auto',     impact: 'critical', totalAffected: 12, aiAvailable: true, aiRecommendation: 'Cross-referencing canonical targets against your sitemap and redirect map, the fix is to update 12 canonical href values to their live 200-status equivalents. Confidence: high (91%). All affected canonicals follow a predictable /old-slug → /new-slug pattern — a bulk find-and-replace in your CMS template resolves them in one deployment.',
        title: 'Canonical URL with a 4XX status code',
        description: 'Some canonicals resolve to missing pages, sending a broken consolidation signal to crawlers.',
        whyItMatters: 'Broken canonical targets prevent search engines from correctly consolidating link equity, causing duplicate content issues and wasted crawl budget on pages that no longer exist.',
        technicalDetails: 'The canonical link element href resolves to a 404 or 410 HTTP status code. Search engines will ignore invalid canonicals and may index both the original and missing URL as separate pages.',
        current: 12, fixed: 1, newRec: 0,
        pages: [
          { url: 'https://example.com/agency-pro',       current: '/old-agency',        recommended: '/agency-pro'       },
          { url: 'https://example.com/features',         current: '/features-v1',       recommended: '/features'         },
          { url: 'https://example.com/pricing-old',      current: '/pricing-2022',      recommended: '/pricing'          },
          { url: 'https://example.com/integrations',     current: '/integrations-beta', recommended: '/integrations'     },
          { url: 'https://example.com/blog/seo-guide',   current: '/blog/seo-2021',     recommended: '/blog/seo-guide'   },
          { url: 'https://example.com/contact',          current: '/contact-us-old',    recommended: '/contact'          },
          { url: 'https://example.com/about',            current: '/about-v2',          recommended: '/about'            },
          { url: 'https://example.com/careers',          current: '/jobs',              recommended: '/careers'          },
          { url: 'https://example.com/blog/crm-tips',    current: '/blog/crm-tips-v1',  recommended: '/blog/crm-tips'    },
          { url: 'https://example.com/changelog',        current: '/updates-archive',   recommended: '/changelog'        },
          { url: 'https://example.com/security',         current: '/security-old',      recommended: '/security'         },
          { url: 'https://example.com/affiliate',        current: '/partners-2023',     recommended: '/affiliate'        },
        ] },
      { id: 'c2',  severity: 'notice',  fixType: 'assisted', impact: 'medium', totalAffected: 1,
        title: 'Blocked by X-Robots-Tag',
        description: 'An X-Robots-Tag response header is preventing the page from being indexed as expected.',
        whyItMatters: 'X-Robots-Tag headers override on-page meta directives, meaning a page you intend to rank may be silently excluded from the index.',
        technicalDetails: 'The server returns an X-Robots-Tag: noindex HTTP response header. This takes precedence over in-HTML meta robots tags and instructs all crawlers to drop the page from the index.',
        current: 1, fixed: 0, newRec: 1,
        pages: [{ url: 'https://example.com/blog/post-1', current: 'noindex', recommended: 'index, follow' }] },
      { id: 'c3',  severity: 'error',   fixType: 'auto',     impact: 'high', totalAffected: 1,
        title: 'Canonical URL with a 5XX status code',
        description: 'Canonical targets are temporarily failing on the server, interrupting indexing decisions.',
        whyItMatters: 'When the canonical target returns a server error, search engines cannot validate the preferred URL, leading to unpredictable indexing decisions and potential ranking drops.',
        technicalDetails: 'The canonical href resolves to a 500, 502, or 503 HTTP response. Googlebot treats persistent 5XX canonicals as broken and may fall back to indexing the source URL instead.',
        current: 1, fixed: 1, newRec: 1,
        pages: [{ url: 'https://example.com/pricing', current: '/pricing-old (500)', recommended: '/pricing' }] },
      { id: 'c4',  severity: 'notice',  fixType: 'assisted', impact: 'low', totalAffected: 1,
        title: 'HTML and HTTP header contain noindex',
        description: 'The page carries noindex directives in more than one place, requiring coordinated cleanup.',
        whyItMatters: 'Duplicate noindex directives are redundant but can mask misconfiguration — if the intended state is indexable, both layers must be removed to restore discoverability.',
        technicalDetails: 'Both a meta robots noindex tag and an X-Robots-Tag noindex header are present. Either one alone is sufficient to exclude the page; having both means cleanup requires changes in two places.',
        current: 1, fixed: 0, newRec: 1,
        pages: [{ url: 'https://example.com/draft-page', current: 'noindex (meta + header)', recommended: 'Remove one directive' }] },
      { id: 'c5',  severity: 'error',   fixType: 'auto',     impact: 'critical', totalAffected: 1, isNew: true,
        title: 'Robots.txt is not accessible',
        description: 'The robots.txt endpoint is not returning a fetchable file for crawlers.',
        whyItMatters: 'Without a valid robots.txt, crawlers fall back to permissive defaults — but the missing file wastes crawl budget on every visit and signals a potential server configuration problem.',
        technicalDetails: 'GET /robots.txt returns a 404 status code. RFC 9309 specifies that a missing robots.txt should be treated as if no crawl restrictions exist, but some bots may back off entirely.',
        current: 1, fixed: 0, newRec: 0,
        pages: [{ url: 'https://example.com/robots.txt', current: '404 Not Found', recommended: 'Return 200 with valid rules' }] },
      { id: 'c6',  severity: 'notice',  fixType: 'assisted', impact: 'low', totalAffected: 1,
        title: 'Blocked by nofollow',
        description: 'The page is discoverable, but nofollow signals are preventing link equity from flowing as intended.',
        whyItMatters: 'Nofollow on key internal links can starve important pages of PageRank, reducing their ability to rank for competitive queries.',
        technicalDetails: 'The page is linked from navigational elements using rel="nofollow". This is treated as a hint by Google but can suppress link signal flow on older crawlers that treat it as a directive.',
        current: 1, fixed: 1, newRec: 0,
        pages: [{ url: 'https://example.com/partner', current: 'rel="nofollow"', recommended: 'rel="follow"' }] },
      { id: 'c7',  severity: 'notice',  fixType: 'advisory', impact: 'low', totalAffected: 1,
        title: 'HTML and HTTP header contain nofollow',
        description: 'Both the page HTML and response headers are reinforcing a nofollow signal.',
        whyItMatters: 'Dual nofollow directives confirm the restriction is intentional, but should be audited to ensure no high-value pages are accidentally blocked.',
        technicalDetails: 'A meta robots nofollow tag and an X-Robots-Tag nofollow header are both present. Combined, they redundantly instruct crawlers not to follow outgoing links on this page.',
        current: 1, fixed: 1, newRec: 0,
        pages: [{ url: 'https://example.com/resources', current: 'nofollow (meta + header)', recommended: 'Remove one directive' }] },
      { id: 'c8',  severity: 'error',   fixType: 'auto',     impact: 'high', totalAffected: 1,
        title: 'Robots.txt has too many redirects or a redirect loop',
        description: 'The robots.txt path is redirecting too many times, so crawlers cannot reliably fetch the rules file.',
        whyItMatters: 'Crawlers that cannot fetch robots.txt may abandon the site or default to unrestricted crawling — both outcomes are unpredictable and can lead to indexing of unintended pages.',
        technicalDetails: 'GET /robots.txt follows 3 or more 3XX redirects. Googlebot caps redirect chains at 5 hops; exceeding this causes the fetch to fail and robots rules to be treated as absent.',
        current: 1, fixed: 1, newRec: 0,
        pages: [{ url: 'https://example.com/robots.txt', current: '3 redirect hops', recommended: 'Resolve to direct 200' }] },
      { id: 'c9',  severity: 'notice',  fixType: 'auto',     impact: 'medium', totalAffected: 1,
        title: 'Robots.txt is set to disallow crawling',
        description: 'The robots.txt file is explicitly blocking crawl access to URLs that should be discoverable.',
        whyItMatters: 'A blanket Disallow rule prevents indexing of content you may want to rank, and reverting it requires a full recrawl before recovery is visible.',
        technicalDetails: 'The robots.txt file contains a Disallow: / rule for all user-agents, blocking crawl access to the entire domain. This does not de-index existing pages but prevents new discovery.',
        current: 1, fixed: 1, newRec: 0,
        pages: [{ url: 'https://example.com/robots.txt', current: 'Disallow: /', recommended: 'Allow: /' }] },
      { id: 'c10', severity: 'error',   fixType: 'manual',   impact: 'high', totalAffected: 1,
        title: 'Page timed out during crawl',
        description: 'The crawler could not finish loading the page within the allowed time window.',
        whyItMatters: 'Slow pages consume disproportionate crawl budget and may be deprioritised by Google, reducing crawl frequency and delaying index updates for the affected URLs.',
        technicalDetails: 'The page did not respond within the 30-second crawl timeout. This is typically caused by unoptimised server-side rendering, blocking JavaScript, or underpowered hosting.',
        current: 1, fixed: 0, newRec: 1,
        pages: [{ url: 'https://example.com/heavy-page', current: 'Timeout > 30s', recommended: 'Optimize page load speed' }] },
    ],
  },
  {
    id: 'localization', label: 'Localization & Hreflang',
    findings: [
      { id: 'l1', severity: 'error',   fixType: 'auto',     impact: 'high', totalAffected: 4, aiAvailable: true, isNew: true, aiRecommendation: 'Detected 4 hreflang tags pointing to non-canonical URLs. Each has a clear canonical equivalent already declared on the target page. Recommended: update each hreflang href to match the canonical exactly. This is a low-risk change — no content changes required, only href attribute updates in your <head> template.',
        title: 'Hreflang to non-canonical',
        description: 'The hreflang tag is pointing to a URL that is not the canonical version of the page.',
        whyItMatters: 'Hreflang must point to canonical URLs; pointing to non-canonical variants confuses Googlebot and can result in the wrong locale being served to users in different regions.',
        technicalDetails: 'The hreflang href attribute references a URL that carries a rel="canonical" pointing elsewhere. Google expects hreflang values to match the canonical URL exactly.',
        current: 1, fixed: 0, newRec: 1,
        pages: [
          { url: 'https://example.com/en/page', current: '/en/page-old', recommended: '/en/page' },
          { url: 'https://example.com/en/about', current: '/en/about-us-old', recommended: '/en/about' },
          { url: 'https://example.com/en/pricing', current: '/en/pricing-v1', recommended: '/en/pricing' },
        ] },
      { id: 'l2', severity: 'notice',  fixType: 'auto',     impact: 'medium', totalAffected: 8,
        title: 'HTML lang missing',
        description: 'The HTML document is missing a lang attribute and should declare its language explicitly.',
        whyItMatters: 'Without a lang attribute, assistive technologies and search engines cannot reliably infer the page language, which can affect accessibility compliance and language-targeted search results.',
        technicalDetails: 'The root <html> element has no lang attribute. W3C and Google both require this attribute for proper language identification; its absence may result in incorrect locale assignment.',
        current: 1, fixed: 0, newRec: 1,
        pages: [
          { url: 'https://example.com/about', current: '<html> (no lang)', recommended: '<html lang="en">' },
          { url: 'https://example.com/blog', current: '<html> (no lang)', recommended: '<html lang="en">' },
          { url: 'https://example.com/contact', current: '<html> (no lang)', recommended: '<html lang="en">' },
        ] },
      { id: 'l3', severity: 'warning', fixType: 'assisted', impact: 'medium', totalAffected: 1, isRegression: true,
        title: 'Hreflang and HTML lang do not match',
        description: 'The hreflang target language and the HTML lang attribute are not aligned.',
        whyItMatters: 'Mismatched language signals can cause Googlebot to discount both directives, meaning pages may be served to users in the wrong locale.',
        technicalDetails: 'The hreflang annotation specifies one BCP 47 language tag while the HTML lang attribute specifies a different one. Both signals must agree for correct language targeting.',
        current: 1, fixed: 1, newRec: 0,
        pages: [{ url: 'https://example.com/fr/page', current: 'hreflang="fr", lang="en"', recommended: 'Align both to "fr"' }] },
      { id: 'l4', severity: 'error',   fixType: 'auto',     impact: 'high', totalAffected: 1,
        title: 'Hreflang page does not link out to itself',
        description: 'The page is missing its self-referencing hreflang tag, creating an incomplete language cluster.',
        whyItMatters: 'Google requires every page in a hreflang cluster to include a self-referencing annotation; without it, the entire set of language alternates may be ignored.',
        technicalDetails: 'The hreflang set for this page is missing a tag where the href and hreflang values reference the page itself. This breaks the bidirectional confirmation Google requires.',
        current: 1, fixed: 1, newRec: 0,
        pages: [{ url: 'https://example.com/de/page', current: 'No self-referencing tag', recommended: 'Add hreflang="de" self' }] },
      { id: 'l5', severity: 'error',   fixType: 'assisted', impact: 'high', totalAffected: 1,
        title: 'Hreflang to 3XX, 4XX or 5XX',
        description: 'The hreflang target is redirecting or failing, which can break language targeting signals.',
        whyItMatters: 'Hreflang pointing to a redirecting or broken URL prevents Googlebot from validating the language cluster, causing the alternate page to be omitted from locale-specific results.',
        technicalDetails: 'The hreflang href resolves to a 301 redirect, 404, or 5XX error rather than a direct 200 response. Google requires hreflang targets to return 200 with valid content.',
        current: 1, fixed: 1, newRec: 0,
        pages: [{ url: 'https://example.com/es/page', current: '301 redirect', recommended: 'Point to final URL' }] },
      { id: 'l6', severity: 'notice',  fixType: 'auto',     impact: 'low', totalAffected: 1,
        title: 'Invalid HTML lang',
        description: 'The HTML lang attribute uses an invalid or unsupported language code.',
        whyItMatters: 'Invalid language codes are ignored by browsers and search engines, defeating the purpose of the lang attribute entirely.',
        technicalDetails: 'The lang attribute value does not conform to BCP 47 (e.g. "en-UK" instead of "en-GB"). Validators and crawlers will treat the malformed value as absent.',
        current: 1, fixed: 1, newRec: 0,
        pages: [{ url: 'https://example.com/page-x', current: 'lang="en-UK"', recommended: 'lang="en-GB"' }] },
      { id: 'l7', severity: 'notice',  fixType: 'auto',     impact: 'low', totalAffected: 1,
        title: 'Multiple language codes for one page',
        description: 'The page is declaring more than one language code for the same locale target.',
        whyItMatters: 'Duplicate hreflang entries for the same locale create ambiguity that can cause Googlebot to discard the entire set for that language target.',
        technicalDetails: 'Two or more hreflang annotations share the same hreflang value pointing to the same or different URLs. Only one annotation per language-region code is permitted per page.',
        current: 1, fixed: 1, newRec: 0,
        pages: [{ url: 'https://example.com/intl/page', current: 'hreflang="en" x2', recommended: 'Deduplicate to one tag' }] },
    ],
  },
  {
    id: 'content', label: 'Content & Structure',
    findings: [
      { id: 'cs1', severity: 'error',   fixType: 'auto',     impact: 'critical', totalAffected: 1,
        title: 'Multiple rel="canonical"',
        description: 'The page has more than one canonical tag, which creates conflicting consolidation signals.',
        whyItMatters: 'When multiple canonical tags are present, Google ignores all of them and makes its own determination — often choosing an unintended URL as the canonical.',
        technicalDetails: 'Two or more <link rel="canonical"> elements appear in the document <head>. The HTML spec only permits one; the presence of multiple makes the entire canonical signal undefined.',
        current: 1, fixed: 0, newRec: 1,
        pages: [{ url: 'https://example.com/product', current: '2 canonical tags', recommended: 'Keep one: /product' }] },
      { id: 'cs2', severity: 'warning', fixType: 'auto',     impact: 'medium', totalAffected: 1,
        title: 'H1 tag empty',
        description: 'The page includes an H1 element, but it is empty and not reinforcing the page topic.',
        whyItMatters: 'An empty H1 wastes one of the strongest on-page relevance signals available — search engines use H1 content to confirm page topic and it directly influences featured snippet eligibility.',
        technicalDetails: 'The <h1> element exists in the DOM but contains no visible text content. This may result from a CMS template bug, JavaScript render failure, or omitted copy.',
        current: 1, fixed: 1, newRec: 0,
        pages: [{ url: 'https://example.com/landing', current: '<h1></h1>', recommended: '<h1>Your Brand Name</h1>' }] },
    ],
  },
  {
    id: 'metatags', label: 'Meta Tags & Descriptions',
    findings: [
      { id: 'm1', severity: 'error',   fixType: 'auto',     impact: 'high', totalAffected: 1,
        title: 'Multiple title tags',
        description: 'Some pages are publishing more than one title tag, which creates conflicting search snippets.',
        whyItMatters: 'Multiple title tags cause unpredictable snippet generation — Google may use any of the titles in SERPs, often picking the one least optimised for your target query.',
        technicalDetails: 'More than one <title> element is present in the document <head>. Only the first is generally used by browsers, but parsers and crawlers may behave differently.',
        current: 1, fixed: 1, newRec: 1,
        pages: [{ url: 'https://example.com/home', current: '2 title tags', recommended: 'Keep one: "Home | Brand"' }] },
      { id: 'm2', severity: 'warning', fixType: 'auto',     impact: 'medium', totalAffected: 1,
        title: 'Multiple description tags',
        description: 'Pages are outputting more than one meta description, which makes snippet selection less predictable.',
        whyItMatters: 'Duplicate meta descriptions reduce your control over how pages appear in search results, lowering click-through rates when Google selects the wrong variant.',
        technicalDetails: 'Two or more <meta name="description"> elements appear in the document <head>. Only one should be present; the second is typically an artefact of a plugin or theme conflict.',
        current: 1, fixed: 1, newRec: 0,
        pages: [{ url: 'https://example.com/services', current: '2 meta descriptions', recommended: 'Keep one concise description' }] },
    ],
  },
  {
    id: 'security', label: 'Security & SSL',
    findings: [
      { id: 's1', severity: 'warning', fixType: 'auto',     impact: 'medium', totalAffected: 1,
        title: 'rel="canonical" from HTTPS to HTTP',
        description: 'Canonical tags are still pointing to HTTP versions instead of the secure published URL.',
        whyItMatters: 'Canonicalising to HTTP signals to Google that the non-secure version is preferred, potentially undoing HTTPS migration work and triggering "not secure" warnings in browser UIs.',
        technicalDetails: 'The <link rel="canonical"> href begins with http:// rather than https://. On a fully HTTPS site this is almost always a misconfigured CMS setting or hardcoded URL in a template.',
        current: 1, fixed: 1, newRec: 1,
        pages: [{ url: 'https://example.com/page', current: 'canonical: http://...', recommended: 'canonical: https://...' }] },
      { id: 's2', severity: 'warning', fixType: 'auto',     impact: 'medium', totalAffected: 1,
        title: 'HTTP URLs in XML sitemap',
        description: 'The sitemap is still listing HTTP URLs, which weakens canonical consistency for secure pages.',
        whyItMatters: 'HTTP URLs in the sitemap create a mismatch between what you declare as canonical and what you submit for crawling, which can slow down HTTPS adoption in the index.',
        technicalDetails: 'One or more <loc> entries in the XML sitemap use the http:// scheme. Sitemaps should exclusively reference the canonical (HTTPS) versions of all URLs.',
        current: 1, fixed: 1, newRec: 0,
        pages: [{ url: 'https://example.com/sitemap.xml', current: 'http:// URLs listed', recommended: 'Use https:// throughout' }] },
    ],
  },
  {
    id: 'sitemap', label: 'Sitemap Health',
    findings: [
      { id: 'sm1', severity: 'error',   fixType: 'auto',     impact: 'high', totalAffected: 1,
        title: '5XX pages in XML sitemap',
        description: 'The sitemap includes URLs that currently fail with a server-side error.',
        whyItMatters: 'Submitting broken URLs wastes Google Search Console quota, slows overall crawl efficiency, and signals poor site maintenance to automated quality systems.',
        technicalDetails: '3 <loc> entries in the sitemap return 500-level responses. Google treats submitted 5XX URLs as temporarily unavailable but after repeated failures may remove them from the crawl queue.',
        current: 1, fixed: 1, newRec: 0,
        pages: [{ url: 'https://example.com/sitemap.xml', current: '3 URLs return 5XX', recommended: 'Remove or fix failing URLs' }] },
      { id: 'sm2', severity: 'error',   fixType: 'auto',     impact: 'high', totalAffected: 1,
        title: 'Sitemap pages timed out',
        description: 'The sitemap contains pages that timed out during the audit and should be removed or stabilized.',
        whyItMatters: 'Timed-out pages stall the crawl pipeline — Googlebot will retry repeatedly, consuming crawl budget and delaying indexation of healthy pages.',
        technicalDetails: 'A <loc> entry did not respond within the crawl timeout window. This indicates either a very slow server response time or a URL that no longer resolves to valid content.',
        current: 1, fixed: 1, newRec: 0,
        pages: [{ url: 'https://example.com/sitemap.xml', current: '1 page timed out', recommended: 'Remove or optimize page' }] },
    ],
  },
  {
    id: 'css', label: 'CSS Resources',
    findings: [
      { id: 'css1', severity: 'notice',  fixType: 'assisted', impact: 'low', totalAffected: 3,
        title: 'CSS not cached',
        description: 'Stylesheets are not being served with strong cache headers on some templates.',
        whyItMatters: 'Uncached CSS files are re-downloaded on every page visit, increasing page load times and reducing Core Web Vitals scores which directly influence search rankings.',
        technicalDetails: 'The CSS resource is served with Cache-Control: no-store or no cache directive at all. Adding a long max-age with an immutable fingerprint in the filename enables aggressive browser caching.',
        current: 0, fixed: 1, newRec: 1,
        pages: [
          { url: 'https://example.com/styles/main.css', current: 'Cache-Control: no-store', recommended: 'Cache-Control: max-age=31536000' },
          { url: 'https://example.com/styles/theme.css', current: 'No Cache-Control header', recommended: 'Cache-Control: max-age=31536000, immutable' },
          { url: 'https://example.com/styles/components.css', current: 'Cache-Control: no-cache', recommended: 'Cache-Control: max-age=31536000' },
        ] },
      { id: 'css2', severity: 'notice',  fixType: 'assisted', impact: 'low', totalAffected: 2,
        title: 'CSS not compressed',
        description: 'CSS assets are being delivered without compression, increasing transfer size.',
        whyItMatters: 'Uncompressed CSS increases page weight and slows initial render, negatively impacting Largest Contentful Paint — a Core Web Vitals metric that feeds into search ranking signals.',
        technicalDetails: 'The server response does not include Content-Encoding: gzip or br. Most modern servers and CDNs can enable brotli or gzip compression with a single configuration change.',
        current: 1, fixed: 1, newRec: 0,
        pages: [
          { url: 'https://example.com/styles/bundle.css', current: 'No gzip/brotli', recommended: 'Enable compression' },
          { url: 'https://example.com/styles/vendor.css', current: 'No gzip/brotli', recommended: 'Enable compression' },
        ] },
      { id: 'css3', severity: 'error',   fixType: 'manual',   impact: 'medium', totalAffected: 1,
        title: 'External CSS files with 3XX, 4XX or 5XX',
        description: 'Some stylesheet URLs are redirecting or failing, which can affect layout and render completeness.',
        whyItMatters: 'A broken external stylesheet can cause layout shifts and render-blocking errors that directly harm Core Web Vitals scores and user experience signals.',
        technicalDetails: 'A <link rel="stylesheet"> href resolves to a non-200 response. Browsers may partially apply redirected stylesheets or skip failed ones entirely, causing inconsistent rendering.',
        current: 1, fixed: 1, newRec: 0,
        pages: [{ url: 'https://cdn.example.com/plugin.css', current: '404 Not Found', recommended: 'Remove or fix the reference' }] },
    ],
  },
  {
    id: 'external', label: 'External Linking',
    findings: [
      { id: 'el1', severity: 'warning', fixType: 'assisted', impact: 'medium', totalAffected: 1,
        title: 'External links to 5XX',
        description: 'Outbound links are pointing to partner or reference URLs that currently fail on the destination server.',
        whyItMatters: 'Linking to broken external pages degrades user experience and can be interpreted as poor editorial quality by search quality evaluators and automated systems.',
        technicalDetails: 'One or more <a href> elements point to external URLs returning 5XX responses. These should be updated to working alternatives or removed until the destination recovers.',
        current: 1, fixed: 1, newRec: 0,
        pages: [{ url: 'https://example.com/resources', current: 'Links to: partner.com (500)', recommended: 'Update or remove link' }] },
      { id: 'el2', severity: 'notice',  fixType: 'advisory', impact: 'low', totalAffected: 1,
        title: 'Nofollow external links',
        description: 'Some outbound links are marked nofollow and may need editorial review to confirm that choice still makes sense.',
        whyItMatters: 'Over-applying nofollow to legitimate editorial links can signal low-trust content practices; auditing these ensures you are only restricting links that genuinely warrant it.',
        technicalDetails: 'Three external <a> elements include rel="nofollow". Google treats this as a hint rather than a directive since 2019, but the annotation should still reflect intentional editorial policy.',
        current: 1, fixed: 0, newRec: 0,
        pages: [{ url: 'https://example.com/blog/post', current: 'rel="nofollow" on 3 links', recommended: 'Review and update as needed' }] },
    ],
  },
  {
    id: 'redirects', label: 'Redirects',
    findings: [
      { id: 'r1', severity: 'error', fixType: 'auto', impact: 'high', totalAffected: 8, aiAvailable: true,
        aiRecommendation: 'Analysed 8 redirect chains — all follow predictable slug migration patterns. Recommended fix: update each originating redirect to point directly to the final destination, skipping intermediaries. Estimated fix time: 15 min. Confidence: high (93%).',
        title: 'Redirect chains (3+ hops)',
        description: 'Pages are redirected through 3 or more hops before reaching the destination, adding latency and diluting link equity.',
        whyItMatters: 'Each additional redirect hop adds 100–300ms of latency and dilutes link equity. Googlebot may stop following chains beyond 5 hops, leaving pages uncrawled.',
        technicalDetails: 'Trace each chain and update the originating redirect to point directly to the final destination URL. Use curl -I or a redirect checker to map chains.',
        current: 8, fixed: 2, newRec: 0,
        pages: [
          { url: 'https://example.com/old-pricing', current: '/pricing-2022 → /pricing-v2 → /pricing-new → /pricing (4 hops)', recommended: 'Direct 301 → /pricing' },
          { url: 'https://example.com/old-agency', current: '/agency-2021 → /agency-v2 → /agency (3 hops)', recommended: 'Direct 301 → /agency' },
        ] },
      { id: 'r2', severity: 'warning', fixType: 'auto', impact: 'medium', totalAffected: 3, isRegression: true,
        title: 'Temporary redirect (302) used instead of permanent (301)',
        description: '302 redirects tell crawlers the source URL will return, preventing PageRank from consolidating at the destination.',
        whyItMatters: 'A 302 keeps both the source and destination URLs in the index and splits link equity. For permanently moved pages, a 301 is the correct signal.',
        technicalDetails: 'Update server or CDN redirect configuration to use HTTP 301 for permanently moved pages. 302 is appropriate only for truly temporary redirects.',
        current: 3, fixed: 0, newRec: 1,
        pages: [{ url: 'https://example.com/blog', current: '302 → /news', recommended: '301 → /news' }] },
      { id: 'r3', severity: 'error', fixType: 'manual', impact: 'critical', totalAffected: 1, needsDev: true,
        title: 'Redirect loop detected',
        description: 'A URL redirects back to itself or creates a circular chain, making it completely unreachable.',
        whyItMatters: 'Redirect loops make pages unreachable to both users and crawlers, removing them from the index entirely.',
        technicalDetails: 'Trace the full redirect path to find where the loop starts. Common causes: HTTPS redirect rules conflicting with CMS permalink settings.',
        current: 1, fixed: 0, newRec: 0,
        pages: [{ url: 'https://example.com/services', current: '/services → /services-new → /services (loop)', recommended: 'Resolve circular redirect' }] },
    ],
  },
  {
    id: 'images', label: 'Images & Media',
    findings: [
      { id: 'im1', severity: 'warning', fixType: 'assisted', impact: 'high', totalAffected: 23, aiAvailable: true, needsEditor: true,
        aiRecommendation: 'Using surrounding page context and image filenames, AI has generated suggested alt text for 19 of the 23 affected images. Suggestions range from high confidence (product images with clear filenames) to medium (generic stock photos). Review and apply suggestions individually or approve all high-confidence ones in bulk.',
        title: 'Images missing alt text',
        description: 'Images are present without descriptive alt attributes, reducing accessibility and keyword relevance signals.',
        whyItMatters: 'Alt text provides contextual signals to search engines about image content and is a ranking factor for image search. Missing alt text also breaks WCAG accessibility compliance.',
        technicalDetails: 'Add descriptive alt attributes to all non-decorative <img> elements. Avoid generic values ("image001") or leaving alt empty on meaningful images.',
        current: 23, fixed: 5, newRec: 0,
        pages: [
          { url: 'https://example.com/agency', current: '<img src="team.jpg"> (no alt)', recommended: '<img src="team.jpg" alt="Agency team at client workshop">' },
          { url: 'https://example.com/features', current: '<img src="dashboard.png"> (no alt)', recommended: '<img src="dashboard.png" alt="Analytics dashboard overview">' },
          { url: 'https://example.com/case-studies', current: '5 images without alt', recommended: 'Add descriptive alt text to each' },
        ] },
      { id: 'im2', severity: 'notice', fixType: 'auto', impact: 'medium', totalAffected: 11,
        title: 'Images missing width and height attributes',
        description: 'Images without explicit dimensions cause layout shifts as they load, increasing CLS.',
        whyItMatters: 'Missing dimensions cause Cumulative Layout Shift (CLS), a Core Web Vitals metric directly factored into Google Page Experience ranking.',
        technicalDetails: 'Add width and height attributes matching the intrinsic image dimensions to all <img> elements to allow the browser to reserve space.',
        current: 11, fixed: 8, newRec: 0,
        pages: [{ url: 'https://example.com/blog/post-1', current: '<img src="hero.jpg"> (no dimensions)', recommended: '<img src="hero.jpg" width="1200" height="630">' }] },
      { id: 'im3', severity: 'warning', fixType: 'manual', impact: 'medium', totalAffected: 7, needsDev: true,
        title: 'Oversized images not compressed',
        description: 'Images are served at file sizes significantly larger than the displayed dimensions require.',
        whyItMatters: 'Uncompressed images increase page weight, slow LCP, and reduce Core Web Vitals scores which directly affect rankings.',
        technicalDetails: 'Serve images in WebP or AVIF format at the rendered display size. Use an image CDN or build pipeline for automatic compression.',
        current: 7, fixed: 0, newRec: 7,
        pages: [{ url: 'https://example.com/hero', current: '4.2 MB PNG (displayed at 800×400)', recommended: 'WebP at 800×400 (est. ~120 KB)' }] },
      { id: 'im4', severity: 'error', fixType: 'auto', impact: 'high', totalAffected: 3, isNew: true,
        title: 'Broken image links (4XX)',
        description: 'Some image src attributes point to URLs that return 404 errors.',
        whyItMatters: 'Broken images degrade user experience and signal poor site maintenance. They also waste crawl budget on unreachable assets.',
        technicalDetails: 'Update or remove <img> src attributes pointing to non-existent URLs. Check your media library for renamed or deleted files.',
        current: 3, fixed: 1, newRec: 0,
        pages: [{ url: 'https://example.com/about', current: '<img src="/old-images/team.jpg"> (404)', recommended: 'Update to /images/team.jpg or remove' }] },
    ],
  },
  {
    id: 'javascript', label: 'JavaScript Resources',
    findings: [
      { id: 'js1', severity: 'error', fixType: 'manual', impact: 'high', totalAffected: 4, needsDev: true, isNew: true,
        title: 'Render-blocking JavaScript',
        description: 'JavaScript files loaded synchronously in the <head> block page rendering, delaying first paint.',
        whyItMatters: 'Render-blocking scripts delay first contentful paint and worsen LCP — a Core Web Vitals metric directly factored into search rankings.',
        technicalDetails: 'Add defer or async attributes to non-critical <script> tags. For critical scripts, consider inlining or moving to before </body>.',
        current: 4, fixed: 0, newRec: 4,
        pages: [
          { url: 'https://example.com/', current: '<script src="analytics.js"> (blocking)', recommended: '<script src="analytics.js" defer>' },
          { url: 'https://example.com/pricing', current: '<script src="widget.js"> (blocking)', recommended: '<script src="widget.js" async>' },
        ] },
      { id: 'js2', severity: 'notice', fixType: 'assisted', impact: 'low', totalAffected: 6, needsDev: true,
        title: 'JavaScript not cached',
        description: 'JS files are served without long-term cache headers, causing unnecessary re-downloads.',
        whyItMatters: 'Without caching, every page visit re-downloads all JS, increasing load time and bandwidth usage.',
        technicalDetails: 'Set Cache-Control: max-age=31536000, immutable for versioned JS bundles with content-hashed filenames.',
        current: 6, fixed: 3, newRec: 0,
        pages: [{ url: 'https://example.com/app.js', current: 'Cache-Control: no-store', recommended: 'Cache-Control: max-age=31536000, immutable' }] },
      { id: 'js3', severity: 'warning', fixType: 'auto', impact: 'medium', totalAffected: 2,
        title: 'JavaScript files not compressed',
        description: 'JS assets are delivered without gzip or brotli compression, increasing transfer size.',
        whyItMatters: 'Uncompressed JavaScript increases page weight by 60–80%, slowing load times and worsening LCP scores.',
        technicalDetails: 'Enable brotli or gzip compression for all .js assets on your CDN or web server. Most platforms support this with a single config change.',
        current: 2, fixed: 2, newRec: 0,
        pages: [{ url: 'https://example.com/bundle.js', current: 'No compression (340 KB)', recommended: 'Enable brotli (est. 82 KB)' }] },
    ],
  },
  {
    id: 'speed', label: 'Speed & Performance',
    findings: [
      { id: 'sp1', severity: 'error', fixType: 'manual', impact: 'critical', totalAffected: 6, needsDev: true, aiAvailable: true,
        aiRecommendation: 'The LCP element on 5 of the 6 failing pages is a hero image served as PNG without preload hints. Converting to WebP with an explicit <link rel="preload"> and adding intrinsic width/height attributes is estimated to reduce LCP by 40–60% on these pages. Confidence: high (88%).',
        title: 'LCP above 4 seconds',
        description: 'Largest Contentful Paint exceeds Google\'s "Poor" threshold of 4s, indicating significant page load issues.',
        whyItMatters: 'LCP is a Core Web Vitals metric used directly in Google\'s Page Experience ranking signal. Pages above 4s receive a "Poor" rating that actively harms rankings.',
        technicalDetails: 'Profile the LCP element in Chrome DevTools Lighthouse. Common causes: unoptimised hero images, render-blocking resources, slow server response (TTFB).',
        current: 6, fixed: 0, newRec: 6,
        pages: [
          { url: 'https://example.com/', current: 'LCP: 6.2s (hero image, 4.2 MB PNG)', recommended: 'Serve as WebP + preload hint → target < 2.5s' },
          { url: 'https://example.com/pricing', current: 'LCP: 4.8s (render-blocked fonts)', recommended: 'Preconnect + font-display: swap → target < 2.5s' },
        ] },
      { id: 'sp2', severity: 'warning', fixType: 'assisted', impact: 'high', totalAffected: 4, needsDev: true,
        title: 'High Cumulative Layout Shift (CLS > 0.25)',
        description: 'Pages are experiencing significant layout shifts during load, scoring in the "Poor" CLS range.',
        whyItMatters: 'CLS is a Core Web Vitals metric. A "Poor" rating in Google\'s Page Experience assessment negatively impacts rankings and frustrates users.',
        technicalDetails: 'Use Chrome DevTools or PageSpeed Insights to identify shift-causing elements. Most common cause: images or embeds without declared dimensions.',
        current: 4, fixed: 0, newRec: 2,
        pages: [
          { url: 'https://example.com/blog', current: 'CLS: 0.31 (images without dimensions)', recommended: 'Add width/height to images → target < 0.1' },
          { url: 'https://example.com/landing', current: 'CLS: 0.28 (late-loading ad slot)', recommended: 'Reserve ad container space → target < 0.1' },
        ] },
      { id: 'sp3', severity: 'warning', fixType: 'assisted', impact: 'medium', totalAffected: 8, needsDev: true,
        title: 'TTFB above 800ms',
        description: 'Server response time is above the recommended 800ms threshold on multiple pages.',
        whyItMatters: 'High TTFB delays all subsequent page load steps and is flagged by Google PageSpeed Insights as a performance issue.',
        technicalDetails: 'Investigate server processing time, database query performance, and CDN configuration. Server-side caching often resolves TTFB for dynamic pages.',
        current: 8, fixed: 2, newRec: 0,
        pages: [{ url: 'https://example.com/products', current: 'TTFB: 1.2s', recommended: 'Add server-side cache → target < 200ms' }] },
    ],
  },
]

const CATEGORY_SHORTS = {
  crawlability: 'Crawlability',
  localization: 'Localization',
  content:      'Content',
  metatags:     'Meta tags',
  security:     'Security',
  sitemap:      'Sitemap',
  css:          'CSS',
  external:     'External links',
  redirects:    'Redirects',
  images:       'Images',
  javascript:   'JavaScript',
  speed:        'Speed',
}

// ─── Scan results helpers ────────────────────────────────────────────────────

function SevBadge({ severity }) {
  const s = SEV_META[severity]
  return (
    <span className={`inline-flex items-center gap-[2px] px-2 h-6 rounded-full border text-[12px] font-medium ${s.bg} ${s.text} ${s.border}`}>
      <s.Icon size={10} />
      {s.label}
    </span>
  )
}

function FixBadge({ fixType }) {
  const f = FIX_META[fixType]
  if (!f) return null
  return (
    <span className={`inline-flex items-center gap-[2px] px-2 h-6 rounded-full border text-[12px] font-medium ${f.bg} ${f.text} ${f.border}`}>
      {f.Icon && <f.Icon size={10} />}
      {f.label}
    </span>
  )
}

function ImpactBadge({ impact }) {
  const m = IMPACT_META[impact]
  if (!m) return null
  return (
    <span className={`inline-flex items-center gap-[2px] px-2 h-6 rounded-full border text-[12px] font-medium ${m.bg} ${m.text} ${m.border}`}>
      {m.label}
    </span>
  )
}

function FindingCard({ finding, isExpanded, onToggle, isSelected, onSelect, expandedTab, onExpandedTabChange, pageSearch, onPageSearchChange, fixedPages, onFixPage, onFixAll }) {
  const s            = SEV_META[finding.severity] || SEV_META.notice
  const autoFixable  = finding.fixType === 'auto'
  const assistedFix  = finding.fixType === 'assisted'
  const activeTab    = expandedTab || 'recommended'
  const searchTerm   = pageSearch || ''

  const [selectedPageUrls, setSelectedPageUrls] = useState(new Set())
  const [tablePage, setTablePage]               = useState(1)
  const TABLE_PER_PAGE = 6

  const [editingUrl,  setEditingUrl]  = useState(null)       // URL whose AI value is being edited
  const [editValues,  setEditValues]  = useState({})          // { url: customValue }
  const [copiedUrl,   setCopiedUrl]   = useState(null)        // URL showing "copied" feedback (manual fix)
  function copyRecommended(p) {
    if (navigator.clipboard) navigator.clipboard.writeText(p.recommended || '')
    setCopiedUrl(p.url)
    setTimeout(() => setCopiedUrl(u => (u === p.url ? null : u)), 1500)
  }
  const [reEditSet,   setReEditSet]   = useState(new Set())   // fixed URLs opened for re-editing

  const fixedSet        = fixedPages || new Set()
  const fixedForFinding = finding.pages.filter(p => fixedSet.has(`${finding.id}::${p.url}`)).length
  const openCount       = Math.max(0, finding.current - fixedForFinding)
  const filteredPages   = finding.pages.filter(p => p.url.toLowerCase().includes(searchTerm.toLowerCase()))
  const totalTablePages = Math.max(1, Math.ceil(filteredPages.length / TABLE_PER_PAGE))
  const visiblePages    = filteredPages.slice((tablePage - 1) * TABLE_PER_PAGE, tablePage * TABLE_PER_PAGE)

  useEffect(() => { setTablePage(1) }, [searchTerm])

  function togglePageSelect(url) {
    setSelectedPageUrls(prev => { const n = new Set(prev); n.has(url) ? n.delete(url) : n.add(url); return n })
  }
  const openVisibleUrls  = visiblePages.filter(p => !fixedSet.has(`${finding.id}::${p.url}`)).map(p => p.url)
  const allVisibleChecked = openVisibleUrls.length > 0 && openVisibleUrls.every(u => selectedPageUrls.has(u))
  function toggleAllVisible() {
    setSelectedPageUrls(prev => {
      const n = new Set(prev)
      allVisibleChecked ? openVisibleUrls.forEach(u => n.delete(u)) : openVisibleUrls.forEach(u => n.add(u))
      return n
    })
  }

  const selectedOpenCount = [...selectedPageUrls].filter(u => !fixedSet.has(`${finding.id}::${u}`)).length
  const manualFix   = finding.fixType === 'manual'
  const advisoryFix = finding.fixType === 'advisory'
  const readOnlyFix = manualFix || advisoryFix   // no checkbox, no apply action
  const autoSelectable = autoFixable && openCount > 0   // auto checkbox disabled once fully fixed

  // Assisted fix: recommended value is pre-filled and editable; use it as the initial value
  const assistedInitial = p => (editValues[p.url] !== undefined ? editValues[p.url] : (p.recommended || ''))

  // Assisted fix: selectable = open rows with a valid value (non-empty, not same as current)
  const assistedSelectableUrls = assistedFix
    ? visiblePages.filter(p => {
        const val = assistedInitial(p).trim()
        const hasError = val !== '' && val === p.current?.trim()
        return !fixedSet.has(`${finding.id}::${p.url}`) && val !== '' && !hasError
      }).map(p => p.url)
    : []
  const assistedAllChecked = assistedSelectableUrls.length > 0 && assistedSelectableUrls.every(u => selectedPageUrls.has(u))
  const assistedSomeChecked = assistedSelectableUrls.some(u => selectedPageUrls.has(u))
  const assistedIndeterminate = assistedSomeChecked && !assistedAllChecked

  return (
    <div id={`finding-${finding.id}`} className={`bg-white transition-colors ${isExpanded ? 'bg-gray-50/30' : 'hover:bg-gray-50/60'}`}>

      {/* ── Collapsed row — fixed expand + checkbox columns (HLDataTable expanded-row alignment) ── */}
      <div className="flex items-start py-3 cursor-pointer select-none" onClick={onToggle}>
        <div
          className="shrink-0 flex items-center justify-center pt-0.5"
          style={{ width: TABLE_EXPAND_COL, minWidth: TABLE_EXPAND_COL }}
        >
          <ChevronRight size={13} className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
        </div>

        {/* Category-level checkbox (auto-fix batch selection) — disabled once fully fixed */}
        <div
          className="shrink-0 flex items-center justify-center pt-0.5"
          style={{ width: TABLE_CHECK_COL, minWidth: TABLE_CHECK_COL }}
          onClick={autoSelectable ? e => { e.stopPropagation(); onSelect() } : e => e.stopPropagation()}
        >
          <div
            className={`rounded border flex items-center justify-center transition-colors ${
              autoSelectable
                ? isSelected ? 'bg-primary-600 border-primary-600 cursor-pointer' : 'border-gray-300 hover:border-primary-400 cursor-pointer'
                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
            }`}
            style={{ width: TABLE_CHECKBOX_PX, height: TABLE_CHECKBOX_PX }}
          >
            {isSelected && <Check size={9} className="text-white" />}
          </div>
        </div>

        {/* Severity icon */}
        <div className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${s.bg}`}>
          <s.Icon size={12} className={s.text} />
        </div>

        {/* Title + description */}
        <div className="flex-1 min-w-0 ml-3 pr-4">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-semibold text-gray-900 leading-snug">{finding.title}</p>
            {finding.isNew && <span className="text-[12px] font-semibold text-primary-600 bg-primary-50 border border-primary-100 px-1.5 py-0.5 rounded">New</span>}
            {finding.isRegression && <span className="text-[12px] font-semibold text-warning-700 bg-warning-100 border border-warning-200 px-1.5 py-0.5 rounded">Regression</span>}
          </div>
          <p className="text-[12px] text-gray-400 mt-0.5 leading-snug">{finding.description}</p>
        </div>

        {/* Right metadata */}
        <div className="flex items-center gap-2.5 shrink-0 mt-0.5 pr-4">
          <FixBadge fixType={finding.fixType} />
          <span className={`text-[12px] font-semibold ${s.text} hidden sm:inline`}>{s.label}</span>
          {fixedForFinding > 0 && <span className="text-[12px] font-semibold text-success-600">{fixedForFinding} fixed</span>}
          {openCount > 0 && <span className="text-[12px] text-gray-500">{openCount} open</span>}
        </div>
      </div>

      {/* ── Expanded panel — spacer matches expand col; nested checkboxes sit in check col ── */}
      {isExpanded && (
        <div className="flex mb-4">
          <div className="shrink-0" style={{ width: TABLE_EXPAND_COL, minWidth: TABLE_EXPAND_COL }} />
          <div className="flex-1 min-w-0 mr-4 border border-gray-100 rounded-lg bg-white overflow-hidden shadow-sm">

          {/* Tab strip + Fix all */}
          <div className="px-5 pt-1 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center">
              {[
                { id: 'recommended', label: 'Recommended fix' },
                { id: 'why',         label: 'Why it matters'  },
                { id: 'technical',   label: 'Technical details'},
              ].map(t => (
                <button
                  key={t.id}
                  onClick={e => { e.stopPropagation(); onExpandedTabChange(t.id) }}
                  className={`px-3 py-2.5 text-[12px] font-medium border-b-2 transition-all whitespace-nowrap -mb-px ${
                    activeTab === t.id
                      ? 'border-primary-600 text-primary-700 font-semibold'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {autoFixable && openCount > 0 && (
              <button
                onClick={e => { e.stopPropagation(); onFixAll && onFixAll(finding, openCount) }}
                className="self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[12px] font-semibold transition-colors whitespace-nowrap"
              >
                <Zap size={11} /> Fix all ({openCount})
              </button>
            )}
          </div>

          {/* Tab content — assisted table flush-left so page checkboxes share the finding checkbox column */}
          <div className={activeTab === 'recommended' ? 'py-4' : 'px-5 py-4'}>
            {activeTab === 'recommended' && (
              <div className="flex flex-col gap-3">
                {/* Sub-header */}
                <div className="flex items-center justify-between px-5">
                  <p className="text-[12px] font-semibold text-gray-500">
                    Affected pages ({filteredPages.length} of {finding.totalAffected} shown)
                  </p>
                  <div className="relative flex items-center">
                    <Search size={12} className="absolute left-2.5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => onPageSearchChange(e.target.value)}
                      placeholder="Search URLs..."
                      onClick={e => e.stopPropagation()}
                      className="h-8 pl-7 pr-3 rounded-lg border border-gray-300 bg-white text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary-600 transition-all w-44"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden mx-5 border border-gray-100 rounded-lg">
                  <table className="w-full table-fixed text-left border-collapse">
                    <colgroup>
                      <col style={{ width: '38%' }} />
                      <col style={{ width: '24%' }} />
                      <col />
                      {(autoFixable || assistedFix) && <col style={{ width: '76px' }} />}
                    </colgroup>
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-3 py-2.5 text-[12px] font-medium text-gray-900">URL</th>
                        <th className="px-3 py-2.5 text-[12px] font-medium text-gray-900">Current state</th>
                        <th className="px-3 py-2.5 text-[12px] font-medium text-gray-900">
                          {manualFix ? 'Value to apply' : advisoryFix ? 'Recommendation' : assistedFix ? 'Value to be applied' : 'Recommended'}
                        </th>
                        {(autoFixable || assistedFix) && <th className="py-2" />}
                      </tr>
                    </thead>
                    <tbody>
                      {visiblePages.map((page, i) => {
                        const pageKey    = `${finding.id}::${page.url}`
                        const isFixed    = fixedSet.has(pageKey)
                        const isRowSel   = selectedPageUrls.has(page.url)
                        const isEditing  = editingUrl === page.url
                        const isReEdit   = reEditSet.has(page.url)
                        const autoEditVal  = editValues[page.url] !== undefined ? editValues[page.url] : page.recommended
                        const assistedVal  = editValues[page.url] !== undefined ? editValues[page.url] : (page.recommended || '')
                        const valError     = assistedVal.trim() !== '' && assistedVal.trim() === page.current?.trim()
                          ? 'Value matches current state — no change will be applied'
                          : null
                        const canCheck     = assistedFix && assistedVal.trim() !== '' && !valError && !isFixed

                        function openEdit() {
                          setEditingUrl(page.url)
                          setEditValues(prev => ({ ...prev, [page.url]: prev[page.url] ?? page.recommended }))
                        }
                        function saveEdit() {
                          // Editing only persists the value (already stored in editValues on change).
                          // Applying the fix + toaster happens via the row "Fix" CTA / "Fix all".
                          setEditingUrl(null)
                        }
                        function openReEdit() {
                          setReEditSet(prev => { const n = new Set(prev); n.add(page.url); return n })
                          setEditValues(prev => ({ ...prev, [page.url]: prev[page.url] ?? page.recommended }))
                        }
                        function saveReEdit() {
                          setReEditSet(prev => { const n = new Set(prev); n.delete(page.url); return n })
                          setSelectedPageUrls(prev => { const n = new Set(prev); n.delete(page.url); return n })
                          onFixPage && onFixPage(finding.id, page.url)
                        }

                        return (
                          <tr key={i} className={`border-b border-gray-50 last:border-0 transition-colors ${isEditing || isReEdit ? 'bg-primary-50/30' : 'bg-white hover:bg-gray-50/40'}`}>

                            {/* URL */}
                            <td className="px-3 py-2.5" style={{ verticalAlign: 'top' }}>
                              <div className="flex items-center gap-1.5 min-w-0 pt-0.5">
                                <span className="text-[12px] font-medium truncate text-primary-600">{page.url}</span>
                                <ExternalLink size={11} className="shrink-0 text-primary-600" />
                              </div>
                            </td>

                            {/* Current state */}
                            <td className="px-3 py-2.5" style={{ verticalAlign: 'top' }}>
                              <span className={`text-[12px] font-mono ${isFixed && !isReEdit ? 'text-gray-400' : 'text-error-700'}`}>{page.current}</span>
                            </td>

                            {/* Recommended / Value to be applied / Recommendation / How to fix */}
                            <td className="px-3 py-2.5" style={{ verticalAlign: 'top' }}>
                              {readOnlyFix ? (
                                manualFix ? (
                                  /* Manual fix — a value to apply yourself (styled like the auto-fix value), copy icon inline */
                                  <div className="inline-flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                    <span className="text-[12px] font-mono text-success-700">{page.recommended}</span>
                                    <button
                                      onClick={e => { e.stopPropagation(); copyRecommended(page) }}
                                      className={`transition-colors shrink-0 ${copiedUrl === page.url ? 'text-success-600' : 'text-gray-400 hover:text-gray-600'}`}
                                      title={copiedUrl === page.url ? 'Copied' : 'Copy value'}
                                    >
                                      {copiedUrl === page.url ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[12px] text-gray-600 leading-relaxed">{page.recommended}</span>
                                )
                              ) : assistedFix ? (
                                <div onClick={e => e.stopPropagation()}>
                                  <textarea
                                    value={assistedVal}
                                    onChange={e => {
                                      const val = e.target.value
                                      setEditValues(prev => ({ ...prev, [page.url]: val }))
                                      if (!val.trim()) {
                                        setSelectedPageUrls(prev => { const n = new Set(prev); n.delete(page.url); return n })
                                      }
                                    }}
                                    rows={2}
                                    placeholder="Enter value to apply..."
                                    className={`w-full text-[12px] font-mono text-gray-800 border rounded-lg px-2.5 py-1.5 resize-none outline-none transition-all placeholder:text-gray-400 ${
                                      valError ? 'border-error-600 bg-error-50/40 focus:border-error-600' : 'border-gray-200 focus:border-primary-600'
                                    }`}
                                  />
                                  {valError && (
                                    <p className="flex items-center gap-1 mt-1 text-[12px] text-error-600">
                                      <CircleX size={11} className="shrink-0" />{valError}
                                    </p>
                                  )}
                                </div>
                              ) : isEditing || isReEdit ? (
                                <div className="flex flex-col gap-1.5" onClick={e => e.stopPropagation()}>
                                  <textarea
                                    value={autoEditVal}
                                    onChange={e => setEditValues(prev => ({ ...prev, [page.url]: e.target.value }))}
                                    rows={2}
                                    className="w-full text-[12px] font-mono text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 resize-none outline-none transition-all"
                                    onFocus={e => { e.target.style.borderColor = 'var(--primary-600)' }}
                                    onBlur={e => { e.target.style.borderColor = '' }}
                                  />
                                  <div className="flex items-center gap-2.5">
                                    <button
                                      onClick={e => { e.stopPropagation(); isReEdit ? saveReEdit() : saveEdit() }}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-success-700 hover:bg-success-800 text-white text-[12px] font-semibold transition-colors"
                                    >
                                      <Check size={9} /> {isReEdit ? 'Re-apply' : 'Save'}
                                    </button>
                                    <button
                                      onClick={e => {
                                        e.stopPropagation()
                                        isReEdit ? setReEditSet(prev => { const n = new Set(prev); n.delete(page.url); return n }) : setEditingUrl(null)
                                      }}
                                      className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
                                    >Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                  <span className="text-[12px] font-mono text-success-700">{autoEditVal}</span>
                                  <button
                                    onClick={e => { e.stopPropagation(); isFixed ? openReEdit() : openEdit() }}
                                    className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                                    title="Edit fix"
                                  >
                                    <Pencil size={11} />
                                  </button>
                                </div>
                              )}
                            </td>

                            {/* Fix button / Fixed badge — auto + assisted fix (row-level) */}
                            {(autoFixable || assistedFix) && (
                              <td className="px-3 py-2.5 text-right" style={{ verticalAlign: 'top' }}>
                                {isFixed && !isReEdit ? (
                                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-success-600">
                                    <CircleCheck size={11} /> Fixed
                                  </span>
                                ) : assistedFix ? (
                                  <div className="relative group/fixrow inline-block">
                                    <button
                                      onClick={e => { e.stopPropagation(); if (canCheck) onFixPage && onFixPage(finding.id, page.url) }}
                                      disabled={!canCheck}
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[12px] font-medium transition-colors ${
                                        canCheck
                                          ? 'border-gray-200 bg-white text-gray-600 hover:border-primary-600 hover:text-primary-600'
                                          : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                                      }`}
                                    >
                                      Fix
                                    </button>
                                    {!canCheck && (
                                      <div className="absolute right-0 top-full mt-1.5 z-50 hidden group-hover/fixrow:block pointer-events-none">
                                        <div className="bg-gray-900 text-white text-[12px] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-md">
                                          {assistedVal.trim() === '' ? 'Enter a value to apply the fix' : 'Fix the value error first'}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : !isEditing && !isReEdit ? (
                                  <button
                                    onClick={e => { e.stopPropagation(); onFixPage && onFixPage(finding.id, page.url) }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-[12px] font-medium text-gray-600 hover:border-primary-600 hover:text-primary-600 transition-colors"
                                  >
                                    Fix
                                  </button>
                                ) : null}
                              </td>
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {/* Pagination — only if >6 pages */}
                  {totalTablePages > 1 && (
                    <div className="flex items-center justify-between px-3 py-2.5 border-t border-gray-100 bg-gray-50/50">
                      <span className="text-[12px] text-gray-400">
                        {(tablePage - 1) * TABLE_PER_PAGE + 1}–{Math.min(tablePage * TABLE_PER_PAGE, filteredPages.length)} of {filteredPages.length}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={e => { e.stopPropagation(); setTablePage(p => Math.max(1, p - 1)) }}
                          disabled={tablePage === 1}
                          className="h-6 px-2 text-[12px] font-medium rounded border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setTablePage(p => Math.min(totalTablePages, p + 1)) }}
                          disabled={tablePage === totalTablePages}
                          className="h-6 px-2 text-[12px] font-medium rounded border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'why' && (
              <p className="text-[13px] text-gray-600 leading-relaxed">{finding.whyItMatters}</p>
            )}
            {activeTab === 'technical' && (
              <p className="text-[13px] text-gray-600 leading-relaxed font-mono bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">{finding.technicalDetails}</p>
            )}
          </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CategorySection({ category, isOpen, onToggleOpen, expandedFindings, onToggle, selectedIds, onSelect, activeSevs, activeFixTypes, expandedTabs, onExpandedTabChange, pageSearches, onPageSearchChange, showAllPages, onToggleShowAll, fixedPages, onFixPage, onFixAll, onFixCategory }) {
  const sevAll = activeSevs.length === 0 || activeSevs.length === 3
  const fixAll = !activeFixTypes || activeFixTypes.length === 0 || activeFixTypes.length === 4
  const findings = sevAll && fixAll
    ? category.findings
    : category.findings.filter(f =>
        (sevAll || activeSevs.includes(f.severity)) &&
        (fixAll || activeFixTypes.includes(f.fixType))
      )

  if (findings.length === 0) return null

  const autoCount         = findings.filter(f => f.fixType === 'auto').length
  const selectedInCat     = findings.filter(f => selectedIds.has(f.id) && f.fixType === 'auto').length
  const errors            = findings.filter(f => f.severity === 'error').length
  const warnings          = findings.filter(f => f.severity === 'warning').length
  const notices           = findings.filter(f => f.severity === 'notice').length
  const totalOpen         = findings.reduce((s, f) => s + f.current, 0)
  const totalFixed        = findings.reduce((s, f) => s + f.fixed, 0)
  const totalAll          = totalOpen + totalFixed
  const totalPagesAffected = findings.reduce((s, f) => s + (f.totalAffected || 0), 0)

  return (
    <div id={`cat-${category.id}`} className="border border-gray-200 rounded-lg bg-white">
      {/* ── Accordion header — single compact row ── */}
      <button
        onClick={onToggleOpen}
        className={`w-full flex items-center gap-3 bg-white px-4 py-3 hover:bg-gray-50 transition-colors text-left ${isOpen ? 'border-b border-gray-100 rounded-t-lg' : 'rounded-lg'}`}
      >
        <ChevronRight
          size={13}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
        />

        {/* Name */}
        <p className="text-[14px] font-semibold text-gray-900 shrink-0">{category.label}</p>

        {/* Counts */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[12px] text-gray-400">{totalAll} issue{totalAll !== 1 ? 's' : ''}</span>
          {totalFixed > 0 && (
            <span className="text-[12px] text-success-600 font-medium">· {totalFixed} resolved</span>
          )}
        </div>

        {/* Right: pages + apply button */}
        <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
          {totalPagesAffected > 0 && (
            <span className="text-[12px] text-gray-400 hidden sm:inline whitespace-nowrap">{totalPagesAffected.toLocaleString()} pages</span>
          )}
          {autoCount > 0 && !isOpen && (
            <div className="relative group/applycat">
              <button
                onClick={e => {
                  e.stopPropagation()
                  onFixCategory && onFixCategory(findings.filter(f => f.fixType === 'auto'), category.label)
                }}
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-purple-600 bg-white text-purple-600 hover:bg-purple-50 transition-all shrink-0"
              >
                <Zap size={13} />
              </button>
              <div className="absolute right-0 bottom-full mb-1.5 z-50 hidden group-hover/applycat:block pointer-events-none">
                <div className="bg-gray-900 text-white text-[12px] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-md">
                  Apply {autoCount} automatic fix{autoCount !== 1 ? 'es' : ''}
                </div>
              </div>
            </div>
          )}
        </div>
      </button>

      {/* ── Findings — only visible when accordion is open ── */}
      {isOpen && (
        <div className="flex flex-col divide-y divide-gray-100 rounded-b-lg overflow-hidden">
          {findings.map(f => (
            <FindingCard
              key={f.id}
              finding={f}
              isExpanded={expandedFindings.has(f.id)}
              onToggle={() => onToggle(f.id)}
              isSelected={selectedIds.has(f.id)}
              onSelect={() => onSelect(f.id)}
              expandedTab={expandedTabs[f.id]}
              onExpandedTabChange={tab => onExpandedTabChange(f.id, tab)}
              pageSearch={pageSearches[f.id]}
              onPageSearchChange={val => onPageSearchChange(f.id, val)}
              fixedPages={fixedPages}
              onFixPage={(findingId, pageUrl) => onFixPage && onFixPage(findingId, pageUrl, category.label)}
              onFixAll={(finding, count) => onFixAll && onFixAll(finding, count, category.label)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CategoryNavBar({ activeCategoryId, openCategoryId, activeSevs, onJump }) {
  const scrollRef = useRef(null)
  const chipRefs  = useRef({})
  const [showLeft,  setShowLeft]  = useState(false)
  const [showRight, setShowRight] = useState(false)

  const updateFades = () => {
    const el = scrollRef.current
    if (!el) return
    setShowLeft(el.scrollLeft > 4)
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  // Fades + resize observer
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateFades()
    el.addEventListener('scroll', updateFades, { passive: true })
    const ro = new ResizeObserver(updateFades)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', updateFades); ro.disconnect() }
  }, [])

  // Auto-scroll active chip into view whenever it changes
  useEffect(() => {
    const el = scrollRef.current
    const chip = chipRefs.current[activeCategoryId]
    if (!el || !chip) return
    const FADE = 36
    const chipLeft  = chip.offsetLeft
    const chipRight = chipLeft + chip.offsetWidth
    const scrollLeft = el.scrollLeft
    if (chipLeft < scrollLeft + FADE) {
      el.scrollTo({ left: Math.max(0, chipLeft - FADE), behavior: 'smooth' })
    } else if (chipRight > scrollLeft + el.clientWidth - FADE) {
      el.scrollTo({ left: chipRight - el.clientWidth + FADE, behavior: 'smooth' })
    }
  }, [activeCategoryId])

  // Wheel → horizontal scroll (vertical wheel gesture scrolls the chip row)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onWheel = e => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      if (e.deltaY === 0) return
      e.preventDefault()
      el.scrollBy({ left: e.deltaY * 0.8 })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div className="sticky top-0 z-20 -mx-5 bg-white border-t border-b border-gray-200">
      <div className="relative">
        {showLeft && (
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-9 z-10"
               style={{ background: 'linear-gradient(to right, #fff 55%, transparent)' }} />
        )}
        {showRight && (
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-9 z-10"
               style={{ background: 'linear-gradient(to left, #fff 55%, transparent)' }} />
        )}
        <div
          ref={scrollRef}
          className="flex items-center gap-1.5 px-5 py-2 overflow-x-auto"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {SCAN_DATA.map(cat => {
            const visibleCount = activeSevs.length === 3
              ? cat.findings.length
              : cat.findings.filter(f => activeSevs.includes(f.severity)).length
            if (visibleCount === 0) return null
            const isActive = activeCategoryId === cat.id
            const isOpen   = openCategoryId === cat.id
            return (
              <button
                key={cat.id}
                ref={el => { chipRefs.current[cat.id] = el }}
                onClick={() => onJump(cat.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-primary-300 font-semibold'
                    : isOpen
                      ? 'bg-gray-100 text-gray-700 border-gray-200'
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {CATEGORY_SHORTS[cat.id] || cat.label}
                <span className={`text-[12px] font-bold ${isActive ? 'text-primary-500' : 'text-gray-400'}`}>
                  {visibleCount}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function ScanResultsTab({ jumpTarget, onJumpConsumed }) {
  const [sevFilter,        setSevFilter]        = useState(new Set(['error', 'warning', 'notice']))
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [typeSearch,       setTypeSearch]       = useState('')
  const typeDropdownRef = useRef(null)
  const [fixFilter,        setFixFilter]        = useState(new Set(['auto', 'assisted', 'manual', 'advisory']))
  const [showFixDropdown,  setShowFixDropdown]  = useState(false)
  const fixDropdownRef = useRef(null)
  const [openCategoryId,   setOpenCategoryId]   = useState(SCAN_DATA[0].id)
  const [expandedFindings, setExpandedFindings] = useState(new Set())
  const [selectedIds,      setSelectedIds]      = useState(new Set())
  const [expandedTabs,     setExpandedTabs]     = useState({})
  const [pageSearches,     setPageSearches]     = useState({})
  const [showAllPages,     setShowAllPages]     = useState(new Set())
  const [activeCategoryId, setActiveCategoryId] = useState(SCAN_DATA[0].id)
  const [scrolled,         setScrolled]         = useState(false)
  const [miniNavHidden,    setMiniNavHidden]    = useState(false)
  const [fixedPages,       setFixedPages]       = useState(new Set())
  const [successAlert,     setSuccessAlert]     = useState(null)
  const [confirmDialog,    setConfirmDialog]    = useState(null) // { finding, count, categoryLabel }

  const tabRef      = useRef(null)
  const alertTimer  = useRef(null)

  // ── Jump to a specific category + finding from Top findings ──
  useEffect(() => {
    if (!jumpTarget) return
    const { catId, findingId } = jumpTarget
    setOpenCategoryId(catId)
    setActiveCategoryId(catId)
    setExpandedFindings(prev => { const n = new Set(prev); n.add(findingId); return n })
    // Scroll after a brief paint delay so the accordion has rendered
    setTimeout(() => {
      const el = document.getElementById(`finding-${findingId}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      onJumpConsumed?.()
    }, 120)
  }, [jumpTarget])

  // ── Detect scroll container and track depth ──
  useEffect(() => {
    let el = tabRef.current
    while (el && el !== document.body) {
      const s = getComputedStyle(el)
      if (s.overflowY === 'auto' || s.overflowY === 'scroll') break
      el = el.parentElement
    }
    const scrollEl = (el && el !== document.body) ? el : null
    if (!scrollEl) return

    const onScroll = () => {
      const past = scrollEl.scrollTop > 400
      setScrolled(past)
      if (scrollEl.scrollTop < 200) setMiniNavHidden(false)
    }
    scrollEl.addEventListener('scroll', onScroll, { passive: true })
    return () => scrollEl.removeEventListener('scroll', onScroll)
  }, [])

  // ── Scroll spy: highlight active category chip as user scrolls ──
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-cat-id')
          if (id) setActiveCategoryId(id)
        }
      })
    }, { threshold: 0.1, rootMargin: '-52px 0px -55% 0px' })

    SCAN_DATA.forEach(cat => {
      const el = document.getElementById(`cat-${cat.id}`)
      if (el) { el.setAttribute('data-cat-id', cat.id); observer.observe(el) }
    })
    return () => observer.disconnect()
  }, [])

  // ── Fix a page and show success alert ──
  function handleFixPage(findingId, pageUrl, categoryLabel) {
    const key = `${findingId}::${pageUrl}`
    setFixedPages(prev => { const n = new Set(prev); n.add(key); return n })
    if (alertTimer.current) clearTimeout(alertTimer.current)
    setSuccessAlert(`1 selected page in ${categoryLabel} fixed successfully.`)
    alertTimer.current = setTimeout(() => setSuccessAlert(null), 5000)
  }

  // ── Count open (not-yet-fixed) pages across a list of findings ──
  function countOpenPages(findings) {
    return findings.reduce((sum, f) =>
      sum + (f.pages || []).filter(p => !fixedPages.has(`${f.id}::${p.url}`)).length, 0)
  }

  // ── Open confirm dialog for a single finding's fix-all ──
  function handleFixAll(finding, count, categoryLabel) {
    setConfirmDialog({ findings: [finding], count, categoryLabel })
  }

  // ── Open confirm dialog for every auto fix in a category ──
  function handleFixCategory(findings, categoryLabel) {
    if (!findings.length) return
    setConfirmDialog({ findings, count: countOpenPages(findings), categoryLabel })
  }

  // ── Confirm fix-all: mark all open pages across every finding fixed + toast ──
  function handleConfirmFixAll() {
    const { findings, categoryLabel } = confirmDialog
    const keysToFix = []
    findings.forEach(finding => {
      (finding.pages || []).forEach(p => {
        const key = `${finding.id}::${p.url}`
        if (!fixedPages.has(key)) keysToFix.push(key)
      })
    })
    setFixedPages(prev => {
      const n = new Set(prev)
      keysToFix.forEach(k => n.add(k))
      return n
    })
    setConfirmDialog(null)
    if (alertTimer.current) clearTimeout(alertTimer.current)
    const count = keysToFix.length
    setSuccessAlert(`${count} page${count !== 1 ? 's' : ''} in ${categoryLabel} fixed successfully.`)
    alertTimer.current = setTimeout(() => setSuccessAlert(null), 5000)
  }

  // ── Jump to category: expand + scroll ──
  function handleCategoryJump(catId) {
    setOpenCategoryId(catId)
    setTimeout(() => {
      const el = document.getElementById(`cat-${catId}`)
      if (!el) return
      let scrollEl = tabRef.current
      while (scrollEl && scrollEl !== document.body) {
        const s = getComputedStyle(scrollEl)
        if (s.overflowY === 'auto' || s.overflowY === 'scroll') break
        scrollEl = scrollEl.parentElement
      }
      const STICKY_NAV_H = 52
      if (scrollEl && scrollEl !== document.body) {
        const elTop = el.getBoundingClientRect().top
        const cTop  = scrollEl.getBoundingClientRect().top
        scrollEl.scrollTo({ top: scrollEl.scrollTop + elTop - cTop - STICKY_NAV_H, behavior: 'smooth' })
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 30)
  }

  useEffect(() => {
    if (!showTypeDropdown) return
    function handleOutside(e) {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
        setShowTypeDropdown(false)
        setTypeSearch('')
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [showTypeDropdown])

  // ── Handlers ──
  function toggleFinding(id) {
    setExpandedFindings(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleSelect(id) {
    setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function setExpandedTab(fId, tab)  { setExpandedTabs(prev => ({ ...prev, [fId]: tab })) }
  function setPageSearch(fId, val)   { setPageSearches(prev => ({ ...prev, [fId]: val })) }
  function toggleShowAll(fId) {
    setShowAllPages(prev => { const n = new Set(prev); n.has(fId) ? n.delete(fId) : n.add(fId); return n })
  }

  const allFindings    = SCAN_DATA.flatMap(c => c.findings)
  const totalOpen      = allFindings.reduce((s, f) => s + f.current, 0)
  const totalResolved  = allFindings.reduce((s, f) => s + f.fixed, 0)
  const totalSuggested = allFindings.reduce((s, f) => s + f.newRec, 0)
  const errCount       = allFindings.filter(f => f.severity === 'error').length
  const warnCount      = allFindings.filter(f => f.severity === 'warning').length
  const noticeCount    = allFindings.filter(f => f.severity === 'notice').length

  const activeSevs = [...sevFilter]

  const SEV_OPTIONS = [
    { id: 'error',   label: 'Errors'   },
    { id: 'warning', label: 'Warnings' },
    { id: 'notice',  label: 'Notices'  },
  ]
  const SEV_ORDER  = ['error', 'warning', 'notice']
  const SEV_LABELS = { error: 'Errors', warning: 'Warnings', notice: 'Notices' }
  const sevSelected = SEV_ORDER.filter(s => sevFilter.has(s))
  const sevLabel    = sevFilter.size >= 3 ? 'All' : sevSelected.length === 1 ? SEV_LABELS[sevSelected[0]] : `${SEV_LABELS[sevSelected[0]]} +${sevSelected.length - 1}`

  const toggleSev = id => {
    setSevFilter(prev => {
      const n = new Set(prev)
      if (n.has(id)) {
        if (n.size === 1) return prev
        n.delete(id)
      } else {
        n.add(id)
      }
      return n
    })
  }

  const FIX_OPTIONS  = [
    { id: 'auto',     label: 'Auto fix'     },
    { id: 'assisted', label: 'Assisted fix' },
    { id: 'manual',   label: 'Manual fix'   },
    { id: 'advisory', label: 'Advisory'     },
  ]
  const FIX_LABELS   = { auto: 'Auto fix', assisted: 'Assisted fix', manual: 'Manual fix', advisory: 'Advisory' }
  const fixSelected  = FIX_OPTIONS.map(o => o.id).filter(id => fixFilter.has(id))
  const fixLabel     = fixFilter.size >= 4 ? 'All' : fixSelected.length === 1 ? FIX_LABELS[fixSelected[0]] : `${FIX_LABELS[fixSelected[0]]} +${fixSelected.length - 1}`

  const activeFixTypes = [...fixFilter]

  const toggleFix = id => {
    setFixFilter(prev => {
      const n = new Set(prev)
      if (n.has(id)) {
        if (n.size === 1) return prev
        n.delete(id)
      } else {
        n.add(id)
      }
      return n
    })
  }

  return (
    <div ref={tabRef} className="flex flex-col gap-4 min-w-0 pb-10">

      {/* ── Success toast — fixed overlay, auto-dismisses ── */}
      {successAlert && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-success-50 rounded-lg shadow-lg min-w-[340px] max-w-[560px]"
          style={{ border: '1px solid #16A34A' }}
        >
          <CircleCheck size={15} className="text-success-600 shrink-0" />
          <p className="text-[13px] font-medium text-success-700 flex-1">{successAlert}</p>
          <button
            onClick={() => { setSuccessAlert(null); clearTimeout(alertTimer.current) }}
            className="shrink-0 text-success-500 hover:text-success-700 transition-colors p-0.5"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── Summary bar ── */}
      <div className="border border-gray-200 rounded-lg bg-white px-4 py-3 flex items-center gap-5 flex-wrap min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[24px] font-bold text-gray-900 leading-none">{totalOpen}</span>
          <span className="text-[13px] font-medium text-gray-600">open issues</span>
        </div>
        <div className="w-px h-6 bg-gray-100 shrink-0" />
        <div className="flex items-center gap-2">
          <span className="text-[24px] font-bold text-success-600 leading-none">{totalResolved}</span>
          <span className="text-[13px] font-medium text-gray-600">resolved</span>
        </div>
        <div className="w-px h-6 bg-gray-100 shrink-0" />
        <div className="flex items-center gap-2">
          <span className="text-[24px] font-bold text-warning-600 leading-none">{totalSuggested}</span>
          <span className="text-[13px] font-medium text-gray-600">suggested fixes</span>
        </div>
        <div className="ml-auto flex items-center gap-3 flex-wrap min-w-0">
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-error-600">
            <CircleX size={12} /> {errCount} error{errCount !== 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-warning-600">
            <AlertTriangle size={12} /> {warnCount} warning{warnCount !== 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary-600">
            <Info size={12} /> {noticeCount} notice{noticeCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Filter chips ── */}
      <div className="flex items-center gap-2">
        <FilterChipDropdown
          label="Issue type"
          options={SEV_OPTIONS}
          selected={sevFilter}
          onToggle={toggleSev}
          onSelectAll={() => setSevFilter(new Set(SEV_OPTIONS.map(o => o.id)))}
          dropdownRef={typeDropdownRef}
          open={showTypeDropdown}
          onOpen={() => { setShowFixDropdown(false); setShowTypeDropdown(v => !v) }}
          onClose={() => setShowTypeDropdown(false)}
        />
        <FilterChipDropdown
          label="Fix type"
          options={FIX_OPTIONS}
          selected={fixFilter}
          onToggle={toggleFix}
          onSelectAll={() => setFixFilter(new Set(FIX_OPTIONS.map(o => o.id)))}
          dropdownRef={fixDropdownRef}
          open={showFixDropdown}
          onOpen={() => { setShowTypeDropdown(false); setShowFixDropdown(v => !v) }}
          onClose={() => setShowFixDropdown(false)}
        />
      </div>

      {/* ── Category sections (accordion) ── */}
      {SCAN_DATA.map(cat => (
        <CategorySection
          key={cat.id}
          category={cat}
          isOpen={openCategoryId === cat.id}
          onToggleOpen={() => setOpenCategoryId(prev => prev === cat.id ? null : cat.id)}
          expandedFindings={expandedFindings}
          onToggle={toggleFinding}
          selectedIds={selectedIds}
          onSelect={toggleSelect}
          activeSevs={activeSevs}
          activeFixTypes={activeFixTypes}
          expandedTabs={expandedTabs}
          onExpandedTabChange={setExpandedTab}
          pageSearches={pageSearches}
          onPageSearchChange={setPageSearch}
          showAllPages={showAllPages}
          onToggleShowAll={toggleShowAll}
          fixedPages={fixedPages}
          onFixPage={handleFixPage}
          onFixAll={handleFixAll}
          onFixCategory={handleFixCategory}
        />
      ))}

      {/* ── Confirm "Fix all" dialog ── */}
      {confirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40"
          onClick={() => setConfirmDialog(null)}
        >
          <div
            className="bg-white border border-gray-200 rounded-lg shadow-card w-[420px] p-6 flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col gap-1">
              <p className="text-[16px] font-semibold text-gray-900">Fix all issues?</p>
              <p className="text-[14px] font-normal text-gray-500">
                This will automatically fix{' '}
                <span className="font-semibold text-gray-700">{confirmDialog.count} issue{confirmDialog.count !== 1 ? 's' : ''}</span>{' '}
                in <span className="font-semibold text-gray-700">{confirmDialog.categoryLabel}</span>. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmFixAll}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[13px] font-semibold transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// ─── Stub tabs ───────────────────────────────────────────────────────────────

// ─── Shared tab data ─────────────────────────────────────────────────────────

const CRAWLED_PAGE_DATA = [
  {
    url: 'https://www.gohighlevel.com/', results: { cur: 2, isNew: 0, fix: 1 }, traffic: 104706, httpCode: 302, indexable: false, indexStatus: 'Non-200 Status Code', referring: 357, depth: 1, keywords: 34000,
    urlProtocol: 'HTTPS', robots: false, title: 'GoHighLevel | All-in-one CRM, Automation & AI Platform', titleLen: 56, descLen: 117,
    canonical: 'https://www.gohighlevel.com/', h1: 'Grow your agency with one operating system', h1Len: 41, singleH1: 'Single', dupH1: false,
    h2: 'Why agencies switch to GoHighLevel', h2Len: 37, singleH2: 'Multiple', ttfb: 410, robotsMeta: 'index,follow', xRobotsTag: '—',
    dupTitle: false, description: 'GoHighLevel helps agencies and modern teams unify CRM, messaging, automation, and AI-driven workflows.', dupDesc: false,
    hreflangTags: 0, hreflang: '—', h3: 6, h4: 1, h5: 0, h6: 0,
    textHtmlRatio: 3, htmlSize: '442KB', wordCount: 2068, pageSize: '1.8MB',
    refreshRedirect: '0.21s', nofollowDofollow: 'DF', inlinks: 345, inlinksDofollow: '340 (98.5%)', inlinksNofollow: '5 (1.5%)',
    redirectInlinks: 3, numRedirects: 1, redirectTarget: 'https://www.gohighlevel.com/home', internalOutlinks: 24, externalOutlinks: 9,
    lastModified: '2026-05-14 13:58', mixedContent: false, metaRefresh: false, contentHash: '4d0d3f9248d35d1a84aa20bb1ec7a921',
    cssSize: '7KB', jsSize: '126KB', imageSize: '551KB', images: 46, loadingTime: '0.96s', isAmp: false,
    errorsCol: 0, warningsCol: 1, noticesCol: 1, urlLength: 27, inSitemap: true,
    findings: [
      { id: 'f1', description: '3XX HTTP status code', detail: 'The homepage is still returning a temporary redirect instead of the canonical 200 response that search engines expect for the primary URL.', currentValue: '302 temporary redirect to https://www.gohighlevel.com/home', aiValue: 'Return 200 OK on the preferred homepage URL and keep the canonical target aligned.', severity: 'Warnings', status: 'Current', fixType: 'Auto Fix' },
      { id: 'f2', description: 'Meta refresh redirect', detail: 'A legacy meta refresh tag was removed from the homepage shell and the redirect behavior is now handled cleanly upstream.', currentValue: 'Meta refresh removed', aiValue: 'Legacy meta refresh removed from the homepage shell', severity: 'Notices', status: 'Fixed', fixType: 'Assisted Fix' },
    ],
  },
  {
    url: 'https://www.gohighlevel.com/pricing', results: { cur: 4, isNew: 2, fix: 1 }, traffic: 7747, httpCode: 200, indexable: true, indexStatus: 'Ok', referring: 6, depth: 1, keywords: 5782,
    urlProtocol: 'HTTPS', robots: false, title: 'HighLevel Pricing', titleLen: 17, descLen: 87,
    canonical: 'https://www.gohighlevel.com/pricing', h1: 'Learn more about our plans', h1Len: 27, singleH1: 'Single', dupH1: false,
    h2: '$97 / Month', h2Len: 11, singleH2: 'Multiple', ttfb: 390, robotsMeta: 'index,follow', xRobotsTag: '—',
    dupTitle: false, description: 'Flexible CRM and automation pricing for agencies scaling client acquisition, nurture, and retention.', dupDesc: false,
    hreflangTags: 0, hreflang: '—', h3: 10, h4: 0, h5: 0, h6: 0,
    textHtmlRatio: 1, htmlSize: '876KB', wordCount: 884, pageSize: '1.5MB',
    refreshRedirect: '—', nofollowDofollow: 'DF', inlinks: 7, inlinksDofollow: '4 (57.1%)', inlinksNofollow: '3 (42.9%)',
    redirectInlinks: 0, numRedirects: 0, redirectTarget: '—', internalOutlinks: 24, externalOutlinks: 9,
    lastModified: '2026-05-15 08:12', mixedContent: false, metaRefresh: false, contentHash: 'f7dda4600c6c2f9a8986164b075f6b9e',
    cssSize: '7KB', jsSize: '126.6KB', imageSize: '551.2KB', images: 46, loadingTime: '0.96s', isAmp: false,
    errorsCol: 1, warningsCol: 2, noticesCol: 1, urlLength: 36, inSitemap: true,
    findings: [
      { id: 'f3', description: 'Missing meta description', detail: 'The pricing page has no meta description tag, reducing click-through rates from search results.', currentValue: 'No meta description found', aiValue: 'Add a 150–160 character meta description highlighting pricing plans and value.', severity: 'Errors', status: 'Current', fixType: 'Auto Fix' },
      { id: 'f4', description: 'Title tag too long', detail: 'The page title exceeds the recommended 60-character limit and may be truncated in SERPs.', currentValue: '73 characters', aiValue: 'Shorten to under 60 characters', severity: 'Warnings', status: 'Current', fixType: 'Assisted Fix' },
      { id: 'f5', description: 'Multiple H1 tags', detail: 'Two H1 elements were detected on this page, which can confuse search engines about the primary topic.', currentValue: '2 H1 tags found', aiValue: 'Consolidate to a single H1 tag', severity: 'Warnings', status: 'Current', fixType: 'Assisted Fix' },
      { id: 'f6', description: 'Images missing alt text', detail: '3 images on the pricing page are missing descriptive alt attributes.', currentValue: '3 images without alt text', aiValue: 'Add descriptive alt text to all images', severity: 'Notices', status: 'Current', fixType: 'Manual Fix' },
    ],
  },
  {
    url: 'https://www.gohighlevel.com/home', results: { cur: 2, isNew: 0, fix: 1 }, traffic: 3960, httpCode: 301, indexable: false, indexStatus: 'Non-200 Status Code', referring: 2, depth: 2, keywords: 7144,
    urlProtocol: 'HTTPS', robots: false, title: 'GoHighLevel Home', titleLen: 16, descLen: 68,
    canonical: 'https://www.gohighlevel.com/', h1: 'GoHighLevel Home', h1Len: 16, singleH1: 'Single', dupH1: false,
    h2: 'Agency growth starts here', h2Len: 25, singleH2: 'Multiple', ttfb: 520, robotsMeta: 'index,follow', xRobotsTag: '—',
    dupTitle: false, description: 'Legacy home URL used in older marketing assets and internal navigation.', dupDesc: false,
    hreflangTags: 0, hreflang: '—', h3: 2, h4: 0, h5: 0, h6: 0,
    textHtmlRatio: 1, htmlSize: '0.1KB', wordCount: 0, pageSize: '0.1KB',
    refreshRedirect: '0.18s', nofollowDofollow: 'DF', inlinks: 2, inlinksDofollow: '2 (100%)', inlinksNofollow: '0 (0%)',
    redirectInlinks: 2, numRedirects: 1, redirectTarget: 'https://www.gohighlevel.com/', internalOutlinks: 0, externalOutlinks: 0,
    lastModified: '2026-05-10 09:12', mixedContent: false, metaRefresh: false, contentHash: '—',
    cssSize: '<0.1KB', jsSize: '<0.1KB', imageSize: '<0.1KB', images: 0, loadingTime: '0.21s', isAmp: false,
    errorsCol: 0, warningsCol: 1, noticesCol: 1, urlLength: 34, inSitemap: false,
    findings: [
      { id: 'f7', description: '3XX HTTP status code', detail: 'This URL returns a 301 permanent redirect, which causes crawl budget waste and link equity dilution.', currentValue: '301 permanent redirect', aiValue: 'Consolidate to the canonical homepage URL', severity: 'Warnings', status: 'Current', fixType: 'Auto Fix' },
      { id: 'f8', description: 'Canonical URL mismatch', detail: 'The canonical tag points to a different URL than the actual redirect destination.', currentValue: 'https://www.gohighlevel.com/', aiValue: 'Align canonical with redirect target', severity: 'Notices', status: 'Fixed', fixType: 'Assisted Fix' },
    ],
  },
  {
    url: 'https://www.gohighlevel.com/careers', results: { cur: 3, isNew: 1, fix: 1 }, traffic: 602, httpCode: 200, indexable: true, indexStatus: 'Ok', referring: 96, depth: 3, keywords: 266,
    urlProtocol: 'HTTPS', robots: false, title: 'Career at HighLevel: Explore Exciting Opportunities', titleLen: 52, descLen: 134,
    canonical: 'https://www.gohighlevel.com/careers', h1: 'We Are HighLevel', h1Len: 16, singleH1: 'Single', dupH1: false,
    h2: 'Dream Developers. SaaS Operators. Builders.', h2Len: 42, singleH2: 'Multiple', ttfb: 431, robotsMeta: 'index,follow', xRobotsTag: '—',
    dupTitle: false, description: 'Join HighLevel and help shape the operating system agencies use to scale, automate, and serve clients.', dupDesc: false,
    hreflangTags: 0, hreflang: '—', h3: 5, h4: 0, h5: 0, h6: 0,
    textHtmlRatio: 1, htmlSize: '637KB', wordCount: 1234, pageSize: '1.1MB',
    refreshRedirect: '—', nofollowDofollow: 'DF', inlinks: 96, inlinksDofollow: '96 (100%)', inlinksNofollow: '0 (0%)',
    redirectInlinks: 0, numRedirects: 0, redirectTarget: '—', internalOutlinks: 23, externalOutlinks: 10,
    lastModified: '2026-05-11 11:43', mixedContent: false, metaRefresh: false, contentHash: '36f4ee53641935480eacce239db0add5',
    cssSize: '8KB', jsSize: '182.2KB', imageSize: '46.1MB', images: 43, loadingTime: '0.54s', isAmp: false,
    errorsCol: 0, warningsCol: 1, noticesCol: 2, urlLength: 38, inSitemap: true,
    findings: [
      { id: 'f9',  description: 'Low word count', detail: 'The careers page has fewer than 300 words of visible content, which may limit topical authority.', currentValue: '187 words', aiValue: 'Expand to at least 500 words of relevant content', severity: 'Notices', status: 'Current', fixType: 'Advisory' },
      { id: 'f10', description: 'Missing structured data', detail: 'No JobPosting schema markup was found, which would improve visibility in job-specific SERP features.', currentValue: 'No schema markup', aiValue: 'Add JobPosting schema for each open role', severity: 'Warnings', status: 'Current', fixType: 'Assisted Fix' },
      { id: 'f11', description: 'Slow page load time', detail: 'The careers page TTFB exceeds 1.2 seconds, which exceeds Core Web Vitals thresholds.', currentValue: 'TTFB: 1.4s', aiValue: 'Target under 800ms TTFB', severity: 'Notices', status: 'Fixed', fixType: 'Auto Fix' },
    ],
  },
  {
    url: 'https://www.gohighlevel.com/crm', results: { cur: 1, isNew: 0, fix: 0 }, traffic: 545, httpCode: 200, indexable: true, indexStatus: 'Ok', referring: 63, depth: 1, keywords: 309,
    urlProtocol: 'HTTPS', robots: false, title: 'CRM for Agencies | Centralize & Scale with HighLevel', titleLen: 52, descLen: 94,
    canonical: 'https://www.gohighlevel.com/crm', h1: 'Best CRM Software & Tools for Agencies', h1Len: 37, singleH1: 'Single', dupH1: false,
    h2: 'Simplify Your CRM System', h2Len: 24, singleH2: 'Multiple', ttfb: 356, robotsMeta: 'index,follow', xRobotsTag: '—',
    dupTitle: false, description: 'HighLevel gives agencies one CRM to capture, nurture, convert, and retain leads across channels.', dupDesc: false,
    hreflangTags: 0, hreflang: '—', h3: 24, h4: 11, h5: 0, h6: 0,
    textHtmlRatio: 1, htmlSize: '719KB', wordCount: 1632, pageSize: '1.4MB',
    refreshRedirect: '—', nofollowDofollow: 'DF', inlinks: 81, inlinksDofollow: '76 (93.8%)', inlinksNofollow: '5 (6.2%)',
    redirectInlinks: 0, numRedirects: 0, redirectTarget: '—', internalOutlinks: 33, externalOutlinks: 15,
    lastModified: '2026-05-12 16:18', mixedContent: false, metaRefresh: false, contentHash: 'd1add6d53e7706e222989c0203983907',
    cssSize: '7KB', jsSize: '116.2KB', imageSize: '336.2KB', images: 25, loadingTime: '0.73s', isAmp: false,
    errorsCol: 0, warningsCol: 1, noticesCol: 0, urlLength: 32, inSitemap: true,
    findings: [
      { id: 'f12', description: 'Duplicate title with /features', detail: 'The page title matches another page in this crawl, causing keyword cannibalization risk.', currentValue: '"GoHighLevel CRM Software"', aiValue: 'Differentiate with a unique CRM-specific title', severity: 'Warnings', status: 'Current', fixType: 'Manual Fix' },
    ],
  },
  {
    url: 'https://www.gohighlevel.com/features', results: { cur: 6, isNew: 1, fix: 2 }, traffic: 289, httpCode: 200, indexable: true, indexStatus: 'Ok', referring: 18, depth: 2, keywords: 1204,
    urlProtocol: 'HTTPS', robots: false, title: 'HighLevel AI | Features in One Platform', titleLen: 39, descLen: 166,
    canonical: 'https://www.gohighlevel.com/features', h1: 'The AI Business Operating System', h1Len: 32, singleH1: 'Single', dupH1: false,
    h2: 'New to HighLevel?', h2Len: 17, singleH2: 'Multiple', ttfb: 288, robotsMeta: 'index,follow', xRobotsTag: '—',
    dupTitle: false, description: 'Discover how HighLevel AI powers agents, prompts, lead capture, and automation inside one platform.', dupDesc: false,
    hreflangTags: 0, hreflang: '—', h3: 19, h4: 14, h5: 0, h6: 0,
    textHtmlRatio: 3, htmlSize: '478KB', wordCount: 1963, pageSize: '1.2MB',
    refreshRedirect: '—', nofollowDofollow: 'DF', inlinks: 71, inlinksDofollow: '65 (91.5%)', inlinksNofollow: '6 (8.5%)',
    redirectInlinks: 0, numRedirects: 0, redirectTarget: '—', internalOutlinks: 24, externalOutlinks: 9,
    lastModified: '2026-05-13 15:05', mixedContent: false, metaRefresh: false, contentHash: '29d3de8c875025c655d0af99659fb58d',
    cssSize: '8.1KB', jsSize: '157.9KB', imageSize: '1.4MB', images: 20, loadingTime: '2.84s', isAmp: false,
    errorsCol: 1, warningsCol: 2, noticesCol: 3, urlLength: 37, inSitemap: true,
    findings: [
      { id: 'f13', description: 'Missing meta description', detail: 'The features page is missing a meta description, which affects CTR in organic search.', currentValue: 'No meta description', aiValue: 'Write a compelling 150-character description', severity: 'Errors', status: 'Current', fixType: 'Auto Fix' },
      { id: 'f14', description: 'Large image file size', detail: 'Hero images total over 2MB and are not optimized for web delivery.', currentValue: '2.3 MB total image weight', aiValue: 'Convert to WebP and compress under 200KB', severity: 'Warnings', status: 'Current', fixType: 'Auto Fix' },
      { id: 'f15', description: 'Render-blocking scripts', detail: '3 JavaScript resources are loaded synchronously in the document head, delaying first contentful paint.', currentValue: '3 blocking scripts in <head>', aiValue: 'Defer non-critical scripts', severity: 'Warnings', status: 'Current', fixType: 'Assisted Fix' },
      { id: 'f16', description: 'No hreflang tags', detail: 'The page serves international users without hreflang annotations, risking incorrect regional targeting.', currentValue: 'No hreflang found', aiValue: 'Add hreflang for en-US and other supported locales', severity: 'Notices', status: 'Current', fixType: 'Manual Fix' },
      { id: 'f17', description: 'Internal links use generic anchor text', detail: '5 internal links use "click here" or "learn more" as anchor text.', currentValue: '5 generic anchors', aiValue: 'Replace with descriptive keyword-rich anchors', severity: 'Notices', status: 'Fixed', fixType: 'Assisted Fix' },
      { id: 'f18', description: 'Missing Open Graph image', detail: 'No og:image tag found; social shares will use a default fallback image.', currentValue: 'No og:image', aiValue: 'Add a 1200×630 og:image for this page', severity: 'Notices', status: 'Current', fixType: 'Advisory' },
    ],
  },
]

function httpCodeStyle(code) {
  if (code === 200)              return { color: '#16A34A' }
  if (code >= 300 && code < 400) return { color: '#D97706' }
  if (code >= 400 && code < 500) return { color: '#DC2626' }
  return                                { color: 'var(--purple-600)' }
}

function httpCodeTag(code) {
  if (code === 200)              return 'bg-success-50 border-success-200 text-success-700'
  if (code >= 300 && code < 400) return 'bg-warning-100 border-warning-200 text-warning-600'
  if (code >= 400 && code < 500) return 'bg-error-50 border-error-200 text-error-600'
  return 'bg-purple-50 border-purple-200 text-purple-700'
}

function indexStatusTag(status) {
  if (status === 'Ok') return 'bg-success-50 border-success-200 text-success-700'
  return 'bg-warning-100 border-warning-200 text-warning-600'
}

const FOUND_LINKS_DATA = [
  { url: 'https://www.gohighlevel.com/',                    type: 'Internal', follow: 'Do follow', anchor: 'Home',        sources: 5, status: 302 },
  { url: 'https://www.gohighlevel.com/pricing',             type: 'Internal', follow: 'Do follow', anchor: 'Pricing',     sources: 8, status: 200 },
  { url: 'https://www.gohighlevel.com/blog',                type: 'Internal', follow: 'Do follow', anchor: 'Blog',        sources: 3, status: 200 },
  { url: 'https://www.gohighlevel.com/careers',             type: 'Internal', follow: 'Do follow', anchor: 'Careers',     sources: 6, status: 200 },
  { url: 'https://www.gohighlevel.com/crm',                 type: 'Internal', follow: 'Do follow', anchor: 'CRM',         sources: 4, status: 200 },
  { url: 'https://www.gohighlevel.com/features',            type: 'Internal', follow: 'Do follow', anchor: 'Features',    sources: 7, status: 200 },
  { url: 'https://twitter.com/GoHighLevel',                 type: 'External', follow: 'No follow', anchor: 'Twitter / X', sources: 2, status: 200 },
  { url: 'https://www.facebook.com/gohighlevel',            type: 'External', follow: 'No follow', anchor: 'Facebook',    sources: 2, status: 200 },
  { url: 'https://www.linkedin.com/company/gohighlevel',    type: 'External', follow: 'No follow', anchor: 'LinkedIn',    sources: 1, status: 200 },
  { url: 'https://www.youtube.com/c/GoHighLevel',           type: 'External', follow: 'No follow', anchor: 'YouTube',     sources: 1, status: 200 },
]

const RESOURCE_KPIS_TAB = [
  { label: 'Total resources',    value: '10',       color: 'var(--purple-600)', bg: 'var(--purple-50)' },
  { label: 'Images',             value: '4',        color: 'var(--primary-600)', bg: 'var(--primary-50)' },
  { label: 'CSS size',           value: '183.9 KB', color: '#60A5FA', bg: 'var(--primary-50)' },
  { label: 'JS size',            value: '1.4 MB',   color: 'var(--warning-400)', bg: 'var(--warning-100)' },
  { label: 'Total resource size',value: '3.6 MB',   color: '#0D9488', bg: '#F0FDFA' },
]

const RESOURCE_BREAKDOWN_TAB = [
  { label: 'Images',     size: '4.6 MB',    pct: 75, color: 'var(--purple-600)' },
  { label: 'JavaScript', size: '1.4 MB',    pct: 22, color: 'var(--warning-400)' },
  { label: 'CSS',        size: '183.9 KB',  pct: 3,  color: '#60A5FA' },
]

const RESOURCE_DATA = [
  { url: 'https://images.leadconnectorhq.com/image/f_webp,q_80/hero-banner.webp',                               sources: 3, type: 'IMG', status: 200, size: '385.0 KB', loadTime: '37ms',
    sourceDetails: [
      { fromUrl: 'https://ramada.9hf9h.com/65382b4',          followType: 'Do follow', altAttr: 'Fastest growing CRM',  title: 'Homepage hero image',   uniqueTitle: 'Hero image above the fold'       },
      { fromUrl: 'https://ramada.9hf9h.com/65382b4',          followType: 'No follow', altAttr: 'Fastest growing CRM',  title: 'Homepage hero image',   uniqueTitle: 'Homepage split-test hero image'   },
      { fromUrl: 'https://ramada.9hf9h.com/highlevel-vs-hubspot', followType: 'Do follow', altAttr: 'CRM comparison hero', title: 'Comparison hero image', uniqueTitle: 'Comparison landing hero'       },
    ]},
  { url: 'https://images.leadconnectorhq.com/image/f_webp,q_80/partner-logo.webp',                              sources: 2, type: 'IMG', status: 200, size: '385.0 KB', loadTime: '31ms',
    sourceDetails: [
      { fromUrl: 'https://ramada.9hf9h.com/',                  followType: 'Do follow', altAttr: 'Partner logo',         title: 'Partner logo image',    uniqueTitle: 'Homepage partner strip logo'     },
      { fromUrl: 'https://ramada.9hf9h.com/about',             followType: 'Do follow', altAttr: 'Partner logo',         title: 'Partner logo image',    uniqueTitle: 'About page partner logo'         },
    ]},
  { url: 'https://ramada.9hf9h.com/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js',             sources: 2, type: 'JS',  status: 200, size: '227.8 KB', loadTime: '9ms',
    sourceDetails: [
      { fromUrl: 'https://ramada.9hf9h.com/',                  followType: 'Do follow', altAttr: '—',                    title: 'Email decode script',   uniqueTitle: 'Homepage email decoder'          },
      { fromUrl: 'https://ramada.9hf9h.com/contact',           followType: 'Do follow', altAttr: '—',                    title: 'Email decode script',   uniqueTitle: 'Contact page email decoder'      },
    ]},
  { url: 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.css',                           sources: 1, type: 'CSS', status: 200, size: '0.4 KB',   loadTime: '36ms',
    sourceDetails: [
      { fromUrl: 'https://ramada.9hf9h.com/',                  followType: 'Do follow', altAttr: '—',                    title: 'Slick carousel CSS',    uniqueTitle: 'Homepage carousel stylesheet'    },
    ]},
  { url: 'https://images.leadconnectorhq.com/image/f_webp,q_80/blog-hero.webp',                                 sources: 1, type: 'IMG', status: 200, size: '218.3 KB', loadTime: '24ms',
    sourceDetails: [
      { fromUrl: 'https://ramada.9hf9h.com/blog',              followType: 'Do follow', altAttr: 'Blog hero image',      title: 'Blog hero banner',      uniqueTitle: 'Blog index hero image'           },
    ]},
  { url: 'https://ramada.9hf9h.com/wp-content/themes/ramada/style.min.css',                                     sources: 3, type: 'CSS', status: 200, size: '98.2 KB',  loadTime: '14ms',
    sourceDetails: [
      { fromUrl: 'https://ramada.9hf9h.com/',                  followType: 'Do follow', altAttr: '—',                    title: 'Theme stylesheet',      uniqueTitle: 'Homepage theme CSS'              },
      { fromUrl: 'https://ramada.9hf9h.com/blog',              followType: 'Do follow', altAttr: '—',                    title: 'Theme stylesheet',      uniqueTitle: 'Blog theme CSS'                  },
      { fromUrl: 'https://ramada.9hf9h.com/contact',           followType: 'Do follow', altAttr: '—',                    title: 'Theme stylesheet',      uniqueTitle: 'Contact theme CSS'               },
    ]},
  { url: 'https://ramada.9hf9h.com/wp-content/themes/ramada/main.min.js',                                       sources: 1, type: 'JS',  status: 200, size: '156.4 KB', loadTime: '18ms',
    sourceDetails: [
      { fromUrl: 'https://ramada.9hf9h.com/',                  followType: 'Do follow', altAttr: '—',                    title: 'Main theme script',     uniqueTitle: 'Homepage main JS'                },
    ]},
  { url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',                           sources: 1, type: 'CSS', status: 200, size: '85.3 KB',  loadTime: '42ms',
    sourceDetails: [
      { fromUrl: 'https://ramada.9hf9h.com/',                  followType: 'Do follow', altAttr: '—',                    title: 'Font Awesome CSS',      uniqueTitle: 'Homepage icon font stylesheet'   },
    ]},
  { url: 'https://images.leadconnectorhq.com/image/f_webp,q_80/team-photo.webp',                                sources: 2, type: 'IMG', status: 200, size: '312.0 KB', loadTime: '28ms',
    sourceDetails: [
      { fromUrl: 'https://ramada.9hf9h.com/about',             followType: 'Do follow', altAttr: 'Team photo',           title: 'Team photo',            uniqueTitle: 'About page team photo'           },
      { fromUrl: 'https://ramada.9hf9h.com/careers',           followType: 'Do follow', altAttr: 'Our team',             title: 'Team photo',            uniqueTitle: 'Careers page team photo'         },
    ]},
  { url: 'https://ramada.9hf9h.com/wp-content/plugins/contact-form-7/includes/js/index.js',                     sources: 1, type: 'JS',  status: 200, size: '12.6 KB',  loadTime: '7ms',
    sourceDetails: [
      { fromUrl: 'https://ramada.9hf9h.com/contact',           followType: 'Do follow', altAttr: '—',                    title: 'Contact form script',   uniqueTitle: 'Contact page form JS'            },
    ]},
]

// Available audit snapshots (most recent first). The two date pickers in the
// Crawl comparison tab select any two of these; every row carries a `series`
// aligned to this list so switching dates changes the compared values.
const AUDIT_DATES = [
  '2026-06-30 06:52:29',
  '2026-06-17 06:52:27',
  '2026-05-30 09:14:02',
  '2026-05-14 08:03:41',
]

// `series` values align to AUDIT_DATES (index 0 = newest). `lowerBetter` rows are
// issue counts, so a decrease across the two selected dates is a "Fixed" and an
// increase is a "New" (derived at render time — see CrawlComparisonTab.derive).
const COMPARISON_AUDIT = [
  { label: 'Health score',  icon: 'gauge',   series: ['73/100', '71/100', '68/100', '64/100'] },
  { label: 'Passed checks', icon: 'check',   series: [80, 78, 74, 70] },
  { label: 'Errors',        icon: 'error',   series: [7, 11, 14, 18], lowerBetter: true },
  { label: 'Warnings',      icon: 'warning', series: [4, 4, 6, 9],    lowerBetter: true },
  { label: 'Notices',       icon: 'notice',  series: [3, 1, 2, 5],    lowerBetter: true },
]

const COMPARISON_DOMAIN_METRICS = [
  { metric: 'Domain expiration', series: ['2027-02-02', '2027-02-02', '2027-02-02', '2027-02-02'] },
  { metric: 'Backlinks',         series: [0, 0, 0, 0] },
  { metric: 'Domain Trust',      series: [1, 0, 0, 0] },
]

const COMPARISON_ISSUE_SECTIONS = [
  {
    category: 'Security & SSL',
    issues: [
      { label: 'No HTTPS encryption', icon: 'error', series: [1, 3, 4, 6], lowerBetter: true },
    ],
  },
  {
    category: 'Redirects',
    issues: [
      { label: 'No WWW redirect', icon: 'warning', series: [1, 0, 0, 2], lowerBetter: true },
    ],
  },
  {
    category: 'Sitemap health',
    issues: [
      { label: 'XML sitemap not found in robots.txt file', icon: 'notice', series: [1, 1, 1, 1], lowerBetter: true },
    ],
  },
  {
    category: 'Meta tags & descriptions',
    issues: [
      { label: 'URLs with duplicate page titles', icon: 'error', series: [2, 5, 7, 9], lowerBetter: true },
      { label: 'Duplicate description', icon: 'notice', series: [2, 0, 0, 3], lowerBetter: true },
    ],
  },
  {
    category: 'Content & structure',
    issues: [
      { label: 'Duplicate content', icon: 'error', series: [2, 2, 3, 4], lowerBetter: true },
      { label: 'H1 tag missing',    icon: 'warning', series: [2, 2, 2, 5], lowerBetter: true },
    ],
  },
  {
    category: 'Speed & performance',
    issues: [
      { label: 'Largest Contentful Paint (LCP) in a lab environment', icon: 'warning', series: [1, 2, 3, 4], lowerBetter: true },
    ],
  },
  {
    category: 'Internal linking',
    issues: [
      { label: 'No inbound links', icon: 'error', series: [2, 1, 1, 3], lowerBetter: true },
    ],
  },
]

// ─── Report controls strip (shared) ─────────────────────────────────────────

function ReportControls({ rightSlot }) {
  return (
    <div className="flex items-center gap-3 flex-wrap min-w-0">
      <span className="text-[12px] font-semibold text-gray-400 shrink-0">Current report</span>
      <div className="relative">
        <select className="appearance-none h-8 text-[13px] font-semibold text-gray-800 border border-gray-200 rounded-lg pl-3 pr-7 bg-white outline-none cursor-pointer hover:border-gray-300 focus:border-purple-600 transition-colors">
          <option>2026-06-17 06:52:27</option>
        </select>
        <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
      {rightSlot && <div className="ml-auto">{rightSlot}</div>}
    </div>
  )
}

function FilterTabs({ filters, active, onChange }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {filters.map(f => {
        const isActive = active === f.id
        return (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-[13px] font-medium transition-colors ${
              isActive ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {f.label}
            {f.count != null && (
              <span className={`text-[12px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
              }`}>{f.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Crawled Pages Tab ───────────────────────────────────────────────────────

const ALL_COLS = [
  { id: 'results',          label: 'Results',                defaultOn: true  },
  { id: 'traffic',          label: 'Total traffic',          defaultOn: true  },
  { id: 'httpCode',         label: 'Page HTTP status code',  defaultOn: true  },
  { id: 'indexable',        label: 'Indexable',              defaultOn: true  },
  { id: 'indexStatus',      label: 'Indexability status',    defaultOn: true  },
  { id: 'referring',        label: 'Referring pages',        defaultOn: true  },
  { id: 'depth',            label: 'Depth',                  defaultOn: true  },
  { id: 'keywords',         label: 'Keywords',               defaultOn: true  },
  { id: 'urlProtocol',      label: 'URL protocol',           defaultOn: true  },
  { id: 'robots',           label: 'Blocked by robots.txt',  defaultOn: false },
  { id: 'title',            label: 'Title',                  defaultOn: false },
  { id: 'titleLen',         label: 'Title length',           defaultOn: false },
  { id: 'descLen',          label: 'Description length',     defaultOn: false },
  { id: 'canonical',        label: 'Canonical URL',          defaultOn: false },
  { id: 'h1',               label: 'H1',                     defaultOn: false },
  { id: 'h1Len',            label: 'H1 length',              defaultOn: false },
  { id: 'singleH1',         label: 'Single H1',              defaultOn: false },
  { id: 'dupH1',            label: 'Duplicate H1',           defaultOn: false },
  { id: 'h2',               label: 'H2',                     defaultOn: false },
  { id: 'h2Len',            label: 'H2 length',              defaultOn: false },
  { id: 'singleH2',         label: 'Single H2',              defaultOn: false },
  { id: 'errorsCol',        label: 'Errors',                 defaultOn: false },
  { id: 'warningsCol',      label: 'Warnings',               defaultOn: false },
  { id: 'noticesCol',       label: 'Notices',                defaultOn: false },
  { id: 'urlLength',        label: 'URL length',             defaultOn: false },
  { id: 'inSitemap',        label: 'Is in sitemap',          defaultOn: false },
  { id: 'ttfb',             label: 'TTFB',                   defaultOn: false },
  { id: 'robotsMeta',       label: 'Robots meta tag',        defaultOn: false },
  { id: 'xRobotsTag',       label: 'X-Robots-Tag',           defaultOn: false },
  { id: 'dupTitle',         label: 'Duplicate title',        defaultOn: false },
  { id: 'description',      label: 'Description',            defaultOn: false },
  { id: 'dupDesc',          label: 'Duplicate description',  defaultOn: false },
  { id: 'hreflangTags',     label: 'Hreflang tags',          defaultOn: false },
  { id: 'hreflang',         label: 'Hreflang',               defaultOn: false },
  { id: 'h3',               label: 'H3',                     defaultOn: false },
  { id: 'h4',               label: 'H4',                     defaultOn: false },
  { id: 'h5',               label: 'H5',                     defaultOn: false },
  { id: 'h6',               label: 'H6',                     defaultOn: false },
  { id: 'textHtmlRatio',    label: 'Text to HTML ratio',     defaultOn: false },
  { id: 'htmlSize',         label: 'HTML size',              defaultOn: false },
  { id: 'wordCount',        label: 'Word counts',            defaultOn: false },
  { id: 'pageSize',         label: 'Page size',              defaultOn: false },
  { id: 'refreshRedirect',  label: 'Refresh redirect time',  defaultOn: false },
  { id: 'nofollowDofollow', label: 'Follow type',             defaultOn: false },
  { id: 'inlinks',          label: 'Inlinks',                defaultOn: false },
  { id: 'inlinksDofollow',  label: 'Inlinks dofollow',       defaultOn: false },
  { id: 'inlinksNofollow',  label: 'Inlinks nofollow',       defaultOn: false },
  { id: 'redirectInlinks',  label: 'Redirect inlinks',       defaultOn: false },
  { id: 'numRedirects',     label: 'Number of redirects',    defaultOn: false },
  { id: 'redirectTarget',   label: 'Redirect target URL',    defaultOn: false },
  { id: 'internalOutlinks', label: 'Internal outlinks',      defaultOn: false },
  { id: 'externalOutlinks', label: 'External outlinks',      defaultOn: false },
  { id: 'lastModified',     label: 'Last modified',          defaultOn: false },
  { id: 'mixedContent',     label: 'Mixed content',          defaultOn: false },
  { id: 'metaRefresh',      label: 'Meta refresh redirects', defaultOn: false },
  { id: 'contentHash',      label: 'Content hash',           defaultOn: false },
  { id: 'cssSize',          label: 'CSS size',               defaultOn: false },
  { id: 'jsSize',           label: 'JS size',                defaultOn: false },
  { id: 'imageSize',        label: 'Image size',             defaultOn: false },
  { id: 'images',           label: 'Images',                 defaultOn: false },
  { id: 'loadingTime',      label: 'Loading time',           defaultOn: false },
  { id: 'isAmp',            label: 'Is AMP',                 defaultOn: false },
]

const DEFAULT_VISIBLE_COLS = Object.fromEntries(ALL_COLS.map(c => [c.id, c.defaultOn]))

// ─── Advanced filter definitions ─────────────────────────────────────────────

const FILTER_COLS = [
  { label: 'URL',                   value: 'url',              type: 'string'  },
  { label: 'HTTP status code',      value: 'httpCode',         type: 'number'  },
  { label: 'Indexable',             value: 'indexable',        type: 'boolean' },
  { label: 'Indexability status',   value: 'indexStatus',      type: 'string'  },
  { label: 'Depth',                 value: 'depth',            type: 'number'  },
  { label: 'Total traffic',         value: 'traffic',          type: 'number'  },
  { label: 'Referring pages',       value: 'referring',        type: 'number'  },
  { label: 'Keywords',              value: 'keywords',         type: 'number'  },
  { label: 'Results',               value: 'results',          type: 'number'  },
  { label: 'Title',                 value: 'title',            type: 'string'  },
  { label: 'Title length',          value: 'titleLength',      type: 'number'  },
  { label: 'Description length',    value: 'descriptionLength',type: 'number'  },
  { label: 'Canonical URL',         value: 'canonicalUrl',     type: 'string'  },
  { label: 'H1',                    value: 'h1',               type: 'string'  },
  { label: 'H1 length',             value: 'h1Length',         type: 'number'  },
  { label: 'Single H1',             value: 'singleH1',         type: 'boolean' },
  { label: 'Duplicate H1',          value: 'duplicateH1',      type: 'boolean' },
  { label: 'H2',                    value: 'h2',               type: 'string'  },
  { label: 'H2 length',             value: 'h2Length',         type: 'number'  },
  { label: 'Single H2',             value: 'singleH2',         type: 'boolean' },
  { label: 'Errors',                value: 'errors',           type: 'number'  },
  { label: 'Warnings',              value: 'warnings',         type: 'number'  },
  { label: 'Notices',               value: 'notices',          type: 'number'  },
  { label: 'URL length',            value: 'urlLength',        type: 'number'  },
  { label: 'Is in sitemap',         value: 'inSitemap',        type: 'boolean' },
  { label: 'TTFB',                  value: 'ttfb',             type: 'number'  },
  { label: 'Blocked by robots.txt', value: 'blockedByRobots',  type: 'boolean' },
  { label: 'Robots meta tag',       value: 'robotsMetaTag',    type: 'string'  },
  { label: 'X-Robots-Tag',          value: 'xRobotsTag',       type: 'string'  },
  { label: 'Duplicate title',       value: 'duplicateTitle',   type: 'boolean' },
  { label: 'Description',           value: 'description',      type: 'string'  },
  { label: 'Duplicate description', value: 'duplicateDesc',    type: 'boolean' },
  { label: 'Hreflang',              value: 'hreflang',         type: 'string'  },
  { label: 'H3',                    value: 'h3',               type: 'number'  },
  { label: 'H4',                    value: 'h4',               type: 'number'  },
  { label: 'H5',                    value: 'h5',               type: 'number'  },
  { label: 'H6',                    value: 'h6',               type: 'number'  },
  { label: 'Text to HTML ratio',    value: 'textHtmlRatio',    type: 'number'  },
  { label: 'HTML size',             value: 'htmlSize',         type: 'number'  },
  { label: 'Word counts',           value: 'wordCount',        type: 'number'  },
  { label: 'Page size',             value: 'pageSize',         type: 'number'  },
  { label: 'Loading time',          value: 'loadingTime',      type: 'number'  },
  { label: 'Inlinks',               value: 'inlinks',          type: 'number'  },
  { label: 'Inlinks dofollow',      value: 'inlinksDofollow',  type: 'number'  },
  { label: 'Inlinks nofollow',      value: 'inlinksNofollow',  type: 'number'  },
  { label: 'Internal outlinks',     value: 'internalOutlinks', type: 'number'  },
  { label: 'External outlinks',     value: 'externalOutlinks', type: 'number'  },
  { label: 'Number of redirects',   value: 'numRedirects',     type: 'number'  },
  { label: 'Redirect target URL',   value: 'redirectTarget',   type: 'string'  },
  { label: 'Last modified',         value: 'lastModified',     type: 'string'  },
  { label: 'Images',                value: 'images',           type: 'number'  },
  { label: 'Image size',            value: 'imageSize',        type: 'number'  },
  { label: 'CSS size',              value: 'cssSize',          type: 'number'  },
  { label: 'JS size',               value: 'jsSize',           type: 'number'  },
  { label: 'Mixed content',         value: 'mixedContent',     type: 'boolean' },
  { label: 'Is AMP',                value: 'isAmp',            type: 'boolean' },
]

function applyFilterRule(row, rule) {
  const col = FILTER_COLS.find(c => c.value === rule.field)
  if (!col) return true
  const rawVal = row[rule.field]
  if (rawVal === undefined || rawVal === null) {
    return ['isEmpty', 'false'].includes(rule.operator)
  }
  const v = String(rawVal).toLowerCase()
  const rv = (rule.value || '').toLowerCase()
  switch (rule.operator) {
    case 'contains':     return v.includes(rv)
    case 'notContains':  return !v.includes(rv)
    case 'equals':       return v === rv
    case 'notEquals':    return v !== rv
    case 'startsWith':   return v.startsWith(rv)
    case 'endsWith':     return v.endsWith(rv)
    case 'isEmpty':      return v === ''
    case 'notEmpty':     return v !== ''
    case 'eq':           return Number(rawVal) === Number(rule.value)
    case 'ne':           return Number(rawVal) !== Number(rule.value)
    case 'gt':           return Number(rawVal) >   Number(rule.value)
    case 'gte':          return Number(rawVal) >=  Number(rule.value)
    case 'lt':           return Number(rawVal) <   Number(rule.value)
    case 'lte':          return Number(rawVal) <=  Number(rule.value)
    case 'true':         return rawVal === true  || rawVal === 'true'  || rawVal === 1
    case 'false':        return rawVal === false || rawVal === 'false' || rawVal === 0
    default:             return true
  }
}

function FilterEmptyState({ onClear, onModify }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
        <Search size={22} className="text-gray-400" />
      </div>
      <div className="text-center max-w-xs">
        <p className="text-[15px] font-semibold text-gray-900 mb-1.5">No results for these filters</p>
        <p className="text-[13px] text-gray-400 leading-relaxed">Try adjusting your filter criteria or clear the filters to see all results.</p>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={onClear} className="text-[13px] text-gray-500 hover:text-gray-700 underline transition-colors">
          Clear filters
        </button>
        <button
          onClick={onModify}
          className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold transition-colors"
        >
          Modify filters
        </button>
      </div>
    </div>
  )
}

// ─── Shared multi-select filter chip ─────────────────────────────────────────

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
        className="inline-flex items-center h-8 gap-1 pl-3 pr-1.5 rounded-full border border-gray-300 bg-white text-[13px] font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all select-none"
      >
        {label}
        <span className="mx-0.5 inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-[12px] font-medium text-gray-600 max-w-[120px] truncate">
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
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" className="flex-1 text-[12px] text-gray-700 placeholder:text-gray-400 outline-none bg-transparent" autoFocus />
              </div>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <button
              onClick={onSelectAll}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
            >
              All
            </button>
            {options
              .filter(o => options.length <= 10 || o.label.toLowerCase().includes(search.toLowerCase()))
              .map(opt => {
                const checked = selected.has(opt.id)
                return (
                  <button key={opt.id} onClick={() => onToggle(opt.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors ${checked ? 'bg-primary-50' : 'hover:bg-gray-50'}`}
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

function CrawledPagesTab() {
  const [filter, setFilter]               = useState(new Set(['errors', 'warnings', 'notices']))
  const [selected, setSelected]           = useState([])
  const [pageSearch, setPageSearch]       = useState('')
  const [showColumns, setShowColumns]     = useState(false)
  const [colSearch, setColSearch]         = useState('')
  const [showFilterDrawer, setShowFilterDrawer] = useState(false)
  const [activeRules, setActiveRules]     = useState([])
  const [visibleCols, setVisibleCols]     = useState(DEFAULT_VISIBLE_COLS)
  const [expandedRow, setExpandedRow]     = useState(null)
  const [selectedFindings, setSelectedFindings] = useState({})
  const [fixedFindings, setFixedFindings] = useState(new Set())   // finding ids applied this session
  const [draftFindings, setDraftFindings] = useState(new Set())   // fixed → edited again (re-enabled)
  const [editingFinding, setEditingFinding] = useState(null)      // finding id being inline-edited
  const [findingValues, setFindingValues] = useState({})          // { findingId: editedValue }
  const [copiedFinding, setCopiedFinding] = useState(null)        // finding id showing "copied" feedback
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [connectPlatform, setConnectPlatform] = useState('wordpress') // demo: toggled in-modal
  const [page, setPage]                   = useState(1)
  const [perPage, setPerPage]             = useState(10)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const statusDropdownRef = useRef(null)
  const tableScrollRef = useRef(null)
  const [tableScrollWidth, setTableScrollWidth] = useState(0)
  useEffect(() => {
    const el = tableScrollRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setTableScrollWidth(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const STATUS_FILTER_OPTIONS = [
    { id: 'errors',   label: 'Errors'   },
    { id: 'warnings', label: 'Warnings' },
    { id: 'notices',  label: 'Notices'  },
  ]
  const toggleStatusFilter = id => setFilter(prev => {
    const n = new Set(prev)
    if (n.has(id)) { if (n.size === 1) return prev; n.delete(id) } else n.add(id)
    return n
  })

  // Only auto fixes can be applied in bulk. Manual / Advisory / Assisted are read-only here.
  const isAutoFix = f => f.fixType === 'Auto Fix'
  function findingStatus(f) {
    if (draftFindings.has(f.id)) return 'Draft'
    if (fixedFindings.has(f.id) || f.status === 'Fixed') return 'Fixed'
    if (f.status === 'New') return 'New'
    return 'Open'
  }
  // Auto fixes that haven't been applied yet (Draft counts as re-openable → selectable).
  const isFindingSelectable = f => isAutoFix(f) && findingStatus(f) !== 'Fixed'
  const autoOpenIds = page => page.findings.filter(isFindingSelectable).map(f => f.id)

  const totalSelectedFindings = Object.values(selectedFindings).flat().length
  const canApplyFixes = totalSelectedFindings > 0

  function toggleFinding(pageUrl, findingId) {
    setSelectedFindings(prev => {
      const cur = prev[pageUrl] || []
      const next = cur.includes(findingId) ? cur.filter(id => id !== findingId) : [...cur, findingId]
      return { ...prev, [pageUrl]: next }
    })
  }

  // Editing a fixed auto fix re-opens it as a Draft and re-enables its checkbox.
  function openFindingEdit(f) {
    setEditingFinding(f.id)
    setFindingValues(prev => ({ ...prev, [f.id]: prev[f.id] ?? f.aiValue }))
    if (findingStatus(f) === 'Fixed') {
      setDraftFindings(prev => { const n = new Set(prev); n.add(f.id); return n })
    }
  }
  function copyFindingValue(f) {
    const v = findingValues[f.id] ?? f.aiValue
    if (navigator.clipboard) navigator.clipboard.writeText(v)
    setCopiedFinding(f.id)
    setTimeout(() => setCopiedFinding(c => (c === f.id ? null : c)), 1500)
  }

  // Apply the selected auto fixes: mark them Fixed (checkbox disabled) and clear selection.
  function applySelectedFixes() {
    const ids = Object.values(selectedFindings).flat()
    setFixedFindings(prev => { const n = new Set(prev); ids.forEach(id => n.add(id)); return n })
    setDraftFindings(prev => { const n = new Set(prev); ids.forEach(id => n.delete(id)); return n })
    setSelected([])
    setSelectedFindings({})
    setShowConnectModal(false)
  }

  const baseData = activeRules.length
    ? CRAWLED_PAGE_DATA.filter(row => activeRules.every(rule => applyFilterRule(row, rule)))
    : CRAWLED_PAGE_DATA

  const severityFiltered = filter.size >= 3
    ? baseData
    : baseData.filter(row => row.findings.some(f => filter.has(f.severity.toLowerCase())))

  const searchQuery = pageSearch.trim().toLowerCase()
  const filteredData = searchQuery
    ? severityFiltered.filter(row => row.url.toLowerCase().includes(searchQuery))
    : severityFiltered

  const paginatedData = filteredData.slice((page - 1) * perPage, page * perPage)

  useEffect(() => { setPage(1) }, [filter, activeRules, pageSearch])

  const colPickerRef = useRef(null)

  useEffect(() => {
    if (!showColumns) return
    function handleClickOutside(e) {
      if (colPickerRef.current && !colPickerRef.current.contains(e.target)) {
        setShowColumns(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showColumns])

  useEffect(() => {
    if (!showStatusDropdown) return
    function handleOutside(e) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setShowStatusDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [showStatusDropdown])

  const MAX_VISIBLE_COLS  = 10
  const selectedColCount  = Object.values(visibleCols).filter(Boolean).length + 1 // +1 for frozen URL col
  const atColLimit        = selectedColCount >= MAX_VISIBLE_COLS

  const toggleCol = id => setVisibleCols(v => {
    if (!v[id] && atColLimit) return v // block adding when at limit
    return { ...v, [id]: !v[id] }
  })
  // Selecting a page row cascades the selection to its auto-fix findings.
  function toggleRow(url) {
    const page = CRAWLED_PAGE_DATA.find(p => p.url === url)
    const willSelect = !selected.includes(url)
    setSelected(s => (willSelect ? [...s, url] : s.filter(u => u !== url)))
    setSelectedFindings(prev => ({ ...prev, [url]: willSelect && page ? autoOpenIds(page) : [] }))
  }
  const allSel    = selected.length === CRAWLED_PAGE_DATA.length
  function toggleAll() {
    if (allSel) { setSelected([]); setSelectedFindings({}); return }
    setSelected(CRAWLED_PAGE_DATA.map(p => p.url))
    const map = {}
    CRAWLED_PAGE_DATA.forEach(p => { map[p.url] = autoOpenIds(p) })
    setSelectedFindings(map)
  }

  return (
    <div className="flex flex-col gap-4 min-w-0 pb-8">
      <ReportControls />

      {/* Filter + action bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Type filter chip */}
        <FilterChipDropdown
          label="Type"
          options={STATUS_FILTER_OPTIONS}
          selected={filter}
          onToggle={toggleStatusFilter}
          onSelectAll={() => setFilter(new Set(STATUS_FILTER_OPTIONS.map(o => o.id)))}
          dropdownRef={statusDropdownRef}
          open={showStatusDropdown}
          onOpen={() => setShowStatusDropdown(v => !v)}
          onClose={() => setShowStatusDropdown(false)}
        />

        {/* Advanced filter chip */}
        <button
          onClick={() => setShowFilterDrawer(true)}
          className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-full border text-[13px] font-medium transition-colors ${
            activeRules.length
              ? 'bg-primary-50 border-primary-300 text-primary-700'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          Advanced filter
          {activeRules.length > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary-600 text-white text-[12px] font-medium">
              {activeRules.length}
            </span>
          )}
        </button>

        {activeRules.length > 0 && (
          <button onClick={() => setActiveRules([])} className="text-[12px] text-gray-400 hover:text-gray-600 underline transition-colors">
            Clear
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* Search — right-aligned, filters stay on the left */}
          <div className="relative" style={{ width: 240 }}>
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              value={pageSearch}
              onChange={e => setPageSearch(e.target.value)}
              placeholder="Search page URL"
              className="w-full h-8 pl-9 pr-3 rounded-lg border border-gray-300 bg-white text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary-600 transition-colors"
            />
          </div>
          <div className="relative" ref={colPickerRef}>
            {/* Column count trigger */}
            <button
              onClick={() => { setShowColumns(c => !c); setColSearch('') }}
              className="h-8 inline-flex items-center gap-1.5 px-3 text-[13px] font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <LayoutDashboard size={13} />
              {selectedColCount}/{ALL_COLS.length} Columns
            </button>

            {showColumns && (
              <div className="absolute right-0 top-10 z-50 bg-white border border-gray-200 rounded-lg overflow-hidden w-72" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
                {/* Search */}
                <div className="p-2 border-b border-gray-100">
                  <div className="relative flex items-center">
                    <Search size={13} className="absolute left-2.5 text-gray-400 pointer-events-none" />
                    <input
                      value={colSearch}
                      onChange={e => setColSearch(e.target.value)}
                      placeholder="Please input"
                      className="w-full pl-7 pr-3 py-1.5 text-[13px] text-gray-700 placeholder:text-gray-400 border border-primary-600 rounded-lg outline-none bg-white"
                    />
                  </div>
                </div>

                {/* Warning when at limit — inset with padding to match other elements */}
                {atColLimit && (
                  <div className="px-2 pt-2">
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg" style={{ background: 'var(--warning-50)', border: '1px solid var(--warning-200)' }}>
                      <AlertTriangle size={11} style={{ color: 'var(--warning-600)', flexShrink: 0 }} />
                      <span className="text-[12px] font-medium" style={{ color: 'var(--warning-600)' }}>
                        Max {MAX_VISIBLE_COLS} columns selected. Deselect one to add another.
                      </span>
                    </div>
                  </div>
                )}

                {/* Count + select all */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                  <span className="text-[12px] text-gray-500">{selectedColCount} of {MAX_VISIBLE_COLS} columns selected</span>
                  {!atColLimit && (
                    <button
                      onClick={() => {
                        // Select URL + first (MAX_VISIBLE_COLS - 1) other columns
                        const firstN = ALL_COLS.slice(0, MAX_VISIBLE_COLS - 1).map(c => c.id)
                        setVisibleCols(Object.fromEntries(ALL_COLS.map(c => [c.id, firstN.includes(c.id)])))
                      }}
                      className="text-[12px] font-semibold text-primary-600 hover:underline"
                    >
                      Select first {MAX_VISIBLE_COLS}
                    </button>
                  )}
                </div>

                {/* Column list — 12 rows visible, scrolls for the rest */}
                <div className="overflow-y-auto" style={{ maxHeight: 12 * 34 }}>
                  {/* URL — always visible, frozen */}
                  <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors" style={{ height: 34 }}>
                    <span className="text-gray-200 select-none text-[14px] shrink-0">⠿</span>
                    <input type="checkbox" checked disabled style={{ accentColor: '#155EEF', width: 15, height: 15, flexShrink: 0 }} />
                    <span className="text-[13px] text-gray-700 flex-1">URL</span>
                  </div>

                  {/* All columns — flat list */}
                  {ALL_COLS
                    .filter(c => !colSearch || c.label.toLowerCase().includes(colSearch.toLowerCase()))
                    .map(col => {
                      const isChecked   = !!visibleCols[col.id]
                      const isDisabled  = !isChecked && atColLimit
                      return (
                        <div
                          key={col.id}
                          className={`flex items-center gap-2 px-3 py-2 transition-colors ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}`}
                          style={{ height: 34 }}
                          onClick={() => !isDisabled && toggleCol(col.id)}
                        >
                          <span className="text-gray-300 select-none text-[14px] shrink-0">⠿</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isDisabled}
                            onChange={() => !isDisabled && toggleCol(col.id)}
                            onClick={e => e.stopPropagation()}
                            style={{ accentColor: '#155EEF', width: 15, height: 15, flexShrink: 0, cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                          />
                          <span className="text-[13px] text-gray-700 flex-1">{col.label}</span>
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => canApplyFixes && setShowConnectModal(true)}
            className={`h-8 inline-flex items-center gap-1.5 px-3 text-[13px] font-semibold rounded-lg transition-colors ${
              canApplyFixes
                ? 'bg-primary-600 hover:bg-primary-700 text-white border border-primary-600 cursor-pointer'
                : 'border border-gray-200 bg-white text-gray-300 cursor-not-allowed'
            }`}
          >
            <Zap size={13} />
            Apply fixes{totalSelectedFindings > 0 ? ` (${totalSelectedFindings})` : ''}
          </button>
        </div>
      </div>

      <SectionCard className="overflow-hidden">
        <div ref={tableScrollRef} className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="py-3" style={{ width: TABLE_EXPAND_COL, minWidth: TABLE_EXPAND_COL, maxWidth: TABLE_EXPAND_COL }} />
              <th className="py-3" style={{ width: TABLE_CHECK_COL, minWidth: TABLE_CHECK_COL, maxWidth: TABLE_CHECK_COL }}>
                <div className="flex items-center justify-center">
                  <TableCheckbox checked={allSel} indeterminate={selected.length > 0 && !allSel} onChange={toggleAll} />
                </div>
              </th>
              <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap min-w-[300px]">Page URL</th>
              {visibleCols.results          && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Results</th>}
              {visibleCols.traffic          && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Total traffic</th>}
              {visibleCols.httpCode         && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">HTTP status</th>}
              {visibleCols.indexable        && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Indexable</th>}
              {visibleCols.indexStatus      && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap min-w-[160px]">Indexability status</th>}
              {visibleCols.referring        && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Referring pages</th>}
              {visibleCols.depth            && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Depth</th>}
              {visibleCols.keywords         && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Keywords</th>}
              {visibleCols.urlProtocol      && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">URL protocol</th>}
              {visibleCols.robots           && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Blocked by robots.txt</th>}
              {visibleCols.title            && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap min-w-[220px]">Title</th>}
              {visibleCols.titleLen         && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Title length</th>}
              {visibleCols.descLen          && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Description length</th>}
              {visibleCols.canonical        && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap min-w-[200px]">Canonical URL</th>}
              {visibleCols.h1               && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap min-w-[180px]">H1</th>}
              {visibleCols.h1Len            && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">H1 length</th>}
              {visibleCols.singleH1         && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Single H1</th>}
              {visibleCols.dupH1            && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Duplicate H1</th>}
              {visibleCols.h2               && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap min-w-[180px]">H2</th>}
              {visibleCols.h2Len            && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">H2 length</th>}
              {visibleCols.singleH2         && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Single H2</th>}
              {visibleCols.errorsCol        && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Errors</th>}
              {visibleCols.warningsCol      && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Warnings</th>}
              {visibleCols.noticesCol       && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Notices</th>}
              {visibleCols.urlLength        && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">URL length</th>}
              {visibleCols.inSitemap        && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Is in sitemap</th>}
              {visibleCols.ttfb             && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">TTFB</th>}
              {visibleCols.robotsMeta       && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Robots meta tag</th>}
              {visibleCols.xRobotsTag       && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">X-Robots-Tag</th>}
              {visibleCols.dupTitle         && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Duplicate title</th>}
              {visibleCols.description      && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap min-w-[220px]">Description</th>}
              {visibleCols.dupDesc          && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Duplicate description</th>}
              {visibleCols.hreflangTags     && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Hreflang tags</th>}
              {visibleCols.hreflang         && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Hreflang</th>}
              {visibleCols.h3               && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">H3</th>}
              {visibleCols.h4               && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">H4</th>}
              {visibleCols.h5               && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">H5</th>}
              {visibleCols.h6               && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">H6</th>}
              {visibleCols.textHtmlRatio    && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Text to HTML ratio</th>}
              {visibleCols.htmlSize         && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">HTML size</th>}
              {visibleCols.wordCount        && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Word count</th>}
              {visibleCols.pageSize         && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Page size</th>}
              {visibleCols.refreshRedirect  && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Refresh redirect time</th>}
              {visibleCols.nofollowDofollow && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Follow type</th>}
              {visibleCols.inlinks          && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Inlinks</th>}
              {visibleCols.inlinksDofollow  && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Inlinks dofollow</th>}
              {visibleCols.inlinksNofollow  && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Inlinks nofollow</th>}
              {visibleCols.redirectInlinks  && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Redirect inlinks</th>}
              {visibleCols.numRedirects     && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Number of redirects</th>}
              {visibleCols.redirectTarget   && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap min-w-[200px]">Redirect target URL</th>}
              {visibleCols.internalOutlinks && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Internal outlinks</th>}
              {visibleCols.externalOutlinks && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">External outlinks</th>}
              {visibleCols.lastModified     && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Last modified</th>}
              {visibleCols.mixedContent     && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Mixed content</th>}
              {visibleCols.metaRefresh      && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Meta refresh redirects</th>}
              {visibleCols.contentHash      && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Content hash</th>}
              {visibleCols.cssSize          && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">CSS size</th>}
              {visibleCols.jsSize           && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">JS size</th>}
              {visibleCols.imageSize        && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Image size</th>}
              {visibleCols.images           && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Images</th>}
              {visibleCols.loadingTime      && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Loading time</th>}
              {visibleCols.isAmp            && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Is AMP</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map(page => {
              const isSel = selected.includes(page.url)
              const isExpanded = expandedRow === page.url
              const pageSel = selectedFindings[page.url] || []
              const colSpanCount = 3 + Object.values(visibleCols).filter(Boolean).length

              function severityStyle(sev) {
                if (sev === 'Errors')   return { bg: '#FEF2F2', border: '#FECACA', color: '#DC2626', Icon: AlertTriangle }
                if (sev === 'Warnings') return { bg: 'var(--warning-100)', border: '#FDE68A', color: '#D97706', Icon: AlertTriangle }
                return                         { bg: 'var(--primary-50)', border: '#BFDBFE', color: 'var(--primary-600)', Icon: CircleCheck  }
              }

              return (
                <>
                  <tr key={page.url} className={`border-b border-gray-50 transition-colors hover:bg-gray-50/40 ${isSel ? 'bg-primary-50/30' : ''} ${isExpanded ? 'border-b-0' : ''}`}>
                    <td className="py-3" style={{ verticalAlign: 'top', width: TABLE_EXPAND_COL, minWidth: TABLE_EXPAND_COL, maxWidth: TABLE_EXPAND_COL }}>
                      <button
                        onClick={() => setExpandedRow(isExpanded ? null : page.url)}
                        className="flex items-center justify-center w-6 h-6 mx-auto rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 mt-0.5"
                      >
                        <ChevronDown size={14} className={`transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                    <td className="py-3" style={{ verticalAlign: 'top', width: TABLE_CHECK_COL, minWidth: TABLE_CHECK_COL, maxWidth: TABLE_CHECK_COL }}>
                      <div className="flex items-center justify-center pt-0.5">
                        <input type="checkbox" checked={isSel} onChange={() => toggleRow(page.url)} style={tableCheckboxStyle} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <a href="#" className="text-[13px] font-medium text-primary-600 hover:underline truncate block max-w-[360px]">{page.url}</a>
                    </td>
                    {visibleCols.results && (
                      <td className="px-4 py-3">
                        <div className="relative group inline-block">
                          <span className="text-[13px] font-semibold text-gray-900 tabular-nums cursor-default">{page.results.cur}</span>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-50 hidden group-hover:block pointer-events-none">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-900" style={{ top: -8 }} />
                            <div className="bg-gray-900 text-white text-[12px] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                              <div className="flex flex-col gap-0.5">
                                <span>Current: {page.results.cur}</span>
                                <span>New: {page.results.isNew}</span>
                                <span>Fixed: {page.results.fix}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleCols.traffic     && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.traffic.toLocaleString()}</td>}
                    {visibleCols.httpCode    && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[12px] font-medium tabular-nums ${httpCodeTag(page.httpCode)}`}>{page.httpCode}</span>
                      </td>
                    )}
                    {visibleCols.indexable   && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {page.indexable
                          ? <span className="inline-flex items-center gap-1 text-[12px] font-medium text-success-600"><CircleCheck size={11} />Indexable</span>
                          : <span className="text-[12px] text-gray-400">Not indexable</span>
                        }
                      </td>
                    )}
                    {visibleCols.indexStatus && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {page.indexStatus === 'Ok'
                          ? <span className="text-[12px] font-medium text-success-600">Ok</span>
                          : <span className="text-[12px] font-medium text-warning-600">{page.indexStatus}</span>
                        }
                      </td>
                    )}
                    {visibleCols.referring   && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums">{page.referring}</td>}
                    {visibleCols.depth       && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums">{page.depth}</td>}
                    {visibleCols.keywords    && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums">{page.keywords.toLocaleString()}</td>}
                    {visibleCols.urlProtocol      && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.urlProtocol}</td>}
                    {visibleCols.robots           && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {page.robots
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium bg-error-50 border-error-200 text-error-600">✓ Yes</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium bg-gray-100 border-gray-200 text-gray-500">— No</span>
                        }
                      </td>
                    )}
                    {visibleCols.title            && (
                      <td className="px-4 py-3 max-w-[220px]">
                        <div className="relative group">
                          <span className="text-[13px] text-gray-700 truncate block cursor-default">{page.title}</span>
                          <div className="absolute bottom-full left-0 mb-1.5 z-50 hidden group-hover:block pointer-events-none">
                            <div className="bg-gray-900 text-white text-[12px] rounded-lg px-2.5 py-1.5 whitespace-normal max-w-[280px] shadow-lg">{page.title}</div>
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleCols.titleLen         && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.titleLen}</td>}
                    {visibleCols.descLen          && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.descLen}</td>}
                    {visibleCols.canonical        && (
                      <td className="px-4 py-3 max-w-[200px]">
                        <a href="#" className="text-[13px] text-primary-600 hover:underline truncate block">{page.canonical}</a>
                      </td>
                    )}
                    {visibleCols.h1               && (
                      <td className="px-4 py-3 max-w-[180px]">
                        <div className="relative group">
                          <span className="text-[13px] text-gray-700 truncate block cursor-default">{page.h1}</span>
                          <div className="absolute bottom-full left-0 mb-1.5 z-50 hidden group-hover:block pointer-events-none">
                            <div className="bg-gray-900 text-white text-[12px] rounded-lg px-2.5 py-1.5 whitespace-normal max-w-[280px] shadow-lg">{page.h1}</div>
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleCols.h1Len            && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.h1Len}</td>}
                    {visibleCols.singleH1         && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {page.singleH1 === 'Single'
                          ? <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-[12px] font-medium bg-success-50 border-success-200 text-success-700">Single</span>
                          : <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-[12px] font-medium bg-gray-100 border-gray-200 text-gray-600">Multiple</span>
                        }
                      </td>
                    )}
                    {visibleCols.dupH1            && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {page.dupH1
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium bg-error-50 border-error-200 text-error-600">✓ Yes</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium bg-gray-100 border-gray-200 text-gray-500">— No</span>
                        }
                      </td>
                    )}
                    {visibleCols.h2               && (
                      <td className="px-4 py-3 max-w-[180px]">
                        <div className="relative group">
                          <span className="text-[13px] text-gray-700 truncate block cursor-default">{page.h2}</span>
                          <div className="absolute bottom-full left-0 mb-1.5 z-50 hidden group-hover:block pointer-events-none">
                            <div className="bg-gray-900 text-white text-[12px] rounded-lg px-2.5 py-1.5 whitespace-normal max-w-[280px] shadow-lg">{page.h2}</div>
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleCols.h2Len            && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.h2Len}</td>}
                    {visibleCols.singleH2         && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {page.singleH2 === 'Single'
                          ? <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-[12px] font-medium bg-success-50 border-success-200 text-success-700">Single</span>
                          : <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-[12px] font-medium bg-gray-100 border-gray-200 text-gray-600">Multiple</span>
                        }
                      </td>
                    )}
                    {visibleCols.errorsCol        && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.errorsCol}</td>}
                    {visibleCols.warningsCol      && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.warningsCol}</td>}
                    {visibleCols.noticesCol       && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.noticesCol}</td>}
                    {visibleCols.urlLength        && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.urlLength}</td>}
                    {visibleCols.inSitemap        && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {page.inSitemap
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium bg-success-50 border-success-200 text-success-700">✓ Yes</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium bg-gray-100 border-gray-200 text-gray-500">— No</span>
                        }
                      </td>
                    )}
                    {visibleCols.ttfb             && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.ttfb} ms</td>}
                    {visibleCols.robotsMeta       && <td className="px-4 py-3 text-[13px] text-gray-700 whitespace-nowrap">{page.robotsMeta}</td>}
                    {visibleCols.xRobotsTag       && <td className="px-4 py-3 text-[13px] text-gray-700 whitespace-nowrap">{page.xRobotsTag}</td>}
                    {visibleCols.dupTitle         && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {page.dupTitle
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium bg-error-50 border-error-200 text-error-600">✓ Yes</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium bg-gray-100 border-gray-200 text-gray-500">— No</span>
                        }
                      </td>
                    )}
                    {visibleCols.description      && (
                      <td className="px-4 py-3 max-w-[220px]">
                        <div className="relative group">
                          <span className="text-[13px] text-gray-700 truncate block cursor-default">{page.description}</span>
                          <div className="absolute bottom-full left-0 mb-1.5 z-50 hidden group-hover:block pointer-events-none">
                            <div className="bg-gray-900 text-white text-[12px] rounded-lg px-2.5 py-1.5 whitespace-normal max-w-[280px] shadow-lg">{page.description}</div>
                          </div>
                        </div>
                      </td>
                    )}
                    {visibleCols.dupDesc          && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {page.dupDesc
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium bg-error-50 border-error-200 text-error-600">✓ Yes</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium bg-gray-100 border-gray-200 text-gray-500">— No</span>
                        }
                      </td>
                    )}
                    {visibleCols.hreflangTags     && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.hreflangTags}</td>}
                    {visibleCols.hreflang         && <td className="px-4 py-3 text-[13px] text-gray-700 whitespace-nowrap">{page.hreflang}</td>}
                    {visibleCols.h3               && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.h3}</td>}
                    {visibleCols.h4               && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.h4}</td>}
                    {visibleCols.h5               && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.h5}</td>}
                    {visibleCols.h6               && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.h6}</td>}
                    {visibleCols.textHtmlRatio    && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.textHtmlRatio}%</td>}
                    {visibleCols.htmlSize         && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.htmlSize}</td>}
                    {visibleCols.wordCount        && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.wordCount.toLocaleString()}</td>}
                    {visibleCols.pageSize         && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.pageSize}</td>}
                    {visibleCols.refreshRedirect  && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.refreshRedirect}</td>}
                    {visibleCols.nofollowDofollow && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {page.nofollowDofollow === 'DF'
                          ? <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-[12px] font-medium bg-success-50 border-success-200 text-success-700">DF</span>
                          : <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-[12px] font-medium bg-gray-100 border-gray-200 text-gray-600">NF</span>
                        }
                      </td>
                    )}
                    {visibleCols.inlinks          && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.inlinks}</td>}
                    {visibleCols.inlinksDofollow  && <td className="px-4 py-3 text-[13px] text-gray-700 whitespace-nowrap">{page.inlinksDofollow}</td>}
                    {visibleCols.inlinksNofollow  && <td className="px-4 py-3 text-[13px] text-gray-700 whitespace-nowrap">{page.inlinksNofollow}</td>}
                    {visibleCols.redirectInlinks  && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.redirectInlinks}</td>}
                    {visibleCols.numRedirects     && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.numRedirects}</td>}
                    {visibleCols.redirectTarget   && (
                      <td className="px-4 py-3 max-w-[200px]">
                        {page.redirectTarget && page.redirectTarget !== '—'
                          ? <a href="#" className="text-[13px] text-primary-600 hover:underline truncate block">{page.redirectTarget}</a>
                          : <span className="text-[13px] text-gray-400">—</span>
                        }
                      </td>
                    )}
                    {visibleCols.internalOutlinks && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.internalOutlinks}</td>}
                    {visibleCols.externalOutlinks && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.externalOutlinks}</td>}
                    {visibleCols.lastModified     && <td className="px-4 py-3 text-[13px] text-gray-700 whitespace-nowrap">{page.lastModified}</td>}
                    {visibleCols.mixedContent     && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {page.mixedContent
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium bg-error-50 border-error-200 text-error-600">✓ Yes</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium bg-gray-100 border-gray-200 text-gray-500">— No</span>
                        }
                      </td>
                    )}
                    {visibleCols.metaRefresh      && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {page.metaRefresh
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium bg-error-50 border-error-200 text-error-600">✓ Yes</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium bg-gray-100 border-gray-200 text-gray-500">— No</span>
                        }
                      </td>
                    )}
                    {visibleCols.contentHash      && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {page.contentHash && page.contentHash !== '—' ? (
                          <div className="relative group inline-block">
                            <span className="font-mono text-[12px] text-gray-500 cursor-default">{page.contentHash.slice(0, 20)}&hellip;</span>
                            <div className="absolute bottom-full left-0 mb-1.5 z-50 hidden group-hover:block pointer-events-none">
                              <div className="bg-gray-900 text-white text-[12px] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg font-mono">{page.contentHash}</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[13px] text-gray-400">—</span>
                        )}
                      </td>
                    )}
                    {visibleCols.cssSize          && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.cssSize}</td>}
                    {visibleCols.jsSize           && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.jsSize}</td>}
                    {visibleCols.imageSize        && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.imageSize}</td>}
                    {visibleCols.images           && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.images}</td>}
                    {visibleCols.loadingTime      && <td className="px-4 py-3 text-[13px] text-gray-700 tabular-nums whitespace-nowrap">{page.loadingTime}</td>}
                    {visibleCols.isAmp            && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {page.isAmp
                          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium bg-success-50 border-success-200 text-success-700">✓ Yes</span>
                          : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium bg-gray-100 border-gray-200 text-gray-500">— No</span>
                        }
                      </td>
                    )}
                  </tr>

                  {isExpanded && (
                    <tr key={`${page.url}-exp`} className="border-b border-gray-100 bg-gray-50/40">
                      {/* Full-cell grey bg so horizontal overflow past the sticky panel isn't empty white */}
                      <td colSpan={colSpanCount} className="px-0 py-0" style={{ overflow: 'hidden' }}>
                        <div
                          style={{ position: 'sticky', left: 0, width: tableScrollWidth || '100%', maxWidth: '100%' }}
                        >
                          {/* Reference nested-table layout: left spacer = expand column, then a white rounded card */}
                          <div className="flex pb-3 pr-4">
                            <div className="shrink-0" style={{ width: TABLE_EXPAND_COL, minWidth: TABLE_EXPAND_COL }} />
                            <div className="flex-1 min-w-0 rounded-lg border border-gray-100 bg-white overflow-x-auto">
                              <table className="w-full table-fixed border-collapse text-left">
                                {/* Fixed column widths so inline-editing a recommendation doesn't shift column widths */}
                                <colgroup>
                                  <col style={{ width: TABLE_CHECK_COL }} />
                                  <col style={{ width: '11%' }} />
                                  <col style={{ width: '9%' }} />
                                  <col style={{ width: '17.5%' }} />
                                  <col style={{ width: '20%' }} />
                                  <col style={{ width: '16%' }} />
                                  <col style={{ width: '26.5%' }} />
                                </colgroup>
                                <thead>
                                  <tr className="border-b border-gray-100">
                                    <th className="py-2.5" style={{ width: TABLE_CHECK_COL }} />
                                    <th className="px-4 py-2.5 text-[12px] font-medium text-gray-900 whitespace-nowrap">Severity</th>
                                    <th className="px-4 py-2.5 text-[12px] font-medium text-gray-900 whitespace-nowrap">Status</th>
                                    <th className="px-4 py-2.5 text-[12px] font-medium text-gray-900">Description</th>
                                    <th className="px-4 py-2.5 text-[12px] font-medium text-gray-900">Details</th>
                                    <th className="px-4 py-2.5 text-[12px] font-medium text-gray-900">Current value</th>
                                    <th className="px-4 py-2.5 text-[12px] font-medium text-gray-900">Recommendation</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {page.findings.map(finding => {
                                    const sev = severityStyle(finding.severity)
                                    const status       = findingStatus(finding)
                                    const selectable   = isFindingSelectable(finding)
                                    const isFindingSel  = pageSel.includes(finding.id)
                                    const autoFix       = isAutoFix(finding)
                                    const isEditing     = editingFinding === finding.id
                                    const recValue      = findingValues[finding.id] ?? finding.aiValue
                                    return (
                                      <tr key={finding.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                                        <td className="py-2.5" style={{ verticalAlign: 'top', width: TABLE_CHECK_COL }}>
                                          <div className="flex items-center justify-center pt-0.5">
                                            <input
                                              type="checkbox"
                                              checked={selectable && isFindingSel}
                                              disabled={!selectable}
                                              onChange={() => selectable && toggleFinding(page.url, finding.id)}
                                              style={tableCheckboxStyle}
                                              className={selectable ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}
                                            />
                                          </div>
                                        </td>
                                        <td className="px-4 py-2.5" style={{ verticalAlign: 'top' }}>
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[12px] font-medium whitespace-nowrap" style={{ background: sev.bg, borderColor: sev.border, color: sev.color }}>
                                            <sev.Icon size={9} />
                                            {finding.severity}
                                          </span>
                                        </td>
                                        <td className="px-4 py-2.5 whitespace-nowrap" style={{ verticalAlign: 'top' }}>
                                          <span className={`text-[12px] font-medium ${
                                            status === 'Fixed' ? 'text-success-600' :
                                            status === 'New'   ? 'text-primary-600' :
                                            status === 'Draft' ? 'text-warning-600' :
                                                                 'text-gray-500'
                                          }`}>{status}</span>
                                        </td>
                                        <td className="px-4 py-2.5" style={{ verticalAlign: 'top', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                                          <p className="text-[12px] text-gray-600 leading-snug m-0">{finding.description}</p>
                                          <span className={`inline-flex items-center mt-1.5 px-2 py-px rounded-full border text-[12px] font-medium ${
                                            finding.fixType === 'Auto Fix'
                                              ? 'bg-success-50 border-success-200 text-success-700'
                                              : finding.fixType === 'Assisted Fix'
                                              ? 'bg-primary-50 border-primary-200 text-primary-700'
                                              : finding.fixType === 'Manual Fix'
                                              ? 'bg-warning-100 border-warning-200 text-warning-700'
                                              : 'bg-purple-50 border-purple-200 text-purple-700'
                                          }`}>{finding.fixType}</span>
                                        </td>
                                        <td className="px-4 py-2.5 text-[12px] text-gray-500 leading-snug" style={{ verticalAlign: 'top', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{finding.detail}</td>
                                        <td className="px-4 py-2.5 text-[12px] text-gray-600 leading-snug" style={{ verticalAlign: 'top', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{finding.currentValue}</td>
                                        <td className="px-4 py-2.5" style={{ verticalAlign: 'top', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                                          {!recValue ? (
                                            <span className="text-[13px] text-gray-300">—</span>
                                          ) : autoFix && isEditing ? (
                                            /* Auto fix — inline edit (fixed → edit re-opens as Draft) */
                                            <div className="flex flex-col gap-1.5">
                                              <textarea
                                                value={recValue}
                                                onChange={e => setFindingValues(prev => ({ ...prev, [finding.id]: e.target.value }))}
                                                rows={2}
                                                className="w-full text-[12px] font-mono text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 resize-none outline-none transition-all focus:border-primary-600"
                                              />
                                              <div className="flex items-center gap-2.5">
                                                <button
                                                  onClick={() => setEditingFinding(null)}
                                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[12px] font-semibold transition-colors"
                                                >
                                                  <Check size={9} /> Save
                                                </button>
                                                <button
                                                  onClick={() => setEditingFinding(null)}
                                                  className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
                                                >Cancel</button>
                                              </div>
                                            </div>
                                          ) : autoFix ? (
                                            /* Auto fix — value + edit */
                                            <div className="flex items-start gap-2">
                                              <p className="text-[12px] text-gray-600 leading-snug m-0 flex-1">{recValue}</p>
                                              <button
                                                onClick={() => openFindingEdit(finding)}
                                                className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-px"
                                                title="Edit recommendation"
                                              >
                                                <Pencil size={12} />
                                              </button>
                                            </div>
                                          ) : (
                                            /* Assisted / Manual / Advisory — value + copy */
                                            <div className="flex items-start gap-2">
                                              <p className="text-[12px] text-gray-600 leading-snug m-0 flex-1">{recValue}</p>
                                              <button
                                                onClick={() => copyFindingValue(finding)}
                                                className={`transition-colors shrink-0 mt-px ${copiedFinding === finding.id ? 'text-success-600' : 'text-gray-400 hover:text-gray-600'}`}
                                                title={copiedFinding === finding.id ? 'Copied' : 'Copy value'}
                                              >
                                                {copiedFinding === finding.id ? <Check size={12} /> : <Copy size={12} />}
                                              </button>
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={99}>
                  <FilterEmptyState
                    onClear={() => setActiveRules([])}
                    onModify={() => setShowFilterDrawer(true)}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
        <HLPagination
          page={page}
          perPage={perPage}
          total={filteredData.length}
          onPage={setPage}
          onPerPage={p => { setPerPage(p); setPage(1) }}
        />
      </SectionCard>

      <AdvancedFilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        columnOptions={FILTER_COLS}
        onApply={setActiveRules}
      />

      {/* Connect modal (WordPress + Cloudflare variants; demo toggle inside) */}
      {showConnectModal && (
        <ConnectFixesModal
          platform={connectPlatform}
          onPlatformChange={setConnectPlatform}
          onClose={() => setShowConnectModal(false)}
          onApply={applySelectedFixes}
        />
      )}
    </div>
  )
}

// ─── Found Links Tab ─────────────────────────────────────────────────────────

const FOUND_LINKS_COLS = [
  { id: 'destinationUrl', label: 'Destination URL', defaultOn: true  },
  { id: 'statusCode',     label: 'Status code',     defaultOn: true  },
  { id: 'linkType',       label: 'Link type',       defaultOn: true  },
  { id: 'sourceUrl',      label: 'Source URL',      defaultOn: true  },
  { id: 'anchorText',     label: 'Anchor text',     defaultOn: true  },
  { id: 'anchorType',     label: 'Anchor type',     defaultOn: true  },
  { id: 'context',        label: 'Context',         defaultOn: true  },
  { id: 'title',          label: 'Title',           defaultOn: false },
  { id: 'alt',            label: 'Alt',             defaultOn: false },
  { id: 'nofollow',       label: 'Follow type',       defaultOn: false },
  { id: 'sourceNoindex',  label: 'Source noindex',  defaultOn: false },
  { id: 'linkScope',      label: 'Link scope',      defaultOn: false },
]

function FoundLinksTab() {
  const [filter, setFilter]                     = useState(new Set(['Internal', 'External']))
  const [showLinkDropdown, setShowLinkDropdown] = useState(false)

  const LINK_FILTER_OPTIONS = [
    { id: 'Internal', label: 'Internal' },
    { id: 'External', label: 'External' },
  ]
  const toggleLinkFilter = id => setFilter(prev => {
    const n = new Set(prev)
    if (n.has(id)) { if (n.size === 1) return prev; n.delete(id) } else n.add(id)
    return n
  })
  const [showColumns, setShowColumns]           = useState(false)
  const [colSearch, setColSearch]               = useState('')
  const [linkCols, setLinkCols]                 = useState(
    Object.fromEntries(FOUND_LINKS_COLS.map(c => [c.id, c.defaultOn]))
  )

  const internalCount = FOUND_LINKS_DATA.filter(l => l.type === 'Internal').length
  const externalCount = FOUND_LINKS_DATA.filter(l => l.type === 'External').length

  const filtered = filter.size >= 2
    ? FOUND_LINKS_DATA
    : FOUND_LINKS_DATA.filter(l => filter.has(l.type))

  const linkTypeChipRef = useRef(null)
  const linkColPickerRef = useRef(null)

  useEffect(() => {
    if (!showLinkDropdown) return
    function handleOutside(e) {
      if (linkTypeChipRef.current && !linkTypeChipRef.current.contains(e.target)) {
        setShowLinkDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [showLinkDropdown])

  useEffect(() => {
    if (!showColumns) return
    function handleClickOutside(e) {
      if (linkColPickerRef.current && !linkColPickerRef.current.contains(e.target)) {
        setShowColumns(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showColumns])

  const toggleLinkCol = id => setLinkCols(v => ({ ...v, [id]: !v[id] }))

  return (
    <div className="flex flex-col gap-4 min-w-0 pb-8">
      <ReportControls />

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3">
        <CountCard label="Total links" value="2,847" Icon={Link2} iconColor="var(--purple-600)" />
        <CountCard label="Internal links" value="1,870" Icon={Link2} iconColor="var(--primary-600)" />
        <CountCard label="External links" value="977" Icon={ExternalLink} iconColor="#16A34A" />
        <CountCard label="Nofollow links" value="179" Icon={AlertTriangle} iconColor="#D97706" />
      </div>

      {/* Filter + info bar */}
      <div className="flex items-center gap-3 flex-wrap">

        {/* Link type filter chip */}
        <FilterChipDropdown
          label="Link type"
          options={LINK_FILTER_OPTIONS}
          selected={filter}
          onToggle={toggleLinkFilter}
          onSelectAll={() => setFilter(new Set(LINK_FILTER_OPTIONS.map(o => o.id)))}
          dropdownRef={linkTypeChipRef}
          open={showLinkDropdown}
          onOpen={() => setShowLinkDropdown(v => !v)}
          onClose={() => setShowLinkDropdown(false)}
        />

        <div className="ml-auto" />
        <div className="relative" ref={linkColPickerRef}>
          <button
            onClick={() => { setShowColumns(c => !c); setColSearch('') }}
            className="h-8 inline-flex items-center gap-1.5 px-3 text-[13px] font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <LayoutDashboard size={13} /> {Object.values(linkCols).filter(Boolean).length}/{Object.keys(linkCols).length} Columns
          </button>
          {showColumns && (
            <div className="absolute right-0 top-10 z-50 bg-white border border-gray-200 rounded-lg overflow-hidden w-64" style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}>
              <div className="p-2 border-b border-gray-100">
                <div className="relative flex items-center">
                  <Search size={13} className="absolute left-2.5 text-gray-400 pointer-events-none" />
                  <input value={colSearch} onChange={e => setColSearch(e.target.value)} placeholder="Search columns" className="w-full pl-7 pr-3 py-1.5 text-[13px] text-gray-700 placeholder:text-gray-400 border border-primary-600 rounded-lg outline-none bg-white" />
                </div>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 12 * 34 }}>
                {FOUND_LINKS_COLS.filter(c => !colSearch || c.label.toLowerCase().includes(colSearch.toLowerCase())).map(col => (
                  <div key={col.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors" style={{ height: 34 }} onClick={() => toggleLinkCol(col.id)}>
                    <input type="checkbox" checked={!!linkCols[col.id]} onChange={() => toggleLinkCol(col.id)} onClick={e => e.stopPropagation()} style={{ accentColor: '#155EEF', width: 14, height: 14, flexShrink: 0 }} />
                    <span className="text-[13px] text-gray-700 flex-1">{col.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <SectionCard className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {linkCols.destinationUrl && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 min-w-[300px] whitespace-nowrap">Destination URL</th>}
              {linkCols.statusCode     && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Status code</th>}
              {linkCols.linkType       && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Link type</th>}
              {linkCols.sourceUrl      && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 min-w-[240px] whitespace-nowrap">Source URL</th>}
              {linkCols.anchorText     && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Anchor text</th>}
              {linkCols.anchorType     && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Anchor type</th>}
              {linkCols.context        && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Context</th>}
              {linkCols.title          && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Title</th>}
              {linkCols.alt            && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Alt</th>}
              {linkCols.nofollow       && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Follow type</th>}
              {linkCols.sourceNoindex  && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Source noindex</th>}
              {linkCols.linkScope      && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Link scope</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(link => (
              <tr key={link.url} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                {linkCols.destinationUrl && (
                  <td className="px-4 py-3">
                    <a href="#" className="text-[13px] font-medium text-primary-600 hover:underline truncate block max-w-[340px]">{link.url}</a>
                  </td>
                )}
                {linkCols.statusCode && (
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-semibold" style={{ color: httpCodeStyle(link.status).color }}>{link.status}</span>
                  </td>
                )}
                {linkCols.linkType && (
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[12px] font-medium ${link.type === 'Internal' ? 'bg-primary-50 text-primary-700 border-blue-200' : 'bg-success-50 text-success-700 border-success-200'}`}>{link.type}</span>
                  </td>
                )}
                {linkCols.sourceUrl && (
                  <td className="px-4 py-3">
                    <a href="#" className="text-[13px] text-primary-600 hover:underline truncate block max-w-[280px]">{link.url.replace(/\/[^/]*$/, '/')}</a>
                  </td>
                )}
                {linkCols.anchorText     && <td className="px-4 py-3 text-[13px] text-gray-700">{link.anchor}</td>}
                {linkCols.anchorType     && <td className="px-4 py-3 text-[13px] text-gray-500">Text</td>}
                {linkCols.context        && <td className="px-4 py-3 text-[13px] text-gray-500 max-w-[200px] truncate">Navigation link</td>}
                {linkCols.title          && <td className="px-4 py-3 text-[13px] text-gray-400">—</td>}
                {linkCols.alt            && <td className="px-4 py-3 text-[13px] text-gray-400">—</td>}
                {linkCols.nofollow       && <td className="px-4 py-3"><span className={`text-[12px] font-medium ${link.follow === 'Do follow' ? 'text-success-700' : 'text-warning-600'}`}>{link.follow}</span></td>}
                {linkCols.sourceNoindex  && <td className="px-4 py-3 text-[13px] text-gray-400">—</td>}
                {linkCols.linkScope      && <td className="px-4 py-3 text-[13px] text-gray-500">Global</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

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

  const start = Math.min((page - 1) * perPage + 1, total)
  const end   = Math.min(page * perPage, total)

  return (
    <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200 flex-wrap">
      {/* Rows per page */}
      <span className="text-[13px] text-gray-600 shrink-0">Rows per page</span>
      <div className="relative shrink-0">
        <select
          value={perPage}
          onChange={e => { onPerPage(Number(e.target.value)); onPage(1) }}
          className="appearance-none h-8 pl-3 pr-7 text-[13px] font-medium text-gray-700 border border-gray-200 rounded-lg bg-white outline-none cursor-pointer hover:border-gray-300 focus:border-primary-600 transition-colors"
        >
          {PER_PAGE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      <span className="text-[13px] text-gray-500 shrink-0 min-w-[90px]">{start} – {end} of {total}</span>

      {/* Previous */}
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="h-8 px-3 text-[13px] font-medium rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
      >
        Previous
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-[13px] text-gray-400">...</span>
          ) : (
            <button
              key={p}
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

      {/* Next */}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="h-8 px-3 text-[13px] font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
      >
        Next
      </button>
    </div>
  )
}

// ─── Found Resources Tab ─────────────────────────────────────────────────────

const CRAWLED_HOST = 'ramada.9hf9h.com'

function FoundResourcesTab() {
  const [filter, setFilter]             = useState('all')
  const [expandedRow, setExpandedRow]   = useState(null)
  const [page, setPage]                 = useState(1)
  const [perPage, setPerPage]           = useState(10)
  const [typeFilter, setTypeFilter]     = useState(new Set(['IMG', 'CSS', 'JS']))
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  const RES_FILTER_OPTIONS = [
    { id: 'IMG', label: 'Image'      },
    { id: 'CSS', label: 'CSS'        },
    { id: 'JS',  label: 'JavaScript' },
  ]
  const toggleResFilter = id => setTypeFilter(prev => {
    const n = new Set(prev)
    if (n.has(id)) { if (n.size === 1) return prev; n.delete(id) } else n.add(id)
    return n
  })
  const typeDropdownRef = useRef(null)
  const frColsRef = useRef(null)
  const [showFrCols, setShowFrCols] = useState(false)
  const [frCols, setFrCols] = useState({ url: true, sourceUrls: true, type: true, statusCode: true, size: true, loadTime: true })
  const [showAdvFilter, setShowAdvFilter] = useState(false)
  const [advFilters, setAdvFilters] = useState({ statusCode: 'all', minSize: '', maxSize: '' })
  const [appliedAdvFilters, setAppliedAdvFilters] = useState({ statusCode: 'all', minSize: '', maxSize: '' })
  const advFilterRef = useRef(null)

  useEffect(() => {
    if (!showTypeDropdown) return
    function handleOutside(e) {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target)) {
        setShowTypeDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [showTypeDropdown])

  useEffect(() => {
    if (!showAdvFilter) return
    function handleAdvFilterOutside(e) {
      if (advFilterRef.current && !advFilterRef.current.contains(e.target)) {
        setShowAdvFilter(false)
      }
    }
    document.addEventListener('mousedown', handleAdvFilterOutside)
    return () => document.removeEventListener('mousedown', handleAdvFilterOutside)
  }, [showAdvFilter])

  const FR_COL_DEFS = [
    { id: 'url',        label: 'URL' },
    { id: 'sourceUrls', label: 'Source URLs' },
    { id: 'type',       label: 'Type' },
    { id: 'statusCode', label: 'Status code' },
    { id: 'size',       label: 'Size' },
    { id: 'loadTime',   label: 'Loading time' },
  ]

  useEffect(() => {
    if (!showFrCols) return
    function handleFrColsOutside(e) {
      if (frColsRef.current && !frColsRef.current.contains(e.target)) {
        setShowFrCols(false)
      }
    }
    document.addEventListener('mousedown', handleFrColsOutside)
    return () => document.removeEventListener('mousedown', handleFrColsOutside)
  }, [showFrCols])

  const hasActiveAdvFilter = appliedAdvFilters.statusCode !== 'all' || appliedAdvFilters.minSize !== '' || appliedAdvFilters.maxSize !== ''

  const filtered = RESOURCE_DATA.filter(r => {
    // Type filter
    if (typeFilter.size < 3 && !typeFilter.has(r.type)) return false
    // Advanced status code filter
    if (appliedAdvFilters.statusCode !== 'all') {
      const code = r.status
      if (appliedAdvFilters.statusCode === '200' && code !== 200) return false
      if (appliedAdvFilters.statusCode === '3xx' && (code < 300 || code >= 400)) return false
      if (appliedAdvFilters.statusCode === '4xx' && (code < 400 || code >= 500)) return false
      if (appliedAdvFilters.statusCode === '5xx' && (code < 500 || code >= 600)) return false
    }
    // Advanced size filter — parse KB value from size string like "385.0 KB"
    if (appliedAdvFilters.minSize !== '' || appliedAdvFilters.maxSize !== '') {
      const sizeKb = parseFloat(r.size)
      if (!isNaN(sizeKb)) {
        if (appliedAdvFilters.minSize !== '' && sizeKb < parseFloat(appliedAdvFilters.minSize)) return false
        if (appliedAdvFilters.maxSize !== '' && sizeKb > parseFloat(appliedAdvFilters.maxSize)) return false
      }
    }
    return true
  })
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  useEffect(() => { setPage(1) }, [typeFilter])

  const TYPE_STYLE = {
    IMG: { bg: 'var(--primary-50)', color: 'var(--primary-600)' },
    JS:  { bg: 'var(--warning-100)', color: '#D97706' },
    CSS: { bg: 'var(--primary-50)', color: '#60A5FA' },
  }

  return (
    <div className="flex flex-col gap-4 min-w-0 pb-8">
      <ReportControls />

      {/* KPI cards */}
      <div className="grid grid-cols-5 gap-3">
        {RESOURCE_KPIS_TAB.map(k => (
          <CountCard key={k.label} label={k.label} value={k.value} Icon={FileText} iconColor={k.color} />
        ))}
      </div>

      {/* Size breakdown */}
      <SectionCard className="p-5">
        <p className="text-[14px] font-semibold text-gray-900 mb-4">Resource size breakdown</p>
        <div className="flex flex-col gap-4">
          {RESOURCE_BREAKDOWN_TAB.map(r => (
            <div key={r.label} className="flex items-center gap-4">
              <div className="w-24 text-[13px] text-gray-600 font-medium shrink-0">{r.label}</div>
              <div className="flex-1 bg-gray-200 rounded-full h-2 relative overflow-hidden">
                <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500" style={{ width: `${r.pct}%`, background: r.color }} />
              </div>
              <div className="text-[13px] font-semibold text-gray-700 w-20 text-right shrink-0">{r.size}</div>
              <div className="text-[12px] text-gray-400 w-10 text-right shrink-0">{r.pct}%</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Filters + table */}
      <div className="flex items-center gap-3 flex-wrap">

        {/* Type filter chip */}
        <FilterChipDropdown
          label="Type"
          options={RES_FILTER_OPTIONS}
          selected={typeFilter}
          onToggle={toggleResFilter}
          onSelectAll={() => setTypeFilter(new Set(RES_FILTER_OPTIONS.map(o => o.id)))}
          dropdownRef={typeDropdownRef}
          open={showTypeDropdown}
          onOpen={() => setShowTypeDropdown(v => !v)}
          onClose={() => setShowTypeDropdown(false)}
        />

        {/* Advanced filter button */}
        <div className="relative" ref={advFilterRef}>
          <button
            onClick={() => setShowAdvFilter(v => !v)}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            Advanced filter
            {hasActiveAdvFilter && <span className="w-2 h-2 rounded-full bg-primary-600" />}
          </button>
          {showAdvFilter && (
            <div className="absolute top-full left-0 mt-1.5 z-30 bg-white border border-gray-200 rounded-xl shadow-lg w-72 p-4">
              <p className="text-[12px] font-semibold text-gray-700 mb-3">Advanced filter</p>

              {/* Status code */}
              <div className="mb-4">
                <p className="text-[12px] font-medium text-gray-500 mb-2">Status code</p>
                <div className="flex flex-col gap-1.5">
                  {[{ label: 'All', value: 'all' }, { label: '200 OK', value: '200' }, { label: '3xx Redirect', value: '3xx' }, { label: '4xx Client error', value: '4xx' }, { label: '5xx Server error', value: '5xx' }].map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="frStatusCode"
                        value={opt.value}
                        checked={advFilters.statusCode === opt.value}
                        onChange={() => setAdvFilters(v => ({ ...v, statusCode: opt.value }))}
                        style={{ accentColor: '#155EEF' }}
                      />
                      <span className="text-[13px] text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="mb-4">
                <p className="text-[12px] font-medium text-gray-500 mb-2">Size (KB)</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={advFilters.minSize}
                    onChange={e => setAdvFilters(v => ({ ...v, minSize: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] text-gray-900 outline-none focus:border-primary-600 transition-colors"
                  />
                  <span className="text-[12px] text-gray-400 shrink-0">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={advFilters.maxSize}
                    onChange={e => setAdvFilters(v => ({ ...v, maxSize: e.target.value }))}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-[13px] text-gray-900 outline-none focus:border-primary-600 transition-colors"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => { const reset = { statusCode: 'all', minSize: '', maxSize: '' }; setAdvFilters(reset); setAppliedAdvFilters(reset) }}
                  className="px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => { setAppliedAdvFilters({ ...advFilters }); setShowAdvFilter(false) }}
                  className="px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative" ref={frColsRef}>
            <button
              onClick={() => setShowFrCols(v => !v)}
              className="h-8 inline-flex items-center gap-1.5 px-3 text-[13px] font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <LayoutDashboard size={13} />
              {Object.values(frCols).filter(Boolean).length}/{Object.keys(frCols).length} Columns
            </button>
            {showFrCols && (
              <div className="absolute right-0 top-10 z-30 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden w-52 py-1">
                {FR_COL_DEFS.map(col => (
                  <div
                    key={col.id}
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => col.id !== 'url' && setFrCols(v => ({ ...v, [col.id]: !v[col.id] }))}
                  >
                    <input
                      type="checkbox"
                      checked={!!frCols[col.id]}
                      onChange={() => col.id !== 'url' && setFrCols(v => ({ ...v, [col.id]: !v[col.id] }))}
                      onClick={e => e.stopPropagation()}
                      disabled={col.id === 'url'}
                      style={{ accentColor: '#155EEF', width: 14, height: 14, flexShrink: 0 }}
                    />
                    <span className="text-[13px] text-gray-700">{col.label}</span>
                    {col.id === 'url' && <span className="text-[12px] text-gray-400 ml-auto">Always on</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <SectionCard className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="py-3" style={{ width: TABLE_EXPAND_COL, minWidth: TABLE_EXPAND_COL, maxWidth: TABLE_EXPAND_COL }} />
              <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 min-w-[380px]">URL</th>
              {frCols.sourceUrls && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Source URLs</th>}
              {frCols.type       && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Type</th>}
              {frCols.statusCode && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Status code</th>}
              {frCols.size       && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Size</th>}
              {frCols.loadTime   && <th className="px-4 py-3 text-[12px] font-semibold text-gray-900 whitespace-nowrap">Loading time</th>}
            </tr>
          </thead>
          <tbody>
            {paginated.map((r, i) => {
              const ts = TYPE_STYLE[r.type] || { bg: '#F2F4F7', color: '#667085' }
              const isExpanded = expandedRow === r.url
              return (
                <div key={i} style={{ display: 'contents' }}>
                  <tr className={`border-b border-gray-50 transition-colors ${isExpanded ? 'bg-gray-50/60' : 'hover:bg-gray-50/40'}`}>
                    {/* Expand chevron — own column, before URL */}
                    <td className="py-3" style={{ width: TABLE_EXPAND_COL, minWidth: TABLE_EXPAND_COL, maxWidth: TABLE_EXPAND_COL }}>
                      <button
                        onClick={() => setExpandedRow(isExpanded ? null : r.url)}
                        className="flex items-center justify-center w-6 h-6 mx-auto rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                      >
                        <ChevronDown size={14} className={`transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <a href="#" className="text-[13px] font-medium text-primary-600 hover:underline truncate block max-w-[460px]">{r.url}</a>
                    </td>
                    {frCols.sourceUrls && <td className="px-4 py-3 text-[13px] font-medium text-gray-700">{r.sources}</td>}
                    {frCols.type && (
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded border text-[12px] font-semibold" style={{ background: ts.bg, color: ts.color, borderColor: ts.bg }}>
                          {r.type}
                        </span>
                      </td>
                    )}
                    {frCols.statusCode && (
                      <td className="px-4 py-3">
                        <span className="text-[13px] font-semibold" style={{ color: httpCodeStyle(r.status).color }}>{r.status}</span>
                      </td>
                    )}
                    {frCols.size && <td className="px-4 py-3 text-[13px] font-medium text-gray-700">{r.size}</td>}
                    {frCols.loadTime && <td className="px-4 py-3 text-[13px] text-gray-500">{r.loadTime}</td>}
                  </tr>
                  {isExpanded && r.sourceDetails && (
                    <tr className="border-b border-gray-100 bg-gray-50/40">
                      <td colSpan={1 + 1 + Object.values(frCols).filter(Boolean).length} className="px-0 py-0">
                        <div className="flex pb-3 pr-4">
                          <div className="shrink-0" style={{ width: TABLE_EXPAND_COL, minWidth: TABLE_EXPAND_COL }} />
                          <div className="flex-1 min-w-0 rounded-lg border border-gray-100 bg-white overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                              <thead>
                                <tr className="border-b border-gray-100">
                                  <th className="px-4 py-2.5 text-[12px] font-medium text-gray-900 min-w-[260px]">From URL</th>
                                  <th className="px-4 py-2.5 text-[12px] font-medium text-gray-900 whitespace-nowrap">Follow type</th>
                                  <th className="px-4 py-2.5 text-[12px] font-medium text-gray-900 whitespace-nowrap">Alt attribute</th>
                                  <th className="px-4 py-2.5 text-[12px] font-medium text-gray-900 whitespace-nowrap">Title</th>
                                  <th className="px-4 py-2.5 text-[12px] font-medium text-gray-900 whitespace-nowrap">Unique title</th>
                                </tr>
                              </thead>
                              <tbody>
                                {r.sourceDetails.map((s, j) => (
                                  <tr key={j} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40">
                                    <td className="px-4 py-2.5">
                                      <a href="#" className="text-[12px] font-medium text-primary-600 hover:underline truncate block max-w-[300px]">{s.fromUrl}</a>
                                    </td>
                                    <td className="px-4 py-2.5">
                                      <span className={`text-[12px] font-medium ${s.followType === 'Do follow' ? 'text-success-700' : 'text-warning-600'}`}>
                                        {s.followType}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-[12px] text-gray-600">{s.altAttr}</td>
                                    <td className="px-4 py-2.5 text-[12px] text-gray-600">{s.title}</td>
                                    <td className="px-4 py-2.5 text-[12px] text-gray-600">{s.uniqueTitle}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </div>
              )
            })}
          </tbody>
        </table>
        <HLPagination
          page={page}
          perPage={perPage}
          total={filtered.length}
          onPage={setPage}
          onPerPage={p => { setPerPage(p); setPage(1) }}
        />
      </SectionCard>
    </div>
  )
}

// ─── Crawl Comparison Tab ─────────────────────────────────────────────────────

function CrawlComparisonTab() {
  const [showOnlyDiffs, setShowOnlyDiffs] = useState(false)
  const [date1Idx, setDate1Idx] = useState(0)
  const [date2Idx, setDate2Idx] = useState(1)

  const DATE1 = AUDIT_DATES[date1Idx]
  const DATE2 = AUDIT_DATES[date2Idx]

  /* Rule: ALL table column headers must use text-gray-500 — no severity colors in headers */
  const TH_CLS = 'px-5 py-3 text-[12px] font-semibold text-gray-900 border-b border-gray-100 bg-gray-50/60 whitespace-nowrap text-left'
  const TD_CLS = 'px-5 py-3.5 text-[13px] border-b border-gray-50 last:border-0'

  // Pull the two selected snapshot values off a row's series and derive the
  // Fixed / New deltas. For `lowerBetter` (issue-count) rows a decrease from the
  // second date to the first counts as Fixed; an increase counts as New.
  function derive(row) {
    const v1 = row.series[date1Idx]
    const v2 = row.series[date2Idx]
    const changed = v1 !== v2
    let fixed = null, newCount = null
    if (row.lowerBetter && typeof v1 === 'number' && typeof v2 === 'number') {
      if (v1 < v2) fixed = v2 - v1
      else if (v1 > v2) newCount = v1 - v2
    }
    return { ...row, v1, v2, changed, fixed, newCount, fixColor: '#16A34A', newColor: '#D97706' }
  }

  const auditRows  = COMPARISON_AUDIT.map(derive).filter(r => !showOnlyDiffs || r.changed)
  const domainRows = COMPARISON_DOMAIN_METRICS.map(derive).filter(r => !showOnlyDiffs || r.changed)
  const issueSections = COMPARISON_ISSUE_SECTIONS
    .map(s => ({ ...s, issues: s.issues.map(derive).filter(r => !showOnlyDiffs || r.changed) }))
    .filter(s => s.issues.length > 0)

  const totalDiffs =
    auditRows.filter(r => r.changed).length +
    domainRows.filter(r => r.changed).length +
    issueSections.reduce((n, s) => n + s.issues.filter(r => r.changed).length, 0)

  function rowIcon(icon) {
    const base = 'inline-flex items-center justify-center w-5 h-5 rounded-full border shrink-0'
    if (icon === 'error')   return <span className={base} style={{ borderColor: 'var(--error-600)',   background: 'var(--error-50)'    }}><AlertTriangle size={10} className="text-error-600"   /></span>
    if (icon === 'warning') return <span className={base} style={{ borderColor: 'var(--warning-600)', background: 'var(--warning-100)' }}><AlertTriangle size={10} className="text-warning-600" /></span>
    if (icon === 'notice')  return <span className={base} style={{ borderColor: 'var(--primary-600)', background: 'var(--primary-50)'  }}><Info          size={10} className="text-primary-600" /></span>
    if (icon === 'check')   return <span className={base} style={{ borderColor: 'var(--success-600)', background: 'var(--success-50)'  }}><CircleCheck   size={10} className="text-success-600" /></span>
    if (icon === 'pages')   return <FileText size={14} className="text-gray-400 shrink-0" />
    return <BarChart3 size={14} className="text-gray-400 shrink-0" />
  }

  // Highlight the changed value against its baseline so it's clear which date moved.
  function renderVal(row, which) {
    const val = which === 1 ? row.v1 : row.v2
    if (!row.changed) return <span className="text-[14px] font-bold text-gray-900">{val}</span>
    const isNum = typeof row.v1 === 'number' && typeof row.v2 === 'number'
    let color = '#101828'
    if (isNum) {
      const better = row.lowerBetter ? row.v1 < row.v2 : row.v1 > row.v2
      const isFirst = which === 1
      // colour only the newer (first) column when it improved / regressed
      if (isFirst) color = better ? '#16A34A' : '#DC2626'
    }
    return <span className="text-[14px] font-bold" style={{ color }}>{val}</span>
  }

  function renderFixed(row) {
    if (row.fixed != null) return <span className="text-[13px] font-semibold" style={{ color: row.fixColor }}>{row.fixed}</span>
    return <span className="text-[13px] text-gray-300">—</span>
  }

  function renderNew(row) {
    if (row.newCount != null) return <span className="text-[13px] font-semibold" style={{ color: row.newColor }}>{row.newCount}</span>
    return <span className="text-[13px] text-gray-300">—</span>
  }

  return (
    <div className="flex flex-col gap-4 min-w-0 pb-8">
      {/* Date selectors + toggle */}
      <div className="flex items-end gap-4 flex-wrap">
        <div className="flex flex-col gap-1.5">
          <p className="text-[12px] font-medium text-gray-400">First audit date</p>
          <div className="relative w-[232px]">
            <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={date1Idx}
              onChange={e => setDate1Idx(Number(e.target.value))}
              className="appearance-none w-full h-9 text-[13px] font-medium text-gray-800 border border-gray-200 rounded-lg pl-8 pr-7 bg-white outline-none cursor-pointer hover:border-gray-300 focus:border-primary-600 transition-colors"
            >
              {AUDIT_DATES.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-[12px] font-medium text-gray-400">Second audit date</p>
          <div className="relative w-[232px]">
            <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={date2Idx}
              onChange={e => setDate2Idx(Number(e.target.value))}
              className="appearance-none w-full h-9 text-[13px] font-medium text-gray-800 border border-gray-200 rounded-lg pl-8 pr-7 bg-white outline-none cursor-pointer hover:border-gray-300 focus:border-primary-600 transition-colors"
            >
              {AUDIT_DATES.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Separator — matches the select field height, bottom-aligned with the fields */}
        <div className="self-end h-9 w-px bg-gray-200 shrink-0" />

        {/* Toggle + label */}
        <div className="flex items-center gap-3 self-end">
          <button
            onClick={() => setShowOnlyDiffs(d => !d)}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${showOnlyDiffs ? 'bg-primary-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${showOnlyDiffs ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
          <div>
            <p className="text-[13px] font-medium text-gray-800">Show only differences</p>
            <p className="text-[12px] text-gray-400">Hide unchanged rows across the comparison matrix.</p>
          </div>
        </div>
      </div>

      {/* Info pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-[12px] font-medium text-primary-700">
          Comparing {DATE1} vs {DATE2}
        </span>
      </div>

      {/* Audit results */}
      <SectionCard>
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-[14px] font-semibold text-gray-900">Audit results</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Side-by-side summary of the latest crawl and the selected comparison snapshot.</p>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={TH_CLS + ' w-[40%]'}>Results</th>
              <th className={TH_CLS}>{DATE1}</th>
              <th className={TH_CLS}>{DATE2}</th>
              <th className={TH_CLS}>Fixed</th>
              <th className={TH_CLS}>New</th>
            </tr>
          </thead>
          <tbody>
            {auditRows.length === 0 ? (
              <tr><td className={TD_CLS} colSpan={5}><span className="text-[13px] text-gray-400">No differences between these two audits.</span></td></tr>
            ) : auditRows.map(row => (
              <tr key={row.label} className="hover:bg-gray-50/40 transition-colors">
                <td className={TD_CLS}>
                  <div className="flex items-center gap-2">
                    {rowIcon(row.icon)}
                    <span className="text-[13px] font-medium text-gray-700">{row.label}</span>
                  </div>
                </td>
                <td className={TD_CLS}>{renderVal(row, 1)}</td>
                <td className={TD_CLS}>{renderVal(row, 2)}</td>
                <td className={TD_CLS}>{renderFixed(row)}</td>
                <td className={TD_CLS}>{renderNew(row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* Domain metrics */}
      <SectionCard>
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-[14px] font-semibold text-gray-900">Domain metrics</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Reference metrics that help explain why the two crawls may look different.</p>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={TH_CLS + ' w-[40%]'}>Metric</th>
              <th className={TH_CLS}>{DATE1}</th>
              <th className={TH_CLS}>{DATE2}</th>
              <th className={TH_CLS}>Fixed</th>
              <th className={TH_CLS}>New</th>
            </tr>
          </thead>
          <tbody>
            {domainRows.length === 0 ? (
              <tr><td className={TD_CLS} colSpan={5}><span className="text-[13px] text-gray-400">No differences between these two audits.</span></td></tr>
            ) : domainRows.map(row => (
              <tr key={row.metric} className="hover:bg-gray-50/40 transition-colors">
                <td className={TD_CLS}><span className="text-[13px] font-medium text-gray-700">{row.metric}</span></td>
                <td className={TD_CLS}><span className={`text-[13px] font-semibold ${row.changed ? 'text-primary-700' : 'text-gray-900'}`}>{row.v1}</span></td>
                <td className={TD_CLS}><span className="text-[13px] font-semibold text-gray-900">{row.v2}</span></td>
                <td className={TD_CLS}><span className="text-[13px] text-gray-300">—</span></td>
                <td className={TD_CLS}><span className="text-[13px] text-gray-300">—</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* Issue category sections */}
      {issueSections.map(section => (
        <SectionCard key={section.category}>
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-[14px] font-semibold text-gray-900">{section.category}</p>
            <p className="text-[12px] text-gray-400 mt-0.5">{section.issues.length} tracked issue{section.issues.length !== 1 ? 's' : ''} in this comparison section.</p>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={TH_CLS + ' w-[40%]'}>Issue</th>
                <th className={TH_CLS}>{DATE1}</th>
                <th className={TH_CLS}>{DATE2}</th>
                <th className={TH_CLS}>Fixed</th>
                <th className={TH_CLS}>New</th>
              </tr>
            </thead>
            <tbody>
              {section.issues.map(row => (
                <tr key={row.label} className="hover:bg-gray-50/40 transition-colors">
                  <td className={TD_CLS}>
                    <div className="flex items-center gap-2">
                      {rowIcon(row.icon)}
                      <span className="text-[13px] font-medium text-gray-700">{row.label}</span>
                    </div>
                  </td>
                  <td className={TD_CLS}>{renderVal(row, 1)}</td>
                  <td className={TD_CLS}>{renderVal(row, 2)}</td>
                  <td className={TD_CLS}>{renderFixed(row)}</td>
                  <td className={TD_CLS}>{renderNew(row)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      ))}

      {showOnlyDiffs && issueSections.length === 0 && auditRows.length === 0 && domainRows.length === 0 && (
        <SectionCard>
          <div className="px-5 py-10 flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-full bg-success-50 flex items-center justify-center mb-3">
              <CircleCheck size={20} className="text-success-600" />
            </div>
            <p className="text-[14px] font-semibold text-gray-900">No differences found</p>
            <p className="text-[12px] text-gray-400 mt-0.5 max-w-[300px]">These two audits are identical across every tracked metric and issue.</p>
          </div>
        </SectionCard>
      )}
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',   label: 'Overview',        Icon: LayoutDashboard },
  { id: 'scan',       label: 'Scan results',    Icon: Search          },
  { id: 'crawled',    label: 'Crawled pages',   Icon: Globe           },
  { id: 'links',      label: 'Found links',     Icon: Link2           },
  { id: 'resources',  label: 'Found resources', Icon: Package         },
  { id: 'comparison', label: 'Crawl comparison',Icon: BarChart3       },
]

// ─── Initial / pre-scan state ────────────────────────────────────────────────

const WORKFLOW_STEPS = [
  { n: '01', Icon: Search,        color: 'var(--primary-600)', bg: 'var(--primary-50)', label: 'Discover',  desc: 'We crawl your site structure and collect URLs, links, and resources.' },
  { n: '02', Icon: AlertTriangle, color: '#D97706', bg: 'var(--warning-100)', label: 'Diagnose',  desc: 'Issues are grouped by severity so your team knows what to fix first.' },
  { n: '03', Icon: TrendingUp,    color: '#0D9488', bg: '#F0FDFA', label: 'Improve',   desc: 'Future crawls show what improved, what regressed, and where to focus next.' },
]

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${on ? 'bg-primary-600' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

const TRUST_SIGNALS = [
  { Icon: CircleCheck, color: '#16A34A', bg: '#F0FDF4', label: 'Safe & respectful crawl',  sub: 'We follow robots.txt and your settings' },
  { Icon: Award,       color: 'var(--purple-600)', bg: 'var(--purple-50)', label: 'Your data is private',      sub: 'Only you can see your audit data'       },
  { Icon: Clock,       color: 'var(--primary-600)', bg: 'var(--primary-50)', label: 'Crawl history',             sub: 'Compare and track over time'            },
]

function InitialCardPreviewHealth() {
  return (
    <div className="h-full rounded-lg bg-gray-50 border border-gray-100 p-3 flex items-center gap-3">
      <div className="shrink-0 flex flex-col items-center gap-0.5">
        <div className="w-11 h-11 rounded-full border-[3px] flex items-center justify-center bg-white" style={{ borderColor: '#16A34A' }}>
          <span className="text-[13px] font-bold text-gray-900">82</span>
        </div>
        <span className="text-[9px] text-gray-400">/100</span>
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {[
          { Icon: CircleX,      c: '#DC2626', label: 'Errors',   v: 124 },
          { Icon: AlertTriangle, c: '#D97706', label: 'Warnings', v: 243 },
          { Icon: Info,          c: 'var(--primary-600)', label: 'Notices',  v: 532 },
        ].map(({ Icon, c, label, v }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Icon size={9} style={{ color: c }} />
              <span className="text-[12px] text-gray-500">{label}</span>
            </div>
            <span className="text-[12px] font-bold" style={{ color: c }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function InitialCardPreviewLinks() {
  const items = [
    { s: 'ok' }, { s: 'warn' }, { s: 'ok' },
    { s: 'err' }, { s: 'ok' }, { s: 'warn' },
  ]
  return (
    <div className="h-full rounded-lg bg-gray-50 border border-gray-100 p-3 flex items-center">
      <div className="grid grid-cols-3 gap-1.5 w-full">
        {items.map(({ s }, i) => (
          <div key={i} className={`h-6 rounded-md flex items-center justify-center border text-[9px] font-semibold ${
            s === 'ok'   ? 'bg-white border-gray-200 text-gray-300' :
            s === 'warn' ? 'bg-warning-100 border-warning-200 text-warning-600' :
                           'bg-error-50 border-error-200 text-error-600'
          }`}>
            {s === 'ok' ? <div className="w-5 h-0.5 bg-gray-200 rounded" /> : <AlertTriangle size={8} />}
          </div>
        ))}
      </div>
    </div>
  )
}

function InitialCardPreviewTrends() {
  return (
    <div className="h-full rounded-lg bg-gray-50 border border-gray-100 p-3 flex items-center">
      <svg viewBox="0 0 120 36" className="w-full" style={{ height: 36, display: 'block' }}>
        <path d="M0,30 L20,24 L40,26 L60,14 L80,16 L100,6 L120,4 L120,36 L0,36Z" fill="var(--primary-50)" />
        <path d="M0,30 L20,24 L40,26 L60,14 L80,16 L100,6 L120,4" fill="none" stroke="var(--primary-600)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        {[[0,30],[40,26],[80,16],[120,4]].map(([x,y], i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill="var(--primary-600)" />
        ))}
      </svg>
    </div>
  )
}

const DETAIL_CARDS_V2 = [
  {
    Icon: LayoutDashboard, color: 'var(--primary-600)', bg: 'var(--primary-50)',
    chip: 'Score + top issues',
    title: 'Health snapshot',
    desc: 'Get your overall health score and the issues impacting SEO the most.',
    tabs: ['Overview', 'Scan results'],
    Preview: InitialCardPreviewHealth,
  },
  {
    Icon: Link2, color: '#0D9488', bg: '#F0FDFA',
    chip: 'URLs + internal linking',
    title: 'Page & link map',
    desc: 'Find out which pages need attention and where broken or weak links are holding you back.',
    tabs: ['Crawled pages', 'Found links'],
    Preview: InitialCardPreviewLinks,
  },
  {
    Icon: TrendingUp, color: 'var(--purple-600)', bg: 'var(--purple-50)',
    chip: 'Resources + change tracking',
    title: 'Assets & trends',
    desc: 'Catch heavy resources, rendering friction, and track improvements over time.',
    tabs: ['Resources', 'Crawl comparison'],
    Preview: InitialCardPreviewTrends,
  },
]

// Basic website URL validation — requires a valid domain + real TLD (>=2 letters).
// Rejects malformed input like ".co", ",com", "example", "example." etc.
function isValidWebsiteUrl(raw) {
  const v = (raw || '').trim().replace(/^https?:\/\//i, '')
  const domainRe = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(\/.*)?$/i
  return domainRe.test(v)
}

function SiteHealthInitialState({ onLaunch }) {
  const [url, setUrl]           = useState('')
  const [urlError, setUrlError] = useState('')
  const [agent, setAgent]       = useState('Custom bot')
  const [maxPages, setMaxPages] = useState(50)
  const [speed, setSpeed]       = useState(500)
  const [jsOn, setJsOn]         = useState(false)
  const [robotsOn, setRobotsOn] = useState(true)
  const [advanced, setAdvanced] = useState(false)

  function handleLaunchClick() {
    const v = url.trim()
    if (!v) { setUrlError('Enter your website URL to start the audit.'); return }
    if (!isValidWebsiteUrl(v)) { setUrlError("That doesn't look like a valid URL. Try a format like https://example.com."); return }
    setUrlError('')
    onLaunch({ url, agent, maxPages, speed, jsOn, robotsOn })
  }

  const FEATURES_V2 = [
    { Icon: Globe,         color: '#0D9488', bg: '#F0FDFA', label: 'Crawl the entire site', sub: 'Pages, links, assets & more'  },
    { Icon: AlertTriangle, color: '#D97706', bg: 'var(--warning-100)', label: 'Spot what matters',     sub: 'Errors first, save time'       },
    { Icon: BarChart3,     color: 'var(--purple-600)', bg: 'var(--purple-50)', label: 'Track & improve',       sub: 'Compare every crawl'           },
  ]

  return (
    <div className="flex-1 min-w-0 min-h-0 h-full bg-gray-50 p-4 flex overflow-hidden">
      <div
        className="flex-1 min-w-0 bg-white rounded-xl overflow-hidden"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,.08)', display: 'grid', gridTemplateColumns: '1fr minmax(0, 320px)' }}
      >

        {/* ── Left: scrolls when squished ── */}
        <div className="overflow-y-auto min-w-0 border-r border-gray-100 p-6 flex flex-col gap-8" style={{ scrollbarWidth: 'thin', scrollbarColor: '#D0D5DD transparent' }}>

          {/* Group 1: Hero + feature strip + preview cards */}
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-[24px] font-bold text-gray-900 leading-tight mb-2">
                Uncover what's holding back your{' '}
                <span className="text-primary-600">organic growth</span>{' '}
                <TrendingUp size={22} className="inline text-primary-600 -mt-1" />
              </h1>
              <p className="text-[13px] text-gray-500 leading-relaxed">
                Run a complete crawl to get a clear snapshot of your site's health and fix what matters most for better SEO performance.
              </p>
            </div>

            <div className="flex flex-col gap-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
              {FEATURES_V2.map(({ Icon, color, bg, label, sub }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-900">{label}</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))' }}>
              {DETAIL_CARDS_V2.map(({ title, desc, tabs, Preview }) => (
                <div key={title} className="border border-gray-200 rounded-xl p-4 flex flex-col hover:border-gray-300 hover:shadow-sm transition-all">
                  <p className="text-[13px] font-bold text-gray-900">{title}</p>
                  <p className="text-[12px] text-gray-400 leading-relaxed mt-1" style={{ minHeight: '2.5rem' }}>{desc}</p>
                  <div className="h-[82px]">
                    <Preview />
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-100">
                    {tabs.map(t => (
                      <span key={t} className="text-[12px] font-medium text-gray-600 bg-white border border-gray-200 rounded-full px-2.5 py-0.5">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>

          {/* Group 2: What happens next */}
          <div className="border-t border-gray-100 pt-8">
            <p className="text-[13px] font-semibold text-gray-700 mb-3">What happens next</p>
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
              {WORKFLOW_STEPS.map(({ n, Icon, color, bg, label, desc }) => (
                <div key={n} className="flex flex-col gap-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: bg }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-400 leading-none">{n}</p>
                      <p className="text-[13px] font-bold text-gray-900 leading-tight">{label}</p>
                    </div>
                  </div>
                  <p className="text-[12px] text-gray-400 leading-snug">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Group 3: Trust signals */}
          <div className="border-t border-gray-100 pt-8">
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
              {TRUST_SIGNALS.map(({ Icon, color, bg, label, sub }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-gray-700">{label}</p>
                    <p className="text-[12px] text-gray-400 mt-0.5 leading-snug">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Right: config panel ── */}
        <div className="flex flex-col overflow-hidden">

          {/* Scrollable config */}
          <div className="flex-1 overflow-y-auto px-6 pt-6 pb-4 flex flex-col gap-5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#D0D5DD transparent' }}>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                <Zap size={18} className="text-primary-600" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-900 leading-none">Start your audit</p>
                <p className="text-[12px] text-gray-400 mt-0.5">Enter your website and launch the crawl</p>
              </div>
            </div>

            {/* URL input */}
            <div>
              <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">Website URL</label>
              <div className={`flex items-center gap-2 border rounded-lg px-3 py-2.5 transition-all bg-white ${
                urlError
                  ? 'border-error-600 focus-within:border-error-600'
                  : 'border-gray-200 focus-within:border-primary-600 focus-within:shadow-focus-purple-sm'
              }`}>
                <Globe size={14} className={`shrink-0 ${urlError ? 'text-error-600' : 'text-gray-400'}`} />
                <input
                  value={url}
                  onChange={e => { setUrl(e.target.value); if (urlError) setUrlError('') }}
                  onKeyDown={e => { if (e.key === 'Enter') handleLaunchClick() }}
                  placeholder="https://yourwebsite.com"
                  aria-invalid={!!urlError}
                  className="flex-1 text-[13px] text-gray-800 placeholder:text-gray-400 outline-none bg-transparent"
                />
              </div>
              {urlError && (
                <p className="flex items-center gap-1 mt-1.5 text-[12px] text-error-600">
                  <CircleX size={12} className="shrink-0" /> {urlError}
                </p>
              )}
            </div>

            {/* Advanced settings */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setAdvanced(a => !a)}
                className="flex items-center justify-between w-full px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="text-[13px] font-semibold text-gray-700">Advanced settings</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${advanced ? 'rotate-180' : ''}`} />
              </button>

              <div style={{ display: 'grid', gridTemplateRows: advanced ? '1fr' : '0fr', transition: 'grid-template-rows 200ms ease' }}>
                <div style={{ overflow: 'hidden' }}>
                  <div className="border-t border-gray-100 px-4 py-4 flex flex-col gap-4 bg-gray-50/40">
                    {/* User agent */}
                    <div>
                      <p className="text-[12px] font-semibold text-gray-600 mb-1.5">Crawler user agent</p>
                      <div className="relative">
                        <select value={agent} onChange={e => setAgent(e.target.value)}
                          className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 bg-white outline-none focus:border-primary-600 pr-8 cursor-pointer">
                          <option>Custom bot</option>
                          <option>Googlebot</option>
                          <option>Bingbot</option>
                        </select>
                        <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                    {/* Max pages */}
                    <div>
                      <p className="text-[12px] font-semibold text-gray-600 mb-1.5">Max pages</p>
                      <input type="number" value={maxPages} onChange={e => setMaxPages(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 bg-white outline-none focus:border-primary-600" />
                    </div>
                    {/* JS rendering toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[13px] font-semibold text-gray-700">JS rendering</p>
                          <span title="Enables JavaScript execution during crawl. Slower but more accurate for SPA or React sites." style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: 999, border: '1px solid #D0D5DD', fontSize: 9, fontWeight: 700, color: '#98A2B3', cursor: 'help', flexShrink: 0, lineHeight: 1 }}>i</span>
                        </div>
                        <p className="text-[12px] text-gray-400 mt-0.5">Enable for JavaScript-heavy sites</p>
                      </div>
                      <Toggle on={jsOn} onChange={setJsOn} />
                    </div>
                    {/* Respect robots.txt toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[13px] font-semibold text-gray-700">Respect robots.txt</p>
                          <span title="When enabled, the crawler follows your site's robots.txt rules — matching how Googlebot and other crawlers behave." style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: 999, border: '1px solid #D0D5DD', fontSize: 9, fontWeight: 700, color: '#98A2B3', cursor: 'help', flexShrink: 0, lineHeight: 1 }}>i</span>
                        </div>
                        <p className="text-[12px] text-gray-400 mt-0.5">Follow crawl directives</p>
                      </div>
                      <Toggle on={robotsOn} onChange={setRobotsOn} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* CTA pinned at bottom */}
          <div className="px-6 pb-6 pt-4 border-t border-gray-100 bg-white">
            <button
              onClick={handleLaunchClick}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-[14px] font-semibold transition-colors shadow-sm"
            >
              <Zap size={15} />
              Crawl and run audit
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}

// ─── Crawl in-progress loading screen ────────────────────────────────────────

const CRAWL_STAGES = [
  { at: 0,  msg: 'Preparing the crawl and validating the website before the audit begins.' },
  { at: 12, msg: 'Discovering pages and building the URL graph.' },
  { at: 28, msg: 'Analyzing crawlability, indexing signals, and robot directives.' },
  { at: 46, msg: 'Auditing link attributes, anchor text, and redirect chains.' },
  { at: 63, msg: 'Inspecting resources, images, scripts, and Core Web Vitals signals.' },
  { at: 79, msg: 'Running schema validation and technical SEO diagnostics.' },
  { at: 93, msg: 'Building the audit workspace and scoring all findings…' },
]

function SiteHealthCrawlingState({ config, onComplete }) {
  const [progress, setProgress] = useState(0)
  const intervalRef  = useRef(null)
  const completeRef  = useRef(false)

  const domain = (config.url || 'your website')
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '') || 'your website'

  const activeStage = [...CRAWL_STAGES].reverse().find(s => progress >= s.at) || CRAWL_STAGES[0]
  const displayPct  = Math.min(100, Math.round(progress))

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setProgress(p => {
        const step = p < 50 ? 1.1 : p < 80 ? 0.65 : 0.28
        const next = p + step
        if (next >= 100) { clearInterval(intervalRef.current); return 100 }
        return next
      })
    }, 80)
    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (displayPct >= 100 && !completeRef.current) {
      completeRef.current = true
      const t = setTimeout(onComplete, 700)
      return () => clearTimeout(t)
    }
  }, [displayPct])

  return (
    <div className="flex-1 min-w-0 min-h-0 bg-gray-50 flex flex-col">

      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-6 shrink-0">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <Globe size={20} className="text-teal-600" />
            </div>
            <div>
              <p className="text-[16px] font-bold text-gray-900">Site health</p>
              <p className="text-[12px] text-gray-400 mt-0.5">Technical SEO, indexing diagnostics, schema gaps, and fix recommendations</p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-[13px] font-semibold cursor-default">
            <RefreshCw size={13} className="animate-spin" style={{ animationDuration: '1.4s' }} />
            Running audit
          </button>
        </div>
      </div>

      {/* Main content — vertically centred */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-8">
        <div
          className="bg-white border border-gray-200 rounded-xl px-8 py-7"
          style={{ maxWidth: 440, width: '100%', boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}
        >
          <div className="flex flex-col">
            {CRAWL_STAGES.map((stage, i) => {
              const nextAt = CRAWL_STAGES[i + 1]?.at ?? 101
              const isDone = progress >= nextAt
              const isActive = !isDone && progress >= stage.at
              return (
                <div key={stage.label} className="flex items-center gap-3 py-2">
                  {isDone ? (
                    <CircleCheck size={18} className="text-success-600 shrink-0" />
                  ) : isActive ? (
                    <Sparkles size={18} className="text-primary-600 shrink-0" />
                  ) : (
                    <div className="w-[18px] h-[18px] rounded-full border border-gray-200 shrink-0" />
                  )}
                  <span className={`text-[14px] leading-snug ${isDone ? 'text-gray-400' : isActive ? 'font-semibold text-gray-900' : 'text-gray-300'}`}>
                    {stage.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Website Audit Settings Modal ─────────────────────────────────────────────

function InfoTooltip({ text }) {
  const icon = (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: 999, border: '1px solid #D0D5DD', fontSize: 12, fontWeight: 600, color: '#98A2B3', cursor: 'help' }}>i</span>
  )
  if (!text) return <span style={{ flexShrink: 0 }}>{icon}</span>
  return (
    <span className="relative inline-flex group" style={{ flexShrink: 0 }}>
      {icon}
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 w-64 bg-gray-900 text-white text-[12px] leading-relaxed rounded-lg px-3 py-2.5 pointer-events-none z-[300] shadow-lg whitespace-normal opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {text}
        <span className="absolute left-1/2 -translate-x-1/2 top-full" style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #101828' }} />
      </span>
    </span>
  )
}

function SettingsToggle({ value, onChange, label, description, tooltip }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {label && (
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-medium text-gray-900">{label}</span>
            {tooltip !== undefined && <InfoTooltip text={tooltip} />}
          </div>
        )}
        {description && <p className="text-[13px] text-gray-500 leading-relaxed">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors mt-0.5 ${value ? 'bg-primary-600' : 'bg-gray-200'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

function SettingsField({ label, description, tooltip, children }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <p className="text-[14px] font-medium text-gray-900">{label}</p>
        {tooltip !== undefined && <InfoTooltip text={tooltip} />}
      </div>
      {description && <p className="text-[13px] text-gray-500 leading-relaxed">{description}</p>}
      {children}
    </div>
  )
}

const AUDIT_SETTINGS_NAV = [
  { id: 'schedule', label: 'Schedule' },
  { id: 'source',   label: 'Page sources' },
  { id: 'rules',    label: 'Page scan rules' },
  { id: 'parser',   label: 'Parser settings' },
  { id: 'limits',   label: 'Limits and restrictions' },
]

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function WebsiteAuditSettingsModal({ onClose, onApply }) {
  const [activeSection, setActiveSection] = useState('schedule')

  // Schedule state
  const [frequency, setFrequency]       = useState('weekly')
  const [repeatEvery, setRepeatEvery]   = useState(false)
  const [intervalVal, setIntervalVal]   = useState(2)
  const [selectedDays, setSelectedDays] = useState(['mon'])
  const [dayOfMonth, setDayOfMonth]     = useState(1)
  const [auditTime, setAuditTime]       = useState('0:00')
  // Source of pages state
  const [sitePages, setSitePages]         = useState(true)
  const [xmlSitemap, setXmlSitemap]       = useState(true)
  const [sitemaps, setSitemaps]           = useState([{ url: 'https://www.gohighlevel.com/sitemap.xml', urlCount: 775 }])
  const [sitemapInput, setSitemapInput]   = useState('')
  const [addingSitemap, setAddingSitemap] = useState(false)

  // Rules state
  const [respectRobots, setRespectRobots]                   = useState(true)
  const [ignoreNoindex, setIgnoreNoindex]                   = useState(false)
  const [ignoreNofollow, setIgnoreNofollow]                 = useState(false)
  const [onlyCrawlChips, setOnlyCrawlChips]                 = useState(['/blog/', '/compare/'])
  const [skipUrlChips, setSkipUrlChips]                     = useState(['/staging/', '/admin/'])
  const [hideUrlChips, setHideUrlChips]                     = useState(['/cdn-cgi/', '/wp-json/'])
  const [ignoreUrlParams, setIgnoreUrlParams]               = useState('disabled')
  const [customParams, setCustomParams]                     = useState('')
  const [ignoreExternalDomains, setIgnoreExternalDomains]   = useState('')

  // Parser settings state
  const [userAgent, setUserAgent]           = useState('custom')
  const [jsRendering, setJsRendering]       = useState(false)

  // Limits and restrictions state
  const [maxPages, setMaxPages]             = useState(50)
  const [maxCrawlDepth, setMaxCrawlDepth]   = useState(10)
  const [maxReqPerSec, setMaxReqPerSec]     = useState(500)
  const [maxRedirects, setMaxRedirects]     = useState(5)
  const [maxPageSize, setMaxPageSize]       = useState(3000)

  function toggleDay(d) {
    const k = d.toLowerCase()
    setSelectedDays(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k])
  }

  function addSitemap() {
    const t = sitemapInput.trim()
    if (t && !sitemaps.find(s => s.url === t)) { setSitemaps(p => [...p, { url: t, urlCount: 0 }]); setSitemapInput(''); setAddingSitemap(false) }
  }

  const TA = 'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary-600 transition-colors resize-none'

  function ChipInput({ list, setList, placeholder }) {
    const [input, setInput] = useState('')
    function add() {
      const t = input.trim()
      if (t && !list.includes(t)) { setList(p => [...p, t]); setInput('') }
    }
    return (
      <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] border border-gray-200 rounded-lg px-3 py-2 focus-within:border-primary-600 transition-colors cursor-text">
        {list.map(item => (
          <span key={item} className="inline-flex items-center gap-1 pl-2 pr-1.5 py-0.5 rounded-md bg-gray-100 text-[12px] font-medium text-gray-700 font-mono whitespace-nowrap shrink-0">
            {item}
            <button onClick={() => setList(p => p.filter(x => x !== item))} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={10} /></button>
          </span>
        ))}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={list.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[100px] text-[13px] text-gray-900 placeholder:text-gray-400 outline-none bg-transparent font-mono"
        />
      </div>
    )
  }

  function renderSchedule() {
    return (
      <div className="flex flex-col gap-5 pb-4">
        <p className="text-[18px] font-bold text-gray-900">Schedule</p>
        <div className="border border-gray-200 rounded-lg p-5 flex flex-col gap-6">

          {/* Scanning frequency */}
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-medium text-gray-900">Scanning frequency</p>
            <div className="flex items-center gap-5 mt-1">
              {['Weekly', 'Monthly', 'Manual'].map(f => {
                const checked = frequency === f.toLowerCase()
                return (
                  <label key={f} className="flex items-center gap-2 cursor-pointer select-none">
                    <span className={`flex items-center justify-center w-4 h-4 rounded-full border-2 transition-colors shrink-0 ${checked ? 'border-primary-600' : 'border-gray-300'}`}>
                      {checked && <span className="w-2 h-2 rounded-full bg-primary-600" />}
                    </span>
                    <input type="radio" className="sr-only" checked={checked} readOnly onChange={() => setFrequency(f.toLowerCase())} />
                    <span className="text-[14px] text-gray-700 font-medium">{f}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Manual: informational message, hide all scheduling controls */}
          {frequency === 'manual' && (
            <div className="px-4 py-3 rounded-lg border border-gray-200" style={{ background: '#F2F4F7' }}>
              <p className="text-[13px] text-gray-600 leading-relaxed">Audits will only run when started manually. No schedule will be created.</p>
            </div>
          )}

          {/* Repeat interval — weekly & monthly only */}
          {frequency !== 'manual' && (
            <div className="flex flex-col gap-3">
              <SettingsToggle
                label="Repeat interval"
                description={
                  frequency === 'weekly'
                    ? (repeatEvery ? 'Runs every 2+ weeks.' : 'Runs every week by default. Enable to run every 2+ weeks.')
                    : (repeatEvery ? 'Runs every 2+ months.' : 'Runs every month by default. Enable to run every 2+ months.')
                }
                value={repeatEvery}
                onChange={setRepeatEvery}
              />
              {repeatEvery && (
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium text-gray-700">Run every</span>
                  <div className="flex items-center h-9 border border-gray-200 rounded-lg overflow-hidden focus-within:border-primary-600 transition-colors">
                    <input
                      type="text"
                      value={intervalVal}
                      onChange={e => { const n = parseInt(e.target.value, 10); if (!isNaN(n) && n >= 1) setIntervalVal(n) }}
                      className="w-12 h-full px-3 text-[14px] text-gray-900 outline-none bg-transparent text-center"
                    />
                    <div className="flex items-center h-full shrink-0">
                      <button onClick={() => setIntervalVal(v => Math.max(1, v - 1))} className="h-full w-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                        <Minus size={11} />
                      </button>
                      <button onClick={() => setIntervalVal(v => v + 1)} className="h-full w-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                  <span className="text-[14px] font-medium text-gray-700">{frequency === 'weekly' ? 'weeks' : 'months'}</span>
                </div>
              )}
            </div>
          )}

          {/* Days — weekly only */}
          {frequency === 'weekly' && (
            <SettingsField label="Days">
              <div className="flex items-center gap-2 flex-wrap">
                {WEEKDAYS.map(d => {
                  const active = selectedDays.includes(d.toLowerCase())
                  return (
                    <button key={d} onClick={() => toggleDay(d)}
                      className={`w-12 h-9 rounded-full text-[13px] font-medium border transition-colors ${
                        active ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >{d}</button>
                  )
                })}
              </div>
            </SettingsField>
          )}

          {/* Day of month + Time — side by side for monthly; Time full-width for weekly */}
          {frequency === 'monthly' && (
            <div className="grid grid-cols-2 gap-5">
              <SettingsField label="Day of month">
                <div className="relative">
                  <select value={dayOfMonth} onChange={e => setDayOfMonth(Number(e.target.value))}
                    className="appearance-none w-full h-10 border border-gray-200 rounded-lg px-3 pr-8 text-[14px] text-gray-900 outline-none focus:border-primary-600 cursor-pointer bg-white transition-colors"
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </SettingsField>
              <SettingsField label="Time (Asia/Calcutta)">
                <div className="relative">
                  <select value={auditTime} onChange={e => setAuditTime(e.target.value)}
                    className="appearance-none w-full h-10 border border-gray-200 rounded-lg px-3 pr-8 text-[14px] text-gray-900 outline-none focus:border-primary-600 cursor-pointer bg-white transition-colors"
                  >
                    {Array.from({ length: 24 }, (_, i) => `${i}:00`).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </SettingsField>
            </div>
          )}

          {frequency === 'weekly' && (
            <SettingsField label="Time (Asia/Calcutta)">
              <div className="relative">
                <select value={auditTime} onChange={e => setAuditTime(e.target.value)}
                  className="appearance-none w-full h-10 border border-gray-200 rounded-lg px-3 pr-8 text-[14px] text-gray-900 outline-none focus:border-primary-600 cursor-pointer bg-white transition-colors"
                >
                  {Array.from({ length: 24 }, (_, i) => `${i}:00`).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </SettingsField>
          )}
        </div>
      </div>
    )
  }

  function renderSource() {
    return (
      <div className="flex flex-col gap-5 pb-4">
        <p className="text-[18px] font-bold text-gray-900">Page sources</p>
        <div className="border border-gray-200 rounded-lg p-5 flex flex-col gap-6">
          <SettingsToggle label="Site pages" description="Scan pages discovered by starting at the site and following internal links." value={sitePages} onChange={setSitePages} />

          <div className="flex flex-col gap-3">
            <SettingsToggle label="XML sitemap" description="Use one or more XML sitemaps as crawl seeds for the audit." value={xmlSitemap} onChange={setXmlSitemap} />

            <div style={{ opacity: xmlSitemap ? 1 : 0.4, pointerEvents: xmlSitemap ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr style={{ background: '#F2F4F7', borderBottom: '1px solid #EAECF0' }}>
                      <th className="px-4 py-2.5 text-[12px] font-semibold text-gray-900">Sitemap</th>
                      <th className="px-4 py-2.5 text-[12px] font-semibold text-gray-900 whitespace-nowrap">URLs</th>
                      <th className="px-4 py-2.5 text-[12px] font-semibold text-gray-900 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sitemaps.map(s => (
                      <tr key={s.url} className="border-b border-gray-100 last:border-0" style={{ background: '#fff' }}>
                        <td className="px-4 py-3 text-[13px] text-gray-800 break-all">{s.url}</td>
                        <td className="px-4 py-3 text-[13px] text-gray-700 whitespace-nowrap">{s.urlCount}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => setSitemaps(p => p.filter(x => x.url !== s.url))} className="p-1 text-gray-400 hover:text-error-600 transition-colors rounded">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {addingSitemap && (
                      <tr className="border-t border-gray-100" style={{ background: '#fff' }}>
                        <td className="px-3 py-2.5" colSpan={3}>
                          <div className="flex items-center gap-2">
                            <input autoFocus value={sitemapInput} onChange={e => setSitemapInput(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') addSitemap()
                                if (e.key === 'Escape') { setSitemapInput(''); setAddingSitemap(false) }
                              }}
                              placeholder="https://example.com/sitemap.xml"
                              className="flex-1 min-w-0 h-8 border border-gray-200 rounded-md px-3 text-[13px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary-600 transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => { setSitemapInput(''); setAddingSitemap(false) }}
                              aria-label="Cancel"
                              className="h-8 w-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
                            >
                              <X size={14} />
                            </button>
                            <button type="button" onClick={addSitemap} className="h-8 px-3 rounded-md bg-primary-600 text-white text-[12px] font-semibold hover:bg-primary-700 transition-colors whitespace-nowrap shrink-0">Add</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {!addingSitemap && (
                <button onClick={() => setAddingSitemap(true)} className="mt-2 text-[13px] font-medium text-primary-600 hover:text-primary-700 transition-colors">
                  + Add sitemap
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderRules() {
    return (
      <div className="flex flex-col gap-5 pb-4">
        <p className="text-[18px] font-bold text-gray-900">Page scan rules</p>
        <div className="border border-gray-200 rounded-lg p-5 flex flex-col gap-6">
          <SettingsToggle label="Respect robots.txt" description="Honor the site rules defined in robots.txt during the crawl." tooltip="Keeping this enabled matches how external crawlers see the site. Disable it only when you intentionally want an internal diagnostic crawl." value={respectRobots} onChange={setRespectRobots} />
          <SettingsToggle label="Ignore noindex"     description="Allow the audit to keep crawling pages even if they are marked noindex." value={ignoreNoindex}  onChange={setIgnoreNoindex} />
          <SettingsToggle label="Ignore nofollow"    description="Follow page links even when nofollow is present."                       value={ignoreNofollow} onChange={setIgnoreNofollow} />

          <div className="border-t border-gray-100" />

          <SettingsField label="Only crawl URLs starting with" tooltip="Limit the crawl to specific path prefixes.">
            <ChipInput list={onlyCrawlChips} setList={setOnlyCrawlChips} placeholder="/blog/, /docs/, ..." />
          </SettingsField>

          <SettingsField label="Skip URLs starting with" tooltip="Exclude entire path groups from the crawl.">
            <ChipInput list={skipUrlChips} setList={setSkipUrlChips} placeholder="/staging/, /admin/, ..." />
          </SettingsField>

          <SettingsField label="Hide URLs and resources starting with" tooltip="Hide noisy resource paths from the report output.">
            <ChipInput list={hideUrlChips} setList={setHideUrlChips} placeholder="/cdn-cgi/, /wp-json/, ..." />
          </SettingsField>

          <div className="border-t border-gray-100" />

          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-medium text-gray-900">Ignore URL parameters</p>
            <div className="flex items-center gap-6 mt-0.5">
              {[
                { value: 'disabled', label: 'Disabled' },
                { value: 'all',      label: 'Ignore all parameters' },
                { value: 'custom',   label: 'Ignore custom parameters' },
              ].map(opt => {
                const checked = ignoreUrlParams === opt.value
                return (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer select-none">
                    <span className={`flex items-center justify-center w-4 h-4 rounded-full border-2 transition-colors shrink-0 ${checked ? 'border-primary-600' : 'border-gray-300'}`}>
                      {checked && <span className="w-2 h-2 rounded-full bg-primary-600" />}
                    </span>
                    <input type="radio" className="sr-only" checked={checked} readOnly onChange={() => setIgnoreUrlParams(opt.value)} />
                    <span className="text-[14px] text-gray-700 font-medium">{opt.label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {ignoreUrlParams === 'custom' && (
            <div className="flex flex-col gap-1">
              <p className="text-[14px] font-medium text-gray-900">Custom parameters</p>
              <textarea rows={3} value={customParams} onChange={e => setCustomParams(e.target.value)}
                placeholder="e.g. utm_source, utm_medium, gclid, fbclid"
                className={TA} />
            </div>
          )}

          {ignoreUrlParams === 'custom' && <div className="border-t border-gray-100" />}

          <SettingsField label="Ignore external domains and links" description="Exclude external domains or links from validation when they are not relevant to your audit scope." tooltip="List domains or full URLs that should be skipped during external link validation.">
            <textarea rows={3} value={ignoreExternalDomains} onChange={e => setIgnoreExternalDomains(e.target.value)} className={TA} />
          </SettingsField>
        </div>
      </div>
    )
  }

  function renderParser() {
    const agents = [
      { value: 'custom',          label: 'Custom bot'      },
      { value: 'googlebot',       label: 'Googlebot'       },
      { value: 'googlebot-image', label: 'Googlebot-Image' },
      { value: 'bingbot',         label: 'BingBot'         },
      { value: 'chrome-desktop',  label: 'Chrome Desktop'  },
    ]
    return (
      <div className="flex flex-col gap-5 pb-4">
        <p className="text-[18px] font-bold text-gray-900">Parser settings</p>
        <div className="border border-gray-200 rounded-lg p-5 flex flex-col gap-6">
          <SettingsField label="User agent" description="Select which crawler identity should be used when the site is fetched.">
            <div className="relative">
              <select value={userAgent} onChange={e => setUserAgent(e.target.value)}
                className="appearance-none w-full h-10 border border-gray-200 rounded-lg px-3 pr-8 text-[14px] text-gray-900 outline-none focus:border-primary-600 cursor-pointer bg-white transition-colors"
              >
                {agents.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </SettingsField>
          <SettingsToggle label="JavaScript rendering" description="Enable client-side rendering when important content loads only after JavaScript executes." tooltip="JavaScript rendering increases crawl time because the page must be rendered after the initial HTML load. Use it for JS-heavy sites or pages where important content is injected after load." value={jsRendering} onChange={setJsRendering} />
        </div>
      </div>
    )
  }

  function renderLimits() {
    function NumInput({ label, tooltip, value, onChange, min = 1 }) {
      return (
        <SettingsField label={label} tooltip={tooltip}>
          <div className="flex items-center h-10 border border-gray-200 rounded-lg overflow-hidden focus-within:border-primary-600 transition-colors">
            <input
              type="text"
              value={value}
              onChange={e => { const n = parseInt(e.target.value, 10); if (!isNaN(n)) onChange(Math.max(min, n)) }}
              className="flex-1 min-w-0 h-full px-3 text-[14px] text-gray-900 outline-none bg-transparent"
            />
            <div className="flex items-center h-full shrink-0">
              <button
                onClick={() => onChange(Math.max(min, value - 1))}
                className="h-full w-9 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Minus size={13} />
              </button>
              <button
                onClick={() => onChange(value + 1)}
                className="h-full w-9 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>
        </SettingsField>
      )
    }
    return (
      <div className="flex flex-col gap-5 pb-4">
        <p className="text-[18px] font-bold text-gray-900">Limits and restrictions</p>
        <div className="border border-gray-200 rounded-lg p-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <NumInput label="Maximum pages to scan"       tooltip="Set the upper limit for how many pages can be crawled in one audit pass."                   value={maxPages}      onChange={setMaxPages} />
            <NumInput label="Maximum crawl depth"         tooltip="Limit how far the crawler should continue following internal links from the starting pages." value={maxCrawlDepth} onChange={setMaxCrawlDepth} />
            <NumInput label="Maximum requests per second" tooltip="Throttle crawl speed to control load on the website during the audit."                      value={maxReqPerSec}  onChange={setMaxReqPerSec} />
            <NumInput label="Maximum redirects"           tooltip="Define how many redirects can be followed before the crawler stops tracking a URL chain."   value={maxRedirects}  onChange={setMaxRedirects} />
            <NumInput label="Maximum page size (KB)"      tooltip="Ignore oversized responses once they exceed this download limit."                           value={maxPageSize}   onChange={setMaxPageSize} />
          </div>
        </div>
      </div>
    )
  }

  const DEF_SITEMAPS     = [{ url: 'https://www.gohighlevel.com/sitemap.xml', urlCount: 775 }]
  const DEF_CRAWL_CHIPS  = ['/blog/', '/compare/']
  const DEF_SKIP_CHIPS   = ['/staging/', '/admin/']
  const DEF_HIDE_CHIPS   = ['/cdn-cgi/', '/wp-json/']

  const hasChanges =
    frequency !== 'weekly' || repeatEvery !== false || intervalVal !== 2 ||
    JSON.stringify(selectedDays) !== JSON.stringify(['mon']) || dayOfMonth !== 1 || auditTime !== '0:00' ||
    sitePages !== true || xmlSitemap !== true ||
    JSON.stringify(sitemaps) !== JSON.stringify(DEF_SITEMAPS) ||
    respectRobots !== true || ignoreNoindex !== false || ignoreNofollow !== false ||
    JSON.stringify(onlyCrawlChips) !== JSON.stringify(DEF_CRAWL_CHIPS) ||
    JSON.stringify(skipUrlChips) !== JSON.stringify(DEF_SKIP_CHIPS) ||
    JSON.stringify(hideUrlChips) !== JSON.stringify(DEF_HIDE_CHIPS) ||
    ignoreUrlParams !== 'disabled' || customParams !== '' ||
    maxPages !== 50 || maxCrawlDepth !== 10 || maxReqPerSec !== 500 || maxRedirects !== 5 || maxPageSize !== 3000

  function resetToDefaults() {
    setFrequency('weekly'); setRepeatEvery(false); setIntervalVal(2)
    setSelectedDays(['mon']); setDayOfMonth(1); setAuditTime('0:00')
    setSitePages(true); setXmlSitemap(true)
    setSitemaps(DEF_SITEMAPS); setSitemapInput(''); setAddingSitemap(false)
    setRespectRobots(true); setIgnoreNoindex(false); setIgnoreNofollow(false)
    setOnlyCrawlChips(DEF_CRAWL_CHIPS)
    setSkipUrlChips(DEF_SKIP_CHIPS)
    setHideUrlChips(DEF_HIDE_CHIPS)
    setIgnoreUrlParams('disabled'); setCustomParams('')
    setMaxPages(50); setMaxCrawlDepth(10); setMaxReqPerSec(500); setMaxRedirects(5); setMaxPageSize(3000)
  }

  function renderContent() {
    switch (activeSection) {
      case 'schedule': return renderSchedule()
      case 'source':   return renderSource()
      case 'rules':    return renderRules()
      case 'parser':   return renderParser()
      case 'limits':   return renderLimits()
      default:         return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[1px]" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden" style={{ width: 900, maxWidth: 'calc(100vw - 32px)', height: '86vh', maxHeight: 820 }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <p className="text-[16px] font-semibold text-gray-900">Website audit settings</p>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* Left nav — HLTabs left placement style */}
          <div className="w-52 shrink-0 border-r border-gray-100 py-2 flex flex-col overflow-y-auto">
            {AUDIT_SETTINGS_NAV.map(n => (
              <button key={n.id} onClick={() => setActiveSection(n.id)}
                className={`w-full text-left py-2.5 px-4 text-[14px] transition-colors whitespace-nowrap border-r-2 ${
                  activeSection === n.id
                    ? 'border-primary-600 text-primary-600 font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 font-normal'
                }`}
              >{n.label}</button>
            ))}
          </div>

          {/* Right scrollable content */}
          <div className="flex-1 overflow-y-auto p-6 min-w-0">
            {renderContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center px-6 py-4 border-t border-gray-100 shrink-0 bg-white">
          <button onClick={resetToDefaults} className="text-[13px] font-medium text-gray-500 hover:text-gray-700 transition-colors">
            Reset to default
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-[14px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={hasChanges ? () => { onApply?.(); onClose() } : undefined}
              disabled={!hasChanges}
              className={`px-4 py-2 rounded-lg text-white text-[14px] font-semibold transition-colors ${hasChanges ? 'bg-primary-600 hover:bg-primary-700 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              Apply changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Crawling progress view ───────────────────────────────────────────────────

function CrawlingProgressView({ progress, message, config }) {
  const domain = (config?.url || 'your website')
    .replace(/^https?:\/\//, '').replace(/\/$/, '') || 'your website'

  const urlsFound    = Math.round(progress * 9.6)
  const pagesAudited = Math.round(progress * 6.8)

  const secondsLeft = Math.max(0, Math.round((100 - progress) / 100 * 26))
  const etaText     = secondsLeft === 0 ? 'Almost done…' : secondsLeft < 60 ? `~${secondsLeft}s remaining` : `~${Math.ceil(secondsLeft / 60)}m remaining`

  const stageStatus = (i) => {
    const next = CRAWL_STAGES[i + 1]
    if (next && progress >= next.at) return 'done'
    if (progress >= CRAWL_STAGES[i].at) return 'active'
    return 'pending'
  }
  const doneCount = CRAWL_STAGES.filter((_, i) => stageStatus(i) === 'done').length

  const LIVE_URLS = [
    '/', '/pricing', '/features', '/blog', '/about', '/contact',
    '/blog/seo-tips', '/blog/content-marketing', '/pricing/enterprise',
    '/features/automation', '/features/crm', '/blog/agency-growth',
    '/careers', '/legal/privacy', '/legal/terms', '/support',
    '/blog/lead-generation', '/api/docs', '/integrations', '/case-studies',
  ]
  const showCount = Math.min(LIVE_URLS.length, Math.max(1, Math.floor(progress / 5)))
  const liveUrls  = [...LIVE_URLS.slice(0, showCount)].reverse()

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50 flex justify-center p-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#D0D5DD transparent' }}>
      <div className="w-full flex flex-col gap-4" style={{ maxWidth: 740 }}>

        {/* ── Main card ── */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden" style={{ boxShadow: '0 2px 16px rgba(0,0,0,.06)' }}>

          {/* Top progress bar */}
          <div className="h-[3px] bg-gray-100">
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, background: 'linear-gradient(to right, #93C5FD, #155EEF)' }}
            />
          </div>

          {/* Two-panel row */}
          <div className="flex" style={{ borderBottom: '1px solid #F2F4F7' }}>

            {/* Left: percentage */}
            <div className="flex flex-col items-center justify-center gap-2 p-8 shrink-0" style={{ minWidth: 210 }}>
              <span className="text-[48px] font-semibold text-gray-900 tabular-nums leading-none">{progress}%</span>
              <span className="text-[12px] text-gray-400">complete</span>
            </div>

            {/* Divider */}
            <div className="w-px bg-gray-100 self-stretch shrink-0" />

            {/* Right: audit stages */}
            <div className="flex-1 min-w-0 p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[12px] font-semibold text-gray-700">Audit stages</p>
                <span className="text-[12px] text-gray-400">{doneCount} of {CRAWL_STAGES.length} complete</span>
              </div>
              <div className="flex flex-col gap-0.5">
                {CRAWL_STAGES.map((stage, i) => {
                  const status = stageStatus(i)
                  return (
                    <div key={i} className={`flex items-start gap-2.5 px-3 py-2 rounded-lg transition-colors ${status === 'active' ? 'bg-primary-50' : ''}`}>
                      <div className="w-4 h-4 shrink-0 flex items-center justify-center mt-px">
                        {status === 'done' ? (
                          <CircleCheck size={16} className="text-success-600" />
                        ) : status === 'active' ? (
                          <Sparkles size={16} className="text-primary-600" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 block" />
                        )}
                      </div>
                      <p className={`text-[12px] flex-1 leading-snug ${
                        status === 'active' ? 'font-semibold text-primary-700' :
                        status === 'done'   ? 'text-gray-400' :
                                             'text-gray-300'
                      }`}>{stage.msg}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Bottom: domain + counters */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={13} className="text-gray-400 shrink-0" />
              <p className="text-[13px] font-semibold text-gray-900 truncate">{domain}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'URLs found',    value: urlsFound,    color: '#155EEF' },
                { label: 'Pages audited', value: pagesAudited, color: '#0D9488' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-3 text-center">
                  <p className="text-[24px] font-bold tabular-nums leading-none" style={{ color }}>{value.toLocaleString()}</p>
                  <p className="text-[12px] text-gray-400 mt-1.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>


      </div>
    </div>
  )
}

// ─── Scan failed / crawl error screen ────────────────────────────────────────

// Shown when a scan + crawl can't complete. Renders in the same content area as
// the crawl progress view (page header + tabs stay above it) with a Retry scan CTA.
function ScanErrorContent({ config, onRetry }) {
  const domain = (config?.url || 'your website')
    .replace(/^https?:\/\//, '').replace(/\/$/, '') || 'your website'

  // Mirror CrawlingProgressView's container (flex justify-center + p-6, top-aligned)
  // so the error card lands in the exact spot the loading card occupied — no shift.
  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50 flex justify-center p-6" style={{ scrollbarWidth: 'thin', scrollbarColor: '#D0D5DD transparent' }}>
      <div className="w-full flex flex-col" style={{ maxWidth: 440 }}>
        <div
          className="bg-white border border-gray-200 rounded-xl px-8 py-9 flex flex-col items-center text-center w-full"
          style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}
        >
          <div className="w-14 h-14 rounded-full bg-error-50 flex items-center justify-center mb-5">
            <AlertTriangle size={26} className="text-error-600" />
          </div>
          <p className="text-[16px] font-semibold text-gray-900 mb-1.5">Scan could not be completed</p>
          <p className="text-[14px] text-gray-500 leading-relaxed mb-6 max-w-[320px]">
            The website audit for <span className="font-medium text-gray-700">{domain}</span> ran into an error and couldn't finish. No data was captured for this scan.
          </p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[14px] font-semibold transition-colors"
          >
            <RefreshCw02 size={14} /> Retry scan
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function SiteHealthDashboard() {
  const [phase, setPhase]               = useState(() => sessionStorage.getItem('sh_hasScan') === '1' ? 'ready' : 'setup')
  const [crawlConfig, setCrawlConfig]   = useState(null)
  const [activeTab, setActiveTab]       = useState('overview')
  const [showSettings, setShowSettings] = useState(false)
  const [showRescanConfirm, setShowRescanConfirm] = useState(false)
  const [rescanDontAsk, setRescanDontAsk] = useState(false)
  const [jumpTarget, setJumpTarget]     = useState(null)
  const [isCrawling, setIsCrawling]     = useState(false)
  const [crawlProgress, setCrawlProgress] = useState(0)
  const [successAlert, setSuccessAlert] = useState(null)
  const crawlIntervalRef = useRef(null)
  const alertTimer = useRef(null)
  // DEMO: first completed scan of the session fails; the retry then succeeds.
  const scanHasFailedRef = useRef(false)

  function handleFindingClick(catId, findingId) {
    setJumpTarget({ catId, findingId })
    setActiveTab('scan')
  }

  function handleLaunch(config) {
    setCrawlConfig(config)
    sessionStorage.setItem('sh_hasScan', '1')
    setPhase('crawling')
    setIsCrawling(true)
    setCrawlProgress(0)
  }

  // Re-scan reuses the existing crawl config. Skips the confirm dialog if the
  // user previously ticked "Don't ask again".
  function startRescan() {
    handleLaunch(crawlConfig || {})
  }

  // Retry after a failed scan — re-runs the audit (which then completes).
  function handleRetryScan() {
    startRescan()
  }

  function handleRescanClick() {
    if (rescanDontAsk) startRescan()
    else setShowRescanConfirm(true)
  }

  function confirmRescan() {
    setShowRescanConfirm(false)
    startRescan()
  }

  // Advance progress — keep the updater pure (StrictMode double-invokes it).
  useEffect(() => {
    if (!isCrawling) return
    crawlIntervalRef.current = setInterval(() => {
      setCrawlProgress(p => {
        const step = p < 50 ? 1.6 : p < 80 ? 0.9 : 0.4
        return Math.min(100, p + step)
      })
    }, 80)
    return () => clearInterval(crawlIntervalRef.current)
  }, [isCrawling])

  // Handle completion separately so side effects don't run inside the updater.
  useEffect(() => {
    if (!isCrawling || crawlProgress < 100) return
    clearInterval(crawlIntervalRef.current)
    const t = setTimeout(() => {
      setIsCrawling(false)
      setCrawlProgress(0)
      // First scan of the session errors out; retry lands on the data.
      if (!scanHasFailedRef.current) {
        scanHasFailedRef.current = true
        setPhase('error')
      } else {
        setPhase('ready')
      }
    }, 800)
    return () => clearTimeout(t)
  }, [crawlProgress, isCrawling])

  const crawlPct = Math.min(100, Math.round(crawlProgress))
  const activeStageMsg = [...CRAWL_STAGES].reverse().find(s => crawlProgress >= s.at)?.msg || CRAWL_STAGES[0].msg

  if (phase === 'setup') {
    return <SiteHealthInitialState onLaunch={handleLaunch} />
  }

  const isCrawlingPhase = phase === 'crawling'
  const isErrorPhase    = phase === 'error'
  const isBusyPhase     = isCrawlingPhase || isErrorPhase

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-gray-50">

      {/* Success toast — fixed overlay, auto-dismisses */}
      {successAlert && (
        <div
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-4 py-3 bg-success-50 rounded-lg shadow-lg min-w-[340px] max-w-[560px]"
          style={{ border: '1px solid #16A34A' }}
        >
          <CircleCheck size={15} className="text-success-600 shrink-0" />
          <p className="text-[13px] font-medium text-success-700 flex-1">{successAlert}</p>
          <button
            type="button"
            onClick={() => { setSuccessAlert(null); clearTimeout(alertTimer.current) }}
            className="shrink-0 text-success-500 hover:text-success-700 transition-colors p-0.5"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Sticky page header — never scrolls */}
      <div className="bg-white border-b border-gray-200 px-6 pt-5 pb-0 shrink-0">
        <div className="flex items-start justify-between gap-4 pb-4 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <Globe size={20} className="text-teal-600" />
            </div>
            <div>
              <p className="text-[18px] font-bold text-gray-900">Site health</p>
              <p className="text-[13px] text-gray-500 mt-0.5">Technical SEO, indexing diagnostics, schema gaps, and fix recommendations</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => { sessionStorage.removeItem('sh_hasScan'); scanHasFailedRef.current = false; setPhase('setup'); setIsCrawling(false); setCrawlProgress(0) }}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 bg-white text-[12px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
            >
              Preview initial state
            </button>
            {isCrawlingPhase ? (
              <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-600 text-white text-[13px] font-semibold cursor-default select-none">
                <RefreshCw02 size={13} className="animate-spin" style={{ animationDuration: '1.2s' }} />
                Running audit
              </button>
            ) : (
              <button onClick={handleRescanClick} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold transition-colors">
                <RefreshCw02 size={13} />
                Re-scan site
              </button>
            )}
            <button onClick={() => setShowSettings(true)} className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
              <Settings size={15} />
            </button>
          </div>
        </div>

        {/* Tab nav — dimmed and non-interactive while crawling or on a failed scan */}
        <div className={`flex items-center gap-1 -mx-1 overflow-x-auto transition-opacity ${isBusyPhase ? 'opacity-30 pointer-events-none' : 'opacity-100'}`} style={{ scrollbarWidth: 'none' }}>
          {TABS.map(({ id, label, Icon }) => {
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

      {/* Content: crawling view, failed-scan error, OR dashboard tabs */}
      {isCrawlingPhase ? (
        <CrawlingProgressView progress={crawlPct} message={activeStageMsg} config={crawlConfig} />
      ) : isErrorPhase ? (
        <ScanErrorContent config={crawlConfig} onRetry={handleRetryScan} />
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0 p-5" style={{ scrollbarGutter: 'stable' }}>
          {activeTab === 'overview'   && <OverviewTab onFindingClick={handleFindingClick} onTabSwitch={setActiveTab} onRescan={handleRescanClick} />}
          {activeTab === 'scan'       && <ScanResultsTab jumpTarget={jumpTarget} onJumpConsumed={() => setJumpTarget(null)} />}
          {activeTab === 'crawled'    && <CrawledPagesTab />}
          {activeTab === 'links'      && <FoundLinksTab />}
          {activeTab === 'resources'  && <FoundResourcesTab />}
          {activeTab === 'comparison' && <CrawlComparisonTab />}
        </div>
      )}

      {showSettings && (
        <WebsiteAuditSettingsModal
          onClose={() => setShowSettings(false)}
          onApply={() => {
            if (alertTimer.current) clearTimeout(alertTimer.current)
            setSuccessAlert('Selected website audit settings were successfully applied.')
            alertTimer.current = setTimeout(() => setSuccessAlert(null), 5000)
          }}
        />
      )}

      {showRescanConfirm && (
        <HLModal
          id="rescan-confirm"
          width={560}
          onClose={() => setShowRescanConfirm(false)}
          header={<p id="rescan-confirm-title" className="text-[16px] font-semibold text-gray-900">Launch website audit</p>}
          footer={
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rescanDontAsk}
                  onChange={e => setRescanDontAsk(e.target.checked)}
                  style={{ accentColor: '#155EEF', width: 15, height: 15, cursor: 'pointer' }}
                />
                <span className="text-[13px] text-gray-600">Don't ask again</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRescanConfirm(false)}
                  className="h-9 px-4 rounded-lg border border-gray-300 bg-white text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRescan}
                  className="h-9 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold transition-colors"
                >
                  Launch audit
                </button>
              </div>
            </div>
          }
        >
          <div className="px-4 pt-2 pb-4">
            <p className="text-[14px] text-gray-500 leading-[21px]">
              Are you sure you want to run the audit? This will not impact the scanning frequency. To change the scanning frequency, go to the module's settings.
            </p>
          </div>
        </HLModal>
      )}
    </div>
  )
}
