// Item #35 — OdometerDigit: digit-level 3D flip animation for SystemStats
//
// Bug #1: perspective as inline style affects CHILD 3D transforms only when on the PARENT.
//         Set it on OdometerWrapper, not on the motion.span itself.
// Bug #2: type:"spring" ignores duration. Use type:"tween" for precise 0.15s timing.
import { motion } from 'framer-motion';

// ✅ perspective goes on the PARENT WRAPPER — not the animated digit
const OdometerWrapper = ({ children }) => (
  <span style={{ display: 'inline-block', perspective: '400px' }}>
    {children}
  </span>
);

const OdometerDigit = ({ digit }) => (
  <OdometerWrapper>
    <motion.span
      key={digit}
      initial={{ rotateX: -90, opacity: 0, y: -10 }}
      animate={{ rotateX: 0, opacity: 1, y: 0 }}
      transition={{
        type: 'tween',          // ✅ NOT spring — spring ignores duration
        duration: 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        display: 'inline-block',
        backfaceVisibility: 'hidden',
        transformOrigin: 'bottom center',
        fontVariantNumeric: 'tabular-nums slashed-zero',
      }}
    >
      {digit}
    </motion.span>
  </OdometerWrapper>
);

/**
 * OdometerText — renders a string/number with per-digit flip animations.
 * @param {string|number} value — the full value to display
 * @param {string} suffix — e.g. "GB", "ms"
 */
export const OdometerText = ({ value, suffix = '' }) => {
  const chars = String(value).split('');
  return (
    <span className="inline-flex items-baseline" style={{ fontVariantNumeric: 'tabular-nums slashed-zero' }}>
      {chars.map((char, i) => (
        <OdometerDigit key={i} digit={char} />
      ))}
      {suffix && <span className="ml-0.5">{suffix}</span>}
    </span>
  );
};

export default OdometerDigit;
