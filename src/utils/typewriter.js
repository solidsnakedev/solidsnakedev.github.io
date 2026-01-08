/**
 * Typewriter effect utility for terminal-style text animations
 * @module typewriter
 */

/**
 * Default typewriter configuration
 */
const DEFAULT_CONFIG = {
  delay: 80,
  startDelay: 0,
  cursorBlink: true,
  onCharacter: null,
  onComplete: null
};

/**
 * Creates a typewriter effect on an HTML element
 * @param {string} text - The text to type out
 * @param {HTMLElement} element - The target element
 * @param {Object} options - Configuration options
 * @param {number} [options.delay=80] - Delay between characters in ms
 * @param {number} [options.startDelay=0] - Delay before starting in ms
 * @param {Function} [options.onCharacter] - Callback fired after each character
 * @param {Function} [options.onComplete] - Callback fired when typing completes
 * @returns {Promise<void>} Resolves when typing animation completes
 */
export async function typeWriter(text, element, options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };
  
  if (!element) {
    throw new Error('typeWriter: element is required');
  }
  
  if (!text) {
    return Promise.resolve();
  }
  
  // Wait for start delay
  if (config.startDelay > 0) {
    await new Promise(resolve => setTimeout(resolve, config.startDelay));
  }
  
  return new Promise((resolve) => {
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < text.length) {
        element.textContent += text[index];
        
        // Update data-text attribute for glitch effects
        element.setAttribute('data-text', element.textContent);
        
        // Fire character callback
        if (config.onCharacter) {
          config.onCharacter(text[index], index, element);
        }
        
        index++;
      } else {
        clearInterval(interval);
        
        // Fire completion callback
        if (config.onComplete) {
          config.onComplete(element);
        }
        
        resolve();
      }
    }, config.delay);
  });
}

/**
 * Creates a typewriter effect that can be cancelled
 * @param {string} text - The text to type out
 * @param {HTMLElement} element - The target element
 * @param {Object} options - Configuration options (same as typeWriter)
 * @returns {Object} Object with cancel method and promise
 */
export function typeWriterCancellable(text, element, options = {}) {
  const config = { ...DEFAULT_CONFIG, ...options };
  let cancelled = false;
  let intervalId = null;
  
  const promise = new Promise((resolve, reject) => {
    if (!element) {
      reject(new Error('typeWriterCancellable: element is required'));
      return;
    }
    
    if (!text) {
      resolve();
      return;
    }
    
    const startTyping = () => {
      let index = 0;
      
      intervalId = setInterval(() => {
        if (cancelled) {
          clearInterval(intervalId);
          reject(new Error('Typewriter cancelled'));
          return;
        }
        
        if (index < text.length) {
          element.textContent += text[index];
          element.setAttribute('data-text', element.textContent);
          
          if (config.onCharacter) {
            config.onCharacter(text[index], index, element);
          }
          
          index++;
        } else {
          clearInterval(intervalId);
          
          if (config.onComplete) {
            config.onComplete(element);
          }
          
          resolve();
        }
      }, config.delay);
    };
    
    // Wait for start delay
    if (config.startDelay > 0) {
      setTimeout(() => {
        if (!cancelled) startTyping();
      }, config.startDelay);
    } else {
      startTyping();
    }
  });
  
  return {
    promise,
    cancel: () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    }
  };
}

/**
 * Instantly displays text (for reduced motion preferences)
 * @param {string} text - The text to display
 * @param {HTMLElement} element - The target element
 */
export function instantText(text, element) {
  if (!element) {
    throw new Error('instantText: element is required');
  }
  
  element.textContent = text;
  element.setAttribute('data-text', text);
}
