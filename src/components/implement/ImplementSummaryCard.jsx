import { useEffect, useState } from 'react'
import {
  ArrowUp,
  Check,
  CircleCheck,
  Info,
  RefreshCw,
  X,
} from '../../icons/index.js'
import HLButton from '../HLButton.jsx'

const RETRY_STEP_MS = 450
const MAX_FAILED_CASES = 3

function ScoreRing({ score, max = 100, tone = 'success' }) {
  const radius = 30
  const circumference = 2 * Math.PI * radius
  const percent = Math.round((score / max) * 100)
  const offset = circumference - (percent / 100) * circumference
  const stroke = tone === 'success' ? 'var(--success-600)' : 'var(--warning-600)'

  return (
    <div className="relative shrink-0" style={{ width: 76, height: 76 }}>
      <svg width="76" height="76" viewBox="0 0 76 76" className="-rotate-90" aria-hidden="true">
        <circle cx="38" cy="38" r={radius} fill="none" stroke="var(--gray-200)" strokeWidth="6" />
        <circle
          cx="38"
          cy="38"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        <span className="text-[18px] font-semibold text-gray-900">{score}</span>
        <span className="text-[10px] text-gray-500 mt-0.5">/ {max}</span>
      </span>
    </div>
  )
}

function ProgressRing({ percent }) {
  const radius = 30
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="relative shrink-0" style={{ width: 76, height: 76 }}>
      <svg width="76" height="76" viewBox="0 0 76 76" className="-rotate-90" aria-hidden="true">
        <circle cx="38" cy="38" r={radius} fill="none" stroke="var(--gray-200)" strokeWidth="6" />
        <circle
          cx="38"
          cy="38"
          r={radius}
          fill="none"
          stroke="var(--warning-600)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[14px] font-semibold text-gray-900">
        {percent}%
      </span>
    </div>
  )
}

function SummaryRowIcon({ variant }) {
  if (variant === 'applied') {
    return (
      <span
        className="shrink-0 w-4 h-4 rounded bg-success-50 inline-flex items-center justify-center"
        aria-hidden="true"
      >
        <Check size={10} className="text-success-600" strokeWidth={2.5} />
      </span>
    )
  }

  return (
    <span
      className="shrink-0 w-4 h-4 rounded bg-error-50 inline-flex items-center justify-center"
      aria-hidden="true"
    >
      <span className="w-[10px] h-[10px] rounded-full border border-error-600 flex items-center justify-center">
        <X size={6} className="text-error-600" strokeWidth={3} />
      </span>
    </span>
  )
}

function AppliedRow({ item }) {
  return (
    <div className="flex gap-2 py-2.5 border-b border-gray-200 last:border-b-0">
      <div className="shrink-0 flex items-center h-[18px]">
        <SummaryRowIcon variant="applied" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-gray-700 leading-snug m-0">{item.title}</p>
        {item.impactValue && (
          <p className="text-[11px] text-success-700 m-0 mt-0.5">{item.impactValue}</p>
        )}
      </div>
      {item.pagesLabel && (
        <span className="text-[11px] text-gray-500 shrink-0 self-center">{item.pagesLabel}</span>
      )}
    </div>
  )
}

function getFailedPageCount(item) {
  if (item.failedPageCount != null) return item.failedPageCount
  if (item.failedPages?.length) return item.failedPages.length
  if (typeof item.affectedPages === 'number') return item.affectedPages
  if (item.affectedPages === 'site-wide') return 1
  return 1
}

function FailedPagesList({ pages }) {
  if (!pages?.length) return null

  return (
    <ul className="mt-2 flex flex-col gap-1 list-none p-0 m-0">
      {pages.map(page => (
        <li key={page} className="text-[11px] text-error-600 truncate">
          {page}
        </li>
      ))}
    </ul>
  )
}

function FailedRetryButton({ id, onClick, disabled, className = '', children }) {
  return (
    <HLButton
      id={id}
      color="red"
      variant="secondary"
      size="sm"
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      <span className="inline-flex items-center gap-1">
        <RefreshCw size={12} />
        {children}
      </span>
    </HLButton>
  )
}

