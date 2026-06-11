import React from 'react';

export function Zap({ size = 24, className = '', color = 'currentColor', ...props }) {
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L4.093 12.688c-.348.418-.523.628-.525.804a.5.5 0 00.185.397c.138.111.41.111.955.111H12l-1 8 8.907-10.688c.348-.418.523-.628.525-.804a.5.5 0 00-.185-.397c-.138-.111-.41-.111-.955-.111H12l1-8z" />
    </svg>
  );
}

export default Zap;
