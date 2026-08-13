import { useState } from 'react'
import { InfoCircleIcon } from '@gohighlevel/ghl-icons/24/outline'
import { ChevronDown } from '../icons/index.js'
import HLTooltip from './HLTooltip.jsx'

function ChevronUp({ size = 12, className = '' }) {
  return (
    <ChevronDown size={size} className={className} style={{ transform: 'rotate(180deg)', display: 'block' }} />
  )
}

/**
 * ClarifyingQuestionsCard
 *
 * Props:
 *   questions        — array of { id, label, required?, type, placeholder?, helperText?, options?[], icon? }
 *   onSubmit(answers) — called with answer map when Continue/Submit is pressed on last question
 *   onSkip()         — skip the whole block
 *   embedded         — if true, no outer border/radius (sits inside PromptComposer)
 *   attachedToEditor — if true, light lavender top panel (no outer border — parent shell wraps composer)
 *   title            — card header title (default: Questions)
 */
export default function ClarifyingQuestionsCard({
  questions = [],
  onSubmit,
  onSkip,
  embedded = false,
  attachedToEditor = false,
  title = 'Questions',
  /** When true, show every question at once with a single Submit action */
  singleStep = false,
  /** When false, labels omit the "1." style prefix */
  showQuestionNumbers = true,
}) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})

  if (!questions.length) return null

  const isLastQuestion = singleStep || currentIdx === questions.length - 1

  function setAnswer(id, val) {
    setAnswers(prev => ({ ...prev, [id]: val }))
  }

  function handleContinue() {
    if (singleStep || isLastQuestion) {
      onSubmit?.(answers)
      return
    }
    setCurrentIdx(i => i + 1)
  }

  const inner = (
    <div className={attachedToEditor ? 'px-4 pt-3 pb-3' : 'p-4'}>
      {/* Header */}
      <div className={`flex items-center justify-between ${attachedToEditor ? 'mb-3' : 'mb-4'}`}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gray-800 flex items-center justify-center shrink-0">
            <span className="text-white text-[11px] font-bold leading-none select-none">?</span>
          </div>
          <span className="text-[14px] font-semibold text-gray-900">{title}</span>
        </div>
        {!singleStep && (
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:text-gray-700 hover:bg-purple-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous question"
            >
              <ChevronUp size={13} />
            </button>
            <span className="text-[13px] text-gray-500 tabular-nums px-1 select-none">
              {currentIdx + 1} of {questions.length}
            </span>
            <button
              type="button"
              onClick={() => setCurrentIdx(i => Math.min(questions.length - 1, i + 1))}
              disabled={currentIdx === questions.length - 1}
              className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:text-gray-700 hover:bg-purple-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next question"
            >
              <ChevronDown size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className={`flex flex-col ${attachedToEditor ? 'gap-4' : 'gap-5'}`}>
        {questions.map((q, idx) => {
          const isActive = singleStep || idx === currentIdx
          const answer = answers[q.id] ?? ''

          return (
            <div
              key={q.id}
              className="flex flex-col gap-2.5"
              onClick={() => !singleStep && !isActive && setCurrentIdx(idx)}
            >
              <p
                className={`flex items-center gap-1 text-[14px] leading-snug transition-colors ${
                  isActive
                    ? 'font-semibold text-gray-900'
                    : 'font-medium text-gray-500 cursor-pointer'
                }`}
              >
                {showQuestionNumbers ? `${idx + 1}.\u00A0` : ''}
                {q.label}
                {q.required && <span className="text-error-600 ml-1">*</span>}
                {q.helperText && (singleStep || isActive) && (
                  <HLTooltip
                    id={`${q.id}-helper-tooltip`}
                    content={q.helperText}
                    variant="dark"
                    placement="top"
                    wrap
                  >
                    <span
                      role="button"
                      tabIndex={0}
                      className="inline-flex shrink-0 text-gray-500"
                      aria-label={q.helperText}
                      onClick={e => e.stopPropagation()}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') e.stopPropagation()
                      }}
                    >
                      <InfoCircleIcon size={20} color="var(--gray-400)" />
                    </span>
                  </HLTooltip>
                )}
              </p>

              {q.type === 'text' && (
                <div
                  className={`flex items-center gap-2 px-3 h-10 bg-white border rounded-lg transition-all ${
                    isActive
                      ? 'border-purple-200 focus-within:border-purple-600 focus-within:shadow-focus-purple-sm'
                      : 'border-gray-100 opacity-50 pointer-events-none'
                  }`}
                >
                  {q.icon && <q.icon size={14} className="text-gray-500 shrink-0" />}
                  <input
                    type="text"
                    value={answer}
                    onChange={e => setAnswer(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    onKeyDown={e => e.key === 'Enter' && (singleStep || answer.trim()) && handleContinue()}
                    className="flex-1 text-[14px] text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
                    autoFocus={isActive && idx === 0}
                    tabIndex={isActive ? 0 : -1}
                  />
                </div>
              )}

              {q.type === 'password' && (
                <div
                  className={`flex items-center gap-2 px-3 h-10 bg-white border rounded-lg transition-all ${
                    isActive
                      ? 'border-purple-200 focus-within:border-purple-600 focus-within:shadow-focus-purple-sm'
                      : 'border-gray-100 opacity-50 pointer-events-none'
                  }`}
                >
                  {q.icon && <q.icon size={14} className="text-gray-500 shrink-0" />}
                  <input
                    type="password"
                    value={answer}
                    onChange={e => setAnswer(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    onKeyDown={e => e.key === 'Enter' && (singleStep || answer.trim()) && handleContinue()}
                    className="flex-1 text-[14px] text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
                    autoFocus={isActive && idx === 0}
                    tabIndex={isActive ? 0 : -1}
                  />
                </div>
              )}

              {q.type === 'textarea' && (
                <textarea
                  value={answer}
                  onChange={e => setAnswer(q.id, e.target.value)}
                  placeholder={q.placeholder}
                  rows={3}
                  className={`w-full px-3 py-2.5 bg-white border rounded-lg text-[14px] text-gray-900 placeholder:text-gray-400 outline-none resize-none transition-all ${
                    isActive
                      ? 'border-purple-200 focus:border-purple-600 focus:shadow-focus-purple-sm'
                      : 'border-gray-100 opacity-50 pointer-events-none'
                  }`}
                  autoFocus={isActive && idx === 0}
                  tabIndex={isActive ? 0 : -1}
                />
              )}

              {q.type === 'radio' && (
                <div className={`flex flex-col gap-1.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  {(q.options ?? []).map((opt, i) => {
                    const letter = String.fromCharCode(65 + i)
                    const isSelected = answer === opt
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={e => {
                          e.stopPropagation()
                          setAnswer(q.id, opt)
                          setCurrentIdx(idx)
                        }}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-purple-300 bg-white shadow-focus-purple-xs'
                            : 'border-transparent bg-white/70 hover:bg-white hover:border-gray-200'
                        }`}
                        tabIndex={isActive ? 0 : -1}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 text-[11px] font-semibold transition-colors ${
                          isSelected ? 'border-purple-600 text-purple-600' : 'border-gray-300 text-gray-500'
                        }`}>
                          {letter}
                        </div>
                        <span className={`text-[13px] ${isSelected ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                          {opt}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-end gap-4 ${attachedToEditor ? 'mt-4' : 'mt-5'}`}>
        <button
          type="button"
          onClick={onSkip}
          className="text-[14px] font-medium text-purple-600 hover:text-purple-700 transition-colors"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-[14px] font-semibold rounded-lg transition-colors shadow-xs"
        >
          {singleStep || isLastQuestion ? 'Submit' : 'Continue'}
          <span className="text-[13px] leading-none">↵</span>
        </button>
      </div>
    </div>
  )

  if (attachedToEditor) {
    return (
      <div
        className="relative w-full bg-purple-50 shrink-0 rounded-t-2xl rounded-b-none border border-solid border-b-0 pb-2"
        style={{ borderColor: '#6938EF66' }}
      >
        {inner}
        {/* Side borders extend down — sit behind the composer */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-[-1px] w-px"
          style={{ height: '8px', bottom: '-8px', backgroundColor: '#6938EF66' }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute right-[-1px] w-px"
          style={{ height: '8px', bottom: '-8px', backgroundColor: '#6938EF66' }}
        />
      </div>
    )
  }

  if (embedded) {
    return <div className="bg-purple-50 w-full">{inner}</div>
  }

  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50 w-full overflow-hidden">
      {inner}
    </div>
  )
}
