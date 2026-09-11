import {
  AlertTriangle, Clock, FileText, LayoutDashboard, LayoutList,
  Link2, RefreshCw02, Settings, ChevronRight,
} from '../../icons/index.js'
import CountCard from '../CountCard.jsx'
import HLButton from '../HLButton.jsx'
import SectionInfoTip from '../SectionInfoTip.jsx'

const CARD = 'border border-gray-200 rounded-md bg-white shrink-0'
const TH = 'px-4 py-2.5 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap'
const TD = 'px-4 py-2.5 text-[14px] text-gray-600'

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
    <div className="rounded-md border border-purple-200 bg-purple-50 px-5 py-4 shrink-0">
      <h2 className="text-[16px] font-semibold text-gray-900 m-0">{title}</h2>
      <p className="text-[14px] font-normal text-gray-500 m-0 mt-1">{description}</p>
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

export default function SeoAuditOverviewDashboard({
  onViewActions,
  onViewPages,
  onViewLinks,
  onViewResources,
}) {
  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-gray-50">
      <div className="flex-1 overflow-y-auto min-h-0 p-5 pb-8 flex flex-col gap-4" style={{ scrollbarGutter: 'stable' }}>

        <div className="flex items-start justify-between gap-4 flex-wrap shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-md bg-primary-50 flex items-center justify-center shrink-0">
              <LayoutDashboard size={20} className="text-primary-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-[18px] font-semibold text-gray-900 m-0">Overview</h1>
                <SectionInfoTip
                  id="seo-audit-overview-info"
                  content="See your overall SEO audit score, crawl status, and highest-impact detected items."
                />
              </div>
              <p className="text-[14px] font-normal text-gray-500 m-0 mt-0.5">
                See your overall SEO audit score, crawl status, and highest-impact detected items.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <HLButton color="gray" size="sm">
              <Clock />
              Sep 11, 2026 · 3:19:48 PM
            </HLButton>
            <HLButton color="gray" size="sm">
              <Clock />
              Next scan Oct 1
            </HLButton>
            <HLButton variant="primary" color="blue" size="sm">
              <RefreshCw02 />
              Rerun scan
            </HLButton>
            <HLButton color="gray" size="sm">
              <Settings />
              Settings
            </HLButton>
          </div>
        </div>

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
              <p className="text-[14px] font-normal text-gray-500 m-0 mt-1">
                Recommendations and affected URLs from the latest scan.
              </p>
            </div>
            <TextLink onClick={onViewActions}>View actions</TextLink>
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-md bg-white">
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
                  <tr key={row.item} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-2.5 text-[14px] font-medium text-gray-900">{row.item}</td>
                    <td className={TD}>{row.area}</td>
                    <td className="px-4 py-2.5">
                      <Pill className={PRIORITY_PILL[row.priority]}>{row.priority}</Pill>
                    </td>
                    <td className="px-4 py-2.5 text-[14px] text-gray-900 text-right tabular-nums">{row.affected}</td>
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

        <div className="grid gap-4 items-stretch shrink-0" style={{ gridTemplateColumns: 'minmax(0, 65fr) minmax(0, 35fr)' }}>
          <div className={`${CARD} p-5 min-w-0`}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h3 className="text-[14px] font-semibold text-gray-900 m-0">Crawl and indexability</h3>
                <p className="text-[14px] text-gray-500 m-0 mt-1">Page eligibility and response health.</p>
              </div>
              <TextLink onClick={onViewPages}>Review pages</TextLink>
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-md bg-white">
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
                    <tr key={row.signal} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-2.5 text-[14px] font-medium text-gray-900">{row.signal}</td>
                      <td className="px-4 py-2.5 text-[14px] text-gray-900 text-right tabular-nums">{row.pages}</td>
                      <td className={TD}>{row.meaning}</td>
                      <td className="px-4 py-2.5">
                        <Pill className={STATUS_PILL[row.status]}>{row.status}</Pill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`${CARD} p-5 min-w-0 flex flex-col`}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h3 className="text-[14px] font-semibold text-gray-900 m-0">Link discovery</h3>
                <p className="text-[14px] text-gray-500 m-0 mt-1">Internal and external paths found in the crawl.</p>
              </div>
              <TextLink onClick={onViewLinks}>Review links</TextLink>
            </div>
            <div className="flex flex-col">
              {LINK_STATS.map(stat => (
                <div key={stat.label} className="flex items-center justify-between gap-3 py-3 border-b border-gray-100">
                  <p className="text-[14px] text-gray-600 m-0">{stat.label}</p>
                  <p className="text-[16px] font-semibold text-gray-900 tabular-nums m-0">{stat.value}</p>
                </div>
              ))}
            </div>
            <p className="text-[14px] font-normal text-gray-500 m-0 mt-auto pt-4">
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
            <p className="text-[14px] text-gray-500 m-0 mt-1 mb-4">Loading, responsiveness, and visual stability.</p>
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
                <p className="text-[14px] text-gray-500 m-0 mt-1">Images, scripts, and other files loaded by the site.</p>
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
