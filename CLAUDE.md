# Visibility AI New — Multi-Agent Development Guide

## 🎯 Project Overview

**Visibility AI New** is a React + Vite design scaffold for building a SaaS dashboard UI. The project uses a frozen shell layer for navigation/layout with customizable page content.

**Status**: Production-ready (localhost:5174)  
**Repository**: `Visibility-AI-New` on GitHub  
**Branch**: `sandbox`  
**Dev Server Port**: 5174 (strict, non-negotiable)

---

## 📐 Architecture

### Three-Layer System

1. **Shell Layer** (Frozen — DO NOT MODIFY)
   - `src/shell/AppShell.jsx` — Main orchestrator (sidebar + topbar + content area)
   - `src/shell/Sidebar.jsx` — Dark theme navigation (280px expanded, 64px collapsed)
   - `src/shell/TopBar.jsx` — Two-row header (title + tabs)
   - `src/shell/Canvas.jsx` — Content wrapper (white card on gray background)
   - `src/shell/BackToolbar.jsx`, `VerticalTabs.jsx`, `*Drawer.jsx` — Specialty components
   - `src/index.css` — Global styles + design tokens (modifiable for styling only)

2. **Router Layer**
   - `src/App.jsx` — Route definitions (add new pages here)

3. **Page Layer** (Customizable — WHERE YOU BUILD)
   - `src/pages/*.jsx` — Individual feature pages/screens
   - Each page imports frozen shell components and configures them via props

### Current Page: VisibilityAI

**Location**: `src/pages/VisibilityAI.jsx`  
**Route**: `/visibility-ai`  
**Components**:
- `ChatPanel` — Left sidebar (chat history, recents, search)
- `MainContent` — Center content (headline, CTA, URL input, action chips)
- `ToolsPanel` — Right sidebar (tools menu)

---

## 🏗 Highrise Design System Setup

### Package References

The project is aligned with the HighRise / HighLevel design system. Three packages are declared in `package.json`:

| Package | Role | Status |
|---|---|---|
| `@platform-ui/highrise` | Vue 3 component library + `HLTailwindConfig` tokens | `dependency` — requires private Google Artifact Registry auth |
| `@gohighlevel/ghl-icons` | Vue 3 icon library | `dependency` — requires private GitHub Package Registry auth |
| `@ghl-plugins/tailwind-prefix-wrapper` | PostCSS Tailwind prefix plugin | `devDependency` — requires private GitHub Package Registry auth |

### Private Registry Setup

`.npmrc` is pre-configured. Provide two env vars before running `npm install`:

```bash
export GITHUB_PKG_AUTH_TOKEN=<your GitHub PAT with read:packages>
export GOOGLE_PKG_AUTH_TOKEN=<your Google Cloud access token>
npm install
```

### React Compatibility Note

`@platform-ui/highrise` and `@gohighlevel/ghl-icons` are **Vue 3 only** — their components cannot be imported in React. In this project:
- **Components**: built as plain React + Tailwind, styled to the HighRise visual spec
- **Icons**: use `lucide-react` (visual equivalent; see memory for reference)
- **Design tokens**: CSS custom properties in `src/index.css` `@theme {}` mirror the `HLTailwindConfig` token values — every token defined here is actively used in `src/shell/` or `src/pages/`

### Icon Reference

Browse approved icons at `https://ghl-icons.msgsndr.net/?path=/docs/ghl-icons--docs` and find the nearest `lucide-react` equivalent. Map by visual shape, not by name.

---

## 🎨 Design System

### Color Tokens (HighRise v3 palettes from `@platform-ui/highrise` HLTailwindConfig)

All colors come from the HighRise design system palettes. Use numeric shade suffixes in Tailwind classes.

