import { useState, useRef, useEffect, useCallback } from 'react'
import {
  FileText, Package, GraduationCap, CreditCard,
  Sparkles, Bot, Send, RefreshCw, Globe, Crown, Image as ImageIcon,
  Star, TrendingUp, Grid3x3, Tablet, Link2, Users,
  ChevronDown, ChevronRight, Search, Plus, Settings,
  MessageChatSquareIcon, Grid01Icon, PanelLeftIcon, PanelRightIcon,
  BookOpen, Zap, Workflow, CheckSquare,
  Pencil, Trash2, Check, X, Copy,
  FolderPlus, MapPin,
  Circle, CircleCheck, LoadingCircle, Wand2,
  ArrowUp,
} from '../icons/index.js'
import AppShell from '../shell/AppShell'

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

// Dummy prompt chips — full sentences populate the composer on click (replace with API/i18n in production)
const QUICK_ACTIONS = [
  {
    icon: Search,
    label: 'Audit GBP',
    prompt: 'Run GBP, listings, and reviews scans for my business',
  },
  {
    icon: Globe,
    label: 'Crawl for SEO',
    prompt: 'Run website SEO — check health score, technical issues, page speed, and mobile readiness for my website',
  },
  {
    icon: Star,
    label: 'Check AI visibility',
    prompt: 'Scan my AI search visibility — check how my brand appears in ChatGPT, Perplexity, Gemini, and Google AI Overviews for your website URL',
  },
  {
    icon: Wand2,
    label: 'AI action plan',
    prompt: 'Create a full SEO action plan covering local SEO, website SEO, AEO, and GEO strategy for my business',
  },
  {
    icon: Users,
    label: 'Analyze competitors',
    prompt: 'Run a competitive analysis — compare my rankings, backlinks, and content strategy against competitors for my website',
  },
  {
    icon: TrendingUp,
    label: 'Track performance',
    prompt: 'Set up performance monitoring — track my keyword rankings, traffic trends, local pack positions, and AI citations',
  },
]

const TOOLS = [
  { icon: BookOpen, label: 'Prompt library' },
  { icon: Zap, label: 'Actions' },
  { icon: Workflow, label: 'Automations' },
  { icon: CheckSquare, label: 'To do' },
]

// Dummy scan context — replace with API response in production
const SCAN_CONTEXT = {
  websiteUrl: 'https://www.newmodernhotel.com',
  businessName: 'test p',
}

// Dummy scan progress steps — replace with live job status from API in production
const SCAN_PROGRESS_STEPS = [
  'Business details fetched — test p',
  'Preparing your visibility scan plan',
  'Scan plan ready — checking Local SEO Scan',
  'Google Business Profile checked — test p',
  'Scanning local publishers for your business',
  'Fetching reviews from review platforms',
  'Turning scan data into visibility insights',
  'Preparing your visibility report',
  'Preparing your scan summary',
]

// Dummy action items — replace with API hierarchy response in production
const SEVERITY_META = {
  error: {
    groupLabel: 'ERRORS',
    dotClass: 'bg-error-600',
    pillBg: 'bg-error-50',
    pillText: 'text-error-600',
    tagSingular: 'error',
    tagPlural: 'errors',
  },
  warning: {
    groupLabel: 'WARNINGS',
    dotClass: 'bg-warning-600',
    pillBg: 'bg-warning-100',
    pillText: 'text-warning-600',
    tagSingular: 'warning',
    tagPlural: 'warnings',
  },
  notice: {
    groupLabel: 'NOTICES',
    dotClass: 'bg-success-600',
    pillBg: 'bg-success-50',
    pillText: 'text-success-600',
    tagSingular: 'notice',
    tagPlural: 'notices',
  },
}

