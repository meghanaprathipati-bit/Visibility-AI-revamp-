/** Visibility AI logo mark — used in modal headers */
export default function VaLogo({ size = 'md' }) {
  const dim = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9'
  const svg = size === 'sm' ? 18 : 22
  return (
    <div className={`${dim} rounded-full bg-brand-deep flex items-center justify-center shrink-0 overflow-hidden`}>
      <svg width={svg} height={svg} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M2.5 5.5L6.5 16.5L7.5 16.5L4.5 5.5L2.5 5.5Z" fill="var(--va-accent-green)" />
        <path d="M11.5 5.5L7.5 16.5L8.5 16.5L9.6 13.6L13.4 13.6L14.5 16.5L15.5 16.5L11.5 5.5ZM10 12.2L11.5 8.4L13 12.2L10 12.2Z" fill="#F97316" />
      </svg>
    </div>
  )
}
