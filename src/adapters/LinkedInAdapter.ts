import { BaseAdapter } from './BaseAdapter';
import { logger } from '../shared/utils/logger';

/**
 * LinkedIn Adapter - For linkedin.com
 * Posts contain text in <span dir="ltr"> elements within .break-words or .tvm-parent-container
 * (Comments also use span[dir="ltr"], so we need to be specific)
 */
export class LinkedInAdapter extends BaseAdapter {
  constructor() {
    super();
    this.siteName = 'linkedin';
  }

  matches(): boolean {
    return window.location.hostname.includes('linkedin.com');
  }

  getPostElements(): NodeListOf<HTMLElement> | HTMLElement[] {
    // LinkedIn posts are in feed-shared-update-v2 containers
    const posts = document.querySelectorAll('.feed-shared-update-v2');
    return Array.from(posts) as HTMLElement[];
  }

  getTextElement(post: HTMLElement): HTMLElement | null {
    // Text content is in span[dir="ltr"] within break-words or tvm-parent-container
    // This excludes comment text
    const textElement = post.querySelector('.break-words span[dir="ltr"], .tvm-parent-container span[dir="ltr"]');
    return textElement as HTMLElement | null;
  }

  getButtonContainer(post: HTMLElement): HTMLElement | null {
    // Find the text content container (break-words or tvm-parent-container)
    const textContentContainer = post.querySelector('.break-words, .tvm-parent-container');
    if (!textContentContainer || !textContentContainer.parentNode) return null;

    // Check if container already exists
    let container = post.querySelector<HTMLElement>('.rewrite-button-container');
    if (container) return container;

    // Create container and insert before the text content container
    container = document.createElement('div');
    container.className = 'rewrite-button-container';
    container.style.cssText = `
      display: block;
      padding: 8px 0 8px 0;
      margin-bottom: 8px;
    `;

    textContentContainer.parentNode.insertBefore(container, textContentContainer);
    return container;
  }

  getPostId(post: HTMLElement): string {
    // Check if we've already assigned a stable ID
    if (post.dataset.rewriterId) {
      return post.dataset.rewriterId;
    }

    // Try to get LinkedIn's data-id attribute
    const dataId = post.getAttribute('data-id');
    const stableId = dataId || `linkedin-${Date.now()}-${Math.random()}`;
    
    // Store it on the element for future calls
    post.dataset.rewriterId = stableId;
    
    return stableId;
  }

  isValidPost(element: HTMLElement): boolean {
    const hasClass = element.classList.contains('feed-shared-update-v2');
    
    // Only check posts with the correct class
    if (!hasClass) return false;
    
    // Look for span[dir="ltr"] inside break-words or tvm-parent-container
    // This excludes comments which also use span[dir="ltr"]
    const hasPostText = element.querySelector('.break-words span[dir="ltr"], .tvm-parent-container span[dir="ltr"]') !== null;
    
    // Log when valid post is found
    if (hasPostText && !this.hasLoggedValid) {
      logger.log('[LinkedInAdapter] Valid LinkedIn post detected');
      (this as any).hasLoggedValid = true;
    }
    
    return hasPostText;
  }
  
  private hasLoggedValid = false;
}

