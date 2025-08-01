
import React from 'react';
import { cn } from "@/lib/utils";

export const BrainLogo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="url(#brain-gradient)"
    strokeWidth="1"
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
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" strokeWidth="1.5" />
    <path d="M12,18 C15,14 15,10 12,6" strokeWidth="1.2" />
    <path d="M12,6 C11,7 10,7.5 9,7.5" strokeWidth="1.2" />
    <path d="M12,8 C11,9 10,9.5 9,9.5" strokeWidth="1.2" />
    <path d="M12,10 C11,11 10,11.5 9,11.5" strokeWidth="1.2" />
    <path d="M12,12 C11,13 10,13.5 9,13.5" strokeWidth="1.2" />
    <path d="M12,14 C11,15 10,15.5 9,15.5" strokeWidth="1.2" />
    <path d="M12,16 C11,17 10,17.5 9,17.5" strokeWidth="1.2" />
    <path d="M12,6 C13,7 14,7.5 15,7.5" strokeWidth="1.2" />
    <path d="M12,8 C13,9 14,9.5 15,9.5" strokeWidth="1.2" />
    <path d="M12,10 C13,11 14,11.5 15,11.5" strokeWidth="1.2" />
    <path d="M12,12 C13,13 14,13.5 15,13.5" strokeWidth="1.2" />
    <path d="M12,14 C13,15 14,15.5 15,15.5" strokeWidth="1.2" />
    <path d="M12,16 C13,17 14,17.5 15,17.5" strokeWidth="1.2" />
  </svg>
);
