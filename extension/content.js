// Content script - Main orchestrator
// Manages site adapters and coordinates rewriting modules
// All modules are loaded via manifest.json in order

console.log('Social Media Rewriter content script loaded');

class ContentOrchestrator {
  constructor() {
    this.adapter = null;
    this.scanner = null;
    this.buttonManager = null;
    this.textReplacer = null;
    this.messageHandler = null;
    this.extensionState = {
      enabled: false,
      modelLoaded: false,
      behaviorMode: 'manual'
    };
    
    this.init();
  }

  async init() {
    // Inject button styles
    this.injectStyles();
    
    // Detect and load appropriate adapter
    this.loadAdapter();
    
    if (!this.adapter) {
      console.log('No matching adapter found for this page');
      return;
    }
    
    console.log(`Loaded ${this.adapter.getSiteName()} adapter`);
    
    // Initialize modules
    this.buttonManager = new ButtonManager(this.adapter);
    this.textReplacer = new TextReplacer(this.adapter);
    this.messageHandler = new MessageHandler();
    
    // Get initial state
    this.extensionState = await this.messageHandler.getState();
    console.log('Initial state:', this.extensionState);
    
    // Set up scanner with callback for new posts
    this.scanner = new DOMScanner(this.adapter, (post) => this.handleNewPost(post));
    
    // Listen for state changes
    window.addEventListener('rewriter-state-change', (e) => {
      this.handleStateChange(e.detail);
    });
    
    // Start if enabled
    if (this.extensionState.enabled && this.extensionState.modelLoaded) {
      this.start();
    }
  }

  loadAdapter() {
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
        console.log(`Adapter ${adapter.getSiteName()} not ready:`, error.message);
      }
    }
  }

  handleNewPost(post) {
    // Only add buttons if extension is enabled and in manual mode
    if (this.extensionState.enabled && 
        this.extensionState.modelLoaded &&
        this.extensionState.behaviorMode === 'manual') {
      
      const button = this.buttonManager.injectButton(post);
      
      // Add click handler
      button.addEventListener('click', () => this.handleRewriteClick(post));
    }
  }

  async handleRewriteClick(post) {
    const postId = this.adapter.getPostId(post);
    
    try {
      // Update button to loading state
      this.buttonManager.updateButtonState(postId, 'loading');
      
      // Extract text
      const originalText = this.textReplacer.extractText(post);
      
      // Send rewrite request
      const rewrittenText = await this.messageHandler.sendRewriteRequest(originalText, postId);
      
      // Replace text
      this.textReplacer.replaceText(post, rewrittenText);
      
      // Update button to success
      this.buttonManager.updateButtonState(postId, 'success');
      
      // Reset button after 2 seconds
      setTimeout(() => {
        this.buttonManager.updateButtonState(postId, 'idle', 'Show Original');
        
        // Update click handler to toggle
        const button = this.buttonManager.getButton(postId);
        button.onclick = () => this.handleToggleClick(post);
      }, 2000);
      
    } catch (error) {
      console.error('Rewrite failed:', error);
      this.buttonManager.updateButtonState(postId, 'error');
      
      // Reset button after 2 seconds
      setTimeout(() => {
        this.buttonManager.updateButtonState(postId, 'idle');
      }, 2000);
    }
  }

  handleToggleClick(post) {
    const postId = this.adapter.getPostId(post);
    
    if (this.textReplacer.isRewritten(post)) {
      // Show original
      this.textReplacer.restoreOriginal(post);
      this.buttonManager.updateButtonState(postId, 'idle', 'Rewrite');
      
      const button = this.buttonManager.getButton(postId);
      button.onclick = () => this.handleRewriteClick(post);
    }
  }

  handleStateChange(state) {
    console.log('State changed:', state);
    this.extensionState = state;
    
    if (state.enabled && state.modelLoaded) {
      this.start();
    } else {
      this.stop();
    }
  }

  start() {
    console.log('Starting rewriter in', this.extensionState.behaviorMode, 'mode');
    
    // Scan existing posts
    this.scanner.scanForPosts();
    
    // Watch for new posts
    this.scanner.setupObserver();
  }

  stop() {
    console.log('Stopping rewriter');
    
    // Stop observing
    if (this.scanner) {
      this.scanner.disconnect();
    }
  }

  injectStyles() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('content/styles/button.css');
    document.head.appendChild(link);
  }
}

// Initialize orchestrator
new ContentOrchestrator();

