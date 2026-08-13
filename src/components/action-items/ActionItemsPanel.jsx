import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Check, Info, X } from '../../icons/index.js'
import { actionItems as defaultActionItems } from '../../data/actionItems.js'
import HLButton from '../HLButton.jsx'
import HLCheckbox from '../HLCheckbox.jsx'
import ActionItemCard from './ActionItemCard.jsx'
import { getActionItemsFooterState } from '../../data/implementFlow.js'

/** @typedef {Set<'error' | 'warning' | 'notice' | 'autofix' | 'website' | 'gbp' | 'listing'>} ActiveFilters */

const FILTER_OPTIONS = [
  { label: 'Errors', value: 'error', showCount: true, priority: 'error' },
  { label: 'Warnings', value: 'warning', showCount: true, priority: 'warning' },
  { label: 'Notices', value: 'notice', showCount: true, priority: 'notice' },
  { label: 'Auto-fix', value: 'autofix', showCount: false },
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

const RESOLVED_SECTION_LABEL = 'Resolved items'

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
      className={`text-[14px] px-3 py-1 rounded-full border transition-colors shrink-0 ${
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

function SectionLabel({ children, suppressTopMargin = false }) {
  return (
    <div
      className={`text-[11px] font-medium text-gray-500 mb-1.5 pl-0.5 ${suppressTopMargin ? '' : 'mt-4'}`}
    >
      {children}
    </div>
  )
}

function SelectAllAutofixRow({ selectableCount, selectedAutofixCount, onToggleSelectAll }) {
  const allSelected = selectedAutofixCount === selectableCount && selectableCount > 0
  const someSelected = selectedAutofixCount > 0 && !allSelected

  let label = 'Select all auto-fix items'
  if (allSelected) {
    label = `All ${selectableCount} auto-fix items selected`
  } else if (someSelected) {
    label = `${selectedAutofixCount} of ${selectableCount} auto-fix items selected`
  }

  const rowBg = allSelected ? 'bg-purple-50' : someSelected ? 'bg-warning-50' : 'bg-gray-50'

  return (
    <div className={`-mx-4 border-t border-b border-gray-200 ${rowBg}`}>
      <label className="mx-4 flex cursor-pointer items-center gap-2.5 px-3.5 py-2.5">
        <HLCheckbox
          id="action-items-select-all-autofix"
          size="xs"
          checked={allSelected}
          indeterminate={someSelected}
          onChange={onToggleSelectAll}
          aria-label={label}
          className="shrink-0"
        />
        <span className="text-[13px] font-medium text-gray-700">{label}</span>
      </label>
    </div>
  )
}

function ActionItemsFooter({
  footerState,
  packageCustomizerMode,
  onImplementSelected,
  onCancel,
  onRescan,
  showTertiaryRescan,
}) {
  const bgClass =
    packageCustomizerMode || footerState.mode === 'manual-only' ? 'bg-purple-50' : 'bg-white'
  const primaryBtnClass =
    'flex items-center gap-1.5 text-[13px] font-medium px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap'

  if (footerState.mode === 'manual-only') {
    return (
      <div className={`shrink-0 border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-3 ${bgClass}`}>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-gray-500 min-w-0">
          <Info size={14} className="shrink-0 text-gray-500" />
          Fix manual actions and then rescan to verify.
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <HLButton
            id="action-items-cancel-manual"
            variant="secondary"
            color="purple"
            size="sm"
            disabled={footerState.cancelDisabled}
            onClick={onCancel}
          >
            Cancel
          </HLButton>
          <button
            type="button"
            disabled={footerState.rescanDisabled}
            onClick={onRescan}
            className={primaryBtnClass}
          >
            Rescan site
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`shrink-0 border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-3 ${bgClass}`}>
      {showTertiaryRescan ? (
        <HLButton
          id="action-items-rescan-tertiary"
          variant="tertiary"
          color="gray"
          size="sm"
          disabled={footerState.rescanTertiaryDisabled}
          className="whitespace-nowrap"
          onClick={onRescan}
        >
          Rescan site
        </HLButton>
      ) : (
        <span aria-hidden="true" />
      )}
      <div className="flex items-center gap-2 shrink-0">
        <HLButton
          id="action-items-cancel"
          variant="secondary"
          color="purple"
          size="sm"
          disabled={footerState.cancelDisabled}
          onClick={onCancel}
        >
          Cancel
        </HLButton>
        <button
          type="button"
          disabled={footerState.implementSelectedDisabled}
          onClick={onImplementSelected}
          className={primaryBtnClass}
        >
          <Check size={14} />
          Setup to Auto-fix selected
        </button>
      </div>
    </div>
  )
}

function ItemList({ items, selected, onToggleSelect, onUpdateRec, resolved = false, defaultOpenItemId = null }) {
  return items.map(item => (
    <ActionItemCard
      key={item.id}
      item={item}
      selected={selected.has(item.id)}
      resolved={resolved}
      defaultOpen={!resolved && item.id === defaultOpenItemId}
      onToggleSelect={() => onToggleSelect(item.id)}
      onUpdateRec={(rowIndex, text) => onUpdateRec(item.id, rowIndex, text)}
    />
  ))
}

export default function ActionItemsPanel({
  items: initialItems = defaultActionItems,
  embedded = false,
  implementFlow = null,
  onStartImplement,
  onCancel,
  onRescan,
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

  useEffect(() => {
    setLocalItems(
      initialItems.map(i => ({
        ...i,
        recommendation: i.recommendation ?? '',
        tableRows: i.tableRows?.map(r => ({ ...r })),
      })),
    )
    setSelected(new Set())
  }, [initialItems])

  const manualOnlyMode = Boolean(implementFlow?.freeImplementDone || implementFlow?.allAutoFixesDone)

  const resolvedItemIds = useMemo(
    () => new Set(implementFlow?.resolvedItemIds ?? []),
    [implementFlow?.resolvedItemIds],
  )
  const pendingItems = useMemo(
    () => localItems.filter(item => !resolvedItemIds.has(item.id)),
    [localItems, resolvedItemIds],
  )
  const resolvedItems = useMemo(
    () => sortByPriority(localItems.filter(item => resolvedItemIds.has(item.id))),
    [localItems, resolvedItemIds],
  )

  const errorCount = useMemo(() => pendingItems.filter(i => i.priority === 'error').length, [pendingItems])
  const warningCount = useMemo(() => pendingItems.filter(i => i.priority === 'warning').length, [pendingItems])
  const noticeCount = useMemo(() => pendingItems.filter(i => i.priority === 'notice').length, [pendingItems])
  const autofixCount = useMemo(() => pendingItems.filter(i => i.autofix).length, [pendingItems])
  const filtered = useMemo(
    () => pendingItems.filter(i => matchesFilters(i, activeFilters)),
    [pendingItems, activeFilters],
  )
  const categoryGroups = useMemo(() => groupItemsByCategory(filtered, activeFilters), [filtered, activeFilters])
  const defaultOpenItemId = useMemo(() => {
    const groups = groupItemsByCategory(pendingItems, new Set())
    for (const group of groups) {
      if (group.items.length > 0) return group.items[0].id
    }
    return null
  }, [pendingItems])
  const selectedAutofixCount = useMemo(
    () => [...selected].filter(id => pendingItems.find(i => i.id === id)?.autofix).length,
    [selected, pendingItems],
  )
  const packageCustomizerMode = !manualOnlyMode
  const selectedItems = useMemo(
    () => pendingItems.filter(i => selected.has(i.id)),
    [pendingItems, selected],
  )
  const selectableAll = useMemo(
    () => pendingItems.filter(item => item.autofix),
    [pendingItems],
  )

  const footerState = getActionItemsFooterState({
    implementFlow,
    selectedAutofixCount,
    selectableAutofixCount: selectableAll.length,
  })

  const isImplementBusy = ['cloudflare-token', 'cloudflare-credentials', 'implementing'].includes(
    implementFlow?.step,
  )
  const showSelectAllRow = !manualOnlyMode && selectableAll.length >= 2 && !isImplementBusy
  const showTertiaryRescan = !manualOnlyMode && selectableAll.length > 0

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

  function toggleSelect(id) {
    const item = pendingItems.find(i => i.id === id)
    if (!item?.autofix) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAllAutofix() {
    const allIds = selectableAll.map(item => item.id)
    const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id))
    setSelected(prev => {
      const next = new Set(prev)
      if (allSelected) {
        allIds.forEach(id => next.delete(id))
      } else {
        allIds.forEach(id => next.add(id))
      }
      return next
    })
  }

  function handleImplementSelected() {
    if (selectedItems.length === 0) return
    onStartImplement?.(selectedItems.filter(item => item.autofix))
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
        <span className="text-[14px] text-gray-500 shrink-0">Filter by:</span>
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

      {showSelectAllRow && (
        <SelectAllAutofixRow
          selectableCount={selectableAll.length}
          selectedAutofixCount={selectedAutofixCount}
          onToggleSelectAll={toggleSelectAllAutofix}
        />
      )}

      <div ref={listAreaRef} role="list" style={{ minHeight: listMinHeight > 0 ? listMinHeight : undefined }}>
        {categoryGroups.map((group, index) => (
          <div key={group.id}>
            <SectionLabel suppressTopMargin={index === 0 && !showSelectAllRow}>{group.label}</SectionLabel>
            {group.items.length > 0 && (
              <ItemList
                items={group.items}
                selected={selected}
                onToggleSelect={toggleSelect}
                onUpdateRec={updateRecommendation}
                defaultOpenItemId={defaultOpenItemId}
              />
            )}
          </div>
        ))}
        {resolvedItems.length > 0 && (
          <div>
            <SectionLabel suppressTopMargin={categoryGroups.length === 0 && !showSelectAllRow}>
              {RESOLVED_SECTION_LABEL}
            </SectionLabel>
            <ItemList
              items={resolvedItems}
              selected={selected}
              onToggleSelect={toggleSelect}
              onUpdateRec={updateRecommendation}
              resolved
            />
          </div>
        )}
      </div>
    </>
  )

  const stickyFooter = (
    <ActionItemsFooter
      footerState={footerState}
      packageCustomizerMode={packageCustomizerMode}
      onImplementSelected={handleImplementSelected}
      onCancel={() => onCancel?.()}
      onRescan={() => onRescan?.()}
      showTertiaryRescan={showTertiaryRescan}
    />
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
      {stickyFooter}
    </section>
  )
}
