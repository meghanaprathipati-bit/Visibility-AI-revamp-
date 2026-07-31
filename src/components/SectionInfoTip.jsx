import { Info } from '../icons/index.js'
import HLTooltip from './HLTooltip.jsx'

/** Info icon with tooltip — use beside section titles instead of inline subtext. */
export default function SectionInfoTip({ id, content, text }) {
  const tooltipContent = content ?? text
  if (!tooltipContent) return null

  return (
    <HLTooltip id={id} content={tooltipContent} variant="dark" placement="top" wrap triggerClassName="inline-flex items-center self-center">
      <Info size={14} className="text-gray-400 shrink-0 cursor-help" aria-label="More information" />
    </HLTooltip>
  )
}