const ACTION_ITEMS_DATA = {
  total: 7,
  categories: [
    {
      id: 'gbp',
      label: 'Google Business Profile',
      icon: MapPin,
      tags: { error: 2, warning: 1, notice: 1 },
      groups: [
        {
          id: 'gbp-errors',
          severity: 'error',
          items: [
            {
              id: 'gbp-e1',
              title: 'Complete 3 missing profile fields: Appointment URL, Menu/Services list, Business description (detailed)',
              defaultExpanded: true,
              fields: [
                { id: 'gbp-e1-f1', field: 'Appointment URL', current: '(missing)', recommended: 'Add the recommended value for Appointment URL.' },
                { id: 'gbp-e1-f2', field: 'Business description (detailed)', current: '(missing)', recommended: 'Add a complete business description for test p.' },
                { id: 'gbp-e1-f3', field: 'Menu/Services list', current: '(missing)', recommended: 'Add the recommended value for Menu/Services list.' },
              ],
              cta: 'GBP not connected. Click here to connect',
            },
            {
              id: 'gbp-e2',
              title: 'Improve review response rate (currently 40%)',
            },
          ],
        },
        {
          id: 'gbp-warnings',
          severity: 'warning',
          items: [
            {
              id: 'gbp-w1',
              title: 'Add primary category for your business type',
              subtitle: 'Affects local pack ranking',
            },
          ],
        },
        {
          id: 'gbp-notices',
          severity: 'notice',
          items: [
            {
              id: 'gbp-n1',
              title: 'Upload at least 10 photos',
              subtitle: 'Profiles with 10+ photos get 42% more direction requests',
            },
          ],
        },
      ],
    },
    {
      id: 'reviews',
      label: 'Reviews Platforms',
      icon: MapPin,
      tags: { warning: 2, notice: 1 },
      groups: [
        {
          id: 'reviews-warnings',
          severity: 'warning',
          items: [
            { id: 'rev-w1', title: 'Improve review response rate (currently 40%)' },
            { id: 'rev-w2', title: 'Set up review request automation' },
          ],
        },
        {
          id: 'reviews-notices',
          severity: 'notice',
          items: [
            { id: 'rev-n1', title: 'Monitor and respond to new reviews weekly' },
          ],
        },
      ],
    },
  ],
}

