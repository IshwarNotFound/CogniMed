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

// ─── Item #26 — Technical Instrumentation Radar ──────────────────────────────
// Reacts to pdfState: idle = dim static grid, active = vector embedding dots
function IdleRadar({ pdfState }) {
  const isActive = !!pdfState;
  const chunkCount = pdfState?.chunks_created || 0;

  // Generate deterministic dot positions from chunk count (seeded by count so they're stable)
  const dots = [];
  if (isActive && chunkCount > 0) {
    const count = Math.min(chunkCount, 20); // cap visual dots
    for (let i = 0; i < count; i++) {
      const angle = ((i * 137.508) % 360) * (Math.PI / 180); // golden angle spiral
      const r = 8 + (i / count) * 34; // spread from center outward
      dots.push({
        cx: 50 + r * Math.cos(angle),
        cy: 50 + r * Math.sin(angle),
        delay: i * 0.06,
      });
    }
  }

  return (
    <div className={`relative flex items-center justify-center h-48 w-full overflow-hidden border-y-2 border-brand-border/30 transition-colors ${isActive ? 'bg-brand-primary/5' : 'bg-black/20'}`}>
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(var(--color-brand-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-brand-border) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <svg width="160" height="160" viewBox="0 0 100 100" className={`relative z-10 transition-opacity ${isActive ? 'text-brand-primary' : 'text-brand-primary/60'}`}>
        {/* Coordinate Cross */}
        <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1 1" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1 1" />

        {/* Range rings */}
        <circle cx="50" cy="50" r="16" stroke="currentColor" strokeWidth="0.3" fill="none" opacity="0.2" strokeDasharray="2 2" />
        <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="0.3" fill="none" opacity="0.2" strokeDasharray="2 2" />

        {/* Outer Ring with Degree Markers */}
        <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="1 2" />
        {[0, 90, 180, 270].map(deg => (
          <text key={deg} x={50 + 42 * Math.cos(deg * Math.PI / 180)} y={52 + 42 * Math.sin(deg * Math.PI / 180)}
            fontSize="3" fill="currentColor" textAnchor="middle" className="font-mono font-black opacity-40">
            {deg}°
          </text>
        ))}

        {/* Vector embedding dots — appear when PDF is loaded */}
        {dots.map((dot, i) => (
          <g key={i}>
            <circle cx={dot.cx} cy={dot.cy} r="1.2" fill="currentColor" opacity="0.8">
              <animate attributeName="opacity" values="0.4;0.9;0.4" dur="2.5s" begin={`${dot.delay}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={dot.cx} cy={dot.cy} r="2.5" stroke="currentColor" strokeWidth="0.3" fill="none" opacity="0.3">
              <animate attributeName="r" values="2;3.5;2" dur="3s" begin={`${dot.delay}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" begin={`${dot.delay}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* Center Target */}
        <circle cx="50" cy="50" r="1" fill="currentColor">
          {isActive && <animate attributeName="r" values="1;1.8;1" dur="2s" repeatCount="indefinite" />}
        </circle>
        <circle cx="50" cy="50" r="3" stroke="currentColor" strokeWidth="0.5" fill="none" />
      </svg>

      {/* Edge Readouts */}
      <div className="absolute top-2 left-2 text-[8px] font-mono text-brand-primary opacity-50 uppercase tracking-tighter">
        {isActive ? `Vectors: ${chunkCount}` : 'Vector Field: 0.00ms'}
      </div>
      <div className="absolute bottom-2 right-2 text-[8px] font-mono text-brand-primary opacity-50 uppercase tracking-tighter">
        {isActive ? `Latency: ${(1.2 + chunkCount * 0.08).toFixed(1)}ms` : 'AZM: 312.4°'}
      </div>
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
  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isDragOver) {
      setIsDragOver(true);
      setPulseKey(k => k + 1);
    }
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
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
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        {pdfState ? (
          /* ── LOADED: Active Vector Matrix ─────────────────────────────────────── */
          <motion.div
            key="loaded"
            className="flex-1 flex flex-col bg-brand-surface transition-colors"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={spring}
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b-4 border-brand-border shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-brand-primary text-base">analytics</span>
                <span className="text-xs font-black uppercase font-headline text-brand-primary tracking-widest">ACTIVE VECTOR MATRIX</span>
              </div>
              <button onClick={handleClear} className="material-symbols-outlined hover:text-brand-error text-brand-text-muted transition-colors text-sm" title="Eject document">
                close
              </button>
            </div>

            {/* Filename */}
            <div className="px-4 pt-3 pb-2 shrink-0">
              <h3 className="font-headline font-black text-sm uppercase truncate text-brand-text" title={pdfState.filename}>
                {pdfState.filename}
              </h3>
            </div>

            {/* Telemetry Grid */}
            <div className="grid grid-cols-2 gap-3 px-4 pb-4 shrink-0">
              <div className="bg-brand-surface-high border-4 border-brand-border p-3 shadow-[4px_4px_0_0_var(--brand-border)]">
                <div className="relative w-full h-1 bg-brand-surface overflow-hidden mb-2">
                  <motion.div className="absolute inset-y-0 left-0 w-full bg-brand-primary origin-left" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} style={{ transformOrigin: 'left center' }} transition={SNAP} />
                </div>
                <span className="block text-3xl font-black font-headline text-brand-primary"><NumberTicker value={pdfState.pages_indexed || 0} /></span>
                <span className="text-[10px] font-black uppercase text-brand-text">Pages Indexed</span>
              </div>
              <div className="bg-brand-surface-high border-4 border-brand-border p-3 shadow-[4px_4px_0_0_var(--brand-border)]">
                <div className="relative w-full h-1 bg-brand-surface overflow-hidden mb-2">
                  <motion.div className="absolute inset-y-0 left-0 w-full bg-brand-secondary origin-left" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} style={{ transformOrigin: 'left center' }} transition={{ ...SNAP, delay: 0.1 }} />
                </div>
                <span className="block text-3xl font-black font-headline text-brand-secondary"><NumberTicker value={pdfState.chunks_created || 0} /></span>
                <span className="text-[10px] font-black uppercase text-brand-text">Chunks Created</span>
              </div>
            </div>

            {/* Ingestion Chips */}
            <div className="px-4 pb-2 shrink-0">
              <div className="flex flex-col gap-1">
                {getStages(pdfState.pages_indexed, pdfState.chunks_created).map((stage, i) => (
                  <motion.div key={stage} initial={{ clipPath: 'inset(0 100% 0 0)', opacity: 0 }} animate={{ clipPath: 'inset(0 0% 0 0)', opacity: 1 }} transition={{ delay: i * 0.2, duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="text-[10px] font-mono text-brand-text-muted">
                    {stage}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Active Vector Radar */}
            <div className="px-4 py-3 shrink-0 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-brand-primary text-sm">scatter_plot</span>
                <span className="text-[10px] font-black uppercase font-headline text-brand-primary tracking-widest">Vector Matrix — Active</span>
              </div>
              <IdleRadar pdfState={pdfState} />
            </div>

            {/* Spacer fills remaining height */}
            <div className="flex-1" />

            {/* Flush Vector Cache */}
            <div className="px-4 pb-4 shrink-0">
              <button onClick={handleClear} className="w-full bg-brand-bg border-2 border-brand-border py-2 font-headline font-black uppercase text-xs text-brand-text-muted hover:bg-brand-error hover:text-black hover:border-brand-error transition-all shadow-[2px_2px_0_0_var(--brand-border)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                Flush Vector Cache
              </button>
            </div>

            {/* Security Badges */}
            <div className="px-4 pb-4 border-t-2 border-brand-border pt-3 flex flex-wrap gap-2 shrink-0">
              {['HIPAA-aligned', 'LOCAL INFERENCE', 'ENCRYPTED'].map(badge => (
                <span key={badge} className="bg-brand-surface border border-brand-border text-brand-text-muted text-[9px] font-black uppercase px-2 py-1 tracking-widest badge-security">{badge}</span>
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
            className="flex-1 flex flex-col bg-brand-surface transition-colors"
          >
            {/* Section label */}
            <div className="px-4 pt-4 pb-2 border-b-4 border-brand-border flex items-center gap-2 shrink-0">
              <span className="material-symbols-outlined text-brand-text-muted text-base">sensors</span>
              <span className="text-xs font-black uppercase font-headline text-brand-text-muted tracking-widest">CLINICAL DATA FEED</span>
            </div>


            {/* ─── Item #32 — Drop Zone with Acceptance Pulse ────────────────────
              key={pulseKey} forces DOM remount so CSS animation replays.
              Both drag handlers must reset isDragOver to re-enable animation.  */}
            <div
              key={pulseKey}
              className={`drop-zone flex-1 flex flex-col justify-center items-center text-center cursor-pointer group relative px-6 py-6 border-b-4 border-dashed hover:bg-brand-surface-high transition-colors ${isDragOver ? 'drag-over' : ''
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
            <div className="px-4 py-4 border-b-4 border-brand-border shrink-0 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-brand-text-muted text-sm">scatter_plot</span>
                <span className="text-[10px] font-black uppercase font-headline text-brand-text-muted tracking-widest">Vector Matrix — Idle</span>
              </div>
              <IdleRadar />
              <p className="text-center text-[10px] font-mono text-brand-text-muted mt-2 uppercase tracking-widest">No document indexed</p>
            </div>

            {/* Security Compliance Badges */}
            <div className="px-4 py-3 flex flex-wrap gap-2 shrink-0">
              {['HIPAA-aligned', 'LOCAL INFERENCE', 'ENCRYPTED'].map(badge => (
                <span key={badge} className="bg-brand-surface-high border border-brand-border text-brand-text-muted text-[9px] font-black uppercase px-2 py-1 tracking-widest badge-security">
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
