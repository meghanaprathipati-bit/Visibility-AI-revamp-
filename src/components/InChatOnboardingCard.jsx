import { useEffect, useRef, useState } from 'react'
import { ChevronDown, InfoCircleIcon, Plus, Trash2, AiSparkleIcon } from '../icons/index.js'
import HLCheckbox from './HLCheckbox.jsx'
import HLInput from './HLInput.jsx'
import HLTooltip from './HLTooltip.jsx'
import OnboardingStableTable from './OnboardingStableTable.jsx'
import {
  ONBOARDING_KEYWORDS,
  ONBOARDING_COMPETITORS,
  ONBOARDING_COUNTRY_OPTIONS,
  ONBOARDING_STEPS,
  MAX_CUSTOM_KEYWORDS,
  MAX_CUSTOM_COMPETITORS,
} from '../data/onboardingData.js'

const TABLE_HEADER_CLASS = 'text-[14px] font-semibold text-gray-900'
const KEYWORD_ROW_LAYOUT = 'flex items-center gap-x-6 w-full'
const KEYWORD_LEFT_SECTION = 'flex flex-1 min-w-0 items-center gap-x-6'
const KEYWORD_CHECKBOX_SLOT = 'w-[14px] shrink-0 flex items-center justify-center'
const KEYWORD_VOLUME_CELL = 'w-[112px] shrink-0 text-left'
const KEYWORD_DIFFICULTY_CELL = 'w-[120px] shrink-0 text-left'
const KEYWORD_ROW_CLASS =
  'border-b border-gray-100 last:border-b-0 pl-3 pr-6 h-11 flex items-center'
const KEYWORD_TABLE_INSET = 'pl-3 pr-6'

const KEYWORD_LIMIT_MESSAGE = 'Max 3 keywords. Remove one to add another.'
const COMPETITOR_LIMIT_MESSAGE = 'Max 3 competitors. Remove one to add another.'
const ONBOARDING_INPUT_COLOR = 'purple'
/** HighRise HLInput 2xs — custom keyword/competitor fields in steps 2 & 3 */
const ONBOARDING_CUSTOM_INPUT_SIZE = '2xs'
const ONBOARDING_CUSTOM_INPUT_CLASS = 'onboarding-custom-input'

/** Competitor table — shared flex columns so header and rows stay aligned */
const COMPETITOR_ROW_LAYOUT = 'flex items-center gap-x-3 w-full min-w-0'
const COMPETITOR_USE_SLOT = 'w-[28px] shrink-0 flex items-center justify-start'
const COMPETITOR_BRAND_SLOT = 'flex-1 min-w-0 basis-0 text-left'
const COMPETITOR_DOMAIN_SLOT = 'flex-[1.15] min-w-0 basis-0 text-left'
const COMPETITOR_NOTES_SLOT = 'w-[160px] shrink-0 min-w-0 text-left'

const COMPETITOR_ROW_CLASS =
  'border-b border-gray-100 last:border-b-0 pl-3 pr-6 h-11 flex items-center min-w-0'
const COMPETITOR_TABLE_INSET = 'pl-3 pr-6'

function ChevronUp({ size = 12, className = '' }) {
  return (
    <ChevronDown
      size={size}
      className={className}
      style={{ transform: 'rotate(180deg)', display: 'block' }}
    />
  )
}

/** Display keyword text in sentence case */
function toSentenceCase(value) {
  const trimmed = value?.trim()
  if (!trimmed) return value ?? ''
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
}

