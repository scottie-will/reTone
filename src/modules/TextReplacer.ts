import type { BaseAdapter } from '@/adapters/BaseAdapter';
import TurndownService from 'turndown';
import { marked } from 'marked';

/**
 * Text Replacer - Handles text extraction and replacement
 * Preserves HTML structure using Markdown conversion
 */
export class TextReplacer {
  private adapter: BaseAdapter;
  private turndownService: TurndownService;

  constructor(adapter: BaseAdapter) {
    this.adapter = adapter;
    
    // Initialize markdown converter
    this.turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
      strongDelimiter: '**'
    });
  }

  /**
   * Extract text content from a post as markdown
   * Preserves links, formatting, and structure
   */
  extractText(post: HTMLElement): string {
    const textElement = this.adapter.getTextElement(post);
    if (!textElement) {
      throw new Error('No text element found in post');
    }
    
    // Convert HTML to Markdown to preserve structure and links
    const markdown = this.turndownService.turndown(textElement.innerHTML);
    return markdown.trim();
  }

  /**
   * Replace text in a post
   * Accepts markdown and converts back to HTML
   */
  replaceText(post: HTMLElement, newText: string): void {
    const textElement = this.adapter.getTextElement(post);
    if (!textElement) {
      throw new Error('No text element found in post');
    }

    const dataset = textElement.dataset as { originalHtml?: string; originalStyles?: string };

    // Store original HTML and computed styles if not already stored
    if (!dataset.originalHtml) {
      dataset.originalHtml = textElement.innerHTML;
      // Store inline styles
      dataset.originalStyles = textElement.getAttribute('style') || '';
    }

    // Convert markdown back to HTML
    let html = marked.parse(newText, { async: false }) as string;

    // Platform-specific handling
    const siteName = this.adapter.getSiteName();

    if (siteName === 'linkedin') {
      // LinkedIn: Use spans instead of p tags to match LinkedIn's inline structure
      html = html
        .replace(/<p>/g, '<span>')
        .replace(/<\/p>/g, '</span><br><br>')
        .replace(/(<br><br>)+$/g, ''); // Remove trailing breaks

      // Wrap content in a span that inherits all parent styles
      // This ensures font-family, font-size, etc. are preserved from LinkedIn's span[dir="ltr"]
      html = `<span style="all: inherit; display: inline;">${html}</span>`;
    }
    // Reddit and other platforms: Use the HTML as-is, they handle it perfectly

    // Replace HTML content
    textElement.innerHTML = html;

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

  /**
   * Get original text if available
   */
  getOriginalText(post: HTMLElement): string | null {
    const textElement = this.adapter.getTextElement(post);
    if (!textElement) return null;
    
    const dataset = textElement.dataset as { originalHtml?: string };
    if (!dataset.originalHtml) return null;
    
    return this.turndownService.turndown(dataset.originalHtml);
  }
}

