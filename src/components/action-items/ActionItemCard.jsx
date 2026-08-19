import { useState, useEffect, useRef } from 'react'
import { ChevronDown, Sparkles, Zap } from '../../icons/index.js'
import HLCheckbox from '../HLCheckbox.jsx'
import HLTooltip from '../HLTooltip.jsx'
import ActionItemDetailTable from './ActionItemDetailTable.jsx'
import ActionItemDetailSingle from './ActionItemDetailSingle.jsx'
import { BTN_PRIMARY, BTN_SECONDARY } from '../HLButton.jsx'

const MANUAL_FIX_TOOLTIP = 'Auto-fix unavailable. View the manual fix.'

const PRIORITY_DOT = {
  error: 'bg-error-600',
  warning: 'bg-warning-250',
  notice: 'bg-primary-600',
}

function getCardBorderClass({ selected }) {
  return selected ? 'border-gray-200' : 'border-gray-200 hover:border-gray-300'
}

function HrTag({ variant = 'default', children }) {
  const styles = {
    default: 'bg-gray-50 text-gray-600 border-gray-200',
    autofix: 'bg-purple-50 text-purple-700 border-purple-200',
    manual: 'bg-success-50 text-success-700 border-success-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full border whitespace-nowrap ${styles[variant]}`}>
      {children}
    </span>
  )
}

// 3-state subscribe flow for AI visibility items: subscribe → configure → implement
function SubscribeFlow() {
  const [stage, setStage] = useState('subscribe')
  return (
    <div className="px-3.5 py-3 border-t border-gray-100 flex items-center gap-3">
      {stage === 'subscribe' && (
        <>
          <p className="flex-1 text-[12px] text-gray-500">Unlock this fix with an AI Visibility subscription</p>
          <button
            type="button"
            onClick={() => setStage('configure')}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-warning-600 hover:bg-warning-700 text-white text-[12px] font-semibold transition-colors"
          >
            Subscribe to fix
          </button>
        </>
      )}
      {stage === 'configure' && (
        <>
          <p className="flex-1 text-[12px] text-gray-500">Configure the integration to apply this fix automatically</p>
          <button
            type="button"
            onClick={() => setStage('implement')}
            className={`${BTN_PRIMARY} shrink-0`}
          >
            Configure
          </button>
        </>
      )}
      {stage === 'implement' && (
        <>
          <p className="flex-1 text-[12px] text-success-700 font-medium">Ready to deploy — review the changes below</p>
          <button
            type="button"
            className="shrink-0 px-3 py-1.5 rounded-lg bg-success-700 hover:bg-success-800 text-white text-[12px] font-semibold transition-colors"
          >
            Implement changes
          </button>
        </>
      )}
    </div>
  )
}

