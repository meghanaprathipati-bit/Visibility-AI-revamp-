import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'

const GAP = 8

function getTooltipStyle(placement, { top, left }) {
  switch (placement) {
    case 'bottom':
      return { top, left, transform: 'translate(-50%, 0)' }
    case 'right':
      return { top, left, transform: 'translate(0, -50%)' }
    case 'left':
      return { top, left, transform: 'translate(-100%, -50%)' }
    case 'top':
    default:
      return { top, left, transform: 'translate(-50%, -100%)' }
  }
}

/** Dark hover tooltip — portaled to document.body so it is not clipped by overflow containers */
export default function HLTooltip({
  id,
  content,
  header,
  placement = 'top',
  variant = 'dark',
  disabled = false,
  wrap = false,
  triggerClassName = '',
  children,
}) {
  const triggerRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  const updatePosition = useCallback(() => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()

    switch (placement) {
      case 'bottom':
        setCoords({ top: rect.bottom + GAP, left: rect.left + rect.width / 2 })
        break
      case 'right':
        setCoords({ top: rect.top + rect.height / 2, left: rect.right + GAP })
        break
      case 'left':
        setCoords({ top: rect.top + rect.height / 2, left: rect.left - GAP })
        break
      case 'top':
      default:
        setCoords({ top: rect.top - GAP, left: rect.left + rect.width / 2 })
        break
    }
  }, [placement])

  const show = useCallback(() => {
    updatePosition()
    setVisible(true)
  }, [updatePosition])

  const hide = useCallback(() => {
    setVisible(false)
  }, [])

  useEffect(() => {
    if (!visible) return undefined
    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [visible, updatePosition])

  if (disabled) return children

  const isDark = variant === 'dark'
  const bubbleClass = isDark
    ? 'bg-gray-900 text-white shadow-md'
    : 'bg-white text-gray-700 border border-gray-200 shadow-md'

  const arrowClass =
    placement === 'top'
      ? isDark
        ? 'border-t-gray-900'
        : 'border-t-white'
      : placement === 'bottom'
        ? isDark
          ? 'border-b-gray-900'
          : 'border-b-white'
        : null

  const tooltipNode =
    visible &&
    createPortal(
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none fixed z-[9999] flex flex-col items-center"
        style={getTooltipStyle(placement, coords)}
      >
        {placement === 'bottom' && arrowClass && (
          <span
            className={`w-0 h-0 border-l-[5px] border-r-[5px] border-b-[5px] border-l-transparent border-r-transparent ${arrowClass}`}
            aria-hidden="true"
          />
        )}
        <span
          className={`px-2.5 py-1.5 rounded-md text-[14px] leading-snug ${bubbleClass} ${
            wrap
              ? 'inline-block w-fit max-w-[280px] whitespace-normal text-left'
              : 'whitespace-nowrap font-medium leading-tight'
          }`}
        >
          {header && <span className="block font-semibold mb-0.5">{header}</span>}
          {content}
        </span>
        {placement === 'top' && arrowClass && (
          <span
            className={`w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent ${arrowClass}`}
            aria-hidden="true"
          />
        )}
      </span>,
      document.body,
    )

  return (
    <>
      <span
        ref={triggerRef}
        className={`inline-flex min-w-0 ${triggerClassName}`.trim()}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocusCapture={show}
        onBlurCapture={hide}
      >
        {children}
      </span>
      {tooltipNode}
    </>
  )
}
