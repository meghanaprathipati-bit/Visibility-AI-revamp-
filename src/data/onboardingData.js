/** Prototype in-chat onboarding seed data — replace with API response in production */

/** Greeting copy shown before the AI visibility onboarding wizard — replace with API copy in production */
export const AI_VISIBILITY_SETUP_GREETING = {
  headline: "Hi there! 👋 You're almost ready.",
  intro:
    'Before we run your first AI visibility scan, I just need a few details to personalise your results:',
  bullets: [
    "Target keywords you'd like to rank for",
    'Your business address to analyse local visibility',
    'Your competitors to benchmark your performance',
  ],
  outro: "It'll only take a minute, and then we'll get started.",
  ctaLabel: 'Continue',
}

/** Top keywords suggested for the active project — replace with keyword research API */
export const ONBOARDING_KEYWORDS = [
  {
    id: 'kw-1',
    keyword: 'Salon bangalore',
    monthlySearches: 70,
    difficulty: 'Easy',
    difficultyScore: 16,
    aiSuggested: true,
    checked: true,
  },
  {
    id: 'kw-2',
    keyword: 'Best hair salon in bangalore',
    monthlySearches: 50,
    difficulty: 'Easy',
    difficultyScore: 22,
    checked: true,
  },
  {
    id: 'kw-3',
    keyword: 'Haircut near me',
    monthlySearches: 90,
    difficulty: 'Medium',
    difficultyScore: 45,
    checked: true,
  },
]

/** Competitors suggested for benchmarking — replace with competitor discovery API */
export const ONBOARDING_COMPETITORS = [
  {
    id: 'comp-1',
    name: 'Looks Salon',
    domain: 'lookssalon.in',
    notes: 'Strong local pack presence in Bengaluru',
    checked: true,
  },
  {
    id: 'comp-2',
    name: 'Bounce Salon',
    domain: 'bouncesalon.com',
    notes: 'High review volume and branded search overlap',
    checked: true,
  },
  {
    id: 'comp-3',
    name: 'Jean Claude Biguine',
    domain: 'jcbsalons.in',
    notes: 'Premium positioning with overlapping service keywords',
    checked: false,
  },
]

/** Max custom rows the user may add in steps 2 & 3 — AI-suggested rows do not count */
const MAX_CUSTOM_KEYWORDS = 3
const MAX_CUSTOM_COMPETITORS = 3

/** Agent message after wizard finish — replace with API copy in production */
export const ONBOARDING_SETUP_COMPLETE_MESSAGE =
  'Successfully updated your setup. Starting your AI visibility scan now.'

/** Lines for the user chat summary bubble — replace with API formatting in production */
export function buildOnboardingSummaryLines(payload) {
  const lines = []
  const gbp = payload?.gbp ?? {}
  if (gbp.gbpProfileLink?.trim()) {
    lines.push(`GBP profile link → ${gbp.gbpProfileLink.trim()}`)
  }
  if (gbp.websiteUrl?.trim()) {
    lines.push(`Website URL → ${gbp.websiteUrl.trim()}`)
  }
  if (gbp.brandName?.trim()) {
    lines.push(`Brand name → ${gbp.brandName.trim()}`)
  }
  if (gbp.country?.trim()) {
    const loc = gbp.stateRegion?.trim()
      ? `${gbp.country.trim()}, ${gbp.stateRegion.trim()}`
      : gbp.country.trim()
    lines.push(`Target location → ${loc}`)
  } else if (gbp.stateRegion?.trim()) {
    lines.push(`State / region → ${gbp.stateRegion.trim()}`)
  }
  if (payload?.keywords?.length) {
    lines.push(`Keywords → ${payload.keywords.map(k => k.keyword).join(', ')}`)
  }
  if (payload?.competitors?.length) {
    lines.push(
      `Competitors → ${payload.competitors
        .map(c => c.name || c.domain)
        .filter(Boolean)
        .join(', ')}`,
    )
  }
  return lines
}

export { MAX_CUSTOM_KEYWORDS, MAX_CUSTOM_COMPETITORS }

/** Step titles and descriptions for the 3-step AI visibility onboarding wizard */
export const ONBOARDING_STEPS = [
  {
    title: 'Connect your local profiles',
    description:
      'Confirm your live website and Google Business Profile coordinates for geographical crawler precision.',
  },
  {
    title: 'Top keywords to verify',
    description:
      'Select which business search phrases to verify. Add custom local queries you wish to prioritize.',
  },
  {
    title: 'Competitors to review',
    description:
      'Select competitors to benchmark visibility, AI search shares, and maps index placement.',
  },
]

/** Prototype default values for step 1 — replace with API / project data in production */
export const ONBOARDING_STEP1_DEFAULTS = {
  gbpProfileLink: '',
  websiteUrl: 'https://www.ethnix.salon',
  brandName: 'Ethnix',
  country: 'India',
  stateRegion: 'Karnataka',
}

/** Country options for target location — replace with API list in production */
export const ONBOARDING_COUNTRY_OPTIONS = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Singapore',
]

/**
 * Prefill GBP and website fields from the active project snapshot.
 * Replace with account + location API in production.
 */
export function buildOnboardingPrefill(project) {
  return {
    gbpProfileLink: project?.gbpUrl?.trim() || ONBOARDING_STEP1_DEFAULTS.gbpProfileLink,
    websiteUrl: project?.websiteUrl?.trim() || ONBOARDING_STEP1_DEFAULTS.websiteUrl,
    brandName: project?.gbpName?.trim() || project?.label?.trim() || ONBOARDING_STEP1_DEFAULTS.brandName,
    country: ONBOARDING_STEP1_DEFAULTS.country,
    stateRegion: ONBOARDING_STEP1_DEFAULTS.stateRegion,
  }
}
