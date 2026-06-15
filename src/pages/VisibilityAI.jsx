import { useState, useRef, useEffect, useCallback } from 'react'
import {
  FileText, Package, GraduationCap, CreditCard,
  Sparkles, Bot, Send, RefreshCw, Globe, Crown, Image as ImageIcon,
  Star, TrendingUp, Grid3x3, Tablet, Link2, Users,
  ChevronDown, ChevronRight, Search, Plus, Settings,
  MessageChatSquareIcon, Grid01Icon, PanelLeftIcon, PanelRightIcon,
  BookOpen, Zap, Workflow, CheckSquare,
  Pencil, Trash2, Check, X, Copy, ThumbsUp, ThumbsDown,
  FolderPlus, MapPin,
  Circle, CircleCheck, LoadingCircle, Wand2,
  ArrowUp, Loader2,
} from '../icons/index.js'
import AppShell from '../shell/AppShell'
import { ActionItemsPanel } from '../components/action-items/index.js'
import { deriveChatTitle, deriveChatTitleFromSession } from '../data/chatTitles.js'
import { buildScanResultsPayload, hydrateScanResultsMessages } from '../data/scanResults.js'
import { SEO_SCAN_PROMPT, isAutoScanPrompt, getScanKindFromPrompt } from '../data/scanPrompts.js'
import { buildVisibilityReport } from '../data/visibilityReport.js'
import DetailSidePanel from '../components/split-pane/DetailSidePanel.jsx'
import ActionItemsSummaryCard from '../components/split-pane/ActionItemsSummaryCard.jsx'
import DetailedReportPanel from '../components/split-pane/DetailedReportPanel.jsx'
import VisibilityScanReport from '../components/reports/VisibilityScanReport.jsx'
import AiRankTrackingDashboard from '../components/dashboards/AiRankTrackingDashboard.jsx'
import AiSentimentChart from '../components/dashboards/AiSentimentChart.jsx'
import EngineCoverageChart from '../components/dashboards/EngineCoverageChart.jsx'
import { DASHBOARD_ITEMS } from '../data/aiRankDashboard.js'
import ClarifyingQuestionsCard from '../components/ClarifyingQuestionsCard.jsx'
import DesktopAccessModal from '../components/DesktopAccessModal.jsx'
import HLTooltip from '../components/HLTooltip.jsx'
import VoiceWaveform from '../components/VoiceWaveform.jsx'
import {
  pickDummyDictation,
  DICTATE_TRANSCRIBE_MS,
} from '../data/dictation.js'
import {
  SEO_SCAN_CHAT_ID,
  createSeoScanSession,
  createEmptySession,
} from '../data/seedChats.js'

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
      { icon: Send, label: 'Marketing' },
      { icon: RefreshCw, label: 'Automation' },
      { icon: Globe, label: 'Sites' },
      { icon: Crown, label: 'Memberships' },
      { icon: ImageIcon, label: 'Media Storage' },
      { icon: Star, label: 'Reputation', active: true },
      { icon: TrendingUp, label: 'Reporting' },
      { icon: Grid3x3, label: 'App marketplace' },
      { icon: Tablet, label: 'Mobile app' },
      { icon: Link2, label: 'affilaites custom' },
      { icon: Users, label: 'Communities' },
    ],
  },
]

const SUB_TABS = [
  'Overview', 'Requests', 'Reviews', 'Video Testimonials',
  'Widgets', 'Listings', 'GBP Optimization', 'Visibility AI', 'Settings',
]

const INITIAL_PROJECTS = [
  { id: 1, label: 'Untitled Project 31' },
  { id: 2, label: 'Untitled Project 30' },
  { id: 3, label: 'Untitled Project 29' },
  { id: 4, label: 'website. Show profile health' },
  { id: 5, label: 'Untitled Project 17' },
  { id: 6, label: 'Untitled Project 28' },
]

const INITIAL_CHATS = [
  { id: 1, label: 'GBP audit for Plumber 200' },
  { id: 2, label: 'AI visibility — ChatGPT' },
  { id: 3, label: 'example.com SEO crawl' },
]