export default function ActionItemCard({
  item,
  selected,
  onToggleSelect,
  onUpdateRec,
  resolved = false,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [selectedRows, setSelectedRows] = useState(() => new Set())
  const wasSelectedRef = useRef(selected)
  const isSubscription = item.fixFlow === 'subscription'
  const canSelect = item.autofix && !resolved
  const hasTableRows = Boolean(item.tableRows?.length)
  const rowCount = item.tableRows?.length ?? 0
  const selectedRowCount = selectedRows.size
  const allRowsSelected = hasTableRows && selectedRowCount === rowCount
  const someRowsSelected = hasTableRows && selectedRowCount > 0 && selectedRowCount < rowCount
  const cardChecked = hasTableRows ? allRowsSelected : selected
  const cardIndeterminate = someRowsSelected

  useEffect(() => {
    if (!hasTableRows) return

    if (selected && !wasSelectedRef.current) {
      setSelectedRows(new Set(item.tableRows.map((_, idx) => idx)))
    }
    if (!selected && wasSelectedRef.current) {
      setSelectedRows(new Set())
    }
    wasSelectedRef.current = selected
  }, [selected, item.tableRows, hasTableRows])

  function handleCardCheckboxChange() {
    if (!canSelect) return

    if (hasTableRows) {
      if (cardIndeterminate || (!cardChecked && selectedRowCount === 0)) {
        setSelectedRows(new Set(item.tableRows.map((_, idx) => idx)))
        if (!selected) onToggleSelect()
        return
      }

      setSelectedRows(new Set())
      if (selected) onToggleSelect()
      return
    }

    onToggleSelect()
  }

  function toggleRowSelect(rowIndex) {
    if (!canSelect) return
    setSelectedRows(prev => {
      const next = new Set(prev)
      if (next.has(rowIndex)) next.delete(rowIndex)
      else next.add(rowIndex)

      if (next.size === 0 && selected) {
        queueMicrotask(() => onToggleSelect())
      } else if (next.size === rowCount && !selected) {
        queueMicrotask(() => onToggleSelect())
      }

      return next
    })
  }

  const isHighlighted = (selected || selectedRowCount > 0) && !resolved

  return (
    <div
      role="listitem"
      className={`border rounded-xl mb-2 overflow-hidden transition-[border-color,background-color] ${
        isHighlighted ? 'bg-gray-50' : 'bg-white'
      } ${getCardBorderClass({ selected: isHighlighted })}`}
    >
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 select-none">
        {!resolved && (
          <div className="shrink-0" onClick={e => e.stopPropagation()}>
            {!canSelect ? (
              <HLTooltip
                id={`action-item-manual-fix-${item.id}`}
                variant="dark"
                placement="top"
                content={MANUAL_FIX_TOOLTIP}
              >
                <HLCheckbox
                  id={`action-item-${item.id}`}
                  size="xs"
                  checked={selected}
                  disabled
                  aria-label="Not auto-fixable"
                  className="shrink-0"
                  onChange={() => {}}
                />
              </HLTooltip>
            ) : (
              <HLCheckbox
                id={`action-item-${item.id}`}
                size="xs"
                checked={cardChecked}
                indeterminate={cardIndeterminate}
                aria-label="Select item"
                className="shrink-0"
                onChange={handleCardCheckboxChange}
              />
            )}
          </div>
        )}
        <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${PRIORITY_DOT[item.priority]}`} aria-hidden="true" />
        <button
          type="button"
          className="flex flex-1 items-start gap-2.5 min-w-0 cursor-pointer text-left bg-transparent border-0 p-0"
          onClick={() => setOpen(v => !v)}
        >
          <div className="flex-1 min-w-0">
            <p className={`text-[13px] leading-snug m-0 mb-1 min-w-0 ${resolved || isHighlighted ? 'text-gray-500' : 'text-gray-900'}`}>
              {item.title}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(item.tags ?? []).map(tag => (
                <HrTag key={tag}>{tag}</HrTag>
              ))}
              {resolved && (
                <HrTag>Resolved items</HrTag>
              )}
              {!resolved && item.autofix && (
                <HrTag variant="autofix">
                  <Sparkles size={11} />
                  Auto-fix
                </HrTag>
              )}
              {!resolved && isSubscription && (
                <HrTag variant="manual">
                  <Zap size={10} />
                  Subscription fix
                </HrTag>
              )}
            </div>
          </div>
        </button>
        {item.affectedPages != null && (
          <span className="text-[11px] text-gray-500 shrink-0">
            {item.affectedPages === 'site-wide' ? 'Site-wide' : `${item.affectedPages} pages`}
          </span>
        )}
        <button
          type="button"
          aria-label={open ? 'Collapse details' : 'Expand details'}
          className="shrink-0 bg-transparent border-0 p-0 cursor-pointer"
          onClick={() => setOpen(v => !v)}
        >
          <ChevronDown size={14} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isSubscription && <SubscribeFlow />}

      {open && (
        <div className="border-t border-gray-200">
          {item.detailType === 'table' && item.tableRows ? (
            <ActionItemDetailTable
              itemId={item.id}
              columns={item.tableColumns}
              rows={item.tableRows}
              editable={item.autofix}
              selectable={canSelect}
              selectedRows={selectedRows}
              onToggleRow={toggleRowSelect}
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
