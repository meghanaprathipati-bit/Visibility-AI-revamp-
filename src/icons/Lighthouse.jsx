/** Lighthouse icon — Visibility product mark for sidebar navigation */
export function Lighthouse({ size = 24, className = '', color = 'currentColor', strokeWidth = 1.75, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        d="M3 9.5h3.5M17.5 9.5H21"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M9.5 9.5h5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M10.25 9.5V7.75c0-.69.56-1.25 1.25-1.25h.75c.69 0 1.25.56 1.25 1.25V9.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 6.25c.75-.75 2.25-.75 3 0"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <path
        d="M10.75 9.5L10 19.25h4L13.25 9.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.25 19.25h5.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <circle cx="12" cy="13" r="0.75" fill={color} />
      <circle cx="12" cy="16" r="0.75" fill={color} />
    </svg>
  )
}

export default Lighthouse

/** Sidebar nav entry — always renders at 24×24 per product spec */
export function LighthouseNavIcon({ size: _size, ...props }) {
  return <Lighthouse size={24} {...props} />
}
