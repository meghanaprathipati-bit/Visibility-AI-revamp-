import { useRef, useState, useLayoutEffect, useEffect } from 'react'
import { Sparkles, Megaphone, Bell, HelpCircle, ChevronDown } from 'lucide-react'

function GlobalIcons({ onOpenNotifications, onOpenHelp }) {
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="ai-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6938EF" />
            <stop offset="100%" stopColor="#D444F1" />
          </linearGradient>
        </defs>
      </svg>
      <button className="group relative h-8 pl-3 pr-1.5 mr-1 flex items-center gap-1.5 rounded-full border border-[#E9D7FE] hover:border-[#6938EF] hover:shadow-[0_0_18px_-3px_rgba(105,56,239,0.45)] hover:scale-[1.02] transition-all overflow-hidden">
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-[#6938EF]/15 to-transparent pointer-events-none" />
        <Sparkles size={14} fill="url(#ai-gradient)" stroke="url(#ai-gradient)" className="relative z-10 group-hover:rotate-12 transition-transform duration-300" />
        <span className="relative z-10 text-[13px] font-medium bg-gradient-to-r from-[#6938EF] to-[#D444F1] bg-clip-text text-transparent">
          Ask AI
        </span>
        <span className="relative z-10 px-1.5 py-0.5 rounded bg-[#F2F4F7] text-[#667085] text-[12px] font-medium leading-none">
          ⌘K
        </span>
      </button>
      <div className="relative">
        <button className="size-8 flex items-center justify-center rounded-full text-[#98A2B3] hover:text-[#667085] hover:bg-[#F9FAFB] transition-colors">
          <Megaphone size={16} />
        </button>
        <span className="absolute top-0.5 right-0.5 size-2 rounded-full bg-red-500 ring-[1.5px] ring-white pointer-events-none" />
      </div>
      <button
        onClick={onOpenNotifications}
        className="size-8 flex items-center justify-center rounded-full text-[#98A2B3] hover:text-[#667085] hover:bg-[#F9FAFB] transition-colors"
      >
        <Bell size={16} />
      </button>
      <button
        onClick={onOpenHelp}
        className="size-8 flex items-center justify-center rounded-full text-[#98A2B3] hover:text-[#667085] hover:bg-[#F9FAFB] transition-colors"
      >
        <HelpCircle size={16} />
      </button>
      <button className="size-8 rounded-full bg-[#344054] flex items-center justify-center hover:bg-[#1D2939] transition-colors ml-1">
        <span className="text-white text-[12px] font-semibold leading-none">SS</span>
      </button>
    </div>
  )
}

