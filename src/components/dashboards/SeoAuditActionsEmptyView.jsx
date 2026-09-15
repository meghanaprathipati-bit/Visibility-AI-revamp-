import { useState } from 'react'
import { CheckSquare, Clock } from '../../icons/index.js'
import SectionInfoTip from '../SectionInfoTip.jsx'

const MUTED = 'text-[13px] font-normal text-gray-500 m-0 mt-0.5'
const CARD = 'border border-gray-200 rounded-lg bg-white'

// HARDCODED: empty SEO audit actions prototype — replace with action-items API.
const ACTION_CATEGORIES = [
  { id: 'security', title: 'Security & SSL', count: 0, description: 'Fix HTTPS, mixed content, and certificate issues that weaken trust and crawl confidence.' },
  { id: 'crawlability', title: 'Crawlability & indexing', count: 0, description: 'Remove barriers that prevent search engines from finding, understanding, or indexing your important pages.' },
  { id: 'redirects', title: 'Redirects', count: 0, description: 'Clean up redirect chains, loops, and broken destination URLs.' },
  { id: 'sitemap', title: 'Sitemap health', count: 0, description: 'Keep the XML sitemap accurate so crawlers discover the right pages.' },
  { id: 'meta', title: 'Meta tags & descriptions', count: 0, description: 'Improve titles and descriptions so pages are easier to understand in search.' },
  { id: 'content', title: 'Content & structure', count: 0, description: 'Strengthen headings, body copy, and page structure for clearer indexing.' },
  { id: 'speed', title: 'Speed & performance', count: 0, description: 'Address loading issues that affect crawl efficiency and visitor experience.' },
  { id: 'linking', title: 'External linking', count: 0, description: 'Review outbound links, destination health, and follow signals.' },
  { id: 'images', title: 'Images & media', count: 0, description: 'Fix missing alt text and other media issues that limit accessibility and SEO.' },
  { id: 'css', title: 'CSS resources', count: 0, description: 'Resolve stylesheet errors that block rendering or wasted crawl budget.' },
  { id: 'js', title: 'JavaScript resources', count: 0, description: 'Fix script errors that prevent content from being rendered for crawlers.' },
  { id: 'hreflang', title: 'Localization & hreflang', count: 0, description: 'Align language and region signals so the right pages are served internationally.' },
]

export default function SeoAuditActionsEmptyView() {
  const [categoryId, setCategoryId] = useState('crawlability')
  const category = ACTION_CATEGORIES.find(c => c.id === categoryId) ?? ACTION_CATEGORIES[1]

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
                  id="seo-audit-actions-empty-info"
                  content="Review and resolve prioritized actions from your website's SEO audit."
                />
              </div>
              <p className="text-[13px] text-gray-500 m-0 mt-0.5">
                Review and resolve prioritized actions from your website's SEO audit.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 bg-gray-50 text-[14px] font-medium text-gray-400 shrink-0">
            <Clock size={14} />
            Next scan Oct 1
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden px-5 pt-5 pb-5 flex flex-col gap-4">
        <div className="grid gap-4 items-stretch flex-1 min-h-0" style={{ gridTemplateColumns: 'minmax(220px, 260px) minmax(0, 1fr)' }}>
          <div className={`${CARD} p-3 min-h-0 flex flex-col overflow-hidden`}>
            <p className="text-[13px] font-medium text-gray-500 m-0 px-2 py-1.5 shrink-0">Choose a category</p>
            <div className="flex flex-col gap-0.5 mt-1 overflow-y-auto min-h-0 pr-0.5">
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

          <div className={`${CARD} min-h-0 flex flex-col overflow-hidden`}>
            <div className="px-5 py-4 border-b border-gray-100 shrink-0">
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
