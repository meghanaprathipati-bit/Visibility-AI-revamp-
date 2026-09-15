import {
  AlertTriangle, CircleX, Clock, FileText, LayoutDashboard, LayoutList,
  Link2, RefreshCw02, Settings, ChevronRight,
} from '../../icons/index.js'
import CountCard from '../CountCard.jsx'
import HLButton from '../HLButton.jsx'
import SectionInfoTip from '../SectionInfoTip.jsx'
import { useExperiencePreview } from '../ExperiencePreviewPanel.jsx'
import SeoAuditActionsEmptyView from './SeoAuditActionsEmptyView.jsx'

const CARD = 'border border-gray-200 rounded-lg bg-white shrink-0'
const TH = 'px-3 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap'
const TD = 'px-3 py-2.5 text-[14px] text-gray-600'
const MUTED = 'text-[13px] font-normal text-gray-500 m-0 mt-0.5'
const TABLE_WRAP = 'overflow-x-auto border border-gray-200 rounded-lg bg-white'

// HARDCODED: prototype KPI strip for SEO Audit Overview — replace with live scan metrics.
const OVERVIEW_KPIS = [
  {
    label: 'Health score',
    value: '82/100',
    description: 'Latest completed scan',
    Icon: LayoutList,
    iconColor: 'var(--primary-600)',
    helpContent: 'Overall SEO audit score from the latest completed crawl. Higher is better.',
  },
  {
    label: 'Pages needing attention',
    value: '10 of 10',
    description: 'Across crawled pages',
    Icon: FileText,
    iconColor: 'var(--primary-600)',
    helpContent: 'Crawled pages that still have at least one open finding.',
  },
  {
    label: 'Critical items',
    value: '2',
    description: 'Highest priority',
    Icon: AlertTriangle,
    iconColor: 'var(--error-600)',
    helpContent: 'Open findings marked as the highest priority from this scan.',
  },
  {
    label: 'Broken links',
    value: '0',
    description: '4xx and 5xx destinations',
    Icon: Link2,
    iconColor: 'var(--warning-600)',
    helpContent: 'Internal or external links that resolve to a 4xx or 5xx response.',
  },
]

// HARDCODED: priority findings from the latest scan — replace with findings API.
const PRIORITY_ITEMS = [
  { item: 'Pages4xx', area: 'Crawlability', priority: 'High', affected: 1 },
  { item: 'Title Missing', area: 'Content', priority: 'High', affected: 1 },
  { item: 'Image No Alt', area: 'Content', priority: 'Medium', affected: 4 },
  { item: 'Description Missing', area: 'Content', priority: 'Medium', affected: 3 },
  { item: 'Page Slow', area: 'Performance', priority: 'Medium', affected: 3 },
]

const PRIORITY_PILL = {
  High: 'bg-error-50 text-error-600 border-error-200',
  Medium: 'bg-warning-100 text-warning-600 border-warning-200',
}

// HARDCODED: crawl / indexability rollup — replace with crawl summary API.
const CRAWL_ROWS = [
  { signal: 'Indexable pages', pages: 4, meaning: 'Eligible to be considered for search results.', status: 'Ready' },
  { signal: 'Not indexable', pages: 2, meaning: 'Excluded by a technical signal such as noindex, canonicalization, or access rules.', status: 'Review' },
  { signal: 'Redirect responses', pages: 2, meaning: 'URLs that send crawlers and visitors to another location.', status: 'Review' },
  { signal: 'Page errors', pages: 0, meaning: 'Crawled pages returning a 4xx or 5xx response.', status: 'Clear' },
]

const STATUS_PILL = {
  Ready: 'bg-success-50 text-success-700 border-success-200',
  Review: 'bg-warning-100 text-warning-700 border-warning-200',
  Clear: 'bg-success-50 text-success-700 border-success-200',
}

// HARDCODED: link discovery counts — replace with link inventory API.
const LINK_STATS = [
  { label: 'Links found', value: 12 },
  { label: 'Internal links', value: 0 },
  { label: 'External links', value: 0 },
]

// HARDCODED: Core Web Vitals from the latest crawl — replace with CWV API.
const CWV_METRICS = [
  { label: 'Loading', value: '2.4s', caption: 'LCP' },
  { label: 'Responsiveness', value: '168ms', caption: 'INP' },
  { label: 'Visual stability', value: '0.080', caption: 'CLS' },
]

// HARDCODED: crawled resource inventory — replace with resource crawl API.
const RESOURCE_STATS = [
  { label: 'Unique resources', value: '10' },
  { label: 'Images', value: '3' },
  { label: 'JavaScript files', value: '2' },
  { label: 'Total transfer size', value: '2.6 MB' },
]

