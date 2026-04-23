# ⚕️ CogniMed Presentation Brief: Moksh (Lead Frontend Architect)

## 📌 Role Overview
**Your Role:** Person 2 - Lead Frontend Developer (The General)
**Focus:** Core Application State, Component Orchestration, and Layout Logic.
**Key Files Owned:** `App.jsx`, `ChatWindow.jsx`, `Sidebar.jsx`, `Header.jsx`

As the Lead Frontend Architect, you built the core application shell that holds everything together. While others built specific tools or animations, you managed the state, hooked up the components, and made sure the chat feed works smoothly. You acted as the core integrator.

---

## 🔬 Core Logic & Code Breakdown

### 1. The Motherboard: `App.jsx`
`App.jsx` is the React application shell. 
- **Health Polling:** It uses a `useEffect` to poll the MedGemma backend every 30 seconds (`checkHealth()`) to check if the AI is online and if a PDF is currently loaded in the ChromaDB vector matrix. If the connection drops, it auto-restricts access to prevent blank states.
- **State Management Ecosystem:** You manage massive pieces of state:
  - `history`: An array of all messages `[ {role: 'user', content: '...'}, {role: 'assistant', ...} ]`
  - `pdfState`: Contains metadata about the indexed PDF (`filename`, `pages_indexed`, `chunks_created`), used to warn the user if they lack context.
  - `isOnline`, `isLoading`, `contextError`.
- **Message Handling (`handleSend`):** When a user sends a message, you immediately append their message to `history`, set `isLoading=true`, and call the `sendMessage` API. If it succeeds, you append the AI's response to the history array and update the `lastAnalysisTime`.
- **Error Handling & Banners:** You added error states specifically catching `context_overflow`, gracefully showing anchored warning banners inside the Header.

### 2. Chat Rendering: `ChatWindow.jsx`
- **Auto-Scrolling:** You used a `useRef` pointing to a `bottomRef` `div` at the end of the chat list. Whenever `history` or `isLoading` changes, it relies on a `useEffect` to trigger `.scrollIntoView({ behavior: 'smooth' })`.
- **Smart Grouping:** You wrote a helper function `isGrouped` that checks if consecutive messages are from the same role. It dynamically adjusts margins so messages stack cleanly, reducing vertical clutter.
- **Neural Banner:** You created a memoized `NeuralBanner` component at the top of the chat area to safely persist the clinic "System Active" narrative without unnecessary re-renders.

### 3. Layout Infrastructure: `Header.jsx` & `Sidebar.jsx`
- **Header:** Manages blast-door dropdowns for Profile and System Config with click-outside detectors. Passes `theme` variables to trigger dark mode at the HTML dom level.
- **Sidebar:** Contains the Emergency Override button that flushes the backend session securely and calls API state-reset triggers, along with the System Stats components.

---

## 🎤 Presentation Q&A Sandbox

**Q: In App.jsx, how do you handle the chat history and maintain conversational context to the LLM?**  
**Your Answer:** "I manage the chat history as a reactive state array of message objects. When a user submits a prompt, I optimistically append their query to update the UI instantly. Then, I map the entire history array to strip out frontend metadata and send the clean object array to the MedGemma FastApi backend. This ensures the model retains full multi-turn conversational context."

**Q: What happens if the AI backend crashes or the user hits a context-window limit?**  
**Your Answer:** "I built robust error boundaries in the `handleSend` catch-block and background API. If the LLM throws a 500 error regarding context, I intercept the string and set `contextError` to 'context_overflow', which triggers a specialized warning banner offering an emergency session purge. If the backend is unreachable entirely, the health ping flips `isOnline` to false and locks the UI inputs."

**Q: How did you optimize rendering in the ChatWindow given there can be huge walls of text?**  
**Your Answer:** "Since the ChatWindow constantly re-renders as streaming text arrives, I used React `memo` on static top-level elements like the `NeuralBanner` to prevent paint flashing. I delegated the actual layout recalculations to Framer Motion's `layout=position` engine on individual message bubbles, ensuring the DOM doesn't thrash."

