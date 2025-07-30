
import React from 'react';

export const BrainLogo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="url(#brain-gradient)"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <defs>
      <linearGradient id="brain-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#833ab4', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#fd1d1d', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#fcb045', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" />
    <path d="M16 8C16 9.10457 15.1046 10 14 10C12.8954 10 12 9.10457 12 8C12 6.89543 12.8954 6 14 6C15.1046 6 16 6.89543 16 8Z" />
    <path d="M12 12C12 13.1046 11.1046 14 10 14C8.89543 14 8 13.1046 8 12C8 10.8954 8.89543 10 10 10C11.1046 10 12 10.8954 12 12Z" />
    <path d="M16 16C16 17.1046 15.1046 18 14 18C12.8954 18 12 17.1046 12 16C12 14.8954 12.8954 14 14 14C15.1046 14 16 14.8954 16 16Z" />
    <path d="M9 17C9 15.8954 8.10457 15 7 15C5.89543 15 5 15.8954 5 17" />
    <path d="M19 11C19 12.1046 18.1046 13 17 13C15.8954 13 15 12.1046 15 11" />
  </svg>
);
