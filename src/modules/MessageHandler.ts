import type { ExtensionState, MessageFromBackground } from '@/shared/types/messages';

interface PendingRequest {
  postId: string;
  resolve: (text: string) => void;
  reject: (error: Error) => void;
}

/**
 * Message Handler - Manages communication with background script
 */
export class MessageHandler {
  private pendingRequests: Map<string, PendingRequest>;

  constructor() {
    this.pendingRequests = new Map();
    this.setupListeners();
  }

  /**
   * Set up message listeners
   */
  private setupListeners(): void {
    chrome.runtime.onMessage.addListener((message: MessageFromBackground) => {
      if (message.type === 'STATE_CHANGED') {
        this.handleStateChange(message.state);
      } else if (message.type === 'REWRITE_COMPLETE') {
        this.handleRewriteComplete(message.requestId, message.rewrittenText);
      }
    });
  }

  /**
   * Send rewrite request to background
   */
  async sendRewriteRequest(text: string, postId: string, platform?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const requestId = `${postId}-${Date.now()}`;
      
      // Store the request
      this.pendingRequests.set(requestId, { postId, resolve, reject });
      
      // Get current state to know the mode
      chrome.runtime.sendMessage({ type: 'GET_STATE' }, (state: ExtensionState) => {
        if (!state || !state.modelLoaded) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Model not loaded'));
          return;
        }
        
        // Send rewrite request
        chrome.runtime.sendMessage({
          type: 'REWRITE_TEXT',
          text: text,
          mode: state.rewriteMode,
          requestId: requestId,
          platform: platform
        }, (response: { success: boolean; error?: string }) => {
          if (!response || !response.success) {
            this.pendingRequests.delete(requestId);
            reject(new Error(response?.error || 'Failed to send request'));
          }
        });
      });
      
      // Set timeout for request
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Request timeout'));
        }
      }, 120000); // 2 minute timeout (local AI can be slow)
    });
  }

  /**
   * Handle rewrite completion
   */
  private handleRewriteComplete(requestId: string, rewrittenText: string): void {
    const request = this.pendingRequests.get(requestId);
    if (!request) return;
    
    this.pendingRequests.delete(requestId);
    request.resolve(rewrittenText);
  }

  /**
   * Handle state changes from background
   */
  private handleStateChange(state: ExtensionState): void {
    // Dispatch custom event for other modules to listen to
    window.dispatchEvent(new CustomEvent('rewriter-state-change', { 
      detail: state 
    }));
  }

  /**
   * Get current extension state
   */
  async getState(): Promise<ExtensionState> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: 'GET_STATE' }, (state: ExtensionState) => {
        resolve(state || {
          enabled: false,
          rewriteMode: 'tldr',
          behaviorMode: 'manual',
          modelLoaded: false
        });
      });
    });
  }
}

