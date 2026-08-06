import SectionInfoTip from './SectionInfoTip.jsx'

function RankingBrand({ c }) {
  return (
    <div className="min-w-0 overflow-hidden">
      <p className={`text-[14px] font-medium truncate m-0 ${c.isMe ? 'text-purple-700' : 'text-gray-900'}`}>{c.name}</p>
      <p className="text-[12px] text-gray-400 truncate m-0">{c.domain}</p>
    </div>
  )
}

/** Compact competitor ranking table — single table-fixed layout so headers and cells share column tracks. */
export default function CompetitorRankingMiniTable({ infoId, infoContent, rows }) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white p-4 min-w-0 h-full flex flex-col">
      <div className="flex items-center gap-1.5 mb-4">
        <h3 className="text-[14px] font-semibold text-gray-900 m-0 leading-none">Competitor ranking</h3>
        <SectionInfoTip id={infoId} content={infoContent} />
      </div>
      <div className="rounded-lg border border-gray-200 overflow-hidden min-w-0">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col style={{ width: 36 }} />
            <col />
            <col style={{ width: 52 }} />
            <col style={{ width: 72 }} />
            <col style={{ width: 56 }} />
            <col style={{ width: 52 }} />
          </colgroup>
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-1.5 py-2 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap">Rank</th>
              <th className="px-1.5 py-2 text-left text-[14px] font-semibold text-gray-900 whitespace-nowrap">Brand</th>
              <th className="px-1.5 py-2 text-right text-[14px] font-semibold text-gray-900 whitespace-nowrap">Pos.</th>
              <th className="px-1.5 py-2 text-right text-[14px] font-semibold text-gray-900 whitespace-nowrap">Visibility</th>
              <th className="px-1.5 py-2 text-right text-[14px] font-semibold text-gray-900 whitespace-nowrap">Sent.</th>
              <th className="px-1.5 py-2 text-right text-[14px] font-semibold text-gray-900 whitespace-nowrap">SoV</th>
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
                <td className={`px-1.5 py-2 text-[14px] font-medium text-right tabular-nums align-middle ${c.sentUp ? 'text-success-600' : 'text-error-600'}`}>
                  {c.sent}
                </td>
                <td className="px-1.5 py-2 text-[14px] font-medium text-gray-600 text-right tabular-nums align-middle">{c.sov}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
