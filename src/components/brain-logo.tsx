
import React from 'react';
import { cn } from "@/lib/utils";

export const BrainLogo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    className={cn(className)}
    fill="url(#brain-gradient)"
  >
    <defs>
      <linearGradient id="brain-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: '#8134AF' }} />
        <stop offset="50%" style={{ stopColor: '#DD2A7B' }} />
        <stop offset="100%" style={{ stopColor: '#FEDA77' }} />
      </linearGradient>
    </defs>
    <path
      d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM256 464c-114.7 0-208-93.3-208-208S141.3 48 256 48s208 93.3 208 208-93.3 208-208 208z"
      fill="url(#brain-gradient)"
    />
    <path
      d="M256 96c-13.3 0-24 10.7-24 24v32c0 13.3 10.7 24 24 24s24-10.7 24-24v-32c0-13.3-10.7-24-24-24zm-64 128c-13.3 0-24 10.7-24 24v32c0 13.3 10.7 24 24 24s24-10.7 24-24v-32c0-13.3-10.7-24-24-24zm128 0c-13.3 0-24 10.7-24 24v32c0 13.3 10.7 24 24 24s24-10.7 24-24v-32c0-13.3-10.7-24-24-24zM160 320c-13.3 0-24 10.7-24 24v32c0 13.3 10.7 24 24 24s24-10.7 24-24v-32c0-13.3-10.7-24-24-24zm192 0c-13.3 0-24 10.7-24 24v32c0 13.3 10.7 24 24 24s24-10.7 24-24v-32c0-13.3-10.7-24-24-24z"
      fill="url(#brain-gradient)"
      stroke="url(#brain-gradient)"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
    </path>
    <path 
      d="M256,176v160m-64-80h128"
      fill="none"
      stroke="url(#brain-gradient)"
      strokeWidth="16"
      strokeLinecap="round"
    />
  </svg>
);
