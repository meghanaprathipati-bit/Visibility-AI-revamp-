import { useEffect } from 'react'
import { X, AlertTriangle, CircleCheck, CircleX, Pencil, Copy, Check } from '../icons/index.js'

/**
 * HighRise-aligned right detail drawer (React stand-in for HLSidebarContainer).
 * Used for crawled-page findings and found-resource source details.
 */
export default function IssueDetailDrawer({
  open,
  onClose,
  title,
  subtitle,
  toolbar,
  footer,
  children,
  width = 440,
}) {
  useEffect(() => {
    if (!open) return undefined
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9998] flex" onClick={onClose}>
      <div className="flex-1 bg-gray-900/20" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-detail-drawer-title"
        className="shrink-0 bg-white border-l border-gray-200 flex flex-col h-full"
        style={{ width, maxWidth: '100%', boxShadow: '-4px 0 32px rgba(0,0,0,0.10)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-200 shrink-0">
          <div className="min-w-0 flex-1">
            <h2
              id="issue-detail-drawer-title"
              className="text-[16px] font-semibold text-gray-900 m-0 truncate"
              title={title}
            >
              {title}
            </h2>
            {subtitle && (
              <p className="text-[14px] font-normal text-gray-500 m-0 mt-1">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 min-h-0 flex flex-col bg-white">
          {toolbar && (
            <div className="px-5 py-3 border-b border-gray-200 shrink-0 bg-white">
              {toolbar}
            </div>
          )}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 bg-white">
            {children}
          </div>
        </div>
        {footer && (
          <div className="px-5 py-3 border-t border-gray-200 shrink-0 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

function severityStyle(sev) {
  if (sev === 'Errors') return { bg: '#FEF2F2', border: '#FECACA', color: '#DC2626', Icon: AlertTriangle }
  if (sev === 'Warnings') return { bg: 'var(--warning-100)', border: '#FDE68A', color: '#D97706', Icon: AlertTriangle }
  return { bg: 'var(--primary-50)', border: '#BFDBFE', color: 'var(--primary-600)', Icon: CircleCheck }
}

function fixTypePillClass(fixType) {
  if (fixType === 'Auto Fix') return 'bg-success-50 border-success-200 text-success-700'
  if (fixType === 'Assisted Fix') return 'bg-primary-50 border-primary-200 text-primary-700'
  if (fixType === 'Manual Fix') return 'bg-warning-100 border-warning-200 text-warning-700'
  return 'bg-purple-50 border-purple-200 text-purple-700'
}

/**
 * Stacked finding cards for a crawled page.
 * Action model matches Scan results FindingCard:
 * - Auto fix: checkbox (disabled when Fixed), edit recommended value, row Fix / Apply fixes
 * - Assisted fix: editable pre-filled value, checkbox when valid, row Fix / Apply fixes
 * - Manual fix: value + copy only (no checkbox / apply)
 * - Advisory: recommendation text only (no actions)
 */
export function PageFindingsPanel({
  findings = [],
  pageUrl,
  findingStatus,
  isFindingSelectable,
  selectedIds = [],
  onToggleFinding,
  editingFinding,
  findingValues = {},
  onOpenEdit,
  onSaveEdit,
  onCancelEdit,
  onChangeValue,
  onCopyValue,
  copiedFinding,
  onFixFinding,
}) {
  if (!findings.length) {
    return <p className="text-[14px] text-gray-500 m-0">No findings for this page.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {findings.map(finding => {
        const sev = severityStyle(finding.severity)
        const status = findingStatus(finding)
        const isFixed = status === 'Fixed'
        const autoFix = finding.fixType === 'Auto Fix'
        const assistedFix = finding.fixType === 'Assisted Fix'
        const manualFix = finding.fixType === 'Manual Fix'
        const advisoryFix = finding.fixType === 'Advisory'
        const showCheckbox = autoFix || assistedFix
        const selectable = isFindingSelectable(finding)
        const isFindingSel = selectedIds.includes(finding.id)
        const isEditing = editingFinding === finding.id
        const recValue = findingValues[finding.id] ?? finding.aiValue ?? ''
        const assistedVal = String(recValue)
        const valError = assistedFix
          && assistedVal.trim() !== ''
          && assistedVal.trim() === String(finding.currentValue || '').trim()
          ? 'Value matches current state — no change will be applied'
          : null
        const canFixAssisted = assistedFix && !isFixed && assistedVal.trim() !== '' && !valError
        const canFixAuto = autoFix && !isFixed && !isEditing

        return (
          <div
            key={finding.id}
            className="border border-gray-200 rounded-lg p-3.5 flex flex-col gap-2.5 bg-white"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                {showCheckbox && (
                  <input
                    type="checkbox"
                    checked={selectable && isFindingSel}
                    disabled={!selectable}
                    onChange={() => selectable && onToggleFinding?.(pageUrl, finding.id)}
                    style={{ accentColor: '#155EEF', width: 15, height: 15 }}
                    className={selectable ? 'cursor-pointer shrink-0' : 'opacity-40 cursor-not-allowed shrink-0'}
                  />
                )}
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[13px] font-medium whitespace-nowrap"
                  style={{ background: sev.bg, borderColor: sev.border, color: sev.color }}
                >
                  <sev.Icon size={9} />
                  {finding.severity}
                </span>
                <span
                  className={`text-[12px] font-medium ${
                    status === 'Fixed' ? 'text-success-600'
                      : status === 'New' ? 'text-primary-600'
                        : status === 'Draft' ? 'text-warning-600'
                          : 'text-gray-500'
                  }`}
                >
                  {status}
                </span>
              </div>
              <span className={`inline-flex items-center px-2 py-px rounded-full border text-[13px] font-medium shrink-0 ${fixTypePillClass(finding.fixType)}`}>
                {finding.fixType}
              </span>
            </div>

            <div>
              <p className="text-[14px] font-medium text-gray-900 m-0 leading-snug">{finding.description}</p>
              <p className="text-[12px] text-gray-500 m-0 mt-1 leading-snug">{finding.detail}</p>
            </div>

            {/* Current value always sits on a gray surface — do not flatten to white. */}
            <div className="rounded-lg bg-gray-100 border border-gray-200 px-3 py-2">
              <p className="text-[12px] font-medium text-gray-500 m-0 mb-0.5">Current value</p>
              <p className={`text-[14px] m-0 leading-snug break-words ${isFixed ? 'text-gray-500' : 'text-error-700'}`}>
                {finding.currentValue || '—'}
              </p>
            </div>

            <div>
              <p className="text-[12px] font-medium text-gray-500 m-0 mb-1">
                {manualFix ? 'Value to apply' : advisoryFix ? 'Recommendation' : assistedFix ? 'Value to be applied' : 'Recommended'}
              </p>

              {/* Advisory — text only, no actions */}
              {advisoryFix && (
                <p className="text-[14px] text-gray-600 leading-relaxed m-0 break-words">
                  {recValue || '—'}
                </p>
              )}

              {/* Manual fix — value + copy only */}
              {manualFix && (
                !recValue ? (
                  <span className="text-[14px] text-gray-300">—</span>
                ) : (
                  <div className="flex items-start gap-2">
                    <p className="text-[14px] text-success-700 leading-snug m-0 flex-1 break-words">{recValue}</p>
                    <button
                      type="button"
                      onClick={() => onCopyValue?.(finding)}
                      className={`transition-colors shrink-0 ${copiedFinding === finding.id ? 'text-success-600' : 'text-gray-500 hover:text-gray-600'}`}
                      title={copiedFinding === finding.id ? 'Copied' : 'Copy value'}
                    >
                      {copiedFinding === finding.id ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                )
              )}

              {/* Assisted fix — always-editable pre-filled value */}
              {assistedFix && (
                isFixed ? (
                  <p className="text-[14px] text-gray-500 m-0 break-words">{assistedVal || '—'}</p>
                ) : (
                  <div>
                    <textarea
                      value={assistedVal}
                      onChange={e => {
                        const val = e.target.value
                        onChangeValue?.(finding.id, val)
                        // Deselect if value becomes empty / invalid
                        if (isFindingSel && (!val.trim() || val.trim() === String(finding.currentValue || '').trim())) {
                          onToggleFinding?.(pageUrl, finding.id)
                        }
                      }}
                      rows={3}
                      placeholder="Enter value to apply..."
                      className={`w-full text-[12px] text-gray-800 border rounded-lg px-2.5 py-1.5 resize-none outline-none transition-all placeholder:text-gray-400 ${
                        valError ? 'border-error-600 bg-error-50/40 focus:border-error-600' : 'border-gray-200 focus:border-primary-600'
                      }`}
                    />
                    {valError && (
                      <p className="flex items-center gap-1 mt-1 text-[12px] text-error-600 m-0">
                        <CircleX size={11} className="shrink-0" />
                        {valError}
                      </p>
                    )}
                  </div>
                )
              )}

              {/* Auto fix — value + edit, or inline editor */}
              {autoFix && (
                !recValue && !isEditing ? (
                  <span className="text-[14px] text-gray-300">—</span>
                ) : isEditing ? (
                  <div className="flex flex-col gap-1.5">
                    <textarea
                      value={recValue}
                      onChange={e => onChangeValue?.(finding.id, e.target.value)}
                      rows={3}
                      className="w-full text-[12px] text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 resize-none outline-none focus:border-primary-600"
                    />
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => onSaveEdit?.(finding)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-success-700 hover:bg-success-800 text-white text-[12px] font-semibold transition-colors"
                      >
                        <Check size={9} /> {isFixed || status === 'Draft' ? 'Re-apply' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onCancelEdit?.()}
                        className="text-[12px] text-gray-500 hover:text-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <p className={`text-[14px] leading-snug m-0 flex-1 break-words ${isFixed ? 'text-gray-500' : 'text-success-700'}`}>
                      {recValue}
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenEdit?.(finding)}
                      className="text-gray-500 hover:text-gray-600 transition-colors shrink-0"
                      title="Edit recommendation"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                )
              )}
            </div>

            {/* Row-level Fix — Auto + Assisted only (matches Scan results) */}
            {(autoFix || assistedFix) && (
              <div className="flex items-center justify-end pt-0.5">
                {isFixed && !isEditing ? (
                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-success-600">
                    <CircleCheck size={11} /> Fixed
                  </span>
                ) : assistedFix ? (
                  <button
                    type="button"
                    onClick={() => canFixAssisted && onFixFinding?.(finding)}
                    disabled={!canFixAssisted}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[12px] font-medium transition-colors ${
                      canFixAssisted
                        ? 'border-gray-200 bg-white text-gray-600 hover:border-primary-600 hover:text-primary-600'
                        : 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                    }`}
                    title={!canFixAssisted ? (assistedVal.trim() === '' ? 'Enter a value to apply the fix' : 'Fix the value error first') : 'Apply fix'}
                  >
                    Fix
                  </button>
                ) : canFixAuto ? (
                  <button
                    type="button"
                    onClick={() => onFixFinding?.(finding)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-[12px] font-medium text-gray-600 hover:border-primary-600 hover:text-primary-600 transition-colors"
                  >
                    Fix
                  </button>
                ) : null}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Source-detail list for a found resource */
export function ResourceSourcesPanel({ sources = [] }) {
  if (!sources.length) {
    return <p className="text-[14px] text-gray-500 m-0">No source pages for this resource.</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {sources.map((s, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-3.5 flex flex-col gap-2 bg-white">
          <div>
            <p className="text-[12px] font-medium text-gray-500 m-0 mb-0.5">From URL</p>
            <a href="#" className="text-[14px] font-medium text-primary-600 hover:underline break-all">
              {s.fromUrl}
            </a>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[12px] font-medium text-gray-500 m-0 mb-0.5">Follow type</p>
              <p className={`text-[14px] font-medium m-0 ${s.followType === 'Do follow' ? 'text-success-700' : 'text-warning-600'}`}>
                {s.followType}
              </p>
            </div>
            <div>
              <p className="text-[12px] font-medium text-gray-500 m-0 mb-0.5">Alt attribute</p>
              <p className="text-[14px] text-gray-700 m-0">{s.altAttr || '—'}</p>
            </div>
          </div>
          <div>
            <p className="text-[12px] font-medium text-gray-500 m-0 mb-0.5">Title</p>
            <p className="text-[14px] text-gray-700 m-0">{s.title || '—'}</p>
          </div>
          <div>
            <p className="text-[12px] font-medium text-gray-500 m-0 mb-0.5">Unique title</p>
            <p className="text-[14px] text-gray-700 m-0">{s.uniqueTitle || '—'}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
