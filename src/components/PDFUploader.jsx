// Items 6, 13, 17 — PDFUploader (full rewrite)
// 6:  NaN guard on NumberTicker before animating
// 13: Destroy generic dropzone → 3-part Tactical Sensor Suite
//     Part 1: Ingest Slot (high-visibility PDF drop zone)
//     Part 2: Active Vector Matrix (telemetry or idle radar)
//     Part 3: Security Compliance Badges + Flush Vector Cache action
// 17: Ghost click prevention on error overlay
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import { uploadPDF, clearPDF } from '../api/client';
import { DATA_REVEAL, getSpring } from '../animations/physics';

/** Stage labels for the terminal boot sequence */
const STAGE_LABELS = {
  locking:    '[ LOCKING FILE HANDLE... ]',
  extracting: '[ EXTRACTING TEXT CORPUS... ]',
  vectorizing:'[ VECTORIZING EMBEDDINGS... ]',
  done:       '[ INDEXED  ]',
};

/**
 * NumberTicker — isolated counter with NaN guard (Item 6).
 */
function NumberTicker({ value, suffix = '' }) {
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const unsubscribe = motionVal.on('change', (v) => setDisplay(Math.round(v).toString()));
    return unsubscribe;
  }, [motionVal]);

  useEffect(() => {
    // Item 6 — NaN guard: never animate to NaN (caused by "?" strings)
    const safeValue = isNaN(Number(value)) ? 0 : Number(value);
    const controls = animate(motionVal, safeValue, {
      duration: 1.0,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [value, motionVal]);

  return <span>{display}{suffix}</span>;
}

/**
 * IdleRadar — pulse animation shown when no PDF is loaded.
 * Purely decorative, no dependencies on parent state.
 */
function IdleRadar() {
  return (
    <div className="relative flex items-center justify-center h-20 w-full">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute border-2 border-brand-primary rounded-full opacity-30"
          style={{ width: 20, height: 20 }}
          animate={{ width: [20, 72], height: [20, 72], opacity: [0.5, 0] }}
          transition={{
            duration: 2.2,
            ease: 'easeOut',
            repeat: Infinity,
            delay: i * 0.7,
          }}
        />
      ))}
      <span className="material-symbols-outlined text-brand-primary text-2xl z-10">radar</span>
    </div>
  );
}

