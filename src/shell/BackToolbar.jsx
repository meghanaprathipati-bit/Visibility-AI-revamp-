import { ArrowLeft } from '../icons/index.js'

export default function BackToolbar({ onBack, label, actions }) {
  return (
    <div className="border-b border-gray-200 px-8 py-2.5 flex items-center gap-3 shrink-0 bg-white">
      <button
        onClick={onBack}
        className="-ml-4 flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={14} />
        Back
      </button>
      {label && (
        <>
          <div className="w-px h-5 bg-gray-200" />
          <p className="text-[14px] font-semibold text-gray-900">{label}</p>
        </>
      )}
      {actions && (
        <>
          <div className="flex-1" />
          {actions}
        </>
      )}
    </div>
  )
}
