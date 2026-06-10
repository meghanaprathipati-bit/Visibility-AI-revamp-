import { ArrowLeft } from '../icons/index.js'

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
      <div className="flex-1 flex flex-col min-h-0 bg-gray-50 p-4">
        <div className="bg-white rounded-xl shadow-card flex flex-col flex-1 overflow-hidden">

          {/* Back toolbar */}
          <div className="border-b border-gray-200 px-8 py-2.5 flex items-center gap-3 shrink-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-900 transition-colors shrink-0"
            >
              <ArrowLeft size={14} />
              {backLabel}
            </button>
            {title && (
              <>
                <div className="w-px h-5 bg-gray-200 shrink-0" />
                <p className="text-[14px] font-semibold text-gray-900 shrink-0 truncate">{title}</p>
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
    <div className="flex-1 overflow-auto bg-gray-50 p-4 flex flex-col">
      <div className="bg-white rounded-xl shadow-card px-8 py-6 flex-1">
        {children}
      </div>
    </div>
  )
}
