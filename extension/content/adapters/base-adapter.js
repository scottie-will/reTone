// Base Adapter - Interface for site-specific DOM handling
// All site adapters should extend this class

class BaseAdapter {
  constructor() {
    this.siteName = 'unknown';
  }

  /**
   * Get all post elements on the page
   * @returns {NodeList|Array} All post elements
   */
  getPostElements() {
    throw new Error('getPostElements() must be implemented by subclass');
  }

  /**
   * Get the text content element within a post
   * @param {HTMLElement} post - The post element
   * @returns {HTMLElement} Element containing the text to rewrite
   */
  getTextElement(post) {
    throw new Error('getTextElement() must be implemented by subclass');
  }

  /**
   * Get the container where the rewrite button should be injected
   * @param {HTMLElement} post - The post element
   * @returns {HTMLElement} Container for button injection
   */
  getButtonContainer(post) {
    throw new Error('getButtonContainer() must be implemented by subclass');
  }

  /**
   * Check if an element is a valid post
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} True if valid post
   */
  isValidPost(element) {
    throw new Error('isValidPost() must be implemented by subclass');
  }

  /**
   * Generate a unique ID for a post
   * @param {HTMLElement} post - The post element
   * @returns {string} Unique post ID
   */
  getPostId(post) {
    // Default implementation - can be overridden
    if (!post.dataset.rewriterId) {
      post.dataset.rewriterId = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    return post.dataset.rewriterId;
  }

  /**
   * Get site name
   * @returns {string} Site name
   */
  getSiteName() {
    return this.siteName;
  }

  /**
   * Check if this adapter should be used for current page
   * @returns {boolean} True if this adapter matches current page
   */
  matches() {
    throw new Error('matches() must be implemented by subclass');
  }
}

