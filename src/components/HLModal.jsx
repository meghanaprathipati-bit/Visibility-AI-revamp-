import { useEffect } from 'react'
import { X } from '../icons/index.js'

/** React adapter for HighRise HLModal — https://highrise.gohighlevel.com/components/feedback/modal */
export default function HLModal({
  id,
  onClose,
  header,
  children,
  footer,
  headerDivider = false,
  maskClosable = true,
  width = 483,
  height,
  contentClassName = '',
  footerClassName = '',
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const shellStyle = {
    maxWidth: width,
    ...(height ? { height, maxHeight: height } : {}),
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      onMouseDown={maskClosable ? onClose : undefined}
    >
      <div className="absolute inset-0 bg-gray-900/50" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className="relative flex flex-col bg-white rounded-lg border border-gray-100 shadow-xl w-full overflow-hidden"
        style={shellStyle}
        onMouseDown={e => e.stopPropagation()}
      >
        <div className={`flex items-start gap-2 shrink-0 ${headerDivider ? 'pb-4' : ''}`}>
          <div className="flex-1 min-w-0">{header}</div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors mr-4 mt-3"
            aria-label="Close"
          >
            <X size={14} strokeWidth={1.67} />
          </button>
        </div>
        {headerDivider && <div className="mx-3 border-b border-gray-200 shrink-0" />}
        <div
          className={`flex-1 min-h-0 ${
            contentClassName
              ? (/\boverflow-/.test(contentClassName) ? contentClassName : `${contentClassName} overflow-y-auto`)
              : 'hr-dialog__content--text overflow-y-auto'
          }`}
        >
          {children}
        </div>
        {footer && (
          <div className={`border-t border-gray-200 shrink-0 ${footerClassName || 'pt-3 pb-3 px-4'}`}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// Canonical modal header typography — 16px semibold title, 14px regular subtext.
export const modalTitle = 'text-[16px] font-semibold text-gray-900'
export const modalSubtext = 'text-[14px] font-normal text-gray-500'

export const modalBtnSecondary =
  'h-8 px-2.5 rounded border border-gray-300 bg-white text-[14px] font-semibold text-gray-600 hover:bg-gray-50 shadow-xs transition-colors'
export const modalBtnPrimary =
  'h-8 px-2.5 rounded border border-primary-600 bg-primary-600 text-[14px] font-semibold text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors'

/** Fixed height for large manage modals — 48px gutter top/bottom; body scrolls when content exceeds this. */
export const MODAL_MANAGE_HEIGHT = 'calc(100vh - 96px)'
