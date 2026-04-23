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
