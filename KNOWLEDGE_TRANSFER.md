# Visibility AI New — Knowledge Transfer Document

> Hand this file to any Claude/Cursor instance that needs full context on this project before making changes.

---

## Project Identity

| Field | Value |
|---|---|
| Project Name | Visibility AI New |
| Stack | React 19 + Vite 8 + Tailwind CSS 4 |
| Dev Server | `http://localhost:5174` (strict, never change) |
| Branch | `sandbox` (main branch for all development) |
| Language | JavaScript only — no TypeScript |
| Package Manager | npm |
| Router | react-router-dom v7 |

---

## What This Project Is

A SaaS dashboard UI scaffold for **HighLevel's Reputation > Visibility AI** feature. It uses a **frozen shell layer** (navigation chrome that never changes) and **customizable page content** built on top of it.

The primary page already built is `VisibilityAI` — an AI-powered SEO and local search visibility tool with a three-panel layout (Chat sidebar → Main content → Tools sidebar).

---

## Architecture: Three Layers

### Layer 1 — Shell (FROZEN, never modify)
These files are the navigation chrome. They are complete and working. Do not touch them.

```
src/shell/
├── AppShell.jsx          ← Main orchestrator
├── Sidebar.jsx           ← Dark sidebar (280px expanded / 64px collapsed)
├── TopBar.jsx            ← Two-row header (title + tabs)
├── Canvas.jsx            ← Content wrapper (white card on gray bg)
├── BackToolbar.jsx       ← Drill-down back navigation bar
├── VerticalTabs.jsx      ← Left-side vertical tab strip
├── SubAccountSwitcher.jsx
├── NotificationsDrawer.jsx
└── HelpDrawer.jsx
```

### Layer 2 — Router
`src/App.jsx` — Only ADD routes here, never modify existing ones.

### Layer 3 — Pages (where you build)
`src/pages/*.jsx` — Each page file is self-contained. The main page is `VisibilityAI.jsx`.

---

## Icon System — CRITICAL

The project uses a **custom icon layer** at `src/icons/`. These are NOT imported from lucide-react directly — they are re-exported wrappers. Always import from `../icons/index.js` (from within pages) or `./icons/index.js` (from shell level), never directly from lucide-react.

```jsx
// Correct
import { Search, Plus, Globe, Star } from '../icons/index.js'

// Wrong — do not do this
import { Search } from 'lucide-react'
```

### Available Icons (complete list)
`AlertTriangle, ArrowLeft, ArrowUpCircle, Award, BarChart3, Bell, BookOpen, Bot, Building2, Calendar, Check, CheckSquare, ChevronDown, ChevronLeft, ChevronRight, Circle, CircleCheck, Clock, Code2, Copy, CreditCard, Crown, Download, ExternalLink, FileText, FolderPlus, Globe, GraduationCap, Grid3x3, HelpCircle, Image, ImageIcon, LayoutDashboard, LayoutGrid, LayoutList, Link2, Loader2, Mail, MapPin, Megaphone, MessageCircle, MessageSquare, MoreHorizontal, Package, Paperclip, Pencil, Phone, Pin, Plus, Refresh, RefreshCw, Search, Send, Settings, Share2, Sparkles, Star, Tablet, Trash2, TrendingUp, User, Users, Wand2, Workflow, X, Zap`

If you need an icon not in this list, find the closest visual match from the list above. Do not install or import new icon packages.

Common sizes used: `12, 13, 14, 15, 16, 18, 20, 24`

```jsx
<Search size={14} className="text-[#667085]" />
<Plus size={16} strokeWidth={2.5} />
<Loader2 size={16} className="text-[#6938EF] animate-spin" />
```

---

## Design System

