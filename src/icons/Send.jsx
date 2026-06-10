import React from 'react';

export function Send({ size = 24, className = '', color = 'currentColor', ...props }) {
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
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 13.5L21 3M10.627 13.828l2.628 6.758c.232.596.347.893.514.98a.5.5 0 00.462 0c.167-.086.283-.384.515-.979l6.59-16.888c.21-.537.315-.806.258-.977a.5.5 0 00-.316-.316c-.172-.057-.44.048-.978.257L3.413 9.253c-.595.233-.893.349-.98.516a.5.5 0 000 .461c.087.167.385.283.98.514l6.758 2.629c.121.046.182.07.233.106a.5.5 0 01.116.117c.037.05.06.111.107.232z" />
    </svg>
  );
}

export default Send;
