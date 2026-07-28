import { HERO_KPIS } from '../../data/aiRankDashboard.js'
import CitationsTrendChart from './CitationsTrendChart.jsx'
import EngineCoverageChart from './EngineCoverageChart.jsx'
import AiSentimentChart from './AiSentimentChart.jsx'
import CountCard from '../CountCard.jsx'

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
          <CountCard key={kpi.id} label={kpi.label} value={kpi.value} description={kpi.subtitle} />
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
