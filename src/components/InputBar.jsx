import { useState, useRef } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import { X } from 'lucide-react';
import { SPRING_DARK, SPRING_LIGHT, getSpring } from '../animations/physics';

export default function InputBar({ onSend, disabled, theme }) {
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef(null);
  const containerControls = useAnimationControls();

  const isArmed = input.trim().length > 0 || !!imageFile;
  const spring = getSpring(theme);

  const handleSend = () => {
    if ((!input.trim() && !imageFile) || disabled) return;

    // Item 5 — Memory Leak Prevention
    // Capture snapshots BEFORE revoking so onSend receives valid references
    const capturedFile = imageFile;
    const capturedPreview = imagePreview;

    // Immediately destroy the browser's temporary blob allocation
    if (imagePreview) URL.revokeObjectURL(imagePreview);

    // Reset local state
    setInput('');
    setImageFile(null);
    setImagePreview(null);

    // Fire upward with captured snapshot — never with the stale state values
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

  const handleFocus = () => {
    setIsFocused(true);
    if (theme === 'dark') {
      // Power surge glow that fades
      containerControls.start({
        boxShadow: [
          '0 0 0 3px var(--brand-primary)',
          '0 0 0 0px transparent',
        ],
        transition: { duration: 0.2, ease: 'linear' },
      });
    }
  };

  const handleBlur = () => setIsFocused(false);

  return (
    <div className="w-full relative">
      {/* Polaroid Image Eject */}
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

      {/* Main container with focus border snap */}
      <motion.div
        animate={containerControls}
        className={`bg-brand-surface border-4 p-2 flex flex-col sm:flex-row items-center gap-4 relative w-full transition-colors neo-brutal-shadow ${
          isFocused ? 'border-brand-primary' : 'border-brand-border'
        }`}
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

        <input
          className="flex-1 bg-transparent border-none focus:ring-0 font-headline font-black text-xl text-brand-text placeholder:text-brand-text-muted uppercase py-4 outline-none w-full"
          placeholder={imageFile ? "IMAGE ATTACHED. ADD QUERY..." : "QUERY CLINICAL INTELLIGENCE..."}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
        />

        {/* Send Button — armed state + whileTap clack */}
        <motion.button
          onClick={handleSend}
          disabled={!isArmed || disabled}
          animate={{
            boxShadow: isArmed
              ? '10px 10px 0px 0px var(--brand-border)'
              : '8px 8px 0px 0px var(--brand-border)',
          }}
          whileTap={isArmed ? { x: 4, y: 4, boxShadow: '0px 0px 0px 0px var(--brand-border)' } : {}}
          transition={theme === 'dark' ? SPRING_DARK : SPRING_LIGHT}
          className="w-full sm:w-auto bg-brand-primary text-black border-4 border-brand-border px-8 py-4 font-headline font-black uppercase flex items-center justify-center gap-2 disabled:opacity-50"
        >
          Process <span className="material-symbols-outlined shrink-0 text-black">bolt</span>
        </motion.button>
      </motion.div>
    </div>
  );
}
