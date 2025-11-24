import { BaseAdapter } from './BaseAdapter';

/**
 * Test Page Adapter - For testing on test-page.html
 */
export class TestPageAdapter extends BaseAdapter {
  constructor() {
    super();
    this.siteName = 'testpage';
  }

  matches(): boolean {
    // Check if we're on the test page (has .post elements)
    return document.querySelector('.post') !== null;
  }

  getPostElements(): NodeListOf<HTMLElement> {
    return document.querySelectorAll('.post');
  }

  getTextElement(post: HTMLElement): HTMLElement | null {
    // The .post-content element contains the text
    return post.querySelector('.post-content');
  }

  getButtonContainer(post: HTMLElement): HTMLElement | null {
    // Insert button after the post-content
    const textElement = this.getTextElement(post);
    if (!textElement) return null;
    
    // Check if we already have a button container
    let container = post.querySelector<HTMLElement>('.rewrite-button-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'rewrite-button-container';
      textElement.parentNode?.insertBefore(container, textElement.nextSibling);
    }
    
    return container;
  }

  isValidPost(element: HTMLElement): boolean {
    // Valid if it has a .post class and .post-content
    return element.classList.contains('post') && 
           element.querySelector('.post-content') !== null;
  }
}

