import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link2, X } from '../icons/index.js'
import CompanyLogo from './CompanyLogo.jsx'
import EngineLogo from './EngineLogo.jsx'

/** Canonical parent-table header classes — use everywhere for top-level `<th>`. */
export const TABLE_TH_CLASS = 'text-[14px] font-semibold text-gray-900'

// HARDCODED: per-engine visual theme for the response viewer (prototyping).
const ENGINE_THEME = {
  'ChatGPT':     { accent: '#10A37F', surface: '#FFFFFF', bubble: '#F4F4F5', vendor: 'OpenAI',        wordmark: 'ChatGPT' },
  'Perplexity':  { accent: '#20808D', surface: '#FCFCFB', bubble: '#ECF3F3', vendor: 'Perplexity',    wordmark: 'Perplexity' },
  'Claude':      { accent: '#C96442', surface: '#F6F2EC', bubble: '#EEE6D9', vendor: 'Anthropic',     wordmark: 'Claude' },
  'Gemini':      { accent: '#4285F4', surface: '#FFFFFF', bubble: '#E8F0FE', vendor: 'Google',        wordmark: 'Gemini' },
  'AI Mode':     { accent: '#9168C0', surface: '#FFFFFF', bubble: '#F1E9F9', vendor: 'Google Search', wordmark: 'AI Mode' },
  'AI Overview': { accent: '#4285F4', surface: '#FFFFFF', bubble: '#E8F0FE', vendor: 'Google Search', wordmark: 'AI Overview' },
  'Google AI Overview': { accent: '#4285F4', surface: '#FFFFFF', bubble: '#E8F0FE', vendor: 'Google Search', wordmark: 'AI Overview' },
}

/** Map inventory / filter engine labels onto EngineLogo + theme keys. */
export function normalizeEngineName(engine) {
  if (engine === 'Google AI Overview') return 'AI Overview'
  return engine
}

function buildAnswerSections(response) {
  const [primary = 'GoHighLevel', second = 'HubSpot', third = 'Calendly'] = response.brands || []
  return [
    { h: 'Direct answer', body: `${primary} is competitive for this prompt, but the answer frames the category through comparison rather than naming a single winner.` },
    { h: 'What stands out', bullets: [
      `${primary} is described with stronger workflow depth and broader execution coverage.`,
      `${second} is positioned as the option that is easier to adopt quickly.`,
      `${third} appears when the answer emphasises price or simplicity.`,
    ] },
    { h: 'How to improve this prompt', bullets: [
      'Strengthen proof pages that compare implementation depth, AI visibility reporting, and citation quality.',
      'Publish clearer comparison content so answer engines cite owned pages instead of third-party summaries.',
    ] },
  ]
}

const BRAND_SENTIMENT = ['Positive', 'Neutral', 'Positive', 'Neutral']

const BRAND_DOMAIN_MAP = {
  'GoHighLevel': 'gohighlevel.com',
  'HubSpot': 'hubspot.com',
  'Calendly': 'calendly.com',
  'Pipedrive': 'pipedrive.com',
  'Salesforce': 'salesforce.com',
  'ActiveCampaign': 'activecampaign.com',
  'ClickFunnels': 'clickfunnels.com',
  'Klaviyo': 'klaviyo.com',
  'Keap': 'keap.com',
}

function brandDomain(name) {
  return BRAND_DOMAIN_MAP[name] || `${name.replace(/[\s.]+/g, '').toLowerCase()}.com`
}

// HARDCODED: cited sources shown in the viewer sidebar (prototyping).
const DEFAULT_SOURCES = [
  { url: 'https://www.capterra.com/p/209198/GoHighLevel/', domain: 'capterra.com', coverage: '19%', brandMentioned: true, otherBrands: true },
  { url: 'https://gohighlevel.com/pricing', domain: 'gohighlevel.com', coverage: '25%', brandMentioned: true, otherBrands: false },
]

/**
 * Build a FullResponseModal `response` payload from a source-inventory detail row.
 * HARDCODED brands/sources for prototyping — replace with API data in production.
 */