function DifficultyBadge({ label, score }) {
  const isEasy = label === 'Easy'
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${
        isEasy ? 'bg-success-50 text-success-700' : 'bg-warning-100 text-warning-600'
      }`}
    >
      {label} {score}/100
    </span>
  )
}

const labelBase = 'text-[14px] font-medium text-gray-700 mb-1 block'

function StepOneFields({ values, onChange, gbpProfileLinkRef }) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="onboarding-gbp-profile-link" className={labelBase}>
          GBP profile link
        </label>
        <HLInput
          id="onboarding-gbp-profile-link"
          ref={gbpProfileLinkRef}
          size="sm"
          color={ONBOARDING_INPUT_COLOR}
          autoFocus
          value={values.gbpProfileLink ?? ''}
          onChange={e => onChange('gbpProfileLink', e.target.value)}
          placeholder="https://www.google.com/maps/place/..."
        />
        <p className="flex items-center gap-1.5 mt-1.5 text-[12px] text-gray-500 leading-snug m-0">
          <InfoCircleIcon size={14} color="var(--gray-400)" className="shrink-0" />
          Adding your GBP link unlocks local scans and review tracking
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="onboarding-website-url" className={labelBase}>
            Website URL
          </label>
          <HLInput
            id="onboarding-website-url"
            size="sm"
            color={ONBOARDING_INPUT_COLOR}
            value={values.websiteUrl ?? ''}
            onChange={e => onChange('websiteUrl', e.target.value)}
            placeholder="https://example.com"
          />
        </div>
        <div>
          <label htmlFor="onboarding-brand-name" className={labelBase}>
            Brand name
          </label>
          <HLInput
            id="onboarding-brand-name"
            size="sm"
            color={ONBOARDING_INPUT_COLOR}
            value={values.brandName ?? ''}
            onChange={e => onChange('brandName', e.target.value)}
            placeholder="Enter brand name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="onboarding-country" className={labelBase}>
            Country
          </label>
          <div className="relative">
            <select
              id="onboarding-country"
              value={values.country ?? ''}
              onChange={e => onChange('country', e.target.value)}
              className="w-full h-9 px-2 bg-white border border-purple-200 rounded-md text-[14px] text-gray-900 outline-none appearance-none hover:border-purple-600 focus:border-purple-600 focus:shadow-focus-purple-sm transition-all"
            >
              {ONBOARDING_COUNTRY_OPTIONS.map(country => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            />
          </div>
        </div>
        <div>
          <label htmlFor="onboarding-state-region" className={labelBase}>
            State / region{' '}
            <span className="text-[12px] font-normal text-gray-500">(optional)</span>
          </label>
          <HLInput
            id="onboarding-state-region"
            size="sm"
            color={ONBOARDING_INPUT_COLOR}
            value={values.stateRegion ?? ''}
            onChange={e => onChange('stateRegion', e.target.value)}
            placeholder="e.g. Karnataka"
          />
        </div>
      </div>
    </div>
  )
}

function KeywordRow({ item, index, onToggle, onChange, onRemove, isCustom }) {
  const awaitingMetrics = isCustom && !item.keyword?.trim()
  const customPlaceholder = `Type custom keyword #${index + 1}...`
  const isMuted = !item.checked && !isCustom

  return (
    <div className={`${KEYWORD_ROW_CLASS} ${isMuted ? 'opacity-70' : ''}`}>
      <div className={KEYWORD_ROW_LAYOUT}>
        <div className={KEYWORD_LEFT_SECTION}>
          {isCustom ? (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className={`${KEYWORD_CHECKBOX_SLOT} rounded text-gray-500 hover:text-gray-600 hover:bg-gray-50 transition-colors`}
              aria-label="Remove custom keyword"
            >
              <Trash2 size={13} />
            </button>
          ) : (
            <div className={KEYWORD_CHECKBOX_SLOT}>
              <HLCheckbox
                id={`keyword-use-${item.id}`}
                size="xs"
                color="purple"
                checked={item.checked}
                className="shrink-0"
                onChange={checked => onToggle(item.id, checked)}
                aria-label={`Use keyword ${item.keyword || 'custom'}`}
              />
            </div>
          )}

          {!isCustom ? (
            <div className="flex flex-1 min-w-0 items-center gap-2">
              <span
                className={`text-[13px] font-medium truncate ${
                  isMuted ? 'text-gray-500' : 'text-gray-900'
                }`}
              >
                {toSentenceCase(item.keyword)}
              </span>
              <AiSparkleIcon size={13} className="text-purple-600 shrink-0" color="var(--purple-600)" />
            </div>
          ) : (
            <div className="flex-1 min-w-0">
              <HLInput
                size={ONBOARDING_CUSTOM_INPUT_SIZE}
                color={ONBOARDING_INPUT_COLOR}
                className={`w-full ${ONBOARDING_CUSTOM_INPUT_CLASS}`}
                value={item.keyword}
                onChange={e => onChange(item.id, e.target.value)}
                placeholder={customPlaceholder}
              />
            </div>
          )}
        </div>

        <span
          className={`${KEYWORD_VOLUME_CELL} text-[13px] tabular-nums ${
            awaitingMetrics ? 'text-gray-500' : 'text-gray-700'
          }`}
        >
          {awaitingMetrics ? '—' : item.monthlySearches}
        </span>

        <div className={KEYWORD_DIFFICULTY_CELL}>
          {awaitingMetrics ? (
            <span className="text-[12px] text-gray-500 whitespace-nowrap">Awaiting text</span>
          ) : (
            <DifficultyBadge label={item.difficulty} score={item.difficultyScore} />
          )}
        </div>
      </div>
    </div>
  )
}

