import { createRoot, Root } from 'react-dom/client';
import RewriteButton from './RewriteButton';
import '../../styles/global.css';

/**
 * Manager for React button components using Shadow DOM for isolation
 */
export class ButtonContainer {
  private roots: Map<string, { container: HTMLElement; root: Root }> = new Map();

  /**
   * Inject React button into a post using Shadow DOM
   */
  injectButton(
    postElement: HTMLElement,
    postId: string,
    containerElement: HTMLElement,
    onRewrite: () => Promise<void>,
    onToggle?: () => void,
    showToggle: boolean = false
  ): void {
    // Check if button already exists
    if (this.roots.has(postId)) {
      return;
    }

    // Create container for Shadow DOM
    const shadowHost = document.createElement('div');
    shadowHost.className = 'rewriter-button-host';
    shadowHost.style.cssText = 'display: inline-block; margin-top: 8px;';
    
    // Attach Shadow DOM for CSS isolation
    const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    
    // Create root container inside shadow DOM
    const rootContainer = document.createElement('div');
    shadowRoot.appendChild(rootContainer);
    
    // Add Tailwind styles to shadow DOM
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = chrome.runtime.getURL('content-scripts/content.css');
    shadowRoot.appendChild(styleLink);

    // Create React root and render button
    const root = createRoot(rootContainer);
    root.render(
      <RewriteButton 
        onRewrite={onRewrite} 
        onToggle={onToggle}
        showToggle={showToggle}
      />
    );

    // Store root for cleanup
    this.roots.set(postId, { container: shadowHost, root });

    // Append to DOM
    containerElement.appendChild(shadowHost);
  }

  /**
   * Update button to show toggle state
   */
  updateButton(
    postId: string,
    onRewrite: () => Promise<void>,
    onToggle: () => void,
    showToggle: boolean
  ): void {
    const entry = this.roots.get(postId);
    if (!entry) return;

    // Re-render with new props
    entry.root.render(
      <RewriteButton 
        onRewrite={onRewrite}
        onToggle={onToggle}
        showToggle={showToggle}
      />
    );
  }

  /**
   * Remove button
   */
  removeButton(postId: string): void {
    const entry = this.roots.get(postId);
    if (entry) {
      entry.root.unmount();
      entry.container.remove();
      this.roots.delete(postId);
    }
  }

  /**
   * Check if button exists
   */
  hasButton(postId: string): boolean {
    return this.roots.has(postId);
  }

  /**
   * Clean up all buttons
   */
  cleanup(): void {
    this.roots.forEach(entry => {
      entry.root.unmount();
      entry.container.remove();
    });
    this.roots.clear();
  }
}

