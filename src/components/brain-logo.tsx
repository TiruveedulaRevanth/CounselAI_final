
import React from 'react';
import { cn } from "@/lib/utils";

export const BrainLogo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="url(#brain-gradient)"
    strokeWidth="0.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn(className)}
  >
    <defs>
      <linearGradient id="brain-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: '#8134AF' }} />
        <stop offset="50%" style={{ stopColor: '#DD2A7B' }} />
        <stop offset="100%" style={{ stopColor: '#FEDA77' }} />
      </linearGradient>
    </defs>
    <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" strokeWidth="1" />
    <g transform="translate(3.5, 3.5) scale(0.75)">
      <path d="M12 20C12 17.25 10 15.5 8 14" strokeWidth="1.5" />
      <path d="M12 20C12 17.25 14 15.5 16 14" strokeWidth="1.5" />
      <path d="M8 14C6 12.5 5 10 6 8" strokeWidth="1.5" />
      <path d="M16 14C18 12.5 19 10 18 8" strokeWidth="1.5" />
      <path d="M6 8C7 6 9 4 12 4" strokeWidth="1.5" />
      <path d="M18 8C17 6 15 4 12 4" strokeWidth="1.5" />
      <path d="M12 20V4" strokeWidth="1.5" />
      <path d="M5 11H19" strokeWidth="1.5" />
    </g>
  </svg>
);
