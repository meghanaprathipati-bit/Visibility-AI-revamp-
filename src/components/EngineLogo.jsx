import { Bot } from '../icons/index.js'

// Lightweight brand marks for AI engine tables and pickers. Approximated in
// brand colours; swap for official asset SVGs when wiring live data.

export function ChatGptLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#10A37F"
        d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7476-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
      />
    </svg>
  )
}

export function PerplexityLogo({ size = 18 }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="#20808D" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4v16" />
      <path d="M12 8.2C10.3 5.9 7.9 5 6 5.8 4 6.6 3.1 8.9 3.8 11.1c.5 1.9 2.3 3.1 4.3 3.1H12" />
      <path d="M12 8.2C13.7 5.9 16.1 5 18 5.8c2 .8 2.9 3.1 2.2 5.3-.5 1.9-2.3 3.1-4.3 3.1H12" />
      <path d="M7 14.2V18l5-3M17 14.2V18l-5-3" />
    </svg>
  )
}

export function ClaudeLogo({ size = 18 }) {
  const rays = Array.from({ length: 12 }, (_, i) => (i * 360) / 12)
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <g transform="translate(12 12)">
        {rays.map(a => (
          <rect key={a} x="-0.85" y="-10.5" width="1.7" height="7.2" rx="0.85" fill="#D97706" transform={`rotate(${a})`} />
        ))}
      </g>
    </svg>
  )
}

export function GeminiLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="gemini-grad" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4285F4" />
          <stop offset="0.5" stopColor="#9B72CB" />
          <stop offset="1" stopColor="#D96570" />
        </linearGradient>
      </defs>
      <path fill="url(#gemini-grad)" d="M12 2c.4 5-2.9 8.9-10 10 7.1 1.1 10.4 5 10 10 .4-5 2.9-8.9 10-10-7.1-1.1-10.4-5-10-10Z" />
    </svg>
  )
}

export function AiModeLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="aimode-grad" x1="2" y1="4" x2="20" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#4285F4" />
          <stop offset="0.55" stopColor="#9B72CB" />
          <stop offset="1" stopColor="#D96570" />
        </linearGradient>
      </defs>
      <path fill="url(#aimode-grad)" d="M9.6 3c.3 3.9 2.4 6.7 6.4 8-4 1.3-6.1 4.1-6.4 8-.3-3.9-2.4-6.7-6.4-8 4-1.3 6.1-4.1 6.4-8Z" />
      <path fill="url(#aimode-grad)" d="M18 3.4c.13 1.5 1 2.6 2.6 3.1-1.6.5-2.47 1.6-2.6 3.1-.13-1.5-1-2.6-2.6-3.1 1.6-.5 2.47-1.6 2.6-3.1Z" />
    </svg>
  )
}

export function AiOverviewLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.04 12.26c0-.82-.07-1.6-.21-2.36H12v4.46h6.19c-.27 1.44-1.08 2.66-2.3 3.48v2.89h3.72c2.18-2.01 3.43-4.97 3.43-8.47Z" />
      <path fill="#34A853" d="M12 24c3.11 0 5.72-1.03 7.62-2.79l-3.72-2.89c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.54-2.03-6.45-4.75H1.71v2.98C3.6 21.42 7.51 24 12 24Z" />
      <path fill="#FBBC05" d="M5.55 14.67c-.23-.69-.36-1.42-.36-2.17s.13-1.48.36-2.17V7.35H1.71C.62 9.5.16 11.18.16 12.5s.46 3 1.55 5.15l3.84-2.98Z" />
      <path fill="#EA4335" d="M12 4.78c1.69 0 3.21.58 4.4 1.72l3.3-3.3C17.72 1.19 15.11 0 12 0 7.51 0 3.6 2.58 1.71 6.35l3.84 2.98C6.46 6.81 9 4.78 12 4.78Z" />
    </svg>
  )
}

const ENGINE_LOGO_MAP = {
  'ChatGPT': ChatGptLogo,
  'Perplexity': PerplexityLogo,
  'Claude': ClaudeLogo,
  'Gemini': GeminiLogo,
  'AI Mode': AiModeLogo,
  'AI Overview': AiOverviewLogo,
}

/** Renders the real engine logo inside a consistent white chip. */
export default function EngineLogo({ name, size = 18, chip = true, className = '' }) {
  const Logo = ENGINE_LOGO_MAP[name]
  const glyph = Logo ? <Logo size={size} /> : <Bot size={size} className="text-gray-400" />
  if (!chip) return glyph
  return (
    <span className={`inline-flex items-center justify-center rounded-lg bg-white border border-gray-200 shrink-0 ${className}`}>
      {glyph}
    </span>
  )
}
