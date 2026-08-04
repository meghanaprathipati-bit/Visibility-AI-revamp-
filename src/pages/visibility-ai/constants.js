import { markRaw } from 'vue'
import File06Icon from '@gohighlevel/ghl-icons/24/outline/File06Icon'
import PackageIcon from '@gohighlevel/ghl-icons/24/outline/PackageIcon'
import GraduationHat01Icon from '@gohighlevel/ghl-icons/24/outline/GraduationHat01Icon'
import CreditCard01Icon from '@gohighlevel/ghl-icons/24/outline/CreditCard01Icon'
import Stars01Icon from '@gohighlevel/ghl-icons/24/outline/Stars01Icon'
import BotIcon from '@gohighlevel/ghl-icons/24/outline/BotIcon'
import Send01Icon from '@gohighlevel/ghl-icons/24/outline/Send01Icon'
import RefreshCw01Icon from '@gohighlevel/ghl-icons/24/outline/RefreshCw01Icon'
import Globe01Icon from '@gohighlevel/ghl-icons/24/outline/Globe01Icon'
import CrownIcon from '@gohighlevel/ghl-icons/24/outline/CrownIcon'
import Image01Icon from '@gohighlevel/ghl-icons/24/outline/Image01Icon'
import Star01Icon from '@gohighlevel/ghl-icons/24/outline/Star01Icon'
import TrendUp01Icon from '@gohighlevel/ghl-icons/24/outline/TrendUp01Icon'
import Grid01Icon from '@gohighlevel/ghl-icons/24/outline/Grid01Icon'
import Tablet01Icon from '@gohighlevel/ghl-icons/24/outline/Tablet01Icon'
import Link01Icon from '@gohighlevel/ghl-icons/24/outline/Link01Icon'
import Users01Icon from '@gohighlevel/ghl-icons/24/outline/Users01Icon'
import MarkerPin01Icon from '@gohighlevel/ghl-icons/24/outline/MarkerPin01Icon'
import { QUICK_ACTIONS, getQuickActionLabelForPrompt } from '../../data/quickActions.js'

export { QUICK_ACTIONS, getQuickActionLabelForPrompt }

export const NAV_SECTIONS = [
  {
    items: [
      { icon: markRaw(File06Icon), label: 'Claims' },
      { icon: markRaw(PackageIcon), label: 'Batches' },
      { icon: markRaw(GraduationHat01Icon), label: 'Larnies' },
      { icon: markRaw(CreditCard01Icon), label: 'Payments' },
    ],
  },
  {
    items: [
      { icon: markRaw(Stars01Icon), label: 'AI Studio' },
      { icon: markRaw(BotIcon), label: 'AI Agents' },
      { icon: markRaw(Send01Icon), label: 'Marketing' },
      { icon: markRaw(RefreshCw01Icon), label: 'Automation' },
      { icon: markRaw(Globe01Icon), label: 'Sites' },
      { icon: markRaw(CrownIcon), label: 'Memberships' },
      { icon: markRaw(Image01Icon), label: 'Media Storage' },
      { icon: markRaw(Star01Icon), label: 'Reputation', active: true },
      { icon: markRaw(TrendUp01Icon), label: 'Reporting' },
      { icon: markRaw(Grid01Icon), label: 'App marketplace' },
      { icon: markRaw(Tablet01Icon), label: 'Mobile app' },
      { icon: markRaw(Link01Icon), label: 'affilaites custom' },
      { icon: markRaw(Users01Icon), label: 'Communities' },
    ],
  },
]

export const SUB_TABS = [
  'Overview', 'Requests', 'Reviews', 'Video Testimonials',
  'Widgets', 'Listings', 'GBP Optimization', 'Visibility AI', 'Settings',
]

// Dummy seed chats — replace with API data in production
export const INITIAL_CHATS = [
  { id: 0, label: 'New chat' },
  { id: 1, label: 'Full SEO crawl — Harborview Inn & Suites' },
  { id: 2, label: 'Technical health check — US' },
  { id: 3, label: 'Site crawlability audit — Harborview Inn & Suites' },
]

export const INITIAL_CHAT_LABELS = Object.fromEntries(
  INITIAL_CHATS.map(chat => [chat.id, chat.label]),
)

// Dummy seed projects — replace with API data in production
export const INITIAL_PROJECTS = [
  { id: 1, label: 'Harborview Inn & Suites' },
  { id: 2, label: 'Untitled Project 30' },
  { id: 3, label: 'Untitled Project 29' },
  { id: 4, label: 'website. Show profile health' },
  { id: 5, label: 'Untitled Project 17' },
  { id: 6, label: 'Untitled Project 28' },
]

const LISTINGS_SCAN_QUESTIONS = [
  {
    id: 'business-name-or-maps',
    label: 'Which specific business name or Google Maps link should I use for the listings scan?',
    type: 'text',
    placeholder: 'Enter your business name or Google Maps link',
    required: true,
    icon: markRaw(MarkerPin01Icon),
  },
]

const SEO_CRAWL_QUESTIONS = [
  {
    id: 'website-url',
    label: 'What is the website URL you want me to crawl for the SEO audit?',
    type: 'text',
    placeholder: 'e.g. example.com',
    required: true,
    icon: markRaw(Globe01Icon),
  },
  {
    id: 'seo-focus',
    label: 'What are you most concerned about?',
    type: 'radio',
    required: true,
    options: [
      'Technical issues & crawlability',
      'Page speed & Core Web Vitals',
      'Mobile readiness',
      'Overall health score',
    ],
  },
]

export const AI_VISIBILITY_QUESTIONS = [
  {
    id: 'website-url',
    label: 'What website URL should I check for AI search visibility?',
    type: 'text',
    placeholder: 'e.g. https://example.com',
    required: true,
    icon: markRaw(Globe01Icon),
  },
]

/** Returns clarifying questions for a prompt, or null — replace with API routing in production */
export function getClarifyingQuestions(text) {
  const lower = text.toLowerCase()
  if (lower.includes('listings') || lower.includes('gbp') || lower.includes('google business') || lower.includes('local publisher')) {
    return LISTINGS_SCAN_QUESTIONS
  }
  if (lower.includes('website seo') || lower.includes('crawl') || lower.includes('technical') || lower.includes('page speed') || lower.includes('mobile readiness') || lower.includes('health score')) {
    return SEO_CRAWL_QUESTIONS
  }
  return null
}
