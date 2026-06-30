import { useState, useRef, useEffect } from 'react'
import {
  Globe, RefreshCw, Download, AlertTriangle, ChevronRight, ChevronDown,
  Link2, Code2, BarChart3, ArrowUp, CircleCheck, X, FileText, Clock,
  ImageIcon, TrendingUp, Award, Check, Star, Calendar, ExternalLink,
  Plus, Search, Zap, LayoutDashboard, Package, Sparkles, Settings,
} from '../../icons/index.js'

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
  { label: 'Notices',  count: 48, prev: 48, color: '#2563EB' },
]

const TOTAL_PAGES   = 1000
const HEALTHY_PAGES = 977
const ISSUE_PAGES   = 23

const FIX_COVERAGE = [
  { label: 'Auto-fix ready',        value: 39, effort: 'Low effort',           color: '#2563EB', accent: '#EFF6FF', effortColor: 'text-success-600'  },
  { label: 'Assisted fix',          value: 11, effort: 'Medium effort',        color: '#7C3AED', accent: '#F5F3FF', effortColor: 'text-warning-600'  },
  { label: 'Recommendation only',   value: 13, effort: 'Manual work required', color: '#D97706', accent: '#FFFBEB', effortColor: 'text-error-600'    },
  { label: 'Fixed from baseline',   value: 25, effort: null,                   color: '#16A34A', accent: '#F0FDF4', effortColor: ''                  },
  { label: 'Fixed since last scan', value: 25, effort: null,                   color: '#0D9488', accent: '#F0FDFA', effortColor: ''                  },
]
const RESOLUTION_PROGRESS = 28

const INDEXABLE     = 977
const NOT_INDEXABLE = 23
const REDIRECTING   = 2
const CANONICALIZED = 1

const CRAWL_KPIS = [
  { label: 'Pages crawled',      value: '1,000', icon: FileText,  iconBg: '#2563EB14', iconColor: '#2563EB' },
  { label: 'Found links',        value: '2,847', icon: Link2,     iconBg: '#7C3AED14', iconColor: '#7C3AED' },
  { label: 'Resources scanned',  value: '156',   icon: ImageIcon, iconBg: '#DC262614', iconColor: '#DC2626' },
  { label: 'Avg response time',  value: '1.2 s', icon: Clock,     iconBg: '#D9770614', iconColor: '#D97706' },
  { label: 'Redirecting pages',  value: '2',     icon: RefreshCw, iconBg: '#0D948814', iconColor: '#0D9488' },
]

const TOP_FINDINGS = [
  { title: 'Missing meta descriptions',   severity: 'high',     pages: 124, impact: 'High impact',   effort: 'Easy fix'   },
  { title: 'Missing LocalBusiness schema',severity: 'critical', pages: 31,  impact: 'High impact',   effort: 'Medium fix' },
  { title: 'Broken internal links',       severity: 'medium',   pages: 34,  impact: 'Medium impact', effort: 'Easy fix'   },
  { title: 'LCP above 4 s threshold',    severity: 'high',     pages: 12,  impact: 'High impact',   effort: 'Hard fix'   },
  { title: 'Pages blocked by robots.txt', severity: 'high',     pages: 6,   impact: 'High impact',   effort: 'Easy fix'   },
]

const HTTP_CODES = [
  { code: '1XX', count: 0,   color: '#9CA3AF' },
  { code: '2XX', count: 977, color: '#16A34A' },
  { code: '3XX', count: 2,   color: '#D97706' },
  { code: '4XX', count: 14,  color: '#DC2626' },
  { code: '5XX', count: 7,   color: '#7C3AED' },
]

const DOMAIN_METRICS = [
  { label: 'Domain trust',      value: '42'           },
  { label: 'Backlinks',         value: '1,284'        },
  { label: 'Referring domains', value: '89'           },
  { label: 'Pages in Google',   value: '142'          },
  { label: 'Domain expiry',     value: 'Dec 15, 2026' },
]

const LINK_ATTRIBUTES = [
  { label: 'Internal dofollow',  count: 1847, color: '#2563EB' },
  { label: 'Internal nofollow',  count: 23,   color: '#60A5FA' },
  { label: 'External dofollow',  count: 412,  color: '#16A34A' },
  { label: 'External nofollow',  count: 156,  color: '#F97316' },
]

const ROBOTS_META = [
  { label: 'Index & follow',    count: 977, color: '#16A34A' },
  { label: 'Noindex & follow',  count: 3,   color: '#D97706' },
  { label: 'Index & nofollow',  count: 0,   color: '#2563EB' },
  { label: 'Noindex & nofollow',count: 14,  color: '#DC2626' },
  { label: 'No robots tag',     count: 6,   color: '#9CA3AF' },
]

const REDIRECT_PROFILE = [
  { label: '0 redirects', count: 998, color: '#2563EB' },
  { label: '1 redirect',  count: 2,   color: '#7C3AED' },
  { label: '2+ redirects',count: 0,   color: '#D97706' },
]

const CORE_WEB_VITALS = [
  { label: 'LCP', value: '4.2 s',  pass: false, threshold: '< 2.5 s' },
  { label: 'CLS', value: '0.08',   pass: true,  threshold: '< 0.1'   },
  { label: 'INP', value: '210 ms', pass: false, threshold: '< 200 ms'},
]

const SEVERITY_STYLE = {
  critical: { bar: '#DC2626', bg: 'bg-error-50',    text: 'text-error-600',   border: 'border-error-200',   label: 'Critical' },
  high:     { bar: '#D97706', bg: 'bg-warning-100', text: 'text-warning-600', border: 'border-warning-200', label: 'High'     },
  medium:   { bar: '#2563EB', bg: 'bg-primary-50',  text: 'text-primary-600', border: 'border-blue-200',    label: 'Medium'   },
  low:      { bar: '#9CA3AF', bg: 'bg-gray-100',    text: 'text-gray-500',    border: 'border-gray-200',    label: 'Low'      },
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${map[color] || map.gray}`}>
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

// ─── Semicircle gauge ────────────────────────────────────────────────────────

function SemicircleGauge({ score, delta }) {
  const noData = score == null
  const color = noData ? '#E5E7EB'
    : score >= 80 ? '#16A34A'
    : score >= 60 ? '#D97706'
    : '#DC2626'
  const pct = noData ? 0 : Math.min(100, Math.max(0, score))

  return (
    <div className="flex flex-col items-center">
      <svg width="100%" viewBox="0 0 180 108" style={{ maxWidth: 180 }} className="overflow-visible">
        {/* Track */}
        <path d="M 12,100 A 78,78 0 0,1 168,100" fill="none" stroke="#F2F4F7" strokeWidth="13" strokeLinecap="round" />
        {/* Filled */}
        {!noData && (
          <path
            d="M 12,100 A 78,78 0 0,1 168,100"
            fill="none" stroke={color} strokeWidth="13" strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${pct} 100`}
          />
        )}
        {/* Score */}
        <text x="90" y="86" textAnchor="middle" fontSize="30" fontWeight="800" fill={noData ? '#D0D5DD' : '#101828'} fontFamily="inherit">
          {noData ? '—' : score}
        </text>
        <text x="90" y="102" textAnchor="middle" fontSize="11" fill="#9CA3AF" fontFamily="inherit">/100</text>
      </svg>
      {/* Legend */}
      <div className="flex items-center justify-center w-full mt-0.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success-600 shrink-0" />
          <span className="text-[12px] text-gray-500">Recommended</span>
          <span className="text-[12px] font-semibold text-gray-800">90+</span>
        </div>
      </div>
      {delta != null && (
        <div className="mt-2 flex items-center gap-1.5">
          <Delta value={delta} />
          <span className="text-[12px] text-gray-400">from previous scan</span>
        </div>
      )}
    </div>
  )
}

// ─── Section 2: Health Summary ───────────────────────────────────────────────

