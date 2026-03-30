/**
 * CogniMed — Motion Constants
 * Single source of truth for all animation physics.
 * Every component imports from here. Never copy-paste spring values inline.
 */

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

/** Clack — mechanical click, brief and contained */
export const CLACK = { duration: 0.15, ease: 'linear' };

/**
 * Returns the correct spring config based on the current theme.
 * @param {'dark'|'light'} theme
 */
export const getSpring = (theme) => (theme === 'dark' ? SPRING_DARK : SPRING_LIGHT);
