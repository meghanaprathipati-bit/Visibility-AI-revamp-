import { useRef, useState } from 'react'

// Shared multi-series trend chart used by Prompt Tracking and AI Search Overview.
// Only the last series gets an under-line gradient. Hover shows metric insight.

function buildTrendInsight(metricLabel, dateLabel, entries) {
  const sorted = [...entries].sort((a, b) => b.value - a.value)
  const leader = sorted[0]
  const ourBrand = entries.find(e => e.label === 'GoHighLevel')
  const gap = ourBrand && leader && leader.label !== ourBrand.label
    ? leader.value - ourBrand.value
    : 0

  const metricNoun =
    metricLabel === 'Mentions' ? 'mention score'
      : metricLabel === 'Citations' ? 'citation score'
        : 'visibility score'

  let insight = `${dateLabel}: ${metricNoun} for each tracked brand (0–100 scale).`
  if (leader) {
    insight += ` ${leader.label} leads at ${leader.value}.`
  }
  if (ourBrand && leader && leader.label !== ourBrand.label && gap > 0) {
    insight += ` GoHighLevel is ${gap} pts behind.`
  } else if (ourBrand && leader && leader.label === ourBrand.label) {
    insight += ` GoHighLevel is the top brand this day.`
  }
  return insight
}

function buildTickIndices(count, target = 7) {
  if (count <= target) return Array.from({ length: count }, (_, i) => i)
  const last = count - 1
  const n = target
  const idx = []
  for (let k = 0; k < n; k++) idx.push(Math.round((k * last) / (n - 1)))
  return idx.filter((v, i) => i === 0 || v !== idx[i - 1])
}

const CHART_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'
const CHART_TRANSITION = `left 0.18s ${CHART_EASE}, top 0.18s ${CHART_EASE}`