### The Rule: Use Hex Colors Directly
Tailwind class names like `bg-gray-100` or `text-purple-600` do NOT match the design system. Always use bracketed hex values: `bg-[#F2F4F7]`, `text-[#6938EF]`.

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| **Primary Purple** | | |
| `#6938EF` | CTA buttons, active states, focus rings |
| `#5B2FD0` | CTA button hover |
| `#F4F3FF` | Active item background, purple tint areas |
| `#E9D7FE` | Purple borders, active border |
| **Blue** | | |
| `#155EEF` | Tab indicators, checkboxes |
| `#1249C0` | Blue button hover |
| `#EEF4FF` | Blue light backgrounds |
| **Gray Scale** | | |
| `#101828` | Primary text, darkest |
| `#344054` | Body text, nav labels |
| `#475467` | Scrollbar thumb |
| `#667085` | Secondary text, muted icons |
| `#98A2B3` | Placeholder text, muted |
| `#D0D5DD` | Secondary borders, unchecked checkbox |
| `#EAECF0` | Default borders (cards, panels, inputs) |
| `#F2F4F7` | Inactive icon bg, subtle inputs |
| `#F9FAFB` | Page background, row hover |
| `#FAFAFA` | Subtle item row hover |
| **Semantic** | | |
| `#16A34A` | Success / positive text |
| `#15803D` | Implement button background |
| `#166534` | Implement button hover |
| `#DC2626` | Error / negative text |
| `#D97706` | Warning text |
| `#FEF2F2` | Critical severity pill background |
| `#F0FDF4` | Low severity pill background |
| `#FEF3C7` | Warning badge background |
| **Sidebar** | | |
| `#1D2939` | Sidebar item hover/active background |
| **Teal (AI avatar)** | | |
| `#F0FDFA` | User avatar background |
| `#99F6E4` | User avatar border |
| `#0D9488` | User avatar icon color |

### Typography

- Font: `Inter, system-ui, -apple-system, sans-serif`
- Base size: `14px` body, `13px` secondary, `12px` tertiary, `11px` labels/tags
- Weights: `400` regular, `500` medium, `600` semibold, `700` bold
- Default text color: `#101828`

### Spacing & Borders

- Rounded corners: `rounded-lg` (8px) for most elements, `rounded-xl` (12px) for modals/inputs
- Default border: `border border-[#EAECF0]`
- Focus ring (purple): `focus:border-[#6938EF] focus:shadow-[0_0_0_3px_rgba(105,56,239,0.08)]`
- Transitions: `transition-colors` (200ms) or `transition-all`

### Reusable Component Patterns

**Primary Button (Purple CTA)**
```jsx
<button className="px-4 py-2.5 rounded-lg bg-[#6938EF] text-white text-[14px] font-semibold hover:bg-[#5B2FD0] transition-colors shadow-sm">
  Label
</button>
```

**Secondary / Outlined Button**
```jsx
<button className="px-3 py-1.5 rounded-lg border border-[#EAECF0] bg-white text-[13px] font-medium text-[#344054] hover:bg-[#F9FAFB] hover:border-[#D0D5DD] transition-all">
  Label
</button>
```

**Input Field**
```jsx
<input className="px-4 py-2 bg-white border border-[#EAECF0] rounded-lg text-[14px] text-[#101828] placeholder:text-[#98A2B3] outline-none focus:border-[#6938EF] focus:shadow-[0_0_0_3px_rgba(105,56,239,0.1)] transition-all" />
```

**Input with Icon**
```jsx
<div className="flex items-center gap-2 px-3 py-2 bg-white border border-[#EAECF0] rounded-lg focus-within:border-[#6938EF] focus-within:shadow-[0_0_0_3px_rgba(105,56,239,0.08)] transition-all">
  <Globe size={15} className="text-[#98A2B3] shrink-0" />
  <input className="flex-1 text-[14px] text-[#101828] placeholder:text-[#98A2B3] bg-transparent outline-none" />
</div>
```

**Card / Panel**
```jsx
<div className="border border-[#EAECF0] rounded-lg bg-white p-4">
  {/* content */}
</div>
```

