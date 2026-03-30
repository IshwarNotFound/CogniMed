import { motion, AnimatePresence } from 'framer-motion';
import { getSpring } from '../animations/physics';

export default function Header({ isOnline, theme, setTheme }) {
  const spring = getSpring(theme);

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
            <button className="material-symbols-outlined p-1 hover:bg-brand-surface-high hover:text-brand-primary transition-colors">account_circle</button>
            <button className="material-symbols-outlined p-1 hover:bg-brand-surface-high hover:text-brand-primary transition-colors">settings</button>
          </div>
        </div>
      </div>
    </header>
  );
}
