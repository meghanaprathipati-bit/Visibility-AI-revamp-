import React from 'react';

export function Paperclip({ size = 24, className = '', color = 'currentColor', ...props }) {
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.152 10.9l-9.015 9.015a5.25 5.25 0 01-7.425-7.425l9.016-9.015a3.5 3.5 0 114.95 4.95l-8.662 8.662a1.75 1.75 0 11-2.475-2.475l7.601-7.602" />
    </svg>
  );
}

export default Paperclip;
