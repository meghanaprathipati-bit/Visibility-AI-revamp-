import React from 'react';

export function Link2({ size = 24, className = '', color = 'currentColor', ...props }) {
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17H7A5 5 0 017 7h2m6 10h2a5 5 0 000-10h-2m-8 5h10" />
    </svg>
  );
}

export default Link2;
