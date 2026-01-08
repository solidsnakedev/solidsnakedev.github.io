/**
 * Generic modal state management controller
 * Handles open/close state, animations, and event coordination
 */

export class ModalController {
  /**
   * @param {Object} config - Modal configuration
   * @param {string} config.modalId - ID of the modal element
   * @param {string[]} config.triggerIds - IDs of elements that open the modal
   * @param {string[]} config.closeIds - IDs of elements that close the modal
   * @param {number} config.transitionDuration - Animation duration in ms
   * @param {Function} config.onOpen - Callback when modal opens
   * @param {Function} config.onClose - Callback when modal closes
   * @param {boolean} config.closeOnNavigation - Auto-close when clicking nav links
   * @param {boolean} config.closeOnEscape - Close on Escape key
   * @param {boolean} config.closeOnResize - Close on window resize to desktop
   * @param {number} config.resizeBreakpoint - Breakpoint for resize close (px)
   */
  constructor(config) {
    this.config = {
      transitionDuration: 200,
      closeOnNavigation: true,
      closeOnEscape: true,
      closeOnResize: true,
      resizeBreakpoint: 768,
      onOpen: () => {},
      onClose: () => {},
      ...config
    };
    
    this.isOpen = false;
    this.modal = null;
    this.triggers = [];
    this.closeButtons = [];
    
    this._init();
  }

  /**
   * Initialize modal elements and event listeners
   * @private
   */
  _init() {
    // Get modal element
    this.modal = document.getElementById(this.config.modalId);
    if (!this.modal) {
      console.warn(`Modal element #${this.config.modalId} not found`);
      return;
    }

    // Get trigger elements
    this.triggers = this.config.triggerIds
      ?.map(id => document.getElementById(id))
      .filter(Boolean) || [];

    // Get close button elements
    this.closeButtons = this.config.closeIds
      ?.map(id => document.getElementById(id))
      .filter(Boolean) || [];

    // Attach event listeners
    this._attachListeners();
  }

  /**
   * Attach all event listeners
   * @private
   */
  _attachListeners() {
    // Trigger buttons
    this.triggers.forEach(trigger => {
      trigger.addEventListener('click', () => this.toggle());
    });

    // Close buttons
    this.closeButtons.forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    // Navigation links auto-close
    if (this.config.closeOnNavigation) {
      const navLinks = this.modal.querySelectorAll('nav a');
      navLinks.forEach(link => {
        link.addEventListener('click', () => this.close(true));
      });
    }

    // Escape key
    if (this.config.closeOnEscape) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }

    // Resize handler
    if (this.config.closeOnResize) {
      window.addEventListener('resize', () => {
        if (window.innerWidth >= this.config.resizeBreakpoint && this.isOpen) {
          this.close();
        }
      });
    }
  }

  /**
   * Open the modal
   */
  open() {
    if (this.isOpen || !this.modal) return;
    
    this.isOpen = true;
    
    // Show modal
    this.modal.style.display = 'flex';
    
    // Trigger reflow for animation
    setTimeout(() => {
      this.modal.classList.remove('opacity-0', 'invisible');
      this.modal.classList.add('opacity-100');
    }, 10);
    
    this.modal.setAttribute('aria-hidden', 'false');
    
    // Update triggers
    this.triggers.forEach(trigger => {
      trigger.innerHTML = '✕';
      trigger.setAttribute('aria-expanded', 'true');
    });
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Callback
    this.config.onOpen();
  }

  /**
   * Close the modal
   * @param {boolean} instant - Skip animation if true
   */
  close(instant = false) {
    if (!this.isOpen || !this.modal) return;
    
    this.isOpen = false;
    
    if (instant) {
      // Instant close for navigation
      this.modal.style.display = 'none';
      this.modal.classList.add('opacity-0', 'invisible');
      this.modal.classList.remove('opacity-100');
      document.body.style.overflow = '';
    } else {
      // Animated close
      this.modal.classList.remove('opacity-100');
      this.modal.classList.add('opacity-0', 'invisible');
      
      setTimeout(() => {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
      }, this.config.transitionDuration);
    }
    
    this.modal.setAttribute('aria-hidden', 'true');
    
    // Update triggers
    this.triggers.forEach(trigger => {
      trigger.innerHTML = '☰';
      trigger.setAttribute('aria-expanded', 'false');
    });
    
    // Callback
    this.config.onClose();
  }

  /**
   * Toggle modal open/close state
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Destroy controller and remove event listeners
   */
  destroy() {
    this.close(true);
    // Note: Would need to track listeners to properly remove them
    // This is a simplified version
  }
}
