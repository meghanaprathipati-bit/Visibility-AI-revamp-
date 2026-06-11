import React from 'react';

export function Wand2({ size = 24, className = '', color = 'currentColor', ...props }) {
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 14l-3-3m5.01-7.5V2m3.94 3.06L20.01 4m-1.06 9l1.06 1.06m-9-9L9.95 4m10.56 5h1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.131 20.869l9.238-9.238c.396-.396.594-.594.668-.822a1 1 0 000-.618c-.074-.228-.272-.426-.668-.822l-.737-.738c-.397-.396-.595-.594-.823-.668a1 1 0 00-.618 0c-.228.074-.426.272-.822.668L3.13 17.87c-.396.396-.594.594-.668.822a1 1 0 000 .618c.074.228.272.426.668.822l.738.738c.396.396.594.594.822.668a1 1 0 00.618 0c.228-.074.426-.272.822-.668z" />
    </svg>
  );
}

export default Wand2;
