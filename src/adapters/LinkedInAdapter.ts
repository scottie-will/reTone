import { BaseAdapter } from './BaseAdapter';

/**
 * LinkedIn Adapter - For linkedin.com
 * TODO: Implement LinkedIn-specific selectors
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
    // TODO: Implement LinkedIn post selectors
    // Potential selectors to try:
    // - .feed-shared-update-v2
    // - [data-id^="urn:li:activity"]
    throw new Error('LinkedIn adapter not yet implemented');
  }

  getTextElement(post: HTMLElement): HTMLElement | null {
    // TODO: Implement LinkedIn text element selector
    // Potential selectors:
    // - .feed-shared-text
    // - .break-words
    throw new Error('LinkedIn adapter not yet implemented');
  }

  getButtonContainer(post: HTMLElement): HTMLElement | null {
    // TODO: Implement LinkedIn button container
    // Should inject near social actions (like, comment, share)
    throw new Error('LinkedIn adapter not yet implemented');
  }

  isValidPost(element: HTMLElement): boolean {
    // TODO: Implement LinkedIn post validation
    throw new Error('LinkedIn adapter not yet implemented');
  }
}

