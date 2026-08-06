import { ExternalLink } from '../../icons/index.js'
import HLCheckbox from '../HLCheckbox.jsx'
import RecField from './RecField.jsx'

export default function ActionItemDetailTable({
  itemId,
  columns,
  rows,
  editable = false,
  selectable = false,
  selectedRows,
  onToggleRow,
  onUpdateRec,
}) {
  const showCurrent = Boolean(columns.current)

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse table-fixed">
        <colgroup>
          {selectable && <col style={{ width: 40 }} />}
          <col className={selectable ? 'w-[28%]' : 'w-[32%]'} />
          {showCurrent && <col className={selectable ? 'w-[22%]' : 'w-[24%]'} />}
          <col className={selectable ? (showCurrent ? 'w-[42%]' : 'w-[64%]') : showCurrent ? 'w-[44%]' : 'w-[68%]'} />
        </colgroup>
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            {selectable && <th className="px-3.5 py-2" aria-hidden="true" />}
            <th className="px-3.5 py-2 text-left text-[14px] font-semibold text-gray-900">{columns.page}</th>
            {showCurrent && (
              <th className="px-3.5 py-2 text-left text-[14px] font-semibold text-gray-900">{columns.current}</th>
            )}
            <th className="px-3.5 py-2 text-left text-[14px] font-semibold text-gray-900">{columns.recommendation}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const rowSelected = selectedRows?.has(idx) ?? false

            return (
              <tr key={idx} className="border-b border-gray-100 last:border-0">
                {selectable && (
                  <td className="px-3.5 py-2.5 align-top">
                    <HLCheckbox
                      id={`${itemId}-row-${idx}`}
                      size="xs"
                      checked={rowSelected}
                      aria-label={`Select ${row.page}`}
                      onChange={() => onToggleRow?.(idx)}
                    />
                  </td>
                )}
                <td className="px-3.5 py-2.5 align-top text-[14px] text-primary-600">
                  <span className="flex items-start gap-1 break-all">
                    <ExternalLink size={12} className="shrink-0 mt-0.5" />
                    {row.page}
                  </span>
                </td>
                {showCurrent && (
                  <td className="px-3.5 py-2.5 align-top text-[14px] text-gray-400 italic">{row.currentValue}</td>
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
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
