import React from 'react';

/** GHL / Untitled UI RefreshCw02 — dual circular arrows */
export function RefreshCw02({ size = 24, className = '', color = 'currentColor', ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2 14s.121.85 3.636 4.364A9 9 0 0 0 20.776 14M2 14v6m0-6h6m14-4s-.121-.85-3.636-4.364A9 9 0 0 0 3.224 10M22 10V4m0 6h-6"
      />
    </svg>
  );
}

export default RefreshCw02;
