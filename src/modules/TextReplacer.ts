import type { BaseAdapter } from '@/adapters/BaseAdapter';

/**
 * Text Replacer - Handles text extraction and replacement
 * Works directly with HTML - no markdown conversion
 */
export class TextReplacer {
  private adapter: BaseAdapter;

  constructor(adapter: BaseAdapter) {
    this.adapter = adapter;
  }

  /**
   * Extract text content from a post as HTML
   * Returns raw HTML directly from the DOM
   */
  extractText(post: HTMLElement): string {
    const textElement = this.adapter.getTextElement(post);
    if (!textElement) {
      throw new Error('No text element found in post');
    }

    // All platforms: Return raw HTML directly
    return textElement.innerHTML.trim();
  }

  /**
   * Replace text in a post
   * Accepts HTML and inserts it directly
   */
  replaceText(post: HTMLElement, newText: string): void {
    const textElement = this.adapter.getTextElement(post);
    if (!textElement) {
      throw new Error('No text element found in post');
    }

    const dataset = textElement.dataset as { originalHtml?: string; originalStyles?: string };

    // Store original HTML if not already stored
    if (!dataset.originalHtml) {
      dataset.originalHtml = textElement.innerHTML;
      dataset.originalStyles = textElement.getAttribute('style') || '';
    }

    // All platforms: LLM generates HTML, insert it directly
    textElement.innerHTML = newText;

    // Mark as rewritten
    (post.dataset as { rewritten?: string }).rewritten = 'true';
  }

  /**
   * Restore original HTML in a post
   */
  restoreOriginal(post: HTMLElement): void {
    const textElement = this.adapter.getTextElement(post);
    if (!textElement) return;

    const dataset = textElement.dataset as { originalHtml?: string };
    if (!dataset.originalHtml) return;

    textElement.innerHTML = dataset.originalHtml;
    delete (post.dataset as { rewritten?: string }).rewritten;
  }

  /**
   * Check if post has been rewritten
   */
  isRewritten(post: HTMLElement): boolean {
    return (post.dataset as { rewritten?: string }).rewritten === 'true';
  }
}
