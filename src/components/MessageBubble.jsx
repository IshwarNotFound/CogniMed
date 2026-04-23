// Items #2, #6, #11, #14, #25, #27 — MessageBubble
// #2:  max-w-[72ch] on MarkdownRenderer
// #6:  Entry animation: x:-60 → y:12 (rise from below, not lateral slam)
// #11: Analysis Complete border flash + isHistorical schema
// #14: Asymmetric bubble hierarchy — border-r-4 on user, border-l-4 on AI
// #25: Active exchange left-border anchor data-is-latest
// #27: CopyButton — icon morphs Copy→Check (no toast)
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { SNAP, COUNTER } from '../animations/physics';
import MarkdownRenderer from './MarkdownRenderer';
import CopyButton from './CopyButton';

/**
 * NumberTicker — isolated per-message number counter.
 * Item #9: duration changed 1.2→0.55s via COUNTER physics.
 */
function NumberTicker({ value, decimals = 0, suffix = '' }) {
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const unsubscribe = motionVal.on('change', (v) => {
      setDisplay(decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString());
    });
    return unsubscribe;
  }, [motionVal, decimals]);

  useEffect(() => {
    // NaN guard: coerce bad values before animating
    const safeValue = isNaN(Number(value)) ? 0 : Number(value);
    // Item #9 — Duration 0.55s (was 1.2s). Users read final value in periphery
    // before animation finishes at 1.2s — creates cognitive dissonance.
    const controls = animate(motionVal, safeValue, COUNTER);
    return controls.stop;
  }, [value, motionVal]);

  return <span className="tabular">{display}{suffix}</span>;
}

/** Citation row stagger variants */
const citationVariants = {
  hidden: { opacity: 0, y: -8 },
  show: { opacity: 1, y: 0 },
};

/**
 * MessageBubble
 * @param {object} message
 * @param {boolean} message.isHistorical — true if loaded from storage (prevents batch flash)
 * @param {string} theme
 * @param {boolean} isLatest — last AI message in active session
 * @param {boolean} isActiveExchange — last user/AI exchange pair
 */
