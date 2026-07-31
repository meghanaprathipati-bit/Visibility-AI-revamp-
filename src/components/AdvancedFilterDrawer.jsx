import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Plus, X } from '../icons/index.js'

export const STRING_OPS = [
  { label: 'Contains', value: 'contains' },
  { label: 'Does not contain', value: 'notContains' },
  { label: 'Equals', value: 'equals' },
  { label: 'Does not equal', value: 'notEquals' },
  { label: 'Starts with', value: 'startsWith' },
  { label: 'Ends with', value: 'endsWith' },
  { label: 'Is empty', value: 'isEmpty' },
  { label: 'Is not empty', value: 'notEmpty' },
]

export const NUMBER_OPS = [
  { label: '= equals', value: 'eq' },
  { label: '≠ does not equal', value: 'ne' },
  { label: '> greater than', value: 'gt' },
  { label: '≥ greater or equal', value: 'gte' },
  { label: '< less than', value: 'lt' },
  { label: '≤ less or equal', value: 'lte' },
]

export const BOOL_OPS = [
  { label: 'Is true', value: 'true' },
  { label: 'Is false', value: 'false' },
]

export const NO_VALUE_OPS = new Set(['isEmpty', 'notEmpty', 'true', 'false'])

export function getFilterOps(type) {
  if (type === 'number') return NUMBER_OPS
  if (type === 'boolean') return BOOL_OPS
  return STRING_OPS
}

export function emptyNestedFilterData() {
  return {
    condition: 'OR',
    rules: [{ condition: 'AND', rules: [{ id: Math.random(), field: '', operator: '', value: '' }] }],
  }
}

function clone(d) {
  return JSON.parse(JSON.stringify(d))
}

const SELECT_CLASS =
  'w-full appearance-none border border-gray-300 rounded-lg px-3 py-2 text-[13px] text-gray-800 bg-white outline-none focus:border-primary-600 pr-7 disabled:bg-white disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed'

/**
 * HighRise-aligned advanced filter drawer (HLAdvanceFilter + HLDrawer pattern).
 * Footer CTAs: Cancel + Apply only.
 */
