import {
  AlertTriangle,
  BarChart3,
  Bot,
  Check,
  CheckSquare,
  CircleCheck,
  Code2,
  ImageIcon,
  Link2,
  Lock01Icon,
  Settings,
  Tablet,
  Workflow,
  X,
} from '../../icons/index.js'
import VisibilityScanReport from './VisibilityScanReport.jsx'

const TONE_STYLES = {
  error: {
    dot: 'bg-error-600',
    badge: 'text-error-600 bg-error-50 border-error-50',
    bar: 'bg-error-600',
    text: 'text-error-600',
    ring: 'stroke-error-600',
  },
  warning: {
    dot: 'bg-warning-250',
    badge: 'text-warning-300 bg-warning-100 border-warning-100',
    bar: 'bg-warning-250',
    text: 'text-warning-250',
    ring: 'stroke-warning-250',
  },
  notice: {
    dot: 'bg-primary-600',
    badge: 'text-primary-600 bg-primary-50 border-primary-50',
    bar: 'bg-primary-600',
    text: 'text-primary-600',
    ring: 'stroke-primary-600',
  },
  success: {
    dot: 'bg-success-600',
    badge: 'text-success-600 bg-success-50 border-success-50',
    bar: 'bg-success-600',
    text: 'text-success-600',
    ring: 'stroke-success-600',
  },
  primary: {
    dot: 'bg-primary-600',
    badge: 'text-primary-600 bg-primary-50 border-primary-50',
    bar: 'bg-primary-600',
    text: 'text-primary-600',
    ring: 'stroke-primary-600',
  },
}

function ToneBadge({ tone, children }) {
  const styles = TONE_STYLES[tone] ?? TONE_STYLES.notice
  return (
    <span className={`inline-flex text-[12px] font-medium px-2 py-0.5 rounded border ${styles.badge}`}>
      {children}
    </span>
  )
}

function ReportTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full min-w-[480px] text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {columns.map(col => (
              <th
                key={col}
                className="text-[14px] font-semibold text-gray-900 px-3 py-2.5 whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-b border-gray-100 last:border-0">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="text-[14px] text-gray-700 px-3 py-2.5 align-top leading-snug">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ScoreRing({ score, tone }) {
  const styles = TONE_STYLES[tone] ?? TONE_STYLES.error
  const dash = `${Math.max(8, Math.min(100, score))} 100`

  return (
    <div className="relative w-[88px] h-[88px] shrink-0">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90" aria-hidden="true">
        <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-gray-200" strokeWidth="2.5" />
        <circle
          cx="18"
          cy="18"
          r="15.5"
          fill="none"
          className={styles.ring}
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray={dash}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[26px] font-bold text-gray-900 leading-none">{score}</span>
        <span className="text-[12px] text-gray-500 mt-0.5">/100</span>
      </div>
    </div>
  )
}

function SummaryMetricCard({ label, value, tone }) {
  const styles = TONE_STYLES[tone] ?? TONE_STYLES.notice
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span className={`w-2 h-2 rounded-full shrink-0 ${styles.dot}`} />
        <p className="text-[12px] text-gray-500 leading-tight truncate">{label}</p>
      </div>
      <p className={`text-[18px] font-bold leading-tight ${styles.text}`}>{value}</p>
    </div>
  )
}

const ACTION_ICONS = {
  code: Code2,
  lock: Lock01Icon,
  image: ImageIcon,
  sitemap: Workflow,
  bot: Bot,
  link: Link2,
}

function RecommendedActionCard({ action }) {
  const Icon = ACTION_ICONS[action.icon] ?? Code2
  const styles = TONE_STYLES[action.tone] ?? TONE_STYLES.warning

  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3.5 min-w-0 shadow-xs">
      <div className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-xs">
        <Icon size={16} className="text-gray-700" />
      </div>
      <div className="flex flex-col gap-1.5 min-w-0">
        <span className={`inline-flex self-start text-[12px] font-medium px-2 py-0.5 rounded border ${styles.badge}`}>
          {action.priority}
        </span>
        <p className="text-[13px] font-semibold text-gray-900 leading-snug">{action.title}</p>
        <p className="text-[12px] text-gray-500 leading-relaxed">{action.description}</p>
      </div>
    </div>
  )
}

function RecommendedActionsSection({ actions }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <CheckSquare size={16} className="text-success-600 shrink-0" />
        <h4 className="text-[14px] font-semibold text-gray-900">Recommended actions</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map(action => (
          <RecommendedActionCard key={action.title} action={action} />
        ))}
      </div>
    </section>
  )
}

function MobileCheckStatusIcon({ status }) {
  if (status === 'pass') {
    return <CircleCheck size={16} className="text-success-600 shrink-0" />
  }
  if (status === 'warning') {
    return <AlertTriangle size={16} className="text-warning-250 shrink-0" />
  }
  return (
    <span className="w-4 h-4 rounded-full border-2 border-error-600 flex items-center justify-center shrink-0">
      <X size={10} className="text-error-600" strokeWidth={2.5} />
    </span>
  )
}

