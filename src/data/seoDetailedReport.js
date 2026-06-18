/**
 * SEO health report — static prototype data for SEO scans.
 * Replace with API response in production.
 */

import { SEO_SCAN_CONTEXT } from './seoScanContent.js'

/** @typedef {'error' | 'warning' | 'notice' | 'success'} ReportTone */

export const SEO_HEALTH_REPORT = {
  title: 'SEO health report',
  domain: SEO_SCAN_CONTEXT.websiteDomain,
  location: SEO_SCAN_CONTEXT.targetCountry,
  scanDate: 'June 18, 2024',
  statusLabel: 'Scan complete',
  score: 42,
  scoreStatus: 'Needs work',
  scoreTone: 'error',
  summaryMetrics: [
    { label: 'Critical errors', value: '5', tone: 'error' },
    { label: 'Warnings', value: '4', tone: 'warning' },
    { label: 'Notices', value: '4', tone: 'notice' },
    { label: 'Pages scanned', value: '12', tone: 'success' },
    { label: 'Avg load time', value: '3.8s', tone: 'warning' },
    { label: 'Mobile score', value: '58', tone: 'warning' },
  ],
  technicalIssues: [
    {
      tone: 'error',
      badge: 'Error',
      title: 'Invalid JSON-LD structured data on homepage',
      description:
        'Schema markup contains syntax errors — Google cannot parse your rich result markup. Replace with valid JSON-LD or LocalBusiness schema.',
    },
    {
      tone: 'error',
      badge: 'Error',
      title: 'HTTPS encryption failure on subpages',
      description:
        '8 internal pages served over HTTP. Mixed content blocks browser trust signals and hurts ranking. Force redirect all traffic to HTTPS.',
    },
    {
      tone: 'error',
      badge: 'Error',
      title: 'No backlinks or referring domains detected',
      description:
        'Zero inbound links found. Domain authority is critically low. No authority passes to the site from external sources.',
    },
    {
      tone: 'error',
      badge: 'Error',
      title: 'Missing meta descriptions on 7 pages',
      description:
        'Search engines are auto-generating snippets. Custom meta descriptions improve click-through rates from search results.',
    },
    {
      tone: 'error',
      badge: 'Error',
      title: 'Mixed content issues (HTTP resources on HTTPS pages)',
      description:
        'Images and scripts loaded over HTTP on secure pages. Browsers block or warn about these resources.',
    },
    {
      tone: 'warning',
      badge: 'Warning',
      title: 'Zero domain citations in AI search engines',
      description:
        'Claude, Perplexity, Google AI Overview return no results using this domain. Content needs to be structured for AI readability.',
    },
    {
      tone: 'warning',
      badge: 'Warning',
      title: 'No sitemap.xml found',
      description:
        'Search engines cannot efficiently crawl your site structure. Submit a sitemap via Google Search Console.',
    },
    {
      tone: 'warning',
      badge: 'Warning',
      title: 'Duplicate title tags across 4 pages',
      description:
        'Multiple pages share identical <title> elements, confusing crawlers about page intent and reducing indexing priority.',
    },
    {
      tone: 'notice',
      badge: 'Notice',
      title: 'Images missing alt text (14 images)',
      description:
        'Impacts accessibility and image search indexing. Add descriptive alt attributes to all meaningful images.',
    },
  ],
  coreWebVitals: {
    title: 'Page speed — Core Web Vitals',
    metrics: [
      { name: 'LCP', value: '4.2s', target: 'under 2.5s', tone: 'error', fill: 84 },
      { name: 'FID', value: '94ms', target: 'under 100ms', tone: 'success', fill: 94 },
      { name: 'CLS', value: '0.28', target: 'under 0.1', tone: 'error', fill: 90 },
      { name: 'TTFB', value: '620ms', target: 'under 600ms', tone: 'warning', fill: 72 },
      { name: 'TBT', value: '810ms', target: 'under 300ms', tone: 'error', fill: 88 },
      { name: 'Speed index', value: '3.4s', target: 'under 3.4s', tone: 'warning', fill: 68 },
    ],
    insight:
      'Speed issues are primarily caused by unoptimized hero images (2.4MB) and render-blocking JavaScript. Compressing images and deferring non-critical JS could recover 1.8–2.2s of load time.',
  },
  mobileReadiness: {
    title: 'Mobile readiness',
    configuration: [
      { label: 'Viewport meta tag present', status: 'pass' },
      { label: 'Responsive CSS detected', status: 'pass' },
      { label: 'Tap targets too small (9 elements)', status: 'fail' },
      { label: 'Font size below 16px on mobile', status: 'warning' },
      { label: 'Horizontal scroll on 3 pages', status: 'fail' },
    ],
    performance: [
      { label: 'LCP mobile: 5.8s (poor)', status: 'fail' },
      { label: 'Images not served in WebP/AVIF', status: 'warning' },
      { label: 'No lazy loading on images', status: 'fail' },
      { label: 'No intrusive interstitials', status: 'pass' },
      { label: 'Legible text without zoom', status: 'pass' },
    ],
    score: 58,
    breakdownTags: [
      { label: 'Viewport', pass: true },
      { label: 'Responsive layout', pass: true },
      { label: 'Tap targets', pass: false },
      { label: 'Image opt', pass: false },
      { label: 'Font size', pass: false },
    ],
  },
  recommendedActions: [
    {
      priority: 'Fix now',
      tone: 'error',
      icon: 'code',
      title: 'Replace invalid JSON-LD schema',
      description: 'Fix structured data on homepage to qualify for Google rich results.',
    },
    {
      priority: 'Fix now',
      tone: 'error',
      icon: 'lock',
      title: 'Force HTTPS sitewide',
      description: 'Add 301 redirects and fix all mixed content references immediately.',
    },
    {
      priority: 'Next',
      tone: 'warning',
      icon: 'image',
      title: 'Compress and lazy-load images',
      description: 'Convert to WebP, compress hero images — recovers ~2s of load time.',
    },
    {
      priority: 'Next',
      tone: 'warning',
      icon: 'sitemap',
      title: 'Create and submit sitemap',
      description: 'Generate sitemap.xml and submit to Google Search Console.',
    },
    {
      priority: 'Next',
      tone: 'warning',
      icon: 'bot',
      title: 'Increase AI platform visibility',
      description: 'Structure content and add entity signals to surface in LLM search engines.',
    },
    {
      priority: 'Later',
      tone: 'success',
      icon: 'link',
      title: 'Develop a backlink strategy',
      description: 'Reach out to hospitality directories and travel sites for domain authority.',
    },
  ],
}

/** @deprecated Use SEO_HEALTH_REPORT — kept for import compatibility */
export const SEO_EXECUTIVE_REPORT = SEO_HEALTH_REPORT
