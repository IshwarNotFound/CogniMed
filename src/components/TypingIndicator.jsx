// Item #7 — RedactedSkeleton: replaced with data-stream decode effect
// Animated hex/binary data blocks that "decode" in waves — feels like
// actual clinical data is being processed, not a generic loading state.
// useReducedMotion guard for accessibility compliance.
import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Generate a random hex-like data string
const genDataRow = (len) => {
  const chars = '0123456789ABCDEF·░▒▓█';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const RedactedSkeleton = () => {
  const shouldReduce = useReducedMotion();
  const [rows, setRows] = useState(() => [genDataRow(42), genDataRow(34), genDataRow(26)]);

  useEffect(() => {
    if (shouldReduce) return;
    const interval = setInterval(() => {
      setRows([genDataRow(42), genDataRow(34), genDataRow(26)]);
    }, 800);
    return () => clearInterval(interval);
  }, [shouldReduce]);

  if (shouldReduce) {
    return (
      <div className="flex flex-col gap-1.5 py-2 font-mono text-[10px] text-brand-text-faint tracking-tighter opacity-40">
        {rows.map((row, i) => (
          <div key={i}>{row}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 py-2 font-mono text-[10px] tracking-tighter overflow-hidden">
      {rows.map((row, i) => (
        <motion.div
          key={`${i}-${row}`}
          className="text-brand-primary/30 whitespace-nowrap"
          initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
          transition={{
            duration: 0.3,
            delay: i * 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {row}
        </motion.div>
      ))}
      {/* Scan line accent */}
      <motion.div
        className="h-[1px] mt-1"
        style={{ background: 'linear-gradient(90deg, transparent, var(--color-brand-primary), transparent)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
};

export default RedactedSkeleton;
