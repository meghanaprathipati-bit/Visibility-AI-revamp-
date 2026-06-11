import { useState } from 'react'
import {
  Check, ChevronDown, Globe, MapPin, Sparkles,
} from '../../icons/index.js'
import ActionItemDetailTable from './ActionItemDetailTable.jsx'
import ActionItemDetailSingle from './ActionItemDetailSingle.jsx'

const PRIORITY_DOT = {
  error: 'bg-error-600',
  warning: 'bg-warning-600',
  notice: 'bg-primary-600',
}

/** HighRise-style tag pill */
function HrTag({ variant = 'default', children }) {
  const styles = {
    default: 'bg-gray-50 text-gray-600 border-gray-200',
    autofix: 'bg-success-50 text-success-700 border-success-200',
    manual: 'bg-purple-50 text-purple-700 border-purple-200',
  }
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full border whitespace-nowrap ${styles[variant]}`}
    >
      {children}
    </span>
  )
}

/**
 * ActionItemCard — collapsible row with inline detail panel (spec ActionItemCard.vue).
 */
export default function ActionItemCard({ item, selected, onToggleSelect, onUpdateRec }) {
  const [open, setOpen] = useState(false)
  const canSelect = item.autofix

  const SourceIcon = item.source === 'gbp' ? MapPin : Globe
  const sourceLabel = item.source === 'gbp' ? 'GBP' : 'Website SEO'

  return (
    <div
      role="listitem"
      className={`bg-white border border-gray-200 rounded-xl mb-2 overflow-hidden transition-[border-color,opacity] hover:border-gray-300 ${
        selected ? 'opacity-60' : 'opacity-100'
      }`}
    >
      <div
        className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer select-none"
        onClick={() => setOpen(v => !v)}
      >
        {/* Checkbox — selection for bulk implement/remove */}
        <button
          type="button"
          role="checkbox"
          aria-checked={selected}
          aria-disabled={!canSelect}
          aria-label={canSelect ? 'Select item' : 'Manual fix only'}
          disabled={!canSelect}
          onClick={e => {
            e.stopPropagation()
            if (canSelect) onToggleSelect()
          }}
          className={`w-[18px] h-[18px] rounded shrink-0 flex items-center justify-center border-[1.5px] transition-colors ${
            !canSelect
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
              : selected
                ? 'bg-success-700 border-success-700'
                : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          {selected && canSelect && <Check size={12} className="text-white" strokeWidth={3} />}
        </button>

        {/* Priority dot */}
        <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${PRIORITY_DOT[item.priority]}`} aria-hidden="true" />

        {/* Body */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-[13px] text-gray-900 leading-snug m-0 mb-1 ${
              selected ? 'line-through text-gray-400' : ''
            }`}
          >
            {item.title}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
              <SourceIcon size={12} />
              {sourceLabel}
            </span>
            {item.tags.map(tag => (
              <HrTag key={tag}>{tag}</HrTag>
            ))}
            {item.autofix && (
              <HrTag variant="autofix">
                <Sparkles size={11} />
                Auto-fix
              </HrTag>
            )}
            {item.manualFix && <HrTag variant="manual">Manual fix</HrTag>}
          </div>
        </div>

        {/* Affected pages */}
        {item.affectedPages != null && (
          <span className="text-[11px] text-gray-400 shrink-0">
            {item.affectedPages === 'site-wide' ? 'Site-wide' : `${item.affectedPages} pages`}
          </span>
        )}

        <ChevronDown
          size={14}
          className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </div>

      {open && (
        <div className="border-t border-gray-200">
          {item.detailType === 'table' && item.tableRows ? (
            <ActionItemDetailTable
              columns={item.tableColumns}
              rows={item.tableRows}
              editable={item.autofix}
              onUpdateRec={(idx, text) => onUpdateRec(idx, text)}
            />
          ) : (
            <ActionItemDetailSingle
              fieldName={item.fieldName}
              currentValue={item.currentValue}
              recommendationLabel={item.recommendationLabel ?? 'Recommendation'}
              recommendation={item.recommendation ?? ''}
              editable={item.autofix}
              onUpdateRec={text => onUpdateRec(null, text)}
            />
          )}
        </div>
      )}
    </div>
  )
}
