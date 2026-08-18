/**
 * Scan summary card — visibility analysis text, channel snapshot, and action tables.
 * Full executive report lives in DetailedScanReport (side panel).
 */

function ReportTable({ title, columns, rows, className = '' }) {
  return (
    <div className={className}>
      {title && <h4 className="text-[14px] font-semibold text-gray-900 mb-2">{title}</h4>}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse">
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
    </div>
  )
}

function CategorySnapshotItem({ category }) {
  const checkLabels = (category.checks ?? []).map(check => check.label).join(' · ')

  return (
    <li className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[14px] font-semibold text-gray-900">{category.name}</span>
        {category.status && (
          <span className="inline-flex text-[13px] font-medium px-2 py-0.5 rounded border bg-gray-100 text-gray-700 border-gray-200">
            {category.status}
          </span>
        )}
      </div>
      <p className="text-[13px] text-gray-700 leading-relaxed">{category.description}</p>
      {checkLabels && (
        <p className="text-[12px] text-gray-500 leading-snug">{checkLabels}</p>
      )}
    </li>
  )
}

export default function ScanQuickSummary({ report }) {
  const categories = report.summaryCategories ?? []
  const topGapRows = (report.topGaps ?? []).map(row => [
    row.channel,
    row.category,
    row.issueCategory,
    row.topFix,
  ])
  const actionPlanRows = (report.nextActionPlan ?? []).map(row => [
    row.when,
    row.channel,
    row.category,
    row.action,
  ])

  return (
    <div className="flex flex-col">
      {report.summaryTitle && (
        <p className="text-[14px] font-semibold text-gray-900 leading-snug mb-4">{report.summaryTitle}</p>
      )}

      {(report.channelsAnalyzed || report.opportunityScope) && (
        <div className="flex flex-col gap-1.5 mb-6">
          {report.channelsAnalyzed && (
            <p className="text-[14px] text-gray-700 leading-relaxed">
              <span className="font-semibold text-gray-900">Channels analyzed:</span> {report.channelsAnalyzed}
            </p>
          )}
          {report.opportunityScope && (
            <p className="text-[14px] text-gray-700 leading-relaxed">
              <span className="font-semibold text-gray-900">Opportunity scope:</span> {report.opportunityScope}
            </p>
          )}
        </div>
      )}

      {categories.length > 0 && (
        <div className="mb-10">
          <p className="text-[12px] font-semibold text-gray-500 mb-3">Channel snapshot</p>
          <ul className="flex flex-col gap-[18px]">
            {categories.map(category => (
              <CategorySnapshotItem key={category.name} category={category} />
            ))}
          </ul>
        </div>
      )}

      {topGapRows.length > 0 && (
        <ReportTable
          className="mb-10"
          title="Top gaps to fix"
          columns={['Channel', 'Category', 'Issue category', 'Top fix examples']}
          rows={topGapRows}
        />
      )}

      {actionPlanRows.length > 0 && (
        <ReportTable
          title="Next action plan"
          columns={['When', 'Channel', 'Category', 'Actions']}
          rows={actionPlanRows}
        />
      )}
    </div>
  )
}