function HealthSummarySection({ compare }) {
  const total = RESULTS_BY_TYPE.reduce((s, r) => s + r.count, 0)
  return (
    <div className="grid grid-cols-3 gap-4 min-w-0">

      {/* Health Score */}
      <SectionCard className="p-4 flex flex-col gap-3 min-w-0 overflow-hidden">
        <p className="text-[13px] font-semibold text-gray-700">Health score</p>
        <SemicircleGauge score={HEALTH.score} delta={compare ? HEALTH.delta : null} />
      </SectionCard>

      {/* Results By Type */}
      <SectionCard className="p-4 flex flex-col gap-3 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-gray-700">Results by type</p>
          <button className="text-[12px] font-medium text-primary-600 hover:underline">View results</button>
        </div>
        {/* Distribution bar */}
        <div className="flex h-2 rounded-full overflow-hidden gap-px">
          {RESULTS_BY_TYPE.map(r => (
            <div key={r.label} style={{ flex: r.count, background: r.color }} />
          ))}
        </div>
        {/* Rows */}
        <div className="flex flex-col gap-2 mt-1">
          {RESULTS_BY_TYPE.map(r => {
            const diff = r.count - r.prev
            return (
              <div key={r.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.color }} />
                  <span className="text-[13px] text-gray-600">{r.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-gray-900">{r.count}</span>
                  {compare && diff !== 0 && (
                    <Delta value={diff} positive={diff < 0} />
                  )}
                  {compare && diff === 0 && (
                    <span className="text-[12px] text-gray-400">—</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>

      {/* Page Health Ratio */}
      <SectionCard className="p-4 flex flex-col gap-3 min-w-0 overflow-hidden">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-gray-700">Page health ratio</p>
          <button className="text-[12px] font-medium text-primary-600 hover:underline">View by pages</button>
        </div>
        <div>
          <p className="text-[28px] font-bold text-gray-900 leading-none">{TOTAL_PAGES.toLocaleString()}</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Total pages</p>
        </div>
        {/* Stacked bar */}
        <div className="flex h-2.5 rounded-full overflow-hidden">
          <div className="bg-success-600" style={{ width: `${(HEALTHY_PAGES / TOTAL_PAGES) * 100}%` }} />
          <div className="bg-error-500" style={{ width: `${(ISSUE_PAGES / TOTAL_PAGES) * 100}%` }} />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-success-600 shrink-0" />
              <span className="text-[13px] text-gray-600">Healthy</span>
            </div>
            <span className="text-[13px] font-semibold text-gray-900">{HEALTHY_PAGES.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-error-600 shrink-0" />
              <span className="text-[13px] text-gray-600">Have errors & warnings</span>
            </div>
            <span className="text-[13px] font-semibold text-error-600">{ISSUE_PAGES}</span>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

// ─── Section 3 & 4: Fix Coverage + Indexability ──────────────────────────────

function FixAndIndexSection() {
  const autoFixed = FIX_COVERAGE.find(f => f.label === 'Fixed since last scan')?.value ?? 0
  const total = FIX_COVERAGE.filter(f => !f.label.startsWith('Fixed')).reduce((s, f) => s + f.value, 0)
  const [autoW, assistW, recW] = FIX_COVERAGE.slice(0, 3).map(f => ((f.value / (total || 1)) * 100).toFixed(1))
  const maxVal = Math.max(...FIX_COVERAGE.map(f => f.value))

  return (
    <div className="grid grid-cols-2 gap-4 min-w-0">

      {/* Fix Coverage — left */}
      <SectionCard className="p-4 flex flex-col gap-4 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[14px] font-semibold text-gray-900">Fix coverage</p>
            <p className="text-[12px] text-gray-400 mt-0.5">A split of what can be auto-fixed, assisted, or manual-only</p>
          </div>
          <button className="shrink-0 text-[12px] font-medium text-primary-600 border border-primary-200 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100 transition-colors">
            Review in scan results
          </button>
        </div>

        {/* Fix stat rows — each with its own progress bar */}
        <div className="flex flex-col divide-y divide-gray-100">
          {FIX_COVERAGE.map(f => (
            <div key={f.label} className="flex items-center gap-3 py-2">
              {/* Label only */}
              <div className="w-44 shrink-0">
                <span className="text-[13px] text-gray-700">{f.label}</span>
              </div>
              {/* Progress bar */}
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(f.value / maxVal) * 100}%`, background: f.color }}
                />
              </div>
              {/* Count */}
              <span className="text-[14px] font-bold text-gray-900 w-8 text-right shrink-0">{f.value}</span>
            </div>
          ))}
        </div>

      </SectionCard>

      {/* Indexability Snapshot — right */}
      <SectionCard className="p-4 flex flex-col gap-4 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[14px] font-semibold text-gray-900">Indexability snapshot</p>
            <p className="text-[12px] text-gray-400 mt-0.5">Discoverability across your crawled pages</p>
          </div>
        </div>

        {/* Stacked bar */}
        <div className="flex h-4 rounded-full overflow-hidden gap-[2px]">
          <div className="rounded-l-full" style={{ background: '#16A34A', width: `${(INDEXABLE / TOTAL_PAGES) * 100}%` }} />
          <div style={{ background: '#DC2626', width: `${((NOT_INDEXABLE - REDIRECTING - CANONICALIZED) / TOTAL_PAGES) * 100}%`, minWidth: NOT_INDEXABLE - REDIRECTING - CANONICALIZED > 0 ? '8px' : 0 }} />
          <div style={{ background: '#D97706', width: `${(REDIRECTING / TOTAL_PAGES) * 100}%`, minWidth: REDIRECTING > 0 ? '8px' : 0 }} />
          <div className="rounded-r-full" style={{ background: '#7C3AED', width: `${(CANONICALIZED / TOTAL_PAGES) * 100}%`, minWidth: CANONICALIZED > 0 ? '8px' : 0 }} />
        </div>

        {/* Stat cards grid */}
        {(() => {
          const stats = [
            { label: 'Indexable',     count: INDEXABLE,                                       color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
            { label: 'Not indexable', count: NOT_INDEXABLE - REDIRECTING - CANONICALIZED,     color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
            { label: 'Redirecting',   count: REDIRECTING,                                     color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
            { label: 'Canonicalized', count: CANONICALIZED,                                   color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
          ]
          return (
            <div className="grid grid-cols-2 gap-2">
              {stats.map(s => (
                <div key={s.label} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border" style={{ background: s.bg, borderColor: s.border }}>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-gray-500 leading-none mb-0.5">{s.label}</p>
                    <p className="text-[18px] font-bold leading-none" style={{ color: s.color }}>{s.count.toLocaleString()}</p>
                  </div>
                  <span className="text-[11px] text-gray-400 shrink-0">{((s.count / TOTAL_PAGES) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )
        })()}

        <button className="text-[12px] font-medium text-primary-600 hover:underline text-left">
          View affected pages →
        </button>
      </SectionCard>
    </div>
  )
}

// ─── Section 5: Crawl Snapshot strip ────────────────────────────────────────

function CrawlSnapshotStrip() {
  return (
    <div className="grid grid-cols-5 gap-3 min-w-0">
      {CRAWL_KPIS.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
        <div key={label} className="border border-gray-200 rounded-lg bg-white p-4 flex items-start justify-between gap-3 min-w-0">
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-[12px] font-medium text-gray-500">{label}</p>
            <p className="text-[24px] font-bold text-gray-900 leading-none">{value}</p>
          </div>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
            <Icon size={16} style={{ color: iconColor }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Section 6: Top Findings ─────────────────────────────────────────────────

function TopFindingsSection() {
  return (
    <SectionCard>
      <div className="p-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[14px] font-semibold text-gray-900">Top findings</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Most impactful issues from this scan — prioritised by severity and page count</p>
        </div>
        <button className="shrink-0 text-[12px] font-medium text-primary-600 hover:underline">Open findings</button>
      </div>

      <div className="px-4 pb-4 flex flex-col gap-1.5">
        {TOP_FINDINGS.map((finding, i) => {
          const sev = SEVERITY_STYLE[finding.severity]
          return (
            <div
              key={i}
              className="flex items-center gap-3 border border-gray-100 rounded-lg px-3 py-2.5 hover:border-gray-200 hover:bg-gray-50/50 transition-all cursor-pointer min-w-0"
            >
              {/* Title */}
              <p className="flex-1 min-w-0 text-[13px] font-medium text-gray-800 truncate">{finding.title}</p>

              {/* Affected pages — single line, regular weight */}
              <span className="shrink-0 text-[13px] text-gray-500 whitespace-nowrap">{finding.pages} pages</span>

              <ChevronRight size={14} className="text-gray-300 shrink-0" />
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}

// ─── Section 7: Technical Diagnostics ───────────────────────────────────────

function DiagRow({ children }) {
  return <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">{children}</div>
}

function DiagLabel({ label }) {
  return <span className="text-[13px] text-gray-600">{label}</span>
}

function HealthBadge({ status }) {
  const map = {
    healthy:  { label: 'Healthy',  bg: '#F0FDF4', color: '#15803D', dot: '#16A34A' },
    warning:  { label: 'Warning',  bg: '#FFFBEB', color: '#B45309', dot: '#D97706' },
    critical: { label: 'Critical', bg: '#FEF2F2', color: '#991B1B', dot: '#DC2626' },
  }
  const s = map[status] || map.healthy
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 8px', borderRadius: 999, background: s.bg, fontSize: 11, fontWeight: 600, color: s.color }}>
      {s.label}
    </span>
  )
}

function HttpStatusCard() {
  const total = HTTP_CODES.reduce((s, c) => s + c.count, 0) || 1
  const errorCount = HTTP_CODES.filter(c => c.code === '4XX' || c.code === '5XX').reduce((s, c) => s + c.count, 0)
  const health = errorCount > 10 ? 'critical' : errorCount > 0 ? 'warning' : 'healthy'
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <HealthBadge status={health} />
      </div>
      <p className="text-[12px] text-gray-500 leading-relaxed">
        {errorCount > 0
          ? `${errorCount} pages returned errors — 4XX responses waste crawl budget, 5XX signal server instability.`
          : 'All pages returning successful responses. No crawl errors detected.'
        }
      </p>
      {HTTP_CODES.map(c => (
        <div key={c.code} className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DiagLabel label={c.code} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-gray-900">{c.count}</span>
              <span className="text-[11px] text-gray-400">{((c.count / total) * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${(c.count / total) * 100}%`, background: c.color }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function DomainMetricsCard() {
  const trust = 42
  const health = trust < 30 ? 'critical' : trust < 50 ? 'warning' : 'healthy'
  const metricHealth = { 'Domain trust': health, 'Domain expiry': 'warning' }
  const dotColor = { healthy: '#16A34A', warning: '#D97706', critical: '#DC2626' }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <HealthBadge status={health} />
      </div>
      <p className="text-[12px] text-gray-500 leading-relaxed">
        Domain trust score {trust} is below the 50+ benchmark. Domain expires Dec 2026 — renew early to avoid ranking drops.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {DOMAIN_METRICS.map(m => {
          const mh = metricHealth[m.label]
          return (
            <div key={m.label} className="border border-gray-100 rounded-lg p-3 bg-gray-50/60">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] text-gray-400 font-medium">{m.label}</p>
              </div>
              <p className="text-[15px] font-bold text-gray-900">{m.value}</p>
              {m.label === 'Domain trust' && (
                <div className="h-1 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${trust}%`, background: dotColor[mh] }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LinkAttributesCard() {
  const totalInternal = LINK_ATTRIBUTES.filter(l => l.label.startsWith('Internal')).reduce((s, l) => s + l.count, 0)
  const totalExternal = LINK_ATTRIBUTES.filter(l => l.label.startsWith('External')).reduce((s, l) => s + l.count, 0)
  const total = totalInternal + totalExternal
  const externalDofollowPct = Math.round((412 / (412 + 156)) * 100)
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <HealthBadge status="healthy" />
      </div>
      <p className="text-[12px] text-gray-500 leading-relaxed">
        Healthy link mix. {externalDofollowPct}% of external links pass equity. Internal nofollow rate is low at {Math.round((23 / totalInternal) * 100)}%.
      </p>
      <div>
        <div className="flex justify-between text-[11px] text-gray-400 mb-1">
          <span>Internal ({totalInternal.toLocaleString()})</span>
          <span>External ({totalExternal.toLocaleString()})</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden">
          {LINK_ATTRIBUTES.map((l, i) => (
            <div
              key={l.label}
              style={{ width: `${(l.count / total) * 100}%`, background: l.color }}
              className={i === 0 ? 'rounded-l-full' : i === LINK_ATTRIBUTES.length - 1 ? 'rounded-r-full' : ''}
            />
          ))}
        </div>
      </div>
      {LINK_ATTRIBUTES.map(l => (
        <div key={l.label} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: l.color }} />
            <DiagLabel label={l.label} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-gray-900">{l.count.toLocaleString()}</span>
            <span className="text-[11px] text-gray-400">{Math.round((l.count / total) * 100)}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function RobotsMetaCard() {
  const total = ROBOTS_META.reduce((s, r) => s + r.count, 0) || 1
  const blocked = ROBOTS_META.filter(r => r.label.toLowerCase().includes('noindex')).reduce((s, r) => s + r.count, 0)
  const health = blocked > 10 ? 'critical' : blocked > 0 ? 'warning' : 'healthy'
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <HealthBadge status={health} />
      </div>
      <p className="text-[12px] text-gray-500 leading-relaxed">
        {blocked > 0
          ? `${blocked} pages are excluded from Google's index. Verify these are intentionally blocked.`
          : 'All pages are configured for indexing. No unexpected blocks detected.'
        }
      </p>
      {ROBOTS_META.map(r => (
        <div key={r.label} className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DiagLabel label={r.label} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold text-gray-900">{r.count}</span>
              <span className="text-[11px] text-gray-400">{((r.count / total) * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(r.count / total) * 100}%`, background: r.color }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function RedirectProfileCard() {
  const total = REDIRECT_PROFILE.reduce((s, r) => s + r.count, 0) || 1
  return (
    <div className="flex flex-col gap-3">
      {REDIRECT_PROFILE.map(r => (
        <div key={r.label} className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <DiagLabel color={r.color} label={r.label} />
            <span className="text-[13px] font-semibold text-gray-900">{r.count}</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(r.count / total) * 100}%`, background: r.color }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function CoreWebVitalsCard() {
  return (
    <div className="flex flex-col gap-2">
      {CORE_WEB_VITALS.map(m => (
        <DiagRow key={m.label}>
          <div className="flex items-center gap-2">
            {m.pass
              ? <CircleCheck size={14} className="text-success-600 shrink-0" />
              : <AlertTriangle size={14} className="text-error-600 shrink-0" />
            }
            <span className="text-[13px] text-gray-700 font-medium">{m.label}</span>
            <span className="text-[11px] text-gray-400">{m.threshold}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-gray-900">{m.value}</span>
          </div>
        </DiagRow>
      ))}
    </div>
  )
}

const DIAG_PANELS = [
  { id: 'http',     label: 'HTTP status codes',  sub: 'Response outcomes across the crawled page set',   Component: HttpStatusCard   },
  { id: 'domain',   label: 'Domain metrics',      sub: 'Competitive context and crawl coverage signals',  Component: DomainMetricsCard },
  { id: 'links',    label: 'Link attributes',     sub: 'Internal and external link mix',                  Component: LinkAttributesCard },
  { id: 'robots',   label: 'Robots meta tags',    sub: 'Robots directive coverage across crawled pages',  Component: RobotsMetaCard    },
  { id: 'redirect', label: 'Redirect profile',    sub: 'URLs resolving directly vs through hops',         Component: RedirectProfileCard },
  { id: 'cwv',      label: 'Core Web Vitals',     sub: 'LCP, CLS, INP — measured across crawled pages',  Component: CoreWebVitalsCard  },
]

function TechnicalDiagnostics() {
  return (
    <SectionCard>
      {/* Section header */}
      <div className="px-4 py-4 border-b border-gray-100">
        <p className="text-[14px] font-semibold text-gray-900">Technical diagnostics</p>
        <p className="text-[12px] text-gray-400 mt-0.5">Lower-priority signals across crawl, links, and performance</p>
      </div>

      {/* 2-column grid of panels — always expanded */}
      <div className="p-4 grid grid-cols-2 gap-3 min-w-0">
        {DIAG_PANELS.map(({ id, label, sub, Component }) => (
          <div key={id} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-[13px] font-semibold text-gray-800">{label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{sub}</p>
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

// ─── Overview Tab ────────────────────────────────────────────────────────────

function OverviewTab() {
  const [compare, setCompare] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [compareIdx, setCompareIdx] = useState(1)
  const currentScan = SCAN_OPTIONS[currentIdx]

  return (
    <div className="flex flex-col gap-4 min-w-0 pb-8">

      {/* Section 1: Scan comparison controls */}
      <div className="border border-gray-200 rounded-lg bg-white px-4 py-3 flex items-center gap-3 flex-wrap min-w-0">
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

        {/* Separator + stats */}
        <div className="w-px h-4 bg-gray-200 shrink-0" />
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-gray-500">Total findings <span className="font-semibold text-gray-700">{currentScan.findings}</span></span>
        </div>
      </div>

      {/* Section 2: Health Summary */}
      <HealthSummarySection compare={compare} />

      {/* Section 3 + 4: Fix Coverage + Indexability */}
      <FixAndIndexSection />

      {/* Section 5: Crawl Snapshot */}
      <CrawlSnapshotStrip />

      {/* Section 6: Top Findings */}
      <TopFindingsSection />

      {/* Section 7: Technical Diagnostics */}
      <TechnicalDiagnostics />
    </div>
  )
}

// ─── Scan Results Tab ────────────────────────────────────────────────────────

const SEV_META = {
  error:   { label: 'Error',   Icon: AlertTriangle, barColor: '#DC2626', bg: 'bg-error-50',    text: 'text-error-600',   border: 'border-error-200'   },
  warning: { label: 'Warning', Icon: AlertTriangle, barColor: '#D97706', bg: 'bg-warning-100', text: 'text-warning-600', border: 'border-warning-200' },
  notice:  { label: 'Notice',  Icon: CircleCheck,   barColor: '#2563EB', bg: 'bg-primary-50',  text: 'text-primary-600', border: 'border-primary-200' },
}

const FIX_META = {
  auto:     { label: 'Auto fix',     Icon: Zap,   bg: 'bg-success-50',  text: 'text-success-700', border: 'border-success-200' },
  assisted: { label: 'Assisted fix', Icon: Check, bg: 'bg-purple-50',   text: 'text-purple-700',  border: 'border-purple-200'  },
  manual:   { label: 'Manual fix',   Icon: null,  bg: 'bg-gray-100',    text: 'text-gray-600',    border: 'border-gray-200'    },
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
          { url: 'https://example.com/agency-pro', current: '/old-agency', recommended: '/agency-pro' },
          { url: 'https://example.com/features', current: '/features-v1', recommended: '/features' },
          { url: 'https://example.com/pricing-old', current: '/pricing-2022', recommended: '/pricing' },
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
      { id: 'c7',  severity: 'notice',  fixType: 'assisted', impact: 'low', totalAffected: 1,
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
      { id: 'el2', severity: 'notice',  fixType: 'manual',   impact: 'low', totalAffected: 1,
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
    <span className={`inline-flex items-center gap-[2px] px-2 h-6 rounded-full border text-[11px] font-semibold ${s.bg} ${s.text} ${s.border}`}>
      <s.Icon size={10} />
      {s.label}
    </span>
  )
}

function FixBadge({ fixType }) {
  const f = FIX_META[fixType]
  if (!f) return null
  return (
    <span className={`inline-flex items-center gap-[2px] px-2 h-6 rounded-full border text-[11px] font-medium ${f.bg} ${f.text} ${f.border}`}>
      {f.Icon && <f.Icon size={10} />}
      {f.label}
    </span>
  )
}

function ImpactBadge({ impact }) {
  const m = IMPACT_META[impact]
  if (!m) return null
  return (
    <span className={`inline-flex items-center gap-[2px] px-2 h-6 rounded-full border text-[11px] font-medium ${m.bg} ${m.text} ${m.border}`}>
      {m.label}
    </span>
  )
}

function FindingCard({ finding, isExpanded, onToggle, isSelected, onSelect, expandedTab, onExpandedTabChange, pageSearch, onPageSearchChange, showAllPages, onToggleShowAll, fixedPages, onFixPage, onFixAll }) {
  const s = SEV_META[finding.severity]
  const autoFixable = finding.fixType === 'auto'
  const assistedFix = finding.fixType === 'assisted'
  const activeTab   = expandedTab || 'recommended'
  const searchTerm  = pageSearch || ''
  const showAll     = showAllPages || false

  const filteredPages    = finding.pages.filter(p => p.url.toLowerCase().includes(searchTerm.toLowerCase()))
  const visiblePages     = filteredPages
  const fixedForFinding  = finding.pages.filter(p => (fixedPages || new Set()).has(`${finding.id}::${p.url}`)).length
  const openCount        = Math.max(0, finding.current - fixedForFinding)
  const impactLabel      = IMPACT_META[finding.impact]?.label || null

  return (
    <div className={`bg-white transition-colors ${isExpanded ? 'bg-gray-50/50' : 'hover:bg-gray-50/60'}`}>

      {/* ── Row: click to expand ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={onToggle}
      >
        {/* Chevron — left side, matches category header */}
        <ChevronRight size={13} className={`text-gray-400 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />

        {/* Checkbox — always visible, enabled only for auto-fix */}
        <div
          className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
            autoFixable
              ? isSelected ? 'bg-purple-600 border-purple-600 cursor-pointer' : 'border-gray-300 hover:border-purple-400 cursor-pointer'
              : 'border-gray-200 bg-gray-50 cursor-not-allowed'
          }`}
          onClick={autoFixable ? e => { e.stopPropagation(); onSelect() } : e => e.stopPropagation()}
        >
          {isSelected && <Check size={9} className="text-white" />}
        </div>

        {/* Title */}
        <p className="flex-1 min-w-0 text-[13px] font-medium text-gray-800 truncate">{finding.title}</p>

        {/* Fix type chip */}
        {autoFixable && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-semibold text-purple-700 shrink-0 whitespace-nowrap">
            <Zap size={9} /> Auto fix
          </span>
        )}
        {assistedFix && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-[11px] font-medium text-gray-600 shrink-0 whitespace-nowrap">
            Assisted fix
          </span>
        )}
        {finding.fixType === 'manual' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-50 border border-gray-200 text-[11px] font-medium text-gray-400 shrink-0 whitespace-nowrap">
            Manual fix
          </span>
        )}

        {/* Right metadata */}
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-[11px] font-semibold ${s.text} hidden sm:inline`}>{s.label}</span>
          {fixedForFinding > 0 && <span className="text-[11px] font-semibold text-success-600">{fixedForFinding} fixed</span>}
          {openCount > 0 && <span className="text-[11px] text-gray-500">{openCount} open</span>}

          {!isExpanded && autoFixable && openCount > 0 && (
            <button
              onClick={e => { e.stopPropagation(); onToggle() }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-semibold transition-colors"
            >
              <Zap size={10} /> Fix
            </button>
          )}
          {!isExpanded && assistedFix && openCount > 0 && (
            <button
              onClick={e => { e.stopPropagation(); onToggle() }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 text-gray-600 bg-white text-[11px] font-medium hover:bg-gray-50 transition-colors"
            >
              Review
            </button>
          )}
        </div>
      </div>

      {/* ── Expanded detail panel ── */}
      {isExpanded && (
        <div className="mx-5 mb-4 border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">

          {/* Panel header — title, description, badges */}
          <div className="px-5 pt-4 pb-3 border-b border-gray-100">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${s.bg}`}>
                <s.Icon size={12} className={s.text} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-[14px] font-semibold text-gray-900">{finding.title}</p>
                  {finding.isNew && <span className="text-[10px] font-semibold text-primary-600 bg-primary-50 border border-primary-100 px-1.5 py-0.5 rounded">New</span>}
                  {finding.isRegression && <span className="text-[10px] font-semibold text-warning-700 bg-warning-100 border border-warning-200 px-1.5 py-0.5 rounded">Regression</span>}
                </div>
                <p className="text-[12px] text-gray-500 leading-relaxed">{finding.description}</p>
              </div>
              {/* Bulk fix in header if auto-fixable */}
              {autoFixable && (
                <button
                  onClick={e => { e.stopPropagation(); onFixAll && onFixAll(finding, openCount) }}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[12px] font-semibold transition-colors whitespace-nowrap"
                >
                  <Zap size={11} /> Fix all {openCount > 0 ? `(${openCount})` : ''}
                </button>
              )}
            </div>
          </div>

          {/* Tab strip */}
          <div className="px-5 flex items-center border-b border-gray-100">
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

          {/* Tab content */}
          <div className="px-5 py-4">
            {activeTab === 'recommended' && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-semibold text-gray-500">
                    Affected pages ({Math.min(visiblePages.length, filteredPages.length)} of {finding.totalAffected} shown)
                  </p>
                  <div className="relative flex items-center">
                    <Search size={12} className="absolute left-2.5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={e => onPageSearchChange(e.target.value)}
                      placeholder="Search URLs..."
                      onClick={e => e.stopPropagation()}
                      className="h-7 pl-7 pr-3 rounded-lg border border-gray-200 bg-white text-[12px] text-gray-700 placeholder:text-gray-400 outline-none focus:border-primary-600 transition-all w-44"
                    />
                  </div>
                </div>
                {/* Scrollable table — max 5 rows visible */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full table-fixed text-left border-collapse">
                    <colgroup>
                      <col style={{ width: '34%' }} /><col style={{ width: '25%' }} /><col style={{ width: '25%' }} /><col style={{ width: '16%' }} />
                    </colgroup>
                    <thead className="sticky top-0 z-10">
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">URL</th>
                        <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">Current state</th>
                        <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">Recommended</th>
                        <th className="px-3 py-2 text-[11px] font-semibold text-gray-500 text-right">Action</th>
                      </tr>
                    </thead>
                  </table>
                  <div className="overflow-y-auto" style={{ maxHeight: '190px' }}>
                    <table className="w-full table-fixed text-left border-collapse">
                      <colgroup>
                        <col style={{ width: '34%' }} /><col style={{ width: '25%' }} /><col style={{ width: '25%' }} /><col style={{ width: '16%' }} />
                      </colgroup>
                      <tbody>
                        {visiblePages.map((page, i) => {
                          const pageKey = `${finding.id}::${page.url}`
                          const isFixed = (fixedPages || new Set()).has(pageKey)
                          return (
                            <tr key={i} className="border-b border-gray-100 last:border-0 transition-colors bg-white hover:bg-gray-50/50">
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-[12px] font-medium truncate text-primary-600">{page.url}</span>
                                  <ExternalLink size={11} className="shrink-0 text-primary-600" />
                                </div>
                              </td>
                              <td className="px-3 py-2.5">
                                <span className={`text-[12px] font-mono ${isFixed ? 'text-gray-400' : 'text-error-700'}`}>{page.current}</span>
                              </td>
                              <td className="px-3 py-2.5">
                                <span className="text-[12px] font-mono text-success-700">{page.recommended}</span>
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                {isFixed ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success-600"><CircleCheck size={11} /> Fixed</span>
                                ) : finding.fixType === 'auto' ? (
                                  <button
                                    onClick={e => { e.stopPropagation(); onFixPage && onFixPage(finding.id, page.url) }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[11px] font-semibold transition-colors"
                                  >
                                    <Zap size={10} /> Fix
                                  </button>
                                ) : finding.fixType === 'assisted' ? (
                                  <button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-purple-200 bg-purple-50 text-purple-700 text-[11px] font-semibold hover:bg-purple-100 transition-colors">
                                    Review
                                  </button>
                                ) : null}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
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
      )}
    </div>
  )
}

function CategorySection({ category, isOpen, onToggleOpen, expandedFindings, onToggle, selectedIds, onSelect, activeSevs, expandedTabs, onExpandedTabChange, pageSearches, onPageSearchChange, showAllPages, onToggleShowAll, fixedPages, onFixPage, onFixAll }) {
  const findings = activeSevs.length === 0 || activeSevs.length === 3
    ? category.findings
    : category.findings.filter(f => activeSevs.includes(f.severity))

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
    <div id={`cat-${category.id}`} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      {/* ── Accordion header — single compact row ── */}
      <button
        onClick={onToggleOpen}
        className="w-full flex items-center gap-3 bg-white border-b border-gray-100 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
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
          {autoCount > 0 && (
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[12px] font-semibold transition-colors whitespace-nowrap">
              <Zap size={11} /> Apply {selectedInCat > 0 ? selectedInCat : autoCount} auto-fix{(selectedInCat > 0 ? selectedInCat : autoCount) !== 1 ? 'es' : ''}
            </button>
          )}
        </div>
      </button>

      {/* ── Findings — only visible when accordion is open ── */}
      {isOpen && (
        <div className="flex flex-col divide-y divide-gray-100">
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
              showAllPages={showAllPages.has(f.id)}
              onToggleShowAll={() => onToggleShowAll(f.id)}
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
                <span className={`text-[11px] font-bold ${isActive ? 'text-primary-500' : 'text-gray-400'}`}>
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

function ScanResultsTab() {
  const [sevFilters,       setSevFilters]       = useState(new Set())
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

  // ── Open confirm dialog for fix-all ──
  function handleFixAll(finding, count, categoryLabel) {
    setConfirmDialog({ finding, count, categoryLabel })
  }

  // ── Confirm fix-all: mark all open pages fixed + toast ──
  function handleConfirmFixAll() {
    const { finding, categoryLabel } = confirmDialog
    const openPages = (finding.pages || []).filter(p => {
      const key = `${finding.id}::${p.url}`
      return !fixedPages.has(key)
    })
    setFixedPages(prev => {
      const n = new Set(prev)
      openPages.forEach(p => n.add(`${finding.id}::${p.url}`))
      return n
    })
    setConfirmDialog(null)
    if (alertTimer.current) clearTimeout(alertTimer.current)
    setSuccessAlert(`${openPages.length} page${openPages.length !== 1 ? 's' : ''} in ${categoryLabel} fixed successfully.`)
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

  // ── Handlers ──
  function toggleSev(key) {
    setSevFilters(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }
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

  const activeSevs = sevFilters.size === 0 ? ['error', 'warning', 'notice'] : [...sevFilters]

  const SEV_FILTERS = [
    { key: 'error',   label: 'Errors',   count: errCount,    at: 'text-error-600',   ab: 'bg-error-50',    abr: 'border-error-300'   },
    { key: 'warning', label: 'Warnings', count: warnCount,   at: 'text-warning-600', ab: 'bg-warning-100', abr: 'border-warning-300' },
    { key: 'notice',  label: 'Notices',  count: noticeCount, at: 'text-primary-600', ab: 'bg-primary-50',  abr: 'border-primary-300' },
  ]

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
          <span className="text-[22px] font-bold text-gray-900 leading-none">{totalOpen}</span>
          <span className="text-[13px] font-medium text-gray-600">open issues</span>
        </div>
        <div className="w-px h-6 bg-gray-100 shrink-0" />
        <div className="flex items-center gap-2">
          <span className="text-[22px] font-bold text-success-600 leading-none">{totalResolved}</span>
          <span className="text-[13px] font-medium text-gray-600">resolved</span>
        </div>
        <div className="w-px h-6 bg-gray-100 shrink-0" />
        <div className="flex items-center gap-2">
          <span className="text-[22px] font-bold text-warning-600 leading-none">{totalSuggested}</span>
          <span className="text-[13px] font-medium text-gray-600">suggested fixes</span>
        </div>
        <div className="ml-auto flex items-center gap-3 flex-wrap min-w-0">
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-error-600">
            <AlertTriangle size={12} /> {errCount} error{errCount !== 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-warning-600">
            <AlertTriangle size={12} /> {warnCount} warning{warnCount !== 1 ? 's' : ''}
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary-600">
            <CircleCheck size={12} /> {noticeCount} notice{noticeCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Severity filters (scrolls with content) ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[12px] font-medium text-gray-500 shrink-0">Filter:</span>
        {SEV_FILTERS.map(({ key, label, count, at, ab, abr }) => {
          const isOn = sevFilters.has(key)
          return (
            <button
              key={key}
              onClick={() => toggleSev(key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-medium transition-all ${
                isOn ? `${ab} ${at} ${abr}` : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {isOn && <Check size={11} />}
              {label}
              <span className={`text-[11px] font-bold ${isOn ? at : 'text-gray-400'}`}>({count})</span>
            </button>
          )
        })}
        {sevFilters.size > 0 && (
          <button onClick={() => setSevFilters(new Set())} className="inline-flex items-center gap-1 text-[12px] text-gray-400 hover:text-gray-600 px-2 py-1.5">
            <X size={11} /> Clear
          </button>
        )}
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
          expandedTabs={expandedTabs}
          onExpandedTabChange={setExpandedTab}
          pageSearches={pageSearches}
          onPageSearchChange={setPageSearch}
          showAllPages={showAllPages}
          onToggleShowAll={toggleShowAll}
          fixedPages={fixedPages}
          onFixPage={handleFixPage}
          onFixAll={handleFixAll}
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
              <p className="text-[15px] font-semibold text-gray-900">Fix all issues?</p>
              <p className="text-[13px] text-gray-500">
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
    findings: [
      { id: 'f1', description: '3XX HTTP status code', detail: 'The homepage is still returning a temporary redirect instead of the canonical 200 response that search engines expect for the primary URL.', currentValue: '302 temporary redirect to https://www.gohighlevel.com/home', aiValue: 'Return 200 OK on the preferred homepage URL and keep the canonical target aligned.', severity: 'Warnings', status: 'Current', fixType: 'Auto Fix' },
      { id: 'f2', description: 'Meta refresh redirect', detail: 'A legacy meta refresh tag was removed from the homepage shell and the redirect behavior is now handled cleanly upstream.', currentValue: 'Meta refresh removed', aiValue: 'Legacy meta refresh removed from the homepage shell', severity: 'Notices', status: 'Fixed', fixType: 'Assisted Fix' },
    ],
  },
  {
    url: 'https://www.gohighlevel.com/pricing', results: { cur: 4, isNew: 2, fix: 1 }, traffic: 7747, httpCode: 200, indexable: true, indexStatus: 'Ok', referring: 6, depth: 1, keywords: 5782,
    findings: [
      { id: 'f3', description: 'Missing meta description', detail: 'The pricing page has no meta description tag, reducing click-through rates from search results.', currentValue: 'No meta description found', aiValue: 'Add a 150–160 character meta description highlighting pricing plans and value.', severity: 'Errors', status: 'Current', fixType: 'Auto Fix' },
      { id: 'f4', description: 'Title tag too long', detail: 'The page title exceeds the recommended 60-character limit and may be truncated in SERPs.', currentValue: '73 characters', aiValue: 'Shorten to under 60 characters', severity: 'Warnings', status: 'Current', fixType: 'Assisted Fix' },
      { id: 'f5', description: 'Multiple H1 tags', detail: 'Two H1 elements were detected on this page, which can confuse search engines about the primary topic.', currentValue: '2 H1 tags found', aiValue: 'Consolidate to a single H1 tag', severity: 'Warnings', status: 'Current', fixType: 'Assisted Fix' },
      { id: 'f6', description: 'Images missing alt text', detail: '3 images on the pricing page are missing descriptive alt attributes.', currentValue: '3 images without alt text', aiValue: 'Add descriptive alt text to all images', severity: 'Notices', status: 'Current', fixType: 'Manual Fix' },
    ],
  },
  {
    url: 'https://www.gohighlevel.com/home', results: { cur: 2, isNew: 0, fix: 1 }, traffic: 3960, httpCode: 301, indexable: false, indexStatus: 'Non-200 Status Code', referring: 2, depth: 2, keywords: 7144,
    findings: [
      { id: 'f7', description: '3XX HTTP status code', detail: 'This URL returns a 301 permanent redirect, which causes crawl budget waste and link equity dilution.', currentValue: '301 permanent redirect', aiValue: 'Consolidate to the canonical homepage URL', severity: 'Warnings', status: 'Current', fixType: 'Auto Fix' },
      { id: 'f8', description: 'Canonical URL mismatch', detail: 'The canonical tag points to a different URL than the actual redirect destination.', currentValue: 'https://www.gohighlevel.com/', aiValue: 'Align canonical with redirect target', severity: 'Notices', status: 'Fixed', fixType: 'Assisted Fix' },
    ],
  },
  {
    url: 'https://www.gohighlevel.com/careers', results: { cur: 3, isNew: 1, fix: 1 }, traffic: 602, httpCode: 200, indexable: true, indexStatus: 'Ok', referring: 96, depth: 3, keywords: 266,
    findings: [
      { id: 'f9',  description: 'Low word count', detail: 'The careers page has fewer than 300 words of visible content, which may limit topical authority.', currentValue: '187 words', aiValue: 'Expand to at least 500 words of relevant content', severity: 'Notices', status: 'Current', fixType: 'Manual Fix' },
      { id: 'f10', description: 'Missing structured data', detail: 'No JobPosting schema markup was found, which would improve visibility in job-specific SERP features.', currentValue: 'No schema markup', aiValue: 'Add JobPosting schema for each open role', severity: 'Warnings', status: 'Current', fixType: 'Assisted Fix' },
      { id: 'f11', description: 'Slow page load time', detail: 'The careers page TTFB exceeds 1.2 seconds, which exceeds Core Web Vitals thresholds.', currentValue: 'TTFB: 1.4s', aiValue: 'Target under 800ms TTFB', severity: 'Notices', status: 'Fixed', fixType: 'Auto Fix' },
    ],
  },
  {
    url: 'https://www.gohighlevel.com/crm', results: { cur: 1, isNew: 0, fix: 0 }, traffic: 545, httpCode: 200, indexable: true, indexStatus: 'Ok', referring: 63, depth: 1, keywords: 309,
    findings: [
      { id: 'f12', description: 'Duplicate title with /features', detail: 'The page title matches another page in this crawl, causing keyword cannibalization risk.', currentValue: '"GoHighLevel CRM Software"', aiValue: 'Differentiate with a unique CRM-specific title', severity: 'Warnings', status: 'Current', fixType: 'Manual Fix' },
    ],
  },
  {
    url: 'https://www.gohighlevel.com/features', results: { cur: 6, isNew: 1, fix: 2 }, traffic: 289, httpCode: 200, indexable: true, indexStatus: 'Ok', referring: 18, depth: 2, keywords: 1204,
    findings: [
      { id: 'f13', description: 'Missing meta description', detail: 'The features page is missing a meta description, which affects CTR in organic search.', currentValue: 'No meta description', aiValue: 'Write a compelling 150-character description', severity: 'Errors', status: 'Current', fixType: 'Auto Fix' },
      { id: 'f14', description: 'Large image file size', detail: 'Hero images total over 2MB and are not optimized for web delivery.', currentValue: '2.3 MB total image weight', aiValue: 'Convert to WebP and compress under 200KB', severity: 'Warnings', status: 'Current', fixType: 'Auto Fix' },
      { id: 'f15', description: 'Render-blocking scripts', detail: '3 JavaScript resources are loaded synchronously in the document head, delaying first contentful paint.', currentValue: '3 blocking scripts in <head>', aiValue: 'Defer non-critical scripts', severity: 'Warnings', status: 'Current', fixType: 'Assisted Fix' },
      { id: 'f16', description: 'No hreflang tags', detail: 'The page serves international users without hreflang annotations, risking incorrect regional targeting.', currentValue: 'No hreflang found', aiValue: 'Add hreflang for en-US and other supported locales', severity: 'Notices', status: 'Current', fixType: 'Manual Fix' },
      { id: 'f17', description: 'Internal links use generic anchor text', detail: '5 internal links use "click here" or "learn more" as anchor text.', currentValue: '5 generic anchors', aiValue: 'Replace with descriptive keyword-rich anchors', severity: 'Notices', status: 'Fixed', fixType: 'Assisted Fix' },
      { id: 'f18', description: 'Missing Open Graph image', detail: 'No og:image tag found; social shares will use a default fallback image.', currentValue: 'No og:image', aiValue: 'Add a 1200×630 og:image for this page', severity: 'Notices', status: 'Fixed', fixType: 'Manual Fix' },
    ],
  },
]

function httpCodeStyle(code) {
  if (code === 200)            return { color: '#16A34A' }
  if (code >= 300 && code < 400) return { color: '#D97706' }
  if (code >= 400 && code < 500) return { color: '#DC2626' }
  return                             { color: '#7C3AED' }
}

const FOUND_LINKS_DATA = [
  { url: 'https://www.gohighlevel.com/',                    type: 'Internal', follow: 'Dofollow', anchor: 'Home',        sources: 5, status: 302 },
  { url: 'https://www.gohighlevel.com/pricing',             type: 'Internal', follow: 'Dofollow', anchor: 'Pricing',     sources: 8, status: 200 },
  { url: 'https://www.gohighlevel.com/blog',                type: 'Internal', follow: 'Dofollow', anchor: 'Blog',        sources: 3, status: 200 },
  { url: 'https://www.gohighlevel.com/careers',             type: 'Internal', follow: 'Dofollow', anchor: 'Careers',     sources: 6, status: 200 },
  { url: 'https://www.gohighlevel.com/crm',                 type: 'Internal', follow: 'Dofollow', anchor: 'CRM',         sources: 4, status: 200 },
  { url: 'https://www.gohighlevel.com/features',            type: 'Internal', follow: 'Dofollow', anchor: 'Features',    sources: 7, status: 200 },
  { url: 'https://twitter.com/GoHighLevel',                 type: 'External', follow: 'Nofollow', anchor: 'Twitter / X', sources: 2, status: 200 },
  { url: 'https://www.facebook.com/gohighlevel',            type: 'External', follow: 'Nofollow', anchor: 'Facebook',    sources: 2, status: 200 },
  { url: 'https://www.linkedin.com/company/gohighlevel',    type: 'External', follow: 'Nofollow', anchor: 'LinkedIn',    sources: 1, status: 200 },
  { url: 'https://www.youtube.com/c/GoHighLevel',           type: 'External', follow: 'Nofollow', anchor: 'YouTube',     sources: 1, status: 200 },
]

const RESOURCE_KPIS_TAB = [
  { label: 'Total resources',    value: '10',       color: '#7C3AED', bg: '#F5F3FF' },
  { label: 'Images',             value: '4',        color: '#2563EB', bg: '#EFF6FF' },
  { label: 'CSS size',           value: '183.9 KB', color: '#60A5FA', bg: '#EFF6FF' },
  { label: 'JS size',            value: '1.4 MB',   color: '#F59E0B', bg: '#FFFBEB' },
  { label: 'Total resource size',value: '3.6 MB',   color: '#0D9488', bg: '#F0FDFA' },
]

const RESOURCE_BREAKDOWN_TAB = [
  { label: 'Images',     size: '4.6 MB',    pct: 75, color: '#7C3AED' },
  { label: 'JavaScript', size: '1.4 MB',    pct: 22, color: '#F59E0B' },
  { label: 'CSS',        size: '183.9 KB',  pct: 3,  color: '#60A5FA' },
]

const RESOURCE_DATA = [
  { url: 'https://images.leadconnectorhq.com/image/f_webp,q_80/hero-banner.webp',                               sources: 3, type: 'IMG', status: 200, size: '385.0 KB', loadTime: '37ms' },
  { url: 'https://images.leadconnectorhq.com/image/f_webp,q_80/partner-logo.webp',                              sources: 2, type: 'IMG', status: 200, size: '385.0 KB', loadTime: '31ms' },
  { url: 'https://ramada.9hf9h.com/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js',             sources: 2, type: 'JS',  status: 200, size: '227.8 KB', loadTime: '9ms'  },
  { url: 'https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.9.0/slick.min.css',                           sources: 1, type: 'CSS', status: 200, size: '0.4 KB',   loadTime: '36ms' },
  { url: 'https://images.leadconnectorhq.com/image/f_webp,q_80/blog-hero.webp',                                 sources: 1, type: 'IMG', status: 200, size: '218.3 KB', loadTime: '24ms' },
  { url: 'https://ramada.9hf9h.com/wp-content/themes/ramada/style.min.css',                                     sources: 3, type: 'CSS', status: 200, size: '98.2 KB',  loadTime: '14ms' },
  { url: 'https://ramada.9hf9h.com/wp-content/themes/ramada/main.min.js',                                       sources: 1, type: 'JS',  status: 200, size: '156.4 KB', loadTime: '18ms' },
  { url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',                           sources: 1, type: 'CSS', status: 200, size: '85.3 KB',  loadTime: '42ms' },
  { url: 'https://images.leadconnectorhq.com/image/f_webp,q_80/team-photo.webp',                                sources: 2, type: 'IMG', status: 200, size: '312.0 KB', loadTime: '28ms' },
  { url: 'https://ramada.9hf9h.com/wp-content/plugins/contact-form-7/includes/js/index.js',                     sources: 1, type: 'JS',  status: 200, size: '12.6 KB',  loadTime: '7ms'  },
]

const COMPARISON_AUDIT = [
  { label: 'Health score',  icon: 'gauge',   v1: '73/100', v2: '71/100', fixed: null,  newCount: 2,    newColor: '#D97706' },
  { label: 'Passed checks', icon: 'check',   v1: 0,        v2: 80,       fixDash: true, newCount: 80,  newColor: '#D97706' },
  { label: 'Errors',        icon: 'error',   v1: 7,        v2: 11,       fixed: 4,     newCount: null, fixColor: '#16A34A' },
  { label: 'Warnings',      icon: 'warning', v1: 4,        v2: 4,        fixed: null,  newCount: null },
  { label: 'Notices',       icon: 'notice',  v1: 3,        v2: 1,        fixDash: true, newCount: 2,   newColor: '#D97706' },
]

const COMPARISON_DOMAIN_METRICS = [
  { metric: 'Domain expiration', v1: '2027-02-02', v2: '2027-02-02', fixed: null, newCount: null },
  { metric: 'Backlinks',         v1: 0,            v2: 0,            fixed: null, newCount: null },
  { metric: 'Domain Trust',      v1: 1,            v2: 0,            fixed: null, newCount: null },
]

const COMPARISON_ISSUE_SECTIONS = [
  {
    category: 'Security & SSL', count: 1,
    issues: [
      { label: 'No HTTPS encryption', icon: 'error', v1: 1, v2: 3, fixed: 2, fixColor: '#16A34A', newCount: null },
    ],
  },
  {
    category: 'Redirects', count: 1,
    issues: [
      { label: 'No WWW redirect', icon: 'warning', v1: 1, v2: 0, fixed: null, newCount: 1, newColor: '#D97706' },
    ],
  },
  {
    category: 'Sitemap health', count: 1,
    issues: [
      { label: 'XML sitemap not found in robots.txt file', icon: 'notice', v1: 1, v2: 1, fixed: null, newCount: null, newColor: '#D97706' },
    ],
  },
  {
    category: 'Meta tags & descriptions', count: 2,
    issues: [
      { label: 'URLs with duplicate page titles', icon: 'error', v1: 2, v2: 5, fixed: 3, fixColor: '#16A34A', newCount: null },
      { label: 'Duplicate description', icon: 'notice', v1: 2, v2: 0, fixed: null, newCount: 2, newColor: '#D97706' },
    ],
  },
  {
    category: 'Content & structure', count: 2,
    issues: [
      { label: 'Duplicate content', icon: 'error', v1: 2, v2: 2, fixed: null, newCount: null, newColor: '#D97706' },
      { label: 'H1 tag missing',    icon: 'warning', v1: 2, v2: 2, fixDash: true, newCount: null, newColor: '#D97706' },
    ],
  },
  {
    category: 'Speed & performance', count: 1,
    issues: [
      { label: 'Largest Contentful Paint (LCP) in a lab environment', icon: 'warning', v1: 1, v2: 2, fixed: 1, fixColor: '#16A34A', newCount: null },
    ],
  },
  {
    category: 'Internal linking', count: 1,
    issues: [
      { label: 'No inbound links', icon: 'error', v1: 2, v2: 1, fixed: null, newCount: 1, newColor: '#D97706' },
    ],
  },
]

// ─── Report controls strip (shared) ─────────────────────────────────────────

function ReportControls({ rightSlot }) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white px-4 py-3 flex items-center gap-3 flex-wrap min-w-0">
      <span className="text-[11px] font-semibold text-gray-400 shrink-0">Current report</span>
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
              <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
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
  { id: 'robots',           label: 'Blocked by robots.txt',  defaultOn: true  },
  { id: 'title',            label: 'Title',                  defaultOn: true  },
  { id: 'titleLen',         label: 'Title length',           defaultOn: true  },
  { id: 'descLen',          label: 'Description length',     defaultOn: true  },
  { id: 'canonical',        label: 'Canonical URL',          defaultOn: true  },
  { id: 'h1',               label: 'H1',                     defaultOn: true  },
  { id: 'h1Len',            label: 'H1 length',              defaultOn: true  },
  { id: 'singleH1',         label: 'Single H1',              defaultOn: true  },
  { id: 'dupH1',            label: 'Duplicate H1',           defaultOn: true  },
  { id: 'h2',               label: 'H2',                     defaultOn: true  },
  { id: 'h2Len',            label: 'H2 length',              defaultOn: true  },
  { id: 'singleH2',         label: 'Single H2',              defaultOn: true  },
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
  { id: 'refreshRedirect',  label: 'Refresh redirect time',  defaultOn: true  },
  { id: 'nofollowDofollow', label: 'Nofollow/Dofollow',      defaultOn: true  },
  { id: 'inlinks',          label: 'Inlinks',                defaultOn: true  },
  { id: 'inlinksDofollow',  label: 'Inlinks dofollow',       defaultOn: true  },
  { id: 'inlinksNofollow',  label: 'Inlinks nofollow',       defaultOn: false },
  { id: 'redirectInlinks',  label: 'Redirect inlinks',       defaultOn: false },
  { id: 'numRedirects',     label: 'Number of redirects',    defaultOn: false },
  { id: 'redirectTarget',   label: 'Redirect target URL',    defaultOn: false },
  { id: 'internalOutlinks', label: 'Internal outlinks',      defaultOn: true  },
  { id: 'externalOutlinks', label: 'External outlinks',      defaultOn: true  },
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

const STRING_OPS = [
  { label: 'Contains',         value: 'contains'    },
  { label: 'Does not contain', value: 'notContains' },
  { label: 'Equals',           value: 'equals'      },
  { label: 'Does not equal',   value: 'notEquals'   },
  { label: 'Starts with',      value: 'startsWith'  },
  { label: 'Ends with',        value: 'endsWith'    },
  { label: 'Is empty',         value: 'isEmpty'     },
  { label: 'Is not empty',     value: 'notEmpty'    },
]

const NUMBER_OPS = [
  { label: '= equals',              value: 'eq'  },
  { label: '≠ does not equal',      value: 'ne'  },
  { label: '> greater than',        value: 'gt'  },
  { label: '≥ greater or equal',    value: 'gte' },
  { label: '< less than',           value: 'lt'  },
  { label: '≤ less or equal',       value: 'lte' },
]

const BOOL_OPS = [
  { label: 'Is true',  value: 'true'  },
  { label: 'Is false', value: 'false' },
]

function getOps(type) {
  if (type === 'number')  return NUMBER_OPS
  if (type === 'boolean') return BOOL_OPS
  return STRING_OPS
}

const NO_VALUE_OPS = new Set(['isEmpty', 'notEmpty', 'true', 'false'])

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

function emptyNestedData() {
  return {
    condition: 'OR',
    rules: [{ condition: 'AND', rules: [{ id: Math.random(), field: '', operator: '', value: '' }] }]
  }
}

function AdvancedFilterDrawer({ isOpen, onClose, activeRules, onApply }) {
  const [presets, setPresets] = useState([
    { label: 'Default', value: 'default', data: emptyNestedData() },
  ])
  const [selectedPreset, setSelectedPreset] = useState('default')
  const [filterData, setFilterData] = useState(emptyNestedData())
  const [isChanged, setIsChanged] = useState(false)
  const [showPresetMenu, setShowPresetMenu] = useState(false)
  const [showSaveAs, setShowSaveAs] = useState(false)
  const [saveAsName, setSaveAsName] = useState('')
  const presetMenuRef = useRef(null)
  const savedPresetRef = useRef('default')

  useEffect(() => {
    if (isOpen) {
      savedPresetRef.current = selectedPreset
      setIsChanged(false)
      setShowPresetMenu(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!showPresetMenu) return
    function handleOutside(e) {
      if (presetMenuRef.current && !presetMenuRef.current.contains(e.target)) setShowPresetMenu(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [showPresetMenu])

  function clone(d) { return JSON.parse(JSON.stringify(d)) }

  function updateRule(groupIdx, ruleIdx, key, val) {
    setFilterData(fd => {
      const d = clone(fd)
      const r = d.rules[groupIdx].rules[ruleIdx]
      if (key === 'field') { r.field = val; r.operator = ''; r.value = '' }
      else r[key] = val
      return d
    })
    setIsChanged(true)
  }

  function removeRule(groupIdx, ruleIdx) {
    setFilterData(fd => {
      const d = clone(fd)
      const group = d.rules[groupIdx]
      if (group.rules.length === 1) {
        d.rules = d.rules.filter((_, gi) => gi !== groupIdx)
        if (!d.rules.length) d.rules = [{ condition: 'AND', rules: [{ id: Math.random(), field: '', operator: '', value: '' }] }]
      } else {
        group.rules = group.rules.filter((_, ri) => ri !== ruleIdx)
      }
      return d
    })
    setIsChanged(true)
  }

  function addNestedRule(groupIdx) {
    setFilterData(fd => {
      const d = clone(fd)
      d.rules[groupIdx].rules.push({ id: Math.random(), field: '', operator: '', value: '' })
      return d
    })
    setIsChanged(true)
  }

  function addOrGroup() {
    setFilterData(fd => {
      const d = clone(fd)
      d.rules.push({ condition: 'AND', rules: [{ id: Math.random(), field: '', operator: '', value: '' }] })
      return d
    })
    setIsChanged(true)
  }

  function clearFilters() {
    setFilterData(emptyNestedData())
    setIsChanged(true)
  }

  function selectPreset(value) {
    const p = presets.find(x => x.value === value)
    if (!p) return
    setSelectedPreset(value)
    setFilterData(clone(p.data))
    setIsChanged(false)
    setShowPresetMenu(false)
  }

  function deletePreset(value, e) {
    e.stopPropagation()
    if (value === 'default') return
    setPresets(ps => ps.filter(p => p.value !== value))
    if (selectedPreset === value) selectPreset('default')
  }

  function handleSave() {
    setPresets(ps => ps.map(p => p.value === selectedPreset ? { ...p, data: clone(filterData) } : p))
    setIsChanged(false)
    applyAndClose()
  }

  function handleSaveAsSubmit() {
    const name = saveAsName.trim()
    if (!name || presets.find(p => p.value === name)) return
    setPresets(ps => [...ps, { label: name, value: name, data: clone(filterData) }])
    setSelectedPreset(name)
    setShowSaveAs(false)
    setSaveAsName('')
    setIsChanged(false)
  }

  function applyAndClose() {
    const flat = filterData.rules.flatMap(g => g.rules).filter(r => r.field && r.operator)
    onApply(flat)
    onClose()
  }

  function handleCancel() {
    selectPreset(savedPresetRef.current)
    setIsChanged(false)
    onClose()
  }

  const hasActiveRules = filterData.rules.some(g => g.rules.some(r => r.field && r.operator))
  const selectedPresetLabel = presets.find(p => p.value === selectedPreset)?.label ?? 'Default'

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex" onClick={handleCancel}>
        <div className="flex-1 bg-gray-900/20" />
        <div
          className="w-[400px] shrink-0 bg-white border-l border-gray-200 flex flex-col h-full"
          style={{ boxShadow: '-4px 0 32px rgba(0,0,0,0.10)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
            <p className="text-[15px] font-semibold text-gray-900">All filters</p>
            <div className="flex items-center gap-3">
              <button
                onClick={clearFilters}
                disabled={!hasActiveRules}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="2" y1="2" x2="22" y2="22" />
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Clear filters
              </button>
              <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Preset selector */}
          <div className="px-5 pt-4 pb-2 shrink-0" ref={presetMenuRef}>
            <div className="relative">
              <button
                onClick={() => setShowPresetMenu(m => !m)}
                className="w-full flex items-center justify-between px-3 py-2.5 border border-primary-400 rounded-lg text-[13px] font-medium text-gray-800 bg-white hover:bg-primary-50/30 transition-colors"
              >
                {selectedPresetLabel}
                <ChevronDown size={13} className={`text-gray-400 transition-transform duration-150 ${showPresetMenu ? 'rotate-180' : ''}`} />
              </button>
              {showPresetMenu && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-card z-10 overflow-hidden">
                  {presets.map(p => (
                    <div
                      key={p.value}
                      onClick={() => selectPreset(p.value)}
                      className={`flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors ${selectedPreset === p.value ? 'bg-primary-50' : ''}`}
                    >
                      <span className={`text-[13px] ${selectedPreset === p.value ? 'text-primary-700 font-medium' : 'text-gray-700'}`}>{p.label}</span>
                      {p.value !== 'default' && (
                        <button
                          onClick={e => deletePreset(p.value, e)}
                          className="w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-error-500 hover:bg-error-50 transition-colors"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filter groups */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col">
            {filterData.rules.map((orGroup, groupIdx) => (
              <div key={groupIdx} className="flex flex-col">
                {/* AND group card */}
                <div className="border border-primary-200 bg-primary-50 rounded-lg p-4 flex flex-col gap-3">
                  {orGroup.rules.map((rule, ruleIdx) => {
                    const col = FILTER_COLS.find(c => c.value === rule.field)
                    const ops = col ? getOps(col.type) : []
                    const needsValue = rule.operator && !NO_VALUE_OPS.has(rule.operator)
                    return (
                      <div key={rule.id ?? ruleIdx} className="flex flex-col gap-2">
                        {/* Field row */}
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1 min-w-0">
                            <select
                              value={rule.field}
                              onChange={e => updateRule(groupIdx, ruleIdx, 'field', e.target.value)}
                              className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 bg-white outline-none focus:border-primary-600 pr-7"
                            >
                              <option value="">Select field</option>
                              {FILTER_COLS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                            <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                          <button
                            onClick={() => removeRule(groupIdx, ruleIdx)}
                            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-gray-300 hover:text-error-500 hover:bg-error-50 transition-colors"
                          >
                            <X size={13} />
                          </button>
                        </div>

                        {/* Operator row */}
                        <div className="relative" style={{ width: '66%' }}>
                          <select
                            value={rule.operator}
                            onChange={e => updateRule(groupIdx, ruleIdx, 'operator', e.target.value)}
                            disabled={!rule.field}
                            className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 bg-white outline-none focus:border-primary-600 pr-7 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <option value="">Filter by</option>
                            {ops.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                          <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Value input */}
                        {needsValue && (
                          <input
                            type={col?.type === 'number' ? 'number' : 'text'}
                            value={rule.value}
                            onChange={e => updateRule(groupIdx, ruleIdx, 'value', e.target.value)}
                            placeholder={col?.type === 'number' ? 'Enter number' : 'Enter value'}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 bg-white outline-none focus:border-primary-600 placeholder:text-gray-400"
                          />
                        )}
                      </div>
                    )
                  })}

                  {/* Separator dots */}
                  <div className="flex justify-center py-0.5">
                    <span style={{ color: '#D0D5DD', fontSize: 18, letterSpacing: 4, lineHeight: 1 }}>···</span>
                  </div>

                  {/* Add nested filter */}
                  <button
                    onClick={() => addNestedRule(groupIdx)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-primary-300 text-[12px] font-medium text-primary-600 hover:bg-primary-100/40 transition-colors"
                  >
                    <Plus size={12} /> Add nested filter
                  </button>
                </div>

                {/* Dashed connector between groups */}
                <div className="flex flex-col items-center py-2">
                  <div style={{ width: 1, height: 16, borderLeft: '2px dashed #D0D5DD' }} />
                </div>
              </div>
            ))}

            {/* Add new OR group */}
            <div className="flex justify-center">
              <button
                onClick={addOrGroup}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <Plus size={13} /> Add filter
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between shrink-0">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setSaveAsName(''); setShowSaveAs(true) }}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Save as
              </button>
              <button
                onClick={handleSave}
                disabled={!isChanged}
                className="px-3 py-2 rounded-lg border border-primary-300 text-[13px] font-medium text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Save
              </button>
              <button
                onClick={applyAndClose}
                className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save As modal */}
      {showSaveAs && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40" onClick={() => setShowSaveAs(false)}>
          <div className="bg-white border border-gray-200 rounded-lg shadow-card w-[340px] p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <p className="text-[15px] font-semibold text-gray-900">Save filter as</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-gray-700">Filter name</label>
              <input
                autoFocus
                value={saveAsName}
                onChange={e => setSaveAsName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveAsSubmit()}
                placeholder="Enter a name"
                className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 outline-none focus:border-primary-600 placeholder:text-gray-400"
              />
              {saveAsName && presets.find(p => p.value === saveAsName) && (
                <p className="text-[12px] text-error-600">A filter with this name already exists.</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowSaveAs(false)} className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button
                onClick={handleSaveAsSubmit}
                disabled={!saveAsName.trim() || !!presets.find(p => p.value === saveAsName)}
                className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
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

function CrawledPagesTab() {
  const [filter, setFilter]               = useState('all')
  const [selected, setSelected]           = useState([])
  const [showColumns, setShowColumns]     = useState(false)
  const [colSearch, setColSearch]         = useState('')
  const [showFilterDrawer, setShowFilterDrawer] = useState(false)
  const [activeRules, setActiveRules]     = useState([])
  const [visibleCols, setVisibleCols]     = useState(DEFAULT_VISIBLE_COLS)
  const [expandedRow, setExpandedRow]     = useState(null)
  const [selectedFindings, setSelectedFindings] = useState({})
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [pluginDownloaded, setPluginDownloaded] = useState(false)
  const [apiToken, setApiToken]           = useState('')

  const totalSelectedFindings = Object.values(selectedFindings).flat().length

  function toggleFinding(pageUrl, findingId) {
    setSelectedFindings(prev => {
      const cur = prev[pageUrl] || []
      const next = cur.includes(findingId) ? cur.filter(id => id !== findingId) : [...cur, findingId]
      return { ...prev, [pageUrl]: next }
    })
  }

  const filteredData = activeRules.length
    ? CRAWLED_PAGE_DATA.filter(row => activeRules.every(rule => applyFilterRule(row, rule)))
    : CRAWLED_PAGE_DATA

  const FILTERS = [
    { id: 'all',      label: 'All',      count: 18 },
    { id: 'errors',   label: 'Errors',   count: 1  },
    { id: 'warnings', label: 'Warnings', count: 6  },
    { id: 'notices',  label: 'Notices',  count: 11 },
  ]

  const toggleCol = id => setVisibleCols(v => ({ ...v, [id]: !v[id] }))
  const toggleRow = url => setSelected(s => s.includes(url) ? s.filter(u => u !== url) : [...s, url])
  const allSel    = selected.length === CRAWLED_PAGE_DATA.length
  const toggleAll = () => setSelected(allSel ? [] : CRAWLED_PAGE_DATA.map(p => p.url))

  return (
    <div className="flex flex-col gap-4 min-w-0 pb-8">
      <ReportControls
        rightSlot={
          <span className="text-[12px] text-gray-500">Pages crawled <span className="font-semibold text-gray-700">3/3</span></span>
        }
      />

      {/* Filter + action bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center h-8 gap-1 pl-3 pr-1.5 rounded-full border border-gray-300 bg-white text-[13px] font-medium text-gray-700">
          Status
          <span className="mx-1 inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-[12px] font-medium text-gray-600">All</span>
          <button className="w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={11} />
          </button>
        </span>

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
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary-600 text-white text-[10px] font-bold">
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
          <div className="relative">
            {/* Column count trigger */}
            <button
              onClick={() => { setShowColumns(c => !c); setColSearch('') }}
              className="h-8 inline-flex items-center gap-1.5 px-3 text-[13px] font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <LayoutDashboard size={13} />
              {Object.values(visibleCols).filter(Boolean).length + 1}/{ALL_COLS.length + 1} Columns
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

                {/* Count + select all */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                  <span className="text-[12px] text-gray-500">{Object.values(visibleCols).filter(Boolean).length + 1} fields selected</span>
                  <button
                    onClick={() => setVisibleCols(Object.fromEntries(ALL_COLS.map(c => [c.id, true])))}
                    className="text-[12px] font-semibold text-primary-600 hover:underline"
                  >
                    Select all ({ALL_COLS.length + 1})
                  </button>
                </div>

                {/* Column list — 12 rows visible, scrolls for the rest */}
                <div className="overflow-y-auto" style={{ maxHeight: 12 * 34 }}>
                  {/* URL — always visible, frozen */}
                  <div className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors" style={{ height: 34 }}>
                    <span className="text-gray-200 select-none text-[14px] shrink-0">⠿</span>
                    <input type="checkbox" checked disabled style={{ accentColor: '#155EEF', width: 14, height: 14, flexShrink: 0 }} />
                    <span className="text-[13px] text-gray-700 flex-1">URL</span>
                  </div>

                  {/* All columns — flat list */}
                  {ALL_COLS
                    .filter(c => !colSearch || c.label.toLowerCase().includes(colSearch.toLowerCase()))
                    .map(col => (
                      <div key={col.id} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors cursor-pointer" style={{ height: 34 }} onClick={() => toggleCol(col.id)}>
                        <span className="text-gray-300 select-none text-[14px] shrink-0">⠿</span>
                        <input
                          type="checkbox"
                          checked={!!visibleCols[col.id]}
                          onChange={() => toggleCol(col.id)}
                          onClick={e => e.stopPropagation()}
                          style={{ accentColor: '#155EEF', width: 14, height: 14, flexShrink: 0 }}
                        />
                        <span className="text-[13px] text-gray-700 flex-1">{col.label}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => totalSelectedFindings > 0 && setShowConnectModal(true)}
            className={`h-8 inline-flex items-center gap-1.5 px-3 text-[13px] font-semibold rounded-lg transition-colors ${
              totalSelectedFindings > 0
                ? 'bg-primary-600 hover:bg-primary-700 text-white border border-primary-600 cursor-pointer'
                : 'border border-gray-200 bg-white text-gray-300 cursor-not-allowed'
            }`}
          >
            <Zap size={13} />
            {totalSelectedFindings > 0 ? 'Connect WordPress to implement the changes' : 'Apply changes'}
          </button>
        </div>
      </div>

      <SectionCard className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={allSel} onChange={toggleAll} style={{ accentColor: '#155EEF', width: 15, height: 15 }} />
              </th>
              <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap min-w-[300px]">Page URL</th>
              {visibleCols.results     && <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Results</th>}
              {visibleCols.traffic     && <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Total traffic</th>}
              {visibleCols.httpCode    && <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">HTTP status</th>}
              {visibleCols.indexable   && <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Indexable</th>}
              {visibleCols.indexStatus && <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap min-w-[160px]">Indexability status</th>}
              {visibleCols.referring   && <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Referring pages</th>}
              {visibleCols.depth       && <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Depth</th>}
              {visibleCols.keywords    && <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Keywords</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.map(page => {
              const isSel = selected.includes(page.url)
              const isExpanded = expandedRow === page.url
              const codeStyle = httpCodeStyle(page.httpCode)
              const pageSel = selectedFindings[page.url] || []
              const colSpanCount = 2 + Object.values(visibleCols).filter(Boolean).length

              function severityStyle(sev) {
                if (sev === 'Errors')   return { bg: '#FEF2F2', border: '#FECACA', color: '#DC2626', Icon: AlertTriangle }
                if (sev === 'Warnings') return { bg: '#FFFBEB', border: '#FDE68A', color: '#D97706', Icon: AlertTriangle }
                return                         { bg: '#EFF6FF', border: '#BFDBFE', color: '#2563EB', Icon: CircleCheck  }
              }

              return (
                <>
                  <tr key={page.url} className={`border-b border-gray-50 transition-colors hover:bg-gray-50/40 ${isSel ? 'bg-primary-50/30' : ''} ${isExpanded ? 'border-b-0' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={isSel} onChange={() => toggleRow(page.url)} style={{ accentColor: '#155EEF', width: 15, height: 15 }} />
                    </td>
                    <td className="px-4 py-3">
                      <a href="#" className="text-[13px] font-medium text-primary-600 hover:underline truncate block max-w-[380px]">{page.url}</a>
                    </td>
                    {visibleCols.results && (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setExpandedRow(isExpanded ? null : page.url)}
                          className="inline-flex items-center gap-2 group"
                        >
                          <div className="flex flex-col items-start">
                            <span className="text-[15px] font-bold text-gray-900 leading-none">{page.results.cur}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] font-medium text-primary-600">Cur {page.results.cur}</span>
                              <span className="text-gray-200">·</span>
                              <span className="text-[11px] font-medium text-warning-600">New {page.results.isNew}</span>
                              <span className="text-gray-200">·</span>
                              <span className="text-[11px] font-medium text-success-600">Fix {page.results.fix}</span>
                            </div>
                          </div>
                          <ChevronRight size={13} className={`text-gray-300 group-hover:text-gray-500 transition-all duration-150 ${isExpanded ? 'rotate-90 text-gray-500' : ''}`} />
                        </button>
                      </td>
                    )}
                    {visibleCols.traffic     && <td className="px-4 py-3 text-[13px] font-medium text-gray-800">{page.traffic.toLocaleString()}</td>}
                    {visibleCols.httpCode    && <td className="px-4 py-3"><span className="text-[13px] font-semibold" style={{ color: codeStyle.color }}>{page.httpCode}</span></td>}
                    {visibleCols.indexable   && (
                      <td className="px-4 py-3">
                        {page.indexable
                          ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-success-50 border-success-200 text-[11px] font-semibold text-success-700"><CircleCheck size={10} /> Indexable</span>
                          : <span className="text-[13px] text-gray-400 font-medium">— No</span>
                        }
                      </td>
                    )}
                    {visibleCols.indexStatus && (
                      <td className="px-4 py-3">
                        <span className={`text-[12px] font-semibold ${page.indexStatus === 'Ok' ? 'text-success-600' : 'text-warning-600'}`}>{page.indexStatus}</span>
                      </td>
                    )}
                    {visibleCols.referring   && <td className="px-4 py-3 text-[13px] text-gray-800">{page.referring}</td>}
                    {visibleCols.depth       && <td className="px-4 py-3 text-[13px] text-gray-800">{page.depth}</td>}
                    {visibleCols.keywords    && <td className="px-4 py-3 text-[13px] text-gray-800">{page.keywords.toLocaleString()}</td>}
                  </tr>

                  {isExpanded && (
                    <tr key={`${page.url}-exp`} className="border-b border-gray-100">
                      <td colSpan={colSpanCount} className="px-0 py-0">
                        <div className="border-t border-gray-100 bg-gray-50/60">
                          <table className="w-full border-collapse text-left">
                            <thead>
                              <tr className="border-b border-gray-200 bg-gray-100/80">
                                <th className="pl-14 pr-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-10">Select to fix</th>
                                <th className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-40">Severity</th>
                                <th className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide w-36">Status</th>
                                <th className="px-4 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {page.findings.map(finding => {
                                const sev = severityStyle(finding.severity)
                                const isFixed = finding.status === 'Fixed'
                                const isFindingSel = pageSel.includes(finding.id)
                                return (
                                  <tr key={finding.id} className="border-b border-gray-100 last:border-0 hover:bg-white/60 transition-colors">
                                    <td className="pl-14 pr-4 py-3">
                                      <input
                                        type="checkbox"
                                        checked={isFindingSel}
                                        onChange={() => toggleFinding(page.url, finding.id)}
                                        style={{ accentColor: '#155EEF', width: 14, height: 14 }}
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold" style={{ background: sev.bg, borderColor: sev.border, color: sev.color }}>
                                        <sev.Icon size={10} />
                                        {finding.severity}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className={`text-[12px] font-semibold ${isFixed ? 'text-success-600' : 'text-warning-600'}`}>{finding.status}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                      <p className="text-[13px] font-semibold text-gray-800">{finding.description}</p>
                                      <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${
                                        finding.fixType === 'Auto Fix'
                                          ? 'bg-success-50 border-success-200 text-success-700'
                                          : finding.fixType === 'Assisted Fix'
                                          ? 'bg-warning-100 border-warning-300 text-warning-700'
                                          : 'bg-gray-50 border-gray-200 text-gray-500'
                                      }`}>{finding.fixType}</span>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
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
      </SectionCard>

      <AdvancedFilterDrawer
        isOpen={showFilterDrawer}
        onClose={() => setShowFilterDrawer(false)}
        activeRules={activeRules}
        onApply={setActiveRules}
      />

      {/* Connect WordPress modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4" onClick={() => setShowConnectModal(false)}>
          <div className="bg-white rounded-xl shadow-card w-full max-w-[600px] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-start gap-4 px-6 pt-6 pb-5 border-b border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                <Globe size={18} className="text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-gray-900">Connect WordPress to implement SEO fixes</p>
                <p className="text-[13px] text-gray-500 mt-1">Install the Visibility AI SEO plugin, copy the API token from WordPress, then connect it here.</p>
              </div>
              <button onClick={() => setShowConnectModal(false)} className="text-gray-400 hover:text-gray-600 shrink-0 transition-colors"><X size={18} /></button>
            </div>

            {/* Steps */}
            <div className="px-6 pt-5 pb-4 grid grid-cols-3 gap-4">
              {/* Step 1 */}
              <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Download size={16} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-900 mb-1">1. Download plugin</p>
                  <p className="text-[12px] text-gray-500 leading-relaxed">Download the Visibility AI SEO plugin package for your WordPress site.</p>
                </div>
                <button
                  onClick={() => setPluginDownloaded(true)}
                  className="mt-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[12px] font-semibold transition-colors"
                >
                  <Download size={12} /> Download plugin
                </button>
              </div>

              {/* Step 2 */}
              <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Plus size={16} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-900 mb-1">2. Install in WordPress</p>
                  <p className="text-[12px] text-gray-500 leading-relaxed">Open WordPress admin, go to Plugins, Add New, Upload Plugin, then activate it.</p>
                </div>
                <div className={`mt-auto inline-flex items-center justify-center px-3 py-2 rounded-lg text-[12px] font-semibold border transition-colors ${
                  pluginDownloaded
                    ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-700 cursor-pointer'
                    : 'bg-warning-100 text-warning-700 border-warning-300 cursor-default'
                }`}>
                  {pluginDownloaded ? 'Open WordPress admin →' : 'Download the plugin first'}
                </div>
              </div>

              {/* Step 3 */}
              <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
                <div className="w-9 h-9 rounded-lg bg-success-50 flex items-center justify-center">
                  <ExternalLink size={16} className="text-success-600" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-900 mb-1">3. Copy API token</p>
                  <p className="text-[12px] text-gray-500 leading-relaxed">Open the plugin settings page in WordPress and copy the API token shown there.</p>
                </div>
                <button className="mt-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[12px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                  <ExternalLink size={12} /> Open token settings
                </button>
              </div>
            </div>

            {/* Token input */}
            <div className="mx-6 mb-5 border border-gray-200 rounded-lg p-4">
              <p className="text-[13px] font-semibold text-gray-900 mb-1">WordPress plugin API token</p>
              <p className="text-[12px] text-gray-500 mb-3">Paste the token from <span className="text-primary-600">https://ramada.9hf9h.com/wp-admin/options-general.php?page=visibility-ai-seo</span>. The token is used only to complete this connection flow.</p>
              <input
                value={apiToken}
                onChange={e => setApiToken(e.target.value)}
                placeholder="Paste the token from your plugin settings page"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-gray-800 outline-none focus:border-primary-600 placeholder:text-gray-400 bg-white"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 shrink-0">
              <button onClick={() => setShowConnectModal(false)} className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button
                disabled={!apiToken.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CircleCheck size={14} /> Connect WordPress to implement the changes
              </button>
            </div>
          </div>
        </div>
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
  { id: 'nofollow',       label: 'Nofollow/Dofollow', defaultOn: false },
  { id: 'sourceNoindex',  label: 'Source noindex',  defaultOn: false },
  { id: 'linkScope',      label: 'Link scope',      defaultOn: false },
]

function FoundLinksTab() {
  const [filter, setFilter]       = useState('all')
  const [showColumns, setShowColumns] = useState(false)
  const [colSearch, setColSearch]   = useState('')
  const [linkCols, setLinkCols]     = useState(
    Object.fromEntries(FOUND_LINKS_COLS.map(c => [c.id, c.defaultOn]))
  )

  const internalCount = FOUND_LINKS_DATA.filter(l => l.type === 'Internal').length
  const externalCount = FOUND_LINKS_DATA.filter(l => l.type === 'External').length

  const FILTERS = [
    { id: 'all',      label: 'All',      count: FOUND_LINKS_DATA.length },
    { id: 'internal', label: 'Internal', count: internalCount           },
    { id: 'external', label: 'External', count: externalCount           },
  ]

  const filtered = filter === 'all'      ? FOUND_LINKS_DATA
    : filter === 'internal' ? FOUND_LINKS_DATA.filter(l => l.type === 'Internal')
    : FOUND_LINKS_DATA.filter(l => l.type === 'External')

  const toggleLinkCol = id => setLinkCols(v => ({ ...v, [id]: !v[id] }))

  return (
    <div className="flex flex-col gap-4 min-w-0 pb-8">
      <ReportControls
        rightSlot={
          <div className="flex items-center gap-3 text-[12px] text-gray-500">
            <span>Found links <span className="font-semibold text-gray-700">{FOUND_LINKS_DATA.length.toLocaleString()}</span></span>
            <span className="text-gray-200">·</span>
            <span>Unique URLs <span className="font-semibold text-gray-700">{FOUND_LINKS_DATA.length}</span></span>
          </div>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total links',    value: '2,847', color: '#7C3AED', bg: '#F5F3FF', Icon: Link2       },
          { label: 'Internal links', value: '1,870', color: '#2563EB', bg: '#EFF6FF', Icon: Link2       },
          { label: 'External links', value: '977',   color: '#16A34A', bg: '#F0FDF4', Icon: ExternalLink },
          { label: 'Nofollow links', value: '179',   color: '#D97706', bg: '#FFFBEB', Icon: AlertTriangle},
        ].map(k => (
          <div key={k.label} className="border border-gray-200 rounded-lg bg-white p-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] text-gray-500 mb-1.5">{k.label}</p>
              <p className="text-[24px] font-bold text-gray-900 leading-none">{k.value}</p>
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: k.bg }}>
              <k.Icon size={15} style={{ color: k.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter + info bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[13px] font-medium transition-colors border ${
                filter === f.id
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {f.label}
              <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[11px] font-bold px-1 ${
                filter === f.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>{f.count}</span>
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 text-[12px] text-gray-400">
          <span>{filtered.length} links in view</span>
          <span>·</span>
          <span>{internalCount} internal · {externalCount} external</span>
        </div>
        <div className="relative">
          <button
            onClick={() => { setShowColumns(c => !c); setColSearch('') }}
            className="h-8 inline-flex items-center gap-1.5 px-3 text-[13px] font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LayoutDashboard size={13} /> Columns
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
              {linkCols.destinationUrl && <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 min-w-[300px] whitespace-nowrap">Destination URL</th>}
              {linkCols.statusCode     && <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Status code</th>}
              {linkCols.linkType       && <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Link type</th>}
              {linkCols.sourceUrl      && <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 min-w-[240px] whitespace-nowrap">Source URL</th>}
              {linkCols.anchorText     && <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Anchor text</th>}
              {linkCols.anchorType     && <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Anchor type</th>}
              {linkCols.context        && <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Context</th>}
              {linkCols.title          && <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Title</th>}
              {linkCols.alt            && <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Alt</th>}
              {linkCols.nofollow       && <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Nofollow/Dofollow</th>}
              {linkCols.sourceNoindex  && <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Source noindex</th>}
              {linkCols.linkScope      && <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Link scope</th>}
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
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold ${link.type === 'Internal' ? 'bg-primary-50 text-primary-700 border-blue-200' : 'bg-success-50 text-success-700 border-success-200'}`}>{link.type}</span>
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
                {linkCols.nofollow       && <td className="px-4 py-3"><span className={`text-[12px] font-semibold ${link.follow === 'Dofollow' ? 'text-success-600' : 'text-warning-600'}`}>{link.follow === 'Dofollow' ? 'DF' : 'NF'}</span></td>}
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

// ─── Found Resources Tab ─────────────────────────────────────────────────────

function FoundResourcesTab() {
  const [filter, setFilter] = useState('all')

  const FILTERS = [
    { id: 'all', label: 'All',        count: RESOURCE_DATA.length },
    { id: 'IMG', label: 'Image',      count: RESOURCE_DATA.filter(r => r.type === 'IMG').length },
    { id: 'CSS', label: 'CSS',        count: RESOURCE_DATA.filter(r => r.type === 'CSS').length },
    { id: 'JS',  label: 'JavaScript', count: RESOURCE_DATA.filter(r => r.type === 'JS').length  },
  ]

  const filtered = filter === 'all' ? RESOURCE_DATA : RESOURCE_DATA.filter(r => r.type === filter)

  const TYPE_STYLE = {
    IMG: { bg: '#EFF6FF', color: '#2563EB' },
    JS:  { bg: '#FFFBEB', color: '#D97706' },
    CSS: { bg: '#EFF6FF', color: '#60A5FA' },
  }

  return (
    <div className="flex flex-col gap-4 min-w-0 pb-8">
      <ReportControls
        rightSlot={
          <div className="flex items-center gap-3 text-[12px] text-gray-500">
            <span><span className="font-semibold text-gray-700">10</span> grouped resources</span>
            <span className="text-gray-200">·</span>
            <span><span className="font-semibold text-gray-700">14</span> source occurrences</span>
          </div>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-5 gap-3">
        {RESOURCE_KPIS_TAB.map(k => (
          <div key={k.label} className="border border-gray-200 rounded-lg bg-white p-4 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[12px] text-gray-500 mb-1.5 leading-tight">{k.label}</p>
              <p className="text-[20px] font-bold text-gray-900 leading-none">{k.value}</p>
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: k.bg }}>
              <FileText size={14} style={{ color: k.color }} />
            </div>
          </div>
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
        <span className="inline-flex items-center h-8 gap-1 pl-3 pr-1.5 rounded-full border border-gray-300 bg-white text-[13px] font-medium text-gray-700">
          Status
          <span className="mx-1 inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-[12px] font-medium text-gray-600">All</span>
          <button className="w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X size={11} />
          </button>
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button className="h-8 inline-flex items-center gap-1.5 px-3 text-[13px] font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
            <LayoutDashboard size={13} /> Columns
          </button>
        </div>
      </div>

      <SectionCard className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 min-w-[380px]">URL</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Source URLs</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Type</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Status code</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Size</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 whitespace-nowrap">Loading time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => {
              const ts = TYPE_STYLE[r.type] || { bg: '#F2F4F7', color: '#667085' }
              return (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors">
                  <td className="px-4 py-3">
                    <a href="#" className="text-[13px] font-medium text-primary-600 hover:underline truncate block max-w-[460px]">{r.url}</a>
                  </td>
                  <td className="px-4 py-3">
                    <button className="inline-flex items-center gap-1 text-[13px] text-gray-700 border border-gray-200 rounded-lg px-2 py-0.5 hover:bg-gray-50 transition-colors">
                      {r.sources} <ChevronDown size={11} className="text-gray-400" />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-semibold" style={{ background: ts.bg, color: ts.color, borderColor: ts.bg }}>
                      {r.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-semibold" style={{ color: httpCodeStyle(r.status).color }}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-[13px] font-medium text-gray-700">{r.size}</td>
                  <td className="px-4 py-3 text-[13px] text-gray-500">{r.loadTime}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </SectionCard>
    </div>
  )
}

// ─── Crawl Comparison Tab ─────────────────────────────────────────────────────

function CrawlComparisonTab() {
  const [showOnlyDiffs, setShowOnlyDiffs] = useState(false)

  const DATE1 = '2026-06-30 06:52:29'
  const DATE2 = '2026-06-30 06:51:45'

  const TH_CLS = 'px-5 py-3 text-[12px] font-semibold text-gray-500 border-b border-gray-100 bg-gray-50/60 whitespace-nowrap text-left'
  const TD_CLS = 'px-5 py-3.5 text-[13px] border-b border-gray-50 last:border-0'

  function rowIcon(icon) {
    if (icon === 'error')   return <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-error-300 bg-error-50"><AlertTriangle size={10} className="text-error-600" /></span>
    if (icon === 'warning') return <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-warning-300 bg-warning-50"><AlertTriangle size={10} className="text-warning-600" /></span>
    if (icon === 'notice')  return <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-primary-200 bg-primary-50"><CircleCheck size={10} className="text-primary-600" /></span>
    if (icon === 'check')   return <CircleCheck size={14} className="text-success-600 shrink-0" />
    if (icon === 'pages')   return <FileText size={14} className="text-gray-400 shrink-0" />
    return <BarChart3 size={14} className="text-gray-400 shrink-0" />
  }

  function renderFixed(row) {
    if (row.fixDash) return <span className="text-[13px] font-semibold" style={{ color: '#16A34A' }}>—</span>
    if (row.fixed != null) return <span className="text-[13px] font-semibold" style={{ color: row.fixColor || '#16A34A' }}>{row.fixed}</span>
    return <span className="text-[13px] text-gray-300">—</span>
  }

  function renderNew(row) {
    if (row.newCount != null) return <span className="text-[13px] font-semibold" style={{ color: row.newColor || '#D97706' }}>{row.newCount}</span>
    if (row.newColor) return <span className="text-[13px] font-semibold" style={{ color: row.newColor }}>—</span>
    return <span className="text-[13px] text-gray-300">—</span>
  }

  return (
    <div className="flex flex-col gap-4 min-w-0 pb-8">
      {/* Date selectors + toggle */}
      <div className="border border-gray-200 rounded-lg bg-white px-5 py-4 flex items-end gap-4 flex-wrap">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">First audit date</p>
          <div className="relative">
            <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select className="appearance-none w-full h-9 text-[13px] font-medium text-gray-800 border border-gray-200 rounded-lg pl-8 pr-7 bg-white outline-none cursor-pointer hover:border-gray-300 focus:border-primary-600 transition-colors">
              <option>{DATE1}</option>
              <option>2026-06-17 06:52:27</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Second audit date</p>
          <div className="relative">
            <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select className="appearance-none w-full h-9 text-[13px] font-medium text-gray-800 border border-gray-200 rounded-lg pl-8 pr-7 bg-white outline-none cursor-pointer hover:border-gray-300 focus:border-primary-600 transition-colors">
              <option>{DATE2}</option>
              <option>2026-06-17 06:51:18</option>
            </select>
            <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 self-end">
          <div>
            <p className="text-[13px] font-medium text-gray-800">Show only differences</p>
            <p className="text-[11px] text-gray-400">Hide unchanged rows across the comparison matrix.</p>
          </div>
          <button
            onClick={() => setShowOnlyDiffs(d => !d)}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${showOnlyDiffs ? 'bg-primary-600' : 'bg-gray-200'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${showOnlyDiffs ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Info pills */}
      <div className="flex items-center gap-2">
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
              <th className={TH_CLS + ' text-success-600'}>Fixed</th>
              <th className={TH_CLS + ' text-warning-600'}>New</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_AUDIT.map(row => (
              <tr key={row.label} className="hover:bg-gray-50/40 transition-colors">
                <td className={TD_CLS}>
                  <div className="flex items-center gap-2">
                    {rowIcon(row.icon)}
                    <span className="text-[13px] font-medium text-gray-700">{row.label}</span>
                  </div>
                </td>
                <td className={TD_CLS}><span className="text-[14px] font-bold text-gray-900">{row.v1}</span></td>
                <td className={TD_CLS}><span className="text-[14px] font-bold text-gray-900">{row.v2}</span></td>
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
              <th className={TH_CLS + ' text-success-600'}>Fixed</th>
              <th className={TH_CLS + ' text-warning-600'}>New</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_DOMAIN_METRICS.map(row => (
              <tr key={row.metric} className="hover:bg-gray-50/40 transition-colors">
                <td className={TD_CLS}><span className="text-[13px] font-medium text-gray-700">{row.metric}</span></td>
                <td className={TD_CLS}><span className="text-[13px] font-semibold text-gray-900">{row.v1}</span></td>
                <td className={TD_CLS}><span className="text-[13px] font-semibold text-gray-900">{row.v2}</span></td>
                <td className={TD_CLS}><span className="text-[13px] text-gray-300">—</span></td>
                <td className={TD_CLS}><span className="text-[13px] text-gray-300">—</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>

      {/* Issue category sections */}
      {COMPARISON_ISSUE_SECTIONS.map(section => (
        <SectionCard key={section.category}>
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-[14px] font-semibold text-gray-900">{section.category}</p>
            <p className="text-[12px] text-gray-400 mt-0.5">{section.count} tracked issue{section.count !== 1 ? 's' : ''} in this comparison section.</p>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={TH_CLS + ' w-[40%]'}>Issue</th>
                <th className={TH_CLS}>{DATE1}</th>
                <th className={TH_CLS}>{DATE2}</th>
                <th className={TH_CLS + ' text-success-600'}>Fixed</th>
                <th className={TH_CLS + ' text-warning-600'}>New</th>
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
                  <td className={TD_CLS}><span className="text-[14px] font-bold text-gray-900">{row.v1}</span></td>
                  <td className={TD_CLS}><span className="text-[14px] font-bold text-gray-900">{row.v2}</span></td>
                  <td className={TD_CLS}>{renderFixed(row)}</td>
                  <td className={TD_CLS}>{renderNew(row)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionCard>
      ))}
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

const FEATURES = [
  { Icon: Globe,         color: '#0D9488', bg: '#F0FDFA', label: 'Crawl the site',    sub: 'Pages, links, and assets'  },
  { Icon: AlertTriangle, color: '#D97706', bg: '#FFFBEB', label: 'Spot what matters', sub: 'Errors first'              },
  { Icon: BarChart3,     color: '#7C3AED', bg: '#F5F3FF', label: 'Track progress',    sub: 'Compare every crawl'       },
]

const DETAIL_CARDS = [
  {
    Icon: LayoutDashboard, color: '#2563EB', bg: '#EFF6FF',
    chip: 'Score + top issues',
    title: 'Health snapshot',
    desc: 'Get the big picture fast, then zoom into the fixes with the highest SEO impact.',
    tabs: ['Overview', 'Scan results'],
  },
  {
    Icon: Link2, color: '#0D9488', bg: '#F0FDFA',
    chip: 'URLs + internal linking',
    title: 'Page and link map',
    desc: 'See which pages need attention and where broken or weak link paths are holding them back.',
    tabs: ['Crawled pages', 'Found links'],
  },
  {
    Icon: TrendingUp, color: '#7C3AED', bg: '#F5F3FF',
    chip: 'Resources + change tracking',
    title: 'Assets and trends',
    desc: 'Catch heavy resources, rendering friction, and whether your last fixes improved the crawl.',
    tabs: ['Resources', 'Crawl comparison'],
  },
]

const WORKFLOW_STEPS = [
  { n: '01', Icon: Search,        color: '#2563EB', bg: '#EFF6FF', label: 'Discover',  desc: 'We crawl your site structure and collect URLs, links, and resources.' },
  { n: '02', Icon: AlertTriangle, color: '#D97706', bg: '#FFFBEB', label: 'Diagnose',  desc: 'Issues are grouped by severity so your team knows what to fix first.' },
  { n: '03', Icon: TrendingUp,    color: '#0D9488', bg: '#F0FDFA', label: 'Improve',   desc: 'Future crawls show what improved, what regressed, and where to focus next.' },
]

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${on ? 'bg-primary-600' : 'bg-gray-200'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

function SiteHealthInitialState({ onLaunch }) {
  const [url, setUrl]           = useState('')
  const [agent, setAgent]       = useState('Custom bot')
  const [maxPages, setMaxPages] = useState(50)
  const [speed, setSpeed]       = useState(500)
  const [jsOn, setJsOn]         = useState(false)
  const [robotsOn, setRobotsOn] = useState(true)
  const [advanced, setAdvanced] = useState(false)

  const chips = [
    agent, `${maxPages} pages`, `${speed} req/s`,
    jsOn ? 'JS on' : 'JS off',
    robotsOn ? 'robots.txt on' : 'robots.txt off',
  ]

  return (
    /* Gray background with equal padding on all 4 sides — white card never crops */
    <div className="flex-1 min-w-0 min-h-0 h-full bg-gray-50 p-4 flex overflow-hidden">
      <div
        className="flex-1 min-w-0 bg-white rounded-xl border border-gray-200 overflow-hidden"
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,.06)', display: 'grid', gridTemplateColumns: '1fr auto' }}
      >

        {/* ── Left column: scrollable content ── */}
        <div className="overflow-y-auto min-w-0 border-r border-gray-100" style={{ scrollbarWidth: 'thin', scrollbarColor: '#D0D5DD transparent' }}>
          <div className="p-6 flex flex-col gap-6">

            {/* Hero */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-primary-200 bg-primary-50 text-[11px] font-semibold text-primary-700 mb-3 block w-fit">
                <Globe size={11} />
                Website audit
              </span>
              <h1 className="text-[22px] font-bold text-gray-900 leading-snug mb-2 max-w-[560px]">
                See what is blocking organic growth before your team fixes the wrong things
              </h1>
              <p className="text-[13px] text-gray-500 leading-relaxed max-w-[520px]">
                Run one crawl, get a clean health snapshot, and move straight into the pages, links, resources, and trends that matter most for SEO performance.
              </p>
            </div>

            {/* 3 quick features */}
            <div className="grid grid-cols-3 gap-4">
              {FEATURES.map(({ Icon, color, bg, label, sub }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
                    <Icon size={15} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-gray-900">{label}</p>
                    <p className="text-[12px] text-gray-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Detail cards */}
            <div className="grid grid-cols-3 gap-3">
              {DETAIL_CARDS.map(({ Icon, color, bg, chip, title, desc, tabs }) => (
                <div key={title} className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3 hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: bg }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-2 py-0.5 leading-tight">{chip}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-gray-900 mb-1">{title}</p>
                    <p className="text-[12px] text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-auto">
                    {tabs.map(t => (
                      <span key={t} className="text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-0.5">{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* What happens next — moved here, below the cards */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <p className="text-[13px] font-semibold text-gray-700">What happens next</p>
                <div className="flex-1 h-px bg-gray-100" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {WORKFLOW_STEPS.map(({ n, Icon, color, bg, label, desc }) => (
                  <div key={n} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: bg }}>
                      <Icon size={15} style={{ color }} />
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-900 leading-snug">
                        <span className="text-gray-400 font-normal mr-1">{n}</span>{label}
                      </p>
                      <p className="text-[12px] text-gray-400 leading-relaxed mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── Right column: config form, CTA always pinned at bottom via CSS Grid ── */}
        <div
          className="w-[340px] shrink-0 overflow-hidden"
          style={{ display: 'grid', gridTemplateRows: '1fr auto' }}
        >
          {/* Row 1 — Config fields (scrolls if needed) */}
          <div className="px-5 pt-6 pb-2 flex flex-col gap-4 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'thin', scrollbarColor: '#D0D5DD transparent' }}>
            <div>
              <p className="text-[14px] font-bold text-gray-900 mb-0.5">Start your audit</p>
              <p className="text-[12px] text-gray-400">Enter your website and launch the crawl</p>
            </div>

            {/* Config chips */}
            <div className="flex flex-wrap gap-1.5">
              {chips.map(c => (
                <span key={c} className="text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-1">{c}</span>
              ))}
            </div>

            {/* URL input */}
            <div>
              <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">Website URL</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-primary-600 transition-colors bg-white">
                <Globe size={13} className="text-gray-400 shrink-0" />
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="flex-1 text-[13px] text-gray-800 placeholder:text-gray-400 outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Advanced settings accordion */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setAdvanced(a => !a)}
                className="flex items-center justify-between w-full px-3 py-2.5 bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="text-[12px] font-semibold text-gray-700">Advanced settings</span>
                <ChevronRight
                  size={13}
                  className="text-gray-400 transition-transform duration-200"
                  style={{ transform: advanced ? 'rotate(90deg)' : 'rotate(0deg)' }}
                />
              </button>

              <div
                style={{
                  display: 'grid',
                  gridTemplateRows: advanced ? '1fr' : '0fr',
                  transition: 'grid-template-rows 200ms ease',
                }}
              >
                <div style={{ overflow: 'hidden' }}>
                  <div className="border-t border-gray-100 bg-gray-50 p-3 grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <p className="text-[11px] font-semibold text-gray-600 mb-1">Crawler user agent</p>
                      <div className="relative">
                        <select
                          value={agent}
                          onChange={e => setAgent(e.target.value)}
                          className="w-full appearance-none border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12px] text-gray-800 bg-white outline-none focus:border-primary-600 pr-7"
                        >
                          <option>Custom bot</option>
                          <option>Googlebot</option>
                          <option>Bingbot</option>
                        </select>
                        <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-600 mb-1">Max pages</p>
                      <input type="number" value={maxPages} onChange={e => setMaxPages(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12px] text-gray-800 bg-white outline-none focus:border-primary-600" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-600 mb-1">Crawl speed</p>
                      <input type="number" value={speed} onChange={e => setSpeed(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-[12px] text-gray-800 bg-white outline-none focus:border-primary-600" />
                    </div>
                    <div className="flex items-center justify-between border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white">
                      <span className="text-[11px] font-semibold text-gray-700">JS rendering</span>
                      <Toggle on={jsOn} onChange={setJsOn} />
                    </div>
                    <div className="flex items-center justify-between border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white">
                      <span className="text-[11px] font-semibold text-gray-700">robots.txt</span>
                      <Toggle on={robotsOn} onChange={setRobotsOn} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 — CTA always at bottom */}
          <div className="px-5 pb-5 pt-3 border-t border-gray-100">
            <button
              onClick={() => onLaunch({ url, agent, maxPages, speed, jsOn, robotsOn })}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[14px] font-semibold transition-colors"
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

  const CONFIG_ROWS = [
    { label: 'User agent',            value: config.agent },
    { label: 'Maximum pages',         value: config.maxPages },
    { label: 'Crawl speed',           value: `${config.speed} req/s` },
    { label: 'JavaScript rendering',  value: config.jsOn ? 'Enabled' : 'Disabled' },
    { label: 'robots.txt',            value: config.robotsOn ? 'Respected' : 'Ignored' },
  ]

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
        {/* Full-width progress bar pinned to bottom of header */}
        <div className="h-0.5 bg-gray-100 -mx-6">
          <div
            className="h-full bg-primary-600 transition-all duration-300 ease-out"
            style={{ width: `${displayPct}%` }}
          />
        </div>
        {/* Status row */}
        <div className="flex items-center justify-between py-2">
          <p className="text-[12px] text-gray-500">{activeStage.msg}</p>
          <p className="text-[12px] font-semibold text-gray-600">{displayPct}%</p>
        </div>
      </div>

      {/* Main content — vertically centred */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-8">
        <div
          className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden"
          style={{ maxWidth: 860, boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px' }}>

            {/* Left: heading + progress */}
            <div className="p-8 border-r border-gray-100 flex flex-col gap-6">
              {/* Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary-200 bg-primary-50 w-fit">
                <RefreshCw size={10} className="text-primary-600 animate-spin" style={{ animationDuration: '1.4s' }} />
                <span className="text-[10px] font-bold text-primary-700 tracking-widest uppercase">Website audit in progress</span>
              </span>

              {/* Heading */}
              <div>
                <h2 className="text-[22px] font-bold text-gray-900 leading-snug mb-2">
                  Crawling <span className="text-primary-600">{domain}</span> and building the audit workspace
                </h2>
                <p className="text-[13px] text-gray-500 leading-relaxed">
                  We are checking crawlability, technical SEO, page health, link structure, resources, and change history so the dashboard can open with prioritized findings.
                </p>
              </div>

              {/* Progress card */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[12px] text-gray-600 leading-snug max-w-[360px]">{activeStage.msg}</p>
                  <p className="text-[14px] font-bold text-gray-800 shrink-0 pl-3">{displayPct}%</p>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${displayPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right: config summary */}
            <div className="p-6 bg-gray-50/30">
              <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-5">Selected crawl setup</p>
              <div className="flex flex-col gap-4">
                {CONFIG_ROWS.map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <span className="text-[12px] text-gray-500">{label}</span>
                    <span className="text-[13px] font-semibold text-gray-900 text-right">{String(value)}</span>
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

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function SiteHealthDashboard() {
  const [phase, setPhase]           = useState(() => sessionStorage.getItem('sh_hasScan') === '1' ? 'ready' : 'setup')
  const [crawlConfig, setCrawlConfig] = useState(null)
  const [activeTab, setActiveTab]   = useState('overview')

  function handleLaunch(config) {
    setCrawlConfig(config)
    setPhase('crawling')
  }

  function handleCrawlComplete() {
    sessionStorage.setItem('sh_hasScan', '1')
    setPhase('ready')
  }

  if (phase === 'setup') {
    return <SiteHealthInitialState onLaunch={handleLaunch} />
  }
  if (phase === 'crawling') {
    return <SiteHealthCrawlingState config={crawlConfig} onComplete={handleCrawlComplete} />
  }

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-gray-50">

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
            <button className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">
              <Settings size={15} />
            </button>
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              <Download size={13} />
              Export
            </button>
            <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[13px] font-semibold transition-colors">
              <RefreshCw size={13} />
              Run scan
            </button>
          </div>
        </div>

        {/* Tab nav with icons */}
        <div className="flex items-center gap-1 -mx-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
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

      {/* Scrollable tab content */}
      <div className="flex-1 overflow-y-auto min-h-0 p-5" style={{ scrollbarGutter: 'stable' }}>
        {activeTab === 'overview'   && <OverviewTab />}
        {activeTab === 'scan'       && <ScanResultsTab />}
        {activeTab === 'crawled'    && <CrawledPagesTab />}
        {activeTab === 'links'      && <FoundLinksTab />}
        {activeTab === 'resources'  && <FoundResourcesTab />}
        {activeTab === 'comparison' && <CrawlComparisonTab />}
      </div>
    </div>
  )
}
