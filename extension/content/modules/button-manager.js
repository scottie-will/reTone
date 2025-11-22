// Button Manager - Handles creation and state of rewrite buttons

class ButtonManager {
  constructor(adapter) {
    this.adapter = adapter;
    this.buttons = new Map(); // postId -> button element
  }

  /**
   * Inject rewrite button into a post
   * @param {HTMLElement} post - The post element
   * @returns {HTMLElement} The created button
   */
  injectButton(post) {
    const postId = this.adapter.getPostId(post);
    
    // Don't inject if button already exists
    if (this.buttons.has(postId)) {
      return this.buttons.get(postId);
    }

    const container = this.adapter.getButtonContainer(post);
    const button = this.createButton(postId);
    
    container.appendChild(button);
    this.buttons.set(postId, button);
    
    return button;
  }

  /**
   * Create the button element
   * @param {string} postId - Post ID
   * @returns {HTMLElement} Button element
   */
  createButton(postId) {
    const button = document.createElement('button');
    button.className = 'rewriter-button';
    button.textContent = 'Rewrite';
    button.dataset.postId = postId;
    
    return button;
  }

  /**
   * Remove button from a post
   * @param {string} postId - Post ID
   */
  removeButton(postId) {
    const button = this.buttons.get(postId);
    if (button) {
      button.remove();
      this.buttons.delete(postId);
    }
  }

  /**
   * Update button state (loading, success, error)
   * @param {string} postId - Post ID
   * @param {string} state - State: 'idle', 'loading', 'success', 'error'
   * @param {string} text - Optional button text
   */
  updateButtonState(postId, state, text = null) {
    const button = this.buttons.get(postId);
    if (!button) return;

    // Remove all state classes
    button.classList.remove('loading', 'success', 'error');
    
    // Add new state
    if (state !== 'idle') {
      button.classList.add(state);
    }

    // Update button text
    const stateText = {
      idle: 'Rewrite',
      loading: 'Rewriting...',
      success: 'Rewritten!',
      error: 'Error'
    };

    button.textContent = text || stateText[state] || 'Rewrite';
    button.disabled = state === 'loading';
  }

  /**
   * Get button for a post
   * @param {string} postId - Post ID
   * @returns {HTMLElement|null} Button element
   */
  getButton(postId) {
    return this.buttons.get(postId) || null;
  }

  /**
   * Check if post has button
   * @param {string} postId - Post ID
   * @returns {boolean}
   */
  hasButton(postId) {
    return this.buttons.has(postId);
  }
}

