import { useState, useEffect } from 'react'
import { X, Sparkles, Copy, HelpCircle, BookOpen, Users, Megaphone, Calendar, Phone, ChevronRight, ExternalLink } from 'lucide-react'

const ENTER_MS = 280
const EXIT_MS = 220
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)'

const HELP_LINKS = [
  {
    id: 'help-center',
    icon: HelpCircle,
    iconBg: 'bg-warning-light',
    iconColor: 'text-warning',
    title: 'Visit our Help Center',
    description: 'View your support tickets, our support articles and helpful FAQs!',
  },
  {
    id: 'courses',
    icon: BookOpen,
    iconBg: 'bg-hl-blue-light',
    iconColor: 'text-hl-blue',
    title: 'Courses',
    description: 'Browse a library of courses in our University.',
  },
  {
    id: 'facebook',
    icon: Users,
    iconBg: 'bg-hl-blue-light',
    iconColor: 'text-hl-blue',
    title: 'Join our Facebook Group',
    description: 'Be part of the fastest growing community.',
  },
  {
    id: 'announcements',
    icon: Megaphone,
    iconBg: 'bg-negative-light',
    iconColor: 'text-negative',
    title: 'Announcements',
    description: 'Keep up to date with all the latest news & releases!',
  },
  {
    id: 'events',
    icon: Calendar,
    iconBg: 'bg-positive-light',
    iconColor: 'text-positive',
    title: 'Events',
    description: 'Daily brainstorming sessions with our team.',
  },
  {
    id: 'contact',
    icon: Phone,
    iconBg: 'bg-hl-blue-light',
    iconColor: 'text-hl-blue',
    title: 'Contact Us',
    description: 'Call us at +1(888)732-4197',
  },
]

export default function HelpDrawer({ onClose }) {
  const [copied, setCopied] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  function copyRelNumber() {
    navigator.clipboard.writeText('0-034-522')
    setCopied(true)
  }

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, EXIT_MS)
  }

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
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div className="flex flex-col gap-1">
            <span className="text-[16px] font-semibold text-gray-900">Help & Support</span>
            <p className="text-[13px] text-gray-500 leading-[1.5] max-w-[280px]">
              Whether you want to talk to us, the community, or learn on your own, we've got you covered!
            </p>
          </div>
          <button
            onClick={handleClose}
            className="size-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Relationship Number */}
        <div className="flex items-center gap-2 px-5 pb-4">
          <span className="text-[13px] font-semibold text-gray-900">Relationship Number</span>
          <HelpCircle size={14} className="text-gray-400" />
          <span className="text-[13px] text-gray-500">0-034-522</span>
          <button onClick={copyRelNumber} className="text-gray-400 hover:text-gray-600 transition-colors">
            <Copy size={13} />
          </button>
          {copied && <span className="text-[12px] text-positive">Copied!</span>}
        </div>

        {/* AI Support Assistant */}
        <div className="mx-5 mb-4 flex items-center justify-between px-4 py-3 rounded-lg bg-accent-purple-light border border-accent-purple-border cursor-pointer hover:bg-accent-purple-border transition-colors">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-accent-purple" />
            <span className="text-[14px] font-medium text-gray-700">AI Support Assistant</span>
            <span className="px-2 py-0.5 rounded-full bg-white border border-accent-purple-border text-[11px] font-medium text-accent-purple">Beta</span>
          </div>
          <ChevronRight size={15} className="text-accent-purple" />
        </div>

        <div className="h-px bg-gray-200 mx-5" />

        {/* Highly mascot */}
        <div className="flex flex-col items-center gap-3 px-5 py-5">
          <div className="size-16 rounded-full bg-gradient-to-br from-hl-yellow via-hl-teal to-accent-purple flex items-center justify-center shadow-md">
            <span className="text-[24px] font-bold text-white">H</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[16px] font-semibold text-gray-900">Hi, I'm Highly!</span>
            <span className="text-[13px] text-gray-500">Your Priority Support Specialist</span>
          </div>
          <p className="text-[13px] font-semibold text-gray-700 text-center">
            Use any of the buttons below to get help!
          </p>
          <div className="flex gap-2 w-full">
            <button className="flex-1 py-2 rounded-lg bg-hl-blue text-white text-[14px] font-semibold hover:bg-hl-blue-dark transition-colors">
              Start Zoom
            </button>
            <button className="flex-1 py-2 rounded-lg bg-hl-blue text-white text-[14px] font-semibold hover:bg-hl-blue-dark transition-colors flex items-center justify-center gap-1">
              Start Chat <ChevronRight size={12} />
            </button>
            <button className="flex-1 py-2 rounded-lg bg-hl-blue text-white text-[14px] font-semibold hover:bg-hl-blue-dark transition-colors">
              Raise Ticket
            </button>
          </div>
        </div>

        <div className="h-px bg-gray-200" />

        {/* Help links */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
          {HELP_LINKS.map(link => {
            const Icon = link.icon
            return (
              <button
                key={link.id}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${link.iconBg}`}>
                  <Icon size={18} className={link.iconColor} />
                </div>
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px] font-semibold text-gray-900">{link.title}</span>
                    <ExternalLink size={12} className="text-gray-400" />
                  </div>
                  <span className="text-[13px] text-gray-500 leading-[1.4]">{link.description}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
