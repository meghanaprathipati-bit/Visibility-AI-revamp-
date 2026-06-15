import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Check, HelpCircle, X } from '../../icons/index.js'
import { actionItems as defaultActionItems } from '../../data/actionItems.js'
import HLAlert from '../HLAlert.jsx'
import ActionItemCard from './ActionItemCard.jsx'

/** @typedef {Set<'error' | 'warning' | 'notice' | 'autofix' | 'gbp' | 'seo'>} ActiveFilters */

/** Prototype free-fix cap for package customizer — replace with billing entitlements in production */
const DEFAULT_FREE_FIX_LIMIT = 3
/** Total issues referenced in upgrade copy — replace with API count in production */
const DEFAULT_TOTAL_UPGRADE_ISSUES = 10

const FILTER_OPTIONS = [
  { label: 'Errors', value: 'error' },
  { label: 'Warnings', value: 'warning' },
  { label: 'Notices', value: 'notice' },
  { label: 'Auto-fixable', value: 'autofix' },
  { label: 'GBP', value: 'gbp' },
  { label: 'Website SEO', value: 'seo' },
]

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
  return [...filters].some(f => {
    if (f === 'autofix') return item.autofix
    if (f === 'gbp') return item.source === 'gbp'
    if (f === 'seo') return item.source === 'seo'
    return item.priority === f
  })
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
  const filtered = useMemo(() => localItems.filter(i => matchesFilters(i, activeFilters)), [localItems, activeFilters])
  const errorItems = useMemo(() => filtered.filter(i => i.priority === 'error'), [filtered])
  const warningItems = useMemo(() => filtered.filter(i => i.priority === 'warning'), [filtered])
  const noticeItems = useMemo(() => filtered.filter(i => i.priority === 'notice'), [filtered])
  const showSections = activeFilters.size === 0
  const autofixCount = useMemo(() => localItems.filter(i => i.autofix).length, [localItems])
  const gbpCount = useMemo(() => localItems.filter(i => i.source === 'gbp').length, [localItems])
  const seoCount = useMemo(() => localItems.filter(i => i.source === 'seo').length, [localItems])
  const selectedAutofixCount = useMemo(
    () => [...selected].filter(id => localItems.find(i => i.id === id)?.autofix).length,
    [selected, localItems],
  )
  const resolvedFreeFixLimit = freeFixLimit ?? (embedded ? DEFAULT_FREE_FIX_LIMIT : null)
  const freeLimitReached = resolvedFreeFixLimit != null && selectedAutofixCount >= resolvedFreeFixLimit
  const remainingLockedIssues = Math.max(totalUpgradeIssues - selectedAutofixCount, 0)
  const packageCustomizerMode = resolvedFreeFixLimit != null

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
    const item = localItems.find(i => i.id === id)
    if (!item?.autofix || item.locked) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        return next
      }
      if (resolvedFreeFixLimit != null && next.size >= resolvedFreeFixLimit) return prev
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

  const filterCounts = { error: errorCount, warning: warningCount, notice: noticeCount, autofix: autofixCount, gbp: gbpCount, seo: seoCount }

  const scrollableContent = (
    <>
      <div ref={filterBarRef} className="flex items-center gap-2 flex-wrap my-4">
        <span className="text-[12px] text-gray-500 shrink-0">Filter by:</span>
        {FILTER_OPTIONS.map(f => {
          const count = filterCounts[f.value]
          if (f.value === 'notice' && count === 0) return null
          if (f.value === 'autofix' && count === 0) return null
          const label =
            f.value === 'autofix' || f.value === 'gbp' || f.value === 'seo'
              ? count > 0 ? `${count} ${f.label}` : f.label
              : count > 0 ? `${count} ${f.label}` : f.label
          return (
            <FilterPill key={f.value} active={activeFilters.has(f.value)} onClick={() => toggleFilter(f.value)}>
              {label}
            </FilterPill>
          )
        })}
      </div>

      <div ref={listAreaRef} role="list" style={{ minHeight: listMinHeight > 0 ? listMinHeight : undefined }}>
        {filtered.length === 0 ? (
          <p className="text-center text-[13px] text-gray-500 py-6">No items match this filter.</p>
        ) : showSections ? (
          <>
            {errorItems.length > 0 && (
              <div>
                <SectionLabel>Errors</SectionLabel>
                <ItemList items={errorItems} selected={selected} onToggleSelect={toggleSelect} onUpdateRec={updateRecommendation} selectionLocked={freeLimitReached} />
              </div>
            )}
            {warningItems.length > 0 && (
              <div>
                <SectionLabel>Warnings</SectionLabel>
                <ItemList items={warningItems} selected={selected} onToggleSelect={toggleSelect} onUpdateRec={updateRecommendation} selectionLocked={freeLimitReached} />
              </div>
            )}
            {noticeItems.length > 0 && (
              <div>
                <SectionLabel>Notices</SectionLabel>
                <ItemList items={noticeItems} selected={selected} onToggleSelect={toggleSelect} onUpdateRec={updateRecommendation} selectionLocked={freeLimitReached} />
              </div>
            )}
          </>
        ) : (
          <ItemList items={filtered} selected={selected} onToggleSelect={toggleSelect} onUpdateRec={updateRecommendation} selectionLocked={freeLimitReached} />
        )}
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
    if (packageCustomizerMode) {
      return `Implement changes (${selectedAutofixCount}/${resolvedFreeFixLimit} free)`
    }
    return `Implement changes${selectedAutofixCount > 0 ? ` (${selectedAutofixCount})` : ''}`
  }

  function handlePrimaryCtaClick() {
    // Prototype — wire to implement flow in production
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
        closable={false}
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
            disabled={selectedAutofixCount === 0}
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
            disabled={selectedAutofixCount === 0}
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
