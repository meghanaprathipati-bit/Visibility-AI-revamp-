/** SEO scan prototype copy — replace with API response in production */

export const SEO_SCAN_CONTEXT = {
  projectName: 'Harborview Inn & Suites',
  websiteUrl: 'https://ramada.9hf9h.com/',
  websiteDomain: 'ramada.9hf9h.com',
  brand: '9hf9h.com',
  targetCountry: 'United States',
}

/** Shown above progress steps while the scan runs */
export const SEO_SCAN_LOADER_INTRO = `Initiating scan for ${SEO_SCAN_CONTEXT.websiteDomain}. This usually takes 2-5 minutes.`

/** Acknowledgment shown after the loader completes — plain text above the summary card */
export const SEO_SCAN_ACKNOWLEDGMENT = {
  headline: 'Great, I found 9hf9h.com.',
  welcome:
    'Welcome to 9hf9h.com, where we are excited to kick off our scan initiative to enhance your experience at our Ramada location!',
  business: '9hf9h.com',
  website: 'https://ramada.9hf9h.com/',
  visibilityIntro: "I'll start checking your visibility now across:",
  searchEnginesLabel: 'Search engines',
  searchEnginesDetail: 'Google, Bing, and other search result surfaces',
  aiEnginesLabel: 'AI LLM engines',
  aiEnginesDetail: 'Claude, Perplexity, Google AI Mode, Google AI Overview, and other answer engines',
}

export const SEO_SCAN_SUMMARY = {
  title: 'Visibility Analysis Indicates Critical Opportunities for Improvement',
  channelsAnalyzed: 'Website, Local Directories, Reviews Platforms',
  opportunityScope:
    'There are several low-hanging, easy-to-achieve fixes that can significantly improve overall results.',
  categories: [
    {
      name: 'Website',
      status: 'Needs attention',
      description: 'Site is mostly healthy but requires technical fixes for missed opportunities.',
      checks: [{ label: 'SEO site audit' }, { label: 'AI visibility' }],
    },
    {
      name: 'Local directories',
      status: 'Needs attention',
      description: 'Security checks indicate multiple HTTPS-related issues requiring resolution.',
      checks: [{ label: 'Listings scan' }, { label: 'NAP consistency' }],
    },
    {
      name: 'Reviews platforms',
      status: 'Needs attention',
      description: 'Domain performance metrics indicate no authority or trust.',
      checks: [{ label: 'Reviews scan' }, { label: 'Sentiment' }],
    },
  ],
}

export const SEO_SCAN_TOP_GAPS = [
  {
    channel: 'Website',
    category: 'SEO site audit',
    issueCategory: 'Website SEO',
    topFix: 'Structured data validation errors',
  },
  {
    channel: 'Website',
    category: 'AI visibility',
    issueCategory: 'Website SEO',
    topFix: 'Zero domain citations',
  },
  {
    channel: 'Local Directories',
    category: 'Listings scan',
    issueCategory: 'Website SEO',
    topFix: 'HTTPS encryption failure',
  },
  {
    channel: 'Local Directories',
    category: 'Listings scan',
    issueCategory: 'Website SEO',
    topFix: 'Mixed content issues',
  },
  {
    channel: 'Reviews Platforms',
    category: 'Reviews scan',
    issueCategory: 'Website SEO',
    topFix: 'No backlinks or referring domains',
  },
]

export const SEO_SCAN_NEXT_ACTION_PLAN = [
  {
    when: 'Now',
    channel: 'Website',
    category: 'SEO site audit',
    action: 'Replace invalid JSON-LD on homepage',
  },
  {
    when: 'Next',
    channel: 'Website',
    category: 'AI visibility',
    action: 'Increase content for AI platforms',
  },
  {
    when: 'With access',
    channel: 'Local Directories',
    category: 'Listings scan',
    action: 'Resolve HTTPS encryption failure',
  },
  {
    when: 'Follow-up',
    channel: 'Reviews Platforms',
    category: 'Reviews scan',
    action: 'Develop a backlink strategy',
  },
]

/** Score gauges for detailed report side panel only — replace with API metrics in production */
export const SEO_SCAN_SCORE_OVERVIEW = [
  { label: 'Overall', value: 85 },
  { label: 'Performance', value: 75 },
  { label: 'Accessibility', value: 92 },
  { label: 'Best practices', value: 88 },
  { label: 'SEO', value: 95 },
]
