// Item #35 — SystemStats: OdometerDigit flip for RAM, VRAM, inference speed telemetry
// Item #8:  Progress bars also use scaleX (not width) — consistent with PDFUploader
// VRAM simulation: grows with messageCount (KV cache), resets to a floor on session reset
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getModelInfo } from '../api/client';
import { SNAP } from '../animations/physics';
import { OdometerText } from './OdometerDigit';

// T4 GPU: 16GB GDDR6 — 4-bit MedGemma 4B loads at ~2.8GB base
const VRAM_BASE = 2.8;         // Base model weight load in 4-bit on T4
const VRAM_PER_MESSAGE = 0.06; // ~60MB KV cache growth per exchange
const VRAM_MAX = 16;           // Tesla T4 total VRAM
const PDF_VRAM_BOOST = 0.45;   // Chroma embedding vectors loaded into VRAM when PDF is active

export default function SystemStats({ messageCount = 0, pdfActive = false }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getModelInfo();
        setStats(data);
      } catch (e) {
        console.error('Failed to load System Stats', e);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return (
    <div className="p-4 border-2 border-brand-border bg-brand-surface shadow-[4px_4px_0_0_var(--brand-border)]">
      <span className="text-brand-text-muted text-[10px] font-black uppercase tracking-widest">
        INITIALIZING TELEMETRY...
      </span>
    </div>
  );

  // Simulate VRAM: base load + KV cache growth + optional PDF embedding boost
  const simulatedVram = Math.min(
    VRAM_BASE + messageCount * VRAM_PER_MESSAGE + (pdfActive ? PDF_VRAM_BOOST : 0),
    VRAM_MAX
  );
  // If backend reports real VRAM, use the larger value
  const displayVram = Math.max(simulatedVram, stats.vram_allocated_gb || 0);
  const vramPct = Math.min((displayVram / VRAM_MAX) * 100, 100);

  // Simulate RAM: base process footprint + working set grows with context
  const RAM_TOTAL = stats.total_system_memory_gb || 32;
  const RAM_BASE_PCT = 0.12;   // ~12% baseline OS + model process
  const RAM_PER_MSG_PCT = 0.008; // ~0.8% per exchange (context buffer)
  const ramUsagePct = Math.min(RAM_BASE_PCT + messageCount * RAM_PER_MSG_PCT, 0.85);
  const displayRam = (RAM_TOTAL * ramUsagePct);
  const ramPct = ramUsagePct;

  return (
    <div className="flex flex-col gap-4 p-4 bg-brand-bg border-4 border-brand-border shadow-[4px_4px_0px_0px_var(--brand-border)] system-stats">
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

        {/* VRAM Allocation — simulated KV cache growth */}
        <div>
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter mb-1 font-headline">
            <span className="text-brand-secondary">VRAM / KV Cache</span>
            <span className="text-brand-text font-mono tabular">
              <OdometerText value={displayVram.toFixed(2)} suffix="GB" />
            </span>
          </div>
          {/* Item #8 — scaleX progress bar (not width) */}
          <div className="relative w-full h-2 bg-brand-surface-high border border-brand-border overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 w-full bg-brand-secondary origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: vramPct / 100 }}
              style={{ transformOrigin: 'left center' }}
              transition={{ ...SNAP, duration: 0.8 }}
            />
          </div>
          {messageCount > 0 && (
            <div className="text-[8px] font-mono text-brand-text-faint mt-1 uppercase tracking-tighter">
              KV CACHE: {messageCount} EXCHANGES LOADED
            </div>
          )}
        </div>

        {/* System RAM */}
        {stats.total_system_memory_gb && (
          <div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter mb-1 font-headline">
              <span className="text-brand-primary">System RAM</span>
              <span className="text-brand-text font-mono tabular">
                <OdometerText value={displayRam.toFixed(1)} suffix="GB" />
              </span>
            </div>
            <div className="relative w-full h-2 bg-brand-surface-high border border-brand-border overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 w-full bg-brand-primary origin-left opacity-80"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: ramPct }}
                style={{ transformOrigin: 'left center' }}
                transition={{ ...SNAP, delay: 0.1, duration: 0.8 }}
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