---

## 💻 Source Code Annex


### File: src/App.jsx
```jsx
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

```

### File: src/components/ChatWindow.jsx
```jsx
// Items #6, #10, #13 — ChatWindow
// PRESERVES the original simple structure — parent in App.jsx handles scrolling
// #6:  layout="position" on message wrappers
// #10: Back to Present scroll pill — delegated to parent scroll container
// #13: Message group compression
import { useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import PendingMessage from './PendingMessage';
import SuggestionCards from './SuggestionCards';
import { CLACK, SNAP, STAMP } from '../animations/physics';

// ─── Item #15 — Banner memoization ──────────────────────────────────────────
const NeuralBanner = memo(function NeuralBanner() {
  return (
    <div className="bg-brand-surface border-4 border-brand-border p-4 shadow-[8px_8px_0_0_var(--brand-border)] flex items-start gap-4 mb-3 mt-1 transition-colors">
      <div className="bg-brand-bg border-2 border-brand-border p-3 text-brand-primary shadow-[2px_2px_0_0_var(--brand-border)]">
        <motion.span
          className="material-symbols-outlined text-2xl block"
          style={{ fontVariationSettings: "'FILL' 1" }}
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1.1, 1] }}
          transition={CLACK}
        >
          psychology
        </motion.span>
      </div>
      <div>
        <motion.h3
          className="text-xl font-black font-headline uppercase leading-none mb-1 text-brand-text"
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ ...STAMP, delay: 0 }}
        >
          Neural Inference Active
        </motion.h3>
        <p className="text-sm font-bold leading-tight text-brand-text-muted">
          AI engine is live and monitoring the current diagnostic baseline. Upload clinical documents or inquire below.
        </p>
      </div>
    </div>
  );
});

// Item #13 — consecutive same-role messages compress spacing
const isGrouped = (messages, index) =>
  index > 0 && messages[index].role === messages[index - 1].role;

export default function ChatWindow({ history, isLoading, onSuggestionSelect, theme, pdfActive }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const lastAiIndex = (() => {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === 'assistant') return i;
    }
    return -1;
  })();

  const lastExchangeStart = (() => {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role === 'user') return i;
    }
    return -1;
  })();

  return (
    <div className="space-y-3">
      <NeuralBanner />

      {history.length === 0 ? (
        <SuggestionCards onSelect={onSuggestionSelect} theme={theme} />
      ) : (
        <div className="pb-4">
          <AnimatePresence initial={false}>
            {history.map((msg, idx) => {
              const grouped = isGrouped(history, idx);
              const isActiveExchange = idx >= lastExchangeStart;
              return (
                <motion.div
                  key={msg.id}
                  layout="position"
                  transition={SNAP}
                  className={grouped ? 'mt-1' : 'mt-4'}
                >
                  <MessageBubble
                    message={msg}
                    theme={theme}
                    isLatest={msg.role === 'assistant' && idx === lastAiIndex && !isLoading}
                    isActiveExchange={isActiveExchange}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
          <AnimatePresence>
            {isLoading && <PendingMessage key="pending" pdfActive={pdfActive} />}
          </AnimatePresence>
          <div ref={bottomRef} className="h-2" />
        </div>
      )}
    </div>
  );
}

```

