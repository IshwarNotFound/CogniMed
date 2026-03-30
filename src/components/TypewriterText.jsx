// Item 14 — Non-Blocking Typewriter Simulation
// Architecturally decoupled from parent: no callbacks, no shared state,
// no blocking of parent renders. Interval is cleaned up on unmount.
// onComplete fires once all characters are revealed so the parent can
// switch from raw-text typewriter to the full MarkdownRenderer.
import { useState, useEffect, useRef } from 'react';

/**
 * TypewriterText — renders text character-by-character at speedMs per char.
 * @param {string}   text       - Full text to reveal
 * @param {number}   speedMs    - Milliseconds between characters (default 8ms)
 * @param {function} onComplete - Optional callback fired when animation finishes
 */
export default function TypewriterText({ text, speedMs = 8, onComplete }) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);
  const intervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  // Keep callback ref up-to-date without re-triggering the effect
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    // Reset on new text
    indexRef.current = 0;
    setDisplayed('');

    // Clear any running interval from previous text
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        indexRef.current += 1;
        setDisplayed(text.slice(0, indexRef.current));
      } else {
        // Reveal complete — clean up and notify parent
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        if (onCompleteRef.current) onCompleteRef.current();
      }
    }, speedMs);

    // Cleanup on unmount or text change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [text, speedMs]);

  return <span>{displayed}</span>;
}
