import React from 'react';

export function Workflow({ size = 24, className = '', color = 'currentColor', ...props }) {
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
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h-.2c-1.68 0-2.52 0-3.162-.327a3 3 0 01-1.311-1.311C12 17.72 12 16.88 12 15.2V8.8c0-1.68 0-2.52.327-3.162a3 3 0 011.311-1.311C14.28 4 15.12 4 16.8 4h.2m0 16a2 2 0 104 0 2 2 0 00-4 0zm0-16a2 2 0 104 0 2 2 0 00-4 0zM7 12h10M7 12a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 104 0 2 2 0 00-4 0z" />
    </svg>
  );
}

export default Workflow;
