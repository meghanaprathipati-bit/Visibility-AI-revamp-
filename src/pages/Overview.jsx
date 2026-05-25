import { useState } from 'react'
import { LayoutDashboard, FileText, Settings } from 'lucide-react'
import AppShell from '../shell/AppShell'
import Canvas from '../shell/Canvas'

const NAV_SECTIONS = [
  {
    items: [
      { icon: LayoutDashboard, label: 'Overview', active: true },
      { icon: FileText, label: 'Page 2' },
      { icon: Settings, label: 'Page 3' },
    ],
  },
]

const SECTION_TABS = ['Section 1', 'Section 2', 'Section 3']
const SUB_TABS = ['Tab 1', 'Tab 2', 'Tab 3']

export default function Overview() {
  const [activeSubTab, setActiveSubTab] = useState('Tab 1')

  return (
    <AppShell
      sidebar="main-nav"
      sidebarProps={{ navSections: NAV_SECTIONS }}
      topbar="tabbed"
      topbarProps={{
        title: 'Visibility AI New',
        sectionTabs: SECTION_TABS,
        activeSection: 'Section 1',
        subTabs: SUB_TABS,
        activeSubTab,
        onSubTabChange: setActiveSubTab,
      }}
    >
      <Canvas level={1}>
        {/* Your content goes here */}
      </Canvas>
    </AppShell>
  )
}
