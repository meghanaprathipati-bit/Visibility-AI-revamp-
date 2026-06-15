import { HelpCircle } from '../../icons/index.js'
import { SENTIMENT_BREAKDOWN, DUMMY_DOMAIN } from '../../data/aiRankDashboard.js'

const CATEGORIES = [
  { key: 'recommended', label: 'Recommended', bar: 'bg-primary-700', dot: 'bg-primary-700' },
  { key: 'favorable', label: 'Favorable', bar: 'bg-primary-400', dot: 'bg-primary-400' },
  { key: 'neutral', label: 'Neutral', bar: 'bg-gray-300', dot: 'bg-gray-300' },
  { key: 'unfavorable', label: 'Unfavorable', bar: 'bg-warning-600', dot: 'bg-warning-600' },
  { key: 'dismissed', label: 'Dismissed', bar: 'bg-error-600', dot: 'bg-error-600' },
]

/** Stacked sentiment bar — how AI describes the brand */
export default function AiSentimentChart() {
  const { total } = SENTIMENT_BREAKDOWN
  const segments = CATEGORIES.map(cat => ({
    ...cat,
    count: SENTIMENT_BREAKDOWN[cat.key],
    percent: Math.round((SENTIMENT_BREAKDOWN[cat.key] / total) * 100),
  }))

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-5">
      <div className="mb-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[16px] font-semibold text-gray-900">
            How AI is describing {DUMMY_DOMAIN}
          </h3>
          <HelpCircle size={14} className="text-gray-400 shrink-0" />
        </div>
        <p className="text-[12px] text-gray-500 mt-0.5">
          Sentiment breakdown from {total} classified AI responses
        </p>
      </div>

      <div className="flex h-4 w-full overflow-hidden rounded-full mb-5">
        {segments.map(seg => (
          seg.count > 0 && (
            <div
              key={seg.key}
              className={`${seg.bar} h-full`}
              style={{ width: `${seg.percent}%` }}
              title={`${seg.label}: ${seg.count}`}
            />
          )
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {segments.map(seg => (
          <div key={seg.key} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${seg.dot}`} />
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-gray-900">{seg.label}</p>
              <p className="text-[12px] text-gray-500">
                {seg.count} ({seg.percent}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
