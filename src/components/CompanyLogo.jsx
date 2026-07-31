/**
 * CompanyLogo — initials / fallback avatar only.
 * Brand favicons and remote logos are intentionally not loaded.
 * AI engine marks stay in EngineLogo — do not route those through here.
 */
export default function CompanyLogo({
  domain,
  size = 28,
  rounded = 'rounded-lg',
  className = '',
  fallback = null,
}) {
  if (fallback) return fallback

  const initials = (domain || '?')
    .replace(/^www\./i, '')
    .replace(/\.[a-z.]+$/i, '')
    .slice(0, 2)
    .toUpperCase() || '?'

  return (
    <span
      className={`inline-flex items-center justify-center bg-gray-100 text-gray-600 border border-gray-200 overflow-hidden shrink-0 text-[11px] font-semibold ${rounded} ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {initials}
    </span>
  )
}
