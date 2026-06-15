/** Dummy dictation samples — replace with speech-to-text API in production */
export const DUMMY_DICTATION_SAMPLES = [
  'Run website SEO for newmodernhotel.com and check page speed issues',
  'Audit my Google Business Profile for missing fields and reviews',
  'How visible is my brand in ChatGPT and Perplexity?',
  'Crawl example.com for technical SEO and mobile readiness',
  'Compare my local rankings against nearby competitors',
]

export function pickDummyDictation() {
  return DUMMY_DICTATION_SAMPLES[
    Math.floor(Math.random() * DUMMY_DICTATION_SAMPLES.length)
  ]
}

/** Simulated pause after user stops speaking — replace with VAD in production */
export const DICTATE_SILENCE_MS = 2200

/** Minimum recording time before silence detection kicks in */
export const DICTATE_MIN_RECORD_MS = 2800

/** Simulated speech-to-text delay after user confirms dictation */
export const DICTATE_TRANSCRIBE_MS = 1400
