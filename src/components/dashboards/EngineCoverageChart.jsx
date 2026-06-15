import { HelpCircle } from '../../icons/index.js'
import { ENGINE_COVERAGE } from '../../data/aiRankDashboard.js'

const ENGINE_COLORS = {
  chatgpt: 'bg-success-50 text-success-700 border-success-200',
  gemini: 'bg-primary-50 text-primary-700 border-primary-200',
  'ai-mode': 'bg-teal-50 text-teal-600 border-teal-200',
  'ai-overview': 'bg-purple-50 text-purple-700 border-purple-200',
  perplexity: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
}

/** Per-engine visibility table with progress bars */
export default function EngineCoverageChart() {
  const maxVisibility = Math.max(...ENGINE_COVERAGE.map(e => e.visibility))

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-5">
      <div className="mb-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[16px] font-semibold text-gray-900">Engine coverage</h3>
          <HelpCircle size={14} className="text-gray-400 shrink-0" />
        </div>
        <p className="text-[12px] text-gray-500 mt-0.5">How your brand appears across AI search engines</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-[13px]">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="pb-2 pr-3 font-medium text-gray-500 text-[11px] uppercase tracking-wide">Engine</th>
              <th className="pb-2 pr-3 font-medium text-gray-500 text-[11px] uppercase tracking-wide">Visibility</th>
              <th className="pb-2 pr-3 font-medium text-gray-500 text-[11px] uppercase tracking-wide">Presence</th>
              <th className="pb-2 pr-3 font-medium text-gray-500 text-[11px] uppercase tracking-wide">Avg position</th>
              <th className="pb-2 pr-3 font-medium text-gray-500 text-[11px] uppercase tracking-wide">Citation rate</th>
              <th className="pb-2 font-medium text-gray-500 text-[11px] uppercase tracking-wide">Insight</th>
            </tr>
          </thead>
          <tbody>
            {ENGINE_COVERAGE.map(engine => (
              <tr key={engine.key} className="border-b border-gray-100 last:border-0">
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-md border flex items-center justify-center text-[11px] font-semibold shrink-0 ${ENGINE_COLORS[engine.key]}`}>
                      {engine.abbr}
                    </span>
                    <span className="font-medium text-gray-900">{engine.label}</span>
                  </div>
                </td>
                <td className="py-3 pr-3 min-w-[120px]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full"
                        style={{ width: `${(engine.visibility / maxVisibility) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-700 font-medium w-8 text-right">{engine.visibility}</span>
                  </div>
                </td>
                <td className="py-3 pr-3 text-gray-700">{engine.presence}</td>
                <td className="py-3 pr-3 text-gray-700">{engine.avgPosition}</td>
                <td className="py-3 pr-3 text-gray-700">{engine.citationRate}</td>
                <td className="py-3 text-gray-600 max-w-[180px]">{engine.insight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
