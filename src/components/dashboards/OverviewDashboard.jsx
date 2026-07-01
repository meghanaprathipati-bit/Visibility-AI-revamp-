import { useState } from 'react'
import {
  Globe, MapPin, Search, BarChart3, Link2,
  AlertTriangle, CircleCheck, ChevronRight, ChevronDown, Zap, Bot, FileText,
  Sparkles, ArrowUp, Check, X, ArrowLeft, RefreshCw, Plus,
} from '../../icons/index.js'

// ─── Primitives ───────────────────────────────────────────────────────────────

function HoverCard({ children, style = {}, className = '' }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      className={className}
      style={{
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hov
          ? '0 8px 28px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)'
          : '0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        ...style,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </div>
  )
}

function CircularProgress({ pct = 0, size = 152, strokeW = 13, color = '#155EEF' }) {
  const r = (size - strokeW) / 2
  const circ = 2 * Math.PI * r
  const filled = (Math.min(100, Math.max(0, pct)) / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F2F4F7" strokeWidth={strokeW} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={strokeW} strokeLinecap="round"
        strokeDasharray={`${filled.toFixed(2)} ${(circ - filled).toFixed(2)}`}
      />
    </svg>
  )
}

function Sparkline({ data, color = '#6938EF' }) {
  const w = 64, h = 26
  const min = Math.min(...data), max = Math.max(...data), rng = max - min || 1
  const pts = data.map((v, i) =>
    `${((i / (data.length - 1)) * w).toFixed(1)},${(h - ((v - min) / rng) * (h - 6) - 3).toFixed(1)}`
  ).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ flexShrink: 0 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TrendChip({ value }) {
  if (!value) return null
  const up = value > 0
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      fontSize: 11, fontWeight: 600, borderRadius: 5,
      padding: '2px 6px',
      background: up ? '#F0FDF4' : '#FEF2F2',
      color: up ? '#16A34A' : '#DC2626',
    }}>
      <ArrowUp size={9} style={{ transform: up ? 'none' : 'rotate(180deg)' }} />
      {Math.abs(value)}%
    </span>
  )
}

function ProgressBar({ pct, color }) {
  return (
    <div style={{ height: 5, background: '#F2F4F7', borderRadius: 3, overflow: 'hidden', marginTop: 6 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 700ms ease' }} />
    </div>
  )
}

function Stars({ value }) {
  return (
    <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: 14, color: i <= Math.round(value) ? '#F59E0B' : '#E5E7EB' }}>★</span>
      ))}
    </div>
  )
}

function StatusPill({ status }) {
  const isReady = status === 'ready' || status === 'connected'
  const label = status === 'connected' ? 'Connected' : isReady ? 'Ready' : 'Needs setup'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 600, borderRadius: 999,
      padding: '2px 8px', flexShrink: 0,
      background: isReady ? '#F0FDF4' : '#FFFBEB',
      border: `1px solid ${isReady ? '#BBF7D0' : '#FDE68A'}`,
      color: isReady ? '#15803D' : '#B45309',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: isReady ? '#16A34A' : '#D97706', flexShrink: 0 }} />
      {label}
    </span>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SETUP_ITEMS = [
  { Icon: Globe,     status: 'connected',  title: 'Website',          desc: 'ramada.9hf9h.com',                  cta: 'Open Site Health' },
  { Icon: MapPin,    status: 'needsSetup', title: 'Business Profile', desc: 'Unlock local visibility & reviews', cta: 'Connect GBP'      },
  { Icon: Search,    status: 'needsSetup', title: 'Search Console',   desc: 'Rankings, clicks, indexing',        cta: 'Connect GSC'      },
  { Icon: BarChart3, status: 'needsSetup', title: 'Google Analytics', desc: 'Traffic and engagement data',       cta: 'Connect GA4'      },
  { Icon: Link2,     status: 'needsSetup', title: 'Listings',         desc: 'Business name & citations',         cta: 'Set up listings'  },
]

