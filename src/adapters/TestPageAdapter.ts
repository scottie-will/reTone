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
    // Check if we already have a button container
    let container = post.querySelector<HTMLElement>('.rewrite-button-container');
    if (!container) {
      // Make post relatively positioned for absolute button placement
      if (getComputedStyle(post).position === 'static') {
        post.style.position = 'relative';
      }
      
      // Add padding to bottom so text doesn't overlap with button
      post.style.paddingBottom = '56px';
      
      // Create container positioned in lower left
      container = document.createElement('div');
      container.className = 'rewrite-button-container';
      container.style.cssText = `
        position: absolute;
        bottom: 12px;
        left: 12px;
        z-index: 100;
      `;
      post.appendChild(container);
    }
    
    return container;
  }

  isValidPost(element: HTMLElement): boolean {
    // Valid if it has a .post class and .post-content
    return element.classList.contains('post') && 
           element.querySelector('.post-content') !== null;
  }
}

