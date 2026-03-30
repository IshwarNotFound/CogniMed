// Items 8, 11, 14 — MessageBubble
// 8: MarkdownRenderer replaces raw text (XSS-safe AST parsing)
// 11: Asymmetric visual hierarchy — heavy brand-secondary left border on user bubbles
// 14: TypewriterText applied only to the latest AI message (non-blocking)
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { getSpring, DATA_REVEAL, FLASH } from '../animations/physics';
import MarkdownRenderer from './MarkdownRenderer';
import TypewriterText from './TypewriterText';

/**
 * NumberTicker — isolated per-message number counter.
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
    // Item 6 — NaN guard: coerce bad values before animating
    const safeValue = isNaN(Number(value)) ? 0 : Number(value);
    const controls = animate(motionVal, safeValue, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [value, motionVal]);

  return <span>{display}{suffix}</span>;
}

/** Citation row stagger variants */
const citationVariants = {
  hidden: { opacity: 0, y: -8 },
  show: { opacity: 1, y: 0 },
};

/**
 * @param {object} message
 * @param {string} theme
 * @param {boolean} isLatest — if true, AI content renders via TypewriterText
 */
export default function MessageBubble({ message, theme, isLatest = false }) {
  const isUser = message.role === 'user';
  const [showCitations, setShowCitations] = useState(false);
  // Once TypewriterText finishes, switch to MarkdownRenderer so ** marks are parsed
  const [typewriterDone, setTypewriterDone] = useState(!isLatest);
  const handleTypewriterComplete = useCallback(() => setTypewriterDone(true), []);
  const spring = getSpring(theme);

  if (isUser) {
    return (
      <motion.div
        className="flex justify-end ml-12 mb-6"
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={spring}
      >
        {/* Item 11 — Asymmetric Visual Hierarchy: heavy brand-secondary left accent */}
        <div className="bg-brand-surface-high border-4 border-brand-border border-l-[6px] border-l-brand-secondary p-6 shadow-[4px_4px_0_0_var(--brand-border)] max-w-2xl relative">
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
    <motion.div
      className="flex flex-col items-start gap-3 justify-start mr-12 mb-6"
      initial={{ opacity: 0, x: -60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={spring}
    >
      <div className="bg-brand-surface border-4 border-brand-border p-8 shadow-[8px_8px_0_0_var(--brand-border)] max-w-3xl relative overflow-hidden">
        {/* AI Accent Bar — Light theme only */}
        {theme === 'light' && (
          <motion.div
            className="absolute top-0 left-0 w-2 bg-brand-primary"
            initial={{ height: '0%' }}
            animate={{ height: '100%' }}
            transition={DATA_REVEAL}
          />
        )}
        {/* Dark theme — static accent bar */}
        {theme !== 'light' && (
          <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary" />
        )}

        <div className="mb-6 flex justify-between items-center">
          <span className="bg-brand-bg border-2 border-brand-border text-brand-text px-3 py-1 text-xs font-black uppercase font-headline shadow-[2px_2px_0_0_var(--brand-border)]">COGNIMED AI Core</span>
          <span className="text-brand-primary material-symbols-outlined">verified</span>
        </div>

        {/* Item 8 — Secure AST Markdown Rendering (no dangerouslySetInnerHTML) */}
        {/* Item 14 — TypewriterText only on the latest AI message.
            Once typewriterDone=true (animation complete), switches to MarkdownRenderer
            so '**bold**' markers are always properly parsed — never raw text. */}
        {theme === 'dark' ? (
          <motion.div
            initial={{ backgroundColor: 'var(--brand-primary)' }}
            animate={{ backgroundColor: 'transparent' }}
            transition={FLASH}
            className="mb-6"
          >
            {isLatest && !typewriterDone ? (
              <div className="font-bold text-brand-text leading-relaxed text-[17px]">
                <TypewriterText
                  text={message.content}
                  speedMs={8}
                  onComplete={handleTypewriterComplete}
                />
              </div>
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
          </motion.div>
        ) : (
          <div className="mb-6">
            {isLatest && !typewriterDone ? (
              <div className="font-bold text-brand-text leading-relaxed text-[17px]">
                <TypewriterText
                  text={message.content}
                  speedMs={8}
                  onComplete={handleTypewriterComplete}
                />
              </div>
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
          </div>
        )}

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
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
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
                            <td className="p-3 font-bold text-sm min-w-[100px] align-top border-r-2 border-brand-border text-brand-primary">PG: {cit.page}</td>
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
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Inference Time:</span>
              <span className="text-[10px] font-black text-brand-primary font-mono">
                <NumberTicker value={message.inferenceTime} />ms
              </span>
            </div>
          )}
          {message.tokensPerSecond && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Tokens/sec:</span>
              <span className="text-[10px] font-black text-brand-secondary font-mono">
                <NumberTicker value={message.tokensPerSecond} decimals={1} />
              </span>
            </div>
          )}
          {message.tokensGenerated && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">Tokens:</span>
              <span className="text-[10px] font-black text-brand-tertiary font-mono">
                <NumberTicker value={message.tokensGenerated} />
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
