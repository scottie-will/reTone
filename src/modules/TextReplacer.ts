import type { BaseAdapter } from '@/adapters/BaseAdapter';

/**
 * Text Replacer - Handles text extraction and replacement
 */
export class TextReplacer {
  private adapter: BaseAdapter;

  constructor(adapter: BaseAdapter) {
    this.adapter = adapter;
  }

  /**
   * Extract text content from a post
   */
  extractText(post: HTMLElement): string {
    const textElement = this.adapter.getTextElement(post);
    if (!textElement) {
      throw new Error('No text element found in post');
    }
    
    return textElement.textContent?.trim() || '';
  }

  /**
   * Replace text in a post
   */
  replaceText(post: HTMLElement, newText: string): void {
    const textElement = this.adapter.getTextElement(post);
    if (!textElement) {
      throw new Error('No text element found in post');
    }
    
    const dataset = textElement.dataset as { originalText?: string };
    
    // Store original if not already stored
    if (!dataset.originalText) {
      dataset.originalText = textElement.textContent || '';
    }
    
    // Replace text
    textElement.textContent = newText;
    
    // Mark as rewritten
    (post.dataset as { rewritten?: string }).rewritten = 'true';
  }

  /**
   * Restore original text in a post
   */
  restoreOriginal(post: HTMLElement): void {
    const textElement = this.adapter.getTextElement(post);
    if (!textElement) return;
    
    const dataset = textElement.dataset as { originalText?: string };
    if (!dataset.originalText) return;
    
    textElement.textContent = dataset.originalText;
    delete (post.dataset as { rewritten?: string }).rewritten;
  }

  /**
   * Check if post has been rewritten
   */
  isRewritten(post: HTMLElement): boolean {
    return (post.dataset as { rewritten?: string }).rewritten === 'true';
  }

  /**
   * Get original text if available
   */
  getOriginalText(post: HTMLElement): string | null {
    const textElement = this.adapter.getTextElement(post);
    if (!textElement) return null;
    
    return (textElement.dataset as { originalText?: string }).originalText || null;
  }
}

