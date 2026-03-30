import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import SuggestionCards from './SuggestionCards';
import { CLACK, STAMP, getSpring } from '../animations/physics';

export default function ChatWindow({ history, isLoading, onSuggestionSelect, theme }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  return (
    <div className="space-y-3">
      {/* Neural Inference Active Banner */}
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
          <p className="text-sm font-bold leading-tight text-brand-text-muted">AI engine is live and monitoring the current diagnostic baseline. Upload clinical documents or inquire below.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <SuggestionCards onSelect={onSuggestionSelect} theme={theme} />
      ) : (
        <div className="space-y-6 pb-4">
          <AnimatePresence initial={false}>
            {history.map((msg) => (
              <MessageBubble key={msg.id} message={msg} theme={theme} />
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
