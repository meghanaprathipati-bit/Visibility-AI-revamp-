import { ArrowLeft, MoreHorizontal } from 'lucide-react'

/**
 * BuilderBar — full-screen builder/editor top bar.
 * Replaces AppShell entirely. No sidebar, no section tabs.
 *
 * Props:
 *   onBack     () => void    back button callback
 *   title      string        item name (e.g. email name, page name)
 *   onSave     () => void
 *   onPublish  () => void
 */
export default function BuilderBar({ onBack, title, onSave, onPublish }) {
  return (
    <header className="bg-white h-[56px] flex items-center px-4 gap-3 border-b border-[#EAECF0] shadow-[0px_1px_1px_rgba(16,24,40,0.05)] shrink-0">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] font-medium text-[#667085] hover:text-[#101828] transition-colors shrink-0"
      >
        <ArrowLeft size={14} />
        Back
      </button>
      <div className="w-px h-5 bg-[#EAECF0] shrink-0" />
      <span className="text-[14px] font-semibold text-[#101828] flex-1 truncate min-w-0">
        {title}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onSave}
          className="h-8 px-3 text-[13px] font-medium text-[#344054] border border-[#D0D5DD] rounded-lg hover:bg-[#F9FAFB] transition-colors"
        >
          Save
        </button>
        <button
          onClick={onPublish}
          className="h-8 px-3 text-[13px] font-semibold text-white bg-[#155EEF] rounded-lg hover:bg-[#1249C0] transition-colors"
        >
          Publish
        </button>
        <button className="size-8 flex items-center justify-center border border-[#D0D5DD] rounded-lg text-[#667085] hover:bg-[#F9FAFB] transition-colors">
          <MoreHorizontal size={15} />
        </button>
      </div>
    </header>
  )
}
