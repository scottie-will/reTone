import { createRoot, Root } from 'react-dom/client';
import RewriteButton from './RewriteButton';
import '../../styles/global.css';

/**
 * Manager for React button components using Shadow DOM for isolation
 */
export class ButtonContainer {
  private roots: Map<string, { container: HTMLElement; root: Root }> = new Map();

  /**
   * Inject React button into a post
   */
  injectButton(
    postElement: HTMLElement,
    postId: string,
    containerElement: HTMLElement,
    onRewrite: () => Promise<void>,
    onToggle?: () => void,
    showToggle: boolean = false,
    mode?: import('@/shared/types/messages').RewriteMode
  ): void {
    // Check if button already exists
    if (this.roots.has(postId)) {
      return;
    }

    // Create container (no Shadow DOM - simpler and CSS just works)
    const reactHost = document.createElement('div');
    reactHost.className = 'rewriter-button-host';
    reactHost.style.cssText = 'display: inline-block;';

    // Create React root and render button
    const root = createRoot(reactHost);
    root.render(
      <RewriteButton 
        onRewrite={onRewrite} 
        onToggle={onToggle}
        showToggle={showToggle}
        mode={mode}
      />
    );

    // Store root for cleanup
    this.roots.set(postId, { container: reactHost, root });

    // Append to DOM
    containerElement.appendChild(reactHost);
  }

  /**
   * Update button to show toggle state
   */
  updateButton(
    postId: string,
    onRewrite: () => Promise<void>,
    onToggle: () => void,
    showToggle: boolean,
    mode?: import('@/shared/types/messages').RewriteMode
  ): void {
    const entry = this.roots.get(postId);
    if (!entry) return;

    // Re-render with new props
    entry.root.render(
      <RewriteButton 
        onRewrite={onRewrite}
        onToggle={onToggle}
        showToggle={showToggle}
        mode={mode}
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

