import { ArrowUp, Info } from '../icons/index.js'
import HLTooltip from './HLTooltip.jsx'

/**
 * CountCard — the canonical metric / count card.
 *
 * This is the single source of truth for every count card across the app
 * (Site Health, Prompt Tracking, AI Search Performance, AI Rank Tracking,
 * Source Inventory). Keep typography locked so every usage stays consistent:
 *   - label:      14px, font-medium, gray-500
 *   - value:      24px, font-bold, gray-900
 *   - delta pill: reference green / red pill (12px)
 *
 * Optional extras (icon, description, change text, footer/sparkline) let
 * richer cards reuse the same base without losing their content.
 * Prefer help + helpContent over description for explanatory copy.
 *
 * Props:
 *   label        string                 — metric label (required)
 *   value        string|number          — the count / value (omit to hide the value row)
 *   delta        string|number          — short delta → reference pill (e.g. "1.6%")
 *   deltaUp      boolean (default true)  — pill direction (green up / red down)
 *   changeText   string                  — descriptive change line (e.g. "+6 vs prior period")
 *   changeUp     boolean                 — direction/colour for changeText
 *   description  node                    — muted sub-line under the value (prefer helpContent)
 *   valueAside   node                    — sits beside the value (e.g. Good / Average rating)
 *   Icon         component               — optional icon → top-right tinted box
 *   iconColor    string (css colour)     — icon colour (default primary-600)
 *   help         boolean                 — show an Info icon beside the label
 *   helpContent  string                  — tooltip text (also implies help when set)
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
  valueAside,
  Icon,
  iconColor = 'var(--primary-600)',
  help = false,
  helpContent,
  footer,
  className = '',
}) {
  const showHelp = help || Boolean(helpContent)
  const helpIcon = showHelp && (
    helpContent ? (
      <HLTooltip content={helpContent} variant="dark" placement="top" wrap>
        <Info size={12} className="text-gray-500 shrink-0 cursor-help" aria-label="More information" />
      </HLTooltip>
    ) : (
      <Info size={12} className="text-gray-500 shrink-0" aria-hidden="true" />
    )
  )

  return (
    <div
      className={`border border-gray-200 rounded-md bg-white px-3.5 py-3.5 flex flex-col gap-2 min-w-0 ${footer ? 'overflow-hidden' : ''} ${className}`}
    >
      {/* Header: label (+ optional help) and optional icon */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1 min-w-0">
          <p className="text-[14px] font-medium text-gray-500 leading-tight m-0 truncate">{label}</p>
          {helpIcon}
        </div>
        {Icon && (
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
            style={{ background: `color-mix(in srgb, ${iconColor} 12%, transparent)` }}
          >
            <Icon size={12} style={{ color: iconColor }} />
          </div>
        )}
      </div>

      {/* Value + optional aside / delta pill — skipped when value is omitted (e.g. chart-only cards) */}
      {value != null && value !== '' && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[24px] font-bold text-gray-900 leading-none tabular-nums">{value}</span>
          {valueAside}
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
      )}

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
      {description && <p className="text-[12px] text-gray-500 leading-snug m-0">{description}</p>}

      {/* Footer (e.g. sparkline) */}
      {footer && <div className="mt-0.5 w-full">{footer}</div>}
    </div>
  )
}
