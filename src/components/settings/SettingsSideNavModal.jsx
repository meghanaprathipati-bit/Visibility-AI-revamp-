import { X } from '../../icons/index.js'
import { BTN_PRIMARY, BTN_SECONDARY } from '../HLButton.jsx'

/**
 * Shared settings shell — left vertical tabs + right content + Reset / Cancel / Apply footer.
 * Same layout as Website audit settings in Site Health.
 */
export default function SettingsSideNavModal({
  title,
  navItems,
  activeSection,
  onSectionChange,
  onClose,
  onApply,
  onReset,
  applyDisabled = false,
  children,
  width = 900,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[1px]" onClick={onClose} />
      <div
        className="relative bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width, maxWidth: 'calc(100vw - 32px)', height: '86vh', maxHeight: 820 }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <p className="text-[16px] font-semibold text-gray-900 m-0">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="w-52 shrink-0 border-r border-gray-100 py-2 flex flex-col overflow-y-auto">
            {navItems.map(n => (
              <button
                key={n.id}
                type="button"
                onClick={() => onSectionChange(n.id)}
                className={`w-full text-left py-2.5 px-4 text-[14px] transition-colors whitespace-nowrap border-r-2 ${
                  activeSection === n.id
                    ? 'border-primary-600 text-primary-600 font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 font-normal'
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 min-w-0">
            {children}
          </div>
        </div>

        <div className="flex items-center px-6 py-4 border-t border-gray-100 shrink-0 bg-white">
          <button
            type="button"
            onClick={onReset}
            className="text-[13px] font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            Reset to default
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <button type="button" onClick={onClose} className={BTN_SECONDARY}>
              Cancel
            </button>
            <button
              type="button"
              onClick={applyDisabled ? undefined : () => { onApply?.(); onClose() }}
              disabled={applyDisabled}
              className={BTN_PRIMARY}
            >
              Apply changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
