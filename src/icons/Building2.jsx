import React from 'react';

export function Building2({ size = 24, className = '', color = 'currentColor', ...props }) {
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 21v-5.4c0-.56 0-.84-.109-1.054a1 1 0 00-.437-.437C14.24 14 13.96 14 13.4 14h-2.8c-.56 0-.84 0-1.054.109a1 1 0 00-.437.437C9 14.76 9 15.04 9 15.6V21" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7a3 3 0 006 0 3 3 0 106 0 3 3 0 106 0" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.2 21h11.6c1.12 0 1.68 0 2.108-.218a2 2 0 00.874-.874C21 19.48 21 18.92 21 17.8V6.2c0-1.12 0-1.68-.218-2.108a2 2 0 00-.874-.874C19.48 3 18.92 3 17.8 3H6.2c-1.12 0-1.68 0-2.108.218a2 2 0 00-.874.874C3 4.52 3 5.08 3 6.2v11.6c0 1.12 0 1.68.218 2.108a2 2 0 00.874.874C4.52 21 5.08 21 6.2 21z" />
    </svg>
  );
}

export default Building2;
