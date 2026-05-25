import { useState, useEffect } from 'react'
import { X, Bell, Paperclip, Settings, AlertTriangle } from 'lucide-react'

const ENTER_MS = 280
const EXIT_MS = 220
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'

const AVATAR_COLORS = [
  'bg-hl-blue-light text-hl-blue',
  'bg-accent-purple-light text-accent-purple',
  'bg-positive-light text-positive',
  'bg-warning-light text-warning',
]

const TABS = ['All', 'Alerts', 'Archive']

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    initials: 'RC',
    colorIdx: 0,
    online: true,
    name: 'Rachel Chen',
    action: 'joined your sub-account',
    context: 'Social Listening',
    time: '2h ago',
    read: false,
  },
  {
    id: 2,
    initials: 'MK',
    colorIdx: 1,
    online: false,
    name: 'Mike Kumar',
    action: 'is requesting admin access',
    context: 'Kickboxing Studio',
    time: '4h ago',
    read: false,
    actions: true,
  },
  {
    id: 3,
    initials: 'SL',
    colorIdx: 2,
    online: false,
    name: 'Sara Liu',
    action: 'uploaded a contact list',
    context: 'Fitness Studio',
    time: '1d ago',
    read: false,
    attachment: { name: 'contacts_export.csv', size: '2.4 MB' },
  },
  {
    id: 4,
    initials: 'JB',
    colorIdx: 3,
    online: false,
    name: 'James Brown',
    action: 'updated the funnel settings',
    context: 'Main Account',
    time: '2d ago',
    read: true,
  },
  {
    id: 5,
    initials: 'AP',
    colorIdx: 0,
    online: false,
    name: 'Amy Park',
    action: 'commented on your campaign',
    context: 'Newsletter',
    time: '3d ago',
    read: true,
    snippet: "Looks great! Can we also add a follow-up sequence for new leads?",
  },
]

const MOCK_ALERTS = [
  {
    id: 'a1',
    severity: 'error',
    title: 'Payment method is missing',
    body: "Please add your client's card to avoid service interruption.",
    cta: 'Resolve',
    time: '1h ago',
    read: false,
  },
  {
    id: 'a2',
    severity: 'warning',
    title: 'New tax categories available',
    body: 'Unlock new tax categories and global taxes — reconfigure automatic taxes by 1st Sept, 2026.',
    cta: 'Reconfigure Taxes',
    time: '3h ago',
    read: false,
  },
  {
    id: 'a3',
    severity: 'warning',
    title: 'Billing address is missing',
    body: 'Please add it in your billing dashboard under the payments tab.',
    cta: 'Update',
    time: '1d ago',
    read: true,
  },
]

const EMPTY_COPY = {
  All: { title: 'All caught up', body: 'New notifications will show up here.' },
  Alerts: { title: 'No alerts right now', body: "We'll let you know when something needs attention." },
  Archive: { title: 'Nothing in your archive', body: 'Notifications you archive will live here.' },
}

function EmptyState({ tab }) {
  const copy = EMPTY_COPY[tab] ?? EMPTY_COPY.All
  return (
    <div className="flex flex-col items-center gap-3 py-16 px-6">
      <div className="size-12 rounded-xl bg-gray-100 flex items-center justify-center">
        <Bell size={20} className="text-gray-400" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-[14px] font-semibold text-gray-900">{copy.title}</span>
        <span className="text-[13px] text-gray-500 text-center">{copy.body}</span>
      </div>
    </div>
  )
}

function Avatar({ initials, colorIdx, online }) {
  return (
    <div className="relative shrink-0">
      <div className={`size-10 rounded-full flex items-center justify-center text-[13px] font-semibold ${AVATAR_COLORS[colorIdx % AVATAR_COLORS.length]}`}>
        {initials}
      </div>
      {online && (
        <div className="absolute bottom-0 right-0 size-2.5 rounded-full bg-positive border-2 border-white" />
      )}
    </div>
  )
}

