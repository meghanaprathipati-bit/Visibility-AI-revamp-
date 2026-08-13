import { CheckSquare, FileText, X } from '../../icons/index.js'

/**
 * DetailSidePanel — Cursor-style split pane between chat and tools.
 * Supports action-items and detailed-report content types.
 */
export default function DetailSidePanel({ type = 'action-items', title, subtitle, onClose, children }) {
  const PanelIcon = type === 'report' ? FileText : CheckSquare

  return (
    <aside className="w-1/2 shrink-0 border-l border-gray-200 bg-white flex flex-col min-h-0 overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-200 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
          <PanelIcon size={18} className="text-gray-600" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <h2 className="text-[14px] font-semibold text-gray-900 leading-snug">{title}</h2>
          {subtitle && <p className="text-[12px] text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-600 hover:bg-gray-50 transition-colors"
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <div
        className={`flex-1 min-h-0 flex flex-col overflow-hidden ${
          type === 'report' ? 'overflow-y-auto scrollbar-gray-300 p-4' : ''
        }`}
      >
        {children}
      </div>
    </aside>
  )
}
