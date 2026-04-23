// Item #17 — KineticButton: heavy mechanical click physics
// Used for: InputBar Analyze button + Sidebar Emergency Override ONLY.
// Do NOT apply to all buttons — intentional contrast is the point.
//
// Phase table:
// Hover:   shadow extends 4px → 6px
// Press:   translates x:4 y:4, shadow vanishes at duration:0
// Release: springs back with stiffness:800, damping:25 (the Clack)
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CLACK } from '../animations/physics';

const KineticButton = ({ children, onClick, disabled, className = '', id, style }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.button
      id={id}
      style={style}
      animate={{
        x: isPressed ? 4 : 0,
        y: isPressed ? 4 : 0,
        boxShadow: isPressed
          ? '0px 0px 0px var(--brand-text)'
          : '4px 4px 0px var(--brand-text)',
      }}
      transition={isPressed ? { duration: 0 } : CLACK}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => !disabled && setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </motion.button>
  );
};

export default KineticButton;
