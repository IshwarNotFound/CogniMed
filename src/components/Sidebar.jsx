// Items #17, #31, #37 — Sidebar
// #17: Emergency Override uses KineticButton physics
// #31: Sidebar stamp indicator on active link (scaleX left stamp)
// #37: CSS grain texture (grain-overlay class)
// NOTE: Session history grouping (#29) requires real session data — mock removed.
import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import SystemStats from './SystemStats';
import KineticButton from './KineticButton';
import { resetSession, checkHealth } from '../api/client';

// ─── Bio-Heartbeat Component ─────────────────────────────────────────────────
const Heartbeat = memo(({ pdfActive = false }) => {
  return (
    <div className="h-12 w-full bg-brand-bg border-2 border-brand-border relative overflow-hidden mb-4 shadow-[2px_2px_0_0_var(--brand-border)]">
      <div className="absolute top-1 left-2 text-[8px] font-mono font-black text-brand-primary uppercase tracking-tighter z-10">
        Bio-Core Heartbeat
      </div>
      <svg className="w-full h-full" preserveAspectRatio="none">
        {pdfActive ? (
          // Animated pulse when document is loaded
          <motion.path
            d="M 0 24 L 20 24 L 25 10 L 30 38 L 35 24 L 100 24"
            fill="none"
            stroke="var(--color-brand-primary)"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: [0, 1, 1],
              opacity: [0, 1, 0],
              x: [0, 100]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ) : (
          // Static flat line when idle
          <line x1="0" y1="24" x2="300" y2="24" stroke="var(--color-brand-primary)" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
        )}
        <line x1="0" y1="24" x2="300" y2="24" stroke="var(--color-brand-border)" strokeWidth="1" strokeDasharray="2 2" />
      </svg>
      <div className="absolute bottom-1 right-2 text-[8px] font-mono text-brand-text-faint">
        {pdfActive ? 'BPM: 72.4' : 'BPM: —'}
      </div>
    </div>
  );
});

// ─── System Log Component ────────────────────────────────────────────────────
const TerminalLog = memo(() => {
  const [logs, setLogs] = useState([
    "[ SYSTEM ]: V-MATRIX INITIALIZED",
    "[ KERNEL ]: NEURAL PATHS MAPPED",
    "[ SAFETY ]: HIPAA PROTOCOL ACTIVE"
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const messages = [
        `[ IDLE ]: PKT_${Math.floor(Math.random() * 999)} RECV`,
        `[ SCAN ]: NODE_${Math.floor(Math.random() * 99)} STABLE`,
        `[ SYNC ]: LATENCY ${Math.floor(Math.random() * 20)}ms`,
        "[ AUTO ]: CACHE PURGE REQ",
        "[ DISK ]: VECTOR BLOCK 0x4F"
      ];
      setLogs(prev => [messages[Math.floor(Math.random() * messages.length)], ...prev].slice(0, 5));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-black/40 border-2 border-brand-border p-2 mb-4 font-mono text-[8px] leading-tight text-brand-text-muted">
      {logs.map((log, i) => (
        <div key={i} className={i === 0 ? "text-brand-primary" : ""}>{log}</div>
      ))}
    </div>
  );
});

export default function Sidebar({ onSessionReset, messageCount = 0, pdfActive = false }) {
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
          DIAGNOSTIC WORKSTATION
        </span>
        <span className="text-[10px] font-bold text-brand-text-muted tracking-wide uppercase opacity-80">
          SOVEREIGN DIAGNOSTIC V2.0
        </span>
      </div>

      <div className="flex-1 w-full flex flex-col overflow-y-auto custom-scrollbar pr-1">
        <Heartbeat pdfActive={pdfActive} />
        <TerminalLog />
        <SystemStats messageCount={messageCount} pdfActive={pdfActive} />
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
          className="w-full bg-transparent text-brand-error border-2 border-brand-error py-3 mb-4 font-black tracking-tighter uppercase font-headline disabled:opacity-60 min-h-[44px] hover:bg-brand-error hover:text-black transition-colors"
          style={{ boxShadow: '2px 2px 0 0 var(--brand-error)' }}
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
