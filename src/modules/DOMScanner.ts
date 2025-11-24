import type { BaseAdapter } from '@/adapters/BaseAdapter';

/**
 * DOM Scanner - Finds and processes posts on the page
 */
export class DOMScanner {
  private adapter: BaseAdapter;
  private onNewPost: (post: HTMLElement) => void;
  private processedPosts: Set<string>;
  private observer: MutationObserver | null;

  constructor(adapter: BaseAdapter, onNewPost: (post: HTMLElement) => void) {
    this.adapter = adapter;
    this.onNewPost = onNewPost;
    this.processedPosts = new Set();
    this.observer = null;
  }

  /**
   * Scan page for all posts and process them
   */
  scanForPosts(): void {
    console.log('[DOMScanner] Scanning for posts...');
    const posts = this.adapter.getPostElements();
    console.log(`[DOMScanner] Found ${posts.length} post elements`);
    
    let validCount = 0;
    posts.forEach(post => {
      if (this.adapter.isValidPost(post)) {
        validCount++;
        this.processPost(post);
      }
    });
    
    console.log(`[DOMScanner] Processed ${validCount} valid posts`);
  }

  /**
   * Process a single post
   */
  private processPost(post: HTMLElement): void {
    const postId = this.adapter.getPostId(post);
    
    // Skip if already processed
    if (this.processedPosts.has(postId)) {
      return;
    }
    
    this.processedPosts.add(postId);
    this.onNewPost(post);
  }

  /**
   * Set up MutationObserver to watch for new posts
   */
  setupObserver(): void {
    // Disconnect existing observer if any
    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            
            // Check if the node itself is a post
            if (this.adapter.isValidPost(element)) {
              this.processPost(element);
            }
            
            // Check for posts within the node
            if (element.querySelectorAll) {
              const posts = Array.from(this.adapter.getPostElements()).filter(p => element.contains(p));
              posts.forEach(post => {
                if (this.adapter.isValidPost(post)) {
                  this.processPost(post);
                }
              });
            }
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
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  /**
   * Reset processed posts tracker
   */
  reset(): void {
    this.processedPosts.clear();
  }
}

