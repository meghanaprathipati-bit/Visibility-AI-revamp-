/** Builds a complete scan-results payload — replace with API response in production */

import { getActionItemsForPrompt, getProjectSummaryActionItems } from './actionItems.js'
import {
  buildScanCompleteMessage,
  buildScanFindings,
  getNextActionsForScan,
} from './scanSummary.js'
import { buildVisibilityReport } from './visibilityReport.js'

export function buildScanResultsPayload(promptText, scanKind = 'generic') {
  if (scanKind === 'project-summary') return buildProjectSummaryPayload()
  if (scanKind === 'ai-visibility') return buildAiVisibilityPayload()
  if (scanKind === 'ai-action-plan') return buildActionPlanPayload()
  if (scanKind === 'gbp') return buildGbpPayload()

  const actionItems = getActionItemsForPrompt(promptText, scanKind)
  return {
    scanKind,
    actionItems,
    summaryText: buildScanCompleteMessage(promptText, actionItems),
    findings: buildScanFindings(promptText, actionItems),
    nextActions: getNextActionsForScan(promptText, actionItems),
    report: buildVisibilityReport(promptText),
  }
}

function buildProjectSummaryPayload() {
  const actionItems = getProjectSummaryActionItems()
  return {
    scanKind: 'project-summary',
    actionItems,
    summaryText: buildScanCompleteMessage('', actionItems),
    findings: buildScanFindings('', actionItems),
    nextActions: getNextActionsForScan('', actionItems),
    report: buildVisibilityReport('full visibility scan'),
  }
}

function buildAiVisibilityPayload() {
  const actionItems = getActionItemsForPrompt('', 'ai-visibility')
  return {
    scanKind: 'ai-visibility',
    actionItems,
    summaryText: "I've finished scanning how your brand appears across AI search engines. Your AI visibility is low — your brand is rarely cited by ChatGPT, Perplexity, or Google AI Overviews.",
    findings: [
      'AI citation score: 3 out of 10 — most queries return no brand mention',
      'ChatGPT only surfaces your brand in 1 out of 5 relevant queries',
      'Perplexity AI found no references to your brand in 5 test queries',
      'Google AI Overviews mention you in 2 out of 5 queries (indirect references only)',
      'No structured data detected — AI models cannot reliably extract your business details',
    ],
    nextActions: ['Add schema markup', 'Create AEO content', 'Build AI action plan'],
    report: null,
  }
}

function buildGbpPayload() {
  const promptText = 'Run GBP, listings, and reviews scans for my business'
  const actionItems = getActionItemsForPrompt(promptText, 'gbp')
  return {
    scanKind: 'gbp',
    actionItems,
    summaryText: buildScanCompleteMessage(promptText, actionItems),
    findings: buildScanFindings(promptText, actionItems),
    nextActions: getNextActionsForScan(promptText, actionItems),
    report: buildVisibilityReport(promptText),
  }
}

function buildActionPlanPayload() {
  const actionItems = getActionItemsForPrompt('', 'ai-action-plan')
  return {
    scanKind: 'ai-action-plan',
    actionItems,
    summaryText: "Based on your goals, I've built a prioritized visibility action plan across local SEO, website SEO, AEO, and GEO. Here's your complete roadmap:",
    findings: [
      '6 high-impact actions identified across Local, SEO, and AI search channels',
      'Estimated 40–60% improvement in local pack visibility within 90 days',
      'AI search presence can be established in 60–90 days with content + schema work',
      'Competitor gap analysis shows 3 direct rivals with stronger AI citation profiles',
    ],
    nextActions: ['Start with GBP fixes', 'Run website SEO scan', 'Check AI visibility'],
    report: buildVisibilityReport('action plan seo'),
  }
}

/** Ensures stored scan-results messages always include the full inline report */
export function hydrateScanResultsMessages(messages, fallbackPrompt = '') {
  if (!messages?.length) return messages

  return messages.map((msg, index) => {
    if (msg.content !== 'scan-results') return msg
    if (
      msg.report?.topGaps?.length ||
      msg.report?.scoreOverview?.length ||
      msg.report?.executiveReport ||
      msg.report?.summaryCategories?.length
    ) {
      return msg
    }

    const priorUser = messages.slice(0, index).reverse().find(m => m.type === 'user')
    const promptText = priorUser?.content || fallbackPrompt
    const scanKind = msg.scanKind || 'generic'
    const payload = buildScanResultsPayload(promptText, scanKind)

    return {
      ...msg,
      actionItems: msg.actionItems ?? payload.actionItems,
      summaryText: msg.summaryText ?? payload.summaryText,
      findings: msg.findings ?? payload.findings,
      nextActions: msg.nextActions ?? payload.nextActions,
      report: payload.report,
    }
  })
}