**Dropdown / Select**
```jsx
<div className="relative">
  <select className="w-full h-10 px-3 bg-white border border-[#D0D5DD] rounded-lg text-[14px] text-[#101828] outline-none appearance-none focus:border-[#6938EF] transition-all">
    <option>...</option>
  </select>
  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none" />
</div>
```

---

## Shell Component API

### AppShell — the root layout wrapper

```jsx
import AppShell from '../shell/AppShell'

<AppShell
  layout="default"           // "default" (standard nav) | "fullscreen" (no sidebar/topbar)
  sidebar="main-nav"         // "main-nav" | "settings" | false (no sidebar)
  sidebarProps={{
    navSections: [           // For "main-nav" — array of sections
      {
        items: [
          { icon: IconComponent, label: 'Nav Item', active: true }
        ]
      }
    ],
    sections: [...]          // For "settings" sidebar variant
  }}
  topbar="tabbed"            // "simple" | "tabbed"
  topbarProps={{
    title: 'Page Title',
    sectionTabs: [],         // Top-level tabs (usually empty for sub-pages)
    activeSection: '',
    subTabs: ['Tab1', 'Tab2'],
    activeSubTab: 'Tab1',
    onSubTabChange: (tab) => setActiveTab(tab),
    actions: <ReactNode />,  // Optional right-side action buttons
  }}
  backToolbar={{             // Optional — shows back navigation bar
    onBack: () => {},
    label: 'Back',
    title: 'Detail Page Title',
  }}
  verticalTabs={{            // Optional — left-side vertical tabs
    tabs: ['Tab1', 'Tab2'],
    activeTab: 'Tab1',
    onTabChange: (tab) => {},
  }}
>
  {/* Your page content */}
</AppShell>
```

### Canvas — optional content wrapper

```jsx
import Canvas from '../shell/Canvas'

<Canvas level={1}>          // level={1} normal | level={2} drill-down with back button
  {/* content */}
</Canvas>
```

Note: `VisibilityAI.jsx` does NOT use Canvas — it uses a raw `<div>` for full layout control. Canvas is better for simpler pages with card-style content.

---

## Current Routes

| Path | Component | Description |
|---|---|---|
| `/` | `Overview.jsx` | Landing / navigation page |
| `/visibility-ai` | `VisibilityAI.jsx` | Main AI visibility tool |
| `/ref/main-nav-simple` | `Demo_MainNav_Simple.jsx` | Shell variant reference |
| `/ref/main-nav-tabbed` | `Demo_MainNav_Tabbed.jsx` | Shell variant reference |
| `/ref/main-nav-tabbed-vertical-tabs` | ... | Shell variant reference |
| `/ref/main-nav-vertical-tabs-back-toolbar` | ... | Shell variant reference |
| `/ref/level2` | `Demo_Level2.jsx` | Level 2 / drill-down demo |
| `/ref/fullscreen-builder` | `Demo_Fullscreen_Builder.jsx` | Fullscreen layout demo |
| `/ref/settings-tabbed` | `Demo_Settings_Tabbed.jsx` | Settings layout demo |
| `/ref/settings-vertical-tabs` | ... | Settings layout demo |
| `/ref/settings-vertical-tabs-back-toolbar` | ... | Settings layout demo |
| `/ref/fullscreen-vertical-tabs-back-toolbar` | ... | Fullscreen with vertical tabs |

The `/ref/*` routes are read-only reference implementations showing how the shell components work. Do not modify them.

---

## VisibilityAI Page — Full Component Map

The main page at `/visibility-ai` is `src/pages/VisibilityAI.jsx`. Structure:

