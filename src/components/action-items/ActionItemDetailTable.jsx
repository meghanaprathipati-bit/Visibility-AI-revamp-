import { ExternalLink } from '../../icons/index.js'
import RecField from './RecField.jsx'

/**
 * ActionItemDetailTable — multi-row detail table (spec ActionItemDetailTable.vue).
 * Styled to match HighRise HrDataTable visual spec.
 */
export default function ActionItemDetailTable({ columns, rows, editable = false, onUpdateRec }) {
  const showCurrent = Boolean(columns.current)

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse table-fixed">
        <colgroup>
          <col className="w-[32%]" />
          {showCurrent && <col className="w-[24%]" />}
          <col className={showCurrent ? 'w-[44%]' : 'w-[68%]'} />
        </colgroup>
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-3.5 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide">
              {columns.page}
            </th>
            {showCurrent && (
              <th className="px-3.5 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                {columns.current}
              </th>
            )}
            <th className="px-3.5 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide">
              {columns.recommendation}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-b border-gray-100 last:border-0">
              <td className="px-3.5 py-2.5 align-top text-[12px] text-primary-600">
                <span className="flex items-start gap-1 break-all">
                  <ExternalLink size={12} className="shrink-0 mt-0.5" />
                  {row.page}
                </span>
              </td>
              {showCurrent && (
                <td className="px-3.5 py-2.5 align-top text-[12px] text-gray-400 italic">
                  {row.currentValue}
                </td>
              )}
              <td className="px-3.5 py-2.5 align-top">
                <RecField
                  value={row.recommendation}
                  display="inline"
                  editable={editable}
                  onSave={text => onUpdateRec(idx, text)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
