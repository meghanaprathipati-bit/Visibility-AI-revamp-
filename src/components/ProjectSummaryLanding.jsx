import { useEffect, useRef, useState, Fragment } from 'react'
import {
  Award,
  ChevronRight,
  ExternalLink,
  Globe,
  Link2,
  MapPin,
  Zap,
} from '../icons/index.js'
import VaLogo from './VaLogo.jsx'
import HLButton from './HLButton.jsx'
import TypingText from './TypingText.jsx'
import {
  buildSummaryChatPrompt,
  DASHBOARD_GLIMPSE_MODULES,
  getProjectSummary,
  PROJECT_SUMMARY_CHIPS,
} from '../data/projectSummary.js'

function TintedIconBadge({ Icon, iconColor = 'var(--purple-600)', size = 16, boxClass = 'w-9 h-9 rounded-lg' }) {
  return (
    <div
      className={`${boxClass} flex items-center justify-center shrink-0`}
      style={{ background: `color-mix(in srgb, ${iconColor} 12%, transparent)` }}
    >
      <Icon size={size} style={{ color: iconColor }} />
    </div>
  )
}

function FixItAction({ onClick, className = '', size = 'sm' }) {
  const chevronSize = size === 'xs' ? 12 : 14
  return (
    <HLButton
      variant="text"
      color="purple"
      size={size}
      className={className}
      style={size === 'xs' ? { '--n-border-radius': '8px' } : undefined}
      onClick={onClick}
    >
      <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
        View all
        <ChevronRight size={chevronSize} />
      </span>
    </HLButton>
  )
}

