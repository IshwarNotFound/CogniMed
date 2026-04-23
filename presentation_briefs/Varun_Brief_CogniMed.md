# ⚕️ CogniMed Presentation Brief: Varun (UI/UX & Motion Eng.)

## 📌 Role Overview
**Your Role:** Person 3 - UI/UX & Motion Engineer (The Aesthetic Surgeon)
**Focus:** Neo-Brutalist Theming, Micro-interactions, and Framer Motion Physics.
**Key Files Owned:** `index.css`, `physics.js`, `CipherText.jsx`, `TerminalLoader.jsx`

As the Aesthetic Surgeon, you transformed generic React layouts into a premium, cinematic software experience. You coded the "Neo-Brutalism" medical theme and explicitly tuned the physical physics of the application components to feel visceral, mechanical, and highly responsive.

---

## 🔬 Core Logic & Code Breakdown

### 1. The Design System Matrix: `index.css` & Tailwind
You stripped away generic styling and built a proprietary token system based on "Neo-Brutalism" (harsh lines, bold shadows, hyper-contrast).
- **CSS Variable Mapping:** You designed the entire application architecture around `--brand-bg`, `--brand-surface`, `--brand-primary`. Because components use variables instead of static colors, swapping classes at the HTML root natively triggers complex dark-mode logic without heavy Javascript observation.
- **Neo-Brutal Depth & Physics:** You created utility classes like `.neo-brutal-shadow-sm` which applies absolute offset box-shadows (e.g., `4px 4px 0 0 black`). 
- **The Mechanical Click Effect:** You utilized Tailwind transforms `translate-x-[2px] translate-y-[2px]` and stripped the shadow during hover/active states. This combination visually simulates a physical clinical switch being depressed instantly.

### 2. The Physics Engine: `physics.js` & Framer Motion
- Instead of relying on passive CSS `transition: all 0.2s ease`, you integrated `framer-motion` to run real physical mass/spring simulations.
- You curated a dictionary (`SNAP`, `STAMP`, `CLACK`). For example, `STAMP` applies a heavy damping spring to simulate text physically slamming into position.
- **Odometer Numeric Routing:** For the AI data trackers (like PDF chunking), you bypassed direct text injection and bound a hook (`useMotionValue`). The number dynamically "rolls" along an easing curve (`[0.22, 1, 0.36, 1]`) ensuring numbers look organic rather than glitching instantly into place.

### 3. Custom WoW Features: `CipherText.jsx` & `TerminalLoader.jsx`
- **Cryptographic CipherText:** You built a hacker-style effect that visually scrambles text strings using raw ASCII mapping. It runs inside a `useEffect` loop relying on the browser's `requestAnimationFrame` (rather than standard JS intervals) for ultra-smooth 60fps framerates. It sequentially reveals the actual substring calculated from a duration limit.
- **TerminalLoader Logic:** The `TerminalLoader` component actively mounts an array of realistic string prompts that dynamically transition using Framer's `AnimatePresence`. They stagger with `opacity` and `y` sweeps, anchoring the "Neural Backend" illusion during high-latency RAG calls without using generic spinning loading circles.

---

## 🎤 Presentation Q&A Sandbox

**Q: Explain the UI aesthetic. What is "Neo-Brutalism" and why use it for a medical app?**  
**Your Answer:** "I strongly advised against the standard, flat 'generic SaaS' look for CogniMed. Medical and tactical inference software should feel precise, rigid, and high-contrast—not soft and bubbly. I built the 'Neo-Brutalism' system using deep absolute offset drop-shadows, strict capital monospaced typography, and high-contrast boundary lines. When you click our buttons, the shadow collapses and the button actually translates 2 pixels on the X/Y matrix, which provides immense physical feedback resembling a mechanical medical switch."

**Q: How do you manage the animations so they feel cohesive acting across multiple deeply nested components?**  
**Your Answer:** "If you hardcode CSS keyframes everywhere, motion gets messy and unsynced. I built a central abstraction file, `physics.js`, leveraging Framer Motion. I defined immutable spring configurations based on mass, damping, and stiffness—like `SNAP` for instant layout resizing, and `STAMP` for heavy clinical reveals. Engineers across the project import these variables statically, meaning the entire UI mathematically moves in perfect synchrony with identical friction data."

**Q: Expand on your method for numeric telemetry (the number counters in the PDF uploader).**  
**Your Answer:** "React state limits update numbers instantly, which is jittery. I wired a `useMotionValue` hook tracking a floating-point integer. When Mohit's PDF ingestion returns '45' chunks, I animate the motion value toward 45 using a custom bezier easing curve. I then attached an event listener that rounds that float to the nearest whole integer per frame, rendering an organic rolling odometer effect over precisely exactly 0.55 seconds."

**Q: The CipherText effect on the Session Profile Case ID is incredibly smooth. How did you write that?**  
**Your Answer:** "Most developers use `setInterval` for text scrambles, which collides disastrously with React 18's concurrent rendering, producing tearing. I bypassed React's state loop entirely for the text swap. I utilized native browser `requestAnimationFrame` inside a `useEffect` to execute a delta-timestamp loop. It iterates through the string array, swapping locked indices for random ASCII elements based on total completion time. And I wrapped it in `tabular-nums` CSS so the element width doesn't shake side-to-side during the scrambling sequences."

