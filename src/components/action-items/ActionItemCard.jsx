import { useState, useEffect } from 'react'
import { ChevronDown, Globe, MapPin, Sparkles, Bot, Zap, Lock01Icon } from '../../icons/index.js'
import HLCheckbox from '../HLCheckbox.jsx'
import HLTooltip from '../HLTooltip.jsx'
import ActionItemDetailTable from './ActionItemDetailTable.jsx'
import ActionItemDetailSingle from './ActionItemDetailSingle.jsx'

/** Prototype free-fix cap — replace with billing entitlements in production */
const FREE_FIX_LIMIT_TOOLTIP = (
  <>
    You have reached the 3 free fix limit.
    <br />
    Subscribe to unlock all fixes.
  </>
)

const MANUAL_FIX_TOOLTIP = 'Auto-fix not available'

const PRIORITY_DOT = {
  error: 'bg-error-600',
  warning: 'bg-warning-250',
  notice: 'bg-primary-600',
}

function getCardBorderClass({ isLocked, selected }) {
  if (isLocked) return 'border-gray-100'
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

function LockedSelectionControl({ itemId, showFreeLimitTooltip = false }) {
  const control = (
    <span
      aria-hidden="true"
      style={{ width: 16, height: 16, borderRadius: 4 }}
      className="box-border border border-gray-300 bg-gray-100 inline-flex items-center justify-center shrink-0"
    >
      <Lock01Icon size={10} className="text-gray-400" strokeWidth={2} />
    </span>
  )

  if (!showFreeLimitTooltip) return control

  return (
    <HLTooltip
      id={`action-item-free-limit-lock-${itemId}`}
      variant="dark"
      placement="top"
      content={FREE_FIX_LIMIT_TOOLTIP}
      wrap
    >
      {control}
    </HLTooltip>
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
            className="shrink-0 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[12px] font-semibold transition-colors"
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

export default function ActionItemCard({ item, selected, onToggleSelect, onUpdateRec, selectionLocked = false }) {
  const [open, setOpen] = useState(false)
  const [selectedRows, setSelectedRows] = useState(() => new Set())
  const isLocked = item.locked === true
  const isSubscription = item.fixFlow === 'subscription'
  const isFreeLimitLocked = selectionLocked && !selected && !isLocked && item.autofix
  const showLockedControl = isLocked || isFreeLimitLocked
  const canSelect = item.autofix && !isLocked && !isFreeLimitLocked
  const sourceMap = { gbp: { icon: MapPin, label: 'GBP' }, seo: { icon: Globe, label: 'Website SEO' }, ai: { icon: Bot, label: 'AI Search' } }
  const { icon: SourceIcon, label: sourceLabel } = sourceMap[item.source] ?? { icon: Globe, label: 'Website SEO' }

  useEffect(() => {
    if (!item.tableRows?.length) return
    if (selected) {
      setSelectedRows(new Set(item.tableRows.map((_, idx) => idx)))
    } else {
      setSelectedRows(new Set())
    }
  }, [selected, item.tableRows])

  function toggleRowSelect(rowIndex) {
    if (!canSelect) return
    setSelectedRows(prev => {
      const next = new Set(prev)
      if (next.has(rowIndex)) next.delete(rowIndex)
      else next.add(rowIndex)
      return next
    })
  }

  return (
    <div
      role="listitem"
      className={`bg-white border rounded-xl mb-2 overflow-hidden transition-[border-color] ${getCardBorderClass({ isLocked, selected })}`}
    >
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer select-none" onClick={() => !isLocked && setOpen(v => !v)}>
        {showLockedControl ? (
          <LockedSelectionControl itemId={item.id} showFreeLimitTooltip={isFreeLimitLocked} />
        ) : !canSelect ? (
          <HLTooltip
            id={`action-item-manual-fix-${item.id}`}
            variant="dark"
            placement="top"
            content={MANUAL_FIX_TOOLTIP}
          >
            <HLCheckbox
              id={`action-item-${item.id}`}
              size="sm"
              checked={selected}
              disabled
              aria-label="Manual fix only"
              className="shrink-0"
              onChange={() => {}}
            />
          </HLTooltip>
        ) : (
          <HLCheckbox
            id={`action-item-${item.id}`}
            size="sm"
            checked={selected}
            aria-label="Select item"
            className="shrink-0"
            onChange={() => {
              onToggleSelect()
            }}
          />
        )}
        <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${PRIORITY_DOT[item.priority]}`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className={`text-[13px] leading-snug m-0 mb-1 ${isLocked ? 'text-gray-500' : selected ? 'line-through text-gray-400' : 'text-gray-900'}`}>
            {item.title}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
              <SourceIcon size={12} />
              {sourceLabel}
            </span>
            {(item.tags ?? []).map(tag => (
              <HrTag key={tag}>{tag}</HrTag>
            ))}
            {item.autofix && !isLocked && (
              <HrTag variant="autofix">
                <Sparkles size={11} />
                Auto-fix
              </HrTag>
            )}
            {item.manualFix && <HrTag variant="manual">Manual fix</HrTag>}
            {isLocked && (
              <span className="inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full border bg-warning-100 text-warning-600 border-warning-200 whitespace-nowrap">
                <Lock01Icon size={10} strokeWidth={2} />
                Upgrade to unlock
              </span>
            )}
            {isSubscription && !isLocked && (
              <HrTag variant="manual">
                <Zap size={10} />
                Subscription fix
              </HrTag>
            )}
          </div>
        </div>
        {item.affectedPages != null && (
          <span className="text-[11px] text-gray-400 shrink-0">
            {item.affectedPages === 'site-wide' ? 'Site-wide' : `${item.affectedPages} pages`}
          </span>
        )}
        {!isLocked && (
          <ChevronDown size={14} className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </div>

      {/* Subscription CTA — shown expanded by default for subscription items */}
      {isSubscription && <SubscribeFlow />}

      {open && !isLocked && (
        <div className="border-t border-gray-200">
          {item.detailType === 'table' && item.tableRows ? (
            <ActionItemDetailTable
              itemId={item.id}
              columns={item.tableColumns}
              rows={item.tableRows}
              editable={item.autofix}
              selectable={canSelect}
              selectionLocked={selectionLocked}
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
