import { ArrowLeft } from 'lucide-react'

export default function BackToolbar({ onBack, label, actions }) {
  return (
    <div className="border-b border-[#EAECF0] px-8 py-2.5 flex items-center gap-3 shrink-0 bg-white">
      <button
        onClick={onBack}
        className="-ml-4 flex items-center gap-1.5 text-[13px] text-[#667085] hover:text-[#101828] transition-colors"
      >
        <ArrowLeft size={14} />
        Back
      </button>
      {label && (
        <>
          <div className="w-px h-5 bg-[#EAECF0]" />
          <p className="text-[14px] font-semibold text-[#101828]">{label}</p>
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
