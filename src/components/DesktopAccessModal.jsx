import { useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft, ChevronRight, ChevronDown, Search, Clock, Users,
  Grid3x3, Tablet, FileText, Download, Globe, User, Circle,
  LayoutList, LayoutGrid, ImageIcon,
} from '../icons/index.js'
import { DESKTOP_FILES, SIDEBAR_LOCATIONS } from '../data/desktopFiles.js'

function SidebarIcon({ type, active }) {
  const cls = `shrink-0 ${active ? 'text-white' : 'text-gray-500'}`
  const size = 14
  switch (type) {
    case 'clock': return <Clock size={size} className={cls} />
    case 'users': return <Users size={size} className={cls} />
    case 'grid': return <Grid3x3 size={size} className={cls} />
    case 'tablet': return <Tablet size={size} className={cls} />
    case 'file': return <FileText size={size} className={cls} />
    case 'download': return <Download size={size} className={cls} />
    case 'globe': return <Globe size={size} className={cls} />
    case 'user': return <User size={size} className={cls} />
    case 'drive': return <Circle size={size} className={cls} />
    default: return null
  }
}

function SidebarItem({ item, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 w-full px-2 py-1 rounded-md text-left text-[13px] transition-colors ${
        active
          ? 'bg-primary-600 text-white font-medium'
          : 'text-gray-800 hover:bg-gray-200/70'
      }`}
    >
      <SidebarIcon type={item.icon} active={active} />
      <span className="truncate">{item.label}</span>
    </button>
  )
}

/** macOS-style open file dialog — prototype UI for attachment picker */
export default function DesktopAccessModal({ open, onClose, onOpenFile }) {
  const [activeLocation, setActiveLocation] = useState('desktop')
  const [selectedFileId, setSelectedFileId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      setActiveLocation('desktop')
      setSelectedFileId(null)
      setSearchQuery('')
    }
  }, [open])

  const filteredFiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return DESKTOP_FILES
    return DESKTOP_FILES.filter(f => f.name.toLowerCase().includes(q))
  }, [searchQuery])

  const selectedFile = DESKTOP_FILES.find(f => f.id === selectedFileId)

  function handleOpen() {
    if (!selectedFile) return
    onOpenFile?.(selectedFile)
    onClose()
  }

  if (!open) return null

  const topItems = SIDEBAR_LOCATIONS.filter(i => i.section === 'top')
  const favItems = SIDEBAR_LOCATIONS.filter(i => i.section === 'favourites')
  const locItems = SIDEBAR_LOCATIONS.filter(i => i.section === 'locations')
  const locationLabel = SIDEBAR_LOCATIONS.find(i => i.id === activeLocation)?.label ?? 'Desktop'

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-6"
      onMouseDown={onClose}
    >
      <div className="absolute inset-0 bg-gray-900/40" aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Open file"
        className="relative flex flex-col w-full max-w-[780px] h-[520px] bg-gray-100 rounded-xl shadow-2xl overflow-hidden border border-gray-300/80"
        onMouseDown={e => e.stopPropagation()}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 border-b border-gray-300/60 shrink-0">
          <div className="flex items-center gap-0.5">
            <button type="button" disabled className="w-7 h-7 flex items-center justify-center rounded text-gray-300">
              <ChevronLeft size={15} />
            </button>
            <button type="button" disabled className="w-7 h-7 flex items-center justify-center rounded text-gray-300">
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button type="button" className="flex items-center gap-1 h-7 px-2 rounded-md bg-white/80 border border-gray-300/80 text-[12px] text-gray-700">
              <LayoutList size={13} className="text-gray-500" />
              <ChevronDown size={11} className="text-gray-400" />
            </button>
            <button type="button" className="flex items-center gap-1 h-7 px-2 rounded-md bg-white/80 border border-gray-300/80 text-[12px] text-gray-700">
              <LayoutGrid size={13} className="text-gray-500" />
              <ChevronDown size={11} className="text-gray-400" />
            </button>
          </div>

          <button
            type="button"
            className="flex items-center gap-1.5 h-7 px-3 mx-auto rounded-md bg-white/80 border border-gray-300/80 text-[13px] font-medium text-gray-800"
          >
            <Tablet size={14} className="text-primary-600" />
            {locationLabel === 'meghanaprathipati...' ? 'Desktop' : locationLabel}
            <ChevronDown size={12} className="text-gray-400" />
          </button>

          <div className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-white/80 border border-gray-300/80 min-w-[140px] ml-auto">
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="flex-1 min-w-0 text-[12px] text-gray-900 placeholder:text-gray-400 bg-transparent outline-none"
            />
          </div>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <aside className="w-[168px] shrink-0 bg-gray-100 border-r border-gray-300/60 overflow-y-auto py-2 px-2 scrollbar-gray-300">
            <div className="space-y-0.5 mb-3">
              {topItems.map(item => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  active={activeLocation === item.id}
                  onClick={() => { setActiveLocation(item.id); setSelectedFileId(null) }}
                />
              ))}
            </div>

            <p className="px-2 pt-1 pb-1 text-[11px] font-semibold text-gray-500">Favourites</p>
            <div className="space-y-0.5 mb-3">
              {favItems.map(item => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  active={activeLocation === item.id}
                  onClick={() => { setActiveLocation(item.id); setSelectedFileId(null) }}
                />
              ))}
            </div>

            <p className="px-2 pt-1 pb-1 text-[11px] font-semibold text-gray-500">Locations</p>
            <div className="space-y-0.5 mb-3">
              {locItems.map(item => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  active={activeLocation === item.id}
                  onClick={() => { setActiveLocation(item.id); setSelectedFileId(null) }}
                />
              ))}
            </div>

            <p className="px-2 pt-1 pb-1 text-[11px] font-semibold text-gray-500">Tags</p>
            <button
              type="button"
              className="flex items-center gap-2 w-full px-2 py-1 rounded-md text-left text-[13px] text-gray-800 hover:bg-gray-200/70"
            >
              <Circle size={10} className="text-error-600 fill-error-600 shrink-0" />
              Red
            </button>
          </aside>

          {/* File browser — column view */}
          <div className="flex flex-1 min-w-0 bg-white">
            <div className="w-[240px] shrink-0 border-r border-gray-200 overflow-y-auto scrollbar-gray-300">
              {filteredFiles.map(file => {
                const isSelected = file.id === selectedFileId
                return (
                  <button
                    key={file.id}
                    type="button"
                    onClick={() => setSelectedFileId(file.id)}
                    onDoubleClick={() => {
                      onOpenFile?.(file)
                      onClose()
                    }}
                    className={`flex items-center gap-2 w-full px-3 py-1.5 text-left text-[13px] transition-colors ${
                      isSelected ? 'bg-primary-600 text-white' : 'text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    <ImageIcon size={14} className={`shrink-0 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                    <span className="truncate">{file.name}</span>
                  </button>
                )
              })}
            </div>

            {/* Preview pane */}
            <div className="flex-1 flex items-center justify-center bg-white min-w-0">
              {selectedFile ? (
                <div className="flex flex-col items-center gap-3 px-6 text-center">
                  <div className="w-32 h-24 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                    <ImageIcon size={32} className="text-gray-300" />
                  </div>
                  <p className="text-[13px] font-medium text-gray-900 max-w-[220px] truncate">{selectedFile.name}</p>
                  <p className="text-[11px] text-gray-500">PNG image</p>
                </div>
              ) : (
                <p className="text-[13px] text-gray-400">Select a file to preview</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-t border-gray-300/60 shrink-0">
          <button
            type="button"
            className="h-8 px-3 rounded-md border border-gray-300/80 bg-white/90 text-[13px] font-medium text-gray-700 hover:bg-white transition-colors"
          >
            Show Options
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-4 rounded-md border border-gray-300/80 bg-white/90 text-[13px] font-medium text-gray-700 hover:bg-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleOpen}
              disabled={!selectedFile}
              className="h-8 px-4 rounded-md border border-gray-300/80 bg-white/90 text-[13px] font-medium text-gray-700 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Open
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
