import { motion } from 'framer-motion';
import { getSpring, CLACK } from '../animations/physics';

export default function TypingIndicator({ theme }) {
  const spring = getSpring(theme);

  return (
    <motion.div
      className="flex justify-start mr-12 mb-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={spring}
    >
      <div className="bg-brand-surface border-4 border-brand-border p-6 neo-brutal-shadow-sm max-w-[200px] relative overflow-hidden flex items-center justify-center gap-2">
        {/* Accent strip — themed */}
        <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary" />
        {/* Brain icon — mechanical power-on clack, fires once */}
        <motion.span
          className="text-brand-text-muted material-symbols-outlined text-3xl"
          initial={{ scale: 0.8 }}
          animate={{ scale: [0.8, 1.1, 1] }}
          transition={CLACK}
        >
          psychology
        </motion.span>
        <span className="font-headline font-black uppercase text-sm tracking-widest text-brand-text">Inferring</span>
      </div>
    </motion.div>
  );
}
