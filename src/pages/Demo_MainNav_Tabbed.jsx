import { useState } from 'react'
import {
  ArrowUpCircle, LayoutDashboard, MessageCircle, Calendar,
  User, CreditCard, Send, RefreshCw, Globe, Star,
  TrendingUp, Grid3x3, Tablet, Settings, Plus,
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
      { icon: User, label: 'Contacts' },
      { icon: TrendingUp, label: 'Opportunities' },
      { icon: CreditCard, label: 'Payments' },
    ],
  },
  {
    items: [
      { icon: Send, label: 'Marketing', active: true },
      { icon: RefreshCw, label: 'Automation' },
      { icon: Globe, label: 'Sites' },
      { icon: Star, label: 'Reputation' },
      { icon: TrendingUp, label: 'Reporting' },
      { icon: Grid3x3, label: 'App marketplace' },
      { icon: Tablet, label: 'Mobile app' },
    ],
  },
]

const SECTION_TABS = ['Social planner', 'Emails', 'Snippets', 'Countdown timer', 'Brand boards', 'Ad manager']
const SUB_TABS = ['Planner', 'Content', 'Comments', 'Statistics', 'Social listening']

export default function Demo_MainNav_Tabbed() {
  const [activeSubTab, setActiveSubTab] = useState('Social listening')

  const actions = (
    <div className="flex items-center gap-1.5">
      <button className="size-8 flex items-center justify-center rounded-md border border-[#EAECF0] text-[#667085] hover:bg-[#F9FAFB] transition-colors">
        <RefreshCw size={13} />
      </button>
      <button className="size-8 flex items-center justify-center rounded-md border border-[#EAECF0] text-[#667085] hover:bg-[#F9FAFB] transition-colors">
        <Settings size={13} />
      </button>
      <button className="h-8 px-3 flex items-center gap-1 text-[13px] font-medium text-[#344054] border border-[#D0D5DD] rounded-lg hover:bg-[#F9FAFB] transition-colors">
        <Plus size={12} />
        Socials
      </button>
      <button className="h-8 px-3 flex items-center gap-1 text-[13px] font-semibold text-white bg-[#155EEF] rounded-lg hover:bg-[#1249C0] transition-colors">
        <Plus size={12} />
        New post
      </button>
    </div>
  )

  return (
    <AppShell
      sidebar="main-nav"
      sidebarProps={{ navSections: NAV_SECTIONS }}
      topbar="tabbed"
      topbarProps={{
        title: 'Marketing',
        sectionTabs: SECTION_TABS,
        activeSection: 'Social planner',
        subTabs: SUB_TABS,
        activeSubTab,
        onSubTabChange: setActiveSubTab,
        actions,
      }}
    >
      <Canvas level={1}>
        <div className="mb-5">
          <h1 className="text-[16px] font-semibold text-[#101828]">Social listening</h1>
          <p className="text-[13px] text-[#667085] mt-0.5">
            Monitor brand mentions and trends across social platforms in real time.
          </p>
        </div>
        <PlaceholderContent />
      </Canvas>
    </AppShell>
  )
}

function PlaceholderContent() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-4">
        {[['Total mentions', '182'], ['Avg sentiment', '68%'], ['Active topics', '4']].map(([label, val]) => (
          <div key={label} className="border border-[#EAECF0] rounded-lg p-4">
            <p className="text-[12px] font-medium text-[#667085] mb-1">{label}</p>
            <p className="text-[24px] font-semibold text-[#101828]">{val}</p>
          </div>
        ))}
      </div>
      <div className="border border-[#EAECF0] rounded-lg p-4 h-48 flex items-center justify-center">
        <span className="text-[13px] text-[#98A2B3]">Chart placeholder</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {['Trending topics', 'Recent mentions'].map(label => (
          <div key={label} className="border border-[#EAECF0] rounded-lg p-4 h-36 flex items-center justify-center">
            <span className="text-[13px] text-[#98A2B3]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
