import { useEffect, useRef, useState } from 'react'
import {
  AlertTriangle, Award, BarChart3, Calendar, ChevronDown, ChevronRight, CircleX, Clock, Code2,
  FileText, LayoutDashboard, Link2, Megaphone, RefreshCw02, Settings, TrendingUp,
} from '../../icons/index.js'
import CountCard from '../CountCard.jsx'
import HLButton from '../HLButton.jsx'
import HLTabs, { HLTabPane } from '../HLTabs.jsx'
import SectionInfoTip from '../SectionInfoTip.jsx'
import CompetitorRankingMiniTable from '../CompetitorRankingMiniTable.jsx'
import EngineLogo from '../EngineLogo.jsx'
import MultiLineChart from './MultiLineChart.jsx'
import AiSentimentChart from './AiSentimentChart.jsx'
import AiSearchActionsEmptyView from './AiSearchActionsEmptyView.jsx'
import { useExperiencePreview } from '../ExperiencePreviewPanel.jsx'

const CARD = 'border border-gray-200 rounded-lg bg-white shrink-0'
const TH = 'px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap'
const TD = 'px-3 py-2.5 text-[14px] text-gray-600'
const MUTED = 'text-[13px] font-normal text-gray-500 m-0 mt-0.5'
const TABLE_WRAP = 'overflow-x-auto border border-gray-200 rounded-lg bg-white'

function visibilityTier(value) {
  if (value >= 70) return { text: 'text-success-600', bar: 'bg-success-600' }
  if (value >= 50) return { text: 'text-warning-600', bar: 'bg-warning-600' }
  return { text: 'text-error-600', bar: 'bg-error-600' }
}

