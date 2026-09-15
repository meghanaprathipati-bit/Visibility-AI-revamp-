import { ChevronDown } from '../icons/index.js'

/**
 * React mirror of HighRise select sizing — matches HLInput sm
 * (https://highrise.gohighlevel.com/components/data-input/select).
 * Native <select> keeps open/close, keyboard, and option list in the browser.
 */
const SELECT_SM =
  'w-full h-9 px-3 pr-8 rounded-lg border border-gray-300 bg-white text-[14px] text-gray-900 outline-none appearance-none focus:border-primary-600 transition-colors cursor-pointer'

export default function HLSelect({
  id,
  label,
  value,
  onChange,
  options = [],
  disabled = false,
}) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-[14px] font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={e => onChange?.(e.target.value)}
          className={SELECT_SM}
        >
          {options.map(opt => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