export default function PDFUploader({ pdfState, setPdfState, theme }) {
  const [uploadStage, setUploadStage] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const spring = getSpring(theme);

  // Sync internal state with external resets (e.g. Emergency Override)
  useEffect(() => {
    if (!pdfState) {
      setUploadStage(null);
    }
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
          // Normalize backend response — fields confirmed from /health endpoint:
          // filename: result.filename or result.pdf_filename
          // pages:    result.pages_indexed OR result.pages OR result.pdf_pages
          // chunks:   result.chunks_created OR result.pdf_chunks OR result.chunks
          setPdfState({
            filename: result.filename || result.pdf_filename || file.name,
            pages_indexed: Number(
              result.pages_indexed ?? result.pages ?? result.pdf_pages ?? 0
            ) || 0,
            chunks_created: Number(
              result.chunks_created ?? result.pdf_chunks ?? result.chunks ?? 0
            ) || 0,
          });
        }, 600);
      })
      .catch((err) => {
        // Item 7 — surface the real XHR error (timeout/network/server)
        setError(err.message || 'Upload Failed.');
        setUploadStage(null); // Physically reset the terminal boot sequence
      });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleUpload(e.dataTransfer.files[0]);
  };

  // Item 13 — "Flush Vector Cache" tied to hardened /clear-pdf endpoint
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
        /* ── Part 2: Active Vector Matrix (PDF loaded) ─────────────────── */
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
            <button
              onClick={handleClear}
              className="material-symbols-outlined hover:text-brand-error text-brand-text-muted transition-colors text-sm"
              title="Eject document"
            >
              close
            </button>
          </div>

          {/* Filename */}
          <div className="px-4 pt-3 pb-2">
            <h3 className="font-headline font-black text-sm uppercase truncate text-brand-text" title={pdfState.filename}>
              {pdfState.filename}
            </h3>
          </div>

          {/* Telemetry Grid */}
          <div className="grid grid-cols-2 gap-3 px-4 pb-4">
            <div className="bg-brand-surface-high border-4 border-brand-border p-3 shadow-[4px_4px_0_0_var(--brand-border)]">
              <motion.div
                className="h-1 bg-brand-primary mb-2"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={DATA_REVEAL}
              />
              <span className="block text-3xl font-black font-headline text-brand-primary">
                <NumberTicker value={pdfState.pages_indexed || 0} />
              </span>
              <span className="text-[10px] font-black uppercase text-brand-text">Pages Indexed</span>
            </div>
            <div className="bg-brand-surface-high border-4 border-brand-border p-3 shadow-[4px_4px_0_0_var(--brand-border)]">
              <motion.div
                className="h-1 bg-brand-secondary mb-2"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ ...DATA_REVEAL, delay: 0.15 }}
              />
              <span className="block text-3xl font-black font-headline text-brand-secondary">
                <NumberTicker value={pdfState.chunks_created || 0} />
              </span>
              <span className="text-[10px] font-black uppercase text-brand-text">Chunks Created</span>
            </div>
          </div>

          {/* Item 13 — Flush Vector Cache action */}
          <div className="px-4 pb-4">
            <button
              onClick={handleClear}
              className="w-full bg-brand-bg border-2 border-brand-border py-2 font-headline font-black uppercase text-xs text-brand-text-muted hover:bg-brand-error hover:text-black hover:border-brand-error transition-all shadow-[2px_2px_0_0_var(--brand-border)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
              Flush Vector Cache
            </button>
          </div>

          {/* Part 3: Security Compliance Badges */}
          <div className="px-4 pb-4 border-t-2 border-brand-border pt-3 flex flex-wrap gap-2">
            {['HIPAA-aligned', 'LOCAL INFERENCE', 'ENCRYPTED'].map(badge => (
              <span key={badge} className="bg-brand-surface border border-brand-border text-brand-text-muted text-[9px] font-black uppercase px-2 py-1 tracking-widest">
                {badge}
              </span>
            ))}
          </div>
        </motion.div>
      ) : (
        /* ── Part 1: Ingest Slot + Idle Radar (no PDF) ─────────────────── */
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

          {/* Drop zone */}
          <div
            className={`flex flex-col justify-center items-center text-center cursor-pointer group relative px-6 py-6 border-b-4 border-dashed hover:bg-brand-surface-high transition-colors ${
              uploadStage ? 'border-brand-primary' : 'border-brand-border'
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            // Item 17 — Ghost click prevention: don't open picker if error overlay is active
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
                  {Object.keys(STAGE_LABELS).map((stage) => {
                    const stageOrder = ['locking', 'extracting', 'vectorizing', 'done'];
                    const currentIdx = stageOrder.indexOf(uploadStage);
                    const stageIdx = stageOrder.indexOf(stage);
                    if (stageIdx > currentIdx) return null;
                    return (
                      <motion.p
                        key={stage}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className={stage === uploadStage ? 'text-brand-primary animate-pulse' : 'text-brand-text-muted'}
                      >
                        {STAGE_LABELS[stage]}
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

            {/* Item 17 — Ghost Click Prevention:
                pointerEvents: 'all' captures ALL events and stops pierce-through to the file picker.
                stopPropagation() prevents the parent onClick from firing.
                Only the explicit dismiss button can clear the error. */}
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

          {/* Part 2 (idle): Active Vector Matrix — radar when no document loaded */}
          <div className="px-4 py-4 border-b-4 border-brand-border">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-brand-text-muted text-sm">scatter_plot</span>
              <span className="text-[10px] font-black uppercase font-headline text-brand-text-muted tracking-widest">Vector Matrix — Idle</span>
            </div>
            <IdleRadar />
            <p className="text-center text-[10px] font-mono text-brand-text-muted mt-2 uppercase tracking-widest">No document indexed</p>
          </div>

          {/* Part 3: Security Compliance Badges */}
          <div className="px-4 py-3 flex flex-wrap gap-2">
            {['HIPAA-aligned', 'LOCAL INFERENCE', 'ENCRYPTED'].map(badge => (
              <span key={badge} className="bg-brand-surface-high border border-brand-border text-brand-text-muted text-[9px] font-black uppercase px-2 py-1 tracking-widest">
                {badge}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
