// Items #6, #10, #13 — ChatWindow
// PRESERVES the original simple structure — parent in App.jsx handles scrolling
// #6:  layout="position" on message wrappers
// #10: Back to Present scroll pill — delegated to parent scroll container
// #13: Message group compression
import { useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import PendingMessage from './PendingMessage';
import SuggestionCards from './SuggestionCards';
import { CLACK, SNAP, STAMP } from '../animations/physics';

// ─── Hero-scale Neural Banner for empty state ────────────────────────────────
const NeuralBannerHero = memo(function NeuralBannerHero() {
  return (
    <div className="bg-brand-surface border-4 border-brand-border shadow-[8px_8px_0_0_var(--brand-border)] flex items-center gap-6 px-8 py-6 transition-colors w-full">
      {/* Neural Processor Socket */}
      <div className="relative p-2 bg-brand-bg border-4 border-brand-border shadow-[4px_4px_0_0_var(--brand-border)] shrink-0 group">
        <div className="absolute inset-0 opacity-10 pointer-events-none hazard-pattern" />
        <div className="bg-brand-surface border-2 border-brand-border p-4 relative z-10">
          <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-brand-primary" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-brand-primary" />
          <motion.span
            className="material-symbols-outlined text-5xl block text-brand-primary drop-shadow-[0_0_8px_rgba(0,238,252,0.4)]"
            style={{ fontVariationSettings: "'FILL' 1" }}
            initial={{ scale: 0.8 }}
            animate={{ scale: [0.8, 1.1, 1] }}
            transition={CLACK}
          >
            psychology
          </motion.span>
        </div>
      </div>
      <div className="flex-1">
        <motion.h2
          className="text-3xl font-black font-headline uppercase leading-none mb-2 text-brand-text"
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ ...STAMP, delay: 0 }}
        >
          Neural Inference Active
        </motion.h2>
        <p className="text-sm font-bold leading-snug text-brand-text-muted max-w-lg">
          AI engine is live and monitoring the current diagnostic baseline. Upload clinical documents or inquire below.
        </p>
      </div>
      <div className="shrink-0 hidden lg:flex flex-col gap-2 items-end">
        <span className="flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-widest text-brand-primary">
          <span className="w-2 h-2 bg-brand-primary block dot-critical" />
          ENGINE LIVE
        </span>
        <span className="text-[10px] font-mono text-brand-text-faint uppercase tracking-widest">
          MEDGEMMA · LOCAL
        </span>
      </div>
    </div>
  );
});

// ─── Compact Neural Banner for chat-active state ─────────────────────────────
const NeuralBannerCompact = memo(function NeuralBannerCompact() {
  return (
    <div className="bg-brand-surface border-4 border-brand-border p-4 shadow-[8px_8px_0_0_var(--brand-border)] flex items-start gap-4 transition-colors">
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
          AI engine is live and monitoring the current diagnostic baseline.
        </p>
      </div>
    </div>
  );
});

// Item #13 — consecutive same-role messages compress spacing
const isGrouped = (messages, index) =>
  index > 0 && messages[index].role === messages[index - 1].role;

export default function ChatWindow({ history, isLoading, onSuggestionSelect, theme, pdfActive }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const lastAiIndex = (() => {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === 'assistant') return i;
    }
    return -1;
  })();

  const lastExchangeStart = (() => {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === 'user') return i;
    }
    return -1;
  })();

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (history.length === 0) {
    return (
      <div className="flex flex-col gap-5 pb-4">
        <NeuralBannerHero />
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="material-symbols-outlined text-brand-text-muted text-sm">bolt</span>
            <span className="text-[10px] font-black uppercase font-headline text-brand-text-muted tracking-widest">Diagnostic Quickstart</span>
            <div className="flex-1 h-[2px] bg-brand-border/40 ml-2" />
          </div>
          <SuggestionCards onSelect={onSuggestionSelect} theme={theme} />
        </div>
      </div>
    );
  }

  // ── Chat active state ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1">
      <NeuralBannerCompact />
      <div className="pb-4 mt-4">
        <AnimatePresence initial={false} mode="sync">
          {history.map((msg, idx) => {
            const grouped = isGrouped(history, idx);
            const isActiveExchange = idx >= lastExchangeStart;
            return (
              <motion.div
                key={msg.id}
                layout="position"
                transition={SNAP}
                className={grouped ? 'mt-1' : 'mt-4'}
              >
                <MessageBubble
                  message={msg}
                  theme={theme}
                  isLatest={msg.role === 'assistant' && idx === lastAiIndex && !isLoading}
                  isActiveExchange={isActiveExchange}
                />
              </motion.div>
            );
          })}
          {isLoading && <PendingMessage key="pending" pdfActive={pdfActive} />}
        </AnimatePresence>
        <div ref={bottomRef} className="h-2" />
      </div>
    </div>
  );
}
