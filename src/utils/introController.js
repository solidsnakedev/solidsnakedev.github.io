/**
 * Controller for terminal intro animations with skip functionality
 * @module introController
 */

/**
 * Manages intro animation lifecycle, skip handlers, and session state
 */
export class IntroController {
  /**
   * @param {Object} config - Configuration options
   * @param {string} config.introId - ID of the intro container element
   * @param {string} [config.storageKey='terminalIntroShown'] - SessionStorage key
   * @param {number} [config.fadeOutDuration=500] - Fade out duration in ms
   * @param {boolean} [config.skipOnKey=true] - Enable skip on keypress
   * @param {boolean} [config.skipOnClick=true] - Enable skip on click
   * @param {boolean} [config.showOnRefresh=true] - Show intro on page refresh
   * @param {Function} [config.onSkip] - Callback when intro is skipped
   * @param {Function} [config.onComplete] - Callback when intro completes naturally
   */
  constructor(config) {
    this.config = {
      storageKey: 'terminalIntroShown',
      fadeOutDuration: 500,
      skipOnKey: true,
      skipOnClick: true,
      showOnRefresh: true,
      onSkip: null,
      onComplete: null,
      ...config
    };
    
    if (!this.config.introId) {
      throw new Error('IntroController: introId is required');
    }
    
    this.introElement = null;
    this.isSkipped = false;
    this.isComplete = false;
    this.skipHandlers = [];
  }
  
  /**
   * Initialize the controller and determine if intro should show
   * @returns {boolean} True if intro should be shown
   */
  init() {
    this.introElement = document.getElementById(this.config.introId);
    
    if (!this.introElement) {
      console.warn(`IntroController: Element with id "${this.config.introId}" not found`);
      return false;
    }
    
    // Check if this was a page reload vs navigation
    const isReload = this._isPageReload();
    
    // Check if intro was already shown in this session
    const introShown = sessionStorage.getItem(this.config.storageKey);
    
    // Show intro logic:
    // - If showOnRefresh=true: show on reload, hide on navigation
    // - If showOnRefresh=false: only show once per session
    const shouldShow = this.config.showOnRefresh ? isReload : !introShown;
    
    if (!shouldShow) {
      this._removeIntro();
      return false;
    }
    
    // Attach skip handlers if enabled
    if (this.config.skipOnKey) {
      this._attachKeyHandler();
    }
    
    if (this.config.skipOnClick) {
      this._attachClickHandler();
    }
    
    return true;
  }
  
  /**
   * Skip the intro animation
   */
  skip() {
    if (this.isSkipped || this.isComplete) return;
    
    this.isSkipped = true;
    
    // Fire skip callback
    if (this.config.onSkip) {
      this.config.onSkip();
    }
    
    this._hideIntro();
  }
  
  /**
   * Mark intro as complete (for natural completion)
   */
  complete() {
    if (this.isSkipped || this.isComplete) return;
    
    this.isComplete = true;
    
    // Mark as shown in session
    sessionStorage.setItem(this.config.storageKey, 'true');
    
    // Fire complete callback
    if (this.config.onComplete) {
      this.config.onComplete();
    }
    
    this._hideIntro();
  }
  
  /**
   * Clean up event listeners
   */
  destroy() {
    this._removeHandlers();
    this.introElement = null;
  }
  
  /**
   * Check if current navigation is a page reload
   * @private
   * @returns {boolean}
   */
  _isPageReload() {
    const perfEntries = performance.getEntriesByType('navigation');
    return perfEntries.length > 0 && perfEntries[0].type === 'reload';
  }
  
  /**
   * Hide intro with fade out animation
   * @private
   */
  _hideIntro() {
    if (!this.introElement) return;
    
    this.introElement.classList.add('hidden');
    
    setTimeout(() => {
      this._removeIntro();
    }, this.config.fadeOutDuration);
    
    this._removeHandlers();
  }
  
  /**
   * Remove intro element from DOM
   * @private
   */
  _removeIntro() {
    if (this.introElement && this.introElement.parentNode) {
      this.introElement.remove();
    }
  }
  
  /**
   * Attach keyboard skip handler
   * @private
   */
  _attachKeyHandler() {
    const handler = (e) => {
      this.skip();
    };
    
    document.addEventListener('keydown', handler);
    this.skipHandlers.push({ type: 'keydown', handler });
  }
  
  /**
   * Attach click skip handler
   * @private
   */
  _attachClickHandler() {
    const handler = (e) => {
      this.skip();
    };
    
    document.addEventListener('click', handler);
    this.skipHandlers.push({ type: 'click', handler });
  }
  
  /**
   * Remove all skip handlers
   * @private
   */
  _removeHandlers() {
    this.skipHandlers.forEach(({ type, handler }) => {
      document.removeEventListener(type, handler);
    });
    this.skipHandlers = [];
  }
}
