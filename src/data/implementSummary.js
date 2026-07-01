/** Prototype failure reason — replace with API error payload in production */
const DEFAULT_FAILURE_REASON = 'Cloudflare API timeout · check token permissions'

function mapFailedItem(item, failedIndex = 0) {
  let failedPages = (item.tableRows ?? [])
    .map(row => row.page)
    .filter(Boolean)

  // Prototype page counts for summary demo — replace with API row-level failure payload in production
  const prototypePageCounts = [1, 3, 5]
  let pageCount = failedPages.length
  if (!pageCount && typeof item.affectedPages === 'number') pageCount = item.affectedPages
  else if (!pageCount && item.affectedPages === 'site-wide') pageCount = 1
  else if (!pageCount) pageCount = prototypePageCounts[failedIndex % prototypePageCounts.length]

  if (failedPages.length === 0) {
    failedPages = Array.from({ length: Math.min(pageCount, 8) }, (_, index) => {
      if (item.source === 'gbp') return 'business.google.com/dashboard'
      if (item.source === 'listing' || item.source === 'listings') {
        return `directory listing ${index + 1}`
      }
      return `ramada.9hf9h.com/page-${index + 1}`
    })
  }

  return {
    ...item,
    pagesLabel: getPagesLabel(item),
    failureReason: DEFAULT_FAILURE_REASON,
    failedPages,
    failedPageCount: pageCount,
  }
}

/**
 * Prototype partial-failure set — replace with API response in production.
 * When 2+ fixes are selected, simulate up to 3 failures for the summary demo.
 */
function getFailedAndAppliedItems(selectedItems) {
  const total = selectedItems.length
  if (total < 2) {
    return { applied: selectedItems, failed: [] }
  }

  const failCount = Math.min(3, total)
  const failed = selectedItems.slice(-failCount).map((item, index) => mapFailedItem(item, index))
  const failedIds = new Set(failed.map(item => item.id))
  const applied = selectedItems.filter(item => !failedIds.has(item.id))

  return { applied, failed }
}

/** Shared footer disclaimer — replace with product copy API in production */
const SUMMARY_DISCLAIMER = 'Estimated impact only. Track actual performance in your dashboard over the next 4–6 weeks.'

/** Prototype projected impact rows — replace with API analytics in production */
const DEFAULT_PROJECTED_IMPACT = [
  {
    id: 'impressions',
    title: 'Search impressions',
    description: 'Proper title tags + meta descriptions improve click-through from search results',
    value: '+15–25%',
    subvalue: 'est. over 4–6 weeks',
    tone: 'success',
  },
  {
    id: 'ai-citations',
    title: 'AI model citations',
    description: 'Structured data helps AI engines cite your business in answers',
    value: '+3 topics',
    subvalue: 'ChatGPT + Perplexity',
    tone: 'purple',
  },
  {
    id: 'indexed',
    title: 'Pages indexed',
    description: 'Orphan pages linked and crawlable — search engines can discover more content',
    value: '+23 pages',
    subvalue: 'now indexable',
    tone: 'primary',
  },
  {
    id: 'speed',
    title: 'Page load speed',
    description: 'Optimized images reduce payload and improve Core Web Vitals',
    value: '−340 KB',
    subvalue: 'avg. per page',
    tone: 'warning',
  },
]

/** Prototype manual-fix impact copy — replace with API enrichment in production */
const MANUAL_IMPACT_BY_KEYWORD = [
  { match: /gbp|google business|category|messaging/i, value: '+18% local pack visibility', subvalue: 'GBP completeness' },
  { match: /description|appointment|url/i, value: '+12% profile engagement', subvalue: 'GBP actions' },
  { match: /orphan|link/i, value: '+23 pages indexable', subvalue: 'internal links added' },
  { match: /image|oversized/i, value: '−340 KB avg. payload', subvalue: 'Core Web Vitals' },
  { match: /nap|listing|yelp|foursquare/i, value: '+2 citation sources', subvalue: 'listing accuracy' },
]

function getPagesLabel(item) {
  if (item.affectedPages === 'site-wide') return 'Site-wide'
  if (item.affectedPages != null) {
    return `${item.affectedPages} page${item.affectedPages === 1 ? '' : 's'}`
  }
  return null
}

function sumAffectedPages(items) {
  return items.reduce((total, item) => {
    if (item.affectedPages === 'site-wide') return total + 1
    if (typeof item.affectedPages === 'number') return total + item.affectedPages
    return total + 1
  }, 0)
}

function getManualImpact(item) {
  const title = item.title ?? ''
  const match = MANUAL_IMPACT_BY_KEYWORD.find(entry => entry.match.test(title))
  return match ?? { value: '+8% visibility lift', subvalue: 'manual fix verified' }
}

