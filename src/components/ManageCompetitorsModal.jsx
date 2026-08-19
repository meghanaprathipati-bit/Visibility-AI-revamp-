import { useState, useRef, useEffect } from 'react'
import { Globe, ChevronDown, Plus, Trash2 } from '../icons/index.js'
import HLInput from './HLInput.jsx'
import HLButton from './HLButton.jsx'
import HLModal, { modalTitle, modalSubtext, MODAL_MANAGE_HEIGHT } from './HLModal.jsx'
import SectionInfoTip from './SectionInfoTip.jsx'

const MAX_TRACKED_COMPETITORS = 5

// HARDCODED: seed tracked set for the manage modal (prototyping)
const INITIAL_TRACKED = [
  { rank: 1, name: 'HubSpot', domain: 'hubspot.com', visibility: 78, sov: 24 },
  { rank: 2, name: 'Calendly', domain: 'calendly.com', visibility: 62, sov: 18 },
  { rank: 3, name: 'GoHighLevel', domain: 'gohighlevel.com', visibility: 58, sov: 15, isMe: true },
]

// HARDCODED: AI-suggested competitors for the manage modal (prototyping)
const ADD_COMPETITOR_SUGGESTIONS = [
  { name: 'Keap', domain: 'keap.com', description: 'CRM and marketing automation frequently compared in AI answers.', visibility: 35, sov: 9 },
  { name: 'Monday CRM', domain: 'monday.com', description: 'Work management platform cited in small-business software roundups.', visibility: 28, sov: 6 },
  { name: 'Zoho CRM', domain: 'zoho.com', description: 'Often cited alongside mid-market CRM platforms in AI roundups.', visibility: 24, sov: 7 },
  { name: 'Pipedrive', domain: 'pipedrive.com', description: 'Sales CRM frequently compared for pipeline and deal tracking.', visibility: 41, sov: 11 },
]

const ADD_COMPETITOR_COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'India',
  'Germany', 'France', 'Netherlands', 'Singapore', 'Brazil',
]

function ModalTableRemoveButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex items-center justify-center w-7 h-7 rounded-md text-error-600 hover:text-error-700 hover:bg-error-50 transition-colors"
    >
      <Trash2 size={14} />
    </button>
  )
}