function MilestoneTrack({ score, target }) {
  const scorePct = Math.min(100, Math.max(0, score))
  const targetPct = Math.min(100, Math.max(0, target))

  return (
    <div className="relative h-0.5 w-full rounded-full bg-primary-100">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-primary-600"
        style={{ width: `${scorePct}%` }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full border-2 border-primary-600 bg-white"
        style={{ left: `${scorePct}%` }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-success-600"
        style={{ left: `${targetPct}%` }}
        aria-hidden="true"
      />
    </div>
  )
}

const SCORE_CARD_CLASS =
  'rounded-xl border border-gray-200 bg-white shadow-xs min-w-0 h-full'

const SCORE_CARD_PADDING = 'pt-4 pb-4 px-4'

const GLIMPSE_ICON_MAP = {
  globe: Globe,
  award: Award,
  mapPin: MapPin,
  link: Link2,
}

function DashboardGlimpseStats({ modules }) {
  return (
    <div className="flex items-center h-full">
      {modules.map((mod, index) => (
        <Fragment key={mod.id}>
          {index > 0 && (
            <div className="w-px h-12 bg-gray-200 shrink-0" aria-hidden="true" />
          )}
          <div className="flex flex-1 flex-col items-center justify-center px-2 py-1 min-w-0">
            <TintedIconBadge
              Icon={GLIMPSE_ICON_MAP[mod.icon]}
              iconColor={mod.iconColor}
              size={14}
              boxClass="w-8 h-8 rounded-lg"
            />
            <span className="mt-3 text-[16px] font-semibold text-gray-900 tabular-nums leading-none">
              {mod.value}
            </span>
            <span className="mt-1 text-[12px] font-normal text-gray-500 text-center leading-snug">
              {mod.label}
            </span>
          </div>
        </Fragment>
      ))}
    </div>
  )
}

function OverallScoreProgress({ summary, onStartSummaryChat, onGoToDashboard, projectLabel }) {
  const score = summary.visibilityScore
  const target = summary.nextTargetScore ?? 75
  const glimpseModules = summary.dashboardModules ?? DASHBOARD_GLIMPSE_MODULES

  function handleStartSummaryChat(e) {
    e.preventDefault()
    e.stopPropagation()
    const prompt = buildSummaryChatPrompt(summary, projectLabel)
    onStartSummaryChat?.(prompt)
  }

  function handleViewDashboard(e) {
    e.preventDefault()
    onGoToDashboard?.('overview')
  }

  const headerLinkClass =
    'inline-flex items-center gap-0.5 text-[13px] font-semibold text-purple-600 hover:text-purple-700 transition-colors shrink-0'

  return (
    <div className="w-full pb-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="text-[12px] font-semibold text-gray-700 m-0">Overall score & progress</p>
          <button
            type="button"
            onClick={handleViewDashboard}
            aria-label="Open dashboard"
            className="inline-flex items-center justify-center shrink-0 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ExternalLink size={13} />
          </button>
        </div>
        <button type="button" onClick={handleStartSummaryChat} className={headerLinkClass}>
          Start a chat with this summary
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className={`${SCORE_CARD_CLASS} ${SCORE_CARD_PADDING} flex flex-col gap-4`}>
          <div className="flex items-center justify-between gap-2 shrink-0">
            <p className="text-[12px] font-medium text-gray-500 m-0">Visibility score</p>
            <p className="text-[12px] font-semibold text-success-600 m-0 whitespace-nowrap">
              {summary.trendDelta} {summary.trendLabel}
            </p>
          </div>
          <div className="min-w-0">
            <p className="m-0 mb-3 leading-none">
              <span className="text-[24px] font-bold text-primary-600 tabular-nums">{score}</span>
              <span className="text-[13px] font-normal text-gray-400 ml-0.5">/100</span>
            </p>
            <MilestoneTrack score={score} target={target} />
          </div>
        </div>

        <div className={`${SCORE_CARD_CLASS} ${SCORE_CARD_PADDING} col-span-2`}>
          <DashboardGlimpseStats modules={glimpseModules} />
        </div>
      </div>
    </div>
  )
}

/**
 * ProjectSummaryLanding — returning-user chat landing with resume context.
 * Sections 1–4 scroll; footer (composer + chips) is passed as `footer` and stays fixed.
 */
export default function ProjectSummaryLanding({
  project,
  summary: summaryProp,
  detailPanelOpen = false,
  onStartSummaryChat,
  onGoToDashboard,
  onFixRecommendation,
  onChipClick,
  footer,
}) {
  const summary = summaryProp ?? getProjectSummary(project)
  const contentWidth = detailPanelOpen ? 'max-w-[720px]' : 'max-w-[800px]'
  const composerWrapRef = useRef(null)
  const [composerFadeHeight, setComposerFadeHeight] = useState(52)

  useEffect(() => {
    const el = composerWrapRef.current
    if (!el) return
    const FOOTER_TOP_PADDING = 30
    const update = () => {
      setComposerFadeHeight(FOOTER_TOP_PADDING + el.offsetHeight / 2)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [footer])

  return (
    <main className="flex-1 min-w-0 bg-gray-50 flex flex-col overflow-hidden">
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <div className="absolute inset-0 overflow-y-auto overflow-x-hidden bg-gray-50">
          <div className={`mx-auto flex min-h-full flex-col items-center justify-center gap-8 px-6 py-8 pb-24 ${contentWidth} w-full`}>
            {/* 1. Greeting block */}
            <div className="flex flex-col items-center gap-3 text-center w-full">
              <VaLogo size="md" />
              <h1 className="text-[32px] font-bold text-gray-900 leading-[1.15] tracking-tight m-0">
                Welcome back. Keep improving your visibility.
              </h1>
              <TypingText />
            </div>

            {/* 2. Hero recommendation */}
            {summary.hero && (
              <div className="w-full">
                <p className="text-[12px] font-semibold text-gray-700 mb-2 m-0">Recommended fixes from previous chats</p>
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
                  <div className="flex items-center gap-3">
                    <TintedIconBadge Icon={Zap} iconColor="var(--purple-600)" />
                    <div className="flex-1 min-w-0">
                      <h2 className="text-[14px] font-semibold text-gray-900 leading-snug m-0">
                        {summary.hero.title}
                      </h2>
                      <p className="text-[13px] text-gray-600 mt-1 mb-0 leading-relaxed">
                        {summary.hero.description}
                      </p>
                    </div>
                    <FixItAction
                      onClick={() => onFixRecommendation?.(summary.hero)}
                      className="shrink-0 self-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. Overall score & progress */}
            <OverallScoreProgress
              summary={summary}
              projectLabel={project?.label ?? 'Project'}
              onStartSummaryChat={onStartSummaryChat}
              onGoToDashboard={onGoToDashboard}
            />
          </div>
        </div>
      </div>

      {/* 5. Fixed footer — composer + chips with explicit spacing */}
      <div className="shrink-0 relative">
        <div className={`mx-auto px-6 pt-[30px] pb-[50px] w-full relative ${contentWidth}`}>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-full bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent"
            style={{ height: composerFadeHeight }}
            aria-hidden="true"
          />
          <div ref={composerWrapRef}>{footer}</div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-5">
            {PROJECT_SUMMARY_CHIPS.map(({ label, prompt }) => (
              <button
                key={label}
                type="button"
                onClick={() => onChipClick?.({ label, prompt })}
                className="shrink-0 whitespace-nowrap px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-[12px] font-normal text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
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
