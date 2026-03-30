import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSpring } from '../animations/physics';

export default function Header({ isOnline, theme, setTheme }) {
  const spring = getSpring(theme);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const settingsRef = useRef(null);
  const profileRef = useRef(null);

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
    <header className="fixed top-0 left-0 right-0 h-16 bg-brand-bg z-50 flex justify-between items-center w-full px-6 border-b-4 border-brand-border transition-colors">
      {/* Logo — boot entrance (fires once on mount) */}
      <motion.div
        className="flex items-center gap-4 cursor-pointer"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ ...spring, delay: 0 }}
      >
        <span className="text-2xl font-black text-brand-primary uppercase font-headline tracking-tighter">
          COGNIMED<span className="text-brand-text">.AI</span>
        </span>
      </motion.div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex gap-4 font-headline font-bold uppercase text-sm">
          <span className="text-brand-primary font-black">AI Analysis</span>
          <a className="text-brand-text-muted hover:bg-brand-primary hover:text-brand-bg transition-colors duration-100 px-2" href="#">Records</a>
          <a className="text-brand-text-muted hover:bg-brand-primary hover:text-brand-bg transition-colors duration-100 px-2" href="#">Archive</a>
        </div>

        <div className="flex items-center gap-4">
          {/* ONLINE/OFFLINE slot — mechanical slot-machine transition */}
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
            {/* Profile dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => { setShowProfile(p => !p); setShowSettings(false); }}
                className={`material-symbols-outlined p-1 transition-colors ${showProfile ? 'bg-brand-primary text-black' : 'hover:bg-brand-surface-high hover:text-brand-primary'}`}
              >
                account_circle
              </button>
              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-10 w-56 bg-brand-surface border-4 border-brand-border p-4 z-50 shadow-[6px_6px_0_0_var(--brand-border)]"
                  >
                    <div className="text-xs font-black uppercase tracking-widest text-brand-primary mb-3 border-b-2 border-brand-border pb-2">Session Profile</div>
                    <div className="space-y-2 text-xs font-bold text-brand-text">
                      <div className="flex justify-between"><span className="text-brand-text-muted">Role</span><span>Clinician</span></div>
                      <div className="flex justify-between"><span className="text-brand-text-muted">Session</span><span>4882-QX</span></div>
                      <div className="flex justify-between"><span className="text-brand-text-muted">Auth</span><span className="text-brand-tertiary">LOCAL</span></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Settings dropdown */}
            <div ref={settingsRef} className="relative">
              <button
                onClick={() => { setShowSettings(s => !s); setShowProfile(false); }}
                className={`material-symbols-outlined p-1 transition-colors ${showSettings ? 'bg-brand-primary text-black' : 'hover:bg-brand-surface-high hover:text-brand-primary'}`}
              >
                settings
              </button>
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-10 w-60 bg-brand-surface border-4 border-brand-border p-4 z-50 shadow-[6px_6px_0_0_var(--brand-border)]"
                  >
                    <div className="text-xs font-black uppercase tracking-widest text-brand-primary mb-3 border-b-2 border-brand-border pb-2">System Config</div>
                    <div className="space-y-2 text-xs font-bold text-brand-text">
                      <div className="flex justify-between"><span className="text-brand-text-muted">Version</span><span>v2.0.0</span></div>
                      <div className="flex justify-between"><span className="text-brand-text-muted">Model</span><span>MedGemma 4B-IT</span></div>
                      <div className="flex justify-between"><span className="text-brand-text-muted">Quantization</span><span>4-bit NF4</span></div>
                      <div className="flex justify-between"><span className="text-brand-text-muted">Vector Store</span><span>ChromaDB</span></div>
                      <div className="flex justify-between"><span className="text-brand-text-muted">Embeddings</span><span>MiniLM-L6-v2</span></div>
                    </div>
                    <a
                      href="mailto:support@cognimed.ai"
                      className="block mt-3 pt-2 border-t-2 border-brand-border text-[10px] font-bold uppercase text-brand-text-muted hover:text-brand-primary transition-colors"
                    >
                      Contact Support →
                    </a>
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
