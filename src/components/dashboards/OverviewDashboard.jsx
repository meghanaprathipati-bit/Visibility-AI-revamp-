import { useState } from 'react'
import {
  Globe, MapPin, Search, BarChart3, Link2,
  AlertTriangle, CircleCheck, ChevronRight, ChevronDown, Zap, Bot, FileText,
  Sparkles, ArrowUp, Check, X, ArrowLeft, RefreshCw, Plus,
} from '../../icons/index.js'

// ─── Primitives ───────────────────────────────────────────────────────────────

function TrendBadge({ value }) {
  if (value == null || value === 0) return null
  const up = value > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[12px] font-medium ${up ? 'text-success-600' : 'text-error-600'}`}>
      <ArrowUp size={10} className={up ? '' : 'rotate-180'} />
      {up ? '+' : ''}{value}%
    </span>
  )
}

function ReadyBadge({ ready, total }) {
  const allReady = ready === total
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-medium border ${
      allReady
        ? 'bg-success-50 text-success-700 border-success-200'
        : 'bg-warning-100 text-warning-700 border-warning-100'
    }`}>
      {ready}/{total} ready
    </span>
  )
}

function ProgressBar({ pct, colorClass }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  )
}

// ─── Data (hardcoded for prototyping) ─────────────────────────────────────────

// HARDCODED: workspace setup flow — mirrors HLProgressSteps statuses
// complete = green, current = primary blue, default = pending gray
const SETUP_CONNECTIONS = [
  {
    id: 'website',
    Icon: Globe,
    title: 'Website',
    status: 'complete',
    meta: 'ramada.9hf9h.com',
    unlocks: 'Site health and technical SEO scans are live',
    cta: 'Open site health',
  },
  {
    id: 'gbp',
    Icon: MapPin,
    title: 'Google Business Profile',
    status: 'current',
    meta: 'Est. 2 min',
    unlocks: 'Unlocks Profile health and Map rankings for local visibility',
    cta: 'Connect',
  },
  {
    id: 'gsc',
    Icon: Search,
    title: 'Search Console',
    status: 'default',
    meta: 'Google',
    unlocks: 'Unlocks Search performance and Keyword rankings',
    cta: 'Connect',
  },
  {
    id: 'ga',
    Icon: BarChart3,
    title: 'Google Analytics',
    status: 'default',
    meta: 'GA4',
    unlocks: 'Unlocks Traffic & engagement across channels',
    cta: 'Connect',
  },
  {
    id: 'listings',
    Icon: Link2,
    title: 'Listings',
    status: 'default',
    meta: 'Directories',
    unlocks: 'Unlocks Review health and directory accuracy checks',
    cta: 'Connect',
  },
]

