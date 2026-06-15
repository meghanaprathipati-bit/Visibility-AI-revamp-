/** Scan summary helpers — replace with API metadata in production */

export function getScanTypeLabel(promptText) {
  const lower = (promptText || '').toLowerCase()
  if (/\bgbp\b|\blisting|\breview/.test(lower)) return 'GBP profile'
  if (/\bwebsite\b|\bseo\b|\bcrawl|\btechnical|\bpage speed|\bmobile/.test(lower)) return 'website SEO'
  return 'visibility scan'
}

export function countByPriority(items) {
  return {
    error: items.filter(i => i.priority === 'error').length,
    warning: items.filter(i => i.priority === 'warning').length,
    notice: items.filter(i => i.priority === 'notice').length,
    total: items.length,
  }
}

export function buildScanCompleteMessage(promptText, items) {
  const scanTarget = getScanTypeLabel(promptText)
  const { error } = countByPriority(items)
  const errorWord = error === 1 ? 'error' : 'errors'
  return `Scan complete. Found ${error} ${errorWord} on your ${scanTarget}.`
}

/**
 * Returns an array of finding bullet strings shown after the scan completes.
 * Replace with structured API response in production.
 */
export function buildScanFindings(promptText, items) {
  const { error, warning, notice } = countByPriority(items)
  const gbpItems = items.filter(i => i.source === 'gbp')
  const seoItems = items.filter(i => i.source === 'seo')
  const findings = []

  if (error > 0) {
    findings.push(`${error} critical ${error === 1 ? 'issue' : 'issues'} found that need immediate attention`)
  }
  if (warning > 0) {
    findings.push(`${warning} ${warning === 1 ? 'warning' : 'warnings'} that could reduce your visibility`)
  }
  if (notice > 0) {
    findings.push(`${notice} improvement ${notice === 1 ? 'opportunity' : 'opportunities'} to further boost your presence`)
  }
  if (gbpItems.some(i => i.priority === 'error')) {
    findings.push('Google Business Profile has missing fields affecting local search rankings')
  }
  if (seoItems.some(i => i.priority === 'error')) {
    findings.push('Website has technical SEO issues blocking search engine crawling')
  }
  if (seoItems.some(i => i.priority === 'warning') && !seoItems.some(i => i.priority === 'error')) {
    findings.push('Website SEO has performance and metadata issues worth addressing')
  }
  return findings
}

/**
 * Returns next-best-action chip labels based on scan type and findings.
 * Replace with API-driven recommendations in production.
 */
export function getNextActionsForScan(promptText, items) {
  const lower = (promptText || '').toLowerCase()
  const { error } = countByPriority(items)
  const isGbp = /\bgbp\b|\blisting|\breview/.test(lower)
  const isSeo = /\bwebsite\b|\bseo\b|\bcrawl|\btechnical|\bpage speed|\bmobile/.test(lower)

  const actions = []
  if (error > 0) actions.push(`Fix ${error} critical ${error === 1 ? 'issue' : 'issues'}`)
  if (isGbp) {
    actions.push('Run website SEO scan')
    actions.push('Check AI & LLM visibility')
  }
  if (isSeo) {
    actions.push('Audit Google Business Profile')
    actions.push('Check AI & LLM visibility')
  }
  if (!isGbp && !isSeo) {
    actions.push('Audit Google Business Profile')
    actions.push('Run website SEO scan')
  }
  actions.push('Create action plan')
  return actions
}