/** Enter/exit motion for selection rows in the manage modal. */
function useSelectionRowMotion() {
  const [flashIds, setFlashIds] = useState(() => new Set())
  const [removingIds, setRemovingIds] = useState(() => new Set())
  const listRef = useRef(null)
  const timersRef = useRef(new Map())
  const removingLockRef = useRef(new Set())

  useEffect(() => () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current.clear()
    removingLockRef.current.clear()
  }, [])

  function clearTimer(key) {
    const timer = timersRef.current.get(key)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(key)
    }
  }

  function markAdded(id) {
    setFlashIds(prev => new Set(prev).add(id))
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    })
    clearTimer(`flash-${id}`)
    const timer = window.setTimeout(() => {
      setFlashIds(prev => {
        if (!prev.has(id)) return prev
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      timersRef.current.delete(`flash-${id}`)
    }, 1400)
    timersRef.current.set(`flash-${id}`, timer)
  }

  function animateRemove(id, onDone) {
    if (removingLockRef.current.has(id)) return
    removingLockRef.current.add(id)
    setRemovingIds(prev => new Set(prev).add(id))
    setFlashIds(prev => {
      if (!prev.has(id)) return prev
      const next = new Set(prev)
      next.delete(id)
      return next
    })
    clearTimer(`flash-${id}`)
    clearTimer(`remove-${id}`)
    const timer = window.setTimeout(() => {
      onDone()
      removingLockRef.current.delete(id)
      setRemovingIds(prev => {
        if (!prev.has(id)) return prev
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      timersRef.current.delete(`remove-${id}`)
    }, 280)
    timersRef.current.set(`remove-${id}`, timer)
  }

  function rowMotionClass(id) {
    if (removingIds.has(id)) return 'pt-selection-removing border-gray-200 bg-white'
    if (flashIds.has(id)) return 'pt-selection-added-flash'
    return 'border-gray-200 bg-white hover:border-gray-300 transition-colors'
  }

  return { listRef, markAdded, animateRemove, rowMotionClass }
}

/**
 * Shared Manage competitors UI — modal (default) or embedded panel for settings shells.
 */
export default function ManageCompetitorsModal({ onClose, onSave, embedded = false }) {
  const [trackedCompetitors, setTrackedCompetitors] = useState(() =>
    INITIAL_TRACKED.map(c => ({ ...c })),
  )
  const [pendingCompetitors, setPendingCompetitors] = useState([])
  const [customBrand, setCustomBrand] = useState('')
  const [customWebsite, setCustomWebsite] = useState('')
  const [customCountry, setCustomCountry] = useState('United States')
  const [showAddForm, setShowAddForm] = useState(false)
  const { listRef: selectionListRef, markAdded, animateRemove, rowMotionClass } = useSelectionRowMotion()

  const totalSelected = trackedCompetitors.length + pendingCompetitors.length
  const atCapacity = totalSelected >= MAX_TRACKED_COMPETITORS

  function deleteTracked(domain) {
    animateRemove(domain, () => {
      setTrackedCompetitors(prev => prev.filter(c => c.domain !== domain))
    })
  }

  function stageCompetitor(item) {
    if (atCapacity) return
    if (trackedCompetitors.some(c => c.domain === item.domain)) return
    if (pendingCompetitors.some(c => c.domain === item.domain)) return
    const id = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setPendingCompetitors(prev => [{ ...item, id }, ...prev])
    markAdded(id)
  }

  function removePending(id) {
    animateRemove(id, () => {
      setPendingCompetitors(prev => prev.filter(c => c.id !== id))
    })
  }

  function addCustomCompetitor() {
    const name = customBrand.trim()
    const website = customWebsite.trim().replace(/^https?:\/\//i, '')
    if (!name || !website || atCapacity) return
    stageCompetitor({
      name,
      domain: website.split('/')[0],
      description: 'Custom competitor added for tracking.',
      visibility: 0,
      sov: 0,
      country: customCountry,
    })
    setCustomBrand('')
    setCustomWebsite('')
    setShowAddForm(false)
  }

  function handleSave() {
    onSave?.({ tracked: trackedCompetitors, pending: pendingCompetitors })
  }

  const stagedDomains = new Set([
    ...trackedCompetitors.map(c => c.domain),
    ...pendingCompetitors.map(c => c.domain),
  ])
  const availableSuggestions = ADD_COMPETITOR_SUGGESTIONS.filter(item => !stagedDomains.has(item.domain))
  const canAddCustom = Boolean(customBrand.trim() && customWebsite.trim()) && !atCapacity

  const selectionRows = [
    ...pendingCompetitors.map(c => ({ ...c, _kind: 'pending' })),
    ...trackedCompetitors.map(c => ({ ...c, _kind: 'tracked' })),
  ]

  const body = (
      <div className="flex-1 min-h-0 flex flex-col gap-4">
        {embedded && (
          <div className="shrink-0 mb-1">
            <p className="text-[18px] font-bold text-gray-900 m-0">Competitors</p>
            <p className="text-[13px] text-gray-500 m-0 mt-1">
              Track up to five brands. Your selection is the source of truth for competitive comparisons.
            </p>
          </div>
        )}
        <section className="shrink-0 rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-3.5 border-b border-gray-100">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-gray-900 m-0">Your selection</p>
                <p className="text-[12px] text-gray-500 m-0 mt-1">
                  Brands in your competitive set for AI answers
                </p>
              </div>
              <span className="shrink-0 text-[13px] font-semibold text-gray-700 tabular-nums">
                {totalSelected}
                <span className="text-gray-300 font-medium">/{MAX_TRACKED_COMPETITORS}</span>
              </span>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-2">
            {selectionRows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">
                <p className="text-[13px] font-medium text-gray-700 m-0">No competitors yet</p>
                <p className="text-[12px] text-gray-500 m-0 mt-1">Add a brand you already know — or grab one from suggestions below.</p>
              </div>
            ) : (
              <div
                ref={selectionListRef}
                className="max-h-[220px] overflow-y-auto flex flex-col gap-2 pr-0.5"
                style={{ scrollbarWidth: 'thin' }}
              >
                {selectionRows.map((c) => {
                  const isPending = c._kind === 'pending'
                  const rowId = isPending ? c.id : c.domain
                  return (
                    <div
                      key={rowId}
                      className={`group flex items-center gap-3 rounded-xl border px-3.5 py-3 ${rowMotionClass(rowId)}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-[14px] font-semibold text-gray-900 m-0 truncate">{c.name}</p>
                          {c.isMe && (
                            <span className="shrink-0 text-[10px] font-semibold text-gray-600 bg-gray-100 border border-gray-200 rounded-md px-1.5 py-0.5">
                              You
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-gray-500 m-0 mt-0.5 truncate">
                          {c.domain}
                          {c.visibility != null && c.visibility > 0 ? (
                            <span className="text-gray-500"> · Mentioned in {c.visibility}% of AI answers</span>
                          ) : null}
                        </p>
                      </div>
                      {(isPending || !c.isMe) && (
                        <ModalTableRemoveButton
                          label={isPending ? 'Remove competitor' : 'Delete competitor'}
                          onClick={() => (isPending ? removePending(c.id) : deleteTracked(c.domain))}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {!showAddForm ? (
              <button
                type="button"
                disabled={atCapacity}
                onClick={() => setShowAddForm(true)}
                className={`mt-1 w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl text-[13px] font-semibold transition-all ${
                  atCapacity
                    ? 'bg-white text-gray-300 border border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-800 border border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <Plus size={15} strokeWidth={2.25} />
                Add a competitor
              </button>
            ) : (
              <div className="mt-1 rounded-xl border border-primary-300 bg-white p-4 flex flex-col gap-3">
                <div>
                  <p className="text-[14px] font-semibold text-gray-900 m-0">Add a competitor</p>
                  <p className="text-[12px] text-gray-500 m-0 mt-0.5">Brand name, website, and country.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="manage-competitor-brand" className="block text-[14px] font-medium text-gray-500 mb-1">Brand name</label>
                    <HLInput
                      id="manage-competitor-brand"
                      size="sm"
                      value={customBrand}
                      onChange={e => setCustomBrand(e.target.value)}
                      placeholder="e.g. HubSpot"
                      disabled={atCapacity}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label htmlFor="manage-competitor-website" className="block text-[14px] font-medium text-gray-500 mb-1">Website</label>
                    <HLInput
                      id="manage-competitor-website"
                      size="sm"
                      prefixIcon={Globe}
                      value={customWebsite}
                      onChange={e => setCustomWebsite(e.target.value)}
                      placeholder="e.g. hubspot.com"
                      disabled={atCapacity}
                    />
                  </div>
                  <div>
                    <label htmlFor="manage-competitor-country" className="block text-[14px] font-medium text-gray-500 mb-1">Country</label>
                    <div className="relative">
                      <select
                        id="manage-competitor-country"
                        value={customCountry}
                        onChange={e => setCustomCountry(e.target.value)}
                        disabled={atCapacity}
                        className="w-full h-9 px-3 pr-8 bg-white border border-gray-300 rounded-lg text-[14px] text-gray-900 outline-none appearance-none focus:border-primary-600 transition-colors cursor-pointer disabled:bg-gray-50 disabled:text-gray-400"
                      >
                        {ADD_COMPETITOR_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={14} className="text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <HLButton
                    variant="secondary"
                    color="gray"
                    size="sm"
                    onClick={() => { setShowAddForm(false); setCustomBrand(''); setCustomWebsite('') }}
                  >
                    Cancel
                  </HLButton>
                  <HLButton
                    variant="primary"
                    color="blue"
                    size="sm"
                    disabled={!canAddCustom}
                    onClick={addCustomCompetitor}
                  >
                    Add
                  </HLButton>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="flex-1 min-h-0 flex flex-col">
          <div className="flex items-baseline gap-2 mb-3 shrink-0">
            <p className="text-[14px] font-semibold text-gray-900 m-0">Suggested competitors</p>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {availableSuggestions.length === 0 ? (
              <p className="text-[12px] text-gray-500 m-0 py-2">No more suggestions.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 content-start">
                {availableSuggestions.map(item => (
                  <button
                    key={item.domain}
                    type="button"
                    disabled={atCapacity}
                    onClick={() => stageCompetitor(item)}
                    className={`flex items-center gap-3 text-left rounded-xl border border-dashed px-3.5 py-3 transition-all outline-none focus:outline-none ${
                      atCapacity
                        ? 'border-gray-200 bg-white text-gray-300 cursor-not-allowed'
                        : 'border-gray-300 bg-white hover:border-primary-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={`text-[13px] font-semibold m-0 truncate ${atCapacity ? 'text-gray-300' : 'text-gray-900'}`}>
                        {item.name}
                      </p>
                      <p className={`text-[11px] m-0 mt-0.5 truncate ${atCapacity ? 'text-gray-300' : 'text-gray-500'}`}>
                        {item.domain}
                        {item.visibility > 0 ? ` · Mentioned in ${item.visibility}% of AI answers` : ''}
                      </p>
                    </div>
                    <span className={`text-[12px] font-semibold shrink-0 ${atCapacity ? 'text-gray-300' : 'text-primary-600'}`}>
                      Add
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
  )

  if (embedded) return body

  return (
    <HLModal
      id="manage-competitors"
      width={880}
      height={MODAL_MANAGE_HEIGHT}
      headerDivider
      onClose={onClose}
      contentClassName="px-6 py-4 overflow-hidden flex flex-col"
      footerClassName="px-6 py-3.5"
      header={(
        <div className="px-6 pt-5 pb-3.5">
          <div className="flex items-center gap-2">
            <h2 id="manage-competitors-title" className={`${modalTitle} m-0`}>Manage competitors</h2>
            <SectionInfoTip content="Track up to five brands. Your selection is the source of truth — suggestions and custom adds fill open slots." />
          </div>
          <p className={`${modalSubtext} m-0 mt-1`}>
            Review what you’re tracking, add brands you care about, and optionally use suggestions to fill open slots.
          </p>
        </div>
      )}
      footer={(
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[12px] text-gray-500 m-0">
            {pendingCompetitors.length > 0
              ? `${pendingCompetitors.length} new competitor${pendingCompetitors.length === 1 ? '' : 's'} will start tracking on save.`
              : 'Changes will be applied to the next scan when you save.'}
          </p>
          <div className="flex items-center gap-2">
            <HLButton variant="secondary" color="gray" size="sm" onClick={onClose}>
              Cancel
            </HLButton>
            <HLButton variant="primary" color="blue" size="sm" onClick={handleSave}>
              Save and refresh results
            </HLButton>
          </div>
        </div>
      )}
    >
      {body}
    </HLModal>
  )
}
