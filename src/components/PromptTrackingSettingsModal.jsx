import { useState } from 'react'
import { Check } from '../icons/index.js'
import SettingsSideNavModal from './settings/SettingsSideNavModal.jsx'
import ScheduleSettingsPanel, { useScheduleSettings } from './settings/ScheduleSettingsPanel.jsx'
import ManageCompetitorsModal from './ManageCompetitorsModal.jsx'
import SectionInfoTip from './SectionInfoTip.jsx'
import {
  AiModeLogo,
  AiOverviewLogo,
  ChatGptLogo,
  ClaudeLogo,
  GeminiLogo,
  PerplexityLogo,
} from './EngineLogo.jsx'

// HARDCODED: AI engine options for Prompt Tracking settings (prototyping)
const SETTINGS_ENGINES = [
  { id: 'chatgpt',     name: 'ChatGPT',     Logo: ChatGptLogo    },
  { id: 'perplexity',  name: 'Perplexity',  Logo: PerplexityLogo },
  { id: 'claude',      name: 'Claude',      Logo: ClaudeLogo     },
  { id: 'gemini',      name: 'Gemini',      Logo: GeminiLogo     },
  { id: 'ai-mode',     name: 'AI Mode',     Logo: AiModeLogo     },
  { id: 'ai-overview', name: 'AI Overview', Logo: AiOverviewLogo },
]

const PT_SETTINGS_NAV = [
  { id: 'prompts',     label: 'Prompts' },
  { id: 'competitors', label: 'Competitors' },
  { id: 'engines',     label: 'AI Engines' },
  { id: 'schedule',    label: 'Schedule' },
]

function EngineCheckboxCard({ engine, checked, onToggle }) {
  const { name, Logo } = engine
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className={`relative flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all ${
        checked
          ? 'border-primary-600 bg-primary-50/60'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <span className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center shrink-0">
        <Logo size={14} />
      </span>
      <span className="min-w-0 flex-1 text-[14px] font-medium text-gray-900 truncate">{name}</span>
      <span
        className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-colors ${
          checked ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'
        }`}
      >
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
      </span>
    </button>
  )
}

/**
 * Prompt Tracking settings — Site Health–style side-nav modal.
 * Tabs: Prompts, Competitors, AI Engines, Schedule (last; default weekly).
 *
 * PromptsPanel is injected from the parent so we can reuse ManagePromptsModal
 * without a circular import.
 */
export default function PromptTrackingSettingsModal({ onClose, onApply, PromptsPanel }) {
  const [activeSection, setActiveSection] = useState('prompts')
  const [selectedEngines, setSelectedEngines] = useState(
    () => new Set(SETTINGS_ENGINES.map(e => e.id)),
  )
  const schedule = useScheduleSettings()

  function toggleEngine(id) {
    setSelectedEngines(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function resetToDefaults() {
    setSelectedEngines(new Set(SETTINGS_ENGINES.map(e => e.id)))
    schedule.resetSchedule()
  }

  function renderContent() {
    switch (activeSection) {
      case 'prompts':
        return PromptsPanel ? <PromptsPanel /> : null
      case 'competitors':
        return <ManageCompetitorsModal embedded />
      case 'engines':
        return (
          <div className="flex flex-col gap-5 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[18px] font-bold text-gray-900 m-0">AI Engines</p>
                <SectionInfoTip content="Engine selection applies globally to every tracked prompt." />
              </div>
              <p className="text-[13px] text-gray-500 m-0 mt-1">
                Choose which LLM engines to query for your tracked prompts.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SETTINGS_ENGINES.map(engine => (
                  <EngineCheckboxCard
                    key={engine.id}
                    engine={engine}
                    checked={selectedEngines.has(engine.id)}
                    onToggle={() => toggleEngine(engine.id)}
                  />
                ))}
              </div>
              {selectedEngines.size === 0 && (
                <p className="text-[12px] text-error-600 m-0 mt-3">Select at least one AI engine.</p>
              )}
            </div>
          </div>
        )
      case 'schedule':
        return <ScheduleSettingsPanel {...schedule.panelProps} />
      default:
        return null
    }
  }

  return (
    <SettingsSideNavModal
      title="Prompt tracking settings"
      navItems={PT_SETTINGS_NAV}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onClose={onClose}
      onApply={() => onApply?.({ engines: selectedEngines, schedule })}
      onReset={resetToDefaults}
      applyDisabled={selectedEngines.size === 0}
    >
      {renderContent()}
    </SettingsSideNavModal>
  )
}
