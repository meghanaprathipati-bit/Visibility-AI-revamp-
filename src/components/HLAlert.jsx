import { useState } from 'react'
import { AlertTriangle, X } from '../icons/index.js'

/**
 * React mirror of HighRise HLAlert — https://highrise.gohighlevel.com/components/feedback/alert
 * Orange/warning tokens match createOrangeAlertTheme from @platform-ui/highrise.
 */
const COLOR_STYLES = {
  white: {
    container: 'bg-white border-gray-200',
    icon: 'text-gray-600',
    title: 'text-gray-900',
    body: 'text-gray-600',
    action: 'text-gray-700 hover:text-gray-800',
  },
  blue: {
    container: 'bg-primary-50 border-primary-600',
    icon: 'text-primary-600',
    title: 'text-primary-700',
    body: 'text-primary-700',
    action: 'text-primary-700 hover:text-primary-700',
  },
  green: {
    container: 'bg-success-50 border-success-600',
    icon: 'text-success-600',
    title: 'text-success-700',
    body: 'text-success-700',
    action: 'text-success-700 hover:text-success-800',
  },
  red: {
    container: 'bg-error-50 border-error-600',
    icon: 'text-error-600',
    title: 'text-error-600',
    body: 'text-error-600',
    action: 'text-error-600 hover:text-error-600',
  },
  orange: {
    container: 'bg-warning-25 border-warning-300',
    icon: 'text-warning-600',
    title: 'text-warning-700',
    body: 'text-warning-700',
    action: 'text-warning-700 hover:text-warning-800',
  },
  gray: {
    container: 'bg-gray-50 border-gray-300',
    icon: 'text-gray-600',
    title: 'text-gray-700',
    body: 'text-gray-600',
    action: 'text-gray-700 hover:text-gray-800',
  },
}

export default function HLAlert({
  id = 'hl-alert',
  color = 'white',
  title,
  children,
  closable = true,
  role = 'alert',
  type = 'alert',
  actionOne,
  actionTwo,
  onClose,
  className = '',
}) {
  const [visible, setVisible] = useState(true)
  const styles = COLOR_STYLES[color] ?? COLOR_STYLES.white
  const titleId = `${id}-title`
  const bodyId = `${id}-body`
  const actionSizeClass = type === 'notification' ? 'text-[13px]' : 'text-[12px]'

  if (!visible) return null

  function handleClose() {
    setVisible(false)
    onClose?.(id)
  }

  return (
    <div
      id={id}
      role={role}
      data-hl-alert-type={type}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={children ? bodyId : undefined}
      className={`flex gap-2 rounded-xl border px-2 py-2 w-full ${styles.container} ${className}`}
    >
      <AlertTriangle size={16} className={`shrink-0 mt-0.5 ${styles.icon}`} aria-hidden="true" />

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        {title && (
          <p id={titleId} className={`${actionSizeClass} font-medium leading-[18px] m-0 ${styles.title}`}>
            {title}
          </p>
        )}
        {children && (
          <p id={bodyId} className={`text-[12px] leading-[17px] m-0 ${styles.body}`}>
            {children}
          </p>
        )}
        {(actionOne || actionTwo) && (
          <div className="mt-0.5 flex flex-wrap items-center gap-3">
            {actionOne && (
              <button
                type="button"
                aria-label={actionOne.ariaLabel ?? actionOne.text}
                disabled={actionOne.disabled}
                onClick={actionOne.onActionClick}
                className={`inline-flex items-center gap-1 px-0 py-0 bg-transparent border-0 font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${actionSizeClass} ${styles.action}`}
              >
                {actionOne.text}
              </button>
            )}
            {actionTwo && (
              <button
                type="button"
                aria-label={actionTwo.ariaLabel ?? actionTwo.text}
                disabled={actionTwo.disabled}
                onClick={actionTwo.onActionClick}
                className={`inline-flex items-center gap-1 px-0 py-0 bg-transparent border-0 font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${actionSizeClass} ${styles.action}`}
              >
                {actionTwo.text}
              </button>
            )}
          </div>
        )}
      </div>

      {closable && (
        <button
          type="button"
          onClick={handleClose}
          aria-label={title ? `Dismiss ${title}` : 'Dismiss alert'}
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-gray-600 hover:text-gray-700 hover:bg-white/60 transition-colors self-start"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
