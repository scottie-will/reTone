// Test Page Adapter - For testing on test-page.html

class TestPageAdapter extends BaseAdapter {
  constructor() {
    super();
    this.siteName = 'testpage';
  }

  matches() {
    // Check if we're on the test page (has .post elements)
    return document.querySelector('.post') !== null;
  }

  getPostElements() {
    return document.querySelectorAll('.post');
  }

  getTextElement(post) {
    // The .post-content element contains the text
    return post.querySelector('.post-content');
  }

  getButtonContainer(post) {
    // Insert button after the post-content
    const textElement = this.getTextElement(post);
    
    // Check if we already have a button container
    let container = post.querySelector('.rewrite-button-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'rewrite-button-container';
      textElement.parentNode.insertBefore(container, textElement.nextSibling);
    }
    
    return container;
  }

  isValidPost(element) {
    // Valid if it has a .post class and .post-content
    return element.classList.contains('post') && 
           element.querySelector('.post-content') !== null;
  }
}

