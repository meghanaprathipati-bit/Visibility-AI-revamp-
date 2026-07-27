/**
 * VisibilityMeter — the single, canonical way to render a "visibility" value
 * (a 0–100 score) as a number + slim bar across every dashboard and table.
 *
 * The number and bar are colour-coded by the HEALTH of the value, never a flat
 * blue, so the colour itself communicates whether the score is strong/mid/weak:
 *   - >= 70  green  (success-600)
 *   - 40–69  amber  (warning-600)
 *   - < 40   red    (error-600)
 *
 * Layout is fixed for consistency: bold number on top, slim h-1.5 bar below on a
 * gray-100 track. Do not fork these styles per usage.
 *
 * Props:
 *   value    number            — the visibility score (0–100), required
 *   max      number            — scale max (default 100)
 *   suffix   string            — optional text after the number (e.g. "/100")
 *   barWidth string            — optional max width for the bar (default 120px)
 *   className string           — optional wrapper classes
 */

export function visibilityColor(value) {
  if (value >= 70) return 'var(--success-600)'
  if (value >= 40) return 'var(--warning-600)'
  return 'var(--error-600)'
}

export default function VisibilityMeter({ value, max = 100, suffix = '', barWidth = '120px', className = '' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const color = visibilityColor((value / max) * 100)
  return (
    <div className={className}>
      <p className="text-[16px] font-semibold leading-none mb-1.5 m-0 tabular-nums" style={{ color }}>
        {value}{suffix}
      </p>
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden" style={{ maxWidth: barWidth }}>
        <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