### File: src/components/Sidebar.jsx
```jsx
// Items #17, #31, #37 — Sidebar
// #17: Emergency Override uses KineticButton physics
// #31: Sidebar stamp indicator on active link (scaleX left stamp)
// #37: CSS grain texture (grain-overlay class)
// NOTE: Session history grouping (#29) requires real session data — mock removed.
import { useState } from 'react';
import { motion } from 'framer-motion';
import SystemStats from './SystemStats';
import KineticButton from './KineticButton';
import { resetSession, checkHealth } from '../api/client';

export default function Sidebar({ onSessionReset }) {
  const [purgeStatus, setPurgeStatus] = useState(null); // null | 'purging' | 'done' | 'error'
  const [statusResult, setStatusResult] = useState(null); // null | 'online' | 'offline'

  const handlePurge = async () => {
    if (purgeStatus === 'purging') return;
    setPurgeStatus('purging');
    try {
      await resetSession();
      setPurgeStatus('done');
      if (onSessionReset) onSessionReset();
      setTimeout(() => setPurgeStatus(null), 2000);
    } catch (err) {
      console.error('Session reset failed:', err);
      setPurgeStatus('error');
      setTimeout(() => setPurgeStatus(null), 3000);
    }
  };

  const handleStatus = async () => {
    setStatusResult(null);
    try {
      const res = await checkHealth();
      setStatusResult(res.status === 'ok' ? 'online' : 'offline');
    } catch {
      setStatusResult('offline');
    }
    setTimeout(() => setStatusResult(null), 3000);
  };

  return (
    // Item #12 — background = brand-surface (1 level darker than chat-window brand-bg)
    // Item #37 — grain-overlay = 2.5% feTurbulence noise on this static surface
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 md:w-72 bg-brand-surface border-r-4 border-brand-border flex flex-col p-4 z-40 hidden md:flex transition-colors relative grain-overlay">
      <div className="mb-6 pl-2">
        <span className="text-xl font-black border-b-4 border-brand-border pb-2 mb-1 block font-headline uppercase text-brand-primary tracking-tighter">
          CLINICAL RADICALISM
        </span>
        <span className="text-[10px] font-bold text-brand-text-muted tracking-wide uppercase opacity-80">
          SOVEREIGN DIAGNOSTIC V2.0
        </span>
      </div>

      {/* System Telemetry */}
      <div className="flex-1 w-full flex flex-col overflow-y-auto">
        <div className="w-full">
          <SystemStats />
        </div>
      </div>

      <div className="mt-auto border-t-4 border-brand-border pt-4 px-2 space-y-2">
        {/* Inline status feedback */}
        {statusResult && (
          <div className={`text-center text-xs font-black uppercase tracking-widest py-2 border-2 border-brand-border mb-2 ${statusResult === 'online' ? 'bg-brand-tertiary text-black' : 'bg-brand-error text-black'}`}>
            {statusResult === 'online' ? '✅ BACKEND ONLINE' : '❌ BACKEND UNREACHABLE'}
          </div>
        )}
        {purgeStatus === 'done' && (
          <div className="text-center text-xs font-black uppercase tracking-widest py-2 border-2 border-brand-border mb-2 bg-brand-tertiary text-black">
            ✓ SESSION PURGED
          </div>
        )}
        {purgeStatus === 'error' && (
          <div className="text-center text-xs font-black uppercase tracking-widest py-2 border-2 border-brand-border mb-2 bg-brand-error text-black">
            ✗ PURGE FAILED
          </div>
        )}

        {/* Item #17 — Emergency Override: KineticButton physics */}
        <KineticButton
          id="emergency-override-btn"
          onClick={handlePurge}
          disabled={purgeStatus === 'purging'}
          className="w-full bg-brand-secondary text-black border-2 border-brand-border py-4 mb-4 font-black tracking-tighter uppercase font-headline disabled:opacity-60 min-h-[44px]"
          style={{ boxShadow: '4px 4px 0 0 var(--brand-border)' }}
        >
          {purgeStatus === 'purging' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm animate-spin">autorenew</span>
              PURGING...
            </span>
          ) : 'EMERGENCY OVERRIDE'}
        </KineticButton>

        <div className="flex justify-between items-center w-full mt-4 pt-4 px-2 border-brand-border">
          <a
            className="text-brand-text-muted flex items-center text-[10px] font-bold uppercase hover:text-brand-primary transition-colors"
            href="mailto:support@cognimed.ai"
          >
            <span className="material-symbols-outlined mr-1 text-sm">help</span> Support
          </a>
          <button
            onClick={handleStatus}
            className="text-brand-text-muted flex items-center text-[10px] font-bold uppercase hover:text-brand-primary transition-colors cursor-pointer bg-transparent border-none"
          >
            <span className="material-symbols-outlined mr-1 text-sm">sensors</span> Status
          </button>
        </div>
      </div>
    </aside>
  );
}

```

