import { ArrowLeft } from 'lucide-react'

const CANVAS_SHADOW = 'shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)]'

/**
 * Canvas — two levels:
 *
 * level={1}  Standard page canvas (Messaging Limits / Social Listening list pages)
 *   - Gray background with 16px margin all around
 *   - White card with rounded corners and shadow
 *   - Content scrolls naturally with the page
 *
 * level={2}  Detail / drill-down canvas (Social Listening Topic Detail)
 *   - Same outer shell but canvas fills full height
 *   - Back toolbar pinned at top
 *   - Content scrolls inside the canvas
 *
 *   Extra props for level={2}:
 *     onBack     () => void    back button callback
 *     backLabel  string        label next to arrow (default: "Back")
 *     title      string        shown in toolbar after divider
 *     toolbar    ReactNode     optional right-side toolbar content
 */
export default function Canvas({
  level = 1,
  onBack,
  backLabel = 'Back',
  title,
  toolbar,
  children,
}) {
  if (level === 2) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-[#F9FAFB] p-4">
        <div className={`bg-white rounded-xl ${CANVAS_SHADOW} flex flex-col flex-1 overflow-hidden`}>

          {/* Back toolbar */}
          <div className="border-b border-[#EAECF0] px-8 py-2.5 flex items-center gap-3 shrink-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-[13px] text-[#667085] hover:text-[#101828] transition-colors shrink-0"
            >
              <ArrowLeft size={14} />
              {backLabel}
            </button>
            {title && (
              <>
                <div className="w-px h-5 bg-[#EAECF0] shrink-0" />
                <p className="text-[14px] font-semibold text-[#101828] shrink-0 truncate">{title}</p>
              </>
            )}
            {toolbar && (
              <>
                <div className="flex-1" />
                {toolbar}
              </>
            )}
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {children}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-[#F9FAFB] p-4 flex flex-col">
      <div className={`bg-white rounded-xl ${CANVAS_SHADOW} px-8 py-6 flex-1`}>
        {children}
      </div>
    </div>
  )
}
