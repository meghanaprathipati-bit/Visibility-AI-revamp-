import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  FileText, Package, GraduationCap, CreditCard,
  Sparkles, Bot, Send, RefreshCw, Globe, Crown, Image as ImageIcon,
  Star, TrendingUp, Grid3x3, Tablet, Link2, Users,
  ChevronDown, ChevronRight, Search, Plus, Settings,
  MessageChatSquareIcon, Grid01Icon, PanelLeftIcon, PanelRightIcon,
  BookOpen, Zap, Workflow, CheckSquare,
  Pencil, Trash2, Check, X, Copy, ThumbsUp, ThumbsDown,
  FolderPlus, MapPin, Calendar,
  Circle, CircleCheck, LoadingCircle, Wand2,
  ArrowUp, Loader2,
  LayoutGrid, MessageSquare, BarChart3, Lock01Icon,
} from '../icons/index.js'
import AppShell from '../shell/AppShell'
import AiSearchPerformanceDashboard from '../components/dashboards/AiSearchPerformanceDashboard.jsx'
import { ActionItemsPanel } from '../components/action-items/index.js'
import { deriveChatTitle, deriveChatTitleFromSession } from '../data/chatTitles.js'
import { buildScanResultsPayload, hydrateScanResultsMessages } from '../data/scanResults.js'
import { SEO_SCAN_PROMPT, isAutoScanPrompt, getScanKindFromPrompt } from '../data/scanPrompts.js'
import { buildVisibilityReport } from '../data/visibilityReport.js'
import DetailSidePanel from '../components/split-pane/DetailSidePanel.jsx'
import ActionItemsSummaryCard from '../components/split-pane/ActionItemsSummaryCard.jsx'
import DetailedReportPanel from '../components/split-pane/DetailedReportPanel.jsx'
import ScanQuickSummary from '../components/reports/ScanQuickSummary.jsx'
import VisibilityScanReport from '../components/reports/VisibilityScanReport.jsx'
import AiRankTrackingDashboard from '../components/dashboards/AiRankTrackingDashboard.jsx'
import OverviewDashboard from '../components/dashboards/OverviewDashboard.jsx'
import PromptTrackingDashboard from '../components/dashboards/PromptTrackingDashboard.jsx'
import SiteHealthDashboard from '../components/dashboards/SiteHealthDashboard.jsx'
import AiSentimentChart from '../components/dashboards/AiSentimentChart.jsx'
import EngineCoverageChart from '../components/dashboards/EngineCoverageChart.jsx'
import HLInput from '../components/HLInput.jsx'
import HLButton from '../components/HLButton.jsx'
import { DASHBOARD_ITEMS } from '../data/aiRankDashboard.js'
import ClarifyingQuestionsCard from '../components/ClarifyingQuestionsCard.jsx'
import InChatOnboardingCard from '../components/InChatOnboardingCard.jsx'
import AiVisibilitySetupCard from '../components/AiVisibilitySetupCard.jsx'
import { buildOnboardingPrefill, buildOnboardingSummaryLines, ONBOARDING_SETUP_COMPLETE_MESSAGE } from '../data/onboardingData.js'
import CloudflareTokenCard from '../components/implement/CloudflareTokenCard.jsx'
import ImplementProgressBlock from '../components/implement/ImplementProgressBlock.jsx'
import ImplementSummaryCard from '../components/implement/ImplementSummaryCard.jsx'
import { CLOUDFLARE_CONNECT_QUESTIONS, CLOUDFLARE_CONNECT_TITLE } from '../data/implementFlow.js'
import { buildImplementSummary, buildRescanSummary } from '../data/implementSummary.js'
import DesktopAccessModal from '../components/DesktopAccessModal.jsx'
import HLTooltip from '../components/HLTooltip.jsx'
import {
  SEO_SCAN_CHAT_ID,
  createSeoScanSession,
  createEmptySession,
} from '../data/seedChats.js'
import {
  SEO_SCAN_ACKNOWLEDGMENT,
  SEO_SCAN_CONTEXT,
  SEO_SCAN_LOADER_INTRO,
} from '../data/seoScanContent.js'

const NAV_SECTIONS = [
  {
    items: [
      { icon: FileText, label: 'Claims' },
      { icon: Package, label: 'Batches' },
      { icon: GraduationCap, label: 'Larnies' },
      { icon: CreditCard, label: 'Payments' },
    ],
  },
  {
    items: [
      { icon: Sparkles, label: 'AI Studio' },
      { icon: Bot, label: 'AI Agents' },
      { icon: Sparkles, label: 'Visibility', active: true },
      { icon: Send, label: 'Marketing' },
      { icon: RefreshCw, label: 'Automation' },
      { icon: Globe, label: 'Sites' },
      { icon: Crown, label: 'Memberships' },
      { icon: ImageIcon, label: 'Media Storage' },
      { icon: Star, label: 'Reputation' },
      { icon: TrendingUp, label: 'Reporting' },
      { icon: Grid3x3, label: 'App marketplace' },
      { icon: Tablet, label: 'Mobile app' },
      { icon: Link2, label: 'affilaites custom' },
      { icon: Users, label: 'Communities' },
    ],
  },
]

// Prototype dummy project list — metadata fields mirror New project modal (website, GBP, created date)
const INITIAL_PROJECTS = [
  { id: 1, label: 'Untitled Project 31', createdAt: '2026-06-12' },
  { id: 2, label: 'Untitled Project 30', websiteUrl: 'https://acmecorp.com' },
  { id: 3, label: 'Untitled Project 29', gbpUrl: 'https://maps.google.com/?cid=123456789' },
  { id: 4, label: 'website. Show profile health', websiteUrl: 'https://retailco.com', gbpUrl: 'https://maps.google.com/?cid=987654321' },
  { id: 5, label: 'Untitled Project 17', createdAt: '2026-05-03' },
  { id: 6, label: 'Untitled Project 28', websiteUrl: 'https://textileco.com' },
]

const INITIAL_CHATS = [
  { id: 1, label: 'GBP audit for Plumber 200' },
  { id: 2, label: 'AI visibility — ChatGPT' },
  { id: 3, label: 'example.com SEO crawl' },
]

const INITIAL_CHAT_LABELS = Object.fromEntries(INITIAL_CHATS.map(chat => [chat.id, chat.label]))

import { QUICK_ACTIONS, getQuickActionLabelForPrompt } from '../data/quickActions.js'

const TOOLS = [
  { icon: BookOpen, label: 'Prompt library' },
  { icon: Zap, label: 'Actions' },
  { icon: Workflow, label: 'Automations' },
  { icon: CheckSquare, label: 'To do' },
]

// Derives a short, context-aware chat title from the first user message — same approach as ChatGPT
function generateChatTitle(input) {
  const trimmed = input.trim()

  // URL present → use domain + intent prefix
  const urlMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?)/i)
  if (urlMatch) {
    const domain = urlMatch[1].toLowerCase()
    const lower = trimmed.toLowerCase()
    if (/\baudit\b|\bgbp\b/.test(lower)) return `GBP audit — ${domain}`
    if (/\bseo\b|\bcrawl\b/.test(lower)) return `SEO crawl — ${domain}`
    if (/\bai\b|\bvisibility\b/.test(lower)) return `AI visibility — ${domain}`
    if (/\bcompetitor\b|\banalysis\b/.test(lower)) return `Competitor analysis — ${domain}`
    if (/\bperformance\b|\btrack\b/.test(lower)) return `Performance — ${domain}`
    return `Visibility scan — ${domain}`
  }

  // No URL → first 5 meaningful words (strip stopwords)
  const stopwords = new Set(['a','an','the','and','or','but','in','on','at','to','for','of','with','by','from','is','are','how','can','i','my','me','us','our','do','does','what','show'])
  const words = trimmed
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopwords.has(w.toLowerCase()))
  const title = words.slice(0, 5).join(' ')
  if (!title) return trimmed.slice(0, 42) + (trimmed.length > 42 ? '…' : '')
  return title.charAt(0).toUpperCase() + title.slice(1)
}

// Dummy scan context — replace with API response in production
const SCAN_CONTEXT = SEO_SCAN_CONTEXT

// Clarifying question sets per scan type — replace with API-driven question sets in production

const LISTINGS_SCAN_QUESTIONS = [
  {
    id: 'business-name-or-maps',
    label: 'Which specific business name or Google Maps link should I use for the listings scan?',
    type: 'text',
    placeholder: 'Enter your business name or Google Maps link',
    required: true,
    icon: MapPin,
  },
]

