// Items 6, 9, 10, 12 — App.jsx
// 6:  NaN coercion on pdfState from health payload
// 9:  Async export UI — isExporting state, non-blocking input, OOM toast
// 10: onSessionReset wired to Sidebar
// 12: Viewport physics — mainControls moved to <motion.main> only (Header/Sidebar don't warp)
import { useState, useEffect, useCallback } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import PDFUploader from './components/PDFUploader';
import { checkHealth, sendMessage } from './api/client';
import { generateClinicalPDF } from './utils/pdfExport';
import { CLACK, STAMP } from './animations/physics';

/** Generate a stable unique ID for each message */
const genId = () =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [isOnline, setIsOnline] = useState(false);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfState, setPdfState] = useState(null);

  // Item 9 — Async export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportToast, setExportToast] = useState(null); // null | 'oom' | 'success'

  // Item 12 — mainControls applied ONLY to <motion.main>
  // Header + Sidebar are fixed and must NOT be included in the scale physics
  const mainControls = useAnimationControls();

  // Apply Dark Mode class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Server Polling
  useEffect(() => {
    const checkServer = async () => {
      try {
        const res = await checkHealth();
        setIsOnline(res.status === 'ok');
        if (res.pdf_loaded) {
          setPdfState({
            filename: res.pdf_filename,
            // Item 6 — NaN guard + correct field names from /health endpoint
            // Backend sends: pdf_chunks (not chunks_created), no pages field in health
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

  // Item 12 — Viewport Physics Stabilization
  // Scale compresses, color swaps at the trough, then expands back
  const handleThemeChange = async (newTheme) => {
    // Step 1: compress main content area
    await mainControls.start({
      scale: 0.98,
      transition: { duration: 0.075, ease: 'linear' },
    });
    // Step 2: swap colors at the compression trough
    setTheme(newTheme);
    // Step 3: expand back
    mainControls.start({
      scale: 1,
      transition: { duration: 0.075, ease: 'linear' },
    });
  };

  const handleSend = async (messageText, imageFile, imagePreview) => {
    const userMessage = {
      id: genId(),
      role: 'user',
      content: messageText,
      imagePreview: imagePreview,
    };

    setHistory(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const cleanHistory = history.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const res = await sendMessage(messageText, cleanHistory, imageFile);

      const assistantMessage = {
        id: genId(),
        role: 'assistant',
        content: res.response,
        citations: res.citations || [],
        inferenceTime: res.inference_time_ms,
        tokensGenerated: res.tokens_generated,
        tokensPerSecond: res.tokens_per_second,
      };

      setHistory(prev => [...prev, assistantMessage]);
    } catch (e) {
      setHistory(prev => [...prev, {
        id: genId(),
        role: 'assistant',
        content: '⚠️ Connection Error: Failed to reach the MedGemma backend.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side PDF export — generates and downloads a report instantly.
  // No backend call, no API, no 500 errors. Pure frontend.
  const handleExport = () => {
    if (isExporting || history.length === 0) return;
    try {
      setIsExporting(true);
      generateClinicalPDF(history, pdfState);
      setExportToast('success');
    } catch (err) {
      console.error('PDF generation failed:', err);
      setExportToast('error');
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportToast(null), 4000);
    }
  };

  // Item 10 — Session reset: clear local history after Sidebar purge
  const handleSessionReset = useCallback(() => {
    setHistory([]);
    setPdfState(null);
  }, []);

  return (
    // Item 12 — Root is a plain div — Header/Sidebar are fixed and must NOT scale
    <div className="bg-brand-bg text-brand-text h-screen overflow-hidden">
      <Header isOnline={isOnline} theme={theme} setTheme={handleThemeChange} />
      {/* Item 10 — onSessionReset wired to clear history + PDF state */}
      <Sidebar onSessionReset={handleSessionReset} />

      {/* Item 12 — motion.main is the ONLY element that participates in scale physics */}
      <motion.main
        animate={mainControls}
        className="md:ml-72 mt-16 p-4 h-[calc(100vh-4rem)] overflow-hidden"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4 h-full">

          {/* Header Area */}
          <div className="col-span-12 flex justify-between items-center mb-2 border-b-4 border-brand-border pb-3">
            <div>
              <motion.h1
                className="text-3xl font-black font-headline uppercase leading-none mb-1"
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                transition={{ ...STAMP, delay: 0 }}
              >
                Patient Analysis
              </motion.h1>
              <div className="flex gap-3 items-center mt-1">
                <span className="bg-brand-surface-high border-2 border-brand-border px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-text">Case ID: 4882-QX</span>
                <span className="text-brand-text-muted font-bold uppercase text-xs">Priority: High Alpha</span>
              </div>
            </div>

            <div className="hidden lg:flex gap-3 items-center">
              {/* Item 9 — OOM / success toast */}
              {exportToast === 'oom' && (
                <span className="bg-brand-error border-4 border-brand-border px-3 py-2 font-headline font-black uppercase text-xs text-black shadow-[4px_4px_0_0_var(--brand-border)] animate-pulse">
                  ⚠ GPU MEMORY EXHAUSTED
                </span>
              )}
              {exportToast === 'success' && (
                <span className="bg-brand-tertiary border-4 border-brand-border px-3 py-2 font-headline font-black uppercase text-xs text-black shadow-[4px_4px_0_0_var(--brand-border)]">
                  ✓ PDF DOWNLOADED
                </span>
              )}
              {exportToast === 'error' && (
                <span className="bg-brand-error border-4 border-brand-border px-3 py-2 font-headline font-black uppercase text-xs text-black shadow-[4px_4px_0_0_var(--brand-border)]">
                  ✗ EXPORT FAILED
                </span>
              )}

              {/* Item 9 — Export button with localized Synthesizing... state */}
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-brand-surface border-4 border-brand-border px-4 py-2 font-headline font-bold uppercase text-sm neo-brutal-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-brand-text disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm animate-spin">autorenew</span>
                  Generating PDF...
                  </span>
                ) : 'Export Report'}
              </button>

              <button
                onClick={handleSessionReset}
                className="bg-brand-primary border-4 border-brand-border px-4 py-2 font-headline font-black uppercase text-sm text-black neo-brutal-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
              >
                New Diagnostic
              </button>
            </div>
          </div>

          {/* Left Column */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <PDFUploader pdfState={pdfState} setPdfState={setPdfState} theme={theme} />
          </div>

          {/* Right Column (Chat feed + Input) */}
          <div className="col-span-12 lg:col-span-9 flex flex-col relative h-[calc(100vh-14rem)] border-l-4 border-brand-border pl-6 transition-colors">
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar pb-4">
              <ChatWindow
                history={history}
                isLoading={isLoading}
                onSuggestionSelect={(text) => handleSend(text, null, null)}
                theme={theme}
              />
            </div>
            <div className="pt-2 bg-brand-bg w-full z-10 shrink-0 border-t-4 border-brand-border mt-2 transition-colors">
              {/* Item 9 — InputBar stays UNLOCKED during export */}
              <InputBar onSend={handleSend} disabled={isLoading} theme={theme} />
            </div>
          </div>

        </div>
      </motion.main>
    </div>
  );
}