function FailedRow({ item, isRetrying, retryProgress, onRetry, retryDisabled }) {
  const [open, setOpen] = useState(false)
  const failedPages = item.failedPages ?? []
  const pageCount = getFailedPageCount(item)
  const pagesLabel = pageCount === 1 ? '1 page' : `${pageCount} pages`

  useEffect(() => {
    if (isRetrying) setOpen(true)
  }, [isRetrying])

  function handleRetryClick(event) {
    event.stopPropagation()
    onRetry?.(item.id)
  }

  return (
    <div className="group border-b border-gray-200 last:border-b-0">
      <div className="flex items-start gap-2 py-2.5">
        <button
          type="button"
          onClick={() => setOpen(value => !value)}
          aria-expanded={open}
          className="flex flex-1 min-w-0 items-start gap-2 text-left bg-transparent border-0 cursor-pointer p-0"
        >
          <div className="shrink-0 flex items-center h-[18px] pt-0.5">
            <SummaryRowIcon variant="failed" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-error-600 leading-snug m-0">{item.title}</p>
            <p className="text-[12px] text-error-600 leading-snug m-0 mt-0.5 opacity-90">
              {item.failureReason}
              {' · '}
              {pagesLabel}
            </p>
          </div>
        </button>

        {isRetrying ? (
          <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-gray-200 bg-white text-[12px] font-medium text-error-600 whitespace-nowrap">
            <RefreshCw size={12} className="animate-spin" />
            Retrying API…
          </span>
        ) : (
          <FailedRetryButton
            id={`failed-retry-${item.id}`}
            onClick={handleRetryClick}
            disabled={retryDisabled}
            className="shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100"
          >
            Retry
          </FailedRetryButton>
        )}
      </div>

      {open && (
        <div className="pb-2.5 pl-6">
          <FailedPagesList pages={failedPages} />
          {isRetrying && (
            <div className="mt-2.5 h-1.5 rounded-full bg-error-100 overflow-hidden">
              <div
                className="h-full bg-error-600 rounded-full transition-all duration-300"
                style={{ width: `${retryProgress}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FailedSectionFooter({ failedCount, onRetryAll, retryDisabled }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-3 border-t border-gray-200">
      <p className="text-[12px] text-error-600 leading-snug m-0">
        {failedCount} fix{failedCount === 1 ? '' : 'es'} failed — resolve permission issues or retry all.
      </p>
      <FailedRetryButton
        id="failed-retry-all"
        onClick={onRetryAll}
        disabled={retryDisabled}
      >
        Retry all {failedCount}
      </FailedRetryButton>
    </div>
  )
}

function SectionLabel({ children, tone = 'default' }) {
  const toneClass = tone === 'error' ? 'text-error-600' : 'text-gray-500'
  return (
    <p className={`text-[11px] font-medium ${toneClass} m-0 mb-1`}>
      {children}
    </p>
  )
}

function sumAffectedPages(items) {
  return items.reduce((total, item) => {
    if (item.affectedPages === 'site-wide') return total + 1
    if (typeof item.affectedPages === 'number') return total + item.affectedPages
    return total + 1
  }, 0)
}

function AutofixSummaryHeader({
  appliedCount,
  totalAttempted,
  scoreBefore,
  scoreDelta,
  failedCount,
  pagesUpdated,
}) {
  const subtitle = `Up from ${scoreBefore} before fixes. ${appliedCount} applied across ${pagesUpdated} page${pagesUpdated === 1 ? '' : 's'}, ${failedCount} failed.`

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <p className="text-[18px] font-semibold text-gray-900 leading-tight m-0">
          {appliedCount} of {totalAttempted} fixes applied
        </p>
        {scoreDelta > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success-700 bg-success-50 border border-success-200 rounded-full px-2 py-0.5">
            <ArrowUp size={11} />
            +{scoreDelta} pts
          </span>
        )}
        <span className="text-[12px] text-gray-500">via Cloudflare Workers</span>
      </div>
      <p className="text-[13px] text-gray-500 leading-relaxed m-0">{subtitle}</p>
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <span className="inline-flex items-center gap-1 text-[12px] font-medium text-success-700 bg-success-50 border border-success-200 rounded-full px-2 py-0.5">
          <CircleCheck size={12} />
          {appliedCount} applied
        </span>
        {failedCount > 0 && (
          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-error-600 bg-error-50 border border-error-200 rounded-full px-2 py-0.5">
            <X size={12} />
            {failedCount} failed
          </span>
        )}
      </div>
    </div>
  )
}

/** Unified post-fix summary — auto-fix implement and manual rescan variants */
export default function ImplementSummaryCard({ summary: initialSummary, onItemResolved }) {
  const [summary, setSummary] = useState(initialSummary)
  const [retryingId, setRetryingId] = useState(null)
  const [retryQueue, setRetryQueue] = useState([])
  const [retryProgress, setRetryProgress] = useState(0)

  useEffect(() => {
    setSummary(initialSummary)
    setRetryingId(null)
    setRetryQueue([])
    setRetryProgress(0)
  }, [initialSummary])

  function applyRetrySuccess(prev, itemId) {
    if (!prev) return prev
    const failedItem = prev.failed.find(item => item.id === itemId)
    if (!failedItem) return prev

    const applied = [...prev.applied, mapAppliedItem(failedItem, 'autofix')]
    const failed = prev.failed.filter(item => item.id !== itemId)
    const appliedCount = applied.length
    const failedCount = failed.length
    const percent =
      prev.totalAttempted > 0 ? Math.round((appliedCount / prev.totalAttempted) * 100) : 100
    const scoreAfter = Math.min(100, prev.scoreBefore + Math.round((appliedCount / Math.max(prev.totalAttempted, 1)) * 34))
    const pagesUpdated = sumAffectedPages(applied)

    return {
      ...prev,
      applied,
      failed,
      appliedCount,
      failedCount,
      percent,
      scoreAfter,
      scoreDelta: scoreAfter - prev.scoreBefore,
      hasIssues: failedCount > 0,
      metrics: {
        ...prev.metrics,
        issuesFixed: appliedCount,
        pagesUpdated,
        errorsLeft: failedCount,
      },
      footerText: failedCount > 0
        ? `${appliedCount} fix${appliedCount === 1 ? '' : 'es'} applied. Retry failed items or review Cloudflare permissions.`
        : `${appliedCount} fix${appliedCount === 1 ? '' : 'es'} applied. ${prev.manualTotal} manual fix${prev.manualTotal === 1 ? '' : 'es'} still need attention in action items.`,
    }
  }

  useEffect(() => {
    if (!retryingId || summary?.variant !== 'autofix') return undefined

    if (retryProgress >= 100) {
      const timer = setTimeout(() => {
        const resolvedId = retryingId
        setSummary(prev => applyRetrySuccess(prev, resolvedId))
        onItemResolved?.(resolvedId)

        setRetryQueue(queue => {
          if (queue.length === 0) {
            setRetryingId(null)
            setRetryProgress(0)
            return []
          }
          setRetryingId(queue[0])
          setRetryProgress(0)
          return queue.slice(1)
        })
      }, 300)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      setRetryProgress(value => Math.min(100, value + 25))
    }, RETRY_STEP_MS)

    return () => clearTimeout(timer)
  }, [retryingId, retryProgress, summary?.variant, onItemResolved])

  if (!summary) return null

  const {
    variant,
    title,
    subtitle,
    scoreBefore,
    scoreAfter,
    scoreDelta,
    applied,
    failed,
    appliedCount,
    failedCount,
    totalAttempted,
    percent,
    metrics,
    footerText,
    disclaimer,
  } = summary

  const isRescan = variant === 'rescan'
  const sectionLabel = isRescan ? 'What was fixed' : 'Successful'

  function handleRetry(itemId) {
    if (retryingId) return
    setRetryQueue([])
    setRetryingId(itemId)
    setRetryProgress(0)
  }

  function handleRetryAll() {
    if (retryingId || failed.length === 0) return
    const ids = failed.map(item => item.id)
    setRetryQueue(ids.slice(1))
    setRetryingId(ids[0])
    setRetryProgress(0)
  }

  const retryBusy = Boolean(retryingId)

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
      <div className="px-3 py-3">
        <div className="flex items-start gap-4">
          {isRescan ? (
            <ScoreRing score={scoreAfter} tone="success" />
          ) : (
            <ProgressRing percent={percent} />
          )}
          {isRescan ? (
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-semibold text-gray-900 leading-tight m-0 mb-1">{title}</p>
              <p className="text-[13px] text-gray-500 leading-relaxed m-0">{subtitle}</p>
            </div>
          ) : (
            <AutofixSummaryHeader
              appliedCount={appliedCount}
              totalAttempted={totalAttempted}
              scoreBefore={scoreBefore}
              scoreDelta={scoreDelta}
              failedCount={failedCount}
              pagesUpdated={metrics?.pagesUpdated ?? sumAffectedPages(applied)}
            />
          )}
        </div>
      </div>

      {applied.length > 0 && (
        <div className="px-3 py-3 border-t border-gray-200">
          <SectionLabel>{sectionLabel} ({applied.length})</SectionLabel>
          {applied.map(item => (
            <AppliedRow key={item.id} item={item} />
          ))}
        </div>
      )}

      {!isRescan && failed.length > 0 && (
        <div className="border-t border-gray-200 bg-error-50">
          <div className="px-3 pt-3 pb-1">
            <p className="text-[11px] font-semibold text-error-600 m-0 mb-1">
              Failed ({failed.length})
            </p>
          </div>
          <div className="px-3">
            {failed.slice(0, MAX_FAILED_CASES).map(item => (
              <FailedRow
                key={item.id}
                item={item}
                isRetrying={retryingId === item.id}
                retryProgress={retryingId === item.id ? retryProgress : 0}
                onRetry={handleRetry}
                retryDisabled={retryBusy}
              />
            ))}
          </div>
          {failed.length >= 2 && (
            <FailedSectionFooter
              failedCount={failed.length}
              onRetryAll={handleRetryAll}
              retryDisabled={retryBusy}
            />
          )}
        </div>
      )}

      <div className="px-3 py-3 border-t border-gray-200">
        <div className="flex items-start gap-2 mb-2">
          <Info size={14} className="text-gray-500 shrink-0 mt-0.5" />
          <p className="text-[12px] text-gray-500 leading-relaxed m-0">{footerText}</p>
        </div>
        {disclaimer && (
          <p className="text-[11px] text-gray-500 leading-relaxed m-0 pl-[22px]">{disclaimer}</p>
        )}
      </div>
    </div>
  )
}

function mapAppliedItem(item, resolveType) {
  return {
    ...item,
    resolveType: item.resolveType ?? resolveType,
  }
}
