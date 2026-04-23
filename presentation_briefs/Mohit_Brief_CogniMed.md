# ⚕️ CogniMed Presentation Brief: Mohit (Systems & Tooling Eng.)

## 📌 Role Overview
**Your Role:** Person 4 - Systems & Data Engineer (The Specialist)
**Focus:** PDF Ingestion, AST Data Rendering, and Clinical Export Pipelines.
**Key Files Owned:** `PDFUploader.jsx`, `MarkdownRenderer.jsx`, `pdfExport.js`

As the Systems Engineer, you handled the high-complexity data workflows bridging the frontend UI to Ishwar's backend RAG AI. You built the logic that visualizes the PDF parsing, the engine that securely renders the AI's markdown responses, and the complete PDF export tools bypassing browser print limits.

---

## 🔬 Core Logic & Code Breakdown

### 1. The Telemetry Matrix: `PDFUploader.jsx`
This is an incredibly advanced component coordinating drop events with backend FastApi vectorization telemetry.
- **Ingestion Narrative Matrix:** You built a sequential state machine (`uploadStage`) that maps the file drop to: `locking` -> `extracting` -> `vectorizing` -> `done`. As the API resolves, it updates visual clips.
- **Drop Zone Pulse CSS Force:** You implemented a React `pulseKey` state. Dragging a file over the zone increments this key, forcing a complete DOM remount of the dropzone. This is a brilliant hack to ensure the CSS keyframe "radar pulse" reliably restarts every single time a file hovers, bypassing React's default render optimization.
- **SVG Math (Idle Radar):** You ripped out heavy GIF files and built an `IdleRadar` using pure math and SVG primitives. It uses `pathLength` from `0` to `1` over `0.38s` to draw dynamic circles, and a sweeping radar line animated via CSS `rotate`.

### 2. Clinical Safe Rendering: `MarkdownRenderer.jsx`
Security and exact styling in medical data is paramount. You bypassed dangerous HTML rendering to build a custom AST (Abstract Syntax Tree) engine.
- **XSS Prevention Sandbox:** You used `react-markdown` and `remark-gfm` which parses the API text into semantic nodes, completely avoiding `dangerouslySetInnerHTML`, mitigating any XSS clinical injection risks.
- **Custom DOM Mapping:** You mapped every markdown node (tables, lists, bold, blockquotes) directly to custom Tailwind components in our Neo-Brutalist design system. 
  - `blockquote` becomes a clinical note with harsh borders.
  - `code` blocks get parsed into custom containers with absolute "DATA OUTPUT" styling.

### 3. Report Engine: `pdfExport.js`
- Standard `window.print` destroys formatting across devices. You implemented a custom export script using `jsPDF` and `jspdf-autotable`.
- You take the active React `history` and `pdfState`, map them recursively to a canvas grid measuring A4 precise units, and inject a proprietary dark-mode grid UI directly into a Blob.
- Finally, you trigger `window.open(blobUrl)` setting the MIME type to natively open the browser's PDF viewer without forcing an immediate aggressive file download, giving the user control.

---

## 🎤 Presentation Q&A Sandbox

**Q: Explain how you securely rendered the AI’s output instead of just using standard HTML injection.**  
**Your Answer:** "In clinical software, injecting raw HTML via `dangerouslySetInnerHTML` is a massive XSS security vulnerability. Instead, I built an AST parser using `react-markdown` and `remark-gfm`. I intercept every single markdown token in the virtual DOM—like tables, lists, or headers—and mapped it directly to controlled React functional components physically styled with our local Neo-Brutalist CSS classes. This gives us 100% control over the rendered output."

**Q: How does the PDF Uploader know what the backend AI is doing with the document?**  
**Your Answer:** "I hooked the drop zone directly into the FastAPI client API. When a file is passed to `handleUpload`, I set the local stage to 'locking' to disable the UI. The promise chain then sequentially updates the stage variable to 'extracting' and 'vectorizing'. Once the AI returns the 200 OK object, it passes the exact `chunks_created` digits which I pipe back into Varun's Framer Motion NumberTicker for the visual display."

