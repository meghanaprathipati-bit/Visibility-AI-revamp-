import { useState, useEffect } from 'react'
import { Search, ArrowLeft, Pin } from 'lucide-react'

const ENTER_MS = 200
const EXIT_MS = 150
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'

const RECENT_ACCOUNTS = [
  { id: 1, name: 'Conor Consulting Group', address: 'PVR Gardens Road, Hyderabad, Telangana', active: true },
  { id: 2, name: 'Bluepeak Marketing Agency', address: '1801 N. Lamar, Suite 250, Dallas, TX', active: false },
]

const ALL_ACCOUNTS = [
  { id: 2, name: 'Bluepeak Marketing Agency', address: '1801 N. Lamar, Suite 250, Dallas, TX', pinned: true },
  { id: 1, name: 'Conor Consulting Group', address: 'PVR Gardens Road, Hyderabad, Telangana', pinned: true },
  { id: 3, name: 'Abhishek Chauhan 123', address: 'Mumbai, Maharashtra', pinned: false },
  { id: 4, name: "Richa's Kickboxing Studio", address: 'Los Angeles, CA', pinned: false },
  { id: 5, name: 'TechStart Labs', address: 'Austin, TX', pinned: false },
]

function AccountCard({ account, active, showPin }) {
  const initial = account.name.replace(/[^a-zA-Z]/g, '')[0]?.toUpperCase() ?? '?'
  return (
    <div className={`flex items-center gap-3 px-3 py-3 rounded-lg border cursor-pointer transition-colors ${
      active ? 'border-hl-blue bg-hl-blue-light' : 'border-gray-200 hover:bg-gray-50'
    }`}>
      <div className="size-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        <span className="text-[13px] font-semibold text-gray-700">{initial}</span>
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-[14px] font-medium text-gray-900 truncate">{account.name}</span>
        <span className="text-[13px] text-gray-500 truncate">{account.address}</span>
      </div>
      {showPin && (
        <Pin size={15} className={account.pinned ? 'text-hl-blue fill-hl-blue' : 'text-gray-300'} />
      )}
    </div>
  )
}

export default function SubAccountSwitcher({ onClose, sidebarWidth = 280 }) {
  const [query, setQuery] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, EXIT_MS)
  }

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const filtered = query.trim()
    ? ALL_ACCOUNTS.filter(a => a.name.toLowerCase().includes(query.toLowerCase()))
    : null

  const transitionMs = visible ? ENTER_MS : EXIT_MS

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={handleClose} />
      <div
        className="fixed z-50 bg-white rounded-xl shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)] border border-gray-200 flex flex-col overflow-hidden origin-top-left"
        style={{
          left: sidebarWidth + 8,
          top: 60,
          width: 400,
          maxHeight: 'calc(100vh - 80px)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateX(0) scale(1)' : 'translateX(-8px) scale(0.98)',
          transition: `opacity ${transitionMs}ms ${EASE}, transform ${transitionMs}ms ${EASE}`,
        }}
      >
        {/* Search */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:border-hl-blue transition-colors">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for a sub-account"
              className="flex-1 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Switch to Agency View */}
        <button className="flex items-center gap-3 px-4 py-3 text-hl-blue hover:bg-hl-blue-light transition-colors border-b border-gray-200">
          <div className="size-7 rounded-full bg-hl-blue-light flex items-center justify-center">
            <ArrowLeft size={14} className="text-hl-blue" />
          </div>
          <span className="text-[14px] font-medium">Switch to Agency View</span>
        </button>

        {/* Content */}
        <div className="flex flex-col overflow-y-auto">
          {filtered ? (
            <div className="flex flex-col gap-2 p-3">
              {filtered.length === 0 ? (
                <p className="text-[13px] text-gray-500 text-center py-6">No accounts found</p>
              ) : (
                filtered.map(a => (
                  <AccountCard key={a.id} account={a} active={a.id === 1} showPin />
                ))
              )}
            </div>
          ) : (
            <>
              <div className="px-4 pt-4 pb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Recent</span>
              </div>
              <div className="flex flex-col gap-2 px-3 pb-3">
                {RECENT_ACCOUNTS.map(a => (
                  <AccountCard key={a.id} account={a} active={a.active} showPin={false} />
                ))}
              </div>

              <div className="h-px bg-gray-200" />

              <div className="px-4 pt-4 pb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">All Accounts</span>
              </div>
              <div className="flex flex-col gap-2 px-3 pb-3">
                {ALL_ACCOUNTS.map(a => (
                  <AccountCard key={a.id} account={a} active={a.id === 1} showPin />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
