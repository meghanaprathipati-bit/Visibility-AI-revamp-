/**
 * Project summary seed data — replace with API response in production.
 * Shown on the chat landing when a returning user selects an existing project.
 */

import { actionItems, getProjectSummaryActionItems, PROJECT_SUMMARY_ACTION_ITEM_IDS } from './actionItems.js'
import { PROJECT_SUMMARY_PROMPT_MARKER } from './scanPrompts.js'

/** Prototype open-issue count for project summary hero card */
export const PROJECT_SUMMARY_ISSUE_COUNT = PROJECT_SUMMARY_ACTION_ITEM_IDS.length

/** Priority tag labels mapped to design-system severity styling */
export const PRIORITY_TAG_STYLES = {
  'Top priority': 'bg-purple-50 text-purple-700 border-purple-200',
  Critical: 'bg-purple-50 text-purple-700 border-purple-200',
  'Quick win': 'bg-success-50 text-success-700 border-success-200',
}

/** Suggestion chips for the project-summary landing footer */
export const PROJECT_SUMMARY_CHIPS = [
  { label: 'Audit GBP', prompt: 'Run GBP, listings, and reviews scans for your business name or Google Maps / GBP link' },
  { label: 'Crawl for SEO', prompt: 'Run a full SEO crawl on my website — check technical health, meta tags, page speed, and crawlability' },
  { label: 'Check AI visibility', prompt: 'Check AI visibility for your brand or website URL — how it appears in ChatGPT, Perplexity, Gemini, and Google AI Overviews' },
  { label: 'Analyze competitors', prompt: 'Run a competitive analysis for my website — compare rankings, backlinks, and content strategy against competitors' },
  { label: 'Track performance', prompt: 'Set up performance monitoring — track keyword rankings, traffic trends, local pack positions, and AI citations' },
]

/** Compact dashboard glimpse modules — deep-link to specific dashboard views */
export const DASHBOARD_GLIMPSE_MODULES = [
  { id: 'website-health', label: 'Website health', value: '74', dashboardId: 'site-health', icon: 'globe', iconColor: 'var(--primary-600)' },
  { id: 'ai-readiness', label: 'AI readiness', value: '71%', dashboardId: 'ai-search-performance', icon: 'award', iconColor: 'var(--purple-600)' },
  { id: 'gbp-score', label: 'GBP score', value: '86%', dashboardId: 'profile-health', icon: 'mapPin', iconColor: 'var(--error-600)' },
  { id: 'listings-sync', label: 'Listings sync', value: '82%', dashboardId: 'listings-health', icon: 'link', iconColor: 'var(--gray-600)' },
]

/** Prototype action items surfaced when viewing all open issues from project summary — see actionItems.js */
export { PROJECT_SUMMARY_ACTION_ITEM_IDS } from './actionItems.js'

/**
 * Prototype open recommendations for project summary.
 * `actionItemId` links Fix it to the existing action-items detail panel when available.
 */
export const PROJECT_RECOMMENDATIONS = [
  {
    id: 'rec-hero',
    rank: 1,
    priorityTag: 'Top priority',
    title: `${PROJECT_SUMMARY_ISSUE_COUNT} issues need your attention`,
    description: 'Fix them to improve your performance in search and AI.',
    actionItemIds: PROJECT_SUMMARY_ACTION_ITEM_IDS,
    icon: 'zap',
  },
  {
    id: 'rec-2',
    rank: 2,
    priorityTag: 'Critical',
    title: 'Close the competitor answer gap',
    description: 'Competitors appear in AI answers where your brand is absent.',
    actionItemId: '8',
    icon: 'award',
  },
  {
    id: 'rec-3',
    rank: 3,
    priorityTag: 'Critical',
    title: 'Refresh local buying signals',
    description: 'GBP categories and services no longer match how customers search.',
    actionItemId: 'gbp-af-1',
    icon: 'mapPin',
  },
  {
    id: 'rec-4',
    rank: 4,
    priorityTag: 'Quick win',
    title: 'Align product pages with AI answers',
    description: 'Key pages lack structured data AI engines use for citations.',
    actionItemId: '6',
    icon: 'sparkles',
  },
  {
    id: 'rec-5',
    rank: 5,
    priorityTag: 'Quick win',
    title: 'Improve internal linking on key pages',
    description: 'Orphan pages are missing links from high-traffic entry points.',
    actionItemId: '5',
    icon: 'link',
  },
]

/** Whether this project should show the returning-user summary landing */
export function projectHasSummary(project) {
  if (!project) return false
  return Boolean(project.hasSummary)
}

/** Whether the project has any prior chat or scan activity — drives new-chat landing branch */
export function projectHasChatHistory(project) {
  if (!project) return false
  return Boolean(project.hasChatHistory)
}

/**
 * Build summary payload for a project — replace with API fetch in production.
 */
export function getProjectSummary(project) {
  const openRecommendations = [...PROJECT_RECOMMENDATIONS]
  const hero = openRecommendations.find(r => r.rank === 1) ?? null
  const secondary = openRecommendations.filter(r => r.rank > 1)

  return {
    visibilityScore: 64,
    trendDelta: '+7',
    trendLabel: 'this week',
    trendUp: true,
    nextTargetScore: 75,
    targetInsight: 'fix website issues, then publish fresh local proof.',
    // Prototype momentum sparkline — replace with API time-series in production
    momentumSparkline: [57, 58, 56, 59, 60, 58, 61, 62, 63, 64],
    momentumMonthDelta: '+14',
    nextGoalInsight: 'fix website issues, then publish fresh local proof.',
    hero,
    secondary,
    // Prototype display count — hero is 1 of 3 queued recommendations in mockup
    pendingRecommendationsCount: 2,
    dashboardModules: DASHBOARD_GLIMPSE_MODULES,
    hasOpenRecommendations: openRecommendations.length > 0,
  }
}

/** Resolve linked action items for View all / detail panel scoping */
export function getRecommendationActionItems(recommendation) {
  if (!recommendation) return []
  if (recommendation.id === 'rec-hero') {
    return getProjectSummaryActionItems()
  }
  if (recommendation.actionItemIds?.length) {
    return recommendation.actionItemIds
      .map(id => actionItems.find(item => item.id === id))
      .filter(Boolean)
  }
  const single = getRecommendationActionItem(recommendation)
  return single ? [single] : []
}

/** Resolve linked action item for Fix it / detail panel scoping */
export function getRecommendationActionItem(recommendation) {
  if (!recommendation?.actionItemId) return null
  return actionItems.find(item => item.id === recommendation.actionItemId) ?? null
}

/** Pre-seed prompt for "Start a chat with this summary" */
export function buildSummaryChatPrompt(summary, projectLabel) {
  const lines = [
    `Project: ${projectLabel}`,
    `Visibility score: ${summary.visibilityScore} (${summary.trendDelta} ${summary.trendLabel})`,
  ]
  if (summary.hero) {
    lines.push('', `Top priority: ${summary.hero.title}`, summary.hero.description)
  }
  if (summary.secondary.length) {
    lines.push('', 'Other open recommendations:')
    summary.secondary.forEach(item => {
      lines.push(`- ${item.title} (${item.priorityTag})`)
    })
  }
  lines.push('', PROJECT_SUMMARY_PROMPT_MARKER)
  return lines.join('\n')
}

/** Scoped chat prompt for a single recommendation Fix it action */
export function buildFixItPrompt(recommendation) {
  return `Help me fix this issue: ${recommendation.title}. ${recommendation.description}`
}
