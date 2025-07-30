
import React from 'react';

export const BrainLogo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <defs>
      <linearGradient id="spark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#833ab4', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#fd1d1d', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#fcb045', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    
    {/* The two "supportive hands" shapes */}
    <path d="M4 12C4 7.58172 7.58172 4 12 4C13.8236 4 15.4802 4.63385 16.8284 5.67157" className="text-primary"/>
    <path d="M20 12C20 16.4183 16.4183 20 12 20C10.1764 20 8.51984 19.3661 7.17157 18.3284" className="text-primary" />

    {/* The central "spark" with the gradient */}
    <g stroke="url(#spark-gradient)">
      <path d="M12 10V14" />
      <path d="M10 12H14" />
    </g>
  </svg>
);
