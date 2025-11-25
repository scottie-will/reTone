/**
 * RewriteQueue - Sequential post processing queue for auto mode
 * Ensures posts are rewritten one at a time to avoid overwhelming the AI model
 */

interface QueueItem {
  postId: string;
  post: HTMLElement;
}

export class RewriteQueue {
  private queue: QueueItem[] = [];
  private processing: boolean = false;
  private onProcess: (post: HTMLElement) => Promise<void>;

  constructor(onProcess: (post: HTMLElement) => Promise<void>) {
    this.onProcess = onProcess;
  }

  /**
   * Add a post to the queue
   */
  enqueue(postId: string, post: HTMLElement): void {
    // Check if post is already in queue
    const alreadyQueued = this.queue.some(item => item.postId === postId);
    if (alreadyQueued) {
      console.log(`[RewriteQueue] Post ${postId} already in queue, skipping`);
      return;
    }

    console.log(`[RewriteQueue] Enqueueing post ${postId}`);
    this.queue.push({ postId, post });

    // Start processing if not already processing
    if (!this.processing) {
      this.processNext();
    }
  }

  /**
   * Process the next post in the queue
   */
  private async processNext(): Promise<void> {
    // If already processing or queue is empty, do nothing
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    const item = this.queue.shift();

    if (!item) {
      this.processing = false;
      return;
    }

    console.log(`[RewriteQueue] Processing post ${item.postId} (${this.queue.length} remaining)`);

    try {
      await this.onProcess(item.post);
    } catch (error) {
      console.error(`[RewriteQueue] Error processing post ${item.postId}:`, error);
    }

    this.processing = false;

    // Process next item if queue is not empty
    if (this.queue.length > 0) {
      this.processNext();
    } else {
      console.log('[RewriteQueue] Queue empty, processing complete');
    }
  }

  /**
   * Check if currently processing
   */
  isProcessing(): boolean {
    return this.processing;
  }

  /**
   * Get number of items in queue
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Clear all items from the queue
   */
  clear(): void {
    console.log(`[RewriteQueue] Clearing queue (${this.queue.length} items removed)`);
    this.queue = [];
    this.processing = false;
  }
}
