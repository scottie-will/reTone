import { createRoot, Root } from 'react-dom/client';
import RewriteButton from './RewriteButton';
import '../../styles/global.css';

interface ButtonState {
  container: HTMLElement;
  root: Root;
  onRewrite: () => Promise<void>;
  onToggle?: () => void;
  showToggle: boolean;
  mode?: import('@/shared/types/messages').RewriteMode;
  platform?: string;
}

/**
 * Manager for React button components using Shadow DOM for isolation
 */
export class ButtonContainer {
  private roots: Map<string, ButtonState> = new Map();

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
    mode?: import('@/shared/types/messages').RewriteMode,
    platform?: string
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
        platform={platform}
      />
    );

    // Store root and state for cleanup and updates
    this.roots.set(postId, {
      container: reactHost,
      root,
      onRewrite,
      onToggle,
      showToggle,
      mode,
      platform
    });

    // Append to DOM
    containerElement.appendChild(reactHost);
  }

  /**
   * Update button to show toggle state
   */
  /**
   * Update button to show toggle state
   */
  updateButton(
    postId: string,
    onRewrite: () => Promise<void>,
    onToggle: () => void,
    showToggle: boolean,
    mode?: import('@/shared/types/messages').RewriteMode,
    platform?: string
  ): void {
    const entry = this.roots.get(postId);
    if (!entry) {
      console.warn(`[ButtonContainer] Cannot update button for ${postId} - not found in roots`);
      return;
    }

    console.log(`[ButtonContainer] Updating button for ${postId}, showToggle: ${showToggle}`);

    // Update stored state
    entry.onRewrite = onRewrite;
    entry.onToggle = onToggle;
    entry.showToggle = showToggle;
    entry.mode = mode;
    entry.platform = platform;

    // Re-render with new props
    entry.root.render(
      <RewriteButton
        onRewrite={onRewrite}
        onToggle={onToggle}
        showToggle={showToggle}
        mode={mode}
        platform={platform}
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
   * Get all button post IDs
   */
  getAllButtonIds(): string[] {
    return Array.from(this.roots.keys());
  }

  /**
   * Update all buttons with a new mode
   */
  updateAllButtonsMode(mode: import('@/shared/types/messages').RewriteMode): void {
    console.log(`[ButtonContainer] Updating all buttons to mode: ${mode}`);
    this.roots.forEach((entry, postId) => {
      entry.mode = mode;
      entry.root.render(
        <RewriteButton
          onRewrite={entry.onRewrite}
          onToggle={entry.onToggle}
          showToggle={entry.showToggle}
          mode={mode}
          platform={entry.platform}
        />
      );
    });
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

