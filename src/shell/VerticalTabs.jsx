export default function VerticalTabs({ tabs, activeTab, onTabChange, label, className = '' }) {
  return (
    <aside className={`flex flex-col w-[200px] shrink-0 overflow-y-auto ${className}`}>
      {label && (
        <div className="px-4 pt-4 pb-2">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-[#98A2B3]">{label}</span>
        </div>
      )}
      <div className="flex flex-col gap-2 p-4">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`text-left px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors ${
              activeTab === tab
                ? 'bg-[#EEF4FF] text-[#155EEF]'
                : 'text-[#667085] hover:text-[#101828] hover:bg-white/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </aside>
  )
}
