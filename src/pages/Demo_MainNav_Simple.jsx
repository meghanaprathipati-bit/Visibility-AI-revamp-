import {
  ArrowUpCircle, LayoutDashboard, MessageCircle, Calendar,
  User, CreditCard, Send, RefreshCw, Globe, Star,
  TrendingUp, Grid3x3, Tablet,
} from '../icons/index.js'
import AppShell from '../shell/AppShell'
import Canvas from '../shell/Canvas'

const NAV_SECTIONS = [
  {
    items: [
      { icon: ArrowUpCircle, label: 'Launchpad' },
      { icon: LayoutDashboard, label: 'Dashboard', active: true },
      { icon: MessageCircle, label: 'Conversations' },
      { icon: Calendar, label: 'Calendars' },
      { icon: User, label: 'Contacts' },
      { icon: TrendingUp, label: 'Opportunities' },
      { icon: CreditCard, label: 'Payments' },
    ],
  },
  {
    items: [
      { icon: Send, label: 'Marketing' },
      { icon: RefreshCw, label: 'Automation' },
      { icon: Globe, label: 'Sites' },
      { icon: Star, label: 'Reputation' },
      { icon: TrendingUp, label: 'Reporting' },
      { icon: Grid3x3, label: 'App marketplace' },
      { icon: Tablet, label: 'Mobile app' },
    ],
  },
]

export default function Demo_MainNav_Simple() {
  return (
    <AppShell
      sidebar="main-nav"
      sidebarProps={{ navSections: NAV_SECTIONS }}
      topbar="simple"
      topbarProps={{ title: 'Dashboard' }}
    >
      <Canvas level={1}>
        <div className="mb-5">
          <h1 className="text-[16px] font-semibold text-gray-900">Overview</h1>
          <p className="text-[13px] text-gray-500 mt-0.5">
            A product that uses a single-row topbar — no section tabs needed.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-4 gap-4">
            {['Revenue', 'New contacts', 'Open deals', 'Conversion'].map(label => (
              <div key={label} className="border border-gray-200 rounded-lg p-4">
                <p className="text-[12px] font-medium text-gray-500 mb-1">{label}</p>
                <div className="h-5 w-20 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
          <div className="border border-gray-200 rounded-lg p-4 h-56 flex items-center justify-center">
            <span className="text-[13px] text-gray-400">Main chart</span>
          </div>
        </div>
      </Canvas>
    </AppShell>
  )
}
