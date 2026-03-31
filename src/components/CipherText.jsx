// Item #28 — CipherText: cryptographic scramble reveal
// Uses requestAnimationFrame + direct DOM mutation — NOT setState/setInterval.
// React 18+ concurrent mode causes visual tearing with setState at 30ms ticks.
// Uses tabular-nums to prevent width jitter during scramble.
import { useEffect, useRef } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#-X';
const SCRAMBLE_DURATION = 220; // Total duration: 220ms maximum per spec

const CipherText = ({ value, className = '' }) => {
  const textRef = useRef(null);

  useEffect(() => {
    let start = null;
    let animationFrame;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const progress = (timestamp - start) / SCRAMBLE_DURATION;

      if (progress < 1 && textRef.current) {
        textRef.current.textContent = value
          .split('')
          .map((char, i) => {
            if (char === ' ' || char === '-') return char; // preserve separators
            if (i / value.length < progress) return char;  // lock from left
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('');
        animationFrame = requestAnimationFrame(animate);
      } else if (textRef.current) {
        textRef.current.textContent = value; // lock final value
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return (
    <span
      ref={textRef}
      className={className}
      style={{ fontVariantNumeric: 'tabular-nums slashed-zero' }}
    >
      {value}
    </span>
  );
};

export default CipherText;
