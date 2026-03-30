import { motion } from 'framer-motion';
import SystemStats from './SystemStats';

export default function Sidebar() {
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
        {/* EMERGENCY OVERRIDE — physical kill-switch clack */}
        <motion.button
          className="w-full bg-brand-secondary text-black border-2 border-brand-border py-4 mb-4 font-black tracking-tighter uppercase font-headline"
          style={{ boxShadow: '4px 4px 0 0 var(--brand-border)' }}
          whileTap={{
            x: 4,
            y: 4,
            boxShadow: '0px 0px 0px 0px var(--brand-border)',
            backgroundColor: ['var(--brand-secondary)', 'var(--brand-error)', 'var(--brand-secondary)'],
            transition: { duration: 0.15, ease: 'linear' },
          }}
        >
          EMERGENCY OVERRIDE
        </motion.button>

        <div className="flex justify-between items-center w-full mt-4 pt-4 px-2 border-brand-border">
          <a className="text-brand-text-muted flex items-center text-[10px] font-bold uppercase hover:text-brand-primary transition-colors" href="#">
            <span className="material-symbols-outlined mr-1 text-sm">help</span> Support
          </a>
          <a className="text-brand-text-muted flex items-center text-[10px] font-bold uppercase hover:text-brand-primary transition-colors" href="#">
            <span className="material-symbols-outlined mr-1 text-sm">sensors</span> Status
          </a>
        </div>
      </div>
    </aside>
  );
}
