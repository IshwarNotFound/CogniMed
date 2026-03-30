import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { uploadPDF, clearPDF } from '../api/client';
import { DATA_REVEAL, getSpring } from '../animations/physics';

/** Stage label for the terminal boot sequence */
const STAGE_LABELS = {
  locking:    '[ LOCKING FILE HANDLE... ]',
  extracting: '[ EXTRACTING TEXT CORPUS... ]',
  vectorizing:'[ VECTORIZING EMBEDDINGS... ]',
  done:       '[ INDEXED  ]',
};

/**
 * NumberTicker — isolated counter component.
 * Re-exports logic from SystemStats intentionally kept self-contained here
 * so PDFUploader has no cross-component dependency for a trivial primitive.
 */
function NumberTicker({ value, suffix = '' }) {
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const unsubscribe = motionVal.on('change', (v) => setDisplay(Math.round(v).toString()));
    return unsubscribe;
  }, [motionVal]);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.0,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [value, motionVal]);

  return <span>{display}{suffix}</span>;
}

export default function PDFUploader({ pdfState, setPdfState, theme }) {
  const [uploadStage, setUploadStage] = useState(null); // null | 'locking' | 'extracting' | 'vectorizing' | 'done'
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const spring = getSpring(theme);

  const handleUpload = (file) => {
    if (!file || file.type !== 'application/pdf') {
      setError('PDF files only.');
      return;
    }
    setError(null);
    setUploadStage('locking');

    uploadPDF(file, (percent) => {
      // Tie stage transitions to real XHR progress
      if (percent > 50) setUploadStage('extracting');
    })
      .then((result) => {
        setUploadStage('vectorizing');
        // Brief pause so the user sees "vectorizing" before done
        setTimeout(() => {
          setUploadStage('done');
          setPdfState(result);
        }, 600);
      })
      .catch(() => {
        setError('Upload Failed.');
        setUploadStage(null);
      });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleUpload(file);
  };

  const handleClear = async () => {
    try {
      await clearPDF();
      setPdfState(null);
      setUploadStage(null);
    } catch (err) {
      setError('Failed to clear.');
    }
  };

  return (
    <AnimatePresence mode="wait">
      {pdfState ? (
        /* ── Loaded State ── */
        <motion.div
          key="loaded"
          className="bg-brand-surface border-4 border-brand-border p-6 shadow-[8px_8px_0_0_var(--brand-border)] transition-colors"
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -60, opacity: 0 }}
          transition={spring}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-headline font-black text-xl uppercase truncate text-brand-text" title={pdfState.filename}>
              {pdfState.filename}
            </h3>
            <button onClick={handleClear} className="material-symbols-outlined hover:text-brand-error text-brand-text-muted transition-colors">close</button>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-brand-surface-high border-4 border-brand-border p-4 shadow-[4px_4px_0_0_var(--brand-border)]">
              <span className="block text-4xl font-black font-headline text-brand-primary">
                <NumberTicker value={pdfState.pages_indexed || 0} />
              </span>
              <span className="text-[10px] font-black uppercase text-brand-text">Pages Loaded</span>
            </div>
            <div className="bg-brand-surface-high border-4 border-brand-border p-4 shadow-[4px_4px_0_0_var(--brand-border)]">
              <span className="block text-4xl font-black font-headline text-brand-secondary">
                <NumberTicker value={pdfState.chunks_created || 0} />
              </span>
              <span className="text-[10px] font-black uppercase text-brand-text">Chunks Indexed</span>
            </div>
          </div>
        </motion.div>
      ) : (
        /* ── Drop Zone State ── */
        <motion.div
          key="dropzone"
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -60, opacity: 0 }}
          transition={spring}
          className={`border-4 border-dashed flex flex-col justify-center text-center bg-brand-surface hover:bg-brand-surface-high transition-colors cursor-pointer group relative h-full min-h-[280px] px-6 py-10 ${
            uploadStage ? 'border-brand-primary' : 'border-brand-border'
          }`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !uploadStage && fileInputRef.current?.click()}
        >
          {uploadStage ? (
            /* Terminal boot sequence */
            <div className="flex flex-col items-center gap-4 min-h-[120px] justify-center">
              <span className="material-symbols-outlined text-5xl text-brand-primary">terminal</span>
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
              <span className="material-symbols-outlined text-4xl mb-5 text-brand-text-muted group-hover:text-brand-primary transition-colors block">picture_as_pdf</span>
              <h3 className="font-headline font-black text-xl uppercase mb-2 text-brand-text">Ingest Clinical Data</h3>
              <p className="text-xs font-bold text-brand-text-muted uppercase tracking-wide">Drop PDF Clinical Reports here</p>
              <div className="mt-5 flex justify-center">
                <span className="bg-brand-bg border-2 border-brand-border text-brand-text px-4 py-2 font-black text-xs uppercase tracking-tighter">Maximum size 50MB</span>
              </div>
            </>
          )}

          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => handleUpload(e.target.files[0])}
          />
          {error && (
            <div className="absolute top-0 left-0 w-full h-full bg-brand-error flex items-center justify-center text-black font-headline font-black uppercase z-10 border-4 border-brand-border">
              <span className="bg-brand-surface px-4 py-2 text-brand-error border-2 border-brand-border">! {error} !</span>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