const QUICK_STATS = [
  { label: 'Setup ready',       value: '1 / 5', Icon: CircleCheck,   accent: '#16A34A', bg: '#F0FDF4' },
  { label: 'Integrations',      value: '0',     Icon: Zap,           accent: '#155EEF', bg: '#EEF4FF' },
  { label: 'Keywords tracked',  value: '0',     Icon: Search,        accent: '#6938EF', bg: '#F4F3FF' },
  { label: 'Actions remaining', value: '4',     Icon: AlertTriangle, accent: '#D97706', bg: '#FFFBEB' },
]

const MODULE_SECTIONS = [
  {
    id: 'ai-search', Icon: Sparkles, accent: '#6938EF', accentBg: '#F4F3FF',
    title: 'AI search',
    desc: 'Monitor your brand visibility across AI-powered search engines and assistants.',
    cards: [
      {
        title: 'AI Search Performance', status: 'ready', cta: 'Open dashboard',
        metrics: [
          { label: 'Brand presence',        value: '38%',    trend: 12,  sparkData: [20,22,25,28,30,34,38], sparkColor: '#6938EF' },
          { label: 'Engines with mentions', value: '3 of 5', trend: 0,   sparkData: [1,2,2,3,3,3,3],       sparkColor: '#6938EF' },
        ],
      },
      {
        title: 'Prompt Tracking', status: 'ready', cta: 'Open dashboard',
        metrics: [
          { label: 'Tracked prompts', value: '18', trend: 8,  sparkData: [8,10,12,13,15,16,18], sparkColor: '#155EEF' },
          { label: 'Winning prompts', value: '7',  trend: 17, sparkData: [2,3,4,4,5,6,7],       sparkColor: '#155EEF' },
        ],
      },
      {
        title: 'AI Health', status: 'ready', cta: 'Open dashboard',
        metrics: [
          { label: 'Health score',      value: '72', trend: 4,   sparkData: [58,62,65,67,69,71,72], sparkColor: '#16A34A' },
          { label: 'Priority blockers', value: '5',  trend: -37, sparkData: [9,8,7,7,6,6,5],       sparkColor: '#DC2626' },
        ],
      },
    ],
  },
  {
    id: 'search-engines', Icon: Search, accent: '#155EEF', accentBg: '#EEF4FF',
    title: 'Search engines',
    desc: 'Track rankings, keyword performance, and technical site health across Google.',
    cards: [
      {
        title: 'Search Performance', status: 'needsSetup', cta: 'Finish setup',
        metrics: [
          { label: 'Tracked keywords',   value: '52', trend: 4,  sparkData: [48,49,50,51,51,52,52], sparkColor: '#6938EF' },
          { label: 'Keywords in top 10', value: '11', trend: 10, sparkData: [7,8,9,9,10,10,11],     sparkColor: '#6938EF' },
        ],
      },
      {
        title: 'Keyword Rankings', status: 'needsSetup', cta: 'Finish setup',
        metrics: [
          { label: 'Keywords in top 10', value: '11', trend: 10, sparkData: [7,8,9,9,10,10,11], sparkColor: '#6938EF' },
          { label: 'Fast movers',        value: '6',  trend: 20, sparkData: [2,3,3,4,5,5,6],   sparkColor: '#6938EF' },
        ],
      },
      {
        title: 'Site Health', status: 'ready', cta: 'Open dashboard',
        metrics: [
          { label: 'Health score', value: '74', trend: 6,   sparkData: [63,66,69,71,72,73,74], sparkColor: '#16A34A' },
          { label: 'Errors',       value: '17', trend: -23, sparkData: [22,21,20,19,18,18,17], sparkColor: '#DC2626' },
        ],
      },
    ],
  },
  {
    id: 'gbp', Icon: MapPin, accent: '#16A34A', accentBg: '#F0FDF4',
    title: 'GBP & listings',
    desc: 'Local presence, directory accuracy, and review performance at a glance.',
    cards: [
      {
        title: 'Profile Health', status: 'needsSetup', cta: 'Finish setup',
        metrics: [
          { label: 'Profile completeness', value: '86%', progressPct: 86, progressColor: '#16A34A' },
          { label: 'Suggested fixes',      value: '4' },
        ],
      },
      {
        title: 'Map Rankings', status: 'needsSetup', cta: 'Finish setup',
        metrics: [
          { label: 'Map-pack coverage', value: '71%',            progressPct: 71, progressColor: '#16A34A' },
          { label: 'Tracked zones',     value: '49 grid points' },
        ],
      },
      {
        title: 'Review Health', status: 'needsSetup', cta: 'Finish setup',
        metrics: [
          { label: 'Average rating',   value: '4.6 / 5', starValue: 4.6 },
          { label: 'Responses needed', value: '8' },
        ],
      },
    ],
  },
  {
    id: 'content', Icon: FileText, accent: '#D97706', accentBg: '#FFFBEB',
    title: 'Content & analytics',
    desc: 'Content gaps, competitor insights, and cross-channel traffic signals.',
    cards: [
      {
        title: 'Content Studio', status: 'ready', cta: 'Open dashboard',
        metrics: [
          { label: 'Briefs ready',   value: '4', trend: 33, sparkData: [1,2,2,3,3,4,4], sparkColor: '#D97706' },
          { label: 'Priority pages', value: '2' },
        ],
      },
      {
        title: 'Search Presence', status: 'ready', cta: 'Open dashboard',
        metrics: [
          { label: 'Tracked competitors', value: '6' },
          { label: 'Visibility gaps',     value: '2', trend: -33, sparkData: [5,5,4,4,3,2,2], sparkColor: '#16A34A' },
        ],
      },
      {
        title: 'Traffic & Engagement', status: 'needsSetup', cta: 'Finish setup',
        metrics: [
          { label: 'Sessions',         value: '84.6K', trend: 9, sparkData: [70,74,78,80,82,83,85], sparkColor: '#D97706' },
          { label: 'Engaged sessions', value: '49.8K', trend: 7, sparkData: [40,43,45,47,48,49,50], sparkColor: '#D97706' },
        ],
      },
    ],
  },
]

