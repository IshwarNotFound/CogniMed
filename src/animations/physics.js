/**
 * CogniMed — Motion Constants (PHYSICS ENGINE DICTIONARY)
 * Single source of truth for all animation physics.
 * Every component imports from here. Never copy-paste spring values inline.
 *
 * THE FOUR LAWS:
 * 1. 300ms Rule — no animation except typewriter/SVG tracing takes longer
 * 2. No Bounciness — rigid staccato, not floaty/springy
 * 3. Hardware Acceleration Only — opacity, transform, clipPath only
 * 4. Intentional Contrast — 80% still, 20% animated
 */

// ─── PRIMARY PHYSICS DICTIONARY ──────────────────────────────────────────────

/** Standard UI transitions — snappy, authoritative (Chat Bubbles, Modals) */
export const SNAP = { type: 'spring', stiffness: 700, damping: 40, mass: 0.8 };

/** Button click — heavy mechanical switch (Emergency Override, Analyze) */
export const CLACK = { type: 'spring', stiffness: 800, damping: 25 };

/** Dropdown/modal reveal — blast door effect */
export const DOOR = { type: 'spring', stiffness: 600, damping: 38 };

/** Toast stack — weighted collision physics */
export const COLLISION = { type: 'spring', stiffness: 500, damping: 50 };

/** Number ticker — fast land, no bounce */
export const COUNTER = { duration: 0.55, ease: [0.22, 1, 0.36, 1] };

/** Named export map for convenience */
export const PHYSICS = { SNAP, CLACK, DOOR, COLLISION, COUNTER };

// ─── LEGACY CONSTANTS (kept for backward compat) ─────────────────────────────

/** Dark theme spring — tight, heavy, mechanical */
export const SPRING_DARK = { type: 'spring', stiffness: 400, damping: 30 };

/** Light theme spring — slightly softer, still precise */
export const SPRING_LIGHT = { type: 'spring', stiffness: 320, damping: 26 };

/** Data reveal — smooth eased sweep for bars and accents */
export const DATA_REVEAL = { duration: 0.6, ease: [0.16, 1, 0.3, 1] };

/** Flash — instant acknowledgment, binary on/off */
export const FLASH = { duration: 0.15, ease: 'linear' };

/** Stamp — clip-path reveal, title powers on */
export const STAMP = { duration: 0.35, ease: [0.16, 1, 0.3, 1] };

/**
 * Returns the correct spring config based on the current theme.
 * @param {'dark'|'light'} theme
 */
export const getSpring = (theme) => (theme === 'dark' ? SPRING_DARK : SPRING_LIGHT);