```
Primary (blue — tab indicators, checkboxes, action items):
  primary-50   #EEF4FF   — vertical tab active bg, overflow tab pill
  primary-600  #155EEF   — tab indicators, checkboxes, active states
  primary-700  #1249C0   — primary button hover

Purple (AI / Reputation — CTA buttons, active states):
  purple-50    #F4F3FF   — active item bg
  purple-200   #E9D7FE   — active borders
  purple-600   #6938EF   — CTA buttons, active states
  purple-700   #5B2FD0   — CTA button hover

Fuchsia (AI gradient end):
  fuchsia-500  #D444F1

Success (green):
  success-50   #F0FDF4   — low-severity pill bg
  success-600  #16A34A   — success text, check icons
  success-700  #15803D   — implement button bg
  success-800  #166534   — implement button hover
  success-900  #14532d   — confirm action deep hover

Error (red):
  error-50     #FEF2F2   — critical severity pill bg
  error-600    #DC2626   — error text

Warning (amber):
  warning-100  #FEF3C7   — warning badge bg
  warning-600  #D97706   — warning text

Gray Scale (all shades 25–900):
  gray-25   #FAFAFA    — subtle item row hover
  gray-50   #F9FAFB    — page background, row hover
  gray-100  #F2F4F7    — inactive icon bg
  gray-200  #EAECF0    — borders (cards, panels, inputs)
  gray-300  #D0D5DD    — secondary borders, unchecked checkbox
  gray-400  #98A2B3    — placeholder, muted icons
  gray-500  #667085    — secondary text, icons
  gray-600  #475467    — scrollbar thumb
  gray-700  #344054    — body text, nav labels
  gray-800  #1D2939    — sidebar item hover/active bg
  gray-900  #101828    — primary text, sidebar background

Teal (AI user avatar palette):
  teal-50   #F0FDFA
  teal-200  #99F6E4
  teal-600  #0D9488

Custom extensions (tailwind.config.js — not in HighRise core):
  accent-green       #73E2A3   — sidebar collapse control
  accent-green-dark  #5DD08C   — sidebar collapse control hover
  hl-yellow          #F9C400   — GHL logo left mark (use as literal hex in SVG)
  hl-teal            #00C4C4   — GHL logo right mark (use as literal hex in SVG)
  brand-deep         #0F1419   — VA logo background
  va-accent-green    #34D399   — VA logo path fill
  va-accent-orange   #F97316   — VA logo path fill (use as literal hex in SVG)
  positive-deepest   #14532d   — confirm action deep hover (tailwind.config.js custom)

Shadows (defined in tailwind.config.js boxShadow):
  shadow-xs             — topbar/builderbar bottom shadow
  shadow-card           — canvas card elevation
  shadow-switcher       — sub-account switcher popup
  shadow-purple-glow    — AI button hover glow
  shadow-focus-purple-xs/sm/md — input focus rings (6%/8%/10% opacity)
  shadow-message        — chat bubble shadow
  shadow-progress-card  — progress card shadow
```

> **Design Token Rule**: Use HighRise palette class names directly in Tailwind (e.g. `bg-purple-600`, `text-primary-600`). For SVG `stroke`/`fill` attributes on logo paths where the color is not a HighRise variable, use literal hex values. For inline styles that need CSS variable access, use `var(--purple-600)`, `var(--error-600)` etc. (HighRise v3 CSS variables have no `--color-` prefix).

### Typography

- **Font**: Inter, system-ui, -apple-system, sans-serif
- **Default Color**: #101828 (gray-900)
- **Default Size**: 14px (body), 13px (small), 12px (extra-small)
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Common Patterns

**Button (Primary)**:
```jsx
<button className="px-4 py-2.5 rounded-lg bg-purple-600 text-white text-[14px] font-semibold hover:bg-purple-700 transition-colors shadow-sm">
  Label
</button>
```

**Button (Secondary/Outlined)**:
```jsx
<button className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
  Label
</button>
```

**Input**:
```jsx
<input className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-purple-600 focus:shadow-focus-purple-md transition-all" />
```