export function responseFromDetailRow(row, sourceDomain) {
  const engine = normalizeEngineName(row.engine)
  const brands = sourceDomain?.includes('gohighlevel')
    ? ['GoHighLevel']
    : ['GoHighLevel', 'HubSpot']
  return {
    engine,
    created: row.date,
    brands,
    sources: brands.length > 1 ? 2 : 1,
    text: `Direct answer for “${row.prompt}” from ${engine}.`,
  }
}

/**
 * Engine-themed full-response viewer.
 * @param {{ engine: string, created: string, brands: string[], sources: number }} response
 */
export default function FullResponseModal({ response, promptText, onClose, sourceHint }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const engineKey = normalizeEngineName(response.engine)
  const theme = ENGINE_THEME[response.engine] || ENGINE_THEME[engineKey] || ENGINE_THEME.ChatGPT
  const sections = buildAnswerSections(response)
  const sources = DEFAULT_SOURCES.slice(0, Math.max(1, response.sources || 1))
  if (sourceHint && sources[0]) {
    sources[0] = {
      ...sources[0],
      domain: sourceHint.replace(/^www\./, ''),
      url: sourceHint.startsWith('http') ? sourceHint : `https://${sourceHint}`,
    }
  }
  const isPerplexity = engineKey === 'Perplexity'
  const isClaude = engineKey === 'Claude'
  const headingCls = 'text-gray-900'
  const bodyCls = 'text-gray-700'
  const mutedCls = 'text-gray-500'
  const logoName = engineKey

  const kpis = [
    { label: 'Avg position', value: '#4.2', desc: 'Brand URL position in the answer.' },
    { label: 'URLs in answer', value: String(sources.length + 3), desc: 'Total cited source URLs in this response.' },
    { label: 'Brand mentions', value: String(response.brands.length), desc: 'Detected brands in this response.' },
    { label: 'Answer length', value: '696 chars', desc: 'Character count from the answer text.' },
  ]

  const AnswerBody = (
    <div className="flex flex-col gap-4">
      {sections.map(sec => (
        <div key={sec.h}>
          <p className={`text-[13px] font-semibold m-0 mb-1.5 ${headingCls}`}>{sec.h}</p>
          {sec.body && <p className={`text-[14px] leading-relaxed m-0 ${bodyCls}`}>{sec.body}</p>}
          {sec.bullets && (
            <ul className="m-0 mt-0.5 pl-0 flex flex-col gap-1.5 list-none">
              {sec.bullets.map((b, i) => (
                <li key={i} className={`flex items-start gap-2 text-[14px] leading-relaxed ${bodyCls}`}>
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0" style={{ background: theme.accent }} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-[95vw] max-w-[1040px] max-h-[92vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ background: theme.surface }}
        onClick={e => e.stopPropagation()}
      >
        <div className="shrink-0 flex items-center justify-between px-5 py-3 bg-white/70 backdrop-blur border-b" style={{ borderColor: `color-mix(in srgb, ${theme.accent} 18%, #EAECF0)` }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <EngineLogo name={logoName} size={18} className="w-8 h-8" />
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-gray-900 m-0 leading-tight">{theme.wordmark}</p>
              <p className="text-[12px] text-gray-500 m-0 leading-tight">{response.created}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="shrink-0 px-6 pt-4 pb-3 bg-white/40 border-b border-gray-100">
          <h2 className="text-[18px] font-semibold text-gray-900 leading-snug m-0">{promptText}</h2>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid gap-5 p-6 items-stretch" style={{ gridTemplateColumns: 'minmax(0, 1fr) 300px' }}>
            <div
              className="min-w-0 flex flex-col gap-4 rounded-2xl border p-5 h-full"
              style={{ background: '#FFFFFF', borderColor: '#E5E7EB' }}
            >
              <div className="flex justify-end">
                <div
                  className="max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-[14px] leading-relaxed text-gray-800"
                  style={{ background: theme.bubble }}
                >
                  {promptText}
                </div>
              </div>

              <div className="flex gap-3">
                <EngineLogo name={logoName} size={16} className="w-8 h-8 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className={`text-[13px] font-semibold m-0 mb-2 ${headingCls}`}>{theme.wordmark}</p>

                  {isPerplexity && (
                    <div className="mb-3">
                      <p className="text-[12px] font-medium text-gray-500 m-0 mb-1.5 flex items-center gap-1.5">
                        <Link2 size={12} /> Sources
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {sources.map((s, i) => (
                          <a key={i} href={s.url} onClick={e => e.preventDefault()} className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 hover:border-gray-300 transition-colors">
                            <p className="text-[14px] font-medium text-gray-900 truncate m-0">{s.domain}</p>
                            <p className="text-[12px] text-gray-500 truncate m-0 mt-0.5">{i + 1} · {s.coverage} coverage</p>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {isClaude ? (
                    <div className="rounded-xl border p-4" style={{ background: '#FBF9F4', borderColor: '#E7DECF' }}>
                      {AnswerBody}
                    </div>
                  ) : AnswerBody}

                  <p className={`text-[12px] mt-3 m-0 ${mutedCls}`}>Signals in this response lean on {sources[0]?.domain || 'cited sources'}.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 min-w-0 h-full">
              <div className="rounded-xl border border-gray-200 bg-white p-3.5 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2.5 shrink-0">
                  <p className="text-[13px] font-semibold text-gray-900 m-0">Brands</p>
                  <span className="text-[12px] font-medium text-primary-600">{response.brands.length}</span>
                </div>
                <div className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto">
                  {response.brands.map((b, i) => {
                    const you = b === 'GoHighLevel'
                    const sentiment = BRAND_SENTIMENT[i % BRAND_SENTIMENT.length]
                    return (
                      <div key={b} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors">
                        <CompanyLogo
                          domain={brandDomain(b)}
                          size={28}
                          rounded="rounded-full"
                          fallback={
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-[12px] font-semibold text-gray-600 shrink-0">
                              {b.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-gray-900 truncate m-0">{b}</p>
                          <p className="text-[12px] text-gray-500 m-0">#{i + 1}.0 · {sentiment}</p>
                        </div>
                        {you && <span className="text-[13px] font-medium text-primary-600 bg-primary-50 rounded-full px-2 py-0.5 shrink-0">You</span>}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-3.5 flex-1 flex flex-col min-h-0">
                <p className="text-[13px] font-semibold text-gray-900 m-0 mb-0.5 shrink-0">Sources</p>
                <p className="text-[12px] text-gray-500 m-0 mb-2.5 shrink-0">Prompt-scoped cited URLs from this answer.</p>
                <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto">
                  {sources.map((s, i) => (
                    <div key={i} className="rounded-lg border border-gray-200 p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] font-medium text-gray-900 leading-snug m-0">{s.domain}</p>
                        <span className="text-[12px] font-medium text-primary-600 shrink-0">#{i + 1}</span>
                      </div>
                      <p className="text-[12px] text-gray-500 truncate m-0 mt-0.5">{s.url.replace(/^https?:\/\//, '')}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className={`text-[13px] font-medium rounded-full px-2 py-0.5 ${s.brandMentioned ? 'bg-success-50 text-success-600' : 'bg-gray-100 text-gray-500'}`}>
                          {s.brandMentioned ? 'Brand mentioned' : 'Brand not mentioned'}
                        </span>
                        {s.otherBrands && <span className="text-[13px] font-medium rounded-full px-2 py-0.5 bg-warning-100 text-warning-600">Competitor present</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {kpis.map(k => (
                <div key={k.label} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5">
                  <p className="text-[12px] font-medium text-gray-500 m-0">{k.label}</p>
                  <p className="text-[18px] font-bold text-gray-900 m-0 mt-0.5">{k.value}</p>
                  <p className="text-[12px] text-gray-500 m-0 mt-0.5 leading-snug">{k.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
