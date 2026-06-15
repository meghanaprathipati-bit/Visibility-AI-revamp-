/**
 * CheckIcon — @gohighlevel/ghl-icons/24/outline
 * Used inside HLCheckbox checked state.
 */
export function CheckIcon({ size = 24, className = '', color = 'currentColor', strokeWidth = 2, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

export default CheckIcon
