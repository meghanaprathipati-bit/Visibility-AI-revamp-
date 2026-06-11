import React from 'react';

export function RefreshCw({ size = 24, className = '', color = 'currentColor', ...props }) {
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 10s-2.005-2.732-3.634-4.362a9 9 0 102.282 8.862M22 10V4m0 6h-6" />
    </svg>
  );
}

export default RefreshCw;
