import {
  ChevronRight,
  ExternalLink,
  Zap,
} from '../icons/index.js'
import VaLogo from './VaLogo.jsx'
import HLButton from './HLButton.jsx'
import TypingText from './TypingText.jsx'
import {
  buildSummaryChatPrompt,
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
        Fix it
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

function MiniSparkline({ data }) {
  const width = 100
  const height = 32
  const pad = 4
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data
    .map((value, index) => {
      const x = pad + (index / (data.length - 1)) * (width - pad * 2)
      const y = height - pad - ((value - min) / range) * (height - pad * 2)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-8"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke="var(--primary-600)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const SCORE_CARD_CLASS =
  'rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs min-w-0 h-full'

function OverallScoreProgress({ summary, onStartSummaryChat, onGoToDashboard, projectLabel }) {
  const score = summary.visibilityScore
  const target = summary.nextTargetScore ?? 75
  const pointsToTarget = Math.max(0, target - score)
  const momentumData = summary.momentumSparkline ?? [57, 58, 56, 59, 60, 58, 61, 62, 63, score]
  const monthDelta = summary.momentumMonthDelta ?? '+14'

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

  function handleOpenDashboard() {
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

      <button
        type="button"
        onClick={handleOpenDashboard}
        aria-label="Open overall score and progress dashboard"
        className="w-full text-left rounded-xl transition-colors hover:opacity-95"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={SCORE_CARD_CLASS}>
            <p className="text-[12px] font-medium text-gray-500 m-0 mb-2">Visibility score</p>
            <p className="m-0 mb-2 leading-none">
              <span className="text-[24px] font-bold text-primary-600 tabular-nums">{score}</span>
              <span className="text-[13px] font-normal text-gray-400 ml-0.5">/100</span>
            </p>
            <MilestoneTrack score={score} target={target} />
          </div>

          <div className={SCORE_CARD_CLASS}>
            <p className="text-[12px] font-medium text-gray-500 m-0 mb-2">Momentum</p>
            <div className="mb-2">
              <MiniSparkline data={momentumData} />
            </div>
            <p className="text-[12px] font-normal text-gray-500 m-0 leading-snug">
              <span className="font-semibold text-success-600">{summary.trendDelta}</span>
              {' '}{summary.trendLabel}
              <span className="text-gray-300 mx-1" aria-hidden="true">·</span>
              <span className="font-semibold text-success-600">{monthDelta}</span>
              {' '}in 30 days
            </p>
          </div>

          <div className={SCORE_CARD_CLASS}>
            <p className="text-[12px] font-medium text-gray-500 m-0 mb-2">Next goal</p>
            <p className="m-0 mb-2 leading-none">
              <span className="text-[24px] font-bold text-success-600 tabular-nums">{target}</span>
              <span className="text-[13px] font-normal text-gray-400 ml-1">target</span>
            </p>
            <p className="text-[12px] font-normal text-gray-500 m-0 leading-snug">
              +{pointsToTarget} pts needed
            </p>
          </div>
        </div>
      </button>
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

  return (
    <main className="flex-1 min-w-0 bg-white flex flex-col overflow-hidden">
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
                <p className="text-[12px] font-semibold text-gray-700 mb-2 m-0">Pick up where you left off</p>
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
                {summary.pendingRecommendationsCount > 0 && (
                  <p className="text-[13px] font-normal text-gray-500 mt-2 mb-0 leading-relaxed">
                    +{summary.pendingRecommendationsCount} more recommendations after this
                  </p>
                )}
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
      <div className="shrink-0 relative bg-gray-100">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-full h-24 bg-gradient-to-t from-gray-100 via-gray-100/90 to-transparent"
          aria-hidden="true"
        />
        <div className={`mx-auto px-6 pt-[30px] pb-[50px] w-full ${contentWidth}`}>
          {footer}
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