const MODULE_SECTIONS = [
  {
    id: 'ai-search', Icon: Sparkles, title: 'AI search',
    desc: 'Monitor brand visibility across AI-powered search engines and assistants.',
    // Theme: success green
    accent: 'text-success-600', accentBg: 'bg-success-50', bar: 'bg-success-600',
    cards: [
      {
        title: 'AI search performance', status: 'ready', cta: 'Open dashboard',
        metrics: [
          { label: 'Brand presence',        value: '38%',    trend: 12 },
          { label: 'Engines with mentions', value: '3 of 5', trend: 0 },
        ],
      },
      {
        title: 'Prompt tracking', status: 'ready', cta: 'Open dashboard',
        metrics: [
          { label: 'Tracked prompts', value: '18', trend: 8 },
          { label: 'Winning prompts', value: '7',  trend: 17 },
        ],
      },
      {
        title: 'AI health', status: 'ready', cta: 'Open dashboard',
        metrics: [
          { label: 'Health score',      value: '72', trend: 4 },
          { label: 'Priority blockers', value: '5',  trend: -37 },
        ],
      },
    ],
  },
  {
    id: 'search-engines', Icon: Search, title: 'Search engines',
    desc: 'Track rankings, keyword performance, and technical site health across Google.',
    // Theme: warning orange
    accent: 'text-warning-600', accentBg: 'bg-warning-100', bar: 'bg-warning-600',
    cards: [
      {
        title: 'Search performance', status: 'needsSetup', cta: 'Finish setup',
        metrics: [
          { label: 'Tracked keywords',   value: '52', trend: 4 },
          { label: 'Keywords in top 10', value: '11', trend: 10 },
        ],
      },
      {
        title: 'Keyword rankings', status: 'needsSetup', cta: 'Finish setup',
        metrics: [
          { label: 'Keywords in top 10', value: '11', trend: 10 },
          { label: 'Fast movers',        value: '6',  trend: 20 },
        ],
      },
      {
        title: 'Site health', status: 'ready', cta: 'Open dashboard',
        metrics: [
          { label: 'Health score', value: '74', trend: 6 },
          { label: 'Errors',       value: '17', trend: -23 },
        ],
      },
    ],
  },
  {
    id: 'gbp', Icon: MapPin, title: 'GBP & listings',
    desc: 'Local presence, directory accuracy, and review performance at a glance.',
    // Theme: success green
    accent: 'text-success-600', accentBg: 'bg-success-50', bar: 'bg-success-600',
    cards: [
      {
        title: 'Profile health', status: 'needsSetup', cta: 'Finish setup',
        metrics: [
          { label: 'Profile completeness', value: '86%' },
          { label: 'Suggested fixes',      value: '4' },
        ],
      },
      {
        title: 'Map rankings', status: 'needsSetup', cta: 'Finish setup',
        metrics: [
          { label: 'Map-pack coverage', value: '71%' },
          { label: 'Tracked zones',     value: '49' },
        ],
      },
      {
        title: 'Review health', status: 'needsSetup', cta: 'Finish setup',
        metrics: [
          { label: 'Average rating',   value: '4.6' },
          { label: 'Responses needed', value: '8' },
        ],
      },
    ],
  },
  {
    id: 'content', Icon: FileText, title: 'Content & analytics',
    desc: 'Content gaps, competitor insights, and cross-channel traffic signals.',
    // Theme: fuchsia / pink
    accent: 'text-fuchsia-500', accentBg: 'bg-purple-50', bar: 'bg-fuchsia-500',
    cards: [
      {
        title: 'Content studio', status: 'ready', cta: 'Open dashboard',
        metrics: [
          { label: 'Briefs ready',   value: '4', trend: 33 },
          { label: 'Priority pages', value: '2' },
        ],
      },
      {
        title: 'Search presence', status: 'ready', cta: 'Open dashboard',
        metrics: [
          { label: 'Tracked competitors', value: '6' },
          { label: 'Visibility gaps',     value: '2', trend: -33 },
        ],
      },
      {
        title: 'Traffic & engagement', status: 'needsSetup', cta: 'Finish setup',
        metrics: [
          { label: 'Sessions',         value: '84.6K', trend: 9 },
          { label: 'Engaged sessions', value: '49.8K', trend: 7 },
        ],
      },
    ],
  },
]

// ─── Setup workspace (unified with connections) ───────────────────────────────
// Visual pattern aligned with HighRise HLProgressSteps:
// https://highrise.gohighlevel.com/components/navigation/progress-steps
// complete = success green · current = primary blue · default = gray

