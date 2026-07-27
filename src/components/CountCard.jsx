import { ArrowUp, HelpCircle } from '../icons/index.js'

/**
 * CountCard — the canonical metric / count card.
 *
 * This is the single source of truth for every count card across the app
 * (Site Health, Prompt Tracking, AI Search Performance, AI Rank Tracking,
 * Source Inventory). It mirrors the Site Health overview count card.
 *
 * DO NOT override the fixed typography — keep it consistent everywhere:
 *   - label:      14px, font-medium, gray-500
 *   - value:      24px, font-bold, gray-900
 *   - delta pill: reference green / red pill (12px)
 *
 * Optional extras (icon, description, change text, footer/sparkline) let
 * richer cards reuse the same base without losing their content.
 *
 * Props:
 *   label        string                 — metric label (required)
 *   value        string|number          — the count / value (required)
 *   delta        string|number          — short delta → reference pill (e.g. "1.6%")
 *   deltaUp      boolean (default true)  — pill direction (green up / red down)
 *   changeText   string                  — descriptive change line (e.g. "+6 vs prior period")
 *   changeUp     boolean                 — direction/colour for changeText
 *   description  node                    — muted sub-line under the value
 *   Icon         component               — optional icon → top-right tinted box
 *   iconColor    string (css colour)     — icon colour (default primary-600)
 *   help         boolean                 — show a HelpCircle beside the label
 *   footer       node                    — optional node (e.g. sparkline) pinned below
 *   className    string                  — extra classes on the card wrapper
 */
export default function CountCard({
  label,
  value,
  delta,
  deltaUp = true,
  changeText,
  changeUp = true,
  description,
  Icon,
  iconColor = 'var(--primary-600)',
  help = false,
  footer,
  className = '',
}) {
  return (
    <div
      className={`border border-gray-200 rounded-lg bg-white p-4 flex flex-col gap-2 min-w-0 ${footer ? 'overflow-hidden' : ''} ${className}`}
    >
      {/* Header: label (+ optional help) and optional icon */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <p className="text-[14px] font-medium text-gray-500 leading-tight m-0 truncate">{label}</p>
          {help && <HelpCircle size={13} className="text-gray-300 shrink-0" />}
        </div>
        {Icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `color-mix(in srgb, ${iconColor} 12%, transparent)` }}
          >
            <Icon size={16} style={{ color: iconColor }} />
          </div>
        )}
      </div>

      {/* Value + optional delta pill */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[24px] font-bold text-gray-900 leading-none">{value}</span>
        {delta != null && delta !== '' && (
          <span
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[12px] font-medium leading-none"
            style={{
              background: deltaUp ? 'var(--success-100)' : '#FEE2E2',
              color: deltaUp ? '#15803D' : '#DC2626',
            }}
          >
            <ArrowUp size={10} style={deltaUp ? {} : { transform: 'rotate(180deg)' }} />
            {typeof delta === 'number' ? `${delta}%` : delta}
          </span>
        )}
      </div>

      {/* Descriptive change line (arrow + coloured text) */}
      {changeText && (
        <div className="flex items-center gap-1">
          <ArrowUp
            size={12}
            className={`shrink-0 ${changeUp ? 'text-success-600' : 'text-error-600'}`}
            style={changeUp ? {} : { transform: 'rotate(180deg)' }}
          />
          <span className={`text-[12px] font-medium ${changeUp ? 'text-success-600' : 'text-error-600'}`}>{changeText}</span>
        </div>
      )}

      {/* Muted description */}
      {description && <p className="text-[12px] text-gray-400 leading-snug m-0">{description}</p>}

      {/* Footer (e.g. sparkline) */}
      {footer && <div className="mt-1 w-full">{footer}</div>}
    </div>
  )
}
