import { useMemo } from 'react'
import { Check, Globe, Info, LayoutList, MapPin, Sparkles } from '../../icons/index.js'
import HLButton from '../HLButton.jsx'

const PRIORITY_DOT = {
  error: 'bg-error-600',
  warning: 'bg-warning-250',
  notice: 'bg-primary-600',
}

function getSourceMeta(item) {
  if (item.source === 'gbp') return { label: 'GBP', Icon: MapPin }
  if (item.source === 'listings' || item.source === 'listing') return { label: 'Listing', Icon: MapPin }
  return { label: 'Website SEO', Icon: Globe }
}

function getPagesLabel(item) {
  if (item.affectedPages === 'site-wide') return 'Site-wide'
  if (item.affectedPages != null) {
    return `${item.affectedPages} page${item.affectedPages === 1 ? '' : 's'}`
  }
  return null
}

function getTotalPages(items) {
  return items.reduce((sum, item) => {
    if (typeof item.affectedPages === 'number') return sum + item.affectedPages
    return sum
  }, 0)
}

function PreviewRow({ item }) {
  const { label: sourceLabel, Icon: SourceIcon } = getSourceMeta(item)
  const pagesLabel = getPagesLabel(item)

  return (
    <div
      className={`flex items-center gap-2.5 px-3.5 py-2.5 border rounded-xl bg-white ${
        item.priority === 'warning' ? 'border-l-[3px] border-l-warning-250 border-gray-200' : 'border-gray-200'
      }`}
    >
      <span className={`w-[7px] h-[7px] rounded-full shrink-0 ${PRIORITY_DOT[item.priority]}`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-gray-900 leading-snug m-0 mb-1">{item.title}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 border border-gray-200 rounded-full px-1.5 py-0.5 bg-gray-50">
            <SourceIcon size={11} />
            {sourceLabel}
          </span>
          {(item.tags ?? []).map(tag => (
            <span
              key={tag}
              className="inline-flex items-center text-[11px] text-gray-600 border border-gray-200 rounded-full px-1.5 py-0.5 bg-gray-50"
            >
              {tag}
            </span>
          ))}
          {item.autofix && (
            <span className="inline-flex items-center gap-1 text-[11px] text-purple-700 border border-purple-200 rounded-full px-1.5 py-0.5 bg-purple-50">
              <Sparkles size={11} />
              Auto-fix
            </span>
          )}
        </div>
      </div>
      {pagesLabel && <span className="text-[11px] text-gray-500 shrink-0">{pagesLabel}</span>}
    </div>
  )
}

/** Preview selected fixes before implementation — header, list, info banner, and proceed CTA */
export default function ImplementPreviewCard({
  items = [],
  onProceed,
  proceedDisabled = false,
}) {
  const totalPages = useMemo(() => getTotalPages(items), [items])
  const hasSiteWide = items.some(i => i.affectedPages === 'site-wide')

  const deploySummary = totalPages > 0
    ? `Changes will be pushed via Cloudflare Workers to ${totalPages} page${totalPages === 1 ? '' : 's'} total.`
    : hasSiteWide
      ? 'Changes will be pushed via Cloudflare Workers site-wide.'
      : 'Changes will be pushed via Cloudflare Workers to your site.'

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[14px] text-gray-700 leading-relaxed m-0">
        Everything&apos;s set. Here&apos;s a preview of the fixes that will be applied:
      </p>

      <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
          <LayoutList size={16} className="text-gray-700 shrink-0" strokeWidth={2} />
          <p className="text-[14px] font-semibold text-gray-900 m-0">
            Preview — {items.length} fix{items.length === 1 ? '' : 'es'} to implement
          </p>
        </div>

        <div className="px-4 py-3 flex flex-col gap-2 bg-gray-50">
          {items.map(item => (
            <PreviewRow key={item.id} item={item} />
          ))}
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-start gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2.5">
            <Info size={16} className="text-primary-600 shrink-0 mt-0.5" />
            <p className="text-[13px] text-primary-700 leading-relaxed m-0">{deploySummary}</p>
          </div>
        </div>

        <div className="px-4 pb-4 flex justify-end">
          <HLButton
            id="implement-preview-proceed"
            variant="primary"
            color="blue"
            size="sm"
            disabled={proceedDisabled || !onProceed}
            onClick={onProceed}
            className="inline-flex items-center gap-2 w-fit"
          >
            <Check size={16} strokeWidth={2.5} />
            Proceed to implement
          </HLButton>
        </div>
      </div>
    </div>
  )
}
