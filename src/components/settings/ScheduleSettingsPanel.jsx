import { useState } from 'react'
import { ChevronDown, Minus, Plus } from '../../icons/index.js'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const FREQUENCIES = ['Daily', 'Weekly', 'Monthly']

function InfoTooltip({ text }) {
  const icon = (
    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-300 text-[12px] font-semibold text-gray-400 cursor-help shrink-0">i</span>
  )
  if (!text) return icon
  return (
    <span className="relative inline-flex group shrink-0">
      {icon}
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 w-64 bg-gray-900 text-white text-[12px] leading-relaxed rounded-lg px-3 py-2.5 pointer-events-none z-[300] shadow-lg whitespace-normal opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        {text}
        <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900" />
      </span>
    </span>
  )
}

function SettingsToggle({ value, onChange, label, description, tooltip }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        {label && (
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] font-medium text-gray-900">{label}</span>
            {tooltip !== undefined && <InfoTooltip text={tooltip} />}
          </div>
        )}
        {description && <p className="text-[13px] text-gray-500 leading-relaxed m-0">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors mt-0.5 ${value ? 'bg-primary-600' : 'bg-gray-200'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

function SettingsField({ label, description, tooltip, children }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <p className="text-[14px] font-medium text-gray-900 m-0">{label}</p>
        {tooltip !== undefined && <InfoTooltip text={tooltip} />}
      </div>
      {description && <p className="text-[13px] text-gray-500 leading-relaxed m-0">{description}</p>}
      {children}
    </div>
  )
}

function intervalUnit(frequency) {
  if (frequency === 'daily') return { singular: 'day', plural: 'days', defaultHint: 'Runs every day by default. Enable to run every 2+ days.', enabledHint: 'Runs every 2+ days.' }
  if (frequency === 'monthly') return { singular: 'month', plural: 'months', defaultHint: 'Runs every month by default. Enable to run every 2+ months.', enabledHint: 'Runs every 2+ months.' }
  return { singular: 'week', plural: 'weeks', defaultHint: 'Runs every week by default. Enable to run every 2+ weeks.', enabledHint: 'Runs every 2+ weeks.' }
}

/**
 * Shared schedule settings panel — used by Site Health audit settings and Prompt Tracking settings.
 * Frequency options: Daily / Weekly / Monthly (default weekly).
 */
export default function ScheduleSettingsPanel({
  title = 'Schedule',
  frequency,
  onFrequencyChange,
  repeatEvery,
  onRepeatEveryChange,
  intervalVal,
  onIntervalValChange,
  selectedDays,
  onSelectedDaysChange,
  dayOfMonth,
  onDayOfMonthChange,
  auditTime,
  onAuditTimeChange,
  timeLabel = 'Time (Asia/Calcutta)',
}) {
  const unit = intervalUnit(frequency)

  function toggleDay(d) {
    const k = d.toLowerCase()
    onSelectedDaysChange(
      selectedDays.includes(k) ? selectedDays.filter(x => x !== k) : [...selectedDays, k],
    )
  }

  return (
    <div className="flex flex-col gap-5 pb-4">
      <p className="text-[18px] font-bold text-gray-900 m-0">{title}</p>
      <div className="border border-gray-200 rounded-lg p-5 flex flex-col gap-6">

        <div className="flex flex-col gap-2">
          <p className="text-[14px] font-medium text-gray-900 m-0">Scanning frequency</p>
          <div className="flex items-center gap-5 mt-1">
            {FREQUENCIES.map(f => {
              const checked = frequency === f.toLowerCase()
              return (
                <label key={f} className="flex items-center gap-2 cursor-pointer select-none">
                  <span className={`flex items-center justify-center w-4 h-4 rounded-full border-2 transition-colors shrink-0 ${checked ? 'border-primary-600' : 'border-gray-300'}`}>
                    {checked && <span className="w-2 h-2 rounded-full bg-primary-600" />}
                  </span>
                  <input
                    type="radio"
                    className="sr-only"
                    checked={checked}
                    readOnly
                    onChange={() => onFrequencyChange(f.toLowerCase())}
                  />
                  <span className="text-[14px] text-gray-700 font-medium">{f}</span>
                </label>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <SettingsToggle
            label="Repeat interval"
            description={repeatEvery ? unit.enabledHint : unit.defaultHint}
            value={repeatEvery}
            onChange={onRepeatEveryChange}
          />
          {repeatEvery && (
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-medium text-gray-700">Run every</span>
              <div className="flex items-center h-9 border border-gray-200 rounded-lg overflow-hidden focus-within:border-primary-600 transition-colors">
                <input
                  type="text"
                  value={intervalVal}
                  onChange={e => {
                    const n = parseInt(e.target.value, 10)
                    if (!Number.isNaN(n) && n >= 1) onIntervalValChange(n)
                  }}
                  className="w-12 h-full px-3 text-[14px] text-gray-900 outline-none bg-transparent text-center"
                />
                <div className="flex items-center h-full shrink-0">
                  <button type="button" onClick={() => onIntervalValChange(Math.max(1, intervalVal - 1))} className="h-full w-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                    <Minus size={11} />
                  </button>
                  <button type="button" onClick={() => onIntervalValChange(intervalVal + 1)} className="h-full w-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                    <Plus size={11} />
                  </button>
                </div>
              </div>
              <span className="text-[14px] font-medium text-gray-700">{unit.plural}</span>
            </div>
          )}
        </div>

        {frequency === 'weekly' && (
          <SettingsField label="Days">
            <div className="flex items-center gap-2 flex-wrap">
              {WEEKDAYS.map(d => {
                const active = selectedDays.includes(d.toLowerCase())
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`w-12 h-9 rounded-full text-[13px] font-medium border transition-colors ${
                      active ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </SettingsField>
        )}

        {frequency === 'monthly' && (
          <div className="grid grid-cols-2 gap-5">
            <SettingsField label="Day of month">
              <div className="relative">
                <select
                  value={dayOfMonth}
                  onChange={e => onDayOfMonthChange(Number(e.target.value))}
                  className="appearance-none w-full h-10 border border-gray-200 rounded-lg px-3 pr-8 text-[14px] text-gray-900 outline-none focus:border-primary-600 cursor-pointer bg-white transition-colors"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </SettingsField>
            <SettingsField label={timeLabel}>
              <div className="relative">
                <select
                  value={auditTime}
                  onChange={e => onAuditTimeChange(e.target.value)}
                  className="appearance-none w-full h-10 border border-gray-200 rounded-lg px-3 pr-8 text-[14px] text-gray-900 outline-none focus:border-primary-600 cursor-pointer bg-white transition-colors"
                >
                  {Array.from({ length: 24 }, (_, i) => `${i}:00`).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </SettingsField>
          </div>
        )}

        {(frequency === 'daily' || frequency === 'weekly') && (
          <SettingsField label={timeLabel}>
            <div className="relative">
              <select
                value={auditTime}
                onChange={e => onAuditTimeChange(e.target.value)}
                className="appearance-none w-full h-10 border border-gray-200 rounded-lg px-3 pr-8 text-[14px] text-gray-900 outline-none focus:border-primary-600 cursor-pointer bg-white transition-colors"
              >
                {Array.from({ length: 24 }, (_, i) => `${i}:00`).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </SettingsField>
        )}
      </div>
    </div>
  )
}

/** Default schedule values — weekly on Monday at 0:00. */
export const DEFAULT_SCHEDULE = {
  frequency: 'weekly',
  repeatEvery: false,
  intervalVal: 2,
  selectedDays: ['mon'],
  dayOfMonth: 1,
  auditTime: '0:00',
}

/** Controlled schedule state hook for parent settings modals. */
export function useScheduleSettings(initial = DEFAULT_SCHEDULE) {
  const [frequency, setFrequency] = useState(initial.frequency)
  const [repeatEvery, setRepeatEvery] = useState(initial.repeatEvery)
  const [intervalVal, setIntervalVal] = useState(initial.intervalVal)
  const [selectedDays, setSelectedDays] = useState(initial.selectedDays)
  const [dayOfMonth, setDayOfMonth] = useState(initial.dayOfMonth)
  const [auditTime, setAuditTime] = useState(initial.auditTime)

  function resetSchedule() {
    setFrequency(DEFAULT_SCHEDULE.frequency)
    setRepeatEvery(DEFAULT_SCHEDULE.repeatEvery)
    setIntervalVal(DEFAULT_SCHEDULE.intervalVal)
    setSelectedDays([...DEFAULT_SCHEDULE.selectedDays])
    setDayOfMonth(DEFAULT_SCHEDULE.dayOfMonth)
    setAuditTime(DEFAULT_SCHEDULE.auditTime)
  }

  const scheduleChanged =
    frequency !== DEFAULT_SCHEDULE.frequency
    || repeatEvery !== DEFAULT_SCHEDULE.repeatEvery
    || intervalVal !== DEFAULT_SCHEDULE.intervalVal
    || JSON.stringify(selectedDays) !== JSON.stringify(DEFAULT_SCHEDULE.selectedDays)
    || dayOfMonth !== DEFAULT_SCHEDULE.dayOfMonth
    || auditTime !== DEFAULT_SCHEDULE.auditTime

  return {
    frequency, setFrequency,
    repeatEvery, setRepeatEvery,
    intervalVal, setIntervalVal,
    selectedDays, setSelectedDays,
    dayOfMonth, setDayOfMonth,
    auditTime, setAuditTime,
    resetSchedule,
    scheduleChanged,
    panelProps: {
      frequency,
      onFrequencyChange: setFrequency,
      repeatEvery,
      onRepeatEveryChange: setRepeatEvery,
      intervalVal,
      onIntervalValChange: setIntervalVal,
      selectedDays,
      onSelectedDaysChange: setSelectedDays,
      dayOfMonth,
      onDayOfMonthChange: setDayOfMonth,
      auditTime,
      onAuditTimeChange: setAuditTime,
    },
  }
}

export { SettingsToggle, SettingsField, InfoTooltip, WEEKDAYS, FREQUENCIES }
