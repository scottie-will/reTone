import { createRoot, Root } from 'react-dom/client';
import RewriteButton from './RewriteButton';
import LoadingIndicator from './LoadingIndicator';
import ErrorIndicator from './ErrorIndicator';
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

interface IndicatorState {
  container: HTMLElement;
  root: Root;
}

/**
 * Manager for React button components using Shadow DOM for isolation
 */
export class ButtonContainer {
  private roots: Map<string, ButtonState> = new Map();
  private loadingIndicators: Map<string, IndicatorState> = new Map();
  private errorIndicators: Map<string, IndicatorState> = new Map();

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

  /**
   * Inject loading indicator into a post
   */
  injectLoadingIndicator(postId: string, containerElement: HTMLElement): void {
    // Remove any existing indicator for this post
    this.removeLoadingIndicator(postId);
    this.removeErrorIndicator(postId);

    const reactHost = document.createElement('div');
    reactHost.className = 'rewriter-loading-host';
    reactHost.style.cssText = 'display: inline-block;';

    const root = createRoot(reactHost);
    root.render(<LoadingIndicator />);

    this.loadingIndicators.set(postId, { container: reactHost, root });
    containerElement.appendChild(reactHost);

    console.log(`[ButtonContainer] Injected loading indicator for ${postId}`);
  }

  /**
   * Remove loading indicator
   */
  removeLoadingIndicator(postId: string): void {
    const indicator = this.loadingIndicators.get(postId);
    if (indicator) {
      indicator.root.unmount();
      indicator.container.remove();
      this.loadingIndicators.delete(postId);
      console.log(`[ButtonContainer] Removed loading indicator for ${postId}`);
    }
  }

  /**
   * Inject error indicator into a post
   */
  injectErrorIndicator(postId: string, containerElement: HTMLElement): void {
    // Remove any existing indicator for this post
    this.removeLoadingIndicator(postId);
    this.removeErrorIndicator(postId);

    const reactHost = document.createElement('div');
    reactHost.className = 'rewriter-error-host';
    reactHost.style.cssText = 'display: inline-block;';

    const root = createRoot(reactHost);
    root.render(<ErrorIndicator />);

    this.errorIndicators.set(postId, { container: reactHost, root });
    containerElement.appendChild(reactHost);

    console.log(`[ButtonContainer] Injected error indicator for ${postId}`);
  }

  /**
   * Remove error indicator
   */
  removeErrorIndicator(postId: string): void {
    const indicator = this.errorIndicators.get(postId);
    if (indicator) {
      indicator.root.unmount();
      indicator.container.remove();
      this.errorIndicators.delete(postId);
      console.log(`[ButtonContainer] Removed error indicator for ${postId}`);
    }
  }

  /**
   * Clean up all indicators (loading and error)
   */
  cleanupIndicators(): void {
    this.loadingIndicators.forEach(indicator => {
      indicator.root.unmount();
      indicator.container.remove();
    });
    this.loadingIndicators.clear();

    this.errorIndicators.forEach(indicator => {
      indicator.root.unmount();
      indicator.container.remove();
    });
    this.errorIndicators.clear();
  }
}

