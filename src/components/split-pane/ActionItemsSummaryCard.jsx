import { AlertTriangle, ChevronRight, CheckSquare, Info, X } from '../../icons/index.js'
import { countByPriority } from '../../data/scanSummary.js'

/**
 * SeverityPill — Paper Design pill (rounded-full, tinted bg, border matches text color).
 * Icon + count + label. Hidden when count is 0.
 */
function SeverityPill({ Icon, count, label, bg, border, text }) {
  if (count === 0) return null
  return (
    <span className={`inline-flex items-center gap-1 rounded-full py-1 px-2.5 border border-solid text-[12px] font-medium shrink-0 ${bg} ${border} ${text}`}>
      <Icon size={11} strokeWidth={2.5} />
      {count} {count === 1 ? label.replace(/s$/, '') : label}
    </span>
  )
}

/**
 * ActionItemsSummaryCard — compact chat card; opens action items in the split pane.
 */
export default function ActionItemsSummaryCard({ items, onFixIssues }) {
  const counts = countByPriority(items)

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onFixIssues}
        className="w-full text-left rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-25 transition-colors shadow-xs overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <CheckSquare size={16} className="text-gray-600" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-gray-900">Action items</p>
            <p className="text-[12px] text-gray-500 mt-0.5">Review and fix issues from your scan</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            <SeverityPill
              Icon={X}
              count={counts.error}
              label="Errors"
              bg="bg-error-50"
              border="border-error-600"
              text="text-error-600"
            />
            <SeverityPill
              Icon={AlertTriangle}
              count={counts.warning}
              label="Warnings"
              bg="bg-warning-100"
              border="border-warning-600"
              text="text-warning-600"
            />
            <SeverityPill
              Icon={Info}
              count={counts.notice}
              label="Notices"
              bg="bg-gray-100"
              border="border-gray-400"
              text="text-gray-600"
            />
          </div>

          <ChevronRight size={16} className="text-gray-400 shrink-0" />
        </div>
      </button>
    </div>
  )
}
