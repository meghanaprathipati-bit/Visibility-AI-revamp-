/**
 * Canonical Advanced filter toolbar trigger — Crawled pages reference.
 *
 * Inactive: white pill, gray border, filter icon + label.
 * Active: primary-50 pill, primary border/text, count badge, optional Clear link.
 */
export function AdvancedFilterIcon({ size = 13 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  )
}

/**
 * @param {object} props
 * @param {number} [props.activeCount=0] — number of applied advanced filter rules
 * @param {() => void} props.onClick — open drawer / popover
 * @param {() => void} [props.onClear] — clear all advanced filters (shows Clear link when active)
 * @param {string} [props.className]
 */
export default function AdvancedFilterTrigger({
  activeCount = 0,
  onClick,
  onClear,
  className = '',
}) {
  const active = activeCount > 0

  return (
    <div className={`inline-flex items-center gap-2 shrink-0 ${className}`}>
      <button
        type="button"
        onClick={onClick}
        className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-full border text-[14px] font-medium transition-colors ${
          active
            ? 'bg-primary-50 border-primary-300 text-primary-700'
            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <AdvancedFilterIcon />
        Advanced filter
        {active && (
          <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-primary-600 text-white text-[12px] font-medium tabular-nums">
            {activeCount}
          </span>
        )}
      </button>
      {active && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="text-[14px] text-gray-400 hover:text-gray-600 underline transition-colors bg-transparent border-0 p-0 cursor-pointer"
        >
          Clear
        </button>
      )}
    </div>
  )
}