function CompetitorNotesCell({ id, notes, isMuted, isCustom }) {
  if (isCustom) {
    return (
      <span
        className={`text-[13px] tabular-nums ${isMuted ? 'text-gray-500' : 'text-gray-500'}`}
      >
        —
      </span>
    )
  }

  const textClass = `block w-full min-w-0 text-[13px] leading-snug truncate text-left ${
    isMuted ? 'text-gray-500' : 'text-gray-500'
  }`

  if (!notes?.trim()) {
    return <span className={textClass}>—</span>
  }

  return (
    <HLTooltip
      id={`competitor-notes-${id}`}
      content={notes}
      placement="top"
      wrap
      triggerClassName="w-full"
    >
      <span className={`${textClass} cursor-default`}>{notes}</span>
    </HLTooltip>
  )
}

function CompetitorRow({ item, onToggle, onChange, onRemove, isCustom }) {
  const isMuted = !item.checked && !isCustom

  return (
    <div className={`${COMPETITOR_ROW_CLASS} ${isMuted ? 'opacity-70' : ''}`}>
      <div className={COMPETITOR_ROW_LAYOUT}>
        <div className={COMPETITOR_USE_SLOT}>
          {isCustom ? (
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className="w-[14px] h-[14px] flex shrink-0 items-center justify-center rounded text-gray-500 hover:text-gray-600 hover:bg-gray-50 transition-colors"
              aria-label="Remove custom competitor"
            >
              <Trash2 size={13} />
            </button>
          ) : (
            <HLCheckbox
              id={`competitor-use-${item.id}`}
              size="xs"
              color="purple"
              checked={item.checked}
              className="shrink-0"
              onChange={checked => onToggle(item.id, checked)}
              aria-label={`Use competitor ${item.name || 'custom'}`}
            />
          )}
        </div>

        <div className={COMPETITOR_BRAND_SLOT}>
          {isCustom ? (
            <HLInput
              size={ONBOARDING_CUSTOM_INPUT_SIZE}
              color={ONBOARDING_INPUT_COLOR}
              className={`w-full min-w-0 ${ONBOARDING_CUSTOM_INPUT_CLASS}`}
              value={item.name}
              onChange={e => onChange(item.id, 'name', e.target.value)}
              placeholder="Brand name"
            />
          ) : (
            <span
              className={`block w-full min-w-0 text-[13px] font-medium truncate ${
                isMuted ? 'text-gray-500' : 'text-gray-900'
              }`}
            >
              {item.name}
            </span>
          )}
        </div>

        <div className={COMPETITOR_DOMAIN_SLOT}>
          {isCustom ? (
            <HLInput
              size={ONBOARDING_CUSTOM_INPUT_SIZE}
              color={ONBOARDING_INPUT_COLOR}
              className={`w-full min-w-0 ${ONBOARDING_CUSTOM_INPUT_CLASS}`}
              value={item.domain}
              onChange={e => onChange(item.id, 'domain', e.target.value)}
              placeholder="competitor.com"
            />
          ) : (
            <span
              className={`block w-full min-w-0 text-[13px] truncate ${
                isMuted ? 'text-gray-500' : 'text-gray-500'
              }`}
            >
              {item.domain}
            </span>
          )}
        </div>

        <div className={COMPETITOR_NOTES_SLOT}>
          <CompetitorNotesCell
            id={item.id}
            notes={item.notes}
            isMuted={isMuted}
            isCustom={isCustom}
          />
        </div>
      </div>
    </div>
  )
}

