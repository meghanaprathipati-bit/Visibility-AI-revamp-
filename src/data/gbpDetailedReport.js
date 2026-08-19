/**
 * GBP audit report — static prototype data for GBP scans.
 * Replace with API response in production.
 */

import { GBP_SCAN_CONTEXT } from './gbpScanContent.js'

/** @typedef {'error' | 'warning' | 'notice' | 'success'} ReportTone */

export const GBP_HEALTH_REPORT = {
  title: 'GBP audit report',
  domain: GBP_SCAN_CONTEXT.businessName,
  location: GBP_SCAN_CONTEXT.location,
  scanDate: 'June 18, 2024',
  statusLabel: 'Scan complete',
  score: 55,
  scoreStatus: 'Needs attention',
  scoreTone: 'warning',
  readOnly: true,
  summaryMetrics: [
    { label: 'Critical errors', value: '2', tone: 'error' },
    { label: 'Warnings', value: '3', tone: 'warning' },
    { label: 'Notices', value: '2', tone: 'notice' },
    { label: 'NAP score', value: '72%', tone: 'warning' },
    { label: 'Completeness', value: '55%', tone: 'warning' },
    { label: 'Connected directories', value: '18/24', tone: 'notice' },
  ],
  technicalIssues: [
    {
      tone: 'error',
      badge: 'Error',
      title: 'Primary category mismatch on Google Business Profile',
      description:
        'Current category "Salon (generic)" does not match your core service offering. Update to a more specific primary category.',
    },
    {
      tone: 'error',
      badge: 'Error',
      title: 'Business name inconsistent across directories',
      description:
        '4 directories use a shortened or alternate business name. NAP inconsistency reduces trust signals and local pack eligibility.',
    },
    {
      tone: 'warning',
      badge: 'Warning',
      title: 'Business hours missing on Google Business Profile',
      description:
        'No hours set for weekends or holidays. Customers cannot confirm availability — Google may suppress the listing in local results.',
    },
    {
      tone: 'warning',
      badge: 'Warning',
      title: 'Missing from Apple Maps and Bing Places',
      description:
        'Your business was not found on Apple Maps or Bing Places. These directories drive discovery on iOS and Microsoft search surfaces.',
    },
    {
      tone: 'warning',
      badge: 'Warning',
      title: 'No GBP posts published in 60+ days',
      description:
        'Last post was 67 days ago. Regular posting signals an active business and can improve local pack engagement.',
    },
    {
      tone: 'notice',
      badge: 'Notice',
      title: 'Messaging disabled on Google Business Profile',
      description:
        'Customers cannot message you directly from search or Maps. Enable messaging to capture more leads.',
    },
  ],
  mapRankHeatmap: {
    title: 'Map rank heat grid',
    keyword: 'salon near me · Bengaluru',
    legend: [
      { label: 'Good', tone: 'success' },
      { label: 'Average', tone: 'warning' },
      { label: 'Poor', tone: 'error' },
      { label: 'Out of top 20', tone: 'neutral' },
    ],
    // Dummy grid data — 5×5 cells; replace with API map-rank coordinates in production
    grid: [
      ['success', 'success', 'warning', 'warning', 'error'],
      ['success', 'warning', 'warning', 'error', 'error'],
      ['warning', 'warning', 'error', 'error', 'neutral'],
      ['warning', 'error', 'error', 'neutral', 'neutral'],
      ['error', 'error', 'neutral', 'neutral', 'neutral'],
    ],
  },
  localRankTracker: {
    title: 'Local rank tracker',
    columns: ['Rank', 'Business name', 'Category', 'Rating'],
    rows: [
      ['1', 'Lakme Salon — Indiranagar', 'Hair salon', '4.6'],
      ['2', 'Naturals Salon — Koramangala', 'Beauty salon', '4.5'],
      ['3', 'Green Trends — HSR Layout', 'Hair salon', '4.4'],
      ['7', 'Ethnic Premium Salon — ADCS Layout', 'Salon', '4.5'],
      ['12', 'Studio 11 Salon — Whitefield', 'Hair salon', '4.3'],
      ['—', 'Zenith Hair Studio — Marathahalli', 'Hair salon', '4.2'],
    ],
  },
  directoryCoverage: {
    title: 'Directory coverage',
    directories: [
      { name: 'Google Business Profile', status: 'Live', tone: 'success' },
      { name: 'Facebook', status: 'Live', tone: 'success' },
      { name: 'Yelp', status: 'Syncing', tone: 'warning' },
      { name: 'Foursquare', status: 'Live', tone: 'success' },
      { name: 'Apple Maps', status: 'Missing', tone: 'error' },
      { name: 'Bing Places', status: 'Missing', tone: 'error' },
      { name: 'TripAdvisor', status: 'Failed', tone: 'error' },
      { name: 'Justdial', status: 'Live', tone: 'success' },
    ],
  },
  directoryCounts: {
    title: 'Directory sync summary',
    columns: ['Live', 'Syncing', 'Failed', 'Connected total'],
    rows: [['14', '2', '2', '18']],
  },
  closingLine: 'This report is read-only. Open Action items to fix anything above.',
}
