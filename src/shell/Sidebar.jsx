import { useState } from 'react'
import { ChevronRight, ChevronLeft, Search, Zap, ArrowLeft, Settings } from '../icons/index.js'

function HLLogo({ compact }) {
  const dim = compact ? 28 : 40
  return (
    <svg width={dim} height={compact ? 22 : 32} viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 36V20L18 8L28 20V36" stroke="#F9C400" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 36V20L32 8L42 20V36" stroke="#00C4C4" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function NavSubItemMainNav({ label, active, collapsed }) {
  if (collapsed) return null
  return (
    <div className={`flex gap-2 items-center pl-9 pr-2 py-1.5 rounded-lg w-full cursor-pointer ${
      active ? 'bg-gray-800' : 'hover:bg-gray-800/50'
    }`}>
      <span className={`text-[14px] font-medium leading-5 ${active ? 'text-white' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  )
}

function NavItemMainNav({ icon: Icon, label, active, collapsed, subItems = [] }) {
  const hasActiveChild = subItems.some(item => item.active)
  const isHighlighted = active || hasActiveChild

  if (collapsed) {
    return (
      <div
        title={label}
        className={`size-9 mx-auto flex items-center justify-center rounded-lg cursor-pointer ${
          isHighlighted ? 'bg-gray-800' : 'hover:bg-gray-800/50'
        }`}
      >
        <Icon size={20} strokeWidth={1.8} className={isHighlighted ? 'text-white' : 'text-gray-400'} />
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-0.5">
      <div className={`flex gap-2 items-center px-2 py-2 rounded-lg w-full cursor-pointer ${
        isHighlighted ? 'bg-gray-800' : 'hover:bg-gray-800/50'
      }`}>
        <Icon size={20} strokeWidth={1.8} className={isHighlighted ? 'text-white' : 'text-gray-400'} />
        <span className={`text-[16px] font-medium leading-5 ${isHighlighted ? 'text-white' : 'text-gray-300'}`}>
          {label}
        </span>
      </div>
      {subItems.map(item => (
        <NavSubItemMainNav key={item.label} {...item} collapsed={collapsed} />
      ))}
    </div>
  )
}

function NavItemSettings({ icon: Icon, label, active, collapsed }) {
  if (collapsed) {
    return (
      <div
        title={label}
        className={`size-9 mx-auto flex items-center justify-center rounded-lg cursor-pointer ${
          active ? 'bg-gray-800' : 'hover:bg-gray-800/50'
        }`}
      >
        <Icon size={20} strokeWidth={1.8} className={active ? 'text-white' : 'text-gray-400'} />
      </div>
    )
  }
  return (
    <div className={`flex gap-2 items-center px-2 py-2 rounded-lg w-full cursor-pointer ${
      active ? 'bg-gray-800' : 'hover:bg-gray-800/50'
    }`}>
      <Icon size={20} strokeWidth={1.8} className={active ? 'text-white' : 'text-gray-400'} />
      <span className={`text-[16px] font-medium leading-5 ${active ? 'text-white' : 'text-gray-300'}`}>
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
 *   Categorized with section labels. Includes a back ribbon.
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
  defaultCollapsed = false,
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  function toggleCollapsed() {
    const next = !collapsed
    setCollapsed(next)
    onCollapsedChange?.(next)
  }
  const isSettings = variant === 'settings'
  const NavItem = isSettings ? NavItemSettings : NavItemMainNav

  return (
    <aside className={`relative flex flex-col h-screen bg-gray-900 px-2 py-4 shrink-0 transition-[width] duration-200 ${collapsed ? 'w-[64px]' : 'w-[280px]'}`}>
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
              className="size-9 mx-auto rounded-lg border border-gray-700 flex items-center justify-center cursor-pointer hover:border-gray-600"
            >
              <span className="text-gray-300 text-[11px] font-semibold leading-none">HQ</span>
            </div>
          ) : (
            <div
              onClick={onOpenSwitcher}
              className="flex items-center gap-2 border border-gray-700 rounded-lg px-2 py-2 cursor-pointer hover:border-gray-600"
            >
              <span className="flex-1 text-gray-400 text-[13px] font-medium leading-none truncate">
                Headquarters 1800-PLUMBER-200..
              </span>
              <ChevronRight size={13} className="text-gray-500 shrink-0" />
            </div>
          )}

          {/* Search + Quick action */}
          {collapsed ? (
            <div className="flex flex-col gap-2 items-center">
              <button title="Search" className="size-9 rounded-lg border border-gray-700 flex items-center justify-center hover:border-gray-600">
                <Search size={15} className="text-gray-500" />
              </button>
              <button title="Quick action" className="size-9 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600">
                <Zap size={15} className="text-gray-300" fill="var(--gray-300)" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2 items-center">
              <div className="flex flex-1 items-center justify-between border border-gray-700 rounded-lg pl-2 pr-1 py-[7px]">
                <div className="flex gap-2 items-center">
                  <Search size={14} className="text-gray-500" />
                  <span className="text-gray-500 text-[13px] leading-none">Search</span>
                </div>
                <kbd className="bg-gray-800 text-gray-500 text-[11px] px-1.5 py-0.5 rounded font-medium">⌘K</kbd>
              </div>
              <div className="bg-gray-700 rounded-lg p-[9px] flex items-center justify-center cursor-pointer hover:bg-gray-600">
                <Zap size={15} className="text-gray-300" fill="var(--gray-300)" />
              </div>
            </div>
          )}

          {/* Settings variant: Go back ribbon */}
          {isSettings && (
            collapsed ? (
              <div
                onClick={onBack}
                title="Go back"
                className="size-9 mx-auto bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft size={18} strokeWidth={1.8} className="text-gray-300" />
              </div>
            ) : (
              <div
                onClick={onBack}
                className="-ml-2 w-fit flex items-center gap-2 bg-gray-700 rounded-r-lg pl-3 pr-8 py-3 cursor-pointer hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft size={18} strokeWidth={1.8} className="text-gray-300" />
                <span className="text-[14px] font-medium text-gray-300 leading-none">Go back</span>
              </div>
            )
          )}

          {/* Nav items */}
          <div className="flex flex-col gap-1 flex-1 overflow-y-auto no-scrollbar">
            {isSettings ? (
              sections.map((section, i) => (
                <div key={i} className="flex flex-col gap-1">
                  {!collapsed && (
                    <div className="px-2 pb-1">
                      <span className="text-[11px] font-semibold text-gray-500">
                        {section.label}
                      </span>
                    </div>
                  )}
                  {collapsed && i > 0 && <div className="h-px bg-gray-800 my-2 mx-3" />}
                  {section.items.map(item => (
                    <NavItemSettings key={item.label} {...item} collapsed={collapsed} />
                  ))}
                </div>
              ))
            ) : (
              navSections.map((section, i) => (
                <div key={i} className="flex flex-col gap-1">
                  {i > 0 && <div className={`h-px bg-gray-800 my-2 ${collapsed ? 'mx-3' : ''}`} />}
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
            <div className={`h-px bg-gray-800 ${collapsed ? 'mx-3' : ''}`} />
            <NavItem icon={Settings} label="Settings" collapsed={collapsed} />
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <div
        onClick={toggleCollapsed}
        className="absolute bottom-6 -right-3 bg-accent-green rounded-xl size-6 flex items-center justify-center shadow-sm cursor-pointer hover:bg-accent-green-dark transition-colors"
      >
        {collapsed ? (
          <ChevronRight size={14} className="text-gray-900" strokeWidth={2.5} />
        ) : (
          <ChevronLeft size={14} className="text-gray-900" strokeWidth={2.5} />
        )}
      </div>
    </aside>
  )
}
