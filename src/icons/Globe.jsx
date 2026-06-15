import React from 'react';

export function Globe({ size = 24, className = '', color = 'currentColor', ...props }) {
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12h20" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12c0 5.523 4.477 10 10 10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2 12C2 6.477 6.477 2 12 2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 12c0 5.523-4.477 10-10 10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 12c0-5.523-4.477-10-10-10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a15.3 15.3 0 00-4 10 15.3 15.3 0 004 10" />
    </svg>
  );
}

export default Globe;
