// Items #11, #19, #20, #23, #28, #34 — App.jsx
// Uses the ORIGINAL working grid layout structure — do NOT restructure to flex
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
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
      <Sidebar onSessionReset={handleSessionReset} />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <main
        className="absolute left-0 md:left-72 top-16 right-0 bottom-0 p-4 overflow-hidden z-10"
      >
        <motion.div
          animate={{ scale: isTransitioning ? 0.98 : 1 }}
          transition={{ type: "tween", duration: 0.1 }}
          style={{ transformOrigin: "center top" }}
          className="h-full w-full"
        >
        <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4 h-full">

          {/* Header Area — col-span-12 */}
          <div className="col-span-12 flex justify-between items-center mb-2 border-b-4 border-brand-border pb-3">
            <div>
              <motion.h1
                className="text-3xl font-black font-headline uppercase leading-none mb-1 text-brand-text"
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                transition={{ ...STAMP, delay: 0 }}
              >
                Patient Analysis
              </motion.h1>
              <div className="flex gap-3 items-center mt-1">
                <span className="bg-brand-surface-high border-2 border-brand-border px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-text font-mono case-id">
                  <CipherText value={`CASE-${CASE_ID}`} />
                </span>
                <PriorityBadge level="high" label="PRIORITY: HIGH ALPHA" />
              </div>
            </div>

            <div className="hidden lg:flex gap-3 items-center">
              {/* Anchored error banners */}
              {contextError === 'model_offline' && (
                <span className="bg-brand-error border-4 border-brand-border px-3 py-2 font-headline font-black uppercase text-xs text-black shadow-[4px_4px_0_0_var(--brand-border)] flex items-center gap-2">
                  ⚠ MEDGEMMA OFFLINE
                  <button onClick={() => setContextError(null)} className="text-black/60 hover:text-black">✕</button>
                </span>
              )}
              {contextError === 'context_overflow' && (
                <span className="bg-brand-warning border-4 border-brand-border px-3 py-2 font-headline font-black uppercase text-xs text-black shadow-[4px_4px_0_0_var(--brand-border)] flex items-center gap-2">
                  ⚠ CONTEXT FULL
                  <button onClick={() => { setContextError(null); handleSessionReset(); }} className="text-black/60 hover:text-black underline">New Session</button>
                </span>
              )}

              <button
                onClick={handleExport}
                disabled={isExporting || history.length === 0}
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

          {/* Left Column — PDF Uploader */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <PDFUploader pdfState={pdfState} setPdfState={setPdfState} theme={theme} />
          </div>

          {/* Right Column — Chat feed + Input */}
          <div className="col-span-12 lg:col-span-9 flex flex-col relative h-[calc(100vh-14rem)] border-l-4 border-brand-border pl-6 transition-colors">
            <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar pb-4">
              <ChatWindow
                history={history}
                isLoading={isLoading}
                onSuggestionSelect={(text) => handleSend(text, null, null)}
                theme={theme}
                pdfActive={!!pdfState}
              />
            </div>
            <div className="pt-2 bg-brand-bg w-full z-10 shrink-0 border-t-4 border-brand-border mt-2 transition-colors">
              {pdfWarning && !pdfState && (
                <div className="mb-1 px-2 py-1 flex items-center gap-2">
                  <span className="text-brand-warning text-[10px] font-mono font-bold uppercase tracking-widest">
                    ⚠ No document in context — analysis quality will be reduced
                  </span>
                  <button onClick={() => setPdfWarning(false)} className="text-brand-text-muted hover:text-brand-text text-[10px]">✕</button>
                </div>
              )}
              <InputBar onSend={handleSend} disabled={isLoading} theme={theme} />
            </div>
          </div>

        </div>
        </motion.div>
      </main>
    </div>
  );
}
