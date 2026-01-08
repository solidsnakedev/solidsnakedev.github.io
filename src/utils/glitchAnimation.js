/**
 * Glitch animation controller for CRT-style text effects
 * Manages timing, scheduling, and pattern application
 */

import { getRandomGlitchPattern, applyGlitchPattern } from './glitchPatterns.js';

export class GlitchAnimator {
  /**
   * @param {string} elementId - ID of element to animate
   * @param {Object} options - Animation configuration
   * @param {number} options.minDelay - Minimum delay between glitches (ms)
   * @param {number} options.maxDelay - Maximum delay between glitches (ms)
   * @param {number} options.minDuration - Minimum glitch duration (ms)
   * @param {number} options.maxDuration - Maximum glitch duration (ms)
   */
  constructor(elementId, options = {}) {
    this.elementId = elementId;
    this.options = {
      minDelay: 2000,
      maxDelay: 8000,
      minDuration: 200,
      maxDuration: 600,
      ...options
    };
    this.isRunning = false;
    this.timeoutId = null;
  }

  /**
   * Start the glitch animation cycle
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this._scheduleNextGlitch();
  }

  /**
   * Stop the glitch animation cycle
   */
  stop() {
    this.isRunning = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Trigger a single glitch immediately
   */
  triggerOnce() {
    const element = document.getElementById(this.elementId);
    if (!element) return;

    const glitchData = getRandomGlitchPattern();
    applyGlitchPattern(element, glitchData);
    
    element.classList.add('glitch');
    
    const duration = this._randomDuration();
    setTimeout(() => {
      element.classList.remove('glitch');
    }, duration);
  }

  /**
   * Schedule the next glitch in the cycle
   * @private
   */
  _scheduleNextGlitch() {
    if (!this.isRunning) return;

    const delay = this._randomDelay();
    
    this.timeoutId = setTimeout(() => {
      this._executeGlitch();
    }, delay);
  }

  /**
   * Execute a glitch and schedule the next one
   * @private
   */
  _executeGlitch() {
    const element = document.getElementById(this.elementId);
    if (!element) {
      this.stop();
      return;
    }

    const glitchData = getRandomGlitchPattern();
    applyGlitchPattern(element, glitchData);
    
    element.classList.add('glitch');
    
    const duration = this._randomDuration();
    
    setTimeout(() => {
      element.classList.remove('glitch');
      this._scheduleNextGlitch();
    }, duration);
  }

  /**
   * Generate random delay between glitches
   * @private
   */
  _randomDelay() {
    const { minDelay, maxDelay } = this.options;
    return minDelay + Math.random() * (maxDelay - minDelay);
  }

  /**
   * Generate random glitch duration
   * @private
   */
  _randomDuration() {
    const { minDuration, maxDuration } = this.options;
    return minDuration + Math.random() * (maxDuration - minDuration);
  }
}

/**
 * Simple helper for single glitch animations
 * @param {string} elementId - ID of element to animate
 */
export function triggerGlitch(elementId) {
  const animator = new GlitchAnimator(elementId);
  animator.triggerOnce();
}
