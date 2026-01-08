/**
 * Shared utility for generating random CRT-authentic glitch patterns
 * Used by both TerminalHeader and TerminalIntro components
 */

export function getRandomGlitchPattern() {
  // Randomize intensity and speeds
  const intensity = 0.5 + Math.random() * 1.5; // 0.5x to 2x speed
  const speeds = {
    left: (0.15 + Math.random() * 0.15) / intensity,
    right: (0.2 + Math.random() * 0.15) / intensity,
    skew: (0.25 + Math.random() * 0.15) / intensity
  };

  // RGB split color variations
  const colors = [
    ['#ff00ff', '#00ffff'], // magenta/cyan - classic VHS
    ['#ff0088', '#00ff88'], // pink/green - vibrant retro
    // ['#ff4400', '#0088ff'], // orange/blue - warm/cool contrast
  ];
  const colorPair = colors[Math.floor(Math.random() * colors.length)];

  // CRT-authentic glitch patterns
  const patterns = [
    // Pattern 1: Horizontal Sync Issue (multiple horizontal bands)
    () => {
      const band1 = 15 + Math.random() * 15; // 15-30%
      const band2 = 35 + Math.random() * 15; // 35-50%
      const band3 = 55 + Math.random() * 15; // 55-70%
      return {
        before: `polygon(0 0, 100% 0, 100% ${band1}%, 0 ${band1}%, 0 ${band2}%, 100% ${band2}%, 100% ${band3}%, 0 ${band3}%)`,
        after: `polygon(0 ${band1 + 5}%, 100% ${band1 + 5}%, 100% ${band2 + 5}%, 0 ${band2 + 5}%, 0 ${band3 + 5}%, 100% ${band3 + 5}%, 100% 100%, 0 100%)`
      };
    },
    // Pattern 2: Color Convergence Error (RGB guns misaligned by section)
    () => {
      const split1 = 30 + Math.random() * 10; // 30-40%
      const split2 = 60 + Math.random() * 10; // 60-70%
      return {
        before: `polygon(0 0, 100% 0, 100% ${split1}%, 0 ${split1}%)`,
        after: `polygon(0 ${split2}%, 100% ${split2}%, 100% 100%, 0 100%)`
      };
    },
    // Pattern 3: Vertical Hold Slip (top/bottom tear opposite directions)
    () => {
      const tear = 40 + Math.random() * 20; // 40-60%
      return {
        before: `polygon(0 0, 100% 0, 100% ${tear}%, 0 ${tear}%)`,
        after: `polygon(0 ${tear}%, 100% ${tear}%, 100% 100%, 0 100%)`
      };
    },
    // Pattern 4: RF Interference Bands (3-4 thin horizontal bands)
    () => {
      const band1Start = 10 + Math.random() * 15; // 10-25%
      const band1Height = 5 + Math.random() * 5; // 5-10% thick
      const band2Start = 35 + Math.random() * 15; // 35-50%
      const band2Height = 5 + Math.random() * 5;
      const band3Start = 60 + Math.random() * 20; // 60-80%
      const band3Height = 5 + Math.random() * 5;
      
      return {
        before: `polygon(
          0 ${band1Start}%, 100% ${band1Start}%, 
          100% ${band1Start + band1Height}%, 0 ${band1Start + band1Height}%,
          0 ${band2Start}%, 100% ${band2Start}%,
          100% ${band2Start + band2Height}%, 0 ${band2Start + band2Height}%
        )`,
        after: `polygon(
          0 ${band3Start}%, 100% ${band3Start}%,
          100% ${band3Start + band3Height}%, 0 ${band3Start + band3Height}%
        )`
      };
    },
    // Pattern 5: Interlaced Field Error (alternating scan lines)
    () => {
      const field1 = 20 + Math.random() * 20; // 20-40%
      const field2 = 50 + Math.random() * 20; // 50-70%
      return {
        before: `polygon(0 0, 100% 0, 100% ${field1}%, 0 ${field1}%)`,
        after: `polygon(0 ${field2}%, 100% ${field2}%, 100% 100%, 0 100%)`
      };
    }
  ];

  // Select random pattern
  const pattern = patterns[Math.floor(Math.random() * patterns.length)]();

  return {
    speeds,
    colorPair,
    pattern
  };
}

/**
 * Apply glitch pattern to an element
 * @param {HTMLElement} element - Element to apply glitch to
 * @param {Object} glitchData - Data from getRandomGlitchPattern()
 */
export function applyGlitchPattern(element, glitchData) {
  const { speeds, colorPair, pattern } = glitchData;
  
  element.style.setProperty('--glitch-left-speed', `${speeds.left}s`);
  element.style.setProperty('--glitch-right-speed', `${speeds.right}s`);
  element.style.setProperty('--glitch-skew-speed', `${speeds.skew}s`);
  element.style.setProperty('--glitch-clip-before', pattern.before);
  element.style.setProperty('--glitch-clip-after', pattern.after);
  element.style.setProperty('--glitch-color-1', colorPair[0]);
  element.style.setProperty('--glitch-color-2', colorPair[1]);
}
