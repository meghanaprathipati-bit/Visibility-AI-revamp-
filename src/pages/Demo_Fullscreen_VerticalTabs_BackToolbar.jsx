import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../shell/AppShell'
import Canvas from '../shell/Canvas'

const VERTICAL_TABS = ['Overview', 'Contacts', 'Sequences', 'Stats', 'Settings']

export default function Demo_Fullscreen_VerticalTabs_BackToolbar() {
  const [activeTab, setActiveTab] = useState('Overview')
  const navigate = useNavigate()

  return (
    <AppShell
      layout="fullscreen"
      backToolbar={{
        onBack: () => navigate('/'),
        label: 'Spring Email Campaign',
      }}
      verticalTabs={{
        tabs: VERTICAL_TABS,
        activeTab,
        onTabChange: setActiveTab,
        label: 'Campaign',
      }}
    >
      <Canvas level={1}>
        <div className="mb-5">
          <h1 className="text-[16px] font-semibold text-[#101828]">{activeTab}</h1>
          <p className="text-[13px] text-[#667085] mt-0.5">
            {activeTab} details for Spring Email Campaign.
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
        {['Sent', 'Open rate', 'Click rate'].map(label => (
          <div key={label} className="border border-[#EAECF0] rounded-lg p-4">
            <p className="text-[12px] font-medium text-[#667085] mb-1">{label}</p>
            <div className="h-5 w-16 bg-[#F2F4F7] rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {['Audience', 'Schedule'].map(label => (
          <div key={label} className="border border-[#EAECF0] rounded-lg p-4 h-36 flex items-center justify-center">
            <span className="text-[13px] text-[#98A2B3]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
