// Message Handler - Manages communication with background script

class MessageHandler {
  constructor() {
    this.pendingRequests = new Map(); // requestId -> { postId, callback }
    this.setupListeners();
  }

  /**
   * Set up message listeners
   */
  setupListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'STATE_CHANGED') {
        this.handleStateChange(message.state);
      } else if (message.type === 'REWRITE_COMPLETE') {
        this.handleRewriteComplete(message);
      }
    });
  }

  /**
   * Send rewrite request to background
   * @param {string} text - Text to rewrite
   * @param {string} postId - Post ID
   * @returns {Promise} Promise that resolves with rewritten text
   */
  async sendRewriteRequest(text, postId) {
    return new Promise((resolve, reject) => {
      const requestId = `${postId}-${Date.now()}`;
      
      // Store the request
      this.pendingRequests.set(requestId, { postId, resolve, reject });
      
      // Get current state to know the mode
      chrome.runtime.sendMessage({ type: 'GET_STATE' }, (state) => {
        if (!state || !state.modelLoaded) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Model not loaded'));
          return;
        }
        
        // Send rewrite request
        chrome.runtime.sendMessage({
          type: 'REWRITE_TEXT',
          text: text,
          mode: state.rewriteMode,
          requestId: requestId
        }, (response) => {
          if (!response || !response.success) {
            this.pendingRequests.delete(requestId);
            reject(new Error(response?.error || 'Failed to send request'));
          }
        });
      });
    });
  }

  /**
   * Handle rewrite completion
   * @param {Object} data - Response data
   */
  handleRewriteComplete(data) {
    const request = this.pendingRequests.get(data.requestId);
    if (!request) return;
    
    this.pendingRequests.delete(data.requestId);
    
    if (data.success) {
      request.resolve(data.rewrittenText);
    } else {
      request.reject(new Error(data.error || 'Rewrite failed'));
    }
  }

  /**
   * Handle state changes from background
   * @param {Object} state - New state
   */
  handleStateChange(state) {
    // Dispatch custom event for other modules to listen to
    window.dispatchEvent(new CustomEvent('rewriter-state-change', { 
      detail: state 
    }));
  }

  /**
   * Get current extension state
   * @returns {Promise<Object>} Current state
   */
  async getState() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_STATE' }, (state) => {
        resolve(state || {});
      });
    });
  }
}

