import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUpCircle, LayoutDashboard, MessageCircle, Calendar,
  User, CreditCard, Send, RefreshCw, Globe, Star,
  TrendingUp, Grid3x3, Tablet, RefreshCw as Refresh, Share2, Download,
  Settings, Plus,
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

export default function Demo_Level2() {
  const navigate = useNavigate()
  const [activeSubTab, setActiveSubTab] = useState('Social listening')

  const canvasToolbar = (
    <div className="flex items-center gap-1.5">
      <button className="size-8 flex items-center justify-center rounded-md border border-[#EAECF0] text-[#667085] hover:bg-[#F9FAFB] transition-colors">
        <Refresh size={13} />
      </button>
      <button className="size-8 flex items-center justify-center rounded-md border border-[#EAECF0] text-[#667085] hover:bg-[#F9FAFB] transition-colors">
        <Share2 size={13} />
      </button>
      <button className="size-8 flex items-center justify-center rounded-md border border-[#EAECF0] text-[#667085] hover:bg-[#F9FAFB] transition-colors">
        <Download size={13} />
      </button>
    </div>
  )

  const topbarActions = (
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
        actions: topbarActions,
      }}
    >
      <Canvas
        level={2}
        onBack={() => navigate('/demo-main-nav-tabbed')}
        title='"HighLevel"'
        toolbar={canvasToolbar}
      >
        <PlaceholderDetailContent />
      </Canvas>
    </AppShell>
  )
}

function PlaceholderDetailContent() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-5 gap-3">
        {['Total mentions', 'Positive', 'Neutral', 'Negative', 'Net sentiment'].map(label => (
          <div key={label} className="border border-[#EAECF0] rounded-lg p-4">
            <p className="text-[12px] font-medium text-[#667085] mb-1">{label}</p>
            <div className="h-6 w-14 bg-[#F2F4F7] rounded" />
          </div>
        ))}
      </div>
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-wider text-[#98A2B3] mb-4">Sentiment analysis</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="border border-[#EAECF0] rounded-lg p-4 h-48 flex items-center justify-center">
            <span className="text-[13px] text-[#98A2B3]">Sentiment donut</span>
          </div>
          <div className="col-span-2 border border-[#EAECF0] rounded-lg p-4 h-48 flex items-center justify-center">
            <span className="text-[13px] text-[#98A2B3]">Sentiment over time</span>
          </div>
        </div>
      </div>
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-wider text-[#98A2B3] mb-4">Platform intelligence</p>
        <div className="grid grid-cols-2 gap-4">
          {['Mentions by platform', 'Platform trends over time'].map(label => (
            <div key={label} className="border border-[#EAECF0] rounded-lg p-4 h-48 flex items-center justify-center">
              <span className="text-[13px] text-[#98A2B3]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
