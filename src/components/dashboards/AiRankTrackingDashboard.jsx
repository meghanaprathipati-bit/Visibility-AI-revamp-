import { HERO_KPIS } from '../../data/aiRankDashboard.js'
import CitationsTrendChart from './CitationsTrendChart.jsx'
import EngineCoverageChart from './EngineCoverageChart.jsx'
import AiSentimentChart from './AiSentimentChart.jsx'

/** AI rank tracking dashboard — overview with KPI cards and 3 charts */
export default function AiRankTrackingDashboard() {
  return (
    <main className="flex-1 min-w-0 min-h-0 overflow-y-auto bg-gray-50 px-6 py-5 scrollbar-gray-300">
      <div className="mb-5">
        <h1 className="text-[20px] font-semibold text-gray-900">AI rank tracking</h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Monitor how your brand appears across AI search engines
        </p>
      </div>

      {/* Hero KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
        {HERO_KPIS.map(kpi => (
          <div key={kpi.id} className="border border-gray-200 rounded-lg bg-white px-5 py-4">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 truncate">{kpi.label}</p>
            <p className="text-[24px] font-bold text-gray-900 mt-1">{kpi.value}</p>
            {kpi.subtitle && (
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">{kpi.subtitle}</p>
            )}
          </div>
        ))}
      </div>

      {/* Three charts with dummy data */}
      <div className="flex flex-col gap-4">
        <CitationsTrendChart />
        <EngineCoverageChart />
        <AiSentimentChart />
      </div>
    </main>
  )
}