export default function MessageBubble({
  message,
  theme,
  isLatest = false,
  isActiveExchange = false,
}) {
  const isUser = message.role === 'user';
  const [showCitations, setShowCitations] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  // ─── Item #11 — Analysis Complete Border Flash ─────────────────────────────
  // isHistorical flag prevents batch-flashing all historical messages on load.
  useEffect(() => {
    if (message.status === 'complete' && !message.isHistorical) {
      setJustCompleted(true);
      const t = setTimeout(() => setJustCompleted(false), 600);
      return () => clearTimeout(t);
    }
  }, [message.status, message.isHistorical]);

  // ─── Item #6 — Entry Animation ──────────────────────────────────────────────
  // Latest AI message gets a clip-path reveal (content "declassifies" from the left accent bar).
  // Historical and older messages use a simple fade-rise to avoid replay noise.
  const isNewAiResponse = !isUser && !message.isHistorical && isActiveExchange;

  const messageVariants = {
    initial: isNewAiResponse
      ? { opacity: 0, clipPath: 'inset(0 100% 0 0)' }
      : { opacity: 0, y: 12 },
    animate: isNewAiResponse
      ? {
          opacity: 1,
          clipPath: 'inset(0 0% 0 0)',
          transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.08 },
        }
      : {
          opacity: 1,
          y: 0,
          transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] },
        },
  };

  if (isUser) {
    return (
      // Item #6 — layout="position" parent animates existing messages' repositioning
      <motion.div
        layout="position"
        transition={SNAP}
        className="flex justify-end ml-12 mb-6"
        variants={messageVariants}
        initial="initial"
        animate="animate"
      >
        {/* ─── Item #14 — Asymmetric Bubble Hierarchy ────────────────────────────
            User: border-r-4 border-brand-secondary (RIGHT side anchor)
            Removed old border-l-[6px] which was wrong side for right-aligned bubble */}
        <div
          className={`bg-brand-surface-high border-4 border-brand-border border-r-4 border-r-brand-secondary p-6 shadow-[4px_4px_0_0_var(--brand-border)] max-w-2xl relative ${
            isActiveExchange ? 'border-l-[2px] border-l-brand-primary/20' : ''
          }`}
          data-is-latest={isActiveExchange ? 'true' : undefined}
        >
          {message.imagePreview && (
            <div className="mb-4 bg-zinc-100 border-2 border-brand-border p-2">
              <img src={message.imagePreview} alt="Attached" className="max-w-[200px] h-auto border-2 border-brand-border" />
            </div>
          )}
          <p className="font-bold text-lg whitespace-pre-wrap text-brand-text">{message.content}</p>
          <span className="block text-[10px] font-black uppercase text-brand-text-muted mt-4 font-headline">User Query</span>
        </div>
      </motion.div>
    );
  }

  return (
    // Item #6 — layout="position" parent for smooth repositioning of existing messages
    <motion.div
      layout="position"
      transition={SNAP}
      className="flex flex-col items-start gap-3 justify-start mr-12 mb-6"
      variants={messageVariants}
      initial="initial"
      animate="animate"
    >
      {/* ─── Item #14 — AI: border-l-4 border-brand-primary (LEFT side anchor) ──
          Item #11: complete-flash class does pulse from brand-primary→text→primary  */}
      <div
        className={`bg-brand-surface border-4 border-brand-border border-l-4 border-l-brand-primary p-8 shadow-[8px_8px_0_0_var(--brand-border)] max-w-3xl relative overflow-hidden ${
          justCompleted ? 'complete-flash' : ''
        } ${isActiveExchange ? 'message-bubble' : ''}`}
        data-is-latest={isActiveExchange ? 'true' : undefined}
      >
        {/* AI Accent Bar */}
        <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary" />

        <div className="mb-6 flex justify-between items-center gap-2">
          <span className="bg-brand-bg border-2 border-brand-border text-brand-text px-3 py-1 text-xs font-black uppercase font-headline shadow-[2px_2px_0_0_var(--brand-border)]">
            COGNIMED AI Core
          </span>
          <div className="flex items-center gap-2">
            {/* Item #27 — CopyButton: icon morphs Copy→Check, no toast text */}
            <CopyButton content={message.content} />
            <span className="text-brand-primary material-symbols-outlined">verified</span>
          </div>
        </div>

        {/* ─── Item #2 — max-w-[72ch] on MarkdownRenderer wrapper ───────────────
            65–72 chars is typographic golden ratio for readable prose.
            Current max-w-3xl (768px) allows 90–100 chars — too wide.              */}
        <div className="mb-6">
          <div className="prose max-w-[72ch]">
            <MarkdownRenderer content={message.content} />
          </div>
        </div>

        {/* Citations Accordion */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-8 border-t-2 border-brand-border">
            <button
              onClick={() => setShowCitations(!showCitations)}
              className="bg-brand-surface border-2 border-brand-border text-brand-text px-3 py-1 flex items-center gap-2 hover:bg-brand-primary hover:text-black transition-colors uppercase font-black text-xs font-headline cursor-pointer mt-4 mb-2 shadow-[2px_2px_0_0_var(--brand-border)]"
            >
              <span className="material-symbols-outlined text-sm">link</span>
              {showCitations ? 'HIDE SOURCES' : `VIEW SOURCES [${message.citations.length}]`}
            </button>

            <AnimatePresence>
              {showCitations && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="pt-4 border-4 border-brand-border overflow-hidden">
                    <motion.table
                      className="w-full text-left font-headline"
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: {},
                        show: { transition: { staggerChildren: 0.06 } },
                      }}
                    >
                      <thead className="bg-brand-surface-high text-brand-text border-b-4 border-brand-border">
                        <tr>
                          <th className="p-3 text-xs uppercase font-black">Source / Pg</th>
                          <th className="p-3 text-xs uppercase font-black">Extracted Fact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-brand-border bg-brand-surface">
                        {message.citations.map((cit, idx) => (
                          <motion.tr
                            key={idx}
                            variants={citationVariants}
                            className="hover:bg-brand-surface-high transition-colors"
                          >
                            <td className="p-3 font-bold text-sm min-w-[100px] align-top border-r-2 border-brand-border text-brand-primary tabular">
                              PG: {cit.page}
                            </td>
                            <td className="p-3 font-bold text-sm italic text-brand-text">"{cit.text}"</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </motion.table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Telemetry Metrics Row */}
      {(message.inferenceTime || message.tokensPerSecond) && (
        <div className="flex gap-6 px-2 mt-2">
          {message.inferenceTime && (
            <div className="flex items-center gap-2 inference-time">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Inference Time:</span>
              <span className="text-[10px] font-black text-brand-primary font-mono tabular">
                <NumberTicker value={message.inferenceTime} />ms
              </span>
            </div>
          )}
          {message.tokensPerSecond && (
            <div className="flex items-center gap-2 token-count">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Tokens/sec:</span>
              <span className="text-[10px] font-black text-brand-secondary font-mono tabular">
                <NumberTicker value={message.tokensPerSecond} decimals={1} />
              </span>
            </div>
          )}
          {message.tokensGenerated && (
            <div className="flex items-center gap-2 token-count">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Tokens:</span>
              <span className="text-[10px] font-black text-brand-tertiary font-mono tabular">
                <NumberTicker value={message.tokensGenerated} />
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
