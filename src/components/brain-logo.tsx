
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
      <linearGradient id="leaf-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#4ade80', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    
    {/* Brain Outline */}
    <path 
      d="M12 21a8.5 8.5 0 1 0-8.5-8.5c0 2.26.8 4.33 2.5 5.5" 
      className="text-primary" 
    />
    <path 
      d="M12 21a8.5 8.5 0 1 1 8.5-8.5c0 2.26-.8 4.33-2.5 5.5" 
      className="text-primary" 
    />
    <path d="M15.5 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" className="text-primary" />
    <path d="M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0" className="text-primary" />
    <path d="M12 12v-2a2 2 0 0 1 2-2" className="text-primary" />

    {/* Growing Leaf */}
    <g stroke="url(#leaf-gradient)">
      <path d="M12 10C12 7 14 5 16 5" />
      <path d="M12 10c0 2.5-2 4.5-2 4.5s-2-2-2-4.5c0-2.5 2-4.5 2-4.5S12 7.5 12 10z" />
    </g>
  </svg>
);
