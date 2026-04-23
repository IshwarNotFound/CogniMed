// Item #19 — ToastStack: physical toast stacking with weighted collision physics
// Replaces inline conditional toast system in App.jsx.
// AnimatePresence + layout prop handles automatic position interpolation.
import { AnimatePresence, motion } from 'framer-motion';
import { COLLISION } from '../animations/physics';

const ToastStack = ({ toasts, onDismiss }) => (
  <div className="fixed top-4 right-4 flex flex-col gap-2 z-[100]">
    <AnimatePresence>
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          layout // automatic position interpolation — no manual math needed
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={COLLISION}
          className={`border-2 border-brand-text bg-brand-bg px-4 py-3 font-mono text-sm
                      shadow-[4px_4px_0px_0px_var(--brand-text)] flex items-center gap-3
                      ${toast.type === 'error' ? 'border-brand-error' : ''}
                      ${toast.type === 'success' ? 'border-brand-primary' : ''}
                      ${toast.type === 'warning' ? 'border-brand-warning' : ''}`}
        >
          {toast.type === 'success' && (
            <span className="text-brand-primary font-black text-xs">✓</span>
          )}
          {toast.type === 'error' && (
            <span className="text-brand-error font-black text-xs">✗</span>
          )}
          {toast.type === 'warning' && (
            <span className="text-brand-warning font-black text-xs">⚠</span>
          )}
          <span className="text-brand-text text-xs uppercase font-black tracking-widest">
            {toast.message}
          </span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-2 opacity-50 hover:opacity-100 transition-opacity text-brand-text"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

export default ToastStack;
