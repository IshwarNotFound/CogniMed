// Items 10, 16 — Sidebar
// 10: Wire Purge → resetSession(), Status → checkHealth() manual poll, Support → mailto
// 16: Emergency Override physics via useAnimationControls (red cycle sequence)
import { useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import SystemStats from './SystemStats';
import { resetSession, checkHealth } from '../api/client';

export default function Sidebar({ onSessionReset }) {
  // Item 16 — useAnimationControls replaces broken whileTap array
  const purgeControls = useAnimationControls();
  const [purgeStatus, setPurgeStatus] = useState(null); // null | 'purging' | 'done' | 'error'
  const [statusResult, setStatusResult] = useState(null); // null | 'online' | 'offline'

  // Item 10 — Purge: animate first, then call the hardened reset endpoint
  const handlePurge = async () => {
    if (purgeStatus === 'purging') return;
    setPurgeStatus('purging');

    // Fire the red-cycle animation sequence
    await purgeControls.start({
      backgroundColor: [
        'var(--brand-secondary)',
        'var(--brand-error)',
        'var(--brand-secondary)',
      ],
      x: [0, 4, -2, 0],
      y: [0, 4, -2, 0],
      boxShadow: [
        '4px 4px 0 0 var(--brand-border)',
        '0px 0px 0 0 var(--brand-border)',
        '4px 4px 0 0 var(--brand-border)',
      ],
      transition: { duration: 0.35, ease: 'linear' },
    });

    try {
      await resetSession();
      setPurgeStatus('done');
      // Notify parent to clear chat history
      if (onSessionReset) onSessionReset();
      setTimeout(() => setPurgeStatus(null), 2000);
    } catch (err) {
      console.error('Session reset failed:', err);
      setPurgeStatus('error');
      setTimeout(() => setPurgeStatus(null), 3000);
    }
  };

  // Item 10 — Status: manual health poll with inline visual feedback
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
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 md:w-72 bg-brand-surface border-r-4 border-brand-border flex flex-col p-4 z-40 hidden md:flex transition-colors">
      <div className="mb-8 pl-2">
        <span className="text-xl font-black border-b-4 border-brand-border pb-2 mb-1 block font-headline uppercase text-brand-primary tracking-tighter">CLINICAL RADICALISM</span>
        <span className="text-[10px] font-bold text-brand-text-muted tracking-wide uppercase font-body opacity-80">SOVEREIGN DIAGNOSTIC V2.0</span>
      </div>

      <div className="flex-1 w-full flex flex-col items-center">
        <div className="w-full mt-4">
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

        {/* Purge feedback */}
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

        {/* Item 16 — Emergency Override with useAnimationControls red-cycle sequence */}
        <motion.button
          animate={purgeControls}
          onClick={handlePurge}
          disabled={purgeStatus === 'purging'}
          className="w-full bg-brand-secondary text-black border-2 border-brand-border py-4 mb-4 font-black tracking-tighter uppercase font-headline disabled:opacity-60"
          style={{ boxShadow: '4px 4px 0 0 var(--brand-border)' }}
        >
          {purgeStatus === 'purging' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm animate-spin">autorenew</span>
              PURGING...
            </span>
          ) : 'EMERGENCY OVERRIDE'}
        </motion.button>

        {/* Item 10 — Status + Support wired */}
        <div className="flex justify-between items-center w-full mt-4 pt-4 px-2 border-brand-border">
          {/* Item 10 — Support → mailto */}
          <a
            className="text-brand-text-muted flex items-center text-[10px] font-bold uppercase hover:text-brand-primary transition-colors"
            href="mailto:support@cognimed.ai"
          >
            <span className="material-symbols-outlined mr-1 text-sm">help</span> Support
          </a>

          {/* Item 10 — Status → manual health poll */}
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
