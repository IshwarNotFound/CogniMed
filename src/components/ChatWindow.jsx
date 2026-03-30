// Items 14 (isLatest prop) + 15 (Banner memoization)
import { useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import SuggestionCards from './SuggestionCards';
import { CLACK, STAMP } from '../animations/physics';

// ─────────────────────────────────────────────────────────────────
// Item 15 — Interface Memoization
// The "AI Core" banner entrance animation (STAMP/CLACK) must fire
// precisely once. React.memo prevents parent re-renders from
// triggering it again on every message received.
// ─────────────────────────────────────────────────────────────────
const NeuralBanner = memo(function NeuralBanner() {
  return (
    <div className="bg-brand-surface border-4 border-brand-border p-4 shadow-[8px_8px_0_0_var(--brand-border)] flex items-start gap-4 mb-3 mt-1 transition-colors">
      <div className="bg-brand-bg border-2 border-brand-border p-3 text-brand-primary shadow-[2px_2px_0_0_var(--brand-border)]">
        <motion.span
          className="material-symbols-outlined text-2xl block"
          style={{ fontVariationSettings: "'FILL' 1" }}
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1.1, 1] }}
          transition={CLACK}
        >
          psychology
        </motion.span>
      </div>
      <div>
        <motion.h3
          className="text-xl font-black font-headline uppercase leading-none mb-1 text-brand-text"
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ ...STAMP, delay: 0 }}
        >
          Neural Inference Active
        </motion.h3>
        <p className="text-sm font-bold leading-tight text-brand-text-muted">
          AI engine is live and monitoring the current diagnostic baseline. Upload clinical documents or inquire below.
        </p>
      </div>
    </div>
  );
});

export default function ChatWindow({ history, isLoading, onSuggestionSelect, theme }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  // Item 14 — Find the index of the last AI message so we can pass isLatest=true
  const lastAiIndex = (() => {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === 'assistant') return i;
    }
    return -1;
  })();

  return (
    <div className="space-y-3">
      {/* Item 15 — Memoized banner: entrance fires once, never re-triggers */}
      <NeuralBanner />

      {history.length === 0 ? (
        <SuggestionCards onSelect={onSuggestionSelect} theme={theme} />
      ) : (
        <div className="space-y-6 pb-4">
          <AnimatePresence initial={false}>
            {history.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                theme={theme}
                // Item 14 — only the last AI message gets the typewriter effect
                isLatest={msg.role === 'assistant' && idx === lastAiIndex && !isLoading}
              />
            ))}
          </AnimatePresence>
          <AnimatePresence>
            {isLoading && <TypingIndicator key="typing" theme={theme} />}
          </AnimatePresence>
          <div ref={bottomRef} className="h-2" />
        </div>
      )}
    </div>
  );
}
