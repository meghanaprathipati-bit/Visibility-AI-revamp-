import RecField from './RecField.jsx'

export default function ActionItemDetailSingle({
  fieldName,
  currentValue,
  recommendationLabel,
  recommendation,
  editable = false,
  onUpdateRec,
}) {
  return (
    <div className="px-3.5 py-3 bg-gray-50">
      <div className="flex gap-4 mb-2.5">
        {fieldName && (
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Field</div>
            <div className="text-[13px] text-gray-900">{fieldName}</div>
          </div>
        )}
        {currentValue && (
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Current value</div>
            <div className={`text-[13px] ${currentValue === '(missing)' ? 'text-gray-400 italic' : 'text-gray-900'}`}>
              {currentValue}
            </div>
          </div>
        )}
      </div>
      <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">{recommendationLabel}</div>
      <RecField value={recommendation} display="block" editable={editable} onSave={onUpdateRec} />
    </div>
  )
}
