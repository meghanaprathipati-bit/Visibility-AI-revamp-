/** Dummy AI rank tracking dashboard payload — replace with API response in production */

export const DUMMY_DOMAIN = 'newmodernhotel.com'

/** Monthly time-series for citations trend chart (visibility / mentions / citations tabs) */
export const CITATIONS_TIME_SERIES = {
  visibility: [
    { date: '2025-07', value: 42 },
    { date: '2025-08', value: 48 },
    { date: '2025-09', value: 51 },
    { date: '2025-10', value: 55 },
    { date: '2025-11', value: 58 },
    { date: '2025-12', value: 62 },
    { date: '2026-01', value: 67 },
    { date: '2026-02', value: 71 },
    { date: '2026-03', value: 74 },
    { date: '2026-04', value: 78 },
    { date: '2026-05', value: 82 },
    { date: '2026-06', value: 86 },
  ],
  mentions: [
    { date: '2025-07', value: 128 },
    { date: '2025-08', value: 142 },
    { date: '2025-09', value: 156 },
    { date: '2025-10', value: 171 },
    { date: '2025-11', value: 188 },
    { date: '2025-12', value: 205 },
    { date: '2026-01', value: 224 },
    { date: '2026-02', value: 241 },
    { date: '2026-03', value: 258 },
    { date: '2026-04', value: 276 },
    { date: '2026-05', value: 294 },
    { date: '2026-06', value: 312 },
  ],
  citations: [
    { date: '2025-07', value: 18 },
    { date: '2025-08', value: 22 },
    { date: '2025-09', value: 26 },
    { date: '2025-10', value: 31 },
    { date: '2025-11', value: 35 },
    { date: '2025-12', value: 39 },
    { date: '2026-01', value: 44 },
    { date: '2026-02', value: 48 },
    { date: '2026-03', value: 53 },
    { date: '2026-04', value: 57 },
    { date: '2026-05', value: 61 },
    { date: '2026-06', value: 65 },
  ],
}

/** Per-engine visibility breakdown for engine coverage chart */
export const ENGINE_COVERAGE = [
  { key: 'chatgpt', label: 'ChatGPT', abbr: 'C', visibility: 72, presence: '68.4%', avgPosition: '2.1', citationRate: '41.2%', insight: 'Strong brand presence with consistent citations' },
  { key: 'gemini', label: 'Gemini', abbr: 'G', visibility: 58, presence: '52.1%', avgPosition: '3.4', citationRate: '28.6%', insight: 'Visible with room to improve citation rate' },
  { key: 'ai-mode', label: 'Google AI Mode', abbr: 'GA', visibility: 64, presence: '59.8%', avgPosition: '2.8', citationRate: '35.4%', insight: 'Top-ranked for local hospitality queries' },
  { key: 'ai-overview', label: 'Google AI Overview', abbr: 'GA', visibility: 81, presence: '74.2%', avgPosition: '1.9', citationRate: '48.7%', insight: 'Highest visibility across tracked prompts' },
  { key: 'perplexity', label: 'Perplexity', abbr: 'P', visibility: 45, presence: '38.6%', avgPosition: '4.2', citationRate: '22.1%', insight: 'Brand mentioned but fewer direct citations' },
]

/** Sentiment breakdown for stacked bar chart */
export const SENTIMENT_BREAKDOWN = {
  total: 248,
  recommended: 62,
  favorable: 84,
  neutral: 58,
  unfavorable: 32,
  dismissed: 12,
}

/** Hero KPI cards shown above charts */
export const HERO_KPIS = [
  { id: 'visibilityScore', label: 'Visibility score', value: '86', subtitle: '+12.4% vs prev period' },
  { id: 'competitiveRank', label: 'Competitive rank', value: '#2', subtitle: 'Latest period rank' },
  { id: 'avgPosition', label: 'Avg position', value: '2.4', subtitle: '+0.6 vs prev period' },
  { id: 'citationRate', label: 'Citation rate', value: '65', subtitle: '+8.2% vs prev period' },
]

/** Sidebar dashboard list — replace with API in production */
export const DASHBOARD_ITEMS = [
  { id: 'ai-rank-tracking', label: 'AI rank tracking' },
]
