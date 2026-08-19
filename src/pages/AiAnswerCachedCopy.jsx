import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { ExternalLink } from '../icons/index.js'
import EngineLogo from '../components/EngineLogo.jsx'
import CompanyLogo from '../components/CompanyLogo.jsx'
import { normalizeEngineName } from '../components/FullResponseModal.jsx'

// HARDCODED: prompt pool mirrored from Source Inventory detail rows (prototyping).
const PROMPT_POOL = [
  'What is the best CRM for agencies in 2026?',
  'GoHighLevel vs HubSpot for marketing automation',
  'Best AI visibility tools for local businesses',
  'How do AI citations work for SaaS brands?',
  'Which platform ranks best in ChatGPT for CRM?',
]

const ENGINES = ['ChatGPT', 'Google AI Overview', 'Perplexity']

// HARDCODED: domain lookup for common source ids (prototyping).
const SOURCE_META = {
  gohighlevel: { domain: 'gohighlevel.com', title: 'gohighlevel.com', url: 'https://gohighlevel.com' },
  g2: { domain: 'g2.com', title: 'g2.com', url: 'https://www.g2.com' },
  reddit: { domain: 'reddit.com', title: 'reddit.com', url: 'https://www.reddit.com' },
  capterra: { domain: 'capterra.com', title: 'capterra.com', url: 'https://www.capterra.com' },
  'ghl-pricing': {
    domain: 'gohighlevel.com',
    title: 'GoHighLevel Pricing & AI Visibility Plans',
    url: 'https://gohighlevel.com/pricing',
  },
  'ghl-compare': {
    domain: 'gohighlevel.com',
    title: 'GoHighLevel vs Traditional AI Rank Tracking Tools',
    url: 'https://gohighlevel.com/compare/ai-rank-tracking',
  },
  'g2-crm': {
    domain: 'g2.com',
    title: 'Best CRM & Marketing Automation Platforms for Agencies',
    url: 'https://www.g2.com/categories/marketing-automation',
  },
}

const DEFAULT_PAYLOAD = {
  id: 'demo',
  prompt: PROMPT_POOL[0],
  engine: 'ChatGPT',
  date: 'Jul 28, 2026',
  sourceDomain: 'gohighlevel.com',
  sourceTitle: 'GoHighLevel Pricing & AI Visibility Plans',
  sourceUrl: 'https://gohighlevel.com/pricing',
}

