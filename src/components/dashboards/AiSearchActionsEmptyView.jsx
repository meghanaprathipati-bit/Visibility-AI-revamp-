import { useState } from 'react'
import { AlertTriangle, CheckSquare, Clock, Code2, FileText, Megaphone } from '../../icons/index.js'
import HLTabs, { HLTabPane } from '../HLTabs.jsx'
import SectionInfoTip from '../SectionInfoTip.jsx'

const MUTED = 'text-[13px] font-normal text-gray-500 m-0 mt-0.5'
const CARD = 'border border-gray-200 rounded-lg bg-white'

// HARDCODED: empty AI Search actions prototype — replace with action-items API.
const ACTION_TABS = ['Needs attention', 'Resolved', 'Dismissed']

const ACTION_CATEGORIES = [
  {
    id: 'boost',
    title: 'Boost content visibility',
    count: 0,
    description: 'Create or improve owned content around measured prompt gaps.',
    Icon: FileText,
  },
  {
    id: 'technical',
    title: 'Technical items',
    count: 0,
    description: 'Schema, robots.txt, llms.txt, and crawl access issues.',
    Icon: Code2,
  },
  {
    id: 'mentions',
    title: 'Get external mentions',
    count: 0,
    description: 'Earn mentions and citations from third-party sources.',
    Icon: Megaphone,
  },
]

export default function AiSearchActionsEmptyView() {
  const [tab, setTab] = useState('Needs attention')
  const [categoryId, setCategoryId] = useState('boost')
  const category = ACTION_CATEGORIES.find(c => c.id === categoryId) ?? ACTION_CATEGORIES[0]

  return (
    <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 shrink-0">
        <div className="px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
              <CheckSquare size={20} className="text-primary-600" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-[18px] font-bold text-gray-900 m-0">Actions</h1>
                <SectionInfoTip
                  id="ai-search-actions-empty-info"
                  content="Review and resolve prioritized actions to improve your AI search visibility."
                />
              </div>
              <p className="text-[13px] text-gray-500 m-0 mt-0.5">
                Review and resolve prioritized actions to improve your AI search visibility.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[14px] font-medium text-gray-400 shrink-0">
            <Clock size={14} />
            Updates in 14h 54m
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-5 pb-5 flex flex-col gap-4" style={{ scrollbarGutter: 'stable' }}>
        <div className={`${CARD} px-5 py-4 flex items-start justify-between gap-4 flex-wrap`}>
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-error-50 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-error-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-gray-500 m-0">Needs attention</p>
              <h2 className="text-[16px] font-semibold text-gray-900 m-0 mt-0.5">0 items need attention</h2>
              <p className={`${MUTED} max-w-[640px]`}>
                No action items are available right now. Check back after the next completed AI search scan for new recommendations.
              </p>
            </div>
          </div>
          <HLTabs
            type="segment"
            size="sm"
            theme="gray"
            compact
            value={tab}
            onValueChange={setTab}
            tabsOnly
          >
            {ACTION_TABS.map(name => (
              <HLTabPane key={name} name={name} tab={name} />
            ))}
          </HLTabs>
        </div>

        <div className="grid gap-4 items-stretch flex-1 min-h-0" style={{ gridTemplateColumns: 'minmax(220px, 260px) minmax(0, 1fr)' }}>
          <div className={`${CARD} p-3`}>
            <p className="text-[13px] font-medium text-gray-500 m-0 px-2 py-1.5">Choose a category</p>
            <div className="flex flex-col gap-0.5 mt-1">
              {ACTION_CATEGORIES.map(item => {
                const active = item.id === categoryId
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategoryId(item.id)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      active ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`text-[14px] font-medium ${active ? 'text-primary-700' : 'text-gray-700'}`}>
                      {item.title}
                    </span>
                    <span className={`text-[14px] tabular-nums ${active ? 'text-primary-600' : 'text-gray-400'}`}>
                      {item.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className={`${CARD} min-h-[280px] flex flex-col overflow-hidden`}>
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-[14px] font-semibold text-gray-900 m-0">{category.title}</h3>
              <p className={MUTED}>{category.description}</p>
            </div>
            <div className="flex-1 flex items-center justify-center px-5 py-10">
              <p className="text-[14px] font-normal text-gray-500 m-0">No item available to review.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
