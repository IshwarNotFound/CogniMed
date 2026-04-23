// Item #34 — PriorityBadge: 4-level severity dot system
// Exactly 4 semantic levels. No exceptions.
// dot-critical uses steps(2) hard blink — NOT Tailwind's animate-pulse (soft sinusoidal).
// The pulse on critical is the ONLY infinite-loop layout animation permitted in the app.
import React from 'react';

const SEVERITY_CONFIG = {
  routine:  {
    color: 'text-brand-text-muted',
    dot: 'bg-transparent border border-brand-text-muted',
  },
  elevated: {
    color: 'text-brand-warning',
    dot: 'bg-brand-warning',
  },
  high:     {
    color: 'text-brand-error',
    dot: 'bg-brand-error',
  },
  critical: {
    color: 'text-brand-error font-black',
    // dot-critical = steps(2) hard blink — defined in index.css
    dot: 'bg-brand-error dot-critical',
  },
};

export const PriorityBadge = ({ level = 'routine', label }) => {
  const config = SEVERITY_CONFIG[level] || SEVERITY_CONFIG.routine;
  return (
    <div
      className={`flex items-center gap-2 text-[10px] uppercase tracking-widest badge-priority ${config.color}`}
    >
      <span className={`w-2 h-2 inline-block border border-current ${config.dot}`} />
      {label || level}
    </div>
  );
};

export default PriorityBadge;
