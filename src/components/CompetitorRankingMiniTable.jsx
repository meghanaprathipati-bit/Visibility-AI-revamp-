import SectionInfoTip from './SectionInfoTip.jsx'

function RankingBrand({ c }) {
  return (
    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
      {c.initials && (
        <span
          className="w-7 h-7 rounded-full shrink-0 inline-flex items-center justify-center text-[12px] font-semibold text-white"
          style={{ background: c.color || 'var(--gray-400)' }}
        >
          {c.initials}
        </span>
      )}
      <div className="min-w-0 overflow-hidden">
        <p className={`text-[14px] font-medium truncate m-0 ${c.isMe ? 'text-purple-700' : 'text-gray-900'}`}>{c.name}</p>
        <p className="text-[12px] text-gray-500 truncate m-0">{c.domain}</p>
      </div>
    </div>
  )
}

/** Compact competitor ranking table — single table-fixed layout so headers and cells share column tracks. */
export default function CompetitorRankingMiniTable({
  infoId,
  infoContent,
  rows,
  title = 'Competitor ranking',
  subtitle,
  headerRight,
  showSentiment = true,
  brandLabel = 'Brand',
  posLabel = 'Pos.',
  plain = false,
}) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white p-4 min-w-0 h-full flex flex-col shrink-0">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-[14px] font-semibold text-gray-900 m-0 leading-none">{title}</h3>
            <SectionInfoTip id={infoId} content={infoContent} />
          </div>
          {subtitle && <p className="text-[13px] font-normal text-gray-500 m-0 mt-0.5">{subtitle}</p>}
        </div>
        {headerRight && <div className="shrink-0 pt-0.5">{headerRight}</div>}
      </div>
      <div className={`min-w-0 bg-white ${plain ? '' : 'rounded-lg border border-gray-200 overflow-hidden'}`}>
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col style={{ width: 36 }} />
            <col />
            <col style={{ width: 88 }} />
            <col style={{ width: 72 }} />
            {showSentiment && <col style={{ width: 56 }} />}
            <col style={{ width: 52 }} />
          </colgroup>
          <thead>
            <tr className={`${plain ? 'border-b border-gray-200' : 'bg-gray-50 border-b border-gray-200'}`}>
              <th className="px-1.5 py-2 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap">Rank</th>
              <th className="px-1.5 py-2 text-left text-[12px] font-semibold text-gray-900 whitespace-nowrap">{brandLabel}</th>
              <th className="px-1.5 py-2 text-right text-[12px] font-semibold text-gray-900 whitespace-nowrap">{posLabel}</th>
              <th className="px-1.5 py-2 text-right text-[12px] font-semibold text-gray-900 whitespace-nowrap">Visibility</th>
              {showSentiment && (
                <th className="px-1.5 py-2 text-right text-[12px] font-semibold text-gray-900 whitespace-nowrap">Sent.</th>
              )}
              <th className="px-1.5 py-2 text-right text-[12px] font-semibold text-gray-900 whitespace-nowrap">SoV</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(c => (
              <tr
                key={c.rank}
                className={`border-b border-gray-100 last:border-b-0 transition-colors ${
                  c.isMe ? 'bg-purple-50' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <td className="px-1.5 py-2 text-[14px] font-medium text-gray-500 whitespace-nowrap align-middle">#{c.rank}</td>
                <td className="px-1.5 py-2 min-w-0 overflow-hidden align-middle">
                  <RankingBrand c={c} />
                </td>
                <td className="px-1.5 py-2 text-[14px] font-medium text-gray-600 text-right tabular-nums align-middle">{c.pos}</td>
                <td className="px-1.5 py-2 text-[14px] font-medium text-gray-900 text-right tabular-nums align-middle">{c.visibility}</td>
                {showSentiment && (
                  <td className={`px-1.5 py-2 text-[14px] font-medium text-right tabular-nums align-middle ${c.sentUp ? 'text-success-600' : 'text-error-600'}`}>
                    {c.sent}
                  </td>
                )}
                <td className="px-1.5 py-2 text-[14px] font-medium text-gray-600 text-right tabular-nums align-middle">{c.sov}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