**Card/Panel**:
```jsx
<div className="border border-gray-200 rounded-lg bg-white p-4">
  {/* content */}
</div>
```

---

## 📁 File Structure

```
src/
├── pages/
│   ├── VisibilityAI.jsx          ← Main page (edit here)
│   ├── Overview.jsx               ← Landing page
│   └── Demo_*.jsx                 ← Shell variant references (DO NOT EDIT)
├── shell/
│   ├── AppShell.jsx               ← FROZEN
│   ├── Sidebar.jsx                ← FROZEN
│   ├── TopBar.jsx                 ← FROZEN
│   ├── Canvas.jsx                 ← FROZEN
│   └── *.jsx                       ← FROZEN
├── App.jsx                         ← Route definitions (add routes here)
├── main.jsx                        ← Entry point (DO NOT EDIT)
└── index.css                       ← Global styles (edit for styling only)
```

---

## 🚀 How Agents Should Work

### ✅ DO THIS

1. **Create a new feature page** in `src/pages/YourFeatureName.jsx`
2. **Import shell components**:
   ```jsx
   import AppShell from '../shell/AppShell'
   import Canvas from '../shell/Canvas'
   ```

3. **Configure AppShell via props**:
   ```jsx
   <AppShell
     sidebar="main-nav"
     sidebarProps={{ navSections: NAV_SECTIONS }}
     topbar="tabbed"
     topbarProps={{ title, sectionTabs, activeSection, subTabs, activeSubTab, onSubTabChange }}
   >
     <Canvas level={1}>
       {/* Your content here */}
     </Canvas>
   </AppShell>
   ```

4. **Add route** to `src/App.jsx`:
   ```jsx
   import YourFeature from './pages/YourFeatureName'
   
   <Route path="/your-feature" element={<YourFeature />} />
   ```

5. **Use design tokens** from HighRise HLTailwindConfig — **no arbitrary hex values in Tailwind classes**:
   - Use HighRise palette names directly: `bg-purple-600`, `text-primary-600`, `border-gray-200`
   - For SVG `stroke`/`fill` on logo paths not in HighRise: use literal hex (e.g. `stroke="#F9C400"`)
   - For inline styles needing CSS variables: `style={{ background: 'var(--purple-600)' }}` (no `--color-` prefix in v3)
   - Custom colors (accent-green, brand-deep, etc.) are in `tailwind.config.js` extend.colors
   - Follow button/input/card patterns in the Common Patterns section above

6. **Commit changes** locally with clear messages:
   ```
   git add src/pages/YourFeature.jsx src/App.jsx
   git commit -m "feat: Add YourFeature page with description"
   ```

### ❌ DO NOT DO THIS

- **Use arbitrary hex colors in Tailwind classes** — `bg-[#6938EF]` is forbidden; use `bg-purple-600` instead
- **Use raw rgba in shadows** — add a `--shadow-*` token to `src/index.css` and reference it
- **Modify shell components** (`src/shell/*.jsx`) — they are frozen
- **Change App.jsx routing structure** — only add new routes, don't modify existing
- **Modify index.css globally** — only add new tokens to `@theme {}` when genuinely needed
- **Push to other repositories** — only Visibility AI New
- **Change port** — 5174 is hardcoded in vite.config.js with strictPort: true
- **Delete or rename existing components** — they may be used elsewhere
- **Add TypeScript** — project is JavaScript only
- **Use external UI libraries** — use design system + lucide-react only

---

## 🔗 Shell Component APIs

### AppShell Props

