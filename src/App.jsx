// Items #11, #19, #20, #23, #28, #34 — App.jsx
// Uses the ORIGINAL working grid layout structure — do NOT restructure to flex
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import PDFUploader from './components/PDFUploader';
import ToastStack from './components/ToastStack';
import CipherText from './components/CipherText';
import PriorityBadge from './components/PriorityBadge';
import { checkHealth, sendMessage } from './api/client';
import { generateClinicalPDF } from './utils/pdfExport';
import { STAMP } from './animations/physics';

const genId = () =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  const add = useCallback((message, type = 'info', duration = 4000) => {
    const id = genId();
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);
  return { toasts, add, dismiss };
}

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [isOnline, setIsOnline] = useState(false);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfState, setPdfState] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const { toasts, add: addToast, dismiss: dismissToast } = useToasts();

  const [contextError, setContextError] = useState(null);
  const [pdfWarning, setPdfWarning] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState('—');
  const totalTokens = history.reduce((sum, msg) => sum + (msg.tokensGenerated || 0), 0);
  const exchangeCount = history.filter(m => m.role === 'user').length;
  const CASE_ID = '4882-QX';

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await checkHealth();
        setIsOnline(res.status === 'ok');
        if (res.pdf_loaded) {
          setPdfState({
            filename: res.pdf_filename,
            pages_indexed: Number(res.pages_indexed ?? res.pages ?? res.pdf_pages ?? 0) || 0,
            chunks_created: Number(res.chunks_created ?? res.pdf_chunks ?? 0) || 0,
          });
        }
      } catch (e) {
        setIsOnline(false);
      }
    };
    checkServer();
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleThemeChange = (newTheme) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setTheme(newTheme);
      setTimeout(() => setIsTransitioning(false), 100);
    }, 100);
  };

  const handleSend = async (messageText, imageFile, imagePreview) => {
    if (!pdfState) setPdfWarning(true);
    else setPdfWarning(false);

    if (!isOnline) {
      setContextError('model_offline');
      return;
    }

    const userMessage = {
      id: genId(),
      role: 'user',
      content: messageText,
      imagePreview,
      isHistorical: false,
    };

    setHistory(prev => [...prev, userMessage]);
    setIsLoading(true);
    setContextError(null);

    try {
      const cleanHistory = history.map(msg => ({ role: msg.role, content: msg.content }));
      const res = await sendMessage(messageText, cleanHistory, imageFile);

      const assistantMessage = {
        id: genId(),
        role: 'assistant',
        content: res.response,
        citations: res.citations || [],
        inferenceTime: res.inference_time_ms,
        tokensGenerated: res.tokens_generated,
        tokensPerSecond: res.tokens_per_second,
        status: 'complete',
        isHistorical: false,
      };

      setHistory(prev => [...prev, assistantMessage]);
      setLastAnalysisTime(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      if (e.message?.includes('context')) {
        setContextError('context_overflow');
      } else {
        setHistory(prev => [...prev, {
          id: genId(),
          role: 'assistant',
          content: '⚠️ Connection Error: Failed to reach the MedGemma backend.',
          isHistorical: false,
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (isExporting || history.length === 0) return;
    try {
      setIsExporting(true);
      generateClinicalPDF(history, pdfState);
      addToast('PDF DOWNLOADED', 'success');
    } catch (err) {
      console.error('PDF export failed:', err);
      addToast('EXPORT FAILED', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSessionReset = useCallback(() => {
    setHistory([]);
    setPdfState(null);
    setContextError(null);
    setPdfWarning(false);
    setLastAnalysisTime('—');
  }, []);

  return (
    <div className="bg-brand-bg text-brand-text h-screen overflow-hidden">
      <Header
        isOnline={isOnline}
        theme={theme}
        setTheme={handleThemeChange}
        sessionData={{ lastAnalysisTime, exchangeCount, totalTokens, caseId: CASE_ID }}
      />
      <Sidebar onSessionReset={handleSessionReset} messageCount={exchangeCount} pdfActive={!!pdfState} />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <main
        className="absolute left-0 md:left-72 top-16 right-0 bottom-0 overflow-hidden z-10 flex flex-col"
      >
        <motion.div
          animate={{ scale: isTransitioning ? 0.98 : 1 }}
          transition={{ type: "tween", duration: 0.1 }}
          style={{ transformOrigin: "center top" }}
          className="h-full w-full flex"
        >
          {/* ── Left Column — PDF Uploader, self-contained ──────────────── */}
          <div className="w-72 shrink-0 border-r-4 border-brand-border flex flex-col bg-brand-surface overflow-hidden">
            <PDFUploader pdfState={pdfState} setPdfState={setPdfState} theme={theme} />
          </div>

          {/* ── Right Column — own header + chat + input bar ─────────────── */}
          <div className="flex-1 flex flex-col overflow-hidden">

            <div className="shrink-0 flex justify-between items-center px-6 py-4 border-b-4 border-brand-border bg-brand-bg relative overflow-hidden hazard-pattern">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-1">
                  <motion.h1
                    className="text-2xl font-black font-headline uppercase leading-none text-brand-text"
                    initial={{ clipPath: 'inset(0 100% 0 0)' }}
                    animate={{ clipPath: 'inset(0 0% 0 0)' }}
                    transition={{ ...STAMP, delay: 0 }}
                  >
                    Patient Analysis
                  </motion.h1>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-brand-primary/10 border border-brand-primary/30 rounded-sm">
                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full dot-critical" />
                    <span className="text-[8px] font-black uppercase tracking-tighter text-brand-primary">CONSOLE ACTIVE</span>
                  </span>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="bg-brand-surface-high border-2 border-brand-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-text font-mono case-id hazard-border">
                    <CipherText value={`CASE-${CASE_ID}`} />
                  </span>
                  <PriorityBadge level="high" label="PRIORITY: HIGH ALPHA" />
                </div>
              </div>

              <div className="flex gap-3 items-center relative z-10">
                {contextError === 'model_offline' && (
                  <span className="bg-brand-error border-4 border-brand-border px-3 py-2 font-headline font-black uppercase text-xs text-black shadow-[4px_4px_0_0_var(--brand-border)] flex items-center gap-2">
                    ⚠ MEDGEMMA OFFLINE
                    <button onClick={() => setContextError(null)} className="text-black/60 hover:text-black">✕</button>
                  </span>
                )}
                <button
                  onClick={handleExport}
                  disabled={isExporting || history.length === 0}
                  className="bg-brand-surface border-4 border-brand-border px-5 py-2.5 font-headline font-black uppercase text-xs shadow-[4px_4px_0_0_var(--brand-border)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--brand-border)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all text-brand-text disabled:opacity-60 disabled:cursor-not-allowed group flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm group-hover:rotate-12 transition-transform">ios_share</span>
                  {isExporting ? 'Generating...' : 'Export Report'}
                </button>
                <button
                  onClick={() => history.length > 0 ? setShowResetModal(true) : handleSessionReset()}
                  className="bg-brand-primary border-4 border-brand-border px-5 py-2.5 font-headline font-black uppercase text-xs text-black shadow-[4px_4px_0_0_var(--brand-border)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--brand-border)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  New Diagnostic
                </button>
              </div>
            </div>

            {/* Scrollable chat area */}
            <div className="flex-1 overflow-y-auto px-6 pt-5 custom-scrollbar flex flex-col">
              <ChatWindow
                history={history}
                isLoading={isLoading}
                onSuggestionSelect={(text) => handleSend(text, null, null)}
                theme={theme}
                pdfActive={!!pdfState}
              />
            </div>

            {/* Pinned Input Bar */}
            <div className="shrink-0 px-6 py-3 border-t-4 border-brand-border bg-brand-bg transition-colors">
              {pdfWarning && !pdfState && (
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-brand-warning text-[10px] font-mono font-bold uppercase tracking-widest">
                    ⚠ No document in context — analysis quality will be reduced
                  </span>
                  <button onClick={() => setPdfWarning(false)} className="text-brand-text-muted hover:text-brand-text text-[10px]">✕</button>
                </div>
              )}
              <InputBar onSend={handleSend} disabled={isLoading} theme={theme} />
            </div>

          </div>

        </motion.div>
      </main>

      {/* ── New Diagnostic Confirmation Modal ──────────────────────────────── */}
      <AnimatePresence>
        {showResetModal && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowResetModal(false)} />

            {/* Modal */}
            <motion.div
              className="relative bg-brand-surface border-4 border-brand-border shadow-[8px_8px_0_0_var(--brand-border)] w-full max-w-md mx-4 overflow-hidden"
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 600, damping: 35 }}
            >
              {/* Hazard accent */}
              <div className="h-1 w-full bg-brand-warning" />

              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-brand-warning/10 border-2 border-brand-warning p-2">
                    <span className="material-symbols-outlined text-brand-warning text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-black font-headline uppercase leading-none text-brand-text">Session Termination</h2>
                    <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">IRREVERSIBLE OPERATION</span>
                  </div>
                </div>

                {/* Body */}
                <div className="bg-brand-bg border-2 border-brand-border p-4 mb-6">
                  <p className="text-sm font-bold text-brand-text leading-relaxed mb-3">
                    CogniMed operates on a <span className="text-brand-primary">zero-persistence architecture</span>. No diagnostic session data is stored on any server.
                  </p>
                  <p className="text-sm font-bold text-brand-text-muted leading-relaxed">
                    Initiating a new diagnostic will <span className="text-brand-error">permanently purge</span> the current session — all conversation history, analysis context, and loaded vector caches will be destroyed.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResetModal(false)}
                    className="flex-1 bg-brand-bg border-4 border-brand-border py-3 font-headline font-black uppercase text-xs text-brand-text shadow-[4px_4px_0_0_var(--brand-border)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--brand-border)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                    Abort
                  </button>
                  <button
                    onClick={() => { setShowResetModal(false); handleSessionReset(); }}
                    className="flex-1 bg-brand-warning border-4 border-brand-border py-3 font-headline font-black uppercase text-xs text-black shadow-[4px_4px_0_0_var(--brand-border)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_var(--brand-border)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Acknowledge
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