function SetupProgressSteps({ steps, setupComplete }) {
  // Circle 32px. Line starts/ends 32px from each circle edge.
  // Equal columns keep first/last steps inset — Listings won't sit flush on the card edge.
  const CIRCLE = 32
  const GAP = 32

  return (
    <div
      className="grid w-full"
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      role="list"
      aria-label="Workspace setup progress"
    >
      {steps.map((step, i) => {
        const status = setupComplete ? 'complete' : step.status
        const complete = status === 'complete'
        const current = status === 'current'
        const isLast = i === steps.length - 1

        return (
          <div key={step.id} className="relative flex flex-col items-center min-w-0" role="listitem">
            {/* Connector to next step: 32px gap from each circle */}
            {!isLast && (
              <div
                className={`absolute top-4 h-0.5 rounded-full z-0 ${complete ? 'bg-success-600' : 'bg-gray-200'}`}
                style={{
                  left: `calc(50% + ${CIRCLE / 2 + GAP}px)`,
                  width: `calc(100% - ${CIRCLE + GAP * 2}px)`,
                }}
                aria-hidden="true"
              />
            )}

            <div
              className={`relative z-10 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                complete
                  ? 'bg-success-600 border-success-600 text-white'
                  : current
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
              }`}
              style={{ width: CIRCLE, height: CIRCLE }}
              aria-current={current ? 'step' : undefined}
            >
              {complete
                ? <Check size={14} strokeWidth={2.5} />
                : <span className="text-[12px] font-semibold">{i + 1}</span>}
            </div>

            <p
              className={`mt-2 text-[12px] font-medium text-center m-0 leading-snug w-full px-1 ${
                complete ? 'text-success-700' : current ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              {step.title}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function SetupWorkspaceCard({ onConnect, setupComplete }) {
  const completedCount = setupComplete
    ? SETUP_CONNECTIONS.length
    : SETUP_CONNECTIONS.filter(s => s.status === 'complete').length

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div className="min-w-0">
          <h1 className="text-[16px] font-semibold text-gray-900 m-0 leading-snug">Setup your workspace</h1>
          <p className="text-[14px] font-normal text-gray-500 mt-1 mb-0 leading-relaxed">
            Ramada International · ramada.9hf9h.com · Hotel &amp; Hospitality
          </p>
        </div>
        <p className="text-[13px] font-medium text-gray-400 m-0 shrink-0">
          {setupComplete
            ? 'All steps completed'
            : `Step ${completedCount + 1} of ${SETUP_CONNECTIONS.length}`}
        </p>
      </div>

      {/* HLProgressSteps-style horizontal stepper */}
      <SetupProgressSteps steps={SETUP_CONNECTIONS} setupComplete={setupComplete} />

      {/* Connections list — same card, subtle rows with clear unlock copy */}
      <div className="mt-6 border-t border-gray-100">
        {setupComplete ? (
          <div className="flex items-start gap-3 py-4">
            <CircleCheck size={16} className="text-success-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[14px] font-semibold text-success-700 m-0">You&apos;re ready to start digging in</p>
              <p className="text-[13px] font-normal text-gray-500 m-0 mt-0.5">
                Every dashboard can now show live data for AI search, local, and analytics.
              </p>
            </div>
          </div>
        ) : (
          SETUP_CONNECTIONS.map(item => {
            const complete = item.status === 'complete'
            const current = item.status === 'current'
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 py-4 border-b border-gray-100 last:border-b-0 bg-white"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  complete ? 'bg-success-50' : current ? 'bg-primary-50' : 'bg-gray-50'
                }`}>
                  {complete
                    ? <CircleCheck size={16} className="text-success-600" />
                    : <item.Icon size={16} className={current ? 'text-primary-600' : 'text-gray-400'} />
                  }
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-semibold text-gray-900 m-0">{item.title}</p>
                    {complete && (
                      <span className="text-[12px] font-medium text-success-700">Connected</span>
                    )}
                    {current && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-primary-600 text-[11px] font-medium border border-primary-200 bg-white">
                        Next step
                      </span>
                    )}
                    {!complete && !current && (
                      <span className="text-[12px] font-normal text-gray-400">{item.meta}</span>
                    )}
                  </div>
                  <p className="text-[13px] font-normal text-gray-500 m-0 mt-0.5">
                    {item.unlocks}
                  </p>
                </div>

                {complete && (
                  <button
                    type="button"
                    className="text-[13px] font-medium text-primary-600 hover:text-primary-700 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-0.5"
                  >
                    {item.cta} <ChevronRight size={13} />
                  </button>
                )}
                {current && (
                  <button
                    type="button"
                    onClick={onConnect}
                    className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold transition-colors shrink-0"
                  >
                    {item.cta} <ChevronRight size={13} />
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ─── Module readiness strip ───────────────────────────────────────────────────

function ModuleReadinessStrip() {
  const sections = MODULE_SECTIONS.map(s => {
    const ready = s.cards.filter(c => c.status === 'ready').length
    const total = s.cards.length
    return { ...s, ready, total, pct: Math.round((ready / total) * 100) }
  })
  const totalNeeds = sections.reduce((a, s) => a + (s.total - s.ready), 0)
  const totalMods = sections.reduce((a, s) => a + s.total, 0)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="mb-6">
        <p className="text-[16px] font-semibold text-gray-900 m-0">Module readiness</p>
        <p className="text-[14px] font-normal text-gray-500 m-0 mt-0.5">
          {totalNeeds} of {totalMods} modules still need setup
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sections.map(s => (
          <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className={`w-8 h-8 rounded-lg ${s.accentBg} flex items-center justify-center shrink-0`}>
                <s.Icon size={14} className={s.accent} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-gray-900 m-0 truncate">{s.title}</p>
                <p className="text-[12px] font-normal text-gray-400 m-0 tabular-nums">{s.ready}/{s.total}</p>
              </div>
            </div>
            <ProgressBar pct={s.pct} colorClass={s.bar} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Module section table ─────────────────────────────────────────────────────

function MetricCell({ metric }) {
  if (!metric) return null
  return (
    <div>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="text-[16px] font-semibold text-gray-900 tabular-nums leading-none">{metric.value}</span>
        <TrendBadge value={metric.trend} />
      </div>
      <p className="text-[14px] font-normal text-gray-500 m-0 mt-1">{metric.label}</p>
    </div>
  )
}

function ModuleSectionCard({ section }) {
  const ready = section.cards.filter(c => c.status === 'ready').length
  const total = section.cards.length
  const { Icon, title, desc, accent, accentBg, cards } = section

  return (
    <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Section header — 16px semibold title, 14px regular subtext; 24px card padding */}
      <div className="px-6 pt-6 pb-4 flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${accentBg} flex items-center justify-center shrink-0`}>
          <Icon size={18} className={accent} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[16px] font-semibold text-gray-900 m-0">{title}</h2>
            <ReadyBadge ready={ready} total={total} />
          </div>
          <p className="text-[14px] font-normal text-gray-500 m-0 mt-1 leading-relaxed">{desc}</p>
        </div>
      </div>

      {/* Table — grey header row matches Site Health / AI Search table th pattern */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr className="border-t border-gray-200 bg-gray-50">
              <th className="px-6 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-b border-gray-200" style={{ width: '28%' }}>Module</th>
              <th className="px-6 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-b border-gray-200" style={{ width: '28%' }}>Primary metric</th>
              <th className="px-6 py-2.5 text-left text-[12px] font-semibold text-gray-900 border-b border-gray-200" style={{ width: '28%' }}>Secondary metric</th>
              <th className="px-6 py-2.5 text-right text-[12px] font-semibold text-gray-900 border-b border-gray-200" style={{ width: '16%' }} />
            </tr>
          </thead>
          <tbody>
            {cards.map(card => {
              const isReady = card.status === 'ready'
              const primary = card.metrics[0]
              const secondary = card.metrics[1]
              return (
                <tr key={card.title} className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isReady ? 'bg-success-600' : 'bg-gray-300'}`} />
                      <span className="text-[14px] font-medium text-gray-900">{card.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <MetricCell metric={primary} />
                  </td>
                  <td className="px-6 py-4">
                    <MetricCell metric={secondary} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-[14px] font-medium text-primary-600 hover:text-primary-700 transition-colors whitespace-nowrap"
                    >
                      {isReady ? 'Open dashboard' : 'Finish setup'} <ChevronRight size={13} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ─── Setup Modal (preserved flow) ─────────────────────────────────────────────

// Canonical input spec (sm / 32px, 8px radius, gray-300 border) — mirrors HLInput.
const INPUT_STYLE = {
  width: '100%', height: 32, padding: '0 12px', borderRadius: 8,
  border: '1px solid #D0D5DD', fontSize: 14, color: '#101828',
  outline: 'none', background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit',
}
const LABEL_STYLE = { fontSize: 13, fontWeight: 500, color: '#344054', display: 'block', marginBottom: 6 }

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
            <label style={{ fontSize: 12, color: '#667085', display: 'block', marginBottom: 6, fontWeight: 500 }}>Country</label>
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
            <label style={{ fontSize: 12, color: '#667085', display: 'block', marginBottom: 6, fontWeight: 500 }}>State / region <span style={{ color: '#98A2B3' }}>(optional)</span></label>
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

const TABLE_TH = { padding: '8px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#101828' }
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
                <button type="button" onClick={addKeyword} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #D0D5DD', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Plus size={11} style={{ color: '#667085' }} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
              <td style={{ padding: '8px 16px' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <textarea value={newPrompt} onChange={e => setNewPrompt(e.target.value)} placeholder="Add a strategic AI search prompt" rows={2} style={{ flex: 1, border: '1px solid #EAECF0', borderRadius: 8, padding: '7px 10px', fontSize: 13, color: '#667085', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }} />
                  <button type="button" onClick={addPrompt} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #D0D5DD', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 4 }}>
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
                <button type="button" onClick={addCompetitor} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid #D0D5DD', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
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
  // HARDCODED: seed setup wizard rows for prototyping
  const [keywords, setKeywords] = useState([{ id: 1, use: true, keyword: 'jbubub', searches: 'No data', difficulty: 'No data' }])
  const [newKeyword, setNewKeyword] = useState('')
  const [prompts, setPrompts] = useState([{ id: 1, use: true, prompt: 'erfrgrgrtgtghtgh' }])
  const [newPrompt, setNewPrompt] = useState('')
  const [competitors, setCompetitors] = useState([{ id: 1, use: true, brand: 'Google', domain: 'google.com', notes: 'Competitor metrics are unavailable because SE Ranking credentials are not configured.' }])
  const [newBrand, setNewBrand] = useState('')
  const [newDomain, setNewDomain] = useState('')

  const STEPS = [
    { label: 'Step 1', title: 'GBP & website', Icon: Globe },
    { label: 'Step 2', title: 'Keywords & prompts', Icon: Search },
    { label: 'Step 3', title: 'Competitors', Icon: BarChart3 },
  ]

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      className="fixed inset-0 z-[9999] bg-gray-900/45 flex items-center justify-center p-6"
    >
      <div className="bg-white rounded-xl w-full max-w-[720px] max-h-[calc(100vh-48px)] flex flex-col shadow-2xl">
        <div className="px-6 pt-6 pb-5 border-b border-gray-200 shrink-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-[16px] font-semibold text-gray-900 m-0">Complete your Visibility AI setup</h2>
              <p className="text-[14px] font-normal text-gray-500 m-0 mt-1">Add business details, search priorities, and competitors to sharpen audits and insights.</p>
            </div>
            <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0">
              <X size={14} className="text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {STEPS.map(({ label, title, Icon: SIcon }, i) => {
              const done = i < step
              const active = i === step
              return (
                <div
                  key={label}
                  className={`px-3.5 py-2.5 rounded-xl border flex items-center gap-2.5 ${
                    done ? 'border-success-600 bg-success-50' : active ? 'border-primary-600 bg-primary-50' : 'border-gray-200 bg-gray-25'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                    done ? 'bg-success-600 border-success-600' : active ? 'bg-primary-50 border-primary-600' : 'bg-gray-100 border-gray-300'
                  }`}>
                    {done ? <Check size={12} className="text-white" strokeWidth={3} /> : <SIcon size={12} className={active ? 'text-primary-600' : 'text-gray-400'} />}
                  </div>
                  <div>
                    <p className={`text-[10px] font-medium tracking-wide m-0 ${done ? 'text-success-700' : active ? 'text-primary-600' : 'text-gray-400'}`}>{label}</p>
                    <p className={`text-[13px] font-semibold m-0 ${done ? 'text-success-700' : active ? 'text-gray-900' : 'text-gray-500'}`}>{title}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {step === 0 && <SetupStep1 gbpLink={gbpLink} setGbpLink={setGbpLink} websiteUrl={websiteUrl} setWebsiteUrl={setWebsiteUrl} brandName={brandName} setBrandName={setBrandName} country={country} setCountry={setCountry} region={region} setRegion={setRegion} />}
          {step === 1 && <SetupStep2 keywords={keywords} setKeywords={setKeywords} newKeyword={newKeyword} setNewKeyword={setNewKeyword} prompts={prompts} setPrompts={setPrompts} newPrompt={newPrompt} setNewPrompt={setNewPrompt} />}
          {step === 2 && <SetupStep3 competitors={competitors} setCompetitors={setCompetitors} newBrand={newBrand} setNewBrand={setNewBrand} newDomain={newDomain} setNewDomain={setNewDomain} />}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2 shrink-0">
          <button type="button" onClick={onClose} className="h-9 px-4 rounded-lg border border-gray-300 bg-white text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Close</button>
          {step > 0 && (
            <button type="button" onClick={() => setStep(s => s - 1)} className="h-9 px-3.5 rounded-lg border border-gray-300 bg-white text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5">
              <ArrowLeft size={13} /> Previous step
            </button>
          )}
          {step < 2 ? (
            <button type="button" onClick={() => setStep(s => s + 1)} className="h-9 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold transition-colors">
              Save and continue to {step === 0 ? 'keywords' : 'competitors'}
            </button>
          ) : (
            <button type="button" onClick={onComplete} className="h-9 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold transition-colors">
              Save and complete setup
            </button>
          )}
        </div>
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
        <div className="max-w-[1200px] mx-auto px-6 pt-6 pb-12 flex flex-col gap-5">
          <SetupWorkspaceCard
            setupComplete={setupComplete}
            onConnect={() => setShowSetupModal(true)}
          />
          <ModuleReadinessStrip />
          {MODULE_SECTIONS.map(section => (
            <ModuleSectionCard key={section.id} section={section} />
          ))}
        </div>
      </div>
    </div>
  )
}
