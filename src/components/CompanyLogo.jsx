import { useState } from 'react'

/**
 * CompanyLogo — renders a real company/brand logo by domain so tables and
 * leaderboards stop using letter-monogram placeholders.
 *
 * It loads the favicon for the given domain (Google's favicon service, which
 * only needs the domain) and, if that fails to load, renders the provided
 * `fallback` node (typically the existing colored-initials avatar or a globe).
 *
 * Props:
 *   domain    string      — company domain, e.g. "hubspot.com" (required)
 *   size      number      — square px size of the logo chip (default 28)
 *   rounded   string      — corner radius class (default "rounded-lg")
 *   className string      — extra classes on the chip wrapper
 *   fallback  ReactNode   — shown when the logo cannot be loaded
 */
export default function CompanyLogo({ domain, size = 28, rounded = 'rounded-lg', className = '', fallback = null }) {
  const [failed, setFailed] = useState(false)

  if (failed || !domain) return fallback

  return (
    <span
      className={`inline-flex items-center justify-center bg-white border border-gray-200 overflow-hidden shrink-0 ${rounded} ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
        alt=""
        width={size - 10}
        height={size - 10}
        loading="lazy"
        onError={() => setFailed(true)}
        style={{ display: 'block' }}
      />
    </span>
  )
}