const STEP_TITLES = ONBOARDING_STEPS.map(step => step.title)
const STEP_DESCRIPTIONS = ONBOARDING_STEPS.map(step => step.description)

/**
 * InChatOnboardingCard — 3-step visibility setup wizard above the chat composer.
 * Visual shell matches ClarifyingQuestionsCard (attachedToEditor variant).
 */
export default function InChatOnboardingCard({
  prefill = {},
  onComplete,
  onSkipStep,
}) {
  const gbpProfileLinkRef = useRef(null)
  const keywordScrollRef = useRef(null)
  const competitorScrollRef = useRef(null)
  const scrollKeywordRowsRef = useRef(false)
  const scrollCompetitorRowsRef = useRef(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [gbpFields, setGbpFields] = useState({
    gbpProfileLink: prefill.gbpProfileLink ?? '',
    websiteUrl: prefill.websiteUrl ?? '',
    brandName: prefill.brandName ?? '',
    country: prefill.country ?? 'India',
    stateRegion: prefill.stateRegion ?? '',
  })
  const [keywords, setKeywords] = useState(() =>
    ONBOARDING_KEYWORDS.map(item => ({ ...item })),
  )
  const [competitors, setCompetitors] = useState(() =>
    ONBOARDING_COMPETITORS.map(item => ({ ...item })),
  )

  const totalSteps = 3
  const isLastStep = stepIdx === totalSteps - 1
  const stepOneContinueEnabled = Boolean(gbpFields.gbpProfileLink?.trim())
  const customKeywordCount = keywords.filter(k => k.isCustom).length
  const canAddCustomKeyword = customKeywordCount < MAX_CUSTOM_KEYWORDS
  const customCompetitorCount = competitors.filter(c => c.isCustom).length
  const canAddCompetitor = customCompetitorCount < MAX_CUSTOM_COMPETITORS

  useEffect(() => {
    if (stepIdx !== 0) return
    const timer = window.setTimeout(() => gbpProfileLinkRef.current?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [stepIdx])

  useEffect(() => {
    if (!scrollKeywordRowsRef.current) return
    scrollKeywordRowsRef.current = false
    const el = keywordScrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [keywords])

  useEffect(() => {
    if (!scrollCompetitorRowsRef.current) return
    scrollCompetitorRowsRef.current = false
    const el = competitorScrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [competitors])

  function handleGbpChange(id, value) {
    setGbpFields(prev => ({ ...prev, [id]: value }))
  }

  function handleKeywordToggle(id, checked) {
    setKeywords(prev => prev.map(k => (k.id === id ? { ...k, checked } : k)))
  }

  function handleKeywordChange(id, value) {
    setKeywords(prev => prev.map(k => (k.id === id ? { ...k, keyword: value } : k)))
  }

  function handleAddKeyword() {
    if (!canAddCustomKeyword) return
    setKeywords(prev => [
      ...prev,
      {
        id: `kw-custom-${Date.now()}`,
        keyword: '',
        checked: true,
        isCustom: true,
        monthlySearches: 70,
        difficulty: 'Easy',
        difficultyScore: 15,
      },
    ])
    scrollKeywordRowsRef.current = true
  }

  function handleRemoveKeyword(id) {
    setKeywords(prev => prev.filter(k => k.id !== id))
  }

  function handleCompetitorToggle(id, checked) {
    setCompetitors(prev => prev.map(c => (c.id === id ? { ...c, checked } : c)))
  }

  function handleCompetitorChange(id, field, value) {
    setCompetitors(prev =>
      prev.map(c => (c.id === id ? { ...c, [field]: value } : c)),
    )
  }

  function handleAddCompetitor() {
    if (!canAddCompetitor) return
    setCompetitors(prev => [
      ...prev,
      {
        id: `comp-custom-${Date.now()}`,
        name: '',
        domain: '',
        checked: true,
        isCustom: true,
      },
    ])
    scrollCompetitorRowsRef.current = true
  }

  function handleRemoveCompetitor(id) {
    setCompetitors(prev => prev.filter(c => c.id !== id))
  }

  function buildPayload() {
    return {
      gbp: gbpFields,
      keywords: keywords.filter(k => k.checked && k.keyword.trim()),
      competitors: competitors.filter(
        c => c.checked && (c.name?.trim() || c.domain?.trim()),
      ),
    }
  }

  function handleContinue() {
    if (stepIdx === 0 && !stepOneContinueEnabled) return
    if (isLastStep) {
      onComplete?.(buildPayload())
      return
    }
    setStepIdx(i => i + 1)
  }

  function handleSkip() {
    onSkipStep?.(stepIdx, buildPayload())
    if (isLastStep) {
      onComplete?.(buildPayload())
      return
    }
    setStepIdx(i => i + 1)
  }

  const inner = (
    <div className="flex flex-col h-[350px]">
      {/* Fixed header — never scrolls or clips */}
      <div className="shrink-0 px-4 pt-3 pb-3 flex flex-col gap-[2px]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-gray-800 flex items-center justify-center shrink-0">
              <span className="text-white text-[11px] font-bold leading-none select-none">?</span>
            </div>
            <span className="text-[14px] font-semibold text-gray-900 leading-snug">
              {STEP_TITLES[stepIdx]}
            </span>
          </div>
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setStepIdx(i => Math.max(0, i - 1))}
              disabled={stepIdx === 0}
              className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:text-gray-700 hover:bg-purple-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous step"
            >
              <ChevronUp size={13} />
            </button>
            <span className="text-[13px] text-gray-500 tabular-nums px-1 select-none">
              {stepIdx + 1} of {totalSteps}
            </span>
            <button
              type="button"
              onClick={() => setStepIdx(i => Math.min(totalSteps - 1, i + 1))}
              disabled={stepIdx === totalSteps - 1}
              className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:text-gray-700 hover:bg-purple-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next step"
            >
              <ChevronDown size={13} />
            </button>
          </div>
        </div>
        <p className="text-[13px] text-gray-600 leading-snug m-0 pl-8 pr-1">
          {STEP_DESCRIPTIONS[stepIdx]}
        </p>
      </div>

      {/* Body — step content; keyword step keeps column headers fixed while rows scroll */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden pl-4 pr-0.5 pb-2">
        {stepIdx === 0 && (
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-gray-300">
            <StepOneFields
              values={gbpFields}
              onChange={handleGbpChange}
              gbpProfileLinkRef={gbpProfileLinkRef}
            />
          </div>
        )}

        {stepIdx === 1 && (
          <OnboardingStableTable
            bodyRef={keywordScrollRef}
            header={
              <div className={KEYWORD_TABLE_INSET}>
                <div className={KEYWORD_ROW_LAYOUT}>
                  <div className={KEYWORD_LEFT_SECTION}>
                    <span className={`${TABLE_HEADER_CLASS} text-left`}>Use keyword</span>
                  </div>
                  <span className={`${TABLE_HEADER_CLASS} ${KEYWORD_VOLUME_CELL} whitespace-nowrap`}>
                    Monthly searches
                  </span>
                  <span className={`${TABLE_HEADER_CLASS} ${KEYWORD_DIFFICULTY_CELL}`}>
                    Difficulty
                  </span>
                </div>
              </div>
            }
            footer={
              canAddCustomKeyword ? (
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <Plus size={14} />
                  Add a custom keyword
                </button>
              ) : (
                <span className="text-[13px] text-gray-500">{KEYWORD_LIMIT_MESSAGE}</span>
              )
            }
          >
            {keywords.map((item, index) => {
              const customIndex = item.isCustom
                ? keywords.slice(0, index + 1).filter(k => k.isCustom).length
                : 0
              return (
                <KeywordRow
                  key={item.id}
                  item={item}
                  index={customIndex}
                  isCustom={item.isCustom}
                  onToggle={handleKeywordToggle}
                  onChange={handleKeywordChange}
                  onRemove={handleRemoveKeyword}
                />
              )
            })}
          </OnboardingStableTable>
        )}

        {stepIdx === 2 && (
          <OnboardingStableTable
            bodyRef={competitorScrollRef}
            header={
              <div className={COMPETITOR_TABLE_INSET}>
                <div className={COMPETITOR_ROW_LAYOUT}>
                  <span className={`${COMPETITOR_USE_SLOT} ${TABLE_HEADER_CLASS}`}>Use</span>
                  <span className={`${COMPETITOR_BRAND_SLOT} ${TABLE_HEADER_CLASS}`}>
                    Brand name
                  </span>
                  <span className={`${COMPETITOR_DOMAIN_SLOT} ${TABLE_HEADER_CLASS}`}>
                    Competitor domain
                  </span>
                  <span className={`${COMPETITOR_NOTES_SLOT} ${TABLE_HEADER_CLASS}`}>
                    Visibility notes
                  </span>
                </div>
              </div>
            }
            footer={
              canAddCompetitor ? (
                <button
                  type="button"
                  onClick={handleAddCompetitor}
                  className="inline-flex items-center gap-1 text-[13px] font-medium text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <Plus size={14} />
                  Add a competitor
                </button>
              ) : (
                <span className="text-[13px] text-gray-500">{COMPETITOR_LIMIT_MESSAGE}</span>
              )
            }
          >
            {competitors.map(item => (
              <CompetitorRow
                key={item.id}
                item={item}
                isCustom={item.isCustom}
                onToggle={handleCompetitorToggle}
                onChange={handleCompetitorChange}
                onRemove={handleRemoveCompetitor}
              />
            ))}
          </OnboardingStableTable>
        )}
      </div>

      {/* Footer — no divider line; actions sit on the same lavender surface as the form. */}
      <div className="shrink-0 flex items-center justify-end gap-4 px-4 pb-3">
        {!isLastStep && (
          <button
            type="button"
            onClick={handleSkip}
            className="text-[14px] font-medium text-purple-600 hover:text-purple-700 transition-colors"
          >
            Skip
          </button>
        )}
        <button
          type="button"
          onClick={handleContinue}
          disabled={stepIdx === 0 && !stepOneContinueEnabled}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[14px] font-semibold rounded-lg transition-colors shadow-xs"
        >
          {isLastStep ? 'Finish and run scan' : 'Continue'}
          <span className="text-[13px] leading-none">↵</span>
        </button>
      </div>
    </div>
  )

  return (
    <div
      className="relative w-full bg-purple-50 shrink-0 rounded-t-2xl rounded-b-none border-t border-l border-r border-solid border-b-0 overflow-hidden"
      style={{ borderColor: '#6938EF66' }}
    >
      {inner}
    </div>
  )
}
