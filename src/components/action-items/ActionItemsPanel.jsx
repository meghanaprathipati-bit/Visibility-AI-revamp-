import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Check, HelpCircle, X } from '../../icons/index.js'
import { actionItems as defaultActionItems } from '../../data/actionItems.js'
import HLAlert from '../HLAlert.jsx'
import ActionItemCard from './ActionItemCard.jsx'
import { getImplementButtonState } from '../../data/implementFlow.js'

/** @typedef {Set<'error' | 'warning' | 'notice' | 'autofix' | 'website' | 'gbp' | 'listing'>} ActiveFilters */

/** Prototype free-fix cap for package customizer — replace with billing entitlements in production */
const DEFAULT_FREE_FIX_LIMIT = 3
/** Total issues referenced in upgrade copy — replace with API count in production */
const DEFAULT_TOTAL_UPGRADE_ISSUES = 10

const FILTER_OPTIONS = [
  { label: 'Errors', value: 'error', showCount: true, priority: 'error' },
  { label: 'Warnings', value: 'warning', showCount: true, priority: 'warning' },
  { label: 'Notices', value: 'notice', showCount: true, priority: 'notice' },
  { label: 'Auto-fixable', value: 'autofix', showCount: false },
  { label: 'Website', value: 'website', showCount: false },
  { label: 'GBP', value: 'gbp', showCount: false },
  { label: 'Listing', value: 'listing', showCount: false },
]

/** Display order for action item list sections — replace with API category field in production */
const CATEGORY_SECTIONS = [
  { id: 'website', label: 'Website' },
  { id: 'gbp', label: 'GBP' },
  { id: 'listing', label: 'Listing' },
]

const CATEGORY_FILTER_IDS = ['website', 'gbp', 'listing']
const SEVERITY_FILTER_IDS = ['error', 'warning', 'notice']

const PRIORITY_ORDER = { error: 0, warning: 1, notice: 2 }

const PRIORITY_DOT = {
  error: 'bg-error-600',
  warning: 'bg-warning-250',
  notice: 'bg-primary-600',
}

/** Maps seed/API item to list category — replace with API category in production */
function getItemCategory(item) {
  if (item.category) return item.category
  if (item.source === 'gbp') return 'gbp'
  if (item.source === 'listings' || item.source === 'listing') return 'listing'
  if (item.source === 'seo') return 'website'
  return 'website'
}

function sortByPriority(items) {
  return [...items].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
}

function getVisibleCategorySections(activeFilters) {
  const activeCategoryFilters = CATEGORY_FILTER_IDS.filter(id => activeFilters.has(id))
  if (activeCategoryFilters.length > 0) {
    return CATEGORY_SECTIONS.filter(section => activeCategoryFilters.includes(section.id))
  }
  return CATEGORY_SECTIONS
}

function groupItemsByCategory(items, activeFilters) {
  return getVisibleCategorySections(activeFilters).map(section => ({
    ...section,
    items: sortByPriority(items.filter(item => getItemCategory(item) === section.id)),
  }))
}

function getScrollParent(el) {
  let parent = el?.parentElement
  while (parent) {
    const { overflowY } = getComputedStyle(parent)
    if (overflowY === 'auto' || overflowY === 'scroll') return parent
    parent = parent.parentElement
  }
  return null
}

function matchesFilters(item, filters) {
  if (filters.size === 0) return true

  const categoryFilters = CATEGORY_FILTER_IDS.filter(id => filters.has(id))
  const severityFilters = SEVERITY_FILTER_IDS.filter(id => filters.has(id))
  const autofixActive = filters.has('autofix')

  if (categoryFilters.length > 0 && !categoryFilters.includes(getItemCategory(item))) {
    return false
  }
  if (severityFilters.length > 0 && !severityFilters.includes(item.priority)) {
    return false
  }
  if (autofixActive && !item.autofix) {
    return false
  }
  return true
}