function MobileReadinessCard({ title, icon: Icon, items }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden min-w-0 shadow-xs">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <Icon size={16} className="text-gray-700 shrink-0" />
        <h5 className="text-[13px] font-semibold text-gray-900">{title}</h5>
      </div>
      <ul className="divide-y divide-gray-100">
        {items.map(item => (
          <li key={item.label} className="flex items-start gap-2.5 px-4 py-2.5">
            <span className="mt-0.5">
              <MobileCheckStatusIcon status={item.status} />
            </span>
            <span className="text-[13px] text-gray-700 leading-snug">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function MobileReadinessSection({ data }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Tablet size={16} className="text-primary-600 shrink-0" />
        <h4 className="text-[14px] font-semibold text-gray-900">{data.title}</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MobileReadinessCard title="Configuration" icon={Settings} items={data.configuration} />
        <MobileReadinessCard title="Mobile performance" icon={BarChart3} items={data.performance} />
      </div>
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-semibold text-gray-900 mr-1">
            {data.score} Mobile score
          </span>
          {data.breakdownTags.map(tag => (
            <span
              key={tag.label}
              className={`inline-flex items-center gap-1 text-[12px] font-medium px-2 py-0.5 rounded border ${
                tag.pass
                  ? 'text-success-600 bg-success-50 border-success-50'
                  : 'text-error-600 bg-error-50 border-error-50'
              }`}
            >
              {tag.label}
              {tag.pass ? <Check size={10} strokeWidth={2.5} /> : '✕'}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function MetricProgressBar({ fill, tone }) {
  const styles = TONE_STYLES[tone] ?? TONE_STYLES.warning
  return (
    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mt-2">
      <div className={`h-full rounded-full ${styles.bar}`} style={{ width: `${fill}%` }} />
    </div>
  )
}

function SeoHealthReport({ data }) {
  const issueRows = data.technicalIssues.map(issue => [
    <div key={issue.title} className="flex items-start gap-2.5">
      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${TONE_STYLES[issue.tone].dot}`} />
      <div>
        <p className="font-medium text-gray-900">{issue.title}</p>
        <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">{issue.description}</p>
      </div>
    </div>,
    <ToneBadge key={`${issue.title}-badge`} tone={issue.tone}>
      {issue.badge}
    </ToneBadge>,
  ])

  const vitalsRows = data.coreWebVitals.metrics.map(metric => [
    metric.name,
    <div key={`vital-${metric.name}`}>
      <span className={`font-semibold ${TONE_STYLES[metric.tone].text}`}>{metric.value}</span>
      <MetricProgressBar fill={metric.fill} tone={metric.tone} />
    </div>,
    metric.target,
    <ToneBadge key={`vital-badge-${metric.name}`} tone={metric.tone}>
      {metric.tone === 'success' ? 'Good' : metric.tone === 'warning' ? 'Fair' : 'Poor'}
    </ToneBadge>,
  ])

  return (
    <div className="flex flex-col gap-6 pb-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[14px] font-semibold text-gray-900 leading-snug">{data.title}</h3>
          <p className="text-[12px] text-gray-500 mt-1">
            {data.domain} · {data.location} · {data.scanDate}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 shrink-0 text-[12px] font-medium text-success-600 bg-success-50 border border-success-50 rounded-full px-2.5 py-1">
          <CircleCheck size={12} />
          {data.statusLabel}
        </span>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="flex flex-col items-center gap-2">
            <ScoreRing score={data.score} tone={data.scoreTone} />
            <ToneBadge tone={data.scoreTone}>{data.scoreStatus}</ToneBadge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 flex-1 w-full">
            {data.summaryMetrics.map(metric => (
              <SummaryMetricCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                tone={metric.tone}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h4 className="text-[14px] font-semibold text-gray-900">Technical issues</h4>
        <ReportTable columns={['Issue', 'Status']} rows={issueRows} />
      </section>

      <section className="flex flex-col gap-3">
        <h4 className="text-[14px] font-semibold text-gray-900">{data.coreWebVitals.title}</h4>
        <ReportTable columns={['Metric', 'Value', 'Target', 'Status']} rows={vitalsRows} />
        <div className="rounded-lg border border-warning-100 bg-warning-100/40 px-3 py-2.5">
          <p className="text-[12px] text-gray-700 leading-relaxed">{data.coreWebVitals.insight}</p>
        </div>
      </section>

      <MobileReadinessSection data={data.mobileReadiness} />

      <RecommendedActionsSection actions={data.recommendedActions} />
    </div>
  )
}

function ScoreGauge({ label, score }) {
  const tone = score >= 90 ? 'success' : score >= 70 ? 'warning' : 'error'
  const styles = TONE_STYLES[tone]

  return (
    <div className="flex flex-col items-center gap-1 min-w-[72px]">
      <div className={`w-14 h-14 rounded-full border-[3px] flex items-center justify-center border-current ${styles.text}`}>
        <span className="text-[18px] font-bold leading-none">{score}</span>
      </div>
      <span className="text-[12px] text-gray-500 text-center leading-tight">{label}</span>
    </div>
  )
}

/** Detailed scan report for the side panel */
export default function DetailedScanReport({ report, onPromptAction }) {
  if (report.executiveReport) {
    return <SeoHealthReport data={report.executiveReport} />
  }

  const hasScoreOverview = Boolean(report.scoreOverview?.length)

  if (!hasScoreOverview) {
    return <VisibilityScanReport report={report} onPromptAction={onPromptAction} />
  }

  return (
    <div className="flex flex-col gap-5">
      {report.detailedTitle && (
        <h3 className="text-[14px] font-semibold text-gray-900 leading-snug">{report.detailedTitle}</h3>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
        <p className="text-[13px] font-semibold text-gray-900 mb-3">Score overview</p>
        <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
          {report.scoreOverview.map(score => (
            <ScoreGauge key={score.label} label={score.label} score={score.value} />
          ))}
        </div>
      </div>

      {report.upsellText && (
        <div className="flex flex-col gap-3 pt-1 border-t border-gray-100">
          <p className="text-[13px] text-gray-600 leading-relaxed">{report.upsellText}</p>
          {report.promptActions?.length > 0 && (
            <div className="flex flex-col gap-2">
              {report.promptActions.map(label => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onPromptAction?.(label)}
                  className="text-left text-[13px] font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
