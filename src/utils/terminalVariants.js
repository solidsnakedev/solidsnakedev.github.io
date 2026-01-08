/**
 * Terminal component variant system
 * Centralized color schemes for consistent theming
 * @module terminalVariants
 */

/**
 * Available terminal color variants
 */
export const TERMINAL_VARIANTS = {
  default: {
    border: 'border-amber-500/50',
    bg: 'bg-black/30',
    header: 'bg-amber-500/10',
    bracket: 'text-amber-500',
    title: 'text-amber-400',
    line: 'border-amber-500/30',
    footer: 'text-amber-500/40'
  },
  subtle: {
    border: 'border-amber-500/30',
    bg: 'bg-black/20',
    header: 'bg-black/30',
    bracket: 'text-amber-500/60',
    title: 'text-amber-500/80',
    line: 'border-amber-500/20',
    footer: 'text-amber-500/30'
  },
  compact: {
    border: 'border-amber-500/30',
    bg: 'bg-black/50',
    header: 'bg-black/50',
    bracket: 'text-amber-500/70',
    title: 'text-amber-400/90',
    line: 'border-amber-500/20',
    footer: 'text-amber-500/40'
  },
  highlight: {
    border: 'border-amber-400/70',
    bg: 'bg-amber-500/5',
    header: 'bg-amber-500/20',
    bracket: 'text-amber-400',
    title: 'text-white',
    line: 'border-amber-400/40',
    footer: 'text-amber-400/60'
  },
  success: {
    border: 'border-green-500/50',
    bg: 'bg-green-500/5',
    header: 'bg-green-500/10',
    bracket: 'text-green-500',
    title: 'text-green-400',
    line: 'border-green-500/30',
    footer: 'text-green-500/40'
  },
  warning: {
    border: 'border-yellow-500/50',
    bg: 'bg-yellow-500/5',
    header: 'bg-yellow-500/10',
    bracket: 'text-yellow-500',
    title: 'text-yellow-400',
    line: 'border-yellow-500/30',
    footer: 'text-yellow-500/40'
  },
  error: {
    border: 'border-red-500/50',
    bg: 'bg-red-500/5',
    header: 'bg-red-500/10',
    bracket: 'text-red-500',
    title: 'text-red-400',
    line: 'border-red-500/30',
    footer: 'text-red-500/40'
  }
};

/**
 * Get variant classes by name
 * @param {string} variant - Variant name
 * @returns {Object} Variant class object
 */
export function getVariant(variant = 'default') {
  return TERMINAL_VARIANTS[variant] || TERMINAL_VARIANTS.default;
}

/**
 * Density spacing classes
 */
export const DENSITY_CLASSES = {
  compact: 'density-compact',
  default: '',
  comfortable: 'density-comfortable'
};

/**
 * Get density class
 * @param {string} density - Density name
 * @returns {string} Density class
 */
export function getDensityClass(density = 'default') {
  return DENSITY_CLASSES[density] || '';
}