function SummaryStat({ borderClass, icon, countClass, count, label }) {
  return (
    <div className={`flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-md border bg-gray-50 ${borderClass}`} aria-label={`${count} ${label}`}>
      <span className="shrink-0">{icon}</span>
      <div className="min-w-0">
        <span className={`text-[14px] font-medium leading-none ${countClass}`}>{count}</span>
        <span className="text-[11px] text-gray-500 ml-1">{label}</span>
      </div>
    </div>
  )
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`text-[12px] px-3 py-1 rounded-full border transition-colors shrink-0 ${
        active ? 'border-primary-600 text-primary-700 bg-primary-50' : 'border-gray-200 text-gray-500 bg-transparent hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}

function PriorityFilterDot({ priority }) {
  return (
    <span
      className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[priority]}`}
      aria-hidden="true"
    />
  )
}

function SectionLabel({ children }) {
  return (
    <div className="text-[11px] font-medium text-gray-400 mt-4 mb-1.5 pl-0.5 first:mt-0">
      {children}
    </div>
  )
}

function ItemList({ items, selected, onToggleSelect, onUpdateRec, selectionLocked }) {
  return items.map(item => (
    <ActionItemCard
      key={item.id}
      item={item}
      selected={selected.has(item.id)}
      onToggleSelect={() => onToggleSelect(item.id)}
      onUpdateRec={(rowIndex, text) => onUpdateRec(item.id, rowIndex, text)}
      selectionLocked={selectionLocked}
    />
  ))
}

