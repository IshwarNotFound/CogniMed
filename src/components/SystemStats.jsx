import { useEffect, useState } from 'react';
import { getModelInfo } from '../api/client';

export default function SystemStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getModelInfo();
        setStats(data);
      } catch (e) {
        console.error("Failed to load System Stats", e);
      }
    };
    
    fetchStats();
    // Poll every 10 seconds for updated stats
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return (
    <div className="p-4 border-2 border-brand-border bg-brand-surface shadow-[4px_4px_0_0_var(--brand-border)] animate-pulse">
        <span className="text-brand-text-muted text-[10px] font-black uppercase">INITIALIZING TELEMETRY...</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 p-4 bg-brand-bg border-4 border-brand-border shadow-[4px_4px_0px_0px_var(--brand-border)]">
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined text-brand-secondary text-base">memory</span>
        <h3 className="text-brand-text text-xs font-black uppercase tracking-widest font-headline">System Stats</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter mb-1 font-headline">
            <span className="text-brand-primary">GPU Device</span>
            <span className="text-brand-text text-right">{stats.device_name}</span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter mb-1 font-headline">
            <span className="text-brand-secondary">VRAM Allocation</span>
            <span className="text-brand-text">{stats.vram_allocated_gb.toFixed(1)}GB</span>
          </div>
          <div className="h-2 bg-brand-surface-high w-full border border-brand-border">
            {/* Visualizer assuming a max standard VRAM like 24GB or 48GB, we just do a visual pulse */}
            <div className="h-full bg-brand-secondary animate-pulse" style={{ width: '40%' }}></div>
          </div>
        </div>
        
        {stats.total_system_memory_gb && (
            <div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter mb-1 font-headline">
                <span className="text-brand-primary">System RAM</span>
                <span className="text-brand-text">{stats.total_system_memory_gb.toFixed(1)}GB</span>
            </div>
            <div className="h-2 bg-brand-surface-high w-full border border-brand-border">
                <div className="h-full bg-brand-primary opacity-80" style={{ width: '60%' }}></div>
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
