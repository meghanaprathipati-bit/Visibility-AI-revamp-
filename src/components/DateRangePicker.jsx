import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from '../icons/index.js'

// React adapter for the HighRise `HLDatePicker type="daterange"`. Presentational
// range calendar shown inside a popover: two Start/End inputs, twin month grids,
// range highlight, clearable, and an Apply action. Parent owns open/close state.

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1) }
function addMonths(d, n) { return new Date(d.getFullYear(), d.getMonth() + n, 1) }
function stripTime(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }
function isSameDay(a, b) { return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }

function fmtInput(d) {
  return d ? `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` : ''
}

// Formats a {start, end} range into a compact chip label, e.g. "Jul 1 – Jul 30, 2026".
export function formatRange(start, end) {
  if (!start || !end) return 'Custom date range'
  const sameYear = start.getFullYear() === end.getFullYear()
  const left = `${MONTHS_SHORT[start.getMonth()]} ${start.getDate()}${sameYear ? '' : `, ${start.getFullYear()}`}`
  const right = `${MONTHS_SHORT[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`
  return `${left} – ${right}`
}

function MonthGrid({ view, start, end, hover, onPick, onHover }) {
  const first = startOfMonth(view)
  const leadBlanks = first.getDay()
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < leadBlanks; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.getFullYear(), view.getMonth(), d))

  const rangeEnd = end || (start && hover) || null

  return (
    <div className="w-[236px]">
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(w => (
          <div key={w} className="h-7 flex items-center justify-center text-[11px] font-medium text-gray-400">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="h-8" />
          const isStart = isSameDay(day, start)
          const isEnd = isSameDay(day, rangeEnd)
          const inRange = start && rangeEnd && day > stripTime(start) && day < stripTime(rangeEnd)
          const isEndpoint = isStart || isEnd
          return (
            <div
              key={i}
              className={`h-8 flex items-center justify-center ${inRange ? 'bg-primary-50' : ''} ${isStart && rangeEnd ? 'rounded-l-full bg-primary-50' : ''} ${isEnd && start && !isSameDay(start, rangeEnd) ? 'rounded-r-full bg-primary-50' : ''}`}
            >
              <button
                type="button"
                onClick={() => onPick(day)}
                onMouseEnter={() => onHover(day)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] transition-colors
                  ${isEndpoint ? 'bg-primary-600 text-white font-semibold' : inRange ? 'text-primary-700' : 'text-gray-700 hover:bg-gray-100'}`}
              >
                {day.getDate()}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function DateRangePicker({ value = {}, onApply, onCancel }) {
  const [start, setStart] = useState(value.start || null)
  const [end, setEnd] = useState(value.end || null)
  const [hover, setHover] = useState(null)
  const [leftMonth, setLeftMonth] = useState(startOfMonth(value.start || new Date()))
  const rightMonth = addMonths(leftMonth, 1)

  function pick(day) {
    if (!start || (start && end)) {
      setStart(day); setEnd(null); return
    }
    // start set, choosing end
    if (day < stripTime(start)) { setStart(day); setEnd(null); return }
    setEnd(day)
  }

  function clear() { setStart(null); setEnd(null); setHover(null) }

  return (
    <div className="p-3 w-[520px]">
      {/* Start / End inputs */}
      <div className="flex items-center gap-2 mb-3">
        <RangeInput label="Start date" value={fmtInput(start)} onClear={start ? () => { setStart(null); setEnd(null) } : null} />
        <span className="text-gray-300">–</span>
        <RangeInput label="End date" value={fmtInput(end)} onClear={end ? () => setEnd(null) : null} />
      </div>

      {/* Twin month calendars */}
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <button type="button" onClick={() => setLeftMonth(addMonths(leftMonth, -1))} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
              <ChevronLeft size={16} />
            </button>
            <span className="text-[13px] font-semibold text-gray-900">{MONTHS[leftMonth.getMonth()]} {leftMonth.getFullYear()}</span>
            <span className="w-7 h-7" />
          </div>
          <MonthGrid view={leftMonth} start={start} end={end} hover={hover} onPick={pick} onHover={setHover} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="w-7 h-7" />
            <span className="text-[13px] font-semibold text-gray-900">{MONTHS[rightMonth.getMonth()]} {rightMonth.getFullYear()}</span>
            <button type="button" onClick={() => setLeftMonth(addMonths(leftMonth, 1))} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
              <ChevronRight size={16} />
            </button>
          </div>
          <MonthGrid view={rightMonth} start={start} end={end} hover={hover} onPick={pick} onHover={setHover} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <button type="button" onClick={clear} className="text-[13px] font-medium text-gray-500 hover:text-gray-700">Clear</button>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="h-8 px-3 rounded-lg border border-gray-300 bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
          <button
            type="button"
            disabled={!start || !end}
            onClick={() => onApply?.({ start, end })}
            className="h-8 px-3 rounded-lg bg-primary-600 text-white text-[13px] font-semibold hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

function RangeInput({ label, value, onClear }) {
  return (
    <div className="relative flex-1">
      <input
        readOnly
        value={value}
        placeholder={label}
        className="w-full h-8 rounded-lg border border-gray-300 bg-white px-3 pr-7 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary-600"
      />
      {onClear && (
        <button type="button" onClick={onClear} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <X size={13} />
        </button>
      )}
    </div>
  )
}