export default function ActionItemsPanel({
  items: initialItems = defaultActionItems,
  embedded = false,
  freeFixLimit = null,
  totalUpgradeIssues = DEFAULT_TOTAL_UPGRADE_ISSUES,
  implementFlow = null,
  onStartImplement,
  onImplementPanelAction,
}) {
  const filterBarRef = useRef(null)
  const listAreaRef = useRef(null)
  const scrollAnchorRef = useRef(null)
  const listMinHeightRef = useRef(0)

  const [activeFilters, setActiveFilters] = useState(/** @type {ActiveFilters} */ () => new Set())
  const [selected, setSelected] = useState(() => new Set())
  const [listMinHeight, setListMinHeight] = useState(0)
  const [localItems, setLocalItems] = useState(() =>
    initialItems.map(i => ({
      ...i,
      recommendation: i.recommendation ?? '',
      tableRows: i.tableRows?.map(r => ({ ...r })),
    })),
  )

  const errorCount = useMemo(() => localItems.filter(i => i.priority === 'error').length, [localItems])
  const warningCount = useMemo(() => localItems.filter(i => i.priority === 'warning').length, [localItems])
  const noticeCount = useMemo(() => localItems.filter(i => i.priority === 'notice').length, [localItems])
  const autofixCount = useMemo(() => localItems.filter(i => i.autofix).length, [localItems])
  const filtered = useMemo(() => localItems.filter(i => matchesFilters(i, activeFilters)), [localItems, activeFilters])
  const categoryGroups = useMemo(() => groupItemsByCategory(filtered, activeFilters), [filtered, activeFilters])
  const selectedAutofixCount = useMemo(
    () => [...selected].filter(id => localItems.find(i => i.id === id)?.autofix).length,
    [selected, localItems],
  )
  const resolvedFreeFixLimit = freeFixLimit !== undefined
    ? freeFixLimit
    : (embedded ? DEFAULT_FREE_FIX_LIMIT : null)
  const freeLimitReached = resolvedFreeFixLimit != null && selectedAutofixCount >= resolvedFreeFixLimit
  const remainingLockedIssues = Math.max(totalUpgradeIssues - selectedAutofixCount, 0)
  const packageCustomizerMode = resolvedFreeFixLimit != null
  const selectedItems = useMemo(
    () => localItems.filter(i => selected.has(i.id)),
    [localItems, selected],
  )

  const implementButton = getImplementButtonState({
    implementFlow,
    selectedAutofixCount,
    packageCustomizerMode,
    freeFixLimit: resolvedFreeFixLimit,
  })

  function toggleFilter(value) {
    const anchor = filterBarRef.current
    const scrollParent = anchor ? getScrollParent(anchor) : null
    if (anchor && scrollParent) {
      scrollAnchorRef.current = { scrollParent, topBefore: anchor.getBoundingClientRect().top }
    }
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  function clearAllFilters() {
    const anchor = filterBarRef.current
    const scrollParent = anchor ? getScrollParent(anchor) : null
    if (anchor && scrollParent) {
      scrollAnchorRef.current = { scrollParent, topBefore: anchor.getBoundingClientRect().top }
    }
    setActiveFilters(new Set())
  }

  useLayoutEffect(() => {
    if (activeFilters.size !== 0 || !listAreaRef.current) return
    const height = listAreaRef.current.scrollHeight
    if (height > listMinHeightRef.current) {
      listMinHeightRef.current = height
      setListMinHeight(height)
    }
  }, [activeFilters, localItems])

  useLayoutEffect(() => {
    const anchor = scrollAnchorRef.current
    if (!anchor || !filterBarRef.current) return
    const topAfter = filterBarRef.current.getBoundingClientRect().top
    const delta = topAfter - anchor.topBefore
    if (delta !== 0) anchor.scrollParent.scrollTop += delta
    scrollAnchorRef.current = null
  }, [activeFilters, filtered.length])

  function countSelectedAutofix(selectedSet) {
    return [...selectedSet].filter(itemId => localItems.find(i => i.id === itemId)?.autofix).length
  }

  function toggleSelect(id) {
    const item = localItems.find(i => i.id === id)
    if (!item?.autofix || item.locked) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        return next
      }
      if (resolvedFreeFixLimit != null && countSelectedAutofix(next) >= resolvedFreeFixLimit) {
        return prev
      }
      next.add(id)
      return next
    })
  }

  function removeSelected() {
    setLocalItems(prev => prev.filter(i => !selected.has(i.id)))
    setSelected(new Set())
  }

  function updateRecommendation(id, rowIndex, newText) {
    setLocalItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item
        if (rowIndex !== null && item.tableRows) {
          return {
            ...item,
            tableRows: item.tableRows.map((row, idx) =>
              idx === rowIndex ? { ...row, recommendation: newText } : row,
            ),
          }
        }
        return { ...item, recommendation: newText }
      }),
    )
  }

  const filterCounts = { error: errorCount, warning: warningCount, notice: noticeCount }

  const scrollableContent = (
    <>
      <div ref={filterBarRef} className="flex items-center gap-2 flex-wrap my-4">
        <span className="text-[12px] text-gray-500 shrink-0">Filter by:</span>
        {FILTER_OPTIONS.map(f => {
          const count = filterCounts[f.value]
          if (f.value === 'notice' && count === 0) return null
          if (f.value === 'autofix' && count === 0) return null
          return (
            <FilterPill key={f.value} active={activeFilters.has(f.value)} onClick={() => toggleFilter(f.value)}>
              {f.showCount ? (
                <span className="inline-flex items-center gap-1.5">
                  <PriorityFilterDot priority={f.priority} />
                  {count > 0 ? `${count} ${f.label}` : f.label}
                </span>
              ) : (
                f.label
              )}
            </FilterPill>
          )
        })}
        {activeFilters.size >= 2 && (
          <>
            <span className="w-px h-4 bg-gray-200 shrink-0" aria-hidden="true" />
            <FilterPill active={false} onClick={clearAllFilters}>
              <span className="inline-flex items-center gap-1.5 text-gray-700">
                <X size={12} strokeWidth={2} />
                Clear all
              </span>
            </FilterPill>
          </>
        )}
      </div>

      <div ref={listAreaRef} role="list" style={{ minHeight: listMinHeight > 0 ? listMinHeight : undefined }}>
        {categoryGroups.map(group => (
          <div key={group.id}>
            <SectionLabel>{group.label}</SectionLabel>
            {group.items.length > 0 && (
              <ItemList
                items={group.items}
                selected={selected}
                onToggleSelect={toggleSelect}
                onUpdateRec={updateRecommendation}
                selectionLocked={freeLimitReached}
              />
            )}
          </div>
        ))}
      </div>
    </>
  )

  function renderFooterStatusText() {
    if (packageCustomizerMode) {
      return `${selectedAutofixCount} / ${resolvedFreeFixLimit} free fixes selected.`
    }
    if (selectedAutofixCount === 0) return 'Select auto-fix items to implement'
    return `${selectedAutofixCount} auto-fix item${selectedAutofixCount === 1 ? '' : 's'} selected`
  }

  function renderPrimaryCtaLabel() {
    return implementButton.label
  }

  function isPrimaryCtaDisabled() {
    return implementButton.disabled
  }

  function handlePrimaryCtaClick() {
    if (implementButton.action === 'confirm') {
      onImplementPanelAction?.('confirm')
      return
    }
    if (implementButton.action === 'subscribe') {
      onImplementPanelAction?.('subscribe')
      return
    }
    if (implementButton.action === 'start') {
      onStartImplement?.(selectedItems)
    }
  }

  function handleUpgradeClick() {
    // Prototype — wire to upgrade flow in production
  }

  const limitAlert = packageCustomizerMode && freeLimitReached && (
    <div className="shrink-0 px-4 pt-3 pb-2 border-t border-gray-200 bg-white">
      <HLAlert
        id="action-items-free-limit"
        color="orange"
        type="alert"
        title="Free limit reached"
        actionOne={{
          text: 'Unlock all fixes',
          ariaLabel: 'Unlock all fixes',
          onActionClick: handleUpgradeClick,
        }}
      >
        {`You've selected your ${resolvedFreeFixLimit} free fixes. Upgrade to unlock and fix the remaining ${remainingLockedIssues} issues.`}
      </HLAlert>
    </div>
  )

  const stickyFooter = (
    <>
      {limitAlert}
      <div
        className={`shrink-0 border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-3 ${
          packageCustomizerMode ? 'bg-purple-50' : 'bg-white'
        }`}
      >
        <span className="text-[13px] text-gray-600 min-w-0">{renderFooterStatusText()}</span>
        <div className="flex gap-2 items-center shrink-0">
          {!packageCustomizerMode && selectedAutofixCount > 0 && (
            <button type="button" onClick={removeSelected} className="text-[13px] px-4 py-2 rounded-lg bg-transparent text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
              Remove
            </button>
          )}
          <button
            type="button"
            disabled={isPrimaryCtaDisabled()}
            onClick={handlePrimaryCtaClick}
            className="flex items-center gap-1.5 text-[13px] font-medium px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            <Check size={14} />
            {renderPrimaryCtaLabel()}
          </button>
        </div>
      </div>
    </>
  )

  if (embedded) {
    return (
      <section aria-label="Action items" className="flex flex-col h-full min-h-0 w-full [overflow-anchor:none]">
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-gray-300 px-4 pt-1 pb-4">
          {scrollableContent}
        </div>
        {stickyFooter}
      </section>
    )
  }

  return (
    <section
      aria-label="Action items"
      className="w-full bg-white overflow-hidden [overflow-anchor:none] rounded-xl border border-gray-200 shadow-xs py-4 px-4"
    >
      {scrollableContent}
      {limitAlert}
      <div
        className={`border-t border-gray-200 pt-3 pb-1 mt-3 flex items-center justify-between gap-3 ${
          packageCustomizerMode ? 'bg-purple-50 -mx-4 px-4 pb-3' : ''
        }`}
      >
        <span className="text-[13px] text-gray-600">{renderFooterStatusText()}</span>
        <div className="flex gap-2 items-center">
          {!packageCustomizerMode && selectedAutofixCount > 0 && (
            <button type="button" onClick={removeSelected} className="text-[13px] px-4 py-2 rounded-lg bg-transparent text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
              Remove
            </button>
          )}
          <button
            type="button"
            disabled={isPrimaryCtaDisabled()}
            onClick={handlePrimaryCtaClick}
            className="flex items-center gap-1.5 text-[13px] font-medium px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Check size={14} />
            {renderPrimaryCtaLabel()}
          </button>
        </div>
      </div>
    </section>
  )
}
