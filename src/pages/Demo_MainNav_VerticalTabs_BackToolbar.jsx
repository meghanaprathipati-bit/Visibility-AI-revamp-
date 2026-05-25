import { useState } from 'react'
import {
  ArrowUpCircle, LayoutDashboard, MessageCircle, Calendar,
  User, CreditCard, Send, RefreshCw, Globe, Star,
  TrendingUp, Grid3x3, Tablet,
} from 'lucide-react'
import AppShell from '../shell/AppShell'
import Canvas from '../shell/Canvas'

const NAV_SECTIONS = [
  {
    items: [
      { icon: ArrowUpCircle, label: 'Launchpad' },
      { icon: LayoutDashboard, label: 'Dashboard' },
      { icon: MessageCircle, label: 'Conversations' },
      { icon: Calendar, label: 'Calendars' },
      { icon: User, label: 'Contacts', active: true },
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

const VERTICAL_TABS = ['Overview', 'Activity', 'Notes', 'Files', 'Integrations']

export default function Demo_MainNav_VerticalTabs_BackToolbar() {
  const [activeTab, setActiveTab] = useState('Overview')

  return (
    <AppShell
      sidebar="main-nav"
      sidebarProps={{ navSections: NAV_SECTIONS }}
      topbar="simple"
      topbarProps={{ title: 'Contacts' }}
      backToolbar={{
        onBack: () => setActiveTab('Overview'),
        label: 'Sarah Johnson',
      }}
      verticalTabs={{
        tabs: VERTICAL_TABS,
        activeTab,
        onTabChange: setActiveTab,
      }}
    >
      <Canvas level={1}>
        <div className="mb-5">
          <h1 className="text-[16px] font-semibold text-[#101828]">{activeTab}</h1>
          <p className="text-[13px] text-[#667085] mt-0.5">
            Contact details and {activeTab.toLowerCase()} information for Sarah Johnson.
          </p>
        </div>
        <PlaceholderContent activeTab={activeTab} />
      </Canvas>
    </AppShell>
  )
}

function PlaceholderContent({ activeTab }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="border border-[#EAECF0] rounded-lg p-6 h-40 flex items-center justify-center">
        <span className="text-[13px] text-[#98A2B3]">{activeTab} content</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {['Contact info', 'Tags', 'Source'].map(label => (
          <div key={label} className="border border-[#EAECF0] rounded-lg p-4">
            <p className="text-[12px] font-medium text-[#667085] mb-1">{label}</p>
            <div className="h-5 w-16 bg-[#F2F4F7] rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {['Recent conversations', 'Assigned workflows'].map(label => (
          <div key={label} className="border border-[#EAECF0] rounded-lg p-4 h-36 flex items-center justify-center">
            <span className="text-[13px] text-[#98A2B3]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
