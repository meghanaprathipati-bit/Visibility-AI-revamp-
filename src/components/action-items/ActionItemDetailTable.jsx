import { ExternalLink, Lock01Icon } from '../../icons/index.js'
import HLCheckbox from '../HLCheckbox.jsx'
import RecField from './RecField.jsx'

function LockedRowControl() {
  return (
    <span
      aria-hidden="true"
      style={{ width: 16, height: 16, borderRadius: 4 }}
      className="box-border border border-gray-300 bg-gray-100 inline-flex items-center justify-center shrink-0"
    >
      <Lock01Icon size={10} className="text-gray-400" strokeWidth={2} />
    </span>
  )
}

export default function ActionItemDetailTable({
  itemId,
  columns,
  rows,
  editable = false,
  selectable = false,
  selectionLocked = false,
  selectedRows,
  onToggleRow,
  onUpdateRec,
}) {
  const showCurrent = Boolean(columns.current)
  const showCheckboxColumn = selectable || selectionLocked

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse table-fixed">
        <colgroup>
          {showCheckboxColumn && <col style={{ width: 40 }} />}
          <col className={showCheckboxColumn ? 'w-[28%]' : 'w-[32%]'} />
          {showCurrent && <col className={showCheckboxColumn ? 'w-[22%]' : 'w-[24%]'} />}
          <col className={showCheckboxColumn ? (showCurrent ? 'w-[42%]' : 'w-[64%]') : showCurrent ? 'w-[44%]' : 'w-[68%]'} />
        </colgroup>
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {showCheckboxColumn && <th className="px-3.5 py-2" aria-hidden="true" />}
            <th className="px-3.5 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide">{columns.page}</th>
            {showCurrent && (
              <th className="px-3.5 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide">{columns.current}</th>
            )}
            <th className="px-3.5 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide">{columns.recommendation}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const rowSelected = selectedRows?.has(idx) ?? false
            const rowLocked = selectionLocked && !rowSelected

            return (
              <tr key={idx} className="border-b border-gray-100 last:border-0">
                {showCheckboxColumn && (
                  <td className="px-3.5 py-2.5 align-top">
                    {rowLocked ? (
                      <LockedRowControl />
                    ) : (
                      <HLCheckbox
                        id={`${itemId}-row-${idx}`}
                        size="sm"
                        checked={rowSelected}
                        disabled={!selectable}
                        aria-label={`Select ${row.page}`}
                        onChange={() => onToggleRow?.(idx)}
                      />
                    )}
                  </td>
                )}
                <td className="px-3.5 py-2.5 align-top text-[12px] text-primary-600">
                  <span className="flex items-start gap-1 break-all">
                    <ExternalLink size={12} className="shrink-0 mt-0.5" />
                    {row.page}
                  </span>
                </td>
                {showCurrent && (
                  <td className="px-3.5 py-2.5 align-top text-[12px] text-gray-400 italic">{row.currentValue}</td>
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
