/**
 * Centralized navigation configuration
 * Single source of truth for site navigation
 */

export const NAV_ITEMS = [
  { name: 'HOME', href: '/' },
  { name: 'PROJECTS', href: '/projects' },
  { name: 'BLOG', href: '/blog' },
  { name: 'CONTACT', href: '/contact' },
];

/**
 * Site branding configuration
 */
export const SITE_CONFIG = {
  name: 'SOLIDSNAKEDEV',
  logoIcon: '█',
  terminalPrompt: 'user@terminal:~$ █',
};

/**
 * Animation timing configuration
 * Centralized timing values for consistent animations across the site
 */
export const ANIMATION_TIMINGS = {
  // Intro animation timings
  intro: {
    flickerDuration: 300,
    typewriterDelay: 80,
    glitchPauseBefore: 300,
    glitchDuration: 400,
    glitchPauseAfter: 300,
    fadeOutDuration: 500
  },
  // Modal animation timings
  modal: {
    transitionDuration: 200,
    backdropFade: 150
  },
  // Glitch animation timings
  glitch: {
    minInterval: 3000,
    maxInterval: 8000,
    duration: 500
  }
};

/**
 * Terminal theme configuration
 * CSS custom properties and spacing presets
 */
export const TERMINAL_THEME = {
  // Spacing presets
  spacing: {
    compact: {
      headerPy: '0.375rem',
      headerPx: '0.75rem',
      bodyP: '0.75rem',
      gap: '0.375rem'
    },
    default: {
      headerPy: '0.5rem',
      headerPx: '1rem',
      bodyP: '1rem',
      gap: '0.5rem'
    },
    comfortable: {
      headerPy: '0.75rem',
      headerPx: '1.5rem',
      bodyP: '1.5rem',
      gap: '0.75rem'
    }
  },
  // Corner accent size
  cornerSize: '6px',
  // Border width
  borderWidth: '1px'
};
