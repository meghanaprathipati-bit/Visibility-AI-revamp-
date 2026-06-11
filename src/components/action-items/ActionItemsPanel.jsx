import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, Check, HelpCircle, X } from '../../icons/index.js'
import { actionItems as defaultActionItems } from '../../data/actionItems.js'
import ActionItemCard from './ActionItemCard.jsx'

/** @typedef {'error' | 'warning' | 'notice' | 'autofix' | 'gbp' | 'seo' | null} ActiveFilter */

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

function matchesFilter(item, filter) {
  if (!filter) return true
  if (filter === 'autofix') return item.autofix
  if (filter === 'gbp') return item.source === 'gbp'
  if (filter === 'seo') return item.source === 'seo'
  return item.priority === filter
}

/** Summary stat — view-only dashboard count, not interactive */
function SummaryStat({ borderClass, icon, countClass, count, label }) {
  return (
    <div
      className={`flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-md border bg-gray-50 ${borderClass}`}
      aria-label={`${count} ${label}`}
    >
      <span className="shrink-0">{icon}</span>
      <div className="min-w-0">
        <span className={`text-[14px] font-medium leading-none ${countClass}`}>{count}</span>
        <span className="text-[11px] text-gray-500 ml-1">{label}</span>
      </div>
    </div>
  )
}