function AlertIcon({ severity }) {
  return (
    <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${
      severity === 'error' ? 'bg-negative-light text-negative' : 'bg-warning-light text-warning'
    }`}>
      <AlertTriangle size={16} />
    </div>
  )
}

export default function NotificationsDrawer({ onClose }) {
  const [activeTab, setActiveTab] = useState('All')
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [alerts, setAlerts] = useState(MOCK_ALERTS)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, EXIT_MS)
  }

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setAlerts(prev => prev.map(a => ({ ...a, read: true })))
  }

  function handleAction(id, accepted) {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id
          ? { ...n, read: true, actions: false, actionResult: accepted ? 'Accepted' : 'Declined' }
          : n
      )
    )
  }

  const unreadNotifCount = notifications.filter(n => !n.read).length
  const unreadAlertCount = alerts.filter(a => !a.read).length

  const tabCounts = { All: unreadNotifCount, Alerts: unreadAlertCount, Archive: 0 }

  const visibleNotifs = activeTab === 'All' ? notifications : []
  const visibleAlerts = activeTab === 'Alerts' ? alerts : []
  const isEmpty = visibleNotifs.length === 0 && visibleAlerts.length === 0

  const transitionMs = visible ? ENTER_MS : EXIT_MS

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/20"
        style={{ opacity: visible ? 1 : 0, transition: `opacity ${transitionMs}ms ${EASE}` }}
        onClick={handleClose}
      />
      <div
        className="relative w-[400px] h-full bg-white shadow-xl flex flex-col"
        style={{
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: `transform ${transitionMs}ms ${EASE}`,
        }}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <span className="text-[16px] font-semibold text-gray-900">Notifications</span>
          <div className="flex items-center gap-3">
            <button
              onClick={markAllRead}
              className="text-[13px] font-medium text-gray-500 hover:text-gray-700 transition-colors underline underline-offset-2"
            >
              Mark all as read
            </button>
            <button
              onClick={handleClose}
              className="size-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 px-5">
          <div className="flex flex-1">
            {TABS.map(tab => {
              const count = tabCounts[tab]
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 py-3 mr-5 text-[14px] font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-hl-blue text-hl-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                  {count > 0 && (
                    <span className="min-w-[20px] h-5 rounded-full bg-hl-blue text-white text-[12px] font-semibold flex items-center justify-center px-1.5">
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <button className="size-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
            <Settings size={15} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            <EmptyState tab={activeTab} />
          ) : (
            <div className="divide-y divide-gray-100">
              {visibleNotifs.map(n => (
                <div
                  key={n.id}
                  className={`flex gap-3 px-5 py-4 cursor-pointer transition-colors ${
                    n.read ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <Avatar initials={n.initials} colorIdx={n.colorIdx} online={n.online} />
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <p className="text-[14px] leading-snug text-gray-600">
                      <span className="font-semibold text-gray-900">{n.name}</span>
                      {' '}{n.action}
                    </p>
                    <span className="text-[12px] text-gray-400">{n.time} · {n.context}</span>
                    {n.snippet && (
                      <p className="text-[13px] text-gray-500 leading-[1.4] bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                        {n.snippet}
                      </p>
                    )}
                    {n.attachment && (
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                        <Paperclip size={13} className="text-gray-400 shrink-0" />
                        <span className="text-[13px] text-gray-600 font-medium truncate">{n.attachment.name}</span>
                        <span className="text-[12px] text-gray-400 shrink-0">{n.attachment.size}</span>
                      </div>
                    )}
                    {n.actions && !n.actionResult && (
                      <div className="flex gap-2 mt-0.5">
                        <button
                          onClick={e => { e.stopPropagation(); handleAction(n.id, true) }}
                          className="px-3 py-1.5 rounded-lg border border-hl-blue text-hl-blue text-[13px] font-medium hover:bg-hl-blue-light transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleAction(n.id, false) }}
                          className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-[13px] font-medium hover:bg-gray-50 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    {n.actionResult && (
                      <span className={`text-[12px] font-medium ${n.actionResult === 'Accepted' ? 'text-positive' : 'text-gray-400'}`}>
                        {n.actionResult}
                      </span>
                    )}
                  </div>
                  {!n.read && <div className="size-2 rounded-full bg-hl-blue shrink-0 mt-2" />}
                </div>
              ))}

              {visibleAlerts.map(a => (
                <div
                  key={a.id}
                  className={`flex gap-3 px-5 py-4 cursor-pointer transition-colors ${
                    a.read ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <AlertIcon severity={a.severity} />
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-gray-900 leading-snug">{a.title}</p>
                    <p className="text-[13px] text-gray-500 leading-[1.4]">{a.body}</p>
                    <span className="text-[12px] text-gray-400">System Alert · {a.time}</span>
                    <div className="mt-0.5">
                      <button
                        onClick={e => e.stopPropagation()}
                        className="px-3 py-1.5 rounded-lg border border-hl-blue text-hl-blue text-[13px] font-medium hover:bg-hl-blue-light transition-colors"
                      >
                        {a.cta}
                      </button>
                    </div>
                  </div>
                  {!a.read && <div className="size-2 rounded-full bg-hl-blue shrink-0 mt-2" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
