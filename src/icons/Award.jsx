import React from 'react';

export function Award({ size = 24, className = '', color = 'currentColor', ...props }) {
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
      className={className}
      aria-hidden="true"
      {...props}
    >
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.967 14.722L7 22l4.588-2.753c.15-.09.225-.135.305-.152a.5.5 0 01.214 0c.08.017.155.062.305.152L17 22l-.966-7.279M19 9A7 7 0 115 9a7 7 0 0114 0z" />
    </svg>
  );
}

export default Award;
