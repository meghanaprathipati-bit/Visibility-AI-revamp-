import { useState } from 'react'
import {
  Building2, Calendar, Users, Workflow,
  Phone, Mail, CreditCard,
  LayoutList, Code2, Award, Image, Link2, Settings,
} from 'lucide-react'
import AppShell from '../shell/AppShell'
import Canvas from '../shell/Canvas'

const TABS = ['General', 'Billing', 'Security', 'Integrations', 'API keys']

const SECTIONS = [
  {
    label: 'My Business',
    items: [
      { icon: Building2, label: 'Business profile' },
      { icon: Calendar, label: 'Calendars' },
      { icon: Users, label: 'My staff' },
      { icon: Workflow, label: 'Pipelines' },
    ],
  },
  {
    label: 'Business Services',
    items: [
      { icon: Mail, label: 'Email services' },
      { icon: Phone, label: 'Phone system', active: true },
      { icon: CreditCard, label: 'Payments' },
    ],
  },
  {
    label: 'Other Settings',
    items: [
      { icon: LayoutList, label: 'Custom fields' },
      { icon: Code2, label: 'Custom values' },
      { icon: Award, label: 'Memberships' },
      { icon: Image, label: 'Media' },
      { icon: Link2, label: 'URL redirects' },
    ],
  },
]

const ABBREVS = ['API', 'URL', 'ID', 'SMS', 'MFA', 'UI', 'UX']
function lowerLabel(str) {
  let result = str.toLowerCase()
  for (const abbr of ABBREVS) {
    result = result.replace(new RegExp(`\\b${abbr.toLowerCase()}\\b`, 'g'), abbr)
  }
  return result
}

export default function Demo_TopBar_VerticalTabs() {
  const [activeTab, setActiveTab] = useState('General')

  return (
    <AppShell
      sidebar="settings"
      sidebarProps={{ sections: SECTIONS, onBack: () => {} }}
      topbar="simple"
      topbarProps={{
        title: 'Phone system',
        titleIcon: Settings,
      }}
      verticalTabs={{
        tabs: TABS,
        activeTab,
        onTabChange: setActiveTab,
      }}
    >
      <Canvas level={1}>
        <div className="mb-5">
          <h1 className="text-[16px] font-semibold text-[#101828]">{activeTab}</h1>
          <p className="text-[13px] text-[#667085] mt-0.5">
            Manage your {lowerLabel(activeTab)} settings and preferences.
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
        {['Setting 1', 'Setting 2', 'Setting 3'].map(label => (
          <div key={label} className="border border-[#EAECF0] rounded-lg p-4">
            <p className="text-[12px] font-medium text-[#667085] mb-1">{label}</p>
            <div className="h-5 w-16 bg-[#F2F4F7] rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {['Details', 'Advanced'].map(label => (
          <div key={label} className="border border-[#EAECF0] rounded-lg p-4 h-36 flex items-center justify-center">
            <span className="text-[13px] text-[#98A2B3]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