const INITIAL_CHAT_LABELS = Object.fromEntries(INITIAL_CHATS.map(chat => [chat.id, chat.label]))

import { QUICK_ACTIONS } from '../data/quickActions.js'

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
const SCAN_CONTEXT = {
  websiteUrl: 'https://www.newmodernhotel.com',
  businessName: 'test p',
}

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
    'Business details fetched — test p',
    'Preparing your visibility scan plan',
    'Scan plan ready — checking Local SEO Scan',
    'Google Business Profile checked — test p',
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
}
// GBP partial-failure: steps at these indices show as errors but the scan continues to completion
const GBP_PARTIAL_FAIL_STEPS = new Set([2, 3])

// Initial "already done" steps per kind (for visual progress effect)
const SCAN_INITIAL_DONE = { seo: 3, gbp: 0, 'ai-visibility': 2, 'ai-visibility-prep': 0, 'ai-action-plan': 1, generic: 1 }

// Intro message shown above the progress steps
const SCAN_INTRO = {
  seo: `Found https://www.newmodernhotel.com — running your visibility scan now. This usually takes 2–5 minutes, I'll keep you updated as each step completes.`,
  gbp: `Running GBP, listings, and reviews scans. I'll keep you updated as each step completes.`,
  'ai-visibility-prep': `Got it — let me set up your AI visibility scan. I'll need one quick detail to get started.`,
  'ai-visibility': `Got your URL. Now checking how your brand appears across AI search engines — ChatGPT, Perplexity, Gemini, and Google AI Overviews.`,
  'ai-action-plan': `Analyzing your business data to build a custom action plan...`,
  generic: `Running your visibility scan. I'll keep you updated as each step completes.`,
}

