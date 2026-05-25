import { useState } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BackToolbar from './BackToolbar'
import VerticalTabs from './VerticalTabs'
import SubAccountSwitcher from './SubAccountSwitcher'
import NotificationsDrawer from './NotificationsDrawer'
import HelpDrawer from './HelpDrawer'

export default function AppShell({
  layout = 'default',
  sidebar = 'main-nav',
  sidebarProps = {},
  topbar = 'tabbed',
  topbarProps = {},
  backToolbar,
  verticalTabs,
  children,
}) {
  const [activeOverlay, setActiveOverlay] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  function closeOverlay() { setActiveOverlay(null) }

  if (layout === 'fullscreen') {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-[#F9FAFB]">
        {backToolbar && <BackToolbar {...backToolbar} />}
        <div className="flex flex-1 min-h-0">
          {verticalTabs && <VerticalTabs {...verticalTabs} />}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9FAFB]">
      {sidebar && (
        <Sidebar
          variant={sidebar}
          {...sidebarProps}
          onOpenSwitcher={() => setActiveOverlay('accounts')}
          onCollapsedChange={setSidebarCollapsed}
        />
      )}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          variant={topbar}
          {...topbarProps}
          titleIcon={sidebar === 'settings' ? null : topbarProps.titleIcon}
          onOpenNotifications={() => setActiveOverlay('notifications')}
          onOpenHelp={() => setActiveOverlay('help')}
        />
        {backToolbar && <BackToolbar {...backToolbar} />}
        <main className="flex-1 flex min-h-0">
          {verticalTabs && <VerticalTabs {...verticalTabs} />}
          <div className="flex-1 flex flex-col min-h-0">
            {children}
          </div>
        </main>
      </div>

      {activeOverlay === 'accounts' && (
        <SubAccountSwitcher
          onClose={closeOverlay}
          sidebarWidth={sidebarCollapsed ? 64 : 280}
        />
      )}
      {activeOverlay === 'notifications' && (
        <NotificationsDrawer onClose={closeOverlay} />
      )}
      {activeOverlay === 'help' && (
        <HelpDrawer onClose={closeOverlay} />
      )}
    </div>
  )
}
