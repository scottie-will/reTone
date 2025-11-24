import { BaseAdapter } from './BaseAdapter';

/**
 * Reddit Adapter - For reddit.com
 * TODO: Implement Reddit-specific selectors
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
    // TODO: Implement Reddit post selectors
    // Potential selectors to try:
    // - [data-testid="post-container"]
    // - .Post
    // - div[role="article"]
    throw new Error('Reddit adapter not yet implemented');
  }

  getTextElement(post: HTMLElement): HTMLElement | null {
    // TODO: Implement Reddit text element selector
    // Potential selectors:
    // - [data-click-id="text"]
    // - .RichTextJSON-root
    throw new Error('Reddit adapter not yet implemented');
  }

  getButtonContainer(post: HTMLElement): HTMLElement | null {
    // TODO: Implement Reddit button container
    // Should inject near action buttons (share, save, etc.)
    throw new Error('Reddit adapter not yet implemented');
  }

  isValidPost(element: HTMLElement): boolean {
    // TODO: Implement Reddit post validation
    throw new Error('Reddit adapter not yet implemented');
  }
}