---

## 💻 Source Code Annex


### File: src/index.css
```css
@import "tailwindcss";

@theme {
  /* LIGHT TRANSLATION (Based on Stitch 'Clinical Pulse Neo') */
  --color-brand-bg: #f6f6f6;
  --color-brand-surface: #ffffff;
  --color-brand-surface-high: #e7e8e8;
  --color-brand-text: #2d2f2f;
  --color-brand-text-muted: #5a5c5c;
  --color-brand-border: #2d2f2f;
  --color-brand-primary: #00eefc;
  --color-brand-secondary: #a400a4;
  --color-brand-tertiary: #cafd00;
  --color-brand-error: #fb5151;
  --color-brand-warning: #f59e0b;
  --color-brand-text-faint: #9a9c9c;
  --color-brand-text-inverse: #ffffff;

  --font-sans: "Manrope", system-ui, sans-serif;
  --font-headline: "Space Grotesk", sans-serif;
}

@custom-variant dark (&:where(.dark, .dark *));

.dark {
  /* DARK TRANSLATION (Based on Stitch 'The Neon Monolith') */
  --color-brand-bg: #0D0E0F;
  --color-brand-surface: #181A1B;
  --color-brand-surface-high: #1E2021;
  --color-brand-text: #F9F9F9;
  --color-brand-text-muted: #757576;
  --color-brand-text-faint: #4a4b4c;
  --color-brand-text-inverse: #0D0E0F;
  --color-brand-border: #000000;
  
  --color-brand-primary: #00F0FF;
  --color-brand-secondary: #FF00FF;
  --color-brand-tertiary: #CCFF00;
  --color-brand-error: #ff716c;
  --color-brand-warning: #fbbf24;
}

@layer base {
  body {
    background-color: var(--brand-bg);
    color: var(--brand-text);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    margin: 0;
    padding: 0;
    min-height: 100vh;
    transition: background-color 0.2s ease, color 0.2s ease;
  }
}

/* ── ITEM #1 — Tabular Numerals + Slashed Zero ────────────────────────── */
.font-mono,
.tabular,
[data-numeric],
.case-id,
.system-stats,
.token-count,
.inference-time {
  font-variant-numeric: tabular-nums slashed-zero oldstyle-nums;
}

/* ── ITEM #5 — Neo-Brutalist Focus Ring ──────────────────────────────── */
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--brand-bg), 0 0 0 4px var(--brand-text);
  border-radius: 2px;
}

/* ── ITEM #15 — Custom Scrollbar ─────────────────────────────────────── */
::-webkit-scrollbar {
  width: 10px;
  background-color: var(--brand-bg);
  border-left: 2px solid var(--brand-border);
}
::-webkit-scrollbar-thumb {
  background-color: var(--brand-surface-high);
  border: 2px solid var(--brand-border);
  border-radius: 0;
}
::-webkit-scrollbar-thumb:active {
  background-color: var(--brand-primary);
}

@layer utilities {
  .neo-brutal-shadow {
    box-shadow: 8px 8px 0px 0px var(--brand-border);
  }
  .neo-brutal-shadow-sm {
    box-shadow: 4px 4px 0px 0px var(--brand-border);
  }
  .neo-brutal-shadow-active {
    box-shadow: 0px 0px 0px 0px var(--brand-border);
    transform: translate(4px, 4px);
  }
  .font-headline {
    font-family: var(--font-headline);
  }
  .material-symbols-outlined {
    font-family: 'Material Symbols Outlined';
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
}

/* ── ITEM #11 — Analysis Complete Pulse ──────────────────────────────── */
@keyframes completePulse {
  0%   { border-color: var(--brand-primary); }
  50%  { border-color: var(--brand-text); }
  100% { border-color: var(--brand-primary); }
}
.complete-flash {
  animation: completePulse 0.3s ease 1;
}

/* ── ITEM #34 — Critical Blink (hard digital, not sinusoidal) ────────── */
@keyframes criticalBlink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}
.dot-critical {
  animation: criticalBlink 1s steps(2) infinite;
}

/* ── ITEM #22 — Accept Pulse (PDF drop zone) ─────────────────────────── */
@keyframes acceptPulse {
  0%   { box-shadow: 0 0 0 0 var(--brand-primary); }
  100% { box-shadow: 0 0 0 8px transparent; }
}
.accept-pulse {
  animation: acceptPulse 0.4s ease 1;
}

/* ── ITEM #37 — Grain Texture (Header + Sidebar ONLY) ────────────────── */
.grain-overlay {
  position: relative;
}
.grain-overlay::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  opacity: 0.025;
  mix-blend-mode: multiply;
}

/* ── Badge Typography ────────────────────────────────────────────────── */
.badge-security,
.badge-priority,
.status-chip {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
}

```