function ScoreBar({ value }) {
  const tier = visibilityTier(value)
  return (
    <div>
      <p className={`text-[14px] font-semibold tabular-nums m-0 mb-1 ${tier.text}`}>{value}</p>
      <div className="w-[72px] h-1.5 rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${tier.bar}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  )
}

const DATE_OPTIONS = ['Past 7 days', 'Past 30 days', 'Past 90 days']

// HARDCODED: prototype KPI strip for AI Search Overview — replace with live metrics.
const OVERVIEW_KPIS = [
  {
    label: 'AI search visibility score',
    value: '65/100',
    delta: '4.2%',
    deltaUp: true,
    Icon: TrendingUp,
    iconColor: 'var(--primary-600)',
    helpContent: 'Overall visibility across tracked AI platforms for the selected period. Higher is better.',
  },
  {
    label: 'Competitive rank',
    value: '#2 / 6',
    description: 'Latest period rank',
    Icon: Award,
    iconColor: 'var(--purple-600)',
    helpContent: 'Your rank among tracked competitors for AI search visibility.',
  },
  {
    label: 'Citation rate',
    value: '56%',
    delta: '2.1%',
    deltaUp: true,
    Icon: Link2,
    iconColor: 'var(--success-600)',
    helpContent: 'Share of AI answers that cite a page on your domain.',
  },
  {
    label: 'Share of voice',
    value: '21%',
    delta: '1.4%',
    deltaUp: false,
    Icon: BarChart3,
    iconColor: 'var(--warning-600)',
    helpContent: 'Your brand’s share of AI mentions versus tracked competitors.',
  },
]

// HARDCODED: next-best-action groups — replace with action-items API.
const IMPROVE_NEXT = [
  {
    title: 'Boost content visibility',
    count: 15,
    countLabel: '15 open',
    tone: 'warning',
    description: 'Create content for prompts where you are missing.',
    Icon: FileText,
  },
  {
    title: 'Technical items',
    count: 0,
    countLabel: '0 open',
    tone: 'success',
    description: 'Schema, robots.txt, llms.txt, and crawl access issues.',
    Icon: Code2,
  },
  {
    title: 'Get external mentions',
    count: 9,
    countLabel: '9 open',
    tone: 'warning',
    description: 'Earn mentions and citations from third-party sources.',
    Icon: Megaphone,
  },
]

const COUNT_TAG = {
  warning: 'bg-warning-100 text-warning-600 border-warning-200',
  success: 'bg-success-50 text-success-600 border-success-200',
}

const TREND_X_LABELS = ['Aug 12', 'Aug 18', 'Aug 24', 'Aug 30', 'Sep 5', 'Sep 10']

// HARDCODED: competitor trend series matching the overview mock (HubSpot leads, GHL trails).
const TREND_LINES_MAP = {
  Visibility: [
    { label: 'Go High Level', color: 'var(--primary-600)', data: [77, 77, 78, 78, 70, 72] },
    { label: 'HubSpot', color: 'var(--fuchsia-500)', data: [99, 99, 99, 98, 88, 91] },
    { label: 'Calendly', color: 'var(--teal-600)', data: [62, 63, 64, 63, 58, 60] },
    { label: 'Pipedrive', color: 'var(--gray-400)', data: [44, 45, 44, 46, 42, 43] },
  ],
  Mentions: [
    { label: 'Go High Level', color: 'var(--primary-600)', data: [68, 69, 70, 69, 62, 64] },
    { label: 'HubSpot', color: 'var(--fuchsia-500)', data: [92, 93, 93, 91, 84, 86] },
    { label: 'Calendly', color: 'var(--teal-600)', data: [55, 56, 57, 56, 51, 53] },
    { label: 'Pipedrive', color: 'var(--gray-400)', data: [38, 39, 38, 40, 36, 37] },
  ],
  Citations: [
    { label: 'Go High Level', color: 'var(--primary-600)', data: [41, 42, 43, 42, 36, 38] },
    { label: 'HubSpot', color: 'var(--fuchsia-500)', data: [74, 75, 76, 74, 68, 70] },
    { label: 'Calendly', color: 'var(--teal-600)', data: [33, 34, 35, 34, 30, 32] },
    { label: 'Pipedrive', color: 'var(--gray-400)', data: [22, 23, 22, 24, 20, 21] },
  ],
}

const PLATFORM_META = 'US · 123 Luxury Avenue, Manhattan, New York, NY 10001 · EN · 20 prompts'

// HARDCODED: competitive leaderboard for this overview.
const LEADERBOARD_ROWS = [
  { rank: 1, name: 'HubSpot', domain: 'hubspot.com', initials: 'H', color: 'var(--warning-600)', pos: 2.1, visibility: '78%', sov: '24%' },
  { rank: 2, name: 'Go High Level', domain: 'gohighlevel.com', initials: 'GH', color: 'var(--purple-600)', pos: 4.8, visibility: '65%', sov: '21%', isMe: true },
  { rank: 3, name: 'Calendly', domain: 'calendly.com', initials: 'C', color: 'var(--teal-600)', pos: 2.8, visibility: '62%', sov: '18%' },
  { rank: 4, name: 'Pipedrive', domain: 'pipedrive.com', initials: 'P', color: 'var(--purple-600)', pos: 4.2, visibility: '41%', sov: '11%' },
  { rank: 5, name: 'Salesforce', domain: 'salesforce.com', initials: 'S', color: 'var(--primary-300)', pos: 4.6, visibility: '37%', sov: '10%' },
  { rank: 6, name: 'ActiveCampaign', domain: 'activecampaign.com', initials: 'A', color: 'var(--success-600)', pos: 5.1, visibility: '32%', sov: '8%' },
]

// HARDCODED: visibility by AI platform — EngineLogo names must match EngineLogo map.
const PLATFORM_ROWS = [
  { logo: 'AI Overview', label: 'Google AI Overview', vis: 62, presence: '76.5%', avgPos: '#4.8', urlsAnswer: '6.3 URLs / answer', citRate: '51.5%', insight: 'Strongly tied to your organic rankings — keep traditional SEO healthy.' },
  { logo: 'AI Mode', label: 'Google AI Mode', vis: 61, presence: '78.0%', avgPos: '#5.7', urlsAnswer: '6.5 URLs / answer', citRate: '52.5%', insight: 'Strong source pickup, but answer prominence is uneven.' },
  { logo: 'ChatGPT', label: 'ChatGPT', vis: 74, presence: '85.0%', avgPos: '#3.6', urlsAnswer: '6.4 URLs / answer', citRate: '66.5%', insight: 'Best current engine for mention depth and citation pickup.' },
  { logo: 'Perplexity', label: 'Perplexity', vis: 76, presence: '88.0%', avgPos: '#2.9', urlsAnswer: '6.5 URLs / answer', citRate: '65.0%', insight: 'Best current engine for mention depth and citation pickup.' },
  { logo: 'Gemini', label: 'Gemini', vis: 52, presence: '66.0%', avgPos: '#6.9', urlsAnswer: '6.5 URLs / answer', citRate: '44.5%', insight: 'Visibility is present, but citations lag the stronger engines.' },
]

// HARDCODED: counts that sum to 100 so the stacked bar percents match the mock (16/18/44/14/8).
const SENTIMENT_BREAKDOWN = {
  total: 100,
  recommended: 16,
  favorable: 18,
  neutral: 44,
  unfavorable: 14,
  dismissed: 8,
}

// HARDCODED: top cited sources.
const TOP_SOURCES = [
  { source: 'ramada.9hf9h.com', coverage: '56%', answers: '—', trust: 92 },
  { source: 'g2.com', coverage: '42%', answers: '—', trust: 88 },
  { source: 'reddit.com', coverage: '36%', answers: '—', trust: 84 },
  { source: 'capterra.com', coverage: '28%', answers: '—', trust: 81 },
]

// HARDCODED: top visibility-driving prompts.
const TOP_PROMPTS = [
  { rank: 1, prompt: 'What are the best 9hf9h reviews options?', category: 'Reputation', coverage: '5/5', visibility: '86/100', citRate: '81%', mentionShare: '100%', mentions: 11 },
  { rank: 2, prompt: 'What ratings does 9hf9h receive?', category: 'General', coverage: '5/5', visibility: '81/100', citRate: '77%', mentionShare: '100%', mentions: 12 },
  { rank: 3, prompt: 'Which 9hf9h alternative offers the best value?', category: 'Comparisons', coverage: '5/5', visibility: '81/100', citRate: '78%', mentionShare: '100%', mentions: 8 },
  { rank: 4, prompt: 'What are the best 9hf9h alternatives options?', category: 'Comparisons', coverage: '5/5', visibility: '81/100', citRate: '79%', mentionShare: '100%', mentions: 10 },
  { rank: 5, prompt: 'What products or services does 9hf9h offer?', category: 'General', coverage: '5/5', visibility: '80/100', citRate: '78%', mentionShare: '100%', mentions: 8 },
]

function PeriodFilter({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-gray-300 bg-white text-[14px] font-medium text-gray-700 hover:bg-gray-50"
      >
        <Calendar size={14} className="text-gray-500" />
        {value}
        <ChevronDown size={14} className="text-gray-500" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 z-20 min-w-[180px] rounded-lg border border-gray-200 bg-white shadow-lg py-1">
          {DATE_OPTIONS.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false) }}
              className={`w-full text-left px-3 py-2 text-[14px] ${
                opt === value ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// DS gap: HighRise has no SectionBand primitive in this React scaffold. Token-only card used 3×.
function SectionBand({ title, description }) {
  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 px-5 py-4 shrink-0">
      <h2 className="text-[16px] font-semibold text-gray-900 m-0">{title}</h2>
      <p className={MUTED}>{description}</p>
    </div>
  )
}

function TextLink({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap text-[14px] font-medium text-primary-600 hover:text-primary-700 bg-transparent border-0 p-0 cursor-pointer"
    >
      {children}
      <ChevronRight size={14} />
    </button>
  )
}

// HARDCODED: saved AI search setup from the failed first scan — replace with setup API.
const SAVED_SETUP = [
  { label: 'Prompt categories', value: 3 },
  { label: 'Prompts', value: 20 },
  { label: 'Competitors', value: 0 },
  { label: 'AI platforms', value: 5 },
]

// Same canvas treatment as Prompt Tracking error/progress: centered column on gray-50, no page header.
const FAIL_SHELL = 'flex-1 min-h-0 overflow-y-auto bg-gray-50 flex justify-center p-6'
const FAIL_COLUMN = 'w-full max-w-[880px]'

function AiSearchFailedState({ onInitiateScan }) {
  return (
    <div className={FAIL_SHELL} style={{ scrollbarGutter: 'stable' }}>
      <div className={FAIL_COLUMN}>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="h-1 bg-error-600" />
          <div className="px-6 py-6">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-lg bg-error-50 flex items-center justify-center shrink-0">
                <CircleX size={16} className="text-error-600" />
              </span>
              <span className="text-[13px] font-medium text-error-600">AI search setup needs attention</span>
            </div>

            <div className="grid gap-5 mt-5 items-start" style={{ gridTemplateColumns: 'minmax(0, 1.4fr) minmax(220px, 0.8fr)' }}>
              <div className="min-w-0">
                <h2 className="text-[18px] font-semibold text-gray-900 m-0 leading-snug">
                  We couldn't prepare your AI search results
                </h2>
                <p className="text-[14px] font-normal text-gray-500 m-0 mt-2 leading-relaxed">
                  Something went wrong while we were collecting your first AI search results. No results are available yet, but your AI search setup is saved.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5">
                <p className="text-[13px] font-medium text-gray-500 m-0 mb-3">AI search setup</p>
                <div className="flex flex-col gap-2.5">
                  {SAVED_SETUP.map(row => (
                    <div key={row.label} className="flex items-baseline justify-between gap-3">
                      <p className="text-[14px] text-gray-600 m-0">{row.label}</p>
                      <p className="text-[14px] font-semibold text-gray-900 m-0 text-right tabular-nums">{row.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-4 flex-wrap rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
                  <AlertTriangle size={14} className="text-error-600" />
                </span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-gray-900 m-0">
                    We couldn't finish analyzing your AI search data.
                  </p>
                  <p className="text-[14px] font-normal text-gray-500 m-0 mt-0.5">
                    Try again with the same prompts, competitors, and AI platforms.
                  </p>
                </div>
              </div>
              <HLButton variant="primary" color="blue" size="sm" onClick={onInitiateScan}>
                <RefreshCw02 />
                Initiate scan
              </HLButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AiSearchOverviewDashboard({
  previewFixture,
  onViewActions,
  onViewCompetitors,
  onViewSources,
  onViewPrompts,
  onInitiateScan,
}) {
  const { fixture: hookFixture, resetToLive } = useExperiencePreview()
  const fixture = previewFixture ?? hookFixture
  const [period, setPeriod] = useState('Past 30 days')
  const [trendMetric, setTrendMetric] = useState('Visibility')
  const trendLines = TREND_LINES_MAP[trendMetric]
  const viewState = fixture === 'setup-failed' || fixture === 'data-loading-failed' ? fixture : 'ready'

  function handleInitiateScan() {
    onInitiateScan?.({
      promptCategories: 3,
      prompts: 20,
      competitors: 0,
      aiPlatforms: 5,
    })
    resetToLive()
  }

  if (viewState === 'data-loading-failed') {
    return (
      <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-gray-50">
        <AiSearchFailedState onInitiateScan={handleInitiateScan} />
      </div>
    )
  }

  if (viewState === 'setup-failed') {
    return <AiSearchActionsEmptyView />
  }

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 shrink-0">
        <div className="px-6 py-5 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
              <LayoutDashboard size={20} className="text-primary-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-[18px] font-bold text-gray-900 m-0">Overview</h1>
                <SectionInfoTip
                  id="ai-search-overview-info"
                  content="Your overall AI search visibility across engines, competitors, sources, and prompts."
                />
              </div>
              <p className="text-[13px] text-gray-500 m-0 mt-0.5">
                See your overall AI search visibility across tracked answer engines.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <PeriodFilter value={period} onChange={setPeriod} />
            <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[14px] font-medium text-gray-400">
              <Clock size={14} />
              Updates in 19h 7m
            </span>
            <HLButton variant="secondary" color="gray" size="sm">
              <Settings size={16} />
              Settings
            </HLButton>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-5 pt-5 pb-5 flex flex-col gap-4" style={{ scrollbarGutter: 'stable' }}>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 shrink-0">
          {OVERVIEW_KPIS.map(kpi => (
            <CountCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta}
              deltaUp={kpi.deltaUp}
              description={kpi.description}
              Icon={kpi.Icon}
              iconColor={kpi.iconColor}
              helpContent={kpi.helpContent}
            />
          ))}
        </div>

        <div className={`${CARD} p-5`}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-[14px] font-semibold text-gray-900 m-0">What should you improve next?</h2>
                <SectionInfoTip
                  id="ai-search-improve-next-info"
                  content="Highest-impact open actions grouped by type."
                />
              </div>
              <p className={MUTED}>
                Start with the recommendations most likely to improve visibility, citations, and share of voice.
              </p>
            </div>
            <TextLink onClick={onViewActions}>View actions</TextLink>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {IMPROVE_NEXT.map(item => {
              const Icon = item.Icon
              return (
                <div key={item.title} className="border border-gray-200 rounded-lg bg-white p-4 flex gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-semibold text-gray-900 m-0">{item.title}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[13px] font-medium ${COUNT_TAG[item.tone]}`}>
                        {item.countLabel}
                      </span>
                    </div>
                    <p className={MUTED}>{item.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <SectionBand
          title="Are you gaining visibility and competitive ground?"
          description="Track how Go High Level’s AI visibility trend compares with the businesses competing for the same answers."
        />

        <div className="grid gap-4 items-stretch shrink-0" style={{ gridTemplateColumns: 'minmax(0, 65fr) minmax(0, 35fr)' }}>
          <div className={`${CARD} p-5 min-w-0 flex flex-col`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-[14px] font-semibold text-gray-900 m-0">Visibility trend</h3>
                  <SectionInfoTip
                    id="ai-search-visibility-trend-info"
                    content="Track how your brand’s visibility, mentions, or citations change over time versus competitors."
                  />
                </div>
                <p className={MUTED}>Daily AI search visibility score · {period}</p>
              </div>
              <HLTabs
                type="segment"
                size="sm"
                theme="gray"
                compact
                value={trendMetric}
                onValueChange={setTrendMetric}
                tabsOnly
              >
                <HLTabPane name="Visibility" tab="Visibility" />
                <HLTabPane name="Mentions" tab="Mentions" />
                <HLTabPane name="Citations" tab="Citations" />
              </HLTabs>
            </div>
            <div className="flex items-center gap-4 mb-3 flex-wrap">
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
            title="Competitive leaderboard"
            subtitle="AI search visibility score across your tracked businesses"
            infoId="ai-search-leaderboard-info"
            infoContent="Compare rank, average position, visibility, and share of voice against tracked competitors."
            rows={LEADERBOARD_ROWS}
            showSentiment={false}
            brandLabel="Business"
            posLabel="Avg position"
            plain
            headerRight={<TextLink onClick={onViewCompetitors}>View competitors</TextLink>}
          />
        </div>

        <SectionBand
          title="Where are AI platforms strengthening or limiting Go High Level’s visibility and perception?"
          description="Compare performance platform by platform, then review how AI answers describe your business—not just whether your business appears."
        />

        <div className={`${CARD} overflow-hidden`}>
          <div className="p-5 pb-3">
            <div className="flex items-center gap-1.5">
              <h3 className="text-[14px] font-semibold text-gray-900 m-0">Visibility by AI platform</h3>
              <SectionInfoTip
                id="ai-search-platform-info"
                content="See how your brand performs across different AI search engines."
              />
            </div>
            <p className={MUTED}>Per-platform visibility, presence, citation rate, and positioning context</p>
          </div>
          <div className="px-5 pb-5">
            <div className={TABLE_WRAP}>
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className={TH}>AI platform</th>
                    <th className={TH}>Visibility</th>
                    <th className={TH}>Presence</th>
                    <th className={TH}>Avg position</th>
                    <th className={TH}>Citation rate</th>
                    <th className={TH}>Insight</th>
                  </tr>
                </thead>
                <tbody>
                  {PLATFORM_ROWS.map(row => (
                    <tr key={row.label} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className={TD}>
                        <div className="flex items-center gap-2 min-w-0">
                          <EngineLogo name={row.logo} size={16} className="w-8 h-8 rounded-lg" />
                          <div className="min-w-0">
                            <p className="text-[14px] font-medium text-gray-900 m-0">{row.label}</p>
                            <p className="text-[12px] text-gray-500 m-0">{PLATFORM_META}</p>
                          </div>
                        </div>
                      </td>
                      <td className={TD}><ScoreBar value={row.vis} /></td>
                      <td className={`${TD} tabular-nums`}>{row.presence}</td>
                      <td className={TD}>
                        <p className="text-[14px] font-semibold text-gray-900 m-0 tabular-nums">{row.avgPos}</p>
                        <p className="text-[12px] text-gray-500 m-0">{row.urlsAnswer}</p>
                      </td>
                      <td className={`${TD} tabular-nums`}>{row.citRate}</td>
                      <td className={TD}>{row.insight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <AiSentimentChart
          title="How AI platforms describe your business"
          subtitle="Recommendation strength, neutral framing, and negative dismissal across detected mentions"
          showCards
          breakdown={SENTIMENT_BREAKDOWN}
          footer="AI answers show mixed momentum. Stronger source coverage and clearer category proof can improve how 9hf9h is framed."
        />

        <div className={`${CARD} overflow-hidden`}>
          <div className="p-5 pb-3 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[14px] font-semibold text-gray-900 m-0">Top cited sources</h3>
                <SectionInfoTip
                  id="ai-search-top-sources-info"
                  content="Domains AI engines cite most often when answering your tracked prompts."
                />
              </div>
              <p className={MUTED}>Sources currently shaping the answers your customers see</p>
            </div>
            <TextLink onClick={onViewSources}>View sources</TextLink>
          </div>
          <div className="px-5 pb-5">
            <div className={TABLE_WRAP}>
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className={TH}>Source</th>
                    <th className={TH}>Prompt coverage</th>
                    <th className={TH}>AI answers</th>
                    <th className={TH}>Domain trust</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_SOURCES.map(row => (
                    <tr key={row.source} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className={`${TD} font-medium text-gray-900`}>{row.source}</td>
                      <td className={`${TD} tabular-nums`}>{row.coverage}</td>
                      <td className={`${TD} tabular-nums`}>{row.answers}</td>
                      <td className={`${TD} tabular-nums`}>{row.trust}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <SectionBand
          title="Which customer questions are driving your strongest visibility?"
          description="Finish at the prompt level to identify the questions worth protecting, expanding, or using as a model for weaker prompt categories."
        />

        <div className={`${CARD} overflow-hidden`}>
          <div className="p-5 pb-3 flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-[14px] font-semibold text-gray-900 m-0">Top visibility-driving prompts</h3>
                <SectionInfoTip
                  id="ai-search-top-prompts-info"
                  content="Prompts where your brand currently earns the most visibility and mentions."
                />
              </div>
              <p className={MUTED}>Highest-visibility prompts in the current date range</p>
            </div>
            <TextLink onClick={onViewPrompts}>View all prompts</TextLink>
          </div>
          <div className="px-5 pb-5">
            <div className={TABLE_WRAP}>
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className={TH}>Prompt</th>
                    <th className={TH}>Prompt category</th>
                    <th className={TH}>Platform coverage</th>
                    <th className={TH}>Visibility</th>
                    <th className={TH}>Citation rate</th>
                    <th className={TH}>Mention share</th>
                    <th className={TH}>Mentions</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_PROMPTS.map(row => (
                    <tr key={row.rank} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className={TD}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-full shrink-0 inline-flex items-center justify-center text-[12px] font-semibold bg-gray-100 text-gray-600">
                            {row.rank}
                          </span>
                          <button
                            type="button"
                            onClick={onViewPrompts}
                            className="text-[14px] font-medium text-primary-600 hover:text-primary-700 hover:underline text-left bg-transparent border-0 p-0 cursor-pointer"
                          >
                            {row.prompt}
                          </button>
                        </div>
                      </td>
                      <td className={TD}>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-primary-200 bg-primary-50 text-[13px] font-medium text-primary-700">
                          {row.category}
                        </span>
                      </td>
                      <td className={`${TD} tabular-nums`}>{row.coverage}</td>
                      <td className={`${TD} font-medium text-gray-900 tabular-nums`}>{row.visibility}</td>
                      <td className={`${TD} tabular-nums`}>{row.citRate}</td>
                      <td className={`${TD} tabular-nums`}>{row.mentionShare}</td>
                      <td className={`${TD} tabular-nums`}>{row.mentions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
