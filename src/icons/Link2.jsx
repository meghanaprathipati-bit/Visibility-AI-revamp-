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
      className={className}
      aria-hidden="true"
      {...props}
    >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.708 18.364l-1.415 1.414a5 5 0 11-7.07-7.07l1.413-1.415m12.728 1.414l1.415-1.414a5 5 0 00-7.071-7.071l-1.415 1.414M8.5 15.5l7-7" />
    </svg>
  );
}

export default Link2;
