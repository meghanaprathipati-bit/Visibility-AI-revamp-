import { useMemo, useState } from 'react'
import SectionInfoTip from '../SectionInfoTip.jsx'
import { CITATIONS_TIME_SERIES } from '../../data/aiRankDashboard.js'

const SERIES_OPTIONS = [
  { key: 'visibility', label: 'Visibility' },
  { key: 'mentions', label: 'Mentions' },
  { key: 'citations', label: 'Citations' },
]

const RANGE_OPTIONS = [
  { key: '3m', months: 3, label: '3M' },
  { key: '6m', months: 6, label: '6M' },
  { key: '1y', months: 12, label: '1Y' },
]

function filterByRange(data, months) {
  return data.slice(-months)
}

function toCoords(points, width, height, maxY, padding) {
  const innerW = width - padding * 2
  const innerH = height - padding * 2
  const xStep = innerW / (points.length - 1)
  return points.map((p, i) => {
    const x = padding + i * xStep
    const y = padding + innerH - (p.value / maxY) * innerH
    return [x, y]
  })
}

function buildLinePath(coords) {
  return coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')
}

function buildAreaPath(coords, baseY) {
  if (coords.length < 2) return ''
  const line = buildLinePath(coords)
  const areaClose = `L ${coords[coords.length - 1][0]} ${baseY} L ${coords[0][0]} ${baseY} Z`
  return `${line} ${areaClose}`
}

/** Area line chart — citations / visibility / mentions trend */
export default function CitationsTrendChart() {
  const [activeSeries, setActiveSeries] = useState('citations')
  const [activeRange, setActiveRange] = useState('1y')

  const rangeMonths = RANGE_OPTIONS.find(r => r.key === activeRange)?.months ?? 12
  const rawData = CITATIONS_TIME_SERIES[activeSeries]
  const data = useMemo(() => filterByRange(rawData, rangeMonths), [rawData, rangeMonths])

  const maxY = useMemo(() => Math.max(...data.map(d => d.value)) * 1.15, [data])
  const width = 560
  const height = 220
  const padding = 24
  const innerH = height - padding * 2
  const baseY = padding + innerH
  const coords = useMemo(
    () => (data.length >= 2 ? toCoords(data, width, height, maxY, padding) : []),
    [data, maxY]
  )
  const areaPath = buildAreaPath(coords, baseY)
  const linePath = buildLinePath(coords)
  const xStep = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-[14px] font-semibold text-gray-900">Citations trend</h3>
            <SectionInfoTip
              id="citations-trend-info"
              content="Track visibility, mentions, and citations over time"
            />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-1">
            {SERIES_OPTIONS.map(opt => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setActiveSeries(opt.key)}
                className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors ${
                  activeSeries === opt.key
                    ? 'bg-primary-50 text-primary-600 border border-primary-200'
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {RANGE_OPTIONS.map(opt => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setActiveRange(opt.key)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeRange === opt.key
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label={`${activeSeries} trend chart`}>
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const y = padding + innerH * (1 - t)
          return (
            <line key={t} x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--gray-100)" strokeWidth="1" strokeDasharray="4 4" />
          )
        })}
        <path d={areaPath} fill="var(--primary-50)" stroke="none" />
        <path d={linePath} fill="none" stroke="var(--primary-600)" strokeWidth="2.5" strokeLinejoin="round" />
        {data.map((p, i) => {
          const x = padding + i * xStep
          const y = padding + innerH - (p.value / maxY) * innerH
          return <circle key={p.date} cx={x} cy={y} r="4" fill="var(--primary-600)" />
        })}
      </svg>

      <div className="flex justify-between mt-2 px-1">
        {data.filter((_, i) => i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)).map(p => (
          <span key={p.date} className="text-[11px] text-gray-500">
            {new Date(`${p.date}-01`).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
          </span>
        ))}
      </div>
    </div>
  )
}
