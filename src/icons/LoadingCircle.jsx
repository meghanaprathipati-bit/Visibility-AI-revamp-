import React from 'react'

/** HighRise HLSpin circle loader — matches Pencil "Loading Circle" (primary-600 arc, rounded caps) */
export function LoadingCircle({ size = 16, className = '', ...props }) {
  const strokeWidth = Math.max(2, Math.round((4 / 28) * size))
  const radius = (size - strokeWidth) / 2
  const center = size / 2
  const circumference = 2 * Math.PI * radius
  const arcLength = circumference * (216 / 360)
  const gapLength = circumference - arcLength

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={`animate-spin shrink-0 text-primary-600 ${className}`}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${arcLength} ${gapLength}`}
      />
    </svg>
  )
}

export default LoadingCircle