function buildProjectedImpact(appliedItems, variant) {
  if (variant === 'rescan') {
    return appliedItems.slice(0, 3).map((item, index) => {
      const impact = getManualImpact(item)
      return {
        id: `manual-${item.id}`,
        title: item.title,
        description: item.recommendation?.slice(0, 90) ?? 'Fix verified on rescan',
        value: impact.value,
        subvalue: impact.subvalue,
        tone: ['success', 'purple', 'primary'][index % 3],
      }
    })
  }
  return DEFAULT_PROJECTED_IMPACT
}

function mapAppliedItem(item, resolveType = 'autofix') {
  return {
    ...item,
    pagesLabel: getPagesLabel(item),
    resolveType,
    impactValue: resolveType === 'manual' ? getManualImpact(item).value : null,
  }
}

/**
 * Build post auto-fix implementation summary.
 * Prototype simulates partial failures when multiple fixes are selected.
 */
export function buildImplementSummary(selectedItems = [], manualItems = []) {
  const total = selectedItems.length
  const { applied: appliedItems, failed: failedItems } = getFailedAndAppliedItems(selectedItems)
  const manual = manualItems.filter(item => item.manualFix)
  const appliedCount = appliedItems.length
  const failedCount = failedItems.length
  const totalAttempted = total
  const percent = totalAttempted > 0 ? Math.round((appliedCount / totalAttempted) * 100) : 100
  const scoreBefore = 58
  const scoreAfter = Math.min(92, scoreBefore + Math.round((appliedCount / Math.max(totalAttempted, 1)) * 34))

  const pagesUpdated = sumAffectedPages(appliedItems)

  return {
    variant: 'autofix',
    title: 'Implementation summary',
    subtitle: `Up from ${scoreBefore} before fixes. ${appliedCount} applied across ${pagesUpdated} page${pagesUpdated === 1 ? '' : 's'}, ${failedCount} failed.`,
    scoreBefore,
    scoreAfter,
    scoreDelta: scoreAfter - scoreBefore,
    applied: appliedItems.map(item => mapAppliedItem(item, 'autofix')),
    failed: failedItems,
    manual,
    appliedCount,
    failedCount,
    totalAttempted,
    percent,
    manualTotal: manual.length,
    manualDone: 0,
    hasIssues: failedCount > 0,
    metrics: {
      issuesFixed: appliedCount,
      pagesUpdated,
      errorsLeft: failedCount,
      warningsLeft: 0,
    },
    projectedImpact: buildProjectedImpact(appliedItems, 'autofix'),
    footerText: failedCount > 0
      ? `${appliedCount} fix${appliedCount === 1 ? '' : 'es'} applied. Retry failed items or review Cloudflare permissions.`
      : `${appliedCount} fix${appliedCount === 1 ? '' : 'es'} applied. ${manual.length} manual fix${manual.length === 1 ? '' : 'es'} still need attention in action items.`,
    disclaimer: SUMMARY_DISCLAIMER,
  }
}

/**
 * Build post-rescan summary for verified manual fixes only.
 * Prototype marks the first manual items as verified — replace with diff API in production.
 */
export function buildRescanSummary(manualItems = []) {
  const verified = manualItems.slice(0, Math.min(3, manualItems.length))
  const remaining = Math.max(manualItems.length - verified.length, 0)
  const scoreBefore = 76
  const scoreAfter = Math.min(100, scoreBefore + verified.length * 6)
  const appliedCount = verified.length

  return {
    variant: 'rescan',
    title: 'SEO health score',
    subtitle: `Up from ${scoreBefore} before fixes. ${appliedCount} manual fix${appliedCount === 1 ? '' : 'es'} verified on rescan.`,
    scoreBefore,
    scoreAfter,
    scoreDelta: scoreAfter - scoreBefore,
    applied: verified.map(item => mapAppliedItem(item, 'manual')),
    failed: [],
    manual: [],
    appliedCount,
    failedCount: 0,
    totalAttempted: appliedCount,
    percent: 100,
    manualTotal: remaining,
    manualDone: appliedCount,
    hasIssues: false,
    metrics: {
      issuesFixed: appliedCount,
      pagesUpdated: sumAffectedPages(verified),
      errorsLeft: 0,
      warningsLeft: remaining,
    },
    projectedImpact: buildProjectedImpact(verified, 'rescan'),
    footerText: remaining > 0
      ? `${appliedCount} manual fix${appliedCount === 1 ? '' : 'es'} verified. ${remaining} manual item${remaining === 1 ? '' : 's'} still need attention.`
      : `All manual fixes verified. Your visibility score is now ${scoreAfter}.`,
    disclaimer: SUMMARY_DISCLAIMER,
  }
}
