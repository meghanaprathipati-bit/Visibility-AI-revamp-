import { LayoutDashboard, FileText, Settings } from 'lucide-react'
import AppShell from '../shell/AppShell'
import Canvas from '../shell/Canvas'

const NAV_SECTIONS = [
  {
    items: [
      { icon: LayoutDashboard, label: 'Home', active: true },
      { icon: FileText, label: 'Page 2' },
      { icon: Settings, label: 'Page 3' },
    ],
  },
]

export default function Page1() {
  return (
    <AppShell
      sidebar="main-nav"
      sidebarProps={{ navSections: NAV_SECTIONS }}
      topbar="simple"
      topbarProps={{ title: 'My Project' }}
    >
      <Canvas level={1}>
        {/* Your content goes here */}
      </Canvas>
    </AppShell>
  )
}
