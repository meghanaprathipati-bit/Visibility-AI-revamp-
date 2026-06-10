import React from 'react';

export function Tablet({ size = 24, className = '', color = 'currentColor', ...props }) {
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
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17.5h.01M7.2 22h9.6c1.12 0 1.68 0 2.108-.218a2 2 0 00.874-.874C20 20.48 20 19.92 20 18.8V5.2c0-1.12 0-1.68-.218-2.108a2 2 0 00-.874-.874C18.48 2 17.92 2 16.8 2H7.2c-1.12 0-1.68 0-2.108.218a2 2 0 00-.874.874C4 3.52 4 4.08 4 5.2v13.6c0 1.12 0 1.68.218 2.108a2 2 0 00.874.874C5.52 22 6.08 22 7.2 22zm5.3-4.5a.5.5 0 11-1 0 .5.5 0 011 0z" />
    </svg>
  );
}

export default Tablet;
