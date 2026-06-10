import { ArrowLeft, MoreHorizontal } from '../icons/index.js'

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
    <header className="bg-white h-[56px] flex items-center px-4 gap-3 border-b border-gray-200 shadow-xs shrink-0">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors shrink-0"
      >
        <ArrowLeft size={14} />
        Back
      </button>
      <div className="w-px h-5 bg-gray-200 shrink-0" />
      <span className="text-[14px] font-semibold text-gray-900 flex-1 truncate min-w-0">
        {title}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onSave}
          className="h-8 px-3 text-[13px] font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Save
        </button>
        <button
          onClick={onPublish}
          className="h-8 px-3 text-[13px] font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Publish
        </button>
        <button className="size-8 flex items-center justify-center border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
          <MoreHorizontal size={15} />
        </button>
      </div>
    </header>
  )
}
