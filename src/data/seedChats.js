import { buildScanResultsPayload } from './scanResults.js'
import { SEO_SCAN_PROMPT } from './scanPrompts.js'

/** Pinned recent chat — always shows completed SEO scan in prototype */
export const SEO_SCAN_CHAT_ID = 3

/** Re-export canonical SEO prompt for pinned chat label / chips */
export { SEO_SCAN_PROMPT }

/** Pre-built message thread for the pinned SEO scan chat */
export function createSeoScanMessages() {
  const payload = buildScanResultsPayload(SEO_SCAN_PROMPT)

  return [
    {
      id: 'seo-user-1',
      type: 'user',
      content: SEO_SCAN_PROMPT,
      ts: '14:32',
    },
    // scan-done renders nothing — progress was already complete when this session was loaded
    {
      id: 'seo-scan-1',
      type: 'ai',
      content: 'scan-done',
      ts: '14:35',
    },
    {
      id: 'seo-results-1',
      type: 'ai',
      content: 'scan-results',
      ts: '14:35',
      ...payload,
    },
  ]
}

/** Session snapshot for a chat thread — replace with API persistence in production */
export function createSeoScanSession() {
  return {
    chatMode: true,
    isScanning: false,
    messages: createSeoScanMessages(),
    inputValue: '',
  }
}

export function createEmptySession() {
  return {
    chatMode: false,
    isScanning: false,
    messages: [],
    inputValue: '',
  }
}
