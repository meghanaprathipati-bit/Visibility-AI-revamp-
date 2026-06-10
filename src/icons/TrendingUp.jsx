import React from 'react';

export function TrendingUp({ size = 24, className = '', color = 'currentColor', ...props }) {
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
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 7l-7.869 7.869c-.396.396-.594.594-.822.668a1 1 0 01-.618 0c-.228-.074-.426-.272-.822-.668L9.13 12.13c-.396-.396-.594-.594-.822-.668a1 1 0 00-.618 0c-.228.074-.426.272-.822.668L2 17M22 7h-7m7 0v7" />
    </svg>
  );
}

export default TrendingUp;
