import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronRight, LayoutGrid, Minus, Pin, Settings } from '../icons/index.js'
import HLButton from './HLButton.jsx'
import HLSelect from './HLSelect.jsx'
import {
  LIVE_VARIATION,
  applyExperiencePreview,
  canonicalScreen,
  getPreviewFixture,
  isExperiencePreviewEnabled,
  resetPreviewToLive,
  screensInRegistry,
  subscribePreviewFixture,
  variationsForScreen,
} from '../data/experiencePreview.js'

export function useExperiencePreview() {
  const [fixture, setFixture] = useState(getPreviewFixture)

  useEffect(() => subscribePreviewFixture(setFixture), [])

  return {
    fixture,
    resetToLive: resetPreviewToLive,
    applyPreview: ({ screen, variation, onNavigate }) => {
      applyExperiencePreview({ screen, variation, onNavigate })
    },
  }
}

/**
 * Dev-only overlay. DS gap: HighRise has no floating toolbar primitive in this
 * React scaffold — surface uses the same card tokens as other dashboards.
 */
export function ExperiencePreviewPanel({ onNavigate }) {
  const enabled = isExperiencePreviewEnabled()
  const { fixture, applyPreview } = useExperiencePreview()
  const screens = screensInRegistry()
  const [expanded, setExpanded] = useState(false)
  const [screen, setScreen] = useState(() => canonicalScreen(screens[0]))
  const variations = variationsForScreen(screen)
  const [variation, setVariation] = useState(variations[0] ?? LIVE_VARIATION)
  const isLive = fixture === 'ready'

  if (!enabled) return null

  function applySelection(nextScreen, nextVariation) {
    const resolvedScreen = canonicalScreen(nextScreen)
    applyPreview({ screen: resolvedScreen, variation: nextVariation, onNavigate })
  }

  function handleScreenChange(next) {
    const resolved = canonicalScreen(next)
    const nextVariation = variationsForScreen(resolved)[0] ?? LIVE_VARIATION
    setScreen(resolved)
    setVariation(nextVariation)
  }

  function handleVariationChange(next) {
    setVariation(next)
    applySelection(screen, next)
  }

  function handleApply() {
    applySelection(screen, variation)
  }

  function handleResetLive() {
    setVariation(LIVE_VARIATION)
    applySelection(screen, LIVE_VARIATION)
  }

  const panel = (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-[80] pointer-events-none">
      {!expanded ? (
        <button
          type="button"
          aria-label="Open experience preview"
          onClick={() => setExpanded(true)}
          className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-l-lg border border-r-0 border-gray-200 bg-white shadow-card text-gray-700 hover:bg-gray-50"
        >
          <LayoutGrid size={16} />
        </button>
      ) : (
        <div className="pointer-events-auto w-[280px] mr-3 border border-gray-200 rounded-md bg-white shadow-card p-3 shrink-0">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400" aria-hidden="true">
              <ChevronRight size={14} className="rotate-90" />
            </span>
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400" aria-hidden="true">
              <Settings size={14} />
            </span>
            <p className="flex-1 min-w-0 text-[14px] font-semibold text-gray-900 m-0">Experience preview</p>
            <button
              type="button"
              aria-label="Minimize experience preview"
              onClick={() => setExpanded(false)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-50"
            >
              <Minus size={14} />
            </button>
            <button
              type="button"
              aria-label="Focus preview target"
              className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-50"
            >
              <Pin size={14} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            <HLSelect
              id="experience-preview-screen"
              label="Screen"
              value={screen}
              options={screens}
              onChange={handleScreenChange}
            />
            <HLSelect
              id="experience-preview-variation"
              label="Variation"
              value={variations.includes(variation) ? variation : LIVE_VARIATION}
              options={variations}
              onChange={handleVariationChange}
            />
            <HLButton variant="primary" color="blue" size="sm" onClick={handleApply}>
              Apply
            </HLButton>
            {!isLive && (
              <HLButton variant="secondary" color="gray" size="sm" onClick={handleResetLive}>
                Reset to live flow
              </HLButton>
            )}
          </div>
        </div>
      )}
    </div>
  )

  return createPortal(panel, document.body)
}
