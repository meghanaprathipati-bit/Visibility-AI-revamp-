import React from 'react';

export function Crown({ size = 24, className = '', color = 'currentColor', ...props }) {
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a6 6 0 01-6-6V3.444c0-.413 0-.62.06-.786a1 1 0 01.598-.598C6.824 2 7.031 2 7.444 2h9.112c.413 0 .62 0 .786.06a1 1 0 01.598.598c.06.166.06.373.06.786V9a6 6 0 01-6 6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 4h2.5c.466 0 .699 0 .883.076a1 1 0 01.54.541c.077.184.077.417.077.883V6c0 .93 0 1.395-.102 1.776a3 3 0 01-2.122 2.122C19.395 10 18.93 10 18 10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4H3.5c-.466 0-.699 0-.883.076a1 1 0 00-.54.541C2 4.801 2 5.034 2 5.5V6c0 .93 0 1.395.102 1.776a3 3 0 002.122 2.122C4.605 10 5.07 10 6 10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.444 22h9.112a.444.444 0 00.444-.444A3.556 3.556 0 0013.444 18h-2.888A3.556 3.556 0 007 21.556c0 .245.199.444.444.444z" />
    </svg>
  );
}

export default Crown;
