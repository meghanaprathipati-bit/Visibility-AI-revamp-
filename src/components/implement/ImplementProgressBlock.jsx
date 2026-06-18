import { useEffect, useState } from 'react'
import { LoadingCircle } from '../../icons/index.js'

/** Step 5 — prototype implementation progress — replace with live job status from API in production */
export default function ImplementProgressBlock({ onComplete }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (progress >= 100) {
      onComplete?.()
      return undefined
    }
    const timer = setTimeout(() => setProgress(value => Math.min(100, value + 10)), 450)
    return () => clearTimeout(timer)
  }, [progress, onComplete])

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-xs">
      <div className="flex items-center gap-2.5 mb-3">
        <LoadingCircle size={16} className="text-primary-600 shrink-0" />
        <p className="text-[14px] font-medium text-gray-900 m-0">Implementing changes… {progress}%</p>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full bg-purple-600 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
