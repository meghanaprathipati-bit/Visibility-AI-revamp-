import React from 'react';

export function MessageChatSquareIcon({ size = 24, className = '', color = 'currentColor', ...props }) {
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
      <path d="M10 15l-3.075 3.114c-.43.434-.644.651-.828.666a.5.5 0 01-.421-.172c-.12-.14-.12-.446-.12-1.056v-1.56c0-.548-.449-.944-.99-1.024v0a3 3 0 01-2.534-2.533C2 12.219 2 11.96 2 11.445V6.8c0-1.68 0-2.52.327-3.162a3 3 0 011.311-1.311C4.28 2 5.12 2 6.8 2h7.4c1.68 0 2.52 0 3.162.327a3 3 0 011.311 1.311C19 4.28 19 5.12 19 6.8V11m0 11l-2.176-1.513c-.306-.213-.46-.32-.626-.395a2.002 2.002 0 00-.462-.145c-.18-.033-.367-.033-.74-.033H13.2c-1.12 0-1.68 0-2.108-.218a2 2 0 01-.874-.874C10 18.394 10 17.834 10 16.714V14.2c0-1.12 0-1.68.218-2.108a2 2 0 01.874-.874C11.52 11 12.08 11 13.2 11h5.6c1.12 0 1.68 0 2.108.218a2 2 0 01.874.874C22 12.52 22 13.08 22 14.2v2.714c0 .932 0 1.398-.152 1.766a2 2 0 01-1.083 1.082c-.367.152-.833.152-1.765.152V22z" />
    </svg>
  );
}

export default MessageChatSquareIcon;
