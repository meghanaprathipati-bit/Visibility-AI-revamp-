import React from 'react';

export function User({ size = 24, className = '', color = 'currentColor', ...props }) {
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
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 21c0-1.396 0-2.093-.172-2.661a4 4 0 00-2.667-2.667c-.568-.172-1.265-.172-2.661-.172h-5c-1.396 0-2.093 0-2.661.172a4 4 0 00-2.667 2.667C4 18.907 4 19.604 4 21M16.5 7.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  );
}

export default User;