function Pill({ children, className }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[13px] font-medium ${className}`}>
      {children}
    </span>
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

const NAME_LINK =
  'text-[14px] font-medium text-primary-600 hover:text-primary-700 hover:underline text-left bg-transparent border-0 p-0 cursor-pointer'
const AREA_TAG =
  'inline-flex items-center px-2 py-0.5 rounded-full border border-primary-200 bg-primary-50 text-[13px] font-medium text-primary-700'

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

// HARDCODED: saved crawl settings from the failed first SEO scan — replace with setup API.
const SAVED_SEO_SETUP = [
  { label: 'User agent', value: 'Googlebot' },
  { label: 'Maximum pages', value: '10' },
  { label: 'Crawl speed', value: '500 req/s' },
]

const FAIL_SHELL = 'flex-1 min-h-0 overflow-y-auto bg-gray-50 flex justify-center p-6'
const FAIL_COLUMN = 'w-full max-w-[880px]'

function SeoAuditFailedState({ onInitiateScan }) {
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
              <span className="text-[13px] font-medium text-error-600">SEO audit setup needs attention</span>
            </div>

            <div className="grid gap-5 mt-5 items-start" style={{ gridTemplateColumns: 'minmax(0, 1.4fr) minmax(220px, 0.8fr)' }}>
              <div className="min-w-0">
                <h2 className="text-[18px] font-semibold text-gray-900 m-0 leading-snug">
                  We couldn't prepare your SEO audit results
                </h2>
                <p className="text-[14px] font-normal text-gray-500 m-0 mt-2 leading-relaxed">
                  Something went wrong while we were collecting your first SEO audit results for ramada.9hf9h.com. No results are available yet, but your SEO audit setup is saved.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3.5">
                <p className="text-[13px] font-medium text-gray-500 m-0 mb-3">SEO audit setup</p>
                <div className="flex flex-col gap-2.5">
                  {SAVED_SEO_SETUP.map(row => (
                    <div key={row.label} className="flex items-baseline justify-between gap-3">
                      <p className="text-[14px] text-gray-600 m-0">{row.label}</p>
                      <p className="text-[14px] font-semibold text-gray-900 m-0 text-right">{row.value}</p>
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
                    We couldn't finish analyzing your SEO audit data.
                  </p>
                  <p className="text-[14px] font-normal text-gray-500 m-0 mt-0.5">
                    Try again with the same website and crawl settings.
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

export default function SeoAuditOverviewDashboard({
  previewFixture,
  onViewActions,
  onViewPages,
  onViewLinks,
  onViewResources,
}) {
  const { fixture: hookFixture, resetToLive } = useExperiencePreview()
  const fixture = previewFixture ?? hookFixture

  function handleInitiateScan() {
    resetToLive()
  }

  const header = (
    <div className="bg-white border-b border-gray-200 shrink-0">
      <div className="px-6 py-5 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
            <LayoutDashboard size={20} className="text-primary-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-[18px] font-bold text-gray-900 m-0">Overview</h1>
              <SectionInfoTip
                id="seo-audit-overview-info"
                content="See your overall SEO audit score, crawl status, and highest-impact detected items."
              />
            </div>
            <p className="text-[13px] text-gray-500 m-0 mt-0.5">
              See your overall SEO audit score, crawl status, and highest-impact detected items.
            </p>
          </div>
        </div>
        {fixture === 'data-loading-failed' ? (
          <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[14px] font-medium text-gray-400 shrink-0">
            <Clock size={14} />
            Sep 11, 2026 · 3:19:48 PM
          </span>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-300 bg-white text-[14px] font-medium text-gray-700">
              <Clock size={14} className="text-gray-500" />
              Sep 11, 2026 · 3:19:48 PM
            </span>
            <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[14px] font-medium text-gray-500">
              <Clock size={14} />
              Next scan Oct 1
            </span>
            <HLButton variant="primary" color="blue" size="sm">
              <RefreshCw02 />
              Rerun scan
            </HLButton>
            <HLButton variant="secondary" color="gray" size="sm">
              <Settings size={16} />
              Settings
            </HLButton>
          </div>
        )}
      </div>
    </div>
  )

  if (fixture === 'setup-failed') {
    return <SeoAuditActionsEmptyView />
  }

  if (fixture === 'data-loading-failed') {
    return (
      <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-gray-50">
        {header}
        <SeoAuditFailedState onInitiateScan={handleInitiateScan} />
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-gray-50">
      {header}
      <div className="flex-1 overflow-y-auto min-h-0 px-5 pt-5 pb-5 flex flex-col gap-4" style={{ scrollbarGutter: 'stable' }}>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 shrink-0">
          {OVERVIEW_KPIS.map(kpi => (
            <CountCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              description={kpi.description}
              Icon={kpi.Icon}
              iconColor={kpi.iconColor}
              helpContent={kpi.helpContent}
            />
          ))}
        </div>

        <SectionBand
          title="What should you look at first?"
          description="Start with high-priority items affecting the most pages."
        />

        <div className={`${CARD} p-5`}>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h2 className="text-[14px] font-semibold text-gray-900 m-0">Priority items</h2>
              <p className={MUTED}>
                Recommendations and affected URLs from the latest scan.
              </p>
            </div>
            <TextLink onClick={onViewActions}>View actions</TextLink>
          </div>
          <div className={TABLE_WRAP}>
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className={TH}>Detected item</th>
                  <th className={TH}>Area</th>
                  <th className={TH}>Priority</th>
                  <th className={`${TH} text-right`}>Affected</th>
                </tr>
              </thead>
              <tbody>
                {PRIORITY_ITEMS.map(row => (
                  <tr key={row.item} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className={TD}>
                      <button type="button" onClick={onViewActions} className={NAME_LINK}>
                        {row.item}
                      </button>
                    </td>
                    <td className={TD}>
                      <span className={AREA_TAG}>{row.area}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <Pill className={PRIORITY_PILL[row.priority]}>{row.priority}</Pill>
                    </td>
                    <td className="px-3 py-2.5 text-[14px] text-gray-600 text-right tabular-nums">{row.affected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <SectionBand
          title="Can search engines reach and understand the site?"
          description="Check page access and the internal paths that help crawlers find content."
        />

        <div className="grid gap-4 items-stretch shrink-0" style={{ gridTemplateColumns: 'minmax(0, 2.2fr) minmax(220px, 0.8fr)' }}>
          <div className={`${CARD} p-5 min-w-0 h-full`}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h3 className="text-[14px] font-semibold text-gray-900 m-0">Crawl and indexability</h3>
                <p className={MUTED}>Page eligibility and response health.</p>
              </div>
              <TextLink onClick={onViewPages}>Review pages</TextLink>
            </div>
            <div className={TABLE_WRAP}>
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className={TH}>Page signal</th>
                    <th className={`${TH} text-right`}>Pages</th>
                    <th className={TH}>What it means</th>
                    <th className={TH}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {CRAWL_ROWS.map(row => (
                    <tr key={row.signal} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className={TD}>
                        <button type="button" onClick={onViewPages} className={NAME_LINK}>
                          {row.signal}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-[14px] text-gray-600 text-right tabular-nums">{row.pages}</td>
                      <td className={TD}>{row.meaning}</td>
                      <td className="px-3 py-2.5">
                        <Pill className={STATUS_PILL[row.status]}>{row.status}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`${CARD} p-5 min-w-0 h-full flex flex-col`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <h3 className="text-[14px] font-semibold text-gray-900 m-0">Link discovery</h3>
                <p className={MUTED}>Internal and external paths found in the crawl.</p>
              </div>
              <TextLink onClick={onViewLinks}>Review links</TextLink>
            </div>
            <div>
              {LINK_STATS.map(stat => (
                <div key={stat.label} className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0">
                  <p className="text-[14px] text-gray-600 m-0">{stat.label}</p>
                  <p className="text-[16px] font-semibold text-gray-900 tabular-nums m-0">{stat.value}</p>
                </div>
              ))}
            </div>
            <p className={`${MUTED} mt-3`}>
              Use the Links module to inspect source pages, destinations, status codes, and follow signals.
            </p>
          </div>
        </div>

        <SectionBand
          title="Is the site fast and dependable for visitors?"
          description="Review Core Web Vitals and the assets that influence loading."
        />

        <div className="grid gap-4 items-stretch shrink-0" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
          <div className={`${CARD} p-5 min-w-0`}>
            <h3 className="text-[14px] font-semibold text-gray-900 m-0">Core Web Vitals</h3>
            <p className={`${MUTED} mb-4`}>Loading, responsiveness, and visual stability.</p>
            <div className="grid grid-cols-3 gap-4">
              {CWV_METRICS.map(metric => (
                <div key={metric.caption}>
                  <p className="text-[14px] font-medium text-gray-500 m-0">{metric.label}</p>
                  <p className="text-[16px] font-semibold text-gray-900 tabular-nums m-0 mt-1">{metric.value}</p>
                  <p className="text-[12px] font-medium text-gray-400 m-0 mt-0.5">{metric.caption}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${CARD} p-5 min-w-0`}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h3 className="text-[14px] font-semibold text-gray-900 m-0">Crawled resources</h3>
                <p className={MUTED}>Images, scripts, and other files loaded by the site.</p>
              </div>
              <TextLink onClick={onViewResources}>Review resources</TextLink>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {RESOURCE_STATS.map(stat => (
                <div key={stat.label}>
                  <p className="text-[14px] font-medium text-gray-500 m-0">{stat.label}</p>
                  <p className="text-[16px] font-semibold text-gray-900 tabular-nums m-0 mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
