import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getSuggestions } from '../api/client';
import { getSpring } from '../animations/physics';

const cardVariants = {
  hidden: { opacity: 0, y: -20 },
  show: (spring) => ({
    opacity: 1,
    y: 0,
    transition: spring,
  }),
};

export default function SuggestionCards({ onSelect, theme }) {
  const [suggestions, setSuggestions] = useState([]);
  const spring = getSpring(theme);
  const stagger = theme === 'dark' ? 0.05 : 0.08;

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await getSuggestions();
        if (data && data.suggestions) {
          setSuggestions(data.suggestions);
        }
      } catch (e) {
        console.error("Failed to load suggestions, using fallbacks", e);
        setSuggestions([
          { id: 1, title: "Analyze latest lab results", description: "Full biomarker breakdown", icon: "analytics", query: "Can you analyze the latest lab results and provide a full biomarker breakdown?" },
          { id: 2, title: "Check drug interactions", description: "Verify compatibility matrices", icon: "medication", query: "Please check the patient's current medication list for any dangerous drug interactions." },
          { id: 3, title: "Summarize patient history", description: "Temporal trend synthesis", icon: "history_edu", query: "Provide a comprehensive summary of the patient's medical history over the last 5 years." }
        ]);
      }
    };
    fetchSuggestions();
  }, []);

  if (suggestions.length === 0) return null;

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
      initial="hidden"
      animate="show"
    >
      {suggestions.map((card, idx) => (
        <motion.button
          key={card.id || idx}
          custom={spring}
          variants={cardVariants}
          whileHover={{
            y: -4,
            boxShadow: '6px 6px 0px 0px var(--brand-primary)',
          }}
          onClick={() => onSelect(card.query || card.title)}
          className="group relative overflow-hidden bg-brand-surface-high border-4 border-brand-border border-l-8 border-l-brand-primary p-6 text-left shadow-[4px_4px_0px_0px_var(--brand-border)] flex flex-col gap-3"
        >
          {/* Faint Background Grid */}
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(var(--color-brand-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-brand-border) 1px, transparent 1px)', backgroundSize: '10px 10px' }} />

          <div className="text-brand-primary relative z-10">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {card.icon || 'analytics'}
            </span>
          </div>
          <p className="text-sm font-black uppercase tracking-widest text-brand-text group-hover:text-brand-primary transition-colors leading-tight relative z-10">
            {card.title}
          </p>
          <p className="text-xs text-brand-text-muted font-medium leading-relaxed relative z-10">
            {card.description}
          </p>
          <div className="flex items-end justify-between mt-auto pt-2 relative z-10">
            <div className="text-brand-text-faint text-[10px] font-mono uppercase tracking-widest flex items-center gap-1 group-hover:text-brand-primary transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
              Run Analysis
            </div>
            {/* Hex Data Trace */}
            <div className="text-[8px] font-mono font-black text-brand-text-faint opacity-30 tracking-tighter">
              0x{Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0')}
            </div>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}
