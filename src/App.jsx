import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Overview from './pages/Overview'
import VisibilityAI from './pages/VisibilityAI'

import Demo_MainNav_Simple from './pages/Demo_MainNav_Simple'
import Demo_MainNav_Tabbed from './pages/Demo_MainNav_Tabbed'
import Demo_MainNav_Tabbed_VerticalTabs from './pages/Demo_MainNav_Tabbed_VerticalTabs'
import Demo_MainNav_VerticalTabs_BackToolbar from './pages/Demo_MainNav_VerticalTabs_BackToolbar'
import Demo_Level2 from './pages/Demo_Level2'
import Demo_Fullscreen_Builder from './pages/Demo_Fullscreen_Builder'
import Demo_Settings_Tabbed from './pages/Demo_Settings_Tabbed'
import Demo_TopBar_VerticalTabs from './pages/Demo_TopBar_VerticalTabs'
import Demo_Settings_VerticalTabs_BackToolbar from './pages/Demo_Settings_VerticalTabs_BackToolbar'
import Demo_Fullscreen_VerticalTabs_BackToolbar from './pages/Demo_Fullscreen_VerticalTabs_BackToolbar'

export default function App() {
  return (
    <div className="visibilityAiApp">
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/visibility-ai" replace />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/visibility-ai" element={<VisibilityAI />} />

        {/* Shell variant reference — not linked in the UI */}
        <Route path="/ref/main-nav-simple" element={<Demo_MainNav_Simple />} />
        <Route path="/ref/main-nav-tabbed" element={<Demo_MainNav_Tabbed />} />
        <Route path="/ref/main-nav-tabbed-vertical-tabs" element={<Demo_MainNav_Tabbed_VerticalTabs />} />
        <Route path="/ref/main-nav-vertical-tabs-back-toolbar" element={<Demo_MainNav_VerticalTabs_BackToolbar />} />
        <Route path="/ref/level2" element={<Demo_Level2 />} />
        <Route path="/ref/fullscreen-builder" element={<Demo_Fullscreen_Builder />} />
        <Route path="/ref/settings-tabbed" element={<Demo_Settings_Tabbed />} />
        <Route path="/ref/settings-vertical-tabs" element={<Demo_TopBar_VerticalTabs />} />
        <Route path="/ref/settings-vertical-tabs-back-toolbar" element={<Demo_Settings_VerticalTabs_BackToolbar />} />
        <Route path="/ref/fullscreen-vertical-tabs-back-toolbar" element={<Demo_Fullscreen_VerticalTabs_BackToolbar />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </div>
  )
}
