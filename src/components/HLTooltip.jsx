/** Dark hover tooltip for React composer controls — HighRise dark variant styling */
export default function HLTooltip({
  id,
  content,
  placement = 'top',
  variant = 'dark',
  disabled = false,
  children,
}) {
  if (disabled) return children

  const isDark = variant === 'dark'
  const bubbleClass = isDark
    ? 'bg-gray-900 text-white shadow-md'
    : 'bg-white text-gray-700 border border-gray-200 shadow-md'
  const arrowClass = isDark ? 'border-t-gray-900' : 'border-t-white'

  const positionClass =
    placement === 'top'
      ? 'bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center'
      : 'top-full left-1/2 -translate-x-1/2 mt-2 flex flex-col-reverse items-center'

  return (
    <span className="relative inline-flex group/tooltip">
      {children}
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute z-[100] ${positionClass} opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:visible transition-opacity duration-150`}
      >
        <span className={`px-2 py-1 rounded-md text-[12px] font-medium leading-tight whitespace-nowrap ${bubbleClass}`}>
          {content}
        </span>
        {placement === 'top' && (
          <span
            className={`w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent ${arrowClass}`}
            aria-hidden="true"
          />
        )}
      </span>
    </span>
  )
}