```jsx
<AppShell
  sidebar="main-nav" | "settings"           // Required
  sidebarProps={{                           // Optional
    navSections: [{ items: [...] }]        // For main-nav
    sections: [{ label, items: [...] }]    // For settings
  }}
  topbar="simple" | "tabbed"                // Required
  topbarProps={{                            // Optional
    title: string
    sectionTabs: string[]
    activeSection: string
    onSectionTabChange: (tab) => {}
    subTabs: string[]
    activeSubTab: string
    onSubTabChange: (tab) => {}
    actions: ReactNode
  }}
  backToolbar={{ onBack, label, title }}   // Optional
  verticalTabs={{                           // Optional
    tabs: string[]
    activeTab: string
    onTabChange: (tab) => {}
  }}
/>
```

### Sidebar NavItem Props

```jsx
{ 
  icon: LucideIcon        // From lucide-react
  label: string          // Display name
  active: boolean        // Optional, highlights item
}
```

### Canvas Props

```jsx
<Canvas
  level={1} | level={2}           // 1 = normal, 2 = drill-down
  onBack={() => {}}               // level={2} only
  backLabel="Back"                // level={2} only
  title="Page Title"              // level={2} only
  toolbar={ReactNode}             // level={2} only
>
  {children}
</Canvas>
```

---

## 🎯 Current Implementation Details

### VisibilityAI.jsx Structure

**NAV_SECTIONS**: Two sections separated by divider
- Section 1: Claims, Batches, Larnies, Payments
- Section 2: AI Studio, AI Agents, Marketing, Automation, Sites, Memberships, Media Storage, Reputation (active), Reporting, App marketplace, Mobile app, affilaites custom, Communities

**SUB_TABS**: 9 navigation tabs for Reputation section
- Active tab: "Visibility AI" (shown with blue underline in TopBar)

