
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
    <g transform="translate(1, 2) scale(0.8)">
      <path d="M12.5,4 C11.5,8.5 10,13 8,18.5" strokeWidth="1" />
      <path d="M12.4,4.2 C14,5 15,6 16.5,6.5" />
      <path d="M15.5,6.8 C14.5,7.5 13.5,8.5 13,9.5" />
      <path d="M11.8,7 C13.5,7.8 14.5,8.8 15.5,9.5" />
      <path d="M14.8,9.8 C14,10.5 13,11.2 12.5,12" />
      <path d="M11,9.5 C12.5,10.2 13.5,11, 14.5,11.8" />
      <path d="M14,12 C13,12.8 12,13.5 11.5,14.2" />
      <path d="M10.5,12 C11.5,12.5 12.5,13.2 13.5,13.8" />
      <path d="M13,14 C12,14.8 11,15.5 10.5,16.2" />
      <path d="M9.8,14.5 C10.8,15 11.8,15.5 12.8,16" />
      <path d="M12.2,16.2 C11.2,17 10.2,17.5 9.5,18.2" />
      <path d="M11,4.5 C9,5.5 8,6.5 6.5,7" />
      <path d="M7.5,7.5 C8.5,8 9.5,9 10,10" />
      <path d="M10.8,6.8 C9,7.5 8,8.5 7,9.2" />
      <path d="M8,9.5 C9,10.2 10,11 10.5,11.8" />
      <path d="M10,9.2 C8.5,10 7.5,10.8 6.5,11.5" />
      <path d="M7.5,11.8 C8.5,12.5 9.5,13.2 10,14" />
      <path d="M9.5,11.5 C8,12.2 7,13 6,13.8" />
      <path d="M7,14 C8,14.8 9,15.5 9.5,16.2" />
      <path d="M8.8,13.8 C7.5,14.5 6.5,15.2 5.5,16" />
      <path d="M6.5,16.2 C7.5,17 8.5,17.8 9,18.5" />
    </g>
  </svg>
);
