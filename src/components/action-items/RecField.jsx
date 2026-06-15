import { useState } from 'react'
import { Pencil } from '../../icons/index.js'

function HrButton({ variant = 'primary', size = 'sm', onClick, children, type = 'button' }) {
  const sizeClass = size === 'sm' ? 'text-[12px] px-3 py-1 rounded-md' : 'text-[13px] px-5 py-2 rounded-lg'
  const variantClass =
    variant === 'primary'
      ? 'bg-purple-600 text-white hover:bg-purple-700 border-none'
      : 'bg-transparent text-gray-600 border border-gray-200 hover:bg-gray-50'
  return (
    <button type={type} onClick={onClick} className={`font-medium transition-colors ${sizeClass} ${variantClass}`}>
      {children}
    </button>
  )
}

export default function RecField({ value, display = 'inline', editable = false, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const displayClass =
    display === 'block'
      ? 'flex items-start gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2'
      : 'flex items-start gap-1.5'

  if (!editable) {
    return (
      <div className={displayClass}>
        <span className="flex-1 text-[13px] leading-snug text-gray-600">{value}</span>
      </div>
    )
  }

  function startEdit(e) {
    e.stopPropagation()
    setDraft(value)
    setEditing(true)
  }

  function save(e) {
    e?.stopPropagation()
    if (draft.trim()) onSave(draft.trim())
    setEditing(false)
  }

  function cancel(e) {
    e?.stopPropagation()
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-1.5" onClick={e => e.stopPropagation()}>
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          rows={3}
          className="w-full text-[12px] text-gray-900 bg-white border-[1.5px] border-purple-600 rounded-md px-2.5 py-1.5 resize-y leading-snug outline-none focus:shadow-focus-purple-sm"
          onKeyDown={e => {
            if (e.key === 'Escape') cancel()
          }}
        />
        <div className="flex gap-1.5 justify-end">
          <HrButton variant="secondary" onClick={cancel}>Cancel</HrButton>
          <HrButton variant="primary" onClick={save}>Save</HrButton>
        </div>
      </div>
    )
  }

  return (
    <div className={displayClass}>
      <span className="flex-1 text-[13px] leading-snug text-gray-600">{value}</span>
      <button
        type="button"
        aria-label="Edit recommendation"
        onClick={startEdit}
        className="shrink-0 p-0.5 rounded text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors mt-0.5"
      >
        <Pencil size={13} />
      </button>
    </div>
  )
}