export default function MultiLineChart({ lines, xLabels, height = 180, metricLabel = 'Visibility', fill = false }) {
  const wrapRef = useRef(null)
  const [hoverIdx, setHoverIdx] = useState(null)

  const PAD_L = 30, PAD_R = 14, PAD_T = 14, PAD_B = 6
  const VW = 580, VH = height
  const CW = VW - PAD_L - PAD_R
  const CH = VH - PAD_T - PAD_B
  const Y_TICKS = [0, 25, 50, 75, 100]
  const baseline = PAD_T + CH
  const lastLine = lines[lines.length - 1]
  const gradId = 'mlc-grad-last-line'
  const padLPct = (PAD_L / VW) * 100
  const padRPct = (PAD_R / VW) * 100
  const padTPct = (PAD_T / VH) * 100
  const plotHPct = (CH / VH) * 100

  function xP(i) { return PAD_L + (i / Math.max(1, xLabels.length - 1)) * CW }
  function yP(v) { return PAD_T + CH - (v / 100) * CH }
  function xPct(i) { return (xP(i) / VW) * 100 }
  function yPct(v) { return (yP(v) / VH) * 100 }

  function buildAreaPath(data) {
    const pts = data.map((v, i) => ({ x: xP(i), y: yP(v) }))
    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
    return `${line} L${xP(data.length - 1).toFixed(1)},${baseline} L${xP(0).toFixed(1)},${baseline} Z`
  }

  function indexFromClientX(clientX) {
    const el = wrapRef.current
    if (!el) return 0
    const rect = el.getBoundingClientRect()
    const relX = ((clientX - rect.left) / rect.width) * VW
    const t = (relX - PAD_L) / CW
    return Math.max(0, Math.min(xLabels.length - 1, Math.round(t * (xLabels.length - 1))))
  }

  const hoverEntries = hoverIdx == null ? null : lines.map(line => ({
    label: line.label,
    color: line.color,
    value: line.data[hoverIdx],
  }))
  const hoverInsight = hoverEntries
    ? buildTrendInsight(metricLabel, xLabels[hoverIdx], hoverEntries)
    : null

  const hoverXPct = hoverIdx == null ? 0 : xPct(hoverIdx)
  const tipOnLeft = hoverXPct <= 52
  const xTicks = buildTickIndices(xLabels.length, 7)

  return (
    <div className={fill ? 'w-full flex flex-col flex-1 min-h-0' : 'w-full'}>
      <div
        ref={wrapRef}
        className={`relative w-full select-none ${fill ? 'flex-1 min-h-0' : ''}`}
        style={fill ? { minHeight: height } : { height }}
        onMouseMove={e => setHoverIdx(indexFromClientX(e.clientX))}
        onMouseLeave={() => setHoverIdx(null)}
      >
        <div className="absolute inset-y-0 left-0 pointer-events-none" style={{ width: `${padLPct}%` }}>
          {Y_TICKS.map(y => (
            <span
              key={y}
              className="absolute right-1.5 text-[12px] font-normal text-gray-500 tabular-nums leading-none"
              style={{ top: `${padTPct + ((100 - y) / 100) * plotHPct}%`, transform: 'translateY(-50%)' }}
            >
              {y}
            </span>
          ))}
        </div>

        <svg width="100%" height="100%" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" className="block">
          <defs>
            {lastLine && (
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lastLine.color} stopOpacity="0.16" />
                <stop offset="60%" stopColor={lastLine.color} stopOpacity="0.05" />
                <stop offset="100%" stopColor={lastLine.color} stopOpacity="0" />
              </linearGradient>
            )}
          </defs>

          {Y_TICKS.map(y => (
            <line
              key={y}
              x1={PAD_L} y1={yP(y)} x2={VW - PAD_R} y2={yP(y)}
              stroke="var(--gray-100)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {lastLine && <path d={buildAreaPath(lastLine.data)} fill={`url(#${gradId})`} />}

          {lines.map(line => {
            const points = line.data.map((v, i) => `${xP(i).toFixed(1)},${yP(v).toFixed(1)}`).join(' ')
            return (
              <polyline
                key={line.label}
                points={points}
                fill="none"
                stroke={line.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={{ opacity: hoverIdx != null && line !== lastLine ? 0.9 : 1, transition: 'opacity 0.18s ease' }}
              />
            )
          })}
        </svg>

        {hoverIdx != null && (
          <div
            className="absolute pointer-events-none bg-gray-300"
            style={{
              left: `${hoverXPct}%`,
              top: `${padTPct}%`,
              height: `${plotHPct}%`,
              width: 1,
              transform: 'translateX(-0.5px)',
              transition: `left 0.18s ${CHART_EASE}`,
            }}
          />
        )}

        {hoverIdx != null && lines.map(line => (
          <div
            key={`dot-${line.label}`}
            className="absolute rounded-full bg-white pointer-events-none border-2"
            style={{
              left: `${hoverXPct}%`,
              top: `${yPct(line.data[hoverIdx])}%`,
              width: 11,
              height: 11,
              borderColor: line.color,
              transform: 'translate(-50%, -50%)',
              transition: CHART_TRANSITION,
            }}
          />
        ))}

        {hoverIdx != null && hoverEntries && (
          <div
            className="absolute z-20 pointer-events-none w-[208px] rounded-md border border-gray-200 bg-white px-3 py-2.5 shadow-lg"
            style={{
              left: `${hoverXPct}%`,
              top: 6,
              marginLeft: tipOnLeft ? 16 : -16,
              transform: tipOnLeft ? 'none' : 'translateX(-100%)',
              transition: `left 0.18s ${CHART_EASE}`,
            }}
          >
            <p className="text-[14px] font-semibold text-gray-900 m-0 mb-1">{xLabels[hoverIdx]}</p>
            <p className="text-[14px] font-medium text-gray-500 m-0 mb-2">
              {metricLabel === 'Mentions' ? 'Mention score'
                : metricLabel === 'Citations' ? 'Citation score'
                  : 'Visibility score'}
            </p>
            <div className="flex flex-col gap-1 mb-2">
              {hoverEntries.map(e => (
                <div key={e.label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: e.color }} />
                    <span className="text-[14px] font-medium text-gray-700 truncate">{e.label}</span>
                  </div>
                  <span className="text-[14px] font-semibold text-gray-900 tabular-nums">{e.value}</span>
                </div>
              ))}
            </div>
            <p className="text-[14px] font-normal text-gray-500 m-0 leading-snug border-t border-gray-100 pt-2">
              {hoverInsight}
            </p>
          </div>
        )}
      </div>

      <div
        className="relative mt-2 h-4 overflow-visible"
        style={{ paddingLeft: `${padLPct}%`, paddingRight: `${padRPct}%` }}
      >
        {xTicks.map((i, k) => {
          const pct = (k / Math.max(1, xTicks.length - 1)) * 100
          const isFirst = k === 0
          const isLast = k === xTicks.length - 1
          return (
            <span
              key={i}
              className="absolute text-[12px] font-normal text-gray-500 whitespace-nowrap leading-none"
              style={{
                left: `${pct}%`,
                transform: isFirst ? 'none' : isLast ? 'translateX(-100%)' : 'translateX(-50%)',
              }}
            >
              {xLabels[i]}
            </span>
          )
        })}
      </div>
    </div>
  )
}
