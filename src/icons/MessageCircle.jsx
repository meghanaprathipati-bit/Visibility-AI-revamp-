import React from 'react';

export function MessageCircle({ size = 24, className = '', color = 'currentColor', ...props }) {
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
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.5 8.5 0 01-11.555 7.934c-.174-.066-.26-.1-.33-.116a.901.901 0 00-.186-.024 2.314 2.314 0 00-.303.021l-5.12.53c-.49.05-.733.075-.877-.013a.5.5 0 01-.234-.35c-.026-.166.09-.382.324-.814l1.636-3.027c.134-.25.202-.374.232-.494a.899.899 0 00.028-.326c-.01-.123-.064-.283-.172-.604A8.5 8.5 0 1121 11.5z" />
    </svg>
  );
}

export default MessageCircle;
