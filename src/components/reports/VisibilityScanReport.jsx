import { MapPin, Star } from '../../icons/index.js'

function TagPill({ children }) {
  return (
    <span className="text-[13px] font-medium text-gray-600 bg-gray-100 border border-gray-200 rounded-full px-2.5 py-0.5">
      {children}
    </span>
  )
}

function MetricTile({ label, value, sub }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 min-w-0">
      <p className="text-[12px] text-gray-500 leading-tight">{label}</p>
      <p className="text-[14px] font-semibold text-gray-900 mt-0.5 leading-tight">{value}</p>
      {sub && <p className="text-[12px] text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function PriorityBadge({ priority }) {
  const styles =
    priority === 'High'
      ? 'text-error-600 bg-error-50 border-error-50'
      : priority === 'Medium'
        ? 'text-warning-600 bg-warning-100 border-warning-100'
        : 'text-primary-600 bg-primary-50 border-primary-50'
  return (
    <span className={`inline-flex text-[13px] font-medium px-2 py-0.5 rounded border ${styles}`}>
      {priority}
    </span>
  )
}

function ReportTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {columns.map(col => (
              <th key={col} className="text-[14px] font-semibold text-gray-900 px-3 py-2.5 whitespace-nowrap">
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

/** Full inline visibility scan report — center pane and side panel */
export default function VisibilityScanReport({ report, onPromptAction }) {
  const { profile } = report

  const snapshotRows = report.profileSnapshot.map(row => [row.attribute, row.details])
  const actionRows = report.actionItemsTable.map(row => [
    row.issue,
    row.impact,
    <PriorityBadge key={`${row.issue}-priority`} priority={row.priority} />,
    row.action,
  ])

  return (
    <div className="flex flex-col gap-5">
      {/* Report header */}
      <div>
        <h3 className="text-[14px] font-semibold text-gray-900 leading-snug">{report.title}</h3>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {report.tags.map(tag => (
            <TagPill key={tag}>{tag}</TagPill>
          ))}
        </div>
      </div>

      {/* Section title */}
      <div>
        <h4 className="text-[14px] font-semibold text-gray-900 mb-3">{report.sectionTitle}</h4>

        {/* Profile / crawl summary card */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-4">
          <p className="text-[12px] font-medium text-gray-500">{report.sourceLabel}</p>

          <div className="flex gap-4 items-start">
            {/* Health score */}
            <div className="shrink-0 flex flex-col items-center gap-1">
              <div className="w-[72px] h-[72px] rounded-full border-[3px] border-primary-600 flex items-center justify-center">
                <span className="text-[22px] font-bold text-primary-600 leading-none">{profile.healthScore}</span>
              </div>
              <span className="text-[12px] text-gray-500 text-center leading-tight">Health score</span>
              <span className="text-[12px] font-medium text-gray-700">{profile.healthScore}/100</span>
            </div>

            {/* Business / domain info */}
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-gray-900 leading-snug">{profile.businessName}</p>
              <p className="text-[13px] text-gray-500 mt-1 flex items-center gap-1">
                <MapPin size={13} className="shrink-0 text-gray-500" />
                {profile.location}
              </p>
              {profile.rating != null && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-warning-600" color="var(--warning-600)" />
                    <span className="text-[13px] font-medium text-gray-900">{profile.rating}</span>
                    <span className="text-[12px] text-gray-500">({profile.reviewCount?.toLocaleString()} reviews)</span>
                  </div>
                  <span className="text-[13px] font-medium text-warning-600 bg-warning-100 border border-warning-100 rounded-full px-2 py-0.5">
                    {profile.sentiment}
                  </span>
                </div>
              )}
              {profile.rating == null && profile.sentiment && (
                <span className="inline-flex mt-2 text-[13px] font-medium text-warning-600 bg-warning-100 border border-warning-100 rounded-full px-2 py-0.5">
                  {profile.sentiment}
                </span>
              )}
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-3 gap-2">
            {profile.metrics.map(metric => (
              <MetricTile key={metric.label} label={metric.label} value={metric.value} sub={metric.sub} />
            ))}
          </div>

          {/* Missing tasks */}
          <div>
            <p className="text-[12px] font-medium text-gray-700 mb-2">Missing tasks</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.missingTasks.map(task => (
                <span
                  key={task}
                  className="text-[13px] font-medium text-warning-600 bg-warning-100 border border-warning-100 rounded-full px-2.5 py-0.5"
                >
                  {task}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profile snapshot */}
      <div>
        <h4 className="text-[13px] font-semibold text-gray-900 mb-2">Profile snapshot</h4>
        <ReportTable columns={['Attribute', 'Details']} rows={snapshotRows} />
      </div>

      {/* Action items table */}
      <div>
        <h4 className="text-[13px] font-semibold text-gray-900 mb-2">Action items</h4>
        <ReportTable columns={['Issue', 'Impact', 'Priority', 'Action']} rows={actionRows} />
      </div>

      {/* Upsell + prompt actions */}
      <div className="flex flex-col gap-3 pt-1">
        <p className="text-[13px] text-gray-600 leading-relaxed">{report.upsellText}</p>
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
      </div>
    </div>
  )
}