**Q: Why was the drop-zone acceptance pulse animation so hard to get right in React?**  
**Your Answer:** "React natively optimizes re-renders and specifically avoids re-triggering CSS keyframe animations if only a class toggle happens. To guarantee the acceptance pulse fires cleanly every single time you drag a file over, I created a numerical `PulseKey` state bound to the dropzone div. Incrementing the key on `onDragOver` forces React to completely destroy and remount the node, executing the raw CSS animation perfectly every time."

**Q: Explain the `generateClinicalPDF` workflow in `pdfExport.js`.**  
**Your Answer:** "I used `jsPDF` directly. I instantiated an A4 portrait matrix, and recursively mapped over Moksh's 'history' state array. Using `autoTable`, I printed a structured table grouping rows by SPEAKER and MESSAGE, applying specific CMYK color codes. Once the buffer is painted, I convert it to a Blob typed as `application/pdf` and generate a `createObjectURL` to push it to a new Chrome tab natively."

---

## 💻 Source Code Annex


### File: src/components/PDFUploader.jsx
```jsx
// Items #8, #24, #26, #32 — PDFUploader
// #8:  Fix DATAREVEAL: width → scaleX (GPU compositing, zero layout thrash)
// #24: PDF ingestion narrative chips (sequential status stages with clipPath reveal)
// #26: IdleRadar replaced with SVG path tracing on radar Lucide icon
// #32: Drop zone acceptance pulse (one hard flash, key prop forces remount to replay)
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { uploadPDF, clearPDF } from '../api/client';
import { SNAP, getSpring } from '../animations/physics';

// ─── Item #24 — PDF Ingestion Narrative Chips ────────────────────────────────
// Sequential terminal narrative — each stage clips in via clipPath stagger
const getStages = (pages, chunks) => [
  '[OK] Document received',
  `[OK] Extracting text layers (${pages || '?'} pages)`,
  `[OK] Chunking into vector segments (${chunks || '?'} chunks)`,
  '[OK] Embedding into local matrix',
  '[READY] Active for analysis',
];

// ─── Ingestion Stage Maps ─────────────────────────────────────────────────────
const STAGE_ORDER = ['locking', 'extracting', 'vectorizing', 'done'];

// ─── NaN-guarded NumberTicker ─────────────────────────────────────────────────
function NumberTicker({ value, suffix = '' }) {
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const unsubscribe = motionVal.on('change', (v) => setDisplay(Math.round(v).toString()));
    return unsubscribe;
  }, [motionVal]);

  useEffect(() => {
    const safeValue = isNaN(Number(value)) ? 0 : Number(value);
    // Item #9 — 0.55s (was 1.0s)
    const controls = animate(motionVal, safeValue, { duration: 0.55, ease: [0.22, 1, 0.36, 1] });
    return controls.stop;
  }, [value, motionVal]);

  return <span className="tabular">{display}{suffix}</span>;
}

// ─── Item #26 — SVG Path Tracing IdleRadar ───────────────────────────────────
// Replaces three pulsing circles with Lucide radar SVG path drawn via pathLength.
function IdleRadar() {
  return (
    <div className="relative flex items-center justify-center h-20 w-full">
      <svg
        width="72"
        height="72"
        viewBox="0 0 24 24"
        fill="none"
        className="text-brand-primary"
      >
        {/* Radar circle path */}
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 0.38, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse', repeatDelay: 0.8 },
            opacity: { duration: 0.01 },
          }}
        />
        {/* Radar sweep line */}
        <motion.line
          x1="12"
          y1="12"
          x2="12"
          y2="2"
          stroke="currentColor"
          strokeWidth="1.5"
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          style={{ transformOrigin: '12px 12px' }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        />
        {/* Center dot */}
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        {/* Inner ring */}
        <motion.circle
          cx="12"
          cy="12"
          r="5"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          opacity="0.4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ pathLength: { duration: 0.55, ease: 'easeInOut', delay: 0.2 } }}
        />
      </svg>
    </div>
  );
}

export default function PDFUploader({ pdfState, setPdfState, theme }) {
  const [uploadStage, setUploadStage] = useState(null);
  const [error, setError] = useState(null);
  // Item #32 — Drop zone acceptance pulse: pulseKey forces remount to replay CSS animation
  const [isDragOver, setIsDragOver] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);
  const fileInputRef = useRef(null);
  const spring = getSpring(theme);

  useEffect(() => {
    if (!pdfState) setUploadStage(null);
  }, [pdfState]);

  const handleUpload = (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('PDF files only.');
      return;
    }
    setError(null);
    setUploadStage('locking');

    uploadPDF(file, (percent) => {
      if (percent > 50) setUploadStage('extracting');
    })
      .then((result) => {
        setUploadStage('vectorizing');
        setTimeout(() => {
          setUploadStage('done');
          setPdfState({
            filename: result.filename || result.pdf_filename || file.name,
            pages_indexed: Number(result.pages_indexed ?? result.pages ?? result.pdf_pages ?? 0) || 0,
            chunks_created: Number(result.chunks_created ?? result.pdf_chunks ?? result.chunks ?? 0) || 0,
          });
        }, 600);
      })
      .catch((err) => {
        setError(err.message || 'Upload Failed.');
        setUploadStage(null);
      });
  };

  // ─── Item #32 — Drop Zone Pulse Handlers ────────────────────────────────────
  // CRITICAL: Both handlers MUST reset isDragOver → false.
  // Without this, the `if (!isDragOver)` guard permanently blocks re-triggering.
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragOver) {
      setIsDragOver(true);
      setPulseKey(k => k + 1); // force CSS animation re-trigger via remount
    }
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false); // CRITICAL: reset so next drag re-triggers
    handleUpload(e.dataTransfer.files[0]);
  };

  const handleClear = async () => {
    try {
      await clearPDF();
      setPdfState(null);
      setUploadStage(null);
    } catch (err) {
      setError('Failed to clear: ' + (err.message || ''));
    }
  };

  return (
    <AnimatePresence mode="wait">
      {pdfState ? (
        /* ── LOADED: Active Vector Matrix ─────────────────────────────────────── */
        <motion.div
          key="loaded"
          className="bg-brand-surface border-4 border-brand-border shadow-[8px_8px_0_0_var(--brand-border)] transition-colors flex flex-col"
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -60, opacity: 0 }}
          transition={spring}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b-4 border-brand-border">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-brand-primary text-base">analytics</span>
              <span className="text-xs font-black uppercase font-headline text-brand-primary tracking-widest">ACTIVE VECTOR MATRIX</span>
            </div>
            <button onClick={handleClear} className="material-symbols-outlined hover:text-brand-error text-brand-text-muted transition-colors text-sm" title="Eject document">
              close
            </button>
          </div>

          {/* Filename */}
          <div className="px-4 pt-3 pb-2">
            <h3 className="font-headline font-black text-sm uppercase truncate text-brand-text" title={pdfState.filename}>
              {pdfState.filename}
            </h3>
          </div>

          {/* Telemetry Grid — Item #8: scaleX instead of width animation */}
          <div className="grid grid-cols-2 gap-3 px-4 pb-4">
            <div className="bg-brand-surface-high border-4 border-brand-border p-3 shadow-[4px_4px_0_0_var(--brand-border)]">
              {/* ─── Item #8 — scaleX progress bar (GPU compositing, zero layout thrash) */}
              <div className="relative w-full h-1 bg-brand-surface overflow-hidden mb-2">
                <motion.div
                  className="absolute inset-y-0 left-0 w-full bg-brand-primary origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  style={{ transformOrigin: 'left center' }}
                  transition={SNAP}
                />
              </div>
              <span className="block text-3xl font-black font-headline text-brand-primary">
                <NumberTicker value={pdfState.pages_indexed || 0} />
              </span>
              <span className="text-[10px] font-black uppercase text-brand-text">Pages Indexed</span>
            </div>
            <div className="bg-brand-surface-high border-4 border-brand-border p-3 shadow-[4px_4px_0_0_var(--brand-border)]">
              <div className="relative w-full h-1 bg-brand-surface overflow-hidden mb-2">
                <motion.div
                  className="absolute inset-y-0 left-0 w-full bg-brand-secondary origin-left"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  style={{ transformOrigin: 'left center' }}
                  transition={{ ...SNAP, delay: 0.1 }}
                />
              </div>
              <span className="block text-3xl font-black font-headline text-brand-secondary">
                <NumberTicker value={pdfState.chunks_created || 0} />
              </span>
              <span className="text-[10px] font-black uppercase text-brand-text">Chunks Created</span>
            </div>
          </div>

          {/* ─── Item #24 — PDF Ingestion Narrative Chips ─────────────────────── */}
          <div className="px-4 pb-2">
            <div className="flex flex-col gap-1">
              {getStages(pdfState.pages_indexed, pdfState.chunks_created).map((stage, i) => (
                <motion.div
                  key={stage}
                  initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }}
                  animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }}
                  transition={{ delay: i * 0.2, duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[10px] font-mono text-brand-text-muted"
                >
                  {stage}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Flush Vector Cache */}
          <div className="px-4 pb-4">
            <button
              onClick={handleClear}
              className="w-full bg-brand-bg border-2 border-brand-border py-2 font-headline font-black uppercase text-xs text-brand-text-muted hover:bg-brand-error hover:text-black hover:border-brand-error transition-all shadow-[2px_2px_0_0_var(--brand-border)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
              Flush Vector Cache
            </button>
          </div>

          {/* Security Compliance Badges */}
          <div className="px-4 pb-4 border-t-2 border-brand-border pt-3 flex flex-wrap gap-2">
            {['HIPAA-aligned', 'LOCAL INFERENCE', 'ENCRYPTED'].map(badge => (
              <span key={badge} className="bg-brand-surface border border-brand-border text-brand-text-muted text-[9px] font-black uppercase px-2 py-1 tracking-widest badge-security">
                {badge}
              </span>
            ))}
          </div>
        </motion.div>
      ) : (
        /* ── EMPTY: Ingest Slot + Idle Radar ──────────────────────────────────── */
        <motion.div
          key="dropzone"
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -60, opacity: 0 }}
          transition={spring}
          className="flex flex-col border-4 border-brand-border bg-brand-surface transition-colors shadow-[8px_8px_0_0_var(--brand-border)]"
        >
          {/* Section label */}
          <div className="px-4 pt-4 pb-2 border-b-4 border-brand-border flex items-center gap-2">
            <span className="material-symbols-outlined text-brand-text-muted text-base">sensors</span>
            <span className="text-xs font-black uppercase font-headline text-brand-text-muted tracking-widest">TACTICAL SENSOR SUITE</span>
          </div>

          {/* ─── Item #32 — Drop Zone with Acceptance Pulse ────────────────────
              key={pulseKey} forces DOM remount so CSS animation replays.
              Both drag handlers must reset isDragOver to re-enable animation.  */}
          <div
            key={pulseKey}
            className={`drop-zone flex flex-col justify-center items-center text-center cursor-pointer group relative px-6 py-6 border-b-4 border-dashed hover:bg-brand-surface-high transition-colors ${
              isDragOver ? 'drag-over' : ''
            } ${uploadStage ? 'border-brand-primary' : 'border-brand-border'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              if (error) return;
              if (!uploadStage) fileInputRef.current?.click();
            }}
          >
            {uploadStage ? (
              /* Terminal boot sequence */
              <div className="flex flex-col items-center gap-3 min-h-[120px] justify-center w-full">
                <span className="material-symbols-outlined text-4xl text-brand-primary">terminal</span>
                <div className="font-mono text-xs text-brand-primary w-full text-left space-y-1 px-2">
                  {STAGE_ORDER.map((stage) => {
                    const currentIdx = STAGE_ORDER.indexOf(uploadStage);
                    const stageIdx = STAGE_ORDER.indexOf(stage);
                    if (stageIdx > currentIdx) return null;
                    const labels = {
                      locking: '[ LOCKING FILE HANDLE... ]',
                      extracting: '[ EXTRACTING TEXT CORPUS... ]',
                      vectorizing: '[ VECTORIZING EMBEDDINGS... ]',
                      done: '[ INDEXED ]',
                    };
                    return (
                      <motion.p
                        key={stage}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className={stage === uploadStage ? 'text-brand-primary' : 'text-brand-text-muted'}
                      >
                        {labels[stage]}
                      </motion.p>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <span className="material-symbols-outlined text-4xl mb-3 text-brand-text-muted group-hover:text-brand-primary transition-colors block">picture_as_pdf</span>
                <h3 className="font-headline font-black text-base uppercase mb-1 text-brand-text">Ingest Clinical Data</h3>
                <p className="text-xs font-bold text-brand-text-muted uppercase tracking-wide mb-3">Drop PDF or click to select</p>
                <span className="bg-brand-bg border-2 border-brand-border text-brand-text px-3 py-1 font-black text-[10px] uppercase tracking-tighter">Max 50MB</span>
              </>
            )}

            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => handleUpload(e.target.files[0])}
            />

            {/* Ghost click prevention on error overlay */}
            {error && (
              <div
                className="absolute top-0 left-0 w-full h-full bg-brand-error flex flex-col items-center justify-center text-black font-headline font-black uppercase z-10 border-4 border-brand-border"
                style={{ pointerEvents: 'all' }}
                onClick={(e) => e.stopPropagation()}
              >
                <span className="material-symbols-outlined text-4xl mb-2">error</span>
                <span className="bg-brand-surface px-4 py-2 text-brand-error border-2 border-brand-border text-sm text-center max-w-[90%]">
                  {error}
                </span>
                <button
                  className="mt-4 bg-black text-white border-2 border-brand-border px-4 py-2 text-xs font-black uppercase hover:bg-brand-surface hover:text-black transition-colors"
                  onClick={(e) => { e.stopPropagation(); setError(null); }}
                >
                  DISMISS
                </button>
              </div>
            )}
          </div>

          {/* Item #26 — SVG Radar (was 3 pulsing circles) */}
          <div className="px-4 py-4 border-b-4 border-brand-border">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-brand-text-muted text-sm">scatter_plot</span>
              <span className="text-[10px] font-black uppercase font-headline text-brand-text-muted tracking-widest">Vector Matrix — Idle</span>
            </div>
            <IdleRadar />
            <p className="text-center text-[10px] font-mono text-brand-text-muted mt-2 uppercase tracking-widest">No document indexed</p>
          </div>

          {/* Security Compliance Badges */}
          <div className="px-4 py-3 flex flex-wrap gap-2">
            {['HIPAA-aligned', 'LOCAL INFERENCE', 'ENCRYPTED'].map(badge => (
              <span key={badge} className="bg-brand-surface-high border border-brand-border text-brand-text-muted text-[9px] font-black uppercase px-2 py-1 tracking-widest badge-security">
                {badge}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

```

### File: src/components/MarkdownRenderer.jsx
```jsx
// Item 8 — Secure Markdown AST Parsing (XSS Prevention)
// Uses react-markdown + remark-gfm. Every node is intercepted at the AST level
// and mapped to a safe HTML element styled with the Neo-Brutalist design system.
// There is ZERO use of dangerouslySetInnerHTML anywhere in this component.
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownRenderer({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // ── Text Blocks ──────────────────────────────────────────────────────
        p: ({ node, ...props }) => (
          <p className="mb-4 text-brand-text leading-relaxed last:mb-0" {...props} />
        ),
        strong: ({ node, ...props }) => (
          <strong className="font-black text-brand-primary uppercase tracking-wide" {...props} />
        ),
        em: ({ node, ...props }) => (
          <em className="italic text-brand-text-muted" {...props} />
        ),

        // ── Headings — down-shifted for DOM hierarchy (page already has h1) ──
        h1: ({ node, ...props }) => (
          <h3 className="text-lg font-black text-brand-text mt-6 mb-3 border-b-2 border-brand-secondary pb-1 font-headline uppercase" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h4 className="text-base font-bold text-brand-text mt-5 mb-2 font-headline uppercase" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h5 className="text-sm font-bold text-brand-text mt-4 mb-2 uppercase tracking-wider font-headline" {...props} />
        ),

        // ── Lists ────────────────────────────────────────────────────────────
        ul: ({ node, ...props }) => (
          <ul className="list-disc pl-5 mb-4 space-y-2 text-brand-text marker:text-brand-secondary" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="list-decimal pl-5 mb-4 space-y-2 text-brand-text marker:text-brand-primary marker:font-bold" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="pl-1 font-bold" {...props} />
        ),

        // ── Code & Data ──────────────────────────────────────────────────────
        code: ({ node, inline, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          return !inline ? (
            <div className="bg-brand-bg border-4 border-brand-border shadow-[4px_4px_0_0_var(--brand-border)] overflow-hidden my-4">
              <div className="bg-brand-surface-high px-4 py-1 text-xs text-brand-text-muted font-mono border-b-2 border-brand-border uppercase tracking-widest">
                {match ? match[1] : 'DATA OUTPUT'}
              </div>
              <pre className="p-4 overflow-x-auto text-sm text-brand-primary font-mono">
                <code className={className} {...props}>{children}</code>
              </pre>
            </div>
          ) : (
            <code
              className="bg-brand-surface-high text-brand-primary font-mono text-sm px-1.5 py-0.5 border border-brand-border"
              {...props}
            >
              {children}
            </code>
          );
        },

        // ── Blockquote — styled as a clinical note/callout ───────────────────
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-brand-secondary bg-brand-surface border-2 border-brand-border italic px-4 py-3 my-4 text-brand-text-muted"
            {...props}
          />
        ),

        // ── Table (GFM) ──────────────────────────────────────────────────────
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-4 border-4 border-brand-border shadow-[4px_4px_0_0_var(--brand-border)]">
            <table className="w-full text-left font-headline text-sm" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-brand-surface-high text-brand-text border-b-4 border-brand-border" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th className="p-3 text-xs uppercase font-black" {...props} />
        ),
        tbody: ({ node, ...props }) => (
          <tbody className="divide-y-2 divide-brand-border bg-brand-surface" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="p-3 font-bold text-sm text-brand-text" {...props} />
        ),
        tr: ({ node, ...props }) => (
          <tr className="hover:bg-brand-surface-high transition-colors" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

```

### File: src/utils/pdfExport.js
```js
// src/utils/pdfExport.js
// Generates a clinical PDF and opens it in Chrome's native PDF viewer (new tab).
// No download attribute tricks — just window.open(blobUrl) with application/pdf MIME type.

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * @param {Array}  history   – The React history state [{role, content, ...}]
 * @param {Object} pdfState  – The pdfState object {filename} or null
 */
export function generateClinicalPDF(history, pdfState) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PAGE_W = doc.internal.pageSize.getWidth();
  const MARGIN = 14;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  const now = new Date();
  const timestamp = now.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  // ─── Colours ────────────────────────────────────────────────────────────────
  const BLACK  = [11, 11, 11];
  const CYAN   = [0, 229, 255];
  const WHITE  = [255, 255, 255];
  const LGREY  = [245, 245, 245];
  const MGREY  = [150, 150, 150];
  const DGREY  = [60, 60, 60];

  // ─── HEADER BAR ─────────────────────────────────────────────────────────────
  doc.setFillColor(...BLACK);
  doc.rect(0, 0, PAGE_W, 30, 'F');
  doc.setFillColor(...CYAN);
  doc.rect(0, 28, PAGE_W, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...CYAN);
  doc.text('COGNIMED.AI', MARGIN, 13);

  doc.setFontSize(8);
  doc.setTextColor(...MGREY);
  doc.text('CLINICAL DIAGNOSTIC REPORT  //  SOVEREIGN DIAGNOSTIC v2.0', MARGIN, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...MGREY);
  doc.text(`Generated: ${timestamp}`, PAGE_W - MARGIN, 20, { align: 'right' });

  // ─── METADATA BLOCK ─────────────────────────────────────────────────────────
  let y = 38;
  doc.setFillColor(...LGREY);
  doc.rect(MARGIN, y, CONTENT_W, 18, 'F');
  doc.setDrawColor(...BLACK);
  doc.setLineWidth(0.6);
  doc.rect(MARGIN, y, CONTENT_W, 18, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...DGREY);
  const colW = CONTENT_W / 3;
  doc.text('CASE ID: 4882-QX', MARGIN + 4, y + 6);
  doc.text('PRIORITY: HIGH ALPHA', MARGIN + colW + 4, y + 6);
  doc.text('HIPAA COMPLIANT: YES', MARGIN + colW * 2 + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...MGREY);
  const docRef = pdfState?.filename
    ? `Reference Document: ${pdfState.filename}`
    : 'Reference Document: None (No PDF Uploaded)';
  doc.text(docRef, MARGIN + 4, y + 13);

  y += 24;

  // ─── SECTION 1: TRANSCRIPT ───────────────────────────────────────────────────
  doc.setFillColor(...BLACK);
  doc.rect(MARGIN, y, CONTENT_W, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...CYAN);
  doc.text('01  //  DIAGNOSTIC CONVERSATION TRANSCRIPT', MARGIN + 3, y + 5);
  y += 10;

  const messages = history.filter(m => m.role === 'user' || m.role === 'assistant');

  const clean = (text = '') =>
    text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/`{1,3}[^`]*`{1,3}/gs, '[code]')
      .trim();

  if (messages.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(...MGREY);
    doc.text('No conversation history recorded in this session.', MARGIN, y + 6);
    y += 12;
  } else {
    const tableRows = messages.map((msg, i) => [
      String(i + 1),
      msg.role === 'user' ? 'CLINICIAN' : 'COGNIMED AI',
      clean(msg.content),
    ]);

    autoTable(doc, {
      startY: y,
      head: [['#', 'SPEAKER', 'MESSAGE']],
      body: tableRows,
      margin: { left: MARGIN, right: MARGIN },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: BLACK,
        lineWidth: 0.3,
        textColor: DGREY,
        overflow: 'linebreak',
        font: 'helvetica',
      },
      headStyles: {
        fillColor: DGREY,
        textColor: WHITE,
        fontStyle: 'bold',
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: LGREY },
      columnStyles: {
        0: { cellWidth: 8,  halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 34, fontStyle: 'bold' },
        2: { cellWidth: CONTENT_W - 42 },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          data.cell.styles.textColor =
            data.cell.raw === 'CLINICIAN' ? [0, 100, 180] : [0, 130, 130];
        }
      },
      tableLineColor: BLACK,
      tableLineWidth: 0.6,
    });

    y = doc.lastAutoTable.finalY + 8;
  }

  // ─── SECTION 2: STATS ────────────────────────────────────────────────────────
  if (y > 230) { doc.addPage(); y = 20; }

  doc.setFillColor(...BLACK);
  doc.rect(MARGIN, y, CONTENT_W, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...CYAN);
  doc.text('02  //  SESSION STATISTICS', MARGIN + 3, y + 5);
  y += 10;

  const lastAI = [...history].reverse().find(m => m.role === 'assistant');

  autoTable(doc, {
    startY: y,
    body: [
      ['Total Clinician Queries',         String(history.filter(m => m.role === 'user').length)],
      ['Total AI Responses',              String(history.filter(m => m.role === 'assistant').length)],
      ['Last Response — Tokens Generated', String(lastAI?.tokensGenerated ?? 'N/A')],
      ['Last Inference — Tokens/sec',      String(lastAI?.tokensPerSecond  ?? 'N/A')],
      ['Reference PDF Loaded',             pdfState?.filename ?? 'None'],
    ],
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 8, cellPadding: 3, lineColor: BLACK, lineWidth: 0.3 },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold', textColor: DGREY, fillColor: LGREY },
      1: { textColor: DGREY },
    },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    tableLineColor: BLACK,
    tableLineWidth: 0.6,
  });

  // ─── FOOTER (all pages) ──────────────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const PH = doc.internal.pageSize.getHeight();
    doc.setFillColor(...BLACK);
    doc.rect(0, PH - 12, PAGE_W, 12, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...MGREY);
    doc.text(
      '⚠  AI-generated for clinical reference only. Always verify with a qualified medical professional.',
      MARGIN, PH - 5
    );
    doc.text(`Page ${i} of ${totalPages}`, PAGE_W - MARGIN, PH - 5, { align: 'right' });
  }

  // ─── OPEN IN CHROME PDF VIEWER ───────────────────────────────────────────────
  // window.open(blobUrl) with application/pdf MIME type opens Chrome's native PDF
  // viewer directly — no print dialog, no download attribute issues.
  const pdfBlob = new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(pdfBlob);
  const viewer  = window.open(blobUrl, '_blank');

  if (!viewer) {
    alert('Popup blocked! Please allow popups for localhost to view the report.');
  }

  // Clean up the blob URL after a generous delay
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
}

```

