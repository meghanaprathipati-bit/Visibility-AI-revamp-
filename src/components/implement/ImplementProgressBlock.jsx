import { useEffect, useState } from 'react'
import { LoadingCircle } from '../../icons/index.js'

const ITEM_DURATION_MS = 900

/** Prototype per-fix progress — replace with live job status from API in production */
export default function ImplementProgressBlock({ items = [], onComplete }) {
  const total = Math.max(items.length, 1)
  const [activeIndex, setActiveIndex] = useState(0)
  const [itemProgress, setItemProgress] = useState(0)

  const currentItem = items[activeIndex]
  const overallProgress = Math.round(((activeIndex + itemProgress / 100) / total) * 100)
  const isLastItem = activeIndex >= total - 1

  useEffect(() => {
    if (itemProgress >= 100) {
      if (isLastItem) {
        onComplete?.()
        return undefined
      }
      const timer = setTimeout(() => {
        setActiveIndex(index => index + 1)
        setItemProgress(0)
      }, 250)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      setItemProgress(value => Math.min(100, value + 20))
    }, ITEM_DURATION_MS / 5)

    return () => clearTimeout(timer)
  }, [activeIndex, isLastItem, itemProgress, onComplete])

  const statusLabel = items.length
    ? `Implementing fix ${activeIndex + 1} of ${total}${currentItem?.title ? `: ${currentItem.title}` : ''}`
    : `Implementing changes… ${overallProgress}%`

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-xs">
      <div className="flex items-start gap-2.5 mb-3">
        <LoadingCircle size={16} className="text-primary-600 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-gray-900 m-0 mb-0.5">
            Implementing changes… {overallProgress}%
          </p>
          <p className="text-[13px] text-gray-500 leading-snug m-0">{statusLabel}</p>
        </div>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full bg-purple-600 rounded-full transition-all duration-300"
          style={{ width: `${overallProgress}%` }}
        />
      </div>
    </div>
  )
}
