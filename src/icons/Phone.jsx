import React from 'react';

export function Phone({ size = 24, className = '', color = 'currentColor', ...props }) {
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
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.5h.01M8.2 22h7.6c1.12 0 1.68 0 2.108-.218a2 2 0 00.874-.874C19 20.48 19 19.92 19 18.8V5.2c0-1.12 0-1.68-.218-2.108a2 2 0 00-.874-.874C17.48 2 16.92 2 15.8 2H8.2c-1.12 0-1.68 0-2.108.218a2 2 0 00-.874.874C5 3.52 5 4.08 5 5.2v13.6c0 1.12 0 1.68.218 2.108a2 2 0 00.874.874C6.52 22 7.08 22 8.2 22zm4.3-4.5a.5.5 0 11-1 0 .5.5 0 011 0z" />
    </svg>
  );
}

export default Phone;
