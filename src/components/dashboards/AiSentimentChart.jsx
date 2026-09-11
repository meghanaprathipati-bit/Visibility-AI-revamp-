import SectionInfoTip from '../SectionInfoTip.jsx'
import CountCard from '../CountCard.jsx'
import { SENTIMENT_BREAKDOWN, DUMMY_DOMAIN } from '../../data/aiRankDashboard.js'

const CATEGORIES = [
  { key: 'recommended', label: 'Recommended', bar: 'bg-primary-700', dot: 'bg-primary-700' },
  { key: 'favorable', label: 'Favorable', bar: 'bg-primary-300', dot: 'bg-primary-300' },
  { key: 'neutral', label: 'Neutral', bar: 'bg-gray-300', dot: 'bg-gray-300' },
  { key: 'unfavorable', label: 'Unfavorable', bar: 'bg-warning-600', dot: 'bg-warning-600' },
  { key: 'dismissed', label: 'Dismissed', bar: 'bg-error-600', dot: 'bg-error-600' },
]

/** Stacked sentiment bar — how AI describes the brand */
const CARD_TONE = {
  recommended: '',
  favorable: '',
  neutral: '',
  unfavorable: 'bg-warning-50 border-warning-100',
  dismissed: 'bg-error-50 border-error-50',
}

export default function AiSentimentChart({
  title,
  subtitle,
  footer,
  breakdown = SENTIMENT_BREAKDOWN,
  showCards = false,
}) {
  const { total } = breakdown
  const segments = CATEGORIES.map(cat => ({
    ...cat,
    count: breakdown[cat.key],
    percent: Math.round((breakdown[cat.key] / total) * 100),
  }))

  return (
    <div className="border border-gray-200 rounded-md bg-white p-5 shrink-0">
      <div className="mb-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[14px] font-semibold text-gray-900">
            {title || `How AI is describing ${DUMMY_DOMAIN}`}
          </h3>
          <SectionInfoTip
            id="ai-sentiment-chart-info"
            content={`Sentiment breakdown from ${total} classified AI responses`}
          />
        </div>
        {subtitle && <p className="text-[14px] font-normal text-gray-500 m-0 mt-1">{subtitle}</p>}
      </div>

      <div className="flex h-8 w-full overflow-hidden rounded-md mb-5">
        {segments.map(seg => (
          seg.count > 0 && (
            <div
              key={seg.key}
              className={`${seg.bar} h-full relative flex items-center justify-center`}
              style={{ width: `${seg.percent}%` }}
              title={`${seg.label}: ${seg.count}`}
            >
              {seg.percent >= 8 && (
                <span className={`text-[12px] font-semibold leading-none ${seg.key === 'neutral' ? 'text-gray-700' : 'text-white'}`}>
                  {seg.percent}%
                </span>
              )}
            </div>
          )
        ))}
      </div>

      {showCards ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {segments.map(seg => (
            <CountCard
              key={seg.key}
              label={seg.label}
              value={`${seg.percent}%`}
              helpContent={`${seg.label} share of classified AI answers`}
              className={CARD_TONE[seg.key]}
            />
          ))}
        </div>
      ) : (
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
      )}

      {footer && (
        <p className="text-[14px] text-gray-500 m-0 mt-4 leading-relaxed">{footer}</p>
      )}
    </div>
  )
}
