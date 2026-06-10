import React from 'react';

export function Image({ size = 24, className = '', color = 'currentColor', ...props }) {
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
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.2 21H6.931c-.605 0-.908 0-1.049-.12a.5.5 0 01-.173-.42c.014-.183.228-.397.657-.826l8.503-8.503c.396-.396.594-.594.822-.668a1 1 0 01.618 0c.228.074.426.272.822.668L21 15v1.2M16.2 21c1.68 0 2.52 0 3.162-.327a3 3 0 001.311-1.311C21 18.72 21 17.88 21 16.2M16.2 21H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 01-1.311-1.311C3 18.72 3 17.88 3 16.2V7.8c0-1.68 0-2.52.327-3.162a3 3 0 011.311-1.311C5.28 3 6.12 3 7.8 3h8.4c1.68 0 2.52 0 3.162.327a3 3 0 011.311 1.311C21 5.28 21 6.12 21 7.8v8.4M10.5 8.5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

export default Image;