### File: src/animations/physics.js
```js
/**
 * CogniMed — Motion Constants (PHYSICS ENGINE DICTIONARY)
 * Single source of truth for all animation physics.
 * Every component imports from here. Never copy-paste spring values inline.
 *
 * THE FOUR LAWS:
 * 1. 300ms Rule — no animation except typewriter/SVG tracing takes longer
 * 2. No Bounciness — rigid staccato, not floaty/springy
 * 3. Hardware Acceleration Only — opacity, transform, clipPath only
 * 4. Intentional Contrast — 80% still, 20% animated
 */

// ─── PRIMARY PHYSICS DICTIONARY ──────────────────────────────────────────────

/** Standard UI transitions — snappy, authoritative (Chat Bubbles, Modals) */
export const SNAP = { type: 'spring', stiffness: 700, damping: 40, mass: 0.8 };

/** Button click — heavy mechanical switch (Emergency Override, Analyze) */
export const CLACK = { type: 'spring', stiffness: 800, damping: 25 };

/** Dropdown/modal reveal — blast door effect */
export const DOOR = { type: 'spring', stiffness: 600, damping: 38 };

/** Toast stack — weighted collision physics */
export const COLLISION = { type: 'spring', stiffness: 500, damping: 50 };

/** Number ticker — fast land, no bounce */
export const COUNTER = { duration: 0.55, ease: [0.22, 1, 0.36, 1] };

/** Named export map for convenience */
export const PHYSICS = { SNAP, CLACK, DOOR, COLLISION, COUNTER };

// ─── LEGACY CONSTANTS (kept for backward compat) ─────────────────────────────

/** Dark theme spring — tight, heavy, mechanical */
export const SPRING_DARK = { type: 'spring', stiffness: 400, damping: 30 };

/** Light theme spring — slightly softer, still precise */
export const SPRING_LIGHT = { type: 'spring', stiffness: 320, damping: 26 };

/** Data reveal — smooth eased sweep for bars and accents */
export const DATA_REVEAL = { duration: 0.6, ease: [0.16, 1, 0.3, 1] };

/** Flash — instant acknowledgment, binary on/off */
export const FLASH = { duration: 0.15, ease: 'linear' };

/** Stamp — clip-path reveal, title powers on */
export const STAMP = { duration: 0.35, ease: [0.16, 1, 0.3, 1] };

/**
 * Returns the correct spring config based on the current theme.
 * @param {'dark'|'light'} theme
 */
export const getSpring = (theme) => (theme === 'dark' ? SPRING_DARK : SPRING_LIGHT);

```

### File: src/components/CipherText.jsx
```jsx
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

```

### File: src/components/TerminalLoader.jsx
```jsx
// Item #16 — TerminalLoader: clinical terminal status animation
// Stacks ABOVE RedactedSkeleton inside PendingMessage.jsx — they don't replace each other.
// useReducedMotion guard freezes on first step for accessibility.
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// Heavy, clinical OS terminology for Vector/PDF analysis
const RAG_STEPS = [
  'SYSTEM: MOUNTING LOCAL VECTOR SPACE...',
  'COMPUTING SEMANTIC DISTANCES...',
  'ISOLATING RELEVANT CLINICAL CHUNKS...',
  'CROSS-REFERENCING CHROMA-DB EMBEDDINGS...',
  'SYNTHESIZING EVIDENCE-BASED DIFFERENTIAL...',
];

// Heavy, neural-engine terminology for general medical queries
const STANDARD_STEPS = [
  'SYSTEM: ALLOCATING NEURAL VRAM...',
  'LOADING MEDGEMMA 4B-IT WEIGHTS...',
  'PARSING DIAGNOSTIC HEURISTICS...',
  'TRAVERSING MEDICAL ONTOLOGY GRAPH...',
  'COMPILING RESPONSE MATRIX...',
];

export default function TerminalLoader({ pdfActive = false }) {
  const [step, setStep] = useState(0);
  const shouldReduce = useReducedMotion();
  const steps = pdfActive ? RAG_STEPS : STANDARD_STEPS;

  useEffect(() => {
    setStep(0);
    if (shouldReduce) return; // Freeze on first step if motion is reduced

    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1500); // 1.5s per step aligns with 6–8s inference time

    return () => clearInterval(interval);
  }, [pdfActive, steps.length, shouldReduce]);

  return (
    <div className="flex items-center gap-3 py-2 border-l-2 border-brand-primary pl-3 ml-1">
      {/*
        NO SPINNING GEAR. The text is the animation.
        A solid blinking block cursor anchors the terminal vibe.
        steps(2) = hard digital blink, NOT a soft fade.
      */}
      <motion.div
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'steps(2)' }}
        className="w-2 h-3 bg-brand-primary flex-shrink-0"
      />

      {/* Fixed height prevents layout jitter when text swaps */}
      <div className="h-[18px] overflow-hidden relative w-full">
        <AnimatePresence mode="wait">
          <motion.span
            key={step}
            initial={shouldReduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{
              duration: 0.2,
              ease: [0.22, 1, 0.36, 1], // Snappy physics — NOT linear
            }}
            className="absolute inset-0 font-mono text-[11px] font-bold uppercase
                       tracking-[0.08em] text-brand-text-muted"
          >
            {steps[step]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

```