```
VisibilityAI()                     ← root, manages activeSubTab + activePanel
├── AppShell (main-nav, tabbed)
│   └── [raw flex container]
│       ├── ChatPanel              ← 280px left sidebar
│       │   ├── Project selector dropdown
│       │   ├── Chats / Dashboards toggle
│       │   ├── New chat button
│       │   ├── Recent chats list (edit/delete inline)
│       │   └── SEO preferences footer
│       ├── MainContent            ← flex-1 center area
│       │   ├── [Landing state]    ← shown when chatMode=false
│       │   │   ├── Headline + subtitle
│       │   │   ├── "Let's get started" CTA button
│       │   │   ├── URL input bar
│       │   │   └── Quick action chips
│       │   └── [Chat state]       ← shown when chatMode=true
│       │       ├── Messages list
│       │       │   ├── UserAvatar + user bubble
│       │       │   ├── AIAvatar + intro message
│       │       │   └── ProgressCard (animated steps → triggers ActionItemsPanel)
│       │       ├── ActionItemsPanel (appears after progress completes)
│       │       └── Input bar (pinned to bottom)
│       └── ToolsPanel             ← 200px right sidebar
│           └── Tools list (Prompt library, Actions, Automations, To do)
```

### Key State in MainContent
- `chatMode: false` → shows landing state (headline + CTA + input)
- `chatMode: true` → shows chat thread with messages
- First send transitions from landing → chat mode

### ProgressCard behavior
Cycles through 5 steps with 1.4s delay each:
1. Understanding your query
2. Planning the analysis
3. Fetching data
4. Running insights on data
5. Generating the report

When complete, calls `onComplete()` which sets `showActionItems = true`, revealing the `ActionItemsPanel`.

### ActionItemsPanel
Collapsible panel at the bottom of MainContent. Shows categorized action items (Website SEO → CRITICAL / LOW groups). Items have checkboxes; footer shows "Implement Changes (N)" button in green.

### NewProjectModal
Triggered from the project dropdown "Create new project" button. Full modal with: project name (required), website URL, GBP URL, notification email, target country.

---

## Sidebar Navigation Sections

The `NAV_SECTIONS` array in `VisibilityAI.jsx` defines two groups:

**Section 1:**
Claims, Batches, Larnies, Payments

**Section 2 (active item: Reputation):**
AI Studio, AI Agents, Marketing, Automation, Sites, Memberships, Media Storage, **Reputation** *(active)*, Reporting, App marketplace, Mobile app, affilaites custom, Communities

**Tab bar (SUB_TABS):**
Overview, Requests, Reviews, Video Testimonials, Widgets, Listings, GBP Optimization, **Visibility AI** *(active underline)*, Settings

---

## Scrollbar Utility Classes

```css
.no-scrollbar            /* Hides scrollbar completely */
.hover-shows-scrollbar   /* Shows scrollbar (#475467) only on container hover */
```

Use `no-scrollbar` on scrollable lists that shouldn't show a scrollbar at all. Use `hover-shows-scrollbar` on containers where you want the scrollbar to appear only on hover (like ChatPanel).

---

## How to Add a New Page

### 1. Create the page file

```jsx
// src/pages/MyFeature.jsx
import { useState } from 'react'
import { YourIcon } from '../icons/index.js'
import AppShell from '../shell/AppShell'

const NAV_SECTIONS = [
  {
    items: [
      { icon: YourIcon, label: 'My Feature', active: true },
    ],
  },
]

const SUB_TABS = ['Tab 1', 'Tab 2']

export default function MyFeature() {
  const [activeTab, setActiveTab] = useState('Tab 1')

  return (
    <AppShell
      sidebar="main-nav"
      sidebarProps={{ navSections: NAV_SECTIONS }}
      topbar="tabbed"
      topbarProps={{
        title: 'Feature Name',
        subTabs: SUB_TABS,
        activeSubTab: activeTab,
        onSubTabChange: setActiveTab,
      }}
    >
      <div className="flex-1 overflow-auto bg-white p-6">
        {/* Your content */}
      </div>
    </AppShell>
  )
}
```

### 2. Add the route to App.jsx

Open `src/App.jsx` and add:
```jsx
import MyFeature from './pages/MyFeature'

// Inside <Routes>:
<Route path="/my-feature" element={<MyFeature />} />
```

