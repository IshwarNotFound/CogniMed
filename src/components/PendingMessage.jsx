// Item #16 — PendingMessage: combines TerminalLoader + RedactedSkeleton
// Both STACK (not replace each other) — TerminalLoader tells what machine is doing,
// RedactedSkeleton reserves physical space for incoming message bubble.
// Both unmount simultaneously via shared AnimatePresence in ChatWindow.
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TerminalLoader from './TerminalLoader';
import RedactedSkeleton from './TypingIndicator';

// ─── Live Elapsed Timer ──────────────────────────────────────────────────────
function ElapsedTimer() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => {
      setElapsed(((Date.now() - start) / 1000));
    }, 100);
    return () => clearInterval(tick);
  }, []);

  return (
    <span className="text-brand-text-faint text-[10px] font-mono tabular tracking-tight">
      {elapsed.toFixed(1)}s
    </span>
  );
}

export default function PendingMessage({ pdfActive = false }) {
  return (
    <motion.div
      className="flex flex-col items-start gap-3 justify-start mr-12 mb-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, filter: 'blur(4px)', y: -8 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="bg-brand-surface border-4 border-brand-border border-l-4 border-l-brand-primary p-8 shadow-[8px_8px_0_0_var(--brand-border)] max-w-3xl relative overflow-hidden w-full">
        {/* AI Accent Bar */}
        <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary" />

        <div className="mb-4 flex justify-between items-center">
          <span className="bg-brand-bg border-2 border-brand-border text-brand-text px-3 py-1 text-xs font-black uppercase font-headline shadow-[2px_2px_0_0_var(--brand-border)]">
            COGNIMED AI Core
          </span>
          <div className="flex items-center gap-3">
            <ElapsedTimer />
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'steps(2)' }}
              className="text-brand-primary text-xs font-mono font-black uppercase tracking-widest"
            >
              INFERRING
            </motion.span>
          </div>
        </div>

        {/* TerminalLoader stacks on top — status voice */}
        <TerminalLoader pdfActive={pdfActive} />

        {/* Spacer between loader and skeleton */}
        <div className="mt-4" />

        {/* RedactedSkeleton — data stream decode effect */}
        <RedactedSkeleton />
      </div>
    </motion.div>
  );
}