/** Filter pill — no "All" chip; deselecting shows everything */
function FilterPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`text-[12px] px-3 py-1 rounded-full border transition-colors shrink-0 ${
        active
          ? 'border-purple-600 text-purple-700 bg-purple-50'
          : 'border-gray-200 text-gray-500 bg-transparent hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}

function SectionLabel({ children }) {
  return (
    <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mt-4 mb-1.5 pl-0.5 first:mt-0">
      {children}
    </div>
  )
}

function ItemList({ items, selected, onToggleSelect, onUpdateRec }) {
  return items.map(item => (
    <ActionItemCard
      key={item.id}
      item={item}
      selected={selected.has(item.id)}
      onToggleSelect={() => onToggleSelect(item.id)}
      onUpdateRec={(rowIndex, text) => onUpdateRec(item.id, rowIndex, text)}
    />
  ))
}

/**
 * ActionItemsPanel — root panel per action-items-cursor-spec.
 * React + HighRise tokens + @gohighlevel/ghl-icons (Vue HighRise components are not usable in this React app).
 */
export default function ActionItemsPanel({ items: initialItems = defaultActionItems }) {
  const filterBarRef = useRef(null)
  const listAreaRef = useRef(null)
  const scrollAnchorRef = useRef(/** @type {{ scrollParent: Element, topBefore: number } | null} */ (null))
  const listMinHeightRef = useRef(0)

  const [activeFilter, setActiveFilter] = useState(/** @type {ActiveFilter} */ (null))
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

  const filtered = useMemo(
    () => localItems.filter(i => matchesFilter(i, activeFilter)),
    [localItems, activeFilter],
  )

  const errorItems = useMemo(() => filtered.filter(i => i.priority === 'error'), [filtered])
  const warningItems = useMemo(() => filtered.filter(i => i.priority === 'warning'), [filtered])
  const noticeItems = useMemo(() => filtered.filter(i => i.priority === 'notice'), [filtered])
  const showSections = activeFilter === null

  const autofixCount = useMemo(() => localItems.filter(i => i.autofix).length, [localItems])
  const gbpCount = useMemo(() => localItems.filter(i => i.source === 'gbp').length, [localItems])
  const seoCount = useMemo(() => localItems.filter(i => i.source === 'seo').length, [localItems])

  function toggleFilter(value) {
    const anchor = filterBarRef.current
    const scrollParent = anchor ? getScrollParent(anchor) : null
    if (anchor && scrollParent) {
      scrollAnchorRef.current = {
        scrollParent,
        topBefore: anchor.getBoundingClientRect().top,
      }
    }
    setActiveFilter(prev => (prev === value ? null : value))
  }

  // Measure full unfiltered list height once — keeps list area stable when filters change
  useLayoutEffect(() => {
    if (activeFilter !== null || !listAreaRef.current) return
    const height = listAreaRef.current.scrollHeight
    if (height > listMinHeightRef.current) {
      listMinHeightRef.current = height
      setListMinHeight(height)
    }
  }, [activeFilter, localItems])

  // Keep filter bar anchored in the viewport when list height changes
  useLayoutEffect(() => {
    const anchor = scrollAnchorRef.current
    if (!anchor || !filterBarRef.current) return

    const topAfter = filterBarRef.current.getBoundingClientRect().top
    const delta = topAfter - anchor.topBefore
    if (delta !== 0) {
      anchor.scrollParent.scrollTop += delta
    }
    scrollAnchorRef.current = null
  }, [activeFilter, filtered.length])

  function toggleSelect(id) {
    const item = localItems.find(i => i.id === id)
    if (!item?.autofix) return
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedAutofixCount = useMemo(
    () => [...selected].filter(id => localItems.find(i => i.id === id)?.autofix).length,
    [selected, localItems],
  )

  function removeSelected() {
    setLocalItems(prev => prev.filter(i => !selected.has(i.id)))
    setSelected(new Set())
  }

  function updateRecommendation(id, rowIndex, newText) {
    setLocalItems(prev =>
      prev.map(item => {
        if (item.id !== id) return item
        if (rowIndex !== null && item.tableRows) {
          const tableRows = item.tableRows.map((row, idx) =>
            idx === rowIndex ? { ...row, recommendation: newText } : row,
          )
          return { ...item, tableRows }
        }
        return { ...item, recommendation: newText }
      }),
    )
  }

  function handleImplement() {
    // Wire to implement API in production
  }

  const filterCounts = {
    error: errorCount,
    warning: warningCount,
    notice: noticeCount,
    autofix: autofixCount,
    gbp: gbpCount,
    seo: seoCount,
  }

  return (
    <section
      aria-label="Action items"
      className="w-full rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs py-4 px-4 [overflow-anchor:none]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[15px] font-medium text-gray-900">
          Action items{' '}
          <span className="text-gray-400 font-normal">
            ({activeFilter === null ? localItems.length : filtered.length})
          </span>
        </span>
      </div>

      {/* Summary stats — view-only, compact */}
      <div className="flex gap-2 mb-3">
        <SummaryStat
          borderClass="border-error-50"
          icon={<X size={14} className="text-error-600" />}
          countClass="text-error-600"
          count={errorCount}
          label="Errors"
        />
        <SummaryStat
          borderClass="border-warning-100"
          icon={<AlertTriangle size={14} className="text-warning-600" />}
          countClass="text-warning-600"
          count={warningCount}
          label="Warnings"
        />
        <SummaryStat
          borderClass="border-primary-50"
          icon={<HelpCircle size={14} className="text-primary-600" />}
          countClass="text-primary-600"
          count={noticeCount}
          label="Notices"
        />
      </div>

      {/* Filter bar — no "All"; deselecting any active filter shows everything */}
      <div ref={filterBarRef} className="flex gap-1.5 flex-wrap mb-4">
        {FILTER_OPTIONS.map(f => {
          const count = filterCounts[f.value]
          if (f.value === 'notice' && count === 0) return null
          if (f.value === 'autofix' && count === 0) return null
          const label =
            f.value === 'autofix' || f.value === 'gbp' || f.value === 'seo'
              ? count > 0
                ? `${count} ${f.label}`
                : f.label
              : count > 0
                ? `${count} ${f.label}`
                : f.label
          return (
            <FilterPill
              key={f.value}
              active={activeFilter === f.value}
              onClick={() => toggleFilter(f.value)}
            >
              {label}
            </FilterPill>
          )
        })}
      </div>

      {/* Item list — min-height prevents layout jump when switching filters */}
      <div
        ref={listAreaRef}
        role="list"
        className="transition-[min-height] duration-0"
        style={{ minHeight: listMinHeight > 0 ? listMinHeight : undefined }}
      >
        {filtered.length === 0 ? (
          <p className="text-center text-[13px] text-gray-500 py-6">No items match this filter.</p>
        ) : showSections ? (
          <>
            {errorItems.length > 0 && (
              <div>
                <SectionLabel>Errors</SectionLabel>
                <ItemList
                  items={errorItems}
                  selected={selected}
                  onToggleSelect={toggleSelect}
                  onUpdateRec={updateRecommendation}
                />
              </div>
            )}
            {warningItems.length > 0 && (
              <div>
                <SectionLabel>Warnings</SectionLabel>
                <ItemList
                  items={warningItems}
                  selected={selected}
                  onToggleSelect={toggleSelect}
                  onUpdateRec={updateRecommendation}
                />
              </div>
            )}
            {noticeItems.length > 0 && (
              <div>
                <SectionLabel>Notices</SectionLabel>
                <ItemList
                  items={noticeItems}
                  selected={selected}
                  onToggleSelect={toggleSelect}
                  onUpdateRec={updateRecommendation}
                />
              </div>
            )}
          </>
        ) : (
          <ItemList
            items={filtered}
            selected={selected}
            onToggleSelect={toggleSelect}
            onUpdateRec={updateRecommendation}
          />
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 pt-3 pb-1 mt-3 flex items-center justify-between gap-3">
        <span className="text-[13px] text-gray-500">
          {selectedAutofixCount === 0
            ? 'Select auto-fix items to implement'
            : `${selectedAutofixCount} auto-fix item${selectedAutofixCount === 1 ? '' : 's'} selected`}
        </span>
        <div className="flex gap-2 items-center">
          {selectedAutofixCount > 0 && (
            <button
              type="button"
              onClick={removeSelected}
              className="text-[13px] px-4 py-2 rounded-lg bg-transparent text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Remove
            </button>
          )}
          <button
            type="button"
            disabled={selectedAutofixCount === 0}
            onClick={handleImplement}
            className="flex items-center gap-1.5 text-[13px] font-medium px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Check size={14} />
            Implement changes{selectedAutofixCount > 0 ? ` (${selectedAutofixCount})` : ''}
          </button>
        </div>
      </div>
    </section>
  )
}
