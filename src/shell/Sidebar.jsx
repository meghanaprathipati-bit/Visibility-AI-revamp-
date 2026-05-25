import { useState } from 'react'
import { ChevronRight, ChevronLeft, Search, Zap, ArrowLeft, Settings } from 'lucide-react'

function HLLogo({ compact }) {
  const dim = compact ? 28 : 40
  return (
    <svg width={dim} height={compact ? 22 : 32} viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 36V20L18 8L28 20V36" stroke="#F9C400" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 36V20L32 8L42 20V36" stroke="#00C4C4" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function NavItemMainNav({ icon: Icon, label, active, collapsed }) {
  if (collapsed) {
    return (
      <div
        title={label}
        className={`size-9 mx-auto flex items-center justify-center rounded-lg cursor-pointer ${
          active ? 'bg-[#1D2939]' : 'hover:bg-[#1D2939]/50'
        }`}
      >
        <Icon size={20} strokeWidth={1.8} className={active ? 'text-white' : 'text-[#98A2B3]'} />
      </div>
    )
  }
  return (
    <div className={`flex gap-2 items-center px-2 py-2 rounded-lg w-full cursor-pointer ${
      active ? 'bg-[#1D2939]' : 'hover:bg-[#1D2939]/50'
    }`}>
      <Icon size={20} strokeWidth={1.8} className={active ? 'text-white' : 'text-[#98A2B3]'} />
      <span className={`text-[16px] font-medium leading-5 ${active ? 'text-white' : 'text-[#D0D5DD]'}`}>
        {label}
      </span>
    </div>
  )
}

function NavItemSettings({ icon: Icon, label, active, collapsed }) {
  if (collapsed) {
    return (
      <div
        title={label}
        className={`size-9 mx-auto flex items-center justify-center rounded-lg cursor-pointer ${
          active ? 'bg-[#1D2939]' : 'hover:bg-[#1D2939]/50'
        }`}
      >
        <Icon size={20} strokeWidth={1.8} className={active ? 'text-white' : 'text-[#98A2B3]'} />
      </div>
    )
  }
  return (
    <div className={`flex gap-2 items-center px-2 py-2 rounded-lg w-full cursor-pointer ${
      active ? 'bg-[#1D2939]' : 'hover:bg-[#1D2939]/50'
    }`}>
      <Icon size={20} strokeWidth={1.8} className={active ? 'text-white' : 'text-[#98A2B3]'} />
      <span className={`text-[16px] font-medium leading-5 ${active ? 'text-white' : 'text-[#D0D5DD]'}`}>
        {label}
      </span>
    </div>
  )
}

/**
 * Sidebar — two variants:
 *
 * variant="main-nav"  (Social Listening pattern)
 *   navSections: [{ items: [{ icon, label, active }] }, ...]
 *   Two sections separated by a divider. Flat — no section labels.
 *
 * variant="settings"  (Messaging Limits / Phone System pattern)
 *   sections: [{ label: 'My Business', items: [{ icon, label, active }] }, ...]
 *   Categorized with uppercase section labels. Includes a back ribbon.
 *   onBack: callback for the back ribbon
 *
 * Click the green chevron at bottom-right to collapse/expand.
 */
export default function Sidebar({
  variant = 'main-nav',
  navSections = [],
  sections = [],
  onBack,
  onOpenSwitcher,
  onCollapsedChange,
}) {
  const [collapsed, setCollapsed] = useState(false)

  function toggleCollapsed() {
    const next = !collapsed
    setCollapsed(next)
    onCollapsedChange?.(next)
  }
  const isSettings = variant === 'settings'
  const NavItem = isSettings ? NavItemSettings : NavItemMainNav

  return (
    <aside className={`relative flex flex-col h-screen bg-[#101828] px-2 py-4 shrink-0 transition-[width] duration-200 ${collapsed ? 'w-[64px]' : 'w-[280px]'}`}>
      <div className="flex flex-col flex-1 justify-between min-h-0">
        <div className="flex flex-col gap-3 flex-1 min-h-0">

          {/* Logo */}
          <div className={`h-10 flex items-center ${collapsed ? 'justify-center' : 'px-2'}`}>
            <HLLogo compact={collapsed} />
          </div>

          {/* Subaccount switcher */}
          {collapsed ? (
            <div
              onClick={onOpenSwitcher}
              title="Headquarters 1800-PLUMBER-200.."
              className="size-9 mx-auto rounded-lg border border-[#344054] flex items-center justify-center cursor-pointer hover:border-[#475467]"
            >
              <span className="text-[#D0D5DD] text-[11px] font-semibold leading-none">HQ</span>
            </div>
          ) : (
            <div
              onClick={onOpenSwitcher}
              className="flex items-center gap-2 border border-[#344054] rounded-lg px-2 py-2 cursor-pointer hover:border-[#475467]"
            >
              <span className="flex-1 text-[#98A2B3] text-[13px] font-medium leading-none truncate">
                Headquarters 1800-PLUMBER-200..
              </span>
              <ChevronRight size={13} className="text-[#667085] shrink-0" />
            </div>
          )}

          {/* Search + Quick action */}
          {collapsed ? (
            <div className="flex flex-col gap-2 items-center">
              <button title="Search" className="size-9 rounded-lg border border-[#344054] flex items-center justify-center hover:border-[#475467]">
                <Search size={15} className="text-[#667085]" />
              </button>
              <button title="Quick action" className="size-9 bg-[#344054] rounded-lg flex items-center justify-center hover:bg-[#475467]">
                <Zap size={15} className="text-[#D0D5DD]" fill="#D0D5DD" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2 items-center">
              <div className="flex flex-1 items-center justify-between border border-[#344054] rounded-lg pl-2 pr-1 py-[7px]">
                <div className="flex gap-2 items-center">
                  <Search size={14} className="text-[#667085]" />
                  <span className="text-[#667085] text-[13px] leading-none">Search</span>
                </div>
                <kbd className="bg-[#1D2939] text-[#667085] text-[11px] px-1.5 py-0.5 rounded font-medium">⌘K</kbd>
              </div>
              <div className="bg-[#344054] rounded-lg p-[9px] flex items-center justify-center cursor-pointer hover:bg-[#475467]">
                <Zap size={15} className="text-[#D0D5DD]" fill="#D0D5DD" />
              </div>
            </div>
          )}

          {/* Settings variant: Go back ribbon */}
          {isSettings && (
            collapsed ? (
              <div
                onClick={onBack}
                title="Go back"
                className="size-9 mx-auto bg-[#344054] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#475467] transition-colors"
              >
                <ArrowLeft size={18} strokeWidth={1.8} className="text-[#D0D5DD]" />
              </div>
            ) : (
              <div
                onClick={onBack}
                className="-ml-2 w-fit flex items-center gap-2 bg-[#344054] rounded-r-lg pl-3 pr-8 py-3 cursor-pointer hover:bg-[#475467] transition-colors"
              >
                <ArrowLeft size={18} strokeWidth={1.8} className="text-[#D0D5DD]" />
                <span className="text-[14px] font-medium text-[#D0D5DD] leading-none">Go back</span>
              </div>
            )
          )}

          {/* Nav items */}
          <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
            {isSettings ? (
              sections.map((section, i) => (
                <div key={i} className="flex flex-col gap-1">
                  {!collapsed && (
                    <div className="px-2 pb-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
                        {section.label}
                      </span>
                    </div>
                  )}
                  {collapsed && i > 0 && <div className="h-px bg-[#1D2939] my-2 mx-3" />}
                  {section.items.map(item => (
                    <NavItemSettings key={item.label} {...item} collapsed={collapsed} />
                  ))}
                </div>
              ))
            ) : (
              navSections.map((section, i) => (
                <div key={i} className="flex flex-col gap-1">
                  {i > 0 && <div className={`h-px bg-[#1D2939] my-2 ${collapsed ? 'mx-3' : ''}`} />}
                  {section.items.map(item => (
                    <NavItemMainNav key={item.label} {...item} collapsed={collapsed} />
                  ))}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom: Settings */}
        {!isSettings && (
          <div className="flex flex-col gap-2 mt-2">
            <div className={`h-px bg-[#1D2939] ${collapsed ? 'mx-3' : ''}`} />
            <NavItem icon={Settings} label="Settings" collapsed={collapsed} />
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <div
        onClick={toggleCollapsed}
        className="absolute bottom-6 -right-3 bg-[#73E2A3] rounded-xl size-6 flex items-center justify-center shadow-sm cursor-pointer hover:bg-[#5DD08C] transition-colors"
      >
        {collapsed ? (
          <ChevronRight size={14} className="text-[#101828]" strokeWidth={2.5} />
        ) : (
          <ChevronLeft size={14} className="text-[#101828]" strokeWidth={2.5} />
        )}
      </div>
    </aside>
  )
}
