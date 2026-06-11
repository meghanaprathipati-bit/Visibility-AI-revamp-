import React from 'react';

export function FileText({ size = 24, className = '', color = 'currentColor', ...props }) {
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2H8.8c-1.68 0-2.52 0-3.162.327a3 3 0 00-1.311 1.311C4 4.28 4 5.12 4 6.8v10.4c0 1.68 0 2.52.327 3.162a3 3 0 001.311 1.311C6.28 22 7.12 22 8.8 22h6.4c1.68 0 2.52 0 3.162-.327a3 3 0 001.311-1.311C20 19.72 20 18.88 20 17.2V8l-6-6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 2v4.4c0 .56 0 .84.109 1.054a1 1 0 00.437.437C14.76 8 15.04 8 15.6 8H20" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 13H8m8 4H8m2-8H8" />
    </svg>
  );
}

export default FileText;
