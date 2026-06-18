/**
 * Scan summary card — visibility analysis text, channel snapshot, and action tables.
 * Full executive report lives in DetailedScanReport (side panel).
 */

function ReportTable({ title, columns, rows }) {
  return (
    <div>
      {title && <h4 className="text-[14px] font-semibold text-gray-900 mb-2">{title}</h4>}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map(col => (
                <th
                  key={col}
                  className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-3 py-2.5 whitespace-nowrap"
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
                  <td key={cellIdx} className="text-[13px] text-gray-700 px-3 py-2.5 align-top leading-snug">
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

function CategoryBullet({ category }) {
  return (
    <li className="flex flex-col gap-1.5">
      <p className="text-[14px] text-gray-700 leading-snug">
        <span className="font-semibold text-gray-900">{category.name}</span>
        {' — '}
        <span className="font-medium text-warning-600">{category.status}</span>
        {' — '}
        {category.description}
      </p>
      {category.checks?.length > 0 && (
        <ul className="flex flex-col gap-1 pl-4">
          {category.checks.map(check => (
            <li key={check.label} className="text-[13px] text-gray-600 leading-snug">
              {check.label} — {check.detail}
            </li>
          ))}
        </ul>
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
    <div className="flex flex-col gap-5">
      {report.summaryTitle && (
        <p className="text-[15px] font-semibold text-gray-900 leading-snug">{report.summaryTitle}</p>
      )}

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

      {categories.length > 0 && (
        <div>
          <p className="text-[14px] font-semibold text-gray-900 mb-2">Channel snapshot</p>
          <ul className="flex flex-col gap-3">
            {categories.map(category => (
              <CategoryBullet key={category.name} category={category} />
            ))}
          </ul>
        </div>
      )}

      {topGapRows.length > 0 && (
        <ReportTable
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