**ChatPanel Component**:
- Width: 280px
- Features: Project selector, Chats/Dashboards toggle, Search, New chat button, Recents list, SEO preferences footer
- Scrollbar: Dark gray (#475467) shows on hover

**MainContent Component**:
- Centered content with max-width constraint
- Headline: "See how discoverable your brand really is."
- Subtitle: Multi-line description
- CTA: Purple "Let's get started" button with lightning icon
- Input: URL input with globe icon + send button
- Chips: 5 quick-action buttons with icons

**ToolsPanel Component**:
- Width: 200px
- Items: Prompt library, Actions, Automations, To do (each with icon)

---

## 🔄 Git Workflow for Multi-Agent Work

### Before Starting

1. **Pull latest**: `git pull origin sandbox`
2. **Create feature branch**: `git checkout -b feature/your-component-name`

### During Development

1. **Work on isolated files**: Create new page files, only modify App.jsx routes
2. **Test locally**: `http://localhost:5174/your-feature`
3. **Stage changes**: `git add src/pages/YourFeature.jsx src/App.jsx`

### Before Pushing

1. **Check for conflicts**: `git status` should show only YOUR files
2. **Commit with message**: 
   ```
   git commit -m "feat(component-name): Brief description of what was added"
   ```
3. **Pull latest**: `git pull origin sandbox` (before push)
4. **Resolve any conflicts** in your feature files only
5. **Push**: `git push origin feature/your-component-name`

### Pull Request

- Title: `feat: Add ComponentName page`
- Description: List components added, features implemented, design tokens used
- Link to localhost screenshot if possible

---

## 🛠 Common Tasks

### Add a New Page

```jsx
// src/pages/MyNewPage.jsx
import { useState } from 'react'
import { YourIcon } from 'lucide-react'
import AppShell from '../shell/AppShell'
import Canvas from '../shell/Canvas'

const NAV_SECTIONS = [{ items: [/* ... */] }]
const SUB_TABS = ['Tab 1', 'Tab 2']

export default function MyNewPage() {
  const [activeTab, setActiveTab] = useState('Tab 1')

  return (
    <AppShell
      sidebar="main-nav"
      sidebarProps={{ navSections: NAV_SECTIONS }}
      topbar="tabbed"
      topbarProps={{
        title: 'Page Title',
        sectionTabs: [],
        subTabs: SUB_TABS,
        activeSubTab: activeTab,
        onSubTabChange: setActiveTab,
      }}
    >
      <Canvas level={1}>
        {/* Your content */}
      </Canvas>
    </AppShell>
  )
}
```

Then add to `src/App.jsx`:
```jsx
import MyNewPage from './pages/MyNewPage'

<Route path="/my-new-page" element={<MyNewPage />} />
```

### Use Icons from Lucide

```jsx
import { Search, Plus, Settings, Heart, ZapOff } from 'lucide-react'

<Search size={14} className="text-[#667085]" />
<Plus size={16} strokeWidth={2.5} />
```

Common sizes: 12, 13, 14, 15, 16, 18, 20, 24

### Style a Component

Use inline Tailwind classes with design system colors:

```jsx
<div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#F9FAFB] border border-[#EAECF0] hover:border-[#D0D5DD] transition-colors">
  {/* content */}
</div>
```

Avoid:
- ❌ `bg-gray-100` — use hex directly
- ❌ `rounded-md` — use `rounded-lg` or specific pixel values
- ❌ Hard-coded colors not in design system

---

## 📊 Design Constraints

### Frozen Components — Zero Changes

These components work perfectly as-is. Do not modify:
- Sidebar collapse/expand behavior
- TopBar overflow tab handling
- Canvas padding/shadow
- Drawer animations
- Account switcher styling

### Port 5174 — Non-Negotiable

The vite.config.js is set to:
```js
server: {
  port: 5174,
  strictPort: true,
}
```

This prevents conflicts with other projects on localhost:5173. Never change this.

### Design System Consistency

All pages should follow:
- 14px base text, 13px secondary, 12px tertiary
- #6938EF purple for CTAs and active states
- #EAECF0 borders, #F9FAFB backgrounds
- 8px rounded corners (lg), 6px for smaller (md)
- 200-300ms transitions
- Sentence case for UI text (except acronyms: GBP, SEO, AI)

---

## ✨ Tips for Multi-Agent Parallel Work

1. **No overlapping files**: Each agent should work on distinct feature pages
2. **Coordinate in App.jsx**: All agents add their routes sequentially
3. **Reuse patterns**: Copy-paste from VisibilityAI.jsx for consistent structure
4. **Test isolation**: Each feature is behind its own route, safe to test independently
5. **No component fragmentation**: One feature per file, no split components across files
6. **Git communication**: Use branch names to signal what you're working on
   - `feature/guestflow` — your feature
   - `feature/analytics-page` — another agent's feature

---

## 🐛 Troubleshooting

**Page not rendering?**
- Check route is added to src/App.jsx
- Verify import path is correct
- Check browser console for errors

**Styling looks off?**
- Verify hex color matches design system
- Check class names for typos (Tailwind won't apply if misspelled)
- Use browser DevTools to inspect computed styles

**Conflict during git pull?**
- Only your page files should conflict (if two agents edit the same file)
- src/App.jsx conflicts are normal — carefully merge route definitions
- Never delete another agent's route when resolving conflicts

**Server won't start?**
- Kill existing node process: `lsof -i :5174` then kill the PID
- Delete node_modules and reinstall: `npm install`
- Check vite.config.js has correct port setting

---

## 📚 Reference

**Lucide Icons**: https://lucide.dev  
**Tailwind CSS**: https://tailwindcss.com (version 4.x)  
**React Hooks**: useState, useCallback, useEffect basics

---

## 👥 Multi-Agent Coordination

**Agent 1**: Building the main feature pages  
**Agent 2**: Building dashboard/analytics components  
**Agent 3**: Building settings/preferences flows  
**etc.**

All changes → localhost:5174/your-feature → Test independently → Pull request to sandbox → Merge to main

Each agent works on isolated routes, commits independently, and coordination happens at the route layer (App.jsx).

---

**Last Updated**: 2026-05-26  
**Version**: 1.0  
**Status**: Ready for parallel agent development