function formatCacheDate(daysAgo) {
  const d = new Date(2026, 6, 28)
  d.setDate(d.getDate() - daysAgo)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * HARDCODED: build a cached-answer payload from a route id (prototyping).
 * Ids follow `{sourceKey}-{index}` from Source Inventory detail rows.
 */
function payloadFromCacheId(id) {
  if (!id || id === 'demo') return DEFAULT_PAYLOAD

  const lastDash = id.lastIndexOf('-')
  const indexPart = lastDash >= 0 ? id.slice(lastDash + 1) : ''
  const sourceKey = lastDash >= 0 && /^\d+$/.test(indexPart) ? id.slice(0, lastDash) : id
  const index = /^\d+$/.test(indexPart) ? Number(indexPart) : 0
  const meta = SOURCE_META[sourceKey]

  return {
    id,
    prompt: PROMPT_POOL[index % PROMPT_POOL.length],
    engine: ENGINES[index % ENGINES.length],
    date: formatCacheDate(index % 14),
    sourceDomain: meta?.domain || sourceKey.replace(/-/g, '.') || DEFAULT_PAYLOAD.sourceDomain,
    sourceTitle: meta?.title || meta?.domain || sourceKey,
    sourceUrl: meta?.url || `https://${meta?.domain || 'gohighlevel.com'}`,
  }
}

function buildAnswerBody(prompt, engine) {
  return {
    headline: 'Direct answer',
    intro: `Based on current AI answers for “${prompt}”, ${engine} frames the category around workflow depth, adoption speed, and citation quality rather than naming a single winner.`,
    bullets: [
      'GoHighLevel is described with stronger end-to-end execution coverage for agencies.',
      'HubSpot is positioned as easier to adopt quickly for teams that want a lighter CRM setup.',
      'Third-party review sites still appear often when the answer emphasises comparisons or pricing.',
    ],
    closing: 'Strengthen owned comparison pages and citation-ready proof so answer engines cite your site instead of third-party summaries.',
  }
}

function buildReferencedSources(payload) {
  const primaryDomain = payload.sourceDomain.replace(/^www\./, '')
  // HARDCODED: referenced source cards for the archive sidebar (prototyping).
  return [
    {
      domain: primaryDomain,
      pages: [
        { label: payload.sourceTitle, url: payload.sourceUrl },
        { label: `${primaryDomain}/blog`, url: `https://${primaryDomain}/blog` },
      ],
    },
    {
      domain: primaryDomain.includes('gohighlevel') ? 'g2.com' : 'gohighlevel.com',
      pages: [
        {
          label: primaryDomain.includes('gohighlevel')
            ? 'Best CRM & Marketing Automation Platforms'
            : 'GoHighLevel Pricing & AI Visibility Plans',
          url: primaryDomain.includes('gohighlevel')
            ? 'https://www.g2.com/categories/marketing-automation'
            : 'https://gohighlevel.com/pricing',
        },
      ],
    },
  ]
}

export default function AiAnswerCachedCopy() {
  const { id } = useParams()
  const payload = useMemo(() => payloadFromCacheId(id), [id])
  const answer = useMemo(
    () => buildAnswerBody(payload.prompt, normalizeEngineName(payload.engine)),
    [payload],
  )
  const sources = useMemo(() => buildReferencedSources(payload), [payload])
  const engineKey = normalizeEngineName(payload.engine)

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_300px] min-h-screen">
        {/* Left — metadata */}
        <aside className="border-b lg:border-b-0 lg:border-r border-gray-800 p-6 lg:p-8 flex flex-col gap-6 bg-gray-950/60">
          <div>
            <p className="text-[12px] font-medium text-gray-500 m-0 mb-2">AI answer archive</p>
            <h1 className="text-[18px] font-semibold text-white m-0 leading-snug">
              AI answer cache copy
            </h1>
          </div>

          <dl className="flex flex-col gap-5 m-0">
            <div>
              <dt className="text-[12px] font-medium text-gray-500 m-0 mb-1.5">Prompt</dt>
              <dd className="text-[13px] text-gray-200 m-0 leading-relaxed">{payload.prompt}</dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium text-gray-500 m-0 mb-1.5">AI engine</dt>
              <dd className="m-0 flex items-center gap-2">
                <EngineLogo name={engineKey} size={18} />
                <span className="text-[13px] text-gray-200">{payload.engine}</span>
              </dd>
            </div>
            <div>
              <dt className="text-[12px] font-medium text-gray-500 m-0 mb-1.5">Date of request</dt>
              <dd className="text-[13px] text-gray-200 m-0">{payload.date}</dd>
            </div>
          </dl>
        </aside>

        {/* Center — cached response */}
        <main className="p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800 border border-gray-700 mb-6 max-w-full">
              <span className="text-[12px] text-gray-300 truncate">{payload.prompt}</span>
            </div>

            <article className="rounded-xl border border-gray-800 bg-gray-950/80 p-6 lg:p-8">
              <h2 className="text-[16px] font-semibold text-white m-0 mb-3">{answer.headline}</h2>
              <p className="text-[14px] text-gray-300 leading-relaxed m-0 mb-5">{answer.intro}</p>
              <ul className="m-0 mb-5 pl-5 flex flex-col gap-2">
                {answer.bullets.map(item => (
                  <li key={item} className="text-[14px] text-gray-300 leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-[14px] text-gray-300 leading-relaxed m-0 mb-6">{answer.closing}</p>
              <p className="text-[12px] text-gray-500 m-0 border-t border-gray-800 pt-4">
                Demo data for prototyping. This is a read-only cached copy of an AI answer, not a live response.
              </p>
            </article>
          </div>
        </main>

        {/* Right — referenced sources */}
        <aside className="border-t lg:border-t-0 lg:border-l border-gray-800 p-6 lg:p-8 bg-gray-950/40">
          <h2 className="text-[14px] font-semibold text-white m-0 mb-4">Referenced sources</h2>
          <div className="flex flex-col gap-3">
            {sources.map(group => (
              <div
                key={group.domain}
                className="rounded-lg border border-gray-800 bg-gray-900/80 p-3.5"
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <CompanyLogo
                    domain={group.domain}
                    size={24}
                    fallback={
                      <div className="w-6 h-6 rounded bg-gray-800 flex items-center justify-center text-[10px] text-gray-500">
                        {group.domain.slice(0, 1).toUpperCase()}
                      </div>
                    }
                  />
                  <span className="text-[13px] font-medium text-gray-200 truncate">{group.domain}</span>
                </div>
                <ul className="m-0 p-0 list-none flex flex-col gap-1.5">
                  {group.pages.map(page => (
                    <li key={page.url}>
                      <a
                        href={page.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-1.5 text-[12px] text-primary-400 hover:text-primary-300 hover:underline"
                      >
                        <span className="line-clamp-2 flex-1 min-w-0">{page.label}</span>
                        <ExternalLink size={11} className="shrink-0 mt-0.5 opacity-60 group-hover:opacity-100" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