export default function AdvancedFilterDrawer({
  isOpen,
  onClose,
  columnOptions = [],
  onApply,
}) {
  const [filterData, setFilterData] = useState(emptyNestedFilterData)
  const savedFilterRef = useRef(emptyNestedFilterData())

  useEffect(() => {
    if (!isOpen) return
    savedFilterRef.current = clone(filterData)
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  function updateRule(groupIdx, ruleIdx, key, val) {
    setFilterData(fd => {
      const d = clone(fd)
      const r = d.rules[groupIdx].rules[ruleIdx]
      if (key === 'field') {
        r.field = val
        r.operator = ''
        r.value = ''
      } else {
        r[key] = val
      }
      return d
    })
  }

  function removeRule(groupIdx, ruleIdx) {
    setFilterData(fd => {
      const d = clone(fd)
      const group = d.rules[groupIdx]
      if (group.rules.length === 1) {
        d.rules = d.rules.filter((_, gi) => gi !== groupIdx)
        if (!d.rules.length) {
          d.rules = [{ condition: 'AND', rules: [{ id: Math.random(), field: '', operator: '', value: '' }] }]
        }
      } else {
        group.rules = group.rules.filter((_, ri) => ri !== ruleIdx)
      }
      return d
    })
  }

  function addNestedRule(groupIdx) {
    setFilterData(fd => {
      const d = clone(fd)
      d.rules[groupIdx].rules.push({ id: Math.random(), field: '', operator: '', value: '' })
      return d
    })
  }

  function addOrGroup() {
    setFilterData(fd => {
      const d = clone(fd)
      d.rules.push({ condition: 'AND', rules: [{ id: Math.random(), field: '', operator: '', value: '' }] })
      return d
    })
  }

  function clearFilters() {
    setFilterData(emptyNestedFilterData())
  }

  function applyAndClose() {
    const flat = filterData.rules.flatMap(g => g.rules).filter(r => r.field && r.operator)
    onApply?.(flat)
    onClose?.()
  }

  function handleCancel() {
    setFilterData(clone(savedFilterRef.current))
    onClose?.()
  }

  const hasActiveRules = filterData.rules.some(g => g.rules.some(r => r.field && r.operator))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9998] flex" onClick={handleCancel}>
      <div className="flex-1 bg-gray-900/20" />
      <div
        className="w-[400px] shrink-0 bg-white border-l border-gray-200 flex flex-col h-full"
        style={{ boxShadow: '-4px 0 32px rgba(0,0,0,0.10)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
          <p className="text-[15px] font-semibold text-gray-900 m-0">All filters</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveRules}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-gray-600 hover:text-gray-800 transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="2" y1="2" x2="22" y2="22" />
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Clear filters
            </button>
            <button type="button" onClick={handleCancel} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Close">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filter groups */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col">
          {filterData.rules.map((orGroup, groupIdx) => (
            <div key={groupIdx} className="flex flex-col">
              <div className="border border-primary-200 bg-primary-50 rounded-lg p-4 flex flex-col gap-3">
                {orGroup.rules.map((rule, ruleIdx) => {
                  const col = columnOptions.find(c => c.value === rule.field)
                  const ops = col ? getFilterOps(col.type) : []
                  const needsValue = rule.operator && !NO_VALUE_OPS.has(rule.operator)
                  return (
                    <div key={rule.id ?? ruleIdx} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 min-w-0">
                          <select
                            value={rule.field}
                            onChange={e => updateRule(groupIdx, ruleIdx, 'field', e.target.value)}
                            className={SELECT_CLASS}
                          >
                            <option value="">Select field</option>
                            {columnOptions.map(c => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                          <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRule(groupIdx, ruleIdx)}
                          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-gray-300 hover:text-error-500 hover:bg-error-50 transition-colors"
                          aria-label="Remove rule"
                        >
                          <X size={13} />
                        </button>
                      </div>

                      {/* Filter by — full width of Select field; white bg + readable disabled color */}
                      <div className="relative w-full">
                        <select
                          value={rule.operator}
                          onChange={e => updateRule(groupIdx, ruleIdx, 'operator', e.target.value)}
                          disabled={!rule.field}
                          className={SELECT_CLASS}
                        >
                          <option value="">Filter by</option>
                          {ops.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                        <ChevronDown
                          size={11}
                          className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${rule.field ? 'text-gray-400' : 'text-gray-400'}`}
                        />
                      </div>

                      {needsValue && (
                        <input
                          type={col?.type === 'number' ? 'number' : 'text'}
                          value={rule.value}
                          onChange={e => updateRule(groupIdx, ruleIdx, 'value', e.target.value)}
                          placeholder={col?.type === 'number' ? 'Enter number' : 'Enter value'}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-[13px] text-gray-800 bg-white outline-none focus:border-primary-600 placeholder:text-gray-400"
                        />
                      )}
                    </div>
                  )
                })}

                <div className="flex justify-center py-0.5">
                  <span style={{ color: '#D0D5DD', fontSize: 18, letterSpacing: 4, lineHeight: 1 }}>···</span>
                </div>

                <button
                  type="button"
                  onClick={() => addNestedRule(groupIdx)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-primary-300 text-[12px] font-medium text-primary-600 hover:bg-primary-100/40 transition-colors"
                >
                  <Plus size={12} /> Add nested filter
                </button>
              </div>

              <div className="flex flex-col items-center py-2">
                <div style={{ width: 1, height: 16, borderLeft: '2px dashed #D0D5DD' }} />
              </div>
            </div>
          ))}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={addOrGroup}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              <Plus size={13} /> Add filter
            </button>
          </div>
        </div>

        {/* Footer — Apply + Cancel only */}
        <div className="px-5 py-4 border-t border-gray-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={applyAndClose}
            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-[13px] font-semibold transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