function OverflowTabRow({ tabs, activeTab, onTabChange, textSize, indicatorBottom = null }) {
  const wrapperRef = useRef(null)
  const [visibleCount, setVisibleCount] = useState(tabs.length)
  const [open, setOpen] = useState(false)

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    function measure() {
      const ghosts = Array.from(wrapper.querySelectorAll('[data-ghost-tab]'))
      const available = wrapper.offsetWidth

      // Reserve enough width for the More button. When the active tab is in overflow
      // the button shows the active tab name instead of "More", so it can be much wider
      // than a fixed constant. Measure the active tab ghost to get the true required width.
      const activeIdx = tabs.indexOf(activeTab)
      const activeGhostW = (activeIdx >= 0 && ghosts[activeIdx]) ? ghosts[activeIdx].offsetWidth : 0
      // More button layout: px-2 (16px) + text + gap-1 (4px) + ChevronDown (~16px)
      // activeGhostW already includes px-2 on the ghost span, so extra needed is ~24px
      const MORE_W = Math.max(70, activeGhostW + 28)

      let used = 0
      let count = ghosts.length

      for (let i = 0; i < ghosts.length; i++) {
        const w = ghosts[i].offsetWidth + 4
        const willNeedMore = i < ghosts.length - 1
        if (used + w + (willNeedMore ? MORE_W : 0) > available) {
          count = i
          break
        }
        used += w
      }
      setVisibleCount(count)
    }

    const ro = new ResizeObserver(measure)
    ro.observe(wrapper)
    measure()
    return () => ro.disconnect()
  }, [tabs.join('|'), activeTab])

  useEffect(() => {
    if (!open) return
    function handleOutside(e) {
      if (!e.target.closest('[data-more-dropdown]')) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const visible = tabs.slice(0, visibleCount)
  const overflow = tabs.slice(visibleCount)
  const activeInOverflow = overflow.includes(activeTab)

  return (
    <div ref={wrapperRef} className="flex self-stretch items-center gap-1 min-w-0 flex-1 relative">

      {/* Ghost row — invisible, used only for width measurement */}
      <div className="absolute top-0 left-0 flex items-center gap-1 opacity-0 pointer-events-none" aria-hidden="true">
        {tabs.map(tab => (
          <span key={tab} data-ghost-tab className={`px-2 ${textSize} font-medium whitespace-nowrap`}>
            {tab}
          </span>
        ))}
      </div>

      {/* Visible tabs */}
      {visible.map(tab => {
        const isActive = tab === activeTab
        return (
          <button
            key={tab}
            onClick={() => onTabChange?.(tab)}
            className={`relative flex items-center justify-center self-stretch px-2 whitespace-nowrap transition-colors shrink-0 ${
              isActive
                ? 'font-semibold text-[#155EEF]'
                : 'font-medium text-[#667085] hover:text-[#344054]'
            }`}
          >
            <span className={`${textSize} translate-y-px`}>{tab}</span>
            {isActive && indicatorBottom && (
              <span className={`absolute ${indicatorBottom} left-0 right-0 h-[2px] bg-[#155EEF] rounded-full`} />
            )}
          </button>
        )
      })}

      {/* More dropdown */}
      {overflow.length > 0 && (
        <div data-more-dropdown className="relative shrink-0 self-stretch flex items-center">
          <button
            onClick={() => setOpen(o => !o)}
            className={`relative flex items-center gap-1 self-stretch px-2 whitespace-nowrap transition-colors ${
              activeInOverflow
                ? 'font-semibold text-[#155EEF]'
                : 'font-medium text-[#667085] hover:text-[#344054]'
            }`}
          >
            <span className={`${textSize} translate-y-px`}>
              {activeInOverflow ? activeTab : 'More'}
            </span>
            <ChevronDown size={11} strokeWidth={2.5} className="translate-y-px" />
            {activeInOverflow && indicatorBottom && (
              <span className={`absolute ${indicatorBottom} left-0 right-0 h-[2px] bg-[#155EEF] rounded-full`} />
            )}
          </button>
          {open && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-[#EAECF0] rounded-lg shadow-lg py-1 z-50 min-w-[160px]">
              {overflow.map(tab => (
                <button
                  key={tab}
                  onClick={() => { onTabChange?.(tab); setOpen(false) }}
                  className={`w-full text-left px-3 py-2 text-[14px] transition-colors ${
                    tab === activeTab
                      ? 'text-[#155EEF] font-semibold bg-[#EEF4FF]'
                      : 'text-[#344054] font-medium hover:bg-[#F9FAFB]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * TopBar — two variants:
 *
 * variant="tabbed"
 *   Row 1: title + section tabs (with overflow) + global icons
 *   Row 2: subLabel + sub-tabs (with overflow) + optional action buttons
 *
 * variant="simple"
 *   Single row: title + global icons. No tabs.
 */
export default function TopBar({
  variant = 'tabbed',
  title = 'App Title',
  titleIcon: TitleIcon = null,
  sectionTabs = [],
  activeSection = '',
  onSectionTabChange,
  subTabs = [],
  activeSubTab = '',
  onSubTabChange,
  actions,
  onOpenNotifications,
  onOpenHelp,
}) {
  if (variant === 'simple') {
    return (
      <header className="bg-white w-full flex flex-col shrink-0">
        <div className="flex items-center gap-12 px-4 py-2 border-b border-[#EAECF0] shadow-[0px_1px_1px_rgba(16,24,40,0.05)]">
          <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
            {TitleIcon && <TitleIcon size={15} className="text-[#667085]" />}
            <span className="text-[16px] font-semibold text-[#101828]">{title}</span>
          </div>
          <div className="flex-1" />
          <GlobalIcons onOpenNotifications={onOpenNotifications} onOpenHelp={onOpenHelp} />
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white w-full flex flex-col shrink-0">

      {/* Row 1: title + section tabs + global icons */}
      <div className="flex items-center gap-4 px-4 pt-2 pb-1">
        <div className="flex flex-1 self-stretch items-center gap-3 min-w-0">
          <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
            {TitleIcon && <TitleIcon size={15} className="text-[#667085]" />}
            <span className="text-[16px] font-semibold text-[#101828]">{title}</span>
          </div>
          <OverflowTabRow
            tabs={sectionTabs}
            activeTab={activeSection}
            onTabChange={onSectionTabChange}
            textSize="text-[14px]"
          />
        </div>
        <GlobalIcons onOpenNotifications={onOpenNotifications} onOpenHelp={onOpenHelp} />
      </div>

      {/* Row 2: subLabel + sub-tabs + optional actions */}
      <div className="flex items-center gap-4 px-4 min-h-[44px] border-b border-[#D0D5DD] shadow-[0px_1px_1px_rgba(16,24,40,0.05)]">
        <div className="flex flex-1 self-stretch items-center gap-2 min-w-0">
          <OverflowTabRow
            tabs={subTabs}
            activeTab={activeSubTab}
            onTabChange={onSubTabChange}
            textSize="text-[14px]"
            indicatorBottom="bottom-0"
          />
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}
