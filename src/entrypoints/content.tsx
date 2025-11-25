import { defineContentScript } from 'wxt/sandbox';
import { TestPageAdapter, RedditAdapter, LinkedInAdapter, BaseAdapter } from '@/adapters';
import { DOMScanner } from '@/modules/DOMScanner';
import { TextReplacer } from '@/modules/TextReplacer';
import { MessageHandler } from '@/modules/MessageHandler';
import { ButtonContainer } from '@/components/content/ButtonContainer';
import type { ExtensionState } from '@/shared/types/messages';

/**
 * Content Script Orchestrator
 * Manages site adapters and coordinates rewriting modules
 */
class ContentOrchestrator {
  private adapter: BaseAdapter | null = null;
  private scanner: DOMScanner | null = null;
  private buttonContainer: ButtonContainer;
  private textReplacer: TextReplacer | null = null;
  private messageHandler: MessageHandler;
  private extensionState: ExtensionState;

  constructor() {
    this.buttonContainer = new ButtonContainer();
    this.messageHandler = new MessageHandler();
    this.extensionState = {
      enabled: false,
      modelLoaded: false,
      rewriteMode: 'tldr',
      behaviorMode: 'manual'
    };
    
    this.init();
  }

  async init(): Promise<void> {
    console.log('Social Media Rewriter content script loaded');
    
    // Detect and load appropriate adapter
    this.loadAdapter();
    
    if (!this.adapter) {
      console.log('No matching adapter found for this page');
      return;
    }
    
    console.log(`Loaded ${this.adapter.getSiteName()} adapter`);
    
    // Initialize modules
    this.textReplacer = new TextReplacer(this.adapter);
    
    // Get initial state
    this.extensionState = await this.messageHandler.getState();
    console.log('Initial state:', this.extensionState);
    
    // Set up scanner with callback for new posts
    this.scanner = new DOMScanner(this.adapter, (post) => this.handleNewPost(post));
    
    // Listen for state changes
    window.addEventListener('rewriter-state-change', ((e: CustomEvent<ExtensionState>) => {
      this.handleStateChange(e.detail);
    }) as EventListener);
    
    // Start if enabled
    if (this.extensionState.enabled && this.extensionState.modelLoaded) {
      this.start();
    }
  }

  private loadAdapter(): void {
    // Try each adapter in order
    const adapters = [
      new TestPageAdapter(),
      new RedditAdapter(),
      new LinkedInAdapter()
    ];
    
    for (const adapter of adapters) {
      try {
        if (adapter.matches()) {
          this.adapter = adapter;
          return;
        }
      } catch (error) {
        // Adapter not implemented yet, continue
        console.log(`Adapter ${adapter.getSiteName()} not ready:`, (error as Error).message);
      }
    }
  }

  private handleNewPost(post: HTMLElement): void {
    console.log('[ContentOrchestrator] handleNewPost called');
    console.log('[ContentOrchestrator] State:', {
      enabled: this.extensionState.enabled,
      modelLoaded: this.extensionState.modelLoaded,
      behaviorMode: this.extensionState.behaviorMode
    });
    
    // Only add buttons if extension is enabled and in manual mode
    if (!this.extensionState.enabled || 
        !this.extensionState.modelLoaded ||
        this.extensionState.behaviorMode !== 'manual' ||
        !this.adapter ||
        !this.textReplacer) {
      console.log('[ContentOrchestrator] Skipping button injection - requirements not met');
      return;
    }
    
    const postId = this.adapter.getPostId(post);
    console.log('[ContentOrchestrator] Processing post:', postId);
    
    const container = this.adapter.getButtonContainer(post);
    
    if (!container) {
      console.log('[ContentOrchestrator] No button container found');
      return;
    }
    
    console.log('[ContentOrchestrator] Injecting button into post:', postId);

    // Inject React button with current mode
    this.buttonContainer.injectButton(
      post,
      postId,
      container,
      () => this.handleRewriteClick(post),
      undefined,
      false,
      this.extensionState.rewriteMode,
      this.adapter.getSiteName()
    );
  }

  private async handleRewriteClick(post: HTMLElement): Promise<void> {
    if (!this.adapter || !this.textReplacer) return;

    const postId = this.adapter.getPostId(post);
    console.log(`[ContentOrchestrator] Rewrite clicked for post: ${postId}`);

    try {
      // Extract text
      const originalText = this.textReplacer.extractText(post);

      // Send rewrite request
      const rewrittenText = await this.messageHandler.sendRewriteRequest(originalText, postId);

      // Replace text
      this.textReplacer.replaceText(post, rewrittenText);
      console.log(`[ContentOrchestrator] Text replaced for post: ${postId}`);

      // Update button to show toggle
      const container = this.adapter.getButtonContainer(post);
      if (container) {
        console.log(`[ContentOrchestrator] Updating button to toggle mode for: ${postId}`);
        this.buttonContainer.updateButton(
          postId,
          () => this.handleRewriteClick(post),
          () => this.handleToggleClick(post),
          true,
          this.extensionState.rewriteMode,
          this.adapter.getSiteName()
        );
      } else {
        console.warn(`[ContentOrchestrator] No container found for post: ${postId}`);
      }
    } catch (error) {
      console.error('Rewrite failed:', error);
      throw error;
    }
  }

  private handleToggleClick(post: HTMLElement): void {
    if (!this.adapter || !this.textReplacer) return;

    const postId = this.adapter.getPostId(post);
    console.log(`[ContentOrchestrator] Toggle clicked for post: ${postId}`);

    if (this.textReplacer.isRewritten(post)) {
      console.log(`[ContentOrchestrator] Post is rewritten, restoring original for: ${postId}`);
      // Show original
      this.textReplacer.restoreOriginal(post);
      this.buttonContainer.updateButton(
        postId,
        () => this.handleRewriteClick(post),
        undefined,
        false,
        this.extensionState.rewriteMode,
        this.adapter.getSiteName()
      );
    } else {
      console.warn(`[ContentOrchestrator] Post ${postId} is not marked as rewritten`);
    }
  }

  private handleStateChange(state: ExtensionState): void {
    console.log('State changed:', state);
    this.extensionState = state;
    
    if (state.enabled && state.modelLoaded) {
      this.start();
    } else {
      this.stop();
    }
  }

  private start(): void {
    console.log('Starting rewriter in', this.extensionState.behaviorMode, 'mode');
    
    if (!this.scanner) return;
    
    // Scan existing posts
    this.scanner.scanForPosts();
    
    // Watch for new posts
    this.scanner.setupObserver();
  }

  private stop(): void {
    console.log('Stopping rewriter');
    
    // Stop observing
    if (this.scanner) {
      this.scanner.disconnect();
    }
  }
}

// Initialize orchestrator
export default defineContentScript({
  matches: [
    'https://www.reddit.com/*', 
    'https://www.linkedin.com/*',
    'http://localhost/8080/*',
    'http://localhost:59500/*'
  ],
  excludeMatches: ['*://*.reddit.com/chat/*'],
  main() {
    new ContentOrchestrator();
  },
});