export default function VisibilityAI() {
  const [activeSubTab, setActiveSubTab] = useState('Visibility AI')
  const [activePanel, setActivePanel] = useState('Chats')
  const [selectedDashboardId, setSelectedDashboardId] = useState('ai-rank-tracking')
  const [chatPanelCollapsed, setChatPanelCollapsed] = useState(false)
  const [toolsPanelCollapsed, setToolsPanelCollapsed] = useState(false)
  const [composerFocusKey, setComposerFocusKey] = useState(0)
  const [composerHasInput, setComposerHasInput] = useState(false)
  // true once the current "New chat" has had at least one message sent
  const [activeChatUsed, setActiveChatUsed] = useState(false)
  const [detailPanel, setDetailPanel] = useState(null)
  const [activeChatId, setActiveChatId] = useState(1)
  const [chatSessions, setChatSessions] = useState({
    [SEO_SCAN_CHAT_ID]: createSeoScanSession(),
  })
  const [chatLabels, setChatLabels] = useState(INITIAL_CHAT_LABELS)
  const sessionDraftRef = useRef({})

  function applyAutoChatTitle(chatId, titleOrMessage, useAsIs = false) {
    if (chatId == null || !titleOrMessage?.trim()) return
    const title = useAsIs ? titleOrMessage.trim() : deriveChatTitle(titleOrMessage)
    setChatLabels(prev => {
      const current = prev[chatId]
      if (current && current !== 'New chat') return prev
      return { ...prev, [chatId]: title }
    })
  }

  function syncChatTitleFromSession(chatId, session) {
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

  function handleSessionDraft(session) {
    sessionDraftRef.current = session
    syncChatTitleFromSession(activeChatId, session)
  }

  return (
    <AppShell
      sidebar="main-nav"
      sidebarProps={{ navSections: NAV_SECTIONS }}
      topbar="tabbed"
      topbarProps={{
        title: 'Reputation',
        sectionTabs: [],
        activeSection: '',
        subTabs: SUB_TABS,
        activeSubTab,
        onSubTabChange: setActiveSubTab,
      }}
    >
      <div className="flex flex-1 min-h-0 overflow-hidden bg-white">
        <ChatPanel
          activePanel={activePanel}
          activeChatId={activeChatId}
          chatLabels={chatLabels}
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
          onNewChat={newChatId => {
            setChatSessions(prev => {
              const next = { ...prev }
              if (sessionDraftRef.current && activeChatId != null) {
                next[activeChatId] = sessionDraftRef.current
              }
              next[newChatId] = createEmptySession()
              return next
            })
            setActiveChatId(newChatId)
            setComposerFocusKey(k => k + 1)
            setComposerHasInput(false)
            setActiveChatUsed(false)
            setDetailPanel(null)
          }}
          composerHasInput={composerHasInput}
          activeChatUsed={activeChatUsed}
          pendingChatTitle={pendingChatTitle}
          onChatTitleConsumed={() => setPendingChatTitle(null)}
        />
        <div className="flex flex-1 min-w-0 min-h-0 overflow-hidden">
          {activePanel === 'Dashboards' ? (
            <AiRankTrackingDashboard />
          ) : (
            <>
              <MainContent
                activeChatId={activeChatId}
                loadedSession={chatSessions[activeChatId]}
                onSessionDraft={handleSessionDraft}
                onChatAutoTitle={(title, useAsIs) => applyAutoChatTitle(activeChatId, title, useAsIs)}
                composerFocusKey={composerFocusKey}
                onInputChange={setComposerHasInput}
                onMessageSent={() => setActiveChatUsed(true)}
                detailPanelOpen={Boolean(detailPanel)}
                onOpenDetailPanel={setDetailPanel}
              />
              {detailPanel && (
                <DetailSidePanel
                  type={detailPanel.type}
                  title={detailPanel.title}
                  subtitle={detailPanel.subtitle}
                  onClose={() => setDetailPanel(null)}
                >
                  {detailPanel.type === 'action-items' && (
                    <ActionItemsPanel items={detailPanel.items} embedded />
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

function VaLogo() {
  return (
    <div className="w-9 h-9 rounded-full bg-brand-deep flex items-center justify-center shrink-0 overflow-hidden">
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.5 5.5L6.5 16.5L7.5 16.5L4.5 5.5L2.5 5.5Z" fill="var(--va-accent-green)"/>
        <path d="M11.5 5.5L7.5 16.5L8.5 16.5L9.6 13.6L13.4 13.6L14.5 16.5L15.5 16.5L11.5 5.5ZM10 12.2L11.5 8.4L13 12.2L10 12.2Z" fill="#F97316"/>
      </svg>
    </div>
  )
}

function MicIcon({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="9" y="2" width="6" height="13" rx="3" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  )
}

function WaveformIcon({ size = 16, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 10v4" />
      <path d="M7 6v12" />
      <path d="M11 3v18" />
      <path d="M15 7v10" />
      <path d="M19 10v4" />
    </svg>
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

function ChatPanel({
  activePanel,
  activeChatId,
  chatLabels = {},
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
  const [projects, setProjects] = useState(INITIAL_PROJECTS)
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false)
  const [activeProjectId, setActiveProjectId] = useState(1)
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false)
  const [nextProjectId, setNextProjectId] = useState(INITIAL_PROJECTS.length + 1)
  const dropdownRef = useRef(null)

  function handleCreateProject(data) {
    const id = nextProjectId
    setProjects(prev => [{ id, label: data.name }, ...prev])
    setActiveProjectId(id)
    setNextProjectId(n => n + 1)
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProjectDropdownOpen(false)
      }
    }
    if (projectDropdownOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [projectDropdownOpen])

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

  if (collapsed) {
    return (
      <aside className="w-[56px] shrink-0 border-r border-gray-200 bg-white flex flex-col items-center pt-3 gap-3">
        <VaLogo />
        <button
          onClick={onToggleCollapse}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
          aria-label="Expand panel"
        >
          <PanelLeftIcon size={16} />
        </button>
      </aside>
    )
  }

  return (
    <aside className="w-[280px] shrink-0 border-r border-gray-200 bg-white flex flex-col hover-shows-scrollbar">

      {/* Visibility AI header */}
      <div className="flex items-center gap-2.5 px-3 pt-3 pb-3 border-b border-gray-200">
        <VaLogo />
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-semibold text-gray-900 leading-tight truncate">Visibility AI</div>
          <div className="text-[12px] text-gray-500 leading-tight truncate">Search, AI, and local</div>
        </div>
        <button
          onClick={onToggleCollapse}
          className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Collapse panel"
        >
          <PanelLeftIcon size={16} />
        </button>
      </div>

      {/* Group 1: Project selector + tabs */}
      <div className="px-3 pt-3 pb-2">
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
                {projects.map(project => {
                  const isActive = project.id === activeProjectId
                  return (
                    <button
                      key={project.id}
                      onClick={() => {
                        setActiveProjectId(project.id)
                        setProjectDropdownOpen(false)
                      }}
                      className={`flex items-center w-full px-4 py-2.5 text-left transition-colors ${
                        isActive ? 'bg-primary-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex-1 text-[14px] font-normal text-gray-700 truncate">
                        {project.label}
                      </span>
                      {isActive && <Check size={14} className="text-primary-600 shrink-0 ml-2" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chats / Dashboards — HighRise segment tab (type="segment" size="sm") */}
      <div className="px-3 pb-3">
        <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-0.5">
          {['Chats', 'Dashboards'].map(tab => (
            <button
              key={tab}
              onClick={() => onPanelChange(tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150 ${
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
      </div>

      {/* Group 2: Search + new chat / dashboard list header */}
      <div className="px-3 pt-4 pb-3 flex flex-col gap-2">
        {activePanel === 'Chats' ? (
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-lg">
              <Search size={13} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search chats"
                className="flex-1 text-[13px] text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="shrink-0 text-gray-400 hover:text-gray-500">
                  <X size={12} />
                </button>
              )}
            </div>
            {(() => {
              const hasEmpty = chats.some(c => c.label === 'New chat') && !composerHasInput && !activeChatUsed
              return (
                <button
                  onClick={handleNewChat}
                  disabled={hasEmpty}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-primary-200 bg-white text-primary-600 text-[13px] font-semibold hover:bg-primary-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={14} strokeWidth={2.5} />
                  New chat
                </button>
              )
            })()}
          </>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-lg">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={dashboardSearchQuery}
              onChange={e => setDashboardSearchQuery(e.target.value)}
              placeholder="Search dashboards"
              className="flex-1 text-[13px] text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
            />
            {dashboardSearchQuery && (
              <button onClick={() => setDashboardSearchQuery('')} className="shrink-0 text-gray-400 hover:text-gray-500">
                <X size={12} />
              </button>
            )}
          </div>
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
          <div className="flex flex-col gap-0.5 px-2 pt-1">
            {DASHBOARD_ITEMS.filter(d =>
              d.label.toLowerCase().includes(dashboardSearchQuery.toLowerCase())
            ).map(dashboard => {
              const isActive = dashboard.id === selectedDashboardId
              return (
                <button
                  key={dashboard.id}
                  type="button"
                  onClick={() => onSelectDashboard?.(dashboard.id)}
                  className={`flex items-center gap-2 px-2.5 h-9 rounded-lg w-full transition-colors text-left ${
                    isActive ? 'bg-primary-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                    <TrendingUp size={13} className="text-gray-500" />
                  </div>
                  <span className={`flex-1 min-w-0 text-[13px] truncate ${isActive ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                    {dashboard.label}
                  </span>
                </button>
              )
            })}
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
    <div className="flex flex-col gap-2.5 mt-3">
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

function ScanConversationBlock({ scanKind = 'seo', onComplete }) {
  const intro = SCAN_INTRO[scanKind] || SCAN_INTRO.generic
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[14px] text-gray-700 leading-relaxed">{intro}</p>
      <ScanProgressList scanKind={scanKind} onComplete={onComplete} />
    </div>
  )
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
  const [dictatePhase, setDictatePhase] = useState(null) // null | 'recording' | 'transcribing'
  const transcribeTimerRef = useRef(null)
  const hasText = value.trim().length > 0
  const isDictating = dictatePhase === 'recording'
  const isTranscribing = dictatePhase === 'transcribing'

  function clearTranscribeTimer() {
    if (transcribeTimerRef.current) {
      clearTimeout(transcribeTimerRef.current)
      transcribeTimerRef.current = null
    }
  }

  function applyDictatedText(text) {
    const trimmed = value.trim()
    const next = trimmed ? `${trimmed} ${text}` : text
    onChange?.({ target: { value: next } })
  }

  const confirmDictate = useCallback(() => {
    clearTranscribeTimer()
    setDictatePhase('transcribing')
    transcribeTimerRef.current = setTimeout(() => {
      applyDictatedText(pickDummyDictation())
      setDictatePhase(null)
      transcribeTimerRef.current = null
      setTimeout(() => internalRef.current?.focus(), 0)
    }, DICTATE_TRANSCRIBE_MS)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, onChange])

  function cancelDictate() {
    clearTranscribeTimer()
    setDictatePhase(null)
  }

  function startDictate() {
    if (scanning) return
    clearTranscribeTimer()
    setDictatePhase('recording')
    setIsFocused(true)
  }

  useEffect(() => () => clearTranscribeTimer(), [])

  // Auto-grow textarea (skip during recording to keep composer height stable)
  useEffect(() => {
    if (isDictating) return
    const el = internalRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, MAX_COMPOSER_HEIGHT) + 'px'
  }, [value, isDictating])

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
      {/* Row 1: text input with voice meter overlay — fixed height, no layout shift */}
      <div className="relative w-full min-h-[44px]">
        <textarea
          ref={setRefs}
          id="vai-prompt-composer"
          rows={1}
          value={scanning ? '' : value}
          onChange={scanning || isDictating || isTranscribing ? undefined : onChange}
          onKeyDown={handleKeyDown}
          onFocus={() => !scanning && setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isDictating ? '' : scanning ? scanPlaceholder : placeholder}
          disabled={scanning || isTranscribing}
          readOnly={isDictating}
          aria-label="Prompt input"
          style={{ maxHeight: MAX_COMPOSER_HEIGHT, overflowY: 'auto' }}
          className={`w-full resize-none text-[14px] text-gray-900 placeholder:text-gray-400 bg-transparent outline-none border-0 leading-[1.5] px-4 pt-3 pb-1 ${
            scanning || isTranscribing
              ? 'cursor-not-allowed'
              : isDictating
                ? 'text-transparent caret-transparent'
                : ''
          }`}
        />
        {isDictating && (
          <div className="absolute inset-0 flex items-center justify-center px-4 pt-3 pb-1 pointer-events-none">
            <VoiceWaveform active={isDictating} />
          </div>
        )}
      </div>

      {/* Row 2: icons stuck to bottom */}
      <div className="flex items-center px-2 pb-2 pt-1 gap-1 overflow-visible">
        {/* + — hidden only while voice meter is recording */}
        {!scanning && !isDictating && (
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
        ) : isDictating ? (
          <>
            <button
              type="button"
              onClick={cancelDictate}
              className="size-8 rounded-full flex items-center justify-center shrink-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Cancel dictation"
            >
              <X size={18} strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={confirmDictate}
              className="size-9 rounded-full flex items-center justify-center shrink-0 border-2 border-primary-600 bg-white text-primary-600 hover:bg-primary-50 transition-colors"
              aria-label="Done dictating"
            >
              <Check size={18} strokeWidth={2.5} />
            </button>
          </>
        ) : isTranscribing ? (
          <div
            className="size-9 rounded-full flex items-center justify-center shrink-0 border-2 border-primary-600 bg-white text-primary-600"
            aria-label="Transcribing"
            role="status"
          >
            <Loader2 size={18} strokeWidth={2.5} className="animate-spin" />
          </div>
        ) : hasText ? (
          <>
            <HLTooltip id="composer-mic-tooltip" content="Dictate" variant="dark" placement="top">
              <button
                type="button"
                onClick={startDictate}
                className="size-8 rounded-full flex items-center justify-center shrink-0 text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                aria-label="Dictate"
                aria-describedby="composer-mic-tooltip"
              >
                <MicIcon size={16} />
              </button>
            </HLTooltip>
            <button
              type="button"
              onClick={onSend}
              className="size-9 rounded-full flex items-center justify-center shrink-0 bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-xs"
              aria-label="Send message"
            >
              <ArrowUp size={18} strokeWidth={2.5} />
            </button>
          </>
        ) : (
          <>
            <HLTooltip id="composer-mic-tooltip" content="Dictate" variant="dark" placement="top">
              <button
                type="button"
                onClick={startDictate}
                className="size-8 rounded-full flex items-center justify-center shrink-0 text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                aria-label="Dictate"
                aria-describedby="composer-mic-tooltip"
              >
                <MicIcon size={16} />
              </button>
            </HLTooltip>
            <HLTooltip id="composer-voice-mode-tooltip" content="Voice mode" variant="dark" placement="top">
              <button
                type="button"
                className="size-9 rounded-full flex items-center justify-center shrink-0 bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-xs"
                aria-label="Voice mode"
                aria-describedby="composer-voice-mode-tooltip"
              >
                <WaveformIcon size={16} />
              </button>
            </HLTooltip>
          </>
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
  onSessionDraft,
  onChatAutoTitle,
  composerFocusKey,
  onInputChange,
  onMessageSent,
  detailPanelOpen,
  onOpenDetailPanel,
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
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const skipDraftRef = useRef(false)

  function resolveSession() {
    if (loadedSession) return loadedSession
    if (activeChatId === SEO_SCAN_CHAT_ID) return createSeoScanSession()
    return createEmptySession()
  }

  useEffect(() => {
    skipDraftRef.current = true
    const session = resolveSession()
    const hydratedMessages = hydrateScanResultsMessages(
      session.messages,
      activeChatId === SEO_SCAN_CHAT_ID ? SEO_SCAN_PROMPT : '',
    )
    setChatMode(session.chatMode)
    setIsScanning(session.isScanning)
    setMessages(hydratedMessages)
    setInputValue(session.inputValue ?? '')
    setPendingQuestions(null)
    setAiVisibilityPending(false)
    setAwaitingAnswer(false)
    onSessionDraft?.({ ...session, messages: hydratedMessages })
    skipDraftRef.current = false
  }, [activeChatId, loadedSession])

  useEffect(() => {
    if (skipDraftRef.current) return
    onSessionDraft?.({
      chatMode,
      isScanning,
      messages,
      inputValue,
    })
  }, [chatMode, isScanning, messages, inputValue, onSessionDraft])

  useEffect(() => {
    if (!isScanning) inputRef.current?.focus()
  }, [composerFocusKey, isScanning])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isScanning])

  function getTimestamp() {
    const now = new Date()
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
  }

  const onScanComplete = useCallback(() => {
    setIsScanning(false)
    setMessages(prev => {
      const scanMsg = prev.find(m => m.content === 'scan')
      const scanKind = scanMsg?.scanKind || 'generic'

      // ai-visibility-prep: mark scan done in messages, then show URL card above composer
      if (scanKind === 'ai-visibility-prep') {
        setTimeout(() => setAiVisibilityPending(true), 0)
        return prev.map(m => m.content === 'scan' ? { ...m, content: 'scan-done' } : m)
      }

      if (prev.some(m => m.content === 'scan-results')) return prev
      const lastUser = [...prev].reverse().find(m => m.type === 'user' && m.content !== 'answers-formatted')
      const payload = buildScanResultsPayload(lastUser?.content, scanKind)
      const ts = getTimestamp()
      return prev
        .map(m => m.content === 'scan' ? { ...m, content: 'scan-done' } : m)
        .concat([{ id: Date.now(), type: 'ai', content: 'scan-results', scanKind, ts, ...payload }])
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onScanFail = useCallback((failMessage) => {
    setIsScanning(false)
    setMessages(prev =>
      prev
        .map(m => m.content === 'scan' ? { ...m, content: 'scan-done' } : m)
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
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, type: 'ai', content: 'scan', scanKind, ts: getTimestamp() },
      ])
    }, 450)
  }

  function triggerScan(scanKind = 'generic') {
    setIsScanning(true)
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, type: 'ai', content: 'scan', scanKind, ts: getTimestamp() },
      ])
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
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, type: 'ai', content: 'scan', scanKind: 'ai-visibility', ts: getTimestamp() },
      ])
    }, 400)
  }

  function handleAiVisibilitySkip() {
    setAiVisibilityPending(false)
    setIsScanning(true)
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, type: 'ai', content: 'scan', scanKind: 'ai-visibility', ts: getTimestamp() },
      ])
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
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'ai', content: 'scan', scanKind, ts: getTimestamp() }])
    }, 400)
  }

  // Hard rule: chip click only fills the composer — scan starts on Send (submitPrompt).
  function handleQuickActionSelect({ prompt }) {
    setInputValue(prompt)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function submitPrompt(trimmed, { chatTitle, chatTitleAsIs = false } = {}) {
    if (!trimmed || isScanning || pendingQuestions || awaitingAnswer || aiVisibilityPending) return
    setInputValue('')
    onMessageSent?.()
    if (chatTitle != null) onChatAutoTitle?.(chatTitle, chatTitleAsIs)
    else onChatAutoTitle?.(trimmed, false)

    const ts = getTimestamp()
    const userMsg = { id: Date.now(), type: 'user', content: trimmed, ts }
    const scanKind = getScanKindFromPrompt(trimmed)

    if (scanKind === 'ai-action-plan') {
      if (!chatMode) setChatMode(true)
      setMessages(prev => (chatMode ? [...prev, userMsg] : [userMsg]))
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
      if (!chatMode) setChatMode(true)
      setMessages(prev => [...prev, userMsg])
      setPendingQuestions({ questions: clarifyingQs })
      return
    }

    // AI visibility: start with prep scan (first loader), then show inline questions after
    if (scanKind === 'ai-visibility') {
      if (!chatMode) {
        setChatMode(true)
        startScan(userMsg, true, 'ai-visibility-prep')
      } else {
        startScan(userMsg, false, 'ai-visibility-prep')
      }
      setTimeout(() => inputRef.current?.focus(), 0)
      return
    }

    if (!chatMode) {
      onFirstMessage?.(trimmed)
      setChatMode(true)
      startScan(userMsg, true, scanKind)
    } else {
      startScan(userMsg, false, scanKind)
    }

    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handleSend() {
    submitPrompt(inputValue.trim())
  }


  const chatFooter = (
    <div className="shrink-0 border-t border-gray-200 bg-white">
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
        {aiVisibilityPending ? (
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
        <div className="flex-1 flex flex-col items-center justify-center py-10 overflow-y-auto">
          <div className="w-[85vw] max-w-[1540px] mx-auto flex flex-col items-center gap-6">

            {/* Headline */}
            <div className="text-center">
              <h1 className="text-[32px] font-bold text-gray-900 leading-[1.15] tracking-tight">
                How can we improve your visibility today?
              </h1>
            </div>

            {/* Conversational typing animation */}
            <TypingText />

            {/* Prompt composer — HighRise AI textarea pattern */}
            <div className="w-[60%] mx-auto">
              <PromptComposer
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onSend={handleSend}
                inputRef={inputRef}
                focusKey={composerFocusKey}
              />
            </div>

            {/* Quick action chips — click pastes full prompt into composer; Send starts the conversation */}
            <div className="flex flex-nowrap items-center justify-center gap-2 w-full">
              {QUICK_ACTIONS.map(({ label, prompt }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleQuickActionSelect({ prompt })}
                  className="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg bg-gray-100 text-[13px] font-normal text-gray-600 hover:bg-gray-200 transition-colors"
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
      <div className="flex-1 min-h-0 overflow-y-auto py-8">
        <div
          className={`mx-auto flex flex-col gap-6 px-6 ${
            detailPanelOpen ? 'w-full max-w-[720px]' : 'w-[60%]'
          }`}
        >
          {messages.map(msg => {
            if (msg.type === 'user') {
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
              return (
                /* User bubble — right-aligned, GHL spec: rounded-2xl rounded-br-sm, bg-gray-100 */
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[80%] min-w-0 px-4 py-3 bg-gray-100 rounded-2xl rounded-br-sm">
                    <p className="text-[14px] text-gray-900 leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              )
            }

            // scan-done: progress was removed — render nothing
            if (msg.content === 'scan-done') return null

            // scan: actively running — show loader block
            if (msg.content === 'scan') {
              return (
                <div key={msg.id} className="flex flex-col">
                  <ScanConversationBlock
                    scanKind={msg.scanKind || 'seo'}
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
                  [...messages].slice(0, messages.indexOf(msg)).reverse().find(m => m.type === 'user' && m.content !== 'answers-formatted')?.content || SEO_SCAN_PROMPT,
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
                        <p className="text-[13px] font-semibold text-gray-900">Review detailed report</p>
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
              return (
                <div key={msg.id} className="flex flex-col gap-4">
                  <p className="text-[14px] text-gray-700 leading-relaxed">
                    {msg.summaryText} Here's a breakdown of what I found:
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
                  <button
                    type="button"
                    onClick={() => onOpenDetailPanel({ type: 'report', title: 'Enhanced Visibility AI report', subtitle: 'Detailed report', report })}
                    className="w-full text-left rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-25 transition-colors shadow-xs px-4 py-3 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-900">Review detailed report</p>
                      <p className="text-[12px] text-gray-500 mt-0.5">Open full analysis in the side panel</p>
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

const modalBtnSecondary = 'h-8 px-2.5 rounded border border-gray-300 bg-white text-[14px] font-semibold text-gray-600 hover:bg-gray-50 shadow-xs transition-colors'
const modalBtnPrimary = 'h-8 px-2.5 rounded border border-primary-600 bg-primary-600 text-[14px] font-semibold text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors'
const modalBtnDanger = 'h-8 px-2.5 rounded border border-error-600 bg-error-600 text-[14px] font-semibold text-white hover:opacity-90 shadow-xs transition-colors'


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

  const inputBase = 'w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary-600 focus:shadow-focus-primary-sm transition-all'
  const iconWrap = 'flex items-center h-10 px-3 gap-2 bg-white border border-gray-300 rounded-lg focus-within:border-primary-600 focus-within:shadow-focus-primary-sm transition-all'
  const iconInner = 'flex-1 h-full text-[14px] text-gray-900 placeholder:text-gray-400 bg-transparent outline-none'
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
            <p className="text-[13px] text-gray-500 mt-0.5">
              Organize your visibility and growth analyses
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className={modalBtnSecondary}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!projectName.trim()}
            className={modalBtnPrimary}
          >
            Create project
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
          <div>
            <label className={labelBase}>
              Project name <span className="text-error-600">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. My Website SEO"
              className={inputBase}
            />
          </div>
          <div>
            <label className={labelBase}>
              Website URL
              <span className="text-[12px] font-normal text-gray-400">(optional)</span>
            </label>
            <div className={iconWrap}>
              <Globe size={15} className="text-gray-400 shrink-0" />
              <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="example.com" className={iconInner} />
            </div>
          </div>
          <div>
            <label className={labelBase}>
              Google Business Profile URL
              <span className="text-[12px] font-normal text-gray-400">(optional)</span>
            </label>
            <div className={iconWrap}>
              <MapPin size={15} className="text-gray-400 shrink-0" />
              <input type="url" value={gbpUrl} onChange={e => setGbpUrl(e.target.value)} placeholder="maps.google.com/... or place ID" className={iconInner} />
            </div>
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
                className="w-full h-10 px-3 bg-white border border-gray-300 rounded-lg text-[14px] text-gray-900 outline-none appearance-none focus:border-primary-600 focus:shadow-focus-primary-sm transition-all"
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
      <aside className="w-[56px] shrink-0 border-l border-gray-200 bg-white flex flex-col items-center pt-3 gap-2">
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
    <aside className="w-[200px] shrink-0 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-4">
        <span className="text-[13px] font-medium text-gray-400">Tools</span>
        <button
          onClick={onToggleCollapse}
          className="shrink-0 w-7 h-7 -mr-1 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          aria-label="Collapse panel"
        >
          <PanelRightIcon size={16} className="text-gray-400" />
        </button>
      </div>
      <div className="flex flex-col gap-0.5 px-2">
        {TOOLS.map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left hover:bg-gray-50 transition-colors"
          >
            <Icon size={14} className="text-gray-500 shrink-0" />
            <span className="text-[13px] font-medium text-gray-700">{label}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
