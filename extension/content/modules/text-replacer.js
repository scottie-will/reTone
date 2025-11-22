// Text Replacer - Handles text extraction and replacement

class TextReplacer {
  constructor(adapter) {
    this.adapter = adapter;
  }

  /**
   * Extract text content from a post
   * @param {HTMLElement} post - The post element
   * @returns {string} Extracted text
   */
  extractText(post) {
    const textElement = this.adapter.getTextElement(post);
    if (!textElement) {
      throw new Error('No text element found in post');
    }
    
    return textElement.textContent.trim();
  }

  /**
   * Replace text in a post
   * @param {HTMLElement} post - The post element
   * @param {string} newText - New text to insert
   */
  replaceText(post, newText) {
    const textElement = this.adapter.getTextElement(post);
    if (!textElement) {
      throw new Error('No text element found in post');
    }
    
    // Store original if not already stored
    if (!textElement.dataset.originalText) {
      textElement.dataset.originalText = textElement.textContent;
    }
    
    // Replace text
    textElement.textContent = newText;
    
    // Mark as rewritten
    post.dataset.rewritten = 'true';
  }

  /**
   * Restore original text in a post
   * @param {HTMLElement} post - The post element
   */
  restoreOriginal(post) {
    const textElement = this.adapter.getTextElement(post);
    if (!textElement || !textElement.dataset.originalText) {
      return;
    }
    
    textElement.textContent = textElement.dataset.originalText;
    delete post.dataset.rewritten;
  }

  /**
   * Check if post has been rewritten
   * @param {HTMLElement} post - The post element
   * @returns {boolean}
   */
  isRewritten(post) {
    return post.dataset.rewritten === 'true';
  }

  /**
   * Get original text if available
   * @param {HTMLElement} post - The post element
   * @returns {string|null}
   */
  getOriginalText(post) {
    const textElement = this.adapter.getTextElement(post);
    return textElement?.dataset.originalText || null;
  }
}

