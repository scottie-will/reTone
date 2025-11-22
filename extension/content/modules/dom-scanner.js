// DOM Scanner - Finds and processes posts on the page

class DOMScanner {
  constructor(adapter, onNewPost) {
    this.adapter = adapter;
    this.onNewPost = onNewPost; // Callback for when new post is found
    this.processedPosts = new Set();
    this.observer = null;
  }

  /**
   * Scan page for all posts and process them
   */
  scanForPosts() {
    const posts = this.adapter.getPostElements();
    
    posts.forEach(post => {
      if (this.adapter.isValidPost(post)) {
        this.processPost(post);
      }
    });
  }

  /**
   * Process a single post
   * @param {HTMLElement} post - Post element
   */
  processPost(post) {
    const postId = this.adapter.getPostId(post);
    
    // Skip if already processed
    if (this.processedPosts.has(postId)) {
      return;
    }
    
    this.processedPosts.add(postId);
    
    // Call the callback
    if (this.onNewPost) {
      this.onNewPost(post);
    }
  }

  /**
   * Set up MutationObserver to watch for new posts
   */
  setupObserver() {
    // Disconnect existing observer if any
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the node itself is a post
            if (this.adapter.isValidPost(node)) {
              this.processPost(node);
            }
            
            // Check for posts within the node
            const posts = node.querySelectorAll ? 
              Array.from(this.adapter.getPostElements()).filter(p => node.contains(p)) : 
              [];
            
            posts.forEach(post => {
              if (this.adapter.isValidPost(post)) {
                this.processPost(post);
              }
            });
          }
        });
      });
    });

    // Start observing
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Stop observing
   */
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  /**
   * Reset processed posts tracker
   */
  reset() {
    this.processedPosts.clear();
  }
}

