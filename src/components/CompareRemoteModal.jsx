import { useMemo, useState } from 'react'
import { ArrowLeftRight, BarChart3, Calendar, Info, Search } from '../icons/index.js'
import HLModal, { modalTitle, modalSubtext } from './HLModal.jsx'
import HLInput from './HLInput.jsx'
import { BTN_PRIMARY, BTN_SECONDARY } from './HLButton.jsx'

const BTN_GHOST =
  'h-9 px-3 rounded-lg text-[13px] font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors'

/**
 * Compare scans modal — pick two audit dates.
 * Disabled upstream when fewer than 2 scans exist.
 */
export default function CompareRemoteModal({
  scans = [],
  initialPrimary = null,
  initialSecondary = null,
  canReset = false,
  onClose,
  onConfirm,
  onReset,
}) {
  const [primaryIdx, setPrimaryIdx] = useState(
    initialPrimary != null && initialPrimary >= 0 ? initialPrimary : null
  )
  const [secondaryIdx, setSecondaryIdx] = useState(
    initialSecondary != null && initialSecondary >= 0 && initialSecondary !== initialPrimary
      ? initialSecondary
      : null
  )
  const [primarySearch, setPrimarySearch] = useState('')
  const [secondarySearch, setSecondarySearch] = useState('')

  const canConfirm =
    scans.length >= 2
    && primaryIdx != null
    && secondaryIdx != null
    && primaryIdx !== secondaryIdx

  const primary = primaryIdx != null ? scans[primaryIdx] : null
  const secondary = secondaryIdx != null ? scans[secondaryIdx] : null
  const canSwap = primaryIdx != null && secondaryIdx != null && primaryIdx !== secondaryIdx

  function swapSelections() {
    if (!canSwap) return
    setPrimaryIdx(secondaryIdx)
    setSecondaryIdx(primaryIdx)
  }

  return (
    <HLModal
      id="compare-scan"
      width={720}
      headerDivider
      onClose={onClose}
      footerClassName="px-6 py-5"
      contentClassName="overflow-y-auto"
      header={
        <div className="px-6 pt-5 pr-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
              <BarChart3 size={18} className="text-primary-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="compare-scan-title" className={`${modalTitle} m-0`}>Compare scans</h2>
              <p className={`${modalSubtext} m-0 mt-1`}>
                Choose two scan dates to compare crawl results side by side.
              </p>
            </div>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between gap-2">
          <div>
            {canReset && (
              <button
                type="button"
                onClick={() => onReset?.()}
                className={BTN_GHOST}
              >
                Reset
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className={BTN_SECONDARY}>
              Cancel
            </button>
            <button
              type="button"
              disabled={!canConfirm}
              onClick={() => canConfirm && onConfirm?.({ primaryIdx, secondaryIdx })}
              className={BTN_PRIMARY}
            >
              Compare scans
            </button>
          </div>
        </div>
      }
    >
      <div className="px-6 py-5 flex flex-col gap-5">
        {/* Selection summary */}
        <div className="flex items-stretch gap-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
          <SummarySlot label="First scan" value={primary} empty={!primary} />
          <div className="shrink-0 self-center px-0.5">
            <button
              type="button"
              onClick={swapSelections}
              disabled={!canSwap}
              title={canSwap ? 'Swap first and second scan' : 'Select two scans to swap'}
              aria-label="Swap first and second scan"
              className={`inline-flex items-center justify-center w-8 h-8 rounded-full border transition-colors ${
                canSwap
                  ? 'bg-primary-50 border-primary-100 text-primary-600 hover:bg-primary-100 cursor-pointer'
                  : 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
              }`}
            >
              <ArrowLeftRight size={14} />
            </button>
          </div>
          <SummarySlot label="Second scan" value={secondary} empty={!secondary} />
        </div>

        {/* Picker section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-[14px] font-semibold text-gray-900 m-0">Select scan dates</p>
            <p className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 m-0">
              <Info size={12} className="text-gray-400 shrink-0" />
              Pick two different dates to continue
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ScanPickerColumn
              label="First scan"
              scans={scans}
              search={primarySearch}
              onSearchChange={setPrimarySearch}
              selectedIdx={primaryIdx}
              otherIdx={secondaryIdx}
              onSelect={setPrimaryIdx}
            />
            <ScanPickerColumn
              label="Second scan"
              scans={scans}
              search={secondarySearch}
              onSearchChange={setSecondarySearch}
              selectedIdx={secondaryIdx}
              otherIdx={primaryIdx}
              onSelect={setSecondaryIdx}
            />
          </div>
        </div>
      </div>
    </HLModal>
  )
}

function SummarySlot({ label, value, empty }) {
  return (
    <div className="flex-1 min-w-0 rounded-lg bg-white border border-gray-200 px-3 py-2.5 flex items-center gap-2.5">
      <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary-50 text-primary-600">
        <Calendar size={14} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-gray-500 m-0">{label}</p>
        {empty ? (
          <>
            <p className="text-[13px] font-semibold text-gray-400 m-0">Not selected</p>
            <p className="text-[12px] text-gray-300 m-0">—</p>
          </>
        ) : (
          <p className="text-[13px] font-semibold text-gray-900 m-0 truncate tabular-nums">{value}</p>
        )}
      </div>
    </div>
  )
}

function ScanPickerColumn({
  label,
  scans,
  search,
  onSearchChange,
  selectedIdx,
  otherIdx,
  onSelect,
}) {
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return scans.map((scan, i) => ({ scan, i }))
    return scans
      .map((scan, i) => ({ scan, i }))
      .filter(({ scan }) => scan.toLowerCase().includes(q))
  }, [scans, search])

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <p className="text-[12px] font-semibold text-gray-500 m-0">{label}</p>
      <HLInput
        size="sm"
        prefixIcon={Search}
        suffix={<Calendar size={14} className="text-gray-400" />}
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        placeholder="Search scan date"
        aria-label={`Search ${label.toLowerCase()}`}
      />
      <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-0.5">
        {filtered.length === 0 && (
          <p className="text-[12px] text-gray-500 m-0 py-3 text-center">No scans match your search.</p>
        )}
        {filtered.map(({ scan, i }) => {
          const selected = selectedIdx === i
          const usedElsewhere = otherIdx === i
          return (
            <button
              key={scan}
              type="button"
              onClick={() => onSelect(i)}
              className={`w-full text-left rounded-lg border px-3 py-2.5 transition-all ${
                selected
                  ? 'border-primary-600 bg-primary-50'
                  : usedElsewhere
                    ? 'border-gray-100 bg-gray-50 opacity-55 hover:opacity-100 hover:border-gray-200'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                    selected ? 'border-primary-600 bg-primary-600' : 'border-gray-300 bg-white'
                  }`}
                >
                  {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] font-semibold text-gray-900 tabular-nums truncate">
                    {scan}
                  </span>
                  {i === 0 && (
                    <span className="inline-flex text-[11px] font-medium text-success-700 bg-success-50 border border-success-200 px-1.5 py-px rounded">
                      Latest
                    </span>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
