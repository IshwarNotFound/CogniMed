// Items #3, #4, #21, #30, #33 — InputBar
// #3:  "Analyze" button label + ↵ hint
// #4:  Disabled button shadow recedes (btn-analyze class)
// #21: Token budget arc (scaleX, not gradient — no layout thrash)
// #30: Active engaged state — lifts on focus
// #33: Keyboard ghost text when empty + focused
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SNAP, CLACK, getSpring } from '../animations/physics';

// Medical token ratio: word_count * 1.2 (20% penalty for medical vocab)
const MAX_CONTEXT_TOKENS = 4096;

export default function InputBar({ onSend, disabled, theme }) {
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef(null);

  const isArmed = input.trim().length > 0 || !!imageFile;
  const spring = getSpring(theme);

  // ─── Item #21 — Token Budget Arc ────────────────────────────────────────────
  const words = input.trim().split(/\s+/).filter(Boolean).length;
  const estimatedTokens = Math.floor(words * 1.2);
  const tokenPercent = Math.min((estimatedTokens / MAX_CONTEXT_TOKENS) * 100, 100);
  const arcColor =
    tokenPercent < 70 ? 'var(--brand-text-faint)' :
    tokenPercent < 90 ? 'var(--brand-warning)' :
                        'var(--brand-error)';

  const handleSend = () => {
    if ((!input.trim() && !imageFile) || disabled) return;
    const capturedFile = imageFile;
    const capturedPreview = imagePreview;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setInput('');
    setImageFile(null);
    setImagePreview(null);
    onSend(input, capturedFile, capturedPreview);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full relative">
      {/* Image Preview — Polaroid Eject */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            key="image-preview"
            className="absolute left-0 w-32 h-32 bg-brand-surface border-4 border-brand-border group z-50"
            style={{ bottom: '100%', marginBottom: '16px' }}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={spring}
          >
            <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
            <button
              onClick={removeImage}
              className="absolute -top-3 -right-3 bg-brand-error text-white p-1 border-2 border-brand-border shadow-[2px_2px_0_0_var(--brand-border)] hover:scale-110 transition-transform"
            >
              <X className="w-5 h-5" strokeWidth={3} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Item #30 — Active Engaged State (lifts on focus) ─────────────────── */}
      <motion.div
        animate={{
          y: isFocused ? -1 : 0,
          boxShadow: isFocused
            ? '6px 6px 0px var(--brand-text)'
            : '4px 4px 0px var(--brand-text)',
        }}
        transition={SNAP}
        className={`bg-brand-surface border-4 p-2 flex flex-col sm:flex-row items-center gap-4 relative w-full transition-colors ${
          isFocused ? 'border-brand-primary' : 'border-brand-border'
        }`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <button
          className="material-symbols-outlined p-4 text-brand-text-muted hover:text-brand-text shrink-0 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          attach_file
        </button>
        <input
          type="file"
          accept="image/jpeg, image/png"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageSelect}
        />

        {/* Textarea wrapper — relative for ghost text overlay */}
        <div className="flex-1 relative w-full">
          <div className="absolute -top-3 right-0 flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-1.5 py-0.5 bg-brand-bg border border-brand-border/30 text-[8px] font-mono font-black text-brand-primary uppercase tracking-tighter">
              <span className="w-1 h-1 bg-brand-primary rounded-full dot-critical" />
              SECURE TUNNEL
            </span>
            <span className="text-[8px] font-mono text-brand-text-faint uppercase tracking-tighter">
              EST. TOKENS: {estimatedTokens}
            </span>
          </div>

          <input
            className="flex-1 bg-transparent border-none focus:ring-0 font-headline font-black text-xl text-brand-text placeholder:text-brand-text-muted uppercase py-4 outline-none w-full"
            placeholder={imageFile ? "IMAGE ATTACHED. ADD QUERY..." : "QUERY CLINICAL INTELLIGENCE..."}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
          />

          <div className="absolute bottom-3 right-0 flex gap-3 text-[9px] uppercase tracking-widest text-brand-text-muted pointer-events-none select-none font-mono opacity-40">
            <span>[ENTER] ANALYZE</span>
            <span className="hidden sm:inline">[SHIFT+ENTER] NEW LINE</span>
          </div>
        </div>

        {/* ─── Item #3 — "Analyze" Button (was "Process") ──────────────────────
            Item #4 — btn-analyze class controls shadow recede on disabled state  */}
        <motion.button
          id="analyze-btn"
          onClick={handleSend}
          disabled={!isArmed || disabled}
          animate={{
            boxShadow: isArmed
              ? '4px 4px 0px var(--brand-text)'
              : '2px 2px 0px var(--brand-text)',
          }}
          whileTap={isArmed ? { x: 4, y: 4, boxShadow: '0px 0px 0px 0px var(--brand-text)' } : {}}
          transition={isArmed ? CLACK : { duration: 0 }}
          className={`btn-analyze w-full sm:w-auto bg-brand-primary text-black border-4 border-brand-border px-8 py-4 font-headline font-black uppercase flex items-center justify-center gap-2 ${
            !isArmed || disabled ? 'opacity-35 cursor-not-allowed' : ''
          }`}
        >
          Analyze <span className="ml-1 opacity-60 text-xs">↵</span>
        </motion.button>
      </motion.div>

      {/* ─── Item #21 — Token Budget Arc ──────────────────────────────────────
          scaleX on fixed container — GPU compositing only, zero layout thrash.
          NEVER animate linear-gradient (forces full repaint every keystroke).    */}
      <div className="h-[2px] w-full bg-transparent origin-left relative overflow-hidden mt-0">
        <motion.div
          className="absolute inset-0 origin-left"
          style={{ backgroundColor: arcColor }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: tokenPercent / 100 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
        />
      </div>
    </div>
  );
}