### 3. Test at `http://localhost:5174/my-feature`

---

## What NOT To Do

- **Never modify** any file in `src/shell/` — these are frozen and complete
- **Never change** the port from 5174
- **Never import** from `lucide-react` directly — use `../icons/index.js`
- **Never use** Tailwind semantic class names like `bg-gray-100` — use hex values
- **Never add** TypeScript
- **Never add** external UI libraries (no shadcn, no MUI, no Chakra, etc.)
- **Never modify** `src/main.jsx`
- **Never delete** existing routes from `App.jsx`
- **Never install** `@platform-ui/highrise` or `@gohighlevel/ghl-icons` components in React — they are Vue 3 only

---

## Running the Project

```bash
npm run dev
# → http://localhost:5174
```

If port is in use:
```bash
lsof -i :5174   # find the PID
kill <PID>
npm run dev
```

---

## Package Notes

These packages are declared but Vue-only — their components cannot be used in React JSX:
- `@platform-ui/highrise` — HighLevel's Vue 3 component library
- `@gohighlevel/ghl-icons` — Vue 3 icon library

The workaround already in place:
- Components → plain React + Tailwind, styled to match HighRise visually
- Icons → `src/icons/` custom wrappers (lucide-react based, matching GHL icon shapes visually)
- Design tokens → CSS custom properties in `src/index.css @theme {}`

Private registry packages require special env vars (`GITHUB_PKG_AUTH_TOKEN`, `GOOGLE_PKG_AUTH_TOKEN`) — if `npm install` fails, those are optional dependencies and can be skipped.

---

## Git Workflow

```bash
# Start work
git pull origin sandbox

# Create feature branch
git checkout -b feature/your-feature-name

# Commit
git add src/pages/MyFeature.jsx src/App.jsx
git commit -m "feat: Add MyFeature page with [brief description]"

# Push
git push origin feature/your-feature-name
```

Commit format: `feat(component-name): Brief description`

---

## Text & Copy Conventions

- Sentence case for all UI text: "New chat", "Create project", "Let's get started"
- Acronyms stay uppercase: GBP, SEO, AI, CTA, URL
- Use `&` not "and" in button labels where space is tight
- Placeholder text: lowercase and descriptive — `"Enter your website URL or ask a specialized question"`

---

## Quick Reference — Frequently Used Patterns

### Active item highlight (purple)
```jsx
className={`... ${isActive ? 'bg-[#F4F3FF] text-[#6938EF]' : 'hover:bg-[#F9FAFB] text-[#344054]'}`}
```

### Chat bubble — user
```jsx
<div className="max-w-[480px] px-4 py-2.5 bg-[#F9FAFB] border border-[#EAECF0] rounded-2xl rounded-br-sm">
  <p className="text-[14px] text-[#101828] leading-relaxed">{text}</p>
</div>
```

### Chat bubble — AI
```jsx
<div className="max-w-[520px] px-4 py-2.5 bg-white border border-[#EAECF0] rounded-2xl rounded-bl-sm shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
  <p className="text-[14px] text-[#344054] leading-relaxed">{text}</p>
</div>
```

### AI Avatar
```jsx
<div className="w-8 h-8 rounded-full bg-[#F4F3FF] border border-[#E9D7FE] flex items-center justify-center shrink-0">
  <BarChart3 size={14} className="text-[#6938EF]" />
</div>
```

### User Avatar
```jsx
<div className="w-8 h-8 rounded-full bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center shrink-0">
  <User size={14} className="text-[#0D9488]" />
</div>
```

### Divider
```jsx
<div className="border-t border-[#EAECF0]" />
```

### Implement / Success button
```jsx
<button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#15803D] text-white text-[13px] font-semibold hover:bg-[#166534] transition-colors">
  <Wand2 size={13} />
  Implement Changes
</button>
```

---

*Last updated: 2026-05-29 | Status: Production-ready on localhost:5174*