const SEO_CRAWL_QUESTIONS = [
  {
    id: 'website-url',
    label: 'What is the website URL you want me to crawl for the SEO audit?',
    type: 'text',
    placeholder: 'e.g. example.com',
    required: true,
    icon: Globe,
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

const AI_VISIBILITY_QUESTIONS = [
  {
    id: 'website-url',
    label: 'What website URL should I check for AI search visibility?',
    type: 'text',
    placeholder: 'e.g. https://example.com',
    required: true,
    icon: Globe,
  },
]

/**
 * Returns the clarifying question set for a given prompt, or null if no questions needed.
 * Replace with API-driven question routing in production.
 */
function getClarifyingQuestions(text) {
  const lower = text.toLowerCase()
  if (lower.includes('listings') || lower.includes('gbp') || lower.includes('google business') || lower.includes('local publisher')) {
    return LISTINGS_SCAN_QUESTIONS
  }
  if (lower.includes('website seo') || lower.includes('crawl') || lower.includes('technical') || lower.includes('page speed') || lower.includes('mobile readiness') || lower.includes('health score')) {
    return SEO_CRAWL_QUESTIONS
  }
  // AI visibility: questions appear AFTER the scan loader, not before — handled in onScanComplete
  return null
}

// Per-kind scan progress steps — replace with live job status from API in production
const SCAN_STEPS = {
  seo: [
    'Business details fetched — 9hf9h.com',
    'Preparing your visibility scan plan',
    'Scan plan ready — checking Local SEO Scan',
    'Google Business Profile checked — 9hf9h.com',
    'Scanning local publishers for your business',
    'Fetching reviews from review platforms',
    'Turning scan data into visibility insights',
    'Preparing your visibility report',
    'Preparing your scan summary',
  ],
  gbp: [
    'Preparing your visibility scan plan',
    'Scan plan ready — checking',
    'GBP Profile Scan data could not be loaded',
    'Listings Scan data could not be loaded',
    'Reviews analysis data ready',
    'Turning scan data into visibility insights',
    'Generating consolidated report',
    'Preparing your scan summary',
  ],
  'ai-visibility': [
    'Querying ChatGPT for your brand...',
    'Scanning Perplexity AI responses...',
    'Analyzing Google AI Overviews...',
    'Checking Gemini AI results...',
    'Measuring citation frequency across platforms...',
    'Calculating your AI visibility score...',
    'Preparing AI visibility report...',
  ],
  'ai-action-plan': [
    'Analyzing your website and GBP data...',
    'Evaluating local SEO performance gaps...',
    'Assessing AI search visibility...',
    'Benchmarking against top competitors...',
    'Building your custom action roadmap...',
    'Prioritizing recommendations by impact...',
    'Generating your full visibility action plan...',
  ],
  generic: [
    'Business details fetched',
    'Preparing visibility scan',
    'Running checks',
    'Compiling findings',
    'Preparing your report',
  ],
  rescan: [
    'Re-crawling updated pages',
    'Verifying manual GBP changes',
    'Checking structured data updates',
    'Updating visibility score',
    'Preparing rescan summary',
  ],
}
// GBP partial-failure: steps at these indices show as errors but the scan continues to completion
const GBP_PARTIAL_FAIL_STEPS = new Set([2, 3])

// Initial "already done" steps per kind (for visual progress effect)
const SCAN_INITIAL_DONE = { seo: -1, gbp: 0, 'ai-visibility': 2, 'ai-visibility-prep': 0, 'ai-action-plan': 1, generic: 1, rescan: 0 }

// Intro message shown above the progress steps (non-SEO scan kinds)
const SCAN_INTRO = {
  gbp: `Running GBP, listings, and reviews scans. I'll keep you updated as each step completes.`,
  'ai-visibility-prep': `Got it — let me set up your AI visibility scan. I'll need one quick detail to get started.`,
  'ai-visibility': `Got your URL. Now checking how your brand appears across AI search engines — ChatGPT, Perplexity, Gemini, and Google AI Overviews.`,
  'ai-action-plan': `Analyzing your business data to build a custom action plan...`,
  rescan: `Rescanning your site to verify manual fixes and update your visibility score.`,
  generic: `Running your visibility scan. I'll keep you updated as each step completes.`,
}

const DASHBOARD_ACCORDION_SECTIONS = [
  {
    id: 'ai-search',
    label: 'AI Search',
    icon: Bot,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    children: [
      { id: 'ai-search-performance', label: 'AI Search Performance' },
      { id: 'prompt-tracking', label: 'Prompt Tracking' },
      { id: 'ai-health', label: 'AI Health', locked: true },
      { id: 'bot-activity-ai', label: 'Bot Activity', locked: true },
    ],
  },
  {
    id: 'search-engines',
    label: 'Search Engines',
    icon: Search,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    children: [
      { id: 'search-performance', label: 'Search Performance', locked: true },
      { id: 'keyword-rankings', label: 'Keyword Rankings', locked: true },
      { id: 'keyword-research', label: 'Keyword Research', comingSoon: true },
      { id: 'site-health', label: 'Site Health' },
      { id: 'backlinks', label: 'Backlinks', locked: true },
      { id: 'bot-activity', label: 'Bot Activity', comingSoon: true },
    ],
  },
  {
    id: 'google-business-profile',
    label: 'Google Business Profile',
    icon: MapPin,
    iconBg: 'bg-success-50',
    iconColor: 'text-success-600',
    children: [
      { id: 'profile-health', label: 'Profile Health' },
      { id: 'map-rankings', label: 'Map Rankings' },
      { id: 'post-scheduler', label: 'Post Scheduler', comingSoon: true },
      { id: 'qa-automation', label: 'Q&A Automation', comingSoon: true },
    ],
  },
  {
    id: 'listings',
    label: 'Listings',
    icon: Link2,
    iconBg: 'bg-success-50',
    iconColor: 'text-success-600',
    children: [
      { id: 'listings-health', label: 'Listings Health' },
      { id: 'listings-manager', label: 'Listings Manager', comingSoon: true },
    ],
  },
  {
    id: 'reviews',
    label: 'Reviews',
    icon: MessageSquare,
    iconBg: 'bg-success-50',
    iconColor: 'text-success-600',
    children: [
      { id: 'review-health', label: 'Review Health' },
      { id: 'review-manager', label: 'Review Manager', comingSoon: true },
    ],
  },
  {
    id: 'content',
    label: 'Content',
    icon: FileText,
    iconBg: 'bg-error-50',
    iconColor: 'text-error-600',
    children: [
      { id: 'content-studio', label: 'Content Studio', comingSoon: true },
      { id: 'content-research', label: 'Content Research', comingSoon: true },
      { id: 'press-releases', label: 'Press Releases', comingSoon: true },
    ],
  },
  {
    id: 'competitors',
    label: 'Competitors',
    icon: Users,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    children: [
      { id: 'ai-presence', label: 'AI Presence', comingSoon: true },
      { id: 'search-presence', label: 'Search Presence', locked: true },
      { id: 'local-presence', label: 'Local Presence', comingSoon: true },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    iconBg: 'bg-primary-50',
    iconColor: 'text-primary-600',
    children: [
      { id: 'traffic-engagement', label: 'Traffic & Engagement' },
      { id: 'roi-attribution', label: 'ROI & Attribution', comingSoon: true },
      { id: 'reports', label: 'Reports', locked: true },
    ],
  },
]

// Panel layout: 1 product sidebar · 2 chat list · 3 conversational center · 4 contextual detail · 5 tools
function isChatConversational(chatId, sessions, activeChatUsed) {
  if (activeChatUsed) return true
  const session = sessions[chatId]
  if (!session) return false
  return Boolean(session.chatMode || session.messages?.length)
}

export default function VisibilityAI() {
  const [activePanel, setActivePanel] = useState('Chats')
  const [selectedDashboardId, setSelectedDashboardId] = useState('overview')
  const [chatPanelCollapsed, setChatPanelCollapsed] = useState(false)
  const [toolsPanelCollapsed, setToolsPanelCollapsed] = useState(false)
  const [composerFocusKey, setComposerFocusKey] = useState(0)
  const [composerHasInput, setComposerHasInput] = useState(false)
  // true once the current "New chat" has had at least one message sent
  const [activeChatUsed, setActiveChatUsed] = useState(false)
  const [detailPanel, setDetailPanel] = useState(null)
  /** Prototype implement flow state — replace with API job state in production */
  const [implementFlow, setImplementFlow] = useState(null)
  const [activeChatId, setActiveChatId] = useState(1)
  const [projects, setProjects] = useState(INITIAL_PROJECTS)
  const [activeProjectId, setActiveProjectId] = useState(1)
  const [nextProjectId, setNextProjectId] = useState(INITIAL_PROJECTS.length + 1)
  const [chatSessions, setChatSessions] = useState({
    [SEO_SCAN_CHAT_ID]: createSeoScanSession(),
  })
  const [chatLabels, setChatLabels] = useState(INITIAL_CHAT_LABELS)
  const sessionDraftRef = useRef({})
  const prevConversationalRef = useRef(false)

  function handleCreateProject(data) {
    const id = nextProjectId
    const websiteUrl = data.websiteUrl?.trim() || undefined
    const gbpUrl = data.gbpUrl?.trim() || undefined
    setProjects(prev => [
      {
        id,
        label: data.name,
        ...(websiteUrl ? { websiteUrl } : {}),
        ...(gbpUrl ? { gbpUrl } : {}),
        ...(!websiteUrl && !gbpUrl ? { createdAt: new Date().toISOString().slice(0, 10) } : {}),
      },
      ...prev,
    ])
    setActiveProjectId(id)
    setNextProjectId(n => n + 1)
  }

  function applyAutoChatTitle(chatId, titleOrMessage, useAsIs = false) {
    if (chatId == null || !titleOrMessage?.trim()) return
    const title = useAsIs ? titleOrMessage.trim() : deriveChatTitle(titleOrMessage)
    setChatLabels(prev => {
      const current = prev[chatId]
      // First send names the chat; always apply while still on the "New chat" placeholder
      if (current && current !== 'New chat') return prev
      return { ...prev, [chatId]: title }
    })
  }

  function handleStartImplement(selectedItems) {
    const skipCloudflare = Boolean(implementFlow?.cloudflareConnected)
    setImplementFlow(prev => ({
      ...(prev || {}),
      step: skipCloudflare ? 'implementing' : 'cloudflare-token',
      selectedItems,
      panelItems: detailPanel?.type === 'action-items' ? (detailPanel.items ?? []) : [],
      cloudflareConnected: prev?.cloudflareConnected ?? false,
      freeImplementDone: prev?.freeImplementDone ?? false,
      allAutoFixesDone: prev?.allAutoFixesDone ?? false,
      resolvedItemIds: prev?.resolvedItemIds ?? [],
      skipCloudflare,
      initKey: Date.now(),
    }))
  }

  function handleRescanSite() {
    // Prototype — replace with rescan job + panel refresh from API in production
    setImplementFlow(prev => ({
      ...(prev || {}),
      rescanKey: Date.now(),
      rescanPending: true,
    }))
  }

  function handleRescanComplete(summary) {
    const verifiedIds = (summary?.applied ?? []).map(item => item.id)
    setImplementFlow(prev => (prev ? {
      ...prev,
      rescanPending: false,
      resolvedItemIds: [...new Set([...(prev.resolvedItemIds ?? []), ...verifiedIds])],
    } : prev))
  }

  // Resolved items stay in the panel — ActionItemsPanel renders them under "Resolved items"

  function syncChatTitleFromSession(chatId, session) {
    if (!session?.messages?.length) return
    const title = deriveChatTitleFromSession(session)
    if (!title || chatId == null) return
    setChatLabels(prev => {
      const current = prev[chatId]
      if (current && current !== 'New chat') return prev
      return { ...prev, [chatId]: title }
    })
  }

  useEffect(() => {
    setChatLabels(prev => {
      let changed = false
      const next = { ...prev }
      for (const [idStr, session] of Object.entries(chatSessions)) {
        const id = Number(idStr)
        if (next[id] && next[id] !== 'New chat') continue
        const title = deriveChatTitleFromSession(session)
        if (title && next[id] !== title) {
          next[id] = title
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [chatSessions])

  // Pane 5: collapsed in conversational chat, open on landing (user expands via toggle).
  useEffect(() => {
    if (activePanel === 'Dashboards') {
      setToolsPanelCollapsed(false)
      prevConversationalRef.current = false
      return
    }

    const isConversational = isChatConversational(activeChatId, chatSessions, activeChatUsed)
    if (isConversational === prevConversationalRef.current) return

    setToolsPanelCollapsed(isConversational)
    prevConversationalRef.current = isConversational
  }, [activePanel, activeChatId, chatSessions, activeChatUsed])

  // Pane 2: stays open during chat; collapses only when pane 4 (action items / report) is open.
  useEffect(() => {
    if (activePanel === 'Dashboards') {
      setChatPanelCollapsed(false)
      return
    }
    setChatPanelCollapsed(Boolean(detailPanel))
  }, [activePanel, detailPanel])

  function handleSelectChat(chatId) {
    setChatSessions(prev => {
      const next = { ...prev }
      if (sessionDraftRef.current && activeChatId != null) {
        next[activeChatId] = sessionDraftRef.current
      }
      if (chatId === SEO_SCAN_CHAT_ID && !next[chatId]) {
        next[chatId] = createSeoScanSession()
      }
      return next
    })
    setActiveChatId(chatId)
    setDetailPanel(null)
    setComposerHasInput(false)
    setActiveChatUsed(chatId !== SEO_SCAN_CHAT_ID && Boolean(chatSessions[chatId]?.messages?.length))
  }

  function handleNewChatSession(newChatId) {
    setChatSessions(prev => {
      const next = { ...prev }
      if (sessionDraftRef.current && activeChatId != null) {
        next[activeChatId] = sessionDraftRef.current
      }
      next[newChatId] = createEmptySession()
      return next
    })
    sessionDraftRef.current = createEmptySession()
    setActiveChatId(newChatId)
    setComposerFocusKey(k => k + 1)
    setComposerHasInput(false)
    setActiveChatUsed(false)
    setDetailPanel(null)
  }

  function handleSessionDraft(session) {
    sessionDraftRef.current = session
    syncChatTitleFromSession(activeChatId, session)
  }

  function handleMessageSent(sessionSnapshot) {
    setActiveChatUsed(true)
    if (sessionSnapshot && activeChatId != null) {
      setChatSessions(prev => ({
        ...prev,
        [activeChatId]: sessionSnapshot,
      }))
    }
  }

  return (
    <AppShell
      sidebar="main-nav"
      sidebarProps={{ navSections: NAV_SECTIONS, defaultCollapsed: true }}
      topbar="simple"
      topbarProps={{ title: '' }}
    >
      <div
        className="grid flex-1 min-w-0 min-h-0 overflow-hidden bg-white"
        style={{
          gridTemplateColumns: `${chatPanelCollapsed ? 56 : 280}px 1fr ${toolsPanelCollapsed ? 56 : 200}px`,
          gridTemplateRows: 'minmax(0, 1fr)',
        }}
      >
        <ChatPanel
          activePanel={activePanel}
          activeChatId={activeChatId}
          chatLabels={chatLabels}
          projects={projects}
          activeProjectId={activeProjectId}
          onActiveProjectChange={setActiveProjectId}
          onCreateProject={handleCreateProject}
          onChatLabelChange={(chatId, label) => {
            setChatLabels(prev => ({ ...prev, [chatId]: label }))
          }}
          onSelectChat={handleSelectChat}
          onPanelChange={tab => {
            setActivePanel(tab)
            if (tab === 'Dashboards') setDetailPanel(null)
          }}
          selectedDashboardId={selectedDashboardId}
          onSelectDashboard={setSelectedDashboardId}
          collapsed={chatPanelCollapsed}
          onToggleCollapse={() => setChatPanelCollapsed(c => !c)}
          onNewChat={handleNewChatSession}
          composerHasInput={composerHasInput}
          activeChatUsed={activeChatUsed}
        />
        <div className="flex min-w-0 min-h-0 overflow-hidden">
          {activePanel === 'Dashboards' ? (
            selectedDashboardId === 'overview'
              ? <OverviewDashboard />
              : selectedDashboardId === 'ai-search-performance'
                ? <AiSearchPerformanceDashboard />
                : selectedDashboardId === 'prompt-tracking'
                  ? <PromptTrackingDashboard />
                  : selectedDashboardId === 'site-health'
                    ? <SiteHealthDashboard />
                    : <AiRankTrackingDashboard />
          ) : (
            <>
              <MainContent
                activeChatId={activeChatId}
                loadedSession={chatSessions[activeChatId]}
                activeProject={projects.find(p => p.id === activeProjectId)}
                onSessionDraft={handleSessionDraft}
                onChatAutoTitle={(title, useAsIs) => applyAutoChatTitle(activeChatId, title, useAsIs)}
                composerFocusKey={composerFocusKey}
                onInputChange={setComposerHasInput}
                onMessageSent={handleMessageSent}
                detailPanelOpen={Boolean(detailPanel)}
                onOpenDetailPanel={setDetailPanel}
                implementFlow={implementFlow}
                onImplementFlowChange={setImplementFlow}
                onRescanComplete={handleRescanComplete}
              />
              {detailPanel && (
                <DetailSidePanel
                  type={detailPanel.type}
                  title={detailPanel.title}
                  subtitle={detailPanel.subtitle}
                  onClose={() => setDetailPanel(null)}
                >
                  {detailPanel.type === 'action-items' && (
                    <ActionItemsPanel
                      items={detailPanel.items}
                      embedded
                      implementFlow={implementFlow}
                      onStartImplement={handleStartImplement}
                      onCancel={() => setDetailPanel(null)}
                      onRescan={handleRescanSite}
                    />
                  )}
                  {detailPanel.type === 'report' && (
                    <DetailedReportPanel report={detailPanel.report} />
                  )}
                </DetailSidePanel>
              )}
            </>
          )}
        </div>
        <ToolsPanel
          collapsed={toolsPanelCollapsed}
          onToggleCollapse={() => setToolsPanelCollapsed(c => !c)}
        />
      </div>
    </AppShell>
  )
}

function ThumbsUpIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  )
}

function ThumbsDownIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  )
}

function StopSquareIcon({ size = 10, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="currentColor" className={className}>
      <rect width="10" height="10" rx="1.5" />
    </svg>
  )
}

function TypingText() {
  const phrases = [
    'Check your AI visibility across ChatGPT, Perplexity, and Google',
    'Audit your Google Business Profile in seconds',
    'Crawl your website to find SEO issues',
    'Track your local rank against competitors',
  ]
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = phrases[phraseIdx]
    if (!deleting && text === current) {
      const t = setTimeout(() => setDeleting(true), 1800)
      return () => clearTimeout(t)
    }
    if (deleting && text === '') {
      setDeleting(false)
      setPhraseIdx(i => (i + 1) % phrases.length)
      return
    }
    const speed = deleting ? 22 : 42
    const t = setTimeout(() => {
      setText(prev =>
        deleting ? prev.slice(0, -1) : current.slice(0, prev.length + 1)
      )
    }, speed)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, deleting, phraseIdx])

  return (
    <div className="min-h-[28px] flex items-center justify-center">
      <span className="text-[16px] text-gray-500 font-normal leading-relaxed">{text}</span>
      <span className="inline-block w-[2px] h-[18px] bg-purple-600 ml-0.5 animate-pulse align-middle" />
    </div>
  )
}

function formatProjectWebsiteDisplay(url) {
  if (!url?.trim()) return ''
  try {
    const normalized = url.includes('://') ? url : `https://${url}`
    return new URL(normalized).hostname.replace(/^www\./, '')
  } catch {
    return url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]
  }
}

function formatProjectCreatedDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`)
  return `Created ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

function ProjectMetadataLine({ project }) {
  const website = project.websiteUrl?.trim()
  const gbp = project.gbpUrl?.trim()
  const metaClass = 'flex items-center gap-1 mt-0.5 min-w-0 text-[13px] text-gray-500'

  if (website && gbp) {
    return (
      <div className={metaClass}>
        <Globe size={12} className="text-gray-400 shrink-0" />
        <span className="truncate">{formatProjectWebsiteDisplay(website)}</span>
        <span className="text-gray-400 shrink-0">·</span>
        <MapPin size={12} className="text-gray-400 shrink-0" />
        <span className="truncate">Google Business</span>
      </div>
    )
  }

  if (website) {
    return (
      <div className={metaClass}>
        <Globe size={12} className="text-gray-400 shrink-0" />
        <span className="truncate">{formatProjectWebsiteDisplay(website)}</span>
      </div>
    )
  }

  if (gbp) {
    return (
      <div className={metaClass}>
        <MapPin size={12} className="text-gray-400 shrink-0" />
        <span className="truncate">Google Business Profile</span>
      </div>
    )
  }

  if (project.createdAt) {
    return (
      <div className={metaClass}>
        <Calendar size={12} className="text-gray-400 shrink-0" />
        <span className="truncate">{formatProjectCreatedDate(project.createdAt)}</span>
      </div>
    )
  }

  return null
}

function ProjectDropdownItem({ project, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-start w-full px-4 py-2.5 text-left transition-colors ${
        isActive ? 'bg-primary-50' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-normal text-gray-700 truncate">{project.label}</div>
        <ProjectMetadataLine project={project} />
      </div>
      {isActive && <Check size={14} className="text-primary-600 shrink-0 ml-2 mt-0.5" />}
    </button>
  )
}

function ChatPanel({
  activePanel,
  activeChatId,
  chatLabels = {},
  projects,
  activeProjectId,
  onActiveProjectChange,
  onCreateProject,
  onChatLabelChange,
  onSelectChat,
  onPanelChange,
  selectedDashboardId,
  onSelectDashboard,
  collapsed,
  onToggleCollapse,
  onNewChat,
  composerHasInput,
  activeChatUsed,
}) {
  const [chats, setChats] = useState(INITIAL_CHATS)
  const [editingId, setEditingId] = useState(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [nextId, setNextId] = useState(INITIAL_CHATS.length + 1)
  const [searchQuery, setSearchQuery] = useState('')
  const [dashboardSearchQuery, setDashboardSearchQuery] = useState('')
  const [expandedSections, setExpandedSections] = useState(new Set(['ai-search']))
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false)
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false)
  const [collapsedSearchOpen, setCollapsedSearchOpen] = useState(false)
  const dropdownRef = useRef(null)
  const collapsedSearchRef = useRef(null)

  function handleCreateProject(data) {
    onCreateProject?.(data)
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProjectDropdownOpen(false)
      }
      if (collapsedSearchRef.current && !collapsedSearchRef.current.contains(e.target)) {
        setCollapsedSearchOpen(false)
      }
    }
    if (projectDropdownOpen || collapsedSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [projectDropdownOpen, collapsedSearchOpen])

  function getChatLabel(chat) {
    return chatLabels[chat.id] ?? chat.label
  }

  function handleNewChat() {
    // Only redirect to existing empty chat if it hasn't been used yet
    const existingEmpty = chats.find(c => getChatLabel(c) === 'New chat')
    if (existingEmpty && !activeChatUsed) {
      onSelectChat?.(existingEmpty.id)
      return
    }
    const newId = nextId
    const newChat = { id: newId, label: 'New chat' }
    setChats(prev => [newChat, ...prev])
    setNextId(n => n + 1)
    onChatLabelChange?.(newId, 'New chat')
    onNewChat?.(newId)
  }

  function handleEdit(e, chat) {
    e.stopPropagation()
    setEditingId(chat.id)
    setEditingLabel(getChatLabel(chat))
  }

  function handleConfirmEdit(e) {
    if (e) e.stopPropagation()
    if (editingLabel.trim()) {
      setChats(prev => prev.map(c => c.id === editingId ? { ...c, label: editingLabel.trim() } : c))
      onChatLabelChange?.(editingId, editingLabel.trim())
    }
    setEditingId(null)
    setEditingLabel('')
  }

  function handleCancelEdit(e) {
    if (e) e.stopPropagation()
    setEditingId(null)
    setEditingLabel('')
  }

  function handleDelete(e, id) {
    e.stopPropagation()
    setChats(prev => {
      const remaining = prev.filter(c => c.id !== id)
      if (activeChatId === id && remaining.length > 0) {
        onSelectChat?.(remaining[0].id)
      }
      return remaining
    })
  }

  const hasEmptyUnusedNewChat =
    chats.some(c => getChatLabel(c) === 'New chat' && c.id === activeChatId) &&
    !composerHasInput &&
    !activeChatUsed

  const filteredChats = chats.filter(c =>
    getChatLabel(c).toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredDashboards = DASHBOARD_ITEMS.filter(d =>
    d.label.toLowerCase().includes(dashboardSearchQuery.toLowerCase()),
  )

  const projectDropdown = projectDropdownOpen && (
    <div className="absolute left-full top-0 ml-2 z-50 w-[240px] bg-white border border-gray-200 rounded-lg shadow-dropdown overflow-hidden">
      <button
        onClick={() => {
          setProjectDropdownOpen(false)
          setNewProjectModalOpen(true)
        }}
        className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-primary-600 hover:bg-primary-50 transition-colors"
      >
        <FolderPlus size={14} className="shrink-0" />
        <span className="text-[14px] font-medium">New project</span>
      </button>
      <div className="border-t border-gray-200" />
      <div className="max-h-[240px] overflow-y-auto scrollbar-gray-300">
        {projects.map(project => (
          <ProjectDropdownItem
            key={project.id}
            project={project}
            isActive={project.id === activeProjectId}
            onSelect={() => {
              onActiveProjectChange(project.id)
              setProjectDropdownOpen(false)
            }}
          />
        ))}
      </div>
    </div>
  )

  if (collapsed) {
    return (
      <aside className="relative w-full min-w-0 shrink-0 border-r border-gray-200 bg-white flex flex-col items-center pt-3 pb-3">
        <button
          onClick={onToggleCollapse}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          aria-label="Expand panel"
        >
          <PanelLeftIcon size={16} />
        </button>

        <div className="mt-3 flex flex-col items-center flex-1 min-h-0 w-full px-2">
          {/* Project selector */}
          <div className="relative" ref={dropdownRef}>
            <HLTooltip id="collapsed-project-tooltip" content="Project" variant="dark" placement="right">
              <button
                type="button"
                onClick={() => setProjectDropdownOpen(o => !o)}
                className={`size-9 rounded-lg flex items-center justify-center border transition-colors ${
                  projectDropdownOpen
                    ? 'border-primary-600 bg-primary-50 text-primary-600'
                    : 'border-primary-200 bg-gray-50 text-primary-600 hover:bg-primary-50'
                }`}
                aria-label="Project"
                aria-describedby="collapsed-project-tooltip"
              >
                <FolderPlus size={16} strokeWidth={1.75} />
              </button>
            </HLTooltip>
            {projectDropdown}
          </div>

          {/* Group 2: Tabs + New chat (matches expanded order) */}
          <div className="mt-[18px] flex flex-col items-center gap-2 w-full">
            <div className="flex flex-col items-center bg-gray-100 rounded-xl p-1 gap-0.5 w-10">
              <HLTooltip id="collapsed-chats-tab-tooltip" content="Chats" variant="dark" placement="right">
                <button
                  type="button"
                  onClick={() => onPanelChange('Chats')}
                  className={`size-8 rounded-lg flex items-center justify-center transition-all duration-150 ${
                    activePanel === 'Chats'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-label="Chats"
                  aria-describedby="collapsed-chats-tab-tooltip"
                >
                  <MessageChatSquareIcon size={15} />
                </button>
              </HLTooltip>
              <HLTooltip id="collapsed-dashboards-tab-tooltip" content="Dashboards" variant="dark" placement="right">
                <button
                  type="button"
                  onClick={() => onPanelChange('Dashboards')}
                  className={`size-8 rounded-lg flex items-center justify-center transition-all duration-150 ${
                    activePanel === 'Dashboards'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  aria-label="Dashboards"
                  aria-describedby="collapsed-dashboards-tab-tooltip"
                >
                  <Grid01Icon size={15} />
                </button>
              </HLTooltip>
            </div>

            {activePanel === 'Chats' && (
              <HLTooltip id="collapsed-new-chat-tooltip" content="New chat" variant="dark" placement="right">
                <button
                  type="button"
                  onClick={handleNewChat}
                  disabled={hasEmptyUnusedNewChat}
                  className="size-9 rounded-lg flex items-center justify-center border border-primary-200 bg-white text-primary-600 hover:bg-primary-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="New chat"
                  aria-describedby="collapsed-new-chat-tooltip"
                >
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              </HLTooltip>
            )}
          </div>

          {/* Search */}
          <div className="mt-[18px] relative" ref={collapsedSearchRef}>
            <HLTooltip id="collapsed-search-tooltip" content="Search" variant="dark" placement="right">
              <button
                type="button"
                onClick={() => setCollapsedSearchOpen(o => !o)}
                className={`size-9 rounded-lg flex items-center justify-center transition-colors ${
                  collapsedSearchOpen
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                aria-label={activePanel === 'Chats' ? 'Search chats' : 'Search dashboards'}
                aria-describedby="collapsed-search-tooltip"
              >
                <Search size={16} strokeWidth={1.75} />
              </button>
            </HLTooltip>
            {collapsedSearchOpen && (
              <div className="absolute left-full top-0 ml-2 z-50 w-[220px] bg-white border border-gray-200 rounded-lg shadow-dropdown p-2">
                <HLInput
                  autoFocus
                  size="sm"
                  prefixIcon={Search}
                  value={activePanel === 'Chats' ? searchQuery : dashboardSearchQuery}
                  onChange={e =>
                    activePanel === 'Chats'
                      ? setSearchQuery(e.target.value)
                      : setDashboardSearchQuery(e.target.value)
                  }
                  placeholder="Search"
                  suffix={
                    (activePanel === 'Chats' ? searchQuery : dashboardSearchQuery) ? (
                      <button
                        type="button"
                        onClick={() =>
                          activePanel === 'Chats' ? setSearchQuery('') : setDashboardSearchQuery('')
                        }
                        className="text-gray-400 hover:text-gray-500"
                        aria-label="Clear search"
                      >
                        <X size={12} />
                      </button>
                    ) : undefined
                  }
                />
              </div>
            )}
          </div>

        </div>

        {/* Visibility settings */}
        <HLTooltip id="collapsed-settings-tooltip" content="Visibility settings" variant="dark" placement="right">
          <button
            type="button"
            className="size-9 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:text-primary-600 hover:bg-gray-200 transition-colors"
            aria-label="Visibility settings"
            aria-describedby="collapsed-settings-tooltip"
          >
            <Settings size={16} />
          </button>
        </HLTooltip>

        {newProjectModalOpen && (
          <NewProjectModal
            onClose={() => setNewProjectModalOpen(false)}
            onCreateProject={handleCreateProject}
          />
        )}
      </aside>
    )
  }

  return (
    <aside className="w-full min-w-0 shrink-0 border-r border-gray-200 bg-white flex flex-col hover-shows-scrollbar">

      {/* Visibility — product title */}
      <div className="flex items-center px-3 pt-3 pb-3 border-b border-gray-200">
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold text-gray-900 leading-tight truncate">Visibility</div>
          <div className="text-[12px] text-gray-500 leading-tight truncate">Search · AI · Local</div>
        </div>
        <button
          onClick={onToggleCollapse}
          className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Collapse panel"
        >
          <PanelLeftIcon size={16} />
        </button>
      </div>

      {/* Group 1: Project dropdown */}
      <div className="px-3 pt-3 shrink-0">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProjectDropdownOpen(o => !o)}
            className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-all border ${
              projectDropdownOpen
                ? 'bg-white border-primary-600 shadow-focus-primary-sm'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span className="text-[14px] font-medium text-gray-900 truncate flex-1 text-left">
              {projects.find(p => p.id === activeProjectId)?.label}
            </span>
            <ChevronDown
              size={13}
              className={`text-gray-400 shrink-0 transition-transform duration-200 ${projectDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {projectDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-dropdown overflow-hidden">
              <button
                onClick={() => {
                  setProjectDropdownOpen(false)
                  setNewProjectModalOpen(true)
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-primary-600 hover:bg-primary-50 transition-colors"
              >
                <FolderPlus size={14} className="shrink-0" />
                <span className="text-[14px] font-medium">New project</span>
              </button>
              <div className="border-t border-gray-200" />
              <div className="max-h-[240px] overflow-y-auto scrollbar-gray-300">
                {projects.map(project => (
                  <ProjectDropdownItem
                    key={project.id}
                    project={project}
                    isActive={project.id === activeProjectId}
                    onSelect={() => {
                      onActiveProjectChange(project.id)
                      setProjectDropdownOpen(false)
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Group 2: Tabs + New chat (coupled) */}
      <div className="px-3 mt-[18px] shrink-0 flex flex-col gap-2">
        <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-0.5">
          {['Chats', 'Dashboards'].map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => onPanelChange(tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[14px] font-medium transition-all duration-150 ${
                activePanel === tab
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab === 'Chats' ? (
                <MessageChatSquareIcon size={14} />
              ) : (
                <Grid01Icon size={14} />
              )}
              {tab}
            </button>
          ))}
        </div>
        {activePanel === 'Chats' && (
          <button
            type="button"
            onClick={handleNewChat}
            disabled={hasEmptyUnusedNewChat}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-primary-200 bg-white text-primary-600 text-[13px] font-semibold hover:bg-primary-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={14} strokeWidth={2.5} />
            New chat
          </button>
        )}
      </div>

      {/* Group 3: Search + list (decoupled from New chat) */}
      <div className="px-3 mt-[18px] pb-3 shrink-0">
        {activePanel === 'Chats' ? (
          <HLInput
            id="chat-panel-search-input"
            size="sm"
            prefixIcon={Search}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search"
            suffix={
              searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-gray-400 hover:text-gray-500"
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              ) : undefined
            }
          />
        ) : (
          <HLInput
            size="sm"
            prefixIcon={Search}
            value={dashboardSearchQuery}
            onChange={e => setDashboardSearchQuery(e.target.value)}
            placeholder="Search"
            suffix={
              dashboardSearchQuery ? (
                <button
                  type="button"
                  onClick={() => setDashboardSearchQuery('')}
                  className="text-gray-400 hover:text-gray-500"
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              ) : undefined
            }
          />
        )}
      </div>

      {/* Recents list / dashboard list */}
      <div className="flex-1 overflow-y-auto scrollbar-gray-300">
        {activePanel === 'Chats' ? (
        <div className="flex flex-col gap-0.5 px-2">
          {chats.filter(c => getChatLabel(c).toLowerCase().includes(searchQuery.toLowerCase())).map(chat => {
            const isActive = chat.id === activeChatId
            const isEditing = chat.id === editingId
            const displayLabel = getChatLabel(chat)
            return (
              <div
                key={chat.id}
                onClick={() => !isEditing && onSelectChat?.(chat.id)}
                className={`group flex items-center gap-2 px-2.5 h-9 rounded-lg w-full transition-colors cursor-pointer ${
                  isActive ? 'bg-primary-50' : 'hover:bg-gray-50'
                }`}
              >
                {isEditing ? (
                  <>
                    <input
                      autoFocus
                      value={editingLabel}
                      onChange={e => setEditingLabel(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleConfirmEdit()
                        if (e.key === 'Escape') handleCancelEdit()
                      }}
                      onClick={e => e.stopPropagation()}
                      className={`flex-1 min-w-0 py-0 text-[13px] bg-transparent outline-none leading-[1.5] ${isActive ? 'font-medium text-gray-900' : 'font-normal text-gray-700'}`}
                    />
                    <button
                      onClick={handleConfirmEdit}
                      className="shrink-0 p-1 text-success-600 hover:text-success-900 transition-colors rounded"
                    >
                      <Check size={12} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="shrink-0 p-1 text-gray-500 hover:text-gray-700 transition-colors rounded"
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className={`flex-1 min-w-0 text-[13px] truncate ${isActive ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                      {displayLabel}
                    </span>
                    <div className="shrink-0 items-center gap-0.5 hidden group-hover:flex">
                      <button
                        onClick={e => handleEdit(e, chat)}
                        className="p-1 text-gray-400 hover:text-gray-700 transition-colors rounded"
                        aria-label="Edit"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={e => handleDelete(e, chat.id)}
                        className="p-1 text-error-600 hover:text-error-700 transition-colors rounded"
                        aria-label="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
        ) : (
          <div className="flex flex-col px-2 pt-1 gap-0.5">
            {/* Overview — always visible top item */}
            {(!dashboardSearchQuery || 'overview'.includes(dashboardSearchQuery.toLowerCase())) && (
              <button
                type="button"
                onClick={() => onSelectDashboard?.('overview')}
                className={`flex items-center gap-2.5 px-2.5 h-9 rounded-lg w-full transition-colors text-left ${
                  selectedDashboardId === 'overview' ? 'bg-primary-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-primary-50">
                  <LayoutGrid size={14} className="text-primary-600" />
                </div>
                <span className={`flex-1 min-w-0 text-[13px] truncate ${
                  selectedDashboardId === 'overview' ? 'font-semibold text-primary-600' : 'font-medium text-gray-700'
                }`}>
                  Overview
                </span>
              </button>
            )}

            {/* Accordion sections */}
            <div className="mt-3 flex flex-col gap-0.5">
              {DASHBOARD_ACCORDION_SECTIONS.map(section => {
                const query = dashboardSearchQuery.toLowerCase()
                const sectionMatches = !query || section.label.toLowerCase().includes(query)
                const matchingChildren = query
                  ? section.children.filter(c => c.label.toLowerCase().includes(query))
                  : section.children
                if (query && !sectionMatches && matchingChildren.length === 0) return null

                const visibleChildren = sectionMatches ? section.children : matchingChildren
                const isExpanded = expandedSections.has(section.id) || (query && matchingChildren.length > 0)
                const SectionIcon = section.icon

                return (
                  <div key={section.id} className="flex flex-col">
                    {/* Section header — icon left, chevron right */}
                    <button
                      type="button"
                      onClick={() => {
                        setExpandedSections(prev => {
                          const next = new Set(prev)
                          if (next.has(section.id)) next.delete(section.id)
                          else next.add(section.id)
                          return next
                        })
                      }}
                      className="flex items-center gap-2.5 px-2.5 h-9 rounded-lg w-full hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${section.iconBg}`}>
                        <SectionIcon size={14} className={section.iconColor} />
                      </div>
                      <span className="flex-1 min-w-0 text-[13px] font-semibold text-gray-800 truncate">
                        {section.label}
                      </span>
                      <ChevronDown
                        size={13}
                        className={`text-gray-400 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Children — indented, no border-l line */}
                    {isExpanded && (
                      <div className="flex flex-col gap-0.5 mt-0.5 mb-1 ml-9">
                        {visibleChildren.map(child => {
                          const isActive = selectedDashboardId === child.id
                          const isDisabled = child.locked || child.comingSoon
                          return (
                            <button
                              key={child.id}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => !isDisabled && onSelectDashboard?.(child.id)}
                              className={`flex items-center gap-2 w-full px-3 h-8 rounded-lg text-left transition-colors ${
                                isActive
                                  ? 'bg-primary-50'
                                  : isDisabled
                                    ? 'cursor-default'
                                    : 'hover:bg-gray-50'
                              }`}
                            >
                              <span className={`flex-1 min-w-0 text-[13px] truncate ${
                                isActive
                                  ? 'font-semibold text-primary-600'
                                  : isDisabled
                                    ? 'text-gray-400'
                                    : 'text-gray-600'
                              }`}>
                                {child.label}
                              </span>
                              {child.comingSoon && (
                                <span className="shrink-0 text-[10px] font-medium text-gray-400 bg-gray-100 rounded-full px-2 py-0.5 leading-none">
                                  Soon
                                </span>
                              )}
                              {child.locked && (
                                <Lock01Icon size={12} className="text-gray-300 shrink-0" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Visibility settings footer */}
      <div className="border-t border-gray-200 px-3 py-3">
        <button className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] font-medium text-gray-600 hover:text-primary-600 transition-colors">
          <Settings size={14} />
          Visibility settings
        </button>
      </div>

      {newProjectModalOpen && (
        <NewProjectModal
          onClose={() => setNewProjectModalOpen(false)}
          onCreateProject={handleCreateProject}
        />
      )}

    </aside>
  )
}

function MessageFeedback() {
  return (
    <div className="flex items-center gap-3 mt-3">
      <button type="button" className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Good response">
        <ThumbsUpIcon size={15} />
      </button>
      <button type="button" className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Bad response">
        <ThumbsDownIcon size={15} />
      </button>
      <button type="button" className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Copy response">
        <Copy size={15} />
      </button>
    </div>
  )
}

function XCircleIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" /><path d="m9 9 6 6" />
    </svg>
  )
}

function ScanProgressList({ scanKind = 'seo', onComplete, completed = false }) {
  const steps = SCAN_STEPS[scanKind] || SCAN_STEPS.generic
  const initialDone = completed ? steps.length - 1 : (SCAN_INITIAL_DONE[scanKind] ?? 1)
  const [doneUpTo, setDoneUpTo] = useState(initialDone)
  const calledRef = useRef(false)

  // Per-kind partial-failure steps — these show error icons but the scan keeps running
  const partialFailSteps = scanKind === 'gbp' ? GBP_PARTIAL_FAIL_STEPS : null

  useEffect(() => {
    if (completed) return
    if (doneUpTo >= steps.length - 1) {
      if (!calledRef.current && onComplete) {
        calledRef.current = true
        onComplete()
      }
      return
    }
    const timer = setTimeout(() => setDoneUpTo(s => s + 1), 2600)
    return () => clearTimeout(timer)
  }, [doneUpTo, completed, steps.length, onComplete])

  return (
    <div className="flex flex-col gap-2.5">
      {steps.map((label, i) => {
        const isDone = i <= doneUpTo
        const isPartialFail = isDone && partialFailSteps?.has(i)
        const isActive = !completed && i === doneUpTo + 1 && doneUpTo < steps.length - 1
        const isPending = !isDone && !isActive

        return (
          <div key={label} className="flex items-center gap-3">
            {isDone && !isPartialFail && <CircleCheck size={16} className="text-teal-600 shrink-0" />}
            {isPartialFail && <XCircleIcon size={16} className="text-error-600 shrink-0" />}
            {isActive && <LoadingCircle size={16} className="text-primary-600" />}
            {isPending && <Circle size={16} className="text-gray-300 shrink-0" />}
            <span className={`text-[13px] leading-snug ${
              isPartialFail ? 'font-medium text-error-600' :
              isActive ? 'font-medium text-gray-900' :
              isDone ? 'text-gray-700' : 'text-gray-400'
            }`}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function ScanConversationBlock({ scanKind = 'seo', onComplete, loaderIntro }) {
  const isSeoScan = scanKind === 'seo'
  const intro =
    loaderIntro ??
    (!isSeoScan ? SCAN_INTRO[scanKind] || SCAN_INTRO.generic : null)

  return (
    <div className="flex flex-col gap-3.5">
      {intro && <p className="text-[14px] text-gray-700 leading-relaxed">{intro}</p>}
      {isSeoScan && (
        <p className="text-[14px] text-gray-700 leading-relaxed">{SEO_SCAN_LOADER_INTRO}</p>
      )}
      <ScanProgressList scanKind={scanKind} onComplete={onComplete} />
    </div>
  )
}

function appendScanMessages(prev, scanKind, ts, extra = {}) {
  const withoutScan = prev.filter(m => m.content !== 'scan')
  return [...withoutScan, { id: Date.now(), type: 'ai', content: 'scan', scanKind, ts, ...extra }]
}

const MAX_COMPOSER_HEIGHT = 160 // px — ~5 lines before scroll

function PromptComposer({
  value,
  onChange,
  onSend,
  inputRef,
  focusKey = 0,
  placeholder = 'Enter your website URL or ask a specialized question',
  scanning = false,
  onStop,
  attachedMode = false,
}) {
  const internalRef = useRef(null)
  const [isFocused, setIsFocused] = useState(!scanning)
  const [filePickerOpen, setFilePickerOpen] = useState(false)
  const hasText = value.trim().length > 0

  // Auto-grow textarea
  useEffect(() => {
    const el = internalRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, MAX_COMPOSER_HEIGHT) + 'px'
  }, [value])

  useEffect(() => {
    if (scanning) return
    setIsFocused(true)
    internalRef.current?.focus()
  }, [focusKey, scanning])

  function setRefs(node) {
    internalRef.current = node
    if (typeof inputRef === 'function') inputRef(node)
    else if (inputRef) inputRef.current = node
  }

  function handleKeyDown(e) {
    if (scanning) return
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (hasText) onSend()
    }
  }

  const scanPlaceholder = 'Scan in progress. Results will appear here automatically.'

  return (
    <>
    <div
      className={`w-full bg-white flex flex-col overflow-hidden ${
        attachedMode
          ? 'border-0 rounded-none shadow-none'
          : 'rounded-2xl border border-solid transition-all duration-200'
      }`}
      style={attachedMode ? undefined : {
        borderColor: '#6938EF66',
        boxShadow: isFocused && !scanning
          ? '#6938EF14 0px 0px 0px 4px, #6938EF38 0px 12px 36px -12px'
          : '#6938EF0A 0px 0px 0px 2px, #6938EF1A 0px 4px 16px -4px',
      }}
    >
      <div className="relative w-full min-h-[44px]">
        <textarea
          ref={setRefs}
          id="vai-prompt-composer"
          rows={1}
          value={scanning ? '' : value}
          onChange={scanning ? undefined : onChange}
          onKeyDown={handleKeyDown}
          onFocus={() => !scanning && setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={scanning ? scanPlaceholder : placeholder}
          disabled={scanning}
          aria-label="Prompt input"
          style={{ maxHeight: MAX_COMPOSER_HEIGHT, overflowY: 'auto' }}
          className={`w-full resize-none text-[14px] text-gray-900 placeholder:text-gray-400 bg-transparent outline-none border-0 leading-[1.5] px-4 pt-3 pb-1 ${
            scanning ? 'cursor-not-allowed' : ''
          }`}
        />
      </div>

      <div className="flex items-center px-2 pb-2 pt-1 gap-1 overflow-visible">
        {!scanning && (
          <button
            type="button"
            onClick={() => setFilePickerOpen(true)}
            className="size-8 rounded-full flex items-center justify-center shrink-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Add attachment"
          >
            <Plus size={16} strokeWidth={2} />
          </button>
        )}

        <div className="flex-1" />

        {scanning ? (
          <button
            type="button"
            onClick={onStop}
            className="size-9 rounded-full flex items-center justify-center shrink-0 border border-gray-300 bg-white hover:bg-gray-50 text-gray-500 transition-colors"
            aria-label="Stop scan"
          >
            <StopSquareIcon size={10} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSend}
            disabled={!hasText}
            className={`size-9 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-xs ${
              hasText
                ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                : 'bg-purple-200 text-white cursor-not-allowed'
            }`}
            aria-label="Send message"
            aria-disabled={!hasText}
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>

    <DesktopAccessModal
      open={filePickerOpen}
      onClose={() => setFilePickerOpen(false)}
      onOpenFile={() => setFilePickerOpen(false)}
    />
    </>
  )
}

function AiFeedbackRow({ ts }) {
  const [copied, setCopied] = useState(false)
  const [vote, setVote] = useState(null)

  function handleCopy() {
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-1 mt-2">
      <div className="flex items-center gap-1">
        <button
          onClick={() => setVote(v => (v === 'up' ? null : 'up'))}
          className={`p-1.5 rounded-md transition-colors ${vote === 'up' ? 'text-primary-600 bg-primary-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          aria-label="Helpful"
        >
          <ThumbsUpIcon size={15} />
        </button>
        <button
          onClick={() => setVote(v => (v === 'down' ? null : 'down'))}
          className={`p-1.5 rounded-md transition-colors ${vote === 'down' ? 'text-error-600 bg-error-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          aria-label="Not helpful"
        >
          <ThumbsDownIcon size={15} />
        </button>
        <button
          onClick={handleCopy}
          className={`p-1.5 rounded-md transition-colors ${copied ? 'text-success-600 bg-success-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          aria-label="Copy response"
        >
          <Copy size={15} />
        </button>
      </div>
      {ts && <span className="text-[11px] text-gray-400 pl-0.5">{ts}</span>}
    </div>
  )
}

function MainContent({
  activeChatId,
  loadedSession,
  activeProject,
  onSessionDraft,
  onChatAutoTitle,
  composerFocusKey,
  onInputChange,
  onMessageSent,
  detailPanelOpen,
  onOpenDetailPanel,
  implementFlow,
  onImplementFlowChange,
  onRescanComplete,
}) {
  const [inputValue, setInputValueRaw] = useState('')
  function setInputValue(val) {
    setInputValueRaw(val)
    onInputChange?.(val.trim().length > 0)
  }
  const [chatMode, setChatMode] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [messages, setMessages] = useState([])
  // pendingQuestions: { questions[] } — set when AI needs clarification before scanning; shown above composer
  const [pendingQuestions, setPendingQuestions] = useState(null)
  // aiVisibilityPending: true when ai-visibility-prep scan is done and URL question is shown above composer
  const [aiVisibilityPending, setAiVisibilityPending] = useState(false)
  // true while waiting for user to answer an in-chat ai-question bubble
  const [awaitingAnswer, setAwaitingAnswer] = useState(false)
  // in-chat onboarding wizard — Check AI visibility chip only (3rd quick action)
  const [onboardingPending, setOnboardingPending] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState(false)
  const [pendingScanKind, setPendingScanKind] = useState('generic')
  const onboardingPrefill = useMemo(
    () => buildOnboardingPrefill(activeProject),
    [activeProject],
  )
  const messagesEndRef = useRef(null)
  const chatScrollRef = useRef(null)
  const prevOnboardingPendingRef = useRef(false)
  const inputRef = useRef(null)
  const skipDraftRef = useRef(false)
  const prevActiveChatIdRef = useRef(activeChatId)
  const scanCompleteSyncedRef = useRef(false)
  const implementInitKeyRef = useRef(null)
  const rescanKeyRef = useRef(null)

  function resolveSession() {
    if (loadedSession) return loadedSession
    if (activeChatId === SEO_SCAN_CHAT_ID) return createSeoScanSession()
    return createEmptySession()
  }

  useEffect(() => {
    skipDraftRef.current = true
    const chatSwitched = prevActiveChatIdRef.current !== activeChatId
    prevActiveChatIdRef.current = activeChatId

    const session = resolveSession()
    const hydratedMessages = hydrateScanResultsMessages(
      session.messages,
      activeChatId === SEO_SCAN_CHAT_ID ? SEO_SCAN_PROMPT : '',
    )
    const loadedIsEmpty =
      !session.chatMode &&
      !(session.messages?.length) &&
      !(session.inputValue?.trim())

    // Same chat only: parent snapshot may lag behind an in-flight send or scan.
    if (
      !chatSwitched &&
      (
        (loadedIsEmpty && chatMode && messages.length > 0) ||
        messages.length > (session.messages?.length ?? 0) ||
        (isScanning && messages.some(m => m.content === 'scan')) ||
        onboardingPending
      )
    ) {
      skipDraftRef.current = false
      return
    }

    setChatMode(session.chatMode)
    setIsScanning(session.isScanning)
    setMessages(hydratedMessages)
    setInputValue(session.inputValue ?? '')
    setPendingQuestions(null)
    setAiVisibilityPending(false)
    setAwaitingAnswer(false)
    setOnboardingPending(session.onboardingPending ?? false)
    setOnboardingCompleted(session.onboardingCompleted ?? false)
    setPendingScanKind(session.pendingScanKind ?? 'generic')
    onSessionDraft?.({ ...session, messages: hydratedMessages })
    skipDraftRef.current = false
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only reload when switching chats / parent snapshot
  }, [activeChatId, loadedSession])

  useEffect(() => {
    if (skipDraftRef.current) return
    onSessionDraft?.({
      chatMode,
      isScanning,
      messages,
      inputValue,
      onboardingPending,
      onboardingCompleted,
      pendingScanKind,
    })

    const hasResults = messages.some(m => m.content === 'scan-results')
    if (hasResults && !isScanning && chatMode && !scanCompleteSyncedRef.current) {
      scanCompleteSyncedRef.current = true
      onMessageSent?.({ chatMode: true, isScanning: false, messages, inputValue })
    }
    if (isScanning || !hasResults) {
      scanCompleteSyncedRef.current = false
    }
  }, [chatMode, isScanning, messages, inputValue, onboardingPending, onboardingCompleted, pendingScanKind, onSessionDraft, onMessageSent])

  useEffect(() => {
    if (!isScanning) inputRef.current?.focus()
  }, [composerFocusKey, isScanning])

  useEffect(() => {
    const didOpenOnboarding = onboardingPending && !prevOnboardingPendingRef.current
    prevOnboardingPendingRef.current = onboardingPending

    // Start scroll the same frame the card slide-in begins (300ms) — not after it finishes
    if (didOpenOnboarding) {
      requestAnimationFrame(() => {
        const scrollEl = chatScrollRef.current
        if (scrollEl) {
          scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: 'smooth' })
        } else {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      })
      return
    }

    if (!onboardingPending) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isScanning, implementFlow?.step, onboardingPending])

  useEffect(() => {
    if (!implementFlow?.initKey || implementInitKeyRef.current === implementFlow.initKey) return
    implementInitKeyRef.current = implementFlow.initKey
    const count = implementFlow.selectedItems?.length ?? 0
    const ts = getTimestamp()
    setChatMode(true)
    const nextMessages = [
      {
        id: implementFlow.initKey,
        type: 'user',
        content: `Implement ${count} auto-fix change${count === 1 ? '' : 's'}`,
        ts,
      },
    ]

    if (implementFlow.skipCloudflare) {
      nextMessages.push({
        id: implementFlow.initKey + 1,
        type: 'ai',
        content: 'implement-progress',
        items: implementFlow.selectedItems ?? [],
        ts,
      })
      onImplementFlowChange?.(prev => (prev ? { ...prev, step: 'implementing' } : prev))
    } else {
      nextMessages.push({
        id: implementFlow.initKey + 1,
        type: 'ai',
        content: 'implement-cloudflare-token',
        ts,
      })
    }

    setMessages(prev => [...prev, ...nextMessages])
  }, [implementFlow?.initKey, implementFlow?.skipCloudflare, implementFlow?.selectedItems, onImplementFlowChange])

  useEffect(() => {
    if (!implementFlow?.rescanKey || rescanKeyRef.current === implementFlow.rescanKey) return
    rescanKeyRef.current = implementFlow.rescanKey
    const ts = getTimestamp()
    setChatMode(true)
    setMessages(prev => [
      ...prev,
      { id: implementFlow.rescanKey, type: 'user', content: 'Rescan site', ts },
    ])
    setIsScanning(true)
    setTimeout(() => {
      setMessages(prev => appendScanMessages(prev, 'rescan', getTimestamp()))
    }, 450)
  }, [implementFlow?.rescanKey])

  function handleCloudflareTokenContinue() {
    onImplementFlowChange?.(prev => (prev ? { ...prev, step: 'cloudflare-credentials' } : prev))
  }

  function handleCloudflareCredentialsSubmit(answers) {
    const accountId = answers['cloudflare-account-id'] || ''
    const answersText = `Cloudflare account ID → ${accountId}; API token → ••••••`
    const ts = getTimestamp()
    const selectedItems = implementFlow?.selectedItems ?? []
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        type: 'user',
        content: 'answers-formatted',
        answersText,
        ts,
      },
      {
        id: Date.now() + 1,
        type: 'ai',
        content: 'implement-cloudflare-connected',
        ts,
      },
      {
        id: Date.now() + 2,
        type: 'ai',
        content: 'implement-progress',
        items: selectedItems,
        ts,
      },
    ])
    onImplementFlowChange?.(prev => (prev ? { ...prev, step: 'implementing', cloudflareConnected: true } : prev))
  }

  function handleCloudflareCredentialsSkip() {
    handleCloudflareCredentialsSubmit({})
  }

  const handleImplementComplete = useCallback(() => {
    const selectedItems = implementFlow?.selectedItems ?? []
    const panelItems = implementFlow?.panelItems ?? []
    const selectedIds = new Set(selectedItems.map(item => item.id))
    const manualItems = panelItems.filter(item => item.manualFix && !selectedIds.has(item.id))
    const remainingAutofix = panelItems.filter(item => item.autofix && !selectedIds.has(item.id))
    const summary = buildImplementSummary(selectedItems, manualItems)
    const appliedIds = summary.applied.map(item => item.id)
    setMessages(prev => [
      ...prev.filter(m => m.content !== 'implement-progress'),
      {
        id: Date.now(),
        type: 'ai',
        content: 'implement-summary',
        summary,
        ts: getTimestamp(),
      },
    ])

    onImplementFlowChange?.(prev => (prev ? {
      ...prev,
      step: null,
      freeImplementDone: true,
      allAutoFixesDone: remainingAutofix.length === 0 && summary.failedCount === 0,
      cloudflareConnected: true,
      resolvedItemIds: [...new Set([
        ...(prev.resolvedItemIds ?? []),
        ...appliedIds,
      ])],
    } : prev))
  }, [implementFlow, onImplementFlowChange])

  function handleSummaryItemResolved(itemId) {
    onImplementFlowChange?.(prev => (prev ? {
      ...prev,
      resolvedItemIds: [...new Set([...(prev.resolvedItemIds ?? []), itemId])],
      allAutoFixesDone: false,
    } : prev))
  }

  const implementCredentialsPending = implementFlow?.step === 'cloudflare-credentials'

  function getTimestamp() {
    const now = new Date()
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
  }

  const onScanComplete = useCallback(() => {
    setIsScanning(false)
    setMessages(prev => {
      const scanMsg = [...prev].reverse().find(m => m.content === 'scan')
      const scanKind = scanMsg?.scanKind || 'generic'

      if (scanKind === 'rescan') {
        const manualItems = (implementFlow?.panelItems ?? []).filter(item => item.manualFix)
        const summary = buildRescanSummary(manualItems)
        onRescanComplete?.(summary)
        return prev
          .filter(m => m.content !== 'scan')
          .concat([{
            id: Date.now(),
            type: 'ai',
            content: 'implement-summary',
            summary,
            ts: getTimestamp(),
          }])
      }

      // ai-visibility-prep: remove loader, then show URL card above composer
      if (scanKind === 'ai-visibility-prep') {
        setTimeout(() => setAiVisibilityPending(true), 0)
        return prev.filter(m => m.content !== 'scan')
      }

      if (prev.some(m => m.content === 'scan-results')) return prev.filter(m => m.content !== 'scan')
      const lastUser = [...prev]
        .reverse()
        .find(
          m =>
            m.type === 'user' &&
            m.content !== 'answers-formatted' &&
            m.content !== 'onboarding-summary',
        )
      const payload = buildScanResultsPayload(lastUser?.content, scanKind)
      const ts = getTimestamp()
      return prev
        .filter(m => m.content !== 'scan')
        .concat([{ id: Date.now(), type: 'ai', content: 'scan-results', scanKind, ts, ...payload }])
    })
  }, [implementFlow, onRescanComplete])

  const onScanFail = useCallback((failMessage) => {
    setIsScanning(false)
    setMessages(prev =>
      prev
        .filter(m => m.content !== 'scan')
        .concat([{ id: Date.now(), type: 'ai', content: 'scan-failed', failMessage, ts: getTimestamp() }])
    )
  }, [])

  function handleStopScan() {
    setIsScanning(false)
  }

  function startScan(userMsg, replaceAll = false, scanKind = 'generic') {
    setMessages(prev => replaceAll ? [userMsg] : [...prev, userMsg])
    setIsScanning(true)
    setTimeout(() => {
      setMessages(prev => appendScanMessages(prev, scanKind, getTimestamp()))
    }, 450)
  }

  function triggerScan(scanKind = 'generic') {
    setIsScanning(true)
    setTimeout(() => {
      setMessages(prev => appendScanMessages(prev, scanKind, getTimestamp()))
    }, 300)
  }

  function handlePendingSubmit() {
    setPendingQuestions(null)
    triggerScan()
  }

  function handlePendingSkip() {
    setPendingQuestions(null)
    triggerScan()
  }

  // Called when user submits answers from the URL card above the composer (ai-visibility flow)
  function handleAiVisibilitySubmit(answers) {
    const urlAnswer = answers['website-url'] || answers[Object.keys(answers)[0]] || ''
    const answersText = `Website URL → ${urlAnswer}`
    const ts = getTimestamp()

    const userAnswerMsg = {
      id: Date.now(),
      type: 'user',
      content: 'answers-formatted',
      answersText,
      rawAnswers: answers,
      ts,
    }

    setAiVisibilityPending(false)
    setMessages(prev => [...prev, userAnswerMsg])

    // Start the actual AI visibility scan after a short delay
    setIsScanning(true)
    setTimeout(() => {
      setMessages(prev => appendScanMessages(prev, 'ai-visibility', getTimestamp()))
    }, 400)
  }

  function handleAiVisibilitySkip() {
    setAiVisibilityPending(false)
    setIsScanning(true)
    setTimeout(() => {
      setMessages(prev => appendScanMessages(prev, 'ai-visibility', getTimestamp()))
    }, 400)
  }

  function formatOnboardingScanIntro(payload) {
    const domain =
      payload?.gbp?.websiteUrl?.trim()?.replace(/^https?:\/\//, '').replace(/\/$/, '') ||
      payload?.gbp?.brandName?.trim() ||
      'your site'
    return `Initiating AI visibility scan for ${domain}. This usually takes 2–5 minutes.`
  }

  function handleAiVisibilitySetupContinue() {
    setPendingScanKind('ai-visibility')
    setOnboardingPending(true)
    setMessages(prev =>
      prev.map(m =>
        m.content === 'ai-visibility-setup' ? { ...m, setupStarted: true } : m,
      ),
    )
  }

  function handleOnboardingComplete(payload) {
    const ts = getTimestamp()
    const summaryLines = buildOnboardingSummaryLines(payload)
    const scanIntro = formatOnboardingScanIntro(payload)
    setOnboardingPending(false)
    setOnboardingCompleted(true)

    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        type: 'user',
        content: 'onboarding-summary',
        summaryLines,
        rawAnswers: payload,
        ts,
      },
      {
        id: Date.now() + 1,
        type: 'ai',
        content: 'onboarding-setup-complete',
        ts,
      },
    ])

    setIsScanning(true)
    setTimeout(() => {
      setMessages(prev =>
        appendScanMessages(prev, pendingScanKind || 'ai-visibility', getTimestamp(), {
          loaderIntro: scanIntro,
        }),
      )
    }, 400)
  }

  // Called when user clicks an answer option inside an ai-question chat bubble
  function handleOptionSelect(option) {
    if (awaitingAnswer === false) return
    const ts = getTimestamp()
    const userMsg = { id: Date.now(), type: 'user', content: option, ts }
    setMessages(prev => [
      ...prev.map(m => m.content === 'ai-question' && !m.answered ? { ...m, answered: true, selectedOption: option } : m),
      userMsg,
    ])
    setAwaitingAnswer(false)
    // Start the actual scan after the user answers
    const scanKind = awaitingAnswer
    setIsScanning(true)
    setTimeout(() => {
      setMessages(prev => appendScanMessages(prev, scanKind, getTimestamp()))
    }, 400)
  }

  // Hard rule: chip click only fills the composer — scan starts on Send (submitPrompt).
  function handleQuickActionSelect({ prompt }) {
    setInputValue(prompt)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function finishSubmit({ nextChatMode, nextMessages, nextIsScanning = isScanning, trimmed, chatTitle, chatTitleAsIs = false }) {
    setChatMode(nextChatMode)
    setMessages(nextMessages)
    if (nextIsScanning !== isScanning) setIsScanning(nextIsScanning)
    setInputValue('')
    onMessageSent?.({
      chatMode: nextChatMode,
      isScanning: nextIsScanning,
      messages: nextMessages,
      inputValue: '',
    })
    if (chatTitle != null) onChatAutoTitle?.(chatTitle, chatTitleAsIs)
    else {
      const chipLabel = getQuickActionLabelForPrompt(trimmed)
      onChatAutoTitle?.(chipLabel ?? trimmed, Boolean(chipLabel))
    }
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function submitPrompt(trimmed, { chatTitle, chatTitleAsIs = false } = {}) {
    if (
      !trimmed ||
      isScanning ||
      pendingQuestions ||
      awaitingAnswer ||
      aiVisibilityPending ||
      implementCredentialsPending ||
      onboardingPending
    ) {
      return
    }

    const ts = getTimestamp()
    const userMsg = { id: Date.now(), type: 'user', content: trimmed, ts }
    const scanKind = getScanKindFromPrompt(trimmed)
    const enteringChat = !chatMode

    if (scanKind === 'ai-action-plan') {
      const nextMessages = chatMode ? [...messages, userMsg] : [userMsg]
      finishSubmit({
        nextChatMode: true,
        nextMessages,
        trimmed,
        chatTitle,
        chatTitleAsIs,
      })
      setAwaitingAnswer('ai-action-plan')
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 100,
          type: 'ai',
          content: 'ai-question',
          question: "To build your AI action plan I need to understand your priorities. What's your biggest challenge right now?",
          options: ['Low local search rankings', 'Not appearing in AI search results', 'Competitors outranking me', 'All of the above'],
          scanKind: 'ai-action-plan',
          ts: getTimestamp(),
        }])
      }, 600)
      return
    }

    const clarifyingQs = isAutoScanPrompt(trimmed) ? null : getClarifyingQuestions(trimmed)
    if (clarifyingQs) {
      const nextMessages = chatMode ? [...messages, userMsg] : [userMsg]
      finishSubmit({
        nextChatMode: true,
        nextMessages,
        trimmed,
        chatTitle,
        chatTitleAsIs,
      })
      setPendingQuestions({ questions: clarifyingQs })
      return
    }

    // Check AI visibility (3rd chip) — greeting first, then onboarding wizard on CTA
    if (scanKind === 'ai-visibility') {
      const nextMessages = enteringChat ? [userMsg] : [...messages, userMsg]
      finishSubmit({
        nextChatMode: true,
        nextMessages,
        trimmed,
        chatTitle,
        chatTitleAsIs,
      })
      if (!onboardingCompleted) {
        setPendingScanKind('ai-visibility')
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 100,
              type: 'ai',
              content: 'ai-visibility-setup',
              ts: getTimestamp(),
            },
          ])
        }, 600)
        return
      }
      setIsScanning(true)
      setTimeout(() => {
        setMessages(prev => appendScanMessages(prev, 'ai-visibility', getTimestamp()))
      }, 450)
      return
    }

    const nextMessages = enteringChat ? [userMsg] : [...messages, userMsg]

    finishSubmit({
      nextChatMode: true,
      nextMessages,
      nextIsScanning: true,
      trimmed,
      chatTitle,
      chatTitleAsIs,
    })
    setTimeout(() => {
      setMessages(prev => appendScanMessages(prev, scanKind, getTimestamp()))
    }, 450)
  }

  function handleSend() {
    const trimmed = (inputRef.current?.value ?? inputValue).trim()
    if (!trimmed) return
    const chipLabel = getQuickActionLabelForPrompt(trimmed)
    submitPrompt(trimmed, chipLabel ? { chatTitle: chipLabel, chatTitleAsIs: true } : {})
  }

  const activeScanMessageId = useMemo(() => {
    const scanMessages = messages.filter(m => m.content === 'scan')
    return scanMessages[scanMessages.length - 1]?.id ?? null
  }, [messages])

  // AI visibility — keep composer in attached layout from prompt send through onboarding (matches SEO crawl Cloudflare pattern)
  const aiVisibilityAttachedComposer = useMemo(() => {
    if (onboardingPending) return true
    if (messages.some(m => m.content === 'ai-visibility-setup')) return true
    const lastUser = [...messages]
      .reverse()
      .find(
        m =>
          m.type === 'user' &&
          m.content !== 'answers-formatted' &&
          m.content !== 'onboarding-summary',
      )
    return Boolean(
      lastUser &&
        getScanKindFromPrompt(lastUser.content) === 'ai-visibility' &&
        !onboardingCompleted,
    )
  }, [messages, onboardingPending, onboardingCompleted])


  const chatFooter = (
    <div
      className={`shrink-0 bg-white ${aiVisibilityAttachedComposer ? '' : 'border-t border-gray-200'}`}
    >
      <div className={`mx-auto pb-2 pt-2 px-6 ${detailPanelOpen ? 'w-full max-w-[720px]' : 'w-[60%]'}`}>
        {pendingQuestions && (
          <div className="mb-2">
            <ClarifyingQuestionsCard
              questions={pendingQuestions.questions}
              onSubmit={handlePendingSubmit}
              onSkip={handlePendingSkip}
            />
          </div>
        )}
        {implementCredentialsPending ? (
          <div className="w-full relative">
            <div className="mx-2.5 relative z-0">
              <ClarifyingQuestionsCard
                title={CLOUDFLARE_CONNECT_TITLE}
                questions={CLOUDFLARE_CONNECT_QUESTIONS}
                onSubmit={handleCloudflareCredentialsSubmit}
                onSkip={handleCloudflareCredentialsSkip}
                attachedToEditor
                singleStep
                showQuestionNumbers={false}
              />
            </div>
            <div className="relative z-10 -mt-2">
              <PromptComposer
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onSend={handleSend}
                inputRef={inputRef}
                focusKey={composerFocusKey}
                scanning={isScanning}
                onStop={handleStopScan}
                attachedMode
                placeholder="Ask about SEO, or type a domain to audit, like 'audit example.com'"
              />
            </div>
          </div>
        ) : aiVisibilityAttachedComposer ? (
          <div className="w-full relative">
            <div
              className="mx-2.5 relative z-0 grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{
                gridTemplateRows: onboardingPending ? '1fr' : '0fr',
                opacity: onboardingPending ? 1 : 0,
              }}
            >
              <div className={onboardingPending ? 'min-h-0' : 'overflow-hidden min-h-0'}>
                {onboardingPending && (
                  <InChatOnboardingCard
                    prefill={onboardingPrefill}
                    onComplete={handleOnboardingComplete}
                  />
                )}
              </div>
            </div>
            <div className="relative z-10 -mt-2">
              <PromptComposer
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onSend={handleSend}
                inputRef={inputRef}
                focusKey={composerFocusKey}
                scanning={isScanning}
                onStop={handleStopScan}
                placeholder="Ask about SEO, or type a domain to audit, like 'audit example.com'"
              />
            </div>
          </div>
        ) : aiVisibilityPending ? (
          <div className="w-full relative">
            <div className="mx-2.5 relative z-0">
              <ClarifyingQuestionsCard
                questions={AI_VISIBILITY_QUESTIONS}
                onSubmit={handleAiVisibilitySubmit}
                onSkip={handleAiVisibilitySkip}
                attachedToEditor
              />
            </div>
            <div className="relative z-10 -mt-2">
              <PromptComposer
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onSend={handleSend}
                inputRef={inputRef}
                focusKey={composerFocusKey}
                scanning={isScanning}
                onStop={handleStopScan}
                placeholder="Ask about SEO, or type a domain to audit, like 'audit example.com'"
              />
            </div>
          </div>
        ) : (
          <PromptComposer
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onSend={handleSend}
            inputRef={inputRef}
            focusKey={composerFocusKey}
            scanning={isScanning}
            onStop={handleStopScan}
            placeholder="Ask about SEO, or type a domain to audit, like 'audit example.com'"
          />
        )}
        <p className="text-center text-[11px] text-gray-400 mt-2 mb-2">
          Review important AI-assisted changes before publishing.
        </p>
      </div>

    </div>
  )

  if (!chatMode) {
    return (
      <main className="flex-1 min-w-0 bg-white flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center py-10 overflow-y-auto overflow-x-hidden w-full">
          <div
            className={`mx-auto flex flex-col items-center gap-6 px-6 ${
              detailPanelOpen ? 'w-full max-w-[720px]' : 'w-full max-w-[800px]'
            }`}
          >

            {/* Headline */}
            <div className="text-center w-full">
              <h1 className="text-[32px] font-bold text-gray-900 leading-[1.15] tracking-tight">
                How can we improve your visibility today?
              </h1>
            </div>

            {/* Conversational typing animation */}
            <TypingText />

            {/* Prompt composer — HighRise AI textarea pattern */}
            <div className="w-full">
              <PromptComposer
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onSend={handleSend}
                inputRef={inputRef}
                focusKey={composerFocusKey}
              />
            </div>

            {/* Quick action chips — click pastes full prompt into composer; Send starts the conversation */}
            <div className="flex flex-nowrap items-center justify-center gap-1 w-full">
              {QUICK_ACTIONS.map(({ label, prompt }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleQuickActionSelect({ prompt })}
                  className="shrink-0 whitespace-nowrap px-2 py-1 rounded-lg bg-gray-100 text-[12px] font-normal text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 min-w-0 bg-white flex flex-col overflow-hidden">
      <div ref={chatScrollRef} className="flex-1 min-h-0 overflow-y-auto py-8">
        <div
          className={`mx-auto flex flex-col gap-6 px-6 ${
            detailPanelOpen ? 'w-full max-w-[720px]' : 'w-[60%]'
          }`}
        >
          {messages.map((msg, msgIndex) => {
            const prevMsg = msgIndex > 0 ? messages[msgIndex - 1] : null
            const afterUserBubble = prevMsg?.type === 'user' && msg.type !== 'user'
            const agentTopSpacing = afterUserBubble ? 'mt-1.5' : ''

            if (msg.type === 'user') {
              // onboarding-summary: user bubble after Finish and run scan
              if (msg.content === 'onboarding-summary') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[80%] min-w-0 px-4 py-3 bg-gray-100 rounded-2xl rounded-br-sm">
                      <p className="text-[13px] font-semibold text-gray-900 mb-2">Setup summary</p>
                      <ul className="flex flex-col gap-1 m-0 p-0 list-none">
                        {(msg.summaryLines ?? []).map(line => (
                          <li key={line} className="text-[14px] text-gray-700 leading-relaxed">
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              }
              // answers-formatted: specially styled bubble showing submitted question answers
              if (msg.content === 'answers-formatted') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[80%] min-w-0 px-4 py-3 bg-gray-100 rounded-2xl rounded-br-sm">
                      <p className="text-[13px] font-semibold text-gray-900 mb-1.5">Answers</p>
                      <p className="text-[14px] text-gray-700 leading-relaxed">1. {msg.answersText}</p>
                      <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">Please acknowledge these answers briefly, then continue with the requested work.</p>
                    </div>
                  </div>
                )
              }
              const firstUserIndex = messages.findIndex(
                m =>
                  m.type === 'user' &&
                  m.content !== 'answers-formatted' &&
                  m.content !== 'onboarding-summary',
              )
              const showScanContext = messages.indexOf(msg) === firstUserIndex
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[80%] min-w-0 px-4 py-3 bg-gray-100 rounded-2xl rounded-br-sm">
                    <p className="text-[14px] text-gray-900 leading-relaxed">{msg.content}</p>
                    {showScanContext && (
                      <>
                        <p className="text-[14px] text-gray-900 leading-relaxed break-all mt-3">
                          Website URL: {SCAN_CONTEXT.websiteUrl}
                        </p>
                        <p className="text-[14px] text-gray-900 leading-relaxed mt-1.5">
                          Brand: {SCAN_CONTEXT.brand}
                        </p>
                        <p className="text-[14px] text-gray-900 leading-relaxed mt-1.5">
                          Target country: {SCAN_CONTEXT.targetCountry}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )
            }

            // scan-done: legacy placeholder — render nothing
            if (msg.content === 'scan-done') return null

            // scan: actively running — show loader block (latest only)
            if (msg.content === 'scan') {
              if (msg.id !== activeScanMessageId) return null
              return (
                <div key={msg.id} className={`flex flex-col ${agentTopSpacing}`}>
                  <ScanConversationBlock
                    scanKind={msg.scanKind || 'seo'}
                    loaderIntro={msg.loaderIntro}
                    onComplete={onScanComplete}
                  />
                </div>
              )
            }

            // scan-failed: GBP and any other failed scan — error banner
            if (msg.content === 'scan-failed') {
              return (
                <div key={msg.id} className="flex flex-col gap-3">
                  <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3.5 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-error-100 border border-error-200 flex items-center justify-center shrink-0 mt-0.5">
                      <XCircleIcon size={15} className="text-error-600" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-error-700 mb-1">Scan failed</p>
                      <p className="text-[13px] text-error-600 leading-relaxed">{msg.failMessage}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInputValue('Run GBP, listings, and reviews scans for your business name or Google Maps / GBP link')
                        setTimeout(() => inputRef.current?.focus(), 0)
                      }}
                      className="shrink-0 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Try again with Google Maps link
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputValue(SEO_SCAN_PROMPT)
                        setTimeout(() => inputRef.current?.focus(), 0)
                      }}
                      className="shrink-0 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Run website SEO scan instead
                    </button>
                  </div>
                  <AiFeedbackRow ts={msg.ts} />
                </div>
              )
            }

            // onboarding wizard finished — agent ack before scan loader
            if (msg.content === 'onboarding-setup-complete') {
              return (
                <div key={msg.id} className={`flex flex-col gap-2 ${agentTopSpacing}`}>
                  <p className="text-[14px] text-gray-700 leading-relaxed m-0">
                    {ONBOARDING_SETUP_COMPLETE_MESSAGE}
                  </p>
                  <AiFeedbackRow ts={msg.ts} />
                </div>
              )
            }

            // AI visibility onboarding — greeting before 3-step wizard
            if (msg.content === 'ai-visibility-setup') {
              return (
                <div key={msg.id} className={`flex flex-col gap-3 ${agentTopSpacing}`}>
                  <AiVisibilitySetupCard
                    onContinue={handleAiVisibilitySetupContinue}
                    actionsDisabled={Boolean(msg.setupStarted || onboardingPending)}
                    hideFooter={Boolean(onboardingPending)}
                  />
                  <AiFeedbackRow ts={msg.ts} />
                </div>
              )
            }

            if (msg.content === 'implement-cloudflare-token') {
              return (
                <div key={msg.id} className={`flex flex-col gap-3 ${agentTopSpacing}`}>
                  <CloudflareTokenCard
                    onContinue={handleCloudflareTokenContinue}
                    actionsDisabled={Boolean(
                      implementFlow?.step && implementFlow.step !== 'cloudflare-token',
                    )}
                  />
                  <AiFeedbackRow ts={msg.ts} />
                </div>
              )
            }

            if (msg.content === 'implement-cloudflare-connected') {
              return (
                <div key={msg.id} className={`flex flex-col gap-3 ${agentTopSpacing}`}>
                  <div className="flex items-start gap-2.5">
                    <CircleCheck size={16} className="text-success-600 shrink-0 mt-0.5" />
                    <p className="text-[14px] text-gray-700 leading-relaxed m-0">
                      Cloudflare is now connected. Your site is ready for automated SEO deployments.
                    </p>
                  </div>
                  <AiFeedbackRow ts={msg.ts} />
                </div>
              )
            }

            if (msg.content === 'implement-progress') {
              return (
                <div key={msg.id} className={`flex flex-col gap-3 ${agentTopSpacing}`}>
                  <ImplementProgressBlock
                    items={msg.items ?? implementFlow?.selectedItems ?? []}
                    onComplete={handleImplementComplete}
                  />
                </div>
              )
            }

            if (msg.content === 'implement-summary') {
              return (
                <div key={msg.id} className={`flex flex-col gap-3 ${agentTopSpacing}`}>
                  <p className="text-[14px] text-gray-700 leading-relaxed m-0">
                    {msg.summary?.variant === 'rescan'
                      ? 'Rescan complete. Here is your updated visibility summary:'
                      : msg.summary?.hasIssues
                        ? 'Implementation complete with some issues. Review the summary:'
                        : 'Implementation complete. Review the summary:'}
                  </p>
                  <ImplementSummaryCard
                    summary={msg.summary}
                    onItemResolved={handleSummaryItemResolved}
                  />
                  <AiFeedbackRow ts={msg.ts} />
                </div>
              )
            }

            if (msg.content === 'implement-complete') {
              return (
                <div key={msg.id} className={`flex flex-col gap-3 ${agentTopSpacing}`}>
                  <div className="flex items-center gap-2.5">
                    <CircleCheck size={16} className="text-success-600 shrink-0" />
                    <p className="text-[14px] text-gray-700 leading-relaxed m-0">
                      All {msg.count} fix{msg.count === 1 ? '' : 'es'} implemented successfully.
                    </p>
                  </div>
                  <AiFeedbackRow ts={msg.ts} />
                </div>
              )
            }

            // ai-question: in-chat clarifying question bubble (used for AI action plan)
            if (msg.content === 'ai-question') {
              return (
                <div key={msg.id} className="flex flex-col gap-3">
                  <p className="text-[14px] text-gray-700 leading-relaxed">{msg.question}</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.answered ? (
                      <span className="px-3 py-1.5 rounded-lg bg-primary-50 border border-primary-200 text-[13px] text-primary-700 font-medium">
                        {msg.selectedOption}
                      </span>
                    ) : (
                      msg.options?.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleOptionSelect(opt)}
                          className="shrink-0 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-[13px] text-gray-700 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-colors"
                        >
                          {opt}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )
            }

            if (msg.content === 'scan-results') {
              const findings = msg.findings ?? []
              const nextActions = msg.nextActions ?? []
              const scanKind = msg.scanKind || 'seo'

              // ── GBP audit results — partial failure with overall analysis card ──
              if (scanKind === 'gbp') {
                const errors = msg.errors ?? []
                return (
                  <div key={msg.id} className="flex flex-col gap-4">
                    <p className="text-[14px] text-gray-700 leading-relaxed">{msg.summaryText}</p>

                    {/* Overall Analysis card */}
                    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
                      <div className="px-5 py-4 border-b border-gray-100">
                        <p className="text-[14px] font-semibold text-gray-900 text-center">Overall Analysis</p>
                      </div>
                      {errors.length > 0 && (
                        <div className="p-4">
                          <div className="rounded-lg border border-gray-200 bg-white p-4">
                            <p className="text-[13px] font-semibold text-gray-800 mb-2.5">Errors</p>
                            <ul className="flex flex-col gap-2">
                              {errors.map((err, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="shrink-0 mt-[7px] w-1.5 h-1.5 rounded-full bg-gray-400" />
                                  <span className="text-[13px] text-gray-700 leading-relaxed">
                                    <span className="font-semibold">{err.label}:</span> {err.message}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Next best action chips — grey style, matching existing product patterns */}
                    {nextActions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {nextActions.map(action => (
                          <button
                            key={action}
                            type="button"
                            onClick={() => {
                              setInputValue(action)
                              setTimeout(() => inputRef.current?.focus(), 0)
                            }}
                            className="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg bg-gray-100 text-[13px] font-normal text-gray-600 hover:bg-gray-200 transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}

                    <AiFeedbackRow ts={msg.ts} />
                  </div>
                )
              }

              // ── AI Visibility results ──
              if (scanKind === 'ai-visibility') {
                const aiReport = msg.report ?? buildVisibilityReport(
                  [...messages].slice(0, messages.indexOf(msg)).reverse().find(m => m.type === 'user' && m.content !== 'answers-formatted' && m.content !== 'onboarding-summary')?.content || SEO_SCAN_PROMPT,
                )
                return (
                  <div key={msg.id} className="flex flex-col gap-4">
                    <p className="text-[14px] text-gray-700 leading-relaxed">{msg.summaryText}</p>
                    {findings.length > 0 && (
                      <ul className="flex flex-col gap-2">
                        {findings.map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="mt-[3px] shrink-0 w-4 h-4 rounded-full bg-error-50 border border-error-200 flex items-center justify-center">
                              <span className="text-error-600 text-[9px] font-bold leading-none">!</span>
                            </span>
                            <span className="text-[14px] text-gray-700 leading-snug">{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {/* AI engine charts */}
                    <EngineCoverageChart />
                    <AiSentimentChart />
                    {/* Detail report card */}
                    <button
                      type="button"
                      onClick={() => onOpenDetailPanel({ type: 'report', title: 'AI Visibility report', subtitle: 'Detailed AI search analysis', report: aiReport })}
                      className="w-full text-left rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-25 transition-colors shadow-xs px-4 py-3 flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <FileText size={16} className="text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-900">Detailed report</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">Open full AI visibility analysis in the side panel</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-400 shrink-0" />
                    </button>
                    {/* Action items with subscribe/configure/implement flow */}
                    <ActionItemsSummaryCard
                      items={msg.actionItems}
                      onFixIssues={() =>
                        onOpenDetailPanel({
                          type: 'action-items',
                          title: 'AI Visibility action items',
                          subtitle: 'Steps to improve your AI search presence',
                          items: msg.actionItems,
                        })
                      }
                    />
                    {nextActions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {nextActions.map(action => (
                          <button key={action} type="button"
                            onClick={() => { setInputValue(action); setTimeout(() => inputRef.current?.focus(), 0) }}
                            className="shrink-0 px-3 py-1.5 rounded-lg bg-gray-100 text-[13px] text-gray-600 hover:bg-gray-200 transition-colors"
                          >{action}</button>
                        ))}
                      </div>
                    )}
                    <AiFeedbackRow ts={msg.ts} />
                  </div>
                )
              }

              // ── AI Action Plan results (locked/paid items) ──
              if (scanKind === 'ai-action-plan') {
                const report = msg.report ?? buildVisibilityReport(SEO_SCAN_PROMPT)
                return (
                  <div key={msg.id} className="flex flex-col gap-4">
                    <p className="text-[14px] text-gray-700 leading-relaxed">{msg.summaryText}</p>
                    {findings.length > 0 && (
                      <ul className="flex flex-col gap-2">
                        {findings.map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="mt-[3px] shrink-0 w-4 h-4 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center">
                              <span className="text-teal-600 text-[9px] font-bold leading-none">✓</span>
                            </span>
                            <span className="text-[14px] text-gray-700 leading-snug">{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {/* Detailed report (reused) */}
                    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
                      <VisibilityScanReport report={report} onPromptAction={label => { setInputValue(label); setTimeout(() => inputRef.current?.focus(), 0) }} />
                    </div>
                    {/* Paid action items */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-[13px] font-semibold text-gray-700">Action plan</p>
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-warning-100 text-warning-600 border border-warning-200 font-medium">
                          <Crown size={10} />
                          Upgrade to unlock
                        </span>
                      </div>
                      <ActionItemsSummaryCard
                        items={msg.actionItems}
                        onFixIssues={() =>
                          onOpenDetailPanel({
                            type: 'action-items',
                            title: 'AI Action Plan',
                            subtitle: 'Your full visibility roadmap',
                            items: msg.actionItems,
                          })
                        }
                      />
                    </div>
                    {nextActions.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {nextActions.map(action => (
                          <button key={action} type="button"
                            onClick={() => { setInputValue(action); setTimeout(() => inputRef.current?.focus(), 0) }}
                            className="shrink-0 px-3 py-1.5 rounded-lg bg-gray-100 text-[13px] text-gray-600 hover:bg-gray-200 transition-colors"
                          >{action}</button>
                        ))}
                      </div>
                    )}
                    <AiFeedbackRow ts={msg.ts} />
                  </div>
                )
              }

              // ── Default SEO / generic scan results ──
              const report = msg.report ?? buildVisibilityReport(
                messages.slice(0, messages.indexOf(msg)).reverse().find(m => m.type === 'user')?.content || SEO_SCAN_PROMPT,
              )
              const hasStructuredSummary = Boolean(report.summaryTitle || report.summaryCategories?.length)
              const ack = SEO_SCAN_ACKNOWLEDGMENT
              return (
                <div key={msg.id} className="flex flex-col gap-4">
                  {hasStructuredSummary ? (
                    <>
                      <div className="flex flex-col gap-3 text-[14px] text-gray-700 leading-relaxed">
                        <p>{ack.headline}</p>
                        <p>{ack.welcome}</p>
                        <ul className="flex flex-col gap-1.5 pl-4 list-disc">
                          <li>
                            <span className="font-medium text-gray-900">Business:</span> {ack.business}
                          </li>
                          <li>
                            <span className="font-medium text-gray-900">Website:</span>{' '}
                            <span className="text-primary-600">{ack.website}</span>
                          </li>
                        </ul>
                        <p>{ack.visibilityIntro}</p>
                        <ul className="flex flex-col gap-1.5 pl-4 list-disc">
                          <li>
                            <span className="font-semibold text-gray-900">{ack.searchEnginesLabel}:</span>{' '}
                            {ack.searchEnginesDetail}
                          </li>
                          <li>
                            <span className="font-semibold text-gray-900">{ack.aiEnginesLabel}:</span>{' '}
                            {ack.aiEnginesDetail}
                          </li>
                        </ul>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
                        <ScanQuickSummary report={report} />
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-[14px] text-gray-700 leading-relaxed">
                        {msg.summaryText} Here&apos;s a breakdown of what I found:
                      </p>
                      {findings.length > 0 && (
                        <ul className="flex flex-col gap-2">
                          {findings.map((finding, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                              <span className="mt-[3px] shrink-0 w-4 h-4 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center">
                                <span className="text-teal-600 text-[9px] font-bold leading-none">✓</span>
                              </span>
                              <span className="text-[14px] text-gray-700 leading-snug">{finding}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
                        <VisibilityScanReport
                          report={report}
                          onPromptAction={label => {
                            setInputValue(label)
                            setTimeout(() => inputRef.current?.focus(), 0)
                          }}
                        />
                      </div>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => onOpenDetailPanel({ type: 'report', title: 'Detailed report', subtitle: 'Comprehensive results from your SEO crawl.', report })}
                    className="w-full text-left rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-25 transition-colors shadow-xs px-4 py-3 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-900">Detailed report</p>
                      <p className="text-[12px] text-gray-500 mt-0.5">Click to open the detailed report.</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400 shrink-0" />
                  </button>
                  <ActionItemsSummaryCard
                    items={msg.actionItems}
                    onFixIssues={() =>
                      onOpenDetailPanel({
                        type: 'action-items',
                        title: 'Action items',
                        subtitle: 'Review and implement fixes from your scan',
                        items: msg.actionItems,
                      })
                    }
                  />
                  {nextActions.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-[13px] font-medium text-gray-500">What would you like to do next?</p>
                      <div className="flex flex-wrap gap-2">
                        {nextActions.map(action => (
                          <button
                            key={action}
                            type="button"
                            onClick={() => {
                              setInputValue(action)
                              setTimeout(() => inputRef.current?.focus(), 0)
                            }}
                            className="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg bg-gray-100 text-[13px] font-normal text-gray-600 hover:bg-gray-200 transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <AiFeedbackRow ts={msg.ts} />
                </div>
              )
            }

            return null
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Floating composer with gradient fade — no border, no separator */}
      {chatFooter}
    </main>
  )
}

/** React adapter for HighRise HLModal — https://highrise.gohighlevel.com/components/feedback/modal */
function HLModal({ id, onClose, header, children, footer, headerDivider = false, maskClosable = true }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      onMouseDown={maskClosable ? onClose : undefined}
    >
      <div className="absolute inset-0 bg-gray-900/50" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className="relative flex flex-col bg-white rounded-lg border border-gray-100 shadow-xl w-full max-w-[var(--hr-modal-width,483px)] overflow-hidden"
        onMouseDown={e => e.stopPropagation()}
      >
        <div className={`flex items-start gap-2 px-4 pt-3 ${headerDivider ? 'pb-4' : ''}`}>
          <div className="flex-1 min-w-0">{header}</div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={14} strokeWidth={1.67} />
          </button>
        </div>
        {headerDivider && <div className="mx-3 border-b border-gray-200" />}
        <div className="hr-dialog__content--text p-4">{children}</div>
        {footer && (
          <div className="border-t border-gray-200 pt-3 pb-3 px-4">{footer}</div>
        )}
      </div>
    </div>
  )
}


function NewProjectModal({ onClose, onCreateProject }) {
  const [projectName, setProjectName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [gbpUrl, setGbpUrl] = useState('')
  const [targetCountry, setTargetCountry] = useState('')

  function handleCreate() {
    if (!projectName.trim()) return
    onCreateProject({ name: projectName.trim(), websiteUrl, gbpUrl, targetCountry })
    onClose()
  }

  const labelBase = 'flex items-center gap-1.5 text-[14px] font-medium text-gray-700 mb-1.5'

  return (
    <HLModal
      id="new-project-modal"
      onClose={onClose}
      headerDivider
      header={
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <FolderPlus size={18} className="text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id="new-project-modal-title" className="text-[16px] font-semibold text-gray-900 leading-snug">
              New project
            </h2>
            <p className="text-[14px] font-normal text-gray-500 mt-0.5">
              Organize your visibility and growth analysis
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-3">
          <HLButton id="new-project-cancel" color="gray" onClick={onClose}>
            Cancel
          </HLButton>
          <HLButton
            id="new-project-create"
            color="blue"
            variant="primary"
            disabled={!projectName.trim()}
            onClick={handleCreate}
          >
            Create project
          </HLButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="new-project-name" className={labelBase}>
              Project name <span className="text-error-600">*</span>
            </label>
            <HLInput
              id="new-project-name"
              autoFocus
              size="sm"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. My Website SEO"
            />
          </div>
          <div>
            <label htmlFor="new-project-website" className={labelBase}>
              Website URL
              <span className="text-[12px] font-normal text-gray-400">(optional)</span>
            </label>
            <HLInput
              id="new-project-website"
              size="sm"
              type="url"
              prefixIcon={Globe}
              value={websiteUrl}
              onChange={e => setWebsiteUrl(e.target.value)}
              placeholder="example.com"
            />
          </div>
          <div>
            <label htmlFor="new-project-gbp" className={labelBase}>
              Google Business Profile URL
              <span className="text-[12px] font-normal text-gray-400">(optional)</span>
            </label>
            <HLInput
              id="new-project-gbp"
              size="sm"
              type="url"
              prefixIcon={MapPin}
              value={gbpUrl}
              onChange={e => setGbpUrl(e.target.value)}
              placeholder="maps.google.com/... or place ID"
            />
          </div>
          <div>
            <label className={labelBase}>
              Target country
              <span className="text-[12px] font-normal text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <select
                value={targetCountry}
                onChange={e => setTargetCountry(e.target.value)}
                className="w-full h-9 px-2 bg-white border border-gray-300 rounded-md text-[14px] text-gray-900 outline-none appearance-none focus:border-primary-600 focus:shadow-focus-primary-sm transition-all"
              >
                <option value="">Select a country...</option>
                <option value="US">United States</option>
                <option value="GB">United Kingdom</option>
                <option value="CA">Canada</option>
                <option value="AU">Australia</option>
                <option value="IN">India</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="SG">Singapore</option>
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
      </div>
    </HLModal>
  )
}

function ToolsPanel({ collapsed, onToggleCollapse }) {
  if (collapsed) {
    return (
      <aside className="w-full min-w-0 shrink-0 border-l border-gray-200 bg-white flex flex-col items-center pt-3 gap-2">
        <button
          onClick={onToggleCollapse}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          aria-label="Expand panel"
        >
          <PanelRightIcon size={16} className="text-gray-400" />
        </button>
        {TOOLS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            aria-label={label}
            title={label}
          >
            <Icon size={16} />
          </button>
        ))}
      </aside>
    )
  }

  return (
    <aside className="w-full min-w-0 shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-4 shrink-0">
        <span className="text-[13px] font-medium text-gray-400 whitespace-nowrap">Tools</span>
        <button
          onClick={onToggleCollapse}
          className="shrink-0 w-7 h-7 -mr-1 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Collapse panel"
        >
          <PanelRightIcon size={16} className="text-gray-400" />
        </button>
      </div>
      <div className="flex flex-col gap-0.5 px-2 min-w-0">
        {TOOLS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors w-full min-w-0"
          >
            <Icon size={14} className="text-gray-500 shrink-0" />
            <span className="text-[13px] font-medium text-gray-700 whitespace-nowrap truncate">{label}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
