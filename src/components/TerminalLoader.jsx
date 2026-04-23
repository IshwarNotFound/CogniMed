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
