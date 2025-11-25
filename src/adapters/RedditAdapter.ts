import { BaseAdapter } from './BaseAdapter';
import { logger } from '../shared/utils/logger';

/**
 * Reddit Adapter - For reddit.com (New Reddit with shreddit components)
 */
export class RedditAdapter extends BaseAdapter {
  constructor() {
    super();
    this.siteName = 'reddit';
  }

  matches(): boolean {
    return window.location.hostname.includes('reddit.com');
  }

  getPostElements(): NodeListOf<HTMLElement> | HTMLElement[] {
    // New Reddit uses shreddit-post custom elements
    const posts = document.querySelectorAll('shreddit-post');
    logger.log(`[RedditAdapter] Found ${posts.length} shreddit-post elements`);

    // Log the first post structure for debugging
    if (posts.length > 0) {
      const firstPost = posts[0];
      logger.log('[RedditAdapter] First post:', firstPost);
      logger.log('[RedditAdapter] Has text body:', !!firstPost.querySelector('shreddit-post-text-body'));
      logger.log('[RedditAdapter] Text element:', firstPost.querySelector('[id$="-post-rtjson-content"]'));
    }

    return Array.from(posts) as HTMLElement[];
  }

  getTextElement(post: HTMLElement): HTMLElement | null {
    // Target the text body component
    const textBody = post.querySelector('shreddit-post-text-body');
    if (!textBody) return null;
    
    // Get the actual content div with the rtjson-content id
    // Example: id="t3_1npc5qq-post-rtjson-content"
    const contentDiv = textBody.querySelector('[id$="-post-rtjson-content"]');
    return contentDiv as HTMLElement | null;
  }

  getButtonContainer(post: HTMLElement): HTMLElement | null {
    // Check if we already have a button container
    let container = post.querySelector<HTMLElement>('.rewrite-button-container');
    if (container) return container;
    
    // Find the shreddit-post-text-body element
    const textBody = post.querySelector('shreddit-post-text-body');
    if (!textBody || !textBody.parentNode) return null;
    
    // Create container to position just above the text body
    container = document.createElement('div');
    container.className = 'rewrite-button-container';
    container.style.cssText = `
      display: block;
      padding: 8px 12px 8px 0;
      margin-bottom: 4px;
    `;
    
    // Insert container immediately before the text body element
    textBody.parentNode.insertBefore(container, textBody);
    
    return container;
  }

  getPostId(post: HTMLElement): string {
    // Check if we've already assigned a stable ID
    if (post.dataset.rewriterId) {
      return post.dataset.rewriterId;
    }

    // Try to get the post-id attribute
    const stableId = post.getAttribute('post-id') || 
           post.getAttribute('id') || 
           `reddit-${Date.now()}-${Math.random()}`;
    
    // Store it on the element for future calls
    post.dataset.rewriterId = stableId;
    
    return stableId;
  }

  isValidPost(element: HTMLElement): boolean {
    // Valid if it's a shreddit-post with text content
    return element.tagName.toLowerCase() === 'shreddit-post' &&
           element.querySelector('shreddit-post-text-body') !== null;
  }
}