// ─── Hero Section (with embedded KPI cards) ───────────────────────────────────

function HeroSection() {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #EAECF0',
      borderRadius: 8,
      padding: '20px 24px',
    }}>
      {/* Identity row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
          <Globe size={18} style={{ color: '#155EEF' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <h1 style={{ fontSize: 15, fontWeight: 700, color: '#101828', margin: 0, lineHeight: 1.3 }}>Ramada International</h1>
            <span style={{ fontSize: 12, color: '#98A2B3' }}>ramada.9hf9h.com · Hotel &amp; Hospitality</span>
          </div>
          <p style={{ fontSize: 13, color: '#475467', margin: '0 0 12px', lineHeight: 1.6, maxWidth: 680 }}>
            Ramada International: Your Premier Hotel Destination still has 4 setup items before every dashboard can show live data. Start with the cards below, then use the module summaries to jump straight into the right workflow.
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
        {QUICK_STATS.map(({ label, value, Icon, accent, bg }) => (
          <div
            key={label}
            style={{ background: '#F9FAFB', border: '1px solid #EAECF0', borderRadius: 8, padding: 16, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}
          >
            <div>
              <p style={{ fontSize: 12, color: '#98A2B3', margin: '0 0 4px', fontWeight: 500 }}>{label}</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#101828', margin: 0, lineHeight: 1 }}>{value}</p>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={15} style={{ color: accent }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Recommended Action ───────────────────────────────────────────────────────

function RecommendedAction() {
  return (
    <div style={{ background: '#EEF4FF', border: '1px solid #C7D7FD', borderRadius: 8, padding: '14px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#C7D7FD', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <MapPin size={14} style={{ color: '#155EEF' }} />
        </div>
        {/* Title row + subtext below */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#101828' }}>Connect Google Business Profile</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#155EEF', background: '#D1E0FF', borderRadius: 999, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
              Next step
            </span>
            <span style={{ fontSize: 12, color: '#667085' }}>· Est. 2 min</span>
          </div>
          <span style={{ fontSize: 13, color: '#475467' }}>
            Unlock local SEO audits, map-pack visibility, and AI-powered local recommendations.
          </span>
        </div>
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: '#155EEF', color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
          Connect now <ChevronRight size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Setup Timeline ───────────────────────────────────────────────────────────

function SetupTimeline() {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #EAECF0',
      borderRadius: 8,
      padding: '24px 28px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#101828', margin: '0 0 2px' }}>Project setup</h2>
          <p style={{ fontSize: 12, color: '#98A2B3', margin: 0 }}>Complete each integration to unlock full dashboard coverage.</p>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#16A34A' }}>1 / 5 complete</span>
      </div>

      {/* Equal-width 5-column grid with absolute connector track behind circles */}
      <div style={{ position: 'relative' }}>
        {/* Connector track: runs between center of step 1 and center of step 5 */}
        <div style={{ position: 'absolute', top: 16, left: '10%', right: '10%', height: 2, background: '#E5E7EB', borderRadius: 2, zIndex: 0 }} />
        {/* Done segment: step 1 center (10%) to step 2 center (30%) = 20% of track width */}
        <div style={{ position: 'absolute', top: 16, left: '10%', width: '20%', height: 2, background: '#16A34A', borderRadius: 2, zIndex: 0 }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, position: 'relative', zIndex: 1 }}>
          {SETUP_ITEMS.map((item) => {
            const done = item.status === 'connected'
            return (
              <div key={item.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                {/* Circle */}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: done ? '#16A34A' : '#fff',
                  border: `1px solid ${done ? '#16A34A' : '#D0D5DD'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: done ? '0 0 0 4px rgba(22,163,74,0.10)' : '0 1px 3px rgba(0,0,0,0.06)',
                  transition: 'all 200ms ease',
                  flexShrink: 0,
                }}>
                  {done
                    ? <Check size={13} style={{ color: '#fff', strokeWidth: 3 }} />
                    : <item.Icon size={12} style={{ color: '#9CA3AF' }} />
                  }
                </div>

                {/* Labels */}
                <div style={{ textAlign: 'center', padding: '0 6px' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#101828', margin: '0 0 2px', lineHeight: 1.3, whiteSpace: 'nowrap' }}>{item.title}</p>
                  <p style={{ fontSize: 11, color: '#98A2B3', margin: '0 0 6px', lineHeight: 1.4 }}>{item.desc}</p>
                  {done
                    ? <span style={{ fontSize: 11, fontWeight: 600, color: '#16A34A' }}>✓ Connected</span>
                    : <button style={{ fontSize: 11, fontWeight: 600, color: '#155EEF', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{item.cta} →</button>
                  }
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Module Card ──────────────────────────────────────────────────────────────

function MetricItem({ label, value, trend, progressPct, progressColor, starValue }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: '#98A2B3', margin: '0 0 5px', fontWeight: 500, lineHeight: 1.2 }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 700, color: '#101828', margin: 0, lineHeight: 1 }}>{value}</p>
      {progressPct != null && <ProgressBar pct={progressPct} color={progressColor} />}
      {starValue != null && <Stars value={starValue} />}
      {trend != null && trend !== 0 && <div style={{ marginTop: 5 }}><TrendChip value={trend} /></div>}
    </div>
  )
}

function ModuleCard({ title, status, metrics, cta }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      style={{
        background: '#fff',
        border: hov ? '1px solid #D0D5DD' : '1px solid #EAECF0',
        borderRadius: 8,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        transition: 'border-color 200ms ease',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#101828', margin: 0, lineHeight: 1.3 }}>{title}</p>
        <StatusPill status={status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {metrics.map(m => <MetricItem key={m.label} {...m} />)}
      </div>

      <button style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 13, fontWeight: 600, color: '#155EEF',
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        marginTop: 'auto',
      }}>
        {cta} <ChevronRight size={13} />
      </button>
    </div>
  )
}

// ─── Module Section ───────────────────────────────────────────────────────────

function ModuleSection({ Icon, accent, accentBg, title, desc, cards }) {
  return (
    <section>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={14} style={{ color: accent }} />
        </div>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#101828', margin: '0 0 2px' }}>{title}</h2>
          <p style={{ fontSize: 12, color: '#98A2B3', margin: 0 }}>{desc}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 20 }}>
        {cards.map(card => <ModuleCard key={card.title} {...card} />)}
      </div>
    </section>
  )
}

// ─── Setup Modal ─────────────────────────────────────────────────────────────

const INPUT_STYLE = {
  width: '100%', padding: '9px 13px', borderRadius: 8,
  border: '1px solid #EAECF0', fontSize: 13, color: '#101828',
  outline: 'none', background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit',
}
const LABEL_STYLE = { fontSize: 13, fontWeight: 600, color: '#344054', display: 'block', marginBottom: 6 }

function SetupStep1({ gbpLink, setGbpLink, websiteUrl, setWebsiteUrl, brandName, setBrandName, country, setCountry, region, setRegion }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={LABEL_STYLE}>GBP profile link <span style={{ color: '#98A2B3', fontWeight: 400 }}>(optional)</span></label>
        <input value={gbpLink} onChange={e => setGbpLink(e.target.value)} placeholder="https://www.google.com/maps/place/..." style={INPUT_STYLE} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={LABEL_STYLE}>Website URL</label>
          <input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} style={INPUT_STYLE} />
        </div>
        <div>
          <label style={LABEL_STYLE}>Brand name</label>
          <input value={brandName} onChange={e => setBrandName(e.target.value)} style={INPUT_STYLE} />
        </div>
      </div>
      <div>
        <label style={{ ...LABEL_STYLE, marginBottom: 12 }}>Target location</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: '#667085', display: 'block', marginBottom: 6 }}>Country</label>
            <div style={{ position: 'relative' }}>
              <select value={country} onChange={e => setCountry(e.target.value)} style={{ ...INPUT_STYLE, appearance: 'none', paddingRight: 32, cursor: 'pointer' }}>
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Canada</option>
                <option>Australia</option>
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: '#98A2B3', pointerEvents: 'none' }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#667085', display: 'block', marginBottom: 6 }}>State / region <span style={{ color: '#98A2B3' }}>(optional)</span></label>
            <div style={{ position: 'relative' }}>
              <select value={region} onChange={e => setRegion(e.target.value)} style={{ ...INPUT_STYLE, appearance: 'none', paddingRight: 32, cursor: 'pointer' }}>
                <option value="">Select state or region</option>
                <option>California</option>
                <option>New York</option>
                <option>Texas</option>
                <option>Florida</option>
              </select>
              <ChevronDown size={13} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: '#98A2B3', pointerEvents: 'none' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const TABLE_TH = { padding: '8px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#667085', letterSpacing: '0.05em', textTransform: 'uppercase' }
const TABLE_TD = { padding: '10px 16px' }

function SetupStep2({ keywords, setKeywords, newKeyword, setNewKeyword, prompts, setPrompts, newPrompt, setNewPrompt }) {
  const toggleKeyword = id => setKeywords(ks => ks.map(k => k.id === id ? { ...k, use: !k.use } : k))
  const addKeyword = () => {
    if (!newKeyword.trim()) return
    setKeywords(ks => [...ks, { id: ks.length + 2, use: true, keyword: newKeyword.trim(), searches: 'No data', difficulty: 'No data' }])
    setNewKeyword('')
  }
  const togglePrompt = id => setPrompts(ps => ps.map(p => p.id === id ? { ...p, use: !p.use } : p))
  const addPrompt = () => {
    if (!newPrompt.trim()) return
    setPrompts(ps => [...ps, { id: ps.length + 2, use: true, prompt: newPrompt.trim() }])
    setNewPrompt('')
  }

  const cardStyle = { border: '1px solid #EAECF0', borderRadius: 8, overflow: 'hidden' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 13, color: '#475467', margin: 0, lineHeight: 1.6 }}>
        Confirm the keywords and prompts that matter most for search, AI, and local business opportunities.
      </p>

      {/* Keywords */}
      <div style={cardStyle}>
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={14} style={{ color: '#6938EF' }} />
          <p style={{ fontSize: 13, fontWeight: 700, color: '#101828', margin: 0 }}>Top keywords to verify</p>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: '1px solid #EAECF0' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #EAECF0' }}>
              <th style={{ ...TABLE_TH, width: 48 }}>Use</th>
              <th style={TABLE_TH}>Keyword</th>
              <th style={TABLE_TH}>Monthly searches</th>
              <th style={TABLE_TH}>Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map(kw => (
              <tr key={kw.id} style={{ borderBottom: '1px solid #F2F4F7' }}>
                <td style={TABLE_TD}><input type="checkbox" checked={kw.use} onChange={() => toggleKeyword(kw.id)} style={{ width: 15, height: 15, accentColor: '#155EEF', cursor: 'pointer' }} /></td>
                <td style={{ ...TABLE_TD, fontSize: 13, color: '#101828', fontWeight: 500 }}>{kw.keyword}</td>
                <td style={{ ...TABLE_TD, fontSize: 13, color: '#667085' }}>{kw.searches}</td>
                <td style={{ ...TABLE_TD, fontSize: 13, color: '#667085' }}>{kw.difficulty}</td>
              </tr>
            ))}
            <tr>
              <td style={TABLE_TD}><Plus size={12} style={{ color: '#9CA3AF' }} /></td>
              <td style={TABLE_TD} colSpan={2}>
                <input value={newKeyword} onChange={e => setNewKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && addKeyword()} placeholder="Add a keyword manually" style={{ width: '100%', border: 'none', outline: 'none', fontSize: 13, color: '#667085', background: 'transparent', fontFamily: 'inherit' }} />
              </td>
              <td style={TABLE_TD}>
                <button onClick={addKeyword} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #D0D5DD', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Plus size={11} style={{ color: '#667085' }} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Prompts */}
      <div style={cardStyle}>
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={14} style={{ color: '#6938EF' }} />
          <p style={{ fontSize: 13, fontWeight: 700, color: '#101828', margin: 0 }}>Prompt suggestions to save with these keywords</p>
        </div>
        <p style={{ fontSize: 12, color: '#667085', padding: '0 16px 12px', margin: 0 }}>No prompt suggestions are ready yet. You can still add your own prompts below.</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: '1px solid #EAECF0' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #EAECF0' }}>
              <th style={{ ...TABLE_TH, width: 48 }}>Use</th>
              <th style={TABLE_TH}>Prompt</th>
            </tr>
          </thead>
          <tbody>
            {prompts.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #F2F4F7' }}>
                <td style={TABLE_TD}><input type="checkbox" checked={p.use} onChange={() => togglePrompt(p.id)} style={{ width: 15, height: 15, accentColor: '#155EEF', cursor: 'pointer' }} /></td>
                <td style={{ ...TABLE_TD, fontSize: 13, color: '#101828' }}>{p.prompt}</td>
              </tr>
            ))}
            <tr>
              <td style={TABLE_TD}><Plus size={12} style={{ color: '#9CA3AF' }} /></td>
              <td style={{ padding: '8px 16px 8px 16px' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <textarea value={newPrompt} onChange={e => setNewPrompt(e.target.value)} placeholder="Add a strategic AI search prompt" rows={2} style={{ flex: 1, border: '1px solid #EAECF0', borderRadius: 8, padding: '7px 10px', fontSize: 13, color: '#667085', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
                  <button onClick={addPrompt} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #D0D5DD', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 4 }}>
                    <Plus size={11} style={{ color: '#667085' }} />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SetupStep3({ competitors, setCompetitors, newBrand, setNewBrand, newDomain, setNewDomain }) {
  const toggleCompetitor = id => setCompetitors(cs => cs.map(c => c.id === id ? { ...c, use: !c.use } : c))
  const addCompetitor = () => {
    if (!newBrand.trim() && !newDomain.trim()) return
    setCompetitors(cs => [...cs, { id: cs.length + 2, use: true, brand: newBrand.trim(), domain: newDomain.trim(), notes: '' }])
    setNewBrand('')
    setNewDomain('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 13, color: '#475467', margin: 0, lineHeight: 1.6 }}>
        Select the right competitors to benchmark rankings, local visibility, and AI answer share against the businesses that matter.
      </p>
      <div style={{ border: '1px solid #EAECF0', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={14} style={{ color: '#6938EF' }} />
          <p style={{ fontSize: 13, fontWeight: 700, color: '#101828', margin: 0 }}>Competitors to review</p>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: '1px solid #EAECF0' }}>
          <colgroup>
            <col style={{ width: 48 }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '22%' }} />
            <col />
          </colgroup>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #EAECF0' }}>
              <th style={{ ...TABLE_TH, width: 48 }}>Use</th>
              <th style={TABLE_TH}>Brand name</th>
              <th style={TABLE_TH}>Competitor domain</th>
              <th style={TABLE_TH}>Visibility notes</th>
            </tr>
          </thead>
          <tbody>
            {competitors.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #F2F4F7' }}>
                <td style={TABLE_TD}><input type="checkbox" checked={c.use} onChange={() => toggleCompetitor(c.id)} style={{ width: 15, height: 15, accentColor: '#155EEF', cursor: 'pointer' }} /></td>
                <td style={TABLE_TD}><div style={{ border: '1px solid #EAECF0', borderRadius: 6, padding: '5px 9px', fontSize: 13, color: '#101828' }}>{c.brand}</div></td>
                <td style={TABLE_TD}><div style={{ border: '1px solid #EAECF0', borderRadius: 6, padding: '5px 9px', fontSize: 13, color: '#101828' }}>{c.domain}</div></td>
                <td style={{ ...TABLE_TD, fontSize: 12, color: '#667085', lineHeight: 1.5 }}>{c.notes}</td>
              </tr>
            ))}
            <tr>
              <td style={TABLE_TD}><Plus size={12} style={{ color: '#9CA3AF' }} /></td>
              <td style={TABLE_TD}>
                <input value={newBrand} onChange={e => setNewBrand(e.target.value)} placeholder="Add brand name" style={{ width: '100%', border: '1px solid #EAECF0', borderRadius: 6, padding: '5px 9px', fontSize: 13, color: '#667085', outline: 'none', fontFamily: 'inherit' }} />
              </td>
              <td style={TABLE_TD}>
                <input value={newDomain} onChange={e => setNewDomain(e.target.value)} placeholder="Add competitor domain" style={{ width: '100%', border: '1px solid #EAECF0', borderRadius: 6, padding: '5px 9px', fontSize: 13, color: '#667085', outline: 'none', fontFamily: 'inherit' }} />
              </td>
              <td style={TABLE_TD}>
                <button onClick={addCompetitor} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #D0D5DD', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Plus size={11} style={{ color: '#667085' }} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SetupModal({ onClose, onComplete }) {
  const [step, setStep] = useState(0)
  const [gbpLink, setGbpLink] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('https://ramada.9hf9h.com')
  const [brandName, setBrandName] = useState('Ramada International: Your Premier Hotel Destination')
  const [country, setCountry] = useState('United States')
  const [region, setRegion] = useState('')
  const [keywords, setKeywords] = useState([{ id: 1, use: true, keyword: 'jbubub', searches: 'No data', difficulty: 'No data' }])
  const [newKeyword, setNewKeyword] = useState('')
  const [prompts, setPrompts] = useState([{ id: 1, use: true, prompt: 'erfrgrgrtgtghtgh' }])
  const [newPrompt, setNewPrompt] = useState('')
  const [competitors, setCompetitors] = useState([{ id: 1, use: true, brand: 'Google', domain: 'google.com', notes: 'Competitor metrics are unavailable because SE Ranking credentials are not configured.' }])
  const [newBrand, setNewBrand] = useState('')
  const [newDomain, setNewDomain] = useState('')

  const STEPS = [
    { label: 'STEP 1', title: 'GBP & Website', Icon: Globe },
    { label: 'STEP 2', title: 'Keywords & prompts', Icon: Search },
    { label: 'STEP 3', title: 'Competitors', Icon: BarChart3 },
  ]

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(16,24,40,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
    >
      <div style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 720, maxHeight: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 48px rgba(16,24,40,0.18)' }}>

        {/* Header */}
        <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid #EAECF0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#101828', margin: '0 0 4px' }}>Complete your Visibility AI setup</h2>
              <p style={{ fontSize: 13, color: '#667085', margin: 0 }}>Add business details, search priorities, and competitors to sharpen audits, recommendations, and insights.</p>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #EAECF0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <X size={14} style={{ color: '#667085' }} />
            </button>
          </div>
          {/* Step indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {STEPS.map(({ label, title, Icon: SIcon }, i) => {
              const done = i < step, active = i === step
              return (
                <div key={i} style={{ padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${done ? '#16A34A' : active ? '#155EEF' : '#EAECF0'}`, background: done ? '#F0FDF4' : active ? '#EEF4FF' : '#FAFAFA', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? '#16A34A' : active ? '#EEF4FF' : '#F2F4F7', border: `1.5px solid ${done ? '#16A34A' : active ? '#155EEF' : '#D0D5DD'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {done ? <Check size={12} style={{ color: '#fff', strokeWidth: 3 }} /> : <SIcon size={12} style={{ color: active ? '#155EEF' : '#9CA3AF' }} />}
                  </div>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 600, color: done ? '#15803D' : active ? '#155EEF' : '#9CA3AF', margin: 0, letterSpacing: '0.05em' }}>{label}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: done ? '#15803D' : active ? '#101828' : '#667085', margin: 0 }}>{title}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Content — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, minHeight: 0 }}>
          {step === 0 && <SetupStep1 gbpLink={gbpLink} setGbpLink={setGbpLink} websiteUrl={websiteUrl} setWebsiteUrl={setWebsiteUrl} brandName={brandName} setBrandName={setBrandName} country={country} setCountry={setCountry} region={region} setRegion={setRegion} />}
          {step === 1 && <SetupStep2 keywords={keywords} setKeywords={setKeywords} newKeyword={newKeyword} setNewKeyword={setNewKeyword} prompts={prompts} setPrompts={setPrompts} newPrompt={newPrompt} setNewPrompt={setNewPrompt} />}
          {step === 2 && <SetupStep3 competitors={competitors} setCompetitors={setCompetitors} newBrand={newBrand} setNewBrand={setNewBrand} newDomain={newDomain} setNewDomain={setNewDomain} />}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #EAECF0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #D0D5DD', background: '#fff', fontSize: 13, fontWeight: 600, color: '#344054', cursor: 'pointer' }}>Close</button>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #D0D5DD', background: '#fff', fontSize: 13, fontWeight: 600, color: '#344054', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <ArrowLeft size={13} /> Previous step
            </button>
          )}
          {step < 2 ? (
            <button onClick={() => setStep(s => s + 1)} style={{ padding: '8px 16px', borderRadius: 8, background: '#155EEF', fontSize: 13, fontWeight: 700, color: '#fff', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Save and continue to {step === 0 ? 'keywords' : 'competitors'} <ChevronRight size={13} />
            </button>
          ) : (
            <button onClick={onComplete} style={{ padding: '8px 16px', borderRadius: 8, background: '#155EEF', fontSize: 13, fontWeight: 700, color: '#fff', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <RefreshCw size={13} /> Save and complete setup
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function SetupSuccessBanner() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', borderRadius: 8, background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#DCFCE7', border: '1px solid #86EFAC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <CircleCheck size={14} style={{ color: '#16A34A' }} />
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#15803D', margin: '0 0 3px' }}>You're ready to start digging in.</p>
        <p style={{ fontSize: 12, color: '#15803D', margin: 0, lineHeight: 1.5 }}>
          Your setup is ready for Search AI, local search, and complete insights to fix account issues, compare competitors, and improve rankings.
        </p>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function OverviewDashboard() {
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)

  function handleSetupComplete() {
    setSetupComplete(true)
    setShowSetupModal(false)
  }

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-gray-50">
      {showSetupModal && (
        <SetupModal
          onClose={() => setShowSetupModal(false)}
          onComplete={handleSetupComplete}
        />
      )}
      <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarGutter: 'stable' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          <HeroSection />

          {setupComplete ? <SetupSuccessBanner /> : <RecommendedAction />}

          <SetupTimeline />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32, marginTop: 16 }}>
            {MODULE_SECTIONS.map(s => (
              <ModuleSection
                key={s.id}
                Icon={s.Icon}
                accent={s.accent}
                accentBg={s.accentBg}
                title={s.title}
                desc={s.desc}
                cards={s.cards}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
