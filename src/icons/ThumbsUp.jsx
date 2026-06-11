export function ThumbsUp({ size = 24, className = '', strokeWidth = 2, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
      stroke="currentColor"
      aria-hidden="true"
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 22V11m-5 2v7a2 2 0 002 2h13.426a3 3 0 002.965-2.544l1.077-7A3 3 0 0018.503 9H15a1 1 0 01-1-1V4.466A2.466 2.466 0 0011.534 2a.822.822 0 00-.75.488l-3.52 7.918A1 1 0 016.35 11H4a2 2 0 00-2 2z"
      />
    </svg>
  )
}

export default ThumbsUp
