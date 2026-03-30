import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { getModelInfo } from '../api/client';
import { DATA_REVEAL } from '../animations/physics';

/**
 * NumberTicker — isolated number counter.
 * Only the text node re-renders at 60fps, not the parent component.
 */
function NumberTicker({ value, decimals = 0, suffix = '' }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) =>
    decimals > 0 ? v.toFixed(decimals) : Math.round(v).toString()
  );
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => setDisplay(v));
    return unsubscribe;
  }, [rounded]);

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [value, motionVal]);

  return (
    <motion.span>
      {display}{suffix}
    </motion.span>
  );
}

export default function SystemStats() {
  const [stats, setStats] = useState(null);
  const [prevStats, setPrevStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getModelInfo();
        setPrevStats(s => s || data);
        setStats(data);
      } catch (e) {
        console.error("Failed to load System Stats", e);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return (
    <div className="p-4 border-2 border-brand-border bg-brand-surface shadow-[4px_4px_0_0_var(--brand-border)]">
      <span className="text-brand-text-muted text-[10px] font-black uppercase tracking-widest">INITIALIZING TELEMETRY...</span>
    </div>
  );

  const VRAM_MAX = 24;
  const vramPct = Math.min((stats.vram_allocated_gb / VRAM_MAX) * 100, 100);
  // For RAM we use total as the entire bar (no "used" field from API)
  const ramPct = stats.total_system_memory_gb ? Math.min((stats.total_system_memory_gb / 128) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-4 p-4 bg-brand-bg border-4 border-brand-border shadow-[4px_4px_0px_0px_var(--brand-border)]">
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-brand-secondary text-base">memory</span>
        <h3 className="text-brand-text text-xs font-black uppercase tracking-widest font-headline">System Stats</h3>
      </div>

      <div className="space-y-4">
        {/* GPU Device */}
        <div>
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter mb-1 font-headline">
            <span className="text-brand-primary">GPU Device</span>
            <span className="text-brand-text text-right truncate max-w-[140px]">{stats.device_name}</span>
          </div>
        </div>

        {/* VRAM Allocation */}
        <div>
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter mb-1 font-headline">
            <span className="text-brand-secondary">VRAM Allocation</span>
            <span className="text-brand-text font-mono">
              <NumberTicker value={stats.vram_allocated_gb} decimals={1} suffix="GB" />
            </span>
          </div>
          <div className="h-2 bg-brand-surface-high w-full border border-brand-border overflow-hidden">
            <motion.div
              className="h-full bg-brand-secondary"
              initial={{ width: '0%' }}
              animate={{ width: `${vramPct}%` }}
              transition={DATA_REVEAL}
            />
          </div>
        </div>

        {/* System RAM */}
        {stats.total_system_memory_gb && (
          <div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter mb-1 font-headline">
              <span className="text-brand-primary">System RAM</span>
              <span className="text-brand-text font-mono">
                <NumberTicker value={stats.total_system_memory_gb} decimals={1} suffix="GB" />
              </span>
            </div>
            <div className="h-2 bg-brand-surface-high w-full border border-brand-border overflow-hidden">
              <motion.div
                className="h-full bg-brand-primary opacity-80"
                initial={{ width: '0%' }}
                animate={{ width: `${ramPct}%` }}
                transition={DATA_REVEAL}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t-2 border-brand-border">
        <p className="text-[9px] font-mono text-brand-text-muted">PLATFORM: {stats.platform}</p>
        <p className="text-[9px] font-mono text-brand-primary">STATUS: {stats.quantization}</p>
      </div>
    </div>
  );
}