export default function VisibilityAI() {
  const [activeSubTab, setActiveSubTab] = useState('Visibility AI')
  const [activePanel, setActivePanel] = useState('Chats')
  const [chatPanelCollapsed, setChatPanelCollapsed] = useState(false)
  const [toolsPanelCollapsed, setToolsPanelCollapsed] = useState(false)
  const [composerFocusKey, setComposerFocusKey] = useState(0)
  const [composerHasInput, setComposerHasInput] = useState(false)
  // true once the current "New chat" has had at least one message sent
  const [activeChatUsed, setActiveChatUsed] = useState(false)

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
          onPanelChange={setActivePanel}
          collapsed={chatPanelCollapsed}
          onToggleCollapse={() => setChatPanelCollapsed(c => !c)}
          onNewChat={() => { setComposerFocusKey(k => k + 1); setComposerHasInput(false); setActiveChatUsed(false) }}
          composerHasInput={composerHasInput}
          activeChatUsed={activeChatUsed}
        />
        <MainContent
          composerFocusKey={composerFocusKey}
          onInputChange={setComposerHasInput}
          onMessageSent={() => setActiveChatUsed(true)}
        />
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

function ChatPanel({ activePanel, onPanelChange, collapsed, onToggleCollapse, onNewChat, composerHasInput, activeChatUsed }) {
  const [chats, setChats] = useState(INITIAL_CHATS)
  const [activeChatId, setActiveChatId] = useState(1)
  const [editingId, setEditingId] = useState(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [nextId, setNextId] = useState(INITIAL_CHATS.length + 1)
  const [searchQuery, setSearchQuery] = useState('')
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

  function handleNewChat() {
    // Only redirect to existing empty chat if it hasn't been used yet
    const existingEmpty = chats.find(c => c.label === 'New chat')
    if (existingEmpty && !activeChatUsed) {
      setActiveChatId(existingEmpty.id)
      return
    }
    const newId = nextId
    const newChat = { id: newId, label: 'New chat' }
    setChats(prev => [newChat, ...prev])
    setActiveChatId(newId)
    setNextId(n => n + 1)
    onNewChat?.()
  }

  function handleEdit(e, chat) {
    e.stopPropagation()
    setEditingId(chat.id)
    setEditingLabel(chat.label)
  }

  function handleConfirmEdit(e) {
    if (e) e.stopPropagation()
    if (editingLabel.trim()) {
      setChats(prev => prev.map(c => c.id === editingId ? { ...c, label: editingLabel.trim() } : c))
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
        setActiveChatId(remaining[0].id)
      } else if (remaining.length === 0) {
        setActiveChatId(null)
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

      {/* Chats / Dashboards tab toggle */}
      <div className="px-3 pb-3">
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {['Chats', 'Dashboards'].map(tab => (
            <button
              key={tab}
              onClick={() => onPanelChange(tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                activePanel === tab
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'Chats' ? (
                <MessageChatSquareIcon size={13} />
              ) : (
                <Grid01Icon size={13} />
              )}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Group 2: Search + new chat button */}
      <div className="px-3 pt-4 pb-3 flex flex-col gap-2">
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
      </div>

      {/* Recents list */}
      <div className="flex-1 overflow-y-auto scrollbar-gray-300">
        <div className="flex flex-col gap-0.5 px-2">
          {chats.filter(c => c.label.toLowerCase().includes(searchQuery.toLowerCase())).map(chat => {
            const isActive = chat.id === activeChatId
            const isEditing = chat.id === editingId
            return (
              <div
                key={chat.id}
                onClick={() => !isEditing && setActiveChatId(chat.id)}
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
                      {chat.label}
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

function ScanProgressList({ onComplete }) {
  // Starts with 4 completed + 2 in progress (matches prototype scan state)
  const [doneUpTo, setDoneUpTo] = useState(3)
  const calledRef = useRef(false)

  useEffect(() => {
    if (doneUpTo >= SCAN_PROGRESS_STEPS.length - 1) {
      if (!calledRef.current && onComplete) {
        calledRef.current = true
        onComplete()
      }
      return
    }
    const timer = setTimeout(() => setDoneUpTo(s => s + 1), 2800)
    return () => clearTimeout(timer)
  }, [doneUpTo, onComplete])

  return (
    <div className="flex flex-col gap-2.5 mt-5">
      {SCAN_PROGRESS_STEPS.map((label, i) => {
        const isDone = i <= doneUpTo
        const isActive = !isDone && (i === doneUpTo + 1 || i === doneUpTo + 2)
        const isPending = !isDone && !isActive

        return (
          <div key={label} className="flex items-center gap-3">
            {isDone && (
              <CircleCheck size={16} className="text-teal-600 shrink-0" />
            )}
            {isActive && (
              <LoadingCircle size={16} className="text-primary-600" />
            )}
            {isPending && (
              <Circle size={16} className="text-gray-300 shrink-0" />
            )}
            <span className={`text-[13px] leading-snug ${
              isActive ? 'font-medium text-gray-900' : isDone ? 'text-gray-700' : 'text-gray-400'
            }`}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function ScanConversationBlock({ ts, onComplete }) {
  return (
    <div className="flex flex-col">
      <div className="text-[14px] text-gray-700 leading-relaxed space-y-3">
        <p>
          I found the website:{' '}
          <a href={SCAN_CONTEXT.websiteUrl} className="text-primary-600 hover:underline">
            {SCAN_CONTEXT.websiteUrl}
          </a>
          . Business name: <strong className="font-semibold text-gray-900">{SCAN_CONTEXT.businessName}</strong>.
        </p>
        <p>I&apos;m starting the local visibility scan now.</p>
        <p>
          This usually takes 2-5 minutes. I&apos;ll keep the progress updated here and post the visibility report when everything finishes.
        </p>
      </div>

      <MessageFeedback />

      {ts && <span className="text-[11px] text-gray-400 mt-2">{ts}</span>}

      <ScanProgressList onComplete={onComplete} />
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
}) {
  const internalRef = useRef(null)
  const [isFocused, setIsFocused] = useState(!scanning)
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
    <div
      className={`w-full bg-white rounded-lg border transition-all duration-200 shadow-[0_4px_16px_rgba(16,24,40,0.08)] flex flex-col ${
        isFocused && !scanning
          ? 'border-purple-400 shadow-focus-purple-sm'
          : 'border-gray-200'
      }`}
    >
      {/* Row 1: text input */}
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

      {/* Row 2: icons stuck to bottom */}
      <div className="flex items-center px-2 pb-2 pt-1 gap-1">
        {/* + */}
        <button
          type="button"
          disabled={scanning}
          className="size-8 rounded-full flex items-center justify-center shrink-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Add attachment"
        >
          <Plus size={16} strokeWidth={2} />
        </button>

        {/* Mic */}
        {!scanning && (
          <button
            type="button"
            className="size-8 rounded-full flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
            aria-label="Voice input"
          >
            <MicIcon size={16} />
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Send / Stop */}
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
            onClick={hasText ? onSend : undefined}
            className="size-9 rounded-full flex items-center justify-center shrink-0 bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-xs"
            aria-label={hasText ? 'Send message' : 'Voice input'}
          >
            {hasText ? (
              <ArrowUp size={18} strokeWidth={2.5} />
            ) : (
              <WaveformIcon size={16} />
            )}
          </button>
        )}
      </div>
    </div>
  )
}

function MainContent({ composerFocusKey, onInputChange, onMessageSent }) {
  const [inputValue, setInputValueRaw] = useState('')
  function setInputValue(val) {
    setInputValueRaw(val)
    onInputChange?.(val.trim().length > 0)
  }
  const [chatMode, setChatMode] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [messages, setMessages] = useState([])
  const [showActionItems, setShowActionItems] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setChatMode(false)
    setIsScanning(false)
    setMessages([])
    setInputValue('')
    setShowActionItems(false)
  }, [composerFocusKey])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isScanning, showActionItems])

  function getTimestamp() {
    const now = new Date()
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
  }

  const onScanComplete = useCallback(() => {
    setIsScanning(false)
    setShowActionItems(true)
  }, [])

  function handleStopScan() {
    setIsScanning(false)
  }

  function handleSend() {
    const trimmed = inputValue.trim()
    if (!trimmed || isScanning) return
    setInputValue('')
    onMessageSent?.()

    const ts = getTimestamp()
    const userMsg = { id: Date.now(), type: 'user', content: trimmed, ts }

    if (!chatMode) {
      setChatMode(true)
      setIsScanning(true)
      setMessages([userMsg])
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { id: Date.now() + 1, type: 'ai', content: 'scan', ts: getTimestamp() },
        ])
      }, 450)
    } else {
      setMessages(prev => [...prev, userMsg])
      setIsScanning(true)
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { id: Date.now() + 1, type: 'ai', content: 'scan', ts: getTimestamp() },
        ])
      }, 450)
    }

    setTimeout(() => inputRef.current?.focus(), 0)
  }

  function handlePromptSelect(prompt) {
    setInputValue(prompt)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const chatFooter = (
    <div className="shrink-0 border-t border-gray-200 bg-white">
      <div className="max-w-[768px] mx-auto px-8 pb-2">
        {showActionItems && (
          <div className="pt-4 pb-3">
            <ActionItemsPanel />
          </div>
        )}
        <div className={showActionItems ? '' : 'pt-2'}>
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
          <p className="text-center text-[11px] text-gray-400 mt-2 mb-2">
            Review important AI-assisted changes before publishing.
          </p>
        </div>
      </div>
    </div>
  )

  if (!chatMode) {
    return (
      <main className="flex-1 min-w-0 bg-white flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-10 overflow-y-auto">
          <div className="w-full max-w-[860px] flex flex-col items-center gap-6">

            {/* Headline */}
            <div className="text-center">
              <h1 className="text-[32px] font-bold text-gray-900 leading-[1.15] tracking-tight">
                How can we improve your visibility today?
              </h1>
            </div>

            {/* Conversational typing animation */}
            <TypingText />

            {/* Prompt composer — HighRise AI textarea pattern */}
            <div className="w-full max-w-[768px]">
              <PromptComposer
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onSend={handleSend}
                inputRef={inputRef}
                focusKey={composerFocusKey}
              />
            </div>

            {/* Quick action chips — 4 on first row, 2 on second */}
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="flex flex-nowrap items-center justify-center gap-2">
                {QUICK_ACTIONS.slice(0, 4).map(({ label, prompt }) => (
                  <button
                    key={label}
                    onClick={() => handlePromptSelect(prompt)}
                    className="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg bg-gray-100 text-[13px] font-normal text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex flex-nowrap items-center justify-center gap-2">
                {QUICK_ACTIONS.slice(4).map(({ label, prompt }) => (
                  <button
                    key={label}
                    onClick={() => handlePromptSelect(prompt)}
                    className="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-lg bg-gray-100 text-[13px] font-normal text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 min-w-0 bg-white flex flex-col overflow-hidden">
      {/* Scrollable conversational thread */}
      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8">
        <div className="max-w-[768px] mx-auto flex flex-col gap-8">
          {messages.map(msg => {
            if (msg.type === 'user') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[520px] px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl rounded-br-md">
                    <p className="text-[14px] text-gray-900 leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              )
            }

            if (msg.content === 'scan') {
              return (
                <ScanConversationBlock
                  key={msg.id}
                  ts={msg.ts}
                  onComplete={onScanComplete}
                />
              )
            }

            return null
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed footer — separator line, action items, then editor */}
      {chatFooter}
    </main>
  )
}

function SeveritySummaryTags({ tags }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
      {Object.entries(tags).map(([severity, count]) => {
        if (!count) return null
        const meta = SEVERITY_META[severity]
        return (
          <span
            key={severity}
            className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5 ${meta.pillBg} ${meta.pillText}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dotClass}`} />
            {count} {count === 1 ? meta.tagSingular : meta.tagPlural}
          </span>
        )
      })}
    </div>
  )
}

function ActionItemCheckbox({ checked, onToggle }) {
  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation()
        onToggle()
      }}
      className={`w-[15px] h-[15px] rounded-[3px] flex items-center justify-center shrink-0 border-2 transition-colors ${
        checked
          ? 'bg-primary-600 border-primary-600'
          : 'bg-white border-gray-300 hover:border-primary-600'
      }`}
      aria-label={checked ? 'Deselect item' : 'Select item'}
    >
      {checked && <Check size={9} className="text-white" strokeWidth={3.5} />}
    </button>
  )
}

function ActionItemDetailTable({ item, checkedIds, onToggleCheck }) {
  if (!item.fields?.length) return null

  return (
    <div className="mx-4 mb-3 ml-10 border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)] gap-3 px-3 py-2 bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
        <span>Field</span>
        <span>Current Value</span>
        <span>Recommended Value</span>
      </div>
      {item.fields.map(field => (
        <div
          key={field.id}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)] gap-3 px-3 py-2.5 border-b border-gray-100 last:border-b-0 items-start"
        >
          <div className="flex items-start gap-2 min-w-0">
            <ActionItemCheckbox
              checked={checkedIds.has(field.id)}
              onToggle={() => onToggleCheck(field.id)}
            />
            <span className="text-[12px] font-medium text-gray-900 leading-snug">{field.field}</span>
          </div>
          <span className="text-[12px] text-gray-500">{field.current}</span>
          <div className="flex items-start gap-1.5 min-w-0">
            <span className="text-[12px] text-gray-700 leading-snug flex-1">{field.recommended}</span>
            <Pencil size={13} className="text-gray-400 shrink-0 mt-0.5" />
          </div>
        </div>
      ))}
      {item.cta && (
        <div className="flex justify-end px-3 py-2 border-t border-gray-100 bg-gray-25">
          <button type="button" className="text-[12px] font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            {item.cta}
          </button>
        </div>
      )}
    </div>
  )
}

function ActionItemsPanel() {
  const [panelOpen, setPanelOpen] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState({ gbp: true })
  const [expandedGroups, setExpandedGroups] = useState({ 'gbp-errors': true, 'gbp-warnings': true })
  const [expandedItems, setExpandedItems] = useState({ 'gbp-e1': true })
  const [checkedItems, setCheckedItems] = useState(new Set())

  function toggleCategory(catId) {
    const opening = !expandedCategories[catId]
    if (opening) {
      const cat = ACTION_ITEMS_DATA.categories.find(c => c.id === catId)
      const firstExpandable = cat?.groups.flatMap(g => g.items).find(i => i.fields?.length)
      if (firstExpandable) {
        setExpandedItems(e => ({ ...e, [firstExpandable.id]: true }))
      }
      if (cat?.groups.length) {
        setExpandedGroups(gx => ({
          ...gx,
          ...Object.fromEntries(cat.groups.map(grp => [grp.id, true])),
        }))
      }
    }
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }))
  }

  function toggleGroup(groupId) {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }))
  }

  function toggleItem(itemId, category) {
    setExpandedItems(prev => {
      if (!prev[itemId]) {
        return { ...prev, [itemId]: true }
      }
      const expandableIds = category.groups.flatMap(g =>
        g.items.filter(i => i.fields?.length).map(i => i.id)
      )
      const otherOpen = expandableIds.some(id => id !== itemId && prev[id])
      if (!otherOpen && expandableIds.includes(itemId)) {
        return prev
      }
      return { ...prev, [itemId]: false }
    })
  }

  function toggleCheck(itemId) {
    setCheckedItems(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs">
      <button
        type="button"
        className="w-full flex items-center gap-2 px-4 py-3 bg-primary-50 cursor-pointer select-none text-left"
        onClick={() => setPanelOpen(o => !o)}
      >
        <div className="w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
          <Check size={11} className="text-white" strokeWidth={3} />
        </div>
        <span className="text-[14px] font-semibold text-gray-900">Action Items</span>
        <span className="text-[14px] font-normal text-gray-500">({ACTION_ITEMS_DATA.total} tasks)</span>
        <div className="flex-1" />
        <ChevronDown
          size={16}
          className={`text-gray-500 shrink-0 transition-transform duration-200 ${panelOpen ? '' : '-rotate-90'}`}
        />
      </button>

      {panelOpen && (
        <div className="bg-white max-h-[320px] overflow-y-auto scrollbar-gray-300">
          {ACTION_ITEMS_DATA.categories.map((cat, catIdx) => {
            const CatIcon = cat.icon
            const catExpanded = !!expandedCategories[cat.id]
            const isLastCat = catIdx === ACTION_ITEMS_DATA.categories.length - 1

            return (
              <div key={cat.id} className={!isLastCat ? 'border-b border-gray-200' : ''}>
                <button
                  type="button"
                  className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  onClick={() => toggleCategory(cat.id)}
                >
                  <ChevronRight
                    size={14}
                    className={`text-gray-400 shrink-0 transition-transform duration-200 ${catExpanded ? 'rotate-90' : ''}`}
                  />
                  <CatIcon size={16} className="text-primary-600 shrink-0" />
                  <span className="text-[14px] font-medium text-gray-900 flex-1 min-w-0 text-left">
                    {cat.label}
                  </span>
                  {!catExpanded && <SeveritySummaryTags tags={cat.tags} />}
                </button>

                {catExpanded && cat.groups.map(group => {
                  const meta = SEVERITY_META[group.severity]
                  const groupExpanded = !!expandedGroups[group.id]

                  return (
                    <div key={group.id}>
                      <button
                        type="button"
                        className="w-full flex items-center gap-2.5 pl-8 pr-4 py-2 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                        onClick={() => toggleGroup(group.id)}
                      >
                        <ChevronDown
                          size={12}
                          className={`text-gray-400 shrink-0 transition-transform duration-200 ${groupExpanded ? '' : '-rotate-90'}`}
                        />
                        <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dotClass}`} />
                        <span className={`text-[11px] font-bold tracking-wide ${meta.pillText}`}>
                          {meta.groupLabel}
                        </span>
                        <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full leading-none ${meta.pillBg} ${meta.pillText}`}>
                          {group.items.length}
                        </span>
                      </button>

                      {groupExpanded && group.items.map(item => {
                        const itemExpanded = !!expandedItems[item.id]
                        const hasDetail = !!item.fields?.length

                        return (
                          <div key={item.id} className="border-t border-gray-100">
                            <div className="flex items-start gap-2 pl-10 pr-4 py-2.5 hover:bg-gray-25 transition-colors">
                              <ActionItemCheckbox
                                checked={checkedItems.has(item.id)}
                                onToggle={() => toggleCheck(item.id)}
                              />
                              <button
                                type="button"
                                className="flex items-start gap-1.5 flex-1 min-w-0 text-left"
                                onClick={() => hasDetail && toggleItem(item.id, cat)}
                              >
                                {hasDetail && (
                                  <ChevronDown
                                    size={13}
                                    className={`text-gray-400 shrink-0 mt-0.5 transition-transform duration-200 ${itemExpanded ? '' : '-rotate-90'}`}
                                  />
                                )}
                                <span className="text-[13px] text-gray-800 leading-snug">{item.title}</span>
                              </button>
                            </div>

                            {itemExpanded && hasDetail && (
                              <ActionItemDetailTable
                                item={item}
                                checkedIds={checkedItems}
                                onToggleCheck={toggleCheck}
                              />
                            )}

                            {itemExpanded && !hasDetail && item.subtitle && (
                              <p className="pl-[4.25rem] pr-4 pb-2.5 text-[12px] text-gray-500">{item.subtitle}</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
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
