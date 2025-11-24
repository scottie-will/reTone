/**
 * Base Adapter - Interface for site-specific DOM handling
 * All site adapters should extend this class
 */
export abstract class BaseAdapter {
  protected siteName: string = 'unknown';

  /**
   * Get all post elements on the page
   */
  abstract getPostElements(): NodeListOf<HTMLElement> | HTMLElement[];

  /**
   * Get the text content element within a post
   */
  abstract getTextElement(post: HTMLElement): HTMLElement | null;

  /**
   * Get the container where the rewrite button should be injected
   */
  abstract getButtonContainer(post: HTMLElement): HTMLElement | null;

  /**
   * Check if an element is a valid post
   */
  abstract isValidPost(element: HTMLElement): boolean;

  /**
   * Check if this adapter should be used for current page
   */
  abstract matches(): boolean;

  /**
   * Generate a unique ID for a post
   */
  getPostId(post: HTMLElement): string {
    const dataset = post.dataset as { rewriterId?: string };
    
    if (!dataset.rewriterId) {
      dataset.rewriterId = `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    return dataset.rewriterId;
  }

  /**
   * Get site name
   */
  getSiteName(): string {
    return this.siteName;
  }
}