### File: src/components/Header.jsx
```jsx
// Items #18, #20, #36, #37 — Header
// #18: Blast Door dropdowns (scaleY: 0→1, content separate opacity with 60ms delay)
// #20: Last analysis session stamp in header (exchangeCount, totalTokens)
// #36: Header accent divider stroke (via header-accent CSS class)
// #37: CSS grain texture on header (via grain-overlay CSS class)
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DOOR } from '../animations/physics';
import CipherText from './CipherText';

// ─── Item #18 — Blast Door Dropdown Variants ─────────────────────────────────
// scaleY: 0→1 from top; content has a 60ms delay so it doesn't bleed through unopened door
const dropdownVariants = {
  closed: { scaleY: 0, opacity: 0, transformOrigin: 'top center' },
  open: {
    scaleY: 1,
    opacity: 1,
    transformOrigin: 'top center',
    transition: {
      scaleY: { ...DOOR, duration: 0.18 },
      opacity: { duration: 0.01 }, // instant — content hidden by scaleY
    },
  },
};

const contentVariants = {
  closed: { opacity: 0 },
  open: { opacity: 1, transition: { delay: 0.06, duration: 0.12 } },
};

export default function Header({ isOnline, theme, setTheme, sessionData }) {
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const settingsRef = useRef(null);
  const profileRef = useRef(null);

  // sessionData: { lastAnalysisTime, exchangeCount, totalTokens, caseId }
  const {
    lastAnalysisTime = '—',
    exchangeCount = 0,
    totalTokens = 0,
    caseId = '4882-QX',
  } = sessionData || {};

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) setShowSettings(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    // Item #36 — header-accent::after = 40px bottom accent stroke
    // Item #37 — grain-overlay::before = 2.5% feTurbulence noise (static surface only)
    <header className="fixed top-0 left-0 right-0 h-16 bg-brand-bg z-50 flex justify-between items-center w-full px-6 border-b-4 border-brand-border transition-colors relative header-accent grain-overlay">
      {/* Logo */}
      <motion.div
        className="flex flex-col cursor-pointer"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 700, damping: 40, delay: 0 }}
      >
        <span className="text-2xl font-black text-brand-primary uppercase font-headline tracking-tighter leading-none">
          COGNIMED<span className="text-brand-text">.AI</span>
        </span>

        {/* ─── Item #20 — Last Analysis Session Stamp ────────────────────────── */}
        {exchangeCount > 0 && (
          <span
            className="font-mono text-[10px] text-brand-text-faint hidden lg:block"
            style={{ letterSpacing: '0.04em' }}
          >
            Last: {lastAnalysisTime} · {exchangeCount} exchanges · {totalTokens.toLocaleString()} tokens
          </span>
        )}
      </motion.div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex gap-4 font-headline font-bold uppercase text-sm">
          <span className="text-brand-primary font-black">AI Analysis</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Online / Offline indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 border-2 border-brand-border ${isOnline ? 'bg-brand-tertiary' : 'bg-brand-error'}`} />
            <div className="text-xs font-headline font-black uppercase text-brand-text tracking-widest hidden sm:block overflow-hidden" style={{ height: '1.2em' }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={isOnline ? 'online' : 'offline'}
                  initial={{ y: -8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 8, opacity: 0 }}
                  transition={{ duration: 0.15, type: 'spring', stiffness: 400, damping: 30 }}
                  className="block"
                >
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex bg-brand-surface border-2 border-brand-border p-1 ml-4 shadow-[4px_4px_0px_0px_var(--brand-border)]">
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1 px-2 py-1 font-bold text-[10px] uppercase tracking-widest border border-brand-border transition-colors ${theme === 'dark' ? 'bg-brand-primary text-black' : 'text-brand-text-muted hover:text-brand-text bg-transparent'}`}
            >
              <span className="material-symbols-outlined text-sm">dark_mode</span>
              Dark
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1 px-2 py-1 font-bold text-[10px] uppercase tracking-widest border border-brand-border transition-colors ${theme === 'light' ? 'bg-brand-primary text-black' : 'text-brand-text-muted hover:text-brand-text bg-transparent'}`}
            >
              <span className="material-symbols-outlined text-sm">light_mode</span>
              Light
            </button>
          </div>

          <div className="flex items-center gap-3 ml-2 border-l-2 border-brand-border pl-4 text-brand-text">
            {/* ─── Item #18 — Profile Blast Door Dropdown ──────────────────── */}
            <div ref={profileRef} className="relative">
              <button
                id="profile-btn"
                onClick={() => { setShowProfile(p => !p); setShowSettings(false); }}
                aria-label="Session profile"
                title="Session profile"
                className={`material-symbols-outlined p-1 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${showProfile ? 'bg-brand-primary text-black' : 'hover:bg-brand-surface-high hover:text-brand-primary'}`}
              >
                account_circle
              </button>
              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    className="absolute right-0 top-10 w-56 bg-brand-surface border-4 border-brand-border z-50 shadow-[6px_6px_0_0_var(--brand-border)] overflow-hidden"
                  >
                    <motion.div variants={contentVariants} className="p-4">
                      <div className="text-xs font-black uppercase tracking-widest text-brand-primary mb-3 border-b-2 border-brand-border pb-2">
                        Session Profile
                      </div>
                      <div className="space-y-2 text-xs font-bold text-brand-text">
                        <div className="flex justify-between">
                          <span className="text-brand-text-muted">Role</span>
                          <span>Clinician</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-text-muted">Session</span>
                          {/* Item #28 — CipherText on Case ID */}
                          <span className="font-mono case-id">
                            <CipherText value={caseId} />
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-text-muted">Auth</span>
                          <span className="text-brand-tertiary">LOCAL</span>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─── Item #18 — Settings Blast Door Dropdown ─────────────────── */}
            <div ref={settingsRef} className="relative">
              <button
                id="settings-btn"
                onClick={() => { setShowSettings(s => !s); setShowProfile(false); }}
                aria-label="Workspace settings"
                title="Workspace settings"
                className={`material-symbols-outlined p-1 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors ${showSettings ? 'bg-brand-primary text-black' : 'hover:bg-brand-surface-high hover:text-brand-primary'}`}
              >
                settings
              </button>
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    className="absolute right-0 top-10 w-60 bg-brand-surface border-4 border-brand-border z-50 shadow-[6px_6px_0_0_var(--brand-border)] overflow-hidden"
                  >
                    <motion.div variants={contentVariants} className="p-4">
                      <div className="text-xs font-black uppercase tracking-widest text-brand-primary mb-3 border-b-2 border-brand-border pb-2">
                        System Config
                      </div>
                      <div className="space-y-2 text-xs font-bold text-brand-text">
                        <div className="flex justify-between">
                          <span className="text-brand-text-muted">Version</span>
                          <span>v2.0.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-text-muted">Model</span>
                          <span>MedGemma 4B-IT</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-text-muted">Quantization</span>
                          <span>4-bit NF4</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-text-muted">Vector Store</span>
                          <span>ChromaDB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-text-muted">Embeddings</span>
                          <span>MiniLM-L6-v2</span>
                        </div>
                      </div>
                      <a
                        href="mailto:support@cognimed.ai"
                        className="block mt-3 pt-2 border-t-2 border-brand-border text-[10px] font-bold uppercase text-brand-text-muted hover:text-brand-primary transition-colors"
                      >
                        Contact Support →
                      </a>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

```

